"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { PhiMeter } from "@/components/ui/phi-meter"
import {
  Heart,
  Dna,
  Activity,
  AlertTriangle,
  TrendingUp,
  Wind,
  ShieldAlert,
  Search,
  Brain,
  Beaker,
  ArrowRight,
  RefreshCw,
  Thermometer,
  Droplets,
} from "lucide-react"

// Physics Constants
const PHI_THRESHOLD = 0.5
const LAMBDA_PHI = 2.176435e-8

function BioTwinContent() {
  const [twinState, setTwinState] = useState({
    phi: 0.74,
    coherence: 0.89,
    stability: "COMPLIANT",
    glucose: 110,
    oxygen: 98,
    heartRate: 72,
    temperature: 37.2,
  })

  const [activeSimulation, setActiveSimulation] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)

  // Simulate real-time digital twin monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setTwinState((prev) => ({
        ...prev,
        glucose: Math.max(80, Math.min(140, prev.glucose + (Math.random() * 4 - 2))),
        phi: Math.max(0.1, Math.min(0.99, prev.phi + (Math.random() * 0.02 - 0.01))),
        heartRate: Math.max(60, Math.min(100, prev.heartRate + Math.floor(Math.random() * 6 - 3))),
        oxygen: Math.max(94, Math.min(100, prev.oxygen + (Math.random() * 2 - 1))),
        coherence: Math.max(0.7, Math.min(0.99, prev.coherence + (Math.random() * 0.04 - 0.02))),
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Simulation progress
  useEffect(() => {
    if (activeSimulation) {
      const interval = setInterval(() => {
        setSimulationProgress((prev) => {
          if (prev >= 100) {
            setActiveSimulation(false)
            return 0
          }
          return prev + 5
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [activeSimulation])

  const isCoherent = twinState.phi > PHI_THRESHOLD
  const glucoseBars = [4, 6, 5, 8, 9, 7, 10, 8, 6, 7, 9, 8]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-muted/30 px-4 sm:px-6 py-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  <Brain className="h-3 w-3 mr-1" />
                  NCLM v2 Powered
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Bio-Digital Twin <span className="text-accent">PT-85F4</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                Sourced: Quantum Multi-Omics Data v6.1 | Lambda-Phi: {LAMBDA_PHI.toExponential(6)}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                  Global Coherence (Phi)
                </div>
                <div className={`text-2xl font-bold ${isCoherent ? "text-secondary" : "text-destructive"}`}>
                  {(twinState.phi * 10).toFixed(2)}
                </div>
              </div>
              <div className="h-10 w-px bg-border" />
              <ShieldAlert
                className={`h-6 w-6 ${isCoherent ? "text-accent" : "text-destructive animate-pulse"}`}
                aria-label={isCoherent ? "System stable" : "System unstable"}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Physical Metrics */}
          <div className="space-y-6">
            {/* Cardiovascular Twin */}
            <GlassCard depth={2} glow="secondary">
              <div className="flex items-center justify-between mb-4">
                <Heart className="h-5 w-5 text-destructive" />
                <span className="text-xs font-mono text-muted-foreground">Cardiovascular Twin</span>
              </div>
              <div className="text-4xl font-light mb-2">
                {twinState.heartRate} <span className="text-sm text-muted-foreground">BPM</span>
              </div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-destructive transition-all duration-500"
                  style={{ width: `${twinState.heartRate}%` }}
                />
              </div>
              <div className="mt-4 p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                <p className="text-xs text-muted-foreground">
                  Simulating surgical outcome:{" "}
                  <span className="text-secondary font-semibold">94% Success Probability</span>
                </p>
              </div>
            </GlassCard>

            {/* Glucose Predictive Coupling */}
            <GlassCard depth={2} glow="primary">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">Glucose Predictive Coupling</span>
              </div>
              <div className="text-4xl font-light mb-2">
                {twinState.glucose.toFixed(0)} <span className="text-sm text-muted-foreground">mg/dL</span>
              </div>
              <div className="flex space-x-1 h-12 items-end">
                {glucoseBars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/30 transition-all duration-300"
                    style={{ height: `${h * 10}%` }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">CCCE correlation active for future state prediction</p>
            </GlassCard>

            {/* Vitals Grid */}
            <GlassCard depth={1}>
              <h3 className="text-sm font-semibold mb-4">Vital Signs</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="h-3 w-3 text-primary" />
                    <span className="text-xs text-muted-foreground">SpO2</span>
                  </div>
                  <div className="font-mono font-semibold">{twinState.oxygen.toFixed(0)}%</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className="h-3 w-3 text-accent" />
                    <span className="text-xs text-muted-foreground">Temp</span>
                  </div>
                  <div className="font-mono font-semibold">{twinState.temperature.toFixed(1)}C</div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Column 2: Manifold Visualization */}
          <div className="lg:col-span-1">
            <GlassCard
              depth={3}
              className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="w-full h-full border border-border/50 rotate-45 scale-150" />
              </div>

              <Dna className="h-20 w-20 text-accent mb-6 animate-[spin_15s_linear_infinite]" />
              <h3 className="text-xl font-bold uppercase tracking-widest mb-2">6D-CRSM Manifold</h3>
              <p className="text-sm text-muted-foreground px-4 mb-6">
                Visualizing consciousness state coordinates for endometrial genetic variants
              </p>

              <PhiMeter value={twinState.phi * 10} threshold={PHI_THRESHOLD * 10} className="mb-6" />

              <div className="grid grid-cols-2 gap-3 w-full font-mono text-[10px]">
                <div className="p-2 border border-border bg-background/50 rounded">X-TRANS: 0.829</div>
                <div className="p-2 border border-border bg-background/50 rounded">
                  THETA-LOCK: {twinState.phi.toFixed(3)}
                </div>
                <div className="p-2 border border-border bg-background/50 rounded">PSI-VAR: 0.002</div>
                <div className="p-2 border border-border bg-background/50 rounded">
                  LAMBDA: {twinState.coherence.toFixed(3)}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border w-full">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Stability Status</span>
                  <Badge variant={isCoherent ? "default" : "destructive"} className="text-[10px]">
                    {isCoherent ? "COMPLIANT" : "DECOHERENT"}
                  </Badge>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Column 3: Drug Discovery & Controls */}
          <div className="space-y-6">
            {/* Drug Repurposing Engine */}
            <div className="bg-accent text-accent-foreground p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5" />
                <h3 className="font-bold uppercase text-sm">Drug Repurposing Engine</h3>
              </div>
              <p className="text-xs mb-6 leading-relaxed opacity-90">
                Searching for neurodegenerative drug targets via Pilot-Wave correlation in the 11D-CRSM manifold...
              </p>

              {activeSimulation && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Simulating Virtual Cohort</span>
                    <span>{simulationProgress}%</span>
                  </div>
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-200"
                      style={{ width: `${simulationProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={() => setActiveSimulation(true)}
                disabled={activeSimulation || twinState.phi < PHI_THRESHOLD}
                className="w-full bg-background text-foreground hover:bg-background/90"
              >
                {activeSimulation ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Beaker className="h-4 w-4 mr-2" />
                    Run Clinical Trial Sim
                  </>
                )}
              </Button>

              {twinState.phi < PHI_THRESHOLD && (
                <p className="text-[10px] mt-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Phi below threshold - simulation blocked
                </p>
              )}
            </div>

            {/* Environment Optimization */}
            <GlassCard depth={2}>
              <div className="flex items-center gap-2 mb-4">
                <Wind className="h-4 w-4 text-secondary" />
                <span className="text-xs uppercase font-mono">Biomanufacturing Environment</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Predictive maintenance via Phi telemetry. A drop in Phi indicates deviation from optimal vacuum state.
              </p>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-secondary" />
                <span className="text-sm">
                  Status: <span className="text-secondary font-semibold">NOMINAL</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs p-2 bg-muted/50 rounded text-center">
                  Temp: {twinState.temperature.toFixed(1)}C
                </div>
                <div className="text-xs p-2 bg-muted/50 rounded text-center">Press: 1.02 atm</div>
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard depth={1}>
              <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/noncausal-lm" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-between bg-transparent">
                    <span className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      NCLM Inference
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pqa-service" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-between bg-transparent">
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      PQA Verification
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Telemetry Bar */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-wrap justify-between items-center gap-4 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            <div className="flex flex-wrap gap-6">
              <span>OLED Low-Power Mode: Active</span>
              <span>Latency: 14ms</span>
              <span>Coherence Uptime: 99.7%</span>
            </div>
            <div>DNA-Lang PCI Implementation 2026</div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function BioTwinPage() {
  return (
    <Suspense fallback={null}>
      <BioTwinContent />
    </Suspense>
  )
}
