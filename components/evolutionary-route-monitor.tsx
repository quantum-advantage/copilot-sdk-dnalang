"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Route, Zap } from "lucide-react"
import { evolutionaryRouter, type RouteGenes } from "@/lib/dna-lang/evolutionary-router"

/**
 * Evolutionary Route Monitor - Shows route optimization through natural selection
 */
export function EvolutionaryRouteMonitor() {
  const [routes, setRoutes] = useState<RouteGenes[]>([])
  const [generation, setGeneration] = useState(0)

  useEffect(() => {
    // Register some example routes
    evolutionaryRouter.registerRoute("/")
    evolutionaryRouter.registerRoute("/dashboard")
    evolutionaryRouter.registerRoute("/api/data")
    evolutionaryRouter.registerRoute("/settings")

    // Simulate route access
    const simulateAccess = () => {
      const paths = ["/", "/dashboard", "/api/data", "/settings"]
      const randomPath = paths[Math.floor(Math.random() * paths.length)]
      const randomLoadTime = Math.random() * 3000 + 500

      evolutionaryRouter.recordAccess(randomPath, randomLoadTime)
      setRoutes(evolutionaryRouter.getAllRoutes())
    }

    // Evolve routes periodically
    const evolveInterval = setInterval(() => {
      evolutionaryRouter.evolve()
      setGeneration((g) => g + 1)
      setRoutes(evolutionaryRouter.getAllRoutes())
    }, 10000)

    // Simulate access
    const accessInterval = setInterval(simulateAccess, 2000)

    return () => {
      clearInterval(evolveInterval)
      clearInterval(accessInterval)
    }
  }, [])

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#d97706]/20 rounded-md">
            <Route className="h-5 w-5 text-[#d97706]" />
          </div>
          <h3 className="text-lg font-semibold">Evolutionary Router</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          Gen {generation}
        </Badge>
      </div>

      <div className="space-y-3">
        {routes.map((route) => (
          <div key={route.path} className="p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono">{route.path}</code>
                {route.mutations.length > 0 && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Zap className="h-3 w-3" />
                    {route.mutations.length} mutations
                  </Badge>
                )}
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  route.fitness > 0.7 && "border-[#10b981] text-[#10b981]",
                  route.fitness > 0.4 && route.fitness <= 0.7 && "border-[#d97706] text-[#d97706]",
                  route.fitness <= 0.4 && "border-[#ef4444] text-[#ef4444]",
                )}
              >
                Fitness: {(route.fitness * 100).toFixed(0)}%
              </Badge>
            </div>

            <Progress value={route.fitness * 100} className="h-2 mb-2" />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{route.accessCount} accesses</span>
              <span>{route.averageLoadTime.toFixed(0)}ms avg</span>
              <span>Gen {route.generation}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
