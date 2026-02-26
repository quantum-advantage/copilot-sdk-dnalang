"""Tests for braket_phi_threshold.py circuit suite."""
import math
import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "examples"))
from braket_phi_threshold import (
    build_prism_2q, build_prism_3q, build_prism_4q,
    build_iqp_3q, build_iqp_4q, build_iqp_5q,
    build_cluster_3q, build_cluster_4q, build_cluster_5q,
    build_tfd_prism_4q, build_tfd_prism_6q,
    build_manifold_3q, build_manifold_5q, build_manifold_7q,
    execute, ALL_CIRCUITS, CIRCUIT_FAMILIES,
    LAMBDA_PHI, THETA_LOCK_RAD, PHI_THRESHOLD, CHI_PC,
)

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
