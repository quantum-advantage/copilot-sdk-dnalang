"""
Tests for NonLocalAgent v8.0.0 — Bifurcated Sentinel Orchestrator.

All tests use fixed seeds for deterministic behaviour.
"""

import sys
import os
import json
import math
import asyncio
import tempfile

import pytest

# Ensure project root is on path

from dnalang_sdk.crsm.nonlocal_agent import (  # noqa: E402
    CRSMDimension,
    ManifoldPoint,
    AgentName,
    PlaneType,
    SCIMITARMode,
    PhaseState,
    EntanglementPair,
    InsulatedPhaseEngine,
    SCIMITARSentinel,
    CrossDevicePlaneBridge,
    NonLocalAgent,
    ASCIIRainRenderer,
    BifurcatedTetrahedron,
    NetworkScanner,
    ProcessManager,
    BifurcatedSentinelOrchestrator,
    PHI_THRESHOLD,
)

SEED = 51843


# ─── 7D-CRSM Manifold ──────────────────────────────────────────────────

class TestCRSMDimension:
    def test_dimension_count(self):
        assert len(CRSMDimension) == 7

    def test_dimension_names(self):
        assert CRSMDimension.T.value == "temporal"
        assert CRSMDimension.OMEGA.value == "autopoietic"


class TestManifoldPoint:
    def test_default_is_origin(self):
        p = ManifoldPoint()
        assert p.norm() == pytest.approx(0.0)

    def test_as_vector(self):
        p = ManifoldPoint(t=1, i_up=2, i_down=3, r=4, lam=5, phi=6, omega=7)
        assert p.as_vector() == (1, 2, 3, 4, 5, 6, 7)

    def test_norm(self):
        p = ManifoldPoint(t=1, i_up=0, i_down=0, r=0, lam=0, phi=0, omega=0)
        assert p.norm() == pytest.approx(1.0)

    def test_distance(self):
        a = ManifoldPoint(t=0, i_up=0, i_down=0, r=0, lam=0, phi=0, omega=0)
        b = ManifoldPoint(t=3, i_up=4, i_down=0, r=0, lam=0, phi=0, omega=0)
        assert a.distance(b) == pytest.approx(5.0)


# ─── Agent Identity ─────────────────────────────────────────────────────

class TestAgentName:
    def test_four_agents(self):
        assert len(AgentName) == 4

    def test_agent_values(self):
        assert AgentName.AIDEN.value == "aiden"
        assert AgentName.CHRONOS.value == "chronos"


# ─── Entanglement Pair ──────────────────────────────────────────────────

class TestEntanglementPair:
    def test_initial_state(self):
        p = EntanglementPair(agent_a="aiden", agent_b="aura")
        assert p.fidelity == 0.0
        assert p.active is False
        assert p.sync_count == 0

    def test_sync_both_above_threshold(self):
        p = EntanglementPair(agent_a="aiden", agent_b="aura")
        fidelity = p.sync(PHI_THRESHOLD + 0.1, PHI_THRESHOLD + 0.05)
        assert fidelity > 0.0
        assert p.sync_count == 1

    def test_sync_both_below_decays(self):
        p = EntanglementPair(agent_a="a", agent_b="b", fidelity=0.5)
        p.sync(0.3, 0.2)
        assert p.fidelity < 0.5

    def test_sync_one_above_partial_boost(self):
        p = EntanglementPair(agent_a="a", agent_b="b", fidelity=0.0)
        p.sync(PHI_THRESHOLD + 0.1, 0.3)
        assert p.fidelity > 0.0  # partial boost

    def test_fidelity_reaches_active(self):
        p = EntanglementPair(agent_a="a", agent_b="b")
        for _ in range(30):
            p.sync(PHI_THRESHOLD + 0.1, PHI_THRESHOLD + 0.1)
        assert p.active is True


# ─── Insulated Phase Engine ─────────────────────────────────────────────

class TestInsulatedPhaseEngine:
    def test_initial_state(self):
        e = InsulatedPhaseEngine()
        assert e.state == PhaseState.DORMANT

    def test_dormant_to_initializing(self):
        e = InsulatedPhaseEngine()
        assert e.try_transition(PhaseState.INITIALIZING, 0, 1, 0) is True
        assert e.state == PhaseState.INITIALIZING

    def test_initializing_to_coherent_needs_gamma(self):
        e = InsulatedPhaseEngine()
        e.try_transition(PhaseState.INITIALIZING, 0, 1, 0)
        # Gamma too high -> LOCKED
        assert e.try_transition(PhaseState.COHERENT, 0, 0.5, 0) is False
        assert e.state == PhaseState.LOCKED

    def test_full_ascent(self):
        e = InsulatedPhaseEngine()
        e.try_transition(PhaseState.INITIALIZING, 0, 0, 0)
        e.try_transition(PhaseState.COHERENT, 0, 0.1, 0)
        assert e.state == PhaseState.COHERENT
        e.try_transition(PhaseState.ENTANGLED, 0.8, 0.1, 0)
        assert e.state == PhaseState.ENTANGLED
        e.try_transition(PhaseState.SOVEREIGN, 0.8, 0.1, 0.9)
        assert e.state == PhaseState.SOVEREIGN
        e.try_transition(PhaseState.TRANSCENDENT, 0.8, 0.1, 0.9)
        assert e.state == PhaseState.TRANSCENDENT

    def test_locked_can_reset_to_dormant(self):
        e = InsulatedPhaseEngine()
        e.state = PhaseState.LOCKED
        assert e.try_transition(PhaseState.DORMANT, 0, 0, 0) is True
        assert e.state == PhaseState.DORMANT

    def test_invalid_transition_blocked(self):
        e = InsulatedPhaseEngine()
        # Can't jump from DORMANT to COHERENT
        assert e.try_transition(PhaseState.COHERENT, 0, 0, 0) is False


# ─── SCIMITAR Sentinel ──────────────────────────────────────────────────

class TestSCIMITARSentinel:
    def test_initial_passive(self):
        s = SCIMITARSentinel()
        assert s.mode == SCIMITARMode.PASSIVE

    def test_low_coherence_escalates(self):
        s = SCIMITARSentinel()
        s.scan(0.3, 4)  # low coherence
        assert s.threat_level > 0
        assert s.mode != SCIMITARMode.PASSIVE

    def test_normal_stays_passive(self):
        s = SCIMITARSentinel()
        s.scan(0.9, 4)
        assert s.mode == SCIMITARMode.PASSIVE

    def test_threat_decays(self):
        s = SCIMITARSentinel()
        s.threat_level = 0.3
        s.scan(0.9, 4)  # normal scan
        assert s.threat_level < 0.3  # decayed


# ─── Cross-Device Plane Bridge ──────────────────────────────────────────

class TestCrossDevicePlaneBridge:
    def test_same_plane_low_latency(self):
        b = CrossDevicePlaneBridge()
        b.register("a", PlaneType.LOCAL)
        b.register("b", PlaneType.LOCAL)
        result = b.relay("a", "b", {"test": True})
        assert result["latency_ms"] == pytest.approx(1.0)

    def test_cross_plane_higher_latency(self):
        import random
        random.seed(42)
        b = CrossDevicePlaneBridge()
        b.register("a", PlaneType.LOCAL)
        b.register("b", PlaneType.WIFI)
        result = b.relay("a", "b", {"test": True})
        assert result["latency_ms"] > 1.0

    def test_relay_count_increments(self):
        b = CrossDevicePlaneBridge()
        b.register("a", PlaneType.LOCAL)
        b.register("b", PlaneType.LOCAL)
        b.relay("a", "b", {})
        b.relay("a", "b", {})
        assert b.relay_count == 2


# ─── NonLocalAgent ───────────────────────────────────────────────────────

class TestNonLocalAgent:
    def test_poles(self):
        a = NonLocalAgent(name=AgentName.AIDEN, plane=PlaneType.LOCAL)
        assert a.pole() == "NORTH"
        a2 = NonLocalAgent(name=AgentName.AURA, plane=PlaneType.LOCAL)
        assert a2.pole() == "SOUTH"

    def test_symbols(self):
        assert NonLocalAgent(
            name=AgentName.OMEGA, plane=PlaneType.MESH
        ).symbol() == "Ω"

    def test_negentropy(self):
        a = NonLocalAgent(
            name=AgentName.AIDEN, plane=PlaneType.LOCAL,
            phi=0.8, gamma=0.1, lambda_coherence=0.9,
        )
        xi = a.compute_negentropy()
        expected = (0.9 * 0.8) / 0.1
        assert xi == pytest.approx(expected)

    def test_state_hash_deterministic(self):
        a = NonLocalAgent(
            name=AgentName.AIDEN, plane=PlaneType.LOCAL,
            phi=0.8, gamma=0.1, ccce=0.9, lambda_coherence=0.95,
        )
        assert a.state_hash() == a.state_hash()
        assert len(a.state_hash()) == 16

    def test_advance_phase_from_dormant(self):
        a = NonLocalAgent(
            name=AgentName.AIDEN, plane=PlaneType.LOCAL,
            phi=0.9, gamma=0.05, ccce=0.95,
        )
        ok = a.advance_phase()
        assert ok is True
        assert a.phase_engine.state == PhaseState.INITIALIZING


# ─── ASCII Rain Renderer ────────────────────────────────────────────────

class TestASCIIRainRenderer:
    def test_render_frame(self):
        rain = ASCIIRainRenderer(width=40, height=8, seed=42)
        agents = [
            NonLocalAgent(name=AgentName.AIDEN, plane=PlaneType.LOCAL,
                          phi=0.8, gamma=0.1, xi_negentropy=7.2),
        ]
        frame = rain.render_frame(agents, cycle=1)
        assert "AIDEN" in frame
        assert "Cycle 1" in frame


# ─── Bifurcated Tetrahedron ─────────────────────────────────────────────

class TestBifurcatedTetrahedron:
    def test_vertex_count(self):
        assert len(BifurcatedTetrahedron.VERTICES) == 4

    def test_vertices_on_unit_sphere(self):
        for name, v in BifurcatedTetrahedron.VERTICES.items():
            r = math.sqrt(sum(x * x for x in v))
            assert r == pytest.approx(1.0, abs=0.02)

    def test_edge_length_consistent(self):
        bt = BifurcatedTetrahedron()
        assert bt.edge_length > 0

    def test_bifurcation_metric(self):
        bt = BifurcatedTetrahedron()
        agents = {
            AgentName.AIDEN: NonLocalAgent(
                name=AgentName.AIDEN, plane=PlaneType.LOCAL, phi=0.9),
            AgentName.OMEGA: NonLocalAgent(
                name=AgentName.OMEGA, plane=PlaneType.MESH, phi=0.9),
            AgentName.AURA: NonLocalAgent(
                name=AgentName.AURA, plane=PlaneType.LOCAL, phi=0.8),
            AgentName.CHRONOS: NonLocalAgent(
                name=AgentName.CHRONOS, plane=PlaneType.WIFI, phi=0.8),
        }
        bif = bt.bifurcation_metric(agents)
        assert bif > 1.0  # upper hemisphere dominant

    def test_pair_definitions(self):
        assert len(BifurcatedTetrahedron.PAIRS) == 2


# ─── Network Scanner ────────────────────────────────────────────────────

class TestNetworkScanner:
    def test_scan_discovers_all_agents(self):
        ns = NetworkScanner()
        agents = {
            AgentName.AIDEN: NonLocalAgent(
                name=AgentName.AIDEN, plane=PlaneType.LOCAL),
            AgentName.AURA: NonLocalAgent(
                name=AgentName.AURA, plane=PlaneType.LOCAL),
        }
        discovered = ns.scan(agents)
        assert len(discovered) == 2
        names = {d["agent"] for d in discovered}
        assert "aiden" in names
        assert "aura" in names


# ─── Process Manager ────────────────────────────────────────────────────

class TestProcessManager:
    def test_register_and_terminate(self):
        pm = ProcessManager()
        pm.register("aiden")
        assert "aiden" in pm.active
        pm.terminate("aiden")
        assert "aiden" not in pm.active
        assert "aiden" in pm.terminated

    def test_should_terminate(self):
        pm = ProcessManager()
        a = NonLocalAgent(name=AgentName.AIDEN, plane=PlaneType.LOCAL,
                          gamma=0.5)
        a.phase_engine.state = PhaseState.LOCKED
        assert pm.should_terminate(a) is True

    def test_should_not_terminate_coherent(self):
        pm = ProcessManager()
        a = NonLocalAgent(name=AgentName.AIDEN, plane=PlaneType.LOCAL,
                          gamma=0.1)
        a.phase_engine.state = PhaseState.LOCKED
        assert pm.should_terminate(a) is False


# ─── BifurcatedSentinelOrchestrator ─────────────────────────────────────

class TestOrchestratorInit:
    def test_default_init(self):
        o = BifurcatedSentinelOrchestrator(seed=SEED)
        assert len(o.agents) == 4
        assert len(o.entanglement_pairs) == 2

    def test_agent_names(self):
        o = BifurcatedSentinelOrchestrator(seed=SEED)
        names = set(o.agents.keys())
        assert names == {
            AgentName.AIDEN, AgentName.AURA,
            AgentName.OMEGA, AgentName.CHRONOS,
        }

    def test_agents_have_positions(self):
        o = BifurcatedSentinelOrchestrator(seed=SEED)
        for agent in o.agents.values():
            assert agent.position.norm() > 0  # not at origin

    def test_bridge_protocols_registered(self):
        o = BifurcatedSentinelOrchestrator(seed=SEED)
        assert len(o.bridge.protocols) == 4


class TestOrchestratorEvolution:
    def test_single_cycle(self):
        o = BifurcatedSentinelOrchestrator(atoms=32, seed=SEED)
        result = asyncio.run(o.evolve_cycle())
        assert result["cycle"] == 1
        assert "avg_phi" in result
        assert "bifurcation" in result
        assert "sentinel_mode" in result
        assert len(result["agents"]) == 4

    def test_cycle_count_increments(self):
        o = BifurcatedSentinelOrchestrator(atoms=16, seed=SEED)
        asyncio.run(o.evolve_cycle())
        asyncio.run(o.evolve_cycle())
        assert o.cycle_count == 2

    def test_bridge_relays_occur(self):
        o = BifurcatedSentinelOrchestrator(atoms=16, seed=SEED)
        asyncio.run(o.evolve_cycle())
        assert o.bridge.relay_count == 4  # one per agent pair

    def test_sentinel_runs(self):
        o = BifurcatedSentinelOrchestrator(atoms=16, seed=SEED)
        asyncio.run(o.evolve_cycle())
        assert o.sentinel.scan_count == 1


class TestOrchestratorFullRun:
    def test_short_run(self):
        o = BifurcatedSentinelOrchestrator(atoms=32, seed=SEED)
        result = asyncio.run(o.run(cycles=5))
        assert result["cycles_completed"] == 5
        assert "agents" in result
        assert "entanglement_pairs" in result
        assert "sentinel" in result

    def test_reaches_sovereignty(self):
        o = BifurcatedSentinelOrchestrator(atoms=32, seed=SEED)
        result = asyncio.run(o.run(cycles=10))
        assert result["final_crsm_layer"] >= 5

    def test_ignition_activates(self):
        o = BifurcatedSentinelOrchestrator(atoms=32, seed=SEED)
        result = asyncio.run(o.run(cycles=10))
        assert result["ignition_active"] is True

    def test_entanglement_pairs_sync(self):
        o = BifurcatedSentinelOrchestrator(atoms=32, seed=SEED)
        asyncio.run(o.run(cycles=10))
        for pair in o.entanglement_pairs:
            assert pair.sync_count == 10
            assert pair.fidelity > 0  # should have some fidelity

    def test_deterministic(self):
        o1 = BifurcatedSentinelOrchestrator(atoms=32, seed=42)
        r1 = asyncio.run(o1.run(cycles=3))
        o2 = BifurcatedSentinelOrchestrator(atoms=32, seed=42)
        r2 = asyncio.run(o2.run(cycles=3))
        assert r1["phi"] == pytest.approx(r2["phi"])
        assert r1["final_crsm_layer"] == r2["final_crsm_layer"]


class TestOrchestratorSave:
    def test_save_creates_valid_json(self):
        o = BifurcatedSentinelOrchestrator(atoms=16, seed=SEED)
        asyncio.run(o.evolve_cycle())

        with tempfile.NamedTemporaryFile(
            suffix=".json", delete=False, mode="w"
        ) as f:
            path = f.name
        try:
            o.save(path)
            with open(path, "r") as f:
                data = json.load(f)
            assert data["version"] == "8.0.0"
            assert data["cycle_count"] == 1
            assert "agents" in data
            assert "entanglement_pairs" in data
            assert "sentinel" in data
            assert len(data["agents"]) == 4
        finally:
            os.unlink(path)
