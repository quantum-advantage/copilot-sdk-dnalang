"""
Tests for the 5 integrated cockpit-enhance modules:
  1. pcrb_engine — Phase Conjugate Recursion Bus
  2. phase_conjugate — Phase Conjugate Preprocessor
  3. workload_extractor — IBM Workload Extractor
  4. omega_engine — Omega Recursive Intent Engine
  5. code_writer — Cockpit Code Writer

All tests use a fixed seed for deterministic behaviour.
"""

import sys
import os
import math
import json
import tempfile
import shutil
from pathlib import Path

import pytest
import numpy as np

# Ensure project root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from pcrb_engine import (  # noqa: E402
    Φ as PCRBConstants,
    ErrorType,
    ErrorSyndrome,
    StabilizerCode,
    PhaseConjugateMirror,
    RecursionBus,
    PCRB,
    PCRBFactory,
    PCRBOrganismIntegration,
)

from phase_conjugate import (  # noqa: E402
    PlanckConstants,
    UniversalConstants,
    SphericalTrig,
    SphericalTetrahedron,
    TetrahedralVertex,
    PhaseConjugateHowitzer,
    CentripetalConvergence,
    TensorDeringing,
    PlanckLambdaPhiBridge,
    PhaseConjugateSubstratePreprocessor,
)

from omega_engine import (  # noqa: E402
    OmegaMetrics,
    Φ as OmegaConstants,
    IntentCategory,
    IntentVector,
    CorpusIndexer,
    CorpusStats,
    IntentDeducer,
    CapabilityMatrix,
    ResourceAnalysis,
    PromptEnhancer,
    ProjectPlanGenerator,
    Milestone,
    OmegaRecursiveEngine,
)

# workload_extractor imports from "phase_conjugate_preprocessor" but the file
# is named "phase_conjugate.py".  Register an alias so the import succeeds.
import phase_conjugate as _pc_mod  # noqa: E402
sys.modules.setdefault("phase_conjugate_preprocessor", _pc_mod)

from workload_extractor import (  # noqa: E402
    IBMBackendSpec,
    IBM_BACKENDS,
    QuantumJobResult,
    WorkloadExtractor,
    SubstratePipeline,
)

from code_writer import (  # noqa: E402
    LAMBDA_PHI as CW_LAMBDA_PHI,
    PHI_THRESHOLD as CW_PHI_THRESHOLD,
    GAMMA_FIXED as CW_GAMMA_FIXED,
    ExecutionTarget,
    FileAction,
    WriteOperation,
    CodeWriter,
    MeshnetExecutor,
    ScimitarElite,
)

SEED = 51843  # Theta-lock seed for reproducibility


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 1: PCRB ENGINE
# ═══════════════════════════════════════════════════════════════════════════════


class TestPCRBConstants:
    """Immutable physical constants in pcrb_engine must never drift."""

    def test_lambda_phi(self):
        assert PCRBConstants.LAMBDA_PHI == pytest.approx(2.176435e-8, rel=1e-9)

    def test_theta_lock(self):
        assert PCRBConstants.THETA_LOCK == pytest.approx(51.843, abs=1e-6)

    def test_phi_threshold(self):
        assert PCRBConstants.PHI_THRESHOLD == pytest.approx(0.7734, abs=1e-4)

    def test_gamma_critical(self):
        assert PCRBConstants.GAMMA_CRITICAL == pytest.approx(0.3, abs=1e-6)

    def test_chi_pc(self):
        assert PCRBConstants.CHI_PC == pytest.approx(0.946, abs=1e-6)

    def test_pcrb_threshold(self):
        assert PCRBConstants.PCRB_THRESHOLD == pytest.approx(0.15, abs=1e-6)

    def test_pcrb_recovery_rate(self):
        assert PCRBConstants.PCRB_RECOVERY_RATE == pytest.approx(0.85, abs=1e-6)


class TestErrorSyndrome:
    """ErrorSyndrome dataclass tests."""

    def test_correctable_when_low_severity(self):
        es = ErrorSyndrome(
            error_type=ErrorType.BIT_FLIP,
            qubit_indices=[0, 1],
            severity=0.3,
            timestamp=0.0,
        )
        assert es.is_correctable is True

    def test_not_correctable_when_high_severity(self):
        es = ErrorSyndrome(
            error_type=ErrorType.LEAKAGE,
            qubit_indices=[5],
            severity=0.7,
            timestamp=0.0,
        )
        assert es.is_correctable is False

    def test_boundary_severity(self):
        es = ErrorSyndrome(ErrorType.PHASE_FLIP, [0], severity=0.5, timestamp=0.0)
        assert es.is_correctable is False  # < 0.5 required

    def test_to_dict_keys(self):
        es = ErrorSyndrome(ErrorType.DEPOLARIZING, [2, 3], severity=0.4, timestamp=1.0)
        d = es.to_dict()
        assert set(d.keys()) == {'error_type', 'qubits', 'severity', 'timestamp', 'correctable'}
        assert d['error_type'] == 'DEPOLARIZING'
        assert d['correctable'] is True


class TestStabilizerCode:
    """StabilizerCode — Steane [[7,1,3]] tests."""

    def test_steane_code_dimensions(self):
        sc = StabilizerCode(7, 1, 3)
        assert sc.n == 7
        assert sc.k == 1
        assert sc.d == 3

    def test_steane_generators_count(self):
        sc = StabilizerCode(7, 1, 3)
        assert len(sc.generators) == 6

    def test_syndrome_table_identity(self):
        sc = StabilizerCode(7, 1, 3)
        assert sc.decode_syndrome((0, 0, 0, 0, 0, 0)) == "I"

    def test_decode_known_x_error(self):
        sc = StabilizerCode(7, 1, 3)
        assert sc.decode_syndrome((0, 0, 1, 0, 0, 0)) == "X0"
        assert sc.decode_syndrome((1, 1, 1, 0, 0, 0)) == "X6"

    def test_decode_known_z_error(self):
        sc = StabilizerCode(7, 1, 3)
        assert sc.decode_syndrome((0, 0, 0, 0, 0, 1)) == "Z0"
        assert sc.decode_syndrome((0, 0, 0, 1, 1, 1)) == "Z6"

    def test_decode_unknown_syndrome(self):
        sc = StabilizerCode(7, 1, 3)
        assert sc.decode_syndrome((1, 1, 1, 1, 1, 1)) == "UNKNOWN"

    def test_get_correction_identity(self):
        sc = StabilizerCode(7, 1, 3)
        assert sc.get_correction("I") is None

    def test_get_correction_unknown(self):
        sc = StabilizerCode(7, 1, 3)
        assert sc.get_correction("UNKNOWN") is None

    def test_get_correction_x_error(self):
        sc = StabilizerCode(7, 1, 3)
        corr = sc.get_correction("X3")
        assert corr is not None
        assert corr['operation'] == 'X'
        assert corr['qubit'] == 3

    def test_get_correction_z_error(self):
        sc = StabilizerCode(7, 1, 3)
        corr = sc.get_correction("Z5")
        assert corr['operation'] == 'Z'
        assert corr['qubit'] == 5

    def test_non_steane_code_no_generators(self):
        sc = StabilizerCode(9, 1, 3)
        assert sc.generators == []
        assert sc.syndrome_table == {}

    def test_measure_syndrome_returns_tuple(self):
        np.random.seed(SEED)
        sc = StabilizerCode(7, 1, 3)
        syn = sc.measure_syndrome([complex(1, 0)] * 7)
        assert isinstance(syn, tuple)
        assert len(syn) == 6


class TestPhaseConjugateMirror:
    """PhaseConjugateMirror — phase history and conjugation."""

    def test_default_strength(self):
        pcm = PhaseConjugateMirror()
        assert pcm.conjugation_strength == pytest.approx(0.9)

    def test_record_phase_adds_entry(self):
        pcm = PhaseConjugateMirror()
        pcm.record_phase([0.1, 0.2, 0.3], timestamp=0.0)
        assert len(pcm.phase_history) == 1

    def test_memory_depth_limit(self):
        pcm = PhaseConjugateMirror(memory_depth=3)
        for i in range(5):
            pcm.record_phase([float(i)], timestamp=float(i))
        assert len(pcm.phase_history) == 3

    def test_conjugate_without_history_returns_input(self):
        pcm = PhaseConjugateMirror()
        phases = [0.5, 0.6]
        result = pcm.compute_conjugate(phases)
        assert result == phases

    def test_conjugate_with_history(self):
        pcm = PhaseConjugateMirror(conjugation_strength=1.0)
        ref = [1.0, 2.0]
        pcm.record_phase(ref, 0.0)
        current = [1.5, 2.5]
        conj = pcm.compute_conjugate(current)
        # conj[i] = ref[i] - (curr[i] - ref[i]) * strength = 2*ref - curr
        assert conj[0] == pytest.approx(0.5)
        assert conj[1] == pytest.approx(1.5)

    def test_apply_conjugation_restores_coherence(self):
        pcm = PhaseConjugateMirror(conjugation_strength=0.9)
        state = {'coherence': 0.5, 'phases': [0.1, 0.2]}
        pcm.record_phase([0.1, 0.2], 0.0)
        result = pcm.apply_conjugation(state)
        assert result['restored_coherence'] > state['coherence']
        assert result['restored_coherence'] <= 0.99

    def test_conjugation_log_grows(self):
        pcm = PhaseConjugateMirror()
        state = {'coherence': 0.8}
        pcm.apply_conjugation(state)
        pcm.apply_conjugation(state)
        assert len(pcm.conjugation_log) == 2


class TestRecursionBus:
    """RecursionBus — iterative correction logic."""

    def test_initial_state(self):
        rb = RecursionBus()
        assert rb.current_iteration == 0
        assert rb.iteration_history == []

    def test_should_continue_below_target(self):
        rb = RecursionBus(max_iterations=10)
        assert rb.should_continue(0.5, 0.95) is True

    def test_should_stop_at_max_iterations(self):
        rb = RecursionBus(max_iterations=3)
        rb.current_iteration = 3
        assert rb.should_continue(0.5, 0.95) is False

    def test_should_stop_when_converged(self):
        rb = RecursionBus(convergence_threshold=0.01)
        assert rb.should_continue(0.949, 0.95) is False

    def test_iterate_increments_counter(self):
        rb = RecursionBus()
        state = {'fidelity': 0.6}
        rb.iterate(state, lambda s: {**s, 'fidelity': 0.7})
        assert rb.current_iteration == 1
        assert len(rb.iteration_history) == 1

    def test_iterate_records_improvement(self):
        rb = RecursionBus()
        state = {'fidelity': 0.6}
        rb.iterate(state, lambda s: {**s, 'fidelity': 0.8})
        assert rb.iteration_history[0]['improvement'] == pytest.approx(0.2)

    def test_convergence_report_not_started(self):
        rb = RecursionBus()
        report = rb.get_convergence_report()
        assert report['status'] == 'NOT_STARTED'

    def test_convergence_report_after_iteration(self):
        rb = RecursionBus(max_iterations=5)
        state = {'fidelity': 0.5}
        rb.iterate(state, lambda s: {**s, 'fidelity': 0.7})
        report = rb.get_convergence_report()
        assert report['iterations'] == 1
        assert report['final_fidelity'] == pytest.approx(0.7)
        assert report['total_improvement'] == pytest.approx(0.2)

    def test_reset_clears_state(self):
        rb = RecursionBus()
        rb.iterate({'fidelity': 0.5}, lambda s: {**s, 'fidelity': 0.6})
        rb.reset()
        assert rb.current_iteration == 0
        assert rb.iteration_history == []


class TestPCRB:
    """PCRB — full repair cycle tests."""

    def test_initialization(self):
        pcrb = PCRB()
        assert pcrb.status == "INITIALIZED"
        assert pcrb.total_corrections == 0
        assert pcrb.total_repairs == 0
        assert len(pcrb.pcrb_id) == 16

    def test_detect_gamma_spike(self):
        pcrb = PCRB()
        state = {'coherence': 0.05, 'n_qubits': 3}
        errors = pcrb.detect_errors(state)
        gamma_errors = [e for e in errors if e.error_type == ErrorType.GAMMA_SPIKE]
        assert len(gamma_errors) >= 1
        assert gamma_errors[0].severity == pytest.approx(0.95)

    def test_detect_low_fidelity_error(self):
        pcrb = PCRB()
        state = {'fidelity': 0.65}
        errors = pcrb.detect_errors(state)
        fidelity_errors = [e for e in errors if e.error_type == ErrorType.AMPLITUDE_DAMPING]
        assert len(fidelity_errors) >= 1

    def test_detect_no_errors_on_healthy_state(self):
        pcrb = PCRB()
        state = {'fidelity': 0.99, 'coherence': 0.99}
        errors = pcrb.detect_errors(state)
        assert len(errors) == 0

    def test_correct_gamma_spike(self):
        pcrb = PCRB()
        state = {'coherence': 0.1}
        error = ErrorSyndrome(ErrorType.GAMMA_SPIKE, [0, 1], 0.9, 0.0)
        corrected = pcrb.correct_error(state, error)
        assert corrected['coherence'] > state['coherence']
        assert pcrb.total_corrections >= 1

    def test_correct_depolarizing(self):
        pcrb = PCRB()
        state = {'fidelity': 0.7}
        error = ErrorSyndrome(ErrorType.DEPOLARIZING, [0], 0.3, 0.0)
        corrected = pcrb.correct_error(state, error)
        assert corrected['fidelity'] > state['fidelity']

    def test_repair_sets_status(self):
        pcrb = PCRB()
        state = {'fidelity': 0.6, 'coherence': 0.1}
        pcrb.repair(state, target_fidelity=0.95)
        assert pcrb.status == "READY"
        assert pcrb.total_repairs == 1

    def test_repair_record_structure(self):
        pcrb = PCRB()
        state = {'fidelity': 0.6, 'coherence': 0.5}
        result = pcrb.repair(state, target_fidelity=0.95)
        assert 'state' in result
        assert 'repair_record' in result
        record = result['repair_record']
        assert 'initial_state' in record
        assert 'final_state' in record
        assert 'convergence' in record

    def test_get_status(self):
        pcrb = PCRB()
        status = pcrb.get_status()
        assert status['status'] == 'INITIALIZED'
        assert status['stabilizer_code'] == '[[7,1,3]]'
        assert status['total_corrections'] == 0

    def test_factory_steane(self):
        pcrb = PCRBFactory.steane_code()
        assert pcrb.stabilizer_code.n == 7
        assert pcrb.stabilizer_code.k == 1
        assert pcrb.stabilizer_code.d == 3

    def test_factory_surface_code(self):
        pcrb = PCRBFactory.surface_code(distance=5)
        assert pcrb.stabilizer_code.n == 25
        assert pcrb.stabilizer_code.d == 5

    def test_factory_high_fidelity(self):
        pcrb = PCRBFactory.high_fidelity()
        assert pcrb.phase_mirror.conjugation_strength == pytest.approx(0.95)
        assert pcrb.recursion_bus.max_iterations == 20


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 2: PHASE CONJUGATE PREPROCESSOR
# ═══════════════════════════════════════════════════════════════════════════════


class TestPlanckConstants:
    """Planck constant values must be immutable."""

    def test_planck_mass_approx_lambda_phi(self):
        assert PlanckConstants.m_P == pytest.approx(2.176434e-8, rel=1e-6)

    def test_hbar(self):
        assert PlanckConstants.hbar == pytest.approx(1.054571817e-34, rel=1e-9)

    def test_planck_length(self):
        assert PlanckConstants.l_P == pytest.approx(1.616255e-35, rel=1e-6)


class TestUniversalConstants:
    """UniversalConstants from phase_conjugate module."""

    def test_lambda_phi(self):
        assert UniversalConstants.LAMBDA_PHI == pytest.approx(2.176435e-8, rel=1e-9)

    def test_theta_lock(self):
        assert UniversalConstants.THETA_LOCK == pytest.approx(51.843, abs=1e-6)

    def test_phi_threshold(self):
        assert UniversalConstants.PHI_THRESHOLD == pytest.approx(0.7734, abs=1e-4)

    def test_golden_ratio_inverse(self):
        assert UniversalConstants.PHI_GOLDEN == pytest.approx(0.618033988749895, rel=1e-12)

    def test_planck_lambda_ratio_near_unity(self):
        ratio = UniversalConstants.planck_lambda_ratio()
        assert ratio == pytest.approx(1.0, abs=0.01)

    def test_hbar_lambda_product(self):
        product = UniversalConstants.hbar_lambda_product()
        assert product > 0
        assert product == pytest.approx(PlanckConstants.hbar * UniversalConstants.LAMBDA_PHI, rel=1e-9)


class TestSphericalTrig:
    """SphericalTrig static methods."""

    def test_spherical_sin_at_pole(self):
        x, y, z = SphericalTrig.spherical_sin(0.0, 0.0)
        assert x == pytest.approx(0.0, abs=1e-15)
        assert y == pytest.approx(0.0, abs=1e-15)
        assert z == pytest.approx(1.0)

    def test_spherical_sin_at_equator(self):
        x, y, z = SphericalTrig.spherical_sin(math.pi / 2, 0.0)
        assert x == pytest.approx(1.0, abs=1e-15)
        assert z == pytest.approx(0.0, abs=1e-15)

    def test_spherical_to_cartesian_unit(self):
        x, y, z = SphericalTrig.spherical_to_cartesian(1.0, math.pi / 2, 0.0)
        assert x == pytest.approx(1.0, abs=1e-15)
        assert y == pytest.approx(0.0, abs=1e-15)
        assert z == pytest.approx(0.0, abs=1e-15)

    def test_cartesian_to_spherical_roundtrip(self):
        r, theta, phi = SphericalTrig.cartesian_to_spherical(1.0, 1.0, 1.0)
        x, y, z = SphericalTrig.spherical_to_cartesian(r, theta, phi)
        assert x == pytest.approx(1.0, abs=1e-10)
        assert y == pytest.approx(1.0, abs=1e-10)
        assert z == pytest.approx(1.0, abs=1e-10)

    def test_haversine_same_point(self):
        d = SphericalTrig.haversine(0.5, 1.0, 0.5, 1.0)
        assert d == pytest.approx(0.0, abs=1e-12)

    def test_haversine_positive(self):
        d = SphericalTrig.haversine(0.0, 0.0, math.pi / 2, 0.0)
        assert d > 0

    def test_cartesian_to_spherical_origin(self):
        r, theta, phi = SphericalTrig.cartesian_to_spherical(0.0, 0.0, 0.0)
        assert r == pytest.approx(0.0)
        assert theta == 0


class TestSphericalTetrahedron:
    """SphericalTetrahedron — geometry and embedding."""

    def test_vertex_count(self):
        st = SphericalTetrahedron()
        assert len(st.vertices) == 4

    def test_edge_count(self):
        st = SphericalTetrahedron()
        assert len(st.edges) == 6

    def test_face_count(self):
        st = SphericalTetrahedron()
        assert len(st.faces) == 4

    def test_vertices_on_sphere(self):
        st = SphericalTetrahedron(radius=2.0)
        for v in st.vertices:
            r = math.sqrt(v.x**2 + v.y**2 + v.z**2)
            assert r == pytest.approx(2.0, abs=1e-10)

    def test_embed_state_returns_3d(self):
        st = SphericalTetrahedron()
        pos = st.embed_state(0.8, 0.7, 0.1)
        assert len(pos) == 3

    def test_embed_state_clamping(self):
        st = SphericalTetrahedron()
        pos = st.embed_state(2.0, -0.5, 1.5)
        assert len(pos) == 3  # should not raise

    def test_project_to_sphere_norm(self):
        st = SphericalTetrahedron(radius=1.0)
        px, py, pz = st.project_to_sphere(3.0, 4.0, 0.0)
        r = math.sqrt(px**2 + py**2 + pz**2)
        assert r == pytest.approx(1.0, abs=1e-10)

    def test_project_to_sphere_origin(self):
        st = SphericalTetrahedron(radius=1.0)
        px, py, pz = st.project_to_sphere(0.0, 0.0, 0.0)
        assert pz == pytest.approx(1.0)


class TestPhaseConjugateHowitzer:
    """PhaseConjugateHowitzer — phase conjugation and howitzer pulse."""

    def test_default_strength(self):
        h = PhaseConjugateHowitzer()
        assert h.conjugation_strength == pytest.approx(0.85)

    def test_record_phase_stores(self):
        h = PhaseConjugateHowitzer()
        h.record_phase(np.array([0.1, 0.2]), 0.0)
        assert len(h.phase_memory) == 1

    def test_conjugate_without_memory(self):
        h = PhaseConjugateHowitzer()
        phases = np.array([1.0, 2.0])
        result = h.compute_conjugate(phases)
        np.testing.assert_array_almost_equal(result, -phases)

    def test_howitzer_pulse_returns_dict(self):
        np.random.seed(SEED)
        h = PhaseConjugateHowitzer()
        state = np.random.rand(8)
        result = h.howitzer_pulse(state, target_coherence=0.95)
        assert 'initial_coherence' in result
        assert 'restored_coherence' in result
        assert 'improvement' in result
        assert 'pulse_strength' in result

    def test_phase_memory_bounded(self):
        h = PhaseConjugateHowitzer()
        for i in range(150):
            h.record_phase(np.array([float(i)]), float(i))
        assert len(h.phase_memory) == 100


class TestPlanckLambdaPhiBridge:
    """PlanckLambdaPhiBridge — bridge ratio and scaling."""

    def test_bridge_ratio_near_unity(self):
        bridge = PlanckLambdaPhiBridge()
        ratio = bridge.compute_bridge_ratio()
        assert ratio == pytest.approx(1.0, abs=0.01)

    def test_action_memory_product_positive(self):
        bridge = PlanckLambdaPhiBridge()
        assert bridge.action_memory_product() > 0

    def test_coherence_time_scale(self):
        bridge = PlanckLambdaPhiBridge()
        tau = bridge.coherence_time_scale()
        assert tau == pytest.approx(1.0 / UniversalConstants.LAMBDA_PHI)

    def test_planck_lambda_tensor_keys(self):
        bridge = PlanckLambdaPhiBridge()
        tensor = bridge.planck_lambda_tensor()
        expected_keys = {'mass_ratio', 'time_ratio', 'length_ratio', 'action_ratio', 'energy_lambda_ratio'}
        assert set(tensor.keys()) == expected_keys

    def test_substrate_encoding_factor(self):
        bridge = PlanckLambdaPhiBridge()
        factor = bridge.substrate_encoding_factor(0.9)
        assert factor > 0


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 3: WORKLOAD EXTRACTOR
# ═══════════════════════════════════════════════════════════════════════════════


class TestIBMBackendSpec:
    """IBMBackendSpec — backend metadata tests (imported via workload_extractor)."""

    def test_brisbane_spec(self):
        brisbane = IBM_BACKENDS['ibm_brisbane']
        assert brisbane.num_qubits == 127
        assert brisbane.documented_fidelity == pytest.approx(0.869)

    def test_decoherence_rate_positive(self):
        for name, spec in IBM_BACKENDS.items():
            assert spec.decoherence_rate > 0

    def test_lambda_coherence(self):
        brisbane = IBM_BACKENDS['ibm_brisbane']
        expected = 0.869 * (1 - 0.015)
        assert brisbane.lambda_coherence == pytest.approx(expected)


class TestQuantumJobResult:
    """QuantumJobResult — probabilities and Bell fidelity."""

    def test_probabilities_sum_to_one(self):
        job = QuantumJobResult(
            job_id='test', backend='ibm_brisbane', shots=1000,
            counts={'00': 400, '01': 50, '10': 50, '11': 500},
            timestamp='2024-01-01T00:00:00Z', num_qubits=2,
        )
        probs = job.probabilities
        assert sum(probs.values()) == pytest.approx(1.0)

    def test_chi_pc(self):
        job = QuantumJobResult(
            job_id='test', backend='ibm_brisbane', shots=1000,
            counts={'00': 435, '01': 65, '10': 65, '11': 435},
            timestamp='2024-01-01T00:00:00Z', num_qubits=2,
        )
        assert job.bell_fidelity == pytest.approx(0.87)

    def test_chi_pc_non_2qubit(self):
        job = QuantumJobResult(
            job_id='test', backend='x', shots=100,
            counts={'000': 50, '111': 50},
            timestamp='t', num_qubits=3,
        )
        assert job.bell_fidelity == pytest.approx(0.0)

    def test_to_dict_has_keys(self):
        job = QuantumJobResult(
            job_id='t', backend='b', shots=100,
            counts={'00': 50, '11': 50}, timestamp='ts', num_qubits=2,
        )
        d = job.to_dict()
        for key in ('job_id', 'backend', 'shots', 'counts', 'probabilities', 'bell_fidelity'):
            assert key in d


class TestWorkloadExtractor:
    """WorkloadExtractor — synthetic job creation and hex parsing."""

    def test_create_synthetic_job(self):
        np.random.seed(SEED)
        ext = WorkloadExtractor()
        job = ext.create_synthetic_job(backend_name='ibm_brisbane', shots=8192, fidelity=0.869)
        assert job.backend == 'ibm_brisbane'
        assert job.shots == 8192
        assert sum(job.counts.values()) == 8192
        assert job.num_qubits == 2

    def test_hex_to_binary_counts(self):
        ext = WorkloadExtractor()
        hex_counts = {'0x0': 400, '0x3': 600}
        binary = ext._hex_to_binary_counts(hex_counts)
        assert '00' in binary
        assert '11' in binary

    def test_infer_num_qubits(self):
        ext = WorkloadExtractor()
        assert ext._infer_num_qubits({'000': 1, '111': 1}) == 3
        assert ext._infer_num_qubits({'00': 1}) == 2
        assert ext._infer_num_qubits({}) == 0

    def test_extract_from_bad_zip(self):
        ext = WorkloadExtractor()
        with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as f:
            f.write(b"not a zip")
            f.flush()
            jobs = ext.extract_from_zip(f.name)
        os.unlink(f.name)
        assert jobs == []
        assert any(e['status'] == 'BAD_ZIP_FILE' for e in ext.extraction_log)


class TestSubstratePipeline:
    """SubstratePipeline — job processing."""

    def test_process_synthetic_batch_runs(self):
        np.random.seed(SEED)
        pipeline = SubstratePipeline()
        result = pipeline.process_synthetic_batch(
            backends=['ibm_brisbane'],
            jobs_per_backend=2,
            shots=1024,
        )
        assert result['jobs_processed'] == 2
        assert len(result['substrate_outputs']) == 2
        assert 'aggregate_metrics' in result

    def test_process_job_keys(self):
        np.random.seed(SEED)
        pipeline = SubstratePipeline()
        ext = WorkloadExtractor()
        job = ext.create_synthetic_job(shots=1024)
        substrate = pipeline.process_job(job)
        assert 'tetrahedral_embedding' in substrate
        assert 'crsm_projection' in substrate
        assert 'job_metadata' in substrate


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 4: OMEGA ENGINE
# ═══════════════════════════════════════════════════════════════════════════════


class TestOmegaMetrics:
    """OmegaMetrics dataclass."""

    def test_defaults(self):
        m = OmegaMetrics()
        assert m.T_mu_nu == 0.0
        assert m.Xi_S == 0.0

    def test_to_dict_keys(self):
        m = OmegaMetrics(T_mu_nu=0.5, eta_s=0.8)
        d = m.to_dict()
        assert "T_μν" in d
        assert "η(s)" in d
        assert d["T_μν"] == 0.5


class TestOmegaPhiConstants:
    """Constants in omega_engine Φ class."""

    def test_lambda_phi(self):
        assert OmegaConstants.LAMBDA_PHI == pytest.approx(2.176435e-8, rel=1e-9)

    def test_theta_lock(self):
        assert OmegaConstants.THETA_LOCK == pytest.approx(51.843, abs=1e-6)

    def test_ccce_formula(self):
        xi = OmegaConstants.ccce(0.9, 0.8, 0.1)
        assert xi == pytest.approx(0.9 * 0.8 / 0.1)

    def test_ccce_zero_gamma_uses_epsilon(self):
        xi = OmegaConstants.ccce(1.0, 1.0, 0.0)
        assert xi == pytest.approx(1.0 / OmegaConstants.EPSILON)

    def test_w2_distance(self):
        d = OmegaConstants.w2_distance([1.0, 0.0], [0.0, 1.0])
        assert d == pytest.approx(math.sqrt(2.0))


class TestIntentVector:
    """IntentVector — properties and serialisation."""

    def test_xi_property(self):
        iv = IntentVector(
            id="test", category=IntentCategory.META_SYSTEM,
            explicit_intent="t", implicit_intent="t", meta_intent="t",
            coherence_lambda=0.9, consciousness_phi=0.8, decoherence_gamma=0.1,
        )
        assert iv.xi == pytest.approx(7.2)

    def test_to_dict(self):
        iv = IntentVector(
            id="IV-X", category=IntentCategory.QUANTUM_FRAMEWORK,
            explicit_intent="test", implicit_intent="imp", meta_intent="meta",
            priority="HIGH",
        )
        d = iv.to_dict()
        assert d['id'] == 'IV-X'
        assert d['category'] == 'QUANTUM_FRAMEWORK'
        assert d['priority'] == 'HIGH'


class TestCorpusIndexer:
    """CorpusIndexer — Layer 1."""

    def test_index_from_counts(self):
        ci = CorpusIndexer()
        stats = ci.index_from_counts(10000, 500, 300, 200, 150)
        assert stats.total_lines == 10000
        assert stats.physics_refs == 500
        assert len(stats.genesis_hash) == 16

    def test_dominant_trajectory(self):
        ci = CorpusIndexer()
        ci.index_from_counts(10000, 100, 500, 200, 50)
        assert ci.get_dominant_trajectory() == "DEFENSE"


class TestIntentDeducer:
    """IntentDeducer — Layers 2-3."""

    def test_deduce_primary_intents_count(self):
        stats = CorpusStats(total_lines=5000, physics_refs=300, defense_refs=200,
                            organism_refs=100, consciousness_refs=50)
        deducer = IntentDeducer(stats)
        intents = deducer.deduce_primary_intents()
        assert len(intents) == 7

    def test_intent_ids_unique(self):
        stats = CorpusStats(total_lines=5000, physics_refs=300)
        deducer = IntentDeducer(stats)
        intents = deducer.deduce_primary_intents()
        ids = [iv.id for iv in intents]
        assert len(ids) == len(set(ids))

    def test_all_intents_have_positive_xi(self):
        stats = CorpusStats(total_lines=5000)
        deducer = IntentDeducer(stats)
        intents = deducer.deduce_primary_intents()
        for iv in intents:
            assert iv.xi > 0

    def test_synthesize_collective_intent(self):
        stats = CorpusStats(total_lines=5000, physics_refs=300, defense_refs=200,
                            organism_refs=100, consciousness_refs=50)
        deducer = IntentDeducer(stats)
        deducer.deduce_primary_intents()
        collective = deducer.synthesize_collective_intent()
        assert 'unified_intent' in collective
        assert 'aggregate_Λ' in collective
        assert collective['aggregate_Λ'] > 0

    def test_collective_auto_deduces(self):
        stats = CorpusStats(total_lines=1000)
        deducer = IntentDeducer(stats)
        collective = deducer.synthesize_collective_intent()
        assert len(deducer.intent_vectors) == 7


class TestCapabilityMatrix:
    """CapabilityMatrix — Layer 4."""

    def test_overall_score_range(self):
        cm = CapabilityMatrix()
        assert 0 < cm.overall_score <= 1.0

    def test_to_dict_structure(self):
        cm = CapabilityMatrix()
        d = cm.to_dict()
        assert 'user_capabilities' in d
        assert 'system_capabilities' in d
        assert 'overall_score' in d


class TestPromptEnhancer:
    """PromptEnhancer — Layer 6."""

    def test_enhance_all(self):
        stats = CorpusStats(total_lines=5000)
        deducer = IntentDeducer(stats)
        intents = deducer.deduce_primary_intents()
        enhancer = PromptEnhancer(intents)
        enhanced = enhancer.enhance_all()
        assert len(enhanced) == 7
        for e in enhanced:
            assert 'enhanced_prompt' in e
            assert 'archetype' in e

    def test_archetype_mapping(self):
        iv = IntentVector(
            id="test", category=IntentCategory.ORGANISM_CREATION,
            explicit_intent="t", implicit_intent="t", meta_intent="t",
        )
        enhancer = PromptEnhancer([iv])
        arch = enhancer._match_archetype(iv)
        assert arch == "ORGANISM_CREATION"


class TestProjectPlanGenerator:
    """ProjectPlanGenerator — Layer 7."""

    def test_generate_plan_count(self):
        ppg = ProjectPlanGenerator()
        milestones = ppg.generate_plan()
        assert len(milestones) == 10

    def test_critical_path(self):
        ppg = ProjectPlanGenerator()
        ppg.generate_plan()
        path = ppg.get_critical_path()
        assert "M01" in path
        assert "M08" in path

    def test_total_loe(self):
        ppg = ProjectPlanGenerator()
        ppg.generate_plan()
        assert ppg.compute_total_loe() > 0


class TestOmegaRecursiveEngine:
    """OmegaRecursiveEngine — full pipeline."""

    def test_compute_omega_metrics_pre(self):
        engine = OmegaRecursiveEngine()
        m = engine.compute_omega_metrics("pre")
        assert m.T_mu_nu > 0
        assert m.Xi_S > 0

    def test_full_pipeline(self):
        engine = OmegaRecursiveEngine()
        corpus = {
            "total_lines": 10000,
            "physics": 500,
            "defense": 300,
            "organism": 200,
            "consciousness": 150,
        }
        result = engine.execute_full_pipeline(corpus)
        assert 'metadata' in result
        assert 'omega_session_analysis' in result
        assert result['metadata']['lambda_phi_constant'] == pytest.approx(2.176435e-8, rel=1e-9)
        assert result['metadata']['recursion_iterations'] == 6


# ═══════════════════════════════════════════════════════════════════════════════
# MODULE 5: CODE WRITER
# ═══════════════════════════════════════════════════════════════════════════════


class TestCodeWriterConstants:
    """Immutable constants in code_writer module."""

    def test_lambda_phi(self):
        assert CW_LAMBDA_PHI == pytest.approx(2.176435e-8, rel=1e-9)

    def test_phi_threshold(self):
        assert CW_PHI_THRESHOLD == pytest.approx(0.7734, abs=1e-6)

    def test_gamma_critical(self):
        assert CW_GAMMA_FIXED == pytest.approx(0.092, abs=1e-6)


class TestCodeWriter:
    """CodeWriter — path checking, validation, backup, writing."""

    def test_is_path_allowed_home(self):
        cw = CodeWriter()
        allowed, _ = cw.is_path_allowed(Path.home() / "test.py")
        assert allowed is True

    def test_is_path_allowed_tmp(self):
        cw = CodeWriter()
        allowed, _ = cw.is_path_allowed(Path("/tmp/test.py"))
        assert allowed is True

    def test_is_path_disallowed(self):
        cw = CodeWriter()
        allowed, msg = cw.is_path_allowed(Path("/etc/passwd"))
        assert allowed is False
        assert "not in allowed" in msg

    def test_validate_python_valid(self):
        cw = CodeWriter()
        valid, msg = cw.validate_code("x = 1 + 2", "python")
        assert valid is True

    def test_validate_python_invalid(self):
        cw = CodeWriter()
        valid, msg = cw.validate_code("def f(\n", "python")
        assert valid is False

    def test_validate_dangerous_pattern(self):
        cw = CodeWriter()
        valid, msg = cw.validate_code("rm -rf /", "bash")
        assert valid is False
        assert "Dangerous" in msg

    def test_validate_javascript_balanced(self):
        cw = CodeWriter()
        valid, _ = cw.validate_code("function f() { return 1; }", "javascript")
        assert valid is True

    def test_validate_javascript_unbalanced(self):
        cw = CodeWriter()
        valid, _ = cw.validate_code("function f() { return 1; ", "javascript")
        assert valid is False

    def test_validate_dna_lang(self):
        cw = CodeWriter()
        valid, _ = cw.validate_code("ORGANISM { GENE x }", "dna")
        assert valid is True
        invalid, _ = cw.validate_code("GENE x", "dna")
        assert invalid is False

    def test_validate_unknown_language(self):
        cw = CodeWriter()
        valid, _ = cw.validate_code("anything", "cobol")
        assert valid is True

    def test_write_file_creates(self):
        cw = CodeWriter()
        with tempfile.TemporaryDirectory() as td:
            fp = Path(td) / "test_out.py"
            # Patch allowed_dirs
            cw.allowed_dirs.append(Path(td))
            op = cw.write_file(fp, "x = 42\n", language="python")
            assert op.success is True
            assert fp.exists()
            assert fp.read_text() == "x = 42\n"

    def test_write_file_blocked_path(self):
        cw = CodeWriter()
        op = cw.write_file("/etc/should_not_write.py", "x=1", language="python")
        assert op.success is False
        assert op.error is not None

    def test_write_file_invalid_syntax(self):
        cw = CodeWriter()
        with tempfile.TemporaryDirectory() as td:
            fp = Path(td) / "bad.py"
            cw.allowed_dirs.append(Path(td))
            op = cw.write_file(fp, "def (broken", language="python")
            assert op.success is False

    def test_create_backup(self):
        cw = CodeWriter()
        with tempfile.TemporaryDirectory() as td:
            fp = Path(td) / "existing.py"
            fp.write_text("original")
            backup = cw.create_backup(fp)
            assert backup is not None
            assert backup.exists()
            assert backup.read_text() == "original"

    def test_create_backup_nonexistent(self):
        cw = CodeWriter()
        result = cw.create_backup(Path("/tmp/nonexistent_file_xyz.py"))
        assert result is None

    def test_preview_write_new_file(self):
        cw = CodeWriter()
        preview = cw.preview_write("/tmp/nonexistent_preview.py", "x = 1\n")
        assert "+" in preview

    def test_generate_diff_new_file(self):
        cw = CodeWriter()
        diff = cw.generate_diff(Path("/tmp/nonexistent_diff.py"), "hello\n")
        assert "+ hello" in diff

    def test_auto_detect_language(self):
        cw = CodeWriter()
        with tempfile.TemporaryDirectory() as td:
            fp = Path(td) / "script.sh"
            cw.allowed_dirs.append(Path(td))
            op = cw.write_file(fp, "#!/usr/bin/env bash\necho hi", language="auto")
            assert op.language == "bash"
            assert op.success is True

    def test_undo_last_write(self):
        cw = CodeWriter()
        with tempfile.TemporaryDirectory() as td:
            fp = Path(td) / "undo_test.py"
            cw.allowed_dirs.append(Path(td))
            # Create file
            fp.write_text("original = True\n")
            # Edit it
            op = cw.write_file(fp, "edited = True\n", language="python", action=FileAction.EDIT)
            assert op.success is True
            assert fp.read_text() == "edited = True\n"
            # Undo
            ok, msg = cw.undo_last_write()
            assert ok is True
            assert fp.read_text() == "original = True\n"

    def test_undo_nothing(self):
        cw = CodeWriter()
        ok, msg = cw.undo_last_write()
        assert ok is False


class TestScimitarElite:
    """ScimitarElite — button macro logic (no hardware needed)."""

    def test_button_range_validation(self):
        se = ScimitarElite()
        ok, msg = se.set_button_macro(0, "ctrl+s")
        assert ok is False
        ok2, msg2 = se.set_button_macro(13, "ctrl+s")
        assert ok2 is False

    def test_button_map(self):
        se = ScimitarElite()
        assert se.button_map[1] == "g1"
        assert se.button_map[12] == "g12"


class TestMeshnetExecutor:
    """MeshnetExecutor — basic attributes."""

    def test_device_id(self):
        me = MeshnetExecutor()
        assert me.device_id == "RFCY81VPHBH"

    def test_execution_log_starts_empty(self):
        me = MeshnetExecutor()
        assert me.execution_log == []
