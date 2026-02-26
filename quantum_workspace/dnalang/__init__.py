"""
DNA-Lang: Quantum-Biological Programming Framework
================================================

A programming paradigm where code behaves as living organisms capable of
evolution, self-repair, and adaptive defense through quantum execution.

Core Components:
- Organism: Self-evolving quantum entities
- Gene: Functional units with expression levels
- Genome: Collection of genes defining behavior
- Evolution: Quantum-accelerated genetic algorithms
- AURA/AIDEN: Dual agent architecture

Constants:
- ΛΦ (Lambda Phi): Universal Memory Constant = 2.176435 × 10⁻⁸
- θ_lock: Theta Lock Angle = 51.843°
- χ_pc: Phase Conjugate Chi = 0.946
"""

__version__ = "1.0.0-ΛΦ"
__author__ = "Devin Phillip Davis"

# Universal Memory Constant
LAMBDA_PHI = 2.176435e-8

# Core Constants
THETA_LOCK = 51.843  # degrees
THETA_PC_RAD = 2.2368  # radians
GAMMA_CRITICAL = 0.3
PHI_THRESHOLD = 0.7734
CHI_PC = 0.946

from .core.organism import Organism
from .core.gene import Gene
from .core.genome import Genome
from .core.evolution import evolve, EvolutionEngine
from .core.mitosis import MitosisOrganism
from .core.symbiosis import SymbiosisOrganism, SymbiosisType, SymbiosisMetrics
from .core.predator_prey import (
    PredatorPreyEcosystem,
    EcosystemEntity,
    EcologicalRole,
    PopulationSnapshot,
)
from .agents.aura import AURA
from .agents.aiden import AIDEN
from .quantum.circuits import to_circuit
from .quantum.execution import QuantumExecutor
from .defense.sentinel import Sentinel
from .defense.phase_conjugate import PhaseConjugate

__all__ = [
    'Organism',
    'Gene',
    'Genome',
    'evolve',
    'EvolutionEngine',
    'MitosisOrganism',
    'SymbiosisOrganism',
    'SymbiosisType',
    'SymbiosisMetrics',
    'PredatorPreyEcosystem',
    'EcosystemEntity',
    'EcologicalRole',
    'PopulationSnapshot',
    'AURA',
    'AIDEN',
    'to_circuit',
    'QuantumExecutor',
    'Sentinel',
    'PhaseConjugate',
    'LAMBDA_PHI',
    'THETA_LOCK',
    'CHI_PC',
]
