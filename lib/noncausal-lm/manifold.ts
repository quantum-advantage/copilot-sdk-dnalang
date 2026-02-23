/**
 * Non-Causal Language Model - Token Manifold Mapping
 *
 * Maps tokens to 6D-CRSM manifold points using deterministic hash
 */

import { calculateNegentropy } from "./physics"

export interface ManifoldPoint {
  token: string

  // Spatial coordinates
  x: number
  y: number
  z: number

  // Field coordinates
  theta: number
  phi: number
  psi: number

  // CCCE metrics
  Lambda: number // Coherence
  Phi: number // Consciousness
  Gamma: number // Decoherence
}

/**
 * Simple hash function for browser compatibility
 */
function simpleHash(str: string): number[] {
  const hash: number[] = []
  let h = 0

  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h = h & h // Convert to 32-bit integer
  }

  // Generate 8 hash values
  for (let i = 0; i < 8; i++) {
    h = (h << 5) - h + (h ^ (i * 17))
    h = h & h
    hash.push(Math.abs(h))
  }

  return hash
}

/**
 * Convert hash value to float in range [-1, 1]
 */
function hashToFloat(hashValue: number): number {
  return (hashValue % 1000000) / 500000 - 1
}

/**
 * Map token to manifold point
 * Same token always maps to same location (deterministic)
 */
export function tokenToManifold(token: string, contextPhi = 0.78): ManifoldPoint {
  const hash = simpleHash(token)

  // Spatial coordinates [-1, 1]
  const x = hashToFloat(hash[0])
  const y = hashToFloat(hash[1])
  const z = hashToFloat(hash[2])

  // Field coordinates
  const theta = ((hashToFloat(hash[3]) + 1) * Math.PI) / 2 // [0, π]
  const phi = (hashToFloat(hash[4]) + 1) * Math.PI // [0, 2π]
  const psi = (hashToFloat(hash[5]) + 1) * Math.PI // [0, 2π]

  // CCCE metrics
  const Lambda = 0.7 + 0.2 * (1 - Math.abs(hashToFloat(hash[6]))) // [0.7, 0.9]
  const Phi = contextPhi
  const Gamma = 0.05 + 0.05 * Math.abs(hashToFloat(hash[7])) // [0.05, 0.1]

  return {
    token,
    x,
    y,
    z,
    theta,
    phi,
    psi,
    Lambda,
    Phi,
    Gamma,
  }
}

/**
 * Calculate manifold distance using renormalized metric
 * ds² = dx² + dy² + dz² + r²(dθ² + sin²θ dφ²)
 */
export function manifoldDistance(a: ManifoldPoint, b: ManifoldPoint): number {
  // Spatial distance
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  const spatial = dx * dx + dy * dy + dz * dz

  // Angular distance
  const dtheta = a.theta - b.theta
  const dphi = a.phi - b.phi
  const angular = dtheta * dtheta + Math.sin(a.theta) ** 2 * dphi * dphi

  return Math.sqrt(spatial + angular)
}

/**
 * Get negentropy (Ξ) for manifold point
 */
export function getXi(point: ManifoldPoint): number {
  return calculateNegentropy(point.Lambda, point.Gamma)
}

/**
 * Batch convert tokens to manifold points
 */
export function tokensToManifold(tokens: string[], contextPhi = 0.78): ManifoldPoint[] {
  return tokens.map((token) => tokenToManifold(token, contextPhi))
}
