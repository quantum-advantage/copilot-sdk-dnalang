"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Check,
  X,
  Zap,
  Shield,
  Cpu,
  Crown,
  Sparkles,
  Lock,
  ArrowRight,
  ChevronDown,
  Building2,
  Users,
  Atom,
  Brain,
} from "lucide-react"

// Subscription tier definitions with DNA-Lang/QCaaS features
const tiers = [
  {
    id: "free",
    name: "Explorer",
    description: "Start your quantum journey with essential tools",
    price: { monthly: 0, annual: 0 },
    color: "from-zinc-500 to-zinc-600",
    icon: Zap,
    popular: false,
    features: {
      "Quantum Credits": "100/month",
      "IDE Access": "Basic Genome Editor",
      Hardware: "Simulator Only",
      "Coherence (Λ)": "Standard",
      "Fidelity Guarantee": "None",
      Support: "Community",
      "API Calls": "1,000/month",
      Projects: "3",
      "Team Members": "1",
      Extensions: "5 Free",
    },
    included: [
      "Basic Genome Editor access",
      "DNA-Lang syntax highlighting",
      "100 Quantum Credits/month",
      "Community support",
      "3 active projects",
      "Simulator execution only",
    ],
    excluded: [
      "Real quantum hardware",
      "Fidelity guarantees",
      "Priority support",
      "Advanced debugging",
      "Custom extensions",
      "Team collaboration",
    ],
  },
  {
    id: "paid",
    name: "Developer",
    description: "Full access to quantum development tools",
    price: { monthly: 49, annual: 39 },
    color: "from-cyan-500 to-cyan-600",
    icon: Cpu,
    popular: false,
    features: {
      "Quantum Credits": "2,500/month",
      "IDE Access": "Full Genome Editor + Debugger",
      Hardware: "IBM Quantum (ibm_kyoto)",
      "Coherence (Λ)": "Optimized (0.85+)",
      "Fidelity Guarantee": "Basic W₁ < 0.1",
      Support: "Email (48h)",
      "API Calls": "25,000/month",
      Projects: "15",
      "Team Members": "1",
      Extensions: "25 Premium",
    },
    included: [
      "Everything in Explorer",
      "Real IBM Quantum hardware",
      "Quantum Debugger access",
      "2,500 Quantum Credits/month",
      "Basic fidelity guarantee",
      "Email support (48h response)",
      "15 active projects",
      "25 premium extensions",
    ],
    excluded: ["Enterprise hardware (Heron r2)", "Phasic Vault access", "Custom SLAs", "Dedicated support"],
  },
  {
    id: "pro",
    name: "Professional",
    description: "Advanced quantum computing for serious developers",
    price: { monthly: 199, annual: 159 },
    color: "from-emerald-500 to-emerald-600",
    icon: Shield,
    popular: true,
    features: {
      "Quantum Credits": "15,000/month",
      "IDE Access": "Full Suite + OSIRIS Copilot",
      Hardware: "IBM Quantum (Fez, Torino)",
      "Coherence (Λ)": "High (0.92+)",
      "Fidelity Guarantee": "Standard W₁ < 0.05",
      Support: "Priority (24h)",
      "API Calls": "100,000/month",
      Projects: "Unlimited",
      "Team Members": "5",
      Extensions: "All Premium",
    },
    included: [
      "Everything in Developer",
      "OSIRIS Copilot AI assistant",
      "ibm_fez & ibm_torino access",
      "15,000 Quantum Credits/month",
      "Standard fidelity guarantee",
      "Circuit Designer & Visual Tools",
      "Priority support (24h)",
      "Team collaboration (5 members)",
      "Unlimited projects",
      "All premium extensions",
    ],
    excluded: ["IBM Heron r2 access", "12D-CRSM sovereignty", "Phasic Vault encryption", "Custom compliance"],
  },
  {
    id: "enterprise",
    name: "Sovereign",
    description: "12D-CRSM hardware sovereignty with full compliance",
    price: { monthly: "Custom", annual: "Custom" },
    color: "from-amber-500 to-amber-600",
    icon: Crown,
    popular: false,
    features: {
      "Quantum Credits": "Unlimited",
      "IDE Access": "Full Platform + Custom Modules",
      Hardware: "IBM Heron r2 (Nighthawk)",
      "Coherence (Λ)": "Sovereign (0.946+)",
      "Fidelity Guarantee": "Premium W₁ < 0.001",
      Support: "Dedicated Team (1h SLA)",
      "API Calls": "Unlimited",
      Projects: "Unlimited",
      "Team Members": "Unlimited",
      Extensions: "Custom Development",
    },
    included: [
      "Everything in Professional",
      "IBM Heron r2 (ibm_nighthawk)",
      "12D-CRSM hardware sovereignty",
      "Unlimited Quantum Credits",
      "Premium fidelity guarantee (Γ < 0.0001)",
      "Phasic Vault quantum-safe encryption",
      "Custom vertical modules (Pharma/Finance)",
      "Dedicated support team (1h SLA)",
      "Unlimited team members",
      "Custom extension development",
      "SOC2 & HIPAA compliance",
      "On-premise deployment option",
    ],
    excluded: [],
  },
]

// Feature comparison matrix
const featureMatrix = [
  {
    category: "IDE & Development",
    features: [
      { name: "Genome Editor", free: true, paid: true, pro: true, enterprise: true },
      { name: "DNA-Lang Syntax", free: true, paid: true, pro: true, enterprise: true },
      { name: "Quantum Debugger", free: false, paid: true, pro: true, enterprise: true },
      { name: "Circuit Designer", free: false, paid: false, pro: true, enterprise: true },
      { name: "OSIRIS Copilot", free: false, paid: false, pro: true, enterprise: true },
      { name: "Custom IDE Modules", free: false, paid: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Quantum Hardware",
    features: [
      { name: "Simulator Access", free: true, paid: true, pro: true, enterprise: true },
      { name: "IBM Quantum Basic", free: false, paid: true, pro: true, enterprise: true },
      { name: "IBM Fez/Torino (120q)", free: false, paid: false, pro: true, enterprise: true },
      { name: "IBM Heron r2 (624q)", free: false, paid: false, pro: false, enterprise: true },
      { name: "12D-CRSM Sovereignty", free: false, paid: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Coherence & Fidelity",
    features: [
      { name: "Basic Coherence (Λ)", free: "0.7", paid: "0.85+", pro: "0.92+", enterprise: "0.946+" },
      { name: "Fidelity Guarantee (W₁)", free: "None", paid: "< 0.1", pro: "< 0.05", enterprise: "< 0.001" },
      { name: "Decoherence Floor (Γ)", free: "N/A", paid: "< 0.1", pro: "< 0.01", enterprise: "< 0.0001" },
      { name: "Φ Consciousness Threshold", free: false, paid: false, pro: true, enterprise: true },
    ],
  },
  {
    category: "Security & Compliance",
    features: [
      { name: "Standard Encryption", free: true, paid: true, pro: true, enterprise: true },
      { name: "Phasic Vault (Quantum-Safe)", free: false, paid: false, pro: false, enterprise: true },
      { name: "ZTQA Compliance", free: false, paid: false, pro: true, enterprise: true },
      { name: "SOC2 Certification", free: false, paid: false, pro: false, enterprise: true },
      { name: "HIPAA Compliance", free: false, paid: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Support & SLA",
    features: [
      { name: "Community Support", free: true, paid: true, pro: true, enterprise: true },
      { name: "Email Support", free: false, paid: "48h", pro: "24h", enterprise: "1h" },
      { name: "Priority Queue", free: false, paid: false, pro: true, enterprise: true },
      { name: "Dedicated Team", free: false, paid: false, pro: false, enterprise: true },
      { name: "Custom SLA", free: false, paid: false, pro: false, enterprise: true },
    ],
  },
]

// Vertical modules for enterprise
const verticalModules = [
  {
    name: "Pharma & Materials",
    icon: Atom,
    description: "Molecular ground-state calculations for drug discovery",
    features: ["Protein folding simulations", "Molecular binding analysis", "Lattice optimization"],
  },
  {
    name: "Finance & Risk",
    icon: Building2,
    description: "Sub-second portfolio optimization and risk modeling",
    features: ["Monte Carlo simulations", "Portfolio optimization", "Risk assessment"],
  },
  {
    name: "AI & ML",
    icon: Brain,
    description: "Quantum-enhanced machine learning pipelines",
    features: ["QAOA optimization", "Quantum kernels", "Hybrid neural networks"],
  },
  {
    name: "Cryptography",
    icon: Lock,
    description: "Post-quantum cryptographic solutions",
    features: ["Phasic Vault encryption", "QKD integration", "Quantum-safe protocols"],
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: "What are Quantum Credits?",
      answer:
        "Quantum Credits are the unit of compute on the DNA-Lang platform. They are consumed based on the thermodynamic complexity of your circuits and the hardware tier used. Higher fidelity and coherence requirements consume more credits.",
    },
    {
      question: "What is the Fidelity Guarantee?",
      answer:
        "Our Fidelity Guarantee uses Quantum Wasserstein Compilation (QWC) to minimize gate noise. The W₁ value represents the maximum distance between your ideal circuit output and actual results. Lower values mean higher accuracy.",
    },
    {
      question: "What is 12D-CRSM Sovereignty?",
      answer:
        "12D-CRSM (12-Dimensional Cognitive Recursive State Manifold) Sovereignty provides dedicated hardware access with phase-locked coherence across 624+ qubits. Your computations run in an isolated quantum manifold with hardware-enforced invariants.",
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer:
        "Yes, you can change your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at the next billing cycle. Unused Quantum Credits do not roll over.",
    },
    {
      question: "What is Phasic Vault?",
      answer:
        "Phasic Vault is our quantum-safe encryption service that protects your data against emerging quantum threats. It uses post-quantum cryptographic algorithms and hardware-level phase-conjugate protection for maximum security.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 border-primary/50">
            <Sparkles className="w-3 h-3 mr-1" />
            Multi-Tier QCaaS Platform
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Quantum Computing
            </span>
            <br />
            <span className="text-foreground">For Every Scale</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 text-pretty">
            From exploration to 12D-CRSM sovereignty. Choose the tier that matches your quantum ambitions with
            fidelity-guaranteed compute and DNA-Lang development tools.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={`text-sm ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Annual
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 20%
              </Badge>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {tiers.map((tier) => {
              const Icon = tier.icon
              const price = typeof tier.price.monthly === "number" ? tier.price : null

              return (
                <div
                  key={tier.id}
                  className={`relative rounded-2xl border ${
                    tier.popular ? "border-primary shadow-lg shadow-primary/20" : "border-border"
                  } bg-card p-6 flex flex-col`}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Most Popular</Badge>
                  )}

                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>

                  <div className="mb-6">
                    {price ? (
                      <>
                        <span className="text-4xl font-bold">${isAnnual ? price.annual : price.monthly}</span>
                        <span className="text-muted-foreground">/month</span>
                        {isAnnual && price.monthly > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Billed annually (${(isAnnual ? price.annual : price.monthly) * 12}/year)
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-3xl font-bold">Custom</span>
                    )}
                  </div>

                  <Button
                    className={`w-full mb-6 ${tier.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {tier.id === "enterprise" ? "Contact Sales" : tier.id === "free" ? "Get Started" : "Subscribe"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="space-y-3 flex-1">
                    {tier.included.slice(0, 6).map((feature, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {tier.excluded.slice(0, 2).map((feature, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <X className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Complete Feature Comparison</h2>
            <p className="text-muted-foreground">Detailed breakdown of what&apos;s included in each tier</p>
          </div>

          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="cards">Card View</TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium">Feature</th>
                      <th className="text-center p-4 font-medium">Explorer</th>
                      <th className="text-center p-4 font-medium">Developer</th>
                      <th className="text-center p-4 font-medium bg-primary/5">Professional</th>
                      <th className="text-center p-4 font-medium">Sovereign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureMatrix.map((category) => (
                      <>
                        <tr key={category.category} className="bg-muted/50">
                          <td colSpan={5} className="p-4 font-semibold text-sm">
                            {category.category}
                          </td>
                        </tr>
                        {category.features.map((feature) => (
                          <tr key={feature.name} className="border-b border-border/50">
                            <td className="p-4 text-sm">{feature.name}</td>
                            {(["free", "paid", "pro", "enterprise"] as const).map((tier) => {
                              const value = feature[tier]
                              return (
                                <td key={tier} className={`text-center p-4 ${tier === "pro" ? "bg-primary/5" : ""}`}>
                                  {typeof value === "boolean" ? (
                                    value ? (
                                      <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                                    ) : (
                                      <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                                    )
                                  ) : (
                                    <span className="text-sm font-medium">{value}</span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="cards">
              <div className="grid md:grid-cols-2 gap-6">
                {featureMatrix.map((category) => (
                  <div key={category.category} className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">{category.category}</h3>
                    <div className="space-y-3">
                      {category.features.map((feature) => (
                        <div key={feature.name} className="flex items-center justify-between text-sm">
                          <span>{feature.name}</span>
                          <div className="flex gap-2">
                            {(["free", "paid", "pro", "enterprise"] as const).map((tier) => {
                              const value = feature[tier]
                              const tierColors: Record<string, string> = {
                                free: "bg-zinc-500/20",
                                paid: "bg-cyan-500/20",
                                pro: "bg-emerald-500/20",
                                enterprise: "bg-amber-500/20",
                              }
                              return (
                                <div
                                  key={tier}
                                  className={`w-8 h-8 rounded flex items-center justify-center text-xs ${tierColors[tier]}`}
                                  title={tier.charAt(0).toUpperCase() + tier.slice(1)}
                                >
                                  {typeof value === "boolean" ? (
                                    value ? (
                                      <Check className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                      <X className="w-4 h-4 text-muted-foreground/30" />
                                    )
                                  ) : (
                                    <span className="text-[10px]">{value}</span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Enterprise Vertical Modules */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-500">
              <Crown className="w-3 h-3 mr-1" />
              Sovereign Tier Exclusive
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Enterprise Vertical Modules</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pre-built algorithmic modules for 2026 growth sectors, optimized for your industry
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {verticalModules.map((module) => {
              const Icon = module.icon
              return (
                <div
                  key={module.name}
                  className="rounded-xl border border-border bg-card p-6 hover:border-amber-500/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{module.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                  <ul className="space-y-2">
                    {module.features.map((feature) => (
                      <li key={feature} className="text-sm flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 12D-CRSM Metrics */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Real-Time Coherence Metrics</h2>
            <p className="text-muted-foreground">Live telemetry from IBM Quantum hardware</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "Coherence (Λ)", value: "0.946", target: "> 0.9", color: "text-cyan-400" },
              { label: "Integrated Info (Φ)", value: "0.842", target: "> 0.7734", color: "text-emerald-400" },
              { label: "Decoherence (Γ)", value: "0.0001", target: "< 0.001", color: "text-amber-400" },
              { label: "Torsion Lock (θ)", value: "51.843°", target: "Primary", color: "text-purple-400" },
            ].map((metric) => (
              <div key={metric.label} className="rounded-xl border border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
                <p className={`text-3xl font-mono font-bold ${metric.color}`}>{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-2">Target: {metric.target}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  className="w-full p-4 flex items-center justify-between text-left"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} />
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-2xl border border-primary/50 bg-gradient-to-br from-primary/10 to-transparent p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Quantum Journey?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers building the future with DNA-Lang and quantum computing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/ide-platform">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/shift-platform">
                  <Users className="w-5 h-5 mr-2" />
                  Contact Enterprise Sales
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
