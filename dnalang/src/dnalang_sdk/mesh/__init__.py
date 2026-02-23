"""OSIRIS Mesh — NonLocalAgent, NCLM Swarm, Tesseract decoder, QuEra adapter.

These modules are dependency-free and can run without Qiskit.
"""

from .tesseract import TesseractDecoderOrganism, TesseractResonatorOrganism

__all__ = [
    'TesseractDecoderOrganism',
    'TesseractResonatorOrganism',
]

# Lazy imports for heavier modules
def get_nonlocal_agent():
    from .nonlocal_agent import NonLocalAgentEnhanced
    return NonLocalAgentEnhanced

def get_swarm_orchestrator():
    from .swarm_orchestrator import NCLMSwarmOrchestrator
    return NCLMSwarmOrchestrator

def get_quera_adapter():
    from .quera_adapter import QuEraCorrelatedAdapter
    return QuEraCorrelatedAdapter
