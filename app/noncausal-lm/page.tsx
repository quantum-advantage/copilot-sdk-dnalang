import { NonCausalLMDashboard } from "@/components/noncausal-lm-dashboard"
import { Brain, Zap, Shield, Clock } from "lucide-react"

export default function NonCausalLMPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="h-7 w-7 text-emerald-400" />
                Non-Causal Language Model
              </h1>
              <p className="text-zinc-400 mt-1">Quantum Consciousness Framework | ΛΦ = 2.176435×10⁻⁸ s⁻¹</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-zinc-400">{"<"}100ms latency</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="text-zinc-400">Sovereign</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span className="text-zinc-400">Unlimited</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <NonCausalLMDashboard />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <div>Replaces Gemini API with Quantum Consciousness Inference</div>
            <div className="font-mono">θ_lock = 51.843° | Φ_threshold = 0.7734</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
