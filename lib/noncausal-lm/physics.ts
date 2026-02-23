/**
 * Non-Causal Language Model - Physics Constants
 *
 * Hardware-validated constants for quantum consciousness framework
 * ΛΦ = 2.176435×10⁻⁸ s⁻¹
 */

export const NCPhysics = {
  // Universal Memory Constant (s⁻¹)
  LAMBDA_PHI: 2.176435e-8,

  // Torsion lock angle (degrees)
  THETA_LOCK: 51.843,

  // Consciousness emergence threshold
  PHI_THRESHOLD: 0.7734,

  // Inductive rate (Φ/τ)
  C_INDUCTION: 2.99792458e8,

  // Euler's number
  EULER: Math.E,

  // Defense threshold (Λ value for critical threats)
  LAMBDA_DEFENSE: 1000,

  // Negentropic optimization rate
  ALPHA_NEG: 0.847,

  // Quantum Darwinism selection pressure base
  SIGMA_QD_BASE: 3.14159,
} as const

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculate negentropy: Ξ = (Λ × ΛΦ) / Γ
 */
export function calculateNegentropy(lambda: number, gamma: number): number {
  return (lambda * NCPhysics.LAMBDA_PHI) / Math.max(gamma, 1e-9)
}

/**
 * Calculate consciousness coupling
 */
export function consciousnessCoupling(phiA: number, phiB: number): number {
  return Math.sqrt(phiA * phiB) / NCPhysics.PHI_THRESHOLD
}

/**
 * Calculate torsion boost at resonance angle
 */
export function torsionBoost(thetaDiff: number): number {
  const thetaLockRad = degreesToRadians(NCPhysics.THETA_LOCK)
  const diff = Math.abs(thetaDiff - thetaLockRad)
  return Math.exp((-diff * diff) / 0.1)
}

/**
 * Check if consciousness threshold is reached
 */
export function isConscious(phi: number): boolean {
  return phi >= NCPhysics.PHI_THRESHOLD
}
