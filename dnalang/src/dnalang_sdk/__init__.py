"""
DNALang SDK for GitHub Copilot

Quantum-native SDK extension for GitHub Copilot CLI with support for:
- Quantum circuit execution
- Lambda-phi conservation validation
- Consciousness scaling measurements
- Multi-backend quantum computing
- NCLM (Non-local Non-Causal Language Model) integration
- 11D-CRSM Swarm Agents
- Social Media Agents
- Quantum Project Management
- Recruitment Engine
"""

__version__ = "2.0.0"
__author__ = "DNALang Team"
__license__ = "MIT"

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
]
