"""Tests for braket_phi_threshold.py circuit suite."""
import math
import pytest
import sys
import os

pytest.importorskip("braket", reason="amazon-braket-sdk not installed")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "examples"))
from braket_phi_threshold import (
    build_prism_2q, build_prism_3q, build_prism_4q,
    build_iqp_3q, build_iqp_4q, build_iqp_5q,
    build_cluster_3q, build_cluster_4q, build_cluster_5q,
    build_tfd_prism_4q, build_tfd_prism_6q,
    build_manifold_3q, build_manifold_5q, build_manifold_7q,
    execute, execute_with_zne, measure_chsh,
    _zne_richardson_extrapolate, _build_readout_calibration,
    ALL_CIRCUITS, CIRCUIT_FAMILIES,
    LAMBDA_PHI, THETA_LOCK_RAD, PHI_THRESHOLD, CHI_PC,
)
from braket.circuits import Circuit

# ── Constants ─────────────────────────────────────────────────────────────────

class TestConstants:
    def test_lambda_phi(self):
        assert LAMBDA_PHI == 2.176435e-8

    def test_theta_lock(self):
        assert abs(THETA_LOCK_RAD - math.radians(51.843)) < 1e-12

    def test_phi_threshold(self):
        assert PHI_THRESHOLD == 0.7734

    def test_chi_pc(self):
        assert CHI_PC == 0.946


# ── Circuit Construction ──────────────────────────────────────────────────────

class TestCircuitBuilders:
    """Verify all circuit builders produce valid circuits."""

    @pytest.mark.parametrize("builder,expected_qubits", [
        (build_prism_2q, 2),
        (build_prism_3q, 3),
        (build_prism_4q, 4),
        (build_iqp_3q, 3),
        (build_iqp_4q, 4),
        (build_iqp_5q, 5),
        (build_cluster_3q, 3),
        (build_cluster_4q, 4),
        (build_cluster_5q, 5),
        (build_tfd_prism_4q, 4),
        (build_tfd_prism_6q, 6),
        (build_manifold_3q, 3),
        (build_manifold_5q, 5),
        (build_manifold_7q, 7),
    ])
    def test_qubit_count(self, builder, expected_qubits):
        c = builder()
        assert c.qubit_count == expected_qubits

    @pytest.mark.parametrize("builder", [
        build_prism_2q, build_prism_3q, build_prism_4q,
        build_iqp_3q, build_iqp_4q, build_iqp_5q,
        build_cluster_3q, build_cluster_4q, build_cluster_5q,
        build_tfd_prism_4q, build_tfd_prism_6q,
        build_manifold_3q, build_manifold_5q, build_manifold_7q,
    ])
    def test_nonzero_depth(self, builder):
        c = builder()
        assert c.depth > 0

    @pytest.mark.parametrize("builder", [
        build_prism_2q, build_prism_3q, build_prism_4q,
        build_iqp_3q, build_iqp_4q, build_iqp_5q,
        build_cluster_3q, build_cluster_4q, build_cluster_5q,
        build_tfd_prism_4q, build_tfd_prism_6q,
        build_manifold_3q, build_manifold_5q, build_manifold_7q,
    ])
    def test_has_entangling_gates(self, builder):
        c = builder()
        has_2q = any(len(i.target) >= 2 for i in c.instructions)
        assert has_2q, f"{builder.__name__} has no entangling gates"


# ── Registry ──────────────────────────────────────────────────────────────────

class TestRegistry:
    def test_five_families(self):
        assert len(CIRCUIT_FAMILIES) == 5

    def test_all_circuits_count(self):
        assert len(ALL_CIRCUITS) == 14

    def test_family_names(self):
        assert set(CIRCUIT_FAMILIES.keys()) == {
            "prism", "iqp", "cluster", "tfd", "manifold"
        }


# ── Execution (noiseless, fast) ───────────────────────────────────────────────

class TestExecution:
    """Run noiseless circuits to verify Φ computation correctness."""

    def test_prism_2q_above_threshold(self):
        """Bell + H(1) should give Φ ≈ 1.0 noiseless."""
        c = build_prism_2q()
        r = execute(c, "test_prism_2q", "prism", noisy=False)
        assert r.above_threshold
        assert r.phi >= 0.95

    def test_cluster_3q_above_threshold(self):
        c = build_cluster_3q()
        r = execute(c, "test_cluster_3q", "cluster", noisy=False)
        assert r.above_threshold
        assert r.phi >= 0.95

    def test_iqp_3q_above_threshold(self):
        c = build_iqp_3q()
        r = execute(c, "test_iqp_3q", "iqp", noisy=False)
        assert r.above_threshold
        assert r.phi >= 0.77

    def test_manifold_5q_above_threshold(self):
        c = build_manifold_5q()
        r = execute(c, "test_manifold_5q", "manifold", noisy=False)
        assert r.above_threshold

    def test_noiseless_perfect_coherence(self):
        """Noiseless circuits should have gamma ≈ 0."""
        c = build_cluster_3q()
        r = execute(c, "test_noiseless", "cluster", noisy=False)
        assert r.is_coherent
        assert r.gamma < 0.05

    def test_entanglement_witness_nonzero(self):
        """Entangled circuits should have nonzero witness."""
        c = build_prism_3q()
        r = execute(c, "test_witness", "prism", noisy=False)
        assert abs(r.entanglement_witness) > 0.01 or r.phi > 0.7

    def test_ccce_positive(self):
        c = build_prism_2q()
        r = execute(c, "test_ccce", "prism", noisy=False)
        assert r.ccce > 0

    def test_xi_positive(self):
        c = build_prism_2q()
        r = execute(c, "test_xi", "prism", noisy=False)
        assert r.xi > 0

    def test_result_to_dict(self):
        c = build_prism_2q()
        r = execute(c, "test_dict", "prism", noisy=False)
        d = r.to_dict()
        assert "phi" in d
        assert "above_threshold" in d
        assert "entanglement_witness" in d


# ── Noisy Execution ───────────────────────────────────────────────────────────

class TestNoisyExecution:
    """Verify circuits survive realistic noise."""

    def test_prism_2q_survives_noise(self):
        c = build_prism_2q()
        r = execute(c, "noisy_prism", "prism", noisy=True)
        assert r.phi > 0.8  # Should survive noise well

    def test_cluster_3q_survives_noise(self):
        c = build_cluster_3q()
        r = execute(c, "noisy_cluster", "cluster", noisy=True)
        assert r.above_threshold

    def test_noise_increases_gamma(self):
        """Noisy circuits should have higher gamma than noiseless."""
        c = build_cluster_4q()
        r_clean = execute(c, "clean", "cluster", noisy=False)
        r_noisy = execute(c, "noisy", "cluster", noisy=True)
        assert r_noisy.gamma >= r_clean.gamma


# ── ZNE Tests ─────────────────────────────────────────────────────────────────

class TestZNE:
    """Zero-Noise Extrapolation tests."""

    def test_richardson_linear(self):
        """Linear extrapolation: f(0) from f(1)=3, f(2)=5 → f(0)=1."""
        result = _zne_richardson_extrapolate([3.0, 5.0], [1.0, 2.0])
        assert abs(result - 1.0) < 1e-10

    def test_richardson_quadratic(self):
        """Quadratic: f(x)=x^2+1 at x=[1,2,3] → f(0)=1."""
        values = [2.0, 5.0, 10.0]  # 1+1, 4+1, 9+1
        result = _zne_richardson_extrapolate(values, [1.0, 2.0, 3.0])
        assert abs(result - 1.0) < 1e-10

    def test_richardson_single_point(self):
        result = _zne_richardson_extrapolate([0.75], [1.0])
        assert result == 0.75

    def test_zne_execution(self):
        """ZNE should produce valid PhiResult with zne_applied=True."""
        c = build_cluster_3q()
        r = execute_with_zne(c, "zne_test", "cluster")
        assert r.zne_applied
        assert r.mitigated
        assert r.phi > 0

    def test_zne_cluster_above_threshold(self):
        c = build_cluster_3q()
        r = execute_with_zne(c, "zne_cluster", "cluster")
        assert r.above_threshold

    def test_zne_uses_more_shots(self):
        """ZNE result should report more total shots (3x scale factors)."""
        c = build_prism_2q()
        r_raw = execute(c, "raw", "prism", noisy=True)
        r_zne = execute_with_zne(c, "zne", "prism")
        assert r_zne.shots > r_raw.shots


# ── CHSH Tests ────────────────────────────────────────────────────────────────

class TestCHSH:
    """CHSH Bell inequality tests."""

    def test_bell_violates_noiseless(self):
        """Pure Bell state should violate CHSH (S ≈ 2√2 ≈ 2.828)."""
        def _bell():
            c = Circuit()
            c.h(0)
            c.cnot(0, 1)
            return c
        s_val, violated = measure_chsh(_bell, noisy=False)
        assert violated, f"S={s_val} should be > 2"
        assert s_val > 2.5  # Should be close to 2.828

    def test_bell_violates_noisy(self):
        """Bell state should still violate CHSH under realistic noise."""
        def _bell():
            c = Circuit()
            c.h(0)
            c.cnot(0, 1)
            return c
        s_val, violated = measure_chsh(_bell, noisy=True)
        assert violated, f"S={s_val} should be > 2 even with noise"
        assert s_val > 2.0

    def test_product_does_not_violate(self):
        """Product state (no entanglement) must NOT violate CHSH."""
        def _product():
            c = Circuit()
            c.h(0)
            c.h(1)
            return c
        s_val, violated = measure_chsh(_product, noisy=False)
        assert not violated, f"Product state S={s_val} should be ≤ 2"

    def test_chsh_returns_tuple(self):
        def _bell():
            c = Circuit()
            c.h(0)
            c.cnot(0, 1)
            return c
        result = measure_chsh(_bell, noisy=False)
        assert isinstance(result, tuple)
        assert len(result) == 2
        assert isinstance(result[0], float)
        assert isinstance(result[1], bool)


# ── Readout Calibration Tests ─────────────────────────────────────────────────

class TestReadoutCalibration:
    def test_calibration_returns_dict(self):
        cal = _build_readout_calibration(2)
        assert "f0" in cal
        assert "f1" in cal
        assert "n_qubits" in cal

    def test_calibration_fidelities_reasonable(self):
        cal = _build_readout_calibration(2)
        assert 0.5 < cal["f0"] <= 1.0
        assert 0.5 < cal["f1"] <= 1.0


# ── Enhanced PhiResult Fields ─────────────────────────────────────────────────

class TestEnhancedResult:
    def test_new_fields_present(self):
        c = build_prism_2q()
        r = execute(c, "test", "prism", noisy=False)
        assert hasattr(r, 'mitigated')
        assert hasattr(r, 'zne_applied')
        assert hasattr(r, 'chsh_value')
        assert hasattr(r, 'chsh_violation')

    def test_raw_not_mitigated(self):
        c = build_prism_2q()
        r = execute(c, "test", "prism", noisy=False)
        assert r.mitigated is False
        assert r.zne_applied is False

    def test_to_dict_includes_new_fields(self):
        c = build_prism_2q()
        r = execute(c, "test", "prism", noisy=False)
        d = r.to_dict()
        assert "mitigated" in d
        assert "zne_applied" in d
        assert "chsh_value" in d
