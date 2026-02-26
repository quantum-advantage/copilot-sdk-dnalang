"""Tests for intent_engine.py and organisms_compiler.py"""

import pytest
import asyncio
import math
import os
import tempfile
from dataclasses import asdict

from dnalang_sdk.intent_engine import (
    IntentDeductionEngine,
    IntentVector,
    EnhancedPrompt,
    deduce_intent_simple,
    enhance_prompt_simple,
    LAMBDA_PHI,
    PHI_GOLDEN,
    TAU_OMEGA,
)
from dnalang_sdk.organisms_compiler import (
    DNACompiler,
    OrganismProfile,
    CompiledCircuit,
    CorrelationResult,
    OrganismHardwareCorrelator,
    discover_organisms,
    GATE_MAP,
    PHI_GOLDEN as OC_PHI_GOLDEN,
    THETA_LOCK,
    CHI_PC,
    PHI_THRESH,
    GAMMA_CRIT,
)


# ═══════════════════════════════════════════════════════════════════════
# IntentVector
# ═══════════════════════════════════════════════════════════════════════

class TestIntentVector:
    def test_defaults(self):
        iv = IntentVector(prompt="test")
        assert iv.prompt == "test"
        assert iv.domains == []
        assert iv.actions == []
        assert iv.resources == []
        assert iv.coherence_lambda == 0.0
        assert iv.consciousness_phi == 0.0
        assert iv.decoherence_gamma == 0.0
        assert iv.confidence == 0.0
        assert iv.trajectory == "discovery"

    def test_to_dict(self):
        iv = IntentVector(prompt="hello", domains=["quantum"], confidence=0.9)
        d = iv.to_dict()
        assert d["prompt"] == "hello"
        assert d["domains"] == ["quantum"]
        assert d["confidence"] == 0.9

    def test_custom_trajectory(self):
        iv = IntentVector(prompt="test", trajectory="validation")
        assert iv.trajectory == "validation"


# ═══════════════════════════════════════════════════════════════════════
# EnhancedPrompt
# ═══════════════════════════════════════════════════════════════════════

class TestEnhancedPrompt:
    def test_defaults(self):
        iv = IntentVector(prompt="test")
        ep = EnhancedPrompt(original="test", enhanced="test enhanced", intent_vector=iv)
        assert ep.original == "test"
        assert ep.enhanced == "test enhanced"
        assert ep.context_layers == {}
        assert ep.overall_quality == 0.0

    def test_to_dict(self):
        iv = IntentVector(prompt="test")
        ep = EnhancedPrompt(original="test", enhanced="enhanced", intent_vector=iv, overall_quality=0.85)
        d = ep.to_dict()
        assert d["original"] == "test"
        assert d["enhanced"] == "enhanced"
        assert d["overall_quality"] == 0.85
        assert "intent_vector" in d


# ═══════════════════════════════════════════════════════════════════════
# IntentDeductionEngine
# ═══════════════════════════════════════════════════════════════════════

class TestIntentDeductionEngine:
    def test_creation_defaults(self):
        engine = IntentDeductionEngine()
        assert engine.recursion_depth == 3
        assert engine.enable_nclm is False
        assert engine.nclm_model is None
        assert engine.iteration == 0
        assert "topics" in engine.semantic_genome

    def test_creation_custom(self):
        engine = IntentDeductionEngine(recursion_depth=5, enable_nclm=True)
        assert engine.recursion_depth == 5
        assert engine.enable_nclm is True

    @pytest.mark.asyncio
    async def test_deduce_intent_quantum(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("build a quantum circuit for entanglement")
        assert isinstance(iv, IntentVector)
        assert "quantum" in iv.domains
        assert iv.confidence > 0
        assert iv.coherence_lambda > 0

    @pytest.mark.asyncio
    async def test_deduce_intent_ai(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("train a neural model for inference")
        assert "ai" in iv.domains

    @pytest.mark.asyncio
    async def test_deduce_intent_general(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("hello")
        assert "general" in iv.domains

    @pytest.mark.asyncio
    async def test_deduce_intent_actions_extracted(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("create and deploy a new service")
        assert "create" in iv.actions
        assert "deploy" in iv.actions

    @pytest.mark.asyncio
    async def test_deduce_intent_no_actions_defaults_to_execute(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("hello world")
        assert "execute" in iv.actions

    @pytest.mark.asyncio
    async def test_deduce_intent_resources(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("deploy on ibm hardware with sdk")
        assert "hardware" in iv.resources
        assert "software" in iv.resources

    @pytest.mark.asyncio
    async def test_trajectory_discovery(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("research quantum computing approaches")
        assert iv.trajectory == "discovery"

    @pytest.mark.asyncio
    async def test_trajectory_validation(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("validate the test results")
        assert iv.trajectory == "validation"

    @pytest.mark.asyncio
    async def test_trajectory_implementation(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("write a new function")
        assert iv.trajectory == "implementation"

    @pytest.mark.asyncio
    async def test_coherence_increases_with_longer_prompt(self):
        engine = IntentDeductionEngine()
        short = await engine.deduce_intent("hi")
        long = await engine.deduce_intent("build a quantum circuit with entanglement and deploy to ibm hardware")
        assert long.coherence_lambda >= short.coherence_lambda

    @pytest.mark.asyncio
    async def test_consciousness_phi_boost_for_quantum_terms(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("quantum entanglement coherence")
        assert iv.consciousness_phi >= 0.8

    @pytest.mark.asyncio
    async def test_consciousness_phi_context_boost(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("hello", context={"some": "context"})
        assert iv.consciousness_phi >= 0.7

    @pytest.mark.asyncio
    async def test_decoherence_gamma_ambiguous(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("maybe perhaps could do something")
        assert iv.decoherence_gamma > 0

    @pytest.mark.asyncio
    async def test_decoherence_gamma_short_prompt(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("hi")
        assert iv.decoherence_gamma >= 0.2

    @pytest.mark.asyncio
    async def test_enhance_prompt(self):
        engine = IntentDeductionEngine()
        ep = await engine.enhance_prompt("build a quantum circuit")
        assert isinstance(ep, EnhancedPrompt)
        assert ep.original == "build a quantum circuit"
        assert len(ep.enhanced) >= len(ep.original)
        assert ep.overall_quality > 0
        assert "domains" in ep.context_layers
        assert "quantum" in ep.context_layers

    @pytest.mark.asyncio
    async def test_enhance_prompt_with_precomputed_intent(self):
        engine = IntentDeductionEngine()
        iv = await engine.deduce_intent("test prompt")
        ep = await engine.enhance_prompt("test prompt", intent_vector=iv)
        assert ep.intent_vector is iv

    @pytest.mark.asyncio
    async def test_enhance_prompt_implementation_context(self):
        engine = IntentDeductionEngine()
        ep = await engine.enhance_prompt("implement a new feature for the system")
        assert "implementation" in ep.intent_vector.trajectory.lower() or "Context" in ep.enhanced or ep.enhanced != ep.original

    @pytest.mark.asyncio
    async def test_generate_project_plan(self):
        engine = IntentDeductionEngine()
        plan = await engine.generate_project_plan([
            "research quantum approaches",
            "build the circuit",
            "test the results",
        ])
        assert "phases" in plan
        assert plan["total_intents"] == 3
        assert plan["total_phases"] >= 1
        assert "avg_coherence_lambda" in plan
        assert "overall_complexity" in plan
        assert plan["overall_complexity"] in ("HIGH", "MEDIUM", "LOW")

    @pytest.mark.asyncio
    async def test_generate_project_plan_all_discovery(self):
        engine = IntentDeductionEngine()
        plan = await engine.generate_project_plan([
            "research topic A",
            "explore topic B",
        ])
        phase_names = [p["name"] for p in plan["phases"]]
        assert "Discovery & Research" in phase_names


class TestIntentEngineHelpers:
    def test_extract_domains_quantum(self):
        engine = IntentDeductionEngine()
        domains = engine._extract_domains("quantum circuit with qubit entanglement")
        assert "quantum" in domains

    def test_extract_domains_multiple(self):
        engine = IntentDeductionEngine()
        domains = engine._extract_domains("deploy ai model on cloud hardware")
        assert "ai" in domains
        assert "deployment" in domains

    def test_extract_actions(self):
        engine = IntentDeductionEngine()
        actions = engine._extract_actions("create and test a function")
        assert "create" in actions
        assert "test" in actions

    def test_extract_resources(self):
        engine = IntentDeductionEngine()
        resources = engine._extract_resources("use ibm hardware and dataset")
        assert "hardware" in resources
        assert "data" in resources

    def test_calculate_coherence_range(self):
        engine = IntentDeductionEngine()
        val = engine._calculate_coherence("short", ["quantum"], ["create"])
        assert 0 <= val <= 1.0

    def test_calculate_consciousness_base(self):
        engine = IntentDeductionEngine()
        val = engine._calculate_consciousness("hello world", None)
        assert val == pytest.approx(0.5)

    def test_calculate_decoherence_clean(self):
        engine = IntentDeductionEngine()
        val = engine._calculate_decoherence("implement a concrete feature with clear requirements")
        assert val == 0.0

    def test_get_domain_context(self):
        engine = IntentDeductionEngine()
        ctx = engine._get_domain_context(["quantum", "ai"])
        assert ctx["active_domains"] == ["quantum", "ai"]

    def test_get_capability_context(self):
        engine = IntentDeductionEngine()
        ctx = engine._get_capability_context()
        assert ctx["quantum_computing"] is True
        assert ctx["nclm_available"] is False

    def test_get_quantum_context(self):
        engine = IntentDeductionEngine()
        iv = IntentVector(prompt="test", domains=["quantum"])
        ctx = engine._get_quantum_context(iv)
        assert ctx["quantum_active"] is True

    def test_get_consciousness_context(self):
        engine = IntentDeductionEngine()
        iv = IntentVector(prompt="test", consciousness_phi=0.9, domains=["consciousness"])
        ctx = engine._get_consciousness_context(iv)
        assert ctx["consciousness_active"] is True
        assert ctx["ccce_available"] is True


# ═══════════════════════════════════════════════════════════════════════
# Convenience Functions
# ═══════════════════════════════════════════════════════════════════════

class TestIntentConvenience:
    @pytest.mark.asyncio
    async def test_deduce_intent_simple(self):
        iv = await deduce_intent_simple("create a function")
        assert isinstance(iv, IntentVector)
        assert iv.prompt == "create a function"

    @pytest.mark.asyncio
    async def test_enhance_prompt_simple(self):
        ep = await enhance_prompt_simple("build something")
        assert isinstance(ep, EnhancedPrompt)
        assert ep.original == "build something"


# ═══════════════════════════════════════════════════════════════════════
# Intent Engine Constants
# ═══════════════════════════════════════════════════════════════════════

class TestIntentEngineConstants:
    def test_lambda_phi(self):
        assert LAMBDA_PHI == pytest.approx(2.176435e-8)

    def test_phi_golden(self):
        assert PHI_GOLDEN == pytest.approx(1.618033988749895)

    def test_tau_omega(self):
        assert TAU_OMEGA == pytest.approx(2 * math.pi)


# ═══════════════════════════════════════════════════════════════════════
# Organisms Compiler — Constants
# ═══════════════════════════════════════════════════════════════════════

class TestOrganismsCompilerConstants:
    def test_phi_golden(self):
        assert OC_PHI_GOLDEN == pytest.approx((1 + math.sqrt(5)) / 2)

    def test_theta_lock(self):
        assert THETA_LOCK == 51.843

    def test_chi_pc(self):
        assert CHI_PC == 0.946

    def test_phi_thresh(self):
        assert PHI_THRESH == 0.7734

    def test_gamma_crit(self):
        assert GAMMA_CRIT == 0.3

    def test_gate_map_has_expected_keys(self):
        assert "H" in GATE_MAP
        assert "CX" in GATE_MAP
        assert "CNOT" in GATE_MAP
        assert GATE_MAP["H"] == "h"
        assert GATE_MAP["CX"] == "cx"
        assert GATE_MAP["FOLD"] == "ry"


# ═══════════════════════════════════════════════════════════════════════
# OrganismProfile / CompiledCircuit / CorrelationResult Dataclasses
# ═══════════════════════════════════════════════════════════════════════

class TestOrganismProfile:
    def test_creation(self):
        op = OrganismProfile(
            name="test_org", source_file="/tmp/test.dna",
            format_type="ini", qubits=4, depth=8,
            circuit_type="bell", theta=51.843, phi=0.8,
            gamma=0.2, fidelity=0.95, generation=1,
            genes=[], metadata={},
        )
        assert op.name == "test_org"
        assert op.qubits == 4
        assert op.circuit_type == "bell"
        assert op.theta == 51.843


class TestCompiledCircuit:
    def test_creation(self):
        cc = CompiledCircuit(
            organism="test", qubits=2, gate_count=3,
            depth=2, gates=[], theta_lock_applied=True,
            qasm="OPENQASM 3.0;", fitness=0.85, phi_total=2.0,
        )
        assert cc.organism == "test"
        assert cc.qubits == 2
        assert cc.theta_lock_applied is True
        assert cc.phi_total == 2.0


class TestCorrelationResult:
    def test_creation(self):
        cr = CorrelationResult(
            organism="test", compiled_qubits=4,
            compiled_gates=10, compiled_fitness=0.9,
            nearest_hardware_experiment="exp1",
            hardware_fidelity=0.85, hardware_phi=0.8,
            hardware_gamma=0.15, prediction_vs_measurement="ALIGNED",
        )
        assert cr.organism == "test"
        assert cr.prediction_vs_measurement == "ALIGNED"


# ═══════════════════════════════════════════════════════════════════════
# DNACompiler
# ═══════════════════════════════════════════════════════════════════════

class TestDNACompiler:
    def _write_ini_dna(self, tmpdir, name="test_org"):
        content = f"""[metadata]
name = "{name}"
qubits = 4
depth = 8
circuit_type = "bell"
theta = 51.843

[metrics]
phi = 0.85
gamma = 0.12
fidelity = 0.95
generation = 2

[lifecycle]
state = "active"
"""
        path = os.path.join(tmpdir, f"{name}.dna")
        with open(path, "w") as f:
            f.write(content)
        return path

    def _write_block_dna(self, tmpdir, name="block_org"):
        content = f"""ORGANISM {name} {{
    GENE init {{
        expression_level: 0.8
        purpose: "initialization"
    }}
    GENE process {{
        expression_level: 0.9
        purpose: "data processing"
    }}
    GENE output {{
        expression_level: 0.7
        purpose: "result output"
    }}
}}
"""
        path = os.path.join(tmpdir, f"{name}.dna")
        with open(path, "w") as f:
            f.write(content)
        return path

    def test_parse_ini_format(self):
        compiler = DNACompiler()
        with tempfile.TemporaryDirectory() as tmpdir:
            path = self._write_ini_dna(tmpdir)
            org = compiler.parse_organism(path)
            assert org is not None
            assert org.name == "test_org"
            assert org.format_type == "ini"
            assert org.qubits == 4
            assert org.theta == 51.843
            assert org.phi == 0.85

    def test_parse_block_format(self):
        compiler = DNACompiler()
        with tempfile.TemporaryDirectory() as tmpdir:
            path = self._write_block_dna(tmpdir)
            org = compiler.parse_organism(path)
            assert org is not None
            assert org.name == "block_org"
            assert org.format_type == "block"
            assert len(org.genes) == 3
            assert org.genes[0]["name"] == "init"
            assert org.genes[0]["expression"] == 0.8

    def test_parse_returns_none_for_invalid(self):
        compiler = DNACompiler()
        with tempfile.TemporaryDirectory() as tmpdir:
            path = os.path.join(tmpdir, "bad.dna")
            with open(path, "w") as f:
                f.write("random garbage content")
            org = compiler.parse_organism(path)
            assert org is None

    def test_parse_returns_none_for_missing_file(self):
        compiler = DNACompiler()
        org = compiler.parse_organism("/nonexistent/path.dna")
        assert org is None

    def test_compile_bell(self):
        compiler = DNACompiler()
        with tempfile.TemporaryDirectory() as tmpdir:
            path = self._write_ini_dna(tmpdir)
            org = compiler.parse_organism(path)
            circ = compiler.compile(org)
            assert isinstance(circ, CompiledCircuit)
            assert circ.qubits == 4
            assert circ.gate_count > 0
            assert circ.depth > 0
            assert circ.theta_lock_applied is True
            assert circ.phi_total == pytest.approx(2.0)
            assert "OPENQASM" in circ.qasm
            assert circ.fitness > 0

    def test_compile_organism_from_genes(self):
        compiler = DNACompiler()
        with tempfile.TemporaryDirectory() as tmpdir:
            path = self._write_block_dna(tmpdir)
            org = compiler.parse_organism(path)
            circ = compiler.compile(org)
            assert isinstance(circ, CompiledCircuit)
            assert circ.gate_count > 0
            assert "OPENQASM" in circ.qasm

    def test_compile_ghz(self):
        compiler = DNACompiler()
        org = OrganismProfile(
            name="ghz_test", source_file="", format_type="ini",
            qubits=4, depth=4, circuit_type="ghz",
            theta=51.843, phi=0, gamma=0, fidelity=0,
            generation=1, genes=[], metadata={},
        )
        circ = compiler.compile(org)
        assert circ.gate_count > 0

    def test_compile_variational(self):
        compiler = DNACompiler()
        org = OrganismProfile(
            name="var_test", source_file="", format_type="ini",
            qubits=4, depth=4, circuit_type="variational",
            theta=51.843, phi=0, gamma=0, fidelity=0,
            generation=1, genes=[], metadata={},
        )
        circ = compiler.compile(org)
        assert circ.gate_count > 0

    def test_compile_qram(self):
        compiler = DNACompiler()
        org = OrganismProfile(
            name="qram_test", source_file="", format_type="ini",
            qubits=6, depth=6, circuit_type="qram",
            theta=51.843, phi=0, gamma=0, fidelity=0,
            generation=1, genes=[], metadata={},
        )
        circ = compiler.compile(org)
        assert circ.gate_count > 0

    def test_compile_generic(self):
        compiler = DNACompiler()
        org = OrganismProfile(
            name="generic_test", source_file="", format_type="ini",
            qubits=4, depth=4, circuit_type="custom_unknown",
            theta=51.843, phi=0, gamma=0, fidelity=0,
            generation=1, genes=[], metadata={},
        )
        circ = compiler.compile(org)
        assert circ.gate_count > 0

    def test_phi_total_conservation(self):
        compiler = DNACompiler()
        assert compiler._compute_phi_total(2) == pytest.approx(2.0)
        assert compiler._compute_phi_total(10) == pytest.approx(2.0)
        assert compiler._compute_phi_total(127) == pytest.approx(2.0)

    def test_phi_total_single_qubit(self):
        compiler = DNACompiler()
        assert compiler._compute_phi_total(1) == 0.0

    def test_qasm_output_format(self):
        compiler = DNACompiler()
        with tempfile.TemporaryDirectory() as tmpdir:
            path = self._write_ini_dna(tmpdir)
            org = compiler.parse_organism(path)
            circ = compiler.compile(org)
            assert "OPENQASM 3.0;" in circ.qasm
            assert 'include "stdgates.inc";' in circ.qasm
            assert "qubit[" in circ.qasm
            assert "measure" in circ.qasm


# ═══════════════════════════════════════════════════════════════════════
# OrganismHardwareCorrelator
# ═══════════════════════════════════════════════════════════════════════

class TestOrganismHardwareCorrelator:
    def test_correlate_no_hardware_data(self):
        correlator = OrganismHardwareCorrelator(titan_path="/nonexistent/path.json")
        circ = CompiledCircuit(
            organism="test", qubits=2, gate_count=3,
            depth=2, gates=[], theta_lock_applied=True,
            qasm="", fitness=0.9, phi_total=2.0,
        )
        result = correlator.correlate(circ)
        assert result.nearest_hardware_experiment == "N/A"
        assert result.prediction_vs_measurement == "NO HARDWARE DATA"

    def test_correlate_with_hardware_data(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            titan_path = os.path.join(tmpdir, "titan.json")
            data = {
                "experiments": {
                    "bell_test": {
                        "qubits": 2,
                        "shots": 8192,
                        "fidelity": 0.95,
                        "ccce": {"phi": 0.85, "gamma": 0.12},
                    }
                }
            }
            with open(titan_path, "w") as f:
                import json
                json.dump(data, f)
            correlator = OrganismHardwareCorrelator(titan_path=titan_path)
            circ = CompiledCircuit(
                organism="test", qubits=2, gate_count=3,
                depth=2, gates=[], theta_lock_applied=True,
                qasm="", fitness=0.9, phi_total=2.0,
            )
            result = correlator.correlate(circ)
            assert result.nearest_hardware_experiment == "bell_test"
            assert result.hardware_fidelity == 0.95
            assert result.hardware_phi == 0.85


# ═══════════════════════════════════════════════════════════════════════
# discover_organisms
# ═══════════════════════════════════════════════════════════════════════

class TestDiscoverOrganisms:
    def test_returns_list(self):
        result = discover_organisms(root="/nonexistent_root_xyz")
        assert isinstance(result, list)
        assert len(result) == 0

    def test_discovers_in_temp_dir(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            # Create the expected directory structure
            org_dir = os.path.join(tmpdir, ".dnalang-sovereign", "organisms")
            os.makedirs(org_dir)
            dna_path = os.path.join(org_dir, "test.dna")
            with open(dna_path, "w") as f:
                f.write("[metadata]\nname = test\n")
            result = discover_organisms(root=tmpdir)
            assert len(result) >= 1
            assert any("test.dna" in p for p in result)
