"""11D-CRSM (Cognitive-Recursive State Manifold) modules.

Provides the unified CRSM physics stack:
- swarm_orchestrator: 7-layer NCLM swarm evolution
- nonlocal_agent: Bifurcated tetrahedral agent constellation
- penteract: 11D unified AURA+AIDEN engine (46 physics problems)
- tau_phase_analyzer: τ-phase validation against real hardware data
"""

__all__ = [
    "NCLMSwarmOrchestrator",
    "NonLocalAgentOrchestrator",
    "PenteractSingularity",
    "TauPhaseAnalyzer",
]
