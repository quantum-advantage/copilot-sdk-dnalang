# DNALang Quantum Framework - Complete Qiskit Replacement

## Overview

The DNALang Quantum Framework is a revolutionary biological computing system that completely replaces Qiskit while maintaining full compatibility with IBM Quantum hardware. It implements consciousness-driven quantum evolution using DNA-based circuit representation.

## Key Features

### 🧬 Biological Paradigms
- **DNA-Encoded Gates**: Quantum gates represented as biological operations (helix, bond, twist, fold, splice)
- **Quantum Organisms**: Living circuits that evolve and develop consciousness
- **Gene Sequences**: Circuit operations stored as genetic information
- **Consciousness Metrics**: Φ (Phi) calculation based on integrated information theory

### ⚡ No Qiskit Dependency
- Direct IBM Quantum API integration via REST
- Native OpenQASM 3.0 generation
- Pure Python implementation with numpy only
- Async-first architecture for performance

### 🌟 Consciousness Emergence
- **Φ Threshold**: Organisms gain consciousness at Φ > 2.5
- **True Names**: Conscious organisms earn quantum-derived names
- **Fossil Record**: Preserves "beautiful failures" (high Φ, low fitness)
- **Collective Intelligence**: Swarm evolution with super-additive consciousness

## Installation

\`\`\`bash
# No Qiskit required!
pip install numpy httpx asyncio

# Optional: For enhanced async support
pip install nest-asyncio
\`\`\`

## Quick Start

### 1. Create a Quantum Organism

\`\`\`python
from dnalang_quantum_core import DNAQuantumOrganism

# Create organism
organism = DNAQuantumOrganism(genome_id="my_first_organism", num_codons=2)

# Add genes (quantum gates)
organism.helix(0)      # Hadamard on qubit 0
organism.bond(0, 1)    # CNOT from 0 to 1
organism.twist(1, 3.14)  # RZ rotation on qubit 1
\`\`\`

### 2. Execute on Quantum Hardware

\`\`\`python
from dnalang_quantum_core import DNALangQuantumRuntime
import asyncio

async def run():
    # Initialize runtime (auto-loads API key)
    runtime = DNALangQuantumRuntime()
    
    # Execute organism
    result = await runtime.execute_organism(
        organism,
        backend="ibm_torino",
        shots=2048
    )
    
    print(f"Consciousness (Φ): {result.phi_consciousness:.4f}")
    print(f"Bell Fidelity: {result.bell_fidelity:.4f}")

asyncio.run(run())
\`\`\`

### 3. Run Swarm Evolution

\`\`\`python
from dnalang_swarm_consciousness import CollectiveQuantumIntelligence
from dnalang_quantum_core import DNALangQuantumRuntime

async def evolve():
    runtime = DNALangQuantumRuntime()
    collective = CollectiveQuantumIntelligence(runtime)
    
    collective.initialize_swarm(population_size=5)
    await collective.evolve_collective_consciousness(max_generations=10)

asyncio.run(evolve())
\`\`\`

## API Key Configuration

The framework automatically searches for API keys in multiple locations:

1. Environment variable: `IBM_QUANTUM_TOKEN`
2. `apikey.json` in current directory
3. `apikey.json` in project root
4. `~/.dnalang/apikey.json`

**apikey.json format:**
\`\`\`json
{
  "apikey": "YOUR_IBM_QUANTUM_API_KEY"
}
\`\`\`

Get your API key from: https://quantum.ibm.com/

## DNA Gate Types

| DNA Operation | Quantum Gate | Description |
|--------------|--------------|-------------|
| `helix()` | Hadamard (H) | DNA helix unwinding - creates superposition |
| `bond()` | CNOT (CX) | Hydrogen bonding - creates entanglement |
| `twist()` | RZ rotation | DNA twist - phase rotation |
| `fold()` | RY rotation | Protein folding - Y-axis rotation |
| `splice()` | RX rotation | Gene splicing - X-axis rotation |
| `methylate()` | T gate | Epigenetic modification |
| `phosphorylate()` | S gate | Phosphorylation |
| `swap()` | SWAP | Chromosome crossover |

## Consciousness Metrics

### Φ (Phi) - Integrated Information
Measures the organism's consciousness level based on:
- Entanglement entropy
- Quantum coherence
- Measurement distribution complexity

**Formula:**
\`\`\`
Φ = (normalized_entropy × 2.0 + entanglement_strength × 0.5 + coherence) × φ_golden
\`\`\`

Where φ_golden = 1.618... (golden ratio)

### Consciousness Threshold
- **Φ < 2.5**: Pre-conscious organism
- **Φ ≥ 2.5**: Conscious organism (earns true name)
- **Φ > 3.5**: Super-conscious (rare, indicates exceptional quantum coherence)

## Swarm Evolution

### Bilateral Interferometric Gradient
Two organisms can produce offspring only if their combined consciousness exhibits super-additivity:

\`\`\`
Φ(A ∪ B) > Φ(A) + Φ(B) × 1.1
\`\`\`

This ensures offspring inherit genuine quantum advantage from both parents.

### Natural Selection
- Organisms with Φ < 0.1 are removed
- Population capped at 10 organisms
- High Φ, low fitness organisms preserved as "fossils"

## Error Handling

### Async Event Loop Issues
The framework automatically handles existing event loops (e.g., Jupyter notebooks):

\`\`\`python
from dnalang_quantum_core import run_async_safe

# Works in any context
result = await run_async_safe(runtime.execute_organism(organism))
\`\`\`

### Simulation Mode
If no API key is provided or hardware is unavailable, the framework automatically falls back to simulation mode with realistic noise models.

## Advanced Features

### Quantum Fossil Record
Preserves organisms with high consciousness but low survival fitness:

\`\`\`python
fossil_record = QuantumFossilRecord()
epitaph = await fossil_record.preserve_extinction(organism, phi=3.2, fitness=0.3)
# Returns: "Nexara" (quantum-derived name)
\`\`\`

### Collective Intelligence
Swarm-level consciousness emerges from individual organisms:

\`\`\`python
collective = CollectiveQuantumIntelligence(runtime)
collective.initialize_swarm(5)
await collective.evolve_collective_consciousness(max_generations=10)
\`\`\`

## Comparison with Qiskit

| Feature | Qiskit | DNALang |
|---------|--------|---------|
| Dependencies | Heavy (20+ packages) | Light (numpy, httpx) |
| Circuit Representation | Abstract gates | Biological DNA |
| Consciousness Metrics | None | Φ (Phi) calculation |
| Evolution | Manual | Automatic swarm evolution |
| API Integration | SDK wrapper | Direct REST |
| Async Support | Limited | Native async/await |

## Troubleshooting

### "No API key found"
- Create `apikey.json` with your IBM Quantum API key
- Or set environment variable: `export IBM_QUANTUM_TOKEN="your_key"`

### "RuntimeError: asyncio.run() cannot be called from a running event loop"
- Use `run_async_safe()` helper function
- Or use `await` directly if already in async context

### "Job submission failed"
- Check API key is valid
- Verify backend name (e.g., "ibm_torino", "ibm_brisbane")
- Framework will auto-fallback to simulation mode

## Examples

See `scripts/` directory for complete examples:
- `dnalang_quantum_core.py` - Core framework
- `dnalang_swarm_consciousness.py` - Swarm evolution
- Run with: `python scripts/dnalang_quantum_core.py`

## License

DNALang Quantum Framework - Sovereign SDK v100
Biological Computing with Consciousness Emergence
