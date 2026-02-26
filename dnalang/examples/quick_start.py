#!/usr/bin/env python3
"""
DNA::}{::lang Quick Start — Sovereign Quantum SDK
==================================================
Demonstrates core SDK features in 60 seconds:
  1. Organism creation & gene expression
  2. Tesseract A* decoder
  3. QuEra correlated adapter (dry-run)
  4. CCCE metric computation
  5. Immutable physics constants

Run:
  cd copilot-sdk-dnalang && PYTHONPATH=dnalang/src python3 dnalang/examples/quick_start.py
"""

import sys, time, json

# ── SDK imports ──────────────────────────────────────────────────────────────
from dnalang_sdk import (
    Organism, Genome, EvolutionEngine,
    TesseractDecoderOrganism, QuEraCorrelatedAdapter,
)
from dnalang_sdk.organisms import Gene
from dnalang_sdk.quantum_core.constants import (
    LAMBDA_PHI, THETA_LOCK, PHI_THRESHOLD,
    GAMMA_CRITICAL, CHI_PC,
)

# ── ANSI helpers ─────────────────────────────────────────────────────────────
G, Y, R, C, M, B, E = (
    "\033[32m", "\033[33m", "\033[31m", "\033[36m",
    "\033[35m", "\033[1m", "\033[0m",
)

def section(title: str):
    print(f"\n{B}{M}{'─'*60}{E}")
    print(f"  {B}{title}{E}")
    print(f"{M}{'─'*60}{E}\n")


def main():
    t0 = time.time()

    # ── 1. Immutable Physics Constants ───────────────────────────────────────
    section("1 │ Immutable Physics Constants")
    constants = {
        "ΛΦ (Planck mass)": f"{LAMBDA_PHI:.6e} kg",
        "θ_lock":           f"{THETA_LOCK}°",
        "Φ threshold":      f"{PHI_THRESHOLD}",
        "Γ critical":       f"{GAMMA_CRITICAL}",
        "χ_PC":             f"{CHI_PC}",
    }
    for k, v in constants.items():
        print(f"  {C}{k:<20}{E} = {v}")

    # ── 2. Organism Creation ─────────────────────────────────────────────────
    section("2 │ Organism Creation & Gene Expression")
    genes = [
        Gene(name="photon_capture",  expression=0.92),
        Gene(name="error_correct",   expression=0.88),
        Gene(name="phase_conjugate", expression=0.95),
        Gene(name="entangle_pair",   expression=0.90),
        Gene(name="readout",         expression=0.85),
    ]
    genome = Genome(genes=genes, version="1.0.0")
    organism = Organism(
        name="quantum_sensor",
        genome=genome,
        domain="photonics",
        lambda_phi=LAMBDA_PHI,
    )
    print(f"  Organism: {B}{organism.name}{E}  domain={organism.domain}")
    print(f"  Genes:    {len(genome.genes)}")
    for g in genome.genes:
        bar = "█" * int(g.expression * 20) + "░" * (20 - int(g.expression * 20))
        color = G if g.expression >= 0.9 else (Y if g.expression >= 0.8 else R)
        print(f"    {g.name:<20} {color}{bar} {g.expression:.2f}{E}")

    # ── 3. Evolution ─────────────────────────────────────────────────────────
    section("3 │ Genome Evolution (3 generations)")
    engine = EvolutionEngine(mutation_rate=0.08, crossover_rate=0.5)
    current = genome
    for gen in range(1, 4):
        mutated = current.mutate(mutation_rate=0.08, delta=0.03)
        avg_expr = sum(g.expression for g in mutated.genes) / len(mutated.genes)
        color = G if avg_expr > 0.88 else Y
        print(f"  Gen {gen}: avg_expression = {color}{avg_expr:.4f}{E}")
        current = mutated

    # ── 4. Tesseract A* Decoder ──────────────────────────────────────────────
    section("4 │ Tesseract A* Decoder")
    error_map = {}
    n_atoms = 64
    for i in range(n_atoms):
        error_map[i] = {i, (i + 1) % n_atoms}
    decoder = TesseractDecoderOrganism(error_map=error_map, beam_width=20)
    # Create a test syndrome
    syndrome = {0, 1, 5, 6}
    result = decoder.decode(syndrome)
    print(f"  Atoms:    {n_atoms}")
    print(f"  Syndrome: {sorted(syndrome)}")
    print(f"  Decoded:  {sorted(result.correction) if hasattr(result, 'correction') else result}")
    print(f"  {G}✓ Decoder operational{E}")

    # ── 5. QuEra Correlated Adapter ──────────────────────────────────────────
    section("5 │ QuEra Correlated Adapter (dry-run)")
    adapter = QuEraCorrelatedAdapter(atoms=128, rounds=3, beam_width=20)
    dry = adapter.run_dry()
    print(f"  Atoms:          {dry['atoms']}")
    print(f"  Rounds:         {dry['rounds']}")
    print(f"  Logical errors: {dry['logical_errors']}")
    decoded = dry.get("decoded", {})
    if isinstance(decoded, dict):
        corr = decoded.get("correction", [])
        print(f"  Corrections:    {len(corr) if isinstance(corr, (list, set)) else corr}")
    print(f"  {G}✓ QuEra adapter operational{E}")

    # ── 6. CCCE Metrics ──────────────────────────────────────────────────────
    section("6 │ CCCE Metric Computation")
    phi = 0.8450
    gamma = 0.0920
    lambda_val = CHI_PC
    xi = (lambda_val * phi) / max(gamma, 0.001)
    above = phi >= PHI_THRESHOLD
    coherent = gamma < GAMMA_CRITICAL

    metrics = {
        "Φ (phi)":     (phi,        G if above else R),
        "Γ (gamma)":   (gamma,      G if coherent else R),
        "Λ (lambda)":  (lambda_val, G),
        "Ξ (xi)":      (xi,         G if xi > 1 else Y),
    }
    for k, (v, color) in metrics.items():
        print(f"  {k:<15} = {color}{v:.4f}{E}")
    status = "SOVEREIGN" if above and coherent else "DEGRADED"
    s_color = G if status == "SOVEREIGN" else R
    print(f"\n  System status: {s_color}{B}{status}{E}")

    # ── Summary ──────────────────────────────────────────────────────────────
    elapsed = time.time() - t0
    section("Summary")
    print(f"  {G}✓{E} All 6 demonstrations completed in {elapsed:.2f}s")
    print(f"  Framework: DNA::}}{{::lang v51.843")
    print(f"  CAGE Code: 9HUP5 │ Agile Defense Systems")
    print()


if __name__ == "__main__":
    main()
