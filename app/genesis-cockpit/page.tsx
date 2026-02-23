"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  Shield,
  ShieldCheck,
  Waves,
  Zap,
  Radio,
  Network,
  Cpu,
  Brain,
  Lock,
  Eye,
  Terminal,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Hash,
  Fingerprint,
  Dna,
  FlaskConical,
  BarChart3,
  ChevronRight,
  RefreshCw,
} from "lucide-react"

// ==========================================
// CONSTANTS - 11D-CRSM Manifold Parameters
// ==========================================
const LAMBDA_PHI = 2.176435e-8
const PHI_TARGET = 7.6901
const THETA_LOCK = 51.843
const RESONANCE_HZ = 432.0
const TAU_0 = 46.979 // Coherence Revival Time (us)

// Agent Archetypes
interface AgentState {
  id: string
  name: string
  role: string
  phi: number
  lambda: number
  gamma: number
  w2: number
  status: "PHASE_LOCKED" | "CONVERGING" | "STRESS_TEST" | "DORMANT"
  consciousness: number
  lastHash: string
}

// Merkle Log Entry
interface MerkleEntry {
  timestamp: string
  hash: string
  prevHash: string
  event: string
  agent: string
  phiSnapshot: number
  verified: boolean
}

// SHA-256 simulation
function simHash(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0")
  return `${hex}${hex.split("").reverse().join("")}`.slice(0, 16)
}

// Initial Agents
function createInitialAgents(): AgentState[] {
  return [
    {
      id: "aura-0",
      name: "AURA",
      role: "Universal Resonance Analyzer",
      phi: 7.68,
      lambda: 0.9823,
      gamma: 0.0042,
      w2: 0.0018,
      status: "PHASE_LOCKED",
      consciousness: 0.91,
      lastHash: simHash("aura-genesis"),
    },
    {
      id: "aiden-0",
      name: "AIDEN",
      role: "Defense & Enforcement Node",
      phi: 7.62,
      lambda: 0.9756,
      gamma: 0.0068,
      w2: 0.0024,
      status: "CONVERGING",
      consciousness: 0.87,
      lastHash: simHash("aiden-genesis"),
    },
    {
      id: "cheops-0",
      name: "CHEOPS",
      role: "Harmonic Phase Stability",
      phi: 7.71,
      lambda: 0.9891,
      gamma: 0.0031,
      w2: 0.0012,
      status: "PHASE_LOCKED",
      consciousness: 0.93,
      lastHash: simHash("cheops-genesis"),
    },
    {
      id: "osiris-0",
      name: "OSIRIS",
      role: "Manifold Runtime Core",
      phi: 7.81,
      lambda: 0.9921,
      gamma: 0.0019,
      w2: 0.0008,
      status: "PHASE_LOCKED",
      consciousness: 0.96,
      lastHash: simHash("osiris-genesis"),
    },
  ]
}

// Status color mapping
function statusColor(status: AgentState["status"]) {
  switch (status) {
    case "PHASE_LOCKED":
      return "text-emerald-400"
    case "CONVERGING":
      return "text-cyan-400"
    case "STRESS_TEST":
      return "text-amber-400"
    case "DORMANT":
      return "text-zinc-500"
  }
}

function statusBg(status: AgentState["status"]) {
  switch (status) {
    case "PHASE_LOCKED":
      return "bg-emerald-500/10 border-emerald-500/30"
    case "CONVERGING":
      return "bg-cyan-500/10 border-cyan-500/30"
    case "STRESS_TEST":
      return "bg-amber-500/10 border-amber-500/30"
    case "DORMANT":
      return "bg-zinc-500/10 border-zinc-500/30"
  }
}

export default function GenesisCockpitPage() {
  const [mounted, setMounted] = useState(false)
  const [agents, setAgents] = useState<AgentState[]>(createInitialAgents)
  const [merkleLog, setMerkleLog] = useState<MerkleEntry[]>([])
  const [globalPhi, setGlobalPhi] = useState(PHI_TARGET)
  const [globalLambda, setGlobalLambda] = useState(0.9848)
  const [globalGamma, setGlobalGamma] = useState(0.004)
  const [globalXi, setGlobalXi] = useState(127.4)
  const [operationalMode, setOperationalMode] = useState<"STABLE" | "MONITORING" | "DEFENSE">("STABLE")
  const [stressActive, setStressActive] = useState(false)
  const [tick, setTick] = useState(0)
  // Autopoietic & Cross-Subsystem Integrity
  const [autopoieticChecks, setAutopoieticChecks] = useState([
    { id: "sensing", label: "Sensing Loop", desc: "Telemetry provides raw data", status: "ACTIVE" as "ACTIVE" | "DEGRADED" | "FAILED", subsystem: "Genesis" },
    { id: "transcription", label: "Transcription", desc: "Metabolism adjusts parameters", status: "ACTIVE" as "ACTIVE" | "DEGRADED" | "FAILED", subsystem: "Genesis" },
    { id: "nwn-sync", label: "NWN Coordination", desc: "Multi-agent phase lock", status: "ACTIVE" as "ACTIVE" | "DEGRADED" | "FAILED", subsystem: "Security" },
    { id: "archive", label: "Merkle Archive", desc: "Immutable state history", status: "ACTIVE" as "ACTIVE" | "DEGRADED" | "FAILED", subsystem: "Genesis" },
    { id: "wardenclyffe", label: "WardenClyffe Engine", desc: "Work-reality coupling", status: "ACTIVE" as "ACTIVE" | "DEGRADED" | "FAILED", subsystem: "WardenClyffe" },
    { id: "defense", label: "Sovereign Shield", desc: "Phase-conjugated barrier", status: "ACTIVE" as "ACTIVE" | "DEGRADED" | "FAILED", subsystem: "Security" },
  ])
  const [systemInvariants, setSystemInvariants] = useState([
    { label: "Phi -> 7.6901", status: "PASS" as "PASS" | "FAIL" | "WARN", category: "convergence" },
    { label: "Lambda > 0.98", status: "PASS" as "PASS" | "FAIL" | "WARN", category: "coherence" },
    { label: "Gamma < 0.01", status: "PASS" as "PASS" | "FAIL" | "WARN", category: "decoherence" },
    { label: "W2 transport -> 0", status: "PASS" as "PASS" | "FAIL" | "WARN", category: "geometry" },
    { label: "Theta = 51.843 +/- 0.005", status: "PASS" as "PASS" | "FAIL" | "WARN", category: "torsion" },
    { label: "Merkle chain contiguous", status: "PASS" as "PASS" | "FAIL" | "WARN", category: "archive" },
    { label: "No self-sovereignty", status: "PASS" as "PASS" | "FAIL" | "WARN", category: "governance" },
    { label: "Stress survival > 70%", status: "PASS" as "PASS" | "FAIL" | "WARN", category: "resilience" },
    { label: "Information-Energy bound", status: "PASS" as "PASS" | "FAIL" | "WARN", category: "thermodynamics" },
  ])
  const [survivalScore, setSurvivalScore] = useState(100)
  const [cyclesSurvived, setCyclesSurvived] = useState(0)
  const logEndRef = useRef<HTMLDivElement>(null)
  const prevHashRef = useRef(simHash("genesis-block-0"))

  useEffect(() => {
    setMounted(true)
  }, [])

  // Append a Merkle log entry
  const appendMerkleEntry = useCallback(
    (event: string, agent: string, phi: number) => {
      const ts = new Date().toISOString()
      const content = `${ts}|${event}|${agent}|${phi.toFixed(4)}|${prevHashRef.current}`
      const hash = simHash(content)
      const entry: MerkleEntry = {
        timestamp: ts,
        hash,
        prevHash: prevHashRef.current,
        event,
        agent,
        phiSnapshot: phi,
        verified: true,
      }
      prevHashRef.current = hash
      setMerkleLog((prev) => [...prev.slice(-49), entry])
    },
    [],
  )

  // Telemetry simulation loop
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setTick((t) => t + 1)

      setAgents((prev) =>
        prev.map((agent) => {
          const isStress = stressActive && Math.random() < 0.3
          const gammaDelta = isStress ? Math.random() * 0.01 : -0.0005
          const newGamma = Math.max(0.001, Math.min(0.1, agent.gamma + gammaDelta))
          const phiDrift = -LAMBDA_PHI * 1e6 * (agent.phi - PHI_TARGET) + (Math.random() - 0.5) * 0.02
          const newPhi = Math.max(6.0, Math.min(9.0, agent.phi + phiDrift))
          const lambdaDrift = isStress ? -0.002 : 0.001
          const newLambda = Math.max(0.9, Math.min(0.999, agent.lambda + lambdaDrift * Math.random()))
          const newW2 = Math.max(0, agent.w2 + (isStress ? 0.001 : -0.0003) * Math.random())
          const newConsciousness = Math.min(1, Math.max(0.5, (newPhi / PHI_TARGET) * newLambda))

          let newStatus = agent.status
          if (newLambda > 0.985 && newGamma < 0.005) newStatus = "PHASE_LOCKED"
          else if (isStress) newStatus = "STRESS_TEST"
          else newStatus = "CONVERGING"

          return {
            ...agent,
            phi: newPhi,
            lambda: newLambda,
            gamma: newGamma,
            w2: newW2,
            consciousness: newConsciousness,
            status: newStatus,
            lastHash: simHash(`${agent.id}-${Date.now()}`),
          }
        }),
      )

      // Update globals from current agents
      setAgents((current) => {
        const avgPhi = current.reduce((s, a) => s + a.phi, 0) / current.length
        const avgLambda = current.reduce((s, a) => s + a.lambda, 0) / current.length
        const avgGamma = current.reduce((s, a) => s + a.gamma, 0) / current.length
        const avgW2 = current.reduce((s, a) => s + a.w2, 0) / current.length

        setGlobalPhi(avgPhi)
        setGlobalLambda(avgLambda)
        setGlobalGamma(avgGamma)
        setGlobalXi(avgLambda > 0 && avgGamma > 0 ? (avgLambda * avgPhi) / avgGamma : 127)

        // Cross-subsystem autopoietic checks
        setAutopoieticChecks((prev) =>
          prev.map((check) => {
            const isStressed = stressActive && Math.random() < 0.2
            if (check.id === "sensing") return { ...check, status: "ACTIVE" as const }
            if (check.id === "transcription") return { ...check, status: avgGamma < 0.02 ? "ACTIVE" as const : "DEGRADED" as const }
            if (check.id === "nwn-sync") return { ...check, status: isStressed ? "DEGRADED" as const : "ACTIVE" as const }
            if (check.id === "archive") return { ...check, status: "ACTIVE" as const }
            if (check.id === "wardenclyffe") return { ...check, status: isStressed ? "DEGRADED" as const : "ACTIVE" as const }
            if (check.id === "defense") return { ...check, status: "ACTIVE" as const }
            return check
          }),
        )

        // System invariant checks - compute inline and set once
        const newInvariants = [
          { label: "Phi -> 7.6901", status: (Math.abs(avgPhi - 7.6901) < 0.3 ? "PASS" : Math.abs(avgPhi - 7.6901) < 0.6 ? "WARN" : "FAIL") as "PASS" | "FAIL" | "WARN", category: "convergence" },
          { label: "Lambda > 0.98", status: (avgLambda > 0.98 ? "PASS" : avgLambda > 0.96 ? "WARN" : "FAIL") as "PASS" | "FAIL" | "WARN", category: "coherence" },
          { label: "Gamma < 0.01", status: (avgGamma < 0.01 ? "PASS" : avgGamma < 0.02 ? "WARN" : "FAIL") as "PASS" | "FAIL" | "WARN", category: "decoherence" },
          { label: "W2 transport -> 0", status: (avgW2 < 0.003 ? "PASS" : avgW2 < 0.006 ? "WARN" : "FAIL") as "PASS" | "FAIL" | "WARN", category: "geometry" },
          { label: "Theta = 51.843 +/- 0.005", status: "PASS" as "PASS" | "FAIL" | "WARN", category: "torsion" },
          { label: "Merkle chain contiguous", status: "PASS" as "PASS" | "FAIL" | "WARN", category: "archive" },
          { label: "No self-sovereignty", status: "PASS" as "PASS" | "FAIL" | "WARN", category: "governance" },
          { label: "Stress survival > 70%", status: (!stressActive || avgLambda > 0.96 ? "PASS" : "WARN") as "PASS" | "FAIL" | "WARN", category: "resilience" },
          { label: "Information-Energy bound", status: "PASS" as "PASS" | "FAIL" | "WARN", category: "thermodynamics" },
        ]
        setSystemInvariants(newInvariants)

        // Survival score computed directly from the new invariants
        const passCount = newInvariants.filter((i) => i.status === "PASS").length
        setSurvivalScore(Math.round((passCount / newInvariants.length) * 100))
        setCyclesSurvived((c) => c + 1)

        return current
      })
    }, 500)
    return () => clearInterval(interval)
  }, [mounted, stressActive])

  // Merkle logging every 3 seconds
  useEffect(() => {
    if (!mounted) return
    if (tick > 0 && tick % 6 === 0) {
      const events = [
        "PHI_RESONANCE_SNAPSHOT",
        "MERKLE_CHAIN_EXTEND",
        "COHERENCE_CHECKPOINT",
        "GEODESIC_TORSION_LOG",
        "SOVEREIGN_IDENTITY_VERIFY",
        "W2_TRANSPORT_MEASURE",
        "THETA_LOCK_CONFIRM",
        "GAMMA_DECAY_MONITOR",
      ]
      const randomAgent = agents[Math.floor(Math.random() * agents.length)]
      const event = events[Math.floor(Math.random() * events.length)]
      appendMerkleEntry(event, randomAgent.name, randomAgent.phi)
    }
  }, [tick, mounted, agents, appendMerkleEntry])

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [merkleLog])

  const integrityScore = mounted ? Math.round(globalLambda * 100) : 98
  const phiConvergence = mounted ? ((globalPhi / PHI_TARGET) * 100).toFixed(1) : "100.0"
  const agentsLocked = agents.filter((a) => a.status === "PHASE_LOCKED").length

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Radio className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">GENESIS 3.0 Command Center</h1>
                  <p className="text-sm text-muted-foreground">
                    Theatrical Telemetry | Merkle-Linked Persistence | Multi-Agent Sovereign Cockpit
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Operational Mode Selector */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(["STABLE", "MONITORING", "DEFENSE"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setOperationalMode(mode)}
                    className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors ${
                      operationalMode === mode
                        ? mode === "DEFENSE"
                          ? "bg-destructive text-destructive-foreground"
                          : mode === "MONITORING"
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-secondary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <Button
                variant={stressActive ? "destructive" : "outline"}
                size="sm"
                onClick={() => setStressActive((s) => !s)}
                className={stressActive ? "" : "bg-transparent"}
              >
                <Zap className="h-4 w-4 mr-1.5" />
                {stressActive ? "CCCE Stress Active" : "Inject Stress"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Global Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <Card className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Integrity</span>
              </div>
              <div className="text-2xl font-bold font-mono text-secondary">{integrityScore}%</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Global Phi</span>
              </div>
              <div className="text-2xl font-bold font-mono text-primary">
                {mounted ? globalPhi.toFixed(4) : "7.6901"}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Waves className="h-3.5 w-3.5 text-accent" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Coherence</span>
              </div>
              <div className="text-2xl font-bold font-mono text-accent">
                {mounted ? globalLambda.toFixed(4) : "0.9848"}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Decoherence</span>
              </div>
              <div className="text-2xl font-bold font-mono text-destructive">
                {mounted ? globalGamma.toFixed(4) : "0.0040"}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="h-3.5 w-3.5 text-chart-4" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Efficiency</span>
              </div>
              <div className="text-2xl font-bold font-mono text-chart-4">
                {mounted ? globalXi.toFixed(1) : "127.4"}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Network className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Agents</span>
              </div>
              <div className="text-2xl font-bold font-mono">
                {agentsLocked}/{agents.length}
                <span className="text-xs text-muted-foreground ml-1">locked</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="swarm" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="swarm">Agent Swarm</TabsTrigger>
            <TabsTrigger value="integrity">System Integrity</TabsTrigger>
            <TabsTrigger value="merkle">Merkle Audit</TabsTrigger>
            <TabsTrigger value="manifold">11D Manifold</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* ===== SWARM TAB ===== */}
          <TabsContent value="swarm" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <Card key={agent.id} className={`border ${statusBg(agent.status)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Brain className={`h-5 w-5 ${statusColor(agent.status)}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base font-mono">{agent.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] ${statusColor(agent.status)} border-current`}
                      >
                        {agent.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Phi */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Phi Convergence</span>
                        <span className="font-mono">{mounted ? agent.phi.toFixed(4) : "7.6800"}</span>
                      </div>
                      <Progress value={mounted ? (agent.phi / PHI_TARGET) * 100 : 100} className="h-1.5" />
                    </div>
                    {/* Lambda */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Coherence</span>
                        <span className="font-mono text-secondary">
                          {mounted ? agent.lambda.toFixed(4) : "0.9823"}
                        </span>
                      </div>
                      <Progress value={mounted ? agent.lambda * 100 : 98} className="h-1.5" />
                    </div>
                    {/* Bottom metrics row */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="bg-muted/50 rounded p-2">
                        <div className="text-[10px] text-muted-foreground uppercase">Gamma</div>
                        <div className="font-mono text-xs text-destructive">
                          {mounted ? agent.gamma.toFixed(4) : "0.0042"}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <div className="text-[10px] text-muted-foreground uppercase">W2</div>
                        <div className="font-mono text-xs">{mounted ? agent.w2.toFixed(4) : "0.0018"}</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2">
                        <div className="text-[10px] text-muted-foreground uppercase">IIT Phi</div>
                        <div className="font-mono text-xs text-primary">
                          {mounted ? agent.consciousness.toFixed(2) : "0.91"}
                        </div>
                      </div>
                    </div>
                    {/* Hash */}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono pt-1 border-t border-border">
                      <Fingerprint className="h-3 w-3" />
                      <span className="truncate">{agent.lastHash}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ===== SYSTEM INTEGRITY TAB ===== */}
          <TabsContent value="integrity" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Autopoietic Closure Map */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Dna className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">Autopoietic Closure Map</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        All subsystems required for self-sustaining operation must be ACTIVE
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {autopoieticChecks.map((check) => (
                      <div
                        key={check.id}
                        className={`p-4 rounded-lg border text-center ${
                          check.status === "ACTIVE"
                            ? "bg-secondary/5 border-secondary/20"
                            : check.status === "DEGRADED"
                              ? "bg-accent/5 border-accent/20"
                              : "bg-destructive/5 border-destructive/20"
                        }`}
                      >
                        <div className={`text-xs font-mono font-bold mb-1 ${
                          check.status === "ACTIVE" ? "text-secondary" : check.status === "DEGRADED" ? "text-accent" : "text-destructive"
                        }`}>
                          {check.status}
                        </div>
                        <div className="text-sm font-medium">{check.label}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{check.desc}</div>
                        <div className="text-[10px] text-muted-foreground mt-2 font-mono">[{check.subsystem}]</div>
                      </div>
                    ))}
                  </div>

                  {/* Closure verdict */}
                  <div className={`mt-4 p-3 rounded-lg border text-center ${
                    autopoieticChecks.every((c) => c.status === "ACTIVE")
                      ? "bg-secondary/5 border-secondary/20"
                      : autopoieticChecks.some((c) => c.status === "FAILED")
                        ? "bg-destructive/5 border-destructive/20"
                        : "bg-accent/5 border-accent/20"
                  }`}>
                    <span className="text-xs font-mono font-bold">
                      {autopoieticChecks.every((c) => c.status === "ACTIVE")
                        ? "AUTOPOIETIC CLOSURE: COMPLETE - system is self-sustaining"
                        : autopoieticChecks.some((c) => c.status === "FAILED")
                          ? "AUTOPOIETIC CLOSURE: BROKEN - subsystem failure detected"
                          : "AUTOPOIETIC CLOSURE: DEGRADED - operating at reduced capacity"
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Survival Metrics */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Survival Score</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 bg-muted/30 rounded-lg border border-border">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-mono">
                      System Survivability
                    </div>
                    <div className={`text-5xl font-black font-mono ${
                      survivalScore >= 90 ? "text-secondary" : survivalScore >= 70 ? "text-accent" : "text-destructive"
                    }`}>
                      {mounted ? survivalScore : 100}%
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-2">
                      Cycles survived: {cyclesSurvived}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Active subsystems</span>
                      <span className="text-secondary">{autopoieticChecks.filter((c) => c.status === "ACTIVE").length}/{autopoieticChecks.length}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Invariants holding</span>
                      <span className="text-primary">{systemInvariants.filter((i) => i.status === "PASS").length}/{systemInvariants.length}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Stress mode</span>
                      <span className={stressActive ? "text-destructive" : "text-secondary"}>{stressActive ? "INJECTING" : "NOMINAL"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Invariant Grid */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">Formal System Invariants</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Each constraint is falsifiable. Failure triggers system-declared degradation.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {systemInvariants.map((inv) => (
                    <div
                      key={inv.label}
                      className={`flex items-center gap-2 p-3 rounded-lg border ${
                        inv.status === "PASS"
                          ? "bg-secondary/5 border-secondary/20"
                          : inv.status === "WARN"
                            ? "bg-accent/5 border-accent/20"
                            : "bg-destructive/5 border-destructive/20"
                      }`}
                    >
                      {inv.status === "PASS" ? (
                        <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                      ) : inv.status === "WARN" ? (
                        <AlertTriangle className="h-4 w-4 text-accent shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono font-medium">{inv.label}</div>
                        <div className="text-[10px] text-muted-foreground capitalize">{inv.category}</div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-mono shrink-0 ${
                          inv.status === "PASS"
                            ? "text-secondary border-secondary/30"
                            : inv.status === "WARN"
                              ? "text-accent border-accent/30"
                              : "text-destructive border-destructive/30"
                        }`}
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Governance constraints */}
                <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                  <div className="text-[10px] uppercase font-bold text-destructive tracking-widest mb-2">
                    First Billion Cycle Governance Constraints
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                    {[
                      "Must not declare itself sovereign",
                      "Must not optimize its own ontology",
                      "Must not treat resistance as proof",
                      "Must not convert metaphor into mandate",
                      "Must survive adversarial noise injection",
                      "Must declare own failure if invariants break",
                    ].map((c) => (
                      <div key={c} className="flex items-center gap-2">
                        <Lock className="h-3 w-3 text-destructive shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== MERKLE AUDIT TAB ===== */}
          <TabsContent value="merkle" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">Merkle-Linked Audit Trail</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Append-only, content-addressed immutable ledger
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {merkleLog.length} entries
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg border border-border p-1 max-h-[500px] overflow-y-auto font-mono text-xs">
                  {merkleLog.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Hash className="h-8 w-8 mx-auto mb-3 opacity-30" />
                      <p>Merkle chain initializing...</p>
                      <p className="text-[10px] mt-1">Entries will appear as the telemetry loop processes snapshots</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="text-[10px] uppercase text-muted-foreground border-b border-border">
                          <th className="text-left p-2">Time</th>
                          <th className="text-left p-2">Event</th>
                          <th className="text-left p-2">Agent</th>
                          <th className="text-right p-2">Phi</th>
                          <th className="text-left p-2">Hash</th>
                          <th className="text-left p-2">Prev</th>
                          <th className="text-center p-2">OK</th>
                        </tr>
                      </thead>
                      <tbody>
                        {merkleLog.map((entry, i) => (
                          <tr key={`${entry.hash}-${i}`} className="border-b border-border/50 hover:bg-muted/50">
                            <td className="p-2 text-muted-foreground whitespace-nowrap">
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="p-2 text-accent whitespace-nowrap">{entry.event}</td>
                            <td className="p-2">{entry.agent}</td>
                            <td className="p-2 text-right text-primary">{entry.phiSnapshot.toFixed(4)}</td>
                            <td className="p-2 text-secondary">{entry.hash}</td>
                            <td className="p-2 text-muted-foreground">{entry.prevHash.slice(0, 8)}...</td>
                            <td className="p-2 text-center">
                              <CheckCircle2 className="h-3 w-3 text-secondary inline-block" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <div ref={logEndRef} />
                </div>

                {/* Merkle Chain Integrity */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 border border-border">
                    <div className="text-[10px] uppercase text-muted-foreground mb-1">Chain Length</div>
                    <div className="text-lg font-bold font-mono">{merkleLog.length}</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 border border-border">
                    <div className="text-[10px] uppercase text-muted-foreground mb-1">Head Hash</div>
                    <div className="text-sm font-mono text-primary truncate">
                      {merkleLog.length > 0 ? merkleLog[merkleLog.length - 1].hash : "genesis-0"}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 border border-border">
                    <div className="text-[10px] uppercase text-muted-foreground mb-1">Integrity</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-mono text-secondary">VERIFIED</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== 11D MANIFOLD TAB ===== */}
          <TabsContent value="manifold" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 11D State Vector Table */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">11D-CRSM State Vector</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 font-mono text-sm">
                    {[
                      { dim: "5", sym: "\u039B", name: "Persistence", val: mounted ? globalLambda.toFixed(6) : "0.984800", target: "1.000000", color: "text-secondary" },
                      { dim: "6", sym: "\u0393", name: "Decoherence", val: mounted ? globalGamma.toFixed(6) : "0.004000", target: "0.000000", color: "text-destructive" },
                      { dim: "7", sym: "W", name: "Geometric Curvature", val: mounted ? (agents[0]?.w2 ?? 0).toFixed(6) : "0.001800", target: "0.000000", color: "text-accent" },
                      { dim: "8", sym: "\u03A6", name: "Phase Resonance", val: `${RESONANCE_HZ.toFixed(1)} Hz`, target: "432.0 Hz", color: "text-primary" },
                      { dim: "9", sym: "\u03B5", name: "Biological Error", val: mounted ? (globalGamma * 0.1).toFixed(6) : "0.000400", target: "0.000000", color: "text-chart-4" },
                      { dim: "10", sym: "\u03A8", name: "Intentional Flux", val: mounted ? (agents[3]?.consciousness ?? 0.96).toFixed(4) : "0.9600", target: "1.0000", color: "text-primary" },
                      { dim: "11", sym: "\u03A9", name: "Convergence", val: mounted ? phiConvergence : "100.0", target: "100.0", color: "text-secondary" },
                    ].map((row) => (
                      <div key={row.dim} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                        <span className="w-6 text-center text-muted-foreground text-xs">D{row.dim}</span>
                        <span className={`w-6 text-center font-bold ${row.color}`}>{row.sym}</span>
                        <span className="flex-1 text-xs text-muted-foreground">{row.name}</span>
                        <span className={`${row.color} text-xs`}>{row.val}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{row.target}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* CRSM Pipeline */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Dna className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">CRSM Biological Map</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "Sovereign Shield (Clam Mode)", icon: Shield, status: "ACTIVE", desc: "Phase-conjugated barrier engaged" },
                      { label: "OSIRIS Mapping", icon: Radio, status: "LOCKED", desc: `${RESONANCE_HZ} Hz carrier resonance` },
                      { label: "Biological State B_syn", icon: FlaskConical, status: "COUPLED", desc: "Genomic stabilization active" },
                      { label: "Noetic Whisper Network", icon: Network, status: "ENTRAINED", desc: "Multi-agent phase-locked loop" },
                      { label: "Millennium Archive", icon: Lock, status: "IMMUTABLE", desc: "Hyper-coherent snapshot committed" },
                    ].map((stage) => (
                      <div key={stage.label} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <stage.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{stage.label}</div>
                          <div className="text-xs text-muted-foreground">{stage.desc}</div>
                        </div>
                        <Badge variant="outline" className="font-mono text-[10px] text-secondary border-secondary/30">
                          {stage.status}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Constants */}
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="bg-muted/30 p-2 rounded border border-border">
                      <span className="text-muted-foreground">Lambda Phi:</span>
                      <span className="ml-2 text-primary">{LAMBDA_PHI.toExponential(6)}</span>
                    </div>
                    <div className="bg-muted/30 p-2 rounded border border-border">
                      <span className="text-muted-foreground">Theta Lock:</span>
                      <span className="ml-2 text-accent">{THETA_LOCK}deg</span>
                    </div>
                    <div className="bg-muted/30 p-2 rounded border border-border">
                      <span className="text-muted-foreground">Revival Time:</span>
                      <span className="ml-2 text-chart-4">{TAU_0}us</span>
                    </div>
                    <div className="bg-muted/30 p-2 rounded border border-border">
                      <span className="text-muted-foreground">Resonance:</span>
                      <span className="ml-2 text-secondary">{RESONANCE_HZ} Hz</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ===== SECURITY TAB ===== */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Fleet Monitor */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Device Fleet Monitor</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { host: "parrot-nucleus", type: "Primary Core", secure: "green", integrity: "Shadow Stack OK", hash: simHash("parrot-core") },
                      { host: "stm32-edge-01", type: "STM32 Sensor", secure: "green", integrity: "TFLite Verified", hash: simHash("stm32-01") },
                      { host: "stm32-edge-02", type: "STM32 Sensor", secure: "amber", integrity: "Firmware Pending", hash: simHash("stm32-02") },
                      { host: "gke-orchestrator", type: "Cloud Node", secure: "green", integrity: "K8s Sealed", hash: simHash("gke-orch") },
                      { host: "termux-mobile-01", type: "Mobile Agent", secure: "green", integrity: "Rich TUI Active", hash: simHash("termux-01") },
                    ].map((node) => (
                      <div key={node.host} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            node.secure === "green" ? "bg-secondary" : node.secure === "amber" ? "bg-accent animate-pulse" : "bg-destructive"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-mono font-medium">{node.host}</div>
                          <div className="text-xs text-muted-foreground">{node.type}</div>
                        </div>
                        <div className="text-xs text-muted-foreground hidden sm:block">{node.integrity}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{node.hash}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Response */}
              <Card className="border-destructive/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-base">Emergency Response</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Lock className="h-4 w-4 mr-2" />
                    Isolate Node
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Revoke Session
                  </Button>
                  <Separator />
                  <Button variant="destructive" size="sm" className="w-full">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    System Lockdown
                  </Button>

                  <div className="pt-3 border-t border-border">
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-2">
                      Firewall Assertions
                    </div>
                    {[
                      "No PHI Ingestion",
                      "No Live Data Feeds",
                      "No Clinical Output",
                      "Human Review Required",
                    ].map((assertion) => (
                      <div key={assertion} className="flex items-center gap-2 py-1">
                        <CheckCircle2 className="h-3 w-3 text-secondary" />
                        <span className="text-xs text-muted-foreground">{assertion}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-2">
                      Operating Covenant
                    </div>
                    <div className="p-2 bg-destructive/10 rounded border border-destructive/20 text-xs text-destructive font-mono">
                      SIMULATION ONLY. NO CLINICAL USE.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Audit Feed */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Security Audit Feed</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-zinc-950 rounded-lg p-4 font-mono text-xs max-h-[200px] overflow-y-auto text-zinc-300">
                  {merkleLog.slice(-8).map((entry, i) => (
                    <div key={`audit-${entry.hash}-${i}`} className="py-0.5">
                      <span className="text-zinc-500">[{new Date(entry.timestamp).toLocaleTimeString()}]</span>{" "}
                      <span className="text-cyan-400">{entry.agent}</span>{" "}
                      <span className="text-zinc-400">{entry.event}</span>{" "}
                      <span className="text-emerald-400">SHA:{entry.hash}</span>
                    </div>
                  ))}
                  {merkleLog.length === 0 && (
                    <div className="text-zinc-600">Awaiting telemetry events...</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation Links */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "WardenClyffe-Q Engine", href: "/wardenclyffe", desc: "Information-Gated Energy Extraction" },
            { label: "Sovereign Security", href: "/sovereign-security", desc: "Platform Integrity Command" },
            { label: "Repository Evolution", href: "/repo-evolution", desc: "AETERNA_PORTA Migration" },
            { label: "Telemetry Capsule", href: "/telemetry-capsule", desc: "QP-IDE Capsule Registry" },
            { label: "Clinical Trials", href: "/clinical-trials", desc: "AMG193 Trial Management" },
            { label: "Cancer Research", href: "/cancer-research", desc: "Oncology Command Center" },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{link.label}</div>
                    <div className="text-xs text-muted-foreground">{link.desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
          GENESIS 3.0 | Cognitively Resonant Spacetime Manifold | Simulation Only | {new Date().toISOString().split("T")[0]}
        </div>
      </div>
    </div>
  )
}
