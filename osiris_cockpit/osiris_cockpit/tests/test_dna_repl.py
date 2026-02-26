"""
Tests for DNA-Lang REPL Interpreter.

Tests cover:
  - DNA gate string parsing
  - Organism creation (create, dna commands)
  - Expression, mutation, evolution
  - Mitotic division
  - Symbiotic bonding
  - Info, list, metrics, export
  - Unknown command handling
  - Batch execution
"""

import sys
import os
import json
import tempfile
import pytest

sys.path.insert(0, os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..')
))

from dna_repl import (  # noqa: E402
    DnaRepl,
    parse_dna_string,
    DNA_GATE_MAP,
)

SEED = 51843


# ─── DNA Gate String Parsing ────────────────────────────────────────


class TestDNAParsing:
    def test_parse_basic(self):
        genes = parse_dna_string("HXZ")
        assert len(genes) == 3
        assert genes[0].name == "hadamard_0"
        assert genes[1].name == "pauli_x_1"

    def test_parse_all_gates(self):
        dna = "HXYZCTSR"
        genes = parse_dna_string(dna)
        assert len(genes) == 8

    def test_parse_ignores_unknown(self):
        genes = parse_dna_string("HABQ")
        # H and no other valid gates in "ABQ"
        assert len(genes) == 1

    def test_parse_empty(self):
        genes = parse_dna_string("")
        assert len(genes) == 0

    def test_expression_levels(self):
        genes = parse_dna_string("HC")
        assert 0.0 <= genes[0].expression <= 1.0
        assert 0.0 <= genes[1].expression <= 1.0

    def test_metadata_has_gate(self):
        genes = parse_dna_string("H")
        assert genes[0].metadata["gate"] == "H"


# ─── REPL Commands ──────────────────────────────────────────────────


class TestReplCreate:
    def test_create_organism(self):
        repl = DnaRepl(seed=SEED)
        out = repl.execute("create foo alpha beta gamma")
        assert "✅" in out
        assert "foo" in out
        assert "foo" in repl.organisms

    def test_create_too_few_args(self):
        repl = DnaRepl(seed=SEED)
        out = repl.execute("create")
        assert "Usage" in out

    def test_dna_create(self):
        repl = DnaRepl(seed=SEED)
        out = repl.execute("dna bar HXZCYT")
        assert "✅" in out
        assert "bar" in repl.organisms
        assert len(repl.organisms["bar"].genome) == 6

    def test_dna_invalid_sequence(self):
        repl = DnaRepl(seed=SEED)
        out = repl.execute("dna baz QQQQ")
        assert "❌" in out


class TestReplExpress:
    def test_express(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create foo alpha beta")
        out = repl.execute("express foo")
        assert "🔬" in out
        assert "alpha" in out

    def test_express_missing(self):
        repl = DnaRepl(seed=SEED)
        out = repl.execute("express nonexistent")
        assert "❌" in out


class TestReplMutate:
    def test_mutate(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create foo alpha beta gamma")
        out = repl.execute("mutate foo")
        assert "🧪" in out

    def test_mutate_with_rate(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create foo alpha beta gamma")
        out = repl.execute("mutate foo 0.5")
        assert "0.5" in out


class TestReplEvolve:
    def test_evolve(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create foo alpha beta gamma delta")
        out = repl.execute("evolve foo 3")
        assert "🧬" in out
        assert "fitness" in out.lower()

    def test_evolve_default_gens(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create bar x y z w")
        out = repl.execute("evolve bar")
        assert "🧬" in out


class TestReplDivide:
    def test_divide(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create cell g1 g2 g3 g4")
        out = repl.execute("divide cell")
        assert "🔀" in out
        # Should create two new organisms
        assert len(repl.organisms) >= 3

    def test_divide_one_gene_fails(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create tiny solo")
        out = repl.execute("divide tiny")
        assert "❌" in out


class TestReplBond:
    def test_bond(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create alice a1 a2 a3")
        repl.execute("create bob b1 b2 b3")
        out = repl.execute("bond alice bob")
        assert "🔗" in out

    def test_bond_missing_organism(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create alice a1 a2")
        out = repl.execute("bond alice nonexistent")
        assert "❌" in out


class TestReplInfo:
    def test_info(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create foo alpha beta")
        out = repl.execute("info foo")
        assert "📋" in out
        assert "foo" in out
        assert "alpha" in out

    def test_info_missing(self):
        repl = DnaRepl(seed=SEED)
        out = repl.execute("info missing")
        assert "❌" in out


class TestReplList:
    def test_list_empty(self):
        repl = DnaRepl(seed=SEED)
        out = repl.execute("list")
        assert "No organisms" in out

    def test_list_with_organisms(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create foo a b")
        repl.execute("create bar x y")
        out = repl.execute("list")
        assert "foo" in out
        assert "bar" in out


class TestReplMetrics:
    def test_metrics(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create foo alpha beta")
        out = repl.execute("metrics")
        assert "foo" in out
        assert "λΦ" in out or "Genes" in out


class TestReplExport:
    def test_export_to_stdout(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create foo alpha beta")
        out = repl.execute("export foo")
        data = json.loads(out)
        assert data["name"] == "foo"

    def test_export_to_file(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create foo alpha beta")
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as f:
            path = f.name
        try:
            out = repl.execute(f"export foo {path}")
            assert "📄" in out
            with open(path) as f:
                data = json.load(f)
            assert data["name"] == "foo"
        finally:
            os.unlink(path)


class TestReplHelp:
    def test_help(self):
        repl = DnaRepl(seed=SEED)
        out = repl.execute("help")
        assert "Commands" in out
        assert "create" in out
        assert "dna" in out


class TestReplQuit:
    def test_quit(self):
        repl = DnaRepl(seed=SEED)
        out = repl.execute("quit")
        assert "Goodbye" in out
        assert not repl._running

    def test_exit(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("exit")
        assert not repl._running


class TestReplEdgeCases:
    def test_unknown_command(self):
        repl = DnaRepl(seed=SEED)
        out = repl.execute("foobar")
        assert "Unknown command" in out

    def test_empty_input(self):
        repl = DnaRepl(seed=SEED)
        out = repl.execute("")
        assert out == ""

    def test_comment_ignored(self):
        repl = DnaRepl(seed=SEED)
        out = repl.execute("# this is a comment")
        assert out == ""

    def test_history_tracking(self):
        repl = DnaRepl(seed=SEED)
        repl.execute("create foo a b")
        repl.execute("info foo")
        assert len(repl.history) == 2


class TestReplBatch:
    def test_batch_execution(self):
        repl = DnaRepl(seed=SEED)
        lines = [
            "create foo alpha beta gamma",
            "mutate foo",
            "info foo",
            "list",
        ]
        outputs = repl.run_batch(lines)
        assert len(outputs) == 4
        assert "✅" in outputs[0]
        assert "🧪" in outputs[1]
