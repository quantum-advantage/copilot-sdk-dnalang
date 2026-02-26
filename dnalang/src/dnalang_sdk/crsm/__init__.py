"""CRSM subsystem — 11D Cognitive-Recursive State Manifold."""

from .penteract import (
    PenteractShell,
    PenteractState,
    PhysicsProblem,
    ResolutionResult,
    OsirisPenteract,
)
from .swarm_orchestrator import SwarmNode, NCLMSwarmOrchestrator
from .nonlocal_agent import NonLocalAgentOrchestrator
from .tau_phase_analyzer import TauPhaseAnalyzer

__all__ = [
    "PenteractShell", "PenteractState", "PhysicsProblem",
    "ResolutionResult", "OsirisPenteract",
    "SwarmNode", "NCLMSwarmOrchestrator",
    "NonLocalAgentOrchestrator",
    "TauPhaseAnalyzer",
]
