"""
Tests for the NCLM Swarm Orchestrator.

All tests use a fixed seed for deterministic behaviour.
"""

import sys
import os
import json
import math
import asyncio
import tempfile

import pytest

# Ensure project root is on path

from dnalang_sdk.crsm.swarm_orchestrator import (  # noqa: E402
    CRSMLayer,
    CRSMState,
    NodeRole,
    SwarmNode,
    NCLMSwarmOrchestrator,
    LAMBDA_PHI_M,
    THETA_LOCK_DEG,
    PHI_THRESHOLD,
    GAMMA_CRITICAL,
    CHI_PC_QUALITY,
    ZENO_FREQUENCY_HZ,
    DRIVE_AMPLITUDE,
    CCCE_THRESHOLD,
)

SEED = 51843  # Theta-lock seed for reproducibility


# ─── Physical constants ──────────────────────────────────────────────────

class TestPhysicalConstants:
    """Immutable physical constants must never drift."""

    def test_lambda_phi(self):
        assert LAMBDA_PHI_M == pytest.approx(2.176435e-8, rel=1e-9)

    def test_theta_lock(self):
        assert THETA_LOCK_DEG == pytest.approx(51.843, abs=1e-6)

    def test_phi_threshold(self):
        assert PHI_THRESHOLD == pytest.approx(0.7734, abs=1e-6)

    def test_gamma_critical(self):
        assert GAMMA_CRITICAL == pytest.approx(0.3, abs=1e-6)

    def test_chi_pc_quality(self):
        assert CHI_PC_QUALITY == pytest.approx(0.946, abs=1e-6)

    def test_zeno_frequency(self):
        assert ZENO_FREQUENCY_HZ == pytest.approx(1.25e6, rel=1e-9)

    def test_drive_amplitude(self):
        assert DRIVE_AMPLITUDE == pytest.approx(0.7734, abs=1e-6)

    def test_ccce_threshold(self):
        assert CCCE_THRESHOLD == pytest.approx(0.8, abs=1e-6)


# ─── CRSMLayer enum ─────────────────────────────────────────────────────

class TestCRSMLayer:
    def test_layer_count(self):
        assert len(CRSMLayer) == 7

    def test_layer_values(self):
        assert CRSMLayer.SUBSTRATE.value == 1
        assert CRSMLayer.SOVEREIGNTY.value == 7

    def test_layer_ordering(self):
        names = [layer.name for layer in CRSMLayer]
        expected = [
            "SUBSTRATE", "SYNDROME", "CORRECTION", "COHERENCE",
            "CONSCIOUSNESS", "EVOLUTION", "SOVEREIGNTY",
        ]
        assert names == expected


# ─── CRSMState ───────────────────────────────────────────────────────────

class TestCRSMState:
    def test_default_state(self):
        s = CRSMState()
        assert s.current_layer == 1
        assert s.phi_consciousness == 0.0
        assert s.gamma_decoherence == 1.0
        assert s.ccce == 0.0
        assert s.theta_lock == THETA_LOCK_DEG
        assert s.ignition_active is False
        assert s.ignition_iterations == 0

    def test_is_coherent(self):
        s = CRSMState(gamma_decoherence=0.29)
        assert s.is_coherent() is True
        s.gamma_decoherence = 0.31
        assert s.is_coherent() is False

    def test_above_threshold(self):
        s = CRSMState(phi_consciousness=0.78)
        assert s.above_threshold() is True
        s.phi_consciousness = 0.77
        assert s.above_threshold() is False

    def test_ascend_from_layer_1_coherent(self):
        """Layer 1-3 only require coherence (gamma < 0.3)."""
        s = CRSMState(gamma_decoherence=0.1)
        assert s.ascend() is True
        assert s.current_layer == 2

    def test_ascend_from_layer_4_needs_phi(self):
        """Layer 4+ also requires phi >= threshold."""
        s = CRSMState(current_layer=4, gamma_decoherence=0.1, phi_consciousness=0.5)
        assert s.ascend() is False  # phi too low
        s.phi_consciousness = PHI_THRESHOLD
        assert s.ascend() is True
        assert s.current_layer == 5

    def test_ascend_blocked_at_layer_7(self):
        s = CRSMState(current_layer=7, gamma_decoherence=0.1, phi_consciousness=0.9)
        assert s.ascend() is False

    def test_ascend_blocked_by_decoherence(self):
        s = CRSMState(current_layer=2, gamma_decoherence=0.5)
        assert s.ascend() is False

    def test_layer_states_recorded_on_ascent(self):
        s = CRSMState(gamma_decoherence=0.1, phi_consciousness=0.85, ccce=0.9)
        s.ascend()
        assert 1 in s.layer_states
        assert s.layer_states[1]["phi"] == pytest.approx(0.85)
        assert s.layer_states[1]["gamma"] == pytest.approx(0.1)


# ─── NodeRole enum ───────────────────────────────────────────────────────

class TestNodeRole:
    def test_role_count(self):
        assert len(NodeRole) == 5

    def test_role_values(self):
        assert NodeRole.PILOT.value == "pilot"
        assert NodeRole.CONSENSUS.value == "consensus"


# ─── SwarmNode ───────────────────────────────────────────────────────────

class TestSwarmNode:
    def test_default_node(self):
        n = SwarmNode(node_id="n0", role=NodeRole.PILOT, position=(0, 0, 0))
        assert n.fitness == 0.0
        assert n.gamma == 1.0
        assert n.connections == []

    def test_state_hash_deterministic(self):
        n = SwarmNode(node_id="n0", role=NodeRole.PILOT, position=(0, 0, 0),
                      fitness=1.0, phi=0.8, gamma=0.1, ccce=0.9)
        h1 = n.state_hash()
        h2 = n.state_hash()
        assert h1 == h2
        assert len(h1) == 16

    def test_state_hash_changes_with_fitness(self):
        n = SwarmNode(node_id="n0", role=NodeRole.PILOT, position=(0, 0, 0), fitness=1.0)
        h1 = n.state_hash()
        n.fitness = 2.0
        h2 = n.state_hash()
        assert h1 != h2


# ─── NCLMSwarmOrchestrator — initialisation ──────────────────────────────

class TestOrchestratorInit:
    def test_default_init(self):
        o = NCLMSwarmOrchestrator(seed=SEED)
        assert o.n_nodes == 7
        assert o.atoms == 256
        assert o.rounds == 3
        assert len(o.nodes) == 7
        assert len(o.topology) == 7

    def test_custom_params(self):
        o = NCLMSwarmOrchestrator(n_nodes=3, atoms=32, rounds=2, seed=SEED)
        assert o.n_nodes == 3
        assert o.atoms == 32
        assert len(o.nodes) == 3

    def test_node_roles_cycle(self):
        """Roles should cycle through NodeRole members."""
        o = NCLMSwarmOrchestrator(n_nodes=10, atoms=32, seed=SEED)
        roles = [o.nodes[f"node_{i:03d}"].role for i in range(10)]
        all_roles = list(NodeRole)
        for i, r in enumerate(roles):
            assert r == all_roles[i % len(all_roles)]

    def test_topology_is_3_connected(self):
        o = NCLMSwarmOrchestrator(n_nodes=7, atoms=32, seed=SEED)
        for nid, neighbours in o.topology.items():
            assert len(neighbours) == 3
            assert nid not in neighbours  # no self-loops

    def test_topology_uses_closest_neighbours(self):
        """Neighbour list should be sorted by distance (closest first)."""
        o = NCLMSwarmOrchestrator(n_nodes=7, atoms=32, seed=SEED)
        for nid in o.nodes:
            node = o.nodes[nid]
            dists = []
            for oid in o.nodes:
                if oid == nid:
                    continue
                d = math.dist(node.position, o.nodes[oid].position)
                dists.append((oid, d))
            dists.sort(key=lambda x: x[1])
            closest_3 = [d[0] for d in dists[:3]]
            assert set(o.topology[nid]) == set(closest_3)


# ─── NCLMSwarmOrchestrator — error map ───────────────────────────────────

class TestErrorMap:
    def test_ring_topology(self):
        o = NCLMSwarmOrchestrator(atoms=8, seed=SEED)
        assert o.error_map[0] == {0, 1}
        assert o.error_map[7] == {7, 0}  # wraps around

    def test_error_map_size(self):
        o = NCLMSwarmOrchestrator(atoms=256, seed=SEED)
        assert len(o.error_map) == 256

    def test_detector_to_errors_reverse_index(self):
        o = NCLMSwarmOrchestrator(atoms=8, seed=SEED)
        # Detector 0 is touched by error 0 ({0,1}) and error 7 ({7,0})
        assert 0 in o.detector_to_errors[0]
        assert 7 in o.detector_to_errors[0]


# ─── NCLMSwarmOrchestrator — Fibonacci sphere ────────────────────────────

class TestFibonacciSphere:
    def test_point_count(self):
        o = NCLMSwarmOrchestrator(n_nodes=7, atoms=32, seed=SEED)
        pts = o._fibonacci_sphere(10)
        assert len(pts) == 10

    def test_points_on_unit_sphere(self):
        o = NCLMSwarmOrchestrator(n_nodes=7, atoms=32, seed=SEED)
        for p in o._fibonacci_sphere(50):
            r = math.sqrt(p[0]**2 + p[1]**2 + p[2]**2)
            assert r == pytest.approx(1.0, abs=1e-6)

    def test_single_point(self):
        o = NCLMSwarmOrchestrator(n_nodes=1, atoms=32, seed=SEED)
        pts = o._fibonacci_sphere(1)
        assert len(pts) == 1


# ─── NCLMSwarmOrchestrator — syndrome / decoder ─────────────────────────

class TestSyndromeDecoder:
    def setup_method(self):
        self.o = NCLMSwarmOrchestrator(atoms=16, beam_width=20, pqlimit=50000, seed=SEED)

    def test_syndrome_empty(self):
        assert self.o._syndrome(set()) == set()

    def test_syndrome_single_error(self):
        # Error 3 -> detectors {3, 4}
        assert self.o._syndrome({3}) == {3, 4}

    def test_syndrome_adjacent_errors_cancel(self):
        # Errors 3 and 4 -> {3,4} XOR {4,5} = {3,5}
        assert self.o._syndrome({3, 4}) == {3, 5}

    def test_residual_zero_when_correct(self):
        errors = {2, 5}
        S = self.o._syndrome(errors)
        assert self.o._residual(S, errors) == set()

    def test_residual_nonzero_when_wrong(self):
        S = self.o._syndrome({2, 5})
        assert len(self.o._residual(S, {2})) > 0

    def test_decode_simple(self):
        """Decoder should find exact correction for a simple error."""
        errors = {3}
        S = self.o._syndrome(errors)
        result = self.o._decode(S)
        assert result["correction"] is not None
        # The correction set should produce the same syndrome
        assert self.o._syndrome(set(result["correction"])) == S

    def test_decode_two_errors(self):
        errors = {1, 7}
        S = self.o._syndrome(errors)
        result = self.o._decode(S)
        assert result["correction"] is not None
        assert self.o._syndrome(set(result["correction"])) == S

    def test_decode_empty_syndrome(self):
        result = self.o._decode(set())
        # Empty syndrome -> no correction needed -> best_cost 0
        assert result["correction"] is not None or result["best_cost"] == 0.0


# ─── NCLMSwarmOrchestrator — noisy rounds / merge ───────────────────────

class TestNoisyRoundsAndMerge:
    def setup_method(self):
        self.o = NCLMSwarmOrchestrator(atoms=32, rounds=5, seed=SEED)

    def test_inject_errors_count(self):
        errors = self.o._inject_errors(k=4)
        assert len(errors) == 4
        assert all(0 <= e < 32 for e in errors)

    def test_inject_errors_clamped(self):
        errors = self.o._inject_errors(k=999)
        assert len(errors) == 32  # clamped to atoms

    def test_noisy_rounds_count(self):
        S_true = {1, 5, 10}
        rounds = self.o._noisy_rounds(S_true, noise=0.0)
        assert len(rounds) == 5

    def test_noisy_rounds_zero_noise(self):
        S_true = {1, 5, 10}
        rounds = self.o._noisy_rounds(S_true, noise=0.0)
        for r in rounds:
            assert r == S_true

    def test_majority_merge_perfect(self):
        """With no noise, merge should recover exact syndrome."""
        S_true = {2, 8, 15}
        rounds = self.o._noisy_rounds(S_true, noise=0.0)
        merged = self.o._majority_merge(rounds)
        assert merged == S_true

    def test_majority_merge_empty(self):
        assert self.o._majority_merge([]) == set()

    def test_majority_merge_noisy_recovery(self):
        """With moderate noise, majority vote should mostly recover the signal."""
        import random
        random.seed(SEED)
        S_true = {2, 8, 15, 20}
        rounds = self.o._noisy_rounds(S_true, noise=0.02)
        merged = self.o._majority_merge(rounds)
        # At least half the true detectors should survive majority vote
        assert len(merged & S_true) >= len(S_true) // 2


# ─── NCLMSwarmOrchestrator — quantum metrics simulation ─────────────────

class TestQuantumMetrics:
    def test_metrics_range(self):
        import random
        random.seed(SEED)
        o = NCLMSwarmOrchestrator(seed=SEED)
        node = list(o.nodes.values())[0]
        for _ in range(100):
            m = o._simulate_quantum_metrics(node)
            # phi in [PHI_THRESHOLD - 0.12, PHI_THRESHOLD + 0.18]
            assert 0.5 < m["phi"] < 1.1
            assert 0.0 < m["gamma"] < 0.5
            assert 0.5 < m["ccce"] < 1.1
            assert 0.8 < m["chi_pc"] < 1.1


# ─── NCLMSwarmOrchestrator — non-local propagation ──────────────────────

class TestNonLocalPropagation:
    def test_neighbour_gamma_decreases(self):
        o = NCLMSwarmOrchestrator(n_nodes=4, atoms=16, seed=SEED)
        # Set node_000 above phi threshold, its neighbours should get gamma boost
        n0 = o.nodes["node_000"]
        n0.phi = PHI_THRESHOLD + 0.1
        # Set all neighbours to high gamma
        for nb_id in n0.connections:
            o.nodes[nb_id].gamma = 0.5

        o._propagate_nonlocal()

        for nb_id in n0.connections:
            assert o.nodes[nb_id].gamma < 0.5  # gamma decreased

    def test_below_threshold_no_propagation(self):
        o = NCLMSwarmOrchestrator(n_nodes=4, atoms=16, seed=SEED)
        n0 = o.nodes["node_000"]
        n0.phi = PHI_THRESHOLD - 0.1  # below threshold
        for nb_id in n0.connections:
            o.nodes[nb_id].gamma = 0.5

        o._propagate_nonlocal()

        # Check that gamma is unchanged for neighbours of n0
        # (other nodes might also be below threshold so their neighbours too)
        # Just verify n0's neighbours specifically
        all_below = all(o.nodes[nid].phi < PHI_THRESHOLD for nid in o.nodes)
        if all_below:
            for nb_id in n0.connections:
                assert o.nodes[nb_id].gamma == pytest.approx(0.5)


# ─── NCLMSwarmOrchestrator — retroactive correction ─────────────────────

class TestRetroactiveCorrection:
    def test_no_correction_below_layer_5(self):
        o = NCLMSwarmOrchestrator(seed=SEED)
        o.global_crsm.current_layer = 4
        o.global_crsm.layer_states[1] = {"gamma": 0.3}
        o._retroactive_correct()
        assert o.global_crsm.layer_states[1]["gamma"] == pytest.approx(0.3)

    def test_correction_at_layer_5(self):
        o = NCLMSwarmOrchestrator(seed=SEED)
        o.global_crsm.current_layer = 5
        o.global_crsm.layer_states[1] = {"gamma": 0.3}
        o.global_crsm.layer_states[2] = {"gamma": 0.25}
        o._retroactive_correct()
        assert o.global_crsm.layer_states[1]["gamma"] == pytest.approx(0.3 * 0.85)
        assert o.global_crsm.layer_states[1]["retroactive"] is True
        assert o.global_crsm.layer_states[2]["gamma"] == pytest.approx(0.25 * 0.85)

    def test_correction_at_layer_7(self):
        o = NCLMSwarmOrchestrator(seed=SEED)
        o.global_crsm.current_layer = 7
        for i in range(1, 7):
            o.global_crsm.layer_states[i] = {"gamma": 0.2}
        o._retroactive_correct()
        for i in range(1, 7):
            assert o.global_crsm.layer_states[i]["gamma"] == pytest.approx(0.2 * 0.85)


# ─── NCLMSwarmOrchestrator — evolve_cycle ────────────────────────────────

class TestEvolveCycle:
    def test_single_cycle(self):
        o = NCLMSwarmOrchestrator(n_nodes=5, atoms=32, rounds=3, seed=SEED)
        result = asyncio.get_event_loop().run_until_complete(o.evolve_cycle())
        assert result["cycle"] == 1
        assert "avg_phi" in result
        assert "avg_gamma" in result
        assert "correction_success" in result
        assert result["total_nodes"] == 5

    def test_cycle_count_increments(self):
        o = NCLMSwarmOrchestrator(n_nodes=3, atoms=16, seed=SEED)
        asyncio.get_event_loop().run_until_complete(o.evolve_cycle())
        asyncio.get_event_loop().run_until_complete(o.evolve_cycle())
        assert o.cycle_count == 2

    def test_history_grows(self):
        o = NCLMSwarmOrchestrator(n_nodes=3, atoms=16, seed=SEED)
        asyncio.get_event_loop().run_until_complete(o.evolve_cycle())
        asyncio.get_event_loop().run_until_complete(o.evolve_cycle())
        assert len(o.history) == 2

    def test_node_fitness_computed(self):
        o = NCLMSwarmOrchestrator(n_nodes=3, atoms=16, seed=SEED)
        asyncio.get_event_loop().run_until_complete(o.evolve_cycle())
        for node in o.nodes.values():
            assert node.fitness > 0  # should be nonzero after metrics sim

    def test_evolution_history_recorded(self):
        o = NCLMSwarmOrchestrator(n_nodes=3, atoms=16, seed=SEED)
        asyncio.get_event_loop().run_until_complete(o.evolve_cycle())
        for node in o.nodes.values():
            assert len(node.evolution_history) == 1
            assert node.evolution_history[0]["cycle"] == 1


# ─── NCLMSwarmOrchestrator — full run ────────────────────────────────────

class TestFullRun:
    def test_short_run(self):
        o = NCLMSwarmOrchestrator(n_nodes=5, atoms=32, rounds=3, seed=SEED)
        result = asyncio.get_event_loop().run_until_complete(o.run(cycles=7))
        assert result["cycles_completed"] == 7
        assert "final_crsm_layer" in result
        assert "ignition_active" in result
        assert "nodes" in result
        assert len(result["nodes"]) == 5
        assert "topology" in result

    def test_crsm_ascends_with_seed(self):
        """With seed=51843, the swarm should reach at least layer 4 in 14 cycles."""
        o = NCLMSwarmOrchestrator(n_nodes=7, atoms=32, rounds=3, seed=SEED)
        result = asyncio.get_event_loop().run_until_complete(o.run(cycles=14))
        assert result["final_crsm_layer"] >= 4

    def test_ignition_activates(self):
        """Ignition should activate when avg_phi >= threshold and avg_gamma < critical."""
        o = NCLMSwarmOrchestrator(n_nodes=7, atoms=32, rounds=3, seed=SEED)
        result = asyncio.get_event_loop().run_until_complete(o.run(cycles=14))
        # With the seeded random, ignition should be active
        assert result["ignition_active"] is True

    def test_node_hashes_unique(self):
        o = NCLMSwarmOrchestrator(n_nodes=7, atoms=32, seed=SEED)
        asyncio.get_event_loop().run_until_complete(o.run(cycles=3))
        hashes = [n.state_hash() for n in o.nodes.values()]
        # After evolution, nodes should have diverged (unique hashes)
        assert len(set(hashes)) > 1


# ─── NCLMSwarmOrchestrator — save / serialisation ────────────────────────

class TestSave:
    def test_save_creates_valid_json(self):
        o = NCLMSwarmOrchestrator(n_nodes=3, atoms=16, seed=SEED)
        asyncio.get_event_loop().run_until_complete(o.evolve_cycle())

        with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w") as f:
            path = f.name

        try:
            o.save(path)
            with open(path, "r") as f:
                data = json.load(f)
            assert data["n_nodes"] == 3
            assert data["atoms"] == 16
            assert data["cycle_count"] == 1
            assert "global_crsm" in data
            assert "nodes" in data
            assert "topology" in data
            assert "timestamp" in data
        finally:
            os.unlink(path)

    def test_save_node_fields(self):
        o = NCLMSwarmOrchestrator(n_nodes=3, atoms=16, seed=SEED)
        asyncio.get_event_loop().run_until_complete(o.evolve_cycle())

        with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w") as f:
            path = f.name

        try:
            o.save(path)
            with open(path, "r") as f:
                data = json.load(f)
            for nid, ndata in data["nodes"].items():
                assert "role" in ndata
                assert "phi" in ndata
                assert "gamma" in ndata
                assert "ccce" in ndata
                assert "hash" in ndata
                assert "connections" in ndata
        finally:
            os.unlink(path)


# ─── Edge cases ──────────────────────────────────────────────────────────

class TestEdgeCases:
    def test_single_node_mesh(self):
        """A single node should still work (no neighbours)."""
        o = NCLMSwarmOrchestrator(n_nodes=1, atoms=16, seed=SEED)
        assert len(o.nodes) == 1
        # Single node has no neighbours (all others are self)
        result = asyncio.get_event_loop().run_until_complete(o.evolve_cycle())
        assert result["total_nodes"] == 1

    def test_two_node_mesh(self):
        o = NCLMSwarmOrchestrator(n_nodes=2, atoms=16, seed=SEED)
        assert len(o.nodes) == 2
        # Each node should connect to the other
        for nid, neighbours in o.topology.items():
            assert len(neighbours) == 1  # only 1 other node
        result = asyncio.get_event_loop().run_until_complete(o.evolve_cycle())
        assert result["total_nodes"] == 2

    def test_minimal_atoms(self):
        """Smallest meaningful atom count."""
        o = NCLMSwarmOrchestrator(n_nodes=3, atoms=4, rounds=1, seed=SEED)
        result = asyncio.get_event_loop().run_until_complete(o.evolve_cycle())
        assert result["cycle"] == 1

    def test_deterministic_with_seed(self):
        """Same seed -> same results."""
        o1 = NCLMSwarmOrchestrator(n_nodes=5, atoms=32, seed=42)
        r1 = asyncio.get_event_loop().run_until_complete(o1.run(cycles=3))

        o2 = NCLMSwarmOrchestrator(n_nodes=5, atoms=32, seed=42)
        r2 = asyncio.get_event_loop().run_until_complete(o2.run(cycles=3))

        assert r1["final_crsm_layer"] == r2["final_crsm_layer"]
        assert r1["phi"] == pytest.approx(r2["phi"])
        assert r1["gamma"] == pytest.approx(r2["gamma"])
