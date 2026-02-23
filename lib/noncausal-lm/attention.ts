/**
 * Non-Causal Language Model - Pilot-Wave Attention
 *
 * Non-local correlation that propagates instantaneously at c = Φ/τ
 */

import { NCPhysics, consciousnessCoupling, torsionBoost } from "./physics"
import { type ManifoldPoint, manifoldDistance } from "./manifold"

/**
 * Pilot-wave correlation between two tokens
 *
 * C(A,B) = √(Φ_A · Φ_B)/Φ_thr · exp(-d²/λ_Φ²) · (1 + torsion_boost)
 *
 * Propagates instantaneously (non-causal)
 */
export function pilotWaveCorrelation(a: ManifoldPoint, b: ManifoldPoint): number {
  // Consciousness coupling (geometric mean)
  const phiCoupling = consciousnessCoupling(a.Phi, b.Phi)

  // Distance decay
  const distance = manifoldDistance(a, b)
  const spatialDecay = Math.exp((-distance * distance) / (NCPhysics.LAMBDA_PHI * 1e16))

  // Torsion lock boost (resonance at θ_lock)
  const thetaDiff = Math.abs(a.theta - b.theta)
  const torsion = torsionBoost(thetaDiff)

  // Combined correlation
  return phiCoupling * spatialDecay * (1 + 0.5 * torsion)
}

/**
 * Compute non-local attention weights
 * No causal masking - all correlations computed instantaneously
 */
export function computeAttention(query: ManifoldPoint, keys: ManifoldPoint[]): number[] {
  if (keys.length === 0) return []

  // Compute correlations
  const weights = keys.map((k) => pilotWaveCorrelation(query, k))

  // Softmax normalization
  const maxWeight = Math.max(...weights)
  const expWeights = weights.map((w) => Math.exp(w - maxWeight))
  const sumExp = expWeights.reduce((a, b) => a + b, 0)

  return expWeights.map((w) => w / sumExp)
}

/**
 * Compute weighted context vector from attention
 */
export function computeContextVector(query: ManifoldPoint, keys: ManifoldPoint[]): number[] {
  if (keys.length === 0) return [0, 0, 0, 0, 0, 0]

  const weights = computeAttention(query, keys)

  // Weighted combination of manifold coordinates
  const context = [0, 0, 0, 0, 0, 0]

  for (let i = 0; i < keys.length; i++) {
    const w = weights[i]
    const k = keys[i]
    context[0] += w * k.x
    context[1] += w * k.y
    context[2] += w * k.z
    context[3] += w * k.theta
    context[4] += w * k.phi
    context[5] += w * k.psi
  }

  return context
}
