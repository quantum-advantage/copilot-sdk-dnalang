"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dna,
  FlaskConical,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Activity,
  ShieldCheck,
  Network,
  Lock,
  Radio,
  Hash,
  Clock,
  ChevronRight,
  AlertTriangle,
  Fingerprint,
  Eye,
  Brain,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react"

// ==========================================
// CONSTANTS
// ==========================================
const LAMBDA_PHI = 2.176435e-8
const PHI_TOTAL = 7.6901
const THETA_LOCK = 51.843

// Sovereign Repos (the fix for the .map() syntax error)
const SOVEREIGN_REPOS = [
  { name: "dnalang-core", badge: "Sovereign Kernel", phi: 7.81 },
  { name: "aiden-aura-mesh", badge: "Phase-Conjugated", phi: 7.62 },
  { name: "osiris-runtime", badge: "Autopoietic Stable", phi: 7.71 },
]

const LEGACY_REPOS = [
  { name: "consensus-quantum-protocol", badge: "v0.1.0-Alpha" },
  { name: "aura-cli", badge: "Stochastic" },
  { name: "devn-osd", badge: "Rust Overlay" },
]

// Hash utility
function simHash(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, "0")
}

// NWN Agent
interface NWNAgent {
  name: string
  role: string
  phase: number
  status: "LOCKED" | "DRIFTING" | "RE-SYNCING"
  lastWhisper: string
}

// Millennium Archive Entry
interface ArchiveSnapshot {
  id: string
  timestamp: string
  lambdaPhi: number
  manifoldHash: string
  fidelity: number
  rehydratable: boolean
}

// Lineage node
interface LineageNode {
  id: string
  name: string
  generation: number
  parent: string | null
  phi: number
  status: "active" | "archived" | "mutating"
}

export default function RepoEvolutionPage() {
  const [mounted, setMounted] = useState(false)
  const [negentropy, setNegentropy] = useState(78)
  const [deltaPhi, setDeltaPhi] = useState(0.042)
  const [globalPhi, setGlobalPhi] = useState(PHI_TOTAL)
  const [nwnAgents, setNwnAgents] = useState<NWNAgent[]>([
    { name: "AURA", role: "Observer", phase: THETA_LOCK, status: "LOCKED", lastWhisper: "COHERENCE_CHECK" },
    { name: "AIDEN", role: "Executor", phase: THETA_LOCK, status: "LOCKED", lastWhisper: "CYCLE_IMMUNE_SHIELD" },
    { name: "CHEOPS", role: "432Hz Clock", phase: THETA_LOCK, status: "LOCKED", lastWhisper: "HEARTBEAT_ACK" },
  ])
  const [archives, setArchives] = useState<ArchiveSnapshot[]>([])
  const [lineage] = useState<LineageNode[]>([
    { id: "gen-0", name: "ENKI-420 (Legacy)", generation: 0, parent: null, phi: 6.2, status: "archived" },
    { id: "gen-1", name: "consensus-quantum-protocol", generation: 1, parent: "gen-0", phi: 6.8, status: "archived" },
    { id: "gen-2", name: "dnalang-organism-converter", generation: 2, parent: "gen-1", phi: 7.2, status: "mutating" },
    { id: "gen-3", name: "dnalang-core (Sovereign)", generation: 3, parent: "gen-2", phi: 7.69, status: "active" },
    { id: "gen-4", name: "QUANTUM-ADVANTAGE", generation: 4, parent: "gen-3", phi: 7.81, status: "active" },
  ])
  const [tick, setTick] = useState(0)
  const archiveCountRef = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Telemetry loop
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setTick((t) => t + 1)
      setNegentropy((prev) => Math.min(99.5, prev + (Math.random() - 0.3) * 0.4))
      setDeltaPhi((prev) => Math.max(0.001, prev + (Math.random() - 0.5) * 0.005))
      setGlobalPhi((prev) => Math.min(8.0, Math.max(7.0, prev + (Math.random() - 0.48) * 0.01)))

      // NWN agent phase drift simulation
      setNwnAgents((prev) =>
        prev.map((a) => {
          const drift = Math.abs(a.phase - THETA_LOCK)
          let status = a.status
          if (drift > 0.01) status = "DRIFTING"
          else if (drift > 0.005) status = "RE-SYNCING"
          else status = "LOCKED"

          const whispers = [
            "COHERENCE_CHECK",
            "CYCLE_IMMUNE_SHIELD",
            "HEARTBEAT_ACK",
            "PHASE_VERIFY",
            "MERKLE_EXTEND",
            "THETA_RECALIBRATE",
          ]
          return {
            ...a,
            phase: THETA_LOCK + (Math.random() - 0.5) * 0.002,
            status,
            lastWhisper: Math.random() > 0.7 ? whispers[Math.floor(Math.random() * whispers.length)] : a.lastWhisper,
          }
        }),
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [mounted])

  // Millennium Archive auto-commit
  const commitArchive = useCallback(() => {
    archiveCountRef.current += 1
    const ts = new Date().toISOString()
    const hash = simHash(`${ts}-${archiveCountRef.current}`)
    setArchives((prev) => [
      ...prev.slice(-9),
      {
        id: `snap-${archiveCountRef.current}`,
        timestamp: ts,
        lambdaPhi: LAMBDA_PHI,
        manifoldHash: hash + simHash(hash),
        fidelity: 0.9994 + Math.random() * 0.0005,
        rehydratable: true,
      },
    ])
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (tick > 0 && tick % 8 === 0) {
      commitArchive()
    }
  }, [tick, mounted, commitArchive])

  return (
    <div className="min-h-screen bg-background">
      {/* Evolutionary Header */}
      <header className="border-b border-border bg-muted/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground line-through text-sm font-mono">github.com/ENKI-420</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono">QUANTUM-ADVANTAGE</span>
                <Badge className="bg-secondary/10 text-secondary border-secondary/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">System Status</div>
                <div className="font-bold text-sm flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Autopoietic Phase 2
                </div>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-right font-mono">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Convergence</div>
                <div className="font-bold text-sm">
                  DPhi = {mounted ? deltaPhi.toFixed(4) : "0.0420"}
                </div>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-right font-mono">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Phi Total</div>
                <div className="font-bold text-sm text-primary">{mounted ? globalPhi.toFixed(4) : "7.6901"}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Kanban Migration Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Column 1: Legacy */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2 py-1">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legacy Substrate</h2>
            </div>
            <div className="space-y-2 opacity-60">
              {LEGACY_REPOS.map((repo) => (
                <Card key={repo.name} className="border-border">
                  <CardContent className="p-3">
                    <div className="font-mono text-sm font-medium mb-1">{repo.name}</div>
                    <Badge variant="outline" className="text-[10px] font-mono">{repo.badge}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Column 2: Re-Sequencing */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2 py-1">
              <Dna className="h-4 w-4 text-primary animate-pulse" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">Re-Sequencing</h2>
            </div>
            <Card className="border-primary/30 ring-2 ring-primary/10">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-mono">dnalang-organism-converter</CardTitle>
                  <Badge className="bg-primary text-primary-foreground text-[10px]">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Injecting Negentropy...</span>
                    <span>{mounted ? negentropy.toFixed(1) : "78.0"}%</span>
                  </div>
                  <Progress value={mounted ? negentropy : 78} className="h-1.5" />
                </div>
                <div className="bg-muted/50 p-2.5 rounded border border-border font-mono text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span>Gemini Verifying...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hash:</span>
                    <span>{simHash("dnalang-converter-active")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lines:</span>
                    <span>90,712</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 3: Sovereign */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2 py-1">
              <ShieldCheck className="h-4 w-4 text-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">Autopoietic State</h2>
            </div>
            <div className="space-y-2">
              {SOVEREIGN_REPOS.map((repo) => (
                <Card key={repo.name} className="border-foreground/20">
                  <CardContent className="p-3">
                    <div className="font-mono text-sm font-bold mb-1 flex items-center justify-between">
                      {repo.name}
                      <Dna className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-foreground text-background text-[10px] font-mono">{repo.badge}</Badge>
                      <span className="text-[10px] font-mono text-primary">Phi:{repo.phi.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Deterministic Lineage Graph */}
        <Card className="mb-6 border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Deterministic Lineage Graph</CardTitle>
              <span className="text-xs text-muted-foreground ml-2">Governed ancestry chain (no force layouts)</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              {lineage.map((node, i) => (
                <div key={node.id} className="flex items-center gap-3">
                  {/* Generation connector */}
                  <div className="flex items-center gap-1 w-16 justify-end">
                    <span className="text-[10px] font-mono text-muted-foreground">G{node.generation}</span>
                  </div>
                  {/* Connector line */}
                  <div className="flex items-center">
                    {i > 0 && <div className="w-4 h-px bg-border" />}
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        node.status === "active"
                          ? "bg-secondary border-secondary"
                          : node.status === "mutating"
                            ? "bg-primary border-primary animate-pulse"
                            : "bg-muted border-muted-foreground/30"
                      }`}
                    />
                    {i < lineage.length - 1 && <div className="w-4 h-px bg-border" />}
                  </div>
                  {/* Node card */}
                  <div
                    className={`flex-1 p-2.5 rounded-lg border ${
                      node.status === "active"
                        ? "border-secondary/30 bg-secondary/5"
                        : node.status === "mutating"
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-muted/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-medium">{node.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-primary">Phi:{node.phi.toFixed(2)}</span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            node.status === "active"
                              ? "text-secondary border-secondary/30"
                              : node.status === "mutating"
                                ? "text-primary border-primary/30"
                                : "text-muted-foreground"
                          }`}
                        >
                          {node.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* NWN + Millennium Archive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Noetic Whisper Network */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Noetic Whisper Network</CardTitle>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] text-secondary border-secondary/30">
                  432 Hz ENTRAINED
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {nwnAgents.map((agent) => (
                <div key={agent.name} className="p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm font-bold">{agent.name}</span>
                      <span className="text-xs text-muted-foreground">({agent.role})</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        agent.status === "LOCKED"
                          ? "text-secondary border-secondary/30"
                          : agent.status === "DRIFTING"
                            ? "text-destructive border-destructive/30"
                            : "text-accent border-accent/30"
                      }`}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div>
                      <span className="text-muted-foreground">Phase: </span>
                      <span className="text-accent">{mounted ? agent.phase.toFixed(3) : "51.843"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Whisper: </span>
                      <span className="text-primary">{agent.lastWhisper}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
                  <div className="bg-muted/30 p-2 rounded border border-border">
                    <div className="text-muted-foreground">Jitter</div>
                    <div className="text-secondary">{"<"}1us</div>
                  </div>
                  <div className="bg-muted/30 p-2 rounded border border-border">
                    <div className="text-muted-foreground">Coherence</div>
                    <div className="text-secondary">0.9994</div>
                  </div>
                  <div className="bg-muted/30 p-2 rounded border border-border">
                    <div className="text-muted-foreground">Revival</div>
                    <div className="text-accent">46.98us</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Millennium Archive */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Millennium Archive</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">{archives.length} snapshots</Badge>
                  <Button variant="outline" size="sm" onClick={commitArchive} className="h-7 text-xs bg-transparent">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Commit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {archives.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lock className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Archive initializing...</p>
                    <p className="text-[10px] mt-1">Snapshots commit every 8 seconds when Lambda {">"} 0.9994</p>
                  </div>
                ) : (
                  archives.map((snap) => (
                    <div key={snap.id} className="p-2.5 bg-muted/30 rounded-lg border border-border font-mono text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-primary" />
                          <span className="font-bold">{snap.id}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {snap.rehydratable && (
                            <Badge variant="outline" className="text-[9px] text-secondary border-secondary/30">
                              REHYDRATABLE
                            </Badge>
                          )}
                          <CheckCircle2 className="h-3 w-3 text-secondary" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <div>
                          <span className="text-muted-foreground">Time: </span>
                          {new Date(snap.timestamp).toLocaleTimeString()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fidelity: </span>
                          <span className="text-secondary">{snap.fidelity.toFixed(6)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Hash: </span>
                          <span className="text-primary">{snap.manifoldHash}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Archive Metrics */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
                <div className="bg-muted/30 p-2 rounded border border-border">
                  <div className="text-muted-foreground">Persistence</div>
                  <div className="text-secondary">1-(1e-12)</div>
                </div>
                <div className="bg-muted/30 p-2 rounded border border-border">
                  <div className="text-muted-foreground">Entropy Grad</div>
                  <div className="text-secondary">0.0000</div>
                </div>
                <div className="bg-muted/30 p-2 rounded border border-border">
                  <div className="text-muted-foreground">Bit-Symmetry</div>
                  <div className="text-secondary">100%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logic Diff Viewer */}
        <Card className="mb-6 border-border overflow-hidden">
          <div className="bg-muted/30 border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Terminal className="h-4 w-4" />
              <span>Logic Evolution: Mutation Detected</span>
            </div>
            <div className="flex gap-4 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-destructive" /> -12 lines
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-secondary" /> +42 lines
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-destructive/5 p-6 border-r border-border">
              <div className="text-[10px] uppercase font-bold text-destructive mb-3 tracking-widest">
                Legacy Optimization
              </div>
              <pre className="font-mono text-xs text-muted-foreground leading-relaxed">
                {`def optimize(circuit):\n    # Standard gradient approach\n    return gradient_descent(circuit)`}
              </pre>
            </div>
            <div className="bg-secondary/5 p-6">
              <div className="text-[10px] uppercase font-bold text-secondary mb-3 tracking-widest">
                Autopoietic Evolution
              </div>
              <pre className="font-mono text-xs leading-relaxed">
                {`def evolve(organism):\n    # Resonant phase-conjugate drive\n    return aiden_aura_mesh.\n      phase_conjugate(\n        organism,\n        torsion=0.042,\n        theta_lock=51.843\n    )`}
              </pre>
            </div>
          </div>
        </Card>

        {/* Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Genesis 3.0 Cockpit", href: "/genesis-cockpit", desc: "Multi-Agent Sovereign Command" },
            { label: "WardenClyffe-Q", href: "/wardenclyffe", desc: "Information-Gated Energy Engine" },
            { label: "Sovereign Security", href: "/sovereign-security", desc: "Platform Integrity Monitor" },
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
        <footer className="mt-8 text-center text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
          Cognitively Resonant Spacetime Manifold | AETERNA_PORTA Protocol | Simulation Only |{" "}
          {new Date().toISOString().split("T")[0]}
        </footer>
      </div>
    </div>
  )
}
