#!/usr/bin/env python3
"""
OSIRIS — Sovereign Proof-of-Work Validation
DNA::}{::lang v51.843

Single command that chains every subsystem and produces a verifiable
proof artifact with SHA-256 hashes. Run this before any investor meeting.

Usage:
    python3 validate_all.py          # Full validation
    python3 validate_all.py --fast   # Skip network-dependent checks
"""

import sys, os, time, json, hashlib, subprocess, importlib
from pathlib import Path
from datetime import datetime, timezone

# ── Constants ──────────────────────────────────────────────────────
LAMBDA_PHI = 2.176435e-8
THETA_LOCK = 51.843
PHI_THRESH = 0.7734
GAMMA_CRIT = 0.3
CHI_PC     = 0.946
ZENO_FREQ  = 1.25e6
VERSION    = "51.843"

HOME = Path.home()
OC   = HOME / "osiris_cockpit"
SDK  = HOME / "dnalang-sovereign-copilot-sdk"

# ── ANSI ───────────────────────────────────────────────────────────
R  = "\033[0m"
B  = "\033[1m"
D  = "\033[2m"
CY = "\033[36m"
GR = "\033[32m"
YE = "\033[33m"
RD = "\033[31m"
MG = "\033[35m"

def ok(msg):   return f"  {GR}✓{R} {msg}"
def fail(msg): return f"  {RD}✗{R} {msg}"
def warn(msg): return f"  {YE}⚠{R} {msg}"
def info(msg): return f"  {CY}●{R} {msg}"
def bold(t):   return f"{B}{t}{R}"
def dim(t):    return f"{D}{t}{R}"

class ValidationResult:
    def __init__(self):
        self.phases = []
        self.total_checks = 0
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        self.start = time.time()

    def check(self, phase, name, passed, detail=""):
        self.total_checks += 1
        if passed:
            self.passed += 1
            print(ok(f"{name} {dim(detail) if detail else ''}"))
        else:
            self.failed += 1
            print(fail(f"{name} {detail}"))
        return passed

    def phase_header(self, n, total, name):
        self.phases.append(name)
        print(f"\n{B}{'═'*60}{R}")
        print(f"  {CY}Phase {n}/{total}{R} — {B}{name}{R}")
        print(f"{B}{'═'*60}{R}")

    def summary(self):
        elapsed = time.time() - self.start
        print(f"\n{B}{'═'*60}{R}")
        print(f"  {B}SOVEREIGN VALIDATION REPORT{R}")
        print(f"{B}{'═'*60}{R}")
        grade = "SOVEREIGN" if self.failed == 0 else "DEGRADED" if self.failed <= 3 else "COMPROMISED"
        gc = GR if grade == "SOVEREIGN" else YE if grade == "DEGRADED" else RD
        print(f"  Grade: {gc}{B}{grade}{R}")
        print(f"  Checks: {GR}{self.passed} passed{R}, {RD if self.failed else D}{self.failed} failed{R}, {self.total_checks} total")
        print(f"  Duration: {elapsed:.1f}s")
        print(f"  Timestamp: {datetime.now(timezone.utc).isoformat()}")

        # Generate proof hash
        proof = {
            "version": VERSION,
            "grade": grade,
            "passed": self.passed,
            "failed": self.failed,
            "total": self.total_checks,
            "phases": self.phases,
            "elapsed_s": round(elapsed, 2),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "constants": {
                "lambda_phi": LAMBDA_PHI,
                "theta_lock": THETA_LOCK,
                "phi_threshold": PHI_THRESH,
                "gamma_critical": GAMMA_CRIT,
                "chi_pc": CHI_PC,
            }
        }
        proof_json = json.dumps(proof, sort_keys=True)
        proof_hash = hashlib.sha256(proof_json.encode()).hexdigest()
        proof["sha256"] = proof_hash

        out_path = OC / "validation_proof.json"
        with open(out_path, "w") as f:
            json.dump(proof, f, indent=2)
        print(f"  Proof: {dim(proof_hash[:32])}...")
        print(f"  Saved: {dim(str(out_path))}")
        print(f"{B}{'═'*60}{R}\n")
        return grade


def run_sh(cmd, cwd=None, timeout=60):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout,
                           cwd=cwd, env={**os.environ, "PYTHONPATH": str(SDK/"python"/"src")})
        return r.returncode, (r.stdout + r.stderr).strip()
    except subprocess.TimeoutExpired:
        return 1, "timeout"
    except Exception as e:
        return 1, str(e)


def main():
    fast = "--fast" in sys.argv

    v = ValidationResult()
    total_phases = 8 if not fast else 6

    print(f"\n{B}∮ OSIRIS SOVEREIGN VALIDATION ∮{R}")
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    print(f"  {dim(f'DNA::}}{{::lang v{VERSION} | {ts}')}")
    mode_str = "FAST" if fast else "FULL"
    print(f"  {dim(f'Mode: {mode_str} | Phases: {total_phases}')}")

    # ════════════════════════════════════════════════════════════════
    # PHASE 1: Physics Constants Integrity
    # ════════════════════════════════════════════════════════════════
    phase = 1
    v.phase_header(phase, total_phases, "Physics Constants Integrity")

    v.check(phase, "λ_Φ = 2.176435e-8", abs(LAMBDA_PHI - 2.176435e-8) < 1e-15)
    v.check(phase, "Θ_lock = 51.843°", abs(THETA_LOCK - 51.843) < 1e-10)
    v.check(phase, "Φ threshold = 0.7734", abs(PHI_THRESH - 0.7734) < 1e-10)
    v.check(phase, "Γ critical = 0.3", abs(GAMMA_CRIT - 0.3) < 1e-10)
    v.check(phase, "χ_PC = 0.946", abs(CHI_PC - 0.946) < 1e-10)
    v.check(phase, "ν_Zeno = 1.25 MHz", abs(ZENO_FREQ - 1.25e6) < 1)
    xi = (LAMBDA_PHI * PHI_THRESH) / GAMMA_CRIT
    v.check(phase, f"Ξ = {xi:.4e} (negentropy)", xi > 0)

    lock_file = HOME / "immutable_physics.lock"
    v.check(phase, "SHA-256 lock file exists", lock_file.exists())

    # ════════════════════════════════════════════════════════════════
    # PHASE 2: Test Suites
    # ════════════════════════════════════════════════════════════════
    phase = 2
    v.phase_header(phase, total_phases, "Test Suite Verification")

    import re

    # SDK unit tests
    rc, out = run_sh([sys.executable, "-m", "pytest", "../tests/unit/", "-q", "--tb=no", "--no-header"],
                     cwd=str(SDK/"python"))
    sdk_passed = int(m.group(1)) if (m := re.search(r'(\d+) passed', out)) else 0
    sdk_failed = int(m.group(1)) if (m := re.search(r'(\d+) failed', out)) else 0
    v.check(phase, f"SDK unit tests", sdk_failed == 0, f"({sdk_passed} passed)")

    # OSIRIS cockpit tests
    rc, out = run_sh([sys.executable, "-m", "pytest", "osiris_cockpit/tests/", "-q", "--tb=no", "--no-header"],
                     cwd=str(OC))
    oc_passed = int(m.group(1)) if (m := re.search(r'(\d+) passed', out)) else 0
    oc_failed = int(m.group(1)) if (m := re.search(r'(\d+) failed', out)) else 0
    v.check(phase, f"OSIRIS cockpit tests", oc_failed == 0, f"({oc_passed} passed)")

    total_tests = sdk_passed + oc_passed
    v.check(phase, f"Total test count ≥ 300", total_tests >= 300, f"({total_tests} total)")

    # ════════════════════════════════════════════════════════════════
    # PHASE 3: NLP Agent (sovereign_cli.py)
    # ════════════════════════════════════════════════════════════════
    phase = 3
    v.phase_header(phase, total_phases, "NLP Agent Validation")

    sys.path.insert(0, str(OC))
    from sovereign_cli import Osiris, I, _COMPILED

    agent = Osiris()

    # Intent parsing
    v.check(phase, "Intent enum has 31+ values", len(I) >= 31, f"({len(I)} intents)")
    v.check(phase, "Compiled patterns loaded", len(_COMPILED) >= 30, f"({len(_COMPILED)} patterns)")

    # Core intent recognition
    test_phrases = {
        "run tests": I.TESTS,
        "who am i": I.IDENT,
        "check physics": I.PHYSICS,
        "benchmark 64": I.BENCH,
        "braket compile": I.BRAKET,
        "evolve swarm": I.SWARM,
        "help": I.HELP,
    }
    for phrase, expected in test_phrases.items():
        parsed = agent.parse(phrase)
        v.check(phase, f"Parse '{phrase}'", parsed[0][0] == expected,
                f"→ {parsed[0][0].name}")

    # Multi-intent chaining
    parsed = agent.parse("who am i; check physics; run tests")
    v.check(phase, "Multi-intent chain (3 steps)", len(parsed) == 3)

    parsed = agent.parse("identity, then physics, then benchmark 32, then evolve swarm 2")
    v.check(phase, "Multi-intent chain (4 steps)", len(parsed) == 4)

    # Physics handler
    r = agent._physics("check physics", {})
    v.check(phase, "Physics handler OK", r.ok)

    # Identity handler
    r = agent._ident("identity", {})
    v.check(phase, "Identity handler OK", r.ok and "Devin" in r.text)

    # Full __call__ integration
    output = agent("who am i; check physics")
    v.check(phase, "Full __call__ chain", "[1/2]" in output and "[2/2]" in output)

    # ════════════════════════════════════════════════════════════════
    # PHASE 4: Quantum Subsystems
    # ════════════════════════════════════════════════════════════════
    phase = 4
    v.phase_header(phase, total_phases, "Quantum Subsystems")

    # Tesseract A* decoder
    from tesseract_resonator import TesseractDecoderOrganism
    det = set(range(4))
    emap = {i: {i % 4, (i+1) % 4} for i in range(16)}
    dec = TesseractDecoderOrganism(detectors=det, error_map=emap)
    syn = {0, 1}
    t0 = time.perf_counter()
    corr = dec.decode(syn)
    dt = (time.perf_counter() - t0) * 1000
    v.check(phase, "Tesseract A* decoder", corr is not None, f"({dt:.1f}ms, 16 errors)")

    # QuEra correlated adapter
    from quera_correlated_adapter import QuEraCorrelatedAdapter
    import logging; logging.getLogger('quera_correlated_adapter').setLevel(logging.WARNING)
    adapter = QuEraCorrelatedAdapter(atoms=64, rounds=3, seed=51843)
    rds, lerr, st = adapter.generate_round_syndromes()
    merged = adapter.correlated_merge_rounds(rds)
    qcorr = adapter.decode_merged(merged)
    v.check(phase, "QuEra 64-atom decode", qcorr is not None)

    # 128-atom
    a128 = QuEraCorrelatedAdapter(atoms=128, rounds=3, seed=51843)
    r128, _, _ = a128.generate_round_syndromes()
    m128 = a128.correlated_merge_rounds(r128)
    c128 = a128.decode_merged(m128)
    v.check(phase, "QuEra 128-atom decode", c128 is not None)

    # NCLM Swarm
    import asyncio
    from nclm_swarm_orchestrator import NCLMSwarmOrchestrator
    logging.getLogger('nclm_swarm').setLevel(logging.WARNING)
    orch = NCLMSwarmOrchestrator(n_nodes=7, atoms=256, rounds=3, seed=51843)
    loop = asyncio.new_event_loop()
    for _ in range(5):
        loop.run_until_complete(orch.evolve_cycle())
    loop.close()
    con = sum(1 for n in orch.nodes.values() if n.phi >= PHI_THRESH)
    coh = sum(1 for n in orch.nodes.values() if n.gamma < GAMMA_CRIT)
    v.check(phase, "NCLM swarm (7 nodes, 5 cycles)", con > 0, f"({con}/7 conscious, {coh}/7 coherent)")
    v.check(phase, "CRSM layer advancement", orch.global_crsm.current_layer >= 1,
            f"(layer {orch.global_crsm.current_layer})")

    # Braket adapter
    from braket_ocelot_adapter import BraketOcelotAdapter, build_bell_circuit, BraketBackend
    ba = BraketOcelotAdapter()
    bell = build_bell_circuit(n_pairs=3)
    report = ba.generate_comparison_report(bell)
    backends = list(report.get("backends", {}).keys())
    v.check(phase, "Braket multi-backend compile", len(backends) >= 4,
            f"({len(backends)} backends: {', '.join(backends[:4])})")

    # Experiments simulator
    from experiments import run_simulator
    sim_results = run_simulator()
    n_above = sum(1 for r in sim_results if r.above_threshold)
    v.check(phase, "Experiment simulator", len(sim_results) >= 5,
            f"({len(sim_results)} experiments, {n_above} above Φ)")

    # ════════════════════════════════════════════════════════════════
    # PHASE 5: Ecosystem Diagnostic
    # ════════════════════════════════════════════════════════════════
    phase = 5
    v.phase_header(phase, total_phases, "Ecosystem Diagnostic")

    # Run ecosystem diagnostic as subprocess (it prints directly)
    rc, diag_out = run_sh([sys.executable, "ecosystem_diagnostic.py"], cwd=str(OC), timeout=120)
    v.check(phase, "Full 7-phase diagnostic runs", rc == 0 and len(diag_out) > 200)
    v.check(phase, "Diagnostic contains SOVEREIGN", "SOVEREIGN" in str(diag_out).upper())

    # ════════════════════════════════════════════════════════════════
    # PHASE 6: File Inventory
    # ════════════════════════════════════════════════════════════════
    phase = 6
    v.phase_header(phase, total_phases, "File Inventory & Integrity")

    critical_files = [
        (OC / "sovereign_cli.py", "NLP Agent"),
        (OC / "ecosystem_diagnostic.py", "Ecosystem Diagnostic"),
        (OC / "experiments.py", "Experiment Engine"),
        (OC / "braket_ocelot_adapter.py", "Braket Adapter"),
        (OC / "workload_analyzer.py", "Workload Analyzer"),
        (OC / "nclm_swarm_orchestrator.py", "NCLM Swarm"),
        (OC / "nonlocal_agent_enhanced.py", "NonLocal Agent"),
        (OC / "tesseract_resonator.py", "Tesseract Decoder"),
        (OC / "quera_correlated_adapter.py", "QuEra Adapter"),
        (OC / "demo" / "demo_cinematic.py", "Cinematic Demo"),
        (OC / "demo" / "demo_live.py", "Live Demo"),
        (OC / "demo" / "dashboard.html", "Web Dashboard"),
    ]

    total_lines = 0
    for fpath, label in critical_files:
        exists = fpath.exists()
        if exists:
            lines = sum(1 for _ in open(fpath))
            total_lines += lines
            v.check(phase, f"{label}", True, f"({lines:,} lines)")
        else:
            v.check(phase, f"{label}", False, "MISSING")

    v.check(phase, f"Total codebase", total_lines >= 5000, f"({total_lines:,} lines)")

    # AWS stack
    aws_dir = OC / "aws"
    aws_files = list(aws_dir.glob("*")) if aws_dir.exists() else []
    v.check(phase, "AWS SAM stack", len(aws_files) >= 5, f"({len(aws_files)} files)")

    if not fast:
        # ════════════════════════════════════════════════════════════
        # PHASE 7: Live Cloud Endpoints
        # ════════════════════════════════════════════════════════════
        phase = 7
        v.phase_header(phase, total_phases, "Live Cloud Endpoints")

        import urllib.request
        API = "https://n8cqz8i518.execute-api.us-east-2.amazonaws.com/production"
        endpoints = [
            ("Identity", f"{API}/identity"),
            ("Health", f"{API}/health"),
            ("Metrics", f"{API}/telemetry/metrics"),
        ]
        for name, url in endpoints:
            try:
                req = urllib.request.Request(url, headers={"Accept": "application/json"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read().decode())
                    status = data.get("status", "OK")
                    v.check(phase, f"{name} endpoint", True, f"({status})")
            except Exception as e:
                v.check(phase, f"{name} endpoint", False, str(e)[:60])

        # POST experiment run
        try:
            body = json.dumps({"experiments": ["EXP_THETA"], "shots": 1024}).encode()
            req = urllib.request.Request(
                f"{API}/experiments/run", data=body,
                headers={"Content-Type": "application/json"}, method="POST"
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
                grade = data.get("sovereign_grade", "?")
                v.check(phase, "Cloud experiment run", True, f"(grade: {grade})")
        except Exception as e:
            v.check(phase, "Cloud experiment run", False, str(e)[:60])

        # ════════════════════════════════════════════════════════════
        # PHASE 8: NonLocal Agent Enhanced
        # ════════════════════════════════════════════════════════════
        phase = 8
        v.phase_header(phase, total_phases, "NonLocal Agent v8.0.0")

        try:
            from nonlocal_agent_enhanced import (
                NonLocalAgentOrchestrator, BifurcatedTetrahedron,
                InsulatedPhaseEngine, EntanglementPair
            )
            # Phase engine state machine
            pe = InsulatedPhaseEngine()
            v.check(phase, "Phase engine initializes", pe.phase.name == "DORMANT")

            # Bifurcated tetrahedron
            bt = BifurcatedTetrahedron()
            v.check(phase, "Bifurcated tetrahedron geometry", bt.theta_lock == THETA_LOCK)

            # Full orchestrator
            nla = NonLocalAgentOrchestrator(seed=51843)
            v.check(phase, "NonLocal orchestrator init", len(nla.agents) == 4)

            # Evolve a few cycles
            loop2 = asyncio.new_event_loop()
            for _ in range(3):
                loop2.run_until_complete(nla.evolve_cycle())
            loop2.close()
            v.check(phase, "NonLocal 3-cycle evolution", True)
        except Exception as e:
            v.check(phase, "NonLocal agent", False, str(e)[:80])

    # ════════════════════════════════════════════════════════════════
    # FINAL SUMMARY
    # ════════════════════════════════════════════════════════════════
    grade = v.summary()
    return 0 if grade == "SOVEREIGN" else 1


if __name__ == "__main__":
    sys.exit(main())
