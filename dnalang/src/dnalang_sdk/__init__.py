"""
DNALang SDK for GitHub Copilot — Generation 5.0 Technical Orchestrator

Quantum-native SDK extension for GitHub Copilot CLI with support for:
- Quantum circuit execution & Lambda-phi conservation
- Consciousness scaling measurements (CCCE)
- Multi-backend quantum computing (IBM, QuEra, IQM, Infleqtion)
- NCLM (Non-local Non-Causal Language Model) integration
- Organism system (self-evolving quantum entities)
- Polar Mesh Intelligence Field (AURA/AIDEN/CHEOPS/CHRONOS)
- Tesseract A* decoder & QuEra 256-atom correlated adapter
- Sovereign Agent framework (token-free quantum execution)
- 11D-CRSM Swarm Agents & NonLocal Agent v8
- DevSwarm, Social Agents, Project Management

Framework: DNA::}{::lang v51.843  |  CAGE 9HUP5  |  Agile Defense Systems
"""

__version__ = "5.3.0"
__author__ = "Devin Phillip Davis / Agile Defense Systems"
__license__ = "MIT"
__framework__ = "DNA::}{::lang v51.843"

from .client import DNALangCopilotClient, CopilotConfig
from .config import QuantumConfig, LambdaPhiConfig, ConsciousnessConfig
from .quantum import QuantumCircuit, QuantumBackend, QuantumResult
from .lambda_phi import LambdaPhiValidator, ConservationResult
from .consciousness import ConsciousnessAnalyzer, CCCEResult
from .tools import (
    QuantumExecutionTool,
    LambdaPhiValidationTool,
    ConsciousnessScalingTool,
    ToolRegistry,
)
from .nclm_provider import (
    NCLMModelProvider,
    NCLMConfig,
    CopilotNCLMAdapter,
    create_nclm_model,
    is_nclm_available,
    NCLM_MODEL_ID,
    NCLM_GROK_MODEL_ID,
)
from .intent_engine import (
    IntentDeductionEngine,
    IntentVector,
    EnhancedPrompt,
    deduce_intent_simple,
    enhance_prompt_simple,
)
from .gemini_provider import (
    GeminiModelProvider,
    CopilotGeminiAdapter,
    GeminiConfig,
    GeminiMessage,
    gemini_infer_simple,
)
from .omega_integration import (
    OmegaMasterIntegration,
    AgentType,
    AgentState,
    CCCEMetrics,
    AgentConfig,
    OrchestrationState,
    create_omega_integration,
    orchestrate_task_simple,
    LAMBDA_PHI,
    PHI_THRESHOLD,
    ENDPOINTS,
)

# 11D-CRSM Swarm Agents
from .swarm_organism import (
    SwarmOrganism,
    OrganismRole,
    OrganismState,
    ConsciousnessMetrics as SwarmConsciousnessMetrics,
    PhaseState,
    Skill,
    SkillLevel,
    Gene,
    Memory,
    SocialConnection,
)
from .swarm_collective import (
    SwarmCollective,
    SwarmState,
    SwarmTask,
    SwarmMetrics,
    NeurobusChannel,
    NeurobusMessage,
    ConsensusMethod,
)

# Social Media Agents
from .social_agents import (
    SocialAgent,
    SocialSwarmCoordinator,
    SocialContent,
    SocialProfile,
    Platform,
    ContentType,
    EngagementType,
    CampaignMetrics,
)

# Quantum Project Management
from .project_manager import (
    QuantumProjectManager,
    UserStory,
    Sprint,
    StoryStatus,
    StoryPriority,
    SprintStatus,
    Retrospective,
    RetroItem,
)

# Recruitment Engine
from .recruitment_engine import (
    RecruitmentEngine,
    Candidate,
    JobPosting,
    RecruitmentStage,
    SkillAssessment,
    CultureFitScore,
    ConsciousnessCompatibility,
)

# Dev Swarm Orchestrator
from .dev_swarm import (
    DevSwarm,
    DevSwarmConfig,
    DevPhase,
    SwarmMode,
    DevMetrics,
    create_dev_swarm,
    quick_start_swarm,
)

# ═══════════════════════════════════════════════════════════════════════
# Gen 5.0 — Unified Sub-packages (Polar Mesh / Organisms / Sovereign)
# ═══════════════════════════════════════════════════════════════════════

# Organisms: self-evolving quantum entities (from quantum_workspace/dnalang/core)
from .organisms import Organism, Genome, Gene as OrganismGene, EvolutionEngine

# Polar Mesh Agents + Defense + Recovery + Comms + Proofs
from .agents import (
    AURA, AIDEN, CHEOPS, CHRONOS,
    SCIMITARSentinel, ThreatLevel, SentinelMode, ThreatEvent,
    LazarusProtocol, PhoenixProtocol,
    RecoveryState, VitalSigns, ResurrectionRecord,
    WormholeBridge, WormholeMessage,
    BridgeState, MessagePriority, EntanglementPair,
    SovereignProofGenerator, SovereigntyAttestation,
)

# Quantum Core Constants (from quantum_workspace/dnalang/quantum)
from .quantum_core import CircuitGenerator, QuantumExecutor

# Defense (from quantum_workspace/dnalang/defense)
from .defense import Sentinel, PhaseConjugate, ZeroTrust

# Mesh: Tesseract decoder, NCLM Swarm, NonLocal Agent, QuEra (from osiris_cockpit)
from .mesh import TesseractDecoderOrganism, TesseractResonatorOrganism, QuEraCorrelatedAdapter

# Sovereign: Agent framework, AeternaPorta, CodeGenerator (from dnalang-sovereign-copilot-sdk)
from .sovereign import (
    SovereignAgent, AeternaPorta, LambdaPhiEngine,
    QuantumMetrics, QuantumNLPCodeGenerator, CodeIntent, DeveloperTools,
)

# Lab: Quantum R&D experiment engine
from .lab import (
    ExperimentRegistry, ExperimentRecord, ExperimentType, ExperimentStatus,
    ResultRecord, LabScanner, ExperimentDesigner, ExperimentTemplate, LabExecutor,
)

# NCLM: Non-Local Non-Causal Language Model
from .nclm import (
    NCPhysics, ManifoldPoint, PilotWaveCorrelation, ConsciousnessField,
    IntentDeducer, CodeSwarm, NonCausalLM, get_nclm,
    NCLMChat, NCLMResponseGenerator, run_chat,
)

__all__ = [
    # Core
    "DNALangCopilotClient",
    "CopilotConfig",
    "QuantumConfig",
    "LambdaPhiConfig",
    "ConsciousnessConfig",
    "QuantumCircuit",
    "QuantumBackend",
    "QuantumResult",
    "LambdaPhiValidator",
    "ConservationResult",
    "ConsciousnessAnalyzer",
    "CCCEResult",
    "QuantumExecutionTool",
    "LambdaPhiValidationTool",
    "ConsciousnessScalingTool",
    "ToolRegistry",
    # NCLM
    "NCLMModelProvider",
    "NCLMConfig",
    "CopilotNCLMAdapter",
    "create_nclm_model",
    "is_nclm_available",
    "NCLM_MODEL_ID",
    "NCLM_GROK_MODEL_ID",
    # Intent Engine
    "IntentDeductionEngine",
    "IntentVector",
    "EnhancedPrompt",
    "deduce_intent_simple",
    "enhance_prompt_simple",
    # Gemini
    "GeminiModelProvider",
    "CopilotGeminiAdapter",
    "GeminiConfig",
    "GeminiMessage",
    "gemini_infer_simple",
    # Omega Integration
    "OmegaMasterIntegration",
    "AgentType",
    "AgentState",
    "CCCEMetrics",
    "AgentConfig",
    "OrchestrationState",
    "create_omega_integration",
    "orchestrate_task_simple",
    "LAMBDA_PHI",
    "PHI_THRESHOLD",
    "ENDPOINTS",
    # Swarm Organism
    "SwarmOrganism",
    "OrganismRole",
    "OrganismState",
    "SwarmConsciousnessMetrics",
    "PhaseState",
    "Skill",
    "SkillLevel",
    "Gene",
    "Memory",
    "SocialConnection",
    # Swarm Collective
    "SwarmCollective",
    "SwarmState",
    "SwarmTask",
    "SwarmMetrics",
    "NeurobusChannel",
    "NeurobusMessage",
    "ConsensusMethod",
    # Social Agents
    "SocialAgent",
    "SocialSwarmCoordinator",
    "SocialContent",
    "SocialProfile",
    "Platform",
    "ContentType",
    "EngagementType",
    "CampaignMetrics",
    # Project Manager
    "QuantumProjectManager",
    "UserStory",
    "Sprint",
    "StoryStatus",
    "StoryPriority",
    "SprintStatus",
    "Retrospective",
    "RetroItem",
    # Recruitment Engine
    "RecruitmentEngine",
    "Candidate",
    "JobPosting",
    "RecruitmentStage",
    "SkillAssessment",
    "CultureFitScore",
    "ConsciousnessCompatibility",
    # Dev Swarm
    "DevSwarm",
    "DevSwarmConfig",
    "DevPhase",
    "SwarmMode",
    "DevMetrics",
    "create_dev_swarm",
    "quick_start_swarm",
    # === Gen 5.0 Sub-packages (unified from disparate sources) ===
    # Organisms (from quantum_workspace/dnalang/core)
    "Organism",
    "Genome",
    "EvolutionEngine",
    # Polar Mesh Agents
    "AURA",
    "AIDEN",
    "CHEOPS",
    "CHRONOS",
    # SCIMITAR Sentinel
    "SCIMITARSentinel",
    "ThreatLevel",
    "SentinelMode",
    "ThreatEvent",
    # Lazarus & Phoenix Protocols
    "LazarusProtocol",
    "PhoenixProtocol",
    "RecoveryState",
    "VitalSigns",
    "ResurrectionRecord",
    # Wormhole Bridge
    "WormholeBridge",
    "WormholeMessage",
    "BridgeState",
    "MessagePriority",
    "EntanglementPair",
    # Sovereign Proof
    "SovereignProofGenerator",
    "SovereigntyAttestation",
    # Quantum Core Constants (from quantum_workspace/dnalang/quantum)
    "CircuitGenerator",
    "QuantumExecutor",
    # Defense (from quantum_workspace/dnalang/defense)
    "Sentinel",
    "PhaseConjugate",
    "ZeroTrust",
    # Mesh (from osiris_cockpit)
    "TesseractDecoderOrganism",
    "TesseractResonatorOrganism",
    # Sovereign (from dnalang-sovereign-copilot-sdk)
    "SovereignAgent",
    "AeternaPorta",
    "LambdaPhiEngine",
    "QuantumMetrics",
    "QuantumNLPCodeGenerator",
    "CodeIntent",
    "DeveloperTools",
    # Lab (Quantum R&D Engine)
    "ExperimentRegistry",
    "ExperimentRecord",
    "ExperimentType",
    "ExperimentStatus",
    "ResultRecord",
    "LabScanner",
    "ExperimentDesigner",
    "ExperimentTemplate",
    "LabExecutor",
    # NCLM (Non-Local Non-Causal Language Model)
    "NCPhysics",
    "ManifoldPoint",
    "PilotWaveCorrelation",
    "ConsciousnessField",
    "IntentDeducer",
    "CodeSwarm",
    "NonCausalLM",
    "get_nclm",
    "NCLMChat",
    "NCLMResponseGenerator",
    "run_chat",
]

# ═══════════════════════════════════════════════════════════════════════
# Gen 5.3 — DNA-Lang Compiler v2, Omega Engine, Code Writer
# ═══════════════════════════════════════════════════════════════════════

# Compiler: Full Lexer→Parser→IR→Runtime→Evolution→Ledger pipeline
from .compiler import (
    DNALangParser, DNALangLexer, TokenType,
    DNAIR, IRNode,
    DNAEvolver,
    DNARuntime,
    DNALedger,
)

# Omega Recursive Engine: 7-layer intent deduction
from .omega_engine import OmegaMetrics, IntentDeducer as OmegaIntentDeducer

# Code Writer: Cockpit code generation + meshnet execution
from .code_writer import CodeWriter, MeshnetExecutor, ScimitarElite, IDEIntegration

# CRSM Penteract (updated): 5D singularity protocol with 46-problem solver
from .crsm import (
    PenteractShell, PenteractState, PhysicsProblem,
    ResolutionResult, OsirisPenteract,
)

# Defense PCRB (new): Phase Conjugate Recursion Bus
from .defense import (
    StabilizerCode, PhaseConjugateMirror, RecursionBus, PCRB,
    SphericalTetrahedron, PhaseConjugateHowitzer,
)

# Hardware (updated): Workload extraction
from .hardware import WorkloadExtractor, SubstratePipeline

__all__ += [
    # Compiler
    "DNALangParser", "DNALangLexer", "TokenType",
    "DNAIR", "IRNode",
    "DNAEvolver",
    "DNARuntime",
    "DNALedger",
    # Omega Engine
    "OmegaMetrics", "OmegaIntentDeducer",
    # Code Writer
    "CodeWriter", "MeshnetExecutor", "ScimitarElite", "IDEIntegration",
    # Penteract (updated)
    "PenteractShell", "PenteractState", "PhysicsProblem",
    "ResolutionResult", "OsirisPenteract",
    # PCRB
    "StabilizerCode", "PhaseConjugateMirror", "RecursionBus", "PCRB",
    "SphericalTetrahedron", "PhaseConjugateHowitzer",
    # Hardware
    "WorkloadExtractor", "SubstratePipeline",
]
