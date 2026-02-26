"""Import validation tests — ensures every __all__ export is importable."""
import pytest


class TestImportChain:
    """Verify the complete import chain works."""

    def test_top_level_import(self):
        import dnalang_sdk
        assert dnalang_sdk.__version__ == "5.3.0"
        assert dnalang_sdk.__framework__ == "DNA::}{::lang v51.843"

    def test_all_exports_exist(self):
        import dnalang_sdk
        for name in dnalang_sdk.__all__:
            assert hasattr(dnalang_sdk, name), f"Missing export: {name}"

    def test_export_count(self):
        import dnalang_sdk
        assert len(dnalang_sdk.__all__) >= 180

    def test_defense_imports(self):
        from dnalang_sdk.defense import (
            Sentinel, ZeroTrust, PlanckConstants,
            SphericalTetrahedron, PhaseConjugateHowitzer,
            StabilizerCode, PCRB, PCRBFactory,
        )

    def test_crsm_imports(self):
        from dnalang_sdk.crsm import (
            PenteractShell, PenteractState, OsirisPenteract,
            SwarmNode, NCLMSwarmOrchestrator, CRSMLayer,
            TauPhaseAnalyzer,
        )

    def test_compiler_imports(self):
        from dnalang_sdk.compiler import (
            Lexer, Parser, TokenType, IRCompiler,
            EvolutionaryOptimizer, QuantumRuntime, QuantumLedger,
        )

    def test_compiler_aliases(self):
        from dnalang_sdk.compiler import DNALangParser, DNALangLexer, DNAIR
        from dnalang_sdk.compiler import Parser
        assert DNALangParser is Parser

    def test_agents_imports(self):
        from dnalang_sdk.agents import (
            AURA, AIDEN, CHEOPS, CHRONOS,
            SCIMITARSentinel, LazarusProtocol,
            WormholeBridge, SovereignProofGenerator,
        )

    def test_mesh_imports(self):
        from dnalang_sdk.mesh import (
            TesseractDecoderOrganism, TesseractResonatorOrganism,
            QuEraCorrelatedAdapter,
        )

    def test_sovereign_imports(self):
        from dnalang_sdk.sovereign import (
            SovereignAgent, AeternaPorta, LambdaPhiEngine,
            QuantumMetrics, QuantumNLPCodeGenerator,
        )

    def test_quantum_core_imports(self):
        from dnalang_sdk.quantum_core import (
            CircuitGenerator, QuantumExecutor,
            LAMBDA_PHI, THETA_LOCK, PHI_THRESHOLD,
        )

    def test_nclm_imports(self):
        from dnalang_sdk.nclm import NCPhysics, NonCausalLM, NCLMChat, get_nclm

    def test_lab_imports(self):
        from dnalang_sdk.lab import ExperimentRegistry, LabScanner, LabExecutor

    def test_organisms_imports(self):
        from dnalang_sdk.organisms import Organism, Genome, Gene, EvolutionEngine

    def test_hardware_imports(self):
        from dnalang_sdk.hardware import (
            QuEraCorrelatedAdapter, WorkloadExtractor, SubstratePipeline,
        )

    def test_omega_engine_import(self):
        from dnalang_sdk.omega_engine import OmegaMetrics, IntentDeducer

    def test_code_writer_import(self):
        from dnalang_sdk.code_writer import (
            CodeWriter, MeshnetExecutor, ScimitarElite, IDEIntegration,
        )

    def test_cli_entry_point(self):
        from dnalang_sdk.cli import main
        assert callable(main)
