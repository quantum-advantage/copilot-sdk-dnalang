"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantumButton } from "@/components/ui/quantum-button"
import {
  FolderTree,
  ChevronRight,
  Plus,
  Search,
  MoreVertical,
  Dna,
  Clock,
  Activity,
  Star,
  Trash2,
  Copy,
  ExternalLink,
  Cpu,
  Users,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const projects = [
  {
    id: "bell-state-exp",
    name: "Bell State Experiments",
    description: "Quantum entanglement experiments with evolutionary optimization",
    organisms: 12,
    lastModified: "2 hours ago",
    habitat: "ibm_brisbane",
    phi: 0.847,
    starred: true,
    collaborators: 3,
    status: "active",
  },
  {
    id: "vqe-h2",
    name: "VQE Hydrogen Molecule",
    description: "Variational quantum eigensolver for H2 ground state energy",
    organisms: 8,
    lastModified: "1 day ago",
    habitat: "simulator",
    phi: 0.723,
    starred: true,
    collaborators: 2,
    status: "active",
  },
  {
    id: "grover-search",
    name: "Grover Search Algorithm",
    description: "Amplitude amplification with immune system optimization",
    organisms: 5,
    lastModified: "3 days ago",
    habitat: "ibm_osaka",
    phi: 0.912,
    starred: false,
    collaborators: 1,
    status: "active",
  },
  {
    id: "qaoa-maxcut",
    name: "QAOA MaxCut Solver",
    description: "Quantum approximate optimization for graph partitioning",
    organisms: 15,
    lastModified: "1 week ago",
    habitat: "aws_braket",
    phi: 0.654,
    starred: false,
    collaborators: 4,
    status: "archived",
  },
  {
    id: "qml-classifier",
    name: "Quantum ML Classifier",
    description: "Parameterized quantum circuits for classification tasks",
    organisms: 23,
    lastModified: "2 weeks ago",
    habitat: "simulator",
    phi: 0.789,
    starred: false,
    collaborators: 2,
    status: "active",
  },
]

const templates = [
  {
    id: "bell-template",
    name: "Bell State",
    description: "Basic quantum entanglement template",
    icon: Dna,
    color: "primary",
  },
  {
    id: "vqe-template",
    name: "VQE Algorithm",
    description: "Variational quantum eigensolver",
    icon: Activity,
    color: "secondary",
  },
  {
    id: "grover-template",
    name: "Grover's Search",
    description: "Quantum search algorithm",
    icon: Cpu,
    color: "accent",
  },
]

function ProjectsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "starred" | "archived">("all")

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filter === "all" ||
      (filter === "starred" && project.starred) ||
      (filter === "archived" && project.status === "archived")

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link href="/ide-platform">
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
              </Link>
              <FolderTree className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Project Manager</h1>
            </div>
            <QuantumButton variant="compliance">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </QuantumButton>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                All
              </Button>
              <Button
                variant={filter === "starred" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("starred")}
              >
                <Star className="h-3 w-3 mr-1" />
                Starred
              </Button>
              <Button
                variant={filter === "archived" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("archived")}
              >
                Archived
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Quick Start Templates */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Start Templates</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <GlassCard
                key={template.id}
                depth={1}
                className="cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${template.color}/20`}>
                    <template.icon className={`h-5 w-5 text-${template.color}`} />
                  </div>
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Your Projects
            <span className="text-sm font-normal text-muted-foreground ml-2">({filteredProjects.length})</span>
          </h2>

          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <GlassCard key={project.id} depth={1} className="group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/20">
                    <Dna className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/ide-platform/editor?project=${project.id}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors">{project.name}</h3>
                      </Link>
                      {project.starred && <Star className="h-4 w-4 text-accent fill-accent" />}
                      {project.status === "archived" && <Badge variant="secondary">Archived</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Dna className="h-3 w-3" />
                        {project.organisms} organisms
                      </span>
                      <span className="flex items-center gap-1">
                        <Cpu className="h-3 w-3" />
                        {project.habitat}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {project.collaborators}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {project.lastModified}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Φ</div>
                      <div
                        className={`font-mono font-bold ${project.phi >= 0.7734 ? "text-secondary" : "text-accent"}`}
                      >
                        {project.phi.toFixed(3)}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="h-4 w-4 mr-2" />
                          {project.starred ? "Unstar" : "Star"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsContent />
    </Suspense>
  )
}
