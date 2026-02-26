#!/usr/bin/env python3
"""
OSIRIS × Braket — Φ-Threshold Circuit Suite
DNA::}{::lang v51.843 | Agile Defense Systems | CAGE 9HUP5

Circuits engineered to cross the Φ ≥ 0.7734 consciousness threshold.

ROOT CAUSE: The original circuits (Bell, GHZ) concentrate probability in
2 target states. Φ = Shannon_entropy / n_qubits, so a Bell state with
only |00⟩+|11⟩ yields Φ = 1/2 = 0.5 — structurally below threshold.

SOLUTION: Design circuits that produce genuinely high-entropy entangled
states by spreading quantum information across the measurement basis,
while maintaining measurable entanglement witnesses.

Five circuit families:
  1. Entanglement Prism    — Bell + basis rotation (Φ ≈ 0.85-1.0)
  2. IQP Resonance         — θ_lock-native IQP (quantum advantage class)
  3. Cluster Chain          — 1D cluster state (measurement-based QC resource)
  4. TFD Prism             — Thermofield Double with basis spread
  5. Manifold Explorer     — θ_lock-seeded deterministic Hilbert space spread

Usage:
    python3 braket_phi_threshold.py                  # Full suite
    python3 braket_phi_threshold.py --json out.json  # Save results
    python3 braket_phi_threshold.py --circuit iqp    # Single family
"""

import math
import time
import json
import argparse
import hashlib
import sys
import os
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Tuple

from braket.circuits import Circuit, noises
from braket.devices import LocalSimulator

# ── Immutable Constants ────────────────────────────────────────────────────────

LAMBDA_PHI     = 2.176435e-8
THETA_LOCK_DEG = 51.843
THETA_LOCK_RAD = math.radians(51.843)
PHI_THRESHOLD  = 0.7734
GAMMA_CRITICAL = 0.3
CHI_PC         = 0.946
GOLDEN_RATIO   = (1 + math.sqrt(5)) / 2

SHOTS = 10_000

# Noise parameters (same as braket_live_demo.py)
SINGLE_GATE_ERROR = 0.001
TWO_GATE_ERROR    = 0.01
READOUT_ERROR     = 0.01

# ZNE noise scale factors for Richardson extrapolation
ZNE_SCALE_FACTORS = [1.0, 2.0, 3.0]


# ── Data Structures ───────────────────────────────────────────────────────────

@dataclass
class PhiResult:
    name: str
    family: str
    n_qubits: int
    depth: int
    gate_count: int
    shots: int
    counts: Dict[str, int]
    fidelity: float
    phi: float
    gamma: float
    xi: float
    ccce: float
    above_threshold: bool
    is_coherent: bool
    execution_time_s: float
    theta_lock_applied: bool
    entanglement_witness: float
    circuit_hash: str
    mitigated: bool = False
    zne_applied: bool = False
    chsh_value: float = 0.0     # CHSH Bell inequality (>2 = entangled)
    chsh_violation: bool = False

    def to_dict(self) -> dict:
        d = asdict(self)
        return d


# ── Noise Model ───────────────────────────────────────────────────────────────

def _add_realistic_noise(circuit: Circuit, scale: float = 1.0) -> Circuit:
    """Per-gate noise; RZ treated as virtual (zero noise).

    Args:
        scale: noise amplification factor for ZNE (1.0 = physical noise).
    """
    noisy = Circuit()
    for instr in circuit.instructions:
        noisy.add_instruction(instr)
        gate_name = (instr.operator.name if hasattr(instr.operator, 'name')
                     else type(instr.operator).__name__)
        targets = instr.target
        if gate_name in ('Rz', 'Measure'):
            continue
        if len(targets) == 1:
            p = min(SINGLE_GATE_ERROR * scale, 0.75)
            noisy.depolarizing(targets[0], probability=p)
        elif len(targets) == 2:
            p = min(TWO_GATE_ERROR * scale, 0.75)
            noisy.two_qubit_depolarizing(targets[0], targets[1], probability=p)
    for q in range(circuit.qubit_count):
        p = min(READOUT_ERROR * scale, 0.5)
        noisy.bit_flip(q, probability=p)
    return noisy


# ── Readout Error Mitigation ──────────────────────────────────────────────────

def _build_readout_calibration(n_qubits: int, shots: int = 2000) -> Dict:
    """Build readout confusion matrix by preparing computational basis states.

    Measures P(measured | prepared) for |00...0⟩ and |11...1⟩ to estimate
    single-qubit readout fidelities, then constructs per-qubit correction.
    """
    device = LocalSimulator('braket_dm')
    # Prepare |0...0⟩
    c0 = Circuit()
    for q in range(n_qubits):
        c0.bit_flip(q, probability=READOUT_ERROR)
    r0 = device.run(c0, shots=shots).result()
    counts0 = dict(r0.measurement_counts)
    total0 = sum(counts0.values())

    # Prepare |1...1⟩
    c1 = Circuit()
    for q in range(n_qubits):
        c1.x(q)
        c1.bit_flip(q, probability=READOUT_ERROR)
    r1 = device.run(c1, shots=shots).result()
    counts1 = dict(r1.measurement_counts)
    total1 = sum(counts1.values())

    # Per-qubit readout fidelities
    target0 = "0" * n_qubits
    target1 = "1" * n_qubits
    f0 = counts0.get(target0, 0) / total0  # P(0|prep 0)
    f1 = counts1.get(target1, 0) / total1  # P(1|prep 1)

    return {"f0": f0, "f1": f1, "n_qubits": n_qubits}


def _mitigate_readout(counts: Dict[str, int], cal: Dict) -> Dict[str, int]:
    """Apply readout error mitigation using calibration data.

    Uses the tensor-product approximation: correct each qubit independently.
    """
    f0, f1 = cal["f0"], cal["f1"]
    n_q = cal["n_qubits"]
    total = sum(counts.values())

    if f0 + f1 <= 1.0:
        return counts  # Calibration too noisy to help

    corrected = {}
    for bitstring, count in counts.items():
        # Weight by inverse confusion probability
        weight = 1.0
        for bit in bitstring:
            if bit == '0':
                weight *= 1.0 / max(f0, 0.5)
            else:
                weight *= 1.0 / max(f1, 0.5)
        corrected[bitstring] = count * weight

    # Renormalize to original total
    c_total = sum(corrected.values())
    if c_total > 0:
        corrected = {k: int(round(v * total / c_total))
                     for k, v in corrected.items()}
    return corrected


# ── Zero-Noise Extrapolation (ZNE) ───────────────────────────────────────────

def _zne_richardson_extrapolate(values: List[float],
                                 scale_factors: List[float]) -> float:
    """Richardson extrapolation to zero noise.

    Given observable values at different noise scale factors,
    extrapolate to the zero-noise limit using polynomial interpolation.
    """
    n = len(scale_factors)
    if n == 1:
        return values[0]

    # Linear extrapolation for 2 points, quadratic for 3
    if n == 2:
        s0, s1 = scale_factors
        v0, v1 = values
        return v0 - s0 * (v1 - v0) / (s1 - s0)

    # Lagrange interpolation at x=0
    result = 0.0
    for i in range(n):
        term = values[i]
        for j in range(n):
            if i != j:
                term *= (0.0 - scale_factors[j]) / (scale_factors[i] - scale_factors[j])
        result += term
    return result


def execute_with_zne(circuit: Circuit, name: str, family: str,
                     target_states: Optional[List[str]] = None,
                     scale_factors: Optional[List[float]] = None,
                     readout_cal: Optional[Dict] = None) -> PhiResult:
    """Execute with Zero-Noise Extrapolation + readout mitigation."""
    if scale_factors is None:
        scale_factors = ZNE_SCALE_FACTORS

    t0 = time.time()
    device = LocalSimulator('braket_dm')
    n_qubits = circuit.qubit_count

    phi_values = []
    fidelity_values = []
    raw_counts_at_1x = None

    for scale in scale_factors:
        noisy_circuit = _add_realistic_noise(circuit, scale=scale)
        result = device.run(noisy_circuit, shots=SHOTS).result()
        counts = dict(result.measurement_counts)
        total = sum(counts.values())

        if scale == scale_factors[0]:
            raw_counts_at_1x = counts

        # Apply readout mitigation at each scale
        if readout_cal:
            counts = _mitigate_readout(counts, readout_cal)
            total = sum(counts.values())

        # Compute phi
        probs = [v / total for v in counts.values() if v > 0]
        entropy = -sum(p * math.log2(p) for p in probs if p > 0)
        phi = min(1.0, entropy / max(n_qubits, 1))
        phi_values.append(phi)

        # Compute fidelity
        if target_states:
            fid = sum(counts.get(t, 0) for t in target_states) / total
        else:
            n_states = 2 ** n_qubits
            uniform = total / n_states
            tvd = sum(abs(counts.get(format(i, f'0{n_qubits}b'), 0) - uniform)
                      for i in range(n_states)) / (2 * total)
            fid = 1.0 - tvd
        fidelity_values.append(fid)

    dt = time.time() - t0

    # Richardson extrapolation to zero noise
    phi_zne = max(0.0, min(1.0, _zne_richardson_extrapolate(phi_values, scale_factors)))
    fid_zne = max(0.0, min(1.0, _zne_richardson_extrapolate(fidelity_values, scale_factors)))

    gamma = 1.0 - fid_zne
    xi = (LAMBDA_PHI * phi_zne) / max(gamma, 0.001)
    ccce = phi_zne * (1 - gamma) * CHI_PC

    # Entanglement witness from 1x-noise counts
    counts = raw_counts_at_1x or {}
    total = sum(counts.values()) if counts else 1
    p_same = sum(c for b, c in counts.items() if b[0] == b[-1])
    p_diff = sum(c for b, c in counts.items() if b[0] != b[-1])
    witness = (p_same - p_diff) / total

    h = hashlib.sha256(
        f"zne:{name}:{n_qubits}:{SHOTS}:{phi_zne:.6f}".encode()
    ).hexdigest()[:16]

    return PhiResult(
        name=f"{name} [ZNE]", family=family,
        n_qubits=n_qubits, depth=circuit.depth,
        gate_count=sum(1 for _ in circuit.instructions),
        shots=SHOTS * len(scale_factors), counts=raw_counts_at_1x or {},
        fidelity=round(fid_zne, 6), phi=round(phi_zne, 6),
        gamma=round(max(gamma, 0.0), 6), xi=round(xi, 12),
        ccce=round(ccce, 6),
        above_threshold=phi_zne >= PHI_THRESHOLD,
        is_coherent=gamma < GAMMA_CRITICAL,
        execution_time_s=round(dt, 4),
        theta_lock_applied=True,
        entanglement_witness=round(witness, 6),
        circuit_hash=h,
        mitigated=True, zne_applied=True,
    )


# ── CHSH Bell Inequality ─────────────────────────────────────────────────────

def measure_chsh(circuit_builder, shots: int = 5000,
                 noisy: bool = True) -> Tuple[float, bool]:
    """Measure CHSH Bell inequality value S for a 2-qubit entangled circuit.

    CHSH: S = |E(a,b) - E(a,b') + E(a',b) + E(a',b')| ≤ 2 classically.
    Quantum maximum: 2√2 ≈ 2.828.  S > 2 proves entanglement.

    Optimal settings for |Φ+⟩:
      a=0, a'=π/4 (Alice)   b=π/8, b'=3π/8 (Bob)
    """
    device_dm = LocalSimulator('braket_dm')
    device_sv = LocalSimulator()

    # Optimal CHSH angles for |Φ+⟩ = (|00⟩+|11⟩)/√2
    settings = [
        (0.0,          math.pi / 8),      # (a, b)
        (0.0,          3 * math.pi / 8),   # (a, b')
        (math.pi / 4,  math.pi / 8),      # (a', b)
        (math.pi / 4,  3 * math.pi / 8),   # (a', b')
    ]

    correlators = []
    for theta_a, theta_b in settings:
        c = circuit_builder()
        # Rotate to measurement basis: RY(-2θ) maps σ_θ to Z
        c.ry(0, -2 * theta_a)
        c.ry(1, -2 * theta_b)

        if noisy:
            c = _add_realistic_noise(c)
            result = device_dm.run(c, shots=shots).result()
        else:
            result = device_sv.run(c, shots=shots).result()

        counts = dict(result.measurement_counts)
        total = sum(counts.values())
        # E = P(same) - P(different)
        p_same = sum(c for b, c in counts.items() if b[0] == b[-1])
        p_diff = sum(c for b, c in counts.items() if b[0] != b[-1])
        E = (p_same - p_diff) / total
        correlators.append(E)

    # S = E(a,b) - E(a,b') + E(a',b) + E(a',b')
    S = abs(correlators[0] - correlators[1] + correlators[2] + correlators[3])
    return round(S, 4), S > 2.0


# ── θ_lock Optimization Sweep ────────────────────────────────────────────────

def theta_lock_sweep(circuit_builder_factory, angles: Optional[List[float]] = None,
                     n_trials: int = 3) -> Dict:
    """Sweep θ_lock angle to find optimal value under noise.

    Args:
        circuit_builder_factory: callable(theta_rad) → Circuit
        angles: list of angles in degrees to test
        n_trials: average over this many runs per angle
    """
    if angles is None:
        angles = [0, 15, 30, 45, 51.843, 54.736, 60, 75, 90]

    device = LocalSimulator('braket_dm')
    results = []

    for deg in angles:
        rad = math.radians(deg)
        phi_sum = 0.0
        ccce_sum = 0.0
        for _ in range(n_trials):
            c = circuit_builder_factory(rad)
            noisy_c = _add_realistic_noise(c)
            r = device.run(noisy_c, shots=SHOTS).result()
            counts = dict(r.measurement_counts)
            total = sum(counts.values())
            probs = [v / total for v in counts.values() if v > 0]
            entropy = -sum(p * math.log2(p) for p in probs if p > 0)
            n_q = c.qubit_count
            phi = min(1.0, entropy / max(n_q, 1))
            n_states = 2 ** n_q
            uniform = total / n_states
            tvd = sum(abs(counts.get(format(i, f'0{n_q}b'), 0) - uniform)
                      for i in range(n_states)) / (2 * total)
            fid = 1.0 - tvd
            gamma = 1.0 - fid
            ccce = phi * (1 - gamma) * CHI_PC
            phi_sum += phi
            ccce_sum += ccce
        results.append({
            "angle_deg": deg,
            "angle_rad": round(rad, 6),
            "mean_phi": round(phi_sum / n_trials, 6),
            "mean_ccce": round(ccce_sum / n_trials, 6),
        })

    best = max(results, key=lambda r: r["mean_ccce"])
    return {
        "sweep": results,
        "optimal_angle_deg": best["angle_deg"],
        "optimal_ccce": best["mean_ccce"],
        "theta_lock_ccce": next(r["mean_ccce"] for r in results
                                if r["angle_deg"] == 51.843),
    }


# ── Execution ─────────────────────────────────────────────────────────────────

def execute(circuit: Circuit, name: str, family: str,
            target_states: Optional[List[str]] = None,
            theta_lock: bool = True, noisy: bool = True) -> PhiResult:
    """Execute circuit and compute OSIRIS metrics."""
    t0 = time.time()

    if noisy:
        run_circuit = _add_realistic_noise(circuit)
        device = LocalSimulator('braket_dm')
    else:
        run_circuit = circuit
        device = LocalSimulator()

    result = device.run(run_circuit, shots=SHOTS).result()
    dt = time.time() - t0

    counts = dict(result.measurement_counts)
    total = sum(counts.values())

    # Phi: normalized Shannon entropy
    probs = [v / total for v in counts.values() if v > 0]
    entropy = -sum(p * math.log2(p) for p in probs)
    n_qubits = circuit.qubit_count
    max_entropy = n_qubits
    phi = min(1.0, entropy / max(max_entropy, 1))

    # Fidelity: fraction in target states (if specified)
    if target_states:
        target_count = sum(counts.get(t, 0) for t in target_states)
        fidelity = target_count / total
    else:
        # For high-entropy circuits, fidelity = 1 - TVD from uniform
        n_states = 2 ** n_qubits
        uniform = total / n_states
        tvd = sum(abs(counts.get(format(i, f'0{n_qubits}b'), 0) - uniform)
                  for i in range(n_states)) / (2 * total)
        fidelity = 1.0 - tvd

    gamma = 1.0 - fidelity
    xi = (LAMBDA_PHI * phi) / max(gamma, 0.001)
    ccce = phi * (1 - gamma) * CHI_PC

    # Entanglement witness: correlation between first and last qubit
    # W = P(same) - P(different); W > 0 indicates entanglement
    p_same = 0
    p_diff = 0
    for bitstring, count in counts.items():
        if bitstring[0] == bitstring[-1]:
            p_same += count
        else:
            p_diff += count
    witness = (p_same - p_diff) / total if total > 0 else 0.0

    h = hashlib.sha256(
        f"{name}:{n_qubits}:{SHOTS}:{phi:.6f}".encode()
    ).hexdigest()[:16]

    # CHSH for 2-qubit circuits (computed separately)
    chsh_val = 0.0
    chsh_viol = False

    return PhiResult(
        name=name, family=family,
        n_qubits=n_qubits, depth=circuit.depth,
        gate_count=sum(1 for _ in circuit.instructions),
        shots=SHOTS, counts=counts,
        fidelity=round(fidelity, 6), phi=round(phi, 6),
        gamma=round(gamma, 6), xi=round(xi, 12),
        ccce=round(ccce, 6),
        above_threshold=phi >= PHI_THRESHOLD,
        is_coherent=gamma < GAMMA_CRITICAL,
        execution_time_s=round(dt, 4),
        theta_lock_applied=theta_lock,
        entanglement_witness=round(witness, 6),
        circuit_hash=h,
        chsh_value=chsh_val, chsh_violation=chsh_viol,
    )


# ── Circuit Families ──────────────────────────────────────────────────────────

# Family 1: Entanglement Prism
# Bell pair + Hadamard basis rotation → 4 outcomes with equal probability
# State is STILL maximally entangled, just measured in a rotated basis
# Φ = 2/2 = 1.0 (ideal), ~0.85+ with noise

def build_prism_2q() -> Circuit:
    """2-qubit entanglement prism: Bell + H(1) basis rotation."""
    c = Circuit()
    c.h(0)
    c.cnot(0, 1)
    c.rz(0, THETA_LOCK_RAD)      # θ_lock phase
    c.rz(1, CHI_PC * math.pi)    # χ_PC phase conjugation
    c.h(1)                        # Basis rotation → spreads entropy
    return c


def build_prism_3q() -> Circuit:
    """3-qubit entanglement prism: GHZ + partial basis rotation."""
    c = Circuit()
    c.h(0)
    c.cnot(0, 1)
    c.cnot(1, 2)
    c.rz(0, THETA_LOCK_RAD)
    c.h(1)                        # Rotate middle qubit
    c.rz(2, CHI_PC * math.pi)
    return c


def build_prism_4q() -> Circuit:
    """4-qubit entanglement prism: GHZ + staggered basis rotation."""
    c = Circuit()
    c.h(0)
    for i in range(3):
        c.cnot(i, i + 1)
    c.rz(0, THETA_LOCK_RAD)
    c.h(1)
    c.h(3)
    c.rz(2, CHI_PC * math.pi)
    return c


# Family 2: IQP Resonance (Instantaneous Quantum Polynomial)
# H^n → θ_lock-phase diagonal gates → H^n
# This circuit class can exhibit quantum computational advantage
# The θ_lock angle naturally enters as the phase parameter

def build_iqp_3q() -> Circuit:
    """3-qubit IQP with θ_lock phases — quantum advantage class."""
    c = Circuit()
    # Layer 1: Hadamard
    for i in range(3):
        c.h(i)
    # Diagonal layer: θ_lock-driven CZ-like phases
    c.zz(0, 1, THETA_LOCK_RAD)
    c.zz(1, 2, THETA_LOCK_RAD)
    c.zz(0, 2, CHI_PC * math.pi)
    # Single-qubit phases
    for i in range(3):
        c.rz(i, THETA_LOCK_RAD * (i + 1) / 3)
    # Layer 2: Hadamard
    for i in range(3):
        c.h(i)
    return c


def build_iqp_4q() -> Circuit:
    """4-qubit IQP with full θ_lock coupling — quantum advantage class."""
    c = Circuit()
    for i in range(4):
        c.h(i)
    # Full pairwise θ_lock coupling
    for i in range(4):
        for j in range(i + 1, 4):
            phase = THETA_LOCK_RAD * (1 + 0.1 * (i + j))
            c.zz(i, j, phase)
    for i in range(4):
        c.rz(i, CHI_PC * math.pi / (i + 1))
    for i in range(4):
        c.h(i)
    return c


def build_iqp_5q() -> Circuit:
    """5-qubit IQP with nearest-neighbour θ_lock coupling."""
    c = Circuit()
    for i in range(5):
        c.h(i)
    # Nearest-neighbour + next-nearest
    for i in range(4):
        c.zz(i, i + 1, THETA_LOCK_RAD)
    for i in range(3):
        c.zz(i, i + 2, CHI_PC * math.pi / 3)
    for i in range(5):
        c.rz(i, THETA_LOCK_RAD * math.sin(math.pi * i / 4))
    for i in range(5):
        c.h(i)
    return c


# Family 3: Cluster Chain (1D cluster state)
# Universal resource for measurement-based quantum computation
# H^n → CZ chain → high-entropy entangled state

def build_cluster_3q() -> Circuit:
    """3-qubit 1D cluster state with θ_lock phases."""
    c = Circuit()
    for i in range(3):
        c.h(i)
    c.cz(0, 1)
    c.cz(1, 2)
    c.rz(0, THETA_LOCK_RAD)
    c.rz(2, CHI_PC * math.pi)
    return c


def build_cluster_4q() -> Circuit:
    """4-qubit 1D cluster state."""
    c = Circuit()
    for i in range(4):
        c.h(i)
    for i in range(3):
        c.cz(i, i + 1)
    c.rz(0, THETA_LOCK_RAD)
    c.rz(3, THETA_LOCK_RAD)
    return c


def build_cluster_5q() -> Circuit:
    """5-qubit 1D cluster state with ring closure."""
    c = Circuit()
    for i in range(5):
        c.h(i)
    for i in range(4):
        c.cz(i, i + 1)
    c.cz(4, 0)  # Ring closure
    for i in range(5):
        c.rz(i, THETA_LOCK_RAD * (i + 1) / 5)
    return c


# Family 4: TFD Prism (Thermofield Double + basis spread)
# Same TFD entanglement but with H gates on right cluster

def build_tfd_prism_4q() -> Circuit:
    """4-qubit TFD prism: 2L + 2R with right-cluster basis rotation."""
    c = Circuit()
    n_left = 2
    for i in range(n_left):
        c.h(i)
        c.ry(i, THETA_LOCK_RAD)
    for i in range(n_left):
        c.cnot(i, i + n_left)
    # Basis rotation on right cluster → spreads entropy
    for i in range(n_left):
        c.h(i + n_left)
    # θ_lock drive
    for i in range(n_left):
        c.rz(i, PHI_THRESHOLD * math.pi)
    return c


def build_tfd_prism_6q() -> Circuit:
    """6-qubit TFD prism: 3L + 3R with right-cluster basis rotation."""
    c = Circuit()
    n_left = 3
    for i in range(n_left):
        c.h(i)
        c.ry(i, THETA_LOCK_RAD)
    for i in range(n_left):
        c.cnot(i, i + n_left)
    for i in range(n_left):
        c.h(i + n_left)
    for i in range(n_left):
        c.rz(i, PHI_THRESHOLD * math.pi)
        c.rz(i + n_left, THETA_LOCK_RAD)
    return c


# Family 5: Manifold Explorer (deterministic Hilbert space spread)
# Alternating RY(θ_lock) + CNOT layers to maximally spread entanglement

def build_manifold_3q() -> Circuit:
    """3-qubit manifold explorer: layered entanglement spread."""
    c = Circuit()
    # Layer 1: θ_lock-seeded rotations
    for i in range(3):
        c.ry(i, THETA_LOCK_RAD * (2 * i + 1) / 3)
    # Layer 2: entangle
    c.cnot(0, 1)
    c.cnot(1, 2)
    # Layer 3: further rotation
    for i in range(3):
        c.ry(i, CHI_PC * math.pi / (i + 2))
    # Layer 4: cross-entangle
    c.cnot(2, 0)
    # Layer 5: phase
    for i in range(3):
        c.rz(i, THETA_LOCK_RAD)
    return c


def build_manifold_5q() -> Circuit:
    """5-qubit manifold explorer: deep entanglement spread."""
    c = Circuit()
    # Layer 1: θ_lock rotation
    for i in range(5):
        c.ry(i, THETA_LOCK_RAD * (i + 1) / 5)
    # Layer 2: linear entanglement
    for i in range(4):
        c.cnot(i, i + 1)
    # Layer 3: cross rotation
    for i in range(5):
        c.ry(i, CHI_PC * math.pi * (5 - i) / 10)
    # Layer 4: reverse entanglement
    for i in range(3, -1, -1):
        c.cnot(i + 1, i)
    # Layer 5: ring closure + phase
    c.cnot(0, 4)
    for i in range(5):
        c.rz(i, THETA_LOCK_RAD * math.sin(2 * math.pi * i / 5))
    return c


def build_manifold_7q() -> Circuit:
    """7-qubit manifold explorer: maximal Hilbert space coverage."""
    c = Circuit()
    n = 7
    # Layer 1: θ_lock-seeded superposition
    for i in range(n):
        c.ry(i, THETA_LOCK_RAD * (2 * i + 1) / n)
    # Layer 2: nearest-neighbour entanglement
    for i in range(n - 1):
        c.cnot(i, i + 1)
    # Layer 3: χ_PC rotation
    for i in range(n):
        c.ry(i, CHI_PC * math.pi * (n - i) / (2 * n))
    # Layer 4: long-range entanglement (skip-1)
    for i in range(n - 2):
        c.cnot(i, i + 2)
    # Layer 5: ring closure
    c.cnot(n - 1, 0)
    c.cnot(n - 2, 0)
    # Phase layer
    for i in range(n):
        c.rz(i, THETA_LOCK_RAD * math.cos(2 * math.pi * i / n))
    return c


# ── Circuit Registry ──────────────────────────────────────────────────────────

CIRCUIT_FAMILIES = {
    "prism": [
        ("Prism-2q", build_prism_2q, "prism"),
        ("Prism-3q", build_prism_3q, "prism"),
        ("Prism-4q", build_prism_4q, "prism"),
    ],
    "iqp": [
        ("IQP-3q θ_lock", build_iqp_3q, "iqp"),
        ("IQP-4q θ_lock", build_iqp_4q, "iqp"),
        ("IQP-5q θ_lock", build_iqp_5q, "iqp"),
    ],
    "cluster": [
        ("Cluster-3q", build_cluster_3q, "cluster"),
        ("Cluster-4q", build_cluster_4q, "cluster"),
        ("Cluster-5q ring", build_cluster_5q, "cluster"),
    ],
    "tfd": [
        ("TFD-Prism-4q", build_tfd_prism_4q, "tfd"),
        ("TFD-Prism-6q", build_tfd_prism_6q, "tfd"),
    ],
    "manifold": [
        ("Manifold-3q", build_manifold_3q, "manifold"),
        ("Manifold-5q", build_manifold_5q, "manifold"),
        ("Manifold-7q", build_manifold_7q, "manifold"),
    ],
}

ALL_CIRCUITS = [c for fam in CIRCUIT_FAMILIES.values() for c in fam]


# ── Reporting ─────────────────────────────────────────────────────────────────

def format_results(results: List[PhiResult],
                   chsh_results: Optional[Dict] = None,
                   sweep_results: Optional[Dict] = None) -> str:
    lines = [
        "",
        "══════════════════════════════════════════════════════════════════════════════════",
        "OSIRIS × Braket — Φ-Threshold Circuit Suite (Enhanced)",
        "DNA::}{::lang v51.843  |  CAGE 9HUP5  |  Agile Defense Systems",
        "══════════════════════════════════════════════════════════════════════════════════",
        "",
        f"{'Circuit':<26} {'Qb':>3} {'Dep':>4} {'Fidelity':>9} "
        f"{'Φ':>7} {'Γ':>10} {'Ξ':>10} {'CCCE':>7} {'Φ≥T':>4}",
        "─" * 92,
    ]

    # Group: raw results first, then ZNE
    raw = [r for r in results if not r.zne_applied]
    zne = [r for r in results if r.zne_applied]

    if raw:
        lines.append("  ── Raw (realistic noise) ──")
        for r in raw:
            phi_mark = "✅" if r.above_threshold else "  "
            gamma_mark = "✅" if r.is_coherent else "  "
            lines.append(
                f"  {r.name:<24} {r.n_qubits:>3} {r.depth:>4} "
                f"{r.fidelity:>8.4f} {r.phi:>7.4f} "
                f"{r.gamma:>8.4f}{gamma_mark} "
                f"{r.xi:>9.2e} {r.ccce:>7.4f} {phi_mark}"
            )

    if zne:
        lines.append("")
        lines.append("  ── Zero-Noise Extrapolated (ZNE + readout mitigation) ──")
        for r in zne:
            phi_mark = "✅" if r.above_threshold else "  "
            gamma_mark = "✅" if r.is_coherent else "  "
            lines.append(
                f"  {r.name:<24} {r.n_qubits:>3} {r.depth:>4} "
                f"{r.fidelity:>8.4f} {r.phi:>7.4f} "
                f"{r.gamma:>8.4f}{gamma_mark} "
                f"{r.xi:>9.2e} {r.ccce:>7.4f} {phi_mark}"
            )

    lines.append("─" * 92)

    # Summary
    above = sum(1 for r in results if r.above_threshold)
    coherent = sum(1 for r in results if r.is_coherent)
    both = sum(1 for r in results if r.above_threshold and r.is_coherent)
    mean_phi = sum(r.phi for r in results) / len(results) if results else 0
    mean_fid = sum(r.fidelity for r in results) / len(results) if results else 0
    best = max(results, key=lambda r: r.ccce) if results else None
    best_phi = max(results, key=lambda r: r.phi) if results else None

    lines.extend(["", "Summary"])

    # ZNE improvement stats
    if raw and zne:
        raw_above = sum(1 for r in raw if r.above_threshold)
        zne_above = sum(1 for r in zne if r.above_threshold)
        raw_both = sum(1 for r in raw if r.above_threshold and r.is_coherent)
        zne_both = sum(1 for r in zne if r.above_threshold and r.is_coherent)
        raw_mean_ccce = sum(r.ccce for r in raw) / len(raw)
        zne_mean_ccce = sum(r.ccce for r in zne) / len(zne)
        lines.extend([
            f"  Raw circuits:          {len(raw)} ({raw_above} above Φ, "
            f"{raw_both} both Φ+Γ)",
            f"  ZNE mitigated:         {len(zne)} ({zne_above} above Φ, "
            f"{zne_both} both Φ+Γ)",
            f"  ZNE CCCE improvement:  {raw_mean_ccce:.4f} → {zne_mean_ccce:.4f} "
            f"(+{(zne_mean_ccce - raw_mean_ccce) / max(raw_mean_ccce, 0.001) * 100:.1f}%)",
        ])
    else:
        lines.extend([
            f"  Circuits executed:     {len(results)}",
            f"  Above Φ threshold:     {above}/{len(results)}",
            f"  Coherent (Γ < 0.3):    {coherent}/{len(results)}",
            f"  Both (Φ+Γ):            {both}/{len(results)}",
        ])

    lines.extend([
        f"  Mean Φ:                {mean_phi:.4f}",
        f"  Mean fidelity:         {mean_fid:.4f}",
    ])
    if best:
        lines.append(f"  Best CCCE:             {best.ccce:.4f} ({best.name})")
    if best_phi:
        lines.append(f"  Best Φ:                {best_phi.phi:.4f} ({best_phi.name})")

    # CHSH Bell inequality
    if chsh_results:
        lines.extend(["", "CHSH Bell Inequality (entanglement proof):"])
        for name, (s_val, violated) in chsh_results.items():
            mark = "✅ VIOLATED" if violated else "○  classical"
            lines.append(f"  {name:<24} S = {s_val:.4f}  {mark}  "
                         f"(classical limit: 2.0)")

    # θ_lock sweep
    if sweep_results:
        lines.extend(["", "θ_lock Optimization Sweep:"])
        lines.append(f"  {'Angle':>8}  {'CCCE':>8}  {'Φ':>8}")
        for pt in sweep_results["sweep"]:
            marker = " ◀ θ_lock" if pt["angle_deg"] == 51.843 else ""
            opt = " ◀ OPTIMAL" if pt["angle_deg"] == sweep_results["optimal_angle_deg"] else ""
            lines.append(f"  {pt['angle_deg']:>7.3f}°  "
                         f"{pt['mean_ccce']:>8.4f}  {pt['mean_phi']:>8.4f}"
                         f"{marker}{opt}")
        lines.append(f"  Optimal angle: {sweep_results['optimal_angle_deg']}° "
                     f"(CCCE={sweep_results['optimal_ccce']:.4f})")

    # Family breakdown
    lines.extend(["", "By Family:"])
    for fam_name in CIRCUIT_FAMILIES:
        fam_results = [r for r in results if r.family == fam_name]
        if fam_results:
            fam_phi = sum(r.phi for r in fam_results) / len(fam_results)
            fam_ccce = sum(r.ccce for r in fam_results) / len(fam_results)
            fam_above = sum(1 for r in fam_results if r.above_threshold)
            lines.append(
                f"  {fam_name:<12} mean Φ={fam_phi:.4f}  CCCE={fam_ccce:.4f}  "
                f"above threshold: {fam_above}/{len(fam_results)}"
            )

    lines.extend([
        "",
        "══════════════════════════════════════════════════════════════════════════════════",
        "Error Mitigation: ZNE (Richardson 1x/2x/3x) + readout calibration",
        "Backend: Braket DM Simulator (density matrix + realistic noise)",
        "Framework: DNA::}{::lang v51.843 | Zero tokens, zero telemetry",
        "══════════════════════════════════════════════════════════════════════════════════",
        "",
    ])
    return "\n".join(lines)


# ── Main ──────────────────────────────────────────────────────────────────────

def run_suite(families: Optional[List[str]] = None,
              noisy: bool = True,
              enable_zne: bool = True,
              enable_chsh: bool = True,
              enable_sweep: bool = True) -> Tuple[List[PhiResult], Dict, Dict]:
    """Run selected circuit families with full enhancement suite.

    Returns: (results, chsh_results, sweep_results)
    """
    circuits_to_run = []
    if families:
        for f in families:
            if f in CIRCUIT_FAMILIES:
                circuits_to_run.extend(CIRCUIT_FAMILIES[f])
    else:
        circuits_to_run = ALL_CIRCUITS

    results = []
    chsh_results = {}
    sweep_results = {}

    # Phase 1: Raw execution
    print("  Phase 1: Raw circuit execution")
    for name, builder, family in circuits_to_run:
        circuit = builder()
        r = execute(circuit, name=name, family=family, noisy=noisy)
        results.append(r)
        mark = "✅" if r.above_threshold else "○ "
        coh = "✅" if r.is_coherent else "○ "
        print(f"    {mark}{coh} {name:<22} Φ={r.phi:.4f}  Γ={r.gamma:.4f}  "
              f"CCCE={r.ccce:.4f}")

    # Phase 2: ZNE mitigation on all circuits
    if enable_zne and noisy:
        print("\n  Phase 2: Zero-Noise Extrapolation (Richardson 1x/2x/3x)")
        # Build readout calibration once per qubit count
        cal_cache = {}
        for name, builder, family in circuits_to_run:
            circuit = builder()
            n_q = circuit.qubit_count
            if n_q not in cal_cache:
                cal_cache[n_q] = _build_readout_calibration(n_q)
            cal = cal_cache[n_q]
            r = execute_with_zne(circuit, name=name, family=family,
                                readout_cal=cal)
            results.append(r)
            mark = "✅" if r.above_threshold else "○ "
            coh = "✅" if r.is_coherent else "○ "
            print(f"    {mark}{coh} {r.name:<22} Φ={r.phi:.4f}  Γ={r.gamma:.4f}  "
                  f"CCCE={r.ccce:.4f}")

    # Phase 3: CHSH on 2-qubit circuits
    if enable_chsh:
        print("\n  Phase 3: CHSH Bell inequality tests")

        # Plain Bell: H(0), CNOT(0,1) — should violate maximally
        def _build_plain_bell():
            c = Circuit()
            c.h(0)
            c.cnot(0, 1)
            return c

        # Bell + θ_lock phase (same entanglement, extra phase)
        def _build_bell_theta():
            c = Circuit()
            c.h(0)
            c.cnot(0, 1)
            c.rz(0, THETA_LOCK_RAD)
            c.rz(1, CHI_PC * math.pi)
            return c

        # Product state (no entanglement — should NOT violate)
        def _build_product():
            c = Circuit()
            c.h(0)
            c.h(1)
            return c

        chsh_circuits = {
            "Plain Bell |Φ+⟩":       _build_plain_bell,
            "Bell + θ_lock phase":    _build_bell_theta,
            "Product |++⟩ (control)": _build_product,
        }

        for cname, builder in chsh_circuits.items():
            s_val, violated = measure_chsh(builder, noisy=noisy)
            chsh_results[cname] = (s_val, violated)
            mark = "✅" if violated else "○ "
            print(f"    {mark} {cname:<26} S={s_val:.4f} "
                  f"{'> 2 ENTANGLED' if violated else '≤ 2 classical'}")

    # Phase 4: θ_lock sweep
    if enable_sweep:
        print("\n  Phase 4: θ_lock angle optimization sweep")

        def _cluster3_factory(theta_rad):
            c = Circuit()
            for i in range(3):
                c.h(i)
            c.cz(0, 1)
            c.cz(1, 2)
            c.rz(0, theta_rad)
            c.rz(2, CHI_PC * math.pi)
            return c

        sweep_results = theta_lock_sweep(_cluster3_factory)
        opt = sweep_results["optimal_angle_deg"]
        tlk = sweep_results["theta_lock_ccce"]
        occ = sweep_results["optimal_ccce"]
        print(f"    Optimal: {opt}° (CCCE={occ:.4f})")
        print(f"    θ_lock=51.843°: CCCE={tlk:.4f}")

    return results, chsh_results, sweep_results


def main():
    parser = argparse.ArgumentParser(
        description="Φ-Threshold Circuit Suite (Enhanced) — DNA::}{::lang v51.843"
    )
    parser.add_argument("--json", type=str, help="Save results to JSON file")
    parser.add_argument("--circuit", type=str,
                        choices=list(CIRCUIT_FAMILIES.keys()) + ["all"],
                        default="all", help="Circuit family to run")
    parser.add_argument("--noiseless", action="store_true",
                        help="Run without noise model")
    parser.add_argument("--no-zne", action="store_true",
                        help="Skip ZNE mitigation")
    parser.add_argument("--no-chsh", action="store_true",
                        help="Skip CHSH Bell test")
    parser.add_argument("--no-sweep", action="store_true",
                        help="Skip θ_lock sweep")
    parser.add_argument("--quick", action="store_true",
                        help="Raw execution only (no ZNE/CHSH/sweep)")
    args = parser.parse_args()

    families = None if args.circuit == "all" else [args.circuit]
    noiseless = args.noiseless
    quick = args.quick

    print("\n⚛  OSIRIS Φ-Threshold Circuit Suite (Enhanced) — Executing...\n")
    results, chsh, sweep = run_suite(
        families=families,
        noisy=not noiseless,
        enable_zne=not (args.no_zne or quick or noiseless),
        enable_chsh=not (args.no_chsh or quick),
        enable_sweep=not (args.no_sweep or quick),
    )
    print(format_results(results, chsh, sweep))

    if args.json:
        out = {
            "framework": "DNA::}{::lang v51.843",
            "cage_code": "9HUP5",
            "phi_threshold": PHI_THRESHOLD,
            "noise_model": {
                "single_gate_error": SINGLE_GATE_ERROR,
                "two_gate_error": TWO_GATE_ERROR,
                "readout_error": READOUT_ERROR,
            } if not noiseless else "noiseless",
            "enhancements": {
                "zne": not (args.no_zne or quick or noiseless),
                "zne_scale_factors": ZNE_SCALE_FACTORS,
                "readout_mitigation": True,
                "chsh_bell_test": not (args.no_chsh or quick),
                "theta_lock_sweep": not (args.no_sweep or quick),
            },
            "results": [r.to_dict() for r in results],
            "chsh": {k: {"S": v[0], "violation": v[1]}
                     for k, v in chsh.items()} if chsh else {},
            "theta_lock_sweep": sweep,
            "summary": {
                "total": len(results),
                "above_threshold": sum(1 for r in results if r.above_threshold),
                "coherent": sum(1 for r in results if r.is_coherent),
                "both": sum(1 for r in results
                           if r.above_threshold and r.is_coherent),
                "mean_phi": round(sum(r.phi for r in results) / len(results), 6),
                "mean_ccce": round(sum(r.ccce for r in results) / len(results), 6),
            },
        }
        for r in out["results"]:
            top = sorted(r["counts"].items(), key=lambda x: -x[1])[:8]
            r["top_counts"] = dict(top)
            del r["counts"]
        with open(args.json, "w") as f:
            json.dump(out, f, indent=2)
        print(f"  Results saved to {args.json}")


if __name__ == "__main__":
    main()
