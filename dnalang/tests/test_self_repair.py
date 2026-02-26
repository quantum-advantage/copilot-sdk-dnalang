"""
Tests for dnalang_sdk.self_repair — autonomous error recovery, token discovery,
and the OsirisInferenceEngine (infer · interpret · resolve).
"""

import os
import json
import tempfile
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock

from dnalang_sdk.self_repair import (
    discover_ibm_token,
    ensure_ibm_token,
    export_token,
    parse_error,
    ErrorSignature,
    SelfRepairEngine,
    OsirisInferenceEngine,
    with_self_repair,
    _TOKEN_ENV_VARS,
    _TOKEN_SEARCH_PATHS,
)


# ═══════════════════════════════════════════════════════════════════════
#  TOKEN DISCOVERY
# ═══════════════════════════════════════════════════════════════════════


class TestDiscoverIBMToken:
    """Token discovery from env vars and files."""

    def test_finds_token_from_env_var(self):
        with patch.dict(os.environ, {"IBM_QUANTUM_TOKEN": "test_token_12345678"}):
            token = discover_ibm_token()
            assert token == "test_token_12345678"

    def test_finds_token_from_secondary_env_var(self):
        env = {"IBM_QUANTUM_TOKEN": "", "IBMQ_TOKEN": "secondary_token_abc"}
        with patch.dict(os.environ, env, clear=False):
            token = discover_ibm_token()
            assert token == "secondary_token_abc"

    def test_skips_short_tokens(self):
        with patch.dict(os.environ, {"IBM_QUANTUM_TOKEN": "short"}, clear=False):
            # Short tokens (<=10 chars) are rejected
            token = discover_ibm_token()
            # Should skip and try other sources
            assert token is None or token != "short"

    def test_finds_token_from_apikey_json(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            apikey_path = Path(tmpdir) / "apikey.json"
            apikey_path.write_text(json.dumps({"apikey": "file_token_12345678"}))

            with patch.dict(os.environ, {"IBM_QUANTUM_TOKEN": ""}, clear=False):
                with patch(
                    "dnalang_sdk.self_repair._TOKEN_SEARCH_PATHS",
                    [apikey_path],
                ):
                    token = discover_ibm_token()
                    assert token == "file_token_12345678"

    def test_handles_malformed_json(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            bad = Path(tmpdir) / "apikey.json"
            bad.write_text("not json {{{")

            with patch.dict(os.environ, {
                "IBM_QUANTUM_TOKEN": "",
                "IBMQ_TOKEN": "",
                "QISKIT_IBM_TOKEN": "",
                "IBM_CLOUD_API_KEY": "",
            }, clear=False):
                with patch(
                    "dnalang_sdk.self_repair._TOKEN_SEARCH_PATHS",
                    [bad],
                ):
                    with patch(
                        "pathlib.Path.home",
                        return_value=Path("/nonexistent_xyz"),
                    ):
                        token = discover_ibm_token()
                        # Should not crash, just skip
                        assert token is None

    def test_finds_token_in_qiskit_creds(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            qiskit_json = Path(tmpdir) / "qiskit-ibm.json"
            qiskit_json.write_text(json.dumps({
                "ibm_quantum": {"token": "qiskit_saved_token_123"}
            }))

            with patch.dict(os.environ, {"IBM_QUANTUM_TOKEN": ""}, clear=False):
                with patch(
                    "dnalang_sdk.self_repair._TOKEN_SEARCH_PATHS", []
                ):
                    with patch(
                        "pathlib.Path.home",
                        return_value=Path(tmpdir),
                    ):
                        # Need qiskit-ibm.json in tmpdir/.qiskit/
                        qiskit_dir = Path(tmpdir) / ".qiskit"
                        qiskit_dir.mkdir()
                        (qiskit_dir / "qiskit-ibm.json").write_text(
                            json.dumps({
                                "ibm_quantum": {"token": "qiskit_saved_token_123"}
                            })
                        )
                        token = discover_ibm_token()
                        assert token == "qiskit_saved_token_123"

    def test_returns_none_when_nothing_found(self):
        with patch.dict(os.environ, {
            "IBM_QUANTUM_TOKEN": "",
            "IBMQ_TOKEN": "",
            "QISKIT_IBM_TOKEN": "",
            "IBM_CLOUD_API_KEY": "",
        }, clear=False):
            with patch(
                "dnalang_sdk.self_repair._TOKEN_SEARCH_PATHS", []
            ):
                with patch(
                    "pathlib.Path.home",
                    return_value=Path("/nonexistent_path_xyz"),
                ):
                    token = discover_ibm_token()
                    assert token is None

    def test_verbose_logging(self):
        with patch.dict(os.environ, {"IBM_QUANTUM_TOKEN": "verbose_test_token_abc"}):
            # verbose=True should not crash
            token = discover_ibm_token(verbose=True)
            assert token == "verbose_test_token_abc"

    def test_priority_order(self):
        """First env var found wins."""
        env = {
            "IBM_QUANTUM_TOKEN": "first_token_12345678",
            "IBMQ_TOKEN": "second_token_12345678",
        }
        with patch.dict(os.environ, env, clear=False):
            token = discover_ibm_token()
            assert token == "first_token_12345678"

    def test_supports_api_key_json_key(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            apikey_path = Path(tmpdir) / "apikey.json"
            apikey_path.write_text(json.dumps({"api_key": "alt_key_format_12345"}))

            with patch.dict(os.environ, {"IBM_QUANTUM_TOKEN": ""}, clear=False):
                with patch(
                    "dnalang_sdk.self_repair._TOKEN_SEARCH_PATHS",
                    [apikey_path],
                ):
                    token = discover_ibm_token()
                    assert token == "alt_key_format_12345"


class TestEnsureIBMToken:
    """ensure_ibm_token auto-discovers and exports."""

    def test_already_set(self):
        with patch.dict(os.environ, {"IBM_QUANTUM_TOKEN": "existing_token_12345678"}):
            ok, msg = ensure_ibm_token()
            assert ok is True
            assert "already set" in msg

    def test_auto_discovers_and_exports(self):
        with patch.dict(os.environ, {"IBM_QUANTUM_TOKEN": ""}, clear=False):
            with patch(
                "dnalang_sdk.self_repair.discover_ibm_token",
                return_value="discovered_token_12345",
            ):
                ok, msg = ensure_ibm_token()
                assert ok is True
                assert "auto-discovered" in msg
                assert os.environ["IBM_QUANTUM_TOKEN"] == "discovered_token_12345"

    def test_returns_false_when_not_found(self):
        with patch.dict(os.environ, {"IBM_QUANTUM_TOKEN": ""}, clear=False):
            with patch(
                "dnalang_sdk.self_repair.discover_ibm_token",
                return_value=None,
            ):
                ok, msg = ensure_ibm_token()
                assert ok is False
                assert "no ibm quantum token" in msg.lower()


class TestExportToken:
    def test_sets_env_var(self):
        with patch.dict(os.environ, {}, clear=False):
            export_token("my_export_token")
            assert os.environ["IBM_QUANTUM_TOKEN"] == "my_export_token"


# ═══════════════════════════════════════════════════════════════════════
#  ERROR ANALYSIS
# ═══════════════════════════════════════════════════════════════════════


class TestParseError:
    """parse_error extracts ErrorSignatures from tracebacks."""

    def test_parse_import_error(self):
        sig = parse_error("ModuleNotFoundError: No module named 'qiskit'")
        assert sig.error_type == "ModuleNotFoundError"
        assert sig.category == "IMPORT"
        assert "qiskit" in sig.message

    def test_parse_token_error(self):
        sig = parse_error("AuthenticationError: Invalid API token provided")
        assert sig.category == "TOKEN"
        assert sig.fix_strategy == "discover_and_inject_token"

    def test_parse_attribute_error(self):
        sig = parse_error("AttributeError: 'Foo' object has no attribute 'bar'")
        assert sig.category == "ATTRIBUTE"
        assert sig.fix_strategy == "patch_missing_attribute"

    def test_parse_timeout_error(self):
        sig = parse_error("TimeoutError: Connection timed out after 30s")
        assert sig.category == "TIMEOUT"

    def test_parse_network_error(self):
        sig = parse_error("ConnectionRefusedError: Connection refused by server")
        assert sig.category == "NETWORK"

    def test_parse_permission_error(self):
        sig = parse_error("PermissionError: Permission denied: '/root/data'")
        assert sig.category == "PERMISSION"

    def test_parse_file_not_found(self):
        sig = parse_error("FileNotFoundError: No such file or directory: 'test.py'")
        assert sig.category == "FILE_NOT_FOUND"

    def test_parse_syntax_error(self):
        sig = parse_error("SyntaxError: invalid syntax")
        assert sig.category == "SYNTAX"

    def test_parse_key_error(self):
        sig = parse_error("KeyError: 'missing_key'")
        assert sig.category == "KEY"

    def test_parse_unknown_error(self):
        sig = parse_error("RuntimeError: something weird happened")
        assert sig.category == "UNKNOWN"

    def test_parse_no_match(self):
        sig = parse_error("just some random text")
        assert sig.error_type == "UnknownError"
        assert sig.category == "UNKNOWN"

    def test_parse_multiline_traceback(self):
        tb = """Traceback (most recent call last):
  File "test.py", line 10, in <module>
    import qiskit
ModuleNotFoundError: No module named 'qiskit'"""
        sig = parse_error(tb)
        assert sig.category == "IMPORT"
        assert "qiskit" in sig.message


class TestErrorSignature:
    """ErrorSignature classification and fix strategy mapping."""

    def test_token_category(self):
        sig = ErrorSignature("Error", "Invalid API token")
        assert sig.category == "TOKEN"

    def test_credential_category(self):
        sig = ErrorSignature("Error", "Bad credential")
        assert sig.category == "TOKEN"

    def test_auth_category(self):
        sig = ErrorSignature("Error", "Authentication failed")
        assert sig.category == "TOKEN"

    def test_import_error_type(self):
        sig = ErrorSignature("ImportError", "cannot import name 'foo'")
        assert sig.category == "IMPORT"

    def test_argument_type(self):
        sig = ErrorSignature("TypeError", "unexpected keyword argument 'foo'")
        assert sig.category == "ARGUMENT"

    def test_fix_strategy_maps_correctly(self):
        strategies = {
            "TOKEN": "discover_and_inject_token",
            "IMPORT": "install_or_path_fix",
            "ATTRIBUTE": "patch_missing_attribute",
            "TIMEOUT": "retry_with_longer_timeout",
            "NETWORK": "retry_with_backoff",
            "FILE_NOT_FOUND": "search_and_resolve_path",
            "PERMISSION": "suggest_alternative_path",
            "SYNTAX": "lint_and_fix",
            "KEY": "inspect_data_structure",
        }
        for cat, expected_strategy in strategies.items():
            sig = ErrorSignature.__new__(ErrorSignature)
            sig.error_type = "TestError"
            sig.message = ""
            sig.traceback_text = ""
            sig.category = cat
            sig.fix_strategy = sig._determine_fix()
            assert sig.fix_strategy == expected_strategy


# ═══════════════════════════════════════════════════════════════════════
#  SELF-REPAIR ENGINE
# ═══════════════════════════════════════════════════════════════════════


class TestSelfRepairEngine:
    """SelfRepairEngine fix strategies."""

    def setup_method(self):
        self.engine = SelfRepairEngine(max_retries=2, verbose=False)

    def test_init(self):
        assert self.engine.max_retries == 2
        assert self.engine.repair_log == []

    def test_token_fix_success(self):
        sig = ErrorSignature("AuthError", "Invalid API token")
        with patch(
            "dnalang_sdk.self_repair.ensure_ibm_token",
            return_value=(True, "Token auto-discovered (test1234...)"),
        ):
            fixed, desc = self.engine.attempt_repair(sig)
            assert fixed is True
            assert len(self.engine.repair_log) == 1
            assert self.engine.repair_log[0]["success"] is True

    def test_token_fix_failure(self):
        sig = ErrorSignature("AuthError", "Invalid API token")
        with patch(
            "dnalang_sdk.self_repair.ensure_ibm_token",
            return_value=(False, "No token found"),
        ):
            with patch.object(
                self.engine, "_deep_token_scan", return_value=None
            ):
                fixed, desc = self.engine.attempt_repair(sig)
                assert fixed is False

    def test_import_fix_with_sdk_path(self):
        sig = parse_error("ModuleNotFoundError: No module named 'dnalang_sdk'")
        with patch("os.path.exists", return_value=True):
            with patch(
                "pathlib.Path.exists", return_value=True
            ):
                fixed, desc = self.engine.attempt_repair(sig)
                # Should attempt to add SDK to PYTHONPATH

    def test_timeout_fix_increases_timeout(self):
        sig = parse_error("TimeoutError: Connection timed out")
        ctx = {"timeout": 30}
        fixed, desc = self.engine.attempt_repair(sig, context=ctx)
        assert fixed is True
        assert ctx["timeout"] == 60

    def test_timeout_fix_caps_at_300(self):
        sig = parse_error("TimeoutError: Connection timed out")
        ctx = {"timeout": 200}
        fixed, desc = self.engine.attempt_repair(sig, context=ctx)
        assert fixed is True
        assert ctx["timeout"] == 300

    def test_permission_fix(self):
        sig = ErrorSignature("PermissionError", "Permission denied: '/root/data'")
        ctx = {}
        fixed, desc = self.engine.attempt_repair(sig, context=ctx)
        assert fixed is True
        assert "alt_path" in ctx

    def test_key_error_fix(self):
        sig = parse_error("KeyError: 'missing_key'")
        fixed, desc = self.engine.attempt_repair(sig)
        assert fixed is False  # KeyError has no auto-fix

    def test_unknown_category_no_handler(self):
        sig = ErrorSignature("WeirdError", "something completely unknown")
        sig.category = "UNKNOWN"
        sig.fix_strategy = "log_and_report"
        fixed, desc = self.engine.attempt_repair(sig)
        assert fixed is False

    def test_repair_log_accumulates(self):
        sig = ErrorSignature("AuthError", "Invalid API token")
        with patch(
            "dnalang_sdk.self_repair.ensure_ibm_token",
            return_value=(True, "Token found"),
        ):
            self.engine.attempt_repair(sig)
            self.engine.attempt_repair(sig)
            assert len(self.engine.repair_log) == 2

    def test_deep_token_scan_no_files(self):
        with patch("pathlib.Path.home", return_value=Path("/nonexistent_xyz")):
            result = self.engine._deep_token_scan()
            assert result is None

    def test_deep_token_scan_finds_file(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            apikey = Path(tmpdir) / "apikey.json"
            apikey.write_text(json.dumps({"apikey": "deep_scan_token_123456"}))

            with patch("pathlib.Path.home", return_value=Path(tmpdir)):
                result = self.engine._deep_token_scan()
                assert result == "deep_scan_token_123456"

    def test_syntax_fix_no_filepath(self):
        sig = parse_error("SyntaxError: invalid syntax")
        fixed, desc = self.engine.attempt_repair(sig)
        assert fixed is False

    def test_syntax_fix_with_valid_file(self):
        sig = parse_error("SyntaxError: invalid syntax")
        with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
            f.write("x = 1\n")
            f.flush()
            try:
                fixed, desc = self.engine.attempt_repair(
                    sig, context={"filepath": f.name}
                )
                assert fixed is True
            finally:
                os.unlink(f.name)

    def test_file_not_found_fix(self):
        sig = parse_error("FileNotFoundError: No such file: 'nonexistent.py'")
        fixed, desc = self.engine.attempt_repair(sig)
        # Can't find a nonexistent file
        assert fixed is False

    def test_argument_error_fix(self):
        sig = parse_error("TypeError: foo() missing required argument 'bar'")
        fixed, desc = self.engine.attempt_repair(sig)
        assert fixed is False  # Needs source-level fix
        assert "bar" in desc


# ═══════════════════════════════════════════════════════════════════════
#  WITH_SELF_REPAIR WRAPPER
# ═══════════════════════════════════════════════════════════════════════


class TestWithSelfRepair:
    """with_self_repair wraps callables with auto-recovery."""

    def test_successful_call_passes_through(self):
        def ok_fn():
            return "success"

        result = with_self_repair(ok_fn)
        assert result == "success"

    def test_exception_with_recovery(self):
        call_count = 0

        def flaky_fn():
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise TimeoutError("Connection timed out")
            return "recovered"

        result = with_self_repair(flaky_fn, max_retries=2, context={"timeout": 30})
        assert result == "recovered"
        assert call_count == 2

    def test_exception_exhausts_retries(self):
        def always_fail():
            raise RuntimeError("something weird happened")

        with pytest.raises(RuntimeError, match="something weird"):
            with_self_repair(always_fail, max_retries=1)

    def test_result_ok_false_triggers_repair(self):
        class Result:
            def __init__(self, ok, text):
                self.ok = ok
                self.text = text

        call_count = 0

        def failing_result():
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return Result(False, "Error: IBM_QUANTUM_TOKEN not set")
            return Result(True, "Success")

        with patch(
            "dnalang_sdk.self_repair.ensure_ibm_token",
            return_value=(True, "Token auto-discovered"),
        ):
            result = with_self_repair(failing_result, max_retries=2)
            assert result.ok is True

    def test_result_ok_true_no_repair(self):
        class Result:
            ok = True
            text = "all good"

        result = with_self_repair(lambda: Result())
        assert result.ok is True

    def test_passes_args_and_kwargs(self):
        def add(a, b, extra=0):
            return a + b + extra

        result = with_self_repair(add, 2, 3, extra=5)
        assert result == 10

    def test_no_repair_for_unfixable_exception(self):
        def fail():
            raise ValueError("completely unfixable error xyz")

        with pytest.raises(ValueError):
            with_self_repair(fail, max_retries=1)


# ═══════════════════════════════════════════════════════════════════════
#  OSIRIS INFERENCE ENGINE TESTS
# ═══════════════════════════════════════════════════════════════════════

class TestInferenceEngineInit:
    def test_creates_instance(self):
        engine = OsirisInferenceEngine()
        assert engine is not None

    def test_compiled_patterns_populated(self):
        engine = OsirisInferenceEngine()
        assert len(engine._compiled) > 0

    def test_history_starts_empty(self):
        engine = OsirisInferenceEngine()
        assert engine._history == []


class TestInferenceIsNoise:
    @pytest.fixture
    def engine(self):
        return OsirisInferenceEngine()

    def test_empty_is_noise(self, engine):
        assert engine.is_noise("") is True

    def test_whitespace_is_noise(self, engine):
        assert engine.is_noise("   ") is True

    def test_inbox_is_noise(self, engine):
        assert engine.is_noise("Inbox") is True

    def test_starred_is_noise(self, engine):
        assert engine.is_noise("Starred") is True

    def test_gmail_counter_is_noise(self, engine):
        assert engine.is_noise("43 of 2,706") is True

    def test_skip_to_content_is_noise(self, engine):
        assert engine.is_noise("Skip to content") is True

    def test_screen_reader_is_noise(self, engine):
        assert engine.is_noise("Using Gmail with screen readers") is True

    def test_email_prefix_only_is_noise(self, engine):
        assert engine.is_noise("RE:") is True

    def test_conversation_opened_is_noise(self, engine):
        assert engine.is_noise("Conversation opened. 1 unread message.") is True

    def test_terminal_box_is_noise(self, engine):
        assert engine.is_noise("┌─[devinpd@parrot]─[~]") is True

    def test_empty_prompt_is_noise(self, engine):
        assert engine.is_noise("$") is True

    def test_bash_not_found_is_noise(self, engine):
        assert engine.is_noise("bash: xyzzy: command not found") is True

    def test_sudo_prompt_is_noise(self, engine):
        assert engine.is_noise("[sudo] password for devinpd:") is True

    def test_permission_denied_is_noise(self, engine):
        assert engine.is_noise("Permission denied") is True

    def test_loading_is_noise(self, engine):
        assert engine.is_noise("Loading...") is True

    def test_nav_link_is_noise(self, engine):
        assert engine.is_noise("Settings") is True

    def test_real_query_not_noise(self, engine):
        assert engine.is_noise("deploy the quantum circuit to ibm_fez") is False

    def test_help_request_not_noise(self, engine):
        assert engine.is_noise("how do I run the tesseract decoder?") is False

    def test_code_request_not_noise(self, engine):
        assert engine.is_noise("write a function to compute phi") is False


class TestInferenceClassifyNoise:
    @pytest.fixture
    def engine(self):
        return OsirisInferenceEngine()

    def test_inbox_classified(self, engine):
        assert engine.classify_noise("Inbox") == "gmail_nav"

    def test_counter_classified(self, engine):
        assert engine.classify_noise("43 of 2706") == "gmail_counter"

    def test_accessibility_classified(self, engine):
        assert engine.classify_noise("Skip to content") == "accessibility"

    def test_terminal_classified(self, engine):
        assert engine.classify_noise("└──╼ $osiris") == "terminal_box"

    def test_bash_error_classified(self, engine):
        assert engine.classify_noise("bash: foo: command not found") == "bash_error"

    def test_real_input_returns_none(self, engine):
        assert engine.classify_noise("run quantum experiment") is None


class TestInferenceExtractIntent:
    @pytest.fixture
    def engine(self):
        return OsirisInferenceEngine()

    def test_aws_intent(self, engine):
        assert engine.extract_intent("deploy to s3") == "aws"

    def test_quantum_intent(self, engine):
        assert engine.extract_intent("run bell circuit on ibm_fez") == "quantum"

    def test_fix_intent(self, engine):
        assert engine.extract_intent("there's an error in the module") == "fix"

    def test_deploy_intent(self, engine):
        assert engine.extract_intent("publish to pypi") == "deploy"

    def test_research_intent(self, engine):
        assert engine.extract_intent("show experiment results") == "research"

    def test_email_intent(self, engine):
        assert engine.extract_intent("RE: Your AWS Meeting") == "email"

    def test_code_intent(self, engine):
        assert engine.extract_intent("write a function") == "code"

    def test_no_intent(self, engine):
        assert engine.extract_intent("hello there") is None

    def test_email_subject_extraction(self, engine):
        # "RE: experiment data" → should extract "research" from "data"
        result = engine.extract_intent("RE: experiment data")
        assert result is not None

    def test_history_context(self, engine):
        engine.remember("deploy to AWS s3")
        # Now a vague follow-up should pick up AWS intent from history
        result = engine.extract_intent("do it now")
        assert result == "aws"


class TestInferenceInterpret:
    @pytest.fixture
    def engine(self):
        return OsirisInferenceEngine()

    def test_pure_noise_not_actionable(self, engine):
        result = engine.interpret("Inbox")
        assert result["is_noise"] is True
        assert result["actionable"] is False
        assert result["noise_category"] == "gmail_nav"
        assert result["suggestion"] != ""

    def test_noise_with_intent_actionable(self, engine):
        result = engine.interpret("bash: deploy: command not found")
        assert result["is_noise"] is True
        assert result["actionable"] is True
        assert result["intent"] is not None  # could be "deploy" or "fix"

    def test_clean_input_actionable(self, engine):
        result = engine.interpret("run the tesseract decoder")
        assert result["is_noise"] is False
        assert result["actionable"] is True

    def test_cleaned_field_present(self, engine):
        result = engine.interpret("some text")
        assert "cleaned" in result


class TestInferenceRemember:
    def test_remember_stores(self):
        engine = OsirisInferenceEngine()
        engine.remember("first message")
        engine.remember("second message")
        assert len(engine._history) == 2

    def test_remember_caps_at_20(self):
        engine = OsirisInferenceEngine()
        for i in range(25):
            engine.remember(f"msg {i}")
        assert len(engine._history) == 20
        assert engine._history[0] == "msg 5"


class TestInferenceCleanInput:
    @pytest.fixture
    def engine(self):
        return OsirisInferenceEngine()

    def test_strips_terminal_prefix(self, engine):
        cleaned = engine._clean_input("└──╼ $run quantum circuit")
        # The terminal prefix should be stripped
        assert "run quantum circuit" in cleaned

    def test_strips_noise_lines(self, engine):
        text = "Inbox\nrun quantum circuit\nLoading..."
        cleaned = engine._clean_input(text)
        assert "run quantum circuit" in cleaned
        assert "Inbox" not in cleaned

    def test_preserves_meaningful_content(self, engine):
        text = "deploy the SDK to production"
        assert engine._clean_input(text) == text


class TestInferenceResolve:
    def test_resolve_import_error_syntax_ok(self):
        engine = OsirisInferenceEngine()
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write("x = 1\n")
            f.flush()
            ok, msg = engine.resolve_import_error(f.name)
        os.unlink(f.name)
        assert ok is True
        assert "Syntax OK" in msg

    def test_resolve_import_error_syntax_bad(self):
        engine = OsirisInferenceEngine()
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write("def foo(\n")
            f.flush()
            ok, msg = engine.resolve_import_error(f.name)
        os.unlink(f.name)
        assert ok is False
        assert "Syntax error" in msg

    def test_resolve_permission_nonexistent(self):
        engine = OsirisInferenceEngine()
        ok, msg = engine.resolve_permission_error("/nonexistent/path/foo.py")
        assert ok is False

    def test_resolve_on_boot_returns_list(self):
        engine = OsirisInferenceEngine()
        msgs = engine.resolve_on_boot()
        assert isinstance(msgs, list)


class TestInferenceSuggestions:
    @pytest.fixture
    def engine(self):
        return OsirisInferenceEngine()

    def test_noise_suggestions_all_categories(self, engine):
        for cat in ("gmail_nav", "gmail_counter", "accessibility",
                     "email_prefix_only", "gmail_thread", "terminal_box",
                     "bash_error", "sudo_prompt", "permission",
                     "nav_link", "loading"):
            suggestion = engine._suggest_for_noise(cat)
            assert len(suggestion) > 10

    def test_noise_suggestion_unknown_category(self, engine):
        suggestion = engine._suggest_for_noise("unknown_cat")
        assert "UI artifacts" in suggestion

    def test_intent_actions_all_intents(self, engine):
        for intent in ("aws", "quantum", "fix", "deploy", "research", "email", "code"):
            action = engine._suggest_for_intent(intent)
            assert len(action) > 10

    def test_intent_action_unknown(self, engine):
        action = engine._suggest_for_intent("mystery")
        assert "mystery" in action


class TestInferenceExport:
    def test_importable_from_init(self):
        from dnalang_sdk import OsirisInferenceEngine
        engine = OsirisInferenceEngine()
        assert engine is not None
