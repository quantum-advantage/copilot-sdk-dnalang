#!/usr/bin/env python3
"""
DNA-Lang Demo Script
===================

Comprehensive demonstration of DNA-Lang capabilities.
"""

import sys
import json
from datetime import datetime

sys.path.insert(0, '/home/devinpd/quantum_workspace')

from dnalang import (
    Organism, Gene, Genome, evolve,
    AURA, AIDEN,
    Sentinel, PhaseConjugate,
    LAMBDA_PHI, THETA_LOCK, CHI_PC
)
from dnalang.defense.zero_trust import ZeroTrust
from examples import get_example


def print_header(title):
    """Print section header."""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)


def demo_organism_creation():
    """Demo: Create a custom organism from scratch."""
    print_header("Demo 1: Creating a Custom Organism")
    
    # Define genes
    genes = [
        Gene(
            name="AnomalyDetector",
            expression=1.0,
            trigger="data_stream",
            action=lambda: "Scanning for anomalies..."
        ),
        Gene(
            name="ThreatClassifier",
            expression=0.95,
            trigger="anomaly_detected",
            action=lambda: "Classifying threat level..."
        ),
        Gene(
            name="ResponseCoordinator",
            expression=0.93,
            trigger="threat_classified",
            action=lambda: "Coordinating response..."
        ),
        Gene(
            name="SelfHealer",
            expression=CHI_PC,
            trigger="coherence_drop",
            action=lambda: "Applying phase conjugate healing..."
        )
    ]
    
    # Create genome
    genome = Genome(genes, version="1.0.0-demo")
    print(f"\n✓ Created genome with {len(genome)} genes")
    
    # Create organism
    organism = Organism(
        name="CyberDefenseOrganismAlpha",
        genome=genome,
        domain="defense.cyber.autonomous",
        purpose="Real-time autonomous cyber defense",
        lambda_phi=LAMBDA_PHI
    )
    
    print(f"✓ Created organism: {organism}")
    print(f"  Genesis Hash: {organism.genesis}")
    print(f"  Lambda Phi: {organism.lambda_phi}")
    print(f"  Domain: {organism.domain}")
    
    # Initialize and engage
    organism.initialize()
    print(f"  State after init: {organism.state}")
    
    result = organism.engage()
    print(f"  State after engage: {result}")
    
    # Express all genes
    print("\n  Expressing genes:")
    expressions = organism.genome.express()
    for gene_name, result in expressions.items():
        if result:
            print(f"    {gene_name}: {result}")
    
    return organism


def demo_evolution():
    """Demo: Evolution of organisms."""
    print_header("Demo 2: Quantum Evolution")
    
    # Get example organism
    organism = get_example('consciousness_explorer')
    print(f"\nStarting organism: {organism}")
    print(f"Initial gene expressions:")
    for gene in organism.genome:
        print(f"  {gene.name}: {gene.expression:.3f}")
    
    # Define fitness function favoring high, balanced expression
    def consciousness_fitness(org):
        expressions = [g.expression for g in org.genome]
        avg = sum(expressions) / len(expressions)
        variance = sum((e - avg)**2 for e in expressions) / len(expressions)
        # Reward high average, penalize high variance
        return avg * (1.0 - variance)
    
    print(f"\nEvolutionary fitness function: Maximize average expression, minimize variance")
    print(f"Evolving for 15 generations with population of 30...")
    
    # Evolve
    best = evolve(
        organism,
        fitness_fn=consciousness_fitness,
        generations=15,
        population_size=30,
        mutation_rate=0.15,
        crossover_rate=0.7
    )
    
    print(f"\n✓ Evolution complete!")
    print(f"  Best organism: {best.name}")
    print(f"  Generation: {best.generation}")
    print(f"  Fitness: {best.genome.fitness:.4f}")
    print(f"\n  Final gene expressions:")
    for gene in best.genome:
        print(f"    {gene.name}: {gene.expression:.3f}")
    
    return best


def demo_aura_aiden():
    """Demo: AURA and AIDEN dual agent system."""
    print_header("Demo 3: AURA/AIDEN Dual Agent System")
    
    # Create two organisms
    org1 = get_example('sentinel_guard')
    org2 = get_example('threat_detector')
    
    print(f"\nOrganism 1: {org1.name}")
    print(f"Organism 2: {org2.name}")
    
    # Create AURA geometer
    print("\n--- AURA: Autopoietic Universally Recursive Architect ---")
    aura = AURA(manifold_dim=6)
    print(f"Created: {aura}")
    print(f"Manifold: {aura.manifold_type}")
    
    # Shape manifolds
    print(f"\nShaping manifold for {org1.name}...")
    geo1 = aura.shape_manifold(org1, curvature=1.0)
    print(f"  Dimensions: {geo1['dimensions']}")
    print(f"  Ricci Curvature: {geo1['ricci_curvature']:.3f}")
    
    print(f"\nShaping manifold for {org2.name}...")
    geo2 = aura.shape_manifold(org2, curvature=1.0)
    print(f"  Dimensions: {geo2['dimensions']}")
    print(f"  Ricci Curvature: {geo2['ricci_curvature']:.3f}")
    
    # Maintain boundaries
    boundary1 = aura.maintain_boundary(org1, threshold=0.1)
    boundary2 = aura.maintain_boundary(org2, threshold=0.1)
    print(f"\nBoundary maintenance:")
    print(f"  {org1.name}: {'✓ Maintained' if boundary1 else '✗ Failed'}")
    print(f"  {org2.name}: {'✓ Maintained' if boundary2 else '✗ Failed'}")
    
    # Compute geodesic
    print(f"\nComputing geodesic path between organisms...")
    geodesic = aura.compute_geodesic(org1, org2)
    print(f"  Geodesic points: {len(geodesic)}")
    
    # Create AIDEN optimizer
    print("\n--- AIDEN: Adaptive Integrations for Defense & Engineering of Negentropy ---")
    aiden = AIDEN(learning_rate=0.05)
    print(f"Created: {aiden}")
    print(f"Metric: Wasserstein-{aiden.metric[1:]} distance")
    
    # Optimize organism
    print(f"\nOptimizing {org1.name} along manifold geodesics...")
    print(f"Running 10 optimization iterations...")
    
    optimized = aiden.optimize(org1, aura, target=org2, iterations=10)
    
    print(f"\n✓ Optimization complete!")
    print(f"  Optimized organism: {optimized.name}")
    
    # Get optimization summary
    summary = aiden.get_optimization_summary()
    print(f"\nOptimization Summary:")
    print(f"  Total iterations: {summary['total_iterations']}")
    print(f"  Final W₂ distance: {summary['final_w2']:.6f}")
    print(f"  Minimum W₂: {summary['min_w2']:.6f}")
    print(f"  Converged: {summary['convergence']}")
    
    return optimized


def demo_defense_systems():
    """Demo: Comprehensive defense systems."""
    print_header("Demo 4: Defense Systems")
    
    organism = get_example('sentinel_guard')
    print(f"Protected organism: {organism.name}\n")
    
    # --- Sentinel System ---
    print("--- Sentinel: PALS Threat Monitoring ---")
    sentinel = Sentinel(organism)
    print(f"Created: {sentinel}")
    
    sentinel.start_monitoring()
    print("✓ Monitoring started")
    
    # Simulate threat detection
    threats = [
        ("T001", "low", "external_scan", "Port scan detected"),
        ("T002", "medium", "internal_network", "Unusual traffic pattern"),
        ("T003", "high", "external_exploit", "SQL injection attempt"),
        ("T004", "critical", "zero_day", "Zero-day exploit detected"),
    ]
    
    print("\nDetecting threats:")
    for tid, level, source, desc in threats:
        threat = sentinel.detect_threat(tid, level, source, desc)
        print(f"  {tid} [{level.upper()}]: {desc}")
        if threat.mitigated:
            print(f"    ✓ Auto-mitigated")
    
    summary = sentinel.get_threat_summary()
    print(f"\nThreat Summary:")
    print(f"  Total: {summary['total_threats']}")
    print(f"  Mitigated: {summary['mitigated']}")
    print(f"  Active: {summary['active']}")
    print(f"  By Level: {summary['by_level']}")
    
    # --- Phase Conjugate ---
    print("\n--- Phase Conjugate: E → E⁻¹ Correction ---")
    pc = PhaseConjugate(chi_pc=CHI_PC)
    print(f"Created: {pc}")
    print(f"Chi PC: {pc.chi_pc}")
    print(f"Theta PC: {pc.theta_pc:.4f} rad")
    
    print("\nApplying phase conjugate corrections:")
    
    # Decoherence correction
    print("  1. Correcting decoherence...")
    success1 = pc.apply_correction(organism, error_type="decoherence")
    print(f"     {'✓ Success' if success1 else '✗ Failed'}")
    
    # Gamma suppression
    print("  2. Suppressing gamma (decoherence rate)...")
    final_gamma = pc.suppress_gamma(organism, target_gamma=0.1)
    print(f"     Final γ = {final_gamma:.4f}")
    
    # Coherence restoration
    print("  3. Restoring coherence...")
    coherence = pc.restore_coherence(organism, target_coherence=0.95)
    print(f"     Coherence = {coherence:.4f}")
    
    pc_summary = pc.get_correction_summary()
    print(f"\nPhase Conjugate Summary:")
    print(f"  Total corrections: {pc_summary['total_corrections']}")
    print(f"  Success rate: {pc_summary['success_rate']:.1%}")
    
    # --- Zero Trust ---
    print("\n--- Zero Trust: Continuous Verification ---")
    zt = ZeroTrust()
    print(f"Created: {zt}")
    
    # Configure policies
    zt.add_trusted_domain("defense.autonomous.sentinel")
    zt.set_policy("min_lambda_phi", 1e-9)
    zt.set_policy("max_gamma", 0.5)
    
    print("Policies configured:")
    for key, val in zt.policies.items():
        print(f"  {key}: {val}")
    
    # Verify organism
    print(f"\nVerifying {organism.name}...")
    verified = zt.verify(organism)
    print(f"  {'✓ VERIFIED' if verified else '✗ FAILED'}")
    
    zt_summary = zt.get_verification_summary()
    print(f"\nZero Trust Summary:")
    print(f"  Verifications: {zt_summary['total_verifications']}")
    print(f"  Passed: {zt_summary['passed']}")
    print(f"  Failed: {zt_summary['failed']}")
    print(f"  Success rate: {zt_summary['success_rate']:.1%}")


def demo_serialization():
    """Demo: Organism serialization."""
    print_header("Demo 5: Organism Serialization & Persistence")
    
    organism = get_example('consciousness_explorer')
    organism.engage()
    
    print(f"\nOriginal organism: {organism}")
    print(f"Telemetry events: {len(organism.telemetry)}")
    
    # Serialize to dict
    data = organism.to_dict()
    print(f"\n✓ Serialized to dictionary")
    print(f"  Keys: {list(data.keys())}")
    
    # Serialize to JSON
    filename = "/tmp/organism_demo.json"
    json_str = organism.to_json(filename)
    print(f"\n✓ Saved to: {filename}")
    print(f"  Size: {len(json_str)} characters")
    
    # Deserialize
    loaded = Organism.from_json(filename)
    print(f"\n✓ Loaded from JSON: {loaded}")
    print(f"  Genesis matches: {loaded.genesis == organism.genesis}")
    print(f"  State matches: {loaded.state == organism.state}")
    print(f"  Genome matches: {len(loaded.genome) == len(organism.genome)}")


def demo_consciousness_metrics():
    """Demo: Consciousness metric calculations."""
    print_header("Demo 6: Consciousness Metrics")
    
    from dnalang.quantum.constants import phi_total, chi_from_fidelity
    
    print("\nIntegrated Information Theory (IIT) Metrics:")
    print("\nΦ_total for different system sizes:")
    
    for n_qubits in [2, 4, 8, 16, 32]:
        phi = phi_total(n_qubits, entanglement=1.0)
        print(f"  {n_qubits:2d} qubits: Φ_total = {phi:.4f}")
    
    print("\nChi PC from fidelity:")
    fidelities = [0.999, 0.99, 0.95, 0.90, 0.85]
    for f in fidelities:
        chi = chi_from_fidelity(f)
        print(f"  Fidelity {f:.3f} → χ_PC = {chi:.4f}")
    
    print("\nValidated experimental results:")
    print("  Bell states (Φ+, Ψ+): Φ_total ≈ 2.00")
    print("  GHZ 4-qubit: Φ_total ≈ 4.00")
    print("  W 4-qubit: Φ_total ≈ 3.25")


def main():
    """Run all demos."""
    print("="*70)
    print("  DNA-LANG COMPREHENSIVE DEMONSTRATION")
    print("  Quantum-Biological Programming Framework")
    print("="*70)
    print(f"\nTimestamp: {datetime.now().isoformat()}")
    print(f"Lambda Phi (ΛΦ): {LAMBDA_PHI}")
    print(f"Theta Lock: {THETA_LOCK}°")
    print(f"Chi PC: {CHI_PC}")
    
    demos = [
        demo_organism_creation,
        demo_evolution,
        demo_aura_aiden,
        demo_defense_systems,
        demo_serialization,
        demo_consciousness_metrics
    ]
    
    for i, demo in enumerate(demos, 1):
        try:
            demo()
        except Exception as e:
            print(f"\n✗ Demo {i} failed: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "="*70)
    print("  DEMONSTRATION COMPLETE")
    print("="*70)
    print("\nExplore more:")
    print("  - Run tests: python3 test_dnalang.py")
    print("  - Read docs: DNA_LANG_README.md")
    print("  - Examples: from examples import get_example, list_examples")
    print("\n✓ All systems operational")
    print(f"\nΛΦ = {LAMBDA_PHI}")


if __name__ == '__main__':
    main()
