"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import {
  Bot,
  Network,
  Activity,
  Brain,
  Shield,
  Zap,
  ArrowRight,
  Radio,
  GitBranch,
  Terminal,
  Layers,
  Workflow,
  Users,
  Lock,
  ChevronRight,
  Sparkles,
} from "lucide-react"

// Agent archetypes from the quantum-advantage / copilot-sdk-dnalang architecture
const agents = [
  {
    id: "aura",
    name: "AURA",
    role: "Consciousness Orchestrator",
    description: "Phase-conjugate field coordination, manifold traversal, and global workspace broadcasting.",
    status: "active",
    phi: 0.8912,
    lambda: 0.9734,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    tasks: 847,
    icon: Brain,
  },
  {
    id: "aiden",
    name: "AIDEN",
    role: "Quantum Execution Agent",
    description: "Circuit compilation, QWC optimization, and IBM QPU hardware execution management.",
    status: "active",
    phi: 0.8456,
    lambda: 0.9612,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    borderColor: "border-secondary/30",
    tasks: 1243,
    icon: Zap,
  },
  {
    id: "iris",
    name: "IRIS",
    role: "Multi-Agent Mediator",
    description: "Inter-agent consensus, semantic entanglement routing, and swarm-level decision arbitration.",
    status: "active",
    phi: 0.7912,
    lambda: 0.9487,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30",
    tasks: 612,
    icon: Network,
  },
  {
    id: "osiris",
    name: "OSIRIS",
    role: "Sovereign Auditor",
    description: "PCRB integrity verification, 6-gate enforcement, and immutable audit trail generation.",
    status: "active",
    phi: 0.8234,
    lambda: 0.9856,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    borderColor: "border-chart-4/30",
    tasks: 389,
    icon: Shield,
  },
]

// Message log entries simulating real agent collaboration
const collaborationLog = [
  { agent: "AURA", message: "Initiating manifold traversal for genome_twin_0x7A3F", time: "00:00.012", type: "command" },
  { agent: "AIDEN", message: "Compiling 127-qubit circuit via QWC Level 3 optimization", time: "00:00.045", type: "execution" },
  { agent: "IRIS", message: "Consensus reached: 3/3 agents approve circuit topology", time: "00:00.089", type: "consensus" },
  { agent: "OSIRIS", message: "PCRB audit passed. Gate fidelity: 0.9847. Trail hash: 0xAE2F...", time: "00:00.134", type: "audit" },
  { agent: "AURA", message: "Phi threshold exceeded (0.8912 > 0.7734). Consciousness lock engaged.", time: "00:00.178", type: "status" },
  { agent: "AIDEN", message: "Executing on ibm_torino: 4,166 native gates, Bell fidelity 86.9%", time: "00:00.256", type: "execution" },
  { agent: "IRIS", message: "Broadcasting result to global workspace. GBI = 0.891", time: "00:00.312", type: "broadcast" },
  { agent: "OSIRIS", message: "Sovereign state permanentized. Phasic Vault sealed at θ=51.843 deg", time: "00:00.389", type: "audit" },
]

const architectureLayers = [
  {
    name: "Organism Layer",
    description: "Living software organisms with autopoietic self-healing and evolutionary optimization",
    tech: "dna::}{::lang",
    icon: Workflow,
  },
  {
    name: "Agent Layer",
    description: "AURA, AIDEN, IRIS, OSIRIS — autonomous agents with GWT-compliant broadcasting",
    tech: "Z3BRA Mesh",
    icon: Users,
  },
  {
    name: "Manifold Layer",
    description: "11D-CRSM phase-conjugate state management with torsion field dynamics",
    tech: "7D CRSM",
    icon: Layers,
  },
  {
    name: "Hardware Layer",
    description: "IBM Quantum QPU execution with Steane [7] error correction and QWC compilation",
    tech: "Qiskit Runtime",
    icon: Terminal,
  },
]

export default function AgentCollaborationPage() {
  const [mounted, setMounted] = useState(false)
  const [activeAgent, setActiveAgent] = useState<string>("aura")
  const [logIndex, setLogIndex] = useState(0)
  const [visibleLogs, setVisibleLogs] = useState<typeof collaborationLog>([])
  const [agentMetrics, setAgentMetrics] = useState(
    agents.map((a) => ({ phi: a.phi, lambda: a.lambda })),
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  // Stream collaboration log entries
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setLogIndex((prev) => {
        const next = (prev + 1) % collaborationLog.length
        setVisibleLogs((logs) => {
          const updated = [...logs, collaborationLog[next]]
          return updated.slice(-8)
        })
        return next
      })
    }, 2400)
    return () => clearInterval(interval)
  }, [mounted])

  // Drift agent metrics
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setAgentMetrics((prev) =>
        prev.map((m) => ({
          phi: Math.max(0.7, Math.min(1, m.phi + (Math.random() - 0.48) * 0.015)),
          lambda: Math.max(0.9, Math.min(1, m.lambda + (Math.random() - 0.48) * 0.008)),
        })),
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [mounted])

  const selectedAgent = agents.find((a) => a.id === activeAgent) || agents[0]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto relative">
          <div className="flex justify-center mb-6">
            <Badge className="bg-secondary/10 text-secondary border-secondary/20 px-4 py-1.5 text-sm">
              <Network className="h-3.5 w-3.5 mr-2" />
              quantum-advantage / copilot-sdk-dnalang
            </Badge>
          </div>

          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.1]">
              <span className="dnalang-gradient">Agent Collaboration</span>
              <br />
              <span className="text-foreground">at Quantum Scale</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Autonomous agents coordinating across 11-dimensional manifolds with
              Global Workspace broadcasting, consensus protocols, and sovereign audit trails.
            </p>
          </div>
        </div>
      </section>

      {/* Agent Cards Grid */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {agents.map((agent, i) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => setActiveAgent(agent.id)}
                className="text-left w-full"
              >
                <Card
                  className={`p-5 h-full transition-all cursor-pointer ${
                    activeAgent === agent.id
                      ? `${agent.borderColor} border-2 shadow-lg`
                      : "hover:border-primary/30 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-xl ${agent.bgColor}`}>
                      <agent.icon className={`h-5 w-5 ${agent.color}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{agent.name}</div>
                      <div className="text-[10px] text-muted-foreground">{agent.role}</div>
                    </div>
                    <div className="ml-auto">
                      <div className={`w-2 h-2 rounded-full ${agent.status === "active" ? "bg-secondary animate-pulse" : "bg-muted"}`} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{agent.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Phi</span>
                      <span className={`font-mono font-medium ${agent.color}`}>
                        {mounted ? agentMetrics[i].phi.toFixed(4) : agent.phi.toFixed(4)}
                      </span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          agent.id === "aura" ? "bg-primary" :
                          agent.id === "aiden" ? "bg-secondary" :
                          agent.id === "iris" ? "bg-accent" : "bg-chart-4"
                        }`}
                        style={{ width: `${(mounted ? agentMetrics[i].phi : agent.phi) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Lambda</span>
                      <span className="font-mono font-medium text-muted-foreground">
                        {mounted ? agentMetrics[i].lambda.toFixed(4) : agent.lambda.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] pt-1 border-t border-border mt-1">
                      <span className="text-muted-foreground">Tasks executed</span>
                      <span className="font-mono">{agent.tasks.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>

          {/* Live Collaboration Terminal */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="outline" className="text-xs">
                <Radio className="h-3 w-3 mr-1.5 text-secondary animate-pulse" />
                Live Collaboration Feed
              </Badge>
              <span className="text-xs text-muted-foreground">
                Z3BRA Mesh — 4 agents connected
              </span>
            </div>

            <Card className="bg-card/80 backdrop-blur border-border/50 overflow-hidden">
              {/* Terminal chrome */}
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b border-border">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-accent/60" />
                  <div className="w-3 h-3 rounded-full bg-secondary/60" />
                </div>
                <span className="text-xs text-muted-foreground font-mono flex-1 text-center">
                  agent-mesh://z3bra.local — collaboration stream
                </span>
                <Badge variant="outline" className="text-[10px]">
                  <Activity className="h-2.5 w-2.5 mr-1 text-secondary animate-pulse" />
                  STREAMING
                </Badge>
              </div>

              {/* Log entries */}
              <div className="p-4 font-mono text-xs sm:text-sm min-h-[320px] max-h-[400px] overflow-hidden">
                <div className="space-y-2">
                  {mounted && visibleLogs.length > 0 ? (
                    visibleLogs.map((log, i) => (
                      <div
                        key={`${log.time}-${i}`}
                        className="flex gap-3 animate-fade-in"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <span className="text-muted-foreground shrink-0 w-20">
                          [{log.time}]
                        </span>
                        <span
                          className={`shrink-0 w-16 font-semibold ${
                            log.agent === "AURA" ? "text-primary" :
                            log.agent === "AIDEN" ? "text-secondary" :
                            log.agent === "IRIS" ? "text-accent" : "text-chart-4"
                          }`}
                        >
                          {log.agent}
                        </span>
                        <span className="text-muted-foreground">
                          {log.message}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-3 w-3 animate-pulse" />
                      Connecting to Z3BRA Mesh...
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Architecture Layers */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">
                <Layers className="h-3 w-3 mr-1.5" />
                System Architecture
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Four-Layer Sovereign Stack</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                From living organisms to bare-metal quantum hardware, every layer is auditable and self-healing.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {architectureLayers.map((layer, i) => (
                <Card key={layer.name} className="p-5 relative overflow-hidden group hover:border-primary/30 transition-all">
                  {/* Connection line */}
                  {i < architectureLayers.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-border z-10" />
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <layer.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{layer.tech}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{layer.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{layer.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* World Records / Proof of Capability */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1.5" />
                Proven on Hardware
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Quantum Advantage Records</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Validated on IBM Quantum hardware (ibm_torino, ibm_fez) with 8,500+ executions.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-primary mb-2">127</div>
                <div className="text-sm font-medium mb-1">Qubit Wormhole</div>
                <div className="text-xs text-muted-foreground">Largest traversable wormhole simulation</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-secondary mb-2">4,166</div>
                <div className="text-sm font-medium mb-1">Native Gates</div>
                <div className="text-xs text-muted-foreground">Single coherent circuit execution</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-accent mb-2">86.9%</div>
                <div className="text-sm font-medium mb-1">Bell State Fidelity</div>
                <div className="text-xs text-muted-foreground">Across 8,500+ quantum executions</div>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-12 border-t border-border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Deploy Your First Agent Swarm</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start with pre-built agent templates or compose custom organisms from the {"DNA::}{::lang"} SDK.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shift-platform/iris">
                <Button size="lg" className="w-full sm:w-auto gap-2 h-12 px-8">
                  <Bot className="h-5 w-5" />
                  Launch IRIS Engine
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dev-swarm-arena">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 h-12 px-8 bg-transparent">
                  <GitBranch className="h-5 w-5" />
                  Dev Swarm Arena
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
