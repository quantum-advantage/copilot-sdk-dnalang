"""Tests for consciousness.py and lambda_phi.py modules."""

import pytest

from dnalang_sdk.config import ConsciousnessConfig, LambdaPhiConfig
from dnalang_sdk.consciousness import CCCEResult, ConsciousnessAnalyzer
from dnalang_sdk.lambda_phi import ConservationResult, LambdaPhiValidator


# ═══════════════════════════════════════════════════════════════════════════════
# CCCEResult Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestCCCEResult:
    """Tests for CCCEResult dataclass."""

    def test_creation(self):
        result = CCCEResult(
            ccce_values=[0.9, 0.8, 0.7],
            qubit_sizes=[2, 4, 8],
            exponent=-0.15,
            exponent_error=0.02,
            coherence_time_ms=50.0,
            r_squared=0.98,
        )
        assert result.ccce_values == [0.9, 0.8, 0.7]
        assert result.qubit_sizes == [2, 4, 8]
        assert result.exponent == -0.15
        assert result.exponent_error == 0.02
        assert result.coherence_time_ms == 50.0
        assert result.r_squared == 0.98
        assert result.metadata == {}

    def test_creation_with_metadata(self):
        result = CCCEResult(
            ccce_values=[0.5],
            qubit_sizes=[2],
            exponent=-0.1,
            exponent_error=0.01,
            coherence_time_ms=100.0,
            r_squared=0.95,
            metadata={"samples_per_size": 50},
        )
        assert result.metadata == {"samples_per_size": 50}

    def test_str_representation(self):
        result = CCCEResult(
            ccce_values=[0.9, 0.7],
            qubit_sizes=[2, 8],
            exponent=-0.15,
            exponent_error=0.02,
            coherence_time_ms=50.0,
            r_squared=0.98,
        )
        s = str(result)
        assert "Consciousness Scaling Result" in s
        assert "Scaling Exponent" in s
        assert "Coherence Time" in s
        assert "R²" in s
        assert "Qubit Range" in s

    def test_field_access(self):
        result = CCCEResult(
            ccce_values=[0.8, 0.6, 0.4],
            qubit_sizes=[2, 4, 8],
            exponent=-0.3,
            exponent_error=0.05,
            coherence_time_ms=75.0,
            r_squared=0.92,
        )
        assert len(result.ccce_values) == 3
        assert len(result.qubit_sizes) == 3
        assert isinstance(result.exponent, float)
        assert isinstance(result.r_squared, float)


# ═══════════════════════════════════════════════════════════════════════════════
# ConservationResult Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestConservationResult:
    """Tests for ConservationResult dataclass."""

    def test_creation(self):
        result = ConservationResult(
            conservation_ratio=0.97,
            p_value=0.01,
            conserved=True,
            operator="Z",
            num_trials=100,
            mean_expectation=0.97,
            std_expectation=0.02,
        )
        assert result.conservation_ratio == 0.97
        assert result.p_value == 0.01
        assert result.conserved is True
        assert result.operator == "Z"
        assert result.num_trials == 100
        assert result.mean_expectation == 0.97
        assert result.std_expectation == 0.02
        assert result.metadata == {}

    def test_creation_not_conserved(self):
        result = ConservationResult(
            conservation_ratio=0.5,
            p_value=0.2,
            conserved=False,
            operator="X",
            num_trials=50,
            mean_expectation=0.5,
            std_expectation=0.15,
        )
        assert result.conserved is False
        assert result.operator == "X"

    def test_with_metadata(self):
        result = ConservationResult(
            conservation_ratio=0.96,
            p_value=0.03,
            conserved=True,
            operator="Z",
            num_trials=200,
            mean_expectation=0.96,
            std_expectation=0.01,
            metadata={"threshold": 0.95, "expectation_values": [0.95, 0.97]},
        )
        assert result.metadata["threshold"] == 0.95
        assert len(result.metadata["expectation_values"]) == 2

    def test_str_representation(self):
        result = ConservationResult(
            conservation_ratio=0.97,
            p_value=0.01,
            conserved=True,
            operator="Z",
            num_trials=100,
            mean_expectation=0.97,
            std_expectation=0.02,
        )
        s = str(result)
        assert "CONSERVED" in s
        assert "Operator: Z" in s
        assert "Conservation Ratio" in s
        assert "P-value" in s
        assert "Trials: 100" in s

    def test_str_not_conserved(self):
        result = ConservationResult(
            conservation_ratio=0.4,
            p_value=0.5,
            conserved=False,
            operator="Y",
            num_trials=50,
            mean_expectation=0.4,
            std_expectation=0.2,
        )
        s = str(result)
        assert "NOT CONSERVED" in s


# ═══════════════════════════════════════════════════════════════════════════════
# ConsciousnessAnalyzer Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestConsciousnessAnalyzer:
    """Tests for ConsciousnessAnalyzer instantiation."""

    def test_creation_with_config(self):
        config = ConsciousnessConfig()
        analyzer = ConsciousnessAnalyzer(config=config)
        assert analyzer.config is config
        assert analyzer.quantum_backend is None

    def test_creation_with_custom_config(self):
        config = ConsciousnessConfig(
            qubit_range=[2, 4],
            samples_per_size=10,
            coherence_threshold=0.9,
        )
        analyzer = ConsciousnessAnalyzer(config=config)
        assert analyzer.config.qubit_range == [2, 4]
        assert analyzer.config.samples_per_size == 10

    def test_temporal_coherence_disabled(self):
        config = ConsciousnessConfig(enable_temporal_analysis=False)
        analyzer = ConsciousnessAnalyzer(config=config)
        from dnalang_sdk.quantum import QuantumCircuit
        circuit = QuantumCircuit(num_qubits=2)
        result = analyzer.analyze_temporal_coherence(circuit, [0.1, 0.2])
        assert "error" in result

    def test_temporal_coherence_enabled(self):
        config = ConsciousnessConfig(enable_temporal_analysis=True)
        analyzer = ConsciousnessAnalyzer(config=config)
        from dnalang_sdk.quantum import QuantumCircuit
        circuit = QuantumCircuit(num_qubits=2)
        result = analyzer.analyze_temporal_coherence(circuit, [0.1, 0.5, 1.0])
        assert "time_steps" in result
        assert "coherence" in result
        assert "decay_rate" in result
        assert len(result["coherence"]) == 3


# ═══════════════════════════════════════════════════════════════════════════════
# LambdaPhiValidator Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestLambdaPhiValidator:
    """Tests for LambdaPhiValidator instantiation."""

    def test_creation_with_config(self):
        config = LambdaPhiConfig()
        validator = LambdaPhiValidator(config=config)
        assert validator.config is config
        assert validator.quantum_backend is None

    def test_creation_with_custom_config(self):
        config = LambdaPhiConfig(
            num_trials=50,
            conservation_threshold=0.99,
        )
        validator = LambdaPhiValidator(config=config)
        assert validator.config.num_trials == 50
        assert validator.config.conservation_threshold == 0.99

    def test_prepare_operator_observable_z(self):
        import numpy as np
        config = LambdaPhiConfig()
        validator = LambdaPhiValidator(config=config)
        obs = validator._prepare_operator_observable("Z", 1)
        expected = np.array([[1, 0], [0, -1]])
        np.testing.assert_array_equal(obs, expected)

    def test_prepare_operator_observable_x(self):
        import numpy as np
        config = LambdaPhiConfig()
        validator = LambdaPhiValidator(config=config)
        obs = validator._prepare_operator_observable("X", 1)
        expected = np.array([[0, 1], [1, 0]])
        np.testing.assert_array_equal(obs, expected)

    def test_prepare_operator_observable_invalid(self):
        config = LambdaPhiConfig()
        validator = LambdaPhiValidator(config=config)
        with pytest.raises(ValueError, match="Unsupported operator"):
            validator._prepare_operator_observable("Q", 1)

    def test_compute_expectation_from_counts(self):
        config = LambdaPhiConfig()
        validator = LambdaPhiValidator(config=config)
        import numpy as np
        obs = np.array([[1, 0], [0, -1]])  # Z operator
        # All |0⟩ → expectation = +1
        exp = validator._compute_expectation_from_counts({"0": 1000}, obs, 1)
        assert exp == 1.0
        # All |1⟩ → expectation = -1
        exp = validator._compute_expectation_from_counts({"1": 1000}, obs, 1)
        assert exp == -1.0
        # 50/50 → expectation ≈ 0
        exp = validator._compute_expectation_from_counts({"0": 500, "1": 500}, obs, 1)
        assert abs(exp) < 1e-9
