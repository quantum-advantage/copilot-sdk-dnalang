"""
MitosisOrganism: Binary Fission Quantum Entity
===============================================

A self-dividing organism that undergoes mitotic division, partitioning
its genome into two daughter organisms with optional asymmetric
expression. Models cellular division at the quantum-biological level.

Division phases mirror biological mitosis:
  Interphase → Prophase → Metaphase → Anaphase → Telophase → Cytokinesis
"""

from typing import Optional, Tuple, Callable, List, Dict, Any
import numpy as np
from .organism import Organism
from .genome import Genome
from .gene import Gene
from ..quantum.constants import (
    LAMBDA_PHI, THETA_LOCK, PHI_THRESHOLD, GAMMA_CRITICAL, CHI_PC
)

# Mitosis phases as quantum state labels
MITOSIS_PHASES = [
    "|interphase⟩",
    "|prophase⟩",
    "|metaphase⟩",
    "|anaphase⟩",
    "|telophase⟩",
    "|cytokinesis⟩",
]


class MitosisOrganism(Organism):
    """Organism capable of binary fission (mitotic division).

    Extends the base Organism with division mechanics: genome
    duplication, spindle alignment at theta_lock, asymmetric
    partitioning, and daughter-cell fitness inheritance.

    Attributes:
        division_count: Number of completed divisions.
        division_threshold: Minimum fitness to permit division.
        asymmetry: Bias factor for unequal genome partitioning [0, 1].
            0 = perfectly symmetric, 1 = maximally asymmetric.
        phase: Current mitosis phase.
        daughters: Most recent daughter pair after division.
    """

    def __init__(
        self,
        name: str,
        genome: Genome,
        domain: str = "mitosis",
        purpose: str = "self-replication",
        lambda_phi: float = LAMBDA_PHI,
        division_threshold: float = 0.5,
        asymmetry: float = 0.0,
    ):
        super().__init__(name, genome, domain, purpose, lambda_phi)
        self.division_count: int = 0
        self.division_threshold = division_threshold
        self.asymmetry = np.clip(asymmetry, 0.0, 1.0)
        self.phase: str = MITOSIS_PHASES[0]
        self.daughters: Optional[Tuple["MitosisOrganism", "MitosisOrganism"]] = None
        self.lineage: List[str] = [self.genesis]

    # ── Phase Progression ────────────────────────────────────────────

    def advance_phase(self) -> str:
        """Advance to the next mitosis phase.

        Returns:
            New phase label.
        """
        idx = MITOSIS_PHASES.index(self.phase)
        if idx < len(MITOSIS_PHASES) - 1:
            self.phase = MITOSIS_PHASES[idx + 1]
        self._log_event("phase_advance", {"phase": self.phase})
        return self.phase

    def reset_phase(self):
        """Reset to interphase after division."""
        self.phase = MITOSIS_PHASES[0]

    # ── Division Logic ───────────────────────────────────────────────

    def can_divide(self) -> bool:
        """Check if organism meets division criteria.

        Requires:
          - Fitness >= division_threshold (or no fitness yet → allow)
          - At least 2 genes (need something to partition)
        """
        fitness_ok = (
            self.genome.fitness is None
            or self.genome.fitness >= self.division_threshold
        )
        genes_ok = len(self.genome) >= 2
        return fitness_ok and genes_ok

    def divide(
        self,
        mutation_rate: float = 0.05,
        fitness_fn: Optional[Callable[["Organism"], float]] = None,
    ) -> Tuple["MitosisOrganism", "MitosisOrganism"]:
        """Perform mitotic division into two daughter organisms.

        The genome is duplicated then partitioned. With asymmetry > 0
        the split point is biased toward one end, creating daughters
        with different gene counts. Both daughters inherit lineage.

        Args:
            mutation_rate: Per-gene mutation probability during replication.
            fitness_fn: Optional fitness evaluator for daughters.

        Returns:
            Tuple of two daughter MitosisOrganisms.

        Raises:
            RuntimeError: If division criteria not met.
        """
        if not self.can_divide():
            raise RuntimeError(
                f"{self.name} cannot divide: fitness={self.genome.fitness}, "
                f"genes={len(self.genome)}, threshold={self.division_threshold}"
            )

        # Walk through all phases
        for _ in range(len(MITOSIS_PHASES) - 1):
            self.advance_phase()

        # Duplicate genome with mutations (DNA replication errors)
        replicated = self.genome.mutate(mutation_rate=mutation_rate)

        # Determine split point (theta_lock-aligned)
        n = len(replicated)
        midpoint = n // 2
        if self.asymmetry > 0:
            offset = int(self.asymmetry * midpoint * 0.5)
            split = midpoint + offset
        else:
            split = midpoint

        split = max(1, min(split, n - 1))

        genes_a = replicated.genes[:split]
        genes_b = replicated.genes[split:]

        genome_a = Genome(genes_a, version=f"{replicated.version}.a")
        genome_b = Genome(genes_b, version=f"{replicated.version}.b")

        # Inherit fitness proportionally
        if self.genome.fitness is not None:
            ratio = len(genes_a) / n
            genome_a.fitness = self.genome.fitness * ratio
            genome_b.fitness = self.genome.fitness * (1 - ratio)

        daughter_a = MitosisOrganism(
            name=f"{self.name}_d{self.division_count * 2}",
            genome=genome_a,
            domain=self.domain,
            purpose=self.purpose,
            lambda_phi=self.lambda_phi,
            division_threshold=self.division_threshold,
            asymmetry=self.asymmetry,
        )
        daughter_b = MitosisOrganism(
            name=f"{self.name}_d{self.division_count * 2 + 1}",
            genome=genome_b,
            domain=self.domain,
            purpose=self.purpose,
            lambda_phi=self.lambda_phi,
            division_threshold=self.division_threshold,
            asymmetry=self.asymmetry,
        )

        # Lineage tracking
        daughter_a.lineage = self.lineage + [daughter_a.genesis]
        daughter_b.lineage = self.lineage + [daughter_b.genesis]
        daughter_a.generation = self.generation + 1
        daughter_b.generation = self.generation + 1

        # Evaluate fitness if callback provided
        if fitness_fn:
            genome_a.fitness = fitness_fn(daughter_a)
            genome_b.fitness = fitness_fn(daughter_b)

        self.division_count += 1
        self.daughters = (daughter_a, daughter_b)
        self.reset_phase()

        self._log_event("divide", {
            "daughter_a": daughter_a.name,
            "daughter_b": daughter_b.name,
            "genes_a": len(genes_a),
            "genes_b": len(genes_b),
            "asymmetry": self.asymmetry,
            "division_count": self.division_count,
        })

        return daughter_a, daughter_b

    def recursive_divide(
        self,
        depth: int = 2,
        mutation_rate: float = 0.05,
        fitness_fn: Optional[Callable[["Organism"], float]] = None,
    ) -> List["MitosisOrganism"]:
        """Recursively divide to produce 2^depth leaf organisms.

        Args:
            depth: Recursion depth (1 = 2 daughters, 2 = 4, etc.).
            mutation_rate: Per-gene mutation probability.
            fitness_fn: Optional fitness evaluator.

        Returns:
            List of all leaf daughter organisms.
        """
        if depth <= 0 or not self.can_divide():
            return [self]

        a, b = self.divide(mutation_rate=mutation_rate, fitness_fn=fitness_fn)
        leaves: List[MitosisOrganism] = []
        for daughter in (a, b):
            if daughter.can_divide():
                leaves.extend(
                    daughter.recursive_divide(depth - 1, mutation_rate, fitness_fn)
                )
            else:
                leaves.append(daughter)
        return leaves

    # ── Serialization ────────────────────────────────────────────────

    def to_dict(self) -> dict:
        """Serialize to dictionary (extends base)."""
        d = super().to_dict()
        d.update({
            "division_count": self.division_count,
            "division_threshold": self.division_threshold,
            "asymmetry": self.asymmetry,
            "phase": self.phase,
            "lineage": self.lineage,
            "type": "MitosisOrganism",
        })
        return d

    def __repr__(self) -> str:
        return (
            f"MitosisOrganism(name='{self.name}', genes={len(self.genome)}, "
            f"divisions={self.division_count}, phase={self.phase})"
        )
