"use client"

import { useEffect, useState } from "react"
import { useQuantumState } from "@/lib/dna-lang/quantum-state"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Atom, Waves, Zap } from "lucide-react"

interface QuantumStateDisplayProps {
  states: string[]
  title: string
}

/**
 * Quantum State Display - Shows superposition and collapse
 */
export function QuantumStateDisplay({ states, title }: QuantumStateDisplayProps) {
  const [currentState, manager] = useQuantumState(states)
  const [coherence, setCoherence] = useState(1.0)
  const [superposition, setSuperposition] = useState<string[]>(states)

  useEffect(() => {
    const interval = setInterval(() => {
      setCoherence(manager.getCoherence())
      setSuperposition(manager.getSuperposition())
    }, 100)

    return () => clearInterval(interval)
  }, [manager])

  const handleMeasure = () => {
    manager.measure()
  }

  const handleAddState = () => {
    const newState = `State_${Date.now()}`
    manager.addSuperposition(newState)
  }

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#8b5cf6]/20 rounded-md">
            <Atom className="h-5 w-5 text-[#8b5cf6]" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          <Waves className="h-3 w-3" />
          Coherence: {(coherence * 100).toFixed(1)}%
        </Badge>
      </div>

      {/* Current collapsed state */}
      <div className="mb-4 p-4 bg-muted/50 rounded-lg border border-border">
        <div className="text-xs text-muted-foreground mb-1">Collapsed State</div>
        <div className="text-xl font-mono text-[#8b5cf6]">{currentState}</div>
      </div>

      {/* Superposition states */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-2">Superposition ({superposition.length} states)</div>
        <div className="flex flex-wrap gap-2">
          {superposition.map((state, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={cn("transition-all duration-300", state === currentState && "ring-2 ring-[#8b5cf6]")}
            >
              {state}
            </Badge>
          ))}
        </div>
      </div>

      {/* Coherence visualization */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-2">Quantum Coherence</div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] transition-all duration-300"
            style={{ width: `${coherence * 100}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button onClick={handleMeasure} size="sm" className="flex-1">
          <Zap className="h-4 w-4 mr-2" />
          Measure
        </Button>
        <Button onClick={handleAddState} size="sm" variant="outline" className="flex-1 bg-transparent">
          Add State
        </Button>
      </div>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
