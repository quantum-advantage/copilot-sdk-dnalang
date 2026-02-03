# Dnalang Sovereign Copilot SDK - Development Guide

## Overview

This is a **quantum-enhanced AI SDK** that combines GitHub Copilot's agentic workflows with token-free quantum computing via the Aeterna Porta system. The SDK provides NLP-to-code generation, quantum circuit execution, and autonomous agent capabilities—all without requiring external API tokens.

**Key Philosophy:** Complete sovereignty through token-free quantum operations and local-first architecture.

## Project Structure

```
dnalang-sovereign-copilot-sdk/
├── python/                          # Python SDK implementation
│   ├── src/copilot_quantum/         # Core package
│   │   ├── agent.py                 # Base SovereignAgent
│   │   ├── enhanced_agent.py        # EnhancedSovereignAgent (NLP + dev tools)
│   │   ├── quantum_engine.py        # AeternaPorta quantum backend
│   │   ├── code_generator.py        # NLP to code generator
│   │   ├── dev_tools.py             # File ops, git, code analysis
│   │   ├── nclm.py                  # Non-classical logic (placeholder)
│   │   └── crypto.py                # Quantum cryptography (placeholder)
│   ├── examples/                    # Usage examples
│   └── setup.py                     # Package configuration
├── quantum/                         # (Future: Rust quantum core)
├── tests/                           # Test suite
└── docs/                            # Additional documentation
```

## Build & Test Commands

### Installation
```bash
# Development install from source
cd python
pip install -e ".[dev]"

# Or with full dependencies (matplotlib, pandas, jupyter)
pip install -e ".[full]"

# Quick test without install (PYTHONPATH method)
cd python
PYTHONPATH=src python3 -c "from copilot_quantum import EnhancedSovereignAgent; print('✅ OK')"
```

### Running Tests
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_agent.py

# Run with async support
pytest --asyncio-mode=auto

# Run with verbose output
pytest -v
```

### Linting & Formatting
```bash
# Format code with black
black src/

# Type checking with mypy
mypy src/copilot_quantum/

# Format specific file
black src/copilot_quantum/agent.py
```

### Running Examples
```bash
cd python
PYTHONPATH=src python3 examples/basic_quantum_agent.py
PYTHONPATH=src python3 examples/better_than_copilot_demo.py
```

### Console Command
```bash
# After installation, the SDK provides a CLI tool
dnalang-agent
```

## Architecture: Core Concepts

### 1. Agent Hierarchy
- **SovereignAgent** (`agent.py`): Base agent with quantum backend integration
- **EnhancedSovereignAgent** (`enhanced_agent.py`): Adds NLP code generation + developer tools

Both agents support quantum-enhanced execution via `use_quantum=True` parameter.

### 2. Quantum Engine (Aeterna Porta)
Located in `quantum_engine.py`. Key components:

- **AeternaPorta**: Token-free quantum backend with auto-failover
- **LambdaPhiEngine**: Physical constants engine (Θ=51.843°, Φ=0.7734, λ=2.176435e-8m)
- **QuantumMetrics**: Result metrics (phi, gamma, ccce, chi_pc)

**Critical Constants** (immutable):
```python
THETA_LOCK_DEG = 51.843         # Geometric resonance angle
PHI_THRESHOLD_FIDELITY = 0.7734 # ER=EPR crossing threshold
GAMMA_CRITICAL_RATE = 0.3       # Decoherence boundary
LAMBDA_PHI_M = 2.176435e-08     # Planck length scale
```

### 3. Code Generation (`code_generator.py`)
The `QuantumNLPCodeGenerator` parses natural language into:
- **CodeIntent**: Enum of generation types (GENERATE_FUNCTION, FIX_BUG, REFACTOR, etc.)
- **CodeGenerationResult**: Generated code + explanation + confidence score

Pattern matching is used for intent recognition (see `intent_patterns` dict).

### 4. Developer Tools (`dev_tools.py`)
Provides file operations, git integration, and code analysis for the agent to interact with the development environment.

## Key Conventions

### Async-First Architecture
All agent execution methods are `async`:
```python
result = await agent.execute("your task", use_quantum=True)
```

### Quantum Execution Pattern
When `use_quantum=True`:
1. Check if quantum backend is available
2. Execute via AeternaPorta IGNITION system
3. Auto-failover between IBM quantum backends (ibm_fez, ibm_torino, ibm_kyiv, etc.)
4. Return QuantumMetrics with phi/gamma/ccce scores
5. Validate against PHI_THRESHOLD_FIDELITY and GAMMA_CRITICAL_RATE

### Result Structure
All agent methods return dataclass results:
- `AgentResult`: Contains output, quantum_metrics, success, error
- `CodeGenerationResult`: Contains code, explanation, confidence, tests

### Framework Identifier
All modules reference: **DNA::}{::lang v51.843** framework

### Quantum Metrics Interpretation
- **phi** (Φ): Entanglement fidelity (target: > 0.7734)
- **gamma** (Γ): Decoherence rate (target: < 0.3)
- **ccce**: Consciousness Collapse Coherence Entropy (higher = better)
- **chi_pc**: Phase conjugation quality (target: ~0.946)

Use `QuantumMetrics.above_threshold()` and `.is_coherent()` for validation.

### Import Pattern
Prefer importing from package root:
```python
from copilot_quantum import (
    EnhancedSovereignAgent,
    AeternaPorta,
    QuantumNLPCodeGenerator,
    CodeIntent
)
```

## Current Limitations

- **NCLM** (Non-Classical Logic Model): Placeholder only - not yet implemented
- **QuantumCrypto**: Placeholder only - not yet implemented
- **Test Suite**: Located in `tests/` but may be empty/incomplete
- **Multi-language Support**: Python-only at this stage (TypeScript, Go, .NET planned)

## Token-Free Quantum Execution

The **IGNITION** system eliminates the need for IBM Quantum API tokens:
- Aeterna Porta manages quantum job submission autonomously
- Auto-failover across multiple backends
- Self-healing job pipeline with 24/7 operation
- Jobs persist even if client disconnects

This is the core differentiator from traditional quantum SDKs.

## Python Version Requirements

- **Minimum**: Python 3.11
- **Recommended**: Python 3.12
- Required for proper asyncio and type hinting support

## Dependencies

Core:
- `qiskit >= 2.3.0` - Quantum circuit framework
- `qiskit-ibm-runtime >= 0.45.0` - IBM backend integration
- `numpy >= 2.4.0` - Numerical computing
- `scipy >= 1.17.0` - Scientific computing
- `asyncio >= 3.4.3` - Async runtime

Dev:
- `pytest >= 7.4.0` - Testing framework
- `pytest-asyncio >= 0.21.0` - Async test support
- `black >= 23.0.0` - Code formatting
- `mypy >= 1.0.0` - Type checking

## Quick Reference

### Initialize Basic Agent
```python
from copilot_quantum import SovereignAgent

agent = SovereignAgent(
    enable_lambda_phi=True,
    enable_nclm=False,  # Not yet available
    copilot_mode="local"
)
```

### Initialize Enhanced Agent (with NLP)
```python
from copilot_quantum import EnhancedSovereignAgent

agent = EnhancedSovereignAgent(
    enable_lambda_phi=True,
    copilot_mode="local"
)
```

### Execute Quantum Task
```python
result = await agent.execute(
    "Create a quantum entanglement circuit",
    use_quantum=True,
    quantum_params={
        'circuit_type': 'ignition',
        'qubits': 120,
        'shots': 100000
    }
)

if result.quantum_metrics['above_threshold']:
    print("✅ ER=EPR threshold crossed!")
```

### Generate Code from NLP
```python
result = await agent.execute(
    "Write a function to validate email addresses using regex"
)
print(result.code)
```

## Getting Help

- Check `INSTALLATION_AND_USAGE.md` for detailed usage examples
- Run examples in `python/examples/` for working code
- See `README.md` for architecture overview
- Review module docstrings for API details
