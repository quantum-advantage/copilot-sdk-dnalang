"""
Tests for Quantinuum H-Series Trapped-Ion Adapter.

Tests cover:
  - Physical constants integrity
  - Native gate circuit generation
  - Syndrome generation and noisy rounds
  - Correlated merge (majority vote)
  - Full decode pipeline
  - Result metrics (phi, gamma, ccce)
  - CLI argument parsing
"""

import sys
import os
import json
import math
import pytest
import numpy as np

sys.path.insert(0, os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..')
))

from quantinuum_adapter import (  # noqa: E402
    QuantinuumAdapter,
    QuantinuumResult,
    NativeCircuit,
    GateOp,
    IonGate,
    LAMBDA_PHI_M,
    THETA_LOCK_DEG,
    PHI_THRESHOLD,
    GAMMA_CRITICAL,
    CHI_PC_QUALITY,
)

SEED = 51843


# ─── Physical Constants ─────────────────────────────────────────────


class TestConstants:
    def test_lambda_phi(self):
        assert LAMBDA_PHI_M == pytest.approx(2.176435e-8, rel=1e-9)

    def test_theta_lock(self):
        assert THETA_LOCK_DEG == pytest.approx(51.843, abs=1e-6)

    def test_phi_threshold(self):
        assert PHI_THRESHOLD == pytest.approx(0.7734, abs=1e-6)

    def test_gamma_critical(self):
        assert GAMMA_CRITICAL == pytest.approx(0.3, abs=1e-6)


# ─── Native Circuit ─────────────────────────────────────────────────


class TestNativeCircuit:
    def test_create_empty(self):
        circ = NativeCircuit(n_qubits=10)
        assert circ.n_qubits == 10
        assert circ.depth == 0
        assert circ.two_qubit_count == 0

    def test_add_gates(self):
        circ = NativeCircuit(n_qubits=4)
        circ.add_rz(0, math.pi / 2)
        circ.add_u1q(1, math.pi, 0.0)
        circ.add_zz(0, 1, math.pi / 4)
        circ.add_measure(0)
        assert circ.depth == 4
        assert circ.two_qubit_count == 1

    def test_to_dict(self):
        circ = NativeCircuit(n_qubits=2)
        circ.add_rz(0, 1.0)
        circ.add_zz(0, 1, 0.5)
        d = circ.to_dict()
        assert d["n_qubits"] == 2
        assert d["depth"] == 2
        assert d["two_qubit_gates"] == 1
        assert len(d["ops"]) == 2


class TestGateOp:
    def test_to_dict(self):
        op = GateOp(IonGate.ZZ, (0, 1), (math.pi / 4,))
        d = op.to_dict()
        assert d["gate"] == "ZZ"
        assert d["qubits"] == [0, 1]


# ─── Adapter Creation ───────────────────────────────────────────────


class TestAdapterCreation:
    def test_default_init(self):
        adapter = QuantinuumAdapter(seed=SEED)
        assert adapter.n_qubits == 56
        assert adapter.rounds == 3
        assert len(adapter.error_map) == 56

    def test_custom_init(self):
        adapter = QuantinuumAdapter(n_qubits=20, rounds=5, seed=SEED)
        assert adapter.n_qubits == 20
        assert adapter.rounds == 5

    def test_error_map_ring_topology(self):
        adapter = QuantinuumAdapter(n_qubits=10, seed=SEED)
        # Each error touches exactly 2 detectors
        for e, detectors in adapter.error_map.items():
            assert len(detectors) == 2
        # Last error wraps around
        assert 0 in adapter.error_map[9]

    def test_repr(self):
        adapter = QuantinuumAdapter(seed=SEED)
        assert "QuantinuumAdapter" in repr(adapter)


# ─── Syndrome Generation ────────────────────────────────────────────


class TestSyndromeGeneration:
    def test_generates_correct_rounds(self):
        adapter = QuantinuumAdapter(n_qubits=20, rounds=3, seed=SEED)
        syndromes = adapter.generate_round_syndromes()
        assert len(syndromes) == 3
        assert all(isinstance(s, frozenset) for s in syndromes)

    def test_syndromes_have_detectors(self):
        adapter = QuantinuumAdapter(n_qubits=20, rounds=1, seed=SEED)
        syndromes = adapter.generate_round_syndromes()
        assert len(syndromes[0]) > 0

    def test_deterministic(self):
        s1 = QuantinuumAdapter(n_qubits=20, rounds=3, seed=SEED).generate_round_syndromes()
        s2 = QuantinuumAdapter(n_qubits=20, rounds=3, seed=SEED).generate_round_syndromes()
        assert s1 == s2


# ─── Correlated Merge ───────────────────────────────────────────────


class TestCorrelatedMerge:
    def test_merge_unanimous(self):
        adapter = QuantinuumAdapter(n_qubits=10, seed=SEED)
        syndromes = [frozenset({1, 3, 5})] * 3
        merged = adapter.correlated_merge(syndromes)
        assert merged == frozenset({1, 3, 5})

    def test_merge_majority_vote(self):
        adapter = QuantinuumAdapter(n_qubits=10, seed=SEED)
        syndromes = [
            frozenset({1, 3}),
            frozenset({1, 3, 7}),
            frozenset({1, 3}),
        ]
        merged = adapter.correlated_merge(syndromes)
        assert 1 in merged
        assert 3 in merged
        # 7 appears only once out of 3, should be excluded
        assert 7 not in merged

    def test_merge_empty_all(self):
        adapter = QuantinuumAdapter(n_qubits=10, seed=SEED)
        syndromes = [frozenset()] * 3
        merged = adapter.correlated_merge(syndromes)
        assert merged == frozenset()


# ─── Decode ──────────────────────────────────────────────────────────


class TestDecode:
    def test_decode_empty_syndrome(self):
        adapter = QuantinuumAdapter(n_qubits=10, seed=SEED)
        correction, residual = adapter.decode_merged(frozenset())
        assert len(correction) == 0
        assert len(residual) == 0


# ─── Full Pipeline ──────────────────────────────────────────────────


class TestFullPipeline:
    def test_run_dry_run(self):
        adapter = QuantinuumAdapter(n_qubits=20, rounds=3, seed=SEED)
        result = adapter.run(dry_run=True)
        assert isinstance(result, QuantinuumResult)
        assert result.n_qubits == 20
        assert result.rounds == 3
        assert result.elapsed_s > 0

    def test_result_has_metrics(self):
        adapter = QuantinuumAdapter(n_qubits=20, rounds=3, seed=SEED)
        result = adapter.run()
        assert 0.0 <= result.phi <= 1.0
        assert 0.0 <= result.gamma <= 1.0
        assert result.ccce >= 0.0

    def test_result_has_circuit(self):
        adapter = QuantinuumAdapter(n_qubits=10, rounds=2, seed=SEED)
        result = adapter.run()
        assert result.circuit is not None
        assert result.circuit.depth > 0

    def test_result_to_dict(self):
        adapter = QuantinuumAdapter(n_qubits=10, rounds=2, seed=SEED)
        result = adapter.run()
        d = result.to_dict()
        assert "success" in d
        assert "phi" in d
        assert "gamma" in d
        assert "ccce" in d
        assert "above_threshold" in d
        assert "is_coherent" in d

    def test_result_threshold_methods(self):
        r = QuantinuumResult(phi=0.9, gamma=0.1)
        assert r.above_threshold() is True
        assert r.is_coherent() is True

        r2 = QuantinuumResult(phi=0.5, gamma=0.5)
        assert r2.above_threshold() is False
        assert r2.is_coherent() is False


class TestBuildCircuit:
    def test_syndrome_circuit(self):
        adapter = QuantinuumAdapter(n_qubits=10, rounds=2, seed=SEED)
        circ = adapter.build_syndrome_circuit()
        assert circ.n_qubits == 10
        assert circ.depth > 0
        assert circ.two_qubit_count > 0
        assert circ.metadata["type"] == "syndrome_extraction"


# ─── Determinism ─────────────────────────────────────────────────────


class TestDeterminism:
    def test_same_seed_same_result(self):
        r1 = QuantinuumAdapter(n_qubits=20, rounds=3, seed=SEED).run()
        r2 = QuantinuumAdapter(n_qubits=20, rounds=3, seed=SEED).run()
        assert r1.merged_syndrome == r2.merged_syndrome
        assert r1.correction == r2.correction
        assert r1.phi == r2.phi
