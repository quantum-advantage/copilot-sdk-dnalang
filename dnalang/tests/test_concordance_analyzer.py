#!/usr/bin/env python3
"""Tests for concordance_analyzer — honest statistical assessment."""

import math
import json
import pytest

from dnalang.experiments.concordance_analyzer import (
    ALL_PREDICTIONS,
    Prediction,
    get_independent,
    chi2_cdf,
    probit,
    analyze,
    format_report,
    to_dict,
    ConcordanceReport,
)


# ═══════════════════════════════════════════════════════════════════
#  Prediction data integrity
# ═══════════════════════════════════════════════════════════════════

class TestPredictions:
    def test_all_predictions_count(self):
        assert len(ALL_PREDICTIONS) == 6

    def test_sigma_values_positive(self):
        for p in ALL_PREDICTIONS:
            assert p.sigma > 0, f"{p.id} has non-positive sigma"
            assert p.sigma < 2.0, f"{p.id} sigma > 2 would fail concordance"

    def test_uncertainty_positive(self):
        for p in ALL_PREDICTIONS:
            assert p.uncertainty > 0, f"{p.id} has non-positive uncertainty"

    def test_sigma_matches_formula(self):
        for p in ALL_PREDICTIONS:
            expected = abs(p.predicted - p.experimental) / p.uncertainty
            assert abs(p.sigma - expected) < 0.02, (
                f"{p.id}: sigma={p.sigma} but |{p.predicted}-{p.experimental}|/{p.uncertainty}={expected:.2f}"
            )

    def test_group_assignments(self):
        groups = {p.group for p in ALL_PREDICTIONS}
        assert "neutron" in groups
        assert "omega" in groups
        assert "eos" in groups
        assert "inflation" in groups

    def test_neutron_pair_same_group(self):
        groups = [p.group for p in ALL_PREDICTIONS if "PENT-001" in p.id]
        assert groups == ["neutron", "neutron"]

    def test_omega_pair_same_group(self):
        groups = [p.group for p in ALL_PREDICTIONS
                  if p.id in ("PENT-002", "PENT-003")]
        assert groups == ["omega", "omega"]


# ═══════════════════════════════════════════════════════════════════
#  Independence analysis
# ═══════════════════════════════════════════════════════════════════

class TestIndependence:
    def test_independent_count(self):
        indep = get_independent()
        assert len(indep) == 4

    def test_independent_has_unique_groups(self):
        indep = get_independent()
        groups = [p.group for p in indep]
        assert len(groups) == len(set(groups))

    def test_independent_picks_first_from_group(self):
        indep = get_independent()
        ids = {p.id for p in indep}
        assert "PENT-001" in ids  # first neutron
        assert "PENT-001a" not in ids  # dependent
        assert "PENT-002" in ids  # first omega
        assert "PENT-003" not in ids  # dependent

    def test_independent_includes_eos_and_inflation(self):
        ids = {p.id for p in get_independent()}
        assert "PENT-004" in ids
        assert "PENT-006" in ids


# ═══════════════════════════════════════════════════════════════════
#  Statistical functions
# ═══════════════════════════════════════════════════════════════════

class TestStatistics:
    def test_chi2_cdf_zero(self):
        assert chi2_cdf(0, 4) == 0.0

    def test_chi2_cdf_negative(self):
        assert chi2_cdf(-1, 4) == 0.0

    def test_chi2_cdf_median(self):
        # Median of χ²(4) ≈ 3.357
        val = chi2_cdf(3.357, 4)
        assert 0.45 < val < 0.55

    def test_chi2_cdf_extreme(self):
        # P(χ²(4) ≤ 20) should be > 0.999
        val = chi2_cdf(20, 4)
        assert val > 0.999

    def test_probit_center(self):
        # probit(0.5) = 0
        assert abs(probit(0.5)) < 0.01

    def test_probit_high(self):
        # probit(0.975) ≈ 1.96
        assert abs(probit(0.975) - 1.96) < 0.05

    def test_probit_low(self):
        assert probit(0.025) < -1.9

    def test_probit_edges(self):
        assert probit(0.0) == float('-inf')
        assert probit(1.0) == float('inf')


# ═══════════════════════════════════════════════════════════════════
#  Full analysis
# ═══════════════════════════════════════════════════════════════════

class TestAnalysis:
    @pytest.fixture
    def report(self):
        return analyze()

    def test_report_type(self, report):
        assert isinstance(report, ConcordanceReport)

    def test_n_all(self, report):
        assert report.n_all == 6

    def test_n_independent(self, report):
        assert report.n_independent == 4

    def test_effective_params(self, report):
        assert report.effective_params == 4

    def test_effective_dof_zero(self, report):
        assert report.effective_dof == 0

    def test_chi2_positive(self, report):
        assert report.chi2_value > 0

    def test_chi2_value(self, report):
        # 0.64² + 0.42² + 0.53² + 0.83² = 0.4096+0.1764+0.2809+0.6889 = 1.5558
        assert abs(report.chi2_value - 1.5558) < 0.01

    def test_chi2_pvalue_range(self, report):
        assert 0.1 < report.chi2_pvalue < 0.3

    def test_n18_correct(self, report):
        assert report.n18_prediction_correct is True

    def test_avg_sigma_all(self, report):
        expected = sum(p.sigma for p in ALL_PREDICTIONS) / 6
        assert abs(report.avg_sigma_all - expected) < 0.001

    def test_avg_sigma_independent(self, report):
        indep = get_independent()
        expected = sum(p.sigma for p in indep) / 4
        assert abs(report.avg_sigma_independent - expected) < 0.001


# ═══════════════════════════════════════════════════════════════════
#  Output formatting
# ═══════════════════════════════════════════════════════════════════

class TestOutput:
    def test_format_report_contains_verdict(self):
        r = analyze()
        text = format_report(r)
        assert "5.2σ" in text
        assert "WRONG" in text.upper() or "incorrect" in text.lower()

    def test_format_report_contains_n18(self):
        text = format_report(analyze())
        assert "n=18" in text or "n≈18" in text

    def test_format_report_contains_genuine(self):
        text = format_report(analyze())
        assert "GENUINELY SIGNIFICANT" in text.upper() or "genuinely significant" in text.lower()

    def test_to_dict_structure(self):
        d = to_dict(analyze())
        assert isinstance(d, dict)
        assert d["naive_5sigma_claim_valid"] is False
        assert d["n18_crossing_correct"] is True
        assert d["effective_dof"] == 0
        assert d["n_predictions_independent"] == 4
        assert d["framework"] == "DNA::}{::lang v51.843"

    def test_to_dict_serializable(self):
        d = to_dict(analyze())
        text = json.dumps(d)
        assert isinstance(json.loads(text), dict)

    def test_dict_chi2_matches(self):
        r = analyze()
        d = to_dict(r)
        assert d["chi2"] == round(r.chi2_value, 4)

    def test_dict_strongest_argument(self):
        d = to_dict(analyze())
        assert "n=18" in d["strongest_argument"]


# ═══════════════════════════════════════════════════════════════════
#  Key claims (regression tests)
# ═══════════════════════════════════════════════════════════════════

class TestKeyClaims:
    """Regression tests ensuring the honest assessment doesn't drift."""

    def test_naive_claim_debunked(self):
        r = analyze()
        # If naive_joint_p were tiny, someone might re-claim 5σ
        assert r.naive_joint_p > 0.05, "Naive joint p too small — someone might overclaim"

    def test_honest_joint_p_not_extreme(self):
        r = analyze()
        assert r.honest_joint_p > 0.15, "Honest joint p looks extreme — recheck independence"

    def test_verdict_mentions_consistency_check(self):
        r = analyze()
        assert "consistency check" in r.honest_verdict.lower()

    def test_verdict_mentions_look_elsewhere(self):
        r = analyze()
        # Verdict should warn about overclaiming
        assert "5.2σ" in r.honest_verdict or "overcounts" in r.honest_verdict
