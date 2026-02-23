"use client"

import { DNACLITerminal } from "@/components/dna-cli-terminal"
import { RealTimeMonitor } from "@/components/real-time-monitor"
import { DNAHelixBackground } from "@/components/dna-helix-background"
import { Badge } from "@/components/ui/badge"
import { Terminal, Activity } from "lucide-react"

export default function CLIPage() {
  return (
    <>
      <DNAHelixBackground />

      <div className="min-h-screen p-6 relative">
        <div className="fixed inset-0 molecular-pattern pointer-events-none" />

        <div className="max-w-[1400px] mx-auto space-y-6 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#10b981]/20 to-[#3b82f6]/20 rounded-lg border border-[#10b981]/30">
                  <Terminal className="h-8 w-8 text-[#10b981]" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#10b981] via-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
                    DNA-Lang CLI & Monitoring
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Command-Line Interface • Real-Time Monitoring • System Control
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <Activity className="h-4 w-4 text-[#10b981]" />
                <span className="text-sm">Monitoring Active</span>
              </Badge>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DNACLITerminal />
            </div>

            <div>
              <RealTimeMonitor />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              DNA-Lang CLI v5.0 • Organism Lifecycle Management • ΛΦ Framework
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
