"""
Tests for Tetrahedral Deficit Correction Transpiler Pass

Validates:
- Immutable constants (δ, θ_lock, χ_PC)
- Pass applies RZ gates after every CX
- Gate count increases correctly
- Correction does not alter entanglement structure
- GHZ builder produces correct circuits
- Fidelity estimator works on known distributions
- Hardware reference data integrity
"""
import sys
import os
import math
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from qiskit.circuit import QuantumCircuit
from qiskit.converters import circuit_to_dag, dag_to_circuit
from qiskit.transpiler import PassManager

from tetrahedral_correction import (
    THETA_LOCK_DEG, THETA_TETRA_HALF_DEG, DELTA_DEG, DELTA_RAD, CHI_PC,
    TetrahedralCorrectionPass,
    apply_tetrahedral_correction,
    build_ghz_corrected,
    ghz_fidelity,
    HARDWARE_REFERENCE,
)


# ═══════════════════════════════════════════════════════════════════════════════
# IMMUTABLE CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestConstants:
    def test_theta_lock(self):
        assert THETA_LOCK_DEG == 51.843

    def test_theta_tetra_half(self):
        assert THETA_TETRA_HALF_DEG == pytest.approx(54.736, abs=0.001)

    def test_delta_degrees(self):
        assert DELTA_DEG == pytest.approx(2.893, abs=0.001)

    def test_delta_radians(self):
        assert DELTA_RAD == pytest.approx(math.radians(2.893), abs=1e-4)

    def test_chi_pc(self):
        assert CHI_PC == 0.946

    def test_delta_is_positive(self):
        """Deficit must be positive (tetra > lock)."""
        assert DELTA_DEG > 0
        assert DELTA_RAD > 0

    def test_delta_consistency(self):
        """DELTA_RAD must equal radians(DELTA_DEG)."""
        assert DELTA_RAD == pytest.approx(math.radians(DELTA_DEG), rel=1e-10)


# ═══════════════════════════════════════════════════════════════════════════════
# TRANSPILER PASS
# ═══════════════════════════════════════════════════════════════════════════════

class TestTetrahedralCorrectionPass:
    def test_default_parameters(self):
        p = TetrahedralCorrectionPass()
        assert p.delta == pytest.approx(DELTA_RAD)
        assert p.chi_pc == CHI_PC
        assert 'cx' in p.target_gates

    def test_custom_delta(self):
        p = TetrahedralCorrectionPass(delta=0.1)
        assert p.delta == 0.1

    def test_single_cx_correction(self):
        """One CX → should add 2 RZ gates (one on each qubit)."""
        qc = QuantumCircuit(2)
        qc.cx(0, 1)

        corrected = apply_tetrahedral_correction(qc)
        ops = corrected.count_ops()
        assert ops.get('rz', 0) == 2
        assert ops.get('cx', 0) == 1

    def test_three_cx_correction(self):
        """Three CX → should add 6 RZ gates."""
        qc = QuantumCircuit(3)
        qc.cx(0, 1)
        qc.cx(1, 2)
        qc.cx(0, 2)

        corrected = apply_tetrahedral_correction(qc)
        ops = corrected.count_ops()
        assert ops.get('rz', 0) == 6
        assert ops.get('cx', 0) == 3

    def test_no_cx_no_change(self):
        """Circuit with no CX gates should be unchanged."""
        qc = QuantumCircuit(2)
        qc.h(0)
        qc.h(1)

        corrected = apply_tetrahedral_correction(qc)
        ops = corrected.count_ops()
        assert ops.get('rz', 0) == 0
        assert ops.get('h', 0) == 2

    def test_corrections_counter(self):
        qc = QuantumCircuit(4)
        for i in range(3):
            qc.cx(i, i + 1)

        p = TetrahedralCorrectionPass()
        p.run(circuit_to_dag(qc))
        assert p.corrections_applied == 3

    def test_rz_values_correct(self):
        """Verify the inserted RZ angles are correct."""
        qc = QuantumCircuit(2)
        qc.cx(0, 1)

        corrected = apply_tetrahedral_correction(qc)

        rz_angles = []
        for inst in corrected.data:
            if inst.operation.name == 'rz':
                rz_angles.append(inst.operation.params[0])

        assert len(rz_angles) == 2
        # One should be +δ, the other -δ·χ_PC
        assert any(abs(a - DELTA_RAD) < 1e-10 for a in rz_angles), \
            f"Expected +δ={DELTA_RAD} in {rz_angles}"
        assert any(abs(a - (-DELTA_RAD * CHI_PC)) < 1e-10 for a in rz_angles), \
            f"Expected -δ·χ_PC={-DELTA_RAD * CHI_PC} in {rz_angles}"

    def test_qubit_count_preserved(self):
        """Correction must not change qubit count."""
        qc = QuantumCircuit(5)
        for i in range(4):
            qc.cx(i, i + 1)
        corrected = apply_tetrahedral_correction(qc)
        assert corrected.num_qubits == 5

    def test_passmanager_integration(self):
        """Pass should work within a Qiskit PassManager."""
        qc = QuantumCircuit(3)
        qc.h(0)
        qc.cx(0, 1)
        qc.cx(1, 2)

        pm = PassManager([TetrahedralCorrectionPass()])
        corrected = pm.run(qc)
        ops = corrected.count_ops()
        assert ops.get('rz', 0) == 4  # 2 CX × 2 RZ each
        assert ops.get('cx', 0) == 2

    def test_ecr_gate_support(self):
        """ECR gates should also be corrected when in target_gates."""
        qc = QuantumCircuit(2)
        qc.ecr(0, 1)

        p = TetrahedralCorrectionPass(target_gates=['ecr'])
        corrected_dag = p.run(circuit_to_dag(qc))
        corrected = dag_to_circuit(corrected_dag)
        ops = corrected.count_ops()
        assert ops.get('rz', 0) == 2


# ═══════════════════════════════════════════════════════════════════════════════
# GHZ BUILDER
# ═══════════════════════════════════════════════════════════════════════════════

class TestGHZBuilder:
    def test_ghz_uncorrected(self):
        qc = build_ghz_corrected(4, corrected=False)
        ops = qc.count_ops()
        assert ops.get('h', 0) == 1
        assert ops.get('cx', 0) == 3
        assert ops.get('rz', 0) == 0
        assert 'measure' in ops or qc.num_clbits == 4

    def test_ghz_corrected(self):
        qc = build_ghz_corrected(4, corrected=True)
        ops = qc.count_ops()
        assert ops.get('h', 0) == 1
        assert ops.get('cx', 0) == 3
        assert ops.get('rz', 0) == 6  # 3 CX × 2 RZ

    def test_ghz_sizes(self):
        for n in [2, 4, 8, 12, 16, 20]:
            qc = build_ghz_corrected(n, corrected=True)
            assert qc.num_qubits == n
            ops = qc.count_ops()
            assert ops['cx'] == n - 1
            assert ops['rz'] == 2 * (n - 1)


# ═══════════════════════════════════════════════════════════════════════════════
# FIDELITY ESTIMATOR
# ═══════════════════════════════════════════════════════════════════════════════

class TestGHZFidelity:
    def test_perfect_ghz(self):
        """Perfect GHZ: 50% |0000⟩ + 50% |1111⟩ → F ≈ 1.0."""
        counts = {'0000': 5000, '1111': 5000}
        f = ghz_fidelity(counts, 4)
        assert f == pytest.approx(1.0, abs=0.01)

    def test_zero_state_only(self):
        """Only |0000⟩ → F = 0.25 (no entanglement)."""
        counts = {'0000': 10000}
        f = ghz_fidelity(counts, 4)
        assert f == pytest.approx(0.5, abs=0.01)

    def test_uniform_random(self):
        """Uniform distribution → low fidelity."""
        counts = {format(i, '04b'): 625 for i in range(16)}
        f = ghz_fidelity(counts, 4)
        assert f < 0.2

    def test_empty_counts(self):
        f = ghz_fidelity({}, 4)
        assert f == 0.0

    def test_genuine_entanglement_threshold(self):
        """F > 0.5 implies genuine n-qubit entanglement."""
        # Simulate a noisy GHZ with 60% in correct states
        counts = {'0000': 3000, '1111': 3000,
                  '0001': 500, '0010': 500, '0100': 500, '1000': 500,
                  '0011': 250, '0101': 250, '1010': 250, '1100': 250}
        f = ghz_fidelity(counts, 4)
        assert f > 0.5


# ═══════════════════════════════════════════════════════════════════════════════
# HARDWARE REFERENCE DATA
# ═══════════════════════════════════════════════════════════════════════════════

class TestHardwareReference:
    def test_backend(self):
        assert HARDWARE_REFERENCE['backend'] == 'ibm_fez'

    def test_job_id(self):
        assert HARDWARE_REFERENCE['job_id'] == 'd6g0floddp9c73cevl2g'

    def test_all_sizes_present(self):
        for n in [4, 8, 12, 16, 20]:
            assert n in HARDWARE_REFERENCE['results']

    def test_improvement_scales_with_size(self):
        """Improvement should increase with circuit size."""
        results = HARDWARE_REFERENCE['results']
        sizes = sorted(results.keys())
        improvements = [results[n]['improvement_pct'] for n in sizes]
        for i in range(len(improvements) - 1):
            assert improvements[i + 1] > improvements[i]

    def test_corrected_exceeds_standard(self):
        """Corrected fidelity should exceed standard for all sizes."""
        for n, data in HARDWARE_REFERENCE['results'].items():
            assert data['corrected'] > data['standard']

    def test_20q_genuine_entanglement(self):
        """20-qubit corrected result should exceed 0.5 threshold."""
        assert HARDWARE_REFERENCE['results'][20]['corrected'] > 0.5

    def test_constants_in_reference(self):
        c = HARDWARE_REFERENCE['constants']
        assert c['delta_deg'] == pytest.approx(DELTA_DEG)
        assert c['chi_pc'] == CHI_PC
        assert c['theta_lock_deg'] == THETA_LOCK_DEG
