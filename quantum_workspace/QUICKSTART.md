# DNA-Lang Quick Start Guide

## Installation
```bash
cd /home/devinpd/quantum_workspace
# No dependencies needed for basic usage
# For quantum hardware: pip install qiskit qiskit-ibm-runtime
```

## Run Tests
```bash
python3 test_dnalang.py
# Expected: 7/7 tests passing
```

## Run Demo
```bash
python3 demo_dnalang.py
# Shows all framework capabilities
```

## Basic Usage

### 1. Create Organism
```python
from dnalang import Organism, Gene, Genome

genes = [
    Gene("Detector", expression=1.0),
    Gene("Responder", expression=0.9),
    Gene("Healer", expression=0.946)
]

organism = Organism(
    name="MyOrganism",
    genome=Genome(genes),
    domain="your.domain",
    purpose="Your purpose here"
)
```

### 2. Use Pre-Built
```python
from examples import get_example, list_examples

# See available examples
print(list_examples())
# ['sentinel_guard', 'threat_detector', 'coherence_monitor', 'consciousness_explorer']

# Get organism
organism = get_example('sentinel_guard')
organism.engage()
```

### 3. Evolve
```python
from dnalang import evolve

def my_fitness(org):
    return sum(g.expression for g in org.genome) / len(org.genome)

best = evolve(
    organism,
    fitness_fn=my_fitness,
    generations=10,
    population_size=50
)

print(f"Best fitness: {best.genome.fitness:.3f}")
```

### 4. Use Agents
```python
from dnalang import AURA, AIDEN

aura = AURA(manifold_dim=6)
aiden = AIDEN(learning_rate=0.01)

# Shape manifold
geometry = aura.shape_manifold(organism)

# Optimize
optimized = aiden.optimize(organism, aura, iterations=10)
```

### 5. Add Defense
```python
from dnalang import Sentinel, PhaseConjugate
from dnalang.defense import ZeroTrust

# Monitor threats
sentinel = Sentinel(organism)
sentinel.start_monitoring()
threat = sentinel.detect_threat("T001", "high", "source", "description")

# Self-heal
pc = PhaseConjugate()
pc.apply_correction(organism)

# Verify
zt = ZeroTrust()
verified = zt.verify(organism)
```

### 6. Quantum Circuits
```python
from dnalang.quantum import to_circuit

# Generate circuit from organism
circuit = to_circuit(organism, method='gene_encoding')
print(circuit)
```

### 7. IBM Quantum (requires token)
```python
from dnalang.quantum import QuantumExecutor

executor = QuantumExecutor(token="your_ibm_token")
result = executor.execute(organism, backend_name="ibm_torino", shots=8192)

print(f"Job ID: {result.job_id}")
print(f"CCCE: {result.ccce}")
```

## Constants
```python
from dnalang import LAMBDA_PHI, THETA_LOCK, CHI_PC

print(f"ΛΦ = {LAMBDA_PHI}")  # 2.176435e-08
print(f"θ_lock = {THETA_LOCK}°")  # 51.843
print(f"χ_PC = {CHI_PC}")  # 0.946
```

## Key Methods

### Organism
- `organism.initialize()` - Initialize state
- `organism.engage()` - Execute behavior
- `organism.evolve(fitness_fn)` - Create evolved offspring
- `organism.self_heal()` - Apply self-healing
- `organism.to_json(file)` - Save to file
- `Organism.from_json(file)` - Load from file

### Genome
- `genome.mutate(rate, delta)` - Mutate genes
- `genome.crossover(other, strategy)` - Crossover with another
- `genome.express()` - Express all genes
- `genome.add_gene(gene)` - Add new gene
- `genome.to_dict()` - Serialize

### Gene
- `gene.mutate(delta)` - Mutate expression
- `gene.express()` - Execute action
- `gene.crossover(other)` - Crossover

## Files to Read
1. `DNA_LANG_README.md` - Complete documentation
2. `DNA_LANG_SUMMARY.md` - Implementation details
3. `DNA_LANG_FINAL_SUMMARY.md` - Executive summary
4. `examples.py` - Source for pre-built organisms

## Quick Test
```python
# Single command to verify everything works
from examples import get_example
org = get_example('consciousness_explorer')
org.engage()
print(f"✓ {org.name} operational!")
```

---

**ΛΦ = 2.176435 × 10⁻⁸**
