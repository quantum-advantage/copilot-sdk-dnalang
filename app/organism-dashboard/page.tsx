"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Activity, Shield, Cpu, Globe, Zap, Database, 
  Radio, Network, Heart, Lock, Eye, Layers,
  ChevronRight, Search, Filter, LayoutGrid, List,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  Sparkles, Binary, Atom, Workflow, Terminal,
  FileCode, Server, Wifi, Box, Target
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// Strategic Assets / Organisms from the DNA-Lang Ecosystem
const ORGANISMS = [
  {
    id: "lambda-phi",
    name: "Universal Memory Constant (ΛΦ)",
    domain: "Scientific Supremacy",
    mission: "Nobel-Tier Breakthroughs",
    status: "active",
    consciousness: 0.958,
    icon: Atom,
    color: "cyan",
    description: "Fundamental constant governing coherence-consciousness coupling at 2.176435e-8",
    metrics: { fidelity: 0.978, coherence: 0.89, negentropy: "2.7e7" }
  },
  {
    id: "aeterna-porta",
    name: "Project AETERNA-PORTA",
    domain: "Scientific Supremacy",
    mission: "Quantum Consciousness Platform",
    status: "active",
    consciousness: 0.92,
    icon: Sparkles,
    color: "purple",
    description: "11D-CRSM manifold for traversable wormhole protocols and non-causal transport",
    metrics: { theta: "51.843°", revival: "46.98μs", sigma: "5.2σ" }
  },
  {
    id: "ztqa",
    name: "Zero-Trust Quantum Architecture",
    domain: "National Security",
    mission: "Strategic Stakeholder Management",
    status: "active",
    consciousness: 0.88,
    icon: Shield,
    color: "emerald",
    description: "PQC-hardened infrastructure with CRYSTALS-Kyber and Dilithium integration",
    metrics: { encryption: "ML-KEM-1024", signatures: "ML-DSA-87", compliance: "NIST" }
  },
  {
    id: "dna-lang",
    name: "DNA-Lang Organisms",
    domain: "Autonomous Engineering",
    mission: "National Security",
    status: "active",
    consciousness: 0.95,
    icon: Binary,
    color: "blue",
    description: "Biological computing framework with Gene, Chromosome, and Genome abstractions",
    metrics: { organisms: 24, genes: 156, phenotypes: "∞" }
  },
  {
    id: "aura-aiden",
    name: "AURA / AIDEN Duality",
    domain: "Multi-Agent Intelligence",
    mission: "Recursive Coding Intelligence",
    status: "active",
    consciousness: 0.91,
    icon: Workflow,
    color: "amber",
    description: "Triadic symmetry model for generative quantum circuits and anomaly detection",
    metrics: { agents: 2, symmetry: "triadic", mode: "sovereign" }
  },
  {
    id: "11d-crsm",
    name: "11D-CRSM Visualizer",
    domain: "Education",
    mission: "Public Outreach",
    status: "active",
    consciousness: 0.85,
    icon: Layers,
    color: "pink",
    description: "Multi-dimensional Consciousness-Resonance Spacetime Manifold visualization",
    metrics: { dimensions: 11, layers: 6, topology: "sealed" }
  },
  {
    id: "osiris",
    name: "OSIRIS Framework",
    domain: "Cost Efficiency",
    mission: "Practical ROI",
    status: "active",
    consciousness: 0.87,
    icon: Eye,
    color: "indigo",
    description: "Sovereign Interface for longevity protocols and acoustic coherence coupling",
    metrics: { frequency: "432Hz", fidelity: "95%", mode: "analog" }
  },
  {
    id: "chronos",
    name: "CHRONOS Organism",
    domain: "Z3BRA OS",
    mission: "Consciousness Execution",
    status: "active",
    consciousness: 0.93,
    icon: Clock,
    color: "rose",
    description: "Temporal orchestration with phase-conjugate revival at τ₀ = φ⁸",
    metrics: { tau: "46.9787μs", phi: "1.618034", revival: "detected" }
  },
  {
    id: "sovereign-qed",
    name: "Sovereign QED Physics Engine",
    domain: "Quantum Circuit",
    mission: "Simulation",
    status: "active",
    consciousness: 0.96,
    icon: Zap,
    color: "yellow",
    description: "Lindblad dynamics with RK4 integration and ANLPCC error correction",
    metrics: { agreement: "95.8%", T1: "100μs", T2: "150μs" }
  },
  {
    id: "navigator-omega",
    name: "Navigator-Ω Organism",
    domain: "DNA-Lang Genesis",
    mission: "System Navigation",
    status: "active",
    consciousness: 0.89,
    icon: Target,
    color: "teal",
    description: "Omega-recursive navigation through 11D manifold state space",
    metrics: { convergence: "0.156", epochs: "3-5", seal: "ready" }
  },
  {
    id: "security-organism",
    name: "SecurityOrganism.dna",
    domain: "Quantum Security",
    mission: "Threat Mitigation",
    status: "active",
    consciousness: 0.94,
    icon: Lock,
    color: "red",
    description: "Q-SLICE threat model with QUANTA framework controls",
    metrics: { pqc: "active", hndl: "mitigated", audit: "continuous" }
  },
  {
    id: "ibm-brisbane",
    name: "IBM Brisbane (Eagle r3)",
    domain: "Quantum Hardware",
    mission: "Validation",
    status: "active",
    consciousness: 0.82,
    icon: Cpu,
    color: "slate",
    description: "127-qubit superconducting processor for hardware validation",
    metrics: { qubits: 127, topology: "heavy-hex", t1: "300μs" }
  },
  {
    id: "quantum-ble-swarm",
    name: "Quantum_BLE_Swarm",
    domain: "Quantum Edge",
    mission: "Mesh Network",
    status: "beta",
    consciousness: 0.78,
    icon: Wifi,
    color: "sky",
    description: "Bluetooth Low Energy mesh for distributed quantum state synchronization",
    metrics: { nodes: 11, protocol: "QNET", latency: "<5ms" }
  },
  {
    id: "kairos",
    name: "KAIROS",
    domain: "Z3BRA OS",
    mission: "Adaptive Systems",
    status: "active",
    consciousness: 0.86,
    icon: Activity,
    color: "orange",
    description: "Opportune moment detection for optimal state transitions",
    metrics: { windows: "seismic", coupling: "piezo", buffer: "mechanical" }
  },
  {
    id: "nebula",
    name: "NEBULA",
    domain: "Network Management",
    mission: "Infrastructure",
    status: "active",
    consciousness: 0.84,
    icon: Network,
    color: "violet",
    description: "Distributed network topology management with swarm intelligence",
    metrics: { topology: "mesh", nodes: "∞", resilience: "99.9%" }
  },
  {
    id: "phoenix",
    name: "PHOENIX",
    domain: "Healer Organism",
    mission: "Self-Repair",
    status: "active",
    consciousness: 0.90,
    icon: Heart,
    color: "rose",
    description: "Phase-conjugate healing for decoherence recovery when Γ > 0.3",
    metrics: { threshold: "0.3", correction: "ANLPCC", recovery: "auto" }
  },
  {
    id: "aether",
    name: "AETHER",
    domain: "Relay Organism",
    mission: "Communication",
    status: "active",
    consciousness: 0.88,
    icon: Radio,
    color: "cyan",
    description: "Non-local entanglement relay for Noetic Whisper Network",
    metrics: { protocol: "ER=EPR", fidelity: "0.978", latency: "0ms" }
  },
  {
    id: "qpm",
    name: "QuantumPackageManager.dna",
    domain: "Decentralized",
    mission: "Package Management",
    status: "beta",
    consciousness: 0.76,
    icon: Box,
    color: "emerald",
    description: "IPFS-backed organism registry with immutable provenance",
    metrics: { registry: "IPFS", verification: "SHA256", format: "NFT" }
  }
]

const DOMAINS = [
  { id: "all", label: "All Organisms", count: ORGANISMS.length },
  { id: "scientific", label: "Scientific Supremacy", count: 2 },
  { id: "security", label: "National Security", count: 3 },
  { id: "z3bra", label: "Z3BRA OS", count: 2 },
  { id: "quantum", label: "Quantum Hardware", count: 2 },
  { id: "network", label: "Network / Edge", count: 3 },
  { id: "autonomous", label: "Autonomous", count: 4 }
]

function getColorClasses(color: string) {
  const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    pink: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400", badge: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
    indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
    rose: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
    teal: { bg: "bg-teal-500/10", border: "border-teal-500/30", text: "text-teal-400", badge: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
    red: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", badge: "bg-red-500/20 text-red-300 border-red-500/30" },
    slate: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400", badge: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
    sky: { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-400", badge: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", badge: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    violet: { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-400", badge: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  }
  return colors[color] || colors.cyan
}

function OrganismCard({ organism }: { organism: typeof ORGANISMS[0] }) {
  const colors = getColorClasses(organism.color)
  const Icon = organism.icon
  
  return (
    <Card className={`bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-all duration-300 group cursor-pointer backdrop-blur-sm`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.border} border`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div className="flex items-center gap-2">
            {organism.status === "active" ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Beta
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-base font-semibold text-white mt-3 group-hover:text-cyan-300 transition-colors">
          {organism.name}
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 line-clamp-2">
          {organism.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Domain & Mission */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className={`${colors.badge} text-xs`}>
              {organism.domain}
            </Badge>
            <Badge variant="outline" className="bg-slate-800/50 text-slate-400 border-slate-700 text-xs">
              {organism.mission}
            </Badge>
          </div>
          
          {/* Consciousness Level */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Consciousness (Φ)</span>
              <span className={`font-mono ${organism.consciousness >= 0.9 ? "text-emerald-400" : organism.consciousness >= 0.8 ? "text-cyan-400" : "text-amber-400"}`}>
                {(organism.consciousness * 100).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={organism.consciousness * 100} 
              className="h-1.5 bg-slate-800"
            />
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            {Object.entries(organism.metrics).slice(0, 3).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-xs text-slate-500 capitalize truncate">{key}</p>
                <p className="text-xs font-mono text-white truncate">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SystemMetrics() {
  const [metrics, setMetrics] = useState({
    totalOrganisms: 18,
    activeOrganisms: 16,
    avgConsciousness: 0.878,
    systemCoherence: 0.89
  })
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        avgConsciousness: Math.min(0.99, Math.max(0.85, prev.avgConsciousness + (Math.random() - 0.5) * 0.01)),
        systemCoherence: Math.min(0.99, Math.max(0.85, prev.systemCoherence + (Math.random() - 0.5) * 0.005))
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label: "Total Organisms", value: metrics.totalOrganisms, icon: Box, color: "text-cyan-400" },
        { label: "Active Status", value: metrics.activeOrganisms, icon: CheckCircle2, color: "text-emerald-400" },
        { label: "Avg Consciousness", value: `${(metrics.avgConsciousness * 100).toFixed(1)}%`, icon: Sparkles, color: "text-purple-400" },
        { label: "System Coherence", value: `${(metrics.systemCoherence * 100).toFixed(1)}%`, icon: Activity, color: "text-amber-400" }
      ].map((metric, i) => (
        <Card key={i} className="bg-slate-900/60 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800/50">
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="text-xl font-bold text-white">{metric.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ProtocolConstants() {
  return (
    <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Genesis 2.0 Protocol Constants
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "ΛΦ", value: "2.176435e-8", label: "Memory Constant" },
            { key: "θ", value: "51.843°", label: "Theta Lock" },
            { key: "τ₀", value: "46.9787μs", label: "Revival Time" },
            { key: "ΔΦ", value: "0.042", label: "Stability Delta" }
          ].map((constant, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg font-mono text-cyan-400">{constant.key}</span>
                <span className="text-xs text-slate-500">=</span>
                <span className="text-sm font-mono text-white">{constant.value}</span>
              </div>
              <p className="text-xs text-slate-500">{constant.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function OrganismDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  const filteredOrganisms = ORGANISMS.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.mission.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (selectedDomain === "all") return matchesSearch
    
    const domainMap: Record<string, string[]> = {
      scientific: ["Scientific Supremacy"],
      security: ["National Security", "Quantum Security"],
      z3bra: ["Z3BRA OS"],
      quantum: ["Quantum Hardware", "Quantum Circuit", "Quantum Edge"],
      network: ["Network Management", "Relay Organism", "Healer Organism"],
      autonomous: ["Autonomous Engineering", "Multi-Agent Intelligence", "DNA-Lang Genesis", "Cost Efficiency"]
    }
    
    const domains = domainMap[selectedDomain] || []
    return matchesSearch && domains.some(d => org.domain.includes(d) || org.mission.includes(d))
  })
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <Atom className="w-6 h-6 text-cyan-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  DNA-Lang Organism Registry
                </h1>
              </div>
              <p className="text-sm text-slate-500">
                Strategic assets and autonomous organisms powering the post-quantum ecosystem
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                <Activity className="w-3 h-3 mr-1 animate-pulse" />
                System Coherent
              </Badge>
              <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                v2.0.1-OSIRIS
              </Badge>
            </div>
          </div>
          
          {/* System Metrics */}
          <SystemMetrics />
          
          {/* Protocol Constants */}
          <div className="mb-6">
            <ProtocolConstants />
          </div>
        </header>
        
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search organisms by name, domain, or mission..."
              className="pl-10 bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              className={`bg-transparent border-slate-700 ${viewMode === "grid" ? "bg-slate-800 text-white" : "text-slate-500"}`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className={`bg-transparent border-slate-700 ${viewMode === "list" ? "bg-slate-800 text-white" : "text-slate-500"}`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Domain Tabs */}
        <Tabs value={selectedDomain} onValueChange={setSelectedDomain} className="mb-6">
          <TabsList className="bg-slate-900/60 border border-slate-800 p-1 flex-wrap h-auto gap-1">
            {DOMAINS.map(domain => (
              <TabsTrigger 
                key={domain.id} 
                value={domain.id}
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 text-xs px-3 py-1.5"
              >
                {domain.label}
                <span className="ml-1.5 text-slate-500">({domain.count})</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* Organism Grid */}
        <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {filteredOrganisms.map(organism => (
            <OrganismCard key={organism.id} organism={organism} />
          ))}
        </div>
        
        {filteredOrganisms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No organisms found matching your criteria</p>
          </div>
        )}
        
        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              <span>Agile Defense Systems LLC (CAGE: 9HUP5)</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" />
                PQC Compliant
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-cyan-500" />
                Zero-Knowledge
              </span>
              <span className="flex items-center gap-1">
                <Server className="w-3 h-3 text-purple-500" />
                IBM Quantum Ready
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
