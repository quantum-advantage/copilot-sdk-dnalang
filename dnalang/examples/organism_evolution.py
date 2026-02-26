#!/usr/bin/env python3
"""
Organism Evolution Demo — Quantum Darwinism in Action
======================================================
Demonstrates the full organism lifecycle:
  1. Create a population of organisms
  2. Evolve through generations with mutation + crossover
  3. Apply fitness selection based on CCCE metrics
  4. Track lineage and convergence

Run:
  cd copilot-sdk-dnalang && PYTHONPATH=dnalang/src python3 dnalang/examples/organism_evolution.py
"""

import time
import random
from typing import List, Tuple

from dnalang_sdk import Organism, Genome, EvolutionEngine
from dnalang_sdk.organisms import Gene
from dnalang_sdk.quantum_core.constants import (
    LAMBDA_PHI, THETA_LOCK, PHI_THRESHOLD,
    GAMMA_CRITICAL, CHI_PC,
)

# ── ANSI ─────────────────────────────────────────────────────────────────────
G, Y, R, C, M, B, DM, E = (
    "\033[32m", "\033[33m", "\033[31m", "\033[36m",
    "\033[35m", "\033[1m", "\033[90m", "\033[0m",
)

SPARKLINE = " ▁▂▃▄▅▆▇█"


def spark(values: List[float], width: int = 20) -> str:
    """Create a sparkline from a list of values."""
    if not values:
        return ""
    lo, hi = min(values), max(values)
    span = hi - lo if hi > lo else 1
    return "".join(SPARKLINE[min(8, int((v - lo) / span * 8))] for v in values[-width:])


def fitness(genome: Genome) -> float:
    """CCCE-inspired fitness: reward high expression, penalize variance."""
    exprs = [g.expression for g in genome.genes]
    avg = sum(exprs) / len(exprs)
    variance = sum((e - avg) ** 2 for e in exprs) / len(exprs)
    # Phi-like: high mean expression
    phi_score = avg
    # Gamma-like: low variance = more coherent
    gamma_score = 1.0 - min(variance * 10, 1.0)
    # CCCE = phi * gamma
    return phi_score * gamma_score


def create_population(pop_size: int, n_genes: int, rng: random.Random) -> List[Tuple[Organism, Genome]]:
    """Create initial population with random gene expressions."""
    population = []
    gene_names = [
        "photon_capture", "error_correct", "phase_conjugate",
        "entangle_pair", "readout", "syndrome_decode",
        "zeno_monitor", "floquet_drive", "feedforward", "measurement",
    ][:n_genes]

    for i in range(pop_size):
        genes = [Gene(name=name, expression=0.5 + rng.random() * 0.5) for name in gene_names]
        genome = Genome(genes=genes, version="0.1.0")
        org = Organism(name=f"org_{i:03d}", genome=genome, domain="evolution", lambda_phi=LAMBDA_PHI)
        population.append((org, genome))
    return population


def evolve_generation(population: List[Tuple[Organism, Genome]],
                      mutation_rate: float, rng: random.Random) -> List[Tuple[Organism, Genome]]:
    """Evolve one generation: selection + crossover + mutation."""
    # Sort by fitness
    scored = [(fitness(g), o, g) for o, g in population]
    scored.sort(key=lambda x: x[0], reverse=True)

    pop_size = len(population)
    # Keep top 20% (elitism)
    elite_count = max(2, pop_size // 5)
    new_pop = [(o, g) for _, o, g in scored[:elite_count]]

    # Fill rest with crossover + mutation from top 50%
    parents = scored[:pop_size // 2]
    gen_id = int(time.time() * 1000) % 10000

    while len(new_pop) < pop_size:
        p1 = rng.choice(parents)
        p2 = rng.choice(parents)
        child_genome = p1[2].crossover(p2[2], strategy="uniform")
        child_genome = child_genome.mutate(mutation_rate=mutation_rate, delta=0.03)
        child_org = Organism(
            name=f"org_{gen_id}_{len(new_pop):03d}",
            genome=child_genome,
            domain="evolution",
            lambda_phi=LAMBDA_PHI,
        )
        new_pop.append((child_org, child_genome))

    return new_pop


def main():
    rng = random.Random(51843)
    pop_size = 20
    n_genes = 8
    generations = 25
    mutation_rate = 0.15

    print(f"\n{B}{M}{'═'*72}{E}")
    print(f"  {B}Organism Evolution Demo — Quantum Darwinism{E}")
    print(f"  {DM}DNA::}}{{::lang v51.843 │ CAGE 9HUP5{E}")
    print(f"{M}{'═'*72}{E}\n")
    print(f"  Population: {pop_size} │ Genes: {n_genes} │ Generations: {generations}")
    print(f"  Mutation rate: {mutation_rate} │ Crossover: uniform │ Elitism: top 20%")
    print(f"  Fitness: Φ·(1-Γ) where Φ=avg(expression), Γ=variance\n")

    population = create_population(pop_size, n_genes, rng)

    # Track history
    best_history = []
    avg_history = []
    worst_history = []

    header = f"  {'Gen':>4}  {'Best':>7}  {'Avg':>7}  {'Worst':>7}  {'Δbest':>7}  Trend"
    print(f"{C}{header}{E}")
    print(f"  {'─'*62}")

    t0 = time.time()

    for gen in range(generations):
        fitnesses = [fitness(g) for _, g in population]
        best = max(fitnesses)
        avg = sum(fitnesses) / len(fitnesses)
        worst = min(fitnesses)

        best_history.append(best)
        avg_history.append(avg)
        worst_history.append(worst)

        delta = best - best_history[-2] if gen > 0 else 0
        delta_c = G if delta > 0 else (R if delta < 0 else DM)
        best_c = G if best > 0.85 else (Y if best > 0.7 else R)
        trend = spark(avg_history)

        print(f"  {gen:>4}  {best_c}{best:>7.4f}{E}  {avg:>7.4f}  {worst:>7.4f}  "
              f"{delta_c}{delta:>+7.4f}{E}  {trend}")

        population = evolve_generation(population, mutation_rate, rng)
        # Adaptive mutation: decrease as fitness improves
        if avg > 0.85:
            mutation_rate = max(0.02, mutation_rate * 0.95)

    elapsed = time.time() - t0

    # Final analysis
    print(f"\n  {'─'*62}")
    print(f"\n{B}  Final Champion:{E}")
    best_org, best_genome = max(population, key=lambda x: fitness(x[1]))
    for g in best_genome.genes:
        bar_len = int(g.expression * 30)
        bar = "█" * bar_len + "░" * (30 - bar_len)
        color = G if g.expression >= 0.9 else (Y if g.expression >= 0.8 else R)
        print(f"    {g.name:<20} {color}{bar} {g.expression:.4f}{E}")

    final_fitness = fitness(best_genome)
    above_threshold = final_fitness >= PHI_THRESHOLD
    print(f"\n  Final fitness: {G if above_threshold else Y}{final_fitness:.4f}{E}")
    print(f"  Above Φ threshold ({PHI_THRESHOLD}): "
          f"{'✅ YES' if above_threshold else '❌ NO'}")
    print(f"  Convergence:  {spark(best_history, 25)}")
    print(f"  Wall time:    {elapsed:.2f}s  ({generations / elapsed:.0f} gen/s)")
    print(f"\n{M}{'═'*72}{E}\n")


if __name__ == "__main__":
    main()
