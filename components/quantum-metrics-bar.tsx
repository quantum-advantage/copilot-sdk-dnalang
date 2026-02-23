"use client"

import { useState, useEffect } from "react"
import { Activity, Zap, Waves, Thermometer } from "lucide-react"

const TAU_0 = 46.979

export function QuantumMetricsBar() {
  const [mounted, setMounted] = useState(false)
  const [metrics, setMetrics] = useState({
    lambda: 0.847,
    phi: 0.91,
    gamma: 0.0042,
    xi: 128.2,
  })

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setMetrics({
        lambda: 0.82 + Math.random() * 0.1,
        phi: 0.88 + Math.random() * 0.08,
        gamma: 0.003 + Math.random() * 0.003,
        xi: 120 + Math.random() * 20,
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-2 text-xs">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Activity className="h-3 w-3 text-secondary" />
              <span className="text-muted-foreground">Λ:</span>
              <span className="font-mono text-secondary">{mounted ? metrics.lambda.toFixed(3) : '0.847'}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Zap className="h-3 w-3 text-accent" />
              <span className="text-muted-foreground">Φ:</span>
              <span className="font-mono text-accent">{mounted ? metrics.phi.toFixed(3) : '0.910'}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Waves className="h-3 w-3 text-destructive" />
              <span className="text-muted-foreground">Γ:</span>
              <span className="font-mono text-destructive">{mounted ? metrics.gamma.toFixed(4) : '0.0042'}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Thermometer className="h-3 w-3 text-primary" />
              <span className="text-muted-foreground">Ξ:</span>
              <span className="font-mono text-primary">{mounted ? metrics.xi.toFixed(1) : '128.2'}</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-muted-foreground">τ₀ = {TAU_0.toFixed(3)}μs</span>
            <span className="status-dot status-active" />
          </div>
        </div>
      </div>
    </div>
  )
}
