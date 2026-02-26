"""
Tests for Phase Conjugate Recursion Bus (PCRB) v1.0.0-ΛΦ

Validates:
- Canonical constant values
- Error detection (syndrome classification)
- Phase conjugation (time-reversal coherence restoration)
- Recursion bus (iterative correction convergence)
- Full repair cycle
- PCRB factory configurations
- Organism integration layer
"""
import sys
import os
import pytest
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from pcrb import (
    Φ, ErrorType, ErrorSyndrome, StabilizerCode,
    PhaseConjugateMirror, RecursionBus, PCRB,
    PCRBFactory, PCRBOrganismIntegration
)


# ═══════════════════════════════════════════════════════════════════════════════
# CANONICAL CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

class TestCanonicalConstants:
    """Verify immutable physics constants match canonical values."""

    def test_lambda_phi(self):
        assert Φ.LAMBDA_PHI == 2.176435e-8

    def test_phi_threshold(self):
        assert Φ.PHI_THRESHOLD == 0.7734

    def test_theta_lock(self):
        assert Φ.THETA_LOCK == 51.843

    def test_gamma_critical(self):
        assert Φ.GAMMA_CRITICAL == 0.3

    def test_chi_pc(self):
        assert Φ.CHI_PC == 0.946

    def test_pcrb_threshold(self):
        assert Φ.PCRB_THRESHOLD == 0.15

    def test_pcrb_max_iterations(self):
        assert Φ.PCRB_MAX_ITERATIONS == 10


# ═══════════════════════════════════════════════════════════════════════════════
# ERROR SYNDROME
# ═══════════════════════════════════════════════════════════════════════════════

class TestErrorSyndrome:
    def test_correctable_low_severity(self):
        err = ErrorSyndrome(ErrorType.BIT_FLIP, [0], 0.3, time.time())
        assert err.is_correctable is True

    def test_not_correctable_high_severity(self):
        err = ErrorSyndrome(ErrorType.AMPLITUDE_DAMPING, [0, 1], 0.7, time.time())
        assert err.is_correctable is False

    def test_to_dict(self):
        err = ErrorSyndrome(ErrorType.PHASE_FLIP, [2], 0.2, 1000.0)
        d = err.to_dict()
        assert d['error_type'] == 'PHASE_FLIP'
        assert d['qubits'] == [2]
        assert d['severity'] == 0.2
        assert d['correctable'] is True

    def test_all_error_types_exist(self):
        expected = [
            'BIT_FLIP', 'PHASE_FLIP', 'BIT_PHASE', 'AMPLITUDE_DAMPING',
            'PHASE_DAMPING', 'DEPOLARIZING', 'COHERENT', 'LEAKAGE',
            'CROSSTALK', 'MEASUREMENT', 'GAMMA_SPIKE'
        ]
        actual = [e.name for e in ErrorType]
        for name in expected:
            assert name in actual


# ═══════════════════════════════════════════════════════════════════════════════
# STABILIZER CODE
# ═══════════════════════════════════════════════════════════════════════════════

class TestStabilizerCode:
    def test_steane_code_parameters(self):
        code = StabilizerCode(7, 1, 3)
        assert code.n == 7
        assert code.k == 1
        assert code.d == 3

    def test_steane_generators_count(self):
        code = StabilizerCode(7, 1, 3)
        assert len(code.generators) == 6  # 3 X + 3 Z

    def test_no_error_syndrome(self):
        code = StabilizerCode(7, 1, 3)
        identity = code.decode_syndrome((0, 0, 0, 0, 0, 0))
        assert identity == "I"

    def test_x0_syndrome(self):
        code = StabilizerCode(7, 1, 3)
        result = code.decode_syndrome((0, 0, 1, 0, 0, 0))
        assert result == "X0"

    def test_z6_syndrome(self):
        code = StabilizerCode(7, 1, 3)
        result = code.decode_syndrome((0, 0, 0, 1, 1, 1))
        assert result == "Z6"

    def test_unknown_syndrome(self):
        code = StabilizerCode(7, 1, 3)
        result = code.decode_syndrome((1, 1, 1, 1, 1, 1))
        assert result == "UNKNOWN"

    def test_get_correction_identity(self):
        code = StabilizerCode(7, 1, 3)
        assert code.get_correction("I") is None

    def test_get_correction_x_error(self):
        code = StabilizerCode(7, 1, 3)
        corr = code.get_correction("X3")
        assert corr is not None
        assert corr['operation'] == 'X'
        assert corr['qubit'] == 3

    def test_get_correction_z_error(self):
        code = StabilizerCode(7, 1, 3)
        corr = code.get_correction("Z5")
        assert corr['operation'] == 'Z'
        assert corr['qubit'] == 5


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE CONJUGATE MIRROR
# ═══════════════════════════════════════════════════════════════════════════════

class TestPhaseConjugateMirror:
    def test_default_strength(self):
        mirror = PhaseConjugateMirror()
        assert mirror.conjugation_strength == 0.9

    def test_record_phase(self):
        mirror = PhaseConjugateMirror()
        mirror.record_phase([0.1, 0.2, 0.3], 1.0)
        assert len(mirror.phase_history) == 1

    def test_memory_depth_limit(self):
        mirror = PhaseConjugateMirror(memory_depth=3)
        for i in range(5):
            mirror.record_phase([float(i)], float(i))
        assert len(mirror.phase_history) == 3

    def test_conjugate_no_history(self):
        mirror = PhaseConjugateMirror()
        result = mirror.compute_conjugate([0.5, 0.6])
        assert result == [0.5, 0.6]  # Returns input when no history

    def test_conjugate_with_history(self):
        mirror = PhaseConjugateMirror(conjugation_strength=1.0)
        mirror.record_phase([0.0, 0.0], 0.0)
        result = mirror.compute_conjugate([0.5, 0.5])
        # With strength 1.0: conj = ref - (curr - ref) = 0 - 0.5 = -0.5
        assert result[0] == pytest.approx(-0.5)
        assert result[1] == pytest.approx(-0.5)

    def test_apply_conjugation_restores_coherence(self):
        mirror = PhaseConjugateMirror()
        state = {'coherence': 0.5, 'phases': [0.1, 0.2]}
        mirror.record_phase([0.0, 0.0], 0.0)
        result = mirror.apply_conjugation(state)
        assert result['restored_coherence'] > state['coherence']

    def test_conjugation_log(self):
        mirror = PhaseConjugateMirror()
        state = {'coherence': 0.5}
        mirror.apply_conjugation(state)
        assert len(mirror.conjugation_log) == 1


# ═══════════════════════════════════════════════════════════════════════════════
# RECURSION BUS
# ═══════════════════════════════════════════════════════════════════════════════

class TestRecursionBus:
    def test_should_continue_below_target(self):
        bus = RecursionBus()
        assert bus.should_continue(0.5, 0.95) is True

    def test_should_stop_at_target(self):
        bus = RecursionBus()
        assert bus.should_continue(0.95, 0.95) is False

    def test_should_stop_at_max_iterations(self):
        bus = RecursionBus(max_iterations=2)
        bus.current_iteration = 2
        assert bus.should_continue(0.5, 0.95) is False

    def test_iterate(self):
        bus = RecursionBus()
        state = {'fidelity': 0.5}
        result = bus.iterate(state, lambda s: {'fidelity': 0.7})
        assert result['fidelity'] == 0.7
        assert bus.current_iteration == 1

    def test_convergence_report_not_started(self):
        bus = RecursionBus()
        report = bus.get_convergence_report()
        assert report['status'] == 'NOT_STARTED'

    def test_convergence_report_after_iterations(self):
        bus = RecursionBus()
        state = {'fidelity': 0.5}
        bus.iterate(state, lambda s: {'fidelity': 0.7})
        report = bus.get_convergence_report()
        assert report['iterations'] == 1
        assert report['final_fidelity'] == 0.7

    def test_convergence_detection(self):
        bus = RecursionBus()
        # Simulate 3 iterations with no improvement
        for _ in range(3):
            bus.iterate({'fidelity': 0.8}, lambda s: {'fidelity': 0.8})
        assert bus.should_continue(0.8, 0.95) is False  # Converged

    def test_reset(self):
        bus = RecursionBus()
        bus.iterate({'fidelity': 0.5}, lambda s: {'fidelity': 0.7})
        bus.reset()
        assert bus.current_iteration == 0
        assert len(bus.iteration_history) == 0


# ═══════════════════════════════════════════════════════════════════════════════
# PCRB MAIN CLASS
# ═══════════════════════════════════════════════════════════════════════════════

class TestPCRB:
    def test_initialization(self):
        pcrb = PCRB()
        assert pcrb.status == "INITIALIZED"
        assert pcrb.total_corrections == 0
        assert len(pcrb.pcrb_id) == 16

    def test_detect_gamma_spike(self):
        pcrb = PCRB()
        state = {'coherence': 0.05, 'n_qubits': 4}
        errors = pcrb.detect_errors(state)
        gamma_spikes = [e for e in errors if e.error_type == ErrorType.GAMMA_SPIKE]
        assert len(gamma_spikes) >= 1

    def test_detect_low_fidelity(self):
        pcrb = PCRB()
        state = {'fidelity': 0.6, 'coherence': 0.5}
        errors = pcrb.detect_errors(state)
        assert len(errors) >= 1

    def test_detect_no_errors_healthy_state(self):
        pcrb = PCRB()
        state = {'fidelity': 0.99, 'coherence': 0.99}
        errors = pcrb.detect_errors(state)
        assert len(errors) == 0

    def test_correct_gamma_spike(self):
        pcrb = PCRB()
        state = {'coherence': 0.05, 'phases': [0.1, 0.2]}
        pcrb.phase_mirror.record_phase([0.0, 0.0], 0.0)
        error = ErrorSyndrome(ErrorType.GAMMA_SPIKE, [0, 1], 0.95, time.time())
        corrected = pcrb.correct_error(state, error)
        assert corrected['coherence'] > state['coherence']

    def test_correct_depolarizing(self):
        pcrb = PCRB()
        state = {'fidelity': 0.5}
        error = ErrorSyndrome(ErrorType.DEPOLARIZING, [0], 0.5, time.time())
        corrected = pcrb.correct_error(state, error)
        assert corrected['fidelity'] > state['fidelity']

    def test_repair_degraded_state(self):
        pcrb = PCRBFactory.steane_code()
        degraded = {'fidelity': 0.65, 'coherence': 0.12, 'n_qubits': 7,
                     'phases': [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]}
        result = pcrb.repair(degraded, target_fidelity=0.90)
        assert 'state' in result
        assert 'repair_record' in result
        assert result['repair_record']['convergence']['iterations'] >= 1
        assert pcrb.status == "READY"

    def test_repair_already_good(self):
        pcrb = PCRB()
        good_state = {'fidelity': 0.99, 'coherence': 0.99}
        result = pcrb.repair(good_state, target_fidelity=0.95)
        # No errors to detect = no iterations needed
        report = result['repair_record']['convergence']
        assert report['status'] == 'NOT_STARTED' or result['state']['fidelity'] >= 0.95

    def test_get_status(self):
        pcrb = PCRB()
        status = pcrb.get_status()
        assert status['stabilizer_code'] == "[[7,1,3]]"
        assert status['status'] == "INITIALIZED"
        assert status['total_corrections'] == 0


# ═══════════════════════════════════════════════════════════════════════════════
# PCRB FACTORY
# ═══════════════════════════════════════════════════════════════════════════════

class TestPCRBFactory:
    def test_steane_code(self):
        pcrb = PCRBFactory.steane_code()
        assert pcrb.stabilizer_code.n == 7
        assert pcrb.stabilizer_code.k == 1
        assert pcrb.stabilizer_code.d == 3

    def test_surface_code_d3(self):
        pcrb = PCRBFactory.surface_code(distance=3)
        assert pcrb.stabilizer_code.n == 9
        assert pcrb.stabilizer_code.d == 3

    def test_surface_code_d5(self):
        pcrb = PCRBFactory.surface_code(distance=5)
        assert pcrb.stabilizer_code.n == 25
        assert pcrb.stabilizer_code.d == 5

    def test_high_fidelity(self):
        pcrb = PCRBFactory.high_fidelity()
        assert pcrb.phase_mirror.conjugation_strength == 0.95
        assert pcrb.recursion_bus.max_iterations == 20
        assert pcrb.recursion_bus.convergence_threshold == 1e-8


# ═══════════════════════════════════════════════════════════════════════════════
# ORGANISM INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════════

class TestPCRBOrganismIntegration:
    def test_register_organism(self):
        integration = PCRBOrganismIntegration()
        integration.register_organism("test_org", {'fidelity': 0.9, 'coherence': 0.8})
        assert "test_org" in integration.organism_states

    def test_check_healthy_no_repair(self):
        integration = PCRBOrganismIntegration()
        integration.register_organism("healthy", {'fidelity': 0.95, 'coherence': 0.9})
        result = integration.check_and_repair("healthy")
        assert result is None

    def test_check_degraded_triggers_repair(self):
        integration = PCRBOrganismIntegration()
        integration.register_organism("degraded", {
            'fidelity': 0.5, 'coherence': 0.1, 'n_qubits': 7,
            'phases': [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]
        })
        result = integration.check_and_repair("degraded")
        assert result is not None
        assert integration.organism_states["degraded"]['repairs'] == 1

    def test_check_unregistered(self):
        integration = PCRBOrganismIntegration()
        result = integration.check_and_repair("nonexistent")
        assert result is None

    def test_repair_callback(self):
        integration = PCRBOrganismIntegration()
        callback_log = []
        integration.add_repair_callback(lambda oid, r: callback_log.append(oid))
        integration.register_organism("cb_test", {
            'fidelity': 0.3, 'coherence': 0.05, 'n_qubits': 2
        })
        integration.check_and_repair("cb_test")
        assert "cb_test" in callback_log

    def test_protection_status(self):
        integration = PCRBOrganismIntegration()
        integration.register_organism("org1", {'fidelity': 0.9, 'coherence': 0.8})
        status = integration.get_protection_status()
        assert status['protected_organisms'] == 1
        assert 'org1' in status['organisms']
