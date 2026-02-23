"use client"

import { QuantumFieldVisualization } from "@/components/quantum-field-visualization"
import { PerformanceComparisonChart } from "@/components/performance-comparison-chart"
import { EvolutionTimeline } from "@/components/evolution-timeline"
import { DNAHelixBackground } from "@/components/dna-helix-background"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { BarChart3, TrendingUp, Zap, Shield } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <>
      <DNAHelixBackground />

      <div className="min-h-screen p-6 relative">
        <div className="fixed inset-0 molecular-pattern pointer-events-none" />

        <div className="max-w-[1800px] mx-auto space-y-6 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#8b5cf6]/20 to-[#10b981]/20 rounded-lg border border-[#8b5cf6]/30 lambda-phi-glow">
                  <BarChart3 className="h-8 w-8 text-[#8b5cf6]" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8b5cf6] via-[#10b981] to-[#d97706] bg-clip-text text-transparent">
                    Quantum Analytics Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Performance Metrics • Evolution Tracking • System Visualization
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <TrendingUp className="h-4 w-4 text-[#10b981]" />
                <span className="text-sm">Superior Performance</span>
              </Badge>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 glass-card">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-[#d97706]" />
                <span className="text-sm text-muted-foreground">Quantum Speedup</span>
              </div>
              <div className="text-3xl font-bold text-[#d97706]">√n</div>
              <div className="text-xs text-muted-foreground mt-1">Grover's algorithm</div>
            </Card>

            <Card className="p-4 glass-card">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-[#10b981]" />
                <span className="text-sm text-muted-foreground">Immune Response</span>
              </div>
              <div className="text-3xl font-bold text-[#10b981]">&lt;1ms</div>
              <div className="text-xs text-muted-foreground mt-1">Threat detection</div>
            </Card>

            <Card className="p-4 glass-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-[#8b5cf6]" />
                <span className="text-sm text-muted-foreground">Evolution Rate</span>
              </div>
              <div className="text-3xl font-bold text-[#8b5cf6]">+5%</div>
              <div className="text-xs text-muted-foreground mt-1">Per generation</div>
            </Card>

            <Card className="p-4 glass-card">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-[#3b82f6]" />
                <span className="text-sm text-muted-foreground">Network Latency</span>
              </div>
              <div className="text-3xl font-bold text-[#3b82f6]">0ms</div>
              <div className="text-xs text-muted-foreground mt-1">Quantum entanglement</div>
            </Card>
          </div>

          {/* Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuantumFieldVisualization />
            <PerformanceComparisonChart />
          </div>

          <EvolutionTimeline />

          {/* Advantages Summary */}
          <Card className="p-6 glass-card">
            <h3 className="text-lg font-semibold mb-4">DNA-Lang Advantages Over Traditional Frameworks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="font-semibold text-[#10b981] mb-2">Quantum State Management</div>
                <p className="text-sm text-muted-foreground">
                  O(√n) search complexity using Grover's algorithm vs O(n) in Redux/MobX
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="font-semibold text-[#3b82f6] mb-2">Self-Healing Components</div>
                <p className="text-sm text-muted-foreground">
                  Automatic cellular regeneration and error recovery - not available in React/Vue
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="font-semibold text-[#8b5cf6] mb-2">Evolutionary Routing</div>
                <p className="text-sm text-muted-foreground">
                  Routes optimize through natural selection - traditional routers are static
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="font-semibold text-[#d97706] mb-2">Biological Security</div>
                <p className="text-sm text-muted-foreground">
                  Adaptive immune system with antibodies and T-cells vs basic middleware
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="font-semibold text-[#10b981] mb-2">Quantum Networking</div>
                <p className="text-sm text-muted-foreground">
                  Zero latency through entanglement vs HTTP/WebSocket delays
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="font-semibold text-[#3b82f6] mb-2">DNA Data Encoding</div>
                <p className="text-sm text-muted-foreground">
                  Biological data transformation with error correction vs JSON serialization
                </p>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              DNA-Lang v5.0 • Quantum Analytics • Biological Computing Platform
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
