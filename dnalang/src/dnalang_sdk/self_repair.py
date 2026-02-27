"""
OSIRIS Self-Repair & Inference Engine — Infer · Interpret · Resolve.

When OSIRIS encounters an error, instead of printing it and stopping, this
module analyzes the error, applies surgical fixes, and retries.  When
user input is noisy (Gmail UI artifacts, terminal paste debris, incomplete
commands), the OsirisInferenceEngine extracts actionable intent and either
cleans the input or auto-resolves the underlying issue.

DNA::}{::lang v51.843 | Agile Defense Systems | CAGE 9HUP5
"""

import os
import re
import json
import logging
import subprocess
import sys
import traceback
from pathlib import Path
from typing import Optional, Dict, List, Tuple, Any

logger = logging.getLogger(__name__)

# ── Immutable Constants ────────────────────────────────────────────────
LAMBDA_PHI = 2.176435e-8
THETA_LOCK = 51.843
PHI_THRESHOLD = 0.7734

# ── ANSI helpers ───────────────────────────────────────────────────────
_R = "\033[0m"
_D = "\033[2m"
_CY = "\033[36m"
_GR = "\033[32m"
_YE = "\033[33m"
_RD = "\033[31m"
_MG = "\033[35m"


# ═══════════════════════════════════════════════════════════════════════
#  TOKEN DISCOVERY
# ═══════════════════════════════════════════════════════════════════════

# Priority-ordered search locations for IBM Quantum tokens
_TOKEN_SEARCH_PATHS = [
    # apikey.json files
    Path.home() / ".dnalang" / "apikey.json",
    Path.home() / "apikey.json",
    Path.home() / "copilot-sdk-dnalang" / "apikey.json",
    Path.home() / "SOVEREIGN_WORKSPACE" / "copilot-nclm"
    / "drive-download-20260223T142035Z-1-001" / "apikey (1).json",
    Path.home() / "SOVEREIGN_WORKSPACE" / "copilot-nclm"
    / "drive-download-20260223T142035Z-1-001" / "apikey-1.json",
    Path.home() / "scripts" / "apikey.json",
    Path.home() / ".config" / "osiris" / "apikey.json",
    Path.home() / ".qiskit" / "apikey.json",
]

# Environment variables to check (priority order)
_TOKEN_ENV_VARS = [
    "IBM_QUANTUM_TOKEN",
    "IBMQ_TOKEN",
    "QISKIT_IBM_TOKEN",
    "IBM_CLOUD_API_KEY",
]


def discover_ibm_token(verbose: bool = False) -> Optional[str]:
    """
    Auto-discover IBM Quantum token from all known locations.

    Search order:
      1. Environment variables (IBM_QUANTUM_TOKEN, IBMQ_TOKEN, etc.)
      2. apikey.json files in known paths
      3. Qiskit saved credentials (~/.qiskit/qiskit-ibm.json)

    Returns the first valid token found, or None.
    """
    # 1. Environment variables
    for var in _TOKEN_ENV_VARS:
        token = os.environ.get(var, "").strip()
        if token and len(token) > 10:
            if verbose:
                logger.info(f"Token found in ${var}")
            return token

    # 2. apikey.json files
    for path in _TOKEN_SEARCH_PATHS:
        try:
            if path.exists():
                data = json.loads(path.read_text())
                # Support multiple JSON formats
                for key in ("apikey", "api_key", "token", "IBM_QUANTUM_TOKEN"):
                    val = data.get(key, "").strip()
                    if val and len(val) > 10:
                        if verbose:
                            logger.info(f"Token found in {path}")
                        return val
        except (json.JSONDecodeError, IOError, KeyError):
            continue

    # 3. Qiskit saved credentials
    qiskit_cred = Path.home() / ".qiskit" / "qiskit-ibm.json"
    try:
        if qiskit_cred.exists():
            data = json.loads(qiskit_cred.read_text())
            for channel_data in data.values():
                if isinstance(channel_data, dict):
                    token = channel_data.get("token", "").strip()
                    if token and len(token) > 10:
                        if verbose:
                            logger.info(f"Token found in {qiskit_cred}")
                        return token
    except (json.JSONDecodeError, IOError):
        pass

    return None


def export_token(token: str) -> None:
    """Set discovered token into the environment for current process."""
    os.environ["IBM_QUANTUM_TOKEN"] = token


def ensure_ibm_token(verbose: bool = False) -> Tuple[bool, str]:
    """
    Ensure IBM_QUANTUM_TOKEN is available. Auto-discovers and exports if missing.

    Returns (success: bool, message: str).
    """
    existing = os.environ.get("IBM_QUANTUM_TOKEN", "").strip()
    if existing and len(existing) > 10:
        return True, "Token already set in environment"

    token = discover_ibm_token(verbose=verbose)
    if token:
        export_token(token)
        source = "auto-discovered"
        return True, f"Token {source} and exported ({token[:8]}...)"

    return False, "No IBM Quantum token found in any known location"


# ═══════════════════════════════════════════════════════════════════════
#  ERROR ANALYSIS
# ═══════════════════════════════════════════════════════════════════════

class ErrorSignature:
    """Parsed error with classification and suggested fix."""

    def __init__(self, error_type: str, message: str, traceback_text: str = ""):
        self.error_type = error_type
        self.message = message
        self.traceback_text = traceback_text
        self.category = self._classify()
        self.fix_strategy = self._determine_fix()

    def _classify(self) -> str:
        msg = self.message.lower()
        etype = self.error_type.lower()

        if "token" in msg or "api" in msg or "credential" in msg or "auth" in msg:
            return "TOKEN"
        if "import" in etype or "no module named" in msg:
            return "IMPORT"
        if "attribute" in etype:
            return "ATTRIBUTE"
        if "type" in etype and "argument" in msg:
            return "ARGUMENT"
        if "timeout" in msg or "timed out" in msg:
            return "TIMEOUT"
        if "connection" in msg or "network" in msg or "refused" in msg:
            return "NETWORK"
        if "permission" in msg or "denied" in msg:
            return "PERMISSION"
        if "file not found" in msg or "no such file" in msg:
            return "FILE_NOT_FOUND"
        if "syntax" in etype:
            return "SYNTAX"
        if "key" in etype:
            return "KEY"
        return "UNKNOWN"

    def _determine_fix(self) -> str:
        strategies = {
            "TOKEN": "discover_and_inject_token",
            "IMPORT": "install_or_path_fix",
            "ATTRIBUTE": "patch_missing_attribute",
            "ARGUMENT": "adapt_call_signature",
            "TIMEOUT": "retry_with_longer_timeout",
            "NETWORK": "retry_with_backoff",
            "PERMISSION": "suggest_alternative_path",
            "FILE_NOT_FOUND": "search_and_resolve_path",
            "SYNTAX": "lint_and_fix",
            "KEY": "inspect_data_structure",
        }
        return strategies.get(self.category, "log_and_report")


def parse_error(error_text: str) -> ErrorSignature:
    """Parse an error string/traceback into an ErrorSignature."""
    # Extract error type and message
    m = re.search(
        r'((?:[\w.]+)?(?:Error|Exception|Warning))\s*:\s*(.+?)(?:\n|$)',
        error_text,
    )
    if m:
        return ErrorSignature(m.group(1), m.group(2).strip(), error_text)

    # Fallback: treat whole text as message
    return ErrorSignature("UnknownError", error_text[:200], error_text)


# ═══════════════════════════════════════════════════════════════════════
#  SELF-REPAIR ENGINE
# ═══════════════════════════════════════════════════════════════════════

class SelfRepairEngine:
    """
    Autonomous error recovery system for OSIRIS.

    Instead of printing errors, this engine:
      1. Parses the error signature
      2. Identifies the root cause category
      3. Applies an automatic fix
      4. Retries the failed operation

    Supports up to max_retries attempts with different fix strategies.
    """

    def __init__(self, max_retries: int = 3, verbose: bool = True):
        self.max_retries = max_retries
        self.verbose = verbose
        self.repair_log: List[Dict[str, Any]] = []

    def _log(self, msg: str) -> None:
        if self.verbose:
            print(f"  {_MG}⚕{_R} {msg}")

    def attempt_repair(
        self,
        error_sig: ErrorSignature,
        context: Optional[Dict[str, Any]] = None,
    ) -> Tuple[bool, str]:
        """
        Attempt to repair an error. Returns (fixed: bool, description: str).
        """
        ctx = context if context is not None else {}
        strategy = error_sig.fix_strategy
        category = error_sig.category

        self._log(f"Diagnosing: {_YE}{error_sig.error_type}{_R}: "
                   f"{error_sig.message[:60]}")
        self._log(f"Category: {_CY}{category}{_R} → Strategy: {strategy}")

        handler = getattr(self, f"_fix_{strategy}", None)
        if handler:
            return handler(error_sig, ctx)

        return False, f"No auto-fix available for {category} errors"

    # ── Fix Strategies ─────────────────────────────────────────────

    def _fix_discover_and_inject_token(
        self, sig: ErrorSignature, ctx: Dict
    ) -> Tuple[bool, str]:
        """Auto-discover and inject IBM Quantum token."""
        self._log("Searching for IBM Quantum token...")

        ok, msg = ensure_ibm_token(verbose=True)
        if ok:
            self._log(f"{_GR}✓{_R} {msg}")
            self.repair_log.append({
                "strategy": "discover_and_inject_token",
                "success": True,
                "detail": msg,
            })
            return True, msg

        # Try deeper scan — look for any JSON file with potential tokens
        self._log("Deep scanning for token files...")
        found = self._deep_token_scan()
        if found:
            export_token(found)
            msg = f"Token found via deep scan ({found[:8]}...)"
            self._log(f"{_GR}✓{_R} {msg}")
            self.repair_log.append({
                "strategy": "deep_token_scan",
                "success": True,
                "detail": msg,
            })
            return True, msg

        self.repair_log.append({
            "strategy": "discover_and_inject_token",
            "success": False,
            "detail": "No token found anywhere",
        })
        return False, (
            "No IBM Quantum token found.\n"
            f"  {_D}Set it: export IBM_QUANTUM_TOKEN=your_token{_R}\n"
            f"  {_D}Or create: ~/.dnalang/apikey.json with "
            '{"apikey": "your_token"}' + f"{_R}"
        )

    def _deep_token_scan(self) -> Optional[str]:
        """Scan home directory for any apikey*.json with token-like values."""
        home = Path.home()
        candidates = list(home.glob("**/apikey*.json"))
        candidates += list(home.glob("**/.qiskit/*.json"))
        # Limit depth to avoid scanning forever
        candidates = [p for p in candidates
                      if len(p.relative_to(home).parts) <= 5]

        for path in candidates[:20]:
            try:
                data = json.loads(path.read_text())
                if isinstance(data, dict):
                    for key in ("apikey", "api_key", "token",
                                "IBM_QUANTUM_TOKEN", "default-ibm-quantum"):
                        val = data.get(key, "")
                        if isinstance(val, str) and len(val) > 20:
                            return val
                        if isinstance(val, dict):
                            inner = val.get("token", "")
                            if isinstance(inner, str) and len(inner) > 20:
                                return inner
            except (json.JSONDecodeError, IOError, UnicodeDecodeError):
                continue
        return None

    def _fix_install_or_path_fix(
        self, sig: ErrorSignature, ctx: Dict
    ) -> Tuple[bool, str]:
        """Fix ImportError by adjusting PYTHONPATH or suggesting install."""
        m = re.search(r"No module named '([\w.]+)'", sig.message)
        if not m:
            return False, "Could not determine missing module"

        module = m.group(1)
        top_module = module.split(".")[0]

        # Check common venvs
        venv_map = {
            "qiskit": "qiskit_venv",
            "qiskit_ibm_runtime": "qiskit_venv",
            "qiskit_aer": "qiskit_venv",
            "amazon_braket": "braket_venv",
            "braket": "braket_venv",
        }

        venv_name = venv_map.get(top_module)
        if venv_name:
            venv_path = Path.home() / venv_name
            if venv_path.exists():
                site_pkg = list(venv_path.glob("lib/python*/site-packages"))
                if site_pkg:
                    path = str(site_pkg[0])
                    if path not in sys.path:
                        sys.path.insert(0, path)
                    self._log(f"{_GR}✓{_R} Added {venv_name} to path")
                    return True, f"Added {venv_name}/site-packages to path"

        # Check if SDK path is set
        sdk_src = Path.home() / "copilot-sdk-dnalang" / "dnalang" / "src"
        if sdk_src.exists() and str(sdk_src) not in os.environ.get("PYTHONPATH", ""):
            os.environ["PYTHONPATH"] = str(sdk_src) + ":" + os.environ.get(
                "PYTHONPATH", ""
            )
            self._log(f"{_GR}✓{_R} Added SDK src to PYTHONPATH")
            return True, f"Added {sdk_src} to PYTHONPATH"

        return False, f"Module '{module}' not found — install with: pip install {top_module}"

    def _fix_retry_with_longer_timeout(
        self, sig: ErrorSignature, ctx: Dict
    ) -> Tuple[bool, str]:
        """Suggest retry with increased timeout."""
        current = ctx.get("timeout", 30)
        new_timeout = min(current * 2, 300)
        ctx["timeout"] = new_timeout
        self._log(f"Increasing timeout: {current}s → {new_timeout}s")
        return True, f"Timeout increased to {new_timeout}s"

    def _fix_retry_with_backoff(
        self, sig: ErrorSignature, ctx: Dict
    ) -> Tuple[bool, str]:
        """Retry with exponential backoff for network errors."""
        import time
        attempt = ctx.get("_network_retry", 0) + 1
        ctx["_network_retry"] = attempt
        wait = min(2 ** attempt, 30)
        self._log(f"Network retry {attempt} — waiting {wait}s...")
        time.sleep(wait)
        return True, f"Retrying after {wait}s backoff (attempt {attempt})"

    def _fix_search_and_resolve_path(
        self, sig: ErrorSignature, ctx: Dict
    ) -> Tuple[bool, str]:
        """Find the correct path for a missing file."""
        m = re.search(r"['\"]([^'\"]+)['\"]", sig.message)
        if not m:
            return False, "Could not extract file path from error"

        missing = m.group(1)
        filename = os.path.basename(missing)

        # Search in common locations
        search_roots = [
            Path.home(),
            Path.home() / "copilot-sdk-dnalang",
            Path.home() / "osiris_cockpit",
            Path.home() / "quantum_workspace",
        ]

        for root in search_roots:
            matches = list(root.rglob(filename))
            if matches:
                resolved = str(matches[0])
                ctx["resolved_path"] = resolved
                self._log(f"{_GR}✓{_R} Found: {resolved}")
                return True, f"Resolved {filename} → {resolved}"

        return False, f"File '{filename}' not found in any known location"

    def _fix_patch_missing_attribute(
        self, sig: ErrorSignature, ctx: Dict
    ) -> Tuple[bool, str]:
        """Patch a missing attribute on a class."""
        m = re.match(
            r"'(\w+)' object has no attribute '(\w+)'",
            sig.message.strip(),
        )
        if not m:
            return False, "Could not parse attribute error"

        cls_name, attr_name = m.groups()
        self._log(f"Missing: {cls_name}.{attr_name}")

        # Search source files for the class
        search_dirs = [
            Path.home() / "copilot-sdk-dnalang" / "dnalang" / "src",
            Path.home() / "osiris_cockpit",
        ]

        for root in search_dirs:
            if not root.exists():
                continue
            for py in root.rglob("*.py"):
                try:
                    src = py.read_text()
                    if f"class {cls_name}" not in src:
                        continue

                    # Find __init__ and add the missing attribute
                    class_m = re.search(rf"class {cls_name}.*?:", src)
                    if not class_m:
                        continue

                    init_m = re.search(
                        r"def __init__\(self.*?\):",
                        src[class_m.end() :],
                    )
                    if not init_m:
                        continue

                    init_start = class_m.end() + init_m.end()
                    init_body = src[init_start:]
                    last_self = None
                    for lm in re.finditer(
                        r"^(\s+)self\.\w+\s*=.*$", init_body, re.M
                    ):
                        last_self = lm

                    if last_self:
                        insert_at = init_start + last_self.end()
                        indent = last_self.group(1)
                        patch = (
                            f"\n{indent}self.{attr_name} = "
                            f"getattr(self, '{attr_name}', None)"
                            f"  # self-repair: auto-patched"
                        )
                        new_src = src[:insert_at] + patch + src[insert_at:]
                        py.write_text(new_src)
                        self._log(
                            f"{_GR}✓{_R} Patched {cls_name}.{attr_name} "
                            f"in {py.name}"
                        )
                        return True, f"Added {attr_name} to {cls_name}"
                except (IOError, UnicodeDecodeError):
                    continue

        return False, f"Could not locate class {cls_name} to patch"

    def _fix_adapt_call_signature(
        self, sig: ErrorSignature, ctx: Dict
    ) -> Tuple[bool, str]:
        """Adapt a function call when arguments don't match."""
        m = re.search(r"missing.*argument.*'(\w+)'", sig.message)
        if m:
            arg = m.group(1)
            self._log(f"Missing argument: {arg}")
            return False, (
                f"Function call missing required argument '{arg}' — "
                f"needs source-level fix"
            )
        return False, "Could not parse argument error"

    def _fix_suggest_alternative_path(
        self, sig: ErrorSignature, ctx: Dict
    ) -> Tuple[bool, str]:
        """Suggest writable alternative for permission errors."""
        alt = Path.home() / ".osiris" / "tmp"
        alt.mkdir(parents=True, exist_ok=True)
        ctx["alt_path"] = str(alt)
        self._log(f"Alternative writable path: {alt}")
        return True, f"Using writable path: {alt}"

    def _fix_inspect_data_structure(
        self, sig: ErrorSignature, ctx: Dict
    ) -> Tuple[bool, str]:
        """Handle KeyError by inspecting available keys."""
        m = re.search(r"KeyError:\s*['\"](\w+)['\"]", sig.message)
        if m:
            key = m.group(1)
            return False, f"Key '{key}' not found — check data structure"
        return False, "Could not parse key error"

    def _fix_lint_and_fix(
        self, sig: ErrorSignature, ctx: Dict
    ) -> Tuple[bool, str]:
        """Fix syntax errors by running autopep8 or similar."""
        filepath = ctx.get("filepath")
        if not filepath:
            return False, "No file path provided for syntax fix"

        try:
            r = subprocess.run(
                ["python3", "-m", "py_compile", filepath],
                capture_output=True,
                text=True,
                timeout=10,
            )
            if r.returncode == 0:
                return True, "Syntax validated OK"
            return False, f"Syntax error persists: {r.stderr[:100]}"
        except Exception:
            return False, "Could not run syntax check"


# ═══════════════════════════════════════════════════════════════════════
#  DISPATCH WRAPPER — wraps any callable with self-repair
# ═══════════════════════════════════════════════════════════════════════

def with_self_repair(
    fn,
    *args,
    max_retries: int = 2,
    context: Optional[Dict] = None,
    **kwargs,
) -> Any:
    """
    Execute fn(*args, **kwargs) with automatic error recovery.

    If fn raises an exception or returns a Result with ok=False and an error
    pattern, the SelfRepairEngine analyzes the error and attempts a fix
    before retrying.
    """
    engine = SelfRepairEngine(max_retries=max_retries)
    ctx = context or {}
    last_error = None

    for attempt in range(max_retries + 1):
        try:
            result = fn(*args, **kwargs)

            # Check if result indicates failure with error text
            if hasattr(result, "ok") and not result.ok:
                text = getattr(result, "text", "")
                if any(
                    kw in text.lower()
                    for kw in ("error", "failed", "exception", "not set", "not found")
                ):
                    sig = parse_error(text)
                    if attempt < max_retries:
                        fixed, desc = engine.attempt_repair(sig, ctx)
                        if fixed:
                            engine._log(
                                f"Repair applied — retrying "
                                f"({attempt + 2}/{max_retries + 1})..."
                            )
                            continue
                    # Couldn't fix — return with repair context
                    result.text += f"\n  {_D}Self-repair attempted: {sig.category}{_R}"
                    return result

            return result

        except Exception as e:
            last_error = e
            error_text = traceback.format_exc()
            sig = parse_error(error_text)

            if attempt < max_retries:
                fixed, desc = engine.attempt_repair(sig, ctx)
                if fixed:
                    engine._log(
                        f"Repair applied — retrying "
                        f"({attempt + 2}/{max_retries + 1})..."
                    )
                    continue

            # Final attempt failed
            raise

    raise last_error if last_error else RuntimeError("Self-repair exhausted")


# ═══════════════════════════════════════════════════════════════════════
#  OSIRIS INFERENCE ENGINE — infer · interpret · resolve
# ═══════════════════════════════════════════════════════════════════════

# Noise patterns that indicate pasted UI artifacts rather than real queries
_NOISE_PATTERNS: List[Tuple[str, str]] = [
    # Gmail / email UI
    (r"^(Inbox|Starred|Sent|Drafts|Spam|Trash|All Mail)\s*$", "gmail_nav"),
    (r"^\d+\s+of\s+\d+", "gmail_counter"),
    (r"^(Skip to content|Using .* with screen readers)", "accessibility"),
    (r"^(RE:|FW:|Fwd:)\s*$", "email_prefix_only"),
    (r"^Conversation opened\.\s*\d+\s*unread", "gmail_thread"),
    # Terminal copy-paste artifacts
    (r"^[┌└├│─╼╾]+", "terminal_box"),
    (r"^\$\s*$", "empty_prompt"),
    (r"^bash:\s+\S+:\s+command not found", "bash_error"),
    (r"^bash:\s+\S+:\s+No such file", "bash_error"),
    (r"^\[sudo\]\s+password", "sudo_prompt"),
    (r"^Permission denied", "permission"),
    # Webpage fragments
    (r"^(Home|About|Contact|Login|Sign [Uu]p|Settings)\s*$", "nav_link"),
    (r"^(Loading|Please wait|Redirecting)\.*$", "loading"),
]

# Intent extraction: map noisy fragments to likely user goals
_INTENT_HINTS: Dict[str, List[str]] = {
    "aws": ["deploy", "upload", "s3", "braket", "ec2", "lambda", "cloud"],
    "quantum": ["circuit", "bell", "entangle", "fez", "torino", "backend", "ibm"],
    "fix": ["error", "bug", "broken", "fail", "crash", "exception", "traceback"],
    "deploy": ["pypi", "upload", "publish", "push", "release", "docker"],
    "research": ["paper", "result", "experiment", "data", "breakthrough"],
    "email": ["RE:", "FW:", "meeting", "reply", "send", "draft", "outreach"],
    "code": ["function", "class", "module", "import", "test", "lint"],
}


class OsirisInferenceEngine:
    """
    Infer · Interpret · Resolve engine for OSIRIS.

    When user input is noisy (pasted Gmail UI, terminal artifacts, incomplete
    commands), this engine:
      1. INFERS whether the input is noise vs. signal
      2. INTERPRETS the likely intent from context clues
      3. RESOLVES by cleaning input, suggesting actions, or auto-fixing
    """

    def __init__(self) -> None:
        self._compiled: List[Tuple[re.Pattern, str]] = [
            (re.compile(pat, re.IGNORECASE), cat)
            for pat, cat in _NOISE_PATTERNS
        ]
        self._history: List[str] = []

    # ── INFER ─────────────────────────────────────────────────────────

    def is_noise(self, text: str) -> bool:
        """Detect whether input is UI artifact noise rather than a real query."""
        text = text.strip()
        if not text:
            return True
        for regex, _cat in self._compiled:
            if regex.search(text):
                return True
        # Very short single-word inputs that match nav elements
        if len(text.split()) == 1 and text.lower() in {
            "inbox", "starred", "sent", "drafts", "spam", "trash",
            "home", "about", "login", "settings", "skip", "loading",
        }:
            return True
        return False

    def classify_noise(self, text: str) -> Optional[str]:
        """Return the noise category, or None if it's real input."""
        text = text.strip()
        for regex, cat in self._compiled:
            if regex.search(text):
                return cat
        return None

    # ── INTERPRET ─────────────────────────────────────────────────────

    def extract_intent(self, text: str) -> Optional[str]:
        """
        Extract the likely user intent from noisy or partial input.

        Uses keyword matching against known intent categories and recent
        conversation history to infer what the user is trying to do.
        """
        lower = text.lower()

        # Direct intent extraction from text content
        for intent, keywords in _INTENT_HINTS.items():
            if any(kw in lower for kw in keywords):
                return intent

        # Check if it looks like a subject line with useful content
        for prefix in ("re:", "fw:", "fwd:"):
            if lower.startswith(prefix):
                subject = text[len(prefix):].strip()
                if subject:
                    return self.extract_intent(subject)

        # Check recent history for context
        for prev in reversed(self._history[-5:]):
            for intent, keywords in _INTENT_HINTS.items():
                if any(kw in prev.lower() for kw in keywords):
                    return intent

        return None

    def interpret(self, text: str) -> Dict[str, Any]:
        """
        Full interpretation of user input.

        Returns dict with keys: is_noise, noise_category, cleaned, intent,
        suggestion, actionable.
        """
        noise_cat = self.classify_noise(text)
        intent = self.extract_intent(text)
        cleaned = self._clean_input(text)

        if noise_cat and not intent:
            return {
                "is_noise": True,
                "noise_category": noise_cat,
                "cleaned": cleaned,
                "intent": None,
                "suggestion": self._suggest_for_noise(noise_cat),
                "actionable": False,
            }

        if noise_cat and intent:
            return {
                "is_noise": True,
                "noise_category": noise_cat,
                "cleaned": cleaned,
                "intent": intent,
                "suggestion": self._suggest_for_intent(intent),
                "actionable": True,
            }

        return {
            "is_noise": False,
            "noise_category": None,
            "cleaned": cleaned,
            "intent": intent,
            "suggestion": "",
            "actionable": True,
        }

    def remember(self, text: str) -> None:
        """Record input to conversation history for context tracking."""
        self._history.append(text)
        if len(self._history) > 20:
            self._history = self._history[-20:]

    # ── RESOLVE ───────────────────────────────────────────────────────

    def resolve_import_error(self, module_path: str) -> Tuple[bool, str]:
        """
        Attempt to resolve a module import error by:
          1. Clearing stale __pycache__
          2. Checking for syntax errors
        """
        # 1. Clear pycache for the module
        mod_dir = os.path.dirname(os.path.abspath(module_path))
        cache_dir = os.path.join(mod_dir, "__pycache__")
        if os.path.isdir(cache_dir):
            mod_name = os.path.splitext(os.path.basename(module_path))[0]
            cleared = 0
            for f in os.listdir(cache_dir):
                if f.startswith(mod_name) and f.endswith(".pyc"):
                    try:
                        os.remove(os.path.join(cache_dir, f))
                        cleared += 1
                    except OSError:
                        pass
            if cleared:
                logger.info("Cleared %d stale .pyc for %s", cleared, mod_name)

        # 2. Try syntax check
        try:
            with open(module_path, 'r') as fh:
                source = fh.read()
            compile(source, module_path, 'exec')
            return True, f"Syntax OK after cache clear: {module_path}"
        except SyntaxError as e:
            return False, f"Syntax error at {module_path}:{e.lineno}: {e.msg}"

    def resolve_permission_error(self, path: str) -> Tuple[bool, str]:
        """Suggest fix for permission issues (root-owned files)."""
        expanded = os.path.expanduser(path)

        if os.path.exists(expanded):
            st = os.stat(expanded)
            if st.st_uid != os.getuid():
                parent = os.path.dirname(expanded)
                if os.access(parent, os.W_OK):
                    return False, (
                        f"File {path} is owned by root. Fix with:\n"
                        f"  cp {path} /tmp/_fix && rm {path} && "
                        f"cp /tmp/_fix {path}"
                    )
                return False, f"{path} is root-owned and dir is not writable"

        return False, f"Path {path} does not exist or is inaccessible"

    def resolve_on_boot(self) -> List[str]:
        """
        Run at OSIRIS boot time. Checks for and resolves:
          1. Stale __pycache__ from broken builds
          2. Missing IBM Quantum token
          3. Broken module imports
        Returns list of resolution messages.
        """
        messages: List[str] = []

        # 1. Ensure IBM Quantum token
        if ensure_ibm_token():
            messages.append("✓ IBM Quantum token auto-discovered")

        # 2. Clear stale pycache
        sdk_src = os.path.dirname(os.path.abspath(__file__))
        stale = 0
        for root, _dirs, files in os.walk(sdk_src):
            if "__pycache__" not in root:
                continue
            for fname in files:
                if not fname.endswith(".pyc"):
                    continue
                pyc = os.path.join(root, fname)
                mod = os.path.join(
                    os.path.dirname(root),
                    fname.split(".")[0] + ".py",
                )
                if os.path.exists(mod):
                    if os.path.getmtime(pyc) < os.path.getmtime(mod):
                        try:
                            os.remove(pyc)
                            stale += 1
                        except OSError:
                            pass
        if stale:
            messages.append(f"✓ Cleared {stale} stale .pyc files")

        # 3. Verify critical modules
        for mod_name in (
            "dnalang_sdk.code_writer",
            "dnalang_sdk.physics_tools",
            "dnalang_sdk.nclm.tools",
        ):
            try:
                __import__(mod_name)
            except SyntaxError as e:
                mod_obj = sys.modules.get(mod_name)
                mod_file = getattr(mod_obj, "__file__", None) if mod_obj else None
                if mod_file:
                    self.resolve_import_error(mod_file)
                    messages.append(f"⚕ Repaired: {mod_name} ({e.msg})")
            except ImportError:
                pass  # Optional deps

        return messages

    # ── PRIVATE ───────────────────────────────────────────────────────

    def _clean_input(self, text: str) -> str:
        """Remove noise artifacts, preserving meaningful content."""
        lines = text.strip().splitlines()
        cleaned: List[str] = []
        for line in lines:
            line = line.strip()
            if self.classify_noise(line) and not self.extract_intent(line):
                continue
            # Strip terminal prompt prefixes
            line = re.sub(r'^[┌└├│─╼╾\[\]✗]+\s*', '', line)
            line = re.sub(r'^\$\s+', '', line)
            if line:
                cleaned.append(line)
        return "\n".join(cleaned) if cleaned else text.strip()

    _NOISE_SUGGESTIONS: Dict[str, str] = {
        "gmail_nav": (
            "Looks like Gmail navigation was pasted. "
            "To share email content, open the email and copy the body text."
        ),
        "gmail_counter": (
            "That's a Gmail message counter. "
            "Open the specific email and paste its body text."
        ),
        "accessibility": (
            "That's a webpage accessibility header. "
            "Copy the actual content you want me to work with."
        ),
        "email_prefix_only": (
            "Got an email subject prefix but no content. "
            "Paste the full email body or tell me what you need."
        ),
        "gmail_thread": (
            "That's a Gmail thread notification. "
            "Open the email and paste the content you want me to act on."
        ),
        "terminal_box": (
            "Detected terminal UI artifacts. "
            "Paste the actual command output or error message."
        ),
        "bash_error": "I see a shell error. Let me try to resolve it.",
        "sudo_prompt": (
            "sudo requires a password. Most operations work without sudo. "
            "Try the command without sudo."
        ),
        "permission": "Permission denied. Let me check for alternatives.",
        "nav_link": "That looks like a navigation link, not a command.",
        "loading": "That's a loading indicator from a webpage.",
    }

    _INTENT_ACTIONS: Dict[str, str] = {
        "aws": "AWS intent detected. I can deploy, upload to S3, or configure Braket.",
        "quantum": "Quantum task detected. I can run circuits, check backends, or analyze results.",
        "fix": "Error detected. Analyzing and attempting auto-repair.",
        "deploy": "Deployment intent detected. I can package for PyPI, AWS, or Docker.",
        "research": "Research query detected. I can analyze experiments or generate reports.",
        "email": "Email-related task. Paste the email body so I can help.",
        "code": "Code task detected. Tell me what to create, fix, or analyze.",
    }

    def _suggest_for_noise(self, category: str) -> str:
        return self._NOISE_SUGGESTIONS.get(
            category,
            "Input appears to be UI artifacts. What would you like me to do?",
        )

    def _suggest_for_intent(self, intent: str) -> str:
        return self._INTENT_ACTIONS.get(
            intent, f"Detected intent: {intent}. How should I proceed?"
        )
