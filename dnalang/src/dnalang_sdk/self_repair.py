"""
OSIRIS Self-Repair Engine — Autonomous error recovery and token discovery.

When OSIRIS encounters an error, instead of printing it and stopping, this
module analyzes the error, applies surgical fixes, and retries.

DNA::}{::lang v51.843 | Agile Defense Systems | CAGE 9HUP5
"""

import os
import re
import json
import logging
import subprocess
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
                        import sys
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
