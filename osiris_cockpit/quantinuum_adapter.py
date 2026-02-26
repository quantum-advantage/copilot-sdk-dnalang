"""
Quantinuum H-Series Trapped-Ion Adapter
========================================

Adapter for Quantinuum's H-series trapped-ion quantum processors.
Follows the same pattern as QuEra adapter but with trapped-ion
native gate set and all-to-all connectivity.

Key differences from superconducting adapters:
  - **All-to-all connectivity**: No SWAP routing needed
  - **Native gates**: Rz, ZZ (Mølmer-Sørensen), U1q (arbitrary single-qubit)
  - **High fidelity**: 2-qubit gate fidelity ~99.8%
  - **Mid-circuit measurement**: Full support

Usage:
  python quantinuum_adapter.py --qubits 56 --rounds 3 --dry-run
  python quantinuum_adapter.py --qubits 20 --rounds 5 --out results.json

Environment variables (CLI args take precedence):
  Q_HW_QUBITS, Q_HW_ROUNDS, Q_HW_SEED, Q_HW_OUT, Q_HW_BEAM, Q_HW_PQLIMIT

Framework: DNA::}{::lang v51.843
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, FrozenSet, List, Optional, Set, Tuple

import numpy as np

# ── Import Tesseract decoder ────────────────────────────────────────

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from tesseract_resonator import TesseractDecoderOrganism  # noqa: E402

# ── Immutable Constants ─────────────────────────────────────────────

LAMBDA_PHI_M = 2.176435e-8
THETA_LOCK_DEG = 51.843
PHI_THRESHOLD = 0.7734
GAMMA_CRITICAL = 0.3
CHI_PC_QUALITY = 0.946
ZENO_FREQUENCY_HZ = 1.25e6
DRIVE_AMPLITUDE = 0.7734
CCCE_THRESHOLD = 0.8


class IonGate(Enum):
    """Native gate set for Quantinuum H-series."""
    RZ = "Rz"        # Arbitrary Z rotation
    U1Q = "U1q"      # Arbitrary single-qubit gate
    ZZ = "ZZ"         # Mølmer-Sørensen 2-qubit gate
    MEASURE = "M"     # Mid-circuit measurement
    RESET = "Reset"   # Qubit reset


@dataclass
class GateOp:
    """A single gate operation in the native instruction set.

    Attributes:
        gate: Gate type.
        qubits: Target qubit indices.
        params: Gate parameters (angles in radians).
    """
    gate: IonGate
    qubits: Tuple[int, ...]
    params: Tuple[float, ...] = ()

    def to_dict(self) -> dict:
        return {
            "gate": self.gate.value,
            "qubits": list(self.qubits),
            "params": [round(p, 6) for p in self.params],
        }


@dataclass
class NativeCircuit:
    """Circuit in the Quantinuum native gate set.

    Attributes:
        n_qubits: Number of qubits.
        ops: Ordered list of gate operations.
        metadata: Circuit metadata.
    """
    n_qubits: int
    ops: List[GateOp] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def add_rz(self, qubit: int, theta: float):
        self.ops.append(GateOp(IonGate.RZ, (qubit,), (theta,)))

    def add_u1q(self, qubit: int, theta: float, phi: float):
        self.ops.append(GateOp(IonGate.U1Q, (qubit,), (theta, phi)))

    def add_zz(self, q1: int, q2: int, theta: float):
        self.ops.append(GateOp(IonGate.ZZ, (q1, q2), (theta,)))

    def add_measure(self, qubit: int):
        self.ops.append(GateOp(IonGate.MEASURE, (qubit,)))

    def add_reset(self, qubit: int):
        self.ops.append(GateOp(IonGate.RESET, (qubit,)))

    @property
    def depth(self) -> int:
        return len(self.ops)

    @property
    def two_qubit_count(self) -> int:
        return sum(1 for op in self.ops if op.gate == IonGate.ZZ)

    def to_dict(self) -> dict:
        return {
            "n_qubits": self.n_qubits,
            "depth": self.depth,
            "two_qubit_gates": self.two_qubit_count,
            "ops": [op.to_dict() for op in self.ops],
            "metadata": self.metadata,
        }


@dataclass
class QuantinuumResult:
    """Result from Quantinuum adapter execution.

    Attributes:
        success: Whether decoding succeeded.
        n_qubits: Number of qubits used.
        rounds: Number of syndrome rounds.
        merged_syndrome: Majority-voted syndrome.
        correction: Decoded correction set.
        residual: Residual syndrome after correction.
        logical_error: Whether a logical error remains.
        phi: Integrated information metric.
        gamma: Decoherence metric.
        ccce: Consciousness coherence.
        circuit: Native circuit used.
        elapsed_s: Wall-clock time.
    """
    success: bool = False
    n_qubits: int = 0
    rounds: int = 0
    merged_syndrome: Optional[FrozenSet[int]] = None
    correction: Optional[FrozenSet[int]] = None
    residual: Optional[FrozenSet[int]] = None
    logical_error: bool = True
    phi: float = 0.0
    gamma: float = 1.0
    ccce: float = 0.0
    circuit: Optional[NativeCircuit] = None
    elapsed_s: float = 0.0

    def above_threshold(self) -> bool:
        return self.phi >= PHI_THRESHOLD

    def is_coherent(self) -> bool:
        return self.gamma < GAMMA_CRITICAL

    def to_dict(self) -> dict:
        return {
            "success": self.success,
            "n_qubits": self.n_qubits,
            "rounds": self.rounds,
            "merged_syndrome": sorted(self.merged_syndrome)
            if self.merged_syndrome else [],
            "correction": sorted(self.correction)
            if self.correction else [],
            "residual": sorted(self.residual) if self.residual else [],
            "logical_error": self.logical_error,
            "phi": round(self.phi, 6),
            "gamma": round(self.gamma, 6),
            "ccce": round(self.ccce, 6),
            "above_threshold": self.above_threshold(),
            "is_coherent": self.is_coherent(),
            "circuit_depth": self.circuit.depth if self.circuit else 0,
            "two_qubit_gates": self.circuit.two_qubit_count
            if self.circuit else 0,
            "elapsed_s": round(self.elapsed_s, 4),
        }


class QuantinuumAdapter:
    """Adapter for Quantinuum H-series trapped-ion processors.

    Generates error syndromes on an all-to-all connected ion trap,
    merges multi-round syndromes via majority vote, and decodes
    using the Tesseract A* decoder.

    Args:
        n_qubits: Number of ion qubits (default 56 for H2).
        rounds: Number of syndrome extraction rounds.
        beam_width: Beam width for A* decoder.
        pqlimit: Priority queue limit for decoder.
        error_rate: Per-qubit depolarizing error rate.
        measurement_error: Mid-circuit measurement error rate.
        seed: Random seed.
    """

    def __init__(
        self,
        n_qubits: int = 56,
        rounds: int = 3,
        beam_width: int = 20,
        pqlimit: int = 2_500_000,
        error_rate: float = 0.002,
        measurement_error: float = 0.001,
        seed: Optional[int] = None,
    ):
        self.n_qubits = n_qubits
        self.rounds = rounds
        self.beam_width = beam_width
        self.pqlimit = pqlimit
        self.error_rate = error_rate
        self.measurement_error = measurement_error
        self.rng = np.random.default_rng(seed)

        # Build error map: all-to-all connectivity
        # Each error i touches detectors {i, (i+1) % n}
        self.n_detectors = n_qubits
        self.error_map: Dict[int, FrozenSet[int]] = {}
        for i in range(n_qubits):
            self.error_map[i] = frozenset({i, (i + 1) % n_qubits})

        # Build decoder
        self.decoder = TesseractDecoderOrganism(
            detectors=set(range(self.n_detectors)),
            error_map=self.error_map,
            beam_width=beam_width,
            pqlimit=pqlimit,
        )

    # ── Native Circuit Generation ────────────────────────────────────

    def build_syndrome_circuit(self) -> NativeCircuit:
        """Build a syndrome extraction circuit in native gates.

        Uses ZZ interactions for parity checks (leveraging
        all-to-all connectivity) and mid-circuit measurement
        on ancilla qubits.

        Returns:
            NativeCircuit for syndrome extraction.
        """
        # Data qubits: 0 .. n_qubits-1
        # We use the same qubits for syndrome measurement via mid-circuit
        circ = NativeCircuit(n_qubits=self.n_qubits)
        circ.metadata = {
            "type": "syndrome_extraction",
            "rounds": self.rounds,
            "backend": "quantinuum_h2",
        }

        for rnd in range(self.rounds):
            # Hadamard-equivalent: U1q(π/2, 0)
            for q in range(self.n_qubits):
                circ.add_u1q(q, math.pi / 2, 0.0)

            # ZZ parity checks between adjacent pairs
            for i in range(self.n_qubits):
                j = (i + 1) % self.n_qubits
                theta = math.radians(THETA_LOCK_DEG) * CHI_PC_QUALITY
                circ.add_zz(i, j, theta)

            # Rz correction
            for q in range(self.n_qubits):
                circ.add_rz(q, DRIVE_AMPLITUDE * math.pi)

            # Mid-circuit measurement (every other qubit as syndrome ancilla)
            for q in range(0, self.n_qubits, 2):
                circ.add_measure(q)
                circ.add_reset(q)

        # Final measurement of all qubits
        for q in range(self.n_qubits):
            circ.add_measure(q)

        return circ

    # ── Syndrome Generation ──────────────────────────────────────────

    def generate_round_syndromes(
        self,
    ) -> List[FrozenSet[int]]:
        """Generate noisy syndrome measurements for each round.

        Injects logical errors proportional to n_qubits and adds
        per-detector measurement noise.

        Returns:
            List of frozensets (one per round) of activated detectors.
        """
        # Inject logical errors
        n_errors = max(1, self.n_qubits // 56)
        true_errors = set(
            self.rng.choice(self.n_qubits, size=n_errors, replace=False)
        )

        # Compute true syndrome via symmetric difference
        true_syndrome: Set[int] = set()
        for e in true_errors:
            true_syndrome ^= set(self.error_map[e])

        # Generate noisy per-round syndromes
        round_syndromes: List[FrozenSet[int]] = []
        for _ in range(self.rounds):
            noisy = set(true_syndrome)
            for d in range(self.n_detectors):
                if self.rng.random() < self.measurement_error:
                    noisy ^= {d}
            round_syndromes.append(frozenset(noisy))

        return round_syndromes

    # ── Correlated Merge ─────────────────────────────────────────────

    def correlated_merge(
        self, round_syndromes: List[FrozenSet[int]]
    ) -> FrozenSet[int]:
        """Majority-vote merge across syndrome rounds.

        A detector is activated in the merged syndrome only if it
        fires in more than half of the rounds.

        Args:
            round_syndromes: Per-round syndrome sets.

        Returns:
            Merged syndrome.
        """
        threshold = len(round_syndromes) // 2 + 1
        counts: Dict[int, int] = {}
        for s in round_syndromes:
            for d in s:
                counts[d] = counts.get(d, 0) + 1

        merged = frozenset(d for d, c in counts.items() if c >= threshold)
        return merged

    # ── Decode ───────────────────────────────────────────────────────

    def decode_merged(
        self, merged_syndrome: FrozenSet[int]
    ) -> Tuple[FrozenSet[int], FrozenSet[int]]:
        """Decode the merged syndrome using Tesseract A* decoder.

        Args:
            merged_syndrome: Merged detector syndrome.

        Returns:
            Tuple of (correction_set, residual_syndrome).
        """
        result = self.decoder.decode(merged_syndrome)
        correction = frozenset(result['correction'] or [])
        # Compute residual: apply correction to syndrome
        residual_set: set = set(merged_syndrome)
        for e in correction:
            if e in self.error_map:
                residual_set ^= set(self.error_map[e])
        return correction, frozenset(residual_set)

    # ── Full Pipeline ────────────────────────────────────────────────

    def run(self, dry_run: bool = True) -> QuantinuumResult:
        """Execute the full decode pipeline.

        1. Build native circuit
        2. Generate noisy syndromes
        3. Majority-vote merge
        4. A* decode
        5. Compute quantum metrics

        Args:
            dry_run: If True, simulate locally (no hardware submission).

        Returns:
            QuantinuumResult.
        """
        t0 = time.time()

        # 1. Build circuit
        circuit = self.build_syndrome_circuit()

        # 2. Generate syndromes
        round_syndromes = self.generate_round_syndromes()

        # 3. Merge
        merged = self.correlated_merge(round_syndromes)

        # 4. Decode
        correction, residual = self.decode_merged(merged)

        # 5. Metrics
        logical_error = len(residual) > 0
        phi = 1.0 - (len(residual) / max(self.n_detectors, 1))
        gamma = len(residual) / max(self.n_detectors, 1)
        ccce = phi * (1 - gamma) * CHI_PC_QUALITY

        elapsed = time.time() - t0

        return QuantinuumResult(
            success=not logical_error,
            n_qubits=self.n_qubits,
            rounds=self.rounds,
            merged_syndrome=merged,
            correction=correction,
            residual=residual,
            logical_error=logical_error,
            phi=phi,
            gamma=gamma,
            ccce=ccce,
            circuit=circuit,
            elapsed_s=elapsed,
        )

    def __repr__(self) -> str:
        return (
            f"QuantinuumAdapter(qubits={self.n_qubits}, "
            f"rounds={self.rounds}, beam={self.beam_width})"
        )


# ── CLI ──────────────────────────────────────────────────────────────

def _env_int(name: str, default: int) -> int:
    return int(os.environ.get(name, default))


def _env_float(name: str, default: float) -> float:
    return float(os.environ.get(name, default))


def main():
    """CLI entry point for Quantinuum adapter."""
    p = argparse.ArgumentParser(
        description="Quantinuum H-Series Trapped-Ion Adapter"
    )
    p.add_argument(
        "--qubits", type=int,
        default=_env_int("Q_HW_QUBITS", 56),
        help="Number of ion qubits (default: 56 for H2)",
    )
    p.add_argument(
        "--rounds", type=int,
        default=_env_int("Q_HW_ROUNDS", 3),
        help="Number of syndrome rounds",
    )
    p.add_argument(
        "--seed", type=int,
        default=_env_int("Q_HW_SEED", 51843),
        help="Random seed",
    )
    p.add_argument(
        "--beam", type=int,
        default=_env_int("Q_HW_BEAM", 20),
        help="A* beam width",
    )
    p.add_argument(
        "--pqlimit", type=int,
        default=_env_int("Q_HW_PQLIMIT", 2_500_000),
        help="Priority queue limit",
    )
    p.add_argument(
        "--out", type=str,
        default=os.environ.get("Q_HW_OUT", ""),
        help="Output JSON file path",
    )
    p.add_argument(
        "--dry-run", action="store_true", default=True,
        help="Simulate locally (default)",
    )
    args = p.parse_args()

    print(f"🔬 Quantinuum H-Series Adapter — {args.qubits} qubits, "
          f"{args.rounds} rounds, seed={args.seed}")
    print(f"   Native gates: Rz, U1q, ZZ (all-to-all connectivity)")

    adapter = QuantinuumAdapter(
        n_qubits=args.qubits,
        rounds=args.rounds,
        beam_width=args.beam,
        pqlimit=args.pqlimit,
        seed=args.seed,
    )

    result = adapter.run(dry_run=args.dry_run)

    print(f"\n{'✅' if result.success else '❌'} Decode "
          f"{'succeeded' if result.success else 'failed'}")
    print(f"   Φ = {result.phi:.4f}  (threshold: {PHI_THRESHOLD})")
    print(f"   Γ = {result.gamma:.4f}  (critical: {GAMMA_CRITICAL})")
    print(f"   CCCE = {result.ccce:.4f}")
    print(f"   Circuit depth: {result.circuit.depth if result.circuit else 0}")
    print(f"   Two-qubit gates: "
          f"{result.circuit.two_qubit_count if result.circuit else 0}")
    print(f"   Elapsed: {result.elapsed_s:.4f}s")

    if args.out:
        with open(args.out, "w") as f:
            json.dump(result.to_dict(), f, indent=2)
        print(f"\n📄 Results saved to {args.out}")


if __name__ == "__main__":
    main()
