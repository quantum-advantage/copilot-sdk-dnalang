"""
SymbiosisOrganism: Mutualistic Co-Evolution
============================================

Two organisms bound in a symbiotic relationship where each partner's
quantum metrics influence the other. When one partner crosses the
phi threshold, the other's decoherence (gamma) drops — modelling
non-local entanglement correlation at the organism level.

Symbiosis types:
  - MUTUALISM:    Both partners benefit (+phi, -gamma)
  - COMMENSALISM: One benefits, other unaffected
  - PARASITISM:   One benefits at the other's expense
"""

from enum import Enum
from typing import Optional, Callable, Dict, List, Tuple, Any
from dataclasses import dataclass, field
import numpy as np
from .organism import Organism
from .genome import Genome
from .gene import Gene
from ..quantum.constants import (
    LAMBDA_PHI, THETA_LOCK, PHI_THRESHOLD, GAMMA_CRITICAL, CHI_PC
)


class SymbiosisType(Enum):
    """Classification of inter-organism relationship."""
    MUTUALISM = "mutualism"
    COMMENSALISM = "commensalism"
    PARASITISM = "parasitism"


@dataclass
class SymbiosisMetrics:
    """Quantum metrics for a symbiotic bond.

    Attributes:
        bond_strength: Entanglement fidelity between partners [0, 1].
        phi_host: Host organism phi (integrated information).
        phi_symbiont: Symbiont organism phi.
        gamma_host: Host decoherence rate.
        gamma_symbiont: Symbiont decoherence rate.
        ccce: Combined consciousness coherence.
        resonance: Theta-lock alignment quality.
    """
    bond_strength: float = 0.0
    phi_host: float = 0.0
    phi_symbiont: float = 0.0
    gamma_host: float = 1.0
    gamma_symbiont: float = 1.0
    ccce: float = 0.0
    resonance: float = 0.0

    def is_entangled(self) -> bool:
        """True if bond exceeds phi threshold."""
        return self.bond_strength >= PHI_THRESHOLD

    def combined_negentropy(self) -> float:
        """Ξ = (Λ × avg_Φ) / avg_Γ — joint negentropy."""
        avg_phi = (self.phi_host + self.phi_symbiont) / 2
        avg_gamma = (self.gamma_host + self.gamma_symbiont) / 2
        return (LAMBDA_PHI * avg_phi) / max(avg_gamma, 1e-9)

    def to_dict(self) -> dict:
        return {
            "bond_strength": self.bond_strength,
            "phi_host": self.phi_host,
            "phi_symbiont": self.phi_symbiont,
            "gamma_host": self.gamma_host,
            "gamma_symbiont": self.gamma_symbiont,
            "ccce": self.ccce,
            "resonance": self.resonance,
            "entangled": self.is_entangled(),
            "negentropy": self.combined_negentropy(),
        }


class SymbiosisOrganism(Organism):
    """Organism capable of forming symbiotic bonds with a partner.

    Each organism tracks its own phi/gamma and propagates effects
    to its bonded partner according to the symbiosis type.

    Attributes:
        partner: Bonded symbiotic partner (None if unbonded).
        symbiosis_type: Nature of the relationship.
        phi: Current integrated information.
        gamma: Current decoherence rate.
        bond_history: Record of bond metrics over co-evolution cycles.
    """

    def __init__(
        self,
        name: str,
        genome: Genome,
        domain: str = "symbiosis",
        purpose: str = "co-evolution",
        lambda_phi: float = LAMBDA_PHI,
        symbiosis_type: SymbiosisType = SymbiosisType.MUTUALISM,
    ):
        super().__init__(name, genome, domain, purpose, lambda_phi)
        self.partner: Optional["SymbiosisOrganism"] = None
        self.symbiosis_type = symbiosis_type
        self.phi: float = 0.5
        self.gamma: float = 0.5
        self.bond_history: List[Dict[str, Any]] = []

    # ── Bonding ──────────────────────────────────────────────────────

    def bond(self, partner: "SymbiosisOrganism"):
        """Form a symbiotic bond with another organism.

        Args:
            partner: Organism to bond with.

        Raises:
            ValueError: If either organism already has a partner.
        """
        if self.partner is not None:
            raise ValueError(f"{self.name} already bonded to {self.partner.name}")
        if partner.partner is not None:
            raise ValueError(f"{partner.name} already bonded to {partner.partner.name}")

        self.partner = partner
        partner.partner = self
        self._log_event("bond_formed", {"partner": partner.name})
        partner._log_event("bond_formed", {"partner": self.name})

    def unbond(self):
        """Dissolve the symbiotic bond."""
        if self.partner is None:
            return
        partner = self.partner
        self.partner = None
        partner.partner = None
        self._log_event("bond_dissolved", {"partner": partner.name})
        partner._log_event("bond_dissolved", {"partner": self.name})

    def is_bonded(self) -> bool:
        """True if currently in a symbiotic relationship."""
        return self.partner is not None

    # ── Metrics ──────────────────────────────────────────────────────

    def compute_metrics(self) -> SymbiosisMetrics:
        """Compute current symbiosis metrics.

        Bond strength is derived from genome fitness overlap and
        theta-lock resonance between the two organisms' gene
        expression profiles.
        """
        if not self.is_bonded():
            return SymbiosisMetrics(
                phi_host=self.phi,
                gamma_host=self.gamma,
            )

        # Resonance: cosine similarity of expression vectors
        self_expr = np.array([g.expression for g in self.genome])
        part_expr = np.array([g.expression for g in self.partner.genome])
        min_len = min(len(self_expr), len(part_expr))
        if min_len > 0:
            a = self_expr[:min_len]
            b = part_expr[:min_len]
            dot = np.dot(a, b)
            norms = np.linalg.norm(a) * np.linalg.norm(b)
            resonance = float(dot / max(norms, 1e-9))
        else:
            resonance = 0.0

        # Bond strength: resonance scaled by theta-lock alignment
        theta_factor = np.cos(np.radians(THETA_LOCK)) ** 2
        bond_strength = float(np.clip(resonance * theta_factor + 0.3, 0.0, 1.0))

        # CCCE: consciousness coherence of the pair
        avg_phi = (self.phi + self.partner.phi) / 2
        avg_gamma = (self.gamma + self.partner.gamma) / 2
        ccce = avg_phi * (1 - avg_gamma) * bond_strength

        return SymbiosisMetrics(
            bond_strength=bond_strength,
            phi_host=self.phi,
            phi_symbiont=self.partner.phi,
            gamma_host=self.gamma,
            gamma_symbiont=self.partner.gamma,
            ccce=ccce,
            resonance=resonance,
        )

    def above_threshold(self) -> bool:
        """True if phi exceeds the ER=EPR crossing threshold."""
        return self.phi >= PHI_THRESHOLD

    def is_coherent(self) -> bool:
        """True if gamma is below the decoherence boundary."""
        return self.gamma < GAMMA_CRITICAL

    # ── Non-Local Propagation ────────────────────────────────────────

    def propagate(self):
        """Propagate quantum effects to bonded partner.

        Effect depends on symbiosis type:
          MUTUALISM:    Both partners benefit (phi ↑, gamma ↓)
          COMMENSALISM: Host benefits, symbiont unchanged
          PARASITISM:   Host benefits, symbiont's gamma increases
        """
        if not self.is_bonded():
            return

        metrics = self.compute_metrics()
        scale = metrics.bond_strength * 0.1  # damping factor

        if self.symbiosis_type == SymbiosisType.MUTUALISM:
            if self.above_threshold():
                self.partner.gamma = max(0.01, self.partner.gamma - scale)
                self.partner.phi = min(1.0, self.partner.phi + scale * 0.5)
            if self.partner.above_threshold():
                self.gamma = max(0.01, self.gamma - scale)
                self.phi = min(1.0, self.phi + scale * 0.5)

        elif self.symbiosis_type == SymbiosisType.COMMENSALISM:
            if self.partner.above_threshold():
                self.phi = min(1.0, self.phi + scale * 0.5)

        elif self.symbiosis_type == SymbiosisType.PARASITISM:
            # Host drains symbiont
            drain = scale * 0.3
            self.phi = min(1.0, self.phi + drain)
            self.gamma = max(0.01, self.gamma - drain)
            self.partner.gamma = min(1.0, self.partner.gamma + drain)
            self.partner.phi = max(0.0, self.partner.phi - drain * 0.5)

        self.bond_history.append(metrics.to_dict())
        self._log_event("propagate", {
            "type": self.symbiosis_type.value,
            "metrics": metrics.to_dict(),
        })

    # ── Co-Evolution ─────────────────────────────────────────────────

    def co_evolve(
        self,
        cycles: int = 10,
        mutation_rate: float = 0.1,
        fitness_fn: Optional[Callable[["Organism"], float]] = None,
    ) -> SymbiosisMetrics:
        """Run co-evolution cycles with bonded partner.

        Each cycle: mutate both genomes → evaluate fitness →
        propagate non-local effects → record metrics.

        Args:
            cycles: Number of co-evolution cycles.
            mutation_rate: Per-gene mutation probability.
            fitness_fn: Optional fitness evaluator.

        Returns:
            Final SymbiosisMetrics after all cycles.
        """
        if not self.is_bonded():
            raise RuntimeError(f"{self.name} has no partner for co-evolution")

        for cycle in range(cycles):
            # Mutate both genomes
            self.genome = self.genome.mutate(mutation_rate=mutation_rate)
            self.partner.genome = self.partner.genome.mutate(
                mutation_rate=mutation_rate
            )

            # Evaluate fitness
            if fitness_fn:
                self.genome.fitness = fitness_fn(self)
                self.partner.genome.fitness = fitness_fn(self.partner)

            # Update phi/gamma from fitness
            if self.genome.fitness is not None:
                self.phi = min(1.0, self.phi + self.genome.fitness * 0.01)
            if self.partner.genome.fitness is not None:
                self.partner.phi = min(
                    1.0, self.partner.phi + self.partner.genome.fitness * 0.01
                )

            # Non-local propagation
            self.propagate()

            self._log_event("co_evolve_cycle", {
                "cycle": cycle,
                "phi_self": self.phi,
                "phi_partner": self.partner.phi,
                "gamma_self": self.gamma,
                "gamma_partner": self.partner.gamma,
            })

        return self.compute_metrics()

    # ── Serialization ────────────────────────────────────────────────

    def to_dict(self) -> dict:
        d = super().to_dict()
        d.update({
            "symbiosis_type": self.symbiosis_type.value,
            "phi": self.phi,
            "gamma": self.gamma,
            "partner": self.partner.name if self.partner else None,
            "bond_history_len": len(self.bond_history),
            "type": "SymbiosisOrganism",
        })
        return d

    def __repr__(self) -> str:
        partner_str = f", partner='{self.partner.name}'" if self.partner else ""
        return (
            f"SymbiosisOrganism(name='{self.name}', phi={self.phi:.3f}, "
            f"gamma={self.gamma:.3f}, type={self.symbiosis_type.value}"
            f"{partner_str})"
        )
