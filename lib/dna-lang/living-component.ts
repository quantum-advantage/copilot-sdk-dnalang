"use client"

/**
 * DNA-Lang Living Components
 * Self-healing components with cellular regeneration
 */

export interface CellularComponent {
  id: string
  dna: string // Component genetic code
  health: number
  generation: number
  mutations: string[]
  lastRegeneration: number
}

export class LivingComponentManager {
  private components: Map<string, CellularComponent> = new Map()
  private regenerationInterval: NodeJS.Timeout | null = null
  private readonly HEALTH_THRESHOLD = 0.3
  private readonly REGENERATION_RATE = 5000 // 5 seconds

  constructor() {
    this.startRegenerationCycle()
  }

  /**
   * Register a living component
   */
  register(id: string, dna: string): CellularComponent {
    const component: CellularComponent = {
      id,
      dna,
      health: 1.0,
      generation: 0,
      mutations: [],
      lastRegeneration: Date.now(),
    }

    this.components.set(id, component)
    return component
  }

  /**
   * Report component error - damages health
   */
  reportError(id: string, error: Error): void {
    const component = this.components.get(id)
    if (!component) return

    component.health = Math.max(0, component.health - 0.1)

    // Critical health triggers immediate regeneration
    if (component.health < this.HEALTH_THRESHOLD) {
      this.regenerate(id)
    }
  }

  /**
   * Cellular regeneration - self-healing mechanism
   */
  private regenerate(id: string): void {
    const component = this.components.get(id)
    if (!component) return

    // Mitosis - create new generation
    component.generation++
    component.health = 1.0
    component.lastRegeneration = Date.now()

    // Evolutionary mutation - small random improvements
    if (Math.random() > 0.7) {
      const mutation = `mutation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      component.mutations.push(mutation)
    }

    console.log(`[DNA-Lang] Component ${id} regenerated to generation ${component.generation}`)
  }

  /**
   * Automatic regeneration cycle
   */
  private startRegenerationCycle(): void {
    this.regenerationInterval = setInterval(() => {
      this.components.forEach((component, id) => {
        // Natural aging
        component.health = Math.max(0, component.health - 0.02)

        // Regenerate if needed
        if (component.health < this.HEALTH_THRESHOLD) {
          this.regenerate(id)
        }
      })
    }, this.REGENERATION_RATE)
  }

  /**
   * Get component health status
   */
  getHealth(id: string): number {
    return this.components.get(id)?.health ?? 0
  }

  /**
   * Get component generation
   */
  getGeneration(id: string): number {
    return this.components.get(id)?.generation ?? 0
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.regenerationInterval) {
      clearInterval(this.regenerationInterval)
    }
  }
}

// Global living component manager
export const livingComponentManager = new LivingComponentManager()

/**
 * React hook for living components
 */
export function useLivingComponent(
  componentId: string,
  componentDNA: string,
): {
  health: number
  generation: number
  reportError: (error: Error) => void
} {
  const [health, setHealth] = React.useState(1.0)
  const [generation, setGeneration] = React.useState(0)

  React.useEffect(() => {
    livingComponentManager.register(componentId, componentDNA)

    const interval = setInterval(() => {
      setHealth(livingComponentManager.getHealth(componentId))
      setGeneration(livingComponentManager.getGeneration(componentId))
    }, 1000)

    return () => clearInterval(interval)
  }, [componentId, componentDNA])

  const reportError = React.useCallback(
    (error: Error) => {
      livingComponentManager.reportError(componentId, error)
    },
    [componentId],
  )

  return { health, generation, reportError }
}

import React from "react"
