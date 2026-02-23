#!/usr/bin/env python3
"""Osiris Planner → Executor module

Provides:
- Plan schema validation (uses jsonschema if available, otherwise a minimal check)
- CRSM axis projector (pure, side-effect free)
- Executor gates enforcement and dry-run execution
- REPL integration (dry-run by default)
"""
from __future__ import annotations
import json
import time
import hashlib
import os
from pathlib import Path
from typing import Any, Dict, List

ROOT = Path.home()
VAULT = ROOT / ".sovereign_vault"
VAULT.mkdir(parents=True, exist_ok=True)
PCRB_LEDGER = VAULT / "pcrb_ledger.jsonl"
PLANS_DIR = VAULT / "plans"
PLANS_DIR.mkdir(parents=True, exist_ok=True)

SCHEMA_PATH = Path(__file__).resolve().parent / "contracts" / "plan_schema_v1.json"

# --- thresholds (CRSM policy) ---
LAMBDA_THRESHOLD = 0.95
PHI_THRESHOLD = 0.7734
GAMMA_MAX = 0.3


def compute_artifact_hash(obj: Any) -> str:
    s = json.dumps(obj, sort_keys=True, default=str).encode()
    return hashlib.sha256(s).hexdigest()


def append_ledger(entry: Dict[str, Any]) -> None:
    entry = dict(entry)
    entry["timestamp"] = time.time()
    with open(PCRB_LEDGER, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")


def load_plan_schema() -> Dict[str, Any] | None:
    try:
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def validate_plan_schema(plan: Dict[str, Any]) -> List[str]:
    """Validate plan against JSON Schema if possible, otherwise do basic checks.

    Returns list of errors (empty if ok).
    """
    errors: List[str] = []
    schema = load_plan_schema()
    try:
        import jsonschema  # type: ignore

        validator = jsonschema.Draft7Validator(schema)
        for e in validator.iter_errors(plan):
            errors.append(f"{e.message} ({'.'.join(map(str,e.path))})")
        return errors
    except Exception:
        # Fallback minimal validation
        required = ["plan_version", "meta", "authority", "steps", "validation"]
        for k in required:
            if k not in plan:
                errors.append(f"missing required key: {k}")
        if "steps" in plan and (not isinstance(plan["steps"], list) or len(plan["steps"]) == 0):
            errors.append("steps must be a non-empty array")
        return errors


def crsm_projector(plan: Dict[str, Any], workspace_snapshot: Dict[str, int] | None = None) -> Dict[str, Any]:
    """Annotate plan with CRSM projection. Pure function.

    workspace_snapshot is optional: a mapping total_files, total_lines, etc.
    """
    # Basic axis implementations (normalized 0..1)
    steps = plan.get("steps", [])
    modified_files = 0
    diff_lines = 0
    for s in steps:
        if s.get("type") in ("edit_file", "create_file", "delete_file", "apply_patch"):
            modified_files += 1
            diff = s.get("diff") or ""
            diff_lines += diff.count("\n")

    total_files = max(1, (workspace_snapshot or {}).get("total_files", 1000))
    chi_3 = min(1.0, (modified_files / total_files) * 4.0)
    chi_7 = min(1.0, diff_lines / max(1, (workspace_snapshot or {}).get("avg_diff_lines", 50)))
    chi_11 = 1.0 if any((s.get("type") == "run_command" and "npm" in (s.get("command") or "")) for s in steps) else 0.0

    # crude estimates
    lambda_delta = - (chi_7 * 0.01) - (chi_3 * 0.005)
    phi_delta = (0.0 + (chi_3 * 0.002))
    gamma_est = chi_7 * 0.05 + chi_3 * 0.01 + chi_11 * 0.02

    projection = {
        "projection_version": "1.0",
        "axes": {
            "chi_3_structural": round(chi_3, 4),
            "chi_7_entropic": round(chi_7, 4),
            "chi_11_sovereignty": round(chi_11, 4)
        },
        "invariants": {
            "lambda_delta": round(lambda_delta, 6),
            "phi_delta": round(phi_delta, 6),
            "gamma_estimate": round(gamma_est, 6)
        }
    }
    return projection


class Planner:
    def __init__(self, nlp_text: str, domain: str = "dnalang.io"):
        self.nlp = nlp_text
        self.domain = domain

    def generate_plan(self) -> Dict[str, Any]:
        # Minimal intent -> plan mock. In production, replace with NLP parser.
        plan = {
            "plan_version": "1.0",
            "meta": {
                "plan_id": f"plan-{int(time.time())}",
                "intent_id": f"intent-{compute_artifact_hash(self.nlp)[:8]}",
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "planner_hash": compute_artifact_hash(self.nlp),
                "confidence": 0.92
            },
            "authority": {
                "domain": self.domain,
                "execution_level": "modify",
                "confirmed": False
            },
            "constraints": {
                "write_allowed": False,
                "network_allowed": False,
                "quantum_domain": "read-only",
                "crsm_axes_touched": []
            },
            "steps": [
                {
                    "id": "S1",
                    "type": "edit_file",
                    "path": "fermi/src/components/TelemetryDashboard.tsx",
                    "diff": "--- a\n+++ b\n@@ -1 +1 @@\n-OLD\n+NEW\n"
                }
            ],
            "validation": {
                "preconditions": ["file_exists:fermi/src/components/TelemetryDashboard.tsx"],
                "postconditions": ["typescript_compiles"]
            }
        }
        return plan


class Executor:
    def __init__(self, dry_run: bool = True, active_domain: str | None = None):
        self.dry_run = dry_run
        self.active_domain = active_domain or os.environ.get("OSIRIS_ACTIVE_DOMAIN", "dnalang.io")

    def validate_plan(self, plan: Dict[str, Any]) -> List[str]:
        errs = validate_plan_schema(plan)
        # authority check
        auth = plan.get("authority", {})
        if auth.get("domain") != self.active_domain:
            errs.append(f"authority domain mismatch: plan {auth.get('domain')} != active {self.active_domain}")
        return errs

    def enforce_gates(self, plan: Dict[str, Any], projection: Dict[str, Any]) -> bool:
        inv = projection.get("invariants", {})
        gamma = inv.get("gamma_estimate", 1.0)
        lambda_delta = inv.get("lambda_delta", 0.0)
        if gamma >= GAMMA_MAX:
            append_ledger({"event": "crsm_abort", "reason": "gamma_exceeds", "gamma": gamma, "plan_id": plan.get("meta",{}).get("plan_id")})
            return False
        # simple lambda safety: do not allow large negative delta
        if lambda_delta < -0.05:
            append_ledger({"event": "crsm_abort", "reason": "lambda_drop", "lambda_delta": lambda_delta, "plan_id": plan.get("meta",{}).get("plan_id")})
            return False
        return True

    def execute_plan(self, plan: Dict[str, Any]) -> None:
        # Validate
        errors = self.validate_plan(plan)
        if errors:
            print("[PLAN VALIDATION FAILED]")
            for e in errors:
                print(" -", e)
            append_ledger({"event": "plan_validation_failed", "errors": errors, "plan_id": plan.get("meta",{}).get("plan_id")})
            return

        # Project CRSM
        projection = crsm_projector(plan)
        annotated = dict(plan)
        annotated.setdefault("annotations", {})["crsm_projection"] = projection

        # Save annotated plan (dry artifact)
        plan_hash = compute_artifact_hash(annotated)
        out = PLANS_DIR / f"{plan.get('meta',{}).get('plan_id')}_{plan_hash[:8]}.json"
        with open(out, "w", encoding="utf-8") as f:
            json.dump(annotated, f, indent=2)

        append_ledger({"event": "plan_emitted", "plan_id": plan.get("meta",{}).get("plan_id"), "plan_hash": plan_hash, "path": str(out)})

        # Enforce CRSM gates
        if not self.enforce_gates(plan, projection):
            print("[CRSM] Gate failure; aborting execution.")
            return

        # Execute steps sequentially (dry-run respects step params)
        for step in plan.get("steps", []):
            sid = step.get("id")
            stype = step.get("type")
            if self.dry_run or not step.get("params",{}).get("live", False):
                print(f"[DRY-RUN] step {sid}: {stype}")
                append_ledger({"event": "step_dryrun", "plan_id": plan.get("meta",{}).get("plan_id"), "step_id": sid, "step_type": stype})
                continue
            # Placeholder for live execution
            print(f"[EXECUTE] step {sid}: {stype} -- (not implemented)")
            append_ledger({"event": "step_executed", "plan_id": plan.get("meta",{}).get("plan_id"), "step_id": sid, "step_type": stype})


def repl():
    print("Osiris Planner→Executor REPL (dry-run)")
    while True:
        try:
            line = input(">> ")
        except (EOFError, KeyboardInterrupt):
            print("\nExiting.")
            break
        if not line.strip():
            continue
        if line.strip().lower() in ("exit","quit"):
            print("Goodbye.")
            break
        planner = Planner(line)
        plan = planner.generate_plan()
        executor = Executor(dry_run=True)
        executor.execute_plan(plan)
        print("[PLAN DRY-RUN COMPLETE]\n")


if __name__ == "__main__":
    repl()
