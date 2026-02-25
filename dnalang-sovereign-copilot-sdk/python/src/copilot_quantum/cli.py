"""
Dnalang Sovereign Copilot CLI — the agent loop.

Works like GitHub Copilot CLI but enhanced with DNA::}{::lang v51.843
CRSM physics.  Any natural-language input is understood and acted on:

  $ dnalang
  ∮ hello
  ∮ run tests
  ∮ write a function that validates email
  ∮ show tau phase analysis
  ∮ explain quantum_engine.py
  ∮ git diff, then run tests

No slash commands.  No modes.  Just speak.
"""

import asyncio
import os
import re
import subprocess
import sys
import time
from enum import Enum, auto
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, Tuple

from .enhanced_agent import EnhancedSovereignAgent, AgentResult
from .quantum_engine import (
    AeternaPorta,
    LambdaPhiEngine,
    LAMBDA_PHI_M,
    THETA_LOCK_DEG,
    PHI_THRESHOLD_FIDELITY,
    GAMMA_CRITICAL_RATE,
    CHI_PC_QUALITY,
)
from .code_generator import QuantumNLPCodeGenerator, CodeIntent

# ── colours (degrade gracefully if piped) ─────────────────────────
_colour = sys.stdout.isatty()


def _c(code: int, text: str) -> str:
    return f"\033[{code}m{text}\033[0m" if _colour else text


def bold(t):   return _c(1, t)
def dim(t):    return _c(2, t)
def cyan(t):   return _c(36, t)
def green(t):  return _c(32, t)
def red(t):    return _c(31, t)
def yellow(t): return _c(33, t)
def magenta(t): return _c(35, t)


# ── intent taxonomy ───────────────────────────────────────────────
class Intent(Enum):
    GREET       = auto()
    HELP        = auto()
    HISTORY     = auto()
    IDENTITY    = auto()
    PHYSICS     = auto()
    TAU_PHASE   = auto()
    ORGANISMS   = auto()
    TESTS       = auto()
    GIT_STATUS  = auto()
    GIT_DIFF    = auto()
    GIT_LOG     = auto()
    GIT_COMMIT  = auto()
    READ_FILE   = auto()
    SEARCH      = auto()
    LIST_FILES  = auto()
    ANALYZE     = auto()
    DIAG        = auto()
    EXPERIMENT  = auto()
    HARDWARE    = auto()
    GEN_CODE    = auto()   # fallback — delegates to EnhancedSovereignAgent
    QUIT        = auto()


# Priority-ordered rules: first match wins.
_RULES: List[Tuple[Intent, re.Pattern, Optional[str]]] = [
    (Intent.QUIT,       re.compile(r"^(exit|quit|bye|q)$", re.I), None),
    (Intent.GREET,      re.compile(r"^(hi|hello|hey|howdy|sup|yo|good\s*(morning|evening|afternoon)|what'?s?\s*up)\b", re.I), None),
    (Intent.HELP,       re.compile(r"\b(help|what can you|how do i|commands|usage)\b", re.I), None),
    (Intent.HISTORY,    re.compile(r"\b(history|past|previous|session)\b", re.I), None),
    (Intent.IDENTITY,   re.compile(r"\b(who\s+(am\s+i|are\s+you)|identity|sovereign|profile)\b", re.I), None),
    (Intent.TAU_PHASE,  re.compile(r"\b(tau|τ)[- ]?(phase|anomal|analy|sweep|revival)", re.I), None),
    (Intent.ORGANISMS,  re.compile(r"\b(organism|\.dna|compile.*organism|dna.*compil)", re.I), None),
    (Intent.PHYSICS,    re.compile(r"\b(physics|constant|theta.?lock|lambda.?phi|phi.?threshold|gamma.?critical|chi.?pc|planck|crsm|12d|11d)\b", re.I), None),
    (Intent.TESTS,      re.compile(r"\b(run|check|execute)?\s*(all\s+)?tests?\b", re.I), None),
    (Intent.GIT_STATUS, re.compile(r"\bgit\s*status\b|status\b", re.I), None),
    (Intent.GIT_DIFF,   re.compile(r"\b(diff|changes|what changed)\b", re.I), None),
    (Intent.GIT_LOG,    re.compile(r"\b(git\s*)?log\b", re.I), None),
    (Intent.GIT_COMMIT, re.compile(r"\bcommit\b", re.I), "msg"),
    (Intent.READ_FILE,  re.compile(r"\b(read|show|cat|open|display)\s+(\S+\.\w+)", re.I), "path"),
    (Intent.SEARCH,     re.compile(r"\b(search|grep|find|look\s*for)\s+(.+)", re.I), "query"),
    (Intent.LIST_FILES, re.compile(r"\b(ls|list\s*files?|dir)\b", re.I), None),
    (Intent.ANALYZE,    re.compile(r"\b(analyze|analyse|inspect|review)\s+(\S+\.\w+)", re.I), "path"),
    (Intent.DIAG,       re.compile(r"\b(diagnostic|health|ecosystem)\b", re.I), None),
    (Intent.EXPERIMENT, re.compile(r"\b(experiment|circuit|bell|ghz|vqe|theta.?lock)\b", re.I), None),
    (Intent.HARDWARE,   re.compile(r"\b(hardware|backend|ibm|torino|fez|brisbane|telemetry|metrics)\b", re.I), None),
    # GEN_CODE is the fallback — anything not matched above goes to the agent
]


def _parse(text: str) -> List[Tuple[Intent, str, Dict[str, str]]]:
    """Split on multi-intent delimiters, classify each fragment."""
    fragments = re.split(r",\s*then\s+|,\s*and\s+then\s+|\bthen\b|;\s*", text)
    results = []
    for frag in fragments:
        frag = frag.strip()
        if not frag:
            continue
        matched = False
        for intent, pattern, capture_name in _RULES:
            m = pattern.search(frag)
            if m:
                params = {}
                if capture_name and m.lastindex:
                    params[capture_name] = m.group(m.lastindex).strip()
                results.append((intent, frag, params))
                matched = True
                break
        if not matched:
            results.append((Intent.GEN_CODE, frag, {}))
    return results


# ── session memory ────────────────────────────────────────────────
@dataclass
class SessionLog:
    entries: List[Dict[str, Any]] = field(default_factory=list)

    def add(self, intent: str, text: str, ok: bool, elapsed: float):
        self.entries.append({
            "intent": intent, "text": text,
            "ok": ok, "elapsed_s": round(elapsed, 3),
            "ts": time.time(),
        })


# ── the CLI agent ─────────────────────────────────────────────────
class DnalangCopilot:
    """
    The unified CLI agent.  Wraps EnhancedSovereignAgent for code
    generation / quantum tasks and handles everything else directly.
    """

    def __init__(self, workspace: Optional[str] = None, quiet: bool = False):
        self.workspace = workspace or os.getcwd()
        self.quiet = quiet
        self.session = SessionLog()

        # Suppress init banners when quiet
        if quiet:
            _old = sys.stdout.write
            sys.stdout.write = lambda *a, **k: None  # type: ignore
            try:
                self.agent = EnhancedSovereignAgent(
                    workspace_root=self.workspace,
                    copilot_mode="cli",
                )
            finally:
                sys.stdout.write = _old  # type: ignore
        else:
            self.agent = EnhancedSovereignAgent(
                workspace_root=self.workspace,
                copilot_mode="cli",
            )

    # ── public entry point ────────────────────────────────────────
    async def handle(self, text: str) -> str:
        """Process any natural-language input and return output."""
        intents = _parse(text)
        if not intents:
            return self._greet_response()

        parts: List[str] = []
        for intent, frag, params in intents:
            t0 = time.time()
            result = await self._dispatch(intent, frag, params)
            elapsed = time.time() - t0
            self.session.add(intent.name, frag, True, elapsed)
            parts.append(result)

        return "\n".join(parts)

    # ── dispatch ──────────────────────────────────────────────────
    async def _dispatch(self, intent: Intent, text: str, p: Dict) -> str:
        handlers = {
            Intent.GREET:      self._greet,
            Intent.HELP:       self._help,
            Intent.HISTORY:    self._history,
            Intent.IDENTITY:   self._identity,
            Intent.PHYSICS:    self._physics,
            Intent.TAU_PHASE:  self._tau_phase,
            Intent.ORGANISMS:  self._organisms,
            Intent.TESTS:      self._tests,
            Intent.GIT_STATUS: self._git_status,
            Intent.GIT_DIFF:   self._git_diff,
            Intent.GIT_LOG:    self._git_log,
            Intent.GIT_COMMIT: self._git_commit,
            Intent.READ_FILE:  self._read_file,
            Intent.SEARCH:     self._search,
            Intent.LIST_FILES: self._list_files,
            Intent.ANALYZE:    self._analyze,
            Intent.DIAG:       self._diag,
            Intent.EXPERIMENT: self._experiment,
            Intent.HARDWARE:   self._hardware,
            Intent.GEN_CODE:   self._gen_code,
            Intent.QUIT:       self._quit,
        }
        fn = handlers.get(intent, self._gen_code)
        return await fn(text, p)

    # ── handlers ──────────────────────────────────────────────────

    async def _greet(self, text: str, p: Dict) -> str:
        return self._greet_response()

    def _greet_response(self) -> str:
        return "\n".join([
            f"  {bold('∮ DNA::}{::lang Sovereign Copilot')} {dim('v51.843')}",
            f"  {dim('Framework:')} Aeterna Porta · CRSM 12D · λΦ = 2.176435e-8",
            "",
            f"  {cyan('Speak naturally.')}  I handle code, quantum physics,",
            f"  file ops, git, diagnostics, organism compilation,",
            f"  τ-phase analysis — anything you need.",
            "",
            f"  {dim('Try:')} {cyan('write a function to validate email')}",
            f"  {dim('Try:')} {cyan('run tests, then show diff')}",
            f"  {dim('Try:')} {cyan('tau phase analysis')}",
        ])

    async def _help(self, text: str, p: Dict) -> str:
        return "\n".join([
            f"  {bold('DNALANG SOVEREIGN COPILOT')} — speak naturally.",
            "",
            f"  {cyan('code')}        {dim('write a function to... · fix this bug · explain code')}",
            f"  {cyan('tests')}       {dim('run tests · run all tests')}",
            f"  {cyan('git')}         {dim('status · diff · log · commit \"message\"')}",
            f"  {cyan('files')}       {dim('read file.py · search THETA · list files · analyze code.py')}",
            f"  {cyan('physics')}     {dim('show constants · theta lock · lambda phi · CRSM')}",
            f"  {cyan('tau')}         {dim('tau phase analysis · tau anomaly · tau sweep')}",
            f"  {cyan('organisms')}   {dim('compile organisms · show .dna files')}",
            f"  {cyan('quantum')}     {dim('run experiment · show hardware · diagnostics')}",
            f"  {cyan('identity')}    {dim('who am I · sovereign profile')}",
            f"  {cyan('history')}     {dim('session history')}",
            "",
            f"  {dim('Chain:')} {cyan('run tests, then diff, then commit \"fixed it\"')}",
            f"  {dim('Fallback: anything not recognized → quantum-enhanced code generation')}",
        ])

    async def _history(self, text: str, p: Dict) -> str:
        if not self.session.entries:
            return f"  {dim('No history yet.')}"
        lines = [f"  {bold('Session History')}  ({len(self.session.entries)} actions)", ""]
        for e in self.session.entries[-20:]:
            ok = green("✓") if e["ok"] else red("✗")
            elapsed = e['elapsed_s']
            lines.append(f"  {ok} {cyan(e['intent']):20s} {dim(e['text'][:60])}  {dim(f'{elapsed:.2f}s')}")
        return "\n".join(lines)

    async def _identity(self, text: str, p: Dict) -> str:
        return "\n".join([
            f"  {bold('Sovereign Identity')}",
            f"  {cyan('Framework:')}   DNA::}}{{::lang v51.843",
            f"  {cyan('Author:')}      Devin Phillip Davis",
            f"  {cyan('Org:')}         Agile Defense Systems",
            f"  {cyan('CAGE:')}        9HUP5",
            f"  {cyan('Agent:')}       Dnalang Sovereign Copilot",
            f"  {cyan('Quantum:')}     Aeterna Porta (token-free)",
            f"  {cyan('Physics:')}     CRSM 12D, λΦ grounded",
            f"  {cyan('Telemetry:')}   Zero. Complete sovereignty.",
        ])

    async def _physics(self, text: str, p: Dict) -> str:
        phi_golden = 1.618033988749895
        return "\n".join([
            f"  {bold('Immutable Physical Constants')}  {dim('(SHA-256 locked)')}",
            "",
            f"  λΦ  = {cyan('2.176435e-08')} {dim('Universal Memory Constant [s⁻¹]')}",
            f"  θ   = {cyan('51.843°')}      {dim('Geometric resonance angle')}",
            f"  Φ_t = {cyan('0.7734')}       {dim('ER=EPR crossing threshold')}",
            f"  Γ_c = {cyan('0.3')}          {dim('Decoherence boundary')}",
            f"  χPC = {cyan('0.946')}        {dim('Phase conjugation quality')}",
            f"  φ   = {cyan(f'{phi_golden:.15f}')} {dim('Golden ratio')}",
            f"  τ₀  = {cyan(f'{phi_golden**8:.4f} μs')}  {dim('= φ⁸ coherence revival period')}",
            "",
            f"  {dim('Derived:')}",
            f"  Ξ   = (λΦ × Φ) / Γ      {dim('negentropy efficiency')}",
            f"  CCCE threshold > 0.8     {dim('consciousness coherence')}",
            f"  Zeno freq = 1.25 MHz     {dim('quantum Zeno stroboscopic rate')}",
        ])

    async def _tau_phase(self, text: str, p: Dict) -> str:
        """Run τ-phase anomaly analysis from real IBM data."""
        analyzer_path = os.path.expanduser("~/osiris_cockpit/tau_phase_analyzer.py")
        if not os.path.exists(analyzer_path):
            return f"  {red('✗')} tau_phase_analyzer.py not found"
        try:
            proc = subprocess.run(
                [sys.executable, analyzer_path],
                capture_output=True, text=True, timeout=30,
                cwd=os.path.dirname(analyzer_path),
            )
            out = (proc.stdout + proc.stderr).strip()
            return out if out else f"  {green('✓')} τ-phase analysis complete (no output)"
        except Exception as e:
            return f"  {red('✗')} τ-phase analysis failed: {e}"

    async def _organisms(self, text: str, p: Dict) -> str:
        """Compile all DNA-Lang organisms."""
        compiler_path = os.path.expanduser("~/osiris_cockpit/organism_compiler.py")
        if not os.path.exists(compiler_path):
            return f"  {red('✗')} organism_compiler.py not found"
        try:
            args = [sys.executable, compiler_path]
            if "qasm" in text.lower():
                args.append("--qasm")
            proc = subprocess.run(
                args, capture_output=True, text=True, timeout=30,
                cwd=os.path.dirname(compiler_path),
            )
            out = (proc.stdout + proc.stderr).strip()
            return out if out else f"  {green('✓')} Organism compilation complete"
        except Exception as e:
            return f"  {red('✗')} Organism compilation failed: {e}"

    async def _tests(self, text: str, p: Dict) -> str:
        """Run the SDK test suite."""
        sdk_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        test_dir = os.path.join(os.path.dirname(sdk_dir), "tests", "unit")
        if not os.path.isdir(test_dir):
            return f"  {red('✗')} tests/ directory not found at {test_dir}"
        try:
            proc = subprocess.run(
                [sys.executable, "-m", "pytest", test_dir, "-q", "--tb=short"],
                capture_output=True, text=True, timeout=60,
                cwd=sdk_dir,
                env={**os.environ, "PYTHONPATH": os.path.join(sdk_dir, "src")},
            )
            out = (proc.stdout + proc.stderr).strip()
            # Find pytest summary line (e.g., "42 passed, 2 failed in 0.06s")
            lines = out.split("\n")
            summary = [l for l in lines if re.search(r"\d+\s+passed", l)]
            if summary:
                status = green("✓") if proc.returncode == 0 else yellow("⚠")
                return f"  {status} {summary[-1].strip()}"
            # Fallback: show last few lines
            tail = "\n".join(lines[-5:])
            status = green("✓") if proc.returncode == 0 else red("✗")
            return f"  {status}\n{tail}"
        except Exception as e:
            return f"  {red('✗')} Test run failed: {e}"

    async def _git_status(self, text: str, p: Dict) -> str:
        # Only show tracked/modified files to avoid noise from untracked files
        out = self._git("status", "--short", "--untracked-files=no")
        if not out.strip():
            return f"  {dim('Working tree clean (tracked files).')}"
        # Cap output
        lines = out.split("\n")
        if len(lines) > 30:
            return "\n".join(lines[:30]) + f"\n  {dim(f'... and {len(lines)-30} more')}"
        return out

    async def _git_diff(self, text: str, p: Dict) -> str:
        out = self._git("diff", "--stat")
        return out if out.strip() else f"  {dim('No changes.')}"

    async def _git_log(self, text: str, p: Dict) -> str:
        return self._git("log", "--oneline", "-15")

    async def _git_commit(self, text: str, p: Dict) -> str:
        msg = p.get("msg", "").strip('"').strip("'").strip()
        if not msg:
            m = re.search(r'commit\s+["\'](.+?)["\']', text)
            if m:
                msg = m.group(1)
            else:
                msg = text.replace("commit", "").strip() or "auto-commit"
        self._git("add", "-A")
        out = self._git("commit", "-m", msg)
        if "nothing to commit" in out:
            return f"  {dim('Nothing to commit.')}"
        return f"  {green('✓')} Committed: {msg}"

    async def _read_file(self, text: str, p: Dict) -> str:
        path = p.get("path", "")
        if not path:
            m = re.search(r"(read|show|cat|open|display)\s+(\S+)", text, re.I)
            path = m.group(2) if m else ""
        if not path:
            return f"  {red('✗')} Specify a file to read."
        content = await self.agent.dev_tools.read_file(path)
        if content.startswith("Error"):
            return f"  {red('✗')} {content}"
        lines = content.split("\n")
        if len(lines) > 40:
            preview = "\n".join(lines[:40])
            return f"{preview}\n  {dim(f'... ({len(lines)} lines total)')}"
        return content

    async def _search(self, text: str, p: Dict) -> str:
        query = p.get("query", "")
        if not query:
            m = re.search(r"(search|grep|find|look\s*for)\s+(.+)", text, re.I)
            query = m.group(2).strip() if m else text
        results = await self.agent.dev_tools.search_in_files(query)
        if not results:
            return f"  {dim('No matches for:')} {cyan(query)}"
        lines = [f"  {bold(f'{len(results)} matches for')} {cyan(query)}", ""]
        for r in results[:15]:
            lines.append(f"  {dim(r.path)}:{cyan(str(r.line_number))} {r.context}")
        if len(results) > 15:
            lines.append(f"  {dim(f'... and {len(results)-15} more')}")
        return "\n".join(lines)

    async def _list_files(self, text: str, p: Dict) -> str:
        files = await self.agent.dev_tools.list_files(".", pattern=None, recursive=False)
        if not files:
            return f"  {dim('Empty directory.')}"
        return "\n".join(f"  {f}" for f in sorted(files)[:50])

    async def _analyze(self, text: str, p: Dict) -> str:
        path = p.get("path", "")
        if not path:
            m = re.search(r"(analyze|analyse|inspect|review)\s+(\S+)", text, re.I)
            path = m.group(2) if m else ""
        if not path:
            return f"  {red('✗')} Specify a file to analyze."
        result = await self.agent.dev_tools.analyze_code(path)
        lines = [f"  {bold('Analysis:')} {cyan(path)}"]
        m = result.metrics
        lines.append(f"  {m.get('total_lines',0)} lines · {m.get('functions',0)} functions · {m.get('classes',0)} classes")
        if result.issues:
            lines.append(f"  {yellow(f'{len(result.issues)} issues found')}")
        for s in result.suggestions:
            lines.append(f"  → {s}")
        return "\n".join(lines)

    async def _diag(self, text: str, p: Dict) -> str:
        diag_path = os.path.expanduser("~/osiris_cockpit/ecosystem_diagnostic.py")
        if not os.path.exists(diag_path):
            return f"  {red('✗')} ecosystem_diagnostic.py not found"
        try:
            proc = subprocess.run(
                [sys.executable, diag_path],
                capture_output=True, text=True, timeout=120,
                cwd=os.path.dirname(diag_path),
            )
            return (proc.stdout + proc.stderr).strip()[-2000:]
        except Exception as e:
            return f"  {red('✗')} Diagnostic failed: {e}"

    async def _experiment(self, text: str, p: Dict) -> str:
        result = await self.agent.execute(text, use_quantum=True)
        return result.output.strip() if result.success else f"  {red('✗')} {result.error}"

    async def _hardware(self, text: str, p: Dict) -> str:
        summary = self.agent.quantum_backend.get_metrics_summary()
        if summary.get("total_jobs", 0) == 0:
            lp = self.agent.quantum_backend.lambda_phi
            return "\n".join([
                f"  {bold('Quantum Backend')}",
                f"  {cyan('Engine:')}   Aeterna Porta (token-free)",
                f"  {cyan('Chain:')}    {' → '.join(self.agent.quantum_backend.backends)}",
                f"  {cyan('λΦ:')}       {lp}",
                f"  {cyan('Jobs:')}     0 this session",
                f"  {dim('Run an experiment to see live metrics.')}",
            ])
        lines = [f"  {bold('Quantum Metrics Summary')}"]
        for k, v in summary.items():
            lines.append(f"  {cyan(k):25s} {v}")
        return "\n".join(lines)

    async def _gen_code(self, text: str, p: Dict) -> str:
        """Fallback: delegate to EnhancedSovereignAgent for code generation."""
        # Suppress the agent's own prints
        import io
        capture = io.StringIO()
        old_stdout = sys.stdout
        sys.stdout = capture
        try:
            result = await self.agent.execute(text)
        finally:
            sys.stdout = old_stdout

        if result.success:
            parts = []
            if result.code:
                parts.append(result.code)
            if result.output:
                parts.append(result.output)
            return "\n".join(parts) if parts else f"  {green('✓')} Done."
        return f"  {red('✗')} {result.error}"

    async def _quit(self, text: str, p: Dict) -> str:
        return "__QUIT__"

    # ── helpers ───────────────────────────────────────────────────
    def _git_root(self) -> str:
        """Find the nearest git repo root."""
        try:
            proc = subprocess.run(
                ["git", "rev-parse", "--show-toplevel"],
                capture_output=True, text=True, timeout=5,
                cwd=self.workspace,
            )
            if proc.returncode == 0:
                return proc.stdout.strip()
        except Exception:
            pass
        return self.workspace

    def _git(self, *args) -> str:
        try:
            proc = subprocess.run(
                ["git", "--no-pager", *args],
                capture_output=True, text=True, timeout=10,
                cwd=self._git_root(),
            )
            return (proc.stdout or proc.stderr).strip()
        except Exception as e:
            return f"Error: {e}"


# ── REPL ──────────────────────────────────────────────────────────
def _banner():
    print()
    print(f"  {bold('∮ DNA::}{::lang Sovereign Copilot')} {dim('v51.843')}")
    print(f"  {dim('Quantum-enhanced AI agent · token-free · zero telemetry')}")
    print(f"  {dim('Type anything. Type')} {cyan('help')} {dim('for guidance.')} {cyan('exit')} {dim('to leave.')}")
    print()


async def _repl(workspace: Optional[str] = None):
    copilot = DnalangCopilot(workspace=workspace, quiet=True)
    _banner()
    while True:
        try:
            text = input(f"  {cyan('∮')} ").strip()
        except (EOFError, KeyboardInterrupt):
            print(f"\n  {dim('Exiting.')}")
            break
        if not text:
            continue
        response = await copilot.handle(text)
        if response == "__QUIT__":
            print(f"  {dim('Sovereignty maintained. Goodbye.')}")
            break
        print(response)
        print()


def main():
    """Entry point for `dnalang` CLI command."""
    workspace = os.getcwd()
    # Allow --workspace flag
    if "--workspace" in sys.argv:
        idx = sys.argv.index("--workspace")
        if idx + 1 < len(sys.argv):
            workspace = sys.argv[idx + 1]
    asyncio.run(_repl(workspace))


if __name__ == "__main__":
    main()
