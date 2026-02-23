"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantumButton } from "@/components/ui/quantum-button"
import { Input } from "@/components/ui/input"
import {
  ChevronRight,
  FileCode2,
  Search,
  Download,
  Star,
  GitBranch,
  Clock,
  Dna,
  ArrowRight,
  Sparkles,
} from "lucide-react"

const templates = [
  {
    id: "bell-state",
    name: "Bell State Generator",
    description: "Create maximally entangled qubit pairs with evolution optimization",
    category: "Fundamentals",
    difficulty: "Beginner",
    stars: 234,
    downloads: 1892,
    lastUpdated: "2 days ago",
    author: "DNA-Lang Team",
    tags: ["entanglement", "gates", "measurement"],
    featured: true,
  },
  {
    id: "grover-search",
    name: "Grover's Search Algorithm",
    description: "Quadratic speedup for unstructured search with genetic amplitude amplification",
    category: "Algorithms",
    difficulty: "Intermediate",
    stars: 189,
    downloads: 1456,
    lastUpdated: "1 week ago",
    author: "Quantum Algorithms Lab",
    tags: ["search", "oracle", "diffusion"],
    featured: true,
  },
  {
    id: "vqe-molecule",
    name: "VQE Molecular Simulator",
    description: "Variational Quantum Eigensolver for molecular ground state estimation",
    category: "Chemistry",
    difficulty: "Advanced",
    stars: 156,
    downloads: 987,
    lastUpdated: "3 days ago",
    author: "BioCompute Labs",
    tags: ["variational", "chemistry", "optimization"],
    featured: false,
  },
  {
    id: "qnn-classifier",
    name: "Quantum Neural Network",
    description: "Parameterized quantum circuits for classification tasks with evolution training",
    category: "Machine Learning",
    difficulty: "Advanced",
    stars: 201,
    downloads: 1234,
    lastUpdated: "5 days ago",
    author: "QML Research",
    tags: ["neural", "classification", "training"],
    featured: true,
  },
  {
    id: "teleportation",
    name: "Quantum Teleportation",
    description: "Transfer quantum states between qubits using entanglement and classical bits",
    category: "Fundamentals",
    difficulty: "Beginner",
    stars: 312,
    downloads: 2341,
    lastUpdated: "1 day ago",
    author: "DNA-Lang Team",
    tags: ["teleportation", "protocol", "communication"],
    featured: false,
  },
  {
    id: "qaoa-maxcut",
    name: "QAOA MaxCut Solver",
    description: "Quantum Approximate Optimization for graph partitioning problems",
    category: "Optimization",
    difficulty: "Intermediate",
    stars: 145,
    downloads: 876,
    lastUpdated: "1 week ago",
    author: "Optimization Guild",
    tags: ["qaoa", "graphs", "combinatorial"],
    featured: false,
  },
  {
    id: "error-correction",
    name: "Surface Code Error Correction",
    description: "Immune system implementation with surface code logical qubits",
    category: "Error Correction",
    difficulty: "Expert",
    stars: 98,
    downloads: 456,
    lastUpdated: "2 weeks ago",
    author: "Fault Tolerant Labs",
    tags: ["error-correction", "surface-code", "fault-tolerant"],
    featured: false,
  },
  {
    id: "qft-adder",
    name: "Quantum Fourier Adder",
    description: "Arithmetic circuit using Quantum Fourier Transform for addition",
    category: "Arithmetic",
    difficulty: "Intermediate",
    stars: 167,
    downloads: 1023,
    lastUpdated: "4 days ago",
    author: "Arithmetic Circuits",
    tags: ["qft", "arithmetic", "addition"],
    featured: false,
  },
]

const categories = [
  "All",
  "Fundamentals",
  "Algorithms",
  "Chemistry",
  "Machine Learning",
  "Optimization",
  "Error Correction",
  "Arithmetic",
]
const difficulties = ["All", "Beginner", "Intermediate", "Advanced", "Expert"]

function TemplatesContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "All" || t.difficulty === selectedDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const featuredTemplates = templates.filter((t) => t.featured)

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
          <FileCode2 className="h-5 w-5 text-primary" />
          <span className="font-semibold">Project Templates</span>
          <Badge variant="outline" className="ml-2">
            {templates.length} templates
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ide-platform/editor">
            <QuantumButton variant="compliance" size="sm">
              <Sparkles className="h-4 w-4 mr-1" />
              Start from Scratch
            </QuantumButton>
          </Link>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* Featured Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-accent fill-accent" />
            <h2 className="text-xl font-semibold">Featured Templates</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTemplates.slice(0, 3).map((template) => (
              <GlassCard key={template.id} depth={2} className="group">
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-accent/20 text-accent border-accent/30">{template.category}</Badge>
                  <Badge variant="outline">{template.difficulty}</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" /> {template.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" /> {template.downloads}
                    </span>
                  </div>
                  <Link href={`/ide-platform/editor?template=${template.id}`}>
                    <Button size="sm" variant="ghost" className="gap-1">
                      Use <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Search and Filters */}
        <section className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff === "All" ? "All Levels" : diff}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* All Templates */}
        <section>
          <h2 className="text-xl font-semibold mb-4">All Templates ({filteredTemplates.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => (
              <GlassCard key={template.id} depth={1} className="group">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                  {template.featured && <Star className="h-4 w-4 text-accent fill-accent" />}
                </div>
                <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">{template.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" /> {template.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {template.lastUpdated}
                    </span>
                  </div>
                  <Link href={`/ide-platform/editor?template=${template.id}`}>
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      Use
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Create Your Own */}
        <section>
          <GlassCard depth={2} className="text-center py-8">
            <Dna className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Create Your Own Template</h2>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Build a custom organism and share it with the DNA-Lang community
            </p>
            <Link href="/ide-platform/editor">
              <QuantumButton variant="compliance">
                <GitBranch className="h-4 w-4 mr-2" />
                Start Building
              </QuantumButton>
            </Link>
          </GlassCard>
        </section>
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={null}>
      <TemplatesContent />
    </Suspense>
  )
}
