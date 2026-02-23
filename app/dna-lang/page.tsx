"use client"

import { LivingCell } from "@/components/living-cell"
import { QuantumStateDisplay } from "@/components/quantum-state-display"
import { DNADataTransformer } from "@/components/dna-data-transformer"
import { EvolutionaryRouteMonitor } from "@/components/evolutionary-route-monitor"
import { DNAHelixBackground } from "@/components/dna-helix-background"
import { Badge } from "@/components/ui/badge"
import { Dna, Atom, Activity } from "lucide-react"

export default function DNALangPage() {
  return (
    <>
      <DNAHelixBackground />

      <div className="min-h-screen p-6 relative">
        <div className="fixed inset-0 molecular-pattern pointer-events-none" />

        <div className="max-w-[1600px] mx-auto space-y-6 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#d97706]/20 to-[#3b82f6]/20 rounded-lg border border-[#d97706]/30 lambda-phi-glow">
                  <Dna className="h-8 w-8 text-[#d97706]" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#d97706] via-[#10b981] to-[#3b82f6] bg-clip-text text-transparent">
                    DNA-Lang Living Interface
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Biological Computing • Quantum State Management • Cellular Regeneration
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <div className="h-2 w-2 bg-[#10b981] rounded-full animate-pulse" />
                <span className="text-sm">All Systems Operational</span>
              </Badge>
            </div>
          </div>

          {/* Living Cells Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LivingCell id="quantum-cell-1" title="Quantum State Manager">
              <QuantumStateDisplay
                states={["Alpha", "Beta", "Gamma", "Delta", "Epsilon"]}
                title="Quantum Superposition"
              />
            </LivingCell>

            <LivingCell id="protein-cell-1" title="Protein Synthesis">
              <DNADataTransformer />
            </LivingCell>

            <LivingCell id="router-cell-1" title="Evolutionary Router">
              <EvolutionaryRouteMonitor />
            </LivingCell>

            <LivingCell id="metrics-cell-1" title="System Metrics">
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Atom className="h-4 w-4 text-[#8b5cf6]" />
                    <span className="text-sm font-medium">Quantum Coherence</span>
                  </div>
                  <div className="text-3xl font-bold text-[#8b5cf6]">98.7%</div>
                  <div className="text-xs text-muted-foreground mt-1">Decoherence rate: 2.176×10⁻⁸ s⁻¹</div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-[#10b981]" />
                    <span className="text-sm font-medium">Cellular Health</span>
                  </div>
                  <div className="text-3xl font-bold text-[#10b981]">95.2%</div>
                  <div className="text-xs text-muted-foreground mt-1">4 cells regenerated in last hour</div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Dna className="h-4 w-4 text-[#d97706]" />
                    <span className="text-sm font-medium">Evolution Progress</span>
                  </div>
                  <div className="text-3xl font-bold text-[#d97706]">Gen 47</div>
                  <div className="text-xs text-muted-foreground mt-1">Natural selection active</div>
                </div>
              </div>
            </LivingCell>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              DNA-Lang v5.0 • ΛΦ Framework • Biological Computing Platform
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
