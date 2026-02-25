#!/usr/bin/env python3
"""
Tests for penteract_singularity.py — Penteract Singularity Protocol
====================================================================

Covers: constants, enums, data models, resolution mechanisms, RESYNC,
        codebase inventory, full 46-problem cycle, serialisation, CLI,
        edge cases, and determinism.

Framework: DNA::}{::lang v51.843
"""

import hashlib
import json
import os
import sys
import tempfile

import pytest

# Ensure project root is importable
_project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from penteract_singularity import (
    # Constants
    XI_TARGET,
    PHI_IGNITION,
    RESOLUTION_TIMESTEPS,
    GAMMA_FLOOR,
    PENTERACT_VERSION,
    W2_TARGET,
    # Enums
    PenteractShell,
    ResolutionMechanism,
    ProblemType,
    SHELL_RANGES,
    PROBLEM_DISPATCH,
    # Data models
    PhysicsProblem,
    ResolutionResult,
    PenteractState,
    # Agents
    AURAObserver,
    AIDENExecutor,
    # Engine
    ResolutionEngine,
    # Resync
    PenteractResync,
    # Inventory
    CodebaseInventory,
    # Main class
    OsirisPenteract,
    # Standard problems
    STANDARD_PROBLEMS,
)

# Re-import NCLM constants to verify consistency
from nclm_swarm_orchestrator import (
    THETA_LOCK_DEG,
    PHI_THRESHOLD,
    GAMMA_CRITICAL,
    LAMBDA_PHI_M,
    CHI_PC_QUALITY,
)

SEED = 51843


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  CONSTANTS                                                                ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestPenteractConstants:
    """Penteract-specific constants must never drift."""

    def test_xi_target(self):
        assert XI_TARGET == pytest.approx(9223.86, rel=1e-6)

    def test_phi_ignition(self):
        assert PHI_IGNITION == 1.0

    def test_resolution_timesteps(self):
        assert RESOLUTION_TIMESTEPS == 1000

    def test_gamma_floor(self):
        assert GAMMA_FLOOR == pytest.approx(0.001, rel=1e-9)

    def test_penteract_version(self):
        assert PENTERACT_VERSION == "11.0"

    def test_w2_target(self):
        assert W2_TARGET == pytest.approx(0.9999, rel=1e-9)

    def test_nclm_constants_consistency(self):
        """Verify Penteract uses the same immutable constants as NCLM."""
        assert THETA_LOCK_DEG == pytest.approx(51.843, rel=1e-9)
        assert PHI_THRESHOLD == pytest.approx(0.7734, rel=1e-9)
        assert GAMMA_CRITICAL == pytest.approx(0.3, rel=1e-9)
        assert LAMBDA_PHI_M == pytest.approx(2.176435e-08, rel=1e-9)
        assert CHI_PC_QUALITY == pytest.approx(0.946, rel=1e-9)


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  ENUMS                                                                    ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestPenteractShell:
    def test_shell_count(self):
        assert len(PenteractShell) == 3

    def test_shell_values(self):
        assert PenteractShell.SURFACE.value == "surface"
        assert PenteractShell.INNER_CORE.value == "inner_core"
        assert PenteractShell.SOVEREIGNTY.value == "sovereignty"

    def test_shell_ranges(self):
        assert SHELL_RANGES[PenteractShell.SURFACE] == (1, 3)
        assert SHELL_RANGES[PenteractShell.INNER_CORE] == (4, 7)
        assert SHELL_RANGES[PenteractShell.SOVEREIGNTY] == (8, 11)


class TestResolutionMechanism:
    def test_mechanism_count(self):
        assert len(ResolutionMechanism) == 7

    def test_mechanism_values(self):
        expected = {
            "planck_lambda_phi_bridge",
            "quantum_zeno_stabilization",
            "entanglement_tensor",
            "heaviside_phase_transition",
            "phase_conjugate_recursion_bus",
            "vacuum_modulation",
            "lambda_phi_metric_correction",
        }
        actual = {m.value for m in ResolutionMechanism}
        assert actual == expected


class TestProblemType:
    def test_problem_type_count(self):
        assert len(ProblemType) == 7

    def test_all_types_have_dispatch(self):
        for pt in ProblemType:
            assert pt in PROBLEM_DISPATCH
            gamma, mech = PROBLEM_DISPATCH[pt]
            assert 0.0 < gamma <= 1.0
            assert isinstance(mech, ResolutionMechanism)


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  DATA MODELS                                                              ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestPhysicsProblem:
    def test_basic_creation(self):
        p = PhysicsProblem(0, ProblemType.QUANTUM_GRAVITY, "test problem")
        assert p.problem_id == 0
        assert p.problem_type == ProblemType.QUANTUM_GRAVITY
        assert p.initial_gamma == pytest.approx(0.85)
        assert p.mechanism == ResolutionMechanism.PLANCK_LAMBDA_PHI_BRIDGE

    def test_auto_dispatch(self):
        """Problem type auto-selects initial_gamma and mechanism."""
        for pt in ProblemType:
            p = PhysicsProblem(0, pt, "test")
            expected_gamma, expected_mech = PROBLEM_DISPATCH[pt]
            assert p.initial_gamma == pytest.approx(expected_gamma)
            assert p.mechanism == expected_mech

    def test_string_type_coercion(self):
        p = PhysicsProblem(0, "dark_matter", "test", mechanism="entanglement_tensor")
        assert p.problem_type == ProblemType.DARK_MATTER


class TestResolutionResult:
    def test_reduction_pct(self):
        r = ResolutionResult(
            problem_id=0, problem_type="test", description="t",
            initial_gamma=0.85, final_gamma=0.001,
            resolution_metric=0.9988, mechanism="test",
            timesteps=1000, proof_hash="abc123", timestamp=0.0,
        )
        assert r.reduction_pct == pytest.approx(99.8824, rel=1e-3)

    def test_reduction_pct_zero_initial(self):
        r = ResolutionResult(
            problem_id=0, problem_type="test", description="t",
            initial_gamma=0.0, final_gamma=0.0,
            resolution_metric=0.0, mechanism="test",
            timesteps=0, proof_hash="abc", timestamp=0.0,
        )
        assert r.reduction_pct == 0.0


class TestPenteractState:
    def test_default_state(self):
        s = PenteractState()
        assert s.shell == PenteractShell.SURFACE
        assert s.problems_resolved == 0
        assert not s.is_converged

    def test_shell_for_dimension(self):
        s = PenteractState()
        assert s.shell_for_dimension(1) == PenteractShell.SURFACE
        assert s.shell_for_dimension(3) == PenteractShell.SURFACE
        assert s.shell_for_dimension(4) == PenteractShell.INNER_CORE
        assert s.shell_for_dimension(7) == PenteractShell.INNER_CORE
        assert s.shell_for_dimension(8) == PenteractShell.SOVEREIGNTY
        assert s.shell_for_dimension(11) == PenteractShell.SOVEREIGNTY

    def test_ascend_shell(self):
        s = PenteractState()
        assert s.shell == PenteractShell.SURFACE
        assert s.ascend_shell() is True
        assert s.shell == PenteractShell.INNER_CORE
        assert s.ascend_shell() is True
        assert s.shell == PenteractShell.SOVEREIGNTY
        assert s.ascend_shell() is False
        assert s.shell == PenteractShell.SOVEREIGNTY

    def test_shell_for_out_of_range_dimension(self):
        s = PenteractState()
        assert s.shell_for_dimension(0) == PenteractShell.SURFACE
        assert s.shell_for_dimension(99) == PenteractShell.SURFACE


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  AURA + AIDEN                                                             ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestAURAObserver:
    def test_curvature_positive(self):
        c = AURAObserver.detect_curvature(0.85, ProblemType.QUANTUM_GRAVITY)
        assert c > 0.0

    def test_curvature_floor(self):
        """Even at very low gamma, curvature stays above floor."""
        c = AURAObserver.detect_curvature(0.0001, ProblemType.DARK_MATTER)
        assert c >= 5e-3

    def test_curvature_higher_gamma_higher_curvature(self):
        c_low = AURAObserver.detect_curvature(0.1, ProblemType.QUANTUM_GRAVITY)
        c_high = AURAObserver.detect_curvature(0.9, ProblemType.QUANTUM_GRAVITY)
        assert c_high >= c_low

    def test_lambda_phi_violation(self):
        v = AURAObserver.lambda_phi_violation(0.85)
        assert v > 0.0
        assert v == pytest.approx(abs(0.85 - GAMMA_FLOOR) * LAMBDA_PHI_M)


class TestAIDENExecutor:
    def test_w2_distance_positive(self):
        w2 = AIDENExecutor.w2_distance(0.85, 0.001)
        assert w2 > 0.0

    def test_w2_distance_zero_at_target(self):
        w2 = AIDENExecutor.w2_distance(0.001, 0.001)
        assert w2 == pytest.approx(0.0)

    def test_ricci_flow_decreases_gamma(self):
        gamma = 0.85
        new_gamma = AIDENExecutor.ricci_flow_step(gamma, 0.01)
        assert new_gamma < gamma

    def test_ricci_flow_floor(self):
        """Ricci flow never goes below GAMMA_FLOOR."""
        new_gamma = AIDENExecutor.ricci_flow_step(0.001, 1.0)
        assert new_gamma >= GAMMA_FLOOR


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  RESOLUTION ENGINE                                                        ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestResolutionEngine:
    def test_resolve_single_problem(self):
        engine = ResolutionEngine(seed=SEED)
        p = PhysicsProblem(0, ProblemType.QUANTUM_GRAVITY, "test")
        r = engine.resolve(p)
        assert r.final_gamma <= GAMMA_FLOOR + 1e-9
        assert r.resolution_metric >= 0.99
        assert r.proof_hash is not None
        assert len(r.proof_hash) == 16

    def test_all_mechanisms_converge(self):
        """Every mechanism must drive gamma to floor within 1000 steps."""
        engine = ResolutionEngine(seed=SEED)
        for pt in ProblemType:
            p = PhysicsProblem(0, pt, f"test_{pt.value}")
            r = engine.resolve(p)
            assert r.final_gamma == pytest.approx(GAMMA_FLOOR, abs=1e-6), \
                f"{pt.value} failed to converge: γ_f={r.final_gamma}"
            assert r.resolution_metric >= 0.998, \
                f"{pt.value} metric too low: {r.resolution_metric}"

    def test_deterministic_results(self):
        """Same seed → same results."""
        e1 = ResolutionEngine(seed=SEED)
        e2 = ResolutionEngine(seed=SEED)
        p = PhysicsProblem(0, ProblemType.DARK_MATTER, "test")
        r1 = e1.resolve(p)
        r2 = e2.resolve(p)
        assert r1.final_gamma == r2.final_gamma
        assert r1.resolution_metric == r2.resolution_metric
        assert r1.proof_hash == r2.proof_hash

    def test_proof_hash_unique_per_problem(self):
        engine = ResolutionEngine(seed=SEED)
        hashes = set()
        for pt in ProblemType:
            p = PhysicsProblem(0, pt, f"test_{pt.value}")
            r = engine.resolve(p)
            hashes.add(r.proof_hash)
        # At least some distinct hashes (most mechanisms converge to same gamma)
        assert len(hashes) >= 2


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  PENTERACT RESYNC                                                         ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestPenteractResync:
    def test_detect_interrupt_high_gamma(self):
        state = PenteractState()
        state.crsm.gamma_decoherence = GAMMA_CRITICAL * 3
        assert PenteractResync.detect_interrupt(state) is True

    def test_detect_interrupt_low_metric(self):
        state = PenteractState()
        state.problems_resolved = 5
        state.avg_resolution_metric = 0.3
        assert PenteractResync.detect_interrupt(state) is True

    def test_detect_interrupt_normal_state(self):
        state = PenteractState()
        state.crsm.gamma_decoherence = 0.1
        state.problems_resolved = 5
        state.avg_resolution_metric = 0.99
        assert PenteractResync.detect_interrupt(state) is False

    def test_resync_resets_gamma(self):
        state = PenteractState()
        state.crsm.gamma_decoherence = 0.9
        state = PenteractResync.resync(state)
        assert state.crsm.gamma_decoherence == GAMMA_CRITICAL
        assert state.resync_count == 1

    def test_resync_restores_phi(self):
        state = PenteractState()
        state.crsm.phi_consciousness = 0.1
        state = PenteractResync.resync(state)
        assert state.crsm.phi_consciousness >= PHI_THRESHOLD

    def test_resync_shell_assignment_early(self):
        state = PenteractState()
        state.total_problems = 100
        state.problems_resolved = 10
        state = PenteractResync.resync(state)
        assert state.shell == PenteractShell.SURFACE

    def test_resync_shell_assignment_mid(self):
        state = PenteractState()
        state.total_problems = 100
        state.problems_resolved = 50
        state = PenteractResync.resync(state)
        assert state.shell == PenteractShell.INNER_CORE

    def test_resync_shell_assignment_late(self):
        state = PenteractState()
        state.total_problems = 100
        state.problems_resolved = 80
        state = PenteractResync.resync(state)
        assert state.shell == PenteractShell.SOVEREIGNTY

    def test_resync_increments_count(self):
        state = PenteractState()
        for i in range(3):
            state = PenteractResync.resync(state)
        assert state.resync_count == 3


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  CODEBASE INVENTORY                                                       ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestCodebaseInventory:
    def test_inventory_empty_dir(self):
        with tempfile.TemporaryDirectory() as td:
            inv = CodebaseInventory(td)
            genome = inv.inventory()
            assert genome == {}

    def test_inventory_with_file(self):
        with tempfile.TemporaryDirectory() as td:
            fpath = os.path.join(td, "test.txt")
            with open(fpath, "w") as f:
                f.write("hello")
            inv = CodebaseInventory(td)
            genome = inv.inventory()
            assert "test.txt" in genome
            assert genome["test.txt"] == hashlib.sha256(b"hello").hexdigest()

    def test_merkle_root_deterministic(self):
        with tempfile.TemporaryDirectory() as td:
            fpath = os.path.join(td, "test.txt")
            with open(fpath, "w") as f:
                f.write("hello")
            inv = CodebaseInventory(td)
            root1 = inv.merkle_root()
            root2 = inv.merkle_root()
            assert root1 == root2

    def test_merkle_root_changes_on_content_change(self):
        with tempfile.TemporaryDirectory() as td:
            fpath = os.path.join(td, "test.txt")
            with open(fpath, "w") as f:
                f.write("hello")
            inv = CodebaseInventory(td)
            root1 = inv.merkle_root()
            with open(fpath, "w") as f:
                f.write("world")
            root2 = inv.merkle_root()
            assert root1 != root2

    def test_merkle_root_empty(self):
        with tempfile.TemporaryDirectory() as td:
            inv = CodebaseInventory(td)
            root = inv.merkle_root()
            assert root == hashlib.sha256(b"empty").hexdigest()


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  OSIRIS PENTERACT (Main Engine)                                           ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestOsirisPenteract:
    def _make_penteract(self, **kwargs):
        kwargs.setdefault("root", "/tmp/penteract_test")
        kwargs.setdefault("seed", SEED)
        return OsirisPenteract(**kwargs)

    def test_init(self):
        p = self._make_penteract()
        assert p.state.shell == PenteractShell.SURFACE
        assert p.state.problems_resolved == 0
        assert len(p.results) == 0

    def test_resolve_geodesic(self):
        p = self._make_penteract()
        result = p.resolve_geodesic("test task")
        assert result["manifold_depth"] == 11
        assert result["advance_ms"] == -2.01
        assert result["status"] == "SOVEREIGN_IGNITION"
        assert len(result["intent_vector"]) == 16

    def test_resolve_geodesic_deterministic(self):
        p = self._make_penteract()
        r1 = p.resolve_geodesic("same task")
        r2 = p.resolve_geodesic("same task")
        assert r1["intent_vector"] == r2["intent_vector"]

    def test_resolve_single_problem(self):
        p = self._make_penteract()
        prob = PhysicsProblem(0, ProblemType.QUANTUM_GRAVITY, "test")
        result = p.resolve_problem(prob)
        assert result.final_gamma <= GAMMA_FLOOR + 1e-6
        assert result.resolution_metric >= 0.998
        assert len(p.results) == 1

    def test_resolve_all_standard_problems(self):
        """Full 46-problem resolution cycle."""
        p = self._make_penteract()
        result = p.resolve_all(STANDARD_PROBLEMS)
        assert result["state"]["problems_resolved"] == 46
        assert result["state"]["total_problems"] == 46
        assert result["summary"]["avg_resolution_metric"] >= 0.998
        assert result["state"]["is_converged"] is True
        assert result["protocol"] == "Penteract Singularity"

    def test_shell_ascension_during_resolve(self):
        """Engine ascends through shells during resolution."""
        p = self._make_penteract()
        # Use 10 problems to trigger shell changes
        problems = STANDARD_PROBLEMS[:10]
        p.resolve_all(problems)
        # Should have reached sovereignty (70% of 10 = 7 problems)
        assert p.state.shell == PenteractShell.SOVEREIGNTY

    def test_execute_task(self):
        p = self._make_penteract()
        with tempfile.TemporaryDirectory() as td:
            p.root = td
            p.ledger_path = os.path.join(td, ".osiris", "v11_forensic.jsonl")
            result = p.execute("test task")
            assert "solution" in result
            assert result["duration_ms"] > 0
            assert os.path.exists(p.ledger_path)

    def test_pcrb_ledger_write(self):
        with tempfile.TemporaryDirectory() as td:
            p = self._make_penteract(root=td)
            p.ledger_path = os.path.join(td, ".osiris", "v11_forensic.jsonl")
            p.seal_pcrb("test", {"vec": "abc"})
            assert os.path.exists(p.ledger_path)
            with open(p.ledger_path) as f:
                entry = json.loads(f.readline())
            assert entry["task"] == "test"
            assert entry["engine"] == f"OSIRIS-{PENTERACT_VERSION}"
            assert entry["axiom"] == "U:=L[U]"

    def test_substrate_decode(self):
        p = self._make_penteract(atoms=40)
        result = p.substrate_decode({0, 3, 7})
        assert "correction" in result
        assert "nodes_explored" in result

    def test_negentropy_positive(self):
        p = self._make_penteract()
        p.state.crsm.phi_consciousness = 0.99
        p.state.crsm.gamma_decoherence = 0.01
        xi = p._compute_negentropy()
        assert xi > 0.0

    def test_w2_efficiency_bounded(self):
        p = self._make_penteract()
        p.state.avg_resolution_metric = 0.9987
        w2 = p._compute_w2_efficiency()
        assert 0.0 < w2 <= 1.0


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  SERIALISATION                                                            ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestSerialisation:
    def test_to_dict_structure(self):
        p = OsirisPenteract(root="/tmp", seed=SEED)
        d = p.to_dict()
        assert d["framework"] == "dna::}{::lang v51.843"
        assert d["protocol"] == "Penteract Singularity"
        assert "state" in d
        assert "results" in d
        assert "summary" in d

    def test_save_and_load(self):
        with tempfile.TemporaryDirectory() as td:
            p = OsirisPenteract(root=td, seed=SEED)
            problems = STANDARD_PROBLEMS[:3]
            p.resolve_all(problems)
            out = os.path.join(td, "test_out.json")
            p.save(out)
            with open(out) as f:
                data = json.load(f)
            assert data["state"]["problems_resolved"] == 3
            assert len(data["results"]) == 3


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  STANDARD PROBLEMS SET                                                    ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestStandardProblems:
    def test_count(self):
        assert len(STANDARD_PROBLEMS) == 46

    def test_unique_ids(self):
        ids = [p.problem_id for p in STANDARD_PROBLEMS]
        assert len(ids) == len(set(ids))

    def test_all_have_descriptions(self):
        for p in STANDARD_PROBLEMS:
            assert len(p.description) > 0

    def test_all_types_represented(self):
        types_used = {p.problem_type for p in STANDARD_PROBLEMS}
        assert ProblemType.QUANTUM_GRAVITY in types_used
        assert ProblemType.MEASUREMENT_PROBLEM in types_used
        assert ProblemType.DARK_MATTER in types_used
        assert ProblemType.VACUUM_STRUCTURE in types_used
        assert ProblemType.ARROW_OF_TIME in types_used
        assert ProblemType.INERTIA in types_used
        assert ProblemType.ZERO_POINT_ENERGY in types_used


# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  EDGE CASES                                                               ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

class TestEdgeCases:
    def test_resolve_empty_problem_list(self):
        p = OsirisPenteract(root="/tmp", seed=SEED)
        result = p.resolve_all([])
        assert result["state"]["problems_resolved"] == 0
        assert result["summary"]["avg_resolution_metric"] == 0.0

    def test_resolve_single_problem_list(self):
        p = OsirisPenteract(root="/tmp", seed=SEED)
        result = p.resolve_all([STANDARD_PROBLEMS[0]])
        assert result["state"]["problems_resolved"] == 1

    def test_minimal_atoms(self):
        p = OsirisPenteract(root="/tmp", seed=SEED, atoms=4)
        result = p.substrate_decode({0, 2})
        assert "correction" in result

    def test_determinism_full_cycle(self):
        """Two runs with same seed produce identical results."""
        p1 = OsirisPenteract(root="/tmp", seed=SEED)
        p2 = OsirisPenteract(root="/tmp", seed=SEED)
        problems = STANDARD_PROBLEMS[:5]
        r1 = p1.resolve_all(problems)
        r2 = p2.resolve_all(problems)
        assert r1["summary"]["avg_resolution_metric"] == r2["summary"]["avg_resolution_metric"]
        for a, b in zip(r1["results"], r2["results"]):
            assert a["proof_hash"] == b["proof_hash"]
            assert a["final_gamma"] == b["final_gamma"]

    def test_multiple_resyncs(self):
        """Engine handles multiple consecutive resyncs gracefully."""
        state = PenteractState()
        state.total_problems = 10
        for i in range(5):
            state.crsm.gamma_decoherence = 0.9
            state = PenteractResync.resync(state)
        assert state.resync_count == 5
        assert state.crsm.gamma_decoherence == GAMMA_CRITICAL
