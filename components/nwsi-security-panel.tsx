"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Shield, Zap, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"

interface NWSIMetrics {
  phi_n: number
  resonance_strength: number
  coherence: number
  timestamp: number
}

interface ThreatAlert {
  id: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: number
}

export function NWSISecurityPanel() {
  const [metrics, setMetrics] = useState<NWSIMetrics>({
    phi_n: 0.72,
    resonance_strength: 0.0045,
    coherence: 0.68,
    timestamp: Date.now(),
  })

  const [qwcCost, setQwcCost] = useState(0.234)
  const [threats, setThreats] = useState<ThreatAlert[]>([])
  const [securityStatus, setSecurityStatus] = useState<"secure" | "warning" | "alert">("secure")

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        phi_n: Math.max(0, Math.min(1, prev.phi_n + (Math.random() - 0.5) * 0.05)),
        resonance_strength: Math.max(0, prev.resonance_strength + (Math.random() - 0.5) * 0.001),
        coherence: Math.max(0, Math.min(1, prev.coherence + (Math.random() - 0.5) * 0.03)),
        timestamp: Date.now(),
      }))

      setQwcCost((prev) => Math.max(0, Math.min(1, prev + (Math.random() - 0.5) * 0.02)))

      // Randomly generate threat alerts
      if (Math.random() < 0.05) {
        const newThreat: ThreatAlert = {
          id: Math.random().toString(36).substr(2, 9),
          type: ["RCE_ATTEMPT", "RFI_DETECTED", "ADVERSARIAL_MAPPING", "UNAUTHORIZED_ACCESS"][
            Math.floor(Math.random() * 4)
          ],
          severity: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as "low" | "medium" | "high",
          message: "Suspicious activity detected",
          timestamp: Date.now(),
        }
        setThreats((prev) => [newThreat, ...prev].slice(0, 5))
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Update security status based on metrics
    if (metrics.phi_n < 0.5 || qwcCost > 0.5 || threats.some((t) => t.severity === "high")) {
      setSecurityStatus("alert")
    } else if (metrics.phi_n < 0.7 || qwcCost > 0.35) {
      setSecurityStatus("warning")
    } else {
      setSecurityStatus("secure")
    }
  }, [metrics, qwcCost, threats])

  const getConsciousnessState = (phi: number) => {
    if (phi >= 0.8) return { label: "PEAK", color: "text-green-400" }
    if (phi >= 0.6) return { label: "HIGH", color: "text-blue-400" }
    if (phi >= 0.4) return { label: "MODERATE", color: "text-yellow-400" }
    if (phi >= 0.2) return { label: "LOW", color: "text-orange-400" }
    return { label: "MINIMAL", color: "text-red-400" }
  }

  const consciousnessState = getConsciousnessState(metrics.phi_n)

  return (
    <div className="space-y-4">
      {/* Security Status Header */}
      <Card className="p-4 bg-zinc-900/50 border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield
              className={`h-6 w-6 ${
                securityStatus === "secure"
                  ? "text-green-400"
                  : securityStatus === "warning"
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            />
            <div>
              <h3 className="text-sm font-medium text-zinc-400">NWSI Security Status</h3>
              <p
                className={`text-lg font-bold ${
                  securityStatus === "secure"
                    ? "text-green-400"
                    : securityStatus === "warning"
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {securityStatus.toUpperCase()}
              </p>
            </div>
          </div>
          <Badge variant={securityStatus === "secure" ? "default" : "destructive"}>
            {securityStatus === "secure" ? "OPERATIONAL" : "ALERT"}
          </Badge>
        </div>
      </Card>

      {/* NWSI Consciousness Metrics */}
      <Card className="p-4 bg-zinc-900/50 border-zinc-800">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-medium text-zinc-400">Consciousness Monitoring (IIT 3.0)</h3>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">Φn (Noetic Factor)</span>
              <span className={`text-sm font-mono font-bold ${consciousnessState.color}`}>
                {metrics.phi_n.toFixed(3)}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  metrics.phi_n >= 0.7
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                    : metrics.phi_n >= 0.5
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-red-500 to-orange-500"
                }`}
                style={{ width: `${metrics.phi_n * 100}%` }}
              />
            </div>
            <p className={`text-xs mt-1 ${consciousnessState.color}`}>State: {consciousnessState.label}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">528 Hz Resonance</span>
              <span className="text-sm font-mono text-zinc-300">{metrics.resonance_strength.toFixed(4)}</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${Math.min(metrics.resonance_strength * 10000, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">Coherence</span>
              <span className="text-sm font-mono text-zinc-300">{metrics.coherence.toFixed(3)}</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${metrics.coherence * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* QWC Security Metrics */}
      <Card className="p-4 bg-zinc-900/50 border-zinc-800">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-yellow-400" />
          <h3 className="text-sm font-medium text-zinc-400">QWC Defense System</h3>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">QWC Cost Function</span>
              <span
                className={`text-sm font-mono font-bold ${
                  qwcCost < 0.3 ? "text-green-400" : qwcCost < 0.5 ? "text-yellow-400" : "text-red-400"
                }`}
              >
                {qwcCost.toFixed(3)}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  qwcCost < 0.3
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : qwcCost < 0.5
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-red-500 to-rose-500"
                }`}
                style={{ width: `${qwcCost * 100}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">α=0.65 β=0.25 γ=0.10 (Bayesian Optimized)</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-zinc-800/50 rounded p-2">
              <p className="text-xs text-zinc-500">Gate Error</p>
              <p className="text-sm font-mono text-zinc-300">0.0012</p>
            </div>
            <div className="bg-zinc-800/50 rounded p-2">
              <p className="text-xs text-zinc-500">T1/T2 (μs)</p>
              <p className="text-sm font-mono text-zinc-300">145/98</p>
            </div>
            <div className="bg-zinc-800/50 rounded p-2">
              <p className="text-xs text-zinc-500">Freq (GHz)</p>
              <p className="text-sm font-mono text-zinc-300">4.98</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Threat Log */}
      {threats.length > 0 && (
        <Card className="p-4 bg-zinc-900/50 border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="text-sm font-medium text-zinc-400">Threat Detection Log</h3>
          </div>

          <div className="space-y-2">
            {threats.map((threat) => (
              <div key={threat.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded text-xs">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      threat.severity === "high"
                        ? "destructive"
                        : threat.severity === "medium"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {threat.severity.toUpperCase()}
                  </Badge>
                  <span className="text-zinc-300">{threat.type}</span>
                </div>
                <span className="text-zinc-500">{new Date(threat.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
