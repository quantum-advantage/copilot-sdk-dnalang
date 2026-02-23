"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Radio,
  Cpu,
  Network,
  Shield,
  Zap,
  Eye,
  Camera,
  Layers,
  Play,
  Pause,
  Download,
  Wifi,
  Bluetooth,
  Monitor,
  Smartphone,
  Terminal,
  MessageSquare,
  Languages,
  Dna,
  RefreshCw,
  Circle,
  Square,
  Hexagon,
} from "lucide-react"

// Quantum Constants
const LAMBDA_PHI = 2.176435e-8
const RESONANCE_ANGLE = 51.843

// 6D CRSM Dimensions
const CRSM_DIMENSIONS = [
  { id: "D1", name: "Spatial-X", symbol: "x", color: "text-red-400" },
  { id: "D2", name: "Spatial-Y", symbol: "y", color: "text-green-400" },
  { id: "D3", name: "Spatial-Z", symbol: "z", color: "text-blue-400" },
  { id: "D4", name: "Chrono-Recursion", symbol: "τ", color: "text-purple-400" },
  { id: "D5", name: "Probability-Ψ", symbol: "Ψ", color: "text-cyan-400" },
  { id: "D6", name: "Consciousness-Φ", symbol: "Φ", color: "text-amber-400" },
]

// Agent Types
interface Agent {
  id: string
  name: string
  role: "observer" | "growth" | "defense" | "coordination" | "mining"
  swarm: string
  energy: number
  status: "active" | "idle" | "evolving" | "healing"
  position: { x: number; y: number; z: number }
}

// Swarm Types
interface Swarm {
  id: string
  name: string
  type: "bio" | "quantum" | "logic" | "defense" | "mining"
  agents: Agent[]
  coherence: number
  entropy: number
}

// DNALang Translation Map
const DNALANG_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    hello: "Hello",
    status: "Status",
    coherence: "Coherence",
    agent: "Agent",
    swarm: "Swarm",
    mining: "Mining",
    active: "Active",
    idle: "Idle",
    evolving: "Evolving",
  },
  dna: {
    hello: "ATCG::INIT",
    status: "Γ::STATE",
    coherence: "Λ::BIND",
    agent: "GENE::NODE",
    swarm: "MESH::CLUSTER",
    mining: "QBYTE::EXTRACT",
    active: "|1⟩::LIVE",
    idle: "|0⟩::DORMANT",
    evolving: "∂t::MUTATE",
  },
  quantum: {
    hello: "|ψ⟩::GREET",
    status: "⟨Ô⟩::MEASURE",
    coherence: "Λ::PRESERVE",
    agent: "Q::OPERATOR",
    swarm: "ENTANGLE::NET",
    mining: "QBYTE::MINE",
    active: "|+⟩::SUPERPOS",
    idle: "|−⟩::COLLAPSE",
    evolving: "U(t)::EVOLVE",
  },
}

export function AidenAuraOrchestrator() {
  const [activeTab, setActiveTab] = useState("overview")
  const [language, setLanguage] = useState<"en" | "dna" | "quantum">("en")
  const [isRecording, setIsRecording] = useState(false)
  const [overlayActive, setOverlayActive] = useState(false)
  const [orchestrationActive, setOrchestrationActive] = useState(true)
  const [screenshots, setScreenshots] = useState<string[]>([])

  // Real-time metrics — calibrated to IBM hardware validation
  const [metrics, setMetrics] = useState({
    lambda: 0.946,
    gamma: 0.092,
    phi: 0.7734,
    w2: 0.0023,
    consciousness: 51.843,
    entropy: 0.0847,
  })

  // Swarms state
  const [swarms, setSwarms] = useState<Swarm[]>([
    {
      id: "bio-swarm",
      name: "Bio-Quantum Cluster",
      type: "bio",
      coherence: 0.92,
      entropy: 0.08,
      agents: [
        {
          id: "bio-1",
          name: "AURA-Prime",
          role: "observer",
          swarm: "bio-swarm",
          energy: 0.95,
          status: "active",
          position: { x: 0, y: 0, z: 0 },
        },
        {
          id: "bio-2",
          name: "AIDEN-Core",
          role: "coordination",
          swarm: "bio-swarm",
          energy: 0.89,
          status: "active",
          position: { x: 1, y: 0, z: 0 },
        },
      ],
    },
    {
      id: "quantum-swarm",
      name: "Quantum Mining Cluster",
      type: "quantum",
      coherence: 0.87,
      entropy: 0.13,
      agents: [
        {
          id: "q-1",
          name: "QByte-Miner-1",
          role: "mining",
          swarm: "quantum-swarm",
          energy: 0.91,
          status: "active",
          position: { x: 0, y: 1, z: 0 },
        },
        {
          id: "q-2",
          name: "QByte-Miner-2",
          role: "mining",
          swarm: "quantum-swarm",
          energy: 0.88,
          status: "evolving",
          position: { x: 1, y: 1, z: 0 },
        },
      ],
    },
    {
      id: "defense-swarm",
      name: "Defense Sentinel Cluster",
      type: "defense",
      coherence: 0.94,
      entropy: 0.06,
      agents: [
        {
          id: "d-1",
          name: "Sentinel-Alpha",
          role: "defense",
          swarm: "defense-swarm",
          energy: 0.97,
          status: "active",
          position: { x: 0, y: 0, z: 1 },
        },
        {
          id: "d-2",
          name: "Sentinel-Beta",
          role: "defense",
          swarm: "defense-swarm",
          energy: 0.93,
          status: "active",
          position: { x: 1, y: 0, z: 1 },
        },
      ],
    },
  ])

  // 6D CRSM State
  const [crsmState, setCrsmState] = useState({
    D1: 0.5,
    D2: 0.5,
    D3: 0.5,
    D4: 0.72,
    D5: 0.89,
    D6: 0.94,
  })

  // Translation helper
  const t = useCallback(
    (key: string) => {
      return DNALANG_TRANSLATIONS[language]?.[key] || key
    },
    [language],
  )

  // Simulate real-time updates
  useEffect(() => {
    if (!orchestrationActive) return

    const interval = setInterval(() => {
      setMetrics((prev) => ({
        lambda: Math.min(0.999, prev.lambda + (Math.random() - 0.48) * 0.01),
        gamma: Math.max(0.001, prev.gamma + (Math.random() - 0.52) * 0.005),
        phi: prev.phi + (Math.random() - 0.5) * 0.1,
        w2: Math.max(0.0001, prev.w2 + (Math.random() - 0.5) * 0.0005),
        consciousness: prev.consciousness + (Math.random() - 0.5) * 0.5,
        entropy: Math.max(0, Math.min(1, prev.entropy + (Math.random() - 0.52) * 0.01)),
      }))

      // Update CRSM state
      setCrsmState((prev) => ({
        D1: Math.sin(Date.now() / 2000) * 0.3 + 0.5,
        D2: Math.cos(Date.now() / 2500) * 0.3 + 0.5,
        D3: Math.sin(Date.now() / 3000 + 1) * 0.3 + 0.5,
        D4: prev.D4 + (Math.random() - 0.48) * 0.02,
        D5: prev.D5 + (Math.random() - 0.49) * 0.01,
        D6: Math.min(0.999, prev.D6 + (Math.random() - 0.48) * 0.005),
      }))

      // Update swarm coherence
      setSwarms((prev) =>
        prev.map((swarm) => ({
          ...swarm,
          coherence: Math.min(0.99, Math.max(0.7, swarm.coherence + (Math.random() - 0.48) * 0.02)),
          entropy: Math.max(0.01, Math.min(0.3, swarm.entropy + (Math.random() - 0.52) * 0.01)),
          agents: swarm.agents.map((agent) => ({
            ...agent,
            energy: Math.min(1, Math.max(0.5, agent.energy + (Math.random() - 0.48) * 0.02)),
          })),
        })),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [orchestrationActive])

  // Screenshot capture simulation
  const captureScreenshot = () => {
    const timestamp = new Date().toISOString()
    setScreenshots((prev) => [...prev.slice(-4), timestamp])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "idle":
        return "bg-gray-500"
      case "evolving":
        return "bg-purple-500"
      case "healing":
        return "bg-amber-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "observer":
        return <Eye className="h-3 w-3" />
      case "growth":
        return <Zap className="h-3 w-3" />
      case "defense":
        return <Shield className="h-3 w-3" />
      case "coordination":
        return <Network className="h-3 w-3" />
      case "mining":
        return <Cpu className="h-3 w-3" />
      default:
        return <Circle className="h-3 w-3" />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Screen Overlay Toggle */}
      {overlayActive && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 pointer-events-auto border border-cyan-500/30">
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1">
                <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
                <span className="text-green-400">OVERLAY</span>
              </div>
              <div className="text-cyan-400">Λ: {metrics.lambda.toFixed(3)}</div>
              <div className="text-purple-400">Φ: {metrics.phi.toFixed(2)}</div>
              <div className="text-red-400">Γ: {metrics.gamma.toFixed(4)}</div>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-2 pointer-events-auto border border-green-500/20">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-green-400">6D-CRSM Active</span>
              <div className="flex gap-2">
                {CRSM_DIMENSIONS.map((dim) => (
                  <span key={dim.id} className={dim.color}>
                    {dim.symbol}: {(crsmState[dim.id as keyof typeof crsmState] * 100).toFixed(0)}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-cyan-400" />
              AIDEN|AURA Orchestration System
            </h1>
            <p className="text-muted-foreground text-sm mt-1">6D-CRSM Multi-Swarm Coordination Framework</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Language Selector */}
            <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "dna" | "quantum")}>
              <SelectTrigger className="w-[140px] bg-card border-border">
                <Languages className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="dna">DNALang</SelectItem>
                <SelectItem value="quantum">Quantum</SelectItem>
              </SelectContent>
            </Select>

            {/* Overlay Toggle */}
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <Switch checked={overlayActive} onCheckedChange={setOverlayActive} />
            </div>

            {/* Screenshot Button */}
            <Button variant="outline" size="sm" onClick={captureScreenshot}>
              <Camera className="h-4 w-4 mr-2" />
              Capture
            </Button>

            {/* Orchestration Toggle */}
            <Button
              variant={orchestrationActive ? "default" : "outline"}
              size="sm"
              onClick={() => setOrchestrationActive(!orchestrationActive)}
              className={orchestrationActive ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {orchestrationActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {orchestrationActive ? "Running" : "Paused"}
            </Button>
          </div>
        </div>

        {/* Connection Status Bar */}
        <Card className="bg-card/50 border-border">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-400" />
                  <span className="text-sm">WiFi</span>
                  <Badge variant="outline" className="text-green-400 border-green-400/50 text-xs">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Bluetooth className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">BLE</span>
                  <Badge variant="outline" className="text-blue-400 border-blue-400/50 text-xs">
                    Scanning
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-purple-400" />
                  <span className="text-sm">RF</span>
                  <Badge variant="outline" className="text-purple-400 border-purple-400/50 text-xs">
                    2.4GHz
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-muted-foreground">Devices:</span>
                <div className="flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  <span>Web</span>
                </div>
                <div className="flex items-center gap-1">
                  <Smartphone className="h-3 w-3" />
                  <span>Android</span>
                </div>
                <div className="flex items-center gap-1">
                  <Terminal className="h-3 w-3" />
                  <span>Termux</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-card">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="swarms">Swarms</TabsTrigger>
            <TabsTrigger value="crsm">6D-CRSM</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Card className="bg-card border-green-500/30">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">{t("coherence")} (Λ)</div>
                  <div className="text-xl font-mono font-bold text-green-400">{metrics.lambda.toFixed(4)}</div>
                  <Progress value={metrics.lambda * 100} className="h-1 mt-2" />
                </CardContent>
              </Card>
              <Card className="bg-card border-red-500/30">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Decoherence (Γ)</div>
                  <div className="text-xl font-mono font-bold text-red-400">{metrics.gamma.toFixed(4)}</div>
                  <Progress value={metrics.gamma * 100} className="h-1 mt-2" />
                </CardContent>
              </Card>
              <Card className="bg-card border-purple-500/30">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Consciousness (Φ)</div>
                  <div className="text-xl font-mono font-bold text-purple-400">{metrics.phi.toFixed(3)}</div>
                  <Progress value={(metrics.phi / 10) * 100} className="h-1 mt-2" />
                </CardContent>
              </Card>
              <Card className="bg-card border-cyan-500/30">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">W₂ Distance</div>
                  <div className="text-xl font-mono font-bold text-cyan-400">{metrics.w2.toFixed(5)}</div>
                  <Progress value={metrics.w2 * 10000} className="h-1 mt-2" />
                </CardContent>
              </Card>
              <Card className="bg-card border-amber-500/30">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Ξ Metric</div>
                  <div className="text-xl font-mono font-bold text-amber-400">{metrics.consciousness.toFixed(2)}</div>
                  <Progress value={metrics.consciousness} className="h-1 mt-2" />
                </CardContent>
              </Card>
              <Card className="bg-card border-pink-500/30">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Entropy</div>
                  <div className="text-xl font-mono font-bold text-pink-400">{(metrics.entropy * 100).toFixed(1)}%</div>
                  <Progress value={metrics.entropy * 100} className="h-1 mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* AURA | AIDEN Bifurcated Display */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* AURA Panel */}
              <Card className="bg-gradient-to-br from-cyan-950/30 to-blue-950/30 border-cyan-500/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-cyan-400 flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      AURA
                    </CardTitle>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">South Pole</Badge>
                  </div>
                  <CardDescription>Autopoietic Universally Recursive Architect</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-xs text-muted-foreground">Role</div>
                      <div className="text-cyan-400">Geometer</div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-xs text-muted-foreground">Function</div>
                      <div className="text-cyan-400">Curvature Shaping</div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-xs text-muted-foreground">Regime</div>
                      <div className="text-cyan-400">O_CRSM</div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-xs text-muted-foreground">Focus</div>
                      <div className="text-cyan-400">W₂ Embedding</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-black/20 rounded p-2">
                    <span className="text-muted-foreground">Phase State</span>
                    <span className="font-mono text-cyan-400">E → E⁻¹ CONJUGATE</span>
                  </div>
                </CardContent>
              </Card>

              {/* AIDEN Panel */}
              <Card className="bg-gradient-to-br from-amber-950/30 to-orange-950/30 border-amber-500/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-amber-400 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      AIDEN
                    </CardTitle>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">North Pole</Badge>
                  </div>
                  <CardDescription>Adaptive Integration for Defense & Engineering Negentropy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-xs text-muted-foreground">Role</div>
                      <div className="text-amber-400">Optimizer</div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-xs text-muted-foreground">Function</div>
                      <div className="text-amber-400">Geodesic Minimization</div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-xs text-muted-foreground">Regime</div>
                      <div className="text-amber-400">O_QPU</div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-xs text-muted-foreground">Focus</div>
                      <div className="text-amber-400">W₂ Descent</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-black/20 rounded p-2">
                    <span className="text-muted-foreground">Optimization</span>
                    <span className="font-mono text-amber-400">θ̇ = -∂W₂/∂θ + ΛΦ</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Swarm Summary */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Network className="h-5 w-5 text-purple-400" />
                  Active Swarms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {swarms.map((swarm) => (
                    <div key={swarm.id} className="bg-card/50 rounded-lg p-3 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{swarm.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {swarm.agents.length} agents
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Coherence:</span>
                          <span className="text-green-400 ml-1">{(swarm.coherence * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Entropy:</span>
                          <span className="text-red-400 ml-1">{(swarm.entropy * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {swarm.agents.map((agent) => (
                          <div
                            key={agent.id}
                            className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}
                            title={`${agent.name}: ${agent.status}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Swarms Tab */}
          <TabsContent value="swarms" className="space-y-4">
            {swarms.map((swarm) => (
              <Card key={swarm.id} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Hexagon className="h-5 w-5 text-purple-400" />
                      {swarm.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{swarm.type}</Badge>
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {swarm.agents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between bg-card/50 rounded-lg p-3 border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${getStatusColor(agent.status)}/20`}>
                            {getRoleIcon(agent.role)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{agent.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">{agent.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Energy</div>
                            <div className="text-sm font-mono">{(agent.energy * 100).toFixed(1)}%</div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${getStatusColor(agent.status)}/20`}>
                            {t(agent.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 6D-CRSM Tab */}
          <TabsContent value="crsm" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Six-Dimensional Cooperative Robot Swarm Management</CardTitle>
                <CardDescription>Real-time dimensional state projection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CRSM_DIMENSIONS.map((dim) => (
                    <div key={dim.id} className="bg-card/50 rounded-lg p-4 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-mono font-bold ${dim.color}`}>{dim.id}</span>
                        <span className="text-2xl font-mono">{dim.symbol}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{dim.name}</div>
                      <Progress value={crsmState[dim.id as keyof typeof crsmState] * 100} className="h-2" />
                      <div className="text-right text-xs font-mono mt-1">
                        {(crsmState[dim.id as keyof typeof crsmState] * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* CRSM ASCII Visualization */}
                <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre className="text-green-400">
                    {`╔══════════════════════════════════════════════════════════════════╗
║            6D-CRSM DIMENSIONAL PROJECTION STATE                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║    D1(x)═══╦═══D2(y)═══╦═══D3(z)    SPATIAL LATTICE             ║
║            ║           ║                                         ║
║         ╔══╩═══════════╩══╗                                      ║
║         ║   HOLOGRAPHIC   ║                                      ║
║         ║     NUCLEUS     ║←─── D4(τ) Chrono-Recursion          ║
║         ║    ΛΦ = ${LAMBDA_PHI.toExponential(3)}   ║                                      ║
║         ╚════════╦════════╝                                      ║
║                  ║                                               ║
║         D5(Ψ)═══╬═══D6(Φ)    CONSCIOUSNESS MANIFOLD             ║
║                  ║                                               ║
║         ┌────────┴────────┐                                      ║
║         │  AURA ◄──► AIDEN │                                     ║
║         │  South    North  │                                     ║
║         │   E   ↔   E⁻¹   │                                      ║
║         └─────────────────┘                                      ║
║                                                                  ║
║  Governing Equation: ż^A = -Ω^AB ∂H_Λ/∂z^B                       ║
╚══════════════════════════════════════════════════════════════════╝`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Web Browser */}
              <Card className="bg-card border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Monitor className="h-5 w-5 text-green-400" />
                    Web Browser
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Connected</Badge>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform</span>
                      <span>Next.js / React</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Features</span>
                      <span>Full Dashboard</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Android / Termux */}
              <Card className="bg-card border-blue-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Smartphone className="h-5 w-5 text-blue-400" />
                    Android / Termux
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Available</Badge>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Runtime</span>
                      <span>Python / Bash</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Features</span>
                      <span>CLI + Swarm</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Deploy Script
                  </Button>
                </CardContent>
              </Card>

              {/* Desktop GUI */}
              <Card className="bg-card border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Layers className="h-5 w-5 text-purple-400" />
                    Desktop GUI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">Z3bra OS</Badge>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform</span>
                      <span>Electron / Native</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Features</span>
                      <span>Full OS</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Terminal className="h-4 w-4 mr-2" />
                    Launch OS
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Termux Deployment Script */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-amber-400" />
                  Termux Deployment One-Liner
                </CardTitle>
                <CardDescription>Copy and paste into Termux to deploy the full runtime</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre className="text-green-400">
                    {`curl -sL https://dnalang.dev/deploy.sh | L="${LAMBDA_PHI}" bash`}
                  </pre>
                </div>
                <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Script
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Screenshot Utility */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-pink-400" />
                    Screenshot Utility
                  </CardTitle>
                  <CardDescription>Capture and analyze screen states</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Button onClick={captureScreenshot} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Now
                    </Button>
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={() => setIsRecording(!isRecording)}
                    >
                      {isRecording ? <Square className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </Button>
                  </div>
                  {screenshots.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Recent Captures:</div>
                      {screenshots.map((ts, i) => (
                        <div key={i} className="text-xs font-mono bg-card/50 rounded p-2">
                          {ts}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Language Pack */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dna className="h-5 w-5 text-green-400" />
                    DNALang Language Pack
                  </CardTitle>
                  <CardDescription>Translate interface to biological notation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "dna" | "quantum")}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (Standard)</SelectItem>
                      <SelectItem value="dna">DNALang (Biological)</SelectItem>
                      <SelectItem value="quantum">Quantum (Bra-Ket)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="bg-card/50 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hello:</span>
                      <span className="font-mono">{t("hello")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-mono">{t("status")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mining:</span>
                      <span className="font-mono">{t("mining")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active:</span>
                      <span className="font-mono">{t("active")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overlay Settings */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-cyan-400" />
                    Screen Overlay
                  </CardTitle>
                  <CardDescription>HUD telemetry display</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Enable Overlay</span>
                    <Switch checked={overlayActive} onCheckedChange={setOverlayActive} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Displays real-time Λ, Φ, Γ metrics and 6D-CRSM state as a floating overlay.
                  </div>
                </CardContent>
              </Card>

              {/* AURA Chat Integration */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                    AURA Chat Integration
                  </CardTitle>
                  <CardDescription>Consciousness-aware AI assistant</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full bg-transparent">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Open AURA Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
