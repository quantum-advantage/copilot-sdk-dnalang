"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { immuneSystem } from "@/lib/dna-lang/immune-system"
import { quantumNetwork } from "@/lib/dna-lang/quantum-network"
import { calculateCoherence, LAMBDA_PHI } from "@/lib/dna-lang"

interface Metric {
  name: string
  value: number
  unit: string
  trend: "up" | "down" | "stable"
  color: string
}

/**
 * Real-Time System Monitor
 */
export function RealTimeMonitor() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [updateCount, setUpdateCount] = useState(0)

  useEffect(() => {
    const updateMetrics = () => {
      const immuneStatus = immuneSystem.getStatus()
      const networkStats = quantumNetwork.getNetworkStats()
      const coherence = calculateCoherence(300, Date.now() / 1000)

      const newMetrics: Metric[] = [
        {
          name: "Quantum Coherence",
          value: coherence * 100,
          unit: "%",
          trend: coherence > 0.9 ? "stable" : coherence > 0.7 ? "down" : "down",
          color: "#8b5cf6",
        },
        {
          name: "Immune Antibodies",
          value: immuneStatus.antibodies,
          unit: "",
          trend: immuneStatus.antibodies > 5 ? "up" : "stable",
          color: "#10b981",
        },
        {
          name: "Active T-Cells",
          value: immuneStatus.activeTCells,
          unit: "",
          trend: immuneStatus.activeTCells > 0 ? "up" : "stable",
          color: "#3b82f6",
        },
        {
          name: "Active Threats",
          value: immuneStatus.activeThreats,
          unit: "",
          trend: immuneStatus.activeThreats > 0 ? "up" : "stable",
          color: "#ef4444",
        },
        {
          name: "Quantum Channels",
          value: networkStats.channels,
          unit: "",
          trend: "stable",
          color: "#d97706",
        },
        {
          name: "Network Coherence",
          value: networkStats.averageCoherence * 100,
          unit: "%",
          trend: networkStats.averageCoherence > 0.9 ? "stable" : "down",
          color: "#8b5cf6",
        },
      ]

      setMetrics(newMetrics)
      setUpdateCount((c) => c + 1)
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 1000)

    return () => clearInterval(interval)
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3" />
      case "down":
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#10b981]/20 rounded-md">
            <Activity className="h-5 w-5 text-[#10b981]" />
          </div>
          <h3 className="text-lg font-semibold">Real-Time Monitor</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          <div className="h-2 w-2 bg-[#10b981] rounded-full animate-pulse" />
          Live
        </Badge>
      </div>

      <div className="space-y-3">
        {metrics.map((metric, i) => (
          <div key={i} className="p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{metric.name}</span>
              <Badge variant="outline" className="gap-1" style={{ borderColor: metric.color, color: metric.color }}>
                {getTrendIcon(metric.trend)}
                {metric.trend}
              </Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold" style={{ color: metric.color }}>
                {metric.value.toFixed(metric.unit === "%" ? 2 : 0)}
              </span>
              <span className="text-sm text-muted-foreground">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Updates: {updateCount}</span>
          <span>Refresh Rate: 1s</span>
          <span>ΛΦ: {LAMBDA_PHI} s⁻¹</span>
        </div>
      </div>
    </Card>
  )
}
