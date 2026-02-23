# DNALang Quantum Hardware Setup

## Quick Start

### 1. Install Dependencies

\`\`\`bash
pip install qiskit qiskit-ibm-runtime nest-asyncio
\`\`\`

### 2. Get IBM Quantum API Key

1. Visit [IBM Quantum Platform](https://quantum.ibm.com/)
2. Sign up or log in
3. Go to Account Settings → API Token
4. Copy your API token

### 3. Configure API Key

Create `apikey.json` in the project root:

\`\`\`json
{
  "apikey": "YOUR_API_KEY_HERE"
}
\`\`\`

Or use the template:
\`\`\`bash
cp apikey.json.template apikey.json
# Edit apikey.json with your actual API key
\`\`\`

### 4. Test the Backend

\`\`\`bash
python scripts/dnalang_quantum_backend.py
\`\`\`

## Troubleshooting

### "qiskit module not available"
\`\`\`bash
pip install qiskit qiskit-ibm-runtime
\`\`\`

### "RuntimeError: asyncio.run() cannot be called from a running event loop"
Install nest-asyncio:
\`\`\`bash
pip install nest-asyncio
\`\`\`

### "API key file not found"
The script searches for `apikey.json` in:
- Current directory
- Project root
- `~/.dnalang/apikey.json`

Create the file in any of these locations.

### Simulation Mode
If you don't have an API key or qiskit installed, the backend automatically runs in simulation mode with mock quantum results.

## Available Backends

List available quantum backends:
\`\`\`python
from scripts.dnalang_quantum_backend import DNALangQuantumBackend, load_api_key

api_key = load_api_key()
backend = DNALangQuantumBackend(api_key)
backends = backend.list_backends()
print(backends)
\`\`\`

## Example Usage

\`\`\`python
from scripts.dnalang_quantum_backend import (
    DNALangQuantumBackend,
    DNALangCircuit,
    DNALangGate,
    load_api_key,
    run_async
)

# Load API key
api_key = load_api_key()

# Initialize backend
backend = DNALangQuantumBackend(api_key, backend_name="ibm_brisbane")

# Create circuit
circuit = DNALangCircuit(
    num_qubits=2,
    depth=2,
    gates=[
        DNALangGate(type='H', qubits=[0]),
        DNALangGate(type='CX', qubits=[0, 1])
    ],
    measurements=[0, 1]
)

# Execute
result = run_async(backend.execute_circuit(circuit, shots=2048))
print(f"Fidelity: {result.fidelity:.4f}")
print(f"Counts: {result.counts}")
