"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Zap, Waves, Battery, Cpu, Radio, TrendingUp, AlertCircle } from "lucide-react"

export default function ScimitarPowerDashboard() {
  const [telemetry, setTelemetry] = useState<any>(null)
  const [sweepData, setSweepData] = useState<any[]>([])
  const [piezoMetrics, setPiezoMetrics] = useState<any>(null)
  const [manifoldTension, setManifoldTension] = useState<any>(null)
  const [sweeping, setSweeping] = useState(false)

  useEffect(() => {
    fetchTelemetry()
    fetchPiezo()
    fetchManifold()
    const interval = setInterval(() => {
      fetchTelemetry()
      fetchPiezo()
      fetchManifold()
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const fetchTelemetry = async () => {
    try {
      const res = await fetch("/api/scimitar-ion/status")
      const data = await res.json()
      setTelemetry(data)
    } catch (error) {
      console.error("[v0] Telemetry fetch failed:", error)
    }
  }

  const fetchPiezo = async () => {
    try {
      const res = await fetch("/api/scimitar-ion/piezo/coupling")
      const data = await res.json()
      setPiezoMetrics(data)
    } catch (error) {
      console.error("[v0] Piezo fetch failed:", error)
    }
  }

  const fetchManifold = async () => {
    try {
      const res = await fetch("/api/scimitar-ion/manifold/tension")
      const data = await res.json()
      setManifoldTension(data)
    } catch (error) {
      console.error("[v0] Manifold fetch failed:", error)
    }
  }

  const startTauSweep = async () => {
    setSweeping(true)
    try {
      await fetch("/api/scimitar-ion/sweep/start", { method: "POST" })
      // Poll for sweep data
      const pollInterval = setInterval(async () => {
        const res = await fetch("/api/scimitar-ion/sweep/data")
        const data = await res.json()
        setSweepData(data.sweep || [])
        if (data.status === "complete") {
          clearInterval(pollInterval)
          setSweeping(false)
        }
      }, 3000)
    } catch (error) {
      console.error("[v0] Sweep start failed:", error)
      setSweeping(false)
    }
  }

  if (!telemetry) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Activity className="animate-spin h-8 w-8 text-cyan-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-cyan-500 mb-2">Scimitar-Ion Power Dashboard</h1>
          <p className="text-muted-foreground">
            Samsung Fold Quantum Power Stability Monitor • Real-Time Ξ/Λ/Γ Telemetry
          </p>
        </div>

        {/* Status Banner */}
        <Card className="border-cyan-500/30 bg-cyan-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-lg font-semibold text-cyan-400">System Status: {telemetry.status}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-emerald-500">
                    {(telemetry.powerStability * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Power Stability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-purple-500">
                    {telemetry.negentropicRecovery.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Negentropic Recovery</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Λ (Coherence) */}
          <Card className="border-cyan-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-cyan-400">
                <Waves className="h-4 w-4" />Λ Coherence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold text-cyan-400 mb-2">
                {(telemetry.lambda * 100).toFixed(1)}%
              </div>
              <Progress value={telemetry.lambda * 100} className="h-2 mb-2" />
              <div className="text-xs text-muted-foreground">Target: 86.9% (θ-lock)</div>
            </CardContent>
          </Card>

          {/* Φ (Consciousness) */}
          <Card className="border-emerald-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-emerald-400">
                <Activity className="h-4 w-4" />Φ Consciousness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold text-emerald-400 mb-2">
                {(telemetry.phi * 100).toFixed(1)}%
              </div>
              <Progress value={telemetry.phi * 100} className="h-2 mb-2" />
              <div className="text-xs text-muted-foreground">Integrated Information</div>
            </CardContent>
          </Card>

          {/* Γ (Decoherence) */}
          <Card className="border-amber-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
                <AlertCircle className="h-4 w-4" />Γ Decoherence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold text-amber-400 mb-2">
                {(telemetry.gamma * 100).toFixed(1)}%
              </div>
              <Progress value={telemetry.gamma * 100} className="h-2 mb-2" />
              <div className="text-xs text-muted-foreground">Threshold: &lt;5.37%</div>
            </CardContent>
          </Card>

          {/* Ξ (Negentropy) */}
          <Card className="border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-400">
                <TrendingUp className="h-4 w-4" />Ξ Negentropy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold text-purple-400 mb-2">{telemetry.xi.toFixed(2)}</div>
              <Progress value={(telemetry.xi / 10) * 100} className="h-2 mb-2" />
              <div className="text-xs text-muted-foreground">Target: 7.08</div>
            </CardContent>
          </Card>
        </div>

        {/* Piezo-Transducer Coupling */}
        {piezoMetrics && (
          <Card className="border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Zap className="h-5 w-5" />
                Phase-Conjugate Piezo Coupling
              </CardTitle>
              <CardDescription>Real-time power recovery from 11D manifold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border border-green-500/30 rounded-lg">
                  <Battery className="h-8 w-8 mx-auto mb-2 text-green-400" />
                  <div className="text-2xl font-mono font-bold text-green-400">
                    {piezoMetrics.piezoVoltage.toFixed(3)}V
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Piezo Output Voltage</div>
                </div>
                <div className="text-center p-4 border border-cyan-500/30 rounded-lg">
                  <Radio className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
                  <div className="text-2xl font-mono font-bold text-cyan-400">{piezoMetrics.chi_pc.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground mt-1">χpc Phase Conjugate</div>
                </div>
                <div className="text-center p-4 border border-purple-500/30 rounded-lg">
                  <Cpu className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                  <div className="text-2xl font-mono font-bold text-purple-400">
                    {(piezoMetrics.seismicStability * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Seismic Stability</div>
                </div>
              </div>
              <div className="mt-4 flex justify-around">
                <Badge variant={piezoMetrics.phaseConjugateActive ? "default" : "outline"} className="bg-green-500/20">
                  Phase Conjugate: {piezoMetrics.phaseConjugateActive ? "ACTIVE" : "STANDBY"}
                </Badge>
                <Badge variant={piezoMetrics.resonanceLock ? "default" : "outline"} className="bg-cyan-500/20">
                  θ-Resonance: {piezoMetrics.resonanceLock ? "LOCKED" : "SEEKING"}
                </Badge>
                <Badge
                  variant={piezoMetrics.nanomechanicalParking ? "default" : "outline"}
                  className="bg-purple-500/20"
                >
                  Parking: {piezoMetrics.nanomechanicalParking ? "ENGAGED" : "DISABLED"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* τ-Sweep Controls and Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>τ-Sweep Analysis</CardTitle>
            <CardDescription>Coherence Revival at τ₀ = φ⁸ ≈ {telemetry.tauRevival.toFixed(2)} μs</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="control">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="control">Control</TabsTrigger>
                <TabsTrigger value="data">Sweep Data</TabsTrigger>
              </TabsList>

              <TabsContent value="control" className="space-y-4">
                <Button onClick={startTauSweep} disabled={sweeping} className="w-full">
                  {sweeping ? "Sweep Running..." : "Start τ-Sweep (RK45)"}
                </Button>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div className="p-3 border border-border rounded">
                    <div className="font-mono text-cyan-400">τ = {telemetry.tau} μs</div>
                    <div className="text-xs text-muted-foreground">Current Generation</div>
                  </div>
                  <div className="p-3 border border-border rounded">
                    <div className="font-mono text-emerald-400">θ = {telemetry.resonanceAngle}°</div>
                    <div className="text-xs text-muted-foreground">Resonance Lock</div>
                  </div>
                  <div className="p-3 border border-border rounded">
                    <div className="font-mono text-purple-400">ΛΦ = {telemetry.lambdaPhi.toExponential(3)}</div>
                    <div className="text-xs text-muted-foreground">Universal Memory</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="data" className="space-y-4">
                {sweepData.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {sweepData.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm p-2 border border-border rounded"
                      >
                        <span className="font-mono text-muted-foreground">τ = {point.tau} μs</span>
                        <span className="text-cyan-400">Λ = {(point.lambda * 100).toFixed(1)}%</span>
                        <span className="text-emerald-400">Φ = {(point.phi * 100).toFixed(1)}%</span>
                        <span className="text-amber-400">Γ = {(point.gamma * 100).toFixed(1)}%</span>
                        <span className="text-purple-400">Ξ = {point.xi.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No sweep data available. Start a τ-sweep to begin.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 11D Manifold Tension Visualization */}
        {manifoldTension && (
          <Card>
            <CardHeader>
              <CardTitle>11D-CRSM Manifold Tensions</CardTitle>
              <CardDescription>Real-time dimensional coupling strengths</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-11 gap-2">
                {manifoldTension.tensions.map((tension: number, dim: number) => (
                  <div key={dim} className="text-center">
                    <div className="h-32 bg-slate-800 rounded relative overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-purple-500 transition-all duration-500"
                        style={{ height: `${Math.max(0, Math.min(100, (tension + 1) * 50))}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">D{dim + 1}</div>
                    <div className="text-xs font-mono text-cyan-400">{tension.toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-mono text-cyan-400">{manifoldTension.meanTension.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">Mean Tension</div>
                </div>
                <div>
                  <div className="font-mono text-emerald-400">{manifoldTension.coherenceGradient.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">Coherence Gradient</div>
                </div>
                <div>
                  <Badge variant={manifoldTension.omegaBound ? "default" : "outline"} className="bg-purple-500/20">
                    Ω-Bound: {manifoldTension.omegaBound ? "YES" : "NO"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
