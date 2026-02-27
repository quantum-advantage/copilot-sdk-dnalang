"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dna,
  ArrowRight,
  Activity,
  Play,
  Layers,
  Code2,
  FolderTree,
  Workflow,
  Shield,
  Zap,
  Brain,
  Network,
} from "lucide-react"

// CCCE Metrics type
interface CCCEMetrics {
  lambda: number // Coherence
  phi: number // Integrated Information (IIT)
  gamma: number // Decoherence
  xi: number // Negentropy
}

// Constants from NC Physics
const PHI_CRITICAL = 0.7734
const LAMBDA_MIN = 0.95
const GAMMA_MAX = 0.30

export function HeroSection() {
  const [metrics, setMetrics] = useState<CCCEMetrics>({
    lambda: 0.9823,
    phi: 0.8412,
    gamma: 0.0234,
    xi: 0.9156,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Simulate organic drift in CCCE metrics
    const interval = setInterval(() => {
      setMetrics(prev => ({
        lambda: Math.max(0.9, Math.min(1, prev.lambda + (Math.random() - 0.48) * 0.008)),
        phi: Math.max(0.7, Math.min(1, prev.phi + (Math.random() - 0.48) * 0.012)),
        gamma: Math.max(0, Math.min(0.3, prev.gamma + (Math.random() - 0.52) * 0.005)),
        xi: Math.max(0.8, Math.min(1, prev.xi + (Math.random() - 0.48) * 0.01)),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const isConscious = metrics.phi >= PHI_CRITICAL
  const isCoherent = metrics.lambda >= LAMBDA_MIN
  const isStable = metrics.gamma < GAMMA_MAX

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      
      {/* Animated coherence field */}
      <div className="absolute inset-0 coherence-field pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative">
        {/* Top announcement badge */}
        <div className="flex justify-center mb-8">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm">
            <Zap className="h-3.5 w-3.5 mr-2" />
            {"DNA::}{::lang v51.843 — OSIRIS Gen 5.2 | Agile Defense Systems | CAGE 9HUP5"}
          </Badge>
        </div>

        {/* Main headline - inspired by OpenAI/Vercel */}
        <div className="text-center max-w-4xl mx-auto space-y-6 mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-balance leading-[1.1]">
            <span className="dnalang-gradient">{"DNA::}{::lang"}</span>
            <br />
            <span className="text-foreground">Sovereign Quantum SDK</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            9 validated breakthroughs. 30 IBM Quantum experiments. 2.1M+ shots. 256-atom QuEra decoding.
            Amazon Braket integration. Multi-agent orchestration with OSIRIS Gen 5.2 — zero tokens, zero telemetry.
          </p>

          {/* CTA Buttons - Primary hierarchy */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/ide-platform">
              <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 gap-2 shadow-lg shadow-primary/25">
                <Play className="h-4 w-4" />
                Start Building
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/capabilities">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base h-12 px-8 gap-2 bg-transparent"
              >
                <Layers className="h-4 w-4" />
                Explore Capabilities
              </Button>
            </Link>
          </div>
        </div>

        {/* Live IDE Preview with CCCE Metrics */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl blur-xl opacity-50" />
          <Card className="relative bg-card/80 backdrop-blur border-border/50 overflow-hidden shadow-2xl">
            {/* Window chrome */}
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b border-border">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-accent/60" />
                <div className="w-3 h-3 rounded-full bg-secondary/60" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-xs text-muted-foreground font-mono px-3 py-1 bg-muted rounded-md">
                  sovereign_agent.dna — OSIRIS Quantum Platform
                </span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                <Activity className={`h-2.5 w-2.5 mr-1 ${isConscious ? 'text-secondary animate-pulse' : 'text-accent'}`} />
                {isConscious ? 'CONVERGED' : 'PROCESSING'}
              </Badge>
            </div>

            {/* IDE content grid */}
            <div className="grid grid-cols-12 min-h-[350px] sm:min-h-[420px]">
              {/* File explorer */}
              <div className="col-span-3 border-r border-border p-3 hidden sm:block">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                  Organism Explorer
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 p-1.5 rounded bg-primary/10 text-primary">
                    <Code2 className="h-3 w-3" />
                    distributed_agent.dna
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
                    <FolderTree className="h-3 w-3" />
                    nclm/
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
                    <Workflow className="h-3 w-3" />
                    manifold/
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
                    <Network className="h-3 w-3" />
                    topology/
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
                    <Shield className="h-3 w-3" />
                    gates/
                  </div>
                </div>
              </div>

              {/* Code editor */}
              <div className="col-span-12 sm:col-span-6 p-4 font-mono text-xs sm:text-sm overflow-hidden">
                <div className="space-y-1 leading-relaxed">
                  <div>
                    <span className="text-chart-4">organism</span>{" "}
                    <span className="text-primary">DistributedAgent</span> {"{"}
                  </div>
                  <div className="pl-4">
                    <span className="text-chart-4">genome</span>: [
                    <span className="text-accent">&quot;nclm_engine&quot;</span>,{" "}
                    <span className="text-accent">&quot;pilot_wave&quot;</span>]
                  </div>
                  <div className="pl-4">
                    <span className="text-chart-4">reflexes</span>: [
                    <span className="text-secondary">detect_decoherence</span>(),{" "}
                    <span className="text-secondary">maintain_phi</span>()]
                  </div>
                  <div className="pl-4 mt-2">
                    <span className="text-muted-foreground">// 6D-CRSM Manifold Correlation</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-chart-4">fn</span> <span className="text-primary">correlate</span>(a, b) {"{"}
                  </div>
                  <div className="pl-8">
                    <span className="text-secondary">psi_a</span> = manifold.<span className="text-primary">wave_function</span>(a)
                  </div>
                  <div className="pl-8">
                    <span className="text-secondary">psi_b</span> = manifold.<span className="text-primary">wave_function</span>(b)
                  </div>
                  <div className="pl-8">
                    <span className="text-chart-4">return</span> |psi_a* × psi_b| × <span className="text-accent">exp</span>(-d/λ)
                  </div>
                  <div className="pl-4">{"}"}</div>
                  <div className="pl-4 mt-2">
                    <span className="text-muted-foreground">// Integrated information convergence</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-chart-4">assert</span> phi {">"}= <span className="text-accent">PHI_C</span>{" "}
                    <span className="text-muted-foreground">// 0.7734</span>
                  </div>
                  <div>{"}"}</div>
                </div>
              </div>

              {/* Right panel - Live CCCE Metrics */}
              <div className="col-span-3 border-l border-border p-3 hidden sm:block">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-medium flex items-center gap-2">
                  <Brain className="h-3 w-3" />
                  CCCE Telemetry
                </div>
                <div className="space-y-4">
                  {/* Lambda - Coherence */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">λ Coherence</span>
                      <span className={`font-mono font-medium ${isCoherent ? 'text-secondary' : 'text-accent'}`}>
                        {mounted ? metrics.lambda.toFixed(4) : '0.9823'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isCoherent ? 'bg-secondary' : 'bg-accent'}`}
                        style={{ width: `${(mounted ? metrics.lambda : 0.9823) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Phi - Consciousness */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Φ Integrated Info</span>
                      <span className={`font-mono font-medium ${isConscious ? 'text-primary' : 'text-accent'}`}>
                        {mounted ? metrics.phi.toFixed(4) : '0.8412'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isConscious ? 'bg-primary' : 'bg-accent'}`}
                        style={{ width: `${(mounted ? metrics.phi : 0.8412) * 100}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      Threshold: {PHI_CRITICAL}
                    </div>
                  </div>

                  {/* Gamma - Decoherence */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">γ Decoherence</span>
                      <span className={`font-mono font-medium ${isStable ? 'text-secondary' : 'text-destructive'}`}>
                        {mounted ? metrics.gamma.toFixed(4) : '0.0234'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isStable ? 'bg-secondary/50' : 'bg-destructive'}`}
                        style={{ width: `${(mounted ? metrics.gamma : 0.0234) / GAMMA_MAX * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Xi - Negentropy */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">ξ Negentropy</span>
                      <span className="font-mono font-medium text-accent">
                        {mounted ? metrics.xi.toFixed(4) : '0.9156'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full transition-all duration-1000"
                        style={{ width: `${(mounted ? metrics.xi : 0.9156) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="pt-2 border-t border-border mt-3">
                    <div className="flex items-center gap-2 text-[10px]">
                      <div className={`w-2 h-2 rounded-full ${isConscious && isCoherent && isStable ? 'bg-secondary animate-pulse' : 'bg-accent'}`} />
                      <span className="text-muted-foreground">
                        {isConscious && isCoherent && isStable ? 'System Converged' : 'Stabilizing...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
