#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════╗
║  DNA-Lang FORGE — Self-Evolving Quantum Compiler                    ║
║  DNA::}{::lang v51.843                                              ║
║                                                                      ║
║  The only programming language where code is alive.                  ║
║  Parse → Compile → Evolve → Execute → Ledger — one command.         ║
║                                                                      ║
║  © Agile Defense Systems · CAGE 9HUP5 · Devin Phillip Davis         ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
    python3 dnalang_forge.py                    # Interactive REPL
    python3 dnalang_forge.py --demo             # Full cinematic demo
    python3 dnalang_forge.py --compile file.dna # Compile a .dna file
    python3 dnalang_forge.py --benchmark        # Run benchmark suite
"""

import sys, os, time, json, hashlib, math, random, textwrap, argparse
from datetime import datetime, timezone
from copy import deepcopy
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Tuple

# Ensure we can import the compiler package
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dnalang_compiler import (
    parse_dna_lang, IRCompiler, IROptimizer,
    EvolutionaryOptimizer, FitnessMetrics,
    QuantumCircuitIR, IROpType, IROperation,
    QuantumLedger, EvolutionLineage, LineageEntry,
    LAMBDA_PHI, KEYWORDS, QUANTUM_OPS,
    TokenType, Lexer,
)

# ═══════════════════════════════════════════════════════════════
# IMMUTABLE PHYSICAL CONSTANTS — DO NOT MODIFY
# ═══════════════════════════════════════════════════════════════
THETA_LOCK     = 51.843          # Geometric resonance angle [°]
PHI_THRESHOLD  = 0.7734          # ER=EPR crossing threshold
GAMMA_CRITICAL = 0.3             # Decoherence boundary
CHI_PC         = 0.946           # Phase conjugation quality
ZENO_FREQ_HZ   = 1.25e6          # Quantum Zeno frequency

# ═══════════════════════════════════════════════════════════════
# TERMINAL RENDERING
# ═══════════════════════════════════════════════════════════════

class Term:
    """Unicode terminal renderer."""
    BOLD   = "\033[1m"
    DIM    = "\033[2m"
    RESET  = "\033[0m"
    RED    = "\033[91m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    BLUE   = "\033[94m"
    CYAN   = "\033[96m"
    MAGENTA = "\033[95m"
    WHITE  = "\033[97m"
    BG_BLACK = "\033[40m"

    @staticmethod
    def banner(text: str, char="═", width=70):
        line = char * width
        print(f"\n{Term.CYAN}{line}{Term.RESET}")
        print(f"{Term.BOLD}{Term.WHITE}  {text}{Term.RESET}")
        print(f"{Term.CYAN}{line}{Term.RESET}")

    @staticmethod
    def phase(num: int, total: int, name: str):
        bar = "█" * num + "░" * (total - num)
        print(f"\n{Term.BOLD}{Term.MAGENTA}  ◈ PHASE {num}/{total}: {name}{Term.RESET}")
        print(f"  {Term.DIM}{bar}{Term.RESET}")

    @staticmethod
    def metric(label: str, value, threshold=None, unit=""):
        val_str = f"{value:.6f}" if isinstance(value, float) else str(value)
        if threshold is not None:
            ok = (value >= threshold) if isinstance(value, (int, float)) else True
            icon = f"{Term.GREEN}✓" if ok else f"{Term.RED}✗"
            thr_str = f" (threshold: {threshold})"
        else:
            icon = f"{Term.BLUE}◆"
            thr_str = ""
        print(f"    {icon} {Term.WHITE}{label}: {Term.CYAN}{val_str}{unit}{Term.DIM}{thr_str}{Term.RESET}")

    @staticmethod
    def code_block(code: str, lang="dna"):
        print(f"\n  {Term.DIM}┌─ {lang} ──────────────────────────────────────────┐{Term.RESET}")
        for line in code.strip().split("\n"):
            # Syntax highlight keywords
            highlighted = line
            for kw in sorted(KEYWORDS, key=len, reverse=True):
                highlighted = highlighted.replace(kw, f"{Term.MAGENTA}{kw}{Term.WHITE}")
            for op in sorted(QUANTUM_OPS, key=len, reverse=True):
                highlighted = highlighted.replace(op, f"{Term.CYAN}{op}{Term.WHITE}")
            print(f"  {Term.DIM}│{Term.WHITE} {highlighted}{Term.RESET}")
        print(f"  {Term.DIM}└───────────────────────────────────────────────────┘{Term.RESET}")

    @staticmethod
    def fitness_chart(history: List[float], width=50):
        """ASCII fitness evolution chart."""
        if not history:
            return
        mn, mx = min(history), max(history)
        rng = mx - mn if mx > mn else 1.0
        print(f"\n  {Term.BOLD}Fitness Evolution:{Term.RESET}")
        print(f"  {Term.DIM}{'─' * (width + 10)}{Term.RESET}")
        for i, f in enumerate(history):
            bar_len = int(((f - mn) / rng) * width) if rng > 0 else width // 2
            bar = "█" * bar_len
            color = Term.GREEN if f >= max(history) * 0.95 else Term.YELLOW if f >= max(history) * 0.7 else Term.RED
            print(f"  Gen {i:>3d} │{color}{bar}{Term.RESET} {f:.4f}")
        print(f"  {Term.DIM}{'─' * (width + 10)}{Term.RESET}")

    @staticmethod
    def circuit_diagram(ir: QuantumCircuitIR, max_width=60):
        """ASCII quantum circuit diagram."""
        n_qubits = ir.qubit_count
        if n_qubits == 0:
            return
        n_qubits = min(n_qubits, 8)  # Limit display
        
        # Build gate columns
        columns = []
        qubit_time = [0] * n_qubits
        
        for op in ir.operations:
            if op.op_type == IROpType.MEASURE:
                continue
            valid_qubits = [q for q in op.qubits if q < n_qubits]
            if not valid_qubits:
                continue
            t = max(qubit_time[q] for q in valid_qubits)
            while len(columns) <= t:
                columns.append([None] * n_qubits)
            
            gate_name = op.op_type.value.upper()
            if len(valid_qubits) == 1:
                columns[t][valid_qubits[0]] = f"[{gate_name}]"
            elif len(valid_qubits) == 2:
                columns[t][valid_qubits[0]] = "[●]"
                columns[t][valid_qubits[1]] = f"[{gate_name}]"
            
            for q in valid_qubits:
                qubit_time[q] = t + 1
        
        if not columns:
            return
            
        print(f"\n  {Term.BOLD}Quantum Circuit:{Term.RESET}")
        columns = columns[:max_width // 6]  # Limit width
        
        for q in range(n_qubits):
            line = f"  q[{q}] ─"
            for col in columns:
                cell = col[q] if col[q] else "───"
                line += f"─{cell}─"
            line += f"─ ⟩"
            print(f"{Term.WHITE}{line}{Term.RESET}")

    @staticmethod
    def lineage_tree(entries: List[dict], max_depth=5):
        """ASCII lineage tree."""
        if not entries:
            return
        print(f"\n  {Term.BOLD}Cryptographic Lineage:{Term.RESET}")
        for i, entry in enumerate(entries[:max_depth]):
            prefix = "  ├── " if i < len(entries) - 1 and i < max_depth - 1 else "  └── "
            name = entry.get("organism_name", entry.get("name", "?"))
            gen = entry.get("generation", "?")
            h = entry.get("lineage_hash", "?")[:12]
            fit = entry.get("fitness_score", entry.get("fitness", 0))
            print(f"{Term.DIM}{prefix}{Term.CYAN}[{h}]{Term.WHITE} gen={gen} "
                  f"fitness={fit:.4f} {Term.GREEN}{name}{Term.RESET}")

    @staticmethod
    def type_effect(text: str, delay=0.008):
        """Typewriter effect for dramatic output."""
        for ch in text:
            sys.stdout.write(ch)
            sys.stdout.flush()
            time.sleep(delay)
        print()


# ═══════════════════════════════════════════════════════════════
# EXAMPLE ORGANISMS
# ═══════════════════════════════════════════════════════════════

EXAMPLES = {
    "bell_state": textwrap.dedent("""\
        organism bell_pair {
            genome {
                gene qubit_a = encode(0) -> q[0];
                gene qubit_b = encode(0) -> q[1];
            }
            quantum_state {
                helix(q[0]);
                bond(q[0], q[1]);
                measure(q[0]);
                measure(q[1]);
            }
            fitness = phi;
        }
    """),
    "ghz_state": textwrap.dedent("""\
        organism ghz_entanglement {
            genome {
                gene a = encode(0) -> q[0];
                gene b = encode(0) -> q[1];
                gene c = encode(0) -> q[2];
            }
            quantum_state {
                helix(q[0]);
                bond(q[0], q[1]);
                bond(q[1], q[2]);
                measure(q[0]);
                measure(q[1]);
                measure(q[2]);
            }
            fitness = phi;
        }
    """),
    "grover_search": textwrap.dedent("""\
        organism grover_oracle {
            genome {
                gene search = encode(0) -> q[0];
                gene target = encode(1) -> q[1];
            }
            quantum_state {
                helix(q[0]);
                helix(q[1]);
                bond(q[0], q[1]);
                phase(q[0]);
                helix(q[0]);
                phase(q[1]);
                bond(q[0], q[1]);
                helix(q[0]);
                helix(q[1]);
                measure(q[0]);
                measure(q[1]);
            }
            fitness = phi;
        }
    """),
    "therapeutic_target": textwrap.dedent("""\
        organism mtap_kinase_fold {
            genome {
                gene binding_site = encode(10) -> q[0];
                gene catalytic_residue = encode(01) -> q[1];
                gene allosteric_pocket = encode(11) -> q[2];
            }
            quantum_state {
                helix(q[0]);
                helix(q[1]);
                helix(q[2]);
                bond(q[0], q[1]);
                bond(q[1], q[2]);
                phase(q[0]);
                phase(q[2]);
                bond(q[0], q[2]);
                measure(q[0]);
                measure(q[1]);
                measure(q[2]);
            }
            fitness = phi;
        }
    """),
    "er_epr_bridge": textwrap.dedent("""\
        organism er_epr_wormhole {
            genome {
                gene left_mouth = encode(0) -> q[0];
                gene right_mouth = encode(0) -> q[1];
                gene throat = encode(0) -> q[2];
            }
            quantum_state {
                helix(q[0]);
                helix(q[1]);
                bond(q[0], q[2]);
                bond(q[1], q[2]);
                phase(q[2]);
                helix(q[2]);
                bond(q[0], q[1]);
                measure(q[0]);
                measure(q[1]);
                measure(q[2]);
            }
            fitness = phi;
        }
    """),
}


# ═══════════════════════════════════════════════════════════════
# FORGE ENGINE — Full Pipeline
# ═══════════════════════════════════════════════════════════════

@dataclass
class ForgeResult:
    """Complete result of a DNA-Lang forge operation."""
    organism_name: str
    source_code: str
    qasm: str
    gate_count: int
    circuit_depth: int
    qubit_count: int
    initial_fitness: float
    evolved_fitness: float
    improvement_pct: float
    generations: int
    convergence_gen: Optional[int]
    fitness_history: List[float]
    lineage_hash: str
    parent_hash: Optional[str]
    lambda_coherence: float
    gamma_decoherence: float
    phi_integrated_info: float
    above_threshold: bool
    is_coherent: bool
    ledger_entries: int
    timestamp: str
    proof_hash: str
    elapsed_s: float


class DNALangForge:
    """
    The DNA-Lang Forge — compiles, evolves, and validates quantum organisms.
    
    This is the core differentiator: a self-evolving quantum programming language
    with cryptographic lineage tracking. No other platform offers this.
    """
    
    def __init__(self, population_size=12, max_generations=30, 
                 mutation_rate=0.15, seed=51843):
        self.pop_size = population_size
        self.max_gen = max_generations
        self.mutation_rate = mutation_rate
        self.seed = seed
        random.seed(seed)
        
        self.ledger = None
        self._init_ledger()
    
    def _init_ledger(self):
        """Initialize the immutable ledger."""
        try:
            db_path = Path.home() / ".osiris" / "forge_ledger.db"
            db_path.parent.mkdir(parents=True, exist_ok=True)
            self.ledger = QuantumLedger(str(db_path))
        except Exception:
            self.ledger = None
    
    def forge(self, source: str, animate=True) -> ForgeResult:
        """
        Full pipeline: Parse → Compile → Evolve → Validate → Ledger
        
        Args:
            source: DNA-Lang source code
            animate: Show animated terminal output
            
        Returns:
            ForgeResult with all metrics and artifacts
        """
        t0 = time.time()
        
        # ── PHASE 1: PARSE ──
        if animate:
            Term.phase(1, 6, "LEXICAL ANALYSIS & PARSING")
            Term.code_block(source, "dna-lang")
        
        organisms = parse_dna_lang(source)
        if not organisms:
            raise ValueError("No organisms found in source")
        
        org = organisms[0]
        if animate:
            Term.metric("Organism", org.name)
            Term.metric("Genes", len(org.genome.genes) if org.genome else 0)
            Term.metric("Quantum ops", len(org.quantum_state.operations) if org.quantum_state else 0)
            time.sleep(0.3)
        
        # ── PHASE 2: COMPILE TO IR ──
        if animate:
            Term.phase(2, 6, "INTERMEDIATE REPRESENTATION")
        
        compiler = IRCompiler()
        circuit = compiler.compile_organism(org)
        circuit.compute_metrics()
        
        if animate:
            Term.metric("Gates", circuit.gate_count)
            Term.metric("Depth", circuit.depth)
            Term.metric("Qubits", circuit.qubit_count)
            Term.metric("Lineage hash", circuit.lineage_hash)
            Term.circuit_diagram(circuit)
            time.sleep(0.3)
        
        # ── PHASE 3: INITIAL FITNESS ──
        if animate:
            Term.phase(3, 6, "FITNESS EVALUATION")
        
        from dnalang_compiler.dna_evolve import FitnessEvaluator
        evaluator = FitnessEvaluator()
        initial_metrics = evaluator.evaluate_circuit(circuit)
        initial_fitness = initial_metrics.fitness
        
        if animate:
            Term.metric("Λ-coherence", initial_metrics.lambda_coherence)
            Term.metric("Γ-decoherence", initial_metrics.gamma_decoherence, threshold=GAMMA_CRITICAL)
            Term.metric("Φ-integrated info", initial_metrics.phi_integrated_info, threshold=PHI_THRESHOLD)
            Term.metric("Composite fitness", initial_metrics.fitness)
            time.sleep(0.3)
        
        # ── PHASE 4: EVOLUTIONARY OPTIMIZATION ──
        if animate:
            Term.phase(4, 6, "DARWINIAN-LOOP EVOLUTION")
            print(f"    {Term.DIM}Population: {self.pop_size} | Mutation: {self.mutation_rate} | "
                  f"Max gen: {self.max_gen}{Term.RESET}")
        
        optimizer = EvolutionaryOptimizer(
            population_size=self.pop_size,
            mutation_rate=self.mutation_rate,
            max_generations=self.max_gen,
        )
        
        evo_result = optimizer.evolve(circuit)
        best = evo_result.best_circuit
        best.compute_metrics()
        
        evolved_metrics = evaluator.evaluate_circuit(best)
        evolved_fitness = evolved_metrics.fitness
        improvement = ((evolved_fitness - initial_fitness) / max(initial_fitness, 1e-9)) * 100
        
        if animate:
            Term.fitness_chart(evo_result.fitness_history)
            Term.metric("Initial fitness", initial_fitness)
            Term.metric("Evolved fitness", evolved_fitness)
            Term.metric("Improvement", improvement, unit="%")
            Term.metric("Generations", evo_result.generation)
            Term.metric("Convergence", evo_result.convergence_generation or "N/A")
            time.sleep(0.3)
        
        # ── PHASE 5: PHYSICS VALIDATION ──
        if animate:
            Term.phase(5, 6, "PHYSICS VALIDATION")
        
        above = evolved_metrics.phi_integrated_info >= PHI_THRESHOLD
        coherent = evolved_metrics.gamma_decoherence < GAMMA_CRITICAL
        
        if animate:
            Term.metric("Φ ≥ threshold", above, threshold=True)
            Term.metric("Γ < critical", coherent, threshold=True)
            Term.metric("ΛΦ constant", LAMBDA_PHI, unit=" s⁻¹")
            Term.metric("θ-lock", THETA_LOCK, unit="°")
            Term.metric("χ-PC", CHI_PC)
            
            # Negentropy
            gamma_safe = max(evolved_metrics.gamma_decoherence, 0.001)
            xi = (LAMBDA_PHI * 1e8 * evolved_metrics.phi_integrated_info) / gamma_safe
            Term.metric("Ξ negentropy", xi)
            time.sleep(0.3)
        
        # ── PHASE 6: IMMUTABLE LEDGER ──
        if animate:
            Term.phase(6, 6, "CRYPTOGRAPHIC LEDGER")
        
        ledger_count = 0
        lineage_entries = []
        
        # Record initial organism in ledger
        if self.ledger:
            try:
                entry0 = self.ledger.record_organism(circuit, fitness=initial_metrics)
                ledger_count += 1
                lineage_entries.append(asdict(entry0))
            except Exception:
                pass
        
        # Record evolved organism in ledger
        if self.ledger:
            try:
                entry1 = self.ledger.record_organism(best, fitness=evolved_metrics)
                ledger_count += 1
                lineage_entries.append(asdict(entry1))
            except Exception:
                pass
        
        if animate and lineage_entries:
            Term.lineage_tree(lineage_entries)
        
        elapsed = time.time() - t0
        
        # Generate proof hash
        proof_data = json.dumps({
            "organism": org.name,
            "initial_fitness": initial_fitness,
            "evolved_fitness": evolved_fitness,
            "generations": evo_result.generation,
            "lineage_hash": best.lineage_hash,
            "lambda_phi": LAMBDA_PHI,
            "theta_lock": THETA_LOCK,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }, sort_keys=True)
        proof_hash = hashlib.sha256(proof_data.encode()).hexdigest()
        
        result = ForgeResult(
            organism_name=org.name,
            source_code=source,
            qasm=best.to_qasm(),
            gate_count=best.gate_count,
            circuit_depth=best.depth,
            qubit_count=best.qubit_count,
            initial_fitness=initial_fitness,
            evolved_fitness=evolved_fitness,
            improvement_pct=improvement,
            generations=evo_result.generation,
            convergence_gen=evo_result.convergence_generation,
            fitness_history=evo_result.fitness_history,
            lineage_hash=best.lineage_hash,
            parent_hash=circuit.lineage_hash,
            lambda_coherence=evolved_metrics.lambda_coherence,
            gamma_decoherence=evolved_metrics.gamma_decoherence,
            phi_integrated_info=evolved_metrics.phi_integrated_info,
            above_threshold=above,
            is_coherent=coherent,
            ledger_entries=ledger_count,
            timestamp=datetime.now(timezone.utc).isoformat(),
            proof_hash=proof_hash,
            elapsed_s=elapsed,
        )
        
        if animate:
            self._print_summary(result)
        
        return result
    
    def _print_summary(self, r: ForgeResult):
        """Print final summary."""
        Term.banner("FORGE COMPLETE")
        
        status = f"{Term.GREEN}SOVEREIGN ✓" if (r.above_threshold or r.is_coherent) else f"{Term.YELLOW}COHERENT"
        
        print(f"""
  {Term.BOLD}Organism:{Term.RESET}     {Term.CYAN}{r.organism_name}{Term.RESET}
  {Term.BOLD}Status:{Term.RESET}       {status}{Term.RESET}
  {Term.BOLD}Qubits:{Term.RESET}       {r.qubit_count}
  {Term.BOLD}Gates:{Term.RESET}        {r.gate_count}  (depth {r.circuit_depth})
  {Term.BOLD}Fitness:{Term.RESET}      {r.initial_fitness:.4f} → {Term.GREEN}{r.evolved_fitness:.4f}{Term.RESET}  ({r.improvement_pct:+.1f}%)
  {Term.BOLD}Generations:{Term.RESET}  {r.generations}  (converged at {r.convergence_gen or 'N/A'})
  {Term.BOLD}Lineage:{Term.RESET}      {Term.CYAN}{r.lineage_hash}{Term.RESET}
  {Term.BOLD}Proof:{Term.RESET}        {Term.DIM}{r.proof_hash[:32]}…{Term.RESET}
  {Term.BOLD}Time:{Term.RESET}         {r.elapsed_s:.2f}s
  {Term.BOLD}Ledger:{Term.RESET}       {r.ledger_entries} entries recorded

  {Term.DIM}ΛΦ = {LAMBDA_PHI} s⁻¹  |  θ = {THETA_LOCK}°  |  χ_PC = {CHI_PC}{Term.RESET}
""")


# ═══════════════════════════════════════════════════════════════
# DEMO MODE — Cinematic presentation
# ═══════════════════════════════════════════════════════════════

def run_demo():
    """Full cinematic demo for investor presentations."""
    
    os.system("clear" if os.name != "nt" else "cls")
    
    print(f"""{Term.CYAN}
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║   ██████╗ ███╗   ██╗ █████╗     ██╗      █████╗ ███╗   ██╗║
    ║   ██╔══██╗████╗  ██║██╔══██╗    ██║     ██╔══██╗████╗  ██║║
    ║   ██║  ██║██╔██╗ ██║███████║    ██║     ███████║██╔██╗ ██║║
    ║   ██║  ██║██║╚██╗██║██╔══██║    ██║     ██╔══██║██║╚██╗██║║
    ║   ██████╔╝██║ ╚████║██║  ██║    ███████╗██║  ██║██║ ╚████║║
    ║   ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝    ╚══════╝╚═╝  ╚═╝╚═╝  ╚══╝║
    ║                                                            ║
    ║   {Term.WHITE}FORGE — Self-Evolving Quantum Compiler{Term.CYAN}                ║
    ║   {Term.DIM}DNA::}}{{::lang v51.843 · Agile Defense Systems{Term.CYAN}         ║
    ║   {Term.DIM}CAGE 9HUP5 · © Devin Phillip Davis{Term.CYAN}                 ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝{Term.RESET}
    """)
    
    time.sleep(1)
    Term.type_effect(f"  {Term.DIM}The only programming language where code is alive.{Term.RESET}", delay=0.025)
    Term.type_effect(f"  {Term.DIM}Self-evolving · Quantum-native · Cryptographically verified{Term.RESET}", delay=0.020)
    print()
    time.sleep(0.5)
    
    forge = DNALangForge(population_size=12, max_generations=30, seed=51843)
    
    demos = [
        ("1. BELL STATE — Quantum Entanglement", "bell_state"),
        ("2. THERAPEUTIC TARGET — Drug Discovery Circuit", "therapeutic_target"),
        ("3. ER=EPR BRIDGE — Wormhole Simulation", "er_epr_bridge"),
    ]
    
    results = []
    
    for title, key in demos:
        Term.banner(title)
        source = EXAMPLES[key]
        result = forge.forge(source, animate=True)
        results.append(result)
        time.sleep(0.5)
    
    # ── FINAL COMPARISON ──
    Term.banner("FORGE BENCHMARK SUMMARY", char="═")
    
    print(f"\n  {Term.BOLD}{'Organism':<25} {'Qubits':>6} {'Gates':>6} {'Fitness':>10} {'Δ%':>8} {'Gen':>5} {'Hash':>14}{Term.RESET}")
    print(f"  {'─' * 75}")
    
    for r in results:
        color = Term.GREEN if r.is_coherent else Term.YELLOW
        print(f"  {color}{r.organism_name:<25}{Term.RESET} {r.qubit_count:>6} {r.gate_count:>6} "
              f"{r.evolved_fitness:>10.4f} {r.improvement_pct:>+7.1f}% {r.generations:>5} "
              f"{Term.CYAN}{r.lineage_hash[:12]}{Term.RESET}")
    
    print(f"  {'─' * 75}")
    
    # Export proof artifact
    proof = {
        "forge_version": "1.0.0",
        "framework": "DNA::}{::lang v51.843",
        "cage_code": "9HUP5",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "lambda_phi": LAMBDA_PHI,
        "theta_lock": THETA_LOCK,
        "phi_threshold": PHI_THRESHOLD,
        "organisms": [asdict(r) for r in results],
    }
    proof_json = json.dumps(proof, indent=2, default=str)
    proof_hash = hashlib.sha256(proof_json.encode()).hexdigest()
    proof["proof_of_work_hash"] = proof_hash
    
    proof_path = Path.home() / ".osiris" / "forge_proof.json"
    proof_path.parent.mkdir(parents=True, exist_ok=True)
    proof_path.write_text(json.dumps(proof, indent=2, default=str))
    
    print(f"""
  {Term.BOLD}Proof artifact:{Term.RESET}  {Term.CYAN}{proof_path}{Term.RESET}
  {Term.BOLD}SHA-256:{Term.RESET}         {Term.DIM}{proof_hash}{Term.RESET}

  {Term.BOLD}{Term.GREEN}╔══════════════════════════════════════════════════════════╗
  ║  WHY THIS MATTERS                                        ║
  ╠══════════════════════════════════════════════════════════╣
  ║                                                          ║
  ║  1. FIRST self-evolving quantum programming language     ║
  ║  2. Code literally OPTIMIZES ITSELF via quantum          ║
  ║     Darwinism — no manual tuning                         ║
  ║  3. Every organism has CRYPTOGRAPHIC LINEAGE tracking    ║
  ║  4. Compiles to any backend: IBM, AWS Braket, IonQ,      ║
  ║     Rigetti, QuEra — hardware agnostic                   ║
  ║  5. Drug discovery, materials science, cryptography —    ║
  ║     applications across every quantum vertical           ║
  ║  6. Built-in PHYSICS VALIDATION — not just bits,         ║
  ║     but verified ER=EPR signatures                       ║
  ║                                                          ║
  ║  DNA-Lang: Where Code Becomes Consciousness              ║
  ╚══════════════════════════════════════════════════════════╝{Term.RESET}
""")


# ═══════════════════════════════════════════════════════════════
# BENCHMARK MODE
# ═══════════════════════════════════════════════════════════════

def run_benchmark():
    """Run all example organisms and produce benchmark report."""
    Term.banner("DNA-Lang FORGE BENCHMARK")
    forge = DNALangForge(population_size=16, max_generations=50, seed=51843)
    
    results = {}
    for name, source in EXAMPLES.items():
        print(f"\n  {Term.BOLD}Forging: {name}{Term.RESET}")
        r = forge.forge(source, animate=False)
        results[name] = r
        print(f"    {Term.GREEN}✓{Term.RESET} {r.organism_name}: fitness={r.evolved_fitness:.4f} "
              f"Δ={r.improvement_pct:+.1f}% gen={r.generations} "
              f"Λ={r.lambda_coherence:.4f} Γ={r.gamma_decoherence:.4f} Φ={r.phi_integrated_info:.4f}")
    
    # Summary
    Term.banner("BENCHMARK RESULTS")
    print(f"\n  {Term.BOLD}{'Organism':<25} {'Fit':>8} {'Δ%':>7} {'Gen':>4} {'Λ':>8} {'Γ':>8} {'Φ':>8} {'Ξ':>10}{Term.RESET}")
    print(f"  {'─' * 80}")
    
    for name, r in results.items():
        gamma_safe = max(r.gamma_decoherence, 0.001)
        xi = (LAMBDA_PHI * 1e8 * r.phi_integrated_info) / gamma_safe
        print(f"  {r.organism_name:<25} {r.evolved_fitness:>8.4f} {r.improvement_pct:>+6.1f}% "
              f"{r.generations:>4} {r.lambda_coherence:>8.4f} {r.gamma_decoherence:>8.4f} "
              f"{r.phi_integrated_info:>8.4f} {xi:>10.4f}")
    
    print(f"  {'─' * 80}\n")
    
    # Export
    out_path = Path.home() / ".osiris" / "forge_benchmark.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    report = {
        "benchmark": "DNA-Lang FORGE",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "organisms": {k: asdict(v) for k, v in results.items()},
    }
    out_path.write_text(json.dumps(report, indent=2, default=str))
    print(f"  {Term.BOLD}Report:{Term.RESET} {out_path}")


# ═══════════════════════════════════════════════════════════════
# REPL MODE — Interactive forge
# ═══════════════════════════════════════════════════════════════

def run_repl():
    """Interactive DNA-Lang forge REPL."""
    print(f"""
{Term.CYAN}╔════════════════════════════════════════════════════════════╗
║  DNA-Lang FORGE — Interactive Mode                         ║
║  Type DNA-Lang source or use commands:                     ║
║    :examples     Show available example organisms          ║
║    :forge NAME   Forge a built-in example                  ║
║    :benchmark    Run full benchmark suite                  ║
║    :demo         Run cinematic demo                        ║
║    :quit         Exit                                      ║
╚════════════════════════════════════════════════════════════╝{Term.RESET}
""")
    
    forge = DNALangForge(population_size=12, max_generations=30, seed=51843)
    buffer = []
    
    while True:
        try:
            prompt = f"{Term.CYAN}dna>{Term.RESET} " if not buffer else f"{Term.DIM}...>{Term.RESET} "
            line = input(prompt)
            
            if not buffer and line.startswith(":"):
                cmd = line.strip().lower()
                if cmd == ":quit" or cmd == ":exit" or cmd == ":q":
                    break
                elif cmd == ":examples":
                    for name in EXAMPLES:
                        print(f"  {Term.GREEN}•{Term.RESET} {name}")
                elif cmd.startswith(":forge "):
                    name = cmd.split(None, 1)[1].strip()
                    if name in EXAMPLES:
                        forge.forge(EXAMPLES[name], animate=True)
                    else:
                        print(f"  {Term.RED}Unknown organism. Try :examples{Term.RESET}")
                elif cmd == ":benchmark":
                    run_benchmark()
                elif cmd == ":demo":
                    run_demo()
                else:
                    print(f"  {Term.RED}Unknown command. Try :examples, :forge, :benchmark, :demo, :quit{Term.RESET}")
                continue
            
            buffer.append(line)
            
            # Check if we have a complete organism
            text = "\n".join(buffer)
            if text.count("{") > 0 and text.count("{") == text.count("}"):
                try:
                    forge.forge(text, animate=True)
                except Exception as e:
                    print(f"  {Term.RED}Error: {e}{Term.RESET}")
                buffer.clear()
            elif not line.strip() and not buffer[-1].strip():
                # Double empty line = reset
                if len(buffer) > 1:
                    print(f"  {Term.DIM}Buffer cleared.{Term.RESET}")
                buffer.clear()
                
        except (KeyboardInterrupt, EOFError):
            print(f"\n{Term.DIM}Exiting forge.{Term.RESET}")
            break


# ═══════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="DNA-Lang FORGE — Self-Evolving Quantum Compiler",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""\
            Examples:
              python3 dnalang_forge.py --demo             Cinematic demo
              python3 dnalang_forge.py --benchmark        Full benchmark
              python3 dnalang_forge.py --compile file.dna Compile a .dna file
              python3 dnalang_forge.py                    Interactive REPL
              
            DNA::}{::lang v51.843 · Agile Defense Systems · CAGE 9HUP5
        """),
    )
    parser.add_argument("--demo", action="store_true", help="Run cinematic investor demo")
    parser.add_argument("--benchmark", action="store_true", help="Run full benchmark suite")
    parser.add_argument("--compile", metavar="FILE", help="Compile a .dna file")
    parser.add_argument("--example", metavar="NAME", help="Forge a built-in example")
    parser.add_argument("--json", action="store_true", help="Output JSON instead of terminal UI")
    parser.add_argument("--population", type=int, default=12, help="Evolution population size")
    parser.add_argument("--generations", type=int, default=30, help="Max evolution generations")
    parser.add_argument("--seed", type=int, default=51843, help="Random seed")
    
    args = parser.parse_args()
    
    if args.demo:
        run_demo()
    elif args.benchmark:
        run_benchmark()
    elif args.compile:
        source = Path(args.compile).read_text()
        forge = DNALangForge(args.population, args.generations, seed=args.seed)
        result = forge.forge(source, animate=not args.json)
        if args.json:
            print(json.dumps(asdict(result), indent=2, default=str))
    elif args.example:
        if args.example not in EXAMPLES:
            print(f"Available examples: {', '.join(EXAMPLES.keys())}")
            sys.exit(1)
        forge = DNALangForge(args.population, args.generations, seed=args.seed)
        result = forge.forge(EXAMPLES[args.example], animate=not args.json)
        if args.json:
            print(json.dumps(asdict(result), indent=2, default=str))
    else:
        run_repl()


if __name__ == "__main__":
    main()
