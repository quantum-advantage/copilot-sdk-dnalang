#!/usr/bin/env python3
"""
Decoder Benchmark Suite — Tesseract A* vs Naive Decoding
=========================================================
Benchmarks the Tesseract A* decoder across multiple error rates,
atom counts, and round configurations. Produces a formatted table
and optional JSON output.

Run:
  cd copilot-sdk-dnalang && PYTHONPATH=dnalang/src python3 dnalang/examples/decoder_benchmark.py
  PYTHONPATH=dnalang/src python3 dnalang/examples/decoder_benchmark.py --atoms 256 --json results.json
"""

import argparse
import json
import time
import random
from dataclasses import dataclass, asdict
from typing import List

from dnalang_sdk import TesseractDecoderOrganism, QuEraCorrelatedAdapter

# ── ANSI ─────────────────────────────────────────────────────────────────────
G, Y, R, C, M, B, DM, E = (
    "\033[32m", "\033[33m", "\033[31m", "\033[36m",
    "\033[35m", "\033[1m", "\033[90m", "\033[0m",
)


@dataclass
class BenchmarkResult:
    atoms: int
    rounds: int
    error_rate: float
    trials: int
    naive_error: float
    tesseract_error: float
    improvement: float
    avg_decode_ms: float


def build_ring_error_map(n: int) -> dict:
    """Ring topology: error i touches detectors {i, (i+1)%n}."""
    return {i: {i, (i + 1) % n} for i in range(n)}


def inject_errors(n: int, p: float, rng: random.Random) -> set:
    """Inject errors at rate p, return set of true error indices."""
    return {i for i in range(n) if rng.random() < p}


def naive_decode(errors: set, n: int) -> float:
    """Naive: error rate = fraction of atoms with errors."""
    return len(errors) / n if n > 0 else 0


def benchmark_single(atoms: int, rounds: int, error_rate: float,
                     trials: int, seed: int) -> BenchmarkResult:
    """Run a single benchmark configuration."""
    rng = random.Random(seed)
    error_map = build_ring_error_map(atoms)
    decoder = TesseractDecoderOrganism(error_map=error_map, beam_width=20)

    naive_total = 0.0
    tess_total = 0.0
    time_total = 0.0

    for _ in range(trials):
        errors = inject_errors(atoms, error_rate, rng)
        if not errors:
            continue

        # Compute syndrome from errors
        syndrome = set()
        for e in errors:
            for det in error_map.get(e, set()):
                syndrome.symmetric_difference_update({det})

        naive_total += naive_decode(errors, atoms)

        t0 = time.perf_counter()
        result = decoder.decode(syndrome)
        time_total += (time.perf_counter() - t0) * 1000

        # Tesseract residual error
        correction = set()
        if hasattr(result, 'correction') and result.correction is not None:
            correction = result.correction if isinstance(result.correction, set) else set(result.correction)
        elif isinstance(result, dict):
            c = result.get('correction')
            if c is not None:
                correction = c if isinstance(c, set) else set(c)
        residual = errors.symmetric_difference(correction)
        tess_total += len(residual) / atoms

    naive_err = naive_total / trials
    tess_err = tess_total / trials
    improvement = naive_err / max(tess_err, 1e-9)

    return BenchmarkResult(
        atoms=atoms,
        rounds=rounds,
        error_rate=error_rate,
        trials=trials,
        naive_error=round(naive_err, 6),
        tesseract_error=round(tess_err, 6),
        improvement=round(improvement, 2),
        avg_decode_ms=round(time_total / trials, 3),
    )


def run_benchmark(atom_sizes: List[int], error_rates: List[float],
                  rounds: int, trials: int, seed: int) -> List[BenchmarkResult]:
    """Run full benchmark matrix."""
    results = []
    total = len(atom_sizes) * len(error_rates)
    idx = 0

    print(f"\n{B}{M}{'═'*72}{E}")
    print(f"  {B}Tesseract A* Decoder Benchmark Suite{E}")
    print(f"  {DM}DNA::}}{{::lang v51.843 │ CAGE 9HUP5{E}")
    print(f"{M}{'═'*72}{E}\n")
    print(f"  Configurations: {total} │ Trials each: {trials} │ Rounds: {rounds} │ Seed: {seed}\n")

    header = f"  {'Atoms':>5}  {'p_err':>6}  {'Naive':>8}  {'Tesseract':>9}  {'Gain':>6}  {'Time':>8}  Bar"
    print(f"{C}{header}{E}")
    print(f"  {'─'*68}")

    for n_atoms in atom_sizes:
        for p in error_rates:
            idx += 1
            print(f"  {DM}[{idx}/{total}]{E}", end="", flush=True)
            result = benchmark_single(n_atoms, rounds, p, trials, seed)
            results.append(result)

            imp_c = G if result.improvement > 2 else (Y if result.improvement > 1 else R)
            bar_len = min(int(result.improvement * 2), 20)
            bar = "▓" * bar_len + "░" * (20 - bar_len)

            print(f"\r  {n_atoms:>5}  {p:>6.3f}  {result.naive_error:>8.4f}  "
                  f"{result.tesseract_error:>9.4f}  {imp_c}{result.improvement:>5.1f}×{E}  "
                  f"{DM}{result.avg_decode_ms:>7.1f}ms{E}  {imp_c}{bar}{E}")

    # Summary
    print(f"\n  {'─'*68}")
    best = max(results, key=lambda r: r.improvement)
    avg_imp = sum(r.improvement for r in results) / len(results)
    avg_time = sum(r.avg_decode_ms for r in results) / len(results)
    print(f"  {G}Best gain:{E}  {best.improvement:.1f}× at {best.atoms} atoms, p={best.error_rate}")
    print(f"  {C}Avg gain:{E}   {avg_imp:.1f}×  │  Avg decode: {avg_time:.1f}ms")
    print(f"{M}{'═'*72}{E}\n")

    return results


def main():
    parser = argparse.ArgumentParser(description="Tesseract A* Decoder Benchmark")
    parser.add_argument("--atoms", type=str, default="16,32,64,128,256",
                        help="Comma-separated atom counts")
    parser.add_argument("--rates", type=str, default="0.01,0.02,0.05,0.10,0.15",
                        help="Comma-separated error rates")
    parser.add_argument("--rounds", type=int, default=3)
    parser.add_argument("--trials", type=int, default=50)
    parser.add_argument("--seed", type=int, default=51843)
    parser.add_argument("--json", type=str, help="Save results to JSON file")
    args = parser.parse_args()

    atom_sizes = [int(x) for x in args.atoms.split(",")]
    error_rates = [float(x) for x in args.rates.split(",")]

    results = run_benchmark(atom_sizes, error_rates, args.rounds, args.trials, args.seed)

    if args.json:
        with open(args.json, "w") as f:
            json.dump([asdict(r) for r in results], f, indent=2)
        print(f"  {G}✓ Results saved to {args.json}{E}\n")


if __name__ == "__main__":
    main()
