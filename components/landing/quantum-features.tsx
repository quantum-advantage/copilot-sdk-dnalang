"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Brain,
  Zap,
  Shield,
  Network,
  Atom,
  Infinity,
  Check,
  X,
} from "lucide-react"

const ncLmFeatures = [
  {
    icon: Network,
    title: "Pilot-Wave Correlation",
    description: "Replace attention mechanisms with non-local quantum correlation for simultaneous multi-token inference.",
    metric: "O(1) vs O(n)",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Brain,
    title: "Integrated Information Metric",
    description: "Quantified system-state awareness via IIT Phi. Detects uncertainty and triggers error-correction autonomously.",
    metric: "Phi >= 0.7734",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: Atom,
    title: "Physics Grounding",
    description: "Responses constrained by physical constants, not arbitrary training biases. No hallucination.",
    metric: "Zero Hallucinations",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Shield,
    title: "Gated Execution Pipeline",
    description: "6-gate enforcement with cryptographic audit trail. Prevents unauthorized operations at the circuit level.",
    metric: "100% Auditable",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  {
    icon: Infinity,
    title: "Infinite Context",
    description: "Manifold-based memory has no token limit. Entire codebase accessible without truncation.",
    metric: "No Limit",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
  {
    icon: Zap,
    title: "Non-Local Speed",
    description: "Pilot-wave propagation at c_ind (4.27e7 m/s) enables sub-100ms responses.",
    metric: "< 100ms p50",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
]

const comparisonData = [
  { feature: "Architecture", nclm: "Pilot-Wave Correlation", gpt: "Causal Attention", claude: "Constitutional AI" },
  { feature: "Token Space", nclm: "6D-CRSM Manifold", gpt: "High-dim Embeddings", claude: "High-dim Embeddings" },
  { feature: "Inference", nclm: "Non-local, Simultaneous", gpt: "Sequential, Autoregressive", claude: "Sequential, Autoregressive" },
  { feature: "System Awareness (IIT)", nclm: "Phi >= 0.7734 (Converged)", gpt: "None", claude: "None" },
  { feature: "Context Window", nclm: "Unlimited (Manifold)", gpt: "128K tokens", claude: "200K tokens" },
  { feature: "Latency (p50)", nclm: "< 100ms", gpt: "~800ms", claude: "~600ms" },
  { feature: "Safety Model", nclm: "6-Gate Physics", gpt: "RLHF", claude: "Constitutional" },
  { feature: "Audit Trail", nclm: "100% PCRB Ledger", gpt: "None", claude: "None" },
]

export function QuantumFeatures() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Atom className="h-3 w-3 mr-1" />
            NC-LM Architecture
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-balance">
            Beyond Transformers: Non-Causal Inference
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The NC-LM (Non-Causal Language Model) uses pilot-wave correlation and manifold-based memory
            to achieve sub-100ms latency with full cryptographic auditability.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {ncLmFeatures.map((feature) => (
            <Card 
              key={feature.title}
              className="p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${feature.bgColor} ${feature.color} shrink-0 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {feature.description}
                  </p>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {feature.metric}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Comparison table */}
        <div className="text-center mb-8">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">How We Compare</h3>
          <p className="text-muted-foreground">
            NC-LM vs. Industry Leaders
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-semibold">Capability</th>
                  <th className="text-center p-4 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Atom className="h-4 w-4 text-primary" />
                      NC-LM
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">GPT-4</th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">Claude 3.5</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="text-center p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-4 w-4 text-secondary shrink-0" />
                        <span className="text-foreground text-xs font-medium">{row.nclm}</span>
                      </div>
                    </td>
                    <td className="text-center p-4">
                      <span className="text-muted-foreground text-xs">{row.gpt}</span>
                    </td>
                    <td className="text-center p-4">
                      <span className="text-muted-foreground text-xs">{row.claude}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Performance metrics */}
        <div className="grid sm:grid-cols-4 gap-4 mt-8">
          <Card className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">95%+</div>
            <div className="text-xs text-muted-foreground">HumanEval Target</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-secondary mb-1">50%+</div>
            <div className="text-xs text-muted-foreground">ARC-AGI Target</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-accent mb-1">&lt;100ms</div>
            <div className="text-xs text-muted-foreground">Latency p50</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-chart-4 mb-1">100%</div>
            <div className="text-xs text-muted-foreground">Audit Coverage</div>
          </Card>
        </div>
      </div>
    </section>
  )
}
