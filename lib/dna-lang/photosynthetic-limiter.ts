/**
 * DNA-Lang Photosynthetic Rate Limiting
 * Light-driven token generation for API rate limiting
 */

export interface PhotosyntheticToken {
  id: string
  energy: number // ATP units
  created: number
  expiresAt: number
}

export class PhotosyntheticRateLimiter {
  private tokens: Map<string, PhotosyntheticToken[]> = new Map()
  private readonly LIGHT_INTENSITY = 1.0 // Simulated sunlight
  private readonly PHOTON_RATE = 100 // Photons per second
  private readonly ATP_PER_PHOTON = 0.1
  private readonly TOKEN_LIFESPAN = 60000 // 1 minute

  /**
   * Generate tokens through photosynthesis
   */
  private photosynthesize(clientId: string): void {
    const now = Date.now()

    // Light reaction: photons → ATP
    const atp = this.PHOTON_RATE * this.ATP_PER_PHOTON * this.LIGHT_INTENSITY

    // Create token if enough ATP
    if (atp >= 1.0) {
      const token: PhotosyntheticToken = {
        id: `token_${now}_${Math.random().toString(36).substr(2, 9)}`,
        energy: atp,
        created: now,
        expiresAt: now + this.TOKEN_LIFESPAN,
      }

      if (!this.tokens.has(clientId)) {
        this.tokens.set(clientId, [])
      }

      this.tokens.get(clientId)!.push(token)

      // Remove expired tokens
      this.tokens.set(
        clientId,
        this.tokens.get(clientId)!.filter((t) => t.expiresAt > now),
      )
    }
  }

  /**
   * Check if client has available tokens
   */
  hasToken(clientId: string): boolean {
    this.photosynthesize(clientId)

    const clientTokens = this.tokens.get(clientId) || []
    const now = Date.now()

    // Filter valid tokens
    const validTokens = clientTokens.filter((t) => t.expiresAt > now)
    this.tokens.set(clientId, validTokens)

    return validTokens.length > 0
  }

  /**
   * Consume a token
   */
  consumeToken(clientId: string): boolean {
    if (!this.hasToken(clientId)) {
      return false
    }

    const clientTokens = this.tokens.get(clientId)!
    clientTokens.shift() // Remove first token

    return true
  }

  /**
   * Get token count for client
   */
  getTokenCount(clientId: string): number {
    this.photosynthesize(clientId)

    const clientTokens = this.tokens.get(clientId) || []
    const now = Date.now()

    return clientTokens.filter((t) => t.expiresAt > now).length
  }

  /**
   * Get rate limit status
   */
  getStatus(clientId: string): {
    tokens: number
    maxTokens: number
    regenerationRate: number
  } {
    return {
      tokens: this.getTokenCount(clientId),
      maxTokens: 10,
      regenerationRate: this.PHOTON_RATE * this.ATP_PER_PHOTON,
    }
  }
}

// Global rate limiter
export const photosyntheticLimiter = new PhotosyntheticRateLimiter()
