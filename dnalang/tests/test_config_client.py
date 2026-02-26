"""Tests for config.py and client.py modules."""

import pytest
import asyncio

from dnalang_sdk.config import QuantumConfig, LambdaPhiConfig, ConsciousnessConfig
from dnalang_sdk.client import DNALangCopilotClient, CopilotConfig
from dnalang_sdk.quantum import QuantumCircuit
from dnalang_sdk.lambda_phi import LambdaPhiValidator
from dnalang_sdk.consciousness import ConsciousnessAnalyzer


# ═══════════════════════════════════════════════════════════════════════════════
# QuantumConfig Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestQuantumConfig:
    """Tests for QuantumConfig dataclass."""

    def test_defaults(self):
        cfg = QuantumConfig()
        assert cfg.backend == "aer_simulator"
        assert cfg.default_backend == "aer_simulator"
        assert cfg.api_token is None
        assert cfg.api_token_env == "IBM_QUANTUM_TOKEN"
        assert cfg.optimization_level == 3
        assert cfg.shots == 1024
        assert cfg.max_qubits == 127
        assert cfg.timeout == 300

    def test_custom_values(self):
        cfg = QuantumConfig(
            backend="ibm_fez",
            default_backend="ibm_fez",
            api_token="token_abc",
            optimization_level=1,
            shots=4096,
            max_qubits=256,
            timeout=600,
        )
        assert cfg.backend == "ibm_fez"
        assert cfg.api_token == "token_abc"
        assert cfg.optimization_level == 1
        assert cfg.shots == 4096
        assert cfg.max_qubits == 256
        assert cfg.timeout == 600


# ═══════════════════════════════════════════════════════════════════════════════
# LambdaPhiConfig Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestLambdaPhiConfig:
    """Tests for LambdaPhiConfig dataclass."""

    def test_defaults(self):
        cfg = LambdaPhiConfig()
        assert cfg.num_trials == 100
        assert cfg.significance_level == 0.05
        assert cfg.operators == ["X", "Y", "Z", "H"]
        assert cfg.conservation_threshold == 0.95
        assert cfg.enable_statistical_tests is True

    def test_custom_values(self):
        cfg = LambdaPhiConfig(
            num_trials=50,
            significance_level=0.01,
            operators=["X", "Z"],
            conservation_threshold=0.99,
            enable_statistical_tests=False,
        )
        assert cfg.num_trials == 50
        assert cfg.significance_level == 0.01
        assert cfg.operators == ["X", "Z"]
        assert cfg.conservation_threshold == 0.99
        assert cfg.enable_statistical_tests is False

    def test_operators_list_independence(self):
        """Ensure default list is not shared between instances."""
        cfg1 = LambdaPhiConfig()
        cfg2 = LambdaPhiConfig()
        cfg1.operators.append("I")
        assert "I" not in cfg2.operators


# ═══════════════════════════════════════════════════════════════════════════════
# ConsciousnessConfig Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestConsciousnessConfig:
    """Tests for ConsciousnessConfig dataclass."""

    def test_defaults(self):
        cfg = ConsciousnessConfig()
        assert cfg.qubit_range == [2, 4, 8, 16, 32]
        assert cfg.samples_per_size == 50
        assert cfg.coherence_threshold == 0.7
        assert cfg.enable_temporal_analysis is True
        assert cfg.ccce_measurement_shots == 1024

    def test_custom_values(self):
        cfg = ConsciousnessConfig(
            qubit_range=[2, 4],
            samples_per_size=10,
            coherence_threshold=0.9,
            enable_temporal_analysis=False,
            ccce_measurement_shots=2048,
        )
        assert cfg.qubit_range == [2, 4]
        assert cfg.samples_per_size == 10
        assert cfg.coherence_threshold == 0.9
        assert cfg.enable_temporal_analysis is False
        assert cfg.ccce_measurement_shots == 2048

    def test_qubit_range_independence(self):
        cfg1 = ConsciousnessConfig()
        cfg2 = ConsciousnessConfig()
        cfg1.qubit_range.append(64)
        assert 64 not in cfg2.qubit_range


# ═══════════════════════════════════════════════════════════════════════════════
# CopilotConfig Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestCopilotConfig:
    """Tests for CopilotConfig dataclass."""

    def test_defaults(self):
        cfg = CopilotConfig()
        assert cfg.cli_path == "copilot"
        assert cfg.server_mode is True
        assert cfg.allow_all_tools is True
        assert cfg.port is None
        assert cfg.timeout == 300
        assert cfg.model == "claude-sonnet-4.5"
        assert cfg.use_nclm is False

    def test_custom_values(self):
        cfg = CopilotConfig(
            cli_path="/usr/bin/copilot",
            server_mode=False,
            port=8080,
            timeout=60,
            use_nclm=True,
        )
        assert cfg.cli_path == "/usr/bin/copilot"
        assert cfg.server_mode is False
        assert cfg.port == 8080
        assert cfg.timeout == 60
        assert cfg.use_nclm is True


# ═══════════════════════════════════════════════════════════════════════════════
# DNALangCopilotClient Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestDNALangCopilotClient:
    """Tests for DNALangCopilotClient."""

    def test_creation_defaults(self):
        client = DNALangCopilotClient()
        assert client.quantum_config is not None
        assert client.lambda_phi_config is not None
        assert client.consciousness_config is not None
        assert client.copilot_config is not None
        assert isinstance(client.quantum_config, QuantumConfig)
        assert isinstance(client.lambda_phi_config, LambdaPhiConfig)
        assert isinstance(client.consciousness_config, ConsciousnessConfig)

    def test_creation_custom_configs(self):
        qcfg = QuantumConfig(shots=2048)
        lcfg = LambdaPhiConfig(num_trials=200)
        ccfg = ConsciousnessConfig(samples_per_size=25)
        client = DNALangCopilotClient(
            quantum_config=qcfg,
            lambda_phi_config=lcfg,
            consciousness_config=ccfg,
        )
        assert client.quantum_config.shots == 2048
        assert client.lambda_phi_config.num_trials == 200
        assert client.consciousness_config.samples_per_size == 25

    def test_create_quantum_circuit(self):
        client = DNALangCopilotClient()
        circuit = client.create_quantum_circuit(num_qubits=3)
        assert isinstance(circuit, QuantumCircuit)
        assert circuit.num_qubits == 3
        assert circuit.gates == []

    def test_create_quantum_circuit_with_name(self):
        client = DNALangCopilotClient()
        circuit = client.create_quantum_circuit(num_qubits=2, name="bell")
        assert circuit.name == "bell"

    def test_create_quantum_circuit_with_gates(self):
        client = DNALangCopilotClient()
        gates = [{"type": "h", "target": 0}]
        circuit = client.create_quantum_circuit(num_qubits=2, gates=gates)
        assert len(circuit.gates) == 1

    def test_create_lambda_phi_validator(self):
        client = DNALangCopilotClient()
        validator = client.create_lambda_phi_validator()
        assert isinstance(validator, LambdaPhiValidator)
        assert validator.config is client.lambda_phi_config

    def test_create_lambda_phi_validator_cached(self):
        client = DNALangCopilotClient()
        v1 = client.create_lambda_phi_validator()
        v2 = client.create_lambda_phi_validator()
        assert v1 is v2

    def test_create_consciousness_analyzer(self):
        client = DNALangCopilotClient()
        analyzer = client.create_consciousness_analyzer()
        assert isinstance(analyzer, ConsciousnessAnalyzer)
        assert analyzer.config is client.consciousness_config

    def test_create_consciousness_analyzer_cached(self):
        client = DNALangCopilotClient()
        a1 = client.create_consciousness_analyzer()
        a2 = client.create_consciousness_analyzer()
        assert a1 is a2

    @pytest.mark.asyncio
    async def test_async_context_manager(self):
        """Test that the client works as an async context manager."""
        # Use server_mode=False to avoid launching the CLI process
        cfg = CopilotConfig(server_mode=False)
        async with DNALangCopilotClient(copilot_config=cfg) as client:
            assert client is not None
            circuit = client.create_quantum_circuit(2)
            assert circuit.num_qubits == 2

    def test_quantum_backend_initialized(self):
        client = DNALangCopilotClient()
        assert client._quantum_backend is not None

    def test_tool_registry_initialized(self):
        client = DNALangCopilotClient()
        assert client._tool_registry is not None
        assert len(client._tool_registry.get_all_tool_names()) == 3
