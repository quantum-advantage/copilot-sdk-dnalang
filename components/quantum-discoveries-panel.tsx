"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Atom, Zap, Activity, CheckCircle2 } from "lucide-react"
import { QUANTUM_DISCOVERIES, QUANTUM_METRICS } from "@/lib/quantum-physics-data"

export function QuantumDiscoveriesPanel() {
  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#d97706]/20 rounded-lg">
          <Atom className="h-6 w-6 text-[#d97706]" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Quantum Physics Discoveries</h3>
          <p className="text-sm text-muted-foreground">
            From {QUANTUM_METRICS.total_jobs.toLocaleString()}+ IBM Quantum jobs | {QUANTUM_METRICS.total_shots.toLocaleString()}+ shots
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(QUANTUM_DISCOVERIES).map(([name, data]) => (
          <div key={name} className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{name}</h4>
                {data.validated && <CheckCircle2 className="h-4 w-4 text-[#10b981]" />}
              </div>
              <Badge variant="outline" className="text-xs">
                {typeof data.discovered === "number" ? data.discovered.toFixed(3) : data.discovered}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{data.significance}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-[#3b82f6]" />
              <span className="text-2xl font-bold text-[#3b82f6]">
                {(QUANTUM_METRICS.avg_fidelity * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Avg Fidelity</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-[#d97706]" />
              <span className="text-2xl font-bold text-[#d97706]">{QUANTUM_METRICS.max_quantum_volume}</span>
            </div>
            <p className="text-xs text-muted-foreground">Quantum Volume</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
