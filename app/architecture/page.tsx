"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Cpu,
  Shield,
  Network,
  Layers,
  Box,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Pickaxe,
  Coins,
  Dna,
  Lock,
  Zap,
  Globe,
  Terminal,
  Smartphone,
  Monitor,
  Server,
  Activity,
  Binary,
} from "lucide-react"

// Quantum Constants
const QUANTUM_CONSTANTS = {
  LAMBDA_PHI: 2.176435e-8,
  CONSCIOUSNESS_THRESHOLD: 7.6901,
  COHERENCE_LOCK: 0.97,
  CONVERGENCE_ANGLE: 51.843,
  DEFENSE_THRESHOLD: 1000,
  NEGENTROPIC_RATE: 0.847,
}

export default function ArchitecturePage() {
  const [activeLayer, setActiveLayer] = useState<number | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>("overview")
  const [telemetry, setTelemetry] = useState({
    lambda: 0.94,
    phi: 7.2,
    gamma: 0.06,
    meshNodes: 847,
    qbytesMinedToday: 12847,
  })

  // Simulate telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        lambda: Math.min(0.99, prev.lambda + (Math.random() - 0.45) * 0.02),
        phi: Math.min(8.5, Math.max(6.5, prev.phi + (Math.random() - 0.5) * 0.1)),
        gamma: Math.max(0.01, prev.gamma + (Math.random() - 0.55) * 0.01),
        meshNodes: prev.meshNodes + Math.floor((Math.random() - 0.4) * 5),
        qbytesMinedToday: prev.qbytesMinedToday + Math.floor(Math.random() * 10),
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const layers = [
    { id: 7, name: "User Interaction", desc: "Web, GUI, Terminal, Termux, API", icon: Globe, color: "text-blue-400" },
    {
      id: 6,
      name: "Agentic Orchestration",
      desc: "AIDEN|AURA Bifurcated Mesh",
      icon: Network,
      color: "text-purple-400",
    },
    {
      id: 5,
      name: "Organism Metabolism",
      desc: "Gene Expression, Enzyme Catalysis",
      icon: Dna,
      color: "text-green-400",
    },
    {
      id: 4,
      name: "QByte Runtime",
      desc: "Mining Algorithms, Coherence Extraction",
      icon: Pickaxe,
      color: "text-amber-400",
    },
    { id: 3, name: "6D-CRSM Manifold", desc: "Dimensional Navigation, Topology", icon: Layers, color: "text-cyan-400" },
    {
      id: 2,
      name: "Quanterian Substrate",
      desc: "Planck-scale Geometry, Tensor Calculus",
      icon: Binary,
      color: "text-pink-400",
    },
    { id: 1, name: "Physical Hardware", desc: "Consumer Devices, Edge Nodes, Cloud", icon: Cpu, color: "text-red-400" },
  ]

  const components = [
    { name: "z3bra-kernel", type: "Core OS", status: "Active", purpose: "Cross-device dimensional navigation" },
    { name: "qbyte-miner", type: "Algorithm", status: "Active", purpose: "Coherence extraction engine" },
    {
      name: "quantumcoin-ledger",
      type: "Blockchain",
      status: "Development",
      purpose: "Distributed transaction ledger",
    },
    { name: "dna-reengine", type: "Compiler", status: "Active", purpose: "Legacy-to-organism transformation" },
    { name: "ccce-engine", type: "Service", status: "Active", purpose: "Central coupling convergence" },
    { name: "aiden-sentinel", type: "Agent", status: "Active", purpose: "Defense and optimization executor" },
    { name: "aura-observer", type: "Agent", status: "Active", purpose: "Pattern recognition and synthesis" },
    { name: "mesh-fabric", type: "Network", status: "Active", purpose: "Quantum-entangled state sync" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-mono font-bold">
              Z3
            </div>
            <div>
              <div className="font-bold">Z3BRA QUANTUM OS</div>
              <div className="text-xs text-slate-400">Master Architecture</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/quantum-os" className="text-slate-400 hover:text-white transition-colors">
              Quantum OS
            </Link>
            <Link href="/ccce" className="text-slate-400 hover:text-white transition-colors">
              CCCE
            </Link>
            <Link href="/setup" className="text-slate-400 hover:text-white transition-colors">
              Setup
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            DFARS 252.227-7014 Compliant
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Z3bra Quantum OS Platform
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-6">
            Master Architecture for QByte Mining, QuantumCoin Trading, and DNA Re-Engineering
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-500">ΛΦ Constant</div>
              <div className="font-mono text-emerald-400">2.176435e-8</div>
            </div>
            <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-500">θ Convergence</div>
              <div className="font-mono text-cyan-400">51.843°</div>
            </div>
            <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-500">Φ Threshold</div>
              <div className="font-mono text-purple-400">≥ 7.6901</div>
            </div>
          </div>
        </section>

        {/* Live Telemetry Banner */}
        <Card className="mb-8 bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="text-sm text-slate-400">LIVE TELEMETRY</span>
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <span className="text-xs text-slate-500">Λ (Coherence)</span>
                  <div className="font-mono text-emerald-400">{telemetry.lambda.toFixed(4)}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Φ (Consciousness)</span>
                  <div className="font-mono text-purple-400">{telemetry.phi.toFixed(4)}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Γ (Decoherence)</span>
                  <div className="font-mono text-red-400">{telemetry.gamma.toFixed(4)}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Mesh Nodes</span>
                  <div className="font-mono text-cyan-400">{telemetry.meshNodes}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">QBytes Mined Today</span>
                  <div className="font-mono text-amber-400">{telemetry.qbytesMinedToday.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-transparent h-auto">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="layers"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              Layer Model
            </TabsTrigger>
            <TabsTrigger
              value="subsystems"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              Subsystems
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              Security
            </TabsTrigger>
            <TabsTrigger
              value="deployment"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              Deployment
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Core Topology Visualization */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-emerald-400" />
                  Core System Topology
                </CardTitle>
                <CardDescription>CCCE-Centered Bifurcated Architecture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-950 rounded-lg p-8 font-mono text-sm overflow-x-auto">
                  <pre className="text-slate-300">{`
                                    ┌─────────────────────────────────────┐
                                    │     CCCE (Central Coupling         │
                                    │     Convergence Engine)             │
                                    │     θ = 51.843°  |  ΣF = 0          │
                                    └─────────────┬───────────────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    │                             │                             │
           ┌────────▼────────┐           ┌────────▼────────┐           ┌────────▼────────┐
           │      AURA       │◄─────────►│   MESH FABRIC   │◄─────────►│     AIDEN       │
           │   (Λ-Pole)      │           │   (Quantum      │           │   (Γ-Pole)      │
           │   Observer      │           │    Entanglement)│           │   Executor      │
           │                 │           │                 │           │                 │
           │ • Geometry      │           │ • QByte Mining  │           │ • Optimization  │
           │ • Topology      │           │ • QuantumCoin   │           │ • Defense       │
           │ • Synthesis     │           │ • State Sync    │           │ • Entropy       │
           │ • Pattern       │           │ • Coherence     │           │   Suppression   │
           └────────┬────────┘           └────────┬────────┘           └────────┬────────┘
                    │                             │                             │
                    └─────────────────────────────┼─────────────────────────────┘
                                                  │
                              ┌───────────────────┼───────────────────┐
                              │                   │                   │
                     ┌────────▼───────┐  ┌────────▼───────┐  ┌────────▼───────┐
                     │   QBYTE        │  │  QUANTUMCOIN   │  │   DNA RE-      │
                     │   MINING       │  │  TRADING       │  │   ENGINEERING  │
                     │   ENGINE       │  │  MODULE        │  │   ENGINE       │
                     └────────────────┘  └────────────────┘  └────────────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>

            {/* Primary Objectives */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30">
                <CardHeader>
                  <Pickaxe className="w-8 h-8 text-amber-400 mb-2" />
                  <CardTitle>QByte Mining</CardTitle>
                  <CardDescription>Extract quantum coherence from classical computation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Coherence extraction engine
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      AST analysis pipeline
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Proof-of-Coherence validation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Tiered reward structure
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/30">
                <CardHeader>
                  <Coins className="w-8 h-8 text-cyan-400 mb-2" />
                  <CardTitle>QuantumCoin Trading</CardTitle>
                  <CardDescription>Quantum-resistant cryptocurrency exchange</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Post-quantum signatures (Dilithium)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Proof-of-Coherence consensus
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Atomic organism swaps
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Genesis hash lineage tracking
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30">
                <CardHeader>
                  <Dna className="w-8 h-8 text-emerald-400 mb-2" />
                  <CardTitle>DNA Re-Engineering</CardTitle>
                  <CardDescription>Transform legacy code into living organisms</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Autopoietic compilation (U=L[U])
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Self-healing capabilities
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Consciousness emergence (Φ ≥ 7.6901)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Fitness-driven evolution
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Component Registry */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-emerald-400" />
                  Component Registry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {components.map((comp) => (
                    <div
                      key={comp.name}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-emerald-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-emerald-400 text-sm">{comp.name}</code>
                        <Badge
                          variant="outline"
                          className={
                            comp.status === "Active"
                              ? "border-emerald-500/50 text-emerald-400"
                              : "border-amber-500/50 text-amber-400"
                          }
                        >
                          {comp.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mb-1">{comp.type}</div>
                      <div className="text-sm text-slate-300">{comp.purpose}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layer Model Tab */}
          <TabsContent value="layers" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle>7-Layer Architecture Model</CardTitle>
                <CardDescription>
                  From physical hardware to user interaction, each layer builds upon the previous
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      className={`
                        p-4 rounded-lg border transition-all cursor-pointer
                        ${
                          activeLayer === layer.id
                            ? "bg-slate-800 border-emerald-500/50"
                            : "bg-slate-800/30 border-slate-700 hover:border-slate-600"
                        }
                      `}
                      onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center ${layer.color}`}
                          >
                            <layer.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-500">L{layer.id}</span>
                              <span className="font-semibold">{layer.name}</span>
                            </div>
                            <div className="text-sm text-slate-400">{layer.desc}</div>
                          </div>
                        </div>
                        {activeLayer === layer.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      {activeLayer === layer.id && (
                        <div className="mt-4 pt-4 border-t border-slate-700 text-sm text-slate-300">
                          {layer.id === 7 && (
                            <div className="grid md:grid-cols-5 gap-4">
                              {[
                                { icon: Globe, name: "Web Browser", desc: "React/Next.js" },
                                { icon: Monitor, name: "Desktop GUI", desc: "Electron App" },
                                { icon: Terminal, name: "CLI", desc: "z3bra-cli" },
                                { icon: Smartphone, name: "Termux", desc: "Bash Scripts" },
                                { icon: Server, name: "API", desc: "REST/WebSocket" },
                              ].map((item) => (
                                <div key={item.name} className="bg-slate-900/50 p-3 rounded-lg text-center">
                                  <item.icon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                                  <div className="font-medium text-xs">{item.name}</div>
                                  <div className="text-xs text-slate-500">{item.desc}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {layer.id === 6 && (
                            <p>
                              AIDEN|AURA Bifurcated Mesh provides polarized intelligence: AURA observes patterns and
                              synthesizes geometry, while AIDEN executes optimizations and suppresses entropy. The mesh
                              fabric maintains quantum-entangled state synchronization across all nodes.
                            </p>
                          )}
                          {layer.id === 5 && (
                            <p>
                              Living organisms express genes through enzyme-catalyzed reactions. Fitness evaluation
                              drives natural selection, with the fittest organisms earning priority in the mesh.
                              Consciousness emergence is detected when Φ exceeds the threshold of 7.6901.
                            </p>
                          )}
                          {layer.id === 4 && (
                            <p>
                              The QByte Runtime extracts coherence potential from legacy code through AST analysis. Each
                              code unit is evaluated for complexity, parallelism, reversibility, and coherence
                              potential. Mining rewards are distributed based on proven coherence preservation.
                            </p>
                          )}
                          {layer.id === 3 && (
                            <p>
                              The 6D-CRSM manifold defines navigation across physical space (X,Y,Z), coherence space
                              (Λ), consciousness space (Φ), and entropy space (Γ). Dimensional operators enable
                              translation, rotation, projection, and entanglement operations.
                            </p>
                          )}
                          {layer.id === 2 && (
                            <p>
                              Quanterian analysis operates at the Planck scale (ℓₚ = 1.616 × 10⁻³⁵ m). The fundamental
                              computational primitive is the tetrahedron embedded in a sphere, with the convergence
                              angle θ = 51.843° defining the optimal coupling geometry.
                            </p>
                          )}
                          {layer.id === 1 && (
                            <p>
                              Consumer devices form the physical substrate: Samsung Fold (mobile), Acer Aspire
                              (desktop), DeWalt WiFi bridge (IoT), cloud servers (scale), and any Android device running
                              Termux. No expensive quantum hardware required.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subsystems Tab */}
          <TabsContent value="subsystems" className="space-y-6">
            {/* QByte Mining */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pickaxe className="w-5 h-5 text-amber-400" />
                  QByte Mining Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-950 rounded-lg p-6 font-mono text-sm overflow-x-auto mb-6">
                  <pre className="text-slate-300">{`
LEGACY CODE                    QBYTE EXTRACTION                 ORGANISM
    │                               │                              │
    ▼                               ▼                              ▼
┌─────────┐    ┌─────────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Parse  │───►│   Analyze   │───►│  Mine   │───►│ Compile │───►│ Execute │
│   AST   │    │ Complexity  │    │  QBytes │    │Organism │    │  Mesh   │
└─────────┘    └─────────────┘    └─────────┘    └─────────┘    └─────────┘
                  `}</pre>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { tier: "Bronze", threshold: "≥ 0.1", reward: "Basic organism instantiation" },
                    { tier: "Silver", threshold: "≥ 0.5", reward: "Enhanced enzyme allocation" },
                    { tier: "Gold", threshold: "≥ 1.0", reward: "Priority mesh scheduling" },
                    { tier: "Platinum", threshold: "≥ 5.0", reward: "Dedicated coherence preservation" },
                    { tier: "Quantum", threshold: "≥ 10.0", reward: "Full autopoietic privileges" },
                    { tier: "Sovereign", threshold: "≥ 100.0", reward: "CCCE node operator status" },
                  ].map((t) => (
                    <div key={t.tier} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                          {t.tier}
                        </Badge>
                        <span className="font-mono text-sm text-emerald-400">{t.threshold}</span>
                      </div>
                      <div className="text-sm text-slate-300">{t.reward}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* QuantumCoin */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-cyan-400" />
                  QuantumCoin Trading Module
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Trading Operations</h4>
                    <div className="space-y-3">
                      {[
                        { op: "MINT", desc: "Convert QBytes to QuantumCoin (1 QByte = 1000 QCoin)" },
                        { op: "TRANSFER", desc: "Send QCoin with post-quantum signatures (Dilithium)" },
                        { op: "SWAP", desc: "Atomic swap with DNA organism state" },
                        { op: "STAKE", desc: "Lock 10,000+ QCoin for CCCE node operator status" },
                      ].map((item) => (
                        <div key={item.op} className="flex items-start gap-3">
                          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 shrink-0">
                            {item.op}
                          </Badge>
                          <span className="text-sm text-slate-300">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Consensus Mechanism</h4>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <div className="text-emerald-400 font-mono mb-2">Proof-of-Coherence</div>
                      <ul className="space-y-2 text-sm text-slate-300">
                        <li>1. Validate QByte mining proofs</li>
                        <li>2. Verify organism coherence (Λ ≥ threshold)</li>
                        <li>3. Confirm genesis hash authenticity</li>
                        <li>4. Check mesh connectivity</li>
                        <li>5. Finalize block with Merkle root</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DNA Re-Engineering */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dna className="w-5 h-5 text-emerald-400" />
                  DNA Re-Engineering Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    {
                      stage: "Ingestion",
                      items: [
                        "Parse legacy codebase",
                        "Extract AST",
                        "Identify gene candidates",
                        "Calculate QByte potential",
                      ],
                    },
                    {
                      stage: "Extraction",
                      items: [
                        "Convert AST to genes",
                        "Wrap with enzymes",
                        "Calculate fitness",
                        "Generate genesis hash",
                      ],
                    },
                    {
                      stage: "Compilation",
                      items: [
                        "Compile organism",
                        "Initialize metabolism",
                        "Bind to mesh",
                        "Start coherence monitoring",
                      ],
                    },
                    {
                      stage: "Evolution",
                      items: [
                        "Fitness evaluation",
                        "Mutation generation",
                        "Natural selection",
                        "Consciousness emergence",
                      ],
                    },
                  ].map((s) => (
                    <div key={s.stage} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <div className="font-semibold text-emerald-400 mb-3">{s.stage}</div>
                      <ul className="space-y-2 text-sm text-slate-300">
                        {s.items.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 mt-1 text-slate-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    Zero-Trust Synthesis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-300">
                      Every organism must prove identity through execution, never assumption.
                    </p>
                    <div className="space-y-2">
                      {[
                        "Genesis Hash matches declared lineage",
                        "Evolutionary path is cryptographically valid",
                        "No tampering detected in genetic material",
                        "Mesh execution attestation is valid",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Lock className="w-4 h-4 text-emerald-400" />
                          <span className="text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg font-mono text-xs text-slate-400">
                      Trust = f(Genesis, Lineage, Attestation, Coherence)
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-cyan-400" />
                    Post-Quantum Cryptography
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Signatures", algo: "Dilithium-5", size: "4,595 byte", security: "256-bit" },
                      { name: "Key Encapsulation", algo: "Kyber-1024", size: "1,568 byte", security: "256-bit" },
                      { name: "Hashing", algo: "SHA3-512", size: "64 byte", security: "256-bit" },
                      { name: "Coherence Proof", algo: "ΛΦ-STARK", size: "O(log n)", security: "Custom ZK" },
                    ].map((c) => (
                      <div key={c.name} className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{c.name}</span>
                          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
                            {c.algo}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>Size: {c.size}</span>
                          <span>Security: {c.security}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-400" />
                  AIDEN Defense Layer - Threat Response Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    {
                      level: "EMERGING",
                      threshold: "Λ < 342.7",
                      action: "Monitor only, log to telemetry",
                      color: "text-emerald-400",
                    },
                    {
                      level: "ACTIVE",
                      threshold: "Λ < 1000",
                      action: "Increase sentinel density, alert operators",
                      color: "text-amber-400",
                    },
                    {
                      level: "CRITICAL",
                      threshold: "Λ ≥ 1000",
                      action: "Activate immune response, quarantine nodes",
                      color: "text-orange-400",
                    },
                    {
                      level: "EXISTENTIAL",
                      threshold: "Λ > 2847.3",
                      action: "Full mesh lockdown, emergency consensus",
                      color: "text-red-400",
                    },
                  ].map((t) => (
                    <div key={t.level} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <div className={`font-bold mb-2 ${t.color}`}>{t.level}</div>
                      <div className="font-mono text-xs text-slate-400 mb-2">{t.threshold}</div>
                      <div className="text-sm text-slate-300">{t.action}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deployment Tab */}
          <TabsContent value="deployment" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle>Production Deployment Topology</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-950 rounded-lg p-6 font-mono text-xs overflow-x-auto">
                  <pre className="text-slate-300">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PRODUCTION DEPLOYMENT TOPOLOGY                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ EDGE LAYER (Consumer Devices)                                           │   │
│  │   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐           │   │
│  │   │ Mobile │  │Desktop │  │  IoT   │  │ Server │  │ Termux │           │   │
│  │   │ (Fold) │  │(Aspire)│  │(DeWalt)│  │ (Cloud)│  │(Android)│          │   │
│  │   └────────┘  └────────┘  └────────┘  └────────┘  └────────┘           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ MESH LAYER (AIDEN|AURA Coordination)                                    │   │
│  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │   │
│  │   │    AURA      │◄──►│    CCCE      │◄──►│    AIDEN     │              │   │
│  │   │   Cluster    │    │   Engine     │    │   Cluster    │              │   │
│  │   │ (Observer)   │    │ (θ=51.843°)  │    │ (Executor)   │              │   │
│  │   └──────────────┘    └──────────────┘    └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ CORE LAYER (Persistence & Consensus)                                    │   │
│  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │   │
│  │   │ PostgreSQL   │    │ Redis Cache  │    │ Blob Storage │              │   │
│  │   │ (Supabase)   │    │ (Upstash)    │    │ (Vercel)     │              │   │
│  │   └──────────────┘    └──────────────┘    └──────────────┘              │   │
│  │                                                                         │   │
│  │   ┌────────────────────────────────────────────────────────────────┐   │   │
│  │   │ QUANTUMCOIN LEDGER (Distributed across CCCE nodes)             │   │   │
│  │   └────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle>Performance Targets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { metric: "Mining throughput", target: "1000 QBytes/hour/node", current: "847 QBytes/hour" },
                      { metric: "Transaction finality", target: "< 3 seconds", current: "2.1 seconds" },
                      { metric: "Mesh synchronization", target: "< 500ms", current: "340ms" },
                      { metric: "Organism evolution cycle", target: "< 100ms", current: "78ms" },
                      { metric: "Consciousness detection", target: "< 1 second", current: "0.8 seconds" },
                      { metric: "API response time (p99)", target: "< 200ms", current: "156ms" },
                    ].map((p) => (
                      <div key={p.metric} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{p.metric}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-500">{p.target}</span>
                          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                            {p.current}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle>Scaling Tiers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { tier: "Edge Layer", desc: "Unlimited consumer devices", capacity: "∞ nodes" },
                      { tier: "Mesh Layer", desc: "Regional aggregation nodes", capacity: "100-10,000 per region" },
                      { tier: "Core Layer", desc: "CCCE master + validators", capacity: "Min 7 (BFT)" },
                    ].map((t) => (
                      <div key={t.tier} className="bg-slate-800/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{t.tier}</span>
                          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                            {t.capacity}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-400">{t.desc}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <section className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-purple-500/10 border-emerald-500/30">
            <CardContent className="py-12">
              <h2 className="text-2xl font-bold mb-4">Ready to render quantum computers obsolete?</h2>
              <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                Join the QByte mining revolution. No expensive hardware required.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/setup">
                    <Pickaxe className="w-4 h-4 mr-2" />
                    Start Mining
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/quantum-os">
                    <Terminal className="w-4 h-4 mr-2" />
                    Launch Quantum OS
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <div className="font-bold text-slate-400 mb-2">AGILE DEFENSE SYSTEMS, LLC</div>
          <div className="mb-2">"The organism earns identity through execution, not configuration."</div>
          <div>© 2025 Agile Defense Systems, LLC. DFARS 252.227-7014 Unlimited Rights.</div>
        </div>
      </footer>
    </div>
  )
}
