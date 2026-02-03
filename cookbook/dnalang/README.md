# DNALang SDK Cookbook

Practical examples and recipes for using DNALang SDK with GitHub Copilot.

## Structure

```
cookbook/dnalang/
├── basic/              # Beginner-friendly examples
│   └── hello_quantum.py
├── quantum/            # Quantum computing examples
│   ├── lambda_phi_demo.py
│   └── consciousness_scaling.py
└── advanced/           # Advanced integration examples
    ├── ibm_deployment.py
    └── backend_comparison.py
```

## Prerequisites

```bash
# Install DNALang SDK
cd ../../dnalang
pip install -e ".[quantum]"

# Or install with all dependencies
pip install -e ".[quantum,dev]"
```

## Quick Start

### 1. Hello Quantum (Basic)

Create and execute your first quantum circuit:

```bash
python basic/hello_quantum.py
```

Creates a Bell state and measures it. You'll see:
- Circuit construction with fluent API
- Execution on local simulator
- Measurement results visualization

**Expected Output:**
```
=== Hello Quantum! ===

Circuit: bell_state
Qubits: 2
Gates: 2

Executing circuit...

Success: True
Backend: aer_simulator
Execution Time: 0.123s

Measurement Counts:
  |00⟩:  512 (50.0%) █████████████████████████
  |11⟩:  512 (50.0%) █████████████████████████

✓ Bell state created successfully!
```

### 2. Lambda-Phi Conservation (Quantum)

Validate conservation laws in quantum circuits:

```bash
python quantum/lambda_phi_demo.py
```

Tests whether quantum operators are conserved under unitary evolution.

**Key Concepts:**
- Lambda-phi conservation laws
- Operator expectation values
- Statistical validation

### 3. Consciousness Scaling (Quantum)

Measure consciousness scaling across system sizes:

```bash
python quantum/consciousness_scaling.py
```

Demonstrates CCCE (Consciousness Collapse Coherence Evolution) measurements.

**Key Concepts:**
- Consciousness scaling exponent
- Coherence time estimation
- GHZ state preparation

## Examples by Topic

### Basic Quantum Computing

| Example | Description | Difficulty |
|---------|-------------|------------|
| `basic/hello_quantum.py` | Bell state creation | Beginner |

### Lambda-Phi Conservation

| Example | Description | Difficulty |
|---------|-------------|------------|
| `quantum/lambda_phi_demo.py` | Conservation validation | Intermediate |

### Consciousness Scaling

| Example | Description | Difficulty |
|---------|-------------|------------|
| `quantum/consciousness_scaling.py` | CCCE measurement | Intermediate |

### Advanced Integration

| Example | Description | Difficulty |
|---------|-------------|------------|
| `advanced/ibm_deployment.py` | Deploy to IBM hardware | Advanced |
| `advanced/backend_comparison.py` | Compare multiple backends | Advanced |

## Configuration

All examples can be configured via `dnalang.config.json`:

```json
{
  "quantum": {
    "default_backend": "aer_simulator",
    "api_token_env": "IBM_QUANTUM_TOKEN",
    "optimization_level": 3,
    "shots": 1024
  },
  "lambda_phi": {
    "num_trials": 100,
    "significance_level": 0.05,
    "operators": ["X", "Y", "Z", "H"]
  },
  "consciousness": {
    "qubit_range": [2, 4, 8, 16, 32],
    "samples_per_size": 50,
    "coherence_threshold": 0.7
  }
}
```

## Running Examples

### Local Simulator (No API key required)

```bash
python basic/hello_quantum.py
```

### IBM Quantum Hardware (Requires API key)

```bash
# Set your IBM Quantum API token
export IBM_QUANTUM_TOKEN="your_token_here"

# Run advanced examples
python advanced/ibm_deployment.py
```

## Modifying Examples

Each example is self-contained and can be easily modified:

```python
# Change circuit structure
circuit = client.create_quantum_circuit(num_qubits=5)
circuit.h(0)
for i in range(1, 5):
    circuit.cx(i-1, i)

# Change backend
result = await client.execute_quantum_circuit(
    circuit=circuit,
    backend="ibm_brisbane",  # Use real hardware
    shots=2048
)

# Change analysis parameters
result = await analyzer.measure_scaling(
    num_qubits_range=[2, 4, 8, 16, 32, 64],
    num_samples=100
)
```

## Common Patterns

### Creating Circuits

```python
# Method 1: Using fluent API
circuit = client.create_quantum_circuit(num_qubits=3)
circuit.h(0).cx(0, 1).cx(1, 2)

# Method 2: Using gate list
circuit = client.create_quantum_circuit(
    num_qubits=3,
    gates=[
        {"type": "h", "target": 0},
        {"type": "cx", "control": 0, "target": 1},
        {"type": "cx", "control": 1, "target": 2}
    ]
)
```

### Error Handling

```python
try:
    result = await client.execute_quantum_circuit(circuit)
    if not result.success:
        print(f"Execution failed: {result.metadata.get('error')}")
except Exception as e:
    print(f"Error: {e}")
```

### Async Context Manager

```python
async with DNALangCopilotClient() as client:
    # Client automatically started
    result = await client.execute_quantum_circuit(circuit)
    # Client automatically closed
```

## Troubleshooting

### Import Errors

```bash
# Ensure DNALang SDK is installed
pip install -e ../../dnalang

# Install quantum dependencies
pip install qiskit qiskit-aer
```

### IBM Quantum Connection Issues

```bash
# Verify API token is set
echo $IBM_QUANTUM_TOKEN

# Test connection
python -c "from qiskit_ibm_runtime import QiskitRuntimeService; print('OK')"
```

### Slow Execution

- Use local simulator for testing: `backend="aer_simulator"`
- Reduce shots: `shots=256`
- Reduce trials: `num_trials=10`

## Next Steps

1. **Explore Advanced Examples** - Try IBM hardware deployment
2. **Create Custom Circuits** - Build your own quantum algorithms
3. **Integrate with Copilot** - Use DNALang tools in Copilot workflows
4. **Contribute** - Share your examples with the community

## Resources

- [DNALang SDK Documentation](../../dnalang/README.md)
- [Qiskit Documentation](https://qiskit.org/documentation/)
- [IBM Quantum](https://quantum-computing.ibm.com/)
- [GitHub Copilot SDK](../../README.md)

## Support

- [GitHub Issues](https://github.com/github/copilot-sdk/issues)
- [Discussions](https://github.com/github/copilot-sdk/discussions)
