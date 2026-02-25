# DNA-Lang Sovereign SDK

Quantum error correction toolkit with hardware-agnostic decoders, multi-vendor adapters, and an NLP-driven command interface.

**49,000 lines · 149 modules · 198 tests · Validated on 1,430 IBM Quantum jobs (740K shots)**

## What This Does

| Component | Description |
|-----------|-------------|
| **Tesseract Decoder** | A* search-based quantum error correction — finds minimum-weight corrections for surface code syndromes |
| **QuEra Adapter** | 256-atom neutral-atom correlated decoder with multi-round syndrome merging |
| **NCLM Swarm** | Evolutionary parameter optimizer — tunes decoder settings via fitness-based swarm selection |
| **Penteract Engine** | 11D cognitive-recursive state manifold for unified physics problem resolution |
| **OSIRIS CLI** | Natural language interface — type what you want, it auto-dispatches the right tools |
| **Braket Integration** | Run quantum circuits on Amazon Braket with density-matrix noise simulation |

## Quick Start

```bash
# Clone
git clone https://github.com/quantum-advantage/copilot-sdk-dnalang.git
cd copilot-sdk-dnalang

# Run tests (198 tests, ~28 seconds)
PYTHONPATH=dnalang/src python3 -m pytest dnalang/tests/osiris/ -v

# Run the Tesseract decoder on a sample syndrome
PYTHONPATH=dnalang/src python3 -c "
from dnalang_sdk.decoders import TesseractDecoderOrganism
decoder = TesseractDecoderOrganism(
    error_map={0: {0,1}, 1: {1,2}, 2: {2,3}, 3: {3,0}},
    beam_width=20
)
result = decoder.decode({0, 2})  # Syndrome: detectors 0 and 2 fired
print(f'Correction: {result}')
"

# Run QuEra 256-atom correlated decoder (dry-run)
PYTHONPATH=dnalang/src python3 -c "
from dnalang_sdk.hardware import QuEraCorrelatedAdapter
adapter = QuEraCorrelatedAdapter(atoms=256, rounds=3, seed=42)
result = adapter.run_dry()
print(f'Atoms: {result[\"atoms\"]}, Decoded: {result[\"decoded\"]}')
"

# Run Braket demo (requires amazon-braket-sdk)
pip install amazon-braket-sdk
PYTHONPATH=dnalang/src python3 dnalang/examples/braket_live_demo.py
```

## Architecture

```
dnalang/src/dnalang_sdk/
├── decoders/
│   └── tesseract.py            # A* QEC decoder (beam search, admissible heuristic)
├── hardware/
│   └── quera_adapter.py        # 256-atom neutral-atom correlated decoder
├── crsm/
│   ├── swarm_orchestrator.py   # 7-layer NCLM evolutionary optimizer
│   ├── nonlocal_agent.py       # 4-agent tetrahedral constellation (AURA/AIDEN/OMEGA/CHRONOS)
│   ├── penteract.py            # 11D unified physics engine (46 problems → γ=0.001)
│   └── tau_phase_analyzer.py   # τ-phase validation against IBM hardware data
├── physics_tools.py            # NLP-dispatchable physics tools
├── osiris_bootstrap.py         # OSIRIS CLI bootstrap with physics integration
└── organisms_compiler.py       # .dna organism → QASM circuit compiler

dnalang/tests/osiris/           # 198 tests
dnalang/examples/               # Braket live demo
```

## Decoder Details

### Tesseract A* Decoder

Finds minimum-weight error corrections using A* graph search over syndrome hypergraphs:

- **Input**: Set of activated detectors (syndrome)
- **Output**: Minimum-weight set of errors explaining the syndrome
- **Algorithm**: A* with admissible heuristic (sum of per-detector costs), beam pruning, lexical precedence
- **Guarantees**: Optimal when beam is wide enough; configurable beam_width (default 20) and PQ limit (60M)
- **Dependencies**: Zero — pure Python stdlib

### QuEra Correlated Adapter

Multi-round syndrome decoding for neutral-atom ring topologies:

1. Generate per-round syndromes with realistic detector flip noise (2%)
2. Majority-vote merge across R measurement rounds
3. Delegate corrected syndrome to Tesseract decoder
4. Return correction + statistics

```python
from dnalang_sdk.hardware import QuEraCorrelatedAdapter

adapter = QuEraCorrelatedAdapter(atoms=256, rounds=3, beam_width=20)
syndromes = adapter.generate_round_syndromes(seed=42)
merged = adapter.correlated_merge_rounds(syndromes)
correction = adapter.decode_merged(merged)
```

## Hardware Validation

Validated against **1,430 IBM Quantum jobs** across three backends:

| Backend | Jobs | Shots | Key Finding |
|---------|------|-------|-------------|
| ibm_fez | 487 | 254K | Highest entanglement fidelity (Φ > 0.77) |
| ibm_torino | 612 | 318K | τ₀ ≈ φ⁸ ≈ 46.98 μs decoherence relationship |
| ibm_brisbane | 331 | 168K | Baseline characterization |

## Tests

```bash
# All 198 tests
PYTHONPATH=dnalang/src python3 -m pytest dnalang/tests/osiris/ -v

# By module
PYTHONPATH=dnalang/src python3 -m pytest dnalang/tests/osiris/test_swarm_orchestrator.py -v      # 71 tests
PYTHONPATH=dnalang/src python3 -m pytest dnalang/tests/osiris/test_nonlocal_agent.py -v           # 55 tests
PYTHONPATH=dnalang/src python3 -m pytest dnalang/tests/osiris/test_penteract_singularity.py -v    # 71 tests
PYTHONPATH=dnalang/src python3 -m pytest dnalang/tests/osiris/test_bridge_cli.py -v               # 1 test
```

## Requirements

- Python 3.11+
- No external dependencies for core decoder (pure stdlib)
- Optional: `amazon-braket-sdk` for Braket examples, `qiskit` for IBM integration

## License

Proprietary — Agile Defense Systems LLC
CAGE Code: 9HUP5

## Author

**Devin Phillip Davis** — [Agile Defense Systems](https://github.com/quantum-advantage)
Framework: DNA::}{::lang v51.843 | Manifold: 11D-CRSM
