"""
DNA-Lang Compiler — Self-Evolving Quantum Programming Language
DNA::}{::lang v51.843

The only programming language where code is alive.
Parse → Compile → Evolve → Execute → Ledger

Modules:
    dna_parser  — Lexer + recursive descent parser → AST
    dna_ir      — AST → quantum circuit intermediate representation
    dna_evolve  — DARWINIAN-LOOP evolutionary optimization (EOTS)
    dna_runtime — Quantum backend execution engine
    dna_ledger  — Immutable cryptographic lineage tracking
"""

from .dna_parser import (
    TokenType, Token, Lexer,
    OrganismNode, GenomeNode, GeneNode,
    QuantumStateNode, QuantumOpNode,
    ControlNode, ExpressionNode,
    parse_dna_lang, KEYWORDS, QUANTUM_OPS,
)
from .dna_ir import (
    IROpType, IROperation, QuantumRegister, ClassicalRegister,
    QuantumCircuitIR, IRCompiler, IROptimizer,
)
from .dna_evolve import (
    FitnessMetrics, EvolutionResult,
    EvolutionaryOptimizer, MutationOperator, CrossoverOperator,
    LAMBDA_PHI,
)
from .dna_runtime import (
    ExecutionResult, QuantumRuntime, RuntimeConfig,
)
from .dna_ledger import (
    LineageEntry, EvolutionLineage, QuantumLedger,
)

__version__ = "1.0.0"
__all__ = [
    "parse_dna_lang", "IRCompiler", "IROptimizer",
    "EvolutionaryOptimizer", "MutationOperator", "CrossoverOperator",
    "QuantumRuntime", "RuntimeConfig", "QuantumLedger", "EvolutionLineage",
    "FitnessMetrics", "EvolutionResult",
    "ExecutionResult", "LineageEntry", "QuantumCircuitIR",
    "IROpType", "IROperation", "LAMBDA_PHI",
    "TokenType", "Token", "Lexer",
    "OrganismNode", "GenomeNode", "GeneNode",
    "KEYWORDS", "QUANTUM_OPS",
]
