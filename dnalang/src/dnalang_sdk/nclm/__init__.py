"""
OSIRIS NCLM — Non-Local Non-Causal Language Model
==================================================

Consolidated NCLM engine with interactive chat interface.
Zero external API dependencies. Fully sovereign. Air-gapped.

Modules:
  engine.py  — Core NCLM: ManifoldPoint, PilotWave, ConsciousnessField,
                IntentDeducer, CodeSwarm, NonCausalLM
  chat.py    — Interactive CLI chat with streaming, history, slash commands
"""

from .engine import (
    NCPhysics,
    ManifoldPoint,
    PilotWaveCorrelation,
    ConsciousnessField,
    IntentDeducer,
    CodeSwarm,
    NonCausalLM,
    get_nclm,
)
from .chat import NCLMChat, NCLMResponseGenerator, run_chat

__all__ = [
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
