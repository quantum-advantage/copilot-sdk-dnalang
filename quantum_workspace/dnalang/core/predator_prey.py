"""
PredatorPreyEcosystem: Competitive Co-Evolution Dynamics
========================================================

Implements Lotka-Volterra inspired population dynamics where predator
organisms consume prey fitness, driving competitive co-evolution.
Populations oscillate naturally, and quantum metrics (phi, gamma)
modulate interaction rates.

Ecosystem Dynamics:
  dP/dt = α·P - β·P·Q        (prey growth - predation)
  dQ/dt = δ·P·Q - γ_crit·Q   (predation benefit - predator decay)

Where α, β, δ are modulated by organism phi/gamma values.
"""

from enum import Enum
from typing import List, Optional, Callable, Dict, Any, Tuple
from dataclasses import dataclass, field
import numpy as np
from .organism import Organism
from .genome import Genome
from .gene import Gene
from ..quantum.constants import (
    LAMBDA_PHI, THETA_LOCK, PHI_THRESHOLD, GAMMA_CRITICAL, CHI_PC
)


class EcologicalRole(Enum):
    """Organism's role in the ecosystem."""
    PREDATOR = "predator"
    PREY = "prey"


@dataclass
class PopulationSnapshot:
    """Snapshot of ecosystem state at one timestep.

    Attributes:
        step: Simulation step number.
        predator_count: Number of living predators.
        prey_count: Number of living prey.
        avg_predator_fitness: Mean predator fitness.
        avg_prey_fitness: Mean prey fitness.
        avg_phi: Mean phi across all organisms.
        avg_gamma: Mean gamma across all organisms.
        interactions: Number of predator-prey interactions this step.
    """
    step: int = 0
    predator_count: int = 0
    prey_count: int = 0
    avg_predator_fitness: float = 0.0
    avg_prey_fitness: float = 0.0
    avg_phi: float = 0.0
    avg_gamma: float = 0.0
    interactions: int = 0

    def to_dict(self) -> dict:
        return {
            "step": self.step,
            "predator_count": self.predator_count,
            "prey_count": self.prey_count,
            "avg_predator_fitness": round(self.avg_predator_fitness, 4),
            "avg_prey_fitness": round(self.avg_prey_fitness, 4),
            "avg_phi": round(self.avg_phi, 4),
            "avg_gamma": round(self.avg_gamma, 4),
            "interactions": self.interactions,
        }


@dataclass
class EcosystemEntity:
    """An organism with ecological metadata.

    Attributes:
        organism: The underlying DNA-Lang organism.
        role: Predator or prey.
        phi: Current integrated information.
        gamma: Current decoherence rate.
        energy: Survival energy (dies at 0).
        alive: Whether the entity is still active.
    """
    organism: Organism
    role: EcologicalRole
    phi: float = 0.5
    gamma: float = 0.5
    energy: float = 1.0
    alive: bool = True

    @property
    def name(self) -> str:
        return self.organism.name

    def above_threshold(self) -> bool:
        return self.phi >= PHI_THRESHOLD

    def is_coherent(self) -> bool:
        return self.gamma < GAMMA_CRITICAL


class PredatorPreyEcosystem:
    """Ecosystem with competitive Lotka-Volterra dynamics.

    Manages populations of predator and prey organisms, simulating
    interactions where predators consume prey energy and both
    populations evolve in response to selective pressure.

    Args:
        predators: Initial predator organisms.
        prey: Initial prey organisms.
        alpha: Prey natural growth rate.
        beta: Predation rate (prey consumed per encounter).
        delta: Predator reproduction rate per prey consumed.
        seed: Random seed for reproducibility.
    """

    def __init__(
        self,
        predators: List[Organism],
        prey: List[Organism],
        alpha: float = 0.1,
        beta: float = 0.05,
        delta: float = 0.03,
        seed: Optional[int] = None,
    ):
        self.alpha = alpha
        self.beta = beta
        self.delta = delta
        self.rng = np.random.default_rng(seed)
        self.step_count: int = 0
        self.history: List[PopulationSnapshot] = []

        # Wrap organisms in ecological entities
        self.predators: List[EcosystemEntity] = [
            EcosystemEntity(organism=o, role=EcologicalRole.PREDATOR)
            for o in predators
        ]
        self.prey: List[EcosystemEntity] = [
            EcosystemEntity(organism=o, role=EcologicalRole.PREY)
            for o in prey
        ]

    @property
    def living_predators(self) -> List[EcosystemEntity]:
        return [e for e in self.predators if e.alive]

    @property
    def living_prey(self) -> List[EcosystemEntity]:
        return [e for e in self.prey if e.alive]

    # ── Interaction ──────────────────────────────────────────────────

    def _interact(
        self, predator: EcosystemEntity, prey_entity: EcosystemEntity
    ) -> bool:
        """Resolve a single predator-prey encounter.

        Outcome depends on relative phi values — higher phi predator
        has advantage; higher phi prey can escape.

        Returns:
            True if predation was successful (prey consumed).
        """
        # Capture probability: predator phi advantage modulated by beta
        advantage = predator.phi - prey_entity.phi
        capture_prob = self.beta * (1 + advantage)
        capture_prob = np.clip(capture_prob, 0.01, 0.99)

        if self.rng.random() < capture_prob:
            # Successful predation
            energy_gain = prey_entity.energy * self.delta
            predator.energy = min(2.0, predator.energy + energy_gain)
            predator.phi = min(1.0, predator.phi + 0.02)
            prey_entity.energy = max(0.0, prey_entity.energy - self.beta)
            if prey_entity.energy <= 0:
                prey_entity.alive = False
            return True

        # Prey escapes — gets small fitness boost
        prey_entity.phi = min(1.0, prey_entity.phi + 0.01)
        return False

    # ── Population Dynamics ──────────────────────────────────────────

    def step(
        self,
        mutation_rate: float = 0.05,
        fitness_fn: Optional[Callable[[Organism], float]] = None,
    ) -> PopulationSnapshot:
        """Advance the ecosystem by one timestep.

        1. Prey grow (alpha-scaled energy gain)
        2. Predator-prey interactions resolve
        3. Predators decay (gamma-scaled energy loss)
        4. Dead organisms removed, survivors mutate
        5. Reproduction for high-energy organisms

        Args:
            mutation_rate: Mutation rate during reproduction.
            fitness_fn: Optional fitness evaluator.

        Returns:
            PopulationSnapshot for this step.
        """
        interactions = 0

        # 1. Prey natural growth
        for p in self.living_prey:
            growth = self.alpha * (1 + p.phi * 0.5)
            p.energy = min(2.0, p.energy + growth * 0.1)

        # 2. Predator-prey interactions
        for pred in self.living_predators:
            targets = self.living_prey
            if not targets:
                break
            target = targets[self.rng.integers(0, len(targets))]
            if self._interact(pred, target):
                interactions += 1

        # 3. Predator energy decay
        for pred in self.living_predators:
            decay = GAMMA_CRITICAL * pred.gamma * 0.1
            pred.energy = max(0.0, pred.energy - decay)
            if pred.energy <= 0:
                pred.alive = False

        # 4. Mutate survivors
        for entity in self.living_predators + self.living_prey:
            entity.organism.genome = entity.organism.genome.mutate(
                mutation_rate=mutation_rate
            )
            if fitness_fn:
                entity.organism.genome.fitness = fitness_fn(entity.organism)

        # 5. Reproduction (high-energy organisms spawn offspring)
        new_predators = self._reproduce(self.living_predators, mutation_rate)
        new_prey = self._reproduce(self.living_prey, mutation_rate)
        self.predators.extend(new_predators)
        self.prey.extend(new_prey)

        # Record snapshot
        self.step_count += 1
        snapshot = self._snapshot(interactions)
        self.history.append(snapshot)
        return snapshot

    def _reproduce(
        self,
        population: List[EcosystemEntity],
        mutation_rate: float,
    ) -> List[EcosystemEntity]:
        """Reproduce high-energy organisms.

        An organism with energy > 1.5 spawns one offspring and loses
        half its energy.
        """
        offspring = []
        for entity in population:
            if entity.energy > 1.5:
                child_genome = entity.organism.genome.mutate(
                    mutation_rate=mutation_rate
                )
                child = Organism(
                    name=f"{entity.name}_off{self.step_count}",
                    genome=child_genome,
                    domain=entity.organism.domain,
                    purpose=entity.organism.purpose,
                    lambda_phi=entity.organism.lambda_phi,
                )
                child.generation = entity.organism.generation + 1
                child_entity = EcosystemEntity(
                    organism=child,
                    role=entity.role,
                    phi=entity.phi * 0.9,
                    gamma=entity.gamma,
                    energy=entity.energy * 0.5,
                )
                entity.energy *= 0.5
                offspring.append(child_entity)
        return offspring

    def _snapshot(self, interactions: int) -> PopulationSnapshot:
        """Capture current ecosystem state."""
        preds = self.living_predators
        preys = self.living_prey
        all_entities = preds + preys

        pred_fit = [
            e.organism.genome.fitness for e in preds
            if e.organism.genome.fitness is not None
        ]
        prey_fit = [
            e.organism.genome.fitness for e in preys
            if e.organism.genome.fitness is not None
        ]
        all_phi = [e.phi for e in all_entities]
        all_gamma = [e.gamma for e in all_entities]

        return PopulationSnapshot(
            step=self.step_count,
            predator_count=len(preds),
            prey_count=len(preys),
            avg_predator_fitness=float(np.mean(pred_fit)) if pred_fit else 0.0,
            avg_prey_fitness=float(np.mean(prey_fit)) if prey_fit else 0.0,
            avg_phi=float(np.mean(all_phi)) if all_phi else 0.0,
            avg_gamma=float(np.mean(all_gamma)) if all_gamma else 0.0,
            interactions=interactions,
        )

    # ── Simulation ───────────────────────────────────────────────────

    def simulate(
        self,
        steps: int = 50,
        mutation_rate: float = 0.05,
        fitness_fn: Optional[Callable[[Organism], float]] = None,
    ) -> List[PopulationSnapshot]:
        """Run full ecosystem simulation.

        Args:
            steps: Number of timesteps.
            mutation_rate: Per-gene mutation probability.
            fitness_fn: Optional fitness evaluator.

        Returns:
            List of PopulationSnapshot for each step.
        """
        for _ in range(steps):
            if not self.living_predators or not self.living_prey:
                break
            self.step(mutation_rate=mutation_rate, fitness_fn=fitness_fn)
        return self.history

    def summary(self) -> Dict[str, Any]:
        """Summary statistics of the simulation."""
        return {
            "total_steps": self.step_count,
            "final_predators": len(self.living_predators),
            "final_prey": len(self.living_prey),
            "total_predators_ever": len(self.predators),
            "total_prey_ever": len(self.prey),
            "history_length": len(self.history),
            "alpha": self.alpha,
            "beta": self.beta,
            "delta": self.delta,
        }

    def __repr__(self) -> str:
        return (
            f"PredatorPreyEcosystem(predators={len(self.living_predators)}, "
            f"prey={len(self.living_prey)}, step={self.step_count})"
        )
