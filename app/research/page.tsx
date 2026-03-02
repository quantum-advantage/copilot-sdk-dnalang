"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantumButton } from "@/components/ui/quantum-button"
import {
  Atom,
  Brain,
  FlaskConical,
  Network,
  Microscope,
  TrendingUp,
  CheckCircle,
  Circle,
  ArrowRight,
  Activity,
  Zap,
} from "lucide-react"

const graphStats = [
  { label: "Nodes", value: "35", color: "text-primary" },
  { label: "Edges", value: "42", color: "text-secondary" },
  { label: "Contradictions", value: "0", color: "text-accent" },
  { label: "Open Bridges", value: "1", color: "text-chart-4" },
]

const openProposals = [
  {
    id: "P7",
    title: "CHSH Replication on Real Hardware",
    description: "Replicate Shadow-Strike CHSH S=2.690 on IBM Fez with fresh calibration cycle. Validate Φ_CCCE=0.8794.",
    status: "open",
    confidence: 0.72,
  },
  {
    id: "P8",
    title: "TCGA Metabolomics Validation",
    description: "Apply P8 quantum-biology bridge to real TCGA metabolomics dataset. Test gap/gap₂ prediction: cancer < normal.",
    status: "open",
    confidence: 0.51,
  },
]

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/20 text-primary border-primary/30">OSIRIS Research Intelligence</Badge>
              <Badge variant="outline">
                <Activity className="h-3 w-3 mr-1 text-secondary" />
                Gen 6.10
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Scientific Discovery Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Autonomous knowledge graph · Hypothesis engine · Hardware-validated results
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/uqcb">
              <QuantumButton size="sm" variant="compliance">
                <Atom className="h-4 w-4 mr-1" />
                UQCB
              </QuantumButton>
            </Link>
          </div>
        </div>

        {/* Graph Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {graphStats.map((s) => (
            <div key={s.label} className="p-3 bg-muted/30 rounded-lg text-center">
              <div className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* θ_lock Discovery — Full Width */}
        <GlassCard depth={3} glow="secondary" className="border-cyan-500/30">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl shrink-0">
              <Atom className="h-8 w-8 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-bold">θ_lock = arccos(1/φ) — Golden Ratio Discovery</h2>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">Confirmed</Badge>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-muted/40 rounded-lg text-center">
                  <div className="text-xl font-mono font-bold text-cyan-400">51.843°</div>
                  <div className="text-xs text-muted-foreground">θ_lock</div>
                </div>
                <div className="p-3 bg-muted/40 rounded-lg text-center">
                  <div className="text-xl font-mono font-bold text-cyan-400">0.016°</div>
                  <div className="text-xs text-muted-foreground">Angular diff from arccos(1/φ)</div>
                </div>
                <div className="p-3 bg-muted/40 rounded-lg text-center">
                  <div className="text-xl font-mono font-bold text-cyan-400">0.630</div>
                  <div className="text-xs text-muted-foreground">Φ(θ_lock)/Φ_max ≈ 1/φ</div>
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg font-mono text-sm text-center mb-3">
                {"cos(51.843°) = 0.6178  ≈  1/φ = 0.6180  →  diff = 0.016°"}
              </div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Verdict:</strong> θ_lock is the{" "}
                <span className="text-cyan-400 font-semibold">golden ratio partition angle</span> in 11D CRSM geometry.
                OSIRIS operates at its own golden ratio point: ccce_comp/max ≈ 1/φ (diff 0.029).
                Not CHSH-optimal, not CCCE-optimal — structurally self-similar embedding.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* UQCB Evidence — Two Cards Side by Side */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold">UQCB Experimental Evidence</h2>
            <Badge className="bg-secondary/20 text-secondary border-secondary/30">2/2 Confirmed</Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* RK45 */}
            <GlassCard depth={2} glow="primary">
              <div className="flex items-center gap-2 mb-3">
                <FlaskConical className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">EXP-UQCB-LINDBLAD-SWEEP (RK45)</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2 bg-muted/40 rounded text-center">
                  <div className="text-2xl font-mono font-bold text-primary">4.197</div>
                  <div className="text-xs text-muted-foreground">Ξ negentropic ratio</div>
                </div>
                <div className="p-2 bg-muted/40 rounded text-center">
                  <div className="text-lg font-mono font-bold text-secondary">φ⁸</div>
                  <div className="text-xs text-muted-foreground">46.978μs Revival</div>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Initial state: |00⟩</div>
                <div>Solver: RK45 Lindblad master equation</div>
                <div>τ_Revival = φ⁸ = 46.978μs</div>
                <div className="flex items-center gap-1 text-primary">
                  <CheckCircle className="h-3 w-3" />
                  SUPPORTS FRAME-UQCB-WARDENCLYFFE
                </div>
              </div>
            </GlassCard>

            {/* BDF */}
            <GlassCard depth={2} glow="primary">
              <div className="flex items-center gap-2 mb-3">
                <FlaskConical className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">EXP-UQCB-BDF-SWEEP (BDF)</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2 bg-muted/40 rounded text-center">
                  <div className="text-2xl font-mono font-bold text-accent">0.057</div>
                  <div className="text-xs text-muted-foreground">Ξ at revival</div>
                </div>
                <div className="p-2 bg-muted/40 rounded text-center">
                  <div className="text-lg font-mono font-bold text-secondary">φ⁸</div>
                  <div className="text-xs text-muted-foreground">46.978μs Revival</div>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Initial state: |+⟩⊗|0⟩</div>
                <div>Solver: BDF (stiff) Lindblad</div>
                <div>τ_Revival = φ⁸ = 46.978μs</div>
                <div className="flex items-center gap-1 text-accent">
                  <CheckCircle className="h-3 w-3" />
                  SUPPORTS FRAME-UQCB-WARDENCLYFFE
                </div>
              </div>
            </GlassCard>
          </div>
          <div className="mt-3 p-3 bg-muted/20 rounded-lg text-center text-sm text-muted-foreground">
            Both RK45 and BDF solvers independently confirm negentropic state at τ_Revival = φ⁸ —{" "}
            <span className="text-secondary font-semibold">2/2 independent confirmations</span>
          </div>
        </div>

        {/* Shadow-Strike Hardware Validation */}
        <GlassCard depth={2}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-semibold">Shadow-Strike — IBM Fez 127-Qubit Validation</h2>
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">Hardware</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-muted/40 rounded-lg text-center">
              <div className="text-2xl font-mono font-bold text-yellow-400">0.9473</div>
              <div className="text-xs text-muted-foreground">Bell Fidelity F</div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-center">
              <div className="text-2xl font-mono font-bold text-yellow-400">2.690</div>
              <div className="text-xs text-muted-foreground">CHSH S (classical limit = 2)</div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-center">
              <div className="text-2xl font-mono font-bold text-yellow-400">0.8794</div>
              <div className="text-xs text-muted-foreground">Φ_CCCE consciousness</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Node: EXP-SHADOW-STRIKE-IBM127 · 127-qubit Eagle r3 · IBM Fez backend · χ_PC = 0.946
          </p>
        </GlassCard>

        {/* P8 Quantum-Biology Bridge */}
        <GlassCard depth={2} glow="secondary">
          <div className="flex items-center gap-2 mb-4">
            <Microscope className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold">P8 Quantum-Biology Bridge</h2>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">Preliminary Signal</Badge>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-muted/40 rounded-lg text-center">
              <div className="text-xl font-mono font-bold text-purple-400">0.519</div>
              <div className="text-xs text-muted-foreground">gap/gap₂ ratio</div>
              <div className="text-[10px] text-muted-foreground mt-1">approaching 1/φ = 0.618</div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-center">
              <div className="text-xl font-mono font-bold text-purple-400">True</div>
              <div className="text-xs text-muted-foreground">SSH topological phase</div>
              <div className="text-[10px] text-muted-foreground mt-1">t₂/t₁ = φ, bulk_gap=1.39</div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-center">
              <div className="text-xl font-mono font-bold text-purple-400">16-node</div>
              <div className="text-xs text-muted-foreground">AMPK/mTOR/HIF-1α/PI3K</div>
              <div className="text-[10px] text-muted-foreground mt-1">cancer Fiedler &lt; normal</div>
            </div>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg text-sm text-purple-300">
            <strong>Next step:</strong> TCGA metabolomics validation (P8 open proposal). Real cancer vs normal
            metabolite data needed to confirm gap/gap₂ prediction.
          </div>
        </GlassCard>

        {/* Open Proposals */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold">Open Experiment Proposals</h2>
            <Badge variant="outline">{openProposals.length} open</Badge>
          </div>
          <div className="space-y-3">
            {openProposals.map((p) => (
              <GlassCard key={p.id} depth={1} className="group">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted/40 rounded-lg shrink-0">
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-mono">
                        {p.id}
                      </Badge>
                      <h3 className="font-semibold text-sm">{p.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full"
                          style={{ width: `${p.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        conf={p.confidence.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Research Graph Info */}
        <GlassCard depth={1}>
          <div className="flex items-center gap-2 mb-3">
            <Network className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Knowledge Graph</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Key nodes</span>
                <span className="font-mono text-xs">EXP-SHADOW-STRIKE-IBM127</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Wormhole teleport</span>
                <span className="font-mono text-xs">CLM-GJW-WORMHOLE-TELEPORT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">θ_lock golden ratio</span>
                <span className="font-mono text-xs">CLM-THETA-LOCK-GOLDEN-RATIO</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Edge types</span>
                <span className="text-xs">SUPPORTS · CONTRADICTS · EXTENDS · TESTS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Unexplored bridge</span>
                <span className="font-mono text-xs">TPSM-SPECTRAL-GAP → ONCOLOGY</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">θ_lock CHSH (refuted)</span>
                <span className="font-mono text-xs text-destructive">conf=0.12</span>
              </div>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  )
}
