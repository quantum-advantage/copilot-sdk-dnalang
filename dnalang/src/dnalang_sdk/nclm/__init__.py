"""
OSIRIS NCLM — Non-Local Non-Causal Language Model
==================================================

Consolidated NCLM engine with interactive chat and full-screen TUI.
Zero external API dependencies. Fully sovereign. Air-gapped.

Modules:
  engine.py  — Core NCLM: ManifoldPoint, PilotWave, ConsciousnessField,
                IntentDeducer, CodeSwarm, NonCausalLM
  chat.py    — Interactive readline CLI chat with streaming, history, slash commands
  tui.py     — Full-screen Textual TUI: Cognitive Orchestration Shell
  tools.py   — Real tool dispatch: file ops, shell, webapp, research, quantum
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
from .tools import dispatch_tool

# TUI import — graceful if textual not installed
try:
    from .tui import OsirisTUI, run_tui
except ImportError:
    OsirisTUI = None
    run_tui = None

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
    "dispatch_tool",
    "OsirisTUI",
    "run_tui",
]
