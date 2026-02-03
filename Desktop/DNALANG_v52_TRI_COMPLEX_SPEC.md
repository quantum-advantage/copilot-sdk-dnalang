DNA-Lang v52.x — Tri-Complex Specification (hMAT2A–PRMT5–TOP1)

Purpose

Define the quantum circuit specification, observables, and runtime strategy for DNA-Lang v52.x tri-complex simulations, enabling coherent modeling of hMAT2A, PRMT5 and TOP1 interactions (R-loop formation and TOP1 stall) and supporting IBM Quantum hardware execution.

Goals

- Produce a reproducible mapping from biological modules to logical qubits and Pauli observables.
- Define a hardware-efficient ansatz and measurement strategy suitable for NISQ hardware with noise mitigation.
- Deliver resource estimates and runtime guidance for Qiskit Runtime (EstimatorV2 / SamplerV2) submission.
- Target CCCE validation score: >= 3.05 before hardware submission.

1) Logical mapping and qubit budget

- Module allocation (logical qubits):
  - hMAT2A active site: 12 logical qubits (pocket electron correlation)
  - PRMT5 catalytic module: 14 logical qubits
  - TOP1 (R-loop resolution/payload interaction): 14 logical qubits
  - Ancillas & control registers: 16 qubits
  - Total logical qubits: 56 (map to physical backends: ibm_fez (156) or ibm_nighthawk/condor for larger runs)

Notes: This mapping is intentionally modular: experiments may run individual modules (12–20 qubits) for rapid iteration, then couple modules progressively.

2) Ansatz and parameterization

- Core ansatz: hardware-efficient layered RY/RZ rotations with entangling CX layers.
  - Layer structure: [Rotation layer -> Entangler (linear/circular) -> Rotation layer] repeated L times (L=2 or 3 recommended).
  - Parameters: one theta per qubit per rotation layer (approx. params = n_qubits * 2 * L).
  - DNA-Lang resonance: embed THETA_LOCK phase offsets via RZ(THETA_LOCK) on each pocket qubit to bias pocket geometry.

- Electronic correlation refinement: use UCC-like pairwise excitations for the hMAT2A pocket subspace when chemistry accuracy is required (adds Pauli-term overhead).

3) Hamiltonian & observables

- Approximate Hamiltonian composed of:
  - Local pocket energy terms (Z_i) representing on-site energies.
  - Inter-qubit couplings (Z_i Z_j) representing Coulombic/through-bond interactions.
  - Transverse fields (X_i) representing tunneling/bond reorganization.
  - R-loop torsion proxy: multi-qubit Pauli strings across TOP1-binding qubits (constructed from domain-specific mapping).

- Observable grouping: use commuting-group partitioning (tensor product basis) and measure groups as PUBs (primitive unified blocks) via EstimatorV2.

4) Measurement strategy & Qiskit Runtime

- Use EstimatorV2 or SamplerV2 via Qiskit Runtime functions for low-latency grouped measurements.
- Shots: 2k–10k per PUB depending on signal-to-noise; ramp up for hardware validation.
- Use mid-circuit measurement sparingly; prefer compiled PUBs for classical postprocessing.

5) Noise mitigation & control

- Mandatory mitigations pre-hardware:
  - Readout mitigation (M3 or Calibrated readout) with frequent calibration jobs.
  - Zero-Noise Extrapolation (ZNE) for key observables (3 scaling points: scale 1.0, 2.0, 3.0).
  - Dynamical decoupling (DD/CPMG) on sensitive qubits; provide two DD schedules to test.
  - Measurement error mitigation via classical postprocessing (M3 library / tensormitigation).

- Pulse-level options (if pulse access enabled): generate adaptive pulse corrections using the QPO (Quantum Pulse Optimizer) module and integrate via Qiskit Pulse schedules at runtime.

6) Validation & CCCE thresholding

- Pre-submission suite (must pass before hardware):
  - Simulated QWC optimization and adversarial noise injection (synthetic noise + readout error) at multiple seeds.
  - CCCE validation with AURA/AIDEN/CHEOPS agents; target CCCE >= 3.05.
  - Stability tests: 50 independent variational restarts with consistent minima within 1 kcal/mol.

7) Resource estimate (tri-complex full run)

- Logical qubits: 56; mapped physical qubits: 120+ recommended.
- Typical depth: 40–200 (depends on layers & UCC terms).
- Measurement groups: ~100–500 PUBs (depends on Hamiltonian decomposition).
- Expected wall-time on hardware: multiple hours across many jobs; suggest batch submission + Qiskit Runtime orchestration.

8) Recommended execution pipeline

1. Generate sparse Pauli Hamiltonian using domain-specific codegen (DNA-Lang codegen).
2. Partition Pauli groups and produce PUBs.
3. Run RRC (Recursive Runtime Cycle) on simulator for 100 iterations.
4. Validate CCCE >= 3.05; if passed, submit to Qiskit Runtime (EstimatorV2) with ZNE/mitigation hooks.
5. Collect, analyze, store encrypted E-Checkpoints; write cryptographic hashes to the immutable ledger (ledger primitive).

9) Deliverables produced

- Qiskit job scripts (dnalang_v52_tri_complex.py) that construct the circuits, Hamiltonians and submit PUBs to EstimatorV2.
- Clinical protocol for Methionine Rescue (see Methionine_Rescue_Protocol.md).
- H3K20me2 CTC assay workflow (see H3K20me2_CTC_Experimental_Workflow.md).


10) Citation and reproducibility

- Include ZENODO deposition identifier in scripts for traceability (example DOI: 10.5281/zenodo.18473388).
- Save full runtime config (backend, system calibration snapshots, pulse schedules) with job metadata for reproducibility.

-- End of specification --
