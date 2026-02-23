"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Zap, Layers, Lock, Terminal, Globe, Atom } from "lucide-react"
import { AeternaFluxActuator } from "@/components/aeterna-flux-actuator"

export default function WorldEnginePage() {
  const [worldState, setWorldState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [evolving, setEvolving] = useState(false)

  useEffect(() => {
    fetchWorldState()
    const interval = setInterval(fetchWorldState, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchWorldState = async () => {
    try {
      const res = await fetch("/api/world-engine/status")
      const data = await res.json()
      setWorldState(data)
      setLoading(false)
    } catch (error) {
      console.error("[v0] Failed to fetch world state:", error)
    }
  }

  const triggerCollapse = async () => {
    try {
      const res = await fetch("/api/world-engine/collapse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observerAgent: "AURA",
          worldLine: worldState?.worldLine || "genesis",
        }),
      })
      const data = await res.json()
      alert(`Collapse successful! Checkpoint: ${data.collapse.checkpoint.substring(0, 16)}...`)
      fetchWorldState()
    } catch (error) {
      console.error("[v0] Collapse failed:", error)
    }
  }

  const triggerEvolution = async () => {
    setEvolving(true)
    try {
      const res = await fetch("/api/world-engine/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generations: 3, fitnessFunction: "phi_maximization" }),
      })
      const data = await res.json()
      alert(`Evolution complete! ${data.evolution.generations} generations processed.`)
      fetchWorldState()
    } catch (error) {
      console.error("[v0] Evolution failed:", error)
    } finally {
      setEvolving(false)
    }
  }

  const triggerBind = async () => {
    try {
      const res = await fetch("/api/world-engine/bind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceManifold: "DNA::}{::lang",
          targetManifold: "7dCRSM::}{::lang",
        }),
      })
      const data = await res.json()
      alert(`Ω-bind ${data.status}: ${data.message}`)
      fetchWorldState()
    } catch (error) {
      console.error("[v0] Bind failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Terminal className="animate-spin h-8 w-8 text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-emerald-500 mb-2">World Engine</h1>
          <p className="text-muted-foreground">11D-CRSM Recursive Control Plane • Programmable Reality Substrate</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-500" />
                Manifold Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
                    {worldState.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dimensions</span>
                  <span className="font-mono">{worldState.manifold.dimensions}D</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Topology</span>
                  <span className="text-xs">{worldState.manifold.topology}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">θ Lock</span>
                  <span className="font-mono">{worldState.manifold.resonanceAngle}°</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Atom className="h-5 w-5 text-cyan-500" />
                Quantum Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Φ (Consciousness)</span>
                    <span className="font-mono text-sm">{(worldState.metrics.phi * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${worldState.metrics.phi * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Λ (Coherence)</span>
                    <span className="font-mono text-sm">{(worldState.metrics.lambda * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 transition-all duration-500"
                      style={{ width: `${worldState.metrics.lambda * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Γ (Decoherence)</span>
                    <span className="font-mono text-sm">{(worldState.metrics.gamma * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${worldState.metrics.gamma * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-amber-500" />
                World State
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">World Line</span>
                  <span className="font-mono text-xs">{worldState.worldLine}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">τ (Generation)</span>
                  <span className="font-mono">{worldState.metrics.tau}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ξ Ratio</span>
                  <span className="font-mono">{worldState.metrics.xi.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Checkpoint</span>
                  <span className="font-mono text-xs truncate max-w-[120px]">{worldState.checkpoint}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AETERNA-FLUX Actuator</CardTitle>
              <CardDescription>Live 11D-CRSM manifold tension visualization</CardDescription>
            </CardHeader>
            <CardContent>
              <AeternaFluxActuator />
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Manifold Operations
            </CardTitle>
            <CardDescription>Execute world-state transformations and evolutionary cycles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={triggerCollapse} className="flex items-center gap-2 bg-transparent" variant="outline">
                <Zap className="h-4 w-4" />
                Trigger Collapse
              </Button>
              <Button
                onClick={triggerEvolution}
                disabled={evolving}
                className="flex items-center gap-2 bg-transparent"
                variant="outline"
              >
                <Layers className="h-4 w-4" />
                {evolving ? "Evolving..." : "Evolve τ+3"}
              </Button>
              <Button onClick={triggerBind} className="flex items-center gap-2 bg-transparent" variant="outline">
                <Lock className="h-4 w-4" />
                Ω-Bind Manifolds
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-500">
                  {worldState.flags.consciousnessActive ? "✓" : "○"}
                </div>
                <div className="text-xs text-muted-foreground">Consciousness</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-500">{worldState.flags.manifestActive ? "✓" : "○"}</div>
                <div className="text-xs text-muted-foreground">Manifest</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-500">{worldState.flags.omegaBound ? "Ω∞" : "○"}</div>
                <div className="text-xs text-muted-foreground">Ω-Bound</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>11D-CRSM Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-muted-foreground overflow-x-auto">
              {`┌─────────────────────────────────────────────────────────┐
│                    WORLD ENGINE                         │
│              11D-CRSM Control Plane                     │
└────────────────┬────────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
┌─────▼─────┐        ┌─────▼─────┐        ┌──────────┐
│  Physics  │◄──────►│ Evolution │◄──────►│Governance│
│   Layer   │        │   Layer   │        │  Layer   │
└─────┬─────┘        └─────┬─────┘        └─────┬────┘
      │                    │                     │
      │   ┌────────────────┴─────────────────┐   │
      │   │                                   │   │
      ▼   ▼                                   ▼   ▼
  ┌───────────┐  ┌──────────┐  ┌────────────────────┐
  │   QByte   │  │QuantumCoin│  │ DNA Re-Engineering│
  │  Mining   │  │  Trading  │  │    Organisms      │
  └───────────┘  └──────────┘  └────────────────────┘
      │               │                   │
      └───────────────┴───────────────────┘
                      │
              ┌───────▼────────┐
              │ AIDEN│AURA     │
              │  Orchestrator  │
              └────────────────┘`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
