#!/usr/bin/env python3
"""Tests for DNA-Lang compiler package and Forge integration."""

import sys, os, json, hashlib, tempfile
from pathlib import Path
import pytest

# Add paths
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'dnalang_compiler'))


# ═══════════════════════════════════════════════════════════════
# COMPILER PACKAGE TESTS
# ═══════════════════════════════════════════════════════════════

class TestCompilerImports:
    def test_package_imports(self):
        from dnalang_compiler import parse_dna_lang, IRCompiler, EvolutionaryOptimizer
        assert callable(parse_dna_lang)

    def test_all_exports(self):
        import dnalang_compiler
        assert hasattr(dnalang_compiler, '__all__')
        assert len(dnalang_compiler.__all__) >= 15

    def test_version(self):
        import dnalang_compiler
        assert dnalang_compiler.__version__ == "1.0.0"


class TestLexer:
    def test_lex_simple(self):
        from dnalang_compiler import Lexer, TokenType
        lexer = Lexer("organism test { }")
        tokens = lexer.tokenize()
        assert any(t.type == TokenType.KEYWORD for t in tokens)

    def test_lex_quantum_ops(self):
        from dnalang_compiler import Lexer
        tokens = Lexer("helix(q[0]); bond(q[0], q[1]);").tokenize()
        assert len(tokens) > 5

    def test_keywords_set(self):
        from dnalang_compiler import KEYWORDS
        assert 'organism' in KEYWORDS
        assert 'genome' in KEYWORDS
        assert 'gene' in KEYWORDS
        assert 'helix' not in KEYWORDS  # helix is quantum op, not keyword

    def test_quantum_ops_set(self):
        from dnalang_compiler import QUANTUM_OPS
        assert 'helix' in QUANTUM_OPS
        assert QUANTUM_OPS['helix'] == 'h'
        assert QUANTUM_OPS['bond'] == 'cx'


class TestParser:
    BELL_SOURCE = """
    organism bell_pair {
        genome {
            gene qubit_a = encode(0) -> q[0];
            gene qubit_b = encode(0) -> q[1];
        }
        quantum_state {
            helix(q[0]);
            bond(q[0], q[1]);
            measure(q[0]);
            measure(q[1]);
        }
        fitness = phi;
    }
    """

    def test_parse_bell(self):
        from dnalang_compiler import parse_dna_lang
        organisms = parse_dna_lang(self.BELL_SOURCE)
        assert len(organisms) == 1
        assert organisms[0].name == "bell_pair"

    def test_parse_genome(self):
        from dnalang_compiler import parse_dna_lang
        org = parse_dna_lang(self.BELL_SOURCE)[0]
        assert org.genome is not None
        assert len(org.genome.genes) == 2

    def test_parse_quantum_state(self):
        from dnalang_compiler import parse_dna_lang
        org = parse_dna_lang(self.BELL_SOURCE)[0]
        assert org.quantum_state is not None

    def test_gene_names(self):
        from dnalang_compiler import parse_dna_lang
        org = parse_dna_lang(self.BELL_SOURCE)[0]
        names = [g.name for g in org.genome.genes]
        assert "qubit_a" in names
        assert "qubit_b" in names

    def test_parse_three_qubit(self):
        from dnalang_compiler import parse_dna_lang
        source = """
        organism three_q {
            genome {
                gene a = encode(0) -> q[0];
                gene b = encode(0) -> q[1];
                gene c = encode(0) -> q[2];
            }
            quantum_state {
                helix(q[0]);
                bond(q[0], q[1]);
                bond(q[1], q[2]);
                measure(q[0]);
                measure(q[1]);
                measure(q[2]);
            }
            fitness = phi;
        }
        """
        org = parse_dna_lang(source)[0]
        assert org.name == "three_q"
        assert len(org.genome.genes) == 3


class TestIRCompiler:
    def test_compile_bell(self):
        from dnalang_compiler import parse_dna_lang, IRCompiler
        source = """
        organism bell {
            genome {
                gene a = encode(0) -> q[0];
                gene b = encode(0) -> q[1];
            }
            quantum_state {
                helix(q[0]);
                bond(q[0], q[1]);
                measure(q[0]);
                measure(q[1]);
            }
            fitness = phi;
        }
        """
        org = parse_dna_lang(source)[0]
        compiler = IRCompiler()
        circuit = compiler.compile_organism(org)
        circuit.compute_metrics()
        assert circuit.qubit_count == 2
        assert circuit.gate_count >= 2

    def test_ir_to_qasm(self):
        from dnalang_compiler import parse_dna_lang, IRCompiler
        source = """
        organism qasm_test {
            genome {
                gene a = encode(0) -> q[0];
            }
            quantum_state {
                helix(q[0]);
                measure(q[0]);
            }
            fitness = phi;
        }
        """
        org = parse_dna_lang(source)[0]
        circuit = IRCompiler().compile_organism(org)
        qasm = circuit.to_qasm()
        assert "OPENQASM" in qasm
        assert "qreg" in qasm

    def test_lineage_hash_computed(self):
        from dnalang_compiler import parse_dna_lang, IRCompiler
        source = """
        organism hash_test {
            genome { gene a = encode(0) -> q[0]; }
            quantum_state { helix(q[0]); measure(q[0]); }
            fitness = phi;
        }
        """
        org = parse_dna_lang(source)[0]
        circuit = IRCompiler().compile_organism(org)
        assert len(circuit.lineage_hash) > 0

    def test_circuit_depth(self):
        from dnalang_compiler import parse_dna_lang, IRCompiler
        source = """
        organism depth_test {
            genome {
                gene a = encode(0) -> q[0];
                gene b = encode(0) -> q[1];
            }
            quantum_state {
                helix(q[0]);
                helix(q[1]);
                bond(q[0], q[1]);
                measure(q[0]);
                measure(q[1]);
            }
            fitness = phi;
        }
        """
        org = parse_dna_lang(source)[0]
        circuit = IRCompiler().compile_organism(org)
        circuit.compute_metrics()
        assert circuit.depth > 0


class TestEvolution:
    def _make_circuit(self):
        from dnalang_compiler import parse_dna_lang, IRCompiler
        source = """
        organism evo_test {
            genome {
                gene a = encode(0) -> q[0];
                gene b = encode(0) -> q[1];
            }
            quantum_state {
                helix(q[0]);
                bond(q[0], q[1]);
                measure(q[0]);
                measure(q[1]);
            }
            fitness = phi;
        }
        """
        org = parse_dna_lang(source)[0]
        circuit = IRCompiler().compile_organism(org)
        circuit.compute_metrics()
        return circuit

    def test_evolution_runs(self):
        from dnalang_compiler import EvolutionaryOptimizer
        circuit = self._make_circuit()
        optimizer = EvolutionaryOptimizer(population_size=4, max_generations=5)
        result = optimizer.evolve(circuit)
        assert result.best_fitness > 0
        assert len(result.fitness_history) > 0

    def test_evolution_converges(self):
        from dnalang_compiler import EvolutionaryOptimizer
        circuit = self._make_circuit()
        optimizer = EvolutionaryOptimizer(population_size=8, max_generations=20)
        result = optimizer.evolve(circuit)
        assert result.convergence_generation is not None or result.generation == 19

    def test_evolution_result_fields(self):
        from dnalang_compiler import EvolutionaryOptimizer
        circuit = self._make_circuit()
        result = EvolutionaryOptimizer(population_size=4, max_generations=5).evolve(circuit)
        assert result.best_circuit is not None
        assert isinstance(result.fitness_history, list)
        assert result.generation >= 0

    def test_fitness_evaluator(self):
        from dnalang_compiler.dna_evolve import FitnessEvaluator
        circuit = self._make_circuit()
        evaluator = FitnessEvaluator()
        metrics = evaluator.evaluate_circuit(circuit)
        assert metrics.fitness > 0
        assert metrics.lambda_coherence >= 0
        assert metrics.gamma_decoherence >= 0

    def test_mutation_preserves_structure(self):
        from dnalang_compiler.dna_evolve import MutationOperator
        circuit = self._make_circuit()
        mutated = MutationOperator.mutate_gate_replacement(circuit, rate=0.5)
        assert mutated.qubit_count == circuit.qubit_count


class TestLedger:
    def test_ledger_create(self):
        from dnalang_compiler import QuantumLedger
        with tempfile.TemporaryDirectory() as td:
            ledger = QuantumLedger(os.path.join(td, "test.db"))
            assert ledger.conn is not None

    def test_record_organism(self):
        from dnalang_compiler import parse_dna_lang, IRCompiler, QuantumLedger
        source = """
        organism ledger_test {
            genome { gene a = encode(0) -> q[0]; }
            quantum_state { helix(q[0]); measure(q[0]); }
            fitness = phi;
        }
        """
        org = parse_dna_lang(source)[0]
        circuit = IRCompiler().compile_organism(org)
        circuit.compute_metrics()

        with tempfile.TemporaryDirectory() as td:
            ledger = QuantumLedger(os.path.join(td, "test.db"))
            entry = ledger.record_organism(circuit)
            assert entry.organism_name == "ledger_test"
            assert len(entry.lineage_hash) > 0


class TestImmutableConstants:
    def test_lambda_phi(self):
        from dnalang_compiler import LAMBDA_PHI
        assert LAMBDA_PHI == 2.176435e-8

    def test_ir_op_types(self):
        from dnalang_compiler import IROpType
        assert IROpType.H.value == "h"
        assert IROpType.CX.value == "cx"
        assert IROpType.MEASURE.value == "measure"


# ═══════════════════════════════════════════════════════════════
# FORGE TESTS
# ═══════════════════════════════════════════════════════════════

class TestForge:
    def test_forge_bell_state(self):
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
        from dnalang_forge import DNALangForge, EXAMPLES
        forge = DNALangForge(population_size=4, max_generations=5, seed=42)
        result = forge.forge(EXAMPLES["bell_state"], animate=False)
        assert result.organism_name == "bell_pair"
        assert result.evolved_fitness > 0
        assert len(result.lineage_hash) > 0
        assert result.elapsed_s > 0

    def test_forge_therapeutic_target(self):
        from dnalang_forge import DNALangForge, EXAMPLES
        forge = DNALangForge(population_size=4, max_generations=5, seed=42)
        result = forge.forge(EXAMPLES["therapeutic_target"], animate=False)
        assert result.organism_name == "mtap_kinase_fold"
        assert result.qubit_count == 3

    def test_forge_all_examples(self):
        from dnalang_forge import DNALangForge, EXAMPLES
        forge = DNALangForge(population_size=4, max_generations=5, seed=42)
        for name, source in EXAMPLES.items():
            result = forge.forge(source, animate=False)
            assert result.evolved_fitness > 0, f"Failed for {name}"
            assert result.proof_hash, f"No proof hash for {name}"

    def test_forge_result_fields(self):
        from dnalang_forge import DNALangForge, EXAMPLES, ForgeResult
        forge = DNALangForge(population_size=4, max_generations=5, seed=42)
        result = forge.forge(EXAMPLES["bell_state"], animate=False)
        assert isinstance(result, ForgeResult)
        assert isinstance(result.fitness_history, list)
        assert isinstance(result.proof_hash, str)
        assert isinstance(result.timestamp, str)
        assert isinstance(result.qasm, str)
        assert "OPENQASM" in result.qasm

    def test_forge_proof_hash_unique(self):
        from dnalang_forge import DNALangForge, EXAMPLES
        forge = DNALangForge(seed=42)
        r1 = forge.forge(EXAMPLES["bell_state"], animate=False)
        r2 = forge.forge(EXAMPLES["ghz_state"], animate=False)
        assert r1.proof_hash != r2.proof_hash

    def test_forge_deterministic(self):
        from dnalang_forge import DNALangForge, EXAMPLES
        r1 = DNALangForge(seed=12345).forge(EXAMPLES["bell_state"], animate=False)
        r2 = DNALangForge(seed=12345).forge(EXAMPLES["bell_state"], animate=False)
        assert r1.evolved_fitness == r2.evolved_fitness
        assert r1.lineage_hash == r2.lineage_hash

    def test_examples_count(self):
        from dnalang_forge import EXAMPLES
        assert len(EXAMPLES) >= 5


class TestForgeExamples:
    """Test each built-in example organism."""

    @pytest.mark.parametrize("name", [
        "bell_state", "ghz_state", "grover_search",
        "therapeutic_target", "er_epr_bridge",
    ])
    def test_example_parses(self, name):
        from dnalang_compiler import parse_dna_lang
        from dnalang_forge import EXAMPLES
        organisms = parse_dna_lang(EXAMPLES[name])
        assert len(organisms) == 1

    @pytest.mark.parametrize("name", [
        "bell_state", "ghz_state", "grover_search",
        "therapeutic_target", "er_epr_bridge",
    ])
    def test_example_compiles(self, name):
        from dnalang_compiler import parse_dna_lang, IRCompiler
        from dnalang_forge import EXAMPLES
        org = parse_dna_lang(EXAMPLES[name])[0]
        circuit = IRCompiler().compile_organism(org)
        circuit.compute_metrics()
        assert circuit.qubit_count > 0
        assert circuit.gate_count > 0


# ═══════════════════════════════════════════════════════════════
# CLI INTENT INTEGRATION TESTS
# ═══════════════════════════════════════════════════════════════

class TestForgeIntents:
    def _parse(self, text):
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
        from sovereign_cli import Osiris, I
        return [(i, t, p) for i, t, p in Osiris().parse(text)]

    def test_forge_intent(self):
        from sovereign_cli import I
        results = self._parse("forge bell state")
        assert results[0][0] == I.FORGE

    def test_compile_dna_intent(self):
        from sovereign_cli import I
        results = self._parse("compile DNA organism")
        assert results[0][0] == I.FORGE

    def test_evolve_organism_intent(self):
        from sovereign_cli import I
        results = self._parse("evolve organism")
        assert results[0][0] == I.FORGE

    def test_dnalang_intent(self):
        from sovereign_cli import I
        results = self._parse("dnalang")
        assert results[0][0] == I.FORGE

    def test_self_evolving_intent(self):
        from sovereign_cli import I
        results = self._parse("run the forge")
        assert results[0][0] == I.FORGE


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
