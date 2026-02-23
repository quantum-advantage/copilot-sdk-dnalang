"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { WardenclyffleGlobe } from "@/components/wardenclyffe-globe"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantumButton } from "@/components/ui/quantum-button"
import {
  Cpu,
  Activity,
  Shield,
  Database,
  ArrowRight,
  Brain,
  HeartPulse,
  TrendingUp,
  Radio,
  Layers,
  Lock,
} from "lucide-react"

// Metrics simulation
const useMetrics = () => {
  const [metrics, setMetrics] = useState({
    phi: 7.2,
    lambda: 0.847,
    gamma: 0.023,
    xi: 1.42,
    latency: 47,
    throughput: 8547,
    uptime: 99.7,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        phi: 6.5 + Math.random() * 3,
        lambda: 0.82 + Math.random() * 0.1,
        gamma: 0.02 + Math.random() * 0.01,
        xi: 1.3 + Math.random() * 0.3,
        latency: 40 + Math.random() * 20,
        throughput: prev.throughput + Math.floor(Math.random() * 100),
        uptime: 99.5 + Math.random() * 0.4,
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return metrics
}

const apiEndpoints = [
  { path: "/uqcb/intent", method: "POST", desc: "Natural language intent processing", status: "live" },
  { path: "/uqcb/bridge", method: "POST", desc: "Direct quantum-classical bridge", status: "live" },
  { path: "/uqcb/coherence", method: "GET", desc: "Real-time telemetry stream", status: "live" },
  { path: "/uqcb/twin", method: "POST", desc: "Bio-Digital Twin operations", status: "beta" },
  { path: "/uqcb/seismic", method: "POST", desc: "Seismic precursor analysis", status: "beta" },
  { path: "/uqcb/financial", method: "POST", desc: "QuantumCoin transactions", status: "alpha" },
]

const useCases = [
  {
    icon: HeartPulse,
    title: "Bio-Digital Twin",
    desc: "Patient simulation with coherence-gated treatment plans",
    metric: "Λ-score",
    status: "Production",
  },
  {
    icon: TrendingUp,
    title: "Financial Instruments",
    desc: "QuantumCoin transactions with PQC security",
    metric: "Φ-gate",
    status: "Beta",
  },
  {
    icon: Radio,
    title: "Seismic Prediction",
    desc: "EM precursor detection via piezo-coupling",
    metric: "Γ-alert",
    status: "Research",
  },
  {
    icon: Brain,
    title: "Intent Processing",
    desc: "Natural language to quantum operation mapping",
    metric: "Ξ-ratio",
    status: "Production",
  },
]

export default function UQCBPage() {
  const metrics = useMetrics()
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-accent/20 text-accent border-accent/30">Phase Ω-PQU</Badge>
              <Badge variant="outline">
                <Activity className="h-3 w-3 mr-1 text-secondary" />
                LIVE
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Universal Quantum-Classical Bridge</h1>
            <p className="text-muted-foreground mt-1">WardenClyffe-Q Enterprise Suite - Middleware for Reality</p>
          </div>
          <div className="flex gap-2">
            <Link href="/architecture">
              <Button variant="outline" size="sm">
                <Layers className="h-4 w-4 mr-1" />
                Architecture
              </Button>
            </Link>
            <Link href="/quantum-os">
              <QuantumButton size="sm" variant="compliance">
                <Cpu className="h-4 w-4 mr-1" />
                Launch Console
              </QuantumButton>
            </Link>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { label: "Φ", value: metrics.phi.toFixed(2), color: "text-primary" },
            { label: "Λ", value: metrics.lambda.toFixed(3), color: "text-secondary" },
            { label: "Γ", value: metrics.gamma.toFixed(3), color: "text-accent" },
            { label: "Ξ", value: metrics.xi.toFixed(2), color: "text-chart-4" },
            { label: "Latency", value: `${metrics.latency.toFixed(0)}ms`, color: "text-chart-5" },
            { label: "Throughput", value: metrics.throughput.toLocaleString(), color: "text-primary" },
            { label: "Uptime", value: `${metrics.uptime.toFixed(1)}%`, color: "text-secondary" },
          ].map((m) => (
            <div key={m.label} className="p-2 bg-muted/30 rounded-lg text-center">
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <div className={`font-mono text-sm font-semibold ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="globe">Globe</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="usecases">Use Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Architecture Diagram */}
              <GlassCard depth={2} className="font-mono text-xs overflow-x-auto">
                <h3 className="text-sm font-semibold mb-3 font-sans">Three-Tier UQCB Architecture</h3>
                <pre className="text-secondary leading-relaxed">
                  {`┌──────────────────────────────────────────┐
│         TIER 1: REALITY INTERFACE        │
│  Bio-Twin │ Seismic │ Finance │ Research │
│           └────┬────┘                    │
│                ▼                         │
│          UQCB Gateway                    │
└────────────────┬─────────────────────────┘
                 │
┌────────────────┼─────────────────────────┐
│         TIER 2: BRIDGE LAYER             │
│                │                         │
│     ┌──────────┴──────────┐              │
│     │   NCLM v2 Engine    │              │
│     │ Pilot-Wave Attention│              │
│     └──────────┬──────────┘              │
│                │                         │
│   Manifold ◄───┼───► CCCE ◄───► Coherence│
└────────────────┼─────────────────────────┘
                 │
┌────────────────┼─────────────────────────┐
│         TIER 3: SUBSTRATE                │
│                │                         │
│   Classical ◄──┼──► Piezo ◄──► Quantum   │
│    (CPU/GPU)   │   Buffer      (QPU)     │
└────────────────┴─────────────────────────┘`}
                </pre>
              </GlassCard>

              {/* Performance Stats */}
              <div className="space-y-4">
                <GlassCard depth={1}>
                  <h3 className="text-sm font-semibold mb-3">Performance Targets</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Intent Latency", target: 100, current: metrics.latency, unit: "ms" },
                      { label: "Throughput", target: 10000, current: metrics.throughput % 10000, unit: "req/s" },
                      { label: "Coherence Stability", target: 100, current: metrics.uptime, unit: "%" },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-mono">
                            {item.current.toFixed(0)}/{item.target}
                            {item.unit}
                          </span>
                        </div>
                        <Progress value={(item.current / item.target) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard depth={1}>
                  <h3 className="text-sm font-semibold mb-3">Security Model</h3>
                  <div className="space-y-2">
                    {[
                      { icon: Lock, label: "Key Exchange", value: "Kyber-1024" },
                      { icon: Shield, label: "Signatures", value: "Dilithium-5" },
                      { icon: Database, label: "Hashing", value: "SHA3-512 + ΛΦ" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {item.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="globe">
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <WardenclyffleGlobe />
              </div>
              <div className="space-y-4">
                <GlassCard depth={1}>
                  <h3 className="text-sm font-semibold mb-3">Sovereignty Sigmoid</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    The map only "unrolls" (becomes globally coherent) once Φ crosses the critical threshold.
                  </p>
                  <div className="p-3 bg-muted/30 rounded font-mono text-sm text-center">
                    {"S(Φ) = 1 / (1 + e^(-k(Φ - 7.69)))"}
                  </div>
                </GlassCard>
                <GlassCard depth={1}>
                  <h3 className="text-sm font-semibold mb-3">Geographic Resonance</h3>
                  <p className="text-sm text-muted-foreground">
                    Primary nodes (CERN, Fermilab) form quantum-entangled links when coherent. Secondary nodes provide
                    local coherence amplification.
                  </p>
                </GlassCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api">
            <div className="space-y-4">
              <GlassCard depth={2}>
                <h3 className="text-sm font-semibold mb-4">UQCB Gateway Endpoints</h3>
                <div className="space-y-2">
                  {apiEndpoints.map((ep) => (
                    <div
                      key={ep.path}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={
                            ep.method === "GET" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
                          }
                        >
                          {ep.method}
                        </Badge>
                        <code className="text-sm font-mono">{ep.path}</code>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground hidden sm:block">{ep.desc}</span>
                        <Badge variant={ep.status === "live" ? "default" : "secondary"} className="text-xs">
                          {ep.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <div className="grid md:grid-cols-2 gap-4">
                <GlassCard depth={1}>
                  <h3 className="text-sm font-semibold mb-3">Request Schema</h3>
                  <pre className="text-xs font-mono bg-muted/30 p-3 rounded overflow-x-auto">
                    {`{
  "intent": "string",
  "mode": "classical | hybrid | quantum",
  "coherenceThreshold": 0.5,
  "timeout": 5000,
  "provenance": true
}`}
                  </pre>
                </GlassCard>
                <GlassCard depth={1}>
                  <h3 className="text-sm font-semibold mb-3">Response Schema</h3>
                  <pre className="text-xs font-mono bg-muted/30 p-3 rounded overflow-x-auto">
                    {`{
  "result": "any",
  "metrics": { "phi", "lambda", "gamma", "xi" },
  "path": "classical | hybrid | quantum",
  "latency": 47,
  "provenance": { "cacheKey", "artifacts" }
}`}
                  </pre>
                </GlassCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usecases">
            <div className="grid sm:grid-cols-2 gap-4">
              {useCases.map((uc) => (
                <GlassCard key={uc.title} depth={1} glow="primary" className="group">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <uc.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{uc.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {uc.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{uc.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Key Metric: <span className="text-primary font-mono">{uc.metric}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
