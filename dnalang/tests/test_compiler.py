"""Tests for DNA-Lang Compiler v2 pipeline."""
import pytest


class TestLexer:
    def test_tokenize_basic(self):
        from dnalang_sdk.compiler import Lexer, TokenType
        lexer = Lexer("organism test { genome { gene init { express 0.8 } } }")
        tokens = lexer.tokenize()
        assert len(tokens) > 0
        types = [t.type for t in tokens]
        assert TokenType.KEYWORD in types or TokenType.IDENTIFIER in types

    def test_tokenize_empty(self):
        from dnalang_sdk.compiler import Lexer
        tokens = Lexer("").tokenize()
        assert isinstance(tokens, list)

    def test_tokenize_numbers(self):
        from dnalang_sdk.compiler import Lexer, TokenType
        tokens = Lexer("0.7734 51.843 2.176435e-8").tokenize()
        nums = [t for t in tokens if t.type == TokenType.NUMBER]
        assert len(nums) >= 3


class TestParser:
    def test_parser_instantiation(self):
        from dnalang_sdk.compiler import Lexer, Parser
        tokens = Lexer("organism test {}").tokenize()
        parser = Parser(tokens)
        assert parser is not None


class TestIRCompiler:
    def test_compiler_instantiation(self):
        from dnalang_sdk.compiler import IRCompiler
        compiler = IRCompiler()
        assert compiler is not None

    def test_ir_op_types(self):
        from dnalang_sdk.compiler import IROpType
        assert len(list(IROpType)) > 0


class TestEvolver:
    def test_fitness_evaluator(self):
        from dnalang_sdk.compiler import FitnessEvaluator
        evaluator = FitnessEvaluator()
        assert evaluator is not None

    def test_evolution_result(self):
        from dnalang_sdk.compiler import EvolutionResult
        assert EvolutionResult is not None


class TestRuntime:
    def test_runtime_config(self):
        from dnalang_sdk.compiler import RuntimeConfig
        config = RuntimeConfig()
        assert config is not None

    def test_execution_result(self):
        from dnalang_sdk.compiler import ExecutionResult
        assert ExecutionResult is not None


class TestLedger:
    def test_quantum_ledger(self):
        from dnalang_sdk.compiler import QuantumLedger
        ledger = QuantumLedger()
        assert ledger is not None

    def test_lineage_entry(self):
        from dnalang_sdk.compiler import LineageEntry
        assert LineageEntry is not None
