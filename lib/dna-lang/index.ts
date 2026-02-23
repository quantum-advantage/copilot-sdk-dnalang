/**
 * DNA-Lang Core Exports
 * Biological Computing Framework
 */

export * from "./quantum-state"
export * from "./living-component"
export * from "./evolutionary-router"
export * from "./protein-synthesis"

// Re-export 11D-CRSM modules
export * from "../11dcrsm"
export * from "../11dcrsm/hooks"
export * from "../11dcrsm/kyber-security"

// Lambda-Phi Universal Memory Constant
export const LAMBDA_PHI = 2.176e-8 // s⁻¹

// DNA-Lang version
export const DNA_LANG_VERSION = "5.0.0"

// Quantum computing constants
export const QUANTUM_CONSTANTS = {
  PLANCK: 6.62607015e-34, // J⋅s
  BOLTZMANN: 1.380649e-23, // J/K
  AVOGADRO: 6.02214076e23, // mol⁻¹
  GOLDEN_RATIO: 1.618033988749895,
}

/**
 * Calculate system coherence based on Lambda-Phi
 */
export function calculateCoherence(temperature: number, time: number): number {
  // Coherence decays exponentially with Lambda-Phi
  return Math.exp(-LAMBDA_PHI * time) * (300 / temperature)
}

/**
 * Negentropic evolution score
 */
export function calculateNegentropy(order: number, complexity: number): number {
  return order * complexity * QUANTUM_CONSTANTS.GOLDEN_RATIO
}
