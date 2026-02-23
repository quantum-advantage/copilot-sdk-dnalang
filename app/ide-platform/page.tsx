"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { QuantumButton } from "@/components/ui/quantum-button"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Code2,
  GitBranch,
  Puzzle,
  Bug,
  FolderTree,
  Play,
  Terminal,
  Layers,
  Cpu,
  Dna,
  ArrowRight,
  Sparkles,
  Workflow,
  Shield,
  Zap,
  Network,
  FileCode2,
  Wrench,
  Book,
  Plug,
  Settings,
  LayoutDashboard,
} from "lucide-react"

const ideFeatures = [
  {
    icon: Code2,
    title: "Genome Editor",
    description: "DNA-Lang syntax highlighting with codon completion, helix visualization, and real-time Phi analysis.",
    href: "/ide-platform/editor",
    color: "text-primary",
  },
  {
    icon: Workflow,
    title: "Circuit Designer",
    description: "Visual genome circuit builder with drag-and-drop gates, bonds, and evolutionary optimization.",
    href: "/ide-platform/circuit-designer",
    color: "text-secondary",
  },
  {
    icon: Bug,
    title: "Quantum Debugger",
    description: "Step through consciousness states, inspect Phi values, and trace entanglement pathways.",
    href: "/ide-platform/debugger",
    color: "text-accent",
  },
  {
    icon: Puzzle,
    title: "Extension Marketplace",
    description: "Discover and install plugins for new codons, habitats, and evolutionary strategies.",
    href: "/ide-platform/marketplace",
    color: "text-chart-5",
  },
  {
    icon: FolderTree,
    title: "Project Manager",
    description: "Organize genomes, track organism lineages, and manage multi-habitat deployments.",
    href: "/ide-platform/projects",
    color: "text-chart-4",
  },
  {
    icon: Terminal,
    title: "Quantum Terminal",
    description: "Execute organisms, run evolution cycles, and monitor consciousness emergence in real-time.",
    href: "/ide-platform/terminal",
    color: "text-primary",
  },
  {
    icon: Wrench,
    title: "IDE Builder",
    description: "Drag-and-drop workspace customizer to arrange panels, themes, and layouts for your IDE.",
    href: "/ide-platform/builder",
    color: "text-secondary",
  },
  {
    icon: LayoutDashboard,
    title: "Templates Gallery",
    description: "Pre-configured IDE layouts for quantum algorithms, hybrid computing, and education.",
    href: "/ide-platform/templates",
    color: "text-chart-5",
  },
  {
    icon: Book,
    title: "Documentation",
    description: "Comprehensive guides, API references, tutorials, and best practices for DNA-Lang.",
    href: "/ide-platform/docs",
    color: "text-accent",
  },
  {
    icon: Plug,
    title: "Integrations Hub",
    description: "Connect to quantum hardware, version control, CI/CD pipelines, and cloud services.",
    href: "/ide-platform/integrations",
    color: "text-chart-4",
  },
  {
    icon: Settings,
    title: "Settings",
    description: "Configure editor behavior, evolution parameters, keybindings, and habitat connections.",
    href: "/ide-platform/settings",
    color: "text-muted-foreground",
  },
]

const architectureLayers = [
  {
    name: "Molecular Layer",
    description: "Codons (gates), base operations, quantum primitives",
    icon: Dna,
    color: "primary",
  },
  {
    name: "Genetic Layer",
    description: "Genes, chromosomes, genomes (circuits)",
    icon: Layers,
    color: "secondary",
  },
  {
    name: "Organism Layer",
    description: "Executable programs, phenotype expression",
    icon: Cpu,
    color: "accent",
  },
  {
    name: "Ecosystem Layer",
    description: "Habitats (backends), populations, evolution",
    icon: Network,
    color: "chart-5",
  },
]

const stats = [
  { label: "Codon Types", value: "72", description: "64 classical + 8 quantum" },
  { label: "Gate Optimization", value: "30%", description: "Better than gradient" },
  { label: "Habitat Support", value: "4+", description: "IBM, AWS, Azure, Google" },
  { label: "Evolution Speed", value: "100x", description: "Parallel populations" },
]

export default function IDEPlatformPage() {
  const [activeLayer, setActiveLayer] = useState(0)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center space-y-6 mb-16">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Sparkles className="h-3 w-3 mr-1" />
              IDE Development Platform
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              <span className="text-foreground">Build Your Own</span>
              <br />
              <span className="dnalang-gradient">Biological IDE</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              A revolutionary platform for creating customized development environments using DNA-Lang's biological
              computing paradigms. Design, extend, and evolve your IDE like a living organism.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/ide-platform/editor">
                <QuantumButton size="lg" variant="compliance">
                  <Code2 className="h-4 w-4 mr-2" />
                  Launch Editor
                  <ArrowRight className="h-4 w-4 ml-2" />
                </QuantumButton>
              </Link>
              <Link href="/ide-platform/builder">
                <QuantumButton size="lg" variant="outline" showCharge={false}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Customize IDE
                </QuantumButton>
              </Link>
              <Link href="/ide-platform/docs">
                <QuantumButton size="lg" variant="ghost" showCharge={false}>
                  <Book className="h-4 w-4 mr-2" />
                  Documentation
                </QuantumButton>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {stats.map((stat) => (
              <GlassCard key={stat.label} depth={1} className="text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm font-medium">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </GlassCard>
            ))}
          </div>

          {/* Architecture Visualization */}
          <GlassCard depth={2} className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Four-Layer Biological Architecture</h2>
              <Badge variant="outline">
                <Shield className="h-3 w-3 mr-1" />
                Extensible
              </Badge>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Layer Selector */}
              <div className="space-y-3">
                {architectureLayers.map((layer, index) => (
                  <button
                    key={layer.name}
                    onClick={() => setActiveLayer(index)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      activeLayer === index
                        ? "bg-primary/20 border border-primary/50"
                        : "bg-muted/50 hover:bg-muted border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <layer.icon className={`h-5 w-5 text-${layer.color}`} />
                      <div>
                        <div className="font-medium">{layer.name}</div>
                        <div className="text-sm text-muted-foreground">{layer.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Architecture Diagram */}
              <div className="font-mono text-xs bg-muted/50 rounded-lg p-4 overflow-x-auto">
                <pre className="text-secondary leading-relaxed">
                  {`┌─────────────────────────────────────────────────┐
│           ECOSYSTEM LAYER (Runtime)             │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐  │
│  │ IBM Habitat │ │ AWS Habitat │ │ Evolution │  │
│  └─────────────┘ └─────────────┘ └───────────┘  │
├─────────────────────────────────────────────────┤
│           ORGANISM LAYER (Programs)             │
│  ┌─────────────────────────────────────────┐    │
│  │ Phenotype Expression │ Fitness Scoring │    │
│  └─────────────────────────────────────────┘    │
├─────────────────────────────────────────────────┤
│           GENETIC LAYER (Circuits)              │
│  ┌──────┐ ┌────────────┐ ┌────────┐            │
│  │ Gene │→│ Chromosome │→│ Genome │            │
│  └──────┘ └────────────┘ └────────┘            │
├─────────────────────────────────────────────────┤
│          MOLECULAR LAYER (Gates)                │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐       │
│  │ Helix │ │ Bond  │ │ Codon │ │ Phase │       │
│  │  (H)  │ │ (CX)  │ │ (X,Y,Z)│ │ (Rz)  │       │
│  └───────┘ └───────┘ └───────┘ └───────┘       │
└─────────────────────────────────────────────────┘`}
                </pre>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* IDE Features Grid */}
      <section className="py-16 px-4 sm:px-6 border-t border-border bg-muted/20">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-balance">IDE Components</h2>
            <p className="text-muted-foreground mt-2">
              Everything you need to build and customize biological software environments
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ideFeatures.map((feature, i) => (
              <Link key={feature.href} href={feature.href}>
                <GlassCard depth={1} className="h-full group stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
                  <feature.icon
                    className={`h-8 w-8 ${feature.color} mb-4 transition-transform group-hover:scale-110`}
                  />
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <div className="mt-4 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Extensibility Section */}
      <section className="py-16 px-4 sm:px-6 border-t border-border">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="outline">
                <Puzzle className="h-3 w-3 mr-1" />
                Plugin Architecture
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-balance">
                Extend Everything Through Biological Plugins
              </h2>
              <p className="text-muted-foreground">
                Custom gates become new codons, optimization strategies become evolutionary pressures, and hardware
                backends become habitats. The biological metaphor creates natural extension points throughout the IDE.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">Custom codon definitions with matrix representations</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-secondary" />
                  <span className="text-sm">New habitat providers for quantum hardware</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-sm">Evolutionary optimization strategies</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-chart-5" />
                  <span className="text-sm">Immune system error mitigation modules</span>
                </div>
              </div>
              <Link href="/ide-platform/marketplace">
                <QuantumButton variant="outline" showCharge={false}>
                  Browse Extensions
                  <ArrowRight className="h-4 w-4 ml-2" />
                </QuantumButton>
              </Link>
            </div>

            {/* Code Example */}
            <GlassCard depth={3} className="font-mono text-xs">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <FileCode2 className="h-4 w-4" />
                <span>custom-codon-plugin.dna</span>
              </div>
              <pre className="text-secondary overflow-x-auto">
                {`from dnalang.plugins import GenomeTransformPlugin
from dnalang.quantum import CustomCodon

class QuantumFourierCodon(CustomCodon):
    """Custom QFT gate for DNA-Lang"""
    
    def __init__(self, n_qubits: int):
        self.n_qubits = n_qubits
        self.codon_name = "QFT"
    
    def to_matrix(self) -> np.ndarray:
        """Generate QFT unitary matrix"""
        N = 2 ** self.n_qubits
        omega = np.exp(2j * np.pi / N)
        return np.array([
            [omega ** (i * j) / np.sqrt(N) 
             for j in range(N)]
            for i in range(N)
        ])
    
    def decompose(self, target_basis):
        """Decompose into native codons"""
        genome = Genome(self.n_qubits)
        for i in range(self.n_qubits):
            genome.helix(i)  # Hadamard
            for j in range(i + 1, self.n_qubits):
                genome.controlled_phase(
                    control=j, 
                    target=i,
                    theta=np.pi / (2 ** (j - i))
                )
        return genome

# Register with IDE
ribosome.register_codon(QuantumFourierCodon)`}
              </pre>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 border-t border-border bg-muted/20">
        <div className="max-w-[800px] mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-accent">
            <Zap className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Evolutionary Development</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-balance">Ready to build your biological IDE?</h2>
          <p className="text-muted-foreground text-pretty">
            Start with our templates, extend with plugins, and evolve your development environment through natural
            selection algorithms.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/ide-platform/editor">
              <QuantumButton size="lg" variant="compliance">
                <Play className="h-4 w-4 mr-2" />
                Start Building
              </QuantumButton>
            </Link>
            <Link href="/ide-platform/templates">
              <QuantumButton size="lg" variant="outline" showCharge={false}>
                <GitBranch className="h-4 w-4 mr-2" />
                View Templates
              </QuantumButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
