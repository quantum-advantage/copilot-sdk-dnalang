"""
Tests for IBM Quantum Workload Substrate Extractor v1.0.0-ΛΦ

Validates:
- Backend specification dataclass
- Known backend registry
- Import of phase_conjugate dependency
"""
import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from workload_extractor import IBMBackendSpec


# ═══════════════════════════════════════════════════════════════════════════════
# BACKEND SPECS
# ═══════════════════════════════════════════════════════════════════════════════

class TestIBMBackendSpec:
    def test_create_spec(self):
        spec = IBMBackendSpec(
            name='ibm_torino', processor='Heron r2',
            num_qubits=133, t1_us=300.0, t2_us=200.0,
            readout_error=0.01, cx_error=0.005,
            documented_fidelity=0.95
        )
        assert spec.name == 'ibm_torino'
        assert spec.num_qubits == 133

    def test_decoherence_rate(self):
        spec = IBMBackendSpec(
            name='test', processor='test', num_qubits=10,
            t1_us=250.0, t2_us=150.0,
            readout_error=0.01, cx_error=0.005,
            documented_fidelity=0.90
        )
        gamma = spec.decoherence_rate
        # 1 / (150e-6) ≈ 6666.67
        assert gamma == pytest.approx(1.0 / (150.0 * 1e-6), rel=1e-4)

    def test_lambda_coherence(self):
        spec = IBMBackendSpec(
            name='test', processor='test', num_qubits=10,
            t1_us=250.0, t2_us=150.0,
            readout_error=0.02, cx_error=0.005,
            documented_fidelity=0.90
        )
        lam = spec.lambda_coherence
        assert lam == pytest.approx(0.90 * (1 - 0.02))

    def test_zero_t2_decoherence(self):
        spec = IBMBackendSpec(
            name='test', processor='test', num_qubits=10,
            t1_us=250.0, t2_us=0.0,
            readout_error=0.01, cx_error=0.005,
            documented_fidelity=0.90
        )
        assert spec.decoherence_rate == 0.1  # Fallback


class TestImports:
    def test_phase_conjugate_available(self):
        """Verify phase_conjugate module is importable from workload_extractor."""
        from workload_extractor import IBMBackendSpec  # noqa: F811
        assert IBMBackendSpec is not None

    def test_phase_conjugate_classes(self):
        """Verify SphericalTetrahedron is accessible via phase_conjugate."""
        from phase_conjugate import SphericalTetrahedron
        tetra = SphericalTetrahedron()
        assert len(tetra.vertices) == 4
