"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantumButton } from "@/components/ui/quantum-button"
import {
  Search,
  Download,
  Star,
  ChevronRight,
  Puzzle,
  Cpu,
  Dna,
  Atom,
  Sparkles,
  Shield,
  Activity,
  Network,
  FlaskConical,
  GitBranch,
  Check,
  Users,
} from "lucide-react"

const categories = [
  { id: "all", label: "All", icon: Puzzle },
  { id: "codons", label: "Codons", icon: Dna },
  { id: "habitats", label: "Habitats", icon: Cpu },
  { id: "evolution", label: "Evolution", icon: Sparkles },
  { id: "immunity", label: "Immunity", icon: Shield },
  { id: "visualization", label: "Visualization", icon: Activity },
]

const extensions = [
  {
    id: "qft-codon",
    name: "Quantum Fourier Transform",
    description: "QFT codon with automatic decomposition into native gates. Supports arbitrary qubit counts.",
    author: "DNA-Lang Core",
    downloads: 12847,
    rating: 4.9,
    category: "codons",
    verified: true,
    tags: ["qft", "transform", "core"],
    icon: Atom,
    color: "primary",
    installed: true,
  },
  {
    id: "ibm-habitat",
    name: "IBM Quantum Habitat",
    description:
      "Full IBM Quantum provider integration with all available backends including Brisbane, Osaka, and Kyoto.",
    author: "IBM Quantum",
    downloads: 28439,
    rating: 4.8,
    category: "habitats",
    verified: true,
    tags: ["ibm", "hardware", "cloud"],
    icon: Network,
    color: "secondary",
    installed: true,
  },
  {
    id: "grover-evolution",
    name: "Grover Optimizer",
    description:
      "Evolutionary optimization using Grover's algorithm for amplitude amplification. 20-30% improvement over gradient methods.",
    author: "Quantum Research Lab",
    downloads: 8923,
    rating: 4.7,
    category: "evolution",
    verified: true,
    tags: ["optimization", "grover", "search"],
    icon: Sparkles,
    color: "accent",
    installed: false,
  },
  {
    id: "zne-immunity",
    name: "Zero-Noise Extrapolation",
    description: "Advanced error mitigation using ZNE with Richardson and exponential extrapolation methods.",
    author: "Error Correction Team",
    downloads: 15672,
    rating: 4.9,
    category: "immunity",
    verified: true,
    tags: ["error", "mitigation", "noise"],
    icon: Shield,
    color: "chart-5",
    installed: false,
  },
  {
    id: "bloch-viz",
    name: "Bloch Sphere Visualizer",
    description: "Interactive 3D Bloch sphere visualization for single-qubit states with animation support.",
    author: "Viz Labs",
    downloads: 9234,
    rating: 4.6,
    category: "visualization",
    verified: false,
    tags: ["visualization", "3d", "states"],
    icon: Activity,
    color: "chart-4",
    installed: false,
  },
  {
    id: "aws-habitat",
    name: "AWS Braket Habitat",
    description: "Connect to AWS Braket quantum computing service. Supports IonQ, Rigetti, IQM, and QuEra backends.",
    author: "AWS Quantum",
    downloads: 19283,
    rating: 4.7,
    category: "habitats",
    verified: true,
    tags: ["aws", "braket", "cloud"],
    icon: Cpu,
    color: "secondary",
    installed: false,
  },
  {
    id: "vqe-metabolic",
    name: "VQE Metabolic Pathway",
    description:
      "Variational Quantum Eigensolver implementation as a metabolic pathway with automatic ansatz selection.",
    author: "Chemistry Division",
    downloads: 7829,
    rating: 4.8,
    category: "codons",
    verified: true,
    tags: ["vqe", "chemistry", "variational"],
    icon: FlaskConical,
    color: "primary",
    installed: false,
  },
  {
    id: "genetic-crossover",
    name: "Advanced Crossover Operators",
    description: "Collection of genetic crossover operators: uniform, single-point, two-point, and quantum-inspired.",
    author: "Evolution Lab",
    downloads: 5423,
    rating: 4.5,
    category: "evolution",
    verified: false,
    tags: ["genetic", "crossover", "operators"],
    icon: GitBranch,
    color: "accent",
    installed: false,
  },
]

function MarketplaceContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [installedFilter, setInstalledFilter] = useState<"all" | "installed" | "available">("all")

  const filteredExtensions = extensions.filter((ext) => {
    const matchesSearch =
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = activeCategory === "all" || ext.category === activeCategory

    const matchesInstalled =
      installedFilter === "all" ||
      (installedFilter === "installed" && ext.installed) ||
      (installedFilter === "available" && !ext.installed)

    return matchesSearch && matchesCategory && matchesInstalled
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/ide-platform">
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
            </Link>
            <Puzzle className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Extension Marketplace</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Discover and install plugins to extend your DNA-Lang IDE with new codons, habitats, and capabilities.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search extensions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 shrink-0">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">Categories</h3>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">Filter</h3>
              <button
                onClick={() => setInstalledFilter("all")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  installedFilter === "all" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                All Extensions
              </button>
              <button
                onClick={() => setInstalledFilter("installed")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  installedFilter === "installed"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                Installed
              </button>
              <button
                onClick={() => setInstalledFilter("available")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  installedFilter === "available"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                Available
              </button>
            </div>
          </div>

          {/* Extensions Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{filteredExtensions.length} extensions found</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredExtensions.map((ext) => (
                <GlassCard key={ext.id} depth={1} className="group">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-${ext.color}/20`}>
                      <ext.icon className={`h-6 w-6 text-${ext.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{ext.name}</h3>
                        {ext.verified && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ext.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {ext.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {ext.downloads.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-accent" />
                          {ext.rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {ext.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-end">
                    {ext.installed ? (
                      <Button variant="outline" size="sm" disabled>
                        <Check className="h-4 w-4 mr-1" />
                        Installed
                      </Button>
                    ) : (
                      <QuantumButton size="sm" variant="compliance">
                        <Download className="h-4 w-4 mr-1" />
                        Install
                      </QuantumButton>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={null}>
      <MarketplaceContent />
    </Suspense>
  )
}
