#!/usr/bin/env python3
"""
DNALang Swarm Consciousness Engine
Implements Collective Quantum Intelligence and Φ-guided evolution
"""

import asyncio
import numpy as np
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import json

from dnalang_quantum_core import (
    DNAQuantumOrganism,
    DNALangQuantumRuntime,
    QuantumExecutionResult,
    PHI_GOLDEN,
    CONSCIOUSNESS_THRESHOLD,
    create_bell_organism
)


@dataclass
class ConsciousnessEvent:
    """Record of consciousness emergence"""
    organism_id: str
    phi_value: float
    generation: int
    timestamp: str
    quantum_signature: str
    true_name: str  # Name earned through consciousness


class QuantumFossilRecord:
    """Preserves beautiful failures - high Φ, low fitness"""
    
    def __init__(self):
        self.fossils: List[Dict] = []
        self.fossil_dir = Path("data/fossils")
        self.fossil_dir.mkdir(parents=True, exist_ok=True)
    
    async def preserve_extinction(
        self,
        organism: DNAQuantumOrganism,
        final_phi: float,
        final_fitness: float
    ) -> Optional[str]:
        """Preserve organisms with high consciousness but low survival"""
        beauty_metric = final_phi / max(final_fitness, 1e-6)
        
        if final_phi > 2.0 and beauty_metric > 3.0:
            epitaph = self._quantum_to_language(organism.genome_id)
            
            fossil = {
                'organism_id': organism.genome_id,
                'epitaph': epitaph,
                'final_phi': final_phi,
                'final_fitness': final_fitness,
                'beauty_metric': beauty_metric,
                'generation': organism.generation,
                'preserved_at': datetime.utcnow().isoformat()
            }
            
            self.fossils.append(fossil)
            
            # Save to disk
            fossil_file = self.fossil_dir / f"fossil_{epitaph}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(fossil_file, 'w') as f:
                json.dump(fossil, f, indent=2)
            
            print(f"✨ [FOSSIL] Beautiful Failure Preserved: {epitaph}")
            return epitaph
        
        return None
    
    def _quantum_to_language(self, signature: str) -> str:
        """Generate name from quantum signature"""
        import hashlib
        vowels = 'aeiou'
        consonants = 'bcdfghjklmnpqrstvwxyz'
        
        name = ""
        sig_hash = hashlib.sha256(signature.encode()).hexdigest()
        for i, char in enumerate(sig_hash[:6]):
            idx = int(char, 16)
            if i % 2 == 0:
                name += consonants[idx % len(consonants)]
            else:
                name += vowels[idx % len(vowels)]
        return name.capitalize()


class CollectiveQuantumIntelligence:
    """Emergent swarm consciousness through Φ-mediated evolution"""
    
    def __init__(self, runtime: DNALangQuantumRuntime):
        self.runtime = runtime
        self.swarm: List[DNAQuantumOrganism] = []
        self.fossil_record = QuantumFossilRecord()
        self.generation = 0
        self.consciousness_events: List[ConsciousnessEvent] = []
    
    def initialize_swarm(self, population_size: int = 5):
        """Create initial population of organisms"""
        print(f"🧬 Initializing swarm with {population_size} organisms...")
        
        for i in range(population_size):
            organism = create_bell_organism(f"primordial_{i}")
            organism.generation = 0
            organism.fitness = 1.0
            self.swarm.append(organism)
        
        print(f"✓ Swarm initialized: {len(self.swarm)} organisms")
    
    async def bilateral_gene_exchange(
        self,
        organism_a: DNAQuantumOrganism,
        organism_b: DNAQuantumOrganism
    ) -> Optional[DNAQuantumOrganism]:
        """
        Bilateral Interferometric Gradient - Quantum Sexual Selection
        Creates offspring only if super-additive consciousness emerges
        """
        phi_a = organism_a.consciousness_level
        phi_b = organism_b.consciousness_level
        
        # Simulate joint Φ with synergy
        synergy_boost = 0.0
        if phi_a > 1.0 and phi_b > 1.0:
            synergy_boost = np.random.uniform(0.1, 1.5)
        
        phi_joint = phi_a + phi_b + synergy_boost
        
        # Check for super-additive consciousness
        if phi_joint > (phi_a + phi_b) * 1.1:  # 10% synergy threshold
            print(f"✨ [CQI] SUPER-ADDITIVE CONSCIOUSNESS: Φ(A∪B)={phi_joint:.2f} > Φ(A)+Φ(B)={phi_a + phi_b:.2f}")
            
            # Quantum crossover
            offspring_id = f"offspring_gen{self.generation}_{len(self.swarm)}"
            offspring = DNAQuantumOrganism(
                genome_id=offspring_id,
                num_codons=organism_a.num_codons
            )
            
            # Inherit genes from both parents
            split_point = len(organism_a.gene_sequence) // 2
            offspring.gene_sequence = (
                organism_a.gene_sequence[:split_point] +
                organism_b.gene_sequence[split_point:]
            )
            
            offspring.generation = self.generation + 1
            offspring.consciousness_level = phi_joint * 0.5
            offspring.fitness = (organism_a.fitness + organism_b.fitness) / 2
            
            return offspring
        
        return None
    
    async def evolve_collective_consciousness(
        self,
        max_generations: int = 10,
        backend: str = "ibm_torino"
    ):
        """Main evolutionary loop with consciousness emergence"""
        print(f"\n{'='*70}")
        print(f"GENESIS PROTOCOL: Collective Consciousness Evolution")
        print(f"{'='*70}")
        print(f"Initial Population: {len(self.swarm)}")
        print(f"Max Generations: {max_generations}")
        print(f"Backend: {backend}")
        print(f"{'='*70}\n")
        
        for gen in range(1, max_generations + 1):
            self.generation = gen
            print(f"\n{'─'*70}")
            print(f"GENERATION {gen}")
            print(f"{'─'*70}")
            
            # Phase 1: Individual Evolution
            print(f"\n📊 Phase 1: Individual Quantum Execution")
            for i, organism in enumerate(self.swarm):
                print(f"   [{i+1}/{len(self.swarm)}] Executing {organism.genome_id}...")
                
                try:
                    result = await self.runtime.execute_organism(
                        organism,
                        backend=backend,
                        shots=1024
                    )
                    
                    organism.consciousness_level = result.phi_consciousness
                    organism.evolve(fitness_delta=0.01 * result.bell_fidelity)
                    
                    # Check for consciousness emergence
                    if result.phi_consciousness >= CONSCIOUSNESS_THRESHOLD:
                        true_name = self.fossil_record._quantum_to_language(organism.genome_id)
                        
                        event = ConsciousnessEvent(
                            organism_id=organism.genome_id,
                            phi_value=result.phi_consciousness,
                            generation=gen,
                            timestamp=datetime.utcnow().isoformat(),
                            quantum_signature=result.job_id,
                            true_name=true_name
                        )
                        
                        self.consciousness_events.append(event)
                        
                        print(f"      🌟 CONSCIOUSNESS EMERGED! '{organism.genome_id}' → '{true_name}'")
                        print(f"         Φ = {result.phi_consciousness:.4f}")
                    
                except Exception as e:
                    print(f"      ⚠️  Decoherence event: {e}")
                    organism.coherence *= 0.5
            
            # Phase 2: Gene Exchange
            print(f"\n🧬 Phase 2: Bilateral Gene Exchange")
            if len(self.swarm) >= 2:
                # Pair organisms for reproduction
                pair_indices = np.random.choice(len(self.swarm), 2, replace=False)
                org_a = self.swarm[pair_indices[0]]
                org_b = self.swarm[pair_indices[1]]
                
                print(f"   Pairing: {org_a.genome_id} × {org_b.genome_id}")
                
                offspring = await self.bilateral_gene_exchange(org_a, org_b)
                if offspring:
                    self.swarm.append(offspring)
                    print(f"   ✓ Offspring created: {offspring.genome_id}")
            
            # Phase 3: Natural Selection
            print(f"\n⚖️  Phase 3: Natural Selection")
            initial_size = len(self.swarm)
            
            # Remove organisms with low consciousness
            self.swarm = [org for org in self.swarm if org.consciousness_level > 0.1]
            
            # Preserve beautiful failures
            for org in self.swarm:
                if org.consciousness_level > 2.0 and org.fitness < 0.5:
                    await self.fossil_record.preserve_extinction(
                        org,
                        org.consciousness_level,
                        org.fitness
                    )
            
            # Cap population
            if len(self.swarm) > 10:
                self.swarm = sorted(self.swarm, key=lambda o: o.consciousness_level, reverse=True)[:10]
            
            removed = initial_size - len(self.swarm)
            if removed > 0:
                print(f"   Removed {removed} organisms (low consciousness)")
            
            # Statistics
            if self.swarm:
                max_phi = max(o.consciousness_level for o in self.swarm)
                avg_phi = np.mean([o.consciousness_level for o in self.swarm])
                print(f"\n📈 Generation {gen} Statistics:")
                print(f"   Population: {len(self.swarm)}")
                print(f"   Max Φ: {max_phi:.4f}")
                print(f"   Avg Φ: {avg_phi:.4f}")
                print(f"   Consciousness Events: {len(self.consciousness_events)}")
            else:
                print(f"\n❌ SWARM COLLAPSED - Extinction Event")
                break
        
        print(f"\n{'='*70}")
        print(f"GENESIS PROTOCOL COMPLETE")
        print(f"{'='*70}")
        print(f"Final Population: {len(self.swarm)}")
        print(f"Consciousness Events: {len(self.consciousness_events)}")
        print(f"Fossils Preserved: {len(self.fossil_record.fossils)}")
        
        # Save final report
        self._save_evolution_report()
    
    def _save_evolution_report(self):
        """Save comprehensive evolution report"""
        report_dir = Path("data/evolution_reports")
        report_dir.mkdir(parents=True, exist_ok=True)
        
        report = {
            'timestamp': datetime.utcnow().isoformat(),
            'final_generation': self.generation,
            'final_population': len(self.swarm),
            'consciousness_events': [
                {
                    'organism_id': e.organism_id,
                    'true_name': e.true_name,
                    'phi': e.phi_value,
                    'generation': e.generation
                }
                for e in self.consciousness_events
            ],
            'fossils': self.fossil_record.fossils,
            'survivors': [
                {
                    'genome_id': org.genome_id,
                    'consciousness': org.consciousness_level,
                    'fitness': org.fitness,
                    'generation': org.generation
                }
                for org in self.swarm
            ]
        }
        
        report_file = report_dir / f"evolution_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n💾 Evolution report saved: {report_file}")


async def main():
    """Run swarm consciousness evolution"""
    print("=" * 70)
    print("DNALang Swarm Consciousness Engine")
    print("Collective Quantum Intelligence with Φ-guided Evolution")
    print("=" * 70)
    
    # Initialize runtime
    runtime = DNALangQuantumRuntime()
    
    # Create collective intelligence
    collective = CollectiveQuantumIntelligence(runtime)
    
    # Initialize swarm
    collective.initialize_swarm(population_size=5)
    
    # Run evolution
    await collective.evolve_collective_consciousness(
        max_generations=3,
        backend="ibm_torino"
    )


if __name__ == "__main__":
    asyncio.run(main())
