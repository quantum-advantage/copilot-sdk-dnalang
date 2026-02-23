/**
 * DNA-Lang Biological Immune System
 * Security through antibodies, T-cells, and adaptive immunity
 */

export interface Pathogen {
  id: string
  signature: string
  type: "virus" | "bacteria" | "malware"
  detected: number
  severity: number
}

export interface Antibody {
  id: string
  antigen: string // What it recognizes
  strength: number
  created: number
  successfulBlocks: number
}

export interface TCell {
  id: string
  type: "helper" | "killer" | "memory"
  target: string
  activated: boolean
  lifespan: number
}

export class BiologicalImmuneSystem {
  private pathogens: Map<string, Pathogen> = new Map()
  private antibodies: Map<string, Antibody> = new Map()
  private tCells: Map<string, TCell> = new Map()
  private memoryBank: Set<string> = new Set() // Adaptive immunity
  private readonly ANTIBODY_THRESHOLD = 3 // Create antibody after 3 detections

  /**
   * Detect potential threat
   */
  detectThreat(signature: string, type: Pathogen["type"], severity: number): boolean {
    // Check memory bank (adaptive immunity)
    if (this.memoryBank.has(signature)) {
      console.log(`[Immune System] Known threat detected: ${signature}`)
      this.blockThreat(signature)
      return true
    }

    // Check existing antibodies
    for (const antibody of this.antibodies.values()) {
      if (this.matchesAntigen(signature, antibody.antigen)) {
        console.log(`[Immune System] Antibody match: ${antibody.id} blocks ${signature}`)
        antibody.successfulBlocks++
        antibody.strength = Math.min(1, antibody.strength + 0.1)
        this.blockThreat(signature)
        return true
      }
    }

    // New threat - record it
    const pathogenId = `pathogen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const existingPathogen = Array.from(this.pathogens.values()).find((p) => p.signature === signature)

    if (existingPathogen) {
      existingPathogen.detected++

      // Create antibody if threshold reached
      if (existingPathogen.detected >= this.ANTIBODY_THRESHOLD) {
        this.createAntibody(signature)
      }
    } else {
      this.pathogens.set(pathogenId, {
        id: pathogenId,
        signature,
        type,
        detected: 1,
        severity,
      })
    }

    // Activate T-cells for high severity threats
    if (severity > 0.7) {
      this.activateTCells(signature)
    }

    return false
  }

  /**
   * Create antibody (adaptive immunity)
   */
  private createAntibody(antigen: string): void {
    const antibodyId = `antibody_${Date.now()}`

    this.antibodies.set(antibodyId, {
      id: antibodyId,
      antigen,
      strength: 0.5,
      created: Date.now(),
      successfulBlocks: 0,
    })

    // Add to memory bank
    this.memoryBank.add(antigen)

    console.log(`[Immune System] Created antibody for: ${antigen}`)
  }

  /**
   * Activate T-cells for threat response
   */
  private activateTCells(target: string): void {
    // Create helper T-cell
    const helperId = `tcell_helper_${Date.now()}`
    this.tCells.set(helperId, {
      id: helperId,
      type: "helper",
      target,
      activated: true,
      lifespan: 60000, // 1 minute
    })

    // Create killer T-cell
    const killerId = `tcell_killer_${Date.now()}`
    this.tCells.set(killerId, {
      id: killerId,
      type: "killer",
      target,
      activated: true,
      lifespan: 60000,
    })

    console.log(`[Immune System] T-cells activated for: ${target}`)

    // T-cells expire after lifespan
    setTimeout(() => {
      this.tCells.delete(helperId)
      this.tCells.delete(killerId)
    }, 60000)
  }

  /**
   * Block threat
   */
  private blockThreat(signature: string): void {
    // Remove from active pathogens
    for (const [id, pathogen] of this.pathogens.entries()) {
      if (pathogen.signature === signature) {
        this.pathogens.delete(id)
      }
    }

    console.log(`[Immune System] Threat blocked: ${signature}`)
  }

  /**
   * Check if signature matches antigen (fuzzy matching)
   */
  private matchesAntigen(signature: string, antigen: string): boolean {
    // Simple substring matching (can be enhanced)
    return signature.includes(antigen) || antigen.includes(signature)
  }

  /**
   * Get immune system status
   */
  getStatus(): {
    antibodies: number
    activeTCells: number
    knownThreats: number
    activeThreats: number
  } {
    return {
      antibodies: this.antibodies.size,
      activeTCells: Array.from(this.tCells.values()).filter((t) => t.activated).length,
      knownThreats: this.memoryBank.size,
      activeThreats: this.pathogens.size,
    }
  }

  /**
   * Get all antibodies
   */
  getAntibodies(): Antibody[] {
    return Array.from(this.antibodies.values())
  }

  /**
   * Get active T-cells
   */
  getActiveTCells(): TCell[] {
    return Array.from(this.tCells.values()).filter((t) => t.activated)
  }

  /**
   * Get active threats
   */
  getActiveThreats(): Pathogen[] {
    return Array.from(this.pathogens.values())
  }
}

// Global immune system
export const immuneSystem = new BiologicalImmuneSystem()
