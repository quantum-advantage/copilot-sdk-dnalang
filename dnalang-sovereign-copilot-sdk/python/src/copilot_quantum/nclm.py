"""
NCLM (Non-Classical Logic Model) — Quantum Reasoning Engine
============================================================

Implements non-classical logic for quantum-enhanced reasoning:

  1. **Superposition**: Hold multiple hypotheses with amplitude weights
  2. **Entanglement**: Bind concepts non-locally (measuring one collapses the other)
  3. **Inference**: Collapse superposition via measurement to reach conclusions
  4. **Paraconsistent Logic**: Truth values beyond True/False (Both, Neither)

Framework: DNA::}{::lang v51.843
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple
import hashlib
import math
import numpy as np

# Immutable constants
LAMBDA_PHI = 2.176435e-8
PHI_THRESHOLD = 0.7734
GAMMA_CRITICAL = 0.3
THETA_LOCK = 51.843


class TruthValue(Enum):
    """Paraconsistent four-valued truth (Belnap logic)."""
    TRUE = "true"
    FALSE = "false"
    BOTH = "both"          # true AND false simultaneously (superposition)
    NEITHER = "neither"    # no evidence either way (quantum vacuum)

    def negate(self) -> "TruthValue":
        _map = {
            TruthValue.TRUE: TruthValue.FALSE,
            TruthValue.FALSE: TruthValue.TRUE,
            TruthValue.BOTH: TruthValue.BOTH,
            TruthValue.NEITHER: TruthValue.NEITHER,
        }
        return _map[self]

    def conjunction(self, other: "TruthValue") -> "TruthValue":
        """Kleene strong conjunction (meet in the truth lattice)."""
        order = {TruthValue.FALSE: 0, TruthValue.NEITHER: 1,
                 TruthValue.BOTH: 2, TruthValue.TRUE: 3}
        inv = {v: k for k, v in order.items()}
        return inv[min(order[self], order[other])]

    def disjunction(self, other: "TruthValue") -> "TruthValue":
        """Kleene strong disjunction (join in the truth lattice)."""
        order = {TruthValue.FALSE: 0, TruthValue.NEITHER: 1,
                 TruthValue.BOTH: 2, TruthValue.TRUE: 3}
        inv = {v: k for k, v in order.items()}
        return inv[max(order[self], order[other])]

    @property
    def is_definite(self) -> bool:
        return self in (TruthValue.TRUE, TruthValue.FALSE)


@dataclass
class Hypothesis:
    """A single hypothesis in superposition.

    Attributes:
        label: Human-readable name.
        amplitude: Complex amplitude (magnitude² = probability).
        evidence: Supporting data.
        truth: Paraconsistent truth value.
    """
    label: str
    amplitude: complex = 1.0 + 0j
    evidence: Dict[str, Any] = field(default_factory=dict)
    truth: TruthValue = TruthValue.NEITHER

    @property
    def probability(self) -> float:
        """Born-rule probability: |ψ|²."""
        return abs(self.amplitude) ** 2

    def to_dict(self) -> dict:
        return {
            "label": self.label,
            "amplitude_re": self.amplitude.real,
            "amplitude_im": self.amplitude.imag,
            "probability": round(self.probability, 6),
            "truth": self.truth.value,
            "evidence": self.evidence,
        }


@dataclass
class EntanglementPair:
    """Non-local binding between two hypotheses.

    Measuring one collapses the other to a correlated state.

    Attributes:
        h1_label: First hypothesis label.
        h2_label: Second hypothesis label.
        correlation: Correlation coefficient [-1, 1].
            +1 = perfect correlation (both collapse same way)
            -1 = perfect anti-correlation (opposite collapse)
        fidelity: Entanglement fidelity [0, 1].
    """
    h1_label: str
    h2_label: str
    correlation: float = 1.0
    fidelity: float = 1.0

    def to_dict(self) -> dict:
        return {
            "h1": self.h1_label,
            "h2": self.h2_label,
            "correlation": self.correlation,
            "fidelity": self.fidelity,
        }


@dataclass
class InferenceResult:
    """Result of collapsing a reasoning superposition.

    Attributes:
        conclusion: Winning hypothesis label.
        confidence: Confidence score [0, 1].
        truth: Final truth value.
        alternatives: Ranked list of (label, probability) for all hypotheses.
        reasoning_chain: Trace of operations that led to this conclusion.
        phi: Integrated information of the reasoning process.
    """
    conclusion: str
    confidence: float
    truth: TruthValue
    alternatives: List[Tuple[str, float]] = field(default_factory=list)
    reasoning_chain: List[str] = field(default_factory=list)
    phi: float = 0.0

    def to_dict(self) -> dict:
        return {
            "conclusion": self.conclusion,
            "confidence": round(self.confidence, 4),
            "truth": self.truth.value,
            "alternatives": [
                {"label": l, "probability": round(p, 4)}
                for l, p in self.alternatives
            ],
            "reasoning_chain": self.reasoning_chain,
            "phi": round(self.phi, 6),
        }


class NCLMReasoning:
    """Non-Classical Logic Model for quantum-enhanced reasoning.

    Maintains a superposition of hypotheses, supports entanglement
    between concepts, and collapses to conclusions via measurement.

    Example::

        nclm = NCLMReasoning()
        nclm.add_hypothesis("gravity", amplitude=0.8+0.2j,
                            evidence={"observed": True})
        nclm.add_hypothesis("dark_energy", amplitude=0.5+0.5j)
        nclm.entangle("gravity", "dark_energy", correlation=-0.8)
        nclm.amplify("gravity", factor=1.5)
        result = nclm.measure()
        print(result.conclusion, result.confidence)
    """

    def __init__(self, seed: Optional[int] = None):
        """Initialize NCLM reasoning engine.

        Args:
            seed: Random seed for reproducible measurement.
        """
        self.hypotheses: Dict[str, Hypothesis] = {}
        self.entanglements: List[EntanglementPair] = []
        self.reasoning_chain: List[str] = []
        self.rng = np.random.default_rng(seed)
        self._collapsed = False

    # ── Hypothesis Management ────────────────────────────────────────

    def add_hypothesis(
        self,
        label: str,
        amplitude: complex = 1.0 + 0j,
        evidence: Optional[Dict[str, Any]] = None,
        truth: TruthValue = TruthValue.NEITHER,
    ) -> Hypothesis:
        """Add a hypothesis to the superposition.

        Args:
            label: Hypothesis name.
            amplitude: Complex amplitude.
            evidence: Supporting evidence dict.
            truth: Initial truth value.

        Returns:
            The created Hypothesis.
        """
        h = Hypothesis(
            label=label,
            amplitude=amplitude,
            evidence=evidence or {},
            truth=truth,
        )
        self.hypotheses[label] = h
        self._collapsed = False
        self.reasoning_chain.append(f"ADD({label}, |ψ|²={h.probability:.4f})")
        return h

    def remove_hypothesis(self, label: str):
        """Remove a hypothesis from superposition."""
        if label in self.hypotheses:
            del self.hypotheses[label]
            self.entanglements = [
                e for e in self.entanglements
                if e.h1_label != label and e.h2_label != label
            ]
            self.reasoning_chain.append(f"REMOVE({label})")

    # ── Amplitude Operations ─────────────────────────────────────────

    def amplify(self, label: str, factor: float = 1.5):
        """Amplify a hypothesis (Grover-like amplitude boost).

        Args:
            label: Hypothesis to amplify.
            factor: Multiplication factor for amplitude magnitude.
        """
        if label not in self.hypotheses:
            raise KeyError(f"Hypothesis '{label}' not found")
        h = self.hypotheses[label]
        phase = np.angle(h.amplitude)
        magnitude = abs(h.amplitude) * factor
        h.amplitude = magnitude * np.exp(1j * phase)
        self.reasoning_chain.append(f"AMPLIFY({label}, ×{factor})")

    def interfere(self, label1: str, label2: str):
        """Quantum interference between two hypotheses.

        Constructive if phases align, destructive if opposed.

        Args:
            label1: First hypothesis.
            label2: Second hypothesis.
        """
        h1 = self.hypotheses[label1]
        h2 = self.hypotheses[label2]
        combined = h1.amplitude + h2.amplitude
        h1.amplitude = combined / np.sqrt(2)
        h2.amplitude = (h1.amplitude - h2.amplitude) / np.sqrt(2)
        self.reasoning_chain.append(f"INTERFERE({label1}, {label2})")

    def phase_shift(self, label: str, theta: float):
        """Apply a phase rotation to a hypothesis.

        Args:
            label: Hypothesis to rotate.
            theta: Phase angle in radians.
        """
        h = self.hypotheses[label]
        h.amplitude *= np.exp(1j * theta)
        self.reasoning_chain.append(
            f"PHASE({label}, θ={theta:.4f}rad)"
        )

    # ── Entanglement ─────────────────────────────────────────────────

    def entangle(
        self,
        label1: str,
        label2: str,
        correlation: float = 1.0,
    ) -> EntanglementPair:
        """Create entanglement between two hypotheses.

        Args:
            label1: First hypothesis.
            label2: Second hypothesis.
            correlation: Correlation coefficient [-1, 1].

        Returns:
            EntanglementPair.
        """
        if label1 not in self.hypotheses or label2 not in self.hypotheses:
            missing = label1 if label1 not in self.hypotheses else label2
            raise KeyError(f"Hypothesis '{missing}' not found")

        pair = EntanglementPair(
            h1_label=label1,
            h2_label=label2,
            correlation=np.clip(correlation, -1.0, 1.0),
            fidelity=abs(correlation),
        )
        self.entanglements.append(pair)
        self.reasoning_chain.append(
            f"ENTANGLE({label1} ↔ {label2}, ρ={correlation:.2f})"
        )
        return pair

    # ── Evidence & Truth ─────────────────────────────────────────────

    def add_evidence(self, label: str, key: str, value: Any):
        """Add evidence supporting a hypothesis.

        Positive evidence amplifies; negative evidence dampens.

        Args:
            label: Hypothesis label.
            key: Evidence key.
            value: Evidence value (truthy = positive, falsy = negative).
        """
        h = self.hypotheses[label]
        h.evidence[key] = value
        if value:
            h.amplitude *= 1.1  # slight amplification
            if h.truth == TruthValue.NEITHER:
                h.truth = TruthValue.TRUE
            elif h.truth == TruthValue.FALSE:
                h.truth = TruthValue.BOTH
        else:
            h.amplitude *= 0.9  # slight dampening
            if h.truth == TruthValue.NEITHER:
                h.truth = TruthValue.FALSE
            elif h.truth == TruthValue.TRUE:
                h.truth = TruthValue.BOTH
        self.reasoning_chain.append(f"EVIDENCE({label}.{key}={value})")

    def set_truth(self, label: str, truth: TruthValue):
        """Manually set the truth value of a hypothesis."""
        self.hypotheses[label].truth = truth
        self.reasoning_chain.append(f"TRUTH({label}={truth.value})")

    # ── Normalization ────────────────────────────────────────────────

    def normalize(self):
        """Normalize all amplitudes so probabilities sum to 1."""
        total = sum(h.probability for h in self.hypotheses.values())
        if total < 1e-12:
            return
        scale = 1.0 / math.sqrt(total)
        for h in self.hypotheses.values():
            h.amplitude *= scale
        self.reasoning_chain.append("NORMALIZE()")

    def probabilities(self) -> Dict[str, float]:
        """Get normalized probability distribution."""
        total = sum(h.probability for h in self.hypotheses.values())
        if total < 1e-12:
            return {label: 0.0 for label in self.hypotheses}
        return {
            label: h.probability / total
            for label, h in self.hypotheses.items()
        }

    # ── Measurement (Inference) ──────────────────────────────────────

    def measure(self) -> InferenceResult:
        """Collapse the superposition to produce a conclusion.

        Selects one hypothesis with probability proportional to |ψ|²,
        then propagates entanglement correlations.

        Returns:
            InferenceResult with conclusion, confidence, and alternatives.
        """
        if not self.hypotheses:
            return InferenceResult(
                conclusion="",
                confidence=0.0,
                truth=TruthValue.NEITHER,
                reasoning_chain=self.reasoning_chain.copy(),
            )

        probs = self.probabilities()
        labels = list(probs.keys())
        prob_values = np.array([probs[l] for l in labels])

        # Handle edge case: all zero probabilities
        if prob_values.sum() < 1e-12:
            prob_values = np.ones(len(labels)) / len(labels)

        # Born-rule measurement
        chosen_idx = self.rng.choice(len(labels), p=prob_values)
        conclusion = labels[chosen_idx]
        confidence = float(prob_values[chosen_idx])

        # Determine truth from hypothesis
        truth = self.hypotheses[conclusion].truth
        if truth == TruthValue.NEITHER:
            truth = TruthValue.TRUE  # measurement forces definite result

        # Propagate entanglement effects
        self._propagate_entanglement(conclusion)

        # Compute phi (integrated information proxy)
        entropy = -sum(
            p * np.log2(p + 1e-12) for p in prob_values
        )
        phi = float(entropy / max(np.log2(len(labels)), 1.0))

        # Build ranked alternatives
        alternatives = sorted(
            [(l, float(p)) for l, p in zip(labels, prob_values)],
            key=lambda x: x[1],
            reverse=True,
        )

        self.reasoning_chain.append(
            f"MEASURE → {conclusion} (p={confidence:.4f}, Φ={phi:.4f})"
        )
        self._collapsed = True

        return InferenceResult(
            conclusion=conclusion,
            confidence=confidence,
            truth=truth,
            alternatives=alternatives,
            reasoning_chain=self.reasoning_chain.copy(),
            phi=phi,
        )

    def _propagate_entanglement(self, measured_label: str):
        """After measuring one hypothesis, collapse entangled partners."""
        for pair in self.entanglements:
            partner = None
            if pair.h1_label == measured_label:
                partner = pair.h2_label
            elif pair.h2_label == measured_label:
                partner = pair.h1_label
            else:
                continue

            if partner not in self.hypotheses:
                continue

            measured_h = self.hypotheses[measured_label]
            partner_h = self.hypotheses[partner]

            if pair.correlation > 0:
                # Positive correlation: partner truth aligns
                partner_h.truth = measured_h.truth
                partner_h.amplitude *= pair.fidelity
            else:
                # Anti-correlation: partner truth opposes
                partner_h.truth = measured_h.truth.negate()
                partner_h.amplitude *= pair.fidelity * 0.5

    # ── Utility ──────────────────────────────────────────────────────

    @property
    def is_collapsed(self) -> bool:
        return self._collapsed

    def reset(self):
        """Clear all hypotheses and entanglements."""
        self.hypotheses.clear()
        self.entanglements.clear()
        self.reasoning_chain.clear()
        self._collapsed = False

    def state_vector(self) -> Dict[str, complex]:
        """Return the current state vector."""
        return {l: h.amplitude for l, h in self.hypotheses.items()}

    def to_dict(self) -> dict:
        return {
            "hypotheses": {
                l: h.to_dict() for l, h in self.hypotheses.items()
            },
            "entanglements": [e.to_dict() for e in self.entanglements],
            "collapsed": self._collapsed,
            "reasoning_chain": self.reasoning_chain,
        }

    def __repr__(self) -> str:
        return (
            f"NCLMReasoning(hypotheses={len(self.hypotheses)}, "
            f"entanglements={len(self.entanglements)}, "
            f"collapsed={self._collapsed})"
        )
