"""
Dnalang Sovereign Copilot SDK - Core Package
🔒 Token-Free Quantum AI | Complete Sovereignty | Better Than Copilot

Framework: DNA::}{::lang v51.843
Author: Devin Davis / Agile Defense Systems
"""

from .agent import SovereignAgent
from .enhanced_agent import EnhancedSovereignAgent
from .quantum_engine import AeternaPorta, LambdaPhiEngine
from .code_generator import QuantumNLPCodeGenerator, CodeIntent
from .dev_tools import DeveloperTools
from .nclm import NCLMReasoning
from .crypto import QuantumCrypto
from .cli import DnalangCopilot, main as cli_main

__version__ = "2.0.0"
__author__ = "Devin Davis"
__framework__ = "DNA::}{::lang v51.843"

__all__ = [
    'SovereignAgent',
    'EnhancedSovereignAgent',
    'AeternaPorta',
    'LambdaPhiEngine',
    'QuantumNLPCodeGenerator',
    'CodeIntent',
    'DeveloperTools',
    'NCLMReasoning',
    'QuantumCrypto',
    'DnalangCopilot',
    'cli_main',
]
