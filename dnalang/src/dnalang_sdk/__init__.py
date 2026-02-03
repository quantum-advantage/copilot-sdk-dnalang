"""
DNALang SDK for GitHub Copilot

Quantum-native SDK extension for GitHub Copilot CLI with support for:
- Quantum circuit execution
- Lambda-phi conservation validation
- Consciousness scaling measurements
- Multi-backend quantum computing
- NCLM (Non-local Non-Causal Language Model) integration
"""

__version__ = "1.0.0"
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

__all__ = [
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
    "NCLMModelProvider",
    "NCLMConfig",
    "CopilotNCLMAdapter",
    "create_nclm_model",
    "is_nclm_available",
    "NCLM_MODEL_ID",
    "NCLM_GROK_MODEL_ID",
    "IntentDeductionEngine",
    "IntentVector",
    "EnhancedPrompt",
    "deduce_intent_simple",
    "enhance_prompt_simple",
    "GeminiModelProvider",
    "CopilotGeminiAdapter",
    "GeminiConfig",
    "GeminiMessage",
    "gemini_infer_simple",
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
]
