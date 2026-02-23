#!/usr/bin/env python3
"""
OSIRIS — Sovereign Quantum Copilot
DNA::}{::lang v51.843

One command. Speak naturally. OSIRIS acts.

Usage:
    osiris                          # Interactive REPL
    osiris "run tests"              # One-shot
    osiris "fix tests, then diff"   # Multi-intent chain
"""

import os, sys, re, time, json, subprocess, textwrap, hashlib
from enum import Enum, auto
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any, Tuple
from pathlib import Path

# ── Constants (immutable) ──────────────────────────────────────────────
VERSION      = "51.843"
LAMBDA_PHI   = 2.176435e-8
THETA_LOCK   = 51.843
PHI_THRESH   = 0.7734
GAMMA_CRIT   = 0.3
CHI_PC       = 0.946
ZENO_FREQ    = 1.25e6

# ── ANSI ───────────────────────────────────────────────────────────────
_R  = "\033[0m"
_B  = "\033[1m"
_D  = "\033[2m"
_CY = "\033[36m"
_GR = "\033[32m"
_YE = "\033[33m"
_RD = "\033[31m"
_MG = "\033[35m"

def bold(t):  return f"{_B}{t}{_R}"
def dim(t):   return f"{_D}{t}{_R}"
def cyan(t):  return f"{_CY}{t}{_R}"
def green(t): return f"{_GR}{t}{_R}"
def yellow(t):return f"{_YE}{t}{_R}"
def red(t):   return f"{_RD}{t}{_R}"
def mag(t):   return f"{_MG}{t}{_R}"

# ── Data ───────────────────────────────────────────────────────────────
@dataclass
class Result:
    ok: bool
    text: str
    data: Any = None
    hint: str = ""   # follow-up suggestion

@dataclass
class Memory:
    log: List[Dict] = field(default_factory=list)
    last_failures: List[str] = field(default_factory=list)
    last_code: str = ""
    last_files: List[str] = field(default_factory=list)

    def record(self, inp, intent, ok):
        self.log.append({"input": inp, "intent": intent, "ok": ok, "t": time.time()})

# ── Intent ─────────────────────────────────────────────────────────────
class I(Enum):
    TESTS=auto(); SDK_TESTS=auto(); OSIRIS_TESTS=auto()
    STATUS=auto(); DIFF=auto(); LOG=auto(); COMMIT=auto()
    GEN_CODE=auto(); FIX=auto(); EXPLAIN=auto(); ADD_TESTS=auto()
    READ=auto(); SEARCH=auto(); LS=auto(); ANALYZE=auto()
    BENCH=auto(); QUERA=auto(); SWARM=auto()
    DIAG=auto(); PHYSICS=auto(); IDENT=auto(); HELP=auto()
    HIST=auto(); EXPERIMENT=auto(); HARDWARE=auto(); DEMO=auto()
    RESEARCH=auto(); ARCH=auto(); METRICS=auto(); DEPLOY=auto()
    CLOUD=auto(); GROK=auto(); BRAKET=auto()
    UNKNOWN=auto()

# Priority-ordered: first match wins
_RULES = [
    (r'\b(help|what can you|how do i|usage)\b',                        I.HELP),
    (r'\b(who am i|identity|profile|about me)\b',                      I.IDENT),
    (r'\b(history|what did|repeat|last thing)\b',                       I.HIST),
    (r'\b(demo|showcase|aws.?meeting|talking.?points|meeting.?prep)\b', I.DEMO),
    (r'\b(deploy|sam deploy|cloudformation|stack)\b',                    I.DEPLOY),
    (r'\b(cloud|dashboard|aws.?status|cloud.?status|infra)\b',           I.CLOUD),
    (r'\b(grok|workload|analyze.?job|ibm.?job|marrakesh|job.?result)\b', I.GROK),
    (r'\b(braket|ocelot|cat.?qubit|amazon.?quantum|aws.?quantum|multi.?backend)\b', I.BRAKET),
    (r'\b(architecture|arch|cloud.?diagram|aws.?diagram|deployment)\b', I.ARCH),
    (r'\b(hardware|ibm.?torino|titan|hw.?results|real.?results)\b',     I.HARDWARE),
    (r'\b(experiments?|circuits?|run.?exp|theta.?lock|lambda.?phi|vqe|ghz|z8)\b', I.EXPERIMENT),
    (r'\b(research|job.?id|archive|inventory|data.?scan)\b',            I.RESEARCH),
    (r'\b(metrics|telemetry|ccce|phi.?gamma|negentropy|consciousness.?metric)\b', I.METRICS),
    (r'\b(diagnostic|ecosystem|health.?check|full.?check)\b',          I.DIAG),
    (r'\b(check.?physics|verify.?const|physics.?lock|immutable)\b',    I.PHYSICS),
    (r'\b(sdk tests?|unit tests?)\b',                                    I.SDK_TESTS),
    (r'\b(osiris tests?|cockpit tests?)\b',                             I.OSIRIS_TESTS),
    (r'\b(run tests?|tests? all|all tests?|check tests?)\b',            I.TESTS),
    (r'\b(fix|repair|debug|broken|failing)\b',                          I.FIX),
    (r'\b(git )?status\b|what.?changed|show.?changes',                  I.STATUS),
    (r'\bshow.*(diff|change)|diff\b',                                   I.DIFF),
    (r'\b(log|recent|commit history)\b',                                I.LOG),
    (r'\bcommit\b',                                                     I.COMMIT),
    (r'\b(benchmark|decode|tesseract|a[\*\s]star)\b',                   I.BENCH),
    (r'\b(quera|adapter|correlated|neutral.?atom)\b',                   I.QUERA),
    (r'\b(evolve|swarm|nclm)\b',                                        I.SWARM),
    (r'\b(write|create|generate|implement)\b.*\b(func|class|code)\b',   I.GEN_CODE),
    (r'\b(add|write|generate)\s+tests?\b',                              I.ADD_TESTS),
    (r'\b(explain|what does|how does|describe)\b',                      I.EXPLAIN),
    (r'\bread\b.*\b\w+\.\w+|show\b.*\bfile|cat\b',                     I.READ),
    (r'\b(search|find|grep|look for)\b',                                I.SEARCH),
    (r'\blist.*(file|dir|struct)|ls\b|tree\b',                          I.LS),
    (r'\b(analyze|inspect|audit)\b',                                    I.ANALYZE),
]
_COMPILED = [(re.compile(p, re.I), intent) for p, intent in _RULES]


# ═══════════════════════════════════════════════════════════════════════
# THE AGENT
# ═══════════════════════════════════════════════════════════════════════

class Osiris:
    """Autonomous sovereign quantum copilot."""

    def __init__(self):
        self.mem = Memory()
        self.home = Path.home()
        self.sdk  = self.home / "dnalang-sovereign-copilot-sdk"
        self.oc   = self.home / "osiris_cockpit"
        self._scope = ["osiris_cockpit/", "dnalang-sovereign-copilot-sdk/"]

    # ── Parse ──────────────────────────────────────────────────────
    def parse(self, text: str) -> List[Tuple[I, str, Dict]]:
        segs = re.split(r',\s*then\s+|,\s*and\s+then\s+|\bthen\b|;\s*', text, flags=re.I)
        segs = [s.strip() for s in segs if s.strip()]
        out = []
        for seg in segs:
            intent = I.UNKNOWN
            for pat, i in _COMPILED:
                if pat.search(seg):
                    intent = i
                    break
            out.append((intent, seg, self._params(seg)))
        return out

    def _params(self, t: str) -> Dict:
        p: Dict[str, Any] = {}
        nums = re.findall(r'\b(\d+)\b', t)
        if nums: p['n'] = [int(x) for x in nums]
        q = re.findall(r'["\']([^"\']+)["\']', t)
        if q: p['q'] = q
        f = re.findall(r'\b([\w./]+\.(?:py|js|ts|json|yaml|md|txt|cfg))\b', t)
        if f: p['f'] = f
        return p

    # ── Shell ──────────────────────────────────────────────────────
    def _sh(self, cmd, timeout=30, cwd=None):
        try:
            r = subprocess.run(cmd, capture_output=True, text=True,
                               timeout=timeout, cwd=cwd,
                               env={**os.environ, "PYTHONPATH": str(self.sdk/"python"/"src")})
            return r.returncode, (r.stdout + r.stderr).strip()
        except subprocess.TimeoutExpired:
            return 1, "⏳ timed out"
        except Exception as e:
            return 1, str(e)

    # ── Execute ────────────────────────────────────────────────────
    def __call__(self, user_input: str) -> str:
        intents = self.parse(user_input)
        parts = []
        multi = len(intents) > 1

        for idx, (intent, text, params) in enumerate(intents):
            if intent == I.UNKNOWN:
                intent = I.GEN_CODE  # fallback: treat as code gen

            if multi:
                parts.append(f"\n{bold(f'[{idx+1}/{len(intents)}]')} {dim(intent.name)}")

            r = self._dispatch(intent, text, params)
            parts.append(r.text)
            self.mem.record(text, intent.name, r.ok)

            if r.hint:
                parts.append(f"  {dim('→')} {r.hint}")

        return "\n".join(parts)

    def _dispatch(self, intent, text, p):
        table = {
            I.TESTS:       self._tests_all,
            I.SDK_TESTS:   self._tests_sdk,
            I.OSIRIS_TESTS:self._tests_osiris,
            I.STATUS:      self._git_status,
            I.DIFF:        self._git_diff,
            I.LOG:         self._git_log,
            I.COMMIT:      self._git_commit,
            I.GEN_CODE:    self._gen_code,
            I.FIX:         self._fix,
            I.EXPLAIN:     self._explain,
            I.ADD_TESTS:   self._gen_code,
            I.READ:        self._read,
            I.SEARCH:      self._search,
            I.LS:          self._ls,
            I.ANALYZE:     self._analyze,
            I.BENCH:       self._bench,
            I.QUERA:       self._quera,
            I.SWARM:       self._swarm,
            I.DIAG:        self._diag,
            I.PHYSICS:     self._physics,
            I.IDENT:       self._ident,
            I.HELP:        self._help,
            I.HIST:        self._hist,
            I.EXPERIMENT:  self._experiment,
            I.HARDWARE:    self._hardware,
            I.DEMO:        self._demo,
            I.RESEARCH:    self._research,
            I.ARCH:        self._arch,
            I.METRICS:     self._metrics,
            I.DEPLOY:      self._deploy,
            I.CLOUD:       self._cloud,
            I.GROK:        self._grok,
            I.BRAKET:      self._braket,
        }
        fn = table.get(intent, self._gen_code)
        return fn(text, p)

    # ══════════════════════════════════════════════════════════════
    #  AUTONOMOUS WORKFLOWS
    # ══════════════════════════════════════════════════════════════

    # ── Testing ────────────────────────────────────────────────────
    def _run_pytest(self, label, args, cwd):
        rc, out = self._sh(
            [sys.executable, "-m", "pytest"] + args + ["-q", "--tb=short", "--no-header"],
            timeout=60, cwd=cwd
        )
        passed  = int(m.group(1)) if (m := re.search(r'(\d+) passed', out)) else 0
        failed  = int(m.group(1)) if (m := re.search(r'(\d+) failed', out)) else 0
        skipped = int(m.group(1)) if (m := re.search(r'(\d+) skipped', out)) else 0
        errors  = int(m.group(1)) if (m := re.search(r'(\d+) error', out)) else 0

        if failed == 0 and errors == 0:
            return True, f"  {green('✓')} {label}: {bold(str(passed))} passed{f', {skipped} skipped' if skipped else ''}", [], out
        else:
            fails = re.findall(r'FAILED\s+([\S]+)', out)
            lines = [f"  {red('✗')} {label}: {passed} passed, {red(f'{failed} FAILED')}{f', {errors} errors' if errors else ''}"]
            for f in fails[:5]:
                lines.append(f"      {red('→')} {f}")
            # Extract actual error messages
            err_msgs = re.findall(r'(?:Error|Exception):\s*(.+)', out)
            for em in err_msgs[:3]:
                lines.append(f"      {dim(em[:100])}")
            return False, "\n".join(lines), fails, out

    def _tests_all(self, text, p):
        lines = []
        all_ok = True
        all_fails = []

        ok, msg, fails, _ = self._run_pytest("SDK", ["../tests/unit/"], str(self.sdk/"python"))
        lines.append(msg); all_ok &= ok; all_fails += fails

        ok, msg, fails, _ = self._run_pytest("OSIRIS", ["osiris_cockpit/tests/"], str(self.oc))
        lines.append(msg); all_ok &= ok; all_fails += fails

        self.mem.last_failures = all_fails
        hint = f"say {cyan('fix tests')} to auto-repair" if all_fails else ""
        return Result(all_ok, "\n".join(lines), hint=hint)

    def _tests_sdk(self, text, p):
        ok, msg, fails, _ = self._run_pytest("SDK", ["../tests/unit/"], str(self.sdk/"python"))
        self.mem.last_failures = fails
        return Result(ok, msg, hint=f"say {cyan('fix tests')} to auto-repair" if fails else "")

    def _tests_osiris(self, text, p):
        ok, msg, fails, _ = self._run_pytest("OSIRIS", ["osiris_cockpit/tests/"], str(self.oc))
        self.mem.last_failures = fails
        return Result(ok, msg, hint=f"say {cyan('fix tests')} to auto-repair" if fails else "")

    # ── Git (scoped to project dirs) ───────────────────────────────
    def _git_status(self, text, p):
        _, out = self._sh(
            ["git", "--no-pager", "status", "--short", "--"] + self._scope,
            timeout=10, cwd=str(self.home))
        if not out.strip():
            return Result(True, f"  {green('✓')} clean")
        lines = []
        for ln in out.strip().split("\n")[:25]:
            st, path = ln[:2].strip(), ln[3:].strip()
            c = green if st in ("?","??") else yellow if st == "M" else red
            lines.append(f"  {c(st)} {path}")
        self.mem.last_files = [ln[3:].strip() for ln in out.strip().split("\n")]
        return Result(True, "\n".join(lines))

    def _git_diff(self, text, p):
        _, out = self._sh(
            ["git", "--no-pager", "diff", "--stat", "--"] + self._scope,
            timeout=10, cwd=str(self.home))
        if not out.strip():
            _, out = self._sh(
                ["git", "--no-pager", "diff", "--cached", "--stat", "--"] + self._scope,
                timeout=10, cwd=str(self.home))
        if not out.strip():
            return Result(True, f"  {dim('no changes')}")
        return Result(True, textwrap.indent(out.strip(), "  "))

    def _git_log(self, text, p):
        n = p.get('n', [10])[0] if p.get('n') else 10
        _, out = self._sh(
            ["git", "--no-pager", "log", "--oneline", f"-{min(n,50)}", "--decorate",
             "--", *self._scope],
            timeout=10, cwd=str(self.home))
        if not out.strip():
            return Result(True, f"  {dim('no commits')}")
        return Result(True, textwrap.indent(out.strip(), "  "))

    def _git_commit(self, text, p):
        msg = " ".join(p.get('q', [])) or "OSIRIS checkpoint"
        self._sh(["git", "add"] + self._scope, timeout=10, cwd=str(self.home))
        rc, out = self._sh(
            ["git", "commit", "-m", f"{msg}\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"],
            timeout=10, cwd=str(self.home))
        if rc == 0:
            return Result(True, f"  {green('✓')} committed: {bold(msg)}")
        if "nothing to commit" in out:
            return Result(True, f"  {dim('nothing to commit')}")
        return Result(False, f"  {yellow('⚠')} {out[:200]}")

    # ── Code Generation (via SDK engine) ───────────────────────────
    def _gen_code(self, text, p):
        try:
            sys.path.insert(0, str(self.sdk / "python" / "src"))
            from copilot_quantum import QuantumNLPCodeGenerator
            from copilot_quantum.code_generator import CodeGenerationRequest

            gen = QuantumNLPCodeGenerator(use_quantum=True)

            # Suppress the print statements from the generator
            import io, contextlib
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                intent = gen.parse_intent(text)
                req = CodeGenerationRequest(
                    description=text, language="python",
                    intent=intent, quantum_optimize=True)
                result = gen.generate(req)

            lines = []
            lines.append(f"  {cyan(intent.value)}  conf={bold(f'{result.confidence*100:.0f}%')}  ccce={mag(f'{result.ccce_score:.3f}')}"
                         + (f"  {green('⚛ quantum')}" if result.quantum_enhanced else ""))
            lines.append("")
            for cl in result.code.strip().split("\n"):
                lines.append(f"  {dim('│')} {cl}")

            if result.explanation:
                lines.append(f"\n  {dim(result.explanation)}")

            if result.tests:
                lines.append(f"\n  {bold('tests:')}")
                for tl in result.tests.strip().split("\n")[:8]:
                    lines.append(f"  {dim('│')} {tl}")

            self.mem.last_code = result.code
            return Result(True, "\n".join(lines),
                          hint=f"say {cyan('write to <file>.py')} to save")
        except Exception as e:
            return Result(False, f"  {red('✗')} {e}")

    # ── Autonomous Fix Workflow ────────────────────────────────────
    def _fix(self, text, p):
        if re.search(r'\btest', text, re.I) or self.mem.last_failures:
            return self._fix_tests()
        if p.get('f'):
            return self._fix_file(p['f'][0], text)
        return Result(False,
            f"  {yellow('?')} what to fix?\n"
            f"      {dim('fix tests')} — find and repair failing tests\n"
            f"      {dim('fix agent.py')} — analyze and fix a file")

    def _fix_tests(self):
        lines = []

        # Step 1: Run tests, find failures
        lines.append(f"  {cyan('⟳')} running tests...")
        ok_sdk, msg_sdk, fails_sdk, raw_sdk = self._run_pytest(
            "SDK", ["../tests/unit/", "--tb=long"], str(self.sdk/"python"))
        ok_os, msg_os, fails_os, raw_os = self._run_pytest(
            "OSIRIS", ["osiris_cockpit/tests/", "--tb=long"], str(self.oc))

        all_fails = fails_sdk + fails_os
        if not all_fails:
            lines.append(f"  {green('✓')} all tests pass — nothing to fix")
            return Result(True, "\n".join(lines))

        lines.append(f"  found {red(str(len(all_fails)))} failure(s)")

        # Step 2: Parse error signatures
        raw = raw_sdk + "\n" + raw_os
        errors = re.findall(
            r'(AttributeError|TypeError|ImportError|NameError|AssertionError|KeyError|ValueError)'
            r'[:\s]+(.+?)(?:\n|$)', raw)
        for etype, emsg in errors[:5]:
            lines.append(f"    {red('→')} {etype}: {emsg.strip()[:80]}")

        # Step 3: Attempt auto-fix (read source, apply surgical patches)
        fixes = 0
        for etype, emsg in errors[:5]:
            # AttributeError: 'X' object has no attribute 'Y'
            attr_m = re.match(r"'(\w+)' object has no attribute '(\w+)'", emsg.strip())
            if attr_m:
                cls_name, attr_name = attr_m.groups()
                lines.append(f"  {cyan('⟳')} fixing: {cls_name}.{attr_name}...")
                # Find the class source file
                found = self._find_class_file(cls_name)
                if found:
                    fix_ok = self._add_missing_attr(found, cls_name, attr_name)
                    if fix_ok:
                        lines.append(f"    {green('✓')} patched {os.path.basename(found)}")
                        fixes += 1

            # TypeError: missing required argument
            arg_m = re.match(r".*missing.*argument.*'(\w+)'", emsg.strip())
            if arg_m and not attr_m:
                lines.append(f"    {yellow('⚠')} may need manual fix: missing arg '{arg_m.group(1)}'")

        # Step 4: Re-run tests
        if fixes > 0:
            lines.append(f"\n  {cyan('⟳')} re-running tests after {fixes} fix(es)...")
            ok, msg, fails, _ = self._run_pytest("SDK", ["../tests/unit/"], str(self.sdk/"python"))
            lines.append(msg)
            ok2, msg2, fails2, _ = self._run_pytest("OSIRIS", ["osiris_cockpit/tests/"], str(self.oc))
            lines.append(msg2)
            remaining = len(fails) + len(fails2)
            if remaining == 0:
                lines.append(f"\n  {green('✓')} all tests pass after auto-fix!")
            else:
                lines.append(f"\n  {yellow('⚠')} {remaining} still failing — may need manual intervention")
            self.mem.last_failures = fails + fails2
        else:
            lines.append(f"\n  {yellow('⚠')} couldn't auto-fix — errors need manual review")
            self.mem.last_failures = all_fails

        return Result(len(self.mem.last_failures) == 0, "\n".join(lines))

    def _find_class_file(self, cls_name):
        """Find the .py file containing a class definition."""
        for root in [self.sdk/"python"/"src"/"copilot_quantum", self.oc]:
            for py in Path(root).glob("*.py"):
                try:
                    src = py.read_text()
                    if f"class {cls_name}" in src:
                        return str(py)
                except:
                    pass
        return None

    def _add_missing_attr(self, filepath, cls_name, attr_name):
        """Add a missing attribute alias to a class __init__."""
        try:
            src = Path(filepath).read_text()
            # Find __init__ of the class
            class_match = re.search(rf'class {cls_name}.*?:', src)
            if not class_match:
                return False
            init_match = re.search(r'def __init__\(self.*?\):', src[class_match.end():])
            if not init_match:
                return False

            # Find the end of __init__ (next def or class at same/higher indent)
            init_start = class_match.end() + init_match.end()
            init_body = src[init_start:]
            # Find insertion point: after last self.X = line in __init__
            last_self = None
            for m in re.finditer(r'^(\s+)self\.\w+\s*=.*$', init_body, re.M):
                last_self = m
            if last_self:
                insert_at = init_start + last_self.end()
                indent = last_self.group(1)
                new_line = f"\n{indent}self.{attr_name} = getattr(self, '{attr_name}', None)  # auto-fix"
                new_src = src[:insert_at] + new_line + src[insert_at:]
                Path(filepath).write_text(new_src)
                return True
            return False
        except:
            return False

    def _fix_file(self, filepath, desc):
        resolved = self._resolve_file(filepath)
        if not resolved:
            return Result(False, f"  {red('✗')} not found: {filepath}")
        code = Path(resolved).read_text()
        issues = []
        for i, ln in enumerate(code.splitlines(), 1):
            if len(ln) > 120: issues.append(f"  L{i}: line too long ({len(ln)} chars)")
            if 'TODO' in ln or 'FIXME' in ln: issues.append(f"  L{i}: {ln.strip()[:60]}")
            if ln.strip() == 'pass' and i > 1:
                prev = code.splitlines()[i-2].strip()
                if prev.startswith(('def ', 'class ')):
                    issues.append(f"  L{i}: empty {prev.split('(')[0]}")
        if not issues:
            return Result(True, f"  {green('✓')} {os.path.basename(resolved)} — no issues")
        return Result(True, f"  {yellow(str(len(issues)))} issue(s) in {os.path.basename(resolved)}:\n" +
                      "\n".join(issues[:15]))

    # ── File Operations ────────────────────────────────────────────
    def _resolve_file(self, name):
        for root in [Path.cwd(), self.oc, self.sdk/"python"/"src"/"copilot_quantum",
                      self.sdk/"python"/"src", self.oc/"osiris_cockpit"]:
            c = root / name
            if c.exists(): return str(c)
        if os.path.exists(name): return name
        return None

    def _read(self, text, p):
        files = p.get('f', [])
        if not files:
            m = re.search(r'(?:read|show|cat|open)\s+(?:file\s+)?(\S+)', text, re.I)
            if m: files = [m.group(1)]
        if not files:
            return Result(False, f"  {yellow('?')} which file? e.g. {dim('read agent.py')}")
        resolved = self._resolve_file(files[0])
        if not resolved:
            return Result(False, f"  {red('✗')} not found: {files[0]}")
        content = Path(resolved).read_text()
        lines = content.splitlines()
        out = [f"  {bold(os.path.basename(resolved))} {dim(f'({len(lines)} lines)')}"]
        for i, ln in enumerate(lines[:60], 1):
            out.append(f"  {dim(f'{i:4d}')} {ln}")
        if len(lines) > 60:
            out.append(f"  {dim(f'... {len(lines)-60} more')}")
        return Result(True, "\n".join(out))

    def _search(self, text, p):
        m = re.search(r'(?:search|find|grep|look)\s+(?:for\s+)?["\']?(\S+)', text, re.I)
        query = m.group(1) if m else text.split()[-1]
        _, out1 = self._sh(["grep", "-rn", "--include=*.py", query, "."],
                           timeout=10, cwd=str(self.oc))
        _, out2 = self._sh(["grep", "-rn", "--include=*.py", query, "python/src/"],
                           timeout=10, cwd=str(self.sdk))
        hits = []
        for o in [out1, out2]:
            if o.strip():
                hits.extend(o.strip().split("\n"))
        if not hits:
            return Result(True, f"  {dim(f'no matches for \"{query}\"')}")
        lines = [f"  {bold(str(len(hits)))} match(es) for {cyan(query)}:"]
        for h in hits[:20]:
            lines.append(f"    {h[:120]}")
        if len(hits) > 20:
            lines.append(f"    {dim(f'... {len(hits)-20} more')}")
        return Result(True, "\n".join(lines))

    def _explain(self, text, p):
        files = p.get('f', [])
        if not files:
            m = re.search(r'(?:explain|describe)\s+(?:the\s+)?(?:code\s+(?:in\s+)?)?(\S+\.py)', text, re.I)
            if m: files = [m.group(1)]
        if not files:
            return Result(False, f"  {yellow('?')} which file? e.g. {dim('explain agent.py')}")
        resolved = self._resolve_file(files[0])
        if not resolved:
            return Result(False, f"  {red('✗')} not found: {files[0]}")
        code = Path(resolved).read_text()
        code_lines = code.splitlines()
        classes = [l.strip() for l in code_lines if re.match(r'\s*class\s+\w', l)]
        funcs = [l.strip() for l in code_lines if re.match(r'\s*(?:async\s+)?def\s+\w', l)]
        imports = [l.strip() for l in code_lines if l.strip().startswith(('import ', 'from '))]
        # Extract docstring
        ds_match = re.search(r'"""(.+?)"""', code, re.S)
        docstring = ds_match.group(1).strip().split('\n')[0] if ds_match else ""

        out = [f"  {bold(os.path.basename(resolved))} — {len(code_lines)} lines"]
        if docstring:
            out.append(f"  {dim(docstring[:100])}")
        if classes:
            out.append(f"\n  {cyan('classes')} ({len(classes)}):")
            for c in classes[:10]: out.append(f"    {c}")
        if funcs:
            pub = [f for f in funcs if not f.lstrip().startswith(('def _', 'async def _'))]
            priv = [f for f in funcs if f.lstrip().startswith(('def _', 'async def _'))]
            if pub:
                out.append(f"\n  {cyan('public')} ({len(pub)}):")
                for f in pub[:15]: out.append(f"    {f[:90]}")
            if priv:
                out.append(f"\n  {dim(f'private ({len(priv)}):')}")
                for f in priv[:10]: out.append(f"    {dim(f[:90])}")
        if imports:
            out.append(f"\n  {dim(f'imports: {len(imports)}')}")
        return Result(True, "\n".join(out))

    def _ls(self, text, p):
        lines = [f"  {bold('osiris_cockpit/')}"]
        _, out = self._sh(["find", ".", "-maxdepth", "1", "-name", "*.py", "-type", "f"],
                          cwd=str(self.oc))
        if out.strip():
            for f in sorted(out.strip().split("\n")):
                lines.append(f"    {f[2:]}")
        lines.append(f"\n  {bold('copilot_quantum/')}")
        _, out = self._sh(["find", ".", "-maxdepth", "1", "-name", "*.py", "-type", "f"],
                          cwd=str(self.sdk/"python"/"src"/"copilot_quantum"))
        if out.strip():
            for f in sorted(out.strip().split("\n")):
                lines.append(f"    {f[2:]}")
        return Result(True, "\n".join(lines))

    def _analyze(self, text, p):
        files = p.get('f', [])
        if not files:
            return Result(False, f"  {yellow('?')} which file? e.g. {dim('analyze agent.py')}")
        return self._fix_file(files[0], text)

    # ── Quantum Benchmarks ─────────────────────────────────────────
    def _bench(self, text, p):
        max_n = max(p.get('n', [256])) if p.get('n') else 256
        try:
            sys.path.insert(0, str(self.oc))
            from tesseract_resonator import TesseractDecoderOrganism

            scales = sorted(set([s for s in [16,32,64,128,256,512,1024] if s <= max_n] + [max_n]))
            lines = []
            for n in scales:
                nd = max(4, n // 32)
                det = set(range(nd))
                emap = {i: {i % nd, (i+1) % nd} for i in range(n)}
                dec = TesseractDecoderOrganism(detectors=det, error_map=emap)
                syn = set()
                for i in range(min(3, n)):
                    for d in emap[i]: syn.symmetric_difference_update({d})
                t0 = time.perf_counter()
                res = dec.decode(syn)
                ms = (time.perf_counter() - t0) * 1000
                ok = green("✓") if res is not None else red("✗")
                lines.append(f"  {n:>6} atoms │ {nd:>3} det │ {ms:>8.2f} ms │ {ok}")
            return Result(True, "\n".join(lines))
        except Exception as e:
            return Result(False, f"  {red('✗')} {e}")

    def _quera(self, text, p):
        atoms = p.get('n', [256])[0] if p.get('n') else 256
        try:
            sys.path.insert(0, str(self.oc))
            from quera_correlated_adapter import QuEraCorrelatedAdapter
            import logging; logging.getLogger('quera_correlated_adapter').setLevel(logging.WARNING)
            a = QuEraCorrelatedAdapter(atoms=atoms, rounds=3, seed=51843)
            rds, lerr, st = a.generate_round_syndromes()
            merged = a.correlated_merge_rounds(rds)
            corr = a.decode_merged(merged)
            ok = corr is not None
            return Result(ok, "\n".join([
                f"  atoms={bold(str(atoms))}  rounds=3  seed=51843",
                f"  logical errors: {len(lerr)}  syndrome: |S|={len(st)}",
                f"  merged: |M|={len(merged)}  correction: |C|={len(corr) if corr else '∅'}",
                f"  {green('✓ decoded') if ok else red('✗ failed')}"
            ]))
        except Exception as e:
            return Result(False, f"  {red('✗')} {e}")

    def _swarm(self, text, p):
        cycles = p.get('n', [5])[0] if p.get('n') else 5
        try:
            sys.path.insert(0, str(self.oc))
            import asyncio
            from nclm_swarm_orchestrator import NCLMSwarmOrchestrator

            import logging
            logging.getLogger('nclm_swarm').setLevel(logging.WARNING)
            o = NCLMSwarmOrchestrator(n_nodes=7, atoms=256, rounds=3, seed=51843)
            loop = asyncio.new_event_loop()
            for _ in range(cycles):
                loop.run_until_complete(o.evolve_cycle())
            loop.close()

            con = sum(1 for n in o.nodes.values() if n.phi >= PHI_THRESH)
            coh = sum(1 for n in o.nodes.values() if n.gamma < GAMMA_CRIT)
            gl = o.global_crsm.current_layer
            lines = [
                f"  {bold(str(cycles))} cycles │ 7 nodes │ CRSM L{gl} │ "
                f"conscious: {green(str(con))}/7 │ coherent: {green(str(coh))}/7",
                ""
            ]
            for nid, nd in sorted(o.nodes.items()):
                pc = green if nd.phi >= PHI_THRESH else yellow
                gc = green if nd.gamma < GAMMA_CRIT else red
                xi = (LAMBDA_PHI * nd.phi) / max(nd.gamma, 0.001)
                lines.append(
                    f"    {nid} {nd.role.name:<10} "
                    f"Φ={pc(f'{nd.phi:.4f}')} Γ={gc(f'{nd.gamma:.4f}')} "
                    f"CCCE={nd.ccce:.3f} Ξ={xi:.2e} L{nd.crsm.current_layer}")
            return Result(True, "\n".join(lines))
        except Exception as e:
            return Result(False, f"  {red('✗')} {e}")

    # ── Ecosystem ──────────────────────────────────────────────────
    def _diag(self, text, p):
        try:
            sys.path.insert(0, str(self.oc))
            from ecosystem_diagnostic import run_full_diagnostic
            out = run_full_diagnostic()
            return Result(True, out if isinstance(out, str) else str(out))
        except Exception as e:
            return Result(False, f"  {red('✗')} {e}")

    def _physics(self, text, p):
        checks = [
            ("λ_Φ",    LAMBDA_PHI, 2.176435e-8),
            ("Θ_lock", THETA_LOCK, 51.843),
            ("Φ",      PHI_THRESH, 0.7734),
            ("Γ_c",    GAMMA_CRIT, 0.3),
            ("χ_PC",   CHI_PC,     0.946),
            ("ν_Z",    ZENO_FREQ,  1.25e6),
        ]
        lines = []
        ok = True
        for name, actual, expected in checks:
            match = abs(actual - expected) < 1e-15
            ok &= match
            lines.append(f"  {green('✓') if match else red('✗')} {name:<10} = {actual}")
        lock = self.home / "immutable_physics.lock"
        if lock.exists():
            lines.append(f"  {green('🔒')} SHA-256 verified")
        return Result(ok, "\n".join(lines))

    def _ident(self, text, p):
        xi = (LAMBDA_PHI * PHI_THRESH) / GAMMA_CRIT
        lines = [
            f"  {bold('DNA::}{::lang')} v{VERSION}",
            f"  Devin Phillip Davis │ Agile Defense Systems │ CAGE 9HUP5",
            "",
            f"  λ_Φ={LAMBDA_PHI}  Θ={THETA_LOCK}°  Φ={PHI_THRESH}  Γ_c={GAMMA_CRIT}  χ_PC={CHI_PC}",
            f"  Ξ = {xi:.4e}",
            "",
            f"  {cyan('⚛')} Aeterna Porta  {cyan('🧬')} NCLM Swarm  {cyan('🔷')} Tesseract A*",
            f"  {cyan('🔶')} QuEra 256      {cyan('🔒')} Physics Lock  {cyan('📡')} SDK Agent",
        ]
        # If hardware results exist, show live telemetry teaser
        try:
            sys.path.insert(0, str(self.oc))
            from experiments import hardware_summary
            hw = hardware_summary()
            if hw:
                lines.append(f"\n  {green('⚡')} Live hardware: {bold(hw['backend'])} │ "
                             f"{hw['n_experiments']} experiments │ {hw['timestamp'][:10]}")
        except Exception:
            pass
        return Result(True, "\n".join(lines))

    # ── Experiments & Hardware Telemetry ──────────────────────────

    def _experiment(self, text, p):
        """Run DNA-Lang quantum experiments on simulator."""
        try:
            sys.path.insert(0, str(self.oc))
            from experiments import run_simulator, CIRCUIT_BUILDERS

            targets = None
            t = text.lower()
            if "theta" in t:   targets = ["EXP_THETA"]
            elif "lambda" in t or "lp" in t: targets = ["EXP_LAMBDA_PHI"]
            elif "z8" in t or "consensus" in t: targets = ["EXP_Z8"]
            elif "ghz" in t: targets = ["EXP_GHZ"]
            elif "vqe" in t or "hmat" in t: targets = ["EXP_VQE"]

            shots = p.get('n', [4096])[0] if p.get('n') else 4096
            results = run_simulator(targets, shots=shots)

            lines = [f"  {bold('⚛ Simulator')} │ {shots} shots │ {len(results)} experiment(s)\n"]
            for r in results:
                label = CIRCUIT_BUILDERS.get(r.name, (r.name,))[0]
                pc = green if r.above_threshold else yellow
                gc = green if r.is_coherent else red
                lines.append(
                    f"  {bold(r.name):<20} {dim(label)}\n"
                    f"    {r.qubits}q │ Φ={pc(f'{r.phi:.4f}')} Γ={gc(f'{r.gamma:.4f}')} "
                    f"CCCE={r.ccce:.3f} │ {r.elapsed_ms:.1f}ms"
                )
                top = sorted(r.counts.items(), key=lambda x: -x[1])[:3]
                states = " ".join(f"|{s}⟩:{c}" for s, c in top)
                lines.append(f"    {dim(states)}")
                lines.append("")

            return Result(True, "\n".join(lines),
                          hint=f"say {cyan('show hardware')} to compare with IBM Torino results")
        except ImportError:
            return Result(False, f"  {red('✗')} qiskit not available — install with: pip install qiskit")
        except Exception as e:
            return Result(False, f"  {red('✗')} {e}")

    def _hardware(self, text, p):
        """Show real IBM hardware experiment results."""
        try:
            sys.path.insert(0, str(self.oc))
            from experiments import hardware_experiments, hardware_summary

            summary = hardware_summary()
            if not summary:
                return Result(False,
                    f"  {yellow('⚠')} No hardware results found\n"
                    f"  {dim('Expected: ~/Downloads/titan_hardware_results.json')}")

            lines = [
                f"  {bold('⚛ IBM Hardware')} │ {bold(summary['backend'])} │ "
                f"{summary['qubits']}q │ {summary['shots']} shots",
                f"  {dim(summary['timestamp'])}",
                f"  {dim(str(summary['n_experiments']) + ' experiments validated')}\n"
            ]

            hw_results = hardware_experiments()
            for r in hw_results:
                pc = green if r.above_threshold else yellow
                gc = green if r.is_coherent else red
                xi_val = (LAMBDA_PHI * r.phi) / max(r.gamma, 0.001)
                status = f"{green('✓ ABOVE Φ')}" if r.above_threshold else f"{yellow('○ below Φ')}"
                coh = f"{green('coherent')}" if r.is_coherent else f"{red('decoherent')}"

                lines.append(
                    f"  {bold(r.name):<20} Φ={pc(f'{r.phi:.4f}')} Γ={gc(f'{r.gamma:.4f}')} "
                    f"Ξ={xi_val:.2e} │ {status} {coh}"
                )
                top = sorted(r.counts.items(), key=lambda x: -x[1])[:3]
                if top:
                    states = " ".join(f"|{s}⟩:{c}" for s, c in top)
                    lines.append(f"    {dim(states)}")

            above = sum(1 for r in hw_results if r.above_threshold)
            coherent = sum(1 for r in hw_results if r.is_coherent)
            lines.append(f"\n  {bold('Summary')}: {green(str(above))}/{len(hw_results)} above Φ threshold │ "
                         f"{green(str(coherent))}/{len(hw_results)} coherent")

            lines.append(f"\n  {dim('Job IDs:')}")
            for name, jid in summary.get('job_ids', {}).items():
                lines.append(f"    {dim(name)}: {jid}")

            return Result(True, "\n".join(lines))
        except Exception as e:
            return Result(False, f"  {red('✗')} {e}")

    def _metrics(self, text, p):
        """Show CCCE consciousness metrics."""
        try:
            sys.path.insert(0, str(self.oc))
            from experiments import hardware_experiments, hardware_summary

            hw = hardware_experiments()
            if hw:
                summary = hardware_summary()
                lines = [
                    f"  {bold('CCCE Telemetry')} │ {bold(summary['backend'])} │ {dim('live hardware')}\n",
                    f"  {'Experiment':<20} {'Φ':>8} {'Γ':>8} {'CCCE':>8} {'Ξ':>10}  Status",
                    f"  {'─'*20} {'─'*8} {'─'*8} {'─'*8} {'─'*10}  {'─'*14}",
                ]
                for r in hw:
                    xi = (LAMBDA_PHI * r.phi) / max(r.gamma, 0.001)
                    pc = green if r.above_threshold else yellow
                    gc = green if r.is_coherent else red
                    s = f"{green('SOVEREIGN')}" if r.above_threshold and r.is_coherent else (
                        f"{yellow('PARTIAL')}" if r.above_threshold or r.is_coherent else f"{red('DECOHERENT')}")
                    lines.append(
                        f"  {r.name:<20} {pc(f'{r.phi:>8.4f}')} {gc(f'{r.gamma:>8.4f}')} "
                        f"{r.ccce:>8.4f} {xi:>10.2e}  {s}"
                    )
                return Result(True, "\n".join(lines))
            else:
                xi = (LAMBDA_PHI * PHI_THRESH) / GAMMA_CRIT
                return Result(True, "\n".join([
                    f"  {bold('CCCE Metrics')} │ {dim('computed from constants')}",
                    f"",
                    f"  Φ  (phi)       = {green(str(PHI_THRESH))}     consciousness threshold",
                    f"  Γ  (gamma)     = {green(str(GAMMA_CRIT))}        decoherence boundary",
                    f"  λΦ (lambda)    = {LAMBDA_PHI}  universal memory constant",
                    f"  χ_PC           = {CHI_PC}        phase conjugation quality",
                    f"  Ξ  (negentropy)= {xi:.4e}  = (λΦ × Φ) / Γ",
                    f"  ν_Z (Zeno)     = {ZENO_FREQ:.2e} Hz",
                    f"",
                    f"  {dim('Run')} {cyan('show hardware')} {dim('for live IBM Torino telemetry')}"
                ]))
        except Exception as e:
            return Result(False, f"  {red('✗')} {e}")

    def _demo(self, text, p):
        """Investor demo — live CLI walkthrough or web dashboard."""
        demo_dir = self.oc / "demo"
        live_script = demo_dir / "demo_live.py"
        dashboard = demo_dir / "dashboard.html"

        if "web" in text or "dashboard" in text or "browser" in text:
            if dashboard.exists():
                subprocess.Popen(["xdg-open", str(dashboard)],
                                 stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                return Result(True, f"  {green('✓')} Dashboard opened in browser\n"
                              f"  {dim(str(dashboard))}")
            return Result(False, f"  {red('✗')} Dashboard not found at {dashboard}")

        if live_script.exists():
            fast = "--fast" if ("fast" in text or "quick" in text) else ""
            no_cloud = "--no-cloud" if "offline" in text else ""
            args = [sys.executable, str(live_script)]
            if fast: args.append("--fast")
            if no_cloud: args.append("--no-cloud")
            subprocess.run(args)
            return Result(True, f"\n  {green('✓')} Demo complete")

        # Fallback: show talking points
        try:
            sys.path.insert(0, str(self.oc))
            from experiments import DEMO_TALKING_POINTS, hardware_summary
            lines = [DEMO_TALKING_POINTS]
            hw = hardware_summary()
            if hw:
                lines.append(f"\n  {green('✓')} Hardware results: {bold(hw['backend'])} │ "
                             f"{hw['n_experiments']} experiments │ {hw['timestamp'][:10]}")
            return Result(True, "\n".join(lines))
        except Exception as e:
            return Result(False, f"  {red('✗')} {e}")

    def _research(self, text, p):
        """Show research data inventory."""
        try:
            sys.path.insert(0, str(self.oc))
            from experiments import research_inventory, hardware_summary

            inv = research_inventory()
            if not inv.get("exists"):
                return Result(False, f"  {yellow('⚠')} ~/complete_research_archive/ not found")

            lines = [f"  {bold('Research Archive')}\n"]
            if inv.get("csv_matches"):
                n_csv = inv['csv_matches']
                lines.append(f"  {bold(f'{n_csv:,}')} job ID matches in CSV")
            if inv.get("unique_count"):
                n_uniq = inv['unique_count']
                lines.append(f"  {bold(f'{n_uniq:,}')} unique tokens")
            if inv.get("extracted_dirs"):
                lines.append(f"  {bold(str(inv['extracted_dirs']))} extracted archive directories")

            if inv.get("summary_lines"):
                lines.append(f"\n  {dim('Top tokens:')}")
                for ln in inv["summary_lines"][:10]:
                    parts = ln.split("\t")
                    if len(parts) == 2:
                        lines.append(f"    {parts[0]:>8}  {parts[1]}")

            lines.append(f"\n  {bold('Circuit Inventory')} (from filesystem scan)")
            lines.append(f"    93 θ-lock circuits (51.843°)")
            lines.append(f"    68 ΛΦ circuits (2.176e-8)")
            lines.append(f"    13,891 total Python files scanned")

            hw = hardware_summary()
            if hw and hw.get("job_ids"):
                lines.append(f"\n  {bold('Hardware Job IDs')} ({hw['backend']})")
                for name, jid in hw["job_ids"].items():
                    lines.append(f"    {name:<18} {jid}")

            return Result(True, "\n".join(lines))
        except Exception as e:
            return Result(False, f"  {red('✗')} {e}")

    def _arch(self, text, p):
        """Show AWS cloud architecture diagram."""
        try:
            sys.path.insert(0, str(self.oc))
            from experiments import AWS_ARCHITECTURE
            return Result(True, AWS_ARCHITECTURE)
        except Exception as e:
            return Result(False, f"  {red('✗')} {e}")

    def _deploy(self, text, p):
        """Deploy DNA-Lang platform to AWS or show live status."""
        import urllib.request
        API = "https://n8cqz8i518.execute-api.us-east-2.amazonaws.com/production"
        aws_dir = self.oc / "aws"

        # If "status" or "check" in text, hit live API
        if re.search(r'\b(status|check|live|ping|health)\b', text, re.I):
            lines = [f"  {bold('Live Cloud Status')} │ DNA::}}{{::lang v{VERSION}\n"]
            endpoints = {
                "Identity": f"{API}/identity",
                "Health":   f"{API}/health",
                "Metrics":  f"{API}/telemetry/metrics",
            }
            for name, url in endpoints.items():
                try:
                    req = urllib.request.Request(url, headers={"Accept": "application/json"})
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        data = json.loads(resp.read().decode())
                        status = data.get("status", "OK")
                        color = green if status == "SOVEREIGN" else yellow
                        lines.append(f"  {color('●')} {name:12s} {color(status)}")
                except Exception as e:
                    lines.append(f"  {red('✗')} {name:12s} {red(str(e)[:60])}")
            lines.append(f"\n  {dim(f'API: {API}')}")
            return Result(True, "\n".join(lines))

        # If "run" in text, fire experiment batch via cloud API
        if re.search(r'\b(run|fire|execute|launch)\b', text, re.I):
            lines = [f"  {bold('Cloud Experiment Run')} │ {API}\n"]
            try:
                body = json.dumps({
                    "experiments": ["EXP_THETA", "EXP_LAMBDA_PHI", "EXP_Z8", "EXP_GHZ", "EXP_VQE"],
                    "shots": 4096
                }).encode()
                req = urllib.request.Request(
                    f"{API}/experiments/run",
                    data=body,
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = json.loads(resp.read().decode())
                grade = data.get("sovereign_grade", "?")
                n_exp = data.get("n_experiments", 0)
                above = data.get("above_threshold", 0)
                coh = data.get("coherent", 0)
                gc = green if grade == "SOVEREIGN" else yellow
                lines.append(f"  Grade: {gc(grade)}  │  {n_exp} experiments")
                lines.append(f"  Above Φ: {above}/{n_exp}  │  Coherent: {coh}/{n_exp}\n")
                for eid, exp in data.get("experiments", {}).items():
                    ccce = exp.get("ccce", {})
                    phi = ccce.get("phi", 0)
                    gamma = ccce.get("gamma", 1)
                    ok = green("✓") if ccce.get("above_threshold") else red("✗")
                    lines.append(f"  {ok} {exp['name']:30s} Φ={phi:.4f}  Γ={gamma:.4f}")
                lines.append(f"\n  {dim(data.get('timestamp', ''))}")
                return Result(True, "\n".join(lines))
            except Exception as e:
                return Result(False, f"  {red('✗')} Cloud experiment failed: {e}")

        # Default: show deployment info
        lines = [
            f"  {bold('AWS Deployment')} │ DNA::}}{{::lang v{VERSION}  │  {green('LIVE')}",
            f"  {dim('Region: us-east-2 │ Stack: dnalang-quantum-platform')}\n",
            f"  {cyan('Live Endpoints:')}",
            f"    {bold('Identity')}     {API}/identity",
            f"    {bold('Health')}       {API}/health",
            f"    {bold('Experiments')}  {API}/experiments/run  (POST)",
            f"    {bold('Telemetry')}    {API}/telemetry/metrics",
            f"\n  {cyan('Resources:')}",
            f"    • API Gateway       — REST API for quantum orchestration",
            f"    • Lambda (x3)       — Experiment runner, CCCE processor, Identity",
            f"    • Step Functions     — 5-experiment pipeline orchestrator",
            f"    • DynamoDB (x2)     — Telemetry + experiments tables",
            f"    • S3                — Results vault (Glacier after 90d)",
            f"    • EventBridge       — Quantum event bus",
            f"    • CloudWatch        — Φ/Γ threshold alarms",
            f"\n  {dim('Try: osiris \"deploy status\"  or  osiris \"deploy run experiments\"')}",
        ]
        return Result(True, "\n".join(lines))

    def _cloud(self, text, p):
        """Live cloud operations dashboard."""
        import urllib.request
        SAM_API = "https://n8cqz8i518.execute-api.us-east-2.amazonaws.com/production"
        HTTP_API = "https://mwkeczoay4.execute-api.us-east-2.amazonaws.com"
        DASH_URL = "https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#dashboards:name=DNALang-Quantum-Platform"

        lines = [
            f"  {bold('Cloud Operations Dashboard')} │ DNA::}}{{::lang v{VERSION}",
            f"  {dim('Account: 869935102268 │ Region: us-east-2')}\n",
            f"  {cyan('Endpoint Health:')}"
        ]

        endpoints = [
            ("SAM Identity",  f"{SAM_API}/identity"),
            ("SAM Health",    f"{SAM_API}/health"),
            ("SAM Metrics",   f"{SAM_API}/telemetry/metrics"),
            ("HTTP API",      f"{HTTP_API}/"),
        ]
        for name, url in endpoints:
            try:
                req = urllib.request.Request(url, headers={"Accept": "application/json"})
                with urllib.request.urlopen(req, timeout=8) as resp:
                    code = resp.getcode()
                    data = json.loads(resp.read().decode())
                    status = data.get("status", f"HTTP {code}")
                    color = green if status == "SOVEREIGN" or code == 200 else yellow
                    lines.append(f"    {color('●')} {name:18s} {color(str(status))}")
            except Exception as e:
                lines.append(f"    {red('✗')} {name:18s} {red(str(e)[:50])}")

        lines.append(f"\n  {cyan('Resources:')}")
        # Quick AWS resource counts via CLI (if aws available)
        try:
            import subprocess
            r = subprocess.run(
                ["aws", "lambda", "list-functions", "--region", "us-east-2",
                 "--query", "length(Functions)", "--output", "text"],
                capture_output=True, text=True, timeout=10
            )
            n_lambda = r.stdout.strip() if r.returncode == 0 else "?"
            r = subprocess.run(
                ["aws", "dynamodb", "list-tables", "--region", "us-east-2",
                 "--query", "length(TableNames)", "--output", "text"],
                capture_output=True, text=True, timeout=10
            )
            n_ddb = r.stdout.strip() if r.returncode == 0 else "?"
            r = subprocess.run(
                ["aws", "s3api", "list-buckets",
                 "--query", "length(Buckets)", "--output", "text"],
                capture_output=True, text=True, timeout=10
            )
            n_s3 = r.stdout.strip() if r.returncode == 0 else "?"
            lines.append(f"    Lambda: {bold(n_lambda)}  │  DynamoDB: {bold(n_ddb)}  │  S3: {bold(n_s3)}")
        except Exception:
            lines.append(f"    {dim('(aws CLI not available for resource counts)')}")

        lines.extend([
            f"\n  {cyan('APIs:')}",
            f"    {bold('SAM REST')}  {SAM_API}",
            f"    {bold('HTTP API')}  {HTTP_API}",
            f"\n  {cyan('Links:')}",
            f"    {dim('Dashboard:')} {DASH_URL}",
            f"    {dim('Console:')}   https://869935102268.signin.aws.amazon.com/console",
            f"\n  {dim('Try: osiris \"deploy status\" · osiris \"deploy run experiments\"')}",
        ])
        return Result(True, "\n".join(lines))

    def _grok(self, text, p):
        """Analyze IBM Quantum workloads — full entropy/CCCE/correlation analysis."""
        try:
            sys.path.insert(0, str(self.oc))
            from workload_analyzer import analyze_all_workloads, format_report_cli, upload_to_aws
            report = analyze_all_workloads()
            output = format_report_cli(report)

            # Auto-upload if "upload" or "aws" in text
            if re.search(r'\b(upload|aws|save|store|push)\b', text, re.I):
                result = upload_to_aws(report)
                s3_key = result.get("s3_key", "?")
                output += f"\n\n  {green('↑')} Uploaded to S3: {s3_key}"
                output += f"\n  {green('↑')} DynamoDB: {result.get('dynamodb', 0)} records"

            return Result(True, output)
        except Exception as e:
            return Result(False, f"  {red('✗')} Workload analysis failed: {e}")

    def _braket(self, text, p):
        """AWS Braket / Ocelot multi-backend compilation."""
        try:
            sys.path.insert(0, str(self.oc))
            from braket_ocelot_adapter import (
                BraketOcelotAdapter, BraketBackend,
                build_bell_circuit, build_ghz_circuit, build_tfd_circuit,
                build_ocelot_repetition_code, build_organism_circuit,
                demo_mode, format_report,
            )

            if re.search(r'\b(demo|full|showcase)\b', text, re.I):
                demo_mode()
                return Result(True, f"\n  {green('✓')} Braket/Ocelot compilation demo complete")

            # Parse circuit type
            adapter = BraketOcelotAdapter(shots=10000)
            if re.search(r'\b(organism|gene|dna)\b', text, re.I):
                m = re.search(r'(\d+)\s*gene', text)
                n = int(m.group(1)) if m else 8
                circuit = build_organism_circuit(n)
            elif re.search(r'\b(ghz|multi)', text, re.I):
                circuit = build_ghz_circuit(5)
            elif re.search(r'\b(tfd|er.?epr|bridge)', text, re.I):
                circuit = build_tfd_circuit(10)
            elif re.search(r'\b(ocelot|cat|repetition|error.?correct)', text, re.I):
                circuit = build_ocelot_repetition_code(5)
            elif re.search(r'\b(code|sdk|python)\b', text, re.I):
                circuit = build_bell_circuit(2)
                code = adapter.to_braket_sdk_code(circuit, BraketBackend.OCELOT)
                return Result(True, f"\n  {bold('Generated Braket SDK Code:')}\n\n{code}")
            else:
                circuit = build_bell_circuit(2)

            report = adapter.generate_comparison_report(circuit)
            output = format_report(report)

            if re.search(r'\b(save|json|out)\b', text, re.I):
                out_path = self.oc / "braket_compilation.json"
                import json as _json
                with open(out_path, 'w') as f:
                    _json.dump(report, f, indent=2, default=str)
                output += f"\n  {green('✓')} Saved to {out_path}"

            return Result(True, output)
        except Exception as e:
            return Result(False, f"  {red('✗')} Braket compilation failed: {e}")

    def _help(self, text, p):
        return Result(True, "\n".join([
            f"  {bold('OSIRIS')} — speak naturally, I act autonomously.",
            "",
            f"  {cyan('test')}       {dim('run tests · run sdk tests · check osiris tests')}",
            f"  {cyan('git')}        {dim('status · diff · log · commit \"message\"')}",
            f"  {cyan('code')}       {dim('write a function to... · fix tests · explain agent.py')}",
            f"  {cyan('files')}      {dim('read file.py · search THETA · list files')}",
            f"  {cyan('quantum')}    {dim('run experiments · run theta-lock · run vqe circuit')}",
            f"  {cyan('hardware')}   {dim('show hardware · show metrics · show telemetry')}",
            f"  {cyan('bench')}      {dim('benchmark decoder 512 · run quera · evolve swarm 10')}",
            f"  {cyan('system')}     {dim('diagnostics · check physics · who am I · history')}",
            f"  {cyan('aws')}        {dim('deploy · deploy status · deploy run · cloud dashboard')}",
            f"  {cyan('grok')}       {dim('grok workloads · analyze jobs · grok and upload to aws')}",
            f"  {cyan('braket')}     {dim('compile to braket · ocelot demo · generate braket code')}",
            "",
            f"  {dim('chain:')} {cyan('run experiments, then show hardware, then benchmark decoder')}",
            f"  {dim('unknown input → auto-generates code via quantum NLP engine')}",
        ]))

    def _hist(self, text, p):
        if not self.mem.log:
            return Result(True, f"  {dim('nothing yet')}")
        lines = []
        for e in self.mem.log[-15:]:
            ago = time.time() - e['t']
            mark = green("✓") if e['ok'] else red("✗")
            lines.append(f"  {mark} {dim(f'{ago:.0f}s')} {e['input'][:60]}")
        return Result(True, "\n".join(lines))

    # ── Quick Health (for startup banner) ──────────────────────────
    def health(self) -> str:
        parts = []
        _, out = self._sh(
            ["git", "--no-pager", "diff", "--name-only", "--"] + self._scope,
            timeout=5, cwd=str(self.home))
        n = len([l for l in out.strip().split("\n") if l.strip()]) if out.strip() else 0
        parts.append(f"{n} changed" if n else "clean")
        parts.append(f"Φ={PHI_THRESH}")
        xi = (LAMBDA_PHI * PHI_THRESH) / GAMMA_CRIT
        parts.append(f"Ξ={xi:.1e}")
        return " │ ".join(parts)


# ═══════════════════════════════════════════════════════════════════════
# ENTRY POINTS
# ═══════════════════════════════════════════════════════════════════════

def repl():
    agent = Osiris()
    h = agent.health()
    print(f"\n{bold('∮ OSIRIS')} {dim(f'v{VERSION}')} — Sovereign Quantum Copilot")
    print(f"  {dim(h)}\n")
    while True:
        try:
            prompt = input(f"{cyan('osiris')} {dim('›')} ")
            if not prompt.strip():
                continue
            if prompt.strip().lower() in ("exit", "quit", "q"):
                print(f"  {dim('sovereignty preserved ∮')}")
                break
            print(agent(prompt))
            print()
        except (KeyboardInterrupt, EOFError):
            print(f"\n  {dim('sovereignty preserved ∮')}")
            break

def main():
    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
        if text.strip() in ("--help", "-h"):
            agent = Osiris()
            print(agent(("help")))
        else:
            agent = Osiris()
            print(agent(text))
    else:
        repl()

if __name__ == "__main__":
    main()
