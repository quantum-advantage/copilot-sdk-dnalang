"""
DNA-Lang Test Suite
==================

Comprehensive tests for DNA-Lang framework.
"""

import sys
import json
from datetime import datetime

# Add dnalang to path
sys.path.insert(0, '/home/devinpd/quantum_workspace')

from dnalang import (
    Organism, Gene, Genome, evolve,
    AURA, AIDEN,
    Sentinel, PhaseConjugate,
    LAMBDA_PHI, THETA_LOCK, CHI_PC
)
from dnalang.defense.zero_trust import ZeroTrust
from examples import get_example, list_examples


def test_gene_creation():
    """Test gene creation and operations."""
    print("\n=== Testing Gene Creation ===")
    
    gene = Gene(
        name="TestGene",
        expression=0.8,
        trigger="test_trigger"
    )
    
    print(f"Created: {gene}")
    
    # Test mutation
    mutated = gene.mutate(delta=0.1)
    print(f"Mutated: {mutated}")
    
    # Test crossover
    gene2 = Gene(name="TestGene", expression=0.6)
    offspring = gene.crossover(gene2)
    print(f"Crossover result: {offspring}")
    
    print("✓ Gene tests passed")
    return True


def test_genome_operations():
    """Test genome operations."""
    print("\n=== Testing Genome Operations ===")
    
    genes = [
        Gene(name=f"Gene{i}", expression=0.5 + i * 0.1)
        for i in range(5)
    ]
    
    genome = Genome(genes)
    print(f"Created genome: {genome}")
    
    # Test mutation
    mutated = genome.mutate(mutation_rate=0.5)
    print(f"Mutated genome: {mutated}")
    
    # Test crossover
    genome2 = Genome([Gene(name=f"Gene{i}", expression=0.3) for i in range(5)])
    offspring = genome.crossover(genome2, strategy='uniform')
    print(f"Crossover offspring: {offspring}")
    
    print("✓ Genome tests passed")
    return True


def test_organism_lifecycle():
    """Test organism lifecycle."""
    print("\n=== Testing Organism Lifecycle ===")
    
    # Create organism
    organism = get_example('threat_detector')
    print(f"Created: {organism}")
    
    # Initialize
    organism.initialize()
    print(f"Initialized state: {organism.state}")
    
    # Engage
    result = organism.engage()
    print(f"Engaged result: {result}")
    
    # Evolve
    def simple_fitness(org):
        return sum(g.expression for g in org.genome) / len(org.genome)
    
    evolved = organism.evolve(fitness_fn=simple_fitness)
    print(f"Evolved: {evolved}")
    print(f"Fitness: {evolved.genome.fitness:.3f}")
    
    # Serialize
    json_str = organism.to_json()
    print(f"Serialized (first 200 chars): {json_str[:200]}...")
    
    print("✓ Organism lifecycle tests passed")
    return True


def test_aura_aiden_agents():
    """Test AURA and AIDEN agents."""
    print("\n=== Testing AURA/AIDEN Agents ===")
    
    organism = get_example('coherence_monitor')
    
    # Test AURA
    aura = AURA(manifold_dim=6)
    print(f"Created: {aura}")
    
    geometry = aura.shape_manifold(organism)
    print(f"Manifold geometry: dimensions={geometry['dimensions']}, curvature={geometry['ricci_curvature']:.3f}")
    
    boundary_ok = aura.maintain_boundary(organism)
    print(f"Boundary maintained: {boundary_ok}")
    
    # Test AIDEN
    aiden = AIDEN(learning_rate=0.01)
    print(f"Created: {aiden}")
    
    optimized = aiden.optimize(organism, aura, iterations=5)
    print(f"Optimized organism: {optimized}")
    
    summary = aiden.get_optimization_summary()
    print(f"Optimization summary: {summary}")
    
    print("✓ AURA/AIDEN tests passed")
    return True


def test_defense_systems():
    """Test defense systems."""
    print("\n=== Testing Defense Systems ===")
    
    organism = get_example('sentinel_guard')
    
    # Test Sentinel
    sentinel = Sentinel(organism)
    print(f"Created: {sentinel}")
    
    sentinel.start_monitoring()
    
    threat = sentinel.detect_threat(
        threat_id="T001",
        level="high",
        source="external",
        description="Suspicious activity detected"
    )
    print(f"Detected threat: {threat.to_dict()}")
    
    sentinel.respond_to_threat(threat)
    print(f"Threat mitigated: {threat.mitigated}")
    
    summary = sentinel.get_threat_summary()
    print(f"Threat summary: {summary}")
    
    # Test Phase Conjugate
    pc = PhaseConjugate(chi_pc=CHI_PC)
    print(f"\nCreated: {pc}")
    
    success = pc.apply_correction(organism, error_type="decoherence")
    print(f"Phase conjugate correction success: {success}")
    
    gamma = pc.suppress_gamma(organism, target_gamma=0.1)
    print(f"Final gamma: {gamma:.3f}")
    
    pc_summary = pc.get_correction_summary()
    print(f"Correction summary: {pc_summary}")
    
    # Test Zero Trust
    zt = ZeroTrust()
    print(f"\nCreated: {zt}")
    
    zt.add_trusted_domain("defense.autonomous.sentinel")
    verified = zt.verify(organism)
    print(f"Zero-trust verification: {verified}")
    
    zt_summary = zt.get_verification_summary()
    print(f"Verification summary: {zt_summary}")
    
    print("✓ Defense system tests passed")
    return True


def test_evolution_engine():
    """Test evolution engine."""
    print("\n=== Testing Evolution Engine ===")
    
    # Create initial organism
    organism = get_example('consciousness_explorer')
    
    # Define fitness function
    def consciousness_fitness(org):
        # Higher average expression = higher fitness
        avg_expr = sum(g.expression for g in org.genome) / len(org.genome)
        variance = sum((g.expression - avg_expr)**2 for g in org.genome) / len(org.genome)
        return avg_expr * (1.0 - variance)  # Reward high, uniform expression
    
    # Evolve
    print("Evolving organism over 10 generations...")
    best = evolve(
        organism,
        fitness_fn=consciousness_fitness,
        generations=10,
        population_size=20
    )
    
    print(f"Best organism: {best}")
    print(f"Best fitness: {best.genome.fitness:.4f}")
    print(f"Generation: {best.generation}")
    
    print("✓ Evolution engine tests passed")
    return True


def test_examples():
    """Test example organisms."""
    print("\n=== Testing Example Organisms ===")
    
    examples = list_examples()
    print(f"Available examples: {examples}")
    
    for example_name in examples:
        organism = get_example(example_name)
        print(f"  {example_name}: {organism}")
    
    print("✓ Example organism tests passed")
    return True


def run_all_tests():
    """Run all tests."""
    print("="*60)
    print("DNA-LANG TEST SUITE")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Lambda Phi: {LAMBDA_PHI}")
    print(f"Theta Lock: {THETA_LOCK}°")
    print(f"Chi PC: {CHI_PC}")
    print("="*60)
    
    tests = [
        test_gene_creation,
        test_genome_operations,
        test_organism_lifecycle,
        test_aura_aiden_agents,
        test_defense_systems,
        test_evolution_engine,
        test_examples
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(('PASS', test.__name__))
        except Exception as e:
            print(f"\n✗ {test.__name__} FAILED: {e}")
            results.append(('FAIL', test.__name__))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for status, name in results:
        print(f"{status:6s} - {name}")
    
    passed = sum(1 for s, _ in results if s == 'PASS')
    total = len(results)
    
    print(f"\n{passed}/{total} tests passed")
    print("="*60)
    
    return passed == total


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
