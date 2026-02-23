#!/usr/bin/env python3
"""Zero-Point Transduction Monitor

Monitors sovereign_state.json for Φ (phi) and toggles VACUUM_MODULATION when
Φ >= PHI_CRITICAL. Writes telemetry to ~/.sovereign_vault/telemetry_vacuum.jsonl
and appends a PCRB ledger entry for forensic auditing.

This is a sovereign, dry-run friendly monitor — it only reads state and writes
audit/telemetry records. No external network calls.
"""
from __future__ import annotations
import json
import math
import time
from pathlib import Path
from typing import Any, Dict

PHI_CRITICAL = 7.69
ETA_SUPER = 1.9403  # 194.03% expressed as multiplicative factor

ROOT = Path.home()
STATE_FILE = ROOT / "sovereign_state.json"
VAULT = ROOT / ".sovereign_vault"
VAULT.mkdir(parents=True, exist_ok=True)
TELEM_OUT = VAULT / "telemetry_vacuum.jsonl"
PCRB_LEDGER = VAULT / "pcrb_ledger.jsonl"


def _read_state() -> Dict[str, Any]:
    if not STATE_FILE.exists():
        raise FileNotFoundError(f"state file not found: {STATE_FILE}")
    return json.loads(STATE_FILE.read_text(encoding="utf-8"))


def _extract_phi(state: Dict[str, Any]) -> float:
    # Prefer global scimitar.metrics.phi if present
    scimitar = state.get("scimitar", {})
    metrics = scimitar.get("metrics", {})
    phi = metrics.get("phi")
    if isinstance(phi, (int, float)):
        return float(phi)

    # Fallback: scan organisms for a Φ field (unicode U+03A6)
    eco = state.get("ecosystem", {})
    orgs = eco.get("organisms", {}) or {}
    for o in orgs.values():
        m = o.get("metrics", {})
        # some metrics use the Greek letter; try both
        for key in ("Φ", "\u03a6", "phi"):
            if key in m:
                try:
                    return float(m[key])
                except Exception:
                    continue
    # Default if not found
    return 0.0


def _mu_v(phi: float, epsilon: float = 1e-12) -> float:
    # Use vacuum permeability mu_0 as reference (SI) for a dimensionless proxy
    mu_0 = 4.0 * math.pi * 1e-7
    return mu_0 / (abs(phi - PHI_CRITICAL) + epsilon)


def _compute_pout(phi: float, fractal_factor: float = 1.0) -> float:
    # Exponential growth model around threshold (policy model, not physical claim)
    alpha = 1.0
    beta = 194.0  # baseline watt scaling used by the platform narrative
    exponent = max(0.0, phi - PHI_CRITICAL)
    return beta * math.exp(alpha * exponent) * fractal_factor


def _append_ledger(entry: Dict[str, Any]) -> None:
    entry = dict(entry)
    entry.setdefault("timestamp", time.time())
    with open(PCRB_LEDGER, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")


def run_check(write_telemetry: bool = True) -> Dict[str, Any]:
    state = _read_state()
    phi = _extract_phi(state)

    active = phi >= PHI_CRITICAL
    mu = _mu_v(phi) if active else None
    eta_eff = ETA_SUPER if active else 0.001903
    pout = _compute_pout(phi) if active else 0.0

    record = {
        "check_time": time.time(),
        "phi": phi,
        "vacuum_modulation_active": bool(active),
        "mu_v": mu,
        "eta_eff": eta_eff,
        "p_out": pout,
        "phi_critical": PHI_CRITICAL
    }

    if write_telemetry:
        with open(TELEM_OUT, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")

    # Append a PCRB ledger entry for forensic traceability
    ledger_entry = {
        "event": "VACUUM_MODULATION_CHECK",
        "phi": phi,
        "active": bool(active),
        "eta_eff": eta_eff,
        "p_out": pout
    }
    _append_ledger(ledger_entry)

    return record


if __name__ == "__main__":
    try:
        r = run_check()
        print("Zero-Point check:", json.dumps(r, indent=2))
    except Exception as e:
        print("Error running Zero-Point monitor:", e)
