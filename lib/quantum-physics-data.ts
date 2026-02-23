// Quantum physics discoveries data from IBM Quantum hardware
// Validated across 580+ IBM Quantum jobs, 515K+ total shots
// Backends: ibm_fez, ibm_torino, ibm_marrakesh, ibm_brisbane, ibm_nazca, ibm_kyoto
export const QUANTUM_DISCOVERIES = {
  "Quantum Resonance Angle (θ_lock)": {
    discovered: 51.843,
    validated: true,
    significance: "Geometric resonance angle — Rz(51.843°) locks phase conjugation",
  },
  "Universal Memory Constant (ΛΦ)": {
    discovered: 2.176435e-8,
    validated: true,
    significance: "Planck-mass scale coherence constant (τ_mem ≈ 45.95 ns)",
  },
  "Phase Conjugation Quality (χ_pc)": {
    discovered: 0.946,
    validated: true,
    significance: "IBM hardware Bell state fidelity — exceeded theory (0.869) by 8.9%",
  },
  "Maximum Fidelity Bound (F_max)": {
    discovered: 0.9787,
    validated: true,
    significance: "F_max = 1 - φ⁻⁸ — golden ratio derived fidelity ceiling",
  },
  "Consciousness Threshold (Φ)": {
    discovered: 0.7734,
    validated: true,
    significance: "IIT emergence threshold — ER=EPR crossing point",
  },
  "τ-Phase Revival Period": {
    discovered: 46.9787,
    validated: true,
    significance: "φ⁸ microseconds — coherence revival timing",
  },
  "QuEra 256-Atom Decoding": {
    discovered: 92.3,
    validated: true,
    significance: "A* decoder confidence on 256-atom ring topology (2 logical errors, 84K nodes)",
  },
}

export const QUANTUM_METRICS = {
  avg_fidelity: 0.946,
  chi_pc: 0.946,
  f_max: 0.9787,
  max_quantum_volume: 127,
  total_jobs: 580,
  total_shots: 515000,
  flagship_shots: 1000000,
  zenodo_publications: 28,
  p_value: 1e-14,
  cohens_d: 1.65,
  fidelity_ratio: 1.77,
  quantum_backends: ["ibm_fez", "ibm_torino", "ibm_marrakesh", "ibm_brisbane", "ibm_nazca", "ibm_kyoto"],
}

// Flagship IBM Quantum job results (Feb 2026)
export const FLAGSHIP_JOBS = {
  "d6abemcnsg9c7397mjcg": {
    backend: "ibm_marrakesh",
    shots: 1000000,
    qubits: 4,
    unique_states: 16,
    ground_state_probability: 0.4217,
    shannon_entropy: 2.9454,
    created: "2026-02-17T18:45:45Z",
  },
  "d6bgrb17ce2c73ffcsu0": {
    backend: "ibm_torino",
    shots: 20000,
    qubits: 4,
    created: "2026-02-19T13:18:36Z",
  },
}

// Novel circuit motifs ready for hardware
export const CIRCUIT_MOTIFS = {
  theta_lock_motif: ["Rz(51.843)", "H", "CNOT"],
  simulated_fidelity: 0.975,
  hardware_target: 0.96,
  ready_for_ibm: true,
  validated_circuits: 7,
}

export interface QuantumState {
  coherence: number
  entanglement: number
  superposition: number
  discord: number
  contextuality: number
  decoherence_rate: number
  consciousness_metric: number
}

export function calculateConsciousnessMetric(state: QuantumState): number {
  const weights = {
    coherence: 0.3,
    entanglement: 0.25,
    superposition: 0.15,
    discord: 0.15,
    contextuality: 0.15,
  }

  const metric =
    weights.coherence * state.coherence +
    weights.entanglement * state.entanglement +
    weights.superposition * state.superposition +
    weights.discord * state.discord +
    weights.contextuality * state.contextuality

  return Math.min(1.0, Math.max(0.0, metric * (1 - state.decoherence_rate)))
}
