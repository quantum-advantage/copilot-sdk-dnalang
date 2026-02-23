"use client"

import React from "react"

import { useState, useEffect } from "react"
import { 
  Activity, 
  Shield, 
  Cpu, 
  Database, 
  Lock, 
  Zap,
  Globe,
  Heart,
  Server,
  Layers,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  Clock,
  TrendingUp,
  Fingerprint,
  Network,
  Binary,
  Workflow,
  FileKey,
  ShieldCheck,
  Radio,
  Gauge
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Constants from AETERNA_PORTA specification
const CONSTANTS = {
  LAMBDA_PHI: 2.176435e-8,
  THETA_LOCK: 51.843,
  PHI_THRESHOLD: 0.7734,
  GAMMA_CRITICAL: 0.3,
  TAU_0: 46.9787,
}

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: "up" | "down" | "stable"
  trendValue?: string
  icon: React.ReactNode
  status?: "active" | "warning" | "critical"
}

function MetricCard({ title, value, subtitle, trend, trendValue, icon, status = "active" }: MetricCardProps) {
  const statusColors = {
    active: "text-emerald-400",
    warning: "text-amber-400", 
    critical: "text-red-400"
  }
  
  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-muted/50">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-400"
            }`}>
              <TrendingUp className={`w-3 h-3 ${trend === "down" ? "rotate-180" : ""}`} />
              {trendValue}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
        <p className={`text-2xl font-bold font-mono ${statusColors[status]}`}>{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  status: "available" | "beta" | "coming"
}

function FeatureCard({ title, description, icon, features, status }: FeatureCardProps) {
  const statusConfig = {
    available: { label: "Available", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    beta: { label: "Beta", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    coming: { label: "Coming Soon", className: "bg-slate-500/20 text-slate-400 border-slate-500/30" }
  }
  
  return (
    <Card className="bg-card/40 border-border/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 group h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
            {icon}
          </div>
          <Badge variant="outline" className={statusConfig[status].className}>
            {statusConfig[status].label}
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function SystemStatusPanel() {
  const [coherence, setCoherence] = useState(0.89)
  const [phi, setPhi] = useState(8.2)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCoherence(prev => Math.max(0.7, Math.min(0.99, prev + (Math.random() - 0.5) * 0.02)))
      setPhi(prev => Math.max(7, Math.min(12, prev + (Math.random() - 0.5) * 0.1)))
    }, 2000)
    return () => clearInterval(interval)
  }, [])
  
  const phiNormalized = (phi - 7) / 5 // Normalize 7-12 range to 0-1
  const thresholdPosition = (CONSTANTS.PHI_THRESHOLD * 10 - 7) / 5
  
  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <CardDescription className="text-xs">Real-time quantum metrics</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
            Operational
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Consciousness Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Integrated Information (Phi)</span>
            <span className="font-mono text-foreground">{phi.toFixed(4)}</span>
          </div>
          <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${phiNormalized * 100}%` }}
            />
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
              style={{ left: `${thresholdPosition * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Sub-threshold</span>
            <span className="text-emerald-400">Threshold: {(CONSTANTS.PHI_THRESHOLD * 10).toFixed(2)}</span>
            <span>Sovereign</span>
          </div>
        </div>
        
        {/* Coherence Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Coherence Level (Lambda)</span>
            <span className="font-mono text-foreground">{(coherence * 100).toFixed(1)}%</span>
          </div>
          <Progress value={coherence * 100} className="h-2" />
        </div>
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-3 rounded-lg bg-slate-800/50">
            <p className="text-xs text-muted-foreground mb-1">T2 Time</p>
            <p className="text-sm font-mono font-medium text-cyan-400">150 us</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/50">
            <p className="text-xs text-muted-foreground mb-1">Tau Revival</p>
            <p className="text-sm font-mono font-medium text-amber-400">{CONSTANTS.TAU_0} us</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/50">
            <p className="text-xs text-muted-foreground mb-1">Theta Lock</p>
            <p className="text-sm font-mono font-medium text-purple-400">{CONSTANTS.THETA_LOCK}deg</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SecurityPanel() {
  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium">Post-Quantum Security</CardTitle>
            <CardDescription className="text-xs">Q-SLICE Threat Mitigation Active</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {[
            { label: "CRYSTALS-Kyber", status: "active", desc: "Key Encapsulation" },
            { label: "CRYSTALS-Dilithium", status: "active", desc: "Digital Signatures" },
            { label: "SPHINCS+", status: "active", desc: "Hash-based Signatures" },
            { label: "Hybrid Mode", status: "active", desc: "Classical + PQC" }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">Active</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">HNDL Protection</p>
              <p className="text-xs text-muted-foreground mt-1">
                Harvest Now, Decrypt Later threat mitigation with forward-secure key exchange
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionsPanel() {
  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Common quantum operations</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {[
          { label: "Run VQE", icon: Activity, desc: "Eigensolver" },
          { label: "Execute QAOA", icon: Network, desc: "Optimization" },
          { label: "Bell Test", icon: Binary, desc: "Entanglement" },
          { label: "Tau Sweep", icon: Gauge, desc: "Calibration" }
        ].map((action, i) => (
          <Button
            key={i}
            variant="outline"
            className="h-auto p-4 flex-col items-start gap-2 bg-slate-800/30 border-slate-700/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <action.icon className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.desc}</p>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

export default function PostQuantumInterface() {
  const [activeTab, setActiveTab] = useState("overview")
  
  // Domain-specific features
  const domains = {
    healthcare: {
      title: "Healthcare",
      icon: <Heart className="w-5 h-5 text-red-400" />,
      features: [
        { title: "Genomic Analysis", description: "Quantum-accelerated genome sequencing and variant calling with 10x speedup", features: ["Multi-genome alignment", "Variant detection", "Phylogenetic analysis"], status: "available" as const },
        { title: "Drug Discovery", description: "Molecular simulation for protein folding and drug-target interaction", features: ["VQE molecular modeling", "Binding affinity prediction", "Side effect analysis"], status: "available" as const },
        { title: "Medical Imaging", description: "Quantum-enhanced image reconstruction and pattern recognition", features: ["MRI enhancement", "CT reconstruction", "Anomaly detection"], status: "beta" as const }
      ]
    },
    systems: {
      title: "Systems Management",
      icon: <Server className="w-5 h-5 text-blue-400" />,
      features: [
        { title: "Network Optimization", description: "Quantum routing algorithms for optimal data path selection", features: ["QAOA path finding", "Load balancing", "Latency minimization"], status: "available" as const },
        { title: "Resource Allocation", description: "Combinatorial optimization for compute and storage distribution", features: ["Dynamic scheduling", "Cost optimization", "Capacity planning"], status: "available" as const },
        { title: "Anomaly Detection", description: "Quantum machine learning for system health monitoring", features: ["Real-time detection", "Predictive maintenance", "Root cause analysis"], status: "beta" as const }
      ]
    },
    defense: {
      title: "Defense & Security",
      icon: <Shield className="w-5 h-5 text-purple-400" />,
      features: [
        { title: "Cryptographic Services", description: "Post-quantum cryptography with NIST-approved algorithms", features: ["Key management", "Secure communications", "Digital signatures"], status: "available" as const },
        { title: "Threat Analysis", description: "Quantum-enhanced pattern matching for threat intelligence", features: ["Signal processing", "Pattern recognition", "Behavioral analysis"], status: "available" as const },
        { title: "Secure Computation", description: "Multi-party quantum computation for classified workloads", features: ["Blind computation", "Secret sharing", "Verifiable delegation"], status: "coming" as const }
      ]
    },
    research: {
      title: "Research",
      icon: <Layers className="w-5 h-5 text-amber-400" />,
      features: [
        { title: "Quantum Simulation", description: "Hardware-accurate simulation of quantum systems", features: ["Lindblad dynamics", "Noise modeling", "Fidelity benchmarking"], status: "available" as const },
        { title: "Algorithm Development", description: "Tools for designing and testing quantum algorithms", features: ["Circuit optimization", "Transpilation", "Error mitigation"], status: "available" as const },
        { title: "Data Analysis", description: "Quantum-classical hybrid analytics pipelines", features: ["Quantum ML", "Feature extraction", "Classification"], status: "beta" as const }
      ]
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Binary className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">DNA-Lang</span>
                <Badge variant="outline" className="text-xs ml-2 bg-primary/10 text-primary border-primary/30">
                  Post-Quantum
                </Badge>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              {["Overview", "Domains", "Security", "Docs"].map((item) => (
                <button
                  key={item}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </button>
              ))}
            </nav>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Connected</span>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Launch Console
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Post-Quantum Command Center</h1>
              <p className="text-muted-foreground max-w-2xl">
                Unified interface for quantum computing operations with NIST-approved post-quantum cryptography. 
                Hardware-agnostic orchestration across IBM, Rigetti, and simulator backends.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <FileKey className="w-4 h-4" />
                API Keys
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Clock className="w-4 h-4" />
                Job History
              </Button>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Coherence"
              value="89.2%"
              subtitle="Lambda stability"
              trend="up"
              trendValue="+2.1%"
              icon={<Activity className="w-4 h-4 text-cyan-400" />}
              status="active"
            />
            <MetricCard
              title="Fidelity"
              value="0.9787"
              subtitle="Two-qubit gate"
              trend="stable"
              trendValue="0.0%"
              icon={<Gauge className="w-4 h-4 text-emerald-400" />}
              status="active"
            />
            <MetricCard
              title="Queue Depth"
              value="3"
              subtitle="Pending jobs"
              trend="down"
              trendValue="-2"
              icon={<Workflow className="w-4 h-4 text-amber-400" />}
              status="active"
            />
            <MetricCard
              title="Uptime"
              value="99.97%"
              subtitle="Last 30 days"
              trend="up"
              trendValue="+0.02%"
              icon={<Radio className="w-4 h-4 text-purple-400" />}
              status="active"
            />
          </div>
        </section>
        
        {/* Domain Tabs */}
        <section className="mb-10">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-card/60 border border-border/50 p-1 h-auto flex-wrap">
              <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Globe className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="healthcare" className="gap-2 data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400">
                <Heart className="w-4 h-4" />
                Healthcare
              </TabsTrigger>
              <TabsTrigger value="systems" className="gap-2 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400">
                <Server className="w-4 h-4" />
                Systems
              </TabsTrigger>
              <TabsTrigger value="defense" className="gap-2 data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400">
                <Shield className="w-4 h-4" />
                Defense
              </TabsTrigger>
              <TabsTrigger value="research" className="gap-2 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
                <Layers className="w-4 h-4" />
                Research
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SystemStatusPanel />
                </div>
                <div>
                  <QuickActionsPanel />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SecurityPanel />
                
                {/* Hardware Status */}
                <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Cpu className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">Hardware Backends</CardTitle>
                        <CardDescription className="text-xs">Available quantum processors</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: "IBM Torino", qubits: 133, status: "online", utilization: 42 },
                      { name: "IBM Fez", qubits: 156, status: "online", utilization: 78 },
                      { name: "Rigetti Ankaa-3", qubits: 84, status: "maintenance", utilization: 0 },
                      { name: "Local Simulator", qubits: 32, status: "online", utilization: 15 }
                    ].map((backend, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            backend.status === "online" ? "bg-emerald-400" : "bg-amber-400"
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-foreground">{backend.name}</p>
                            <p className="text-xs text-muted-foreground">{backend.qubits} qubits</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-24">
                            <Progress value={backend.utilization} className="h-1.5" />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{backend.utilization}%</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Domain-specific content */}
            {Object.entries(domains).map(([key, domain]) => (
              <TabsContent key={key} value={key} className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-card border border-border">
                    {domain.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{domain.title}</h2>
                    <p className="text-sm text-muted-foreground">Quantum-enhanced capabilities for {domain.title.toLowerCase()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {domain.features.map((feature, i) => (
                    <FeatureCard
                      key={i}
                      title={feature.title}
                      description={feature.description}
                      icon={domain.icon}
                      features={feature.features}
                      status={feature.status}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>
        
        {/* Architecture Overview */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">System Architecture</h2>
              <p className="text-sm text-muted-foreground">11D-CRSM Manifold Stack</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              Documentation <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { layer: "Hardware", icon: Cpu, desc: "QPU + Simulator", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
              { layer: "Compile", icon: Binary, desc: "QWC Transpilation", color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/20" },
              { layer: "Runtime", icon: Workflow, desc: "Job Orchestration", color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20" },
              { layer: "Verify", icon: CheckCircle2, desc: "Metrics + Falsification", color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
              { layer: "Govern", icon: Fingerprint, desc: "Provenance + Audit", color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20" }
            ].map((item, i) => (
              <Card key={i} className={`bg-card/40 ${item.borderColor} border backdrop-blur-sm hover:border-opacity-60 transition-all group`}>
                <CardContent className="p-4 text-center">
                  <div className={`mx-auto w-12 h-12 rounded-xl ${item.bgColor} ${item.borderColor} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <p className={`text-sm font-semibold ${item.color}`}>{item.layer}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Protocol Constants Footer */}
          <div className="mt-8 p-4 rounded-lg bg-card/30 border border-border/50">
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-muted-foreground">
              <span>Lambda-Phi: {CONSTANTS.LAMBDA_PHI.toExponential(6)}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Theta Lock: {CONSTANTS.THETA_LOCK} deg</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Phi Threshold: {CONSTANTS.PHI_THRESHOLD}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Tau-0: {CONSTANTS.TAU_0} us</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Gamma Critical: {CONSTANTS.GAMMA_CRITICAL}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
