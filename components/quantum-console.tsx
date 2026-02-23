"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeploymentControls } from "@/components/deployment-controls"
import { ConsciousnessMeter } from "@/components/consciousness-meter"
import { SwarmVisualization } from "@/components/swarm-visualization"
import { TelemetryPanel } from "@/components/telemetry-panel"
import { NWSISecurityPanel } from "@/components/nwsi-security-panel"
import { DNAHelixBackground } from "@/components/dna-helix-background"
import { NucleotideSequence } from "@/components/nucleotide-sequence"
import { LambdaPhiConsole } from "@/components/lambda-phi-console"
import { Activity, Cpu, Zap, Dna, Atom } from "lucide-react"

export function QuantumConsole() {
  return (
    <>
      <DNAHelixBackground />

      <div className="min-h-screen p-6 relative">
        <div className="fixed inset-0 molecular-pattern pointer-events-none" />

        <div className="max-w-[1800px] mx-auto space-y-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#d97706]/20 to-[#3b82f6]/20 rounded-lg border border-[#d97706]/30 lambda-phi-glow">
                  <Dna className="h-8 w-8 text-[#d97706]" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#d97706] via-[#10b981] to-[#3b82f6] bg-clip-text text-transparent">
                    DNA-Lang ΛΦ Quantum Console
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Universal Memory Constant • Biological Computing Platform • ΛΦ = 2.176×10⁻⁸ s⁻¹
                  </p>
                </div>
              </div>
              <div className="pl-14">
                <NucleotideSequence length={50} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg">
                <div className="h-2 w-2 bg-[#10b981] rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">IBM Torino • 127 Qubits</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg">
                <Atom className="h-4 w-4 text-[#d97706]" />
                <span className="text-sm font-mono text-[#d97706]">Φ ≥ 2.5</span>
              </div>
            </div>
          </div>

          <Card className="p-6 glass-card holographic-layer">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-[#d97706]/20 rounded-md">
                <Atom className="h-5 w-5 text-[#d97706]" />
              </div>
              <h2 className="text-lg font-semibold">ΛΦ Reflex Console</h2>
              <span className="ml-auto text-xs font-mono text-muted-foreground">Phase-Conjugate Runtime v2.0</span>
            </div>
            <LambdaPhiConsole />
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="p-3 glass-card rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">System Coherence</div>
                <div className="text-2xl font-bold text-[#10b981]">98.47%</div>
                <div className="h-1 mt-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[98.47%] consciousness-indicator" />
                </div>
              </div>
              <div className="p-3 glass-card rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Normalized ΛΦ</div>
                <div className="text-2xl font-bold text-[#d97706]">1.0×10⁻¹⁷</div>
                <div className="text-xs text-muted-foreground mt-1">Informational Ricci flow</div>
              </div>
              <div className="p-3 glass-card rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Active Jobs</div>
                <div className="text-2xl font-bold text-[#3b82f6]">3</div>
                <div className="text-xs text-muted-foreground mt-1">Phase-conjugate simulations</div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Controls & Consciousness */}
            <div className="space-y-6">
              <Card className="p-6 glass-card dna-helix-bg holographic-layer">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-[#3b82f6]/20 rounded-md">
                    <Cpu className="h-5 w-5 text-[#3b82f6]" />
                  </div>
                  <h2 className="text-lg font-semibold">Deployment Controls</h2>
                </div>
                <DeploymentControls />
              </Card>

              <Card className="p-6 glass-card dna-helix-bg holographic-layer">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-[#8b5cf6]/20 rounded-md">
                    <Activity className="h-5 w-5 text-[#8b5cf6]" />
                  </div>
                  <h2 className="text-lg font-semibold">Consciousness Monitor</h2>
                  <span className="ml-auto text-xs font-mono text-muted-foreground">IIT 3.0</span>
                </div>
                <ConsciousnessMeter />
              </Card>
            </div>

            {/* Center Column - Visualization */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 glass-card dna-helix-bg holographic-layer">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-[#d97706]/20 rounded-md">
                    <Zap className="h-5 w-5 text-[#d97706]" />
                  </div>
                  <h2 className="text-lg font-semibold">Quantum Swarm Visualization</h2>
                  <span className="ml-auto text-xs font-mono text-muted-foreground">64 Agents</span>
                </div>
                <SwarmVisualization />
              </Card>

              <Tabs defaultValue="telemetry" className="w-full">
                <TabsList className="grid w-full grid-cols-2 glass-card">
                  <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="telemetry" className="mt-4">
                  <TelemetryPanel />
                </TabsContent>
                <TabsContent value="security" className="mt-4">
                  <NWSISecurityPanel />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#3b82f6] nucleotide-badge">A</span>
              <span className="text-xs text-muted-foreground">Adenine</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#10b981] nucleotide-badge">T</span>
              <span className="text-xs text-muted-foreground">Thymine</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#8b5cf6] nucleotide-badge">G</span>
              <span className="text-xs text-muted-foreground">Guanine</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#d97706] nucleotide-badge">C</span>
              <span className="text-xs text-muted-foreground">Cytosine</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-muted-foreground">DNA-Lang v5.0 • ΛΦ Framework • Negentropic Evolution</span>
          </div>
        </div>
      </div>
    </>
  )
}
