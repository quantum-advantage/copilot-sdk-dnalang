# DNALang SDK API Reference

Complete API documentation for the DNALang SDK.

## Table of Contents

- [Client](#client)
- [Configuration](#configuration)
- [Quantum Computing](#quantum-computing)
- [Lambda-Phi Conservation](#lambda-phi-conservation)
- [Consciousness Scaling](#consciousness-scaling)
- [Tools](#tools)

---

## Client

### `DNALangCopilotClient`

Main client for interacting with quantum backends through Copilot CLI.

#### Constructor

```python
DNALangCopilotClient(
    quantum_config: Optional[QuantumConfig] = None,
    lambda_phi_config: Optional[LambdaPhiConfig] = None,
    consciousness_config: Optional[ConsciousnessConfig] = None,
    copilot_config: Optional[CopilotConfig] = None,
)
```

**Parameters:**
- `quantum_config`: Configuration for quantum backends
- `lambda_phi_config`: Configuration for lambda-phi validation
- `consciousness_config`: Configuration for consciousness scaling
- `copilot_config`: Configuration for Copilot CLI connection

#### Methods

##### `create_quantum_circuit`

```python
def create_quantum_circuit(
    num_qubits: int,
    gates: List[Dict[str, Any]] = None,
    name: Optional[str] = None,
) -> QuantumCircuit
```

Create a new quantum circuit.

**Returns:** `QuantumCircuit` instance

**Example:**
```python
circuit = client.create_quantum_circuit(num_qubits=3, name="my_circuit")
circuit.h(0).cx(0, 1).cx(1, 2)
```

##### `execute_quantum_circuit`

```python
async def execute_quantum_circuit(
    circuit: QuantumCircuit,
    shots: Optional[int] = None,
    backend: Optional[str] = None,
    optimization_level: Optional[int] = None,
) -> QuantumResult
```

Execute quantum circuit on specified backend.

**Parameters:**
- `circuit`: Circuit to execute
- `shots`: Number of measurement shots
- `backend`: Backend identifier
- `optimization_level`: Optimization level (0-3)

**Returns:** `QuantumResult` with execution data

##### `create_lambda_phi_validator`

```python
def create_lambda_phi_validator() -> LambdaPhiValidator
```

Create lambda-phi conservation validator.

**Returns:** `LambdaPhiValidator` instance

##### `create_consciousness_analyzer`

```python
def create_consciousness_analyzer() -> ConsciousnessAnalyzer
```

Create consciousness scaling analyzer.

**Returns:** `ConsciousnessAnalyzer` instance

---

## Configuration

### `QuantumConfig`

```python
@dataclass
class QuantumConfig:
    backend: str = "aer_simulator"
    default_backend: str = "aer_simulator"
    api_token: Optional[str] = None
    api_token_env: str = "IBM_QUANTUM_TOKEN"
    optimization_level: int = 3
    shots: int = 1024
    max_qubits: int = 127
    timeout: int = 300
```

### `LambdaPhiConfig`

```python
@dataclass
class LambdaPhiConfig:
    num_trials: int = 100
    significance_level: float = 0.05
    operators: List[str] = ["X", "Y", "Z", "H"]
    conservation_threshold: float = 0.95
    enable_statistical_tests: bool = True
```

### `ConsciousnessConfig`

```python
@dataclass
class ConsciousnessConfig:
    qubit_range: List[int] = [2, 4, 8, 16, 32]
    samples_per_size: int = 50
    coherence_threshold: float = 0.7
    enable_temporal_analysis: bool = True
    ccce_measurement_shots: int = 1024
```

---

## Quantum Computing

### `QuantumCircuit`

Representation of a quantum circuit.

#### Constructor

```python
QuantumCircuit(
    num_qubits: int,
    gates: List[Dict[str, Any]] = [],
    name: Optional[str] = None,
    metadata: Dict[str, Any] = {},
)
```

#### Gate Methods

```python
def h(target: int) -> QuantumCircuit      # Hadamard
def x(target: int) -> QuantumCircuit      # Pauli-X
def y(target: int) -> QuantumCircuit      # Pauli-Y
def z(target: int) -> QuantumCircuit      # Pauli-Z
def cx(control: int, target: int) -> QuantumCircuit  # CNOT
```

All gate methods support method chaining.

#### Serialization

```python
def to_json() -> str
def to_qiskit() -> QiskitCircuit

@classmethod
def from_json(json_str: str) -> QuantumCircuit
```

### `QuantumResult`

Result from quantum circuit execution.

```python
@dataclass
class QuantumResult:
    counts: Dict[str, int]
    backend: str
    shots: int
    execution_time: float
    success: bool = True
    lambda_phi_conserved: Optional[float] = None
    ccce_metric: Optional[float] = None
    job_id: Optional[str] = None
    metadata: Dict[str, Any] = {}
    
    def get_probabilities() -> Dict[str, float]
    def get_most_frequent(n: int = 1) -> List[tuple]
```

---

## Lambda-Phi Conservation

### `LambdaPhiValidator`

Validator for lambda-phi conservation laws.

#### Methods

##### `validate_conservation`

```python
async def validate_conservation(
    circuit: QuantumCircuit,
    operator: str = "Z",
    num_trials: Optional[int] = None,
) -> ConservationResult
```

Validate lambda-phi conservation for a circuit.

**Parameters:**
- `circuit`: Circuit to validate
- `operator`: Pauli operator (X, Y, Z, H)
- `num_trials`: Number of validation trials

**Returns:** `ConservationResult`

### `ConservationResult`

```python
@dataclass
class ConservationResult:
    conservation_ratio: float
    p_value: float
    conserved: bool
    operator: str
    num_trials: int
    mean_expectation: float
    std_expectation: float
    metadata: Dict[str, Any]
```

---

## Consciousness Scaling

### `ConsciousnessAnalyzer`

Analyzer for consciousness scaling phenomena.

#### Methods

##### `measure_scaling`

```python
async def measure_scaling(
    num_qubits_range: Optional[List[int]] = None,
    num_samples: Optional[int] = None,
) -> CCCEResult
```

Measure consciousness scaling across system sizes.

**Parameters:**
- `num_qubits_range`: List of qubit counts to test
- `num_samples`: Samples per qubit count

**Returns:** `CCCEResult`

### `CCCEResult`

```python
@dataclass
class CCCEResult:
    ccce_values: List[float]
    qubit_sizes: List[int]
    exponent: float
    exponent_error: float
    coherence_time_ms: float
    r_squared: float
    metadata: Dict[str, Any]
```

---

## Tools

### `ToolRegistry`

Registry of DNALang tools for Copilot integration.

```python
registry = ToolRegistry()
registry.register_tool(CustomTool())
tools = registry.get_all_tool_names()
```

### Built-in Tools

- `QuantumExecutionTool` - Execute quantum circuits
- `LambdaPhiValidationTool` - Validate conservation
- `ConsciousnessScalingTool` - Measure scaling

---

## Error Handling

All async methods may raise:
- `RuntimeError` - Copilot CLI errors
- `ValueError` - Invalid parameters
- `ImportError` - Missing dependencies

Example:
```python
try:
    result = await client.execute_quantum_circuit(circuit)
    if not result.success:
        print(f"Execution failed: {result.metadata['error']}")
except Exception as e:
    print(f"Error: {e}")
```

---

## Examples

See [cookbook](../../cookbook/dnalang/) for complete examples.
