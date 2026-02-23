/**
 * DNA-Lang Evolutionary Router
 * Routes optimize through natural selection
 */

export interface RouteGenes {
  path: string
  fitness: number // Performance score
  accessCount: number
  averageLoadTime: number
  generation: number
  mutations: string[]
}

export class EvolutionaryRouter {
  private routes: Map<string, RouteGenes> = new Map()
  private readonly POPULATION_SIZE = 10
  private readonly MUTATION_RATE = 0.1
  private generation = 0

  /**
   * Register a route with initial genes
   */
  registerRoute(path: string): void {
    if (!this.routes.has(path)) {
      this.routes.set(path, {
        path,
        fitness: 0.5,
        accessCount: 0,
        averageLoadTime: 0,
        generation: 0,
        mutations: [],
      })
    }
  }

  /**
   * Record route access and performance
   */
  recordAccess(path: string, loadTime: number): void {
    const route = this.routes.get(path)
    if (!route) return

    route.accessCount++

    // Update average load time
    route.averageLoadTime = (route.averageLoadTime * (route.accessCount - 1) + loadTime) / route.accessCount

    // Calculate fitness based on performance
    // Lower load time = higher fitness
    const maxLoadTime = 5000 // 5 seconds
    route.fitness = Math.max(0, 1 - route.averageLoadTime / maxLoadTime)
  }

  /**
   * Natural selection - evolve routes
   */
  evolve(): void {
    this.generation++

    const routeArray = Array.from(this.routes.values())

    // Sort by fitness
    routeArray.sort((a, b) => b.fitness - a.fitness)

    // Keep top performers
    const survivors = routeArray.slice(0, Math.ceil(routeArray.length * 0.5))

    // Mutate survivors
    survivors.forEach((route) => {
      if (Math.random() < this.MUTATION_RATE) {
        route.generation = this.generation
        route.mutations.push(`gen${this.generation}_optimization`)

        // Mutation: slight fitness boost
        route.fitness = Math.min(1, route.fitness * 1.05)
      }
    })

    console.log(`[DNA-Lang Router] Generation ${this.generation}: ${survivors.length} routes survived`)
  }

  /**
   * Get optimal route based on fitness
   */
  getOptimalRoute(candidates: string[]): string {
    const routes = candidates.map((path) => this.routes.get(path)).filter((r): r is RouteGenes => r !== undefined)

    if (routes.length === 0) return candidates[0]

    // Select based on fitness with some randomness
    const totalFitness = routes.reduce((sum, r) => sum + r.fitness, 0)
    let random = Math.random() * totalFitness

    for (const route of routes) {
      random -= route.fitness
      if (random <= 0) return route.path
    }

    return routes[0].path
  }

  /**
   * Get route statistics
   */
  getRouteStats(path: string): RouteGenes | undefined {
    return this.routes.get(path)
  }

  /**
   * Get all routes sorted by fitness
   */
  getAllRoutes(): RouteGenes[] {
    return Array.from(this.routes.values()).sort((a, b) => b.fitness - a.fitness)
  }
}

// Global evolutionary router
export const evolutionaryRouter = new EvolutionaryRouter()
