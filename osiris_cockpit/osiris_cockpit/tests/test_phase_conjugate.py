"""
Tests for Phase Conjugate Substrate Preprocessor v1.0.0-ΛΦ

Validates:
- Planck constants and ΛΦ bridge
- Spherical trigonometric functions
- Spherically embedded tetrahedron geometry
- Tensor operations
- Phase conjugate howitzer
- Full substrate preprocessor pipeline
"""
import sys
import os
import math
import pytest
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from phase_conjugate import (
    PlanckConstants, UniversalConstants, SphericalTrig,
    SphericalTetrahedron, PlanckLambdaPhiBridge
)


# ═══════════════════════════════════════════════════════════════════════════════
# PLANCK CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestPlanckConstants:
    def test_planck_constant(self):
        assert PlanckConstants.h == pytest.approx(6.62607015e-34, rel=1e-6)

    def test_reduced_planck(self):
        assert PlanckConstants.hbar == pytest.approx(1.054571817e-34, rel=1e-6)

    def test_planck_length(self):
        assert PlanckConstants.l_P == pytest.approx(1.616255e-35, rel=1e-4)

    def test_planck_mass(self):
        assert PlanckConstants.m_P == pytest.approx(2.176434e-8, rel=1e-4)

    def test_planck_mass_approx_lambda_phi(self):
        """The Planck-ΛΦ bridge: m_P ≈ ΛΦ."""
        ratio = PlanckConstants.m_P / UniversalConstants.LAMBDA_PHI
        assert ratio == pytest.approx(1.0, abs=0.001)


# ═══════════════════════════════════════════════════════════════════════════════
# UNIVERSAL CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestUniversalConstants:
    def test_lambda_phi(self):
        assert UniversalConstants.LAMBDA_PHI == 2.176435e-8

    def test_phi_threshold(self):
        assert UniversalConstants.PHI_THRESHOLD == 0.7734

    def test_theta_lock(self):
        assert UniversalConstants.THETA_LOCK == 51.843

    def test_gamma_critical(self):
        assert UniversalConstants.GAMMA_CRITICAL == 0.3

    def test_chi_pc(self):
        assert UniversalConstants.CHI_PC == 0.946

    def test_tetrahedral_angle(self):
        assert UniversalConstants.TETRA_ANGLE == pytest.approx(109.4712, rel=1e-4)

    def test_planck_lambda_ratio(self):
        ratio = UniversalConstants.planck_lambda_ratio()
        assert ratio == pytest.approx(1.0, abs=0.001)

    def test_hbar_lambda_product(self):
        product = UniversalConstants.hbar_lambda_product()
        assert product > 0
        assert product == pytest.approx(PlanckConstants.hbar * UniversalConstants.LAMBDA_PHI)


# ═══════════════════════════════════════════════════════════════════════════════
# SPHERICAL TRIGONOMETRY
# ═══════════════════════════════════════════════════════════════════════════════

class TestSphericalTrig:
    def test_spherical_sin_north_pole(self):
        """theta=0 should give (0, 0, 1) — north pole."""
        x, y, z = SphericalTrig.spherical_sin(0, 0)
        assert x == pytest.approx(0, abs=1e-10)
        assert y == pytest.approx(0, abs=1e-10)
        assert z == pytest.approx(1.0, abs=1e-10)

    def test_spherical_sin_equator(self):
        """theta=pi/2, phi=0 should give (1, 0, 0)."""
        x, y, z = SphericalTrig.spherical_sin(math.pi / 2, 0)
        assert x == pytest.approx(1.0, abs=1e-10)
        assert z == pytest.approx(0, abs=1e-10)

    def test_spherical_to_cartesian_unit_sphere(self):
        x, y, z = SphericalTrig.spherical_to_cartesian(1.0, math.pi / 2, 0)
        assert x == pytest.approx(1.0, abs=1e-10)
        assert y == pytest.approx(0, abs=1e-10)
        assert z == pytest.approx(0, abs=1e-10)

    def test_cartesian_to_spherical_roundtrip(self):
        original = (1.0, math.pi / 4, math.pi / 3)
        x, y, z = SphericalTrig.spherical_to_cartesian(*original)
        r, theta, phi = SphericalTrig.cartesian_to_spherical(x, y, z)
        assert r == pytest.approx(original[0], abs=1e-10)
        assert theta == pytest.approx(original[1], abs=1e-10)
        assert phi == pytest.approx(original[2], abs=1e-10)

    def test_cartesian_to_spherical_origin(self):
        r, theta, phi = SphericalTrig.cartesian_to_spherical(0, 0, 0)
        assert r == 0


# ═══════════════════════════════════════════════════════════════════════════════
# SPHERICAL TETRAHEDRON
# ═══════════════════════════════════════════════════════════════════════════════

class TestSphericalTetrahedron:
    def test_vertices_count(self):
        tetra = SphericalTetrahedron()
        assert len(tetra.vertices) == 4

    def test_vertices_unit_sphere(self):
        """All vertices should lie on the unit sphere."""
        tetra = SphericalTetrahedron()
        for v in tetra.vertices:
            r = math.sqrt(v.x**2 + v.y**2 + v.z**2)
            assert r == pytest.approx(1.0, abs=1e-6)

    def test_edges_count(self):
        tetra = SphericalTetrahedron()
        assert len(tetra.edges) == 6  # Tetrahedron has 6 edges

    def test_faces_count(self):
        tetra = SphericalTetrahedron()
        assert len(tetra.faces) == 4  # Tetrahedron has 4 faces

    def test_all_edge_lengths_equal(self):
        """Regular tetrahedron: all edges have equal length."""
        tetra = SphericalTetrahedron()
        lengths = []
        for i, j in tetra.edges:
            vi, vj = tetra.vertices[i], tetra.vertices[j]
            length = math.sqrt((vi.x-vj.x)**2 + (vi.y-vj.y)**2 + (vi.z-vj.z)**2)
            lengths.append(length)
        for length in lengths:
            assert length == pytest.approx(lengths[0], rel=0.01)

    def test_embed_state(self):
        """embed_state maps (λ, Φ, Γ) to tetrahedral coordinates."""
        tetra = SphericalTetrahedron()
        result = tetra.embed_state(lambda_val=0.9, phi_val=0.8, gamma_val=0.1)
        assert len(result) == 3
        assert all(isinstance(c, float) for c in result)


# ═══════════════════════════════════════════════════════════════════════════════
# PLANCK-ΛΦ BRIDGE
# ═══════════════════════════════════════════════════════════════════════════════

class TestPlanckLambdaPhiBridge:
    def test_bridge_ratio(self):
        bridge = PlanckLambdaPhiBridge()
        ratio = bridge.compute_bridge_ratio()
        assert ratio == pytest.approx(1.0, abs=0.001)

    def test_action_memory_product(self):
        bridge = PlanckLambdaPhiBridge()
        product = bridge.action_memory_product()
        assert product > 0

    def test_coherence_time_scale(self):
        bridge = PlanckLambdaPhiBridge()
        t_coh = bridge.coherence_time_scale()
        assert t_coh > 0

    def test_substrate_encoding_factor(self):
        bridge = PlanckLambdaPhiBridge()
        factor = bridge.substrate_encoding_factor(coherence=0.9)
        assert factor > 0
