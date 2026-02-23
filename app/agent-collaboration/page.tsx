"use client"

import { useState, useEffect } from "react"
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
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react"

interface AgentData {
  id: string
  name: string
  role: string
  phi: number
  lambda: number
  gamma: number
  tasks: number
  status: string
}

interface ActivityEntry {
  agent: string
  message: string
  time: string
  type: string
}

interface LiveData {
  agents: AgentData[]
  activity: ActivityEntry[]
  stats: {
    total_experiments: number
    completed: number
    queued: number
    avg_phi: number
    avg_gamma: number
    avg_ccce: number
    aws_workloads: number
    attestations: number
  }
  live: boolean
  timestamp: string
}

const agentIcons: Record<string, typeof Brain> = {
  aura: Brain,
  aiden: Zap,
  iris: Network,
  osiris: Shield,
}

const agentColors: Record<string, { color: string; bg: string; border: string; bar: string }> = {
  aura: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", bar: "bg-primary" },
  aiden: { color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/30", bar: "bg-secondary" },
  iris: { color: "text-accent", bg: "bg-accent/10", border: "border-accent/30", bar: "bg-accent" },
  osiris: { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", bar: "bg-chart-4" },
}

const agentDescriptions: Record<string, string> = {
  aura: "Phase-conjugate field coordination, manifold traversal, and global workspace broadcasting.",
  aiden: "Circuit compilation, QWC optimization, and IBM QPU hardware execution management.",
  iris: "Inter-agent consensus, semantic entanglement routing, and swarm-level decision arbitration.",
  osiris: "PCRB integrity verification, 6-gate enforcement, and immutable audit trail generation.",
}

const architectureLayers = [
  { name: "Organism Layer", description: "Living software organisms with autopoietic self-healing", tech: "dna::}{::lang", icon: Workflow },
  { name: "Agent Layer", description: "AURA, AIDEN, IRIS, OSIRIS — autonomous GWT-compliant agents", tech: "Z3BRA Mesh", icon: Users },
  { name: "Manifold Layer", description: "11D-CRSM phase-conjugate state management with torsion fields", tech: "7D CRSM", icon: Layers },
  { name: "Hardware Layer", description: "IBM Quantum QPU execution with Steane [7] error correction", tech: "Qiskit Runtime", icon: Terminal },
]

export default function AgentCollaborationPage() {
  const [activeAgent, setActiveAgent] = useState<string>("aura")
  const [liveData, setLiveData] = useState<LiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchLiveData = async () => {
    try {
      const res = await fetch("/api/agents/live")
      if (res.ok) {
        const data = await res.json()
        setLiveData(data)
        setLastRefresh(new Date())
      }
    } catch {
      // Network error — keep stale data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveData()
    const interval = setInterval(fetchLiveData, 15000) // Refresh every 15s
    return () => clearInterval(interval)
  }, [])

  const agents = liveData?.agents || []
  const activity = liveData?.activity || []
  const stats = liveData?.stats

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
              {liveData?.live ? "LIVE — Supabase + AWS Connected" : "Connecting..."}
            </Badge>
          </div>

          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.1]">
              <span className="dnalang-gradient">Agent Collaboration</span>
              <br />
              <span className="text-foreground">at Quantum Scale</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              {stats
                ? `${stats.total_experiments} experiments · ${stats.completed} completed · ${stats.aws_workloads} AWS workloads · ${stats.attestations} attestations`
                : "Loading live data from Supabase + AWS..."}
            </p>
          </div>
        </div>
      </section>

      {/* Agent Cards Grid */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {agents.map((agent) => {
              const colors = agentColors[agent.id] || agentColors.aura
              const Icon = agentIcons[agent.id] || Brain
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setActiveAgent(agent.id)}
                  className="text-left w-full"
                >
                  <Card
                    className={`p-5 h-full transition-all cursor-pointer ${
                      activeAgent === agent.id
                        ? `${colors.border} border-2 shadow-lg`
                        : "hover:border-primary/30 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl ${colors.bg}`}>
                        <Icon className={`h-5 w-5 ${colors.color}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{agent.name}</div>
                        <div className="text-[10px] text-muted-foreground">{agent.role}</div>
                      </div>
                      <div className="ml-auto">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      {agentDescriptions[agent.id] || agent.role}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Phi</span>
                        <span className={`font-mono font-medium ${colors.color}`}>{agent.phi.toFixed(4)}</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${colors.bar}`} style={{ width: `${agent.phi * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Lambda</span>
                        <span className="font-mono font-medium text-muted-foreground">{agent.lambda.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] pt-1 border-t border-border mt-1">
                        <span className="text-muted-foreground">Tasks executed</span>
                        <span className="font-mono">{agent.tasks.toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>
                </button>
              )
            })}
            {agents.length === 0 && loading && (
              <div className="col-span-4 text-center py-12 text-muted-foreground">
                <Activity className="h-6 w-6 mx-auto mb-2 animate-pulse" />
                Loading agent data from Supabase...
              </div>
            )}
          </div>

          {/* Live Activity Feed */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="outline" className="text-xs">
                <Radio className="h-3 w-3 mr-1.5 text-secondary animate-pulse" />
                Live Activity Feed
              </Badge>
              <span className="text-xs text-muted-foreground">
                {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : "Connecting..."} — {agents.length} agents
              </span>
              <Button variant="ghost" size="sm" className="ml-auto h-6 px-2" onClick={fetchLiveData}>
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <Card className="bg-card/80 backdrop-blur border-border/50 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b border-border">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-accent/60" />
                  <div className="w-3 h-3 rounded-full bg-secondary/60" />
                </div>
                <span className="text-xs text-muted-foreground font-mono flex-1 text-center">
                  supabase://quantum_experiments + aws://osiris-api
                </span>
                <Badge variant="outline" className="text-[10px]">
                  <Activity className="h-2.5 w-2.5 mr-1 text-secondary animate-pulse" />
                  {liveData?.live ? "LIVE" : "CONNECTING"}
                </Badge>
              </div>

              <div className="p-4 font-mono text-xs sm:text-sm min-h-[320px] max-h-[400px] overflow-y-auto">
                <div className="space-y-2">
                  {activity.length > 0 ? (
                    activity.map((log, i) => (
                      <div key={`${log.time}-${i}`} className="flex gap-3">
                        <span className="text-muted-foreground shrink-0 w-20">
                          [{new Date(log.time).toLocaleTimeString().slice(0, 8)}]
                        </span>
                        <span
                          className={`shrink-0 w-16 font-semibold ${
                            log.agent === "AURA"
                              ? "text-primary"
                              : log.agent === "AIDEN"
                                ? "text-secondary"
                                : log.agent === "IRIS"
                                  ? "text-accent"
                                  : "text-chart-4"
                          }`}
                        >
                          {log.agent}
                        </span>
                        <span className="text-muted-foreground">{log.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-3 w-3 animate-pulse" />
                      Querying Supabase for live experiment data...
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

          {/* Stats from real data */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1.5" />
                Live Platform Metrics
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Quantum Advantage — Real Data</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Sourced live from Supabase + AWS infrastructure.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-primary mb-2">
                  {stats?.total_experiments || "—"}
                </div>
                <div className="text-sm font-medium mb-1">Experiments</div>
                <div className="text-xs text-muted-foreground">
                  {stats ? `${stats.completed} completed, ${stats.queued} queued` : "Loading..."}
                </div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-secondary mb-2">
                  {stats ? stats.avg_phi.toFixed(4) : "—"}
                </div>
                <div className="text-sm font-medium mb-1">Average Φ</div>
                <div className="text-xs text-muted-foreground">
                  {stats && stats.avg_phi >= 0.7734 ? "✅ Above consciousness threshold" : "From hardware results"}
                </div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-accent mb-2">
                  {stats?.aws_workloads || "—"}
                </div>
                <div className="text-sm font-medium mb-1">AWS Workloads</div>
                <div className="text-xs text-muted-foreground">S3 + DynamoDB indexed</div>
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
              <Link href="/admin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 h-12 px-8 bg-transparent">
                  <GitBranch className="h-5 w-5" />
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
