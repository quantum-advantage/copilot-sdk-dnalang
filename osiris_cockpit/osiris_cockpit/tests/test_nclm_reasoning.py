"""
Tests for NCLMReasoning — Non-Classical Logic Model.

Tests cover:
  - Hypothesis management
  - Amplitude operations (amplify, interfere, phase_shift)
  - Entanglement creation and propagation
  - Evidence and truth value system
  - Measurement (inference)
  - Normalization
  - Serialization
"""

import sys
import os
import math
import pytest
import numpy as np

sys.path.insert(0, os.path.join(
    os.path.expanduser("~"),
    "dnalang-sovereign-copilot-sdk/python/src"
))

from copilot_quantum.nclm import (
    NCLMReasoning,
    TruthValue,
    Hypothesis,
    EntanglementPair,
    InferenceResult,
    LAMBDA_PHI,
    PHI_THRESHOLD,
)

SEED = 51843


# ─── TruthValue Tests ───────────────────────────────────────────────


class TestTruthValue:
    def test_negate_true(self):
        assert TruthValue.TRUE.negate() == TruthValue.FALSE

    def test_negate_false(self):
        assert TruthValue.FALSE.negate() == TruthValue.TRUE

    def test_negate_both(self):
        assert TruthValue.BOTH.negate() == TruthValue.BOTH

    def test_negate_neither(self):
        assert TruthValue.NEITHER.negate() == TruthValue.NEITHER

    def test_conjunction(self):
        assert TruthValue.TRUE.conjunction(TruthValue.FALSE) == TruthValue.FALSE
        assert TruthValue.TRUE.conjunction(TruthValue.TRUE) == TruthValue.TRUE

    def test_disjunction(self):
        assert TruthValue.FALSE.disjunction(TruthValue.TRUE) == TruthValue.TRUE
        assert TruthValue.FALSE.disjunction(TruthValue.FALSE) == TruthValue.FALSE

    def test_is_definite(self):
        assert TruthValue.TRUE.is_definite is True
        assert TruthValue.FALSE.is_definite is True
        assert TruthValue.BOTH.is_definite is False
        assert TruthValue.NEITHER.is_definite is False


# ─── Hypothesis Tests ───────────────────────────────────────────────


class TestHypothesis:
    def test_probability(self):
        h = Hypothesis(label="test", amplitude=0.5 + 0.5j)
        assert h.probability == pytest.approx(0.5, abs=0.01)

    def test_to_dict(self):
        h = Hypothesis(label="test", amplitude=1.0 + 0j)
        d = h.to_dict()
        assert d["label"] == "test"
        assert "probability" in d
        assert d["probability"] == pytest.approx(1.0)


# ─── NCLMReasoning Core Tests ───────────────────────────────────────


class TestNCLMHypothesisManagement:
    def test_add_hypothesis(self):
        nclm = NCLMReasoning(seed=SEED)
        h = nclm.add_hypothesis("gravity", amplitude=0.8 + 0.2j)
        assert "gravity" in nclm.hypotheses
        assert h.label == "gravity"

    def test_remove_hypothesis(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("h1")
        nclm.remove_hypothesis("h1")
        assert "h1" not in nclm.hypotheses

    def test_remove_clears_entanglements(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a")
        nclm.add_hypothesis("b")
        nclm.entangle("a", "b")
        nclm.remove_hypothesis("a")
        assert len(nclm.entanglements) == 0

    def test_multiple_hypotheses(self):
        nclm = NCLMReasoning(seed=SEED)
        for i in range(5):
            nclm.add_hypothesis(f"h{i}")
        assert len(nclm.hypotheses) == 5


class TestNCLMAmplitudeOps:
    def test_amplify(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("h", amplitude=0.5 + 0j)
        nclm.amplify("h", factor=2.0)
        assert nclm.hypotheses["h"].probability == pytest.approx(1.0)

    def test_amplify_missing_raises(self):
        nclm = NCLMReasoning(seed=SEED)
        with pytest.raises(KeyError):
            nclm.amplify("nonexistent")

    def test_phase_shift(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("h", amplitude=1.0 + 0j)
        nclm.phase_shift("h", math.pi / 2)
        h = nclm.hypotheses["h"]
        assert abs(h.amplitude.imag) > 0.9

    def test_interfere(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a", amplitude=1.0 + 0j)
        nclm.add_hypothesis("b", amplitude=1.0 + 0j)
        nclm.interfere("a", "b")
        # After interference, amplitudes change
        assert nclm.hypotheses["a"].probability > 0


class TestNCLMEntanglement:
    def test_entangle(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a")
        nclm.add_hypothesis("b")
        pair = nclm.entangle("a", "b", correlation=0.9)
        assert isinstance(pair, EntanglementPair)
        assert pair.correlation == pytest.approx(0.9)
        assert len(nclm.entanglements) == 1

    def test_entangle_missing_raises(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a")
        with pytest.raises(KeyError):
            nclm.entangle("a", "missing")

    def test_anticorrelation(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a")
        nclm.add_hypothesis("b")
        pair = nclm.entangle("a", "b", correlation=-0.8)
        assert pair.correlation == pytest.approx(-0.8)

    def test_entanglement_to_dict(self):
        pair = EntanglementPair(h1_label="a", h2_label="b", correlation=0.5)
        d = pair.to_dict()
        assert d["h1"] == "a"
        assert d["correlation"] == 0.5


class TestNCLMEvidence:
    def test_positive_evidence(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("h", truth=TruthValue.NEITHER)
        nclm.add_evidence("h", "observation", True)
        assert nclm.hypotheses["h"].truth == TruthValue.TRUE

    def test_negative_evidence(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("h", truth=TruthValue.NEITHER)
        nclm.add_evidence("h", "observation", False)
        assert nclm.hypotheses["h"].truth == TruthValue.FALSE

    def test_conflicting_evidence_becomes_both(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("h", truth=TruthValue.TRUE)
        nclm.add_evidence("h", "counter", False)
        assert nclm.hypotheses["h"].truth == TruthValue.BOTH

    def test_set_truth(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("h")
        nclm.set_truth("h", TruthValue.BOTH)
        assert nclm.hypotheses["h"].truth == TruthValue.BOTH


class TestNCLMNormalization:
    def test_normalize(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a", amplitude=3.0 + 0j)
        nclm.add_hypothesis("b", amplitude=4.0 + 0j)
        nclm.normalize()
        probs = nclm.probabilities()
        total = sum(probs.values())
        assert total == pytest.approx(1.0, abs=0.01)

    def test_probabilities_sum_to_one(self):
        nclm = NCLMReasoning(seed=SEED)
        for i in range(5):
            nclm.add_hypothesis(f"h{i}", amplitude=complex(i + 1, 0))
        probs = nclm.probabilities()
        assert sum(probs.values()) == pytest.approx(1.0, abs=0.001)


class TestNCLMMeasurement:
    def test_measure_returns_result(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a", amplitude=0.9 + 0j)
        nclm.add_hypothesis("b", amplitude=0.1 + 0j)
        result = nclm.measure()
        assert isinstance(result, InferenceResult)
        assert result.conclusion in ("a", "b")
        assert result.confidence > 0

    def test_measure_empty(self):
        nclm = NCLMReasoning(seed=SEED)
        result = nclm.measure()
        assert result.conclusion == ""
        assert result.confidence == 0.0

    def test_measure_sets_collapsed(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("x")
        assert not nclm.is_collapsed
        nclm.measure()
        assert nclm.is_collapsed

    def test_measure_has_alternatives(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a", amplitude=0.7 + 0j)
        nclm.add_hypothesis("b", amplitude=0.3 + 0j)
        result = nclm.measure()
        assert len(result.alternatives) == 2

    def test_measure_phi(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a", amplitude=0.5 + 0j)
        nclm.add_hypothesis("b", amplitude=0.5 + 0j)
        result = nclm.measure()
        assert result.phi > 0  # Equal superposition has maximum entropy

    def test_measure_deterministic(self):
        results = []
        for _ in range(5):
            nclm = NCLMReasoning(seed=SEED)
            nclm.add_hypothesis("a", amplitude=0.9 + 0j)
            nclm.add_hypothesis("b", amplitude=0.1 + 0j)
            results.append(nclm.measure().conclusion)
        # Same seed should give same result
        assert len(set(results)) == 1

    def test_entanglement_propagation_on_measure(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a", amplitude=0.9 + 0j, truth=TruthValue.TRUE)
        nclm.add_hypothesis("b", amplitude=0.1 + 0j, truth=TruthValue.NEITHER)
        nclm.entangle("a", "b", correlation=1.0)
        result = nclm.measure()
        # If 'a' is measured, 'b' should get correlated truth
        if result.conclusion == "a":
            assert nclm.hypotheses["b"].truth == TruthValue.TRUE

    def test_inference_result_to_dict(self):
        result = InferenceResult(
            conclusion="test",
            confidence=0.95,
            truth=TruthValue.TRUE,
            phi=0.8,
        )
        d = result.to_dict()
        assert d["conclusion"] == "test"
        assert d["truth"] == "true"


class TestNCLMUtility:
    def test_reset(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a")
        nclm.add_hypothesis("b")
        nclm.entangle("a", "b")
        nclm.reset()
        assert len(nclm.hypotheses) == 0
        assert len(nclm.entanglements) == 0
        assert not nclm.is_collapsed

    def test_state_vector(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a", amplitude=0.7 + 0.3j)
        sv = nclm.state_vector()
        assert "a" in sv
        assert sv["a"] == 0.7 + 0.3j

    def test_to_dict(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a")
        d = nclm.to_dict()
        assert "hypotheses" in d
        assert "entanglements" in d
        assert "reasoning_chain" in d

    def test_repr(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a")
        assert "NCLMReasoning" in repr(nclm)

    def test_reasoning_chain_tracking(self):
        nclm = NCLMReasoning(seed=SEED)
        nclm.add_hypothesis("a")
        nclm.amplify("a", 2.0)
        nclm.measure()
        assert len(nclm.reasoning_chain) >= 3
        assert any("ADD" in step for step in nclm.reasoning_chain)
        assert any("AMPLIFY" in step for step in nclm.reasoning_chain)
        assert any("MEASURE" in step for step in nclm.reasoning_chain)
