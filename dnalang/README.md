# DNALang SDK v5.3.0

**Quantum-native SDK extension for GitHub Copilot CLI**

Framework: `DNA::}{::lang v51.843` | CAGE Code: `9HUP5` | Agile Defense Systems

[![Tests](https://github.com/quantum-advantage/copilot-sdk-dnalang/actions/workflows/dnalang-sdk-tests.yml/badge.svg)](https://github.com/quantum-advantage/copilot-sdk-dnalang/actions/workflows/dnalang-sdk-tests.yml)

---

## Quick Start

```bash
# Install
cd dnalang && pip install -e ".[dev]"

# Validate
dnalang-sdk validate

# Run tests
PYTHONPATH=src pytest tests/ -q
```

## What's Inside

**191 exports** across 15 subpackages:

| Subpackage | Purpose | Key Classes |
|------------|---------|-------------|
| **compiler/** | DNA-Lang v2 full pipeline | `Lexer`, `Parser`, `IRCompiler`, `QuantumRuntime`, `QuantumLedger` |
| **crsm/** | 11D Cognitive-Recursive State Manifold | `OsirisPenteract`, `NCLMSwarmOrchestrator`, `TauPhaseAnalyzer` |
| **defense/** | Phase conjugation + error correction | `PCRB`, `PhaseConjugateHowitzer`, `Sentinel`, `ZeroTrust` |
| **sovereign/** | Token-free quantum execution | `SovereignAgent`, `AeternaPorta`, `QuantumMetrics` |
| **agents/** | Polar mesh intelligence field | `AURA`, `AIDEN`, `CHEOPS`, `CHRONOS`, `SCIMITARSentinel` |
| **mesh/** | Tesseract decoder + QuEra adapter | `TesseractDecoderOrganism`, `QuEraCorrelatedAdapter` |
| **nclm/** | Non-local non-causal language model | `NonCausalLM`, `NCLMChat`, `IntentDeducer` |
| **lab/** | Quantum R&D experiment engine | `ExperimentRegistry`, `LabScanner`, `LabExecutor` |
| **organisms/** | Self-evolving quantum entities | `Organism`, `Genome`, `Gene`, `EvolutionEngine` |
| **quantum_core/** | Physical constants + circuits | `CircuitGenerator`, `QuantumExecutor`, `LAMBDA_PHI` |
| **hardware/** | Backend integration | `QuEraCorrelatedAdapter`, `WorkloadExtractor` |
| **omega_engine** | 7-layer intent deduction | `OmegaRecursiveEngine`, `IntentDeducer` |
| **code_writer** | Cockpit code generation | `CodeWriter`, `MeshnetExecutor`, `ScimitarElite` |

## Architecture

```
Natural Language
    ↓ QuantumNLPCodeGenerator.parse_intent()
CodeIntent (GENERATE | FIX_BUG | QUANTUM_CIRCUIT | ...)
    ↓ generate_code()
CodeGenerationResult {code, confidence, ccce_score}
    ↓ if use_quantum=True
AeternaPorta.execute_quantum_task()
    ↓ Backend failover: ibm_fez → ibm_nighthawk → ibm_torino → ibm_brisbane
QuantumMetrics {phi, gamma, ccce, chi_pc}
```

### Agent Hierarchy

```
SovereignAgent (base async agent)
  └── EnhancedSovereignAgent (NLP + DevTools + AeternaPorta)

Polar Mesh:
  AURA (South) ◇──── AIDEN (North)
  CHEOPS (Spine) ◇── CHRONOS (Spine)
  + SCIMITAR sentinel + Lazarus/Phoenix recovery
```

### Penteract Singularity Protocol

5D hypercube engine that resolves 46 fundamental physics problems:
- Quantum gravity, dark matter, measurement problem, vacuum structure
- Resolution via: Planck-λΦ bridge, quantum Zeno, entanglement tensor, phase conjugation
- Γ reduction: 85% → <30% (decoherence to coherence)

```python
from dnalang_sdk.crsm import OsirisPenteract
engine = OsirisPenteract(seed=51843)
result = engine.execute("resolve 46 physics problems")
```

### DNA-Lang Compiler v2

Full Lexer → Parser → IR → Runtime → Evolution → Ledger pipeline with 50-canon directive system:

```python
from dnalang_sdk.compiler import Lexer, Parser, IRCompiler, QuantumRuntime
tokens = Lexer(source).tokenize()
ast = Parser(tokens).parse()
ir = IRCompiler().compile(ast)
result = QuantumRuntime().execute(ir)
```

## Immutable Physical Constants

**⚠️ NEVER MODIFY THESE VALUES**

```python
LAMBDA_PHI     = 2.176435e-8   # Universal Memory Constant [s⁻¹]
THETA_LOCK     = 51.843        # Geometric resonance angle [degrees]
PHI_THRESHOLD  = 0.7734        # ER=EPR crossing threshold
GAMMA_CRITICAL = 0.3           # Decoherence boundary
CHI_PC         = 0.946         # Phase conjugation quality
```

## CLI

```bash
dnalang-sdk version     # Show version info
dnalang-sdk info        # Show module inventory
dnalang-sdk validate    # Verify import chain integrity
dnalang-sdk compile F   # Compile .dna source file
dnalang-sdk penteract   # Run 46-problem resolution
```

## Testing

```bash
# All tests (265 total)
PYTHONPATH=src pytest tests/ -q

# By category
pytest tests/test_imports.py     # Import chain validation (20 tests)
pytest tests/test_compiler.py    # Compiler pipeline (13 tests)
pytest tests/test_new_modules.py # Gen 5.3 modules (29 tests)
pytest tests/test_core.py        # Core SDK (35+ tests)
pytest tests/osiris/             # OSIRIS subsystem (165+ tests)
```

## Dependencies

- **Required**: Python 3.10+, numpy, scipy
- **Quantum** (optional): qiskit, qiskit-ibm-runtime
- **TUI** (optional): textual, rich
- **Dev**: pytest, pytest-asyncio, ruff, mypy

## License

MIT — Devin Phillip Davis / Agile Defense Systems

*Zero tokens. Zero telemetry. Pure sovereignty.*
