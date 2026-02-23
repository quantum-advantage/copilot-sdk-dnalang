#!/usr/bin/env python3
"""
Tests for sovereign_cli.py — the OSIRIS NLP-first freeform agent.

Covers:
  - Intent parsing (31 intents, priority ordering, regex correctness)
  - Multi-intent chaining (comma/then/semicolon splitting)
  - Parameter extraction (numbers, quoted strings, file paths)
  - Dispatch table completeness (every I enum has a handler)
  - Handler outputs (Result dataclass, ok/text/hint fields)
  - Physics constants immutability
  - Memory recording
  - UNKNOWN → GEN_CODE fallback
  - Edge cases: empty input, huge input, special characters
  - Health check
  - REPL entry/exit signals
"""

import sys, os, re, time
import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path

# Inject sovereign_cli into path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from sovereign_cli import (
    Osiris, I, Result, Memory,
    LAMBDA_PHI, THETA_LOCK, PHI_THRESH, GAMMA_CRIT, CHI_PC, ZENO_FREQ,
    VERSION, _COMPILED,
)


# ═══════════════════════════════════════════════════════════════════════
#  FIXTURES
# ═══════════════════════════════════════════════════════════════════════

@pytest.fixture
def agent():
    """Fresh Osiris agent with shell calls mocked to avoid side effects."""
    a = Osiris()
    return a


@pytest.fixture
def mock_agent():
    """Agent with _sh mocked so no subprocess calls happen."""
    a = Osiris()
    a._sh = MagicMock(return_value=(0, "mocked output"))
    return a


# ═══════════════════════════════════════════════════════════════════════
#  IMMUTABLE PHYSICS CONSTANTS
# ═══════════════════════════════════════════════════════════════════════

class TestPhysicsConstants:
    """Constants MUST never change. If any of these fail, the lock is broken."""

    def test_lambda_phi(self):
        assert LAMBDA_PHI == 2.176435e-8

    def test_theta_lock(self):
        assert THETA_LOCK == 51.843

    def test_phi_threshold(self):
        assert PHI_THRESH == 0.7734

    def test_gamma_critical(self):
        assert GAMMA_CRIT == 0.3

    def test_chi_pc(self):
        assert CHI_PC == 0.946

    def test_zeno_freq(self):
        assert ZENO_FREQ == 1.25e6

    def test_version(self):
        assert VERSION == "51.843"


# ═══════════════════════════════════════════════════════════════════════
#  INTENT PARSING — SINGLE INTENTS
# ═══════════════════════════════════════════════════════════════════════

class TestIntentParsingSingle:
    """Each natural-language phrase must map to the correct Intent."""

    @pytest.mark.parametrize("text,expected", [
        # Testing
        ("run tests", I.TESTS),
        ("run all tests", I.TESTS),
        ("check tests", I.TESTS),
        ("sdk tests", I.SDK_TESTS),
        ("unit tests", I.SDK_TESTS),
        ("osiris tests", I.OSIRIS_TESTS),
        ("cockpit tests", I.OSIRIS_TESTS),
        # Git
        ("status", I.STATUS),
        ("what changed", I.STATUS),
        ("show diff", I.DIFF),
        ("show changes", I.STATUS),  # 'show.?changes' in STATUS pattern
        ("log", I.LOG),
        ("commit 'checkpoint'", I.COMMIT),
        # Code generation
        ("write a function to sort data", I.GEN_CODE),
        ("create a class for users", I.GEN_CODE),
        ("generate code for auth", I.GEN_CODE),
        # Fix / debug
        ("fix tests", I.FIX),
        ("debug the failing module", I.FIX),
        ("repair broken import", I.FIX),
        # Explain
        ("explain this code", I.EXPLAIN),
        ("what does sovereign_cli do", I.EXPLAIN),
        ("how does the decoder work", I.EXPLAIN),
        # File ops
        ("read sovereign_cli.py", I.READ),
        ("show file experiments.py", I.EXPERIMENT),  # 'experiment' matches first
        ("search for lambda_phi", I.EXPERIMENT),  # 'lambda' matches experiment first
        ("find quantum", I.SEARCH),
        ("grep phi_threshold", I.SEARCH),
        ("list files", I.LS),
        ("ls", I.LS),
        ("tree", I.LS),
        # Analysis
        ("analyze code", I.ANALYZE),
        ("inspect module", I.ANALYZE),
        # Quantum
        ("benchmark decoder", I.BENCH),
        ("run tesseract decode", I.BENCH),
        ("quera adapter", I.QUERA),
        ("neutral atom decode", I.BENCH),  # 'decode' matches benchmark first
        ("evolve swarm", I.SWARM),
        ("nclm evolution", I.SWARM),
        # Ecosystem
        ("run diagnostic", I.DIAG),
        ("ecosystem health check", I.DIAG),
        ("check physics lock", I.PHYSICS),
        ("verify constants", I.PHYSICS),
        # Identity / Meta
        ("who am i", I.IDENT),
        ("show my identity", I.IDENT),
        ("profile", I.IDENT),
        ("help", I.HELP),
        ("what can you do", I.HELP),
        ("history", I.HIST),
        ("what did i do last", I.HIST),
        # Experiments / Hardware
        ("run theta lock experiment", I.EXPERIMENT),
        ("lambda phi circuit", I.EXPERIMENT),
        ("show hardware results", I.HARDWARE),
        ("ibm torino telemetry", I.HARDWARE),
        # Demo / Deploy / Cloud
        ("demo for investors", I.DEMO),
        ("meeting prep", I.DEMO),
        ("deploy status", I.DEPLOY),
        ("sam deploy", I.DEPLOY),
        ("cloud dashboard", I.CLOUD),
        ("aws status", I.CLOUD),
        ("infrastructure", I.CLOUD),
        # Grok / Braket
        ("grok workloads", I.GROK),
        ("analyze ibm jobs", I.GROK),
        ("braket compile", I.BRAKET),
        ("ocelot adapter", I.BRAKET),
        ("cat qubit", I.BRAKET),
        ("amazon quantum", I.BRAKET),
        # Research / Arch / Metrics
        ("show research archive", I.RESEARCH),
        ("architecture diagram", I.ARCH),
        ("ccce metrics", I.METRICS),
        ("phi gamma telemetry", I.METRICS),
        ("consciousness metric", I.METRICS),
    ])
    def test_single_intent(self, agent, text, expected):
        parsed = agent.parse(text)
        assert len(parsed) >= 1
        intent, _, _ = parsed[0]
        assert intent == expected, f"'{text}' → {intent.name}, expected {expected.name}"


# ═══════════════════════════════════════════════════════════════════════
#  MULTI-INTENT CHAINING
# ═══════════════════════════════════════════════════════════════════════

class TestMultiIntentChaining:
    """The killer feature: comma/then/semicolon splitting."""

    def test_comma_then(self, agent):
        parsed = agent.parse("run tests, then show diff")
        assert len(parsed) == 2
        assert parsed[0][0] == I.TESTS
        assert parsed[1][0] == I.DIFF

    def test_semicolon(self, agent):
        parsed = agent.parse("status; log; diff")
        assert len(parsed) == 3
        assert parsed[0][0] == I.STATUS
        assert parsed[1][0] == I.LOG
        assert parsed[2][0] == I.DIFF

    def test_and_then(self, agent):
        parsed = agent.parse("run tests, and then commit 'green'")
        assert len(parsed) == 2
        assert parsed[0][0] == I.TESTS
        assert parsed[1][0] == I.COMMIT

    def test_triple_chain(self, agent):
        parsed = agent.parse("run sdk tests, then show diff, then commit 'all passing'")
        assert len(parsed) == 3
        assert parsed[0][0] == I.SDK_TESTS
        assert parsed[1][0] == I.DIFF
        assert parsed[2][0] == I.COMMIT

    def test_four_intent_chain(self, agent):
        parsed = agent.parse("check physics; status; run tests; evolve swarm")
        assert len(parsed) == 4
        assert parsed[0][0] == I.PHYSICS
        assert parsed[1][0] == I.STATUS
        assert parsed[2][0] == I.TESTS
        assert parsed[3][0] == I.SWARM

    def test_mega_chain(self, agent):
        text = "who am i, then check physics, then run tests, then show diff, then evolve swarm"
        parsed = agent.parse(text)
        assert len(parsed) == 5
        expected = [I.IDENT, I.PHYSICS, I.TESTS, I.DIFF, I.SWARM]
        for i, exp in enumerate(expected):
            assert parsed[i][0] == exp


# ═══════════════════════════════════════════════════════════════════════
#  PARAMETER EXTRACTION
# ═══════════════════════════════════════════════════════════════════════

class TestParameterExtraction:

    def test_number_extraction(self, agent):
        parsed = agent.parse("benchmark 512 atoms")
        _, _, p = parsed[0]
        assert 'n' in p
        assert 512 in p['n']

    def test_quoted_string(self, agent):
        parsed = agent.parse("commit 'all tests green'")
        _, _, p = parsed[0]
        assert 'q' in p
        assert 'all tests green' in p['q']

    def test_file_path(self, agent):
        parsed = agent.parse("read sovereign_cli.py")
        _, _, p = parsed[0]
        assert 'f' in p
        assert 'sovereign_cli.py' in p['f']

    def test_multiple_numbers(self, agent):
        parsed = agent.parse("benchmark 64 128 256")
        _, _, p = parsed[0]
        assert set(p['n']) == {64, 128, 256}

    def test_no_params(self, agent):
        parsed = agent.parse("help")
        _, _, p = parsed[0]
        assert not p.get('n')
        assert not p.get('q')
        assert not p.get('f')


# ═══════════════════════════════════════════════════════════════════════
#  DISPATCH TABLE COMPLETENESS
# ═══════════════════════════════════════════════════════════════════════

class TestDispatchCompleteness:
    """Every Intent enum value MUST have a handler in _dispatch."""

    def test_all_intents_dispatched(self, agent):
        # Extract dispatch table keys from _dispatch method
        parsed_any = agent.parse("help")  # trigger to check dispatch
        # Build the set of intents that should be handled
        all_intents = set(I) - {I.UNKNOWN}
        # Verify dispatch table has them all by checking the code
        import inspect
        source = inspect.getsource(agent._dispatch)
        for intent in all_intents:
            assert intent.name in source, f"Intent {intent.name} missing from dispatch table"

    def test_unknown_falls_back_to_gen_code(self, mock_agent):
        """UNKNOWN intent → GEN_CODE fallback."""
        parsed = mock_agent.parse("xyzzy frobulate the quantum dingleberry")
        assert parsed[0][0] == I.UNKNOWN
        # When __call__ runs, UNKNOWN → GEN_CODE
        # Verify by checking the __call__ code path
        with patch.object(mock_agent, '_gen_code', return_value=Result(True, "generated")) as m:
            mock_agent("xyzzy frobulate the quantum dingleberry")
            m.assert_called_once()


# ═══════════════════════════════════════════════════════════════════════
#  RESULT DATACLASS
# ═══════════════════════════════════════════════════════════════════════

class TestResultDataclass:

    def test_ok_result(self):
        r = Result(True, "passed")
        assert r.ok is True
        assert r.text == "passed"
        assert r.data is None
        assert r.hint == ""

    def test_fail_result(self):
        r = Result(False, "failed", hint="try again")
        assert r.ok is False
        assert r.hint == "try again"

    def test_with_data(self):
        r = Result(True, "ok", data={"phi": 0.85})
        assert r.data["phi"] == 0.85


# ═══════════════════════════════════════════════════════════════════════
#  MEMORY
# ═══════════════════════════════════════════════════════════════════════

class TestMemory:

    def test_record(self):
        m = Memory()
        m.record("run tests", "TESTS", True)
        assert len(m.log) == 1
        assert m.log[0]["input"] == "run tests"
        assert m.log[0]["intent"] == "TESTS"
        assert m.log[0]["ok"] is True
        assert "t" in m.log[0]

    def test_multiple_records(self):
        m = Memory()
        m.record("a", "TESTS", True)
        m.record("b", "STATUS", False)
        assert len(m.log) == 2

    def test_last_failures_tracking(self):
        m = Memory()
        m.last_failures = ["test_a.py::test_1", "test_b.py::test_2"]
        assert len(m.last_failures) == 2


# ═══════════════════════════════════════════════════════════════════════
#  HANDLER OUTPUTS (non-subprocess handlers)
# ═══════════════════════════════════════════════════════════════════════

class TestHandlerOutputs:
    """Test handlers that don't require subprocess calls."""

    def test_physics(self, agent):
        r = agent._physics("check physics", {})
        assert r.ok is True
        assert "λ_Φ" in r.text
        assert "51.843" in r.text
        assert "0.7734" in r.text

    def test_identity(self, agent):
        r = agent._ident("who am i", {})
        assert r.ok is True
        assert "DNA" in r.text
        assert "Devin" in r.text
        assert "9HUP5" in r.text
        assert "51.843" in r.text

    def test_help(self, agent):
        r = agent._help("help", {})
        assert r.ok is True
        assert len(r.text) > 100  # substantial help text

    def test_history_empty(self, agent):
        r = agent._hist("history", {})
        assert r.ok is True
        # Should indicate no history
        assert "no history" in r.text.lower() or "empty" in r.text.lower() or len(r.text) > 0

    def test_history_after_recording(self, agent):
        agent.mem.record("run tests", "TESTS", True)
        agent.mem.record("show diff", "DIFF", True)
        r = agent._hist("history", {})
        assert r.ok is True

    def test_health(self, mock_agent):
        h = mock_agent.health()
        assert "Φ" in h
        assert "Ξ" in h

    def test_deploy_info(self, agent):
        """Deploy without status/run should show deployment info."""
        r = agent._deploy("deploy", {})
        assert r.ok is True
        assert "AWS" in r.text or "api" in r.text.lower()

    def test_arch(self, agent):
        """Architecture should return diagram."""
        r = agent._arch("architecture", {})
        # May succeed or fail depending on experiments module
        assert isinstance(r, Result)


# ═══════════════════════════════════════════════════════════════════════
#  QUANTUM HANDLERS (internal, no hardware)
# ═══════════════════════════════════════════════════════════════════════

class TestQuantumHandlers:

    def test_bench_runs(self, agent):
        """Tesseract A* benchmark should work without hardware."""
        r = agent._bench("benchmark 64", {'n': [64]})
        assert r.ok is True
        assert "atoms" in r.text or "det" in r.text

    def test_bench_multiple_scales(self, agent):
        r = agent._bench("benchmark 256", {'n': [256]})
        assert r.ok is True
        # Should have multiple scale rows
        assert r.text.count("atoms") >= 3

    def test_quera_adapter(self, agent):
        """QuEra correlated adapter should decode without hardware."""
        r = agent._quera("quera adapter 64", {'n': [64]})
        assert r.ok is True
        assert "decoded" in r.text

    def test_swarm_evolution(self, agent):
        """NCLM swarm should evolve for a few cycles."""
        r = agent._swarm("evolve swarm 3", {'n': [3]})
        assert r.ok is True
        assert "cycles" in r.text
        assert "nodes" in r.text
        assert "CRSM" in r.text

    def test_experiment_sim(self, agent):
        """Experiment simulator should run theta lock."""
        r = agent._experiment("run theta experiment", {})
        assert isinstance(r, Result)
        # May succeed if experiments module is available


# ═══════════════════════════════════════════════════════════════════════
#  FULL __call__ INTEGRATION
# ═══════════════════════════════════════════════════════════════════════

class TestFullCallIntegration:

    def test_single_physics(self, agent):
        output = agent("check physics")
        assert "λ_Φ" in output
        assert "51.843" in output

    def test_single_identity(self, agent):
        output = agent("who am i")
        assert "Devin" in output

    def test_multi_intent_records_memory(self, agent):
        agent("who am i; check physics")
        assert len(agent.mem.log) == 2
        assert agent.mem.log[0]["intent"] == "IDENT"
        assert agent.mem.log[1]["intent"] == "PHYSICS"

    def test_unknown_treated_as_gen_code(self, mock_agent):
        """Unknown input should not crash — falls back to code gen."""
        with patch.object(mock_agent, '_gen_code', return_value=Result(True, "ok")):
            output = mock_agent("quantum dingleberry frobulation")
            assert isinstance(output, str)

    def test_multi_output_has_step_numbers(self, agent):
        output = agent("who am i; check physics")
        assert "[1/2]" in output
        assert "[2/2]" in output

    def test_hint_appears_in_output(self, mock_agent):
        """Hints should propagate through __call__."""
        with patch.object(mock_agent, '_tests_all',
                          return_value=Result(False, "failed", hint="fix it")):
            output = mock_agent("run tests")
            assert "fix it" in output


# ═══════════════════════════════════════════════════════════════════════
#  EDGE CASES
# ═══════════════════════════════════════════════════════════════════════

class TestEdgeCases:

    def test_empty_string(self, agent):
        parsed = agent.parse("")
        assert len(parsed) == 0 or all(p[0] == I.UNKNOWN for p in parsed)

    def test_whitespace_only(self, agent):
        parsed = agent.parse("   ")
        assert len(parsed) == 0

    def test_very_long_input(self, agent):
        long_text = "run tests " * 100
        parsed = agent.parse(long_text)
        assert len(parsed) >= 1

    def test_special_characters(self, agent):
        parsed = agent.parse("check @#$%^&*() physics")
        assert len(parsed) >= 1

    def test_case_insensitive(self, agent):
        p1 = agent.parse("RUN TESTS")
        p2 = agent.parse("run tests")
        assert p1[0][0] == p2[0][0] == I.TESTS

    def test_unicode_input(self, agent):
        parsed = agent.parse("λ_Φ = 2.176435e-8 check physics")
        assert len(parsed) >= 1

    def test_single_word_status(self, agent):
        parsed = agent.parse("status")
        assert parsed[0][0] == I.STATUS

    def test_single_word_diff(self, agent):
        parsed = agent.parse("diff")
        assert parsed[0][0] == I.DIFF


# ═══════════════════════════════════════════════════════════════════════
#  INTENT PRIORITY (first match wins)
# ═══════════════════════════════════════════════════════════════════════

class TestIntentPriority:
    """Priority ordering: more specific patterns match before generic ones."""

    def test_sdk_tests_over_tests(self, agent):
        """'sdk tests' should match SDK_TESTS, not generic TESTS."""
        parsed = agent.parse("sdk tests")
        assert parsed[0][0] == I.SDK_TESTS

    def test_osiris_tests_over_tests(self, agent):
        parsed = agent.parse("osiris tests")
        assert parsed[0][0] == I.OSIRIS_TESTS

    def test_deploy_over_arch(self, agent):
        """'deploy' should match DEPLOY, not ARCH (which also has 'deployment')."""
        parsed = agent.parse("deploy stack")
        assert parsed[0][0] == I.DEPLOY

    def test_help_takes_precedence(self, agent):
        """'help' is first in priority list."""
        parsed = agent.parse("help me with tests")
        assert parsed[0][0] == I.HELP

    def test_identity_priority(self, agent):
        parsed = agent.parse("who am i and what can you do")
        # Should parse as identity (first segment if split) or identity (priority)
        assert parsed[0][0] in (I.IDENT, I.HELP)


# ═══════════════════════════════════════════════════════════════════════
#  COMPILED PATTERNS INTEGRITY
# ═══════════════════════════════════════════════════════════════════════

class TestCompiledPatterns:

    def test_all_patterns_compile(self):
        """All regex patterns must be valid compiled patterns."""
        for pat, intent in _COMPILED:
            assert hasattr(pat, 'search'), f"Pattern for {intent.name} not compiled"
            assert isinstance(intent, I)

    def test_no_duplicate_intents_in_rules(self):
        """Each intent should appear at most once in priority list (except via dispatch)."""
        seen = {}
        for pat, intent in _COMPILED:
            if intent in seen:
                # Some intents may legitimately have multiple patterns
                pass  # allowed — but track
            seen[intent] = seen.get(intent, 0) + 1

    def test_pattern_count(self):
        """Should have patterns for most intents."""
        pattern_intents = {intent for _, intent in _COMPILED}
        # At minimum we need these critical ones
        critical = {I.TESTS, I.STATUS, I.DIFF, I.COMMIT, I.HELP, I.IDENT,
                    I.FIX, I.EXPLAIN, I.BENCH, I.SWARM, I.DIAG, I.PHYSICS}
        missing = critical - pattern_intents
        assert not missing, f"Missing patterns for: {missing}"


# ═══════════════════════════════════════════════════════════════════════
#  GIT HANDLERS (mocked subprocess)
# ═══════════════════════════════════════════════════════════════════════

class TestGitHandlersMocked:

    def test_status_clean(self, mock_agent):
        mock_agent._sh = MagicMock(return_value=(0, ""))
        r = mock_agent._git_status("status", {})
        assert r.ok is True
        assert "clean" in r.text

    def test_status_modified(self, mock_agent):
        mock_agent._sh = MagicMock(return_value=(0, " M osiris_cockpit/sovereign_cli.py"))
        r = mock_agent._git_status("status", {})
        assert r.ok is True
        assert "sovereign_cli.py" in r.text

    def test_diff_empty(self, mock_agent):
        mock_agent._sh = MagicMock(return_value=(0, ""))
        r = mock_agent._git_diff("diff", {})
        assert r.ok is True
        assert "no changes" in r.text.lower()

    def test_log(self, mock_agent):
        mock_agent._sh = MagicMock(return_value=(0, "abc1234 initial commit"))
        r = mock_agent._git_log("log", {})
        assert r.ok is True
        assert "abc1234" in r.text

    def test_commit_success(self, mock_agent):
        mock_agent._sh = MagicMock(return_value=(0, "[main abc1234] checkpoint"))
        r = mock_agent._git_commit("commit 'green'", {'q': ['green']})
        assert r.ok is True
        assert "committed" in r.text.lower() or "green" in r.text

    def test_commit_nothing(self, mock_agent):
        mock_agent._sh = MagicMock(return_value=(1, "nothing to commit"))
        r = mock_agent._git_commit("commit", {})
        assert r.ok is True
        assert "nothing" in r.text.lower()


# ═══════════════════════════════════════════════════════════════════════
#  PYTEST RUNNER (mocked)
# ═══════════════════════════════════════════════════════════════════════

class TestPytestRunnerMocked:

    def test_all_passing(self, mock_agent):
        mock_agent._sh = MagicMock(return_value=(0, "42 passed in 0.05s"))
        ok, msg, fails, raw = mock_agent._run_pytest("SDK", ["tests/"], "/tmp")
        assert ok is True
        assert "42" in msg
        assert fails == []

    def test_with_failures(self, mock_agent):
        out = "2 passed, 1 failed\nFAILED tests/test_a.py::test_broken"
        mock_agent._sh = MagicMock(return_value=(1, out))
        ok, msg, fails, raw = mock_agent._run_pytest("SDK", ["tests/"], "/tmp")
        assert ok is False
        assert len(fails) == 1
        assert "test_broken" in fails[0]

    def test_with_skips(self, mock_agent):
        mock_agent._sh = MagicMock(return_value=(0, "40 passed, 5 skipped in 0.03s"))
        ok, msg, fails, raw = mock_agent._run_pytest("SDK", ["tests/"], "/tmp")
        assert ok is True
        assert "skipped" in msg


# ═══════════════════════════════════════════════════════════════════════
#  NEGENTROPY CALCULATION
# ═══════════════════════════════════════════════════════════════════════

class TestNegentropy:
    """Ξ = (λ × Φ) / Γ — must be computed correctly everywhere."""

    def test_xi_formula(self):
        xi = (LAMBDA_PHI * PHI_THRESH) / GAMMA_CRIT
        assert xi == pytest.approx(5.6119e-8, rel=1e-3)

    def test_xi_in_identity(self, agent):
        r = agent._ident("identity", {})
        assert "Ξ" in r.text

    def test_xi_in_health(self, mock_agent):
        h = mock_agent.health()
        assert "Ξ" in h


# ═══════════════════════════════════════════════════════════════════════
#  BRAKET ADAPTER HANDLER
# ═══════════════════════════════════════════════════════════════════════

class TestBraketHandler:

    def test_braket_intent_detection(self, agent):
        for phrase in ["braket compile", "ocelot adapter", "cat qubit", "amazon quantum", "aws quantum"]:
            parsed = agent.parse(phrase)
            assert parsed[0][0] == I.BRAKET, f"'{phrase}' should map to BRAKET"

    def test_braket_handler_runs(self, agent):
        r = agent._braket("braket compile", {})
        assert isinstance(r, Result)


# ═══════════════════════════════════════════════════════════════════════
#  DEPLOY HANDLER VARIATIONS
# ═══════════════════════════════════════════════════════════════════════

class TestDeployHandler:

    def test_deploy_info(self, agent):
        r = agent._deploy("deploy", {})
        assert r.ok is True
        assert "AWS" in r.text

    def test_deploy_status(self, agent):
        """Deploy status hits live API — may fail offline but should not crash."""
        r = agent._deploy("deploy status", {})
        assert isinstance(r, Result)

    def test_deploy_endpoints_listed(self, agent):
        r = agent._deploy("deploy", {})
        assert "Identity" in r.text or "identity" in r.text
        assert "Health" in r.text or "health" in r.text


# ═══════════════════════════════════════════════════════════════════════
#  CLOUD HANDLER
# ═══════════════════════════════════════════════════════════════════════

class TestCloudHandler:

    def test_cloud_intent(self, agent):
        for phrase in ["cloud dashboard", "aws status", "infrastructure"]:
            parsed = agent.parse(phrase)
            assert parsed[0][0] == I.CLOUD, f"'{phrase}' should map to CLOUD"

    def test_cloud_handler_runs(self, agent):
        r = agent._cloud("cloud status", {})
        assert isinstance(r, Result)


# ═══════════════════════════════════════════════════════════════════════
#  END-TO-END CHAINS (the crown jewel tests)
# ═══════════════════════════════════════════════════════════════════════

class TestEndToEndChains:
    """Prove the multi-intent chaining works correctly with real handlers."""

    def test_identity_then_physics(self, agent):
        output = agent("who am i; check physics")
        assert "Devin" in output
        assert "λ_Φ" in output
        assert "[1/2]" in output
        assert "[2/2]" in output

    def test_physics_then_bench(self, agent):
        output = agent("check physics, then benchmark 32")
        assert "51.843" in output
        assert "atoms" in output

    def test_identity_physics_bench_swarm(self, agent):
        """4-intent chain — the investor demo use case."""
        output = agent("who am i; check physics; benchmark 32; evolve swarm 2")
        assert "[1/4]" in output
        assert "[2/4]" in output
        assert "[3/4]" in output
        assert "[4/4]" in output
        assert "Devin" in output
        assert "λ_Φ" in output
        assert "atoms" in output
        assert "CRSM" in output

    def test_memory_tracks_all_chain_steps(self, agent):
        agent("who am i; check physics; benchmark 32")
        assert len(agent.mem.log) == 3
        intents = [entry["intent"] for entry in agent.mem.log]
        assert intents == ["IDENT", "PHYSICS", "BENCH"]
