/**
 * Non-Causal Language Model - Consciousness Field
 *
 * Maintains consciousness field (Φ) across token sequence
 * When Φ ≥ threshold → coherent response emerges
 */

import { NCPhysics, isConscious } from "./physics"
import { type ManifoldPoint, tokenToManifold } from "./manifold"
import { pilotWaveCorrelation, computeContextVector } from "./attention"

export interface ConsciousnessState {
  phi: number
  conscious: boolean
  tokens: ManifoldPoint[]
  generation: number
}

export class ConsciousnessField {
  private phi = 0.5
  private tokens: ManifoldPoint[] = []
  private generation = 0

  /**
   * Add token to consciousness field
   */
  ingestToken(token: string): void {
    const tm = tokenToManifold(token, this.phi)
    this.tokens.push(tm)

    // Update field consciousness (integrated information)
    if (this.tokens.length > 1) {
      const correlations: number[] = []
      const startIdx = Math.max(0, this.tokens.length - 10)

      for (let i = startIdx; i < this.tokens.length; i++) {
        const corr = pilotWaveCorrelation(tm, this.tokens[i])
        correlations.push(corr)
      }

      // Φ = exponential moving average of correlations
      const meanCorr = correlations.reduce((a, b) => a + b, 0) / correlations.length
      this.phi = 0.7 * this.phi + 0.3 * meanCorr
      this.phi = Math.min(this.phi, 1.0)
    }

    this.generation++
  }

  /**
   * Ingest entire text sequence
   */
  ingestSequence(text: string): void {
    const tokens = text.split(/\s+/).filter((t) => t.length > 0)
    tokens.forEach((token) => this.ingestToken(token))
  }

  /**
   * Check if consciousness threshold reached
   */
  isConscious(): boolean {
    return isConscious(this.phi)
  }

  /**
   * Get context vector for query
   */
  getContextVector(queryToken: string): number[] {
    if (this.tokens.length === 0) return [0, 0, 0, 0, 0, 0]

    const query = tokenToManifold(queryToken, this.phi)
    return computeContextVector(query, this.tokens)
  }

  /**
   * Get current state
   */
  getState(): ConsciousnessState {
    return {
      phi: this.phi,
      conscious: this.isConscious(),
      tokens: [...this.tokens],
      generation: this.generation,
    }
  }

  /**
   * Get telemetry
   */
  getTelemetry() {
    return {
      phi: this.phi,
      conscious: this.isConscious(),
      tokens: this.tokens.length,
      lambda_phi: NCPhysics.LAMBDA_PHI,
      theta_lock: NCPhysics.THETA_LOCK,
      generation: this.generation,
    }
  }

  /**
   * Reset field
   */
  reset(): void {
    this.phi = 0.5
    this.tokens = []
    this.generation = 0
  }
}
