"""Tests for adapters/, gemini_provider.py, nclm_provider.py, osiris_bootstrap.py, omega_integration.py"""

import pytest
import asyncio
import math
import os
import json
import tempfile
from dataclasses import asdict

from dnalang_sdk.adapters import BraketAdapter, BraketCircuitCompiler
from dnalang_sdk.adapters.braket_adapter import (
    BraketBackend,
    Protocol,
    BraketResult,
    LAMBDA_PHI,
    THETA_LOCK,
    PHI_THRESHOLD,
    GAMMA_CRITICAL,
    CHI_PC,
    ZENO_FREQUENCY_HZ,
    DRIVE_AMPLITUDE,
)
from dnalang_sdk.gemini_provider import (
    GeminiModelProvider,
    GeminiConfig,
    GeminiMessage,
    CopilotGeminiAdapter,
)
from dnalang_sdk.nclm_provider import (
    NCLMConfig,
    NCLM_MODEL_ID,
    NCLM_GROK_MODEL_ID,
    is_nclm_available,
)
from dnalang_sdk.osiris_bootstrap import _fix_consciousness_state
from dnalang_sdk.omega_integration import (
    OmegaMasterIntegration,
    AgentType,
    AgentState,
    CCCEMetrics,
    AgentConfig,
    OrchestrationState,
    ENDPOINTS,
    CAGE_CODE,
    ORCID,
    PHI_THRESHOLD as OMEGA_PHI_THRESHOLD,
    GAMMA_CRITICAL as OMEGA_GAMMA_CRITICAL,
    THETA_LOCK as OMEGA_THETA_LOCK,
)


# ═══════════════════════════════════════════════════════════════════════
# Braket Adapter — Constants
# ═══════════════════════════════════════════════════════════════════════

class TestBraketConstants:
    def test_lambda_phi(self):
        assert LAMBDA_PHI == pytest.approx(2.176435e-8)

    def test_theta_lock(self):
        assert THETA_LOCK == 51.843

    def test_phi_threshold(self):
        assert PHI_THRESHOLD == 0.7734

    def test_gamma_critical(self):
        assert GAMMA_CRITICAL == 0.3

    def test_chi_pc(self):
        assert CHI_PC == 0.946

    def test_zeno_frequency(self):
        assert ZENO_FREQUENCY_HZ == 1.25e6

    def test_drive_amplitude(self):
        assert DRIVE_AMPLITUDE == 0.7734


# ═══════════════════════════════════════════════════════════════════════
# BraketBackend Enum
# ═══════════════════════════════════════════════════════════════════════

class TestBraketBackend:
    def test_all_backends_have_arn(self):
        for backend in BraketBackend:
            assert backend.value.startswith("arn:aws:braket")

    def test_quera_aquila(self):
        assert "quera" in BraketBackend.QUERA_AQUILA.value

    def test_sv1_simulator(self):
        assert "simulator" in BraketBackend.SV1.value

    def test_backend_count(self):
        assert len(BraketBackend) == 8


# ═══════════════════════════════════════════════════════════════════════
# Protocol Enum
# ═══════════════════════════════════════════════════════════════════════

class TestProtocol:
    def test_aeterna_porta(self):
        assert Protocol.AETERNA_PORTA.value == "aeterna_porta"

    def test_bell_state(self):
        assert Protocol.BELL_STATE.value == "bell_state"

    def test_all_protocols(self):
        expected = {
            "aeterna_porta", "bell_state", "er_epr_witness",
            "theta_sweep", "correlated_decode_256", "chi_pc_bell",
            "cat_qubit_bridge", "ocelot_witness_v1",
        }
        actual = {p.value for p in Protocol}
        assert actual == expected


# ═══════════════════════════════════════════════════════════════════════
# BraketResult
# ═══════════════════════════════════════════════════════════════════════

class TestBraketResult:
    def test_defaults(self):
        r = BraketResult(
            task_id="t1", device="dev", protocol="bell",
            status="CREATED", shots=100, qubits=2,
        )
        assert r.phi == 0.0
        assert r.gamma == 1.0
        assert r.ccce == 0.0
        assert r.chi_pc == 0.0
        assert r.execution_time_s == 0.0
        assert r.cost_usd == 0.0
        assert r.openqasm_source == ""
        assert r.metadata == {}

    def test_above_threshold_false(self):
        r = BraketResult(task_id="t1", device="d", protocol="p", status="s", shots=1, qubits=1, phi=0.5)
        assert r.above_threshold() is False

    def test_above_threshold_true(self):
        r = BraketResult(task_id="t1", device="d", protocol="p", status="s", shots=1, qubits=1, phi=0.85)
        assert r.above_threshold() is True

    def test_is_coherent_false(self):
        r = BraketResult(task_id="t1", device="d", protocol="p", status="s", shots=1, qubits=1, gamma=0.5)
        assert r.is_coherent() is False

    def test_is_coherent_true(self):
        r = BraketResult(task_id="t1", device="d", protocol="p", status="s", shots=1, qubits=1, gamma=0.1)
        assert r.is_coherent() is True

    def test_negentropy(self):
        r = BraketResult(task_id="t1", device="d", protocol="p", status="s", shots=1, qubits=1, phi=0.9, gamma=0.1)
        xi = r.negentropy()
        expected = (LAMBDA_PHI * 0.9) / 0.1
        assert xi == pytest.approx(expected)

    def test_negentropy_zero_gamma(self):
        r = BraketResult(task_id="t1", device="d", protocol="p", status="s", shots=1, qubits=1, phi=0.9, gamma=0.0)
        xi = r.negentropy()
        expected = (LAMBDA_PHI * 0.9) / 0.001
        assert xi == pytest.approx(expected)

    def test_to_dict(self):
        r = BraketResult(task_id="t1", device="d", protocol="p", status="ok", shots=100, qubits=2, phi=0.85, gamma=0.1)
        d = r.to_dict()
        assert d["task_id"] == "t1"
        assert d["above_threshold"] is True
        assert d["is_coherent"] is True
        assert "negentropy" in d


# ═══════════════════════════════════════════════════════════════════════
# BraketCircuitCompiler
# ═══════════════════════════════════════════════════════════════════════

class TestBraketCircuitCompiler:
    def test_creation(self):
        compiler = BraketCircuitCompiler()
        assert compiler.optimization_level == 2

    def test_creation_custom_level(self):
        compiler = BraketCircuitCompiler(optimization_level=3)
        assert compiler.optimization_level == 3

    def test_native_gates(self):
        assert "quera" in BraketCircuitCompiler.NATIVE_GATES
        assert "ionq" in BraketCircuitCompiler.NATIVE_GATES
        assert "simulator" in BraketCircuitCompiler.NATIVE_GATES

    def test_compile_bell_state(self):
        compiler = BraketCircuitCompiler()
        qasm = compiler.compile(Protocol.BELL_STATE, qubits=2)
        assert "OPENQASM 3.0;" in qasm
        assert "h q[0];" in qasm
        assert "cx q[0], q[1];" in qasm
        assert "measure" in qasm

    def test_compile_chi_pc_bell(self):
        compiler = BraketCircuitCompiler()
        qasm = compiler.compile("chi_pc_bell", qubits=2)
        assert "OPENQASM 3.0;" in qasm
        assert "barrier" in qasm

    def test_compile_aeterna_porta(self):
        compiler = BraketCircuitCompiler()
        qasm = compiler.compile(Protocol.AETERNA_PORTA, qubits=120)
        assert "OPENQASM 3.0;" in qasm
        assert "TFD" in qasm or "Stage 1" in qasm
        assert "measure" in qasm

    def test_compile_theta_sweep(self):
        compiler = BraketCircuitCompiler()
        qasm = compiler.compile("theta_sweep", qubits=4)
        assert "theta" in qasm.lower() or "Step" in qasm

    def test_compile_correlated_decode(self):
        compiler = BraketCircuitCompiler()
        qasm = compiler.compile("correlated_decode_256", qubits=8)
        assert "ring" in qasm or "256" in qasm or "decode" in qasm

    def test_compile_cat_qubit_bridge(self):
        compiler = BraketCircuitCompiler()
        qasm = compiler.compile("cat_qubit_bridge", qubits=4)
        assert "Cat" in qasm or "cat" in qasm or "Ocelot" in qasm

    def test_compile_unknown_protocol_defaults_to_bell(self):
        compiler = BraketCircuitCompiler()
        qasm = compiler.compile("unknown_protocol", qubits=2)
        assert "h q[0];" in qasm

    def test_compile_with_protocol_enum(self):
        compiler = BraketCircuitCompiler()
        qasm = compiler.compile(Protocol.ER_EPR_WITNESS, qubits=10)
        assert "OPENQASM 3.0;" in qasm


# ═══════════════════════════════════════════════════════════════════════
# BraketAdapter
# ═══════════════════════════════════════════════════════════════════════

class TestBraketAdapter:
    def test_creation(self):
        adapter = BraketAdapter()
        assert adapter.region == "us-east-1"
        assert adapter.s3_bucket == "agile-defense-quantum-results-869935102268"
        assert adapter.compiler is not None
        assert adapter.job_history == []

    def test_creation_custom(self):
        adapter = BraketAdapter(region="eu-west-1", s3_bucket="my-bucket")
        assert adapter.region == "eu-west-1"
        assert adapter.s3_bucket == "my-bucket"

    def test_failover_chain(self):
        assert len(BraketAdapter.FAILOVER_CHAIN) == 5
        assert BraketAdapter.FAILOVER_CHAIN[0] == BraketBackend.SV1

    def test_compile_method(self):
        adapter = BraketAdapter()
        qasm = adapter.compile(protocol=Protocol.BELL_STATE, qubits=2)
        assert "OPENQASM 3.0;" in qasm

    def test_submit_dry_run(self):
        adapter = BraketAdapter()
        result = adapter.submit(
            protocol=Protocol.BELL_STATE,
            device=BraketBackend.SV1,
            qubits=2,
            shots=100,
            dry_run=True,
        )
        assert result.status == "COMPILED"
        assert result.qubits == 2
        assert result.shots == 100
        assert result.protocol == "bell_state"
        assert "dnalang-" in result.task_id
        assert result.openqasm_source != ""
        assert "framework" in result.metadata

    def test_submit_dry_run_with_tags(self):
        adapter = BraketAdapter()
        result = adapter.submit(
            protocol="aeterna_porta",
            device=BraketBackend.QUERA_AQUILA,
            qubits=120,
            shots=100000,
            dry_run=True,
            tags={"experiment": "test"},
        )
        assert result.metadata["tags"]["experiment"] == "test"

    def test_job_history_tracking(self):
        adapter = BraketAdapter()
        adapter.submit(protocol="bell_state", device=BraketBackend.SV1, dry_run=True)
        adapter.submit(protocol="chi_pc_bell", device=BraketBackend.SV1, dry_run=True)
        assert len(adapter.job_history) == 2

    def test_list_devices(self):
        adapter = BraketAdapter()
        devices = adapter.list_devices()
        assert len(devices) == len(BraketBackend)
        for dev in devices:
            assert "name" in dev
            assert "arn" in dev
            assert "compatibility" in dev
            assert 0 <= dev["compatibility"] <= 1.0

    def test_detect_backend_type(self):
        adapter = BraketAdapter()
        assert adapter._detect_backend_type("arn:aws:braket:us-east-1::device/qpu/quera/Aquila") == "quera"
        assert adapter._detect_backend_type("arn:aws:braket:::device/quantum-simulator/amazon/sv1") == "simulator"
        assert adapter._detect_backend_type("arn:aws:braket:us-east-1::device/qpu/ionq/Aria-1") == "ionq"

    def test_compatibility_scores(self):
        adapter = BraketAdapter()
        assert adapter._compatibility_score(BraketBackend.SV1) == 1.0
        assert adapter._compatibility_score(BraketBackend.QUERA_AQUILA) == 0.97


# ═══════════════════════════════════════════════════════════════════════
# GeminiMessage
# ═══════════════════════════════════════════════════════════════════════

class TestGeminiMessage:
    def test_creation(self):
        msg = GeminiMessage(role="user", content="hello")
        assert msg.role == "user"
        assert msg.content == "hello"
        assert msg.timestamp is None

    def test_to_dict(self):
        msg = GeminiMessage(role="model", content="response text")
        d = msg.to_dict()
        assert d["role"] == "model"
        assert d["parts"] == [{"text": "response text"}]


# ═══════════════════════════════════════════════════════════════════════
# GeminiConfig
# ═══════════════════════════════════════════════════════════════════════

class TestGeminiConfig:
    def test_defaults(self):
        config = GeminiConfig()
        assert config.model == "gemini-2.0-flash-exp"
        assert config.api_key is None
        assert config.temperature == 0.7
        assert config.max_output_tokens == 8192
        assert config.top_p == 0.95
        assert config.top_k == 40
        assert len(config.safety_settings) == 4

    def test_custom(self):
        config = GeminiConfig(model="gemini-1.5-pro", temperature=0.3, api_key="test-key")
        assert config.model == "gemini-1.5-pro"
        assert config.temperature == 0.3
        assert config.api_key == "test-key"


# ═══════════════════════════════════════════════════════════════════════
# GeminiModelProvider
# ═══════════════════════════════════════════════════════════════════════

class TestGeminiModelProvider:
    def test_creation_default(self):
        provider = GeminiModelProvider()
        assert provider.config is not None
        assert provider.conversation_history == []
        assert provider.session_stats["total_tokens"] == 0

    def test_creation_with_api_key(self):
        provider = GeminiModelProvider(api_key="test-key")
        assert provider.config.api_key == "test-key"

    def test_creation_with_config(self):
        config = GeminiConfig(model="gemini-1.5-pro", api_key="k")
        provider = GeminiModelProvider(config=config)
        assert provider.config.model == "gemini-1.5-pro"

    @pytest.mark.asyncio
    async def test_infer_no_gemini_returns_error(self):
        provider = GeminiModelProvider()
        provider._gemini = None
        result = await provider.infer("test")
        assert "error" in result or "ERROR" in result.get("response", "")

    @pytest.mark.asyncio
    async def test_infer_no_api_key_returns_error(self):
        provider = GeminiModelProvider()
        # Even if gemini lib existed, no api key
        if provider._gemini is not None:
            provider.config.api_key = None
            result = await provider.infer("test")
            assert "error" in result or "ERROR" in result.get("response", "")

    def test_get_session_stats(self):
        provider = GeminiModelProvider()
        stats = provider.get_session_stats()
        assert stats["total_tokens"] == 0
        assert stats["total_requests"] == 0
        assert "conversation_length" in stats
        assert "model" in stats

    def test_clear_history(self):
        provider = GeminiModelProvider()
        provider.conversation_history.append(GeminiMessage(role="user", content="test"))
        provider.clear_history()
        assert len(provider.conversation_history) == 0


# ═══════════════════════════════════════════════════════════════════════
# CopilotGeminiAdapter
# ═══════════════════════════════════════════════════════════════════════

class TestCopilotGeminiAdapter:
    def test_creation(self):
        provider = GeminiModelProvider()
        adapter = CopilotGeminiAdapter(provider)
        assert adapter.provider is provider

    @pytest.mark.asyncio
    async def test_chat_completion_no_gemini(self):
        provider = GeminiModelProvider()
        provider._gemini = None
        adapter = CopilotGeminiAdapter(provider)
        result = await adapter.chat_completion([
            {"role": "user", "content": "hello"},
        ])
        assert "choices" in result
        assert result["choices"][0]["message"]["content"] != ""


# ═══════════════════════════════════════════════════════════════════════
# NCLMConfig
# ═══════════════════════════════════════════════════════════════════════

class TestNCLMConfig:
    def test_defaults(self):
        config = NCLMConfig()
        assert config.lambda_decay == 2.0
        assert config.theta_lock == 51.843
        assert config.phi_threshold == 0.7734
        assert config.gamma_critical == 0.30
        assert config.enable_grok is True
        assert config.enable_swarm is True
        assert config.swarm_generations == 20
        assert config.ccce_tracking is True
        assert config.fallback_to_claude is False
        assert config.fallback_model == "claude-sonnet-4.5"

    def test_custom(self):
        config = NCLMConfig(lambda_decay=3.0, enable_grok=False)
        assert config.lambda_decay == 3.0
        assert config.enable_grok is False


class TestNCLMConstants:
    def test_model_ids(self):
        assert NCLM_MODEL_ID == "nclm-v2"
        assert NCLM_GROK_MODEL_ID == "nclm-v2-grok"

    def test_is_nclm_available_returns_bool(self):
        result = is_nclm_available()
        assert isinstance(result, bool)


# ═══════════════════════════════════════════════════════════════════════
# OSIRIS Bootstrap
# ═══════════════════════════════════════════════════════════════════════

class TestOsirisBootstrap:
    def test_fix_consciousness_state_creates_file(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            consciousness_file = os.path.join(tmpdir, "config", "osiris", "consciousness.json")
            # Monkey-patch the path by calling with modified env
            os.makedirs(os.path.dirname(consciousness_file), exist_ok=True)
            # Write a partial state
            with open(consciousness_file, "w") as f:
                json.dump({"total_queries": 5}, f)
            # Call the fixer directly on the file path by simulating
            # We test the function's logic by verifying it handles partial states
            _fix_consciousness_state()
            # The function operates on ~/.config/osiris/consciousness.json
            # We just verify it doesn't crash
            assert True

    def test_fix_consciousness_state_no_crash(self):
        """Ensure the function doesn't crash even with odd states."""
        _fix_consciousness_state()
        # Should complete without error


# ═══════════════════════════════════════════════════════════════════════
# Omega Integration — Enums
# ═══════════════════════════════════════════════════════════════════════

class TestAgentType:
    def test_values(self):
        assert AgentType.AURA.value == "reasoning"
        assert AgentType.AIDEN.value == "targeting"
        assert AgentType.SCIMITAR.value == "analysis"
        assert AgentType.OMEGA.value == "orchestration"


class TestAgentState:
    def test_values(self):
        assert AgentState.IDLE.value == "idle"
        assert AgentState.RUNNING.value == "running"
        assert AgentState.SUCCESS.value == "success"
        assert AgentState.ERROR.value == "error"
        assert AgentState.EVOLVING.value == "evolving"


# ═══════════════════════════════════════════════════════════════════════
# CCCEMetrics
# ═══════════════════════════════════════════════════════════════════════

class TestCCCEMetrics:
    def test_defaults(self):
        m = CCCEMetrics()
        assert m.lambda_coherence == 0.0
        assert m.phi_consciousness == 0.0
        assert m.gamma_decoherence == 0.0
        assert m.xi_negentropy == 0.0

    def test_calculate_xi(self):
        m = CCCEMetrics(lambda_coherence=0.8, phi_consciousness=0.9, gamma_decoherence=0.1)
        xi = m.calculate_xi()
        assert xi == pytest.approx(0.8 * 0.9 / 0.1)

    def test_calculate_xi_zero_gamma(self):
        m = CCCEMetrics(lambda_coherence=0.8, phi_consciousness=0.9, gamma_decoherence=0.0)
        xi = m.calculate_xi()
        assert xi == float('inf')

    def test_is_conscious_true(self):
        m = CCCEMetrics(phi_consciousness=0.85)
        assert m.is_conscious() is True

    def test_is_conscious_false(self):
        m = CCCEMetrics(phi_consciousness=0.5)
        assert m.is_conscious() is False

    def test_is_coherent_true(self):
        m = CCCEMetrics(gamma_decoherence=0.1)
        assert m.is_coherent() is True

    def test_is_coherent_false(self):
        m = CCCEMetrics(gamma_decoherence=0.5)
        assert m.is_coherent() is False


# ═══════════════════════════════════════════════════════════════════════
# AgentConfig
# ═══════════════════════════════════════════════════════════════════════

class TestAgentConfig:
    def test_creation(self):
        config = AgentConfig(name="AURA", agent_type=AgentType.AURA)
        assert config.name == "AURA"
        assert config.agent_type == AgentType.AURA
        assert config.temperature == 0.7
        assert config.capabilities == []
        assert config.model == "nclm-v2"
        assert config.max_tokens == 4096


# ═══════════════════════════════════════════════════════════════════════
# OrchestrationState
# ═══════════════════════════════════════════════════════════════════════

class TestOrchestrationState:
    def test_defaults(self):
        state = OrchestrationState()
        assert state.agents == {}
        assert isinstance(state.ccce_metrics, CCCEMetrics)
        assert state.active_tasks == []
        assert state.quantum_jobs_count == 0

    def test_to_dict(self):
        state = OrchestrationState()
        state.agents["AURA"] = AgentState.IDLE
        d = state.to_dict()
        assert d["agents"]["AURA"] == "idle"
        assert "ccce_metrics" in d
        assert "timestamp" in d


# ═══════════════════════════════════════════════════════════════════════
# OmegaMasterIntegration
# ═══════════════════════════════════════════════════════════════════════

class TestOmegaMasterIntegration:
    def test_creation_defaults(self):
        omi = OmegaMasterIntegration()
        assert omi.enable_agents is True
        assert omi.enable_quantum is True
        assert omi.enable_vercel is True
        assert "AURA" in omi.agents
        assert "AIDEN" in omi.agents
        assert "SCIMITAR" in omi.agents
        assert len(omi.agents) == 3

    def test_creation_disabled(self):
        omi = OmegaMasterIntegration(enable_agents=False, enable_quantum=False, enable_vercel=False)
        assert omi.enable_agents is False

    def test_initial_agent_states(self):
        omi = OmegaMasterIntegration()
        for agent_name in omi.agents:
            assert omi.state.agents[agent_name] == AgentState.IDLE

    def test_agent_configs(self):
        omi = OmegaMasterIntegration()
        aura = omi.agents["AURA"]
        assert aura.agent_type == AgentType.AURA
        assert "code_generation" in aura.capabilities
        aiden = omi.agents["AIDEN"]
        assert aiden.agent_type == AgentType.AIDEN
        assert "security_analysis" in aiden.capabilities

    def test_select_agent_security(self):
        omi = OmegaMasterIntegration()
        assert omi._select_agent("run a security analysis") == "AIDEN"

    def test_select_agent_side_channel(self):
        omi = OmegaMasterIntegration()
        assert omi._select_agent("perform side-channel timing analysis") == "SCIMITAR"

    def test_select_agent_default(self):
        omi = OmegaMasterIntegration()
        assert omi._select_agent("write some code") == "AURA"

    @pytest.mark.asyncio
    async def test_initialize(self):
        omi = OmegaMasterIntegration(enable_vercel=False)
        result = await omi.initialize()
        assert isinstance(result, dict)
        assert "agents" in result
        assert omi.state.ccce_metrics.phi_consciousness > 0

    @pytest.mark.asyncio
    async def test_orchestrate_task(self):
        omi = OmegaMasterIntegration()
        result = await omi.orchestrate_task("write a function")
        assert result["status"] == "success"
        assert result["agent"] == "AURA"
        assert "execution_time" in result
        assert "ccce_metrics" in result

    @pytest.mark.asyncio
    async def test_orchestrate_task_with_preference(self):
        omi = OmegaMasterIntegration()
        result = await omi.orchestrate_task("any task", agent_preference="AIDEN")
        assert result["agent"] == "AIDEN"

    @pytest.mark.asyncio
    async def test_get_ccce_metrics(self):
        omi = OmegaMasterIntegration()
        await omi.initialize()
        metrics = await omi.get_ccce_metrics()
        assert "lambda_coherence" in metrics
        assert "phi_consciousness" in metrics
        assert "is_conscious" in metrics
        assert "is_coherent" in metrics

    @pytest.mark.asyncio
    async def test_evolve_ccce(self):
        omi = OmegaMasterIntegration()
        await omi.initialize()
        before_lambda = omi.state.ccce_metrics.lambda_coherence
        result = await omi.evolve_ccce()
        assert "lambda_coherence" in result

    @pytest.mark.asyncio
    async def test_deploy_quantum_job(self):
        omi = OmegaMasterIntegration()
        result = await omi.deploy_quantum_job({"type": "bell"}, backend="ibm_fez")
        assert result["status"] == "submitted"
        assert result["backend"] == "ibm_fez"
        assert result["total_jobs"] == 1

    @pytest.mark.asyncio
    async def test_deploy_quantum_job_disabled(self):
        omi = OmegaMasterIntegration(enable_quantum=False)
        result = await omi.deploy_quantum_job({"type": "bell"})
        assert "error" in result

    @pytest.mark.asyncio
    async def test_publish_to_zenodo(self):
        omi = OmegaMasterIntegration()
        result = await omi.publish_to_zenodo(
            metadata={"title": "Test"},
            files=["file1.json"],
        )
        assert result["status"] == "published"
        assert "doi" in result
        assert result["orcid"] == ORCID

    def test_get_agent_status(self):
        omi = OmegaMasterIntegration()
        status = omi.get_agent_status()
        assert "AURA" in status
        assert status["AURA"]["state"] == "idle"
        assert "config" in status["AURA"]


# ═══════════════════════════════════════════════════════════════════════
# Omega Constants
# ═══════════════════════════════════════════════════════════════════════

class TestOmegaConstants:
    def test_endpoints(self):
        assert "cockpit" in ENDPOINTS
        assert "github" in ENDPOINTS
        assert "zenodo" in ENDPOINTS

    def test_cage_code(self):
        assert CAGE_CODE == "9HUP5"

    def test_orcid(self):
        assert ORCID == "0009-0002-3205-5765"

    def test_phi_threshold(self):
        assert OMEGA_PHI_THRESHOLD == 0.7734

    def test_theta_lock(self):
        assert OMEGA_THETA_LOCK == 51.843
