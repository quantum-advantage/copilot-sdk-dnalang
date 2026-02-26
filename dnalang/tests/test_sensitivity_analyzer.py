#!/usr/bin/env python3
"""Tests for the sensitivity analyzer."""

import math
import pytest
from dnalang.experiments.sensitivity_analyzer import (
    CONSTANTS,
    EXPERIMENTAL,
    compute_predictions,
    sigma,
    run_sensitivity,
    scan_constant_ratios,
    report_to_dict,
    format_report,
)


class TestComputePredictions:
    """Core prediction engine with parameterized constants."""

    def test_baseline_returns_all_predictions(self):
        preds = compute_predictions(CONSTANTS)
        expected = {"PENT-001", "PENT-001a", "PENT-002", "PENT-003",
                    "PENT-004", "PENT-006", "PENT-007", "PENT-008", "PENT-009"}
        assert expected.issubset(set(preds.keys()))

    def test_omega_lambda_within_1sigma(self):
        preds = compute_predictions(CONSTANTS)
        s = sigma("PENT-002", preds["PENT-002"])
        assert s < 1.0, f"Ω_Λ prediction at {s:.2f}σ (expected <1σ)"

    def test_neutron_lifetime_within_1sigma(self):
        preds = compute_predictions(CONSTANTS)
        s = sigma("PENT-001a", preds["PENT-001a"])
        assert s < 1.0, f"Beam lifetime at {s:.2f}σ"

    def test_all_testable_within_1sigma(self):
        preds = compute_predictions(CONSTANTS)
        for pid, e in EXPERIMENTAL.items():
            if e["unc"] is not None:
                s = sigma(pid, preds[pid])
                assert s < 1.0, f"{pid} at {s:.2f}σ (expected <1σ)"

    def test_perturbed_constants_change_predictions(self):
        c = dict(CONSTANTS)
        p1 = compute_predictions(c)
        c["chi_pc"] = 0.9  # 5% change
        p2 = compute_predictions(c)
        assert p2["PENT-002"] != p1["PENT-002"]

    def test_spectral_index_independent_of_chi(self):
        c1 = dict(CONSTANTS)
        c2 = dict(CONSTANTS)
        c2["chi_pc"] = 0.5
        assert compute_predictions(c1)["PENT-006"] == compute_predictions(c2)["PENT-006"]


class TestSigma:

    def test_perfect_match(self):
        assert sigma("PENT-002", 0.6847) == 0.0

    def test_1sigma_deviation(self):
        s = sigma("PENT-002", 0.6847 + 0.0073)
        assert abs(s - 1.0) < 1e-10

    def test_unknown_prediction(self):
        assert sigma("UNKNOWN", 42.0) is None


class TestGeometricHypothesis:
    """Test that χ_PC = θ_lock/θ_tet improves predictions."""

    def test_geometric_chi_improves_average_sigma(self):
        theta_tet = 54.7356
        chi_geo = CONSTANTS["theta_lock"] / theta_tet
        c_geo = dict(CONSTANTS)
        c_geo["chi_pc"] = chi_geo

        p_old = compute_predictions(CONSTANTS)
        p_new = compute_predictions(c_geo)

        testable = [p for p in EXPERIMENTAL if EXPERIMENTAL[p]["unc"] is not None]
        sig_old = sum(sigma(pid, p_old[pid]) for pid in testable)
        sig_new = sum(sigma(pid, p_new[pid]) for pid in testable)
        assert sig_new <= sig_old, "Geometric χ should improve or match baseline"

    def test_geometric_chi_close_to_nominal(self):
        chi_geo = CONSTANTS["theta_lock"] / 54.7356
        assert abs(chi_geo - CONSTANTS["chi_pc"]) / CONSTANTS["chi_pc"] < 0.002

    def test_sin_theta_lock_near_pi_over_4(self):
        s = math.sin(math.radians(CONSTANTS["theta_lock"]))
        assert abs(s - math.pi / 4) / (math.pi / 4) < 0.002


class TestSensitivityAnalysis:

    @pytest.fixture(scope="module")
    def report(self):
        return run_sensitivity(deltas=(1.0, 5.0))

    def test_report_has_baseline(self, report):
        assert report.baseline_predictions
        assert report.baseline_sigmas

    def test_fragility_scores_exist(self, report):
        assert len(report.fragility_scores) == len(CONSTANTS)

    def test_chi_pc_is_most_fragile(self, report):
        most_fragile = max(report.fragility_scores,
                           key=lambda x: report.fragility_scores[x])
        assert most_fragile == "chi_pc"

    def test_lambda_phi_is_robust(self, report):
        assert report.fragility_scores["lambda_phi"] < 0.001

    def test_effective_dof_positive(self, report):
        assert report.effective_dof >= 0

    def test_jacobian_structure(self, report):
        for pid, jac in report.jacobian.items():
            assert set(jac.keys()) == set(CONSTANTS.keys())

    def test_perturbations_count(self, report):
        # 7 constants × 2 deltas × 2 directions = 28
        assert len(report.perturbations) == 7 * 2 * 2


class TestConstantArchaeology:

    def test_finds_chi_theta_ratio(self):
        results = scan_constant_ratios(threshold_pct=0.5)
        matches_theta_tet = [r for r in results if "θ_tet" in r["matches"]
                             or "θ_lock/θ_tet" in r["matches"]]
        assert len(matches_theta_tet) > 0, "Should find θ_lock/θ_tet relationship"

    def test_finds_pi_quarter(self):
        results = scan_constant_ratios(threshold_pct=0.5)
        pi4_matches = [r for r in results if "π/4" in r["matches"]]
        assert len(pi4_matches) > 0, "Should find sin(θ_lock) ≈ π/4"

    def test_sorted_by_deviation(self):
        results = scan_constant_ratios()
        devs = [r["deviation_pct"] for r in results]
        assert devs == sorted(devs)


class TestSerialization:

    def test_report_to_dict(self):
        report = run_sensitivity(deltas=(1.0,))
        d = report_to_dict(report)
        assert "constants" in d
        assert "fragility_scores" in d
        assert "constant_archaeology" in d

    def test_format_report_runs(self):
        report = run_sensitivity(deltas=(1.0,))
        text = format_report(report)
        assert "SENSITIVITY" in text
        assert "FRAGILITY" in text
