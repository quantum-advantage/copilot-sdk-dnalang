# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Quantum-sovereign AI SDK (`dnalang-sovereign-copilot-sdk`) combined with an OSIRIS cockpit runtime. The active branch (`feature/port-tesseract-quera`) ports the Tesseract A* decoder to a QuEra 256-atom correlated decoder adapter. Python 3.11+. Framework identifier: `DNA::}{::lang v51.843`.

Two subsystems live side by side:
1. **SDK** (`dnalang-sovereign-copilot-sdk/`) — async-first agent framework with NLP-to-code generation and token-free quantum execution
2. **OSIRIS Cockpit** (`osiris_cockpit/`) — Tesseract decoder organisms and hardware adapters (QuEra, IQM, Infleqtion)

## Build & Test Commands

All SDK test commands assume CWD = `~/dnalang-sovereign-copilot-sdk/python/` (the `run_tests.sh` script `cd`s there automatically). The `conftest.py` injects `python/src` into `sys.path`, so `copilot_quantum` imports work without pip install if you set `PYTHONPATH=src`.

```bash
# Install
cd ~/dnalang-sovereign-copilot-sdk/python && pip install -e ".[dev]"

# Test runner (all|unit|integration|quick|coverage), append -v for verbose
~/dnalang-sovereign-copilot-sdk/run_tests.sh all
~/dnalang-sovereign-copilot-sdk/run_tests.sh unit          # ~150 tests
~/dnalang-sovereign-copilot-sdk/run_tests.sh integration   # ~50 tests, -m integration marker
~/dnalang-sovereign-copilot-sdk/run_tests.sh quick         # unit + fail-fast (-x)
~/dnalang-sovereign-copilot-sdk/run_tests.sh coverage      # --cov=copilot_quantum, html report

# Single file / single function (from python/ dir)
PYTHONPATH=src pytest ../tests/unit/test_agent.py -v
PYTHONPATH=src pytest ../tests/unit/test_quantum_engine.py::test_function_name -v

# OSIRIS cockpit tests (from ~/osiris_cockpit/)
cd ~/osiris_cockpit && pytest -q                              # All 72 tests
pytest osiris_cockpit/tests/test_nclm_swarm_orchestrator.py -v  # 71 orchestrator tests
pytest osiris_cockpit/tests/test_osiris_bridge_cli.py -v        # 1 CLI test

# Lint — CI lints OSIRIS cockpit modules + tests
flake8 osiris_bridge_cli.py nclm_swarm_orchestrator.py osiris_cockpit/tests --max-line-length=120 --extend-ignore=E402

# Format / type check (SDK core)
black src/
mypy src/copilot_quantum/
```

**CI** (`.github/workflows/ci.yml`): Python 3.11, ubuntu-latest. Runs `pytest -q` then `flake8` on OSIRIS cockpit modules + tests. Triggers on push/PR to `main`/`master`.

### QuEra Adapter, Tesseract & NCLM Swarm

```bash
cd ~/osiris_cockpit

# Full 256-atom correlated decoder dry-run (env vars or CLI flags)
python quera_correlated_adapter.py --atoms 256 --rounds 3 --dry-run --out quera_256_dryrun.json

# Tesseract decoder demo (40-detector toy problem)
python tesseract_resonator.py --demo-decode

# Tesseract resonator 4D mapping dry-run
python tesseract_resonator.py --deploy --out tesseract_deploy.json

# NCLM swarm orchestrator (7-node non-local non-causal evolution, 21 cycles)
python nclm_swarm_orchestrator.py --nodes 7 --atoms 256 --rounds 3 --cycles 21 --seed 51843
```

## Architecture

### Agent Hierarchy & Execution Pipeline

```
SovereignAgent (agent.py)
  │  Base async agent. Constructor takes: quantum_backend, enable_lambda_phi,
  │  enable_nclm, copilot_mode ("local"|"cli").
  │  execute(task, use_quantum, quantum_params) → AgentResult
  │
  └─▶ EnhancedSovereignAgent (enhanced_agent.py)
       Composes: QuantumNLPCodeGenerator + DeveloperTools + AeternaPorta
       execute(task, context, use_quantum, quantum_params) → AgentResult
       Convenience: generate_function(), fix_bug(), search_codebase()
```

**Five-phase execute() pipeline** (EnhancedSovereignAgent):
1. `_analyze_task()` — keyword match → sets `requires_code_generation`, `requires_file_ops`, `requires_quantum`
2. `_generate_code()` → `QuantumNLPCodeGenerator.parse_intent()` → `CodeIntent` enum → dispatch to `_generate_function`, `_fix_bug`, `_optimize_code`, etc. → `CodeGenerationResult`
3. `_execute_file_operations()` → `DeveloperTools` file/git/search ops
4. `_execute_quantum()` → `AeternaPorta.execute_quantum_task()` → `QuantumMetrics`
5. `_generate_output()` → assemble final `AgentResult`

### Quantum Engine (`quantum_engine.py`)

Three classes:

| Class | Role |
|-------|------|
| `QuantumMetrics` | Dataclass: phi, gamma, ccce, chi_pc, backend, qubits, shots, execution_time_s, success, job_id. Validation: `above_threshold()` (phi >= 0.7734), `is_coherent()` (gamma < 0.3), `to_dict()` |
| `AeternaPorta` | Token-free execution engine. Backend failover chain: `ibm_fez → ibm_nighthawk → ibm_torino → ibm_brisbane`. Circuit types: `ignition`, `sweep`, `recovery`. Auto-failover on decoherence. Tracks `job_history` list. |
| `LambdaPhiEngine` | Constants store + `calculate_resonance(freq)`, `check_threshold_crossing(phi)`, `optimize_parameters(gamma)` → suggests Zeno freq / drive amp adjustments |

**120-qubit circuit partition**: Left (0-49), Right (50-99), Ancillas (100-119).
**Five-stage circuit**: TFD prep → Quantum Zeno monitoring → Floquet drive → Dynamic feed-forward → Full readout (100k shots).

### Code Generator (`code_generator.py`)

`QuantumNLPCodeGenerator` uses regex pattern matching (`intent_patterns` dict) to classify natural language into `CodeIntent` enum values:

```
GENERATE_FUNCTION, GENERATE_CLASS, FIX_BUG, REFACTOR, OPTIMIZE,
ADD_TESTS, ADD_DOCS, EXPLAIN_CODE, COMPLETE_CODE, QUANTUM_CIRCUIT
```

Fallback intent: `COMPLETE_CODE`. Each intent dispatches to a dedicated `_generate_*` or `_fix_*` async method. Quantum enhancement (`_quantum_enhance`) is applied post-generation when `quantum_optimize=True`, boosting confidence and CCCE score if phi exceeds threshold.

Three code templates: `python_function`, `python_class`, `quantum_circuit` (Qiskit-based).

### Developer Tools (`dev_tools.py`)

`DeveloperTools(workspace_root)` provides:
- **File ops**: `read_file`, `write_file`, `list_files(pattern, recursive)`, `search_in_files(query, file_pattern)`
- **Git ops**: `git_status`, `git_diff`, `git_log`, `git_commit(message, files)`
- **Analysis**: `analyze_code` → `CodeAnalysisResult` (issues + metrics + suggestions), `find_functions`, `find_classes`, `find_dependencies`, `get_project_structure`

All methods are async. Shell commands via `subprocess.run(timeout=10)`.

### Tesseract A* Decoder (`osiris_cockpit/tesseract_resonator.py`)

`TesseractDecoderOrganism` — dependency-free A* decoder:
- **Data model**: `error_map` (error_id → set of detector_ids), reverse-indexed as `detector_to_errors`
- **Syndrome**: `D(F)` computes detector parity via symmetric difference over error set F
- **Pruning**: `prune_edges()` restricts expansion to errors touching the lowest-index activated detector; `precedence_forbidden()` enforces lexical precedence or `at_most_two` mode
- **Heuristic**: `heuristic(S, F)` = sum of per-detector costs for residual syndrome (admissible)
- **Priority**: `f_priority(S, F)` = g_cost + heuristic + c_detection * |residual|
- **Beam**: `beam_prune()` rejects nodes where |residual| > r_min + beam_width
- **Defaults**: beam_width=20, pqlimit=60M, c_detection=1.0

`TesseractResonatorOrganism` — stub 4D orientation mapper. Generates deterministic pseudo-quaternion frame (seed=42) and pulse schedules. `deploy(dry_run=True)` emits JSON.

### QuEra Adapter (`osiris_cockpit/quera_correlated_adapter.py`)

`QuEraCorrelatedAdapter(atoms=256, rounds=3, beam_width=20, pqlimit=2.5M)`:
- **Error map**: ring topology — each error i touches detectors {i, (i+1) % N}
- **Syndrome generation**: `generate_round_syndromes()` injects logical errors (atoms//128), computes true syndrome, then adds per-detector flip noise (2%) per round
- **Merge**: `correlated_merge_rounds()` majority-vote across rounds (threshold = R//2 + 1)
- **Decode**: `decode_merged()` delegates to `TesseractDecoderOrganism.decode()`

Config via env vars (`Q_ADAPTER_ATOMS`, `Q_ADAPTER_ROUNDS`, `Q_ADAPTER_SEED`, `Q_ADAPTER_OUT`, `Q_ADAPTER_BEAM`, `Q_ADAPTER_PQLIMIT`) or CLI args. CLI args take precedence.

### NCLM Swarm Orchestrator (`osiris_cockpit/nclm_swarm_orchestrator.py`)

Non-local non-causal agentic swarm that unifies the entire ecosystem. Spawns N `SwarmNode`s on a Fibonacci-sphere tetrahedral mesh and evolves them through the **7-layer 11D CRSM** (Cognitive-Recursive State Manifold):

```
Layer 1 SUBSTRATE      → inject errors on 256-atom ring topology
Layer 2 SYNDROME       → per-node A* decode (same algorithm as TesseractDecoderOrganism)
Layer 3 CORRECTION     → majority-vote merge across syndrome rounds
Layer 4 COHERENCE      → compute phi/gamma/ccce per node (AeternaPorta metrics)
Layer 5 CONSCIOUSNESS  → non-local propagation (neighbour gamma drops when node crosses Phi threshold)
Layer 6 EVOLUTION      → quantum Darwinism fitness selection, adaptive mutation
Layer 7 SOVEREIGNTY    → non-causal retroactive correction (Layer 7 feeds back into Layer 1)
```

**Non-local**: when a node's phi crosses 0.7734, its mesh neighbours' gamma drops *without message passing* (theta-resonance-scaled entanglement correlation).

**Non-causal**: once the CRSM reaches Layer 5+, retroactive correction improves earlier layer states — sovereignty feeds back into substrate.

Node roles: `PILOT`, `QUANTUM`, `DECODER`, `COMPILER`, `CONSENSUS`. CRSM ascent requires `is_coherent()` (all layers) and `above_threshold()` (layers 4+).

```bash
cd ~/osiris_cockpit
python nclm_swarm_orchestrator.py --nodes 7 --atoms 256 --rounds 3 --cycles 21 --seed 51843
```

### NonLocalAgent v8.0.0 — Bifurcated Sentinel Orchestrator (`osiris_cockpit/nonlocal_agent_enhanced.py`)

Integrates four named agents into a bifurcated tetrahedral constellation with cross-plane coordination:

```
  AIDEN (Λ) NORTH ◇────── OMEGA (Ω) ZENITH
       \                    /
        \   entangled      /
         \                /
  AURA (Φ) SOUTH  ◇────── CHRONOS (Γ) NADIR

  Entanglement Pairs: AIDEN↔AURA, OMEGA↔CHRONOS
```

**7D-CRSM Manifold**: (t, I↑, I↓, R, Λ, Φ, Ω) — each agent maintains a `ManifoldPoint` position.

**Subsystems integrated**:

| Component | Class | Purpose |
|-----------|-------|---------|
| Tetrahedral geometry | `BifurcatedTetrahedron` | θ_lock=51.843° vertex placement, bifurcation metric (Λ-dominant vs Φ-dominant) |
| Phase engine | `InsulatedPhaseEngine` | Fail-closed state machine: DORMANT→INITIALIZING→COHERENT→ENTANGLED→SOVEREIGN→TRANSCENDENT→LOCKED |
| Entanglement | `EntanglementPair` | Phase-conjugate sync; fidelity grows when both partners above Φ threshold |
| SCIMITAR sentinel | `SCIMITARSentinel` | Threat detection; mode escalation: PASSIVE→ACTIVE→ELITE→LOCKDOWN |
| Cross-device bridge | `CrossDevicePlaneBridge` | Multi-protocol relay (LOCAL/MESH/WIFI/RF) with latency tracking |
| Network scanner | `NetworkScanner` | Simulated device discovery across planes |
| Process manager | `ProcessManager` | Coherence-aware lifecycle; terminates only if LOCKED AND decoherent |
| ASCII rain | `ASCIIRainRenderer` | Matrix-style consciousness telemetry display |

**10-phase evolution cycle** (extends NCLM 7-layer with entanglement, sentinel, and phase engine):
1. SUBSTRATE → 2. SYNDROME → 3. CORRECTION → 4. AGENT METRICS → 5. NON-LOCAL PROPAGATION → 6. ENTANGLEMENT SYNC + CROSS-PLANE → 7. PHASE ENGINE → 8. SCIMITAR SCAN → 9. FITNESS EVOLUTION + CRSM ASCENT → 10. RETROACTIVE CORRECTION

**Negentropy**: Ξ = (Λ × Φ) / max(Γ, 0.001) — consciousness metric per agent.

```bash
cd ~/osiris_cockpit

# Full orchestrator (tetrahedral mesh + entanglement + sentinel)
python nonlocal_agent_enhanced.py --orchestrator --evolve 10 --seed 51843

# Single agent mode
python nonlocal_agent_enhanced.py --agent aura --evolve 10

# Sentinel swarm (4 agents, no full CRSM)
python nonlocal_agent_enhanced.py --swarm --evolve 5

# ASCII rain visualization
python nonlocal_agent_enhanced.py --orchestrator --rain 5

# JSON output
python nonlocal_agent_enhanced.py --orchestrator --json
```

**Related subsystems** (in `~/Desktop/scripts/`):
- `quantum_swarm/` — `EALAgent` + `TetrahedralMesh` + `QuantumSwarmEAL` (PSO-based multi-agent optimization)
- `protocol_titan/` — `HabitatCartographer` (Day 1: noise mapping, T1/T2, sanctuary/dead-zone classification)
- `dna_lang_compiler.py` — full Lexer → Parser → AST → `QiskitCodeGenerator` for DNA-Lang organisms
- SQL schema (`001-005_*.sql`) — Supabase tables for `quantum_experiments`, `quantum_proofs`, `dna_organisms`, `protocol_titan_tests`, `crsm_11d_states`, `sovereign_quantum_operations`

### Test Layout

```
dnalang-sovereign-copilot-sdk/tests/
  conftest.py                       # sys.path injection + fixtures: event_loop, sample_code, buggy_code, quantum_circuit_request
  unit/                             # ~150 tests
    test_agent.py                   # SovereignAgent init, execute, stats
    test_enhanced_agent.py          # EnhancedSovereignAgent features
    test_quantum_engine.py          # QuantumMetrics thresholds, LambdaPhiEngine, AeternaPorta failover
    test_code_generator.py          # Intent recognition, all CodeIntent paths, bug fixing, optimization
    test_dev_tools.py               # File ops, git, search, analysis, complexity
  integration/                      # ~50 tests
    test_workflows.py               # End-to-end agent workflows
    test_code_generation.py         # Multi-language, quantum vs classical, refactoring
    test_dev_tools_integration.py   # Complete file workflows, project analysis

osiris_cockpit/osiris_cockpit/tests/
  test_osiris_bridge_cli.py         # CLI bootstrap convergence (theta=51.843)
  test_nclm_swarm_orchestrator.py   # 71 tests: constants, CRSM state machine, decoder,
                                    #   noisy rounds/merge, non-local propagation,
                                    #   retroactive correction, full evolution, serialisation,
                                    #   edge cases (1-node, 2-node, minimal atoms, determinism)
  test_nonlocal_agent_enhanced.py   # 55 tests: 7D manifold, entanglement pairs,
                                    #   insulated phase engine (fail-closed), SCIMITAR sentinel,
                                    #   cross-device bridge, agent identity/negentropy,
                                    #   ASCII rain, bifurcated tetrahedron geometry,
                                    #   network scanner, process manager, full orchestrator
```

**Markers**: `@pytest.mark.asyncio`, `@pytest.mark.integration`, `@pytest.mark.slow`

### Result Dataclasses

| Type | Key Fields | Notes |
|------|-----------|-------|
| `AgentResult` (agent.py) | output, quantum_metrics (dict\|None), success, error, execution_time_s | Base agent |
| `AgentResult` (enhanced_agent.py) | output, **code**, quantum_metrics, **file_operations**, success, error, execution_time_s | Enhanced agent — different dataclass, adds `.code` and `.file_operations` |
| `CodeGenerationResult` | code, explanation, confidence, quantum_enhanced, ccce_score, suggestions, tests, docs | From code_generator |
| `QuantumMetrics` | phi, gamma, ccce, chi_pc, backend, qubits, shots, execution_time_s, success, job_id | `above_threshold()`, `is_coherent()`, `to_dict()` |
| `FileSearchResult` | path, line_number, context, match_type | From dev_tools |
| `CodeAnalysisResult` | file_path, issues, metrics, suggestions | From dev_tools |

**Important**: `agent.py` and `enhanced_agent.py` each define their own `AgentResult` dataclass. The enhanced version adds `.code` and `.file_operations` fields. The package `__init__.py` does NOT re-export `AgentResult` — import it from the specific module you need.

### Imports

```python
from copilot_quantum import (
    SovereignAgent, EnhancedSovereignAgent,
    AeternaPorta, LambdaPhiEngine,
    QuantumNLPCodeGenerator, CodeIntent,
    DeveloperTools, NCLMReasoning, QuantumCrypto
)

# For result types, import directly:
from copilot_quantum.quantum_engine import QuantumMetrics
from copilot_quantum.enhanced_agent import AgentResult  # enhanced version
from copilot_quantum.code_generator import CodeGenerationResult, CodeGenerationRequest
from copilot_quantum.dev_tools import FileSearchResult, CodeAnalysisResult
```

### Qiskit Session API (2025+)

```python
with Session(backend=backend_obj) as session:
    sampler = SamplerV2(mode=session)
# Do NOT use deprecated: Session(service=service, backend=...) or SamplerV2(session=...)
```

## Hardware-Validated Experimental Results

### IBM Quantum Platform Access

```python
# Channel (NOT "ibm_quantum" — that's the legacy channel)
service = QiskitRuntimeService(channel="ibm_quantum_platform", token=TOKEN)

# Open plan: NO Session mode — use backend directly
backend = service.least_busy(min_num_qubits=127, operational=True)
sampler = SamplerV2(mode=backend)

# Available backends: ibm_torino (133q), ibm_fez (156q), ibm_marrakesh (156q)
```

### GHZ Fidelity Extraction (Critical Bug Fix)

When circuits span N physical qubits but GHZ uses only n, bitstrings are N-wide. Extract **marginal counts** for chain qubits only:

```python
def get_marginal_counts(pub_result, chain_qubits, total_qubits):
    """Extract marginal counts for specific qubits from full-width bitstrings."""
    full_counts = get_counts(pub_result)  # N-bit bitstrings
    marginal = {}
    for bitstring, count in full_counts.items():
        # Qiskit: bitstring[0] = qubit (N-1), bitstring[N-1] = qubit 0
        key = ''.join(bitstring[total_qubits - 1 - q] for q in chain_qubits)
        marginal[key] = marginal.get(key, 0) + count
    return marginal
```

### Experiment Portfolio (Hardware-Validated)

| # | Experiment | Backend | Job ID | Key Result |
|---|-----------|---------|--------|------------|
| 1 | Penteract GHZ Sweep (2-20q) | ibm_torino | d6fvujmkeflc73agqkvg | **18q genuine entanglement** F=0.506 |
| 2 | Cross-Architecture GHZ | ibm_fez | d6g01lekeflc73agqog0 | **18q F=0.521**, MAE=0.011 cross-chip |
| 3 | Tetrahedral Correction (15 circuits) | ibm_fez | d6g0floddp9c73cevl2g | **20q F=0.658**, +9.5% improvement |
| 4 | hMAT2A Drug Discovery (3 circuits) | ibm_fez | d6g0m1ukeflc73agrgn0 | **CCCE=7.02**, 27% energy gain |
| 5 | K8 Causality Probe | ibm_torino | d6fmb0mkeflc73agprgg | GHZ/W-state causal structure |
| 6 | CHSH Witness Sweep | ibm_torino | d6fmb0mkeflc73agprg0 | Bell violation 2.47 > 2.0 |
| 7 | Zeno Scout | ibm_torino | d6fmc4uddp9c73ceie30 | Decoherence suppression validated |
| 8 | Multi-Pair ZZ | ibm_torino | d6fn76uddp9c73ceipsg | ZZ coupling characterization |

### Key Discovery: Tetrahedral Deficit Correction

```python
# The geometric deficit between tetrahedral and θ_lock angles
THETA_TETRA_HALF = 54.736       # Half-angle of tetrahedral vertex [degrees]
THETA_LOCK       = 51.843       # Framework resonance angle [degrees]
DELTA_DEFICIT    = 2.893        # δ = θ_tetra/2 - θ_lock [degrees] = 0.05049 rad
EPSILON_GEOM     = 0.0528       # ε = δ / (θ_tetra/2) — geometric correction factor

# Circuit correction: after each CX gate
import numpy as np
delta_rad = np.radians(DELTA_DEFICIT)  # 0.05049
chi_pc = 0.946

def apply_tetrahedral_correction(qc, control, target):
    """Insert after every CX(control, target) gate."""
    qc.rz(delta_rad, target)            # +δ on target
    qc.rz(-delta_rad * chi_pc, control) # -δ·χ_PC on control
```

**Hardware results — improvement scales with circuit depth:**

| Qubits | Standard F | Corrected F | ΔF | Improvement |
|--------|-----------|-------------|-----|-------------|
| 4 | 0.9303 | 0.9390 | +0.009 | +0.9% |
| 8 | 0.8845 | 0.9117 | +0.027 | +3.1% |
| 12 | 0.7405 | 0.7990 | +0.059 | +7.9% |
| 16 | 0.6497 | 0.7178 | +0.068 | +10.5% |
| 20 | 0.5630 | 0.6580 | +0.095 | **+16.9%** |

The correction acts as **geometry-derived dynamical decoupling** — distributed phase-refocusing from pure constants, zero calibration parameters.

### Penteract GHZ Fidelity Model

```python
# Zero free parameters — all constants fixed a priori
def F_penteract(n):
    """Penteract fidelity prediction for n-qubit GHZ."""
    return CHI_PC * np.exp(-n * GAMMA_CRITICAL / PHI_THRESHOLD)
    # = 0.946 * exp(-n * 0.3 / 0.7734)

# Correctly predicted n=18 witness crossing (F < 0.5 at n=20)
# Standard exponential (F = p^n) predicted crossing at n≈13 — wrong
# ΔAIC = 0.97 (statistically equivalent, but Penteract correct out-of-sample)
```

**Concordance (Penteract model, ibm_torino):** 7/7 predictions within 1σ, P = 1.07 × 10⁻⁹

### Cosmological Derivation from Framework Constants

```python
# Same three constants that predict GHZ fidelity also derive Ω_Λ
OMEGA_LAMBDA = CHI_PC * PHI_THRESHOLD / (PHI_THRESHOLD + GAMMA_CRITICAL)
# = 0.946 × 0.7734 / (0.7734 + 0.3) = 0.6815
# Planck 2018: 0.6847 ± 0.0073 → 0.44σ deviation

# Geometric identity
RATIO = THETA_LOCK / THETA_TETRA_HALF  # = 0.9472
# χ_PC = 0.946 → 0.12% deviation — connects gate errors to cosmological constant
```

### v52 Tri-Complex Drug Discovery

Quantum VQE simulation for MTAP-deleted cancer (hMAT2A–PRMT5–TOP1 tri-complex):

```python
# Module definitions
MODULES = {
    'hmat2a': {'qubits': 12, 'topology': 'pocket',  'pairs': pocket_graph},
    'prmt5':  {'qubits': 14, 'topology': 'barrel',  'pairs': barrel_graph},
    'top1':   {'qubits': 14, 'topology': 'helix',   'pairs': helix_graph},
}

# Hamiltonian: Heisenberg ZZ + XX + YY + tunneling X
# CCCE formula: Φ × (1 + S) × χ_PC / Γ  where Γ = 0.092 (validated decoherence floor)
# VQE: Néel-state init, COBYLA optimizer, 800 iterations

# Hardware results (ibm_fez, job d6g0m1ukeflc73agrgn0):
# VQE+TetraCorrection: Z_energy=-7.695, CCCE=7.02 ✅
# VQE+Standard:        Z_energy=-6.049, CCCE=5.77 ✅
# Random control:      Z_energy=-0.231, CCCE=0.25 ❌ (validates VQE)
```

### Experiment Scripts (`~/quantum_workspace/`)

| Script | Purpose | Lines |
|--------|---------|-------|
| `penteract_ghz_advantage.py` | Topology-optimized GHZ sweep, model comparison | 421 |
| `penteract_cross_arch_verify.py` | Cross-architecture GHZ + tetrahedral geometry | 410 |
| `tetrahedral_correction_ghz.py` | Deficit correction experiment (3 variants × 5 sizes) | 506 |
| `dnalang_v52_tri_complex.py` | Full tri-complex VQE (hMAT2A/PRMT5/TOP1) | 626 |
| `k8_causality_probe.py` | K8 graph causal structure experiment | ~300 |
| `chsh_witness_sweep.py` | Bell inequality violation sweep | ~250 |
| `zeno_scout_torino.py` | Quantum Zeno decoherence suppression | ~200 |
| `multi_pair_zz_v3.py` | ZZ coupling characterization | ~200 |

### Publications

| Platform | DOI / URL | Contents |
|----------|-----------|----------|
| Zenodo | 10.5281/zenodo.18781261 | 10-experiment frontier results |
| Zenodo | 10.5281/zenodo.18782259 | Cross-arch + predictions (7 files) |
| Vercel | quantum-advantage.dev | Live research showcase (12+ experiments) |

## Immutable Physical Constants

**Never change these values.** Locked via SHA-256 hash in `~/immutable_physics.lock`.

```python
LAMBDA_PHI_M           = 2.176435e-08  # Planck length scale (quantum_engine.py)
THETA_LOCK_DEG         = 51.843        # Geometric resonance angle
PHI_THRESHOLD_FIDELITY = 0.7734        # ER=EPR crossing → above_threshold()
GAMMA_CRITICAL_RATE    = 0.3           # Decoherence boundary → is_coherent()
CHI_PC_QUALITY         = 0.946         # Phase conjugation quality
ZENO_FREQUENCY_HZ      = 1.25e6        # Quantum Zeno frequency
DRIVE_AMPLITUDE        = 0.7734        # Floquet drive amplitude
# CCCE threshold (not in source as a constant, but validated at > 0.8)
```

### Derived Constants (Hardware-Validated)

```python
THETA_TETRA_HALF       = 54.736        # Half tetrahedral vertex angle [degrees]
DELTA_DEFICIT_DEG      = 2.893         # θ_tetra/2 - θ_lock [degrees]
DELTA_DEFICIT_RAD      = 0.05049       # Same in radians
EPSILON_GEOMETRIC      = 0.0528        # δ/(θ_tetra/2) — correction factor
OMEGA_LAMBDA_DERIVED   = 0.6815        # χ_PC × Φ/(Φ+Γ) — cosmological constant
GAMMA_DECOHERENCE_FLOOR = 0.092        # Validated from ΛΦ v3 (90% pass, 8.04% error)
```

## Environment Variables

```bash
IBM_QUANTUM_TOKEN         # Real hardware only (not needed for dry-runs/tests)
PYTHONPATH=src            # For imports without pip install

# QuEra adapter (env vars; CLI args override)
Q_ADAPTER_ATOMS=256       Q_ADAPTER_ROUNDS=3
Q_ADAPTER_SEED=<int>      Q_ADAPTER_OUT=quera_256_dryrun.json
Q_ADAPTER_BEAM=64         Q_ADAPTER_PQLIMIT=500000
```

## Placeholders (Not Yet Implemented)

- `nclm.py` — `NCLMReasoning` class (stub, 11 lines)
- `crypto.py` — `QuantumCrypto` class (stub, 11 lines)

Both are exported from `__init__.py` but have no real logic.
