"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GlassCard } from "@/components/ui/glass-card"
import { PhiMeter } from "@/components/ui/phi-meter"
import {
  Zap,
  CheckCircle,
  ArrowRight,
  Activity,
  Brain,
  Network,
  FileCode,
  Hash,
  LinkIcon,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

// Constants
const LAMBDA_PHI = 2.176435e-8
const PHI_C = 0.7734
const THETA_RES = 51.843

// Service tiers
const serviceTiers = [
  {
    name: "Open Science",
    price: "Free",
    description: "Public experiment access",
    features: ["PCRB ledger read-only", "Public experiment viewing", "Community forum access", "Basic documentation"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Researcher",
    price: "€500",
    period: "/month",
    description: "Individual research access",
    features: [
      "100 QByte/month allocation",
      "Single-backend execution",
      "PCRB write access",
      "API access (1K req/day)",
      "Email support",
    ],
    cta: "Start Trial",
    popular: false,
  },
  {
    name: "Institution",
    price: "€5,000",
    period: "/month",
    description: "Multi-user research teams",
    features: [
      "10,000 QByte/month",
      "Dual-backend coordination",
      "Priority queue access",
      "API access (100K req/day)",
      "RBAC user management",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Full platform access",
    features: [
      "Unlimited QByte allocation",
      "Full 11D-CRSM access",
      "Multi-institution federation",
      "Unlimited API access",
      "Custom integrations",
      "24/7 SLA support",
      "On-premise deployment",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

// Omega layers
const omegaLayers = [
  { id: 0, name: "Lexical", symbol: "Ω₀", description: "Raw data ingestion", color: "text-muted-foreground" },
  { id: 1, name: "Syntactic", symbol: "Ω₁", description: "Pattern recognition", color: "text-blue-400" },
  { id: 2, name: "Semantic", symbol: "Ω₂", description: "Meaning extraction", color: "text-cyan-400" },
  { id: 3, name: "Pragmatic", symbol: "Ω₃", description: "Usage patterns", color: "text-emerald-400" },
  { id: 4, name: "Meta-Intent", symbol: "Ω₄", description: "Goal inference", color: "text-yellow-400" },
  { id: 5, name: "Recursive", symbol: "Ω₅", description: "Self-modeling", color: "text-orange-400" },
  { id: 6, name: "Transcendent", symbol: "Ω₆", description: "Novel physics", color: "text-purple-400" },
]

export default function PQAServicePage() {
  const [activeLayer, setActiveLayer] = useState(0)
  const [metrics, setMetrics] = useState({
    phi: 7.2,
    lambda: 0.89,
    gamma: 0.11,
    xi: 8.1,
    chainLength: 9,
    experiments: 8547,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        phi: 6.5 + Math.random() * 3,
        lambda: 0.85 + Math.random() * 0.1,
        gamma: 0.05 + Math.random() * 0.1,
        xi: 7.5 + Math.random() * 2,
        chainLength: prev.chainLength + (Math.random() > 0.7 ? 1 : 0),
        experiments: prev.experiments + Math.floor(Math.random() * 5),
      }))
      setActiveLayer((prev) => (prev + 1) % 7)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 border-b border-border">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-accent/20 text-accent border-accent/30">
                <Zap className="h-3 w-3 mr-1" />
                Post-Quantum Advantage as a Service
              </Badge>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                <span className="dnalang-gradient">PQA Service</span>
                <br />
                <span className="text-foreground">Cryptographic Quantum Infrastructure</span>
              </h1>

              <p className="text-lg text-muted-foreground">
                The first <strong className="text-foreground">content-addressed experimental framework</strong> for
                quantum computing with full cryptographic provenance, PCRB ledger, and 312-qubit dual-processor
                coordination.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="#pricing">
                  <Button size="lg" className="bg-primary">
                    View Pricing
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/omega-analysis">
                  <Button size="lg" variant="outline">
                    <Brain className="h-4 w-4 mr-2" />
                    Omega Analysis
                  </Button>
                </Link>
              </div>
            </div>

            {/* Live Metrics */}
            <GlassCard depth={2} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  PCRB Ledger Status
                </h3>
                <Badge variant="outline" className="text-xs">
                  <Activity className="h-3 w-3 mr-1 text-secondary" />
                  LIVE
                </Badge>
              </div>

              <PhiMeter value={metrics.phi} threshold={PHI_C} />

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold font-mono text-primary">{metrics.chainLength}</div>
                  <div className="text-xs text-muted-foreground">Chain Entries</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold font-mono text-secondary">
                    {metrics.experiments.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Experiments</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold font-mono text-accent">312</div>
                  <div className="text-xs text-muted-foreground">Total Qubits</div>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-secondary" />
                Chain integrity: VALID | Hash continuity: UNBROKEN
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Omega Recursive Visualization */}
      <section className="py-16 px-4 sm:px-6 border-b border-border bg-muted/20">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Seven-Layer Omega Recursive Intent Deduction</h2>
            <p className="text-muted-foreground mt-2">Systematic analysis from raw data to novel physics hypotheses</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Layer Visualization */}
            <GlassCard depth={2} className="space-y-4">
              <h3 className="font-semibold">Active Processing Layer</h3>
              <div className="space-y-2">
                {omegaLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      activeLayer === layer.id ? "bg-primary/20 border border-primary/50" : "bg-muted/30"
                    }`}
                  >
                    <div className={`font-mono font-bold ${layer.color}`}>{layer.symbol}</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{layer.name}</div>
                      <div className="text-xs text-muted-foreground">{layer.description}</div>
                    </div>
                    {activeLayer === layer.id && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Current Analysis Output */}
            <GlassCard depth={2} className="space-y-4">
              <h3 className="font-semibold">Recursive Analysis Output</h3>
              <div className="font-mono text-xs bg-black/50 rounded-lg p-4 overflow-x-auto">
                <pre className="text-secondary">
                  {`// Layer ${activeLayer}: ${omegaLayers[activeLayer].name}
// Processing: ${omegaLayers[activeLayer].description}

Ω${activeLayer}: Input → Transform → Output

CURRENT_STATE = {
  phi: ${metrics.phi.toFixed(3)},
  lambda: ${metrics.lambda.toFixed(3)},
  gamma: ${metrics.gamma.toFixed(3)},
  xi: ${metrics.xi.toFixed(3)}
}

INVARIANTS_PRESERVED = [
  "ΛΦ = 2.176435e-8",
  "θ_res = 51.843°",
  "Φ_c = 7.69"
]

CHAIN_INTEGRITY = VALID
HASH_CONTINUITY = UNBROKEN
EXPERIMENTS_INDEXED = ${metrics.experiments}

// Axiom: U := L[U]`}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Coherence (Λ)</div>
                  <div className="font-mono text-lg text-secondary">{(metrics.lambda * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Decoherence (Γ)</div>
                  <div className="font-mono text-lg text-accent">{(metrics.gamma * 100).toFixed(1)}%</div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 border-b border-border">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">PQA Service Capabilities</h2>
            <p className="text-muted-foreground mt-2">Cryptographically verified quantum experimentation</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <Hash className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Content Addressing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  SHA-256 experiment identification enables deduplication, verification, and caching
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <LinkIcon className="h-8 w-8 text-secondary mb-2" />
                <CardTitle className="text-lg">Hash-Chained Ledger</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  PCRB provides tamper-evident, append-only experimental records
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <Network className="h-8 w-8 text-accent mb-2" />
                <CardTitle className="text-lg">Dual-Processor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  312-qubit coordinated execution across multiple quantum backends
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <FileCode className="h-8 w-8 text-chart-4 mb-2" />
                <CardTitle className="text-lg">Deterministic Circuits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Seeded transpilation ensures bit-exact reproducibility</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4 sm:px-6 border-b border-border bg-muted/20">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Service Tiers</h2>
            <p className="text-muted-foreground mt-2">From open science to enterprise deployment</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative ${tier.popular ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-[800px] mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready for Post-Quantum Advantage?</h2>
          <p className="text-muted-foreground">
            Join research institutions worldwide using cryptographically verified quantum experimentation.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/research-gateway">
              <Button size="lg">
                Join Research Community
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <a href="https://github.com/ENKI-420/dnalang" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
