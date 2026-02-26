"""
DNA-Lang REPL — Interactive Organism Interpreter
=================================================

An interactive Read-Eval-Print Loop for creating, manipulating,
and evolving DNA-Lang organisms in real time.

Commands:
  create <name> <genes...>   — Create a new organism with named genes
  dna <name> <sequence>      — Create organism from DNA gate string
  express <name>             — Express all genes in an organism
  mutate <name> [rate]       — Mutate an organism's genome
  evolve <name> [gens]       — Evolve an organism through generations
  divide <name>              — Perform mitotic division (MitosisOrganism)
  bond <name1> <name2>       — Form symbiotic bond between two organisms
  info <name>                — Show organism details
  list                       — List all organisms
  metrics                    — Show quantum metrics for all organisms
  export <name> [file]       — Export organism to JSON
  help                       — Show help text
  quit / exit                — Exit the REPL

Usage:
  python dna_repl.py                     # Interactive mode
  python dna_repl.py --batch script.dna  # Batch mode
  echo "create foo A B C" | python dna_repl.py --stdin

Framework: DNA::}{::lang v51.843
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import traceback
from typing import Any, Callable, Dict, List, Optional, Tuple

import numpy as np

# ── Path Setup ──────────────────────────────────────────────────────

_DNALANG_PATH = os.path.expanduser("~/quantum_workspace")
if _DNALANG_PATH not in sys.path:
    sys.path.insert(0, _DNALANG_PATH)

from dnalang.core.gene import Gene  # noqa: E402
from dnalang.core.genome import Genome  # noqa: E402
from dnalang.core.organism import Organism  # noqa: E402
from dnalang.core.evolution import EvolutionEngine  # noqa: E402
from dnalang.core.mitosis import MitosisOrganism  # noqa: E402
from dnalang.core.symbiosis import (  # noqa: E402
    SymbiosisOrganism,
    SymbiosisType,
)
from dnalang.core.predator_prey import (  # noqa: E402
    PredatorPreyEcosystem,
    EcologicalRole,
)
from dnalang.quantum.constants import (  # noqa: E402
    LAMBDA_PHI,
    THETA_LOCK,
    PHI_THRESHOLD,
    GAMMA_CRITICAL,
    CHI_PC,
)


# ── DNA Gate String Parser ──────────────────────────────────────────

DNA_GATE_MAP = {
    "H": "hadamard",
    "X": "pauli_x",
    "Y": "pauli_y",
    "Z": "pauli_z",
    "C": "cnot",
    "T": "t_gate",
    "S": "s_gate",
    "R": "rotation",
}


def parse_dna_string(dna: str) -> List[Gene]:
    """Convert a DNA gate string into a list of genes.

    Each character in the string maps to a gene with expression
    level derived from the gate's position and type.

    Args:
        dna: DNA gate string (e.g. "HXZCYTCH").

    Returns:
        List of Gene objects.
    """
    genes = []
    for i, char in enumerate(dna.upper()):
        if char not in DNA_GATE_MAP:
            continue
        gate_name = DNA_GATE_MAP[char]
        # Expression level: varies by gate type and position
        base_expr = {
            "H": 0.9, "X": 0.7, "Y": 0.6, "Z": 0.5,
            "C": 0.85, "T": 0.8, "S": 0.75, "R": 0.65,
        }.get(char, 0.5)
        # Add positional variation
        expr = np.clip(base_expr + (i % 5) * 0.02, 0.0, 1.0)
        genes.append(Gene(
            name=f"{gate_name}_{i}",
            expression=float(expr),
            metadata={"gate": char, "position": i},
        ))
    return genes


# ── REPL Engine ─────────────────────────────────────────────────────

class DnaRepl:
    """Interactive DNA-Lang REPL interpreter.

    Manages a collection of organisms and supports creation,
    mutation, evolution, division, bonding, and inspection.
    """

    PROMPT = "🧬 dna> "
    BANNER = (
        "\n╔══════════════════════════════════════════════════════╗\n"
        "║  DNA::}{::lang REPL v51.843                         ║\n"
        "║  Interactive Quantum Organism Interpreter            ║\n"
        "║  Type 'help' for commands, 'quit' to exit           ║\n"
        "╚══════════════════════════════════════════════════════╝\n"
    )

    def __init__(self, seed: Optional[int] = None):
        self.organisms: Dict[str, Organism] = {}
        self.rng = np.random.default_rng(seed)
        self.history: List[str] = []
        self._running = True

        # Command dispatch table
        self.commands: Dict[str, Callable[[List[str]], str]] = {
            "create": self._cmd_create,
            "dna": self._cmd_dna,
            "express": self._cmd_express,
            "mutate": self._cmd_mutate,
            "evolve": self._cmd_evolve,
            "divide": self._cmd_divide,
            "bond": self._cmd_bond,
            "prey": self._cmd_predator_prey,
            "info": self._cmd_info,
            "list": self._cmd_list,
            "metrics": self._cmd_metrics,
            "export": self._cmd_export,
            "help": self._cmd_help,
            "quit": self._cmd_quit,
            "exit": self._cmd_quit,
        }

    # ── Command Handlers ─────────────────────────────────────────────

    def _cmd_create(self, args: List[str]) -> str:
        """create <name> <gene1> [gene2] ... — Create organism with named genes."""
        if len(args) < 2:
            return "Usage: create <name> <gene1> [gene2] ..."
        name = args[0]
        gene_names = args[1:]
        genes = [
            Gene(name=gn, expression=float(self.rng.uniform(0.5, 1.0)))
            for gn in gene_names
        ]
        genome = Genome(genes)
        organism = Organism(
            name=name, genome=genome, lambda_phi=LAMBDA_PHI
        )
        organism.initialize()
        self.organisms[name] = organism
        return f"✅ Created '{name}' with {len(genes)} genes: {', '.join(gene_names)}"

    def _cmd_dna(self, args: List[str]) -> str:
        """dna <name> <sequence> — Create organism from DNA gate string."""
        if len(args) < 2:
            return "Usage: dna <name> <HXZCYTCH...>"
        name = args[0]
        dna_str = args[1].upper()
        genes = parse_dna_string(dna_str)
        if not genes:
            return f"❌ No valid gates in '{dna_str}'. Use: H, X, Y, Z, C, T, S, R"
        genome = Genome(genes)
        organism = Organism(
            name=name, genome=genome, lambda_phi=LAMBDA_PHI
        )
        organism.initialize()
        self.organisms[name] = organism
        return (
            f"✅ Created '{name}' from DNA sequence '{dna_str}' "
            f"({len(genes)} genes)"
        )

    def _cmd_express(self, args: List[str]) -> str:
        """express <name> — Express all genes."""
        if not args:
            return "Usage: express <name>"
        org = self._get_organism(args[0])
        if isinstance(org, str):
            return org
        results = org.genome.express()
        expressed = sum(1 for v in results.values() if v is not None)
        return (
            f"🔬 {org.name}: {expressed}/{len(results)} genes expressed\n"
            + "\n".join(
                f"  {'✓' if v is not None else '·'} {k}: {v}"
                for k, v in results.items()
            )
        )

    def _cmd_mutate(self, args: List[str]) -> str:
        """mutate <name> [rate=0.1] — Mutate organism's genome."""
        if not args:
            return "Usage: mutate <name> [rate]"
        org = self._get_organism(args[0])
        if isinstance(org, str):
            return org
        rate = float(args[1]) if len(args) > 1 else 0.1
        org.genome = org.genome.mutate(mutation_rate=rate)
        return f"🧪 Mutated '{org.name}' at rate {rate}"

    def _cmd_evolve(self, args: List[str]) -> str:
        """evolve <name> [generations=5] — Evolve organism."""
        if not args:
            return "Usage: evolve <name> [generations]"
        org = self._get_organism(args[0])
        if isinstance(org, str):
            return org
        gens = int(args[1]) if len(args) > 1 else 5

        def fitness_fn(o: Organism) -> float:
            exprs = [g.expression for g in o.genome]
            return float(np.mean(exprs))

        engine = EvolutionEngine(population_size=10, mutation_rate=0.15)
        pop = [org]
        for i in range(9):
            m = org.genome.mutate()
            pop.append(Organism(
                name=f"{org.name}_pop{i}",
                genome=m,
                domain=org.domain,
                lambda_phi=org.lambda_phi,
            ))

        final = engine.evolve(pop, fitness_fn, generations=gens)
        best = final[0]
        self.organisms[args[0]] = best
        return (
            f"🧬 Evolved '{args[0]}' for {gens} generations\n"
            f"   Best fitness: {best.genome.fitness:.4f}\n"
            f"   Genes: {len(best.genome)}"
        )

    def _cmd_divide(self, args: List[str]) -> str:
        """divide <name> — Perform mitotic division."""
        if not args:
            return "Usage: divide <name>"
        org = self._get_organism(args[0])
        if isinstance(org, str):
            return org

        # Convert to MitosisOrganism if needed
        if not isinstance(org, MitosisOrganism):
            org = MitosisOrganism(
                name=org.name, genome=org.genome,
                domain=org.domain, purpose=org.purpose,
                lambda_phi=org.lambda_phi,
            )

        if not org.can_divide():
            return f"❌ '{org.name}' cannot divide (need >= 2 genes)"

        a, b = org.divide()
        self.organisms[a.name] = a
        self.organisms[b.name] = b
        return (
            f"🔀 '{org.name}' divided into:\n"
            f"   → '{a.name}' ({len(a.genome)} genes)\n"
            f"   → '{b.name}' ({len(b.genome)} genes)"
        )

    def _cmd_bond(self, args: List[str]) -> str:
        """bond <name1> <name2> — Form symbiotic bond."""
        if len(args) < 2:
            return "Usage: bond <name1> <name2>"
        org1 = self._get_organism(args[0])
        org2 = self._get_organism(args[1])
        if isinstance(org1, str):
            return org1
        if isinstance(org2, str):
            return org2

        # Convert to SymbiosisOrganisms if needed
        if not isinstance(org1, SymbiosisOrganism):
            org1 = SymbiosisOrganism(
                name=org1.name, genome=org1.genome,
                domain=org1.domain, purpose=org1.purpose,
                lambda_phi=org1.lambda_phi,
            )
            self.organisms[args[0]] = org1
        if not isinstance(org2, SymbiosisOrganism):
            org2 = SymbiosisOrganism(
                name=org2.name, genome=org2.genome,
                domain=org2.domain, purpose=org2.purpose,
                lambda_phi=org2.lambda_phi,
            )
            self.organisms[args[1]] = org2

        org1.bond(org2)
        return f"🔗 Bonded '{org1.name}' ↔ '{org2.name}' (mutualism)"

    def _cmd_predator_prey(self, args: List[str]) -> str:
        """prey <predator_names> -- <prey_names> [steps] — Run predator-prey sim."""
        if "--" not in args:
            return "Usage: prey <pred1> [pred2] -- <prey1> [prey2] [steps=10]"
        sep = args.index("--")
        pred_names = args[:sep]
        rest = args[sep + 1:]

        # Check if last arg is a number (steps)
        steps = 10
        prey_names = rest
        if rest and rest[-1].isdigit():
            steps = int(rest[-1])
            prey_names = rest[:-1]

        preds = [self._get_organism(n) for n in pred_names]
        preys = [self._get_organism(n) for n in prey_names]
        for r in preds + preys:
            if isinstance(r, str):
                return r

        eco = PredatorPreyEcosystem(
            predators=preds, prey=preys, seed=51843
        )
        history = eco.simulate(steps=steps)
        last = history[-1] if history else None
        summary = eco.summary()

        return (
            f"🦁 Predator-Prey simulation: {steps} steps\n"
            f"   Final: {summary['final_predators']} predators, "
            f"{summary['final_prey']} prey\n"
            f"   Avg Φ: {last.avg_phi:.4f}" if last else ""
        )

    def _cmd_info(self, args: List[str]) -> str:
        """info <name> — Show organism details."""
        if not args:
            return "Usage: info <name>"
        org = self._get_organism(args[0])
        if isinstance(org, str):
            return org
        lines = [
            f"📋 {org.name} (gen {org.generation})",
            f"   State: {org.state}",
            f"   Domain: {org.domain}",
            f"   Purpose: {org.purpose}",
            f"   λΦ: {org.lambda_phi}",
            f"   Genesis: {org.genesis}",
            f"   Genes ({len(org.genome)}):",
        ]
        for g in org.genome:
            lines.append(f"     {g.name}: {g.expression:.3f}")
        if org.genome.fitness is not None:
            lines.append(f"   Fitness: {org.genome.fitness:.4f}")
        return "\n".join(lines)

    def _cmd_list(self, args: List[str]) -> str:
        """list — List all organisms."""
        if not self.organisms:
            return "No organisms created yet. Use 'create' or 'dna'."
        lines = ["📦 Organisms:"]
        for name, org in self.organisms.items():
            fitness = (
                f", fitness={org.genome.fitness:.3f}"
                if org.genome.fitness is not None
                else ""
            )
            lines.append(
                f"  {name}: {len(org.genome)} genes, "
                f"gen {org.generation}{fitness}"
            )
        return "\n".join(lines)

    def _cmd_metrics(self, args: List[str]) -> str:
        """metrics — Show quantum metrics for all organisms."""
        if not self.organisms:
            return "No organisms."
        lines = [
            f"{'Name':<20} {'Genes':>5} {'Gen':>4} {'Fitness':>8} {'λΦ':>12}",
            "─" * 55,
        ]
        for name, org in self.organisms.items():
            fit = (
                f"{org.genome.fitness:.4f}"
                if org.genome.fitness is not None
                else "  N/A"
            )
            lines.append(
                f"{name:<20} {len(org.genome):>5} {org.generation:>4} "
                f"{fit:>8} {org.lambda_phi:>12.4e}"
            )
        return "\n".join(lines)

    def _cmd_export(self, args: List[str]) -> str:
        """export <name> [file] — Export organism to JSON."""
        if not args:
            return "Usage: export <name> [file.json]"
        org = self._get_organism(args[0])
        if isinstance(org, str):
            return org
        data = org.to_dict()
        if len(args) > 1:
            with open(args[1], "w") as f:
                json.dump(data, f, indent=2)
            return f"📄 Exported '{org.name}' to {args[1]}"
        return json.dumps(data, indent=2)

    def _cmd_help(self, args: List[str]) -> str:
        """help — Show available commands."""
        lines = ["📖 DNA::}{::lang REPL Commands:", ""]
        for name, fn in sorted(self.commands.items()):
            doc = fn.__doc__ or ""
            first_line = doc.strip().split("\n")[0] if doc else ""
            lines.append(f"  {name:<12} {first_line}")
        lines.extend([
            "",
            "Constants:",
            f"  λΦ = {LAMBDA_PHI}  |  θ_lock = {THETA_LOCK}°  |  "
            f"Φ_threshold = {PHI_THRESHOLD}  |  Γ_critical = {GAMMA_CRITICAL}",
        ])
        return "\n".join(lines)

    def _cmd_quit(self, args: List[str]) -> str:
        """quit — Exit the REPL."""
        self._running = False
        return "👋 Goodbye."

    # ── Helpers ──────────────────────────────────────────────────────

    def _get_organism(self, name: str):
        """Get organism by name or return error string."""
        if name not in self.organisms:
            return f"❌ Organism '{name}' not found. Use 'list' to see all."
        return self.organisms[name]

    # ── Execution ────────────────────────────────────────────────────

    def execute(self, line: str) -> str:
        """Parse and execute a single REPL command.

        Args:
            line: Raw input line.

        Returns:
            Output string.
        """
        line = line.strip()
        if not line or line.startswith("#"):
            return ""

        parts = line.split()
        cmd = parts[0].lower()
        args = parts[1:]

        self.history.append(line)

        if cmd in self.commands:
            try:
                return self.commands[cmd](args)
            except Exception as e:
                return f"❌ Error: {e}"
        else:
            return f"❌ Unknown command: '{cmd}'. Type 'help' for commands."

    def run_interactive(self):
        """Run the interactive REPL loop."""
        print(self.BANNER)
        while self._running:
            try:
                line = input(self.PROMPT)
                output = self.execute(line)
                if output:
                    print(output)
            except EOFError:
                break
            except KeyboardInterrupt:
                print("\n(Use 'quit' to exit)")

    def run_batch(self, lines: List[str]) -> List[str]:
        """Execute a batch of commands.

        Args:
            lines: List of command strings.

        Returns:
            List of output strings.
        """
        outputs = []
        for line in lines:
            output = self.execute(line)
            outputs.append(output)
            if not self._running:
                break
        return outputs


# ── CLI Entry Point ──────────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser(
        description="DNA::}{::lang REPL — Interactive Organism Interpreter"
    )
    p.add_argument(
        "--batch", type=str, default=None,
        help="Path to batch script file (.dna or .txt)",
    )
    p.add_argument(
        "--stdin", action="store_true",
        help="Read commands from stdin (pipe mode)",
    )
    p.add_argument(
        "--seed", type=int, default=51843,
        help="Random seed (default: 51843)",
    )
    args = p.parse_args()

    repl = DnaRepl(seed=args.seed)

    if args.batch:
        with open(args.batch) as f:
            lines = [l.strip() for l in f if l.strip() and not l.startswith("#")]
        outputs = repl.run_batch(lines)
        for out in outputs:
            if out:
                print(out)
    elif args.stdin or not sys.stdin.isatty():
        lines = [l.strip() for l in sys.stdin if l.strip() and not l.startswith("#")]
        outputs = repl.run_batch(lines)
        for out in outputs:
            if out:
                print(out)
    else:
        repl.run_interactive()


if __name__ == "__main__":
    main()
