"""
═══════════════════════════════════════════════════════════════════════════════
 QUANTUM SUBSTRATE PIPELINE v1.0.0-ΛΦ

 Unified preprocessing → correction → verification pipeline that chains:

   1. Phase Conjugate Preprocessor  — spherical tetrahedron embedding,
      Planck-ΛΦ bridge encoding, tensor deringing
   2. Tetrahedral Correction Pass   — geometry-derived RZ(δ) insertion
      after every CX gate (hardware-validated +16.9% at 20q)
   3. PCRB Repair                   — iterative syndrome-based QEC with
      phase-conjugate coherence restoration

 Usage:
     from quantum_substrate import QuantumSubstratePipeline

     pipeline = QuantumSubstratePipeline()

     # Full pipeline on a circuit
     result = pipeline.process(circuit)
     corrected_circuit = result['circuit']
     substrate_report = result['substrate']
     pcrb_report = result['pcrb']

     # Or step by step
     substrate = pipeline.preprocess(phi=0.85, gamma=0.12)
     corrected = pipeline.correct(circuit)
     repair = pipeline.repair(fidelity=0.7, coherence=0.3)

 Framework: DNA::}{::lang v51.843
 CAGE Code: 9HUP5 | Agile Defense Systems LLC
═══════════════════════════════════════════════════════════════════════════════
"""

from __future__ import annotations

import math
import time
from dataclasses import dataclass, field
from typing import Any, Dict, Optional

from qiskit.circuit import QuantumCircuit

from tetrahedral_correction import (
    TetrahedralCorrectionPass,
    apply_tetrahedral_correction,
    ghz_fidelity,
    DELTA_RAD, CHI_PC, THETA_LOCK_DEG,
)

from phase_conjugate import (
    SphericalTetrahedron,
    PlanckLambdaPhiBridge,
    UniversalConstants,
)

from pcrb import PCRB, PCRBFactory


# ═══════════════════════════════════════════════════════════════════════════════
# PIPELINE RESULT
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class SubstrateResult:
    """Result from the substrate preprocessing stage."""
    embedding: tuple  # (x, y, z) on tetrahedral manifold
    bridge_ratio: float  # m_P / ΛΦ (should be ≈ 1.0)
    action_memory: float  # ℏ × ΛΦ
    coherence_scale: float  # Characteristic coherence time
    phi_input: float
    gamma_input: float
    timestamp: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'embedding': list(self.embedding),
            'bridge_ratio': self.bridge_ratio,
            'action_memory': self.action_memory,
            'coherence_scale': self.coherence_scale,
            'phi': self.phi_input,
            'gamma': self.gamma_input,
        }


@dataclass
class CorrectionResult:
    """Result from the tetrahedral correction stage."""
    circuit: QuantumCircuit
    corrections_applied: int
    delta_rad: float
    chi_pc: float
    original_cx_count: int
    rz_gates_added: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            'corrections_applied': self.corrections_applied,
            'delta_rad': self.delta_rad,
            'chi_pc': self.chi_pc,
            'original_cx_count': self.original_cx_count,
            'rz_gates_added': self.rz_gates_added,
        }


@dataclass
class PipelineResult:
    """Full pipeline result."""
    circuit: Optional[QuantumCircuit]
    substrate: SubstrateResult
    correction: Optional[CorrectionResult]
    pcrb: Optional[Dict[str, Any]]
    total_time_s: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            'substrate': self.substrate.to_dict(),
            'correction': self.correction.to_dict() if self.correction else None,
            'pcrb': self.pcrb,
            'total_time_s': self.total_time_s,
        }


# ═══════════════════════════════════════════════════════════════════════════════
# PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════

class QuantumSubstratePipeline:
    """
    Unified quantum substrate pipeline.

    Chains three stages:
      1. Preprocess  — embed quantum state on tetrahedral manifold
      2. Correct     — apply tetrahedral deficit correction to circuit
      3. Repair      — PCRB iterative QEC on post-execution state
    """

    def __init__(
        self,
        pcrb_config: str = 'steane',
        correction_delta: Optional[float] = None,
        correction_chi_pc: Optional[float] = None,
        repair_target: float = 0.90,
    ):
        """
        Args:
            pcrb_config: PCRB factory preset ('steane', 'surface_3', 'high_fidelity')
            correction_delta: Override δ angle in radians
            correction_chi_pc: Override χ_PC quality factor
            repair_target: Target fidelity for PCRB repair cycle
        """
        # Stage 1: Substrate
        self.tetrahedron = SphericalTetrahedron()
        self.bridge = PlanckLambdaPhiBridge()

        # Stage 2: Correction
        self.correction_pass = TetrahedralCorrectionPass(
            delta=correction_delta,
            chi_pc=correction_chi_pc,
        )

        # Stage 3: PCRB
        pcrb_factories = {
            'steane': PCRBFactory.steane_code,
            'surface_3': lambda: PCRBFactory.surface_code(3),
            'surface_5': lambda: PCRBFactory.surface_code(5),
            'high_fidelity': PCRBFactory.high_fidelity,
        }
        factory_fn = pcrb_factories.get(pcrb_config, PCRBFactory.steane_code)
        self.pcrb = factory_fn()
        self.repair_target = repair_target

    def preprocess(self, phi: float, gamma: float) -> SubstrateResult:
        """
        Stage 1: Embed quantum state metrics on tetrahedral manifold.

        Maps (λ, Φ, Γ) → (x, y, z) on the spherically embedded tetrahedron,
        then computes Planck-ΛΦ bridge metrics.

        Args:
            phi: Current entanglement fidelity (Φ)
            gamma: Current decoherence rate (Γ)

        Returns:
            SubstrateResult with embedding coordinates and bridge metrics
        """
        lambda_val = min(1.0, max(0.0, 1.0 - gamma))  # λ ∝ coherence

        embedding = self.tetrahedron.embed_state(lambda_val, phi, gamma)
        bridge_ratio = self.bridge.compute_bridge_ratio()
        action_memory = self.bridge.action_memory_product()
        coherence_scale = self.bridge.coherence_time_scale()

        return SubstrateResult(
            embedding=embedding,
            bridge_ratio=bridge_ratio,
            action_memory=action_memory,
            coherence_scale=coherence_scale,
            phi_input=phi,
            gamma_input=gamma,
        )

    def correct(self, circuit: QuantumCircuit) -> CorrectionResult:
        """
        Stage 2: Apply tetrahedral deficit correction to circuit.

        Inserts RZ(+δ) on target and RZ(-δ·χ_PC) on control after
        every CX gate.

        Args:
            circuit: Input QuantumCircuit (without measurements)

        Returns:
            CorrectionResult with corrected circuit and stats
        """
        original_ops = circuit.count_ops()
        original_cx = original_ops.get('cx', 0) + original_ops.get('ecr', 0)

        corrected = apply_tetrahedral_correction(
            circuit,
            delta=self.correction_pass.delta,
            chi_pc=self.correction_pass.chi_pc,
        )

        corrected_ops = corrected.count_ops()
        rz_added = corrected_ops.get('rz', 0) - original_ops.get('rz', 0)

        return CorrectionResult(
            circuit=corrected,
            corrections_applied=original_cx,
            delta_rad=self.correction_pass.delta,
            chi_pc=self.correction_pass.chi_pc,
            original_cx_count=original_cx,
            rz_gates_added=rz_added,
        )

    def repair(self, fidelity: float, coherence: float, n_qubits: int = 7) -> Dict[str, Any]:
        """
        Stage 3: PCRB iterative repair on post-execution state.

        Args:
            fidelity: Measured fidelity after execution
            coherence: Estimated coherence (1 - Γ)
            n_qubits: Number of logical qubits

        Returns:
            PCRB repair record
        """
        state = {
            'fidelity': fidelity,
            'coherence': coherence,
            'n_qubits': n_qubits,
        }
        result = self.pcrb.repair(state, target_fidelity=self.repair_target)
        return result['repair_record']

    def process(
        self,
        circuit: QuantumCircuit,
        phi: float = 0.5,
        gamma: float = 0.2,
    ) -> PipelineResult:
        """
        Run full 3-stage pipeline.

        Args:
            circuit: Input circuit (without measurements)
            phi: Pre-execution Φ estimate
            gamma: Pre-execution Γ estimate

        Returns:
            PipelineResult with all stage outputs
        """
        start = time.time()

        # Stage 1: Preprocess
        substrate = self.preprocess(phi, gamma)

        # Stage 2: Correct
        correction = self.correct(circuit)

        # Stage 3: PCRB (using pre-execution estimates as initial state)
        pcrb_record = self.repair(
            fidelity=phi,
            coherence=1.0 - gamma,
            n_qubits=circuit.num_qubits,
        )

        elapsed = time.time() - start

        return PipelineResult(
            circuit=correction.circuit,
            substrate=substrate,
            correction=correction,
            pcrb=pcrb_record,
            total_time_s=elapsed,
        )
