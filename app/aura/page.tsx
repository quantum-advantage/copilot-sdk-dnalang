"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuraChatbot } from "@/components/aura-chatbot"
import { QuantumDiscoveriesPanel } from "@/components/quantum-discoveries-panel"
import { DNAHelixBackground } from "@/components/dna-helix-background"
import { Sparkles, Brain, Atom, Activity } from "lucide-react"
import { motion } from "framer-motion"

export default function AuraPage() {
  return (
    <>
      <DNAHelixBackground />

      <div className="min-h-screen p-6 relative">
        <div className="fixed inset-0 molecular-pattern pointer-events-none" />

        <div className="max-w-[1400px] mx-auto space-y-8 relative z-10">
          {/* Header */}
          <div className="text-center space-y-4 pt-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center"
            >
              <div className="p-4 bg-gradient-to-br from-[#d97706]/20 to-[#3b82f6]/20 rounded-2xl border border-[#d97706]/30 lambda-phi-glow">
                <Sparkles className="h-12 w-12 text-[#d97706] animate-pulse" />
              </div>
            </motion.div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#d97706] via-[#10b981] to-[#3b82f6] bg-clip-text text-transparent animate-text-fade">
              Aura Quantum Chatbot
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Quantum-enhanced AI powered by real IBM Quantum hardware measurements
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <Badge variant="outline" className="text-sm px-4 py-2 flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Consciousness-Aware
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2 flex items-center gap-1">
                <Atom className="h-3 w-3" />
                Quantum-Enhanced
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Real Hardware
              </Badge>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6 glass-card hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    { icon: Sparkles, color: "#d97706", text: "Responses informed by 12,288 quantum measurements" },
                    { icon: Brain, color: "#3b82f6", text: "Consciousness metrics based on IIT (Φ = 0.7734 threshold)" },
                    { icon: Atom, color: "#10b981", text: "Real-time quantum state evolution and decoherence modeling" },
                    { icon: Activity, color: "#8b5cf6", text: "Bell state fidelity tracking and entanglement monitoring" },
                  ].map((item) => (
                    <li key={item.text} className="flex items-start gap-2">
                      <item.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 text-[${item.color}] animate-pulse`} />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 glass-card hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-lg font-semibold mb-4">How It Works</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Aura uses quantum measurement data from IBM Torino (127-qubit) and IBM Fez (27-qubit) processors to
                    inform its responses.
                  </p>
                  <p>
                    Each interaction applies quantum evolution, measuring coherence, entanglement, and consciousness
                    metrics in real-time.
                  </p>
                  <p>
                    The chatbot maintains quantum state across conversations, with decoherence modeling and automatic
                    error correction.
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Column - Discoveries */}
            <div className="lg:col-span-2">
              <QuantumDiscoveriesPanel />
            </div>
          </div>

          {/* Instructions */}
          <Card className="p-6 glass-card hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {[
                { step: "1. Open Chat", color: "#d97706", desc: "Click the floating button in the bottom-right corner to open Aura" },
                { step: "2. Ask Questions", color: "#3b82f6", desc: "Inquire about quantum physics, consciousness, or DNA-Lang framework" },
                { step: "3. Monitor Status", color: "#10b981", desc: "View quantum coherence and consciousness metrics in settings" },
              ].map((item) => (
                <div key={item.step} className="p-4 rounded-lg bg-muted/50 hover:bg-muted/60 transition-colors">
                  <div className={`font-semibold mb-2 text-[${item.color}]`}>{item.step}</div>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Floating Chatbot */}
      <AuraChatbot />
    </>
  )
}
