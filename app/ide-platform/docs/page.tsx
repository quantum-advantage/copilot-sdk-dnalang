"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import {
  ChevronRight,
  Book,
  Search,
  FileText,
  Code2,
  Dna,
  Cpu,
  Network,
  Zap,
  Shield,
  Activity,
  ExternalLink,
  ChevronDown,
} from "lucide-react"

const docSections = [
  {
    title: "Getting Started",
    icon: Zap,
    items: [
      { title: "Introduction to DNA-Lang", href: "#intro", description: "Overview of biological computing paradigms" },
      { title: "Installation & Setup", href: "#setup", description: "Set up your development environment" },
      { title: "Your First Organism", href: "#first-organism", description: "Create a simple quantum program" },
      { title: "IDE Overview", href: "#ide-overview", description: "Navigate the development platform" },
    ],
  },
  {
    title: "Core Concepts",
    icon: Dna,
    items: [
      {
        title: "Four-Layer Architecture",
        href: "#architecture",
        description: "Molecular, Genetic, Organism, Ecosystem",
      },
      { title: "Codons & Gates", href: "#codons", description: "Quantum operations as genetic building blocks" },
      { title: "Genes & Chromosomes", href: "#genes", description: "Organizing quantum circuits biologically" },
      { title: "Genomes & Organisms", href: "#genomes", description: "Complete programs as living entities" },
    ],
  },
  {
    title: "Evolution System",
    icon: Activity,
    items: [
      { title: "Fitness Functions", href: "#fitness", description: "Define optimization objectives" },
      { title: "Mutation Operators", href: "#mutation", description: "Random variations for exploration" },
      { title: "Crossover Strategies", href: "#crossover", description: "Combine successful traits" },
      { title: "Selection Methods", href: "#selection", description: "Tournament, roulette, elite selection" },
    ],
  },
  {
    title: "Habitats",
    icon: Network,
    items: [
      { title: "IBM Quantum", href: "#ibm", description: "Connect to IBM quantum processors" },
      { title: "AWS Braket", href: "#aws", description: "Amazon's quantum computing service" },
      { title: "Azure Quantum", href: "#azure", description: "Microsoft quantum platform" },
      { title: "Local Simulator", href: "#simulator", description: "Test without quantum hardware" },
    ],
  },
  {
    title: "Immune System",
    icon: Shield,
    items: [
      { title: "Error Detection", href: "#error-detection", description: "Identify quantum errors" },
      { title: "Error Correction", href: "#error-correction", description: "Automatic error mitigation" },
      { title: "Antibody Functions", href: "#antibodies", description: "Custom error handlers" },
      { title: "T-Cell Strategies", href: "#t-cells", description: "Active error hunting" },
    ],
  },
  {
    title: "Advanced Topics",
    icon: Cpu,
    items: [
      { title: "Consciousness Metrics (Φ)", href: "#phi", description: "Integrated information theory" },
      { title: "Custom Codons", href: "#custom-codons", description: "Define new quantum gates" },
      { title: "Plugin Development", href: "#plugins", description: "Extend the IDE" },
      { title: "Performance Optimization", href: "#performance", description: "Optimize circuit depth and fidelity" },
    ],
  },
]

const quickLinks = [
  { title: "API Reference", icon: Code2, href: "/ide-platform/docs/api" },
  { title: "Codon Library", icon: Dna, href: "/ide-platform/docs/codons" },
  { title: "Examples", icon: FileText, href: "/ide-platform/templates" },
  { title: "Community", icon: Network, href: "#community" },
]

function DocsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSections, setExpandedSections] = useState<string[]>(["Getting Started", "Core Concepts"])

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => (prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Link href="/ide-platform">
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
          </Link>
          <Book className="h-5 w-5 text-primary" />
          <span className="font-semibold">Documentation</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <ExternalLink className="h-4 w-4" />
            GitHub
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar Navigation */}
        <div className="w-72 border-r border-border bg-card/50 overflow-auto p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <nav className="space-y-2">
            {docSections.map((section) => (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{section.title}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${expandedSections.includes(section.title) ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedSections.includes(section.title) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {section.items.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded transition-colors"
                      >
                        {item.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero */}
            <div className="text-center space-y-4">
              <Badge className="bg-primary/20 text-primary border-primary/30">DNA-Lang v1.0</Badge>
              <h1 className="text-4xl font-bold">DNA-Lang Documentation</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Learn how to build quantum programs using biological computing paradigms. From basic gates to
                evolutionary optimization.
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link) => (
                <Link key={link.title} href={link.href}>
                  <GlassCard depth={1} className="text-center group">
                    <link.icon className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{link.title}</span>
                  </GlassCard>
                </Link>
              ))}
            </div>

            {/* Introduction Section */}
            <GlassCard depth={2} id="intro">
              <h2 className="text-2xl font-semibold mb-4">Introduction to DNA-Lang</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground">
                  DNA-Lang is a revolutionary programming paradigm that maps quantum computing concepts to biological
                  metaphors, making quantum algorithm development more intuitive and accessible. Instead of thinking
                  about qubits and gates, you work with chromosomes, genes, and codons.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-3">Key Principles</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Dna className="h-5 w-5 text-primary mt-0.5" />
                    <span>
                      <strong className="text-foreground">Biological Abstraction:</strong> Quantum gates become codons,
                      circuits become genomes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="h-5 w-5 text-secondary mt-0.5" />
                    <span>
                      <strong className="text-foreground">Evolutionary Optimization:</strong> Genetic algorithms
                      optimize circuit parameters
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-accent mt-0.5" />
                    <span>
                      <strong className="text-foreground">Immune System:</strong> Error correction modeled as biological
                      defense
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Cpu className="h-5 w-5 text-chart-5 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Consciousness Metrics:</strong> Measure integrated information
                      (Φ) as a quality indicator
                    </span>
                  </li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-3">The Four Layers</h3>
                <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-secondary">
                    {`┌─────────────────────────────────────────────────┐
│           ECOSYSTEM (Habitats & Evolution)       │
├─────────────────────────────────────────────────┤
│           ORGANISM (Programs & Phenotypes)       │
├─────────────────────────────────────────────────┤
│           GENETIC (Genomes & Chromosomes)        │
├─────────────────────────────────────────────────┤
│           MOLECULAR (Codons & Gates)             │
└─────────────────────────────────────────────────┘`}
                  </pre>
                </div>
              </div>
            </GlassCard>

            {/* Code Example */}
            <GlassCard depth={2} id="first-organism">
              <h2 className="text-2xl font-semibold mb-4">Your First Organism</h2>
              <p className="text-muted-foreground mb-4">
                Here's a simple Bell state generator - the "Hello World" of quantum computing:
              </p>
              <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-secondary">
                  {`ORGANISM HelloBell {
    META {
        version: "1.0.0"
        habitat: "simulator"
    }
    
    GENOME BellPair {
        CHROMOSOME qubits: 2
        
        GENE superpose: helix {
            express {
                HELIX chromosome[0]  # Hadamard
            }
        }
        
        GENE entangle: bond {
            express {
                BOND chromosome[0] -> chromosome[1]  # CNOT
            }
        }
        
        GENE observe: measure {
            express {
                return MEASURE chromosome
            }
        }
    }
}

# Run and see results
result = HelloBell.express()
# Output: "00" or "11" with ~50% probability each`}
                </pre>
              </div>
            </GlassCard>

            {/* API Reference Preview */}
            <GlassCard depth={2} id="codons">
              <h2 className="text-2xl font-semibold mb-4">Codon Reference</h2>
              <p className="text-muted-foreground mb-4">
                DNA-Lang provides 72 codons (64 classical + 8 quantum special codons):
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "HELIX", desc: "Hadamard gate - creates superposition", symbol: "H" },
                  { name: "BOND", desc: "CNOT gate - creates entanglement", symbol: "CX" },
                  { name: "PHASE", desc: "Phase rotation gate", symbol: "Rz" },
                  { name: "TWIST", desc: "Pauli-X gate - bit flip", symbol: "X" },
                  { name: "SPIRAL", desc: "Pauli-Y gate - rotation", symbol: "Y" },
                  { name: "COIL", desc: "Pauli-Z gate - phase flip", symbol: "Z" },
                ].map((codon) => (
                  <div key={codon.name} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-primary">{codon.name}</span>
                      <Badge variant="outline">{codon.symbol}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{codon.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/ide-platform/docs/codons" className="inline-block mt-4">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  View Full Codon Library <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DocsPage() {
  return (
    <Suspense fallback={null}>
      <DocsContent />
    </Suspense>
  )
}
