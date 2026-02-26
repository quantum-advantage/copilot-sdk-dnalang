#!/usr/bin/env python3
"""
Sensitivity & Robustness Analyzer for the Penteract Constants Framework.

Answers the question every referee will ask:
  "How do you know these predictions aren't numerological coincidence?"

Method:
  1. Perturb each of the 7 framework constants independently by ±δ
  2. Recompute all testable predictions at each perturbation
  3. Measure σ-shift: how far predictions move from experimental values
  4. Compute Jacobian ∂(prediction)/∂(constant) — sensitivity matrix
  5. Calculate Fisher information → effective degrees of freedom
  6. Scan ALL pairwise constant ratios for matches to known physics
  7. Report fragility score: if small perturbations break agreement,
     the framework is tightly constrained (opposite of curve-fitting)

If 1% perturbations push predictions from <1σ to >3σ, that's PROOF
the constants are doing real work — not just floating near the answer.

Framework: DNA::}{::lang v51.843
Author:    Devin Phillip Davis / Agile Defense Systems (CAGE: 9HUP5)
"""

import math
import json
import sys
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Tuple, Optional
from pathlib import Path

# ═══════════════════════════════════════════════════════════════════
#  IMMUTABLE CONSTANTS (baseline)
# ═══════════════════════════════════════════════════════════════════

CONSTANTS = {
    "theta_lock":  51.843,       # Geometric resonance angle [degrees]
    "phi":         0.7734,       # Consciousness / ER=EPR threshold
    "gamma":       0.3,          # Decoherence boundary
    "chi_pc":      0.946,        # Phase conjugation quality
    "lambda_phi":  2.176435e-8,  # Universal memory constant [s⁻¹]
    "zeno_freq":   1.25e6,       # Quantum Zeno frequency [Hz]
    "drive_amp":   0.7734,       # Floquet drive amplitude
}

# Known experimental values for testable predictions
EXPERIMENTAL = {
    "PENT-001":  {"name": "Neutron dark BR",    "exp": 0.01082, "unc": 0.003},
    "PENT-001a": {"name": "Beam lifetime",      "exp": 888.0,   "unc": 2.0},
    "PENT-002":  {"name": "Ω_Λ",               "exp": 0.6847,  "unc": 0.0073},
    "PENT-003":  {"name": "Ω_m",               "exp": 0.3153,  "unc": 0.0073},
    "PENT-004":  {"name": "w (dark energy EOS)","exp": -1.03,   "unc": 0.03},
    "PENT-006":  {"name": "n_s (spectral tilt)","exp": 0.9649,  "unc": 0.0042},
    "PENT-007":  {"name": "r (tensor/scalar)",  "exp": 0.032,   "unc": None},
}

PLANCK_LENGTH = 1.616255e-35  # meters


# ═══════════════════════════════════════════════════════════════════
#  PREDICTION ENGINE (self-contained, parameterized)
# ═══════════════════════════════════════════════════════════════════

def compute_predictions(c: Dict[str, float]) -> Dict[str, float]:
    """Compute all testable predictions from a set of constants.

    Returns dict of prediction_id → predicted_value.
    This is the core function — everything else perturbs inputs to this.
    """
    theta_rad = math.radians(c["theta_lock"])
    preds = {}

    # PENT-001: Neutron dark decay branching ratio
    br = c["gamma"] * (1 - c["chi_pc"]) * math.sin(theta_rad)
    preds["PENT-001"] = br

    # PENT-001a: Beam lifetime
    tau_bottle = 878.4
    preds["PENT-001a"] = tau_bottle / (1 - br)

    # PENT-002: Dark energy density Ω_Λ
    omega_l = c["chi_pc"] * c["phi"] / (c["phi"] + c["gamma"])
    preds["PENT-002"] = omega_l

    # PENT-003: Matter density Ω_m
    preds["PENT-003"] = 1.0 - omega_l

    # PENT-004: Dark energy EOS w
    preds["PENT-004"] = -(c["chi_pc"] + c["gamma"] * (1 - c["phi"]))

    # PENT-006: Scalar spectral index n_s
    preds["PENT-006"] = 1.0 - 2.0 / c["theta_lock"]

    # PENT-007: Tensor-to-scalar ratio r
    preds["PENT-007"] = 8.0 / (c["theta_lock"] ** 2)

    # PENT-008: Strong CP angle (not testable numerically vs experiment)
    preds["PENT-008"] = c["gamma"] * math.exp(-c["theta_lock"])

    # PENT-009: Hawking correction
    preds["PENT-009"] = (c["phi"] * c["gamma"] * math.sin(theta_rad)
                         / (8.0 * math.pi))

    return preds


def sigma(pred_id: str, value: float) -> Optional[float]:
    """Compute sigma deviation from experiment. None if no data."""
    if pred_id not in EXPERIMENTAL:
        return None
    e = EXPERIMENTAL[pred_id]
    if e["unc"] is None:
        return None
    return abs(value - e["exp"]) / e["unc"]


# ═══════════════════════════════════════════════════════════════════
#  SENSITIVITY ANALYSIS
# ═══════════════════════════════════════════════════════════════════

@dataclass
class PerturbationResult:
    constant: str
    delta_pct: float
    direction: str  # "+" or "-"
    predictions: Dict[str, float] = field(default_factory=dict)
    sigmas: Dict[str, Optional[float]] = field(default_factory=dict)


@dataclass
class SensitivityReport:
    baseline_sigmas: Dict[str, Optional[float]]
    baseline_predictions: Dict[str, float]
    perturbations: List[PerturbationResult]
    jacobian: Dict[str, Dict[str, float]]  # pred_id → {constant → ∂pred/∂const}
    fragility_scores: Dict[str, float]  # constant → how much damage 1% does
    critical_perturbation: Dict[str, float]  # constant → % needed to push ANY pred >2σ
    constant_archaeology: List[Dict]  # discovered ratio matches
    fisher_information: Dict[str, Dict[str, float]]
    effective_dof: float


def run_sensitivity(deltas=(0.1, 0.5, 1.0, 2.0, 5.0, 10.0)) -> SensitivityReport:
    """Full sensitivity analysis across all constants and perturbation levels."""

    # Baseline
    baseline = compute_predictions(CONSTANTS)
    baseline_sig = {pid: sigma(pid, v) for pid, v in baseline.items()}

    results = []
    testable = [p for p in EXPERIMENTAL if EXPERIMENTAL[p]["unc"] is not None]

    # Jacobian: numerical partial derivatives
    jacobian = {pid: {} for pid in testable}
    h = 1e-6  # finite difference step (fractional)

    for cname, cval in CONSTANTS.items():
        # Numerical derivative via central difference
        c_plus = dict(CONSTANTS)
        c_minus = dict(CONSTANTS)
        c_plus[cname] = cval * (1 + h)
        c_minus[cname] = cval * (1 - h)
        p_plus = compute_predictions(c_plus)
        p_minus = compute_predictions(c_minus)
        for pid in testable:
            dp = (p_plus[pid] - p_minus[pid]) / (2 * h * cval)
            jacobian[pid][cname] = dp

        # Full perturbation sweep
        for delta in deltas:
            for sign, direction in [(1, "+"), (-1, "-")]:
                c_pert = dict(CONSTANTS)
                c_pert[cname] = cval * (1 + sign * delta / 100.0)
                preds = compute_predictions(c_pert)
                sigs = {pid: sigma(pid, v) for pid, v in preds.items()}
                results.append(PerturbationResult(
                    constant=cname,
                    delta_pct=delta,
                    direction=direction,
                    predictions=preds,
                    sigmas=sigs,
                ))

    # Fragility score: average σ increase per 1% perturbation
    fragility = {}
    for cname in CONSTANTS:
        total_damage = 0.0
        count = 0
        for r in results:
            if r.constant == cname and r.delta_pct == 1.0:
                for pid in testable:
                    bs = baseline_sig[pid]
                    ps = r.sigmas[pid]
                    if bs is not None and ps is not None:
                        total_damage += abs(ps - bs)
                        count += 1
        fragility[cname] = total_damage / max(count, 1)

    # Critical perturbation: smallest δ% that pushes any prediction >2σ
    critical = {}
    for cname in CONSTANTS:
        min_delta = float('inf')
        for r in results:
            if r.constant == cname:
                for pid in testable:
                    bs = baseline_sig[pid]
                    ps = r.sigmas[pid]
                    if bs is not None and ps is not None:
                        if bs < 2.0 and ps >= 2.0:
                            min_delta = min(min_delta, r.delta_pct)
        critical[cname] = min_delta if min_delta < float('inf') else -1

    # Fisher information matrix (diagonal approximation)
    fisher = {pid: {} for pid in testable}
    for pid in testable:
        unc = EXPERIMENTAL[pid]["unc"]
        for cname in CONSTANTS:
            J = jacobian[pid][cname]
            fisher[pid][cname] = (J / unc) ** 2

    # Effective degrees of freedom
    # N_predictions - N_effective_parameters
    # A constant contributes effectively if its Fisher info > threshold
    total_fisher_per_const = {}
    for cname in CONSTANTS:
        total_fisher_per_const[cname] = sum(
            fisher[pid][cname] for pid in testable
        )
    # Constants with total Fisher info > 1% of max are "effective"
    max_fi = max(total_fisher_per_const.values()) if total_fisher_per_const else 1
    n_effective = sum(1 for fi in total_fisher_per_const.values()
                      if fi > 0.01 * max_fi)
    eff_dof = len(testable) - n_effective

    # Constant archaeology
    archaeology = scan_constant_ratios()

    return SensitivityReport(
        baseline_sigmas=baseline_sig,
        baseline_predictions=baseline,
        perturbations=results,
        jacobian=jacobian,
        fragility_scores=fragility,
        critical_perturbation=critical,
        constant_archaeology=archaeology,
        fisher_information=fisher,
        effective_dof=eff_dof,
    )


# ═══════════════════════════════════════════════════════════════════
#  CONSTANT ARCHAEOLOGY — hunt for hidden geometric relationships
# ═══════════════════════════════════════════════════════════════════

# Known physical/mathematical constants to check against
KNOWN_VALUES = {
    "1/α (fine structure)":     137.036,
    "α (fine structure)":       7.2973525693e-3,
    "π":                        math.pi,
    "e (Euler)":                math.e,
    "φ (golden ratio)":         (1 + math.sqrt(5)) / 2,
    "√2":                       math.sqrt(2),
    "√3":                       math.sqrt(3),
    "ln(2)":                    math.log(2),
    "2π":                       2 * math.pi,
    "sin(30°)":                 0.5,
    "cos(60°)":                 0.5,
    "arctan(1) [π/4]":          math.pi / 4,
    "θ_tet/2 [27.368°]":        27.368,
    "θ_tet [54.7356°]":         54.7356,
    "θ_lock/θ_tet":             51.843 / 54.7356,
    "Ω_Λ (Planck)":             0.6847,
    "Ω_m (Planck)":             0.3153,
    "n_s (Planck)":             0.9649,
    "1/3":                      1/3,
    "2/3":                      2/3,
    "Planck mass [kg]":         2.176434e-8,
    "Euler-Mascheroni":         0.5772156649,
}


def scan_constant_ratios(threshold_pct=0.5) -> List[Dict]:
    """Scan all pairwise operations on framework constants for matches
    to known physical/mathematical values.

    Operations: a/b, a*b, a+b, a-b, sin(a), cos(a), a^b (small exponents)
    """
    names = list(CONSTANTS.keys())
    vals = [CONSTANTS[n] for n in names]
    discoveries = []

    # Pairwise ratios and products
    for i in range(len(names)):
        for j in range(len(names)):
            if i == j:
                continue
            for op, label, result in [
                ("ratio", f"{names[i]}/{names[j]}", vals[i]/vals[j] if vals[j] != 0 else None),
                ("product", f"{names[i]}×{names[j]}", vals[i]*vals[j]),
                ("sum", f"{names[i]}+{names[j]}", vals[i]+vals[j]),
                ("diff", f"|{names[i]}-{names[j]}|", abs(vals[i]-vals[j])),
            ]:
                if result is None or result == 0:
                    continue
                for kname, kval in KNOWN_VALUES.items():
                    if kval == 0:
                        continue
                    pct = abs(result - kval) / abs(kval) * 100
                    if pct < threshold_pct:
                        discoveries.append({
                            "operation": label,
                            "op_type": op,
                            "result": result,
                            "matches": kname,
                            "known_value": kval,
                            "deviation_pct": round(pct, 4),
                        })

    # Trigonometric transforms of individual constants
    for i, (name, val) in enumerate(zip(names, vals)):
        for fn_name, fn in [("sin", math.sin), ("cos", math.cos)]:
            try:
                if name == "theta_lock":
                    r = fn(math.radians(val))
                else:
                    r = fn(val)
            except (ValueError, OverflowError):
                continue
            for kname, kval in KNOWN_VALUES.items():
                if kval == 0:
                    continue
                pct = abs(r - kval) / abs(kval) * 100
                if pct < threshold_pct:
                    arg = f"{val}°" if name == "theta_lock" else str(val)
                    discoveries.append({
                        "operation": f"{fn_name}({name}={arg})",
                        "op_type": "trig",
                        "result": r,
                        "matches": kname,
                        "known_value": kval,
                        "deviation_pct": round(pct, 4),
                    })

    # Sort by deviation
    discoveries.sort(key=lambda d: d["deviation_pct"])

    # Deduplicate (a/b and b/a might both match inverse pairs)
    seen = set()
    unique = []
    for d in discoveries:
        key = (d["matches"], round(d["result"], 8))
        if key not in seen:
            seen.add(key)
            unique.append(d)

    return unique


# ═══════════════════════════════════════════════════════════════════
#  DISPLAY
# ═══════════════════════════════════════════════════════════════════

def format_report(report: SensitivityReport) -> str:
    """Human-readable sensitivity report."""
    lines = []
    W = 78

    lines.append("═" * W)
    lines.append("  PENTERACT SENSITIVITY & ROBUSTNESS ANALYSIS")
    lines.append("  Framework: DNA::}{::lang v51.843")
    lines.append("  Method: Independent ±δ perturbation of 7 constants")
    lines.append("═" * W)

    # 1. Baseline
    lines.append("\n┌─ BASELINE PREDICTIONS (unperturbed) ─────────────────────────────┐")
    for pid in sorted(report.baseline_predictions):
        if pid in EXPERIMENTAL:
            e = EXPERIMENTAL[pid]
            s = report.baseline_sigmas[pid]
            sstr = f"{s:.2f}σ" if s is not None else "bound"
            lines.append(f"  {pid:10s}  {e['name']:22s}  "
                         f"pred={report.baseline_predictions[pid]:.6f}  "
                         f"exp={e['exp']}  → {sstr}")
    avg = [s for s in report.baseline_sigmas.values()
           if s is not None and s < 100]
    lines.append(f"  {'':10s}  {'AVERAGE':22s}  {sum(avg)/len(avg):.2f}σ")
    lines.append("└──────────────────────────────────────────────────────────────────┘")

    # 2. Fragility scores
    lines.append("\n┌─ FRAGILITY SCORES (avg σ-shift per 1% perturbation) ────────────┐")
    lines.append(f"  {'Constant':15s}  {'Fragility':>10s}  {'Critical δ%':>12s}  Interpretation")
    lines.append(f"  {'─'*15}  {'─'*10}  {'─'*12}  {'─'*20}")
    for cname in sorted(report.fragility_scores,
                        key=lambda x: -report.fragility_scores[x]):
        frag = report.fragility_scores[cname]
        crit = report.critical_perturbation[cname]
        crit_str = f"{crit:.1f}%" if crit > 0 else ">10%"
        if frag > 0.5:
            interp = "🔴 HIGHLY SENSITIVE"
        elif frag > 0.1:
            interp = "🟡 MODERATELY SENSITIVE"
        else:
            interp = "🟢 ROBUST"
        lines.append(f"  {cname:15s}  {frag:10.4f}  {crit_str:>12s}  {interp}")
    lines.append("└──────────────────────────────────────────────────────────────────┘")

    # 3. Sensitivity matrix (Jacobian)
    lines.append("\n┌─ SENSITIVITY MATRIX (∂prediction/∂constant) ────────────────────┐")
    testable = sorted(report.jacobian.keys())
    cnames = sorted(CONSTANTS.keys())
    # Header
    hdr = f"  {'':10s}"
    for cn in cnames:
        hdr += f"  {cn[:7]:>7s}"
    lines.append(hdr)
    lines.append("  " + "─" * (10 + 9 * len(cnames)))
    for pid in testable:
        row = f"  {pid:10s}"
        for cn in cnames:
            j = report.jacobian[pid].get(cn, 0)
            if abs(j) < 1e-15:
                row += f"  {'·':>7s}"
            elif abs(j) > 1000:
                row += f"  {j:>7.0f}"
            elif abs(j) > 1:
                row += f"  {j:>7.2f}"
            elif abs(j) > 0.01:
                row += f"  {j:>7.4f}"
            else:
                row += f"  {j:>7.1e}"
            # Remove trailing zeros from scientific notation
        lines.append(row)
    lines.append("  (· = zero sensitivity)")
    lines.append("└──────────────────────────────────────────────────────────────────┘")

    # 4. Perturbation detail table (1% and 5% only to keep it readable)
    lines.append("\n┌─ σ-SHIFT TABLE (baseline → perturbed) ───────────────────────────┐")
    for delta in [1.0, 5.0]:
        lines.append(f"\n  ── δ = ±{delta}% ──")
        for cname in cnames:
            shifts = []
            for r in report.perturbations:
                if r.constant == cname and r.delta_pct == delta:
                    for pid in testable:
                        bs = report.baseline_sigmas.get(pid)
                        ps = r.sigmas.get(pid)
                        if bs is not None and ps is not None:
                            shifts.append((pid, r.direction, bs, ps))
            if shifts:
                worst = max(shifts, key=lambda x: abs(x[3] - x[2]))
                wp, wd, wbs, wps = worst
                marker = " ⚠" if wps > 2.0 else ""
                lines.append(
                    f"  {cname:15s}  worst: {wp} "
                    f"({wbs:.2f}σ → {wps:.2f}σ, {wd}{delta}%){marker}"
                )
    lines.append("└──────────────────────────────────────────────────────────────────┘")

    # 5. Fisher information
    lines.append(f"\n┌─ EFFECTIVE DEGREES OF FREEDOM ───────────────────────────────────┐")
    lines.append(f"  Testable predictions:      {len(testable)}")

    fi_total = {}
    for cn in cnames:
        fi_total[cn] = sum(
            report.fisher_information[pid].get(cn, 0) for pid in testable
        )
    max_fi = max(fi_total.values()) if fi_total else 1
    n_eff = sum(1 for fi in fi_total.values() if fi > 0.01 * max_fi)
    lines.append(f"  Effective parameters:      {n_eff}")
    lines.append(f"  Degrees of freedom:        {len(testable) - n_eff}")
    lines.append(f"  Constraint ratio:          "
                 f"{len(testable)}/{n_eff} = {len(testable)/max(n_eff,1):.1f}x")
    lines.append("")
    lines.append("  Fisher information ranking:")
    for cn in sorted(fi_total, key=lambda x: -fi_total[x]):
        fi = fi_total[cn]
        bar = "█" * min(40, int(40 * fi / max_fi)) if max_fi > 0 else ""
        eff = "✓ effective" if fi > 0.01 * max_fi else "  marginal"
        lines.append(f"    {cn:15s}  {fi:>12.2f}  {bar}  {eff}")
    lines.append("└──────────────────────────────────────────────────────────────────┘")

    # 6. Constant archaeology
    lines.append(f"\n┌─ CONSTANT ARCHAEOLOGY — hidden geometric relationships ─────────┐")
    if report.constant_archaeology:
        for d in report.constant_archaeology[:15]:
            lines.append(
                f"  {d['operation']:30s}  = {d['result']:.6f}  "
                f"≈ {d['matches']} ({d['known_value']:.6f})  "
                f"Δ={d['deviation_pct']:.4f}%"
            )
    else:
        lines.append("  No matches found within threshold")
    lines.append("└──────────────────────────────────────────────────────────────────┘")

    # 7. Verdict
    lines.append("\n" + "═" * W)
    avg_frag = sum(report.fragility_scores.values()) / len(report.fragility_scores)
    n_critical = sum(1 for v in report.critical_perturbation.values() if 0 < v <= 5)

    if avg_frag > 0.3 and n_critical >= 3:
        verdict = "TIGHTLY CONSTRAINED — predictions are fragile to perturbation"
        detail = ("Small constant changes destroy experimental agreement. "
                  "This is the OPPOSITE of curve-fitting: the framework has "
                  "less freedom, not more.")
    elif avg_frag > 0.1:
        verdict = "MODERATELY CONSTRAINED — partial sensitivity"
        detail = "Some predictions are sensitive, others have slack."
    else:
        verdict = "WEAKLY CONSTRAINED — predictions survive large perturbations"
        detail = "Framework has room to move. Predictions may be coincidental."

    lines.append(f"  VERDICT: {verdict}")
    lines.append(f"  {detail}")
    lines.append(f"  Avg fragility:    {avg_frag:.4f} σ/% (higher = more constrained)")
    lines.append(f"  Critical params:  {n_critical}/7 break within ±5%")
    lines.append(f"  Eff. DoF:         {report.effective_dof}")
    lines.append("═" * W)

    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════
#  SERIALIZATION
# ═══════════════════════════════════════════════════════════════════

def report_to_dict(report: SensitivityReport) -> Dict:
    """JSON-serializable summary (no full perturbation sweep)."""
    return {
        "framework": "DNA::}{::lang v51.843",
        "analysis": "sensitivity_robustness",
        "constants": CONSTANTS,
        "baseline_predictions": report.baseline_predictions,
        "baseline_sigmas": {k: v for k, v in report.baseline_sigmas.items()
                           if v is not None},
        "fragility_scores": report.fragility_scores,
        "critical_perturbation_pct": report.critical_perturbation,
        "effective_dof": report.effective_dof,
        "jacobian": report.jacobian,
        "constant_archaeology": report.constant_archaeology,
        "n_perturbations_tested": len(report.perturbations),
    }


# ═══════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════

def main():
    import argparse
    parser = argparse.ArgumentParser(
        description="Sensitivity analysis for Penteract constants framework")
    parser.add_argument("--json", action="store_true",
                        help="Output JSON instead of text")
    parser.add_argument("--out", type=str, default=None,
                        help="Write JSON results to file")
    parser.add_argument("--archaeology-only", action="store_true",
                        help="Only run constant ratio scan")
    args = parser.parse_args()

    if args.archaeology_only:
        results = scan_constant_ratios(threshold_pct=1.0)
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print("═" * 70)
            print("  CONSTANT ARCHAEOLOGY — Pairwise ratio scan")
            print("═" * 70)
            for d in results:
                print(f"  {d['operation']:30s}  = {d['result']:.6f}  "
                      f"≈ {d['matches']} ({d['known_value']:.6f})  "
                      f"Δ={d['deviation_pct']:.4f}%")
        return

    report = run_sensitivity()

    if args.json:
        d = report_to_dict(report)
        output = json.dumps(d, indent=2)
        print(output)
    else:
        print(format_report(report))

    if args.out:
        d = report_to_dict(report)
        Path(args.out).write_text(json.dumps(d, indent=2))
        print(f"\n  → Saved to {args.out}")


if __name__ == "__main__":
    main()
