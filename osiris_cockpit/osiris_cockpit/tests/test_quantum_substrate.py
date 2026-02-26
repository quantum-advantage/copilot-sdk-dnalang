"""
Tests for Quantum Substrate Pipeline

Validates:
- Individual stages (preprocess, correct, repair)
- Full pipeline flow
- Pipeline result serialization
- Integration between all three modules
"""
import sys
import os
import math
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from qiskit.circuit import QuantumCircuit

from quantum_substrate import (
    QuantumSubstratePipeline,
    SubstrateResult,
    CorrectionResult,
    PipelineResult,
)


# ═══════════════════════════════════════════════════════════════════════════════
# PREPROCESS STAGE
# ═══════════════════════════════════════════════════════════════════════════════

class TestPreprocess:
    def test_returns_substrate_result(self):
        pipeline = QuantumSubstratePipeline()
        result = pipeline.preprocess(phi=0.85, gamma=0.12)
        assert isinstance(result, SubstrateResult)

    def test_embedding_is_3d(self):
        pipeline = QuantumSubstratePipeline()
        result = pipeline.preprocess(phi=0.8, gamma=0.1)
        assert len(result.embedding) == 3

    def test_bridge_ratio_near_unity(self):
        pipeline = QuantumSubstratePipeline()
        result = pipeline.preprocess(phi=0.8, gamma=0.1)
        assert result.bridge_ratio == pytest.approx(1.0, abs=0.01)

    def test_to_dict(self):
        pipeline = QuantumSubstratePipeline()
        result = pipeline.preprocess(phi=0.8, gamma=0.1)
        d = result.to_dict()
        assert 'embedding' in d
        assert 'bridge_ratio' in d
        assert d['phi'] == 0.8
        assert d['gamma'] == 0.1


# ═══════════════════════════════════════════════════════════════════════════════
# CORRECT STAGE
# ═══════════════════════════════════════════════════════════════════════════════

class TestCorrect:
    def test_returns_correction_result(self):
        pipeline = QuantumSubstratePipeline()
        qc = QuantumCircuit(3)
        qc.h(0)
        qc.cx(0, 1)
        qc.cx(1, 2)
        result = pipeline.correct(qc)
        assert isinstance(result, CorrectionResult)

    def test_cx_count_preserved(self):
        pipeline = QuantumSubstratePipeline()
        qc = QuantumCircuit(4)
        for i in range(3):
            qc.cx(i, i + 1)
        result = pipeline.correct(qc)
        assert result.original_cx_count == 3
        corrected_ops = result.circuit.count_ops()
        assert corrected_ops['cx'] == 3

    def test_rz_gates_added(self):
        pipeline = QuantumSubstratePipeline()
        qc = QuantumCircuit(3)
        qc.cx(0, 1)
        qc.cx(1, 2)
        result = pipeline.correct(qc)
        assert result.rz_gates_added == 4  # 2 CX × 2 RZ each

    def test_to_dict(self):
        pipeline = QuantumSubstratePipeline()
        qc = QuantumCircuit(2)
        qc.cx(0, 1)
        result = pipeline.correct(qc)
        d = result.to_dict()
        assert d['corrections_applied'] == 1
        assert 'delta_rad' in d
        assert 'chi_pc' in d


# ═══════════════════════════════════════════════════════════════════════════════
# REPAIR STAGE
# ═══════════════════════════════════════════════════════════════════════════════

class TestRepair:
    def test_good_state_no_repair(self):
        pipeline = QuantumSubstratePipeline()
        record = pipeline.repair(fidelity=0.95, coherence=0.9)
        assert record is not None

    def test_degraded_state_triggers_repair(self):
        pipeline = QuantumSubstratePipeline()
        record = pipeline.repair(fidelity=0.4, coherence=0.1)
        assert record['initial_state']['fidelity'] == 0.4

    def test_repair_target_configurable(self):
        pipeline = QuantumSubstratePipeline(repair_target=0.99)
        assert pipeline.repair_target == 0.99


# ═══════════════════════════════════════════════════════════════════════════════
# FULL PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════

class TestFullPipeline:
    def test_process_returns_pipeline_result(self):
        pipeline = QuantumSubstratePipeline()
        qc = QuantumCircuit(4)
        qc.h(0)
        for i in range(3):
            qc.cx(i, i + 1)
        result = pipeline.process(qc, phi=0.8, gamma=0.15)
        assert isinstance(result, PipelineResult)

    def test_process_circuit_is_corrected(self):
        pipeline = QuantumSubstratePipeline()
        qc = QuantumCircuit(3)
        qc.h(0)
        qc.cx(0, 1)
        qc.cx(1, 2)
        result = pipeline.process(qc)
        ops = result.circuit.count_ops()
        assert ops.get('rz', 0) == 4

    def test_process_all_stages_present(self):
        pipeline = QuantumSubstratePipeline()
        qc = QuantumCircuit(2)
        qc.cx(0, 1)
        result = pipeline.process(qc, phi=0.7, gamma=0.2)
        assert result.substrate is not None
        assert result.correction is not None
        assert result.pcrb is not None

    def test_process_timing(self):
        pipeline = QuantumSubstratePipeline()
        qc = QuantumCircuit(2)
        qc.cx(0, 1)
        result = pipeline.process(qc)
        assert result.total_time_s > 0
        assert result.total_time_s < 5  # Should be fast

    def test_to_dict(self):
        pipeline = QuantumSubstratePipeline()
        qc = QuantumCircuit(2)
        qc.cx(0, 1)
        result = pipeline.process(qc)
        d = result.to_dict()
        assert 'substrate' in d
        assert 'correction' in d
        assert 'pcrb' in d
        assert 'total_time_s' in d


# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class TestPipelineConfigs:
    def test_steane_config(self):
        pipeline = QuantumSubstratePipeline(pcrb_config='steane')
        assert pipeline.pcrb.stabilizer_code.n == 7

    def test_surface_code_config(self):
        pipeline = QuantumSubstratePipeline(pcrb_config='surface_3')
        assert pipeline.pcrb.stabilizer_code.d == 3

    def test_high_fidelity_config(self):
        pipeline = QuantumSubstratePipeline(pcrb_config='high_fidelity')
        assert pipeline.pcrb.recursion_bus.max_iterations == 20

    def test_custom_delta(self):
        pipeline = QuantumSubstratePipeline(correction_delta=0.1)
        assert pipeline.correction_pass.delta == 0.1

    def test_custom_chi_pc(self):
        pipeline = QuantumSubstratePipeline(correction_chi_pc=0.9)
        assert pipeline.correction_pass.chi_pc == 0.9
