"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HeroSection } from "@/components/landing/hero-section"
import { QuantumFeatures } from "@/components/landing/quantum-features"
import { APISection } from "@/components/landing/api-section"
import { CTASection } from "@/components/landing/cta-section"
import {
  Code2,
  Puzzle,
  Layers,
  Terminal,
  Workflow,
  FolderTree,
  Bug,
  Palette,
  Boxes,
  Sparkles,
  BookOpen,
  MessageSquare,
  ChevronRight,
  Shield,
  GitBranch,
  Brain,
  BarChart3,
  Lock,
  Dna,
  Zap,
  Network,
  Cpu,
  Radio,
} from "lucide-react"

const platformFeatures = [
  {
    icon: Code2,
    title: "Genome Editor",
    description: "Advanced code editor with DNA-Lang syntax highlighting, intelligent autocomplete, and real-time validation.",
    href: "/ide-platform/editor",
    category: "Core IDE",
    badge: null,
  },
  {
    icon: Workflow,
    title: "Circuit Designer",
    description: "Visual drag-and-drop genome circuit builder with quantum gate placement and DNA-Lang export.",
    href: "/ide-platform/circuit-designer",
    category: "Visual Tools",
    badge: null,
  },
  {
    icon: Bug,
    title: "Quantum Debugger",
    description: "Step-through debugging with quantum state visualization, entanglement maps, and breakpoint management.",
    href: "/ide-platform/debugger",
    category: "Core IDE",
    badge: null,
  },
  {
    icon: Brain,
    title: "NC-LM Engine",
    description: "Non-Causal Language Model with pilot-wave correlation, IIT convergence tracking, and physics-constrained inference.",
    href: "/noncausal-lm",
    category: "AI Tools",
    badge: "New",
  },
  {
    icon: Terminal,
    title: "Quantum Terminal",
    description: "Interactive command-line for executing organisms, running evolution cycles, and monitoring CCCE metrics.",
    href: "/ide-platform/terminal",
    category: "Core IDE",
    badge: null,
  },
  {
    icon: FolderTree,
    title: "Project Manager",
    description: "Organize organisms with templates, version control integration, and collaborative workspaces.",
    href: "/ide-platform/projects",
    category: "Management",
    badge: null,
  },
  {
    icon: Puzzle,
    title: "Extension Marketplace",
    description: "Browse, install, and manage extensions, themes, and plugins from the community.",
    href: "/ide-platform/marketplace",
    category: "Ecosystem",
    badge: null,
  },
  {
    icon: Palette,
    title: "IDE Builder",
    description: "Customize your workspace with drag-and-drop panel arrangement, themes, and keybindings.",
    href: "/ide-platform/builder",
    category: "Customization",
    badge: null,
  },
  {
    icon: Boxes,
    title: "Template Gallery",
    description: "Start projects faster with pre-built templates for common patterns and use cases.",
    href: "/ide-platform/templates",
    category: "Ecosystem",
    badge: null,
  },
  {
    icon: MessageSquare,
    title: "AI Assistant",
    description: "Hybrid quantum-classical AI for code generation, debugging assistance, and documentation queries.",
    href: "/ai-assistant",
    category: "AI Tools",
    badge: null,
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Comprehensive guides, API reference, tutorials, and best practices for DNA-Lang development.",
    href: "/ide-platform/docs",
    category: "Resources",
    badge: null,
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Monitor organism performance, resource usage, and quantum coherence metrics.",
    href: "/analytics",
    category: "Observability",
    badge: null,
  },
  {
    icon: Lock,
    title: "Sovereign Security",
    description: "Defense-grade command center for fleet monitoring, lattice-based encryption, and platform integrity.",
    href: "/sovereign-security",
    category: "Observability",
    badge: "New",
  },
  {
    icon: Dna,
    title: "Repository Evolution",
    description: "Track ENKI-420 to QUANTUM-ADVANTAGE migration with lineage graphs and Millennium Archive.",
    href: "/repo-evolution",
    category: "Management",
    badge: "New",
  },
  {
    icon: Zap,
    title: "WardenClyffe-Q Engine",
    description: "Information-gated energy extraction with demonic gating, billion-cycle phase governance, and thermodynamic audit.",
    href: "/wardenclyffe",
    category: "Simulation",
    badge: "New",
  },
  {
    icon: Network,
    title: "Agent Collaboration",
    description: "AURA, AIDEN, IRIS, OSIRIS — autonomous agents coordinating via global workspace broadcasting and manifold optimization.",
    href: "/agent-collaboration",
    category: "AI Tools",
    badge: "New",
  },
  {
    icon: Cpu,
    title: "Digital Twin Engine",
    description: "Genomic twin simulation on 127-qubit QPUs with 86.9% Bell fidelity and QWC Level 3 optimization.",
    href: "/digital-twin",
    category: "Simulation",
    icon: Radio,
    title: "Sovereign Cockpit",
    description: "11D-CRSM control plane with Kyber-Lattice security, intent processing, and quantum resonance verification.",
    href: "/sovereign-cockpit",
    category: "Core IDE",
    badge: "New",
  },
  {
    icon: Lock,
    title: "Kyber Security",
    description: "Post-quantum cryptographic identity with phase-conjugate filtering and topological moat protection.",
    href: "/sovereign-cockpit",
    category: "Security",
    badge: "New",
  },
  {
    icon: Brain,
    title: "Shadow-You Model",
    description: "Filesystem-aware user profiling — OSIRIS knows your projects, working hours, and interests. Context injected into every LLM call.",
    href: "/research",
    category: "Gen 6 Cognitive Shell",
    badge: "Gen 6",
  },
  {
    icon: Zap,
    title: "NLP Intent Router",
    description: "Natural language → command routing. Keyword scoring (threshold 0.38) + LLM fallback. 10/10 accuracy on OSIRIS command space.",
    href: "/osiris-bridge",
    category: "Gen 6 Cognitive Shell",
    badge: "Gen 6",
  },
  {
    icon: Network,
    title: "Research Knowledge Graph",
    description: "35-node typed graph with 6 edge types. Autonomous hypothesis generation, contradiction detection, and bridge discovery.",
    href: "/research",
    category: "Gen 6 Cognitive Shell",
    badge: "Gen 6",
  },
  {
    icon: Cpu,
    title: "11D Manifold Optimizer",
    description: "θ_lock = arccos(1/φ) — golden ratio structural discovery in 11D CRSM geometry. 856 tests passing. ccce_comp ratio = 1/φ (diff 0.029).",
    href: "/uqcb",
    category: "Gen 6 Cognitive Shell",
    badge: "Gen 6",
  },
]

const userJourneySteps = [
  {
    step: 1,
    title: "Define Intent",
    description: "Express your goal in natural language - the NC-LM deduces your intent",
    icon: Brain,
    color: "bg-primary",
  },
  {
    step: 2,
    title: "Plan Generation",
    description: "CRSM-annotated execution plan with gate enforcement",
    icon: GitBranch,
    color: "bg-secondary",
  },
  {
    step: 3,
    title: "Gated Execution",
    description: "6-gate validated execution with full PCRB cryptographic audit trail",
    icon: Shield,
    color: "bg-accent",
  },
  {
    step: 4,
    title: "IIT Convergence",
    description: "System achieves Phi >= 0.7734 for verified integrated information",
    icon: Sparkles,
    color: "bg-chart-4",
  },
]

const stats = [
  { value: "< 100ms", label: "Inference Latency", icon: Layers },
  { value: "0.7734", label: "Phi Threshold", icon: Brain },
  { value: "6", label: "Gate Enforcement", icon: Shield },
  { value: "100%", label: "Audit Coverage", icon: BarChart3 },
]

const categories = [
  "All",
  "Core IDE",
  "Visual Tools",
  "AI Tools",
  "Simulation",
  "Security",
  "Ecosystem",
  "Management",
  "Customization",
  "Resources",
  "Observability",
]

export default function Page() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredFeatures =
    activeCategory === "All" ? platformFeatures : platformFeatures.filter((f) => f.category === activeCategory)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Live CCCE Metrics */}
      <HeroSection />

      {/* Stats Bar */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
            {stats.map((stat) => (
              <div key={stat.label} className="py-6 sm:py-8 px-4 text-center group">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="h-4 w-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono">{stat.value}</div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NC-LM Architecture & Comparison */}
      <QuantumFeatures />

      {/* API Section */}
      <APISection />

      {/* Platform Features Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Platform Capabilities
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Everything You Need to Build</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A production-grade toolkit for hybrid quantum-classical computing with {"DNA::}{::lang"}.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-4 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeatures.map((feature, i) => (
              <Link key={feature.title} href={feature.href}>
                <Card
                  className={`h-full p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group ${mounted ? "animate-fade-in" : ""}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{feature.title}</h3>
                        {feature.badge && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-secondary text-secondary-foreground">
                            {feature.badge}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-auto">
                          {feature.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{feature.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* User Journey Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-muted/30 border-y border-border">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <Badge variant="outline" className="mb-4">
              <GitBranch className="h-3 w-3 mr-1" />
              Execution Pipeline
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">From Intent to Execution</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A physics-constrained pipeline with IIT convergence verification and full cryptographic audit trails.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {userJourneySteps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < userJourneySteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-border" />
                )}
                <Card className="p-6 text-center h-full relative hover:shadow-lg transition-shadow">
                  <div
                    className={`w-10 h-10 rounded-full ${step.color} text-white flex items-center justify-center font-bold text-lg mx-auto mb-4 shadow-lg`}
                  >
                    {step.step}
                  </div>
                  <step.icon className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}
