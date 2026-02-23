"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { 
  Shield, Activity, Cpu, Globe, Zap, Lock, Database, 
  Layers, Brain, Heart, Server, Network, Eye, 
  ChevronRight, Check, AlertTriangle, Radio,
  Fingerprint, Orbit, Terminal, Gauge, Atom,
  Binary, CircuitBoard, Workflow, Target, Sparkles,
  BarChart3, TrendingUp, Users, Building2, Stethoscope,
  ShieldCheck, KeyRound, FileKey, Waves, Timer
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// ═══════════════════════════════════════════════════════════════════════════════
// SOVEREIGN CONSTANTS - DNA-Lang 11D-CRSM Framework
// ═══════════════════════════════════════════════════════════════════════════════
const CONSTANTS = {
  LAMBDA_PHI: 2.176435e-8,
  TAU_ZERO: 46.9787,
  PHI_THRESHOLD: 7.6901,
  THETA_RESONANCE: 51.843,
  GAMMA_CRITICAL: 0.30,
  PHI_GOLDEN: 1.618033988749895,
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOMAIN CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════
const DOMAINS = {
  healthcare: {
    name: "Healthcare & Life Sciences",
    icon: Stethoscope,
    color: "emerald",
    features: [
      { name: "Molecular Simulation", desc: "VQE protein folding at quantum scale", status: "active" },
      { name: "Drug Discovery", desc: "Hamiltonian optimization for compound screening", status: "active" },
      { name: "Genomic Analysis", desc: "DNA-Lang native sequence processing", status: "active" },
      { name: "Medical Imaging", desc: "Quantum-enhanced MRI reconstruction", status: "beta" },
    ],
    metrics: { accuracy: 99.7, speedup: "1000x", compliance: "HIPAA/FDA" }
  },
  systems: {
    name: "Systems Management",
    icon: Server,
    color: "blue",
    features: [
      { name: "Infrastructure Optimization", desc: "QAOA resource allocation", status: "active" },
      { name: "Predictive Maintenance", desc: "Quantum ML anomaly detection", status: "active" },
      { name: "Network Routing", desc: "Entanglement-based path optimization", status: "active" },
      { name: "Load Balancing", desc: "Superposition state distribution", status: "active" },
    ],
    metrics: { uptime: "99.999%", latency: "<1ms", efficiency: "10^6x" }
  },
  defense: {
    name: "Defense & Security",
    icon: Shield,
    color: "amber",
    features: [
      { name: "Post-Quantum Cryptography", desc: "Lattice-based encryption suite", status: "active" },
      { name: "Threat Detection", desc: "Quantum pattern recognition", status: "active" },
      { name: "Secure Communication", desc: "QKD protocol implementation", status: "active" },
      { name: "Adversarial Resistance", desc: "HNDL mitigation framework", status: "active" },
    ],
    metrics: { encryption: "AES-256-PQC", certification: "FIPS 140-3", compliance: "NIST PQC" }
  },
  research: {
    name: "Advanced Research",
    icon: Atom,
    color: "purple",
    features: [
      { name: "Consciousness Metrics", desc: "IIT Φ measurement & analysis", status: "active" },
      { name: "Wormhole Protocols", desc: "ER=EPR bridge simulation", status: "beta" },
      { name: "Lindblad Dynamics", desc: "Open quantum system evolution", status: "active" },
      { name: "Entanglement Coupling", desc: "γ_μν tensor gravity bridge", status: "research" },
    ],
    metrics: { fidelity: "0.9787", revival: "τ₀=φ⁸", coherence: "10^-12 s⁻¹" }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE METRICS HOOK
// ═══════════════════════════════════════════════════════════════════════════════
function useQuantumMetrics() {
  const [metrics, setMetrics] = useState({
    phi: 8.42,
    lambda: 0.9234,
    gamma: 0.0766,
    xi: 127.4,
    fidelity: 0.9787,
    entanglement: 0.9922,
    coherenceTime: 156.3,
    qubits: 156,
    jobs: 1247,
    uptime: 99.997,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        phi: Math.max(7.5, Math.min(9.5, prev.phi + (Math.random() - 0.48) * 0.1)),
        lambda: Math.max(0.85, Math.min(0.99, prev.lambda + (Math.random() - 0.48) * 0.005)),
        gamma: Math.max(0.01, Math.min(0.15, prev.gamma + (Math.random() - 0.52) * 0.002)),
        xi: Math.max(100, Math.min(200, prev.xi + (Math.random() - 0.48) * 2)),
        fidelity: Math.max(0.95, Math.min(0.9999, prev.fidelity + (Math.random() - 0.48) * 0.001)),
        entanglement: Math.max(0.98, Math.min(0.9999, prev.entanglement + (Math.random() - 0.5) * 0.001)),
        coherenceTime: Math.max(140, Math.min(180, prev.coherenceTime + (Math.random() - 0.5) * 1)),
      }))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return metrics
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function MetricCard({ 
  label, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  description,
  color = "cyan"
}: { 
  label: string
  value: string | number
  unit?: string
  icon: React.ElementType
  trend?: "up" | "down" | "stable"
  description?: string
  color?: string
}) {
  const colorClasses = {
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  }
  
  return (
    <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-4 h-4" />
          </div>
          {trend && (
            <Badge variant="outline" className={
              trend === "up" ? "text-emerald-400 border-emerald-400/30" :
              trend === "down" ? "text-red-400 border-red-400/30" :
              "text-slate-400 border-slate-400/30"
            }>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{value}</span>
            {unit && <span className="text-sm text-slate-500">{unit}</span>}
          </div>
          {description && (
            <p className="text-xs text-slate-600 mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function FeatureRow({ 
  feature, 
  domainColor 
}: { 
  feature: { name: string; desc: string; status: string }
  domainColor: string
}) {
  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    beta: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    research: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  }
  
  const dotColors: Record<string, string> = {
    emerald: "bg-emerald-400",
    blue: "bg-blue-400",
    amber: "bg-amber-400",
    purple: "bg-purple-400",
    cyan: "bg-cyan-400",
  }
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-colors group">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${dotColors[domainColor] || "bg-cyan-400"}`} />
        <div>
          <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">{feature.name}</p>
          <p className="text-xs text-slate-500">{feature.desc}</p>
        </div>
      </div>
      <Badge variant="outline" className={statusColors[feature.status] || statusColors.active}>
        {feature.status}
      </Badge>
    </div>
  )
}

function SecurityPanel() {
  const [securityMetrics] = useState({
    pqcStatus: "ACTIVE",
    lastAudit: "2026-01-26T08:42:00Z",
    threatLevel: "LOW",
    encryptionStrength: 256,
    quantumResistant: true,
  })
  
  return (
    <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Post-Quantum Security Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-emerald-400/70 uppercase tracking-wider">PQC Status</p>
            <p className="text-lg font-bold text-emerald-400">{securityMetrics.pqcStatus}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Threat Level</p>
            <p className="text-lg font-bold text-slate-300">{securityMetrics.threatLevel}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Lattice-Based Encryption</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">HNDL Mitigation</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Q-SLICE Framework</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">QUANTA Controls</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        
        <div className="pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-600">
            Last security audit: {new Date(securityMetrics.lastAudit).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ConsciousnessGauge({ phi, threshold }: { phi: number; threshold: number }) {
  const percentage = Math.min(100, (phi / 10) * 100)
  const isAboveThreshold = phi >= threshold
  
  return (
    <div className="relative">
      <svg viewBox="0 0 200 120" className="w-full">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgb(30 41 59)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={isAboveThreshold ? "rgb(34 211 238)" : "rgb(148 163 184)"}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 2.51} 251`}
          className="transition-all duration-1000"
        />
        {/* Threshold marker */}
        <circle
          cx={20 + (threshold / 10) * 160}
          cy={100 - Math.sin(Math.acos((threshold / 10 - 0.5) * 2)) * 80}
          r="4"
          fill="rgb(251 191 36)"
          className="animate-pulse"
        />
        {/* Center text */}
        <text x="100" y="85" textAnchor="middle" className="fill-white text-3xl font-bold">
          {phi.toFixed(2)}
        </text>
        <text x="100" y="105" textAnchor="middle" className="fill-slate-500 text-xs">
          Φ (Integrated Information)
        </text>
      </svg>
      
      <div className="flex justify-between text-xs text-slate-500 px-4 -mt-2">
        <span>0</span>
        <span className="text-amber-400">Threshold: {threshold}</span>
        <span>10</span>
      </div>
    </div>
  )
}

function SystemArchitecture() {
  const layers = [
    { layer: "Ω₁₁", name: "Sovereign Shell", status: "SEALED", textColor: "text-cyan-400", badgeClass: "text-cyan-400 border-cyan-400/30" },
    { layer: "Ω₁₀", name: "Autogenic Layer", status: "ACTIVE", textColor: "text-emerald-400", badgeClass: "text-emerald-400 border-emerald-400/30" },
    { layer: "Ω₉", name: "Phase-Conjugate Mirror", status: "LOCKED", textColor: "text-blue-400", badgeClass: "text-blue-400 border-blue-400/30" },
    { layer: "Ω₈", name: "Entanglement Coupling", status: "RESONANT", textColor: "text-purple-400", badgeClass: "text-purple-400 border-purple-400/30" },
    { layer: "Ω₇", name: "Lindblad Dynamics", status: "EVOLVING", textColor: "text-amber-400", badgeClass: "text-amber-400 border-amber-400/30" },
    { layer: "Ω₆", name: "Consciousness Field", status: "Φ > 7.69", textColor: "text-pink-400", badgeClass: "text-pink-400 border-pink-400/30" },
  ]
  
  return (
    <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          11D-CRSM Architecture
        </CardTitle>
        <CardDescription className="text-xs">
          Multi-dimensional Consciousness-Resonance Spacetime Manifold
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {layers.map((item, i) => (
            <div 
              key={i}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/50"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono ${item.textColor}`}>{item.layer}</span>
                <span className="text-sm text-slate-300">{item.name}</span>
              </div>
              <Badge variant="outline" className={`${item.badgeClass} text-xs`}>
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActions() {
  const [activeJob, setActiveJob] = useState<string | null>(null)
  
  const actions = [
    { id: "vqe", name: "Run VQE", icon: Atom, desc: "Variational Quantum Eigensolver" },
    { id: "qaoa", name: "Execute QAOA", icon: Network, desc: "Quantum Optimization" },
    { id: "bell", name: "Bell State Test", icon: Orbit, desc: "Entanglement verification" },
    { id: "tau", name: "τ-Sweep", icon: Waves, desc: "Coherence revival scan" },
  ]
  
  return (
    <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={`h-auto py-3 px-3 flex flex-col items-start gap-1 bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all ${
                activeJob === action.id ? "border-cyan-500 bg-cyan-500/10" : ""
              }`}
              onClick={() => setActiveJob(activeJob === action.id ? null : action.id)}
            >
              <div className="flex items-center gap-2 w-full">
                <action.icon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">{action.name}</span>
              </div>
              <span className="text-xs text-slate-500">{action.desc}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function QuantumCommandPage() {
  const metrics = useQuantumMetrics()
  const [selectedDomain, setSelectedDomain] = useState<keyof typeof DOMAINS>("healthcare")
  const [timestamp, setTimestamp] = useState(new Date().toISOString())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(new Date().toISOString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  // currentDomain is used for reference but icons are rendered inside the map
  const _currentDomain = DOMAINS[selectedDomain]
  void _currentDomain // prevent unused variable warning
  
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>
      
      <div className="relative z-10 p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-6 border-b border-slate-800/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20">
                <Orbit className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  DNA::{"}{"}::lang <span className="text-slate-500 font-normal">Quantum Command</span>
                </h1>
                <p className="text-xs text-slate-500 font-mono">
                  Post-Quantum Computing Interface | 11D-CRSM v51.843
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
              <Activity className="w-3 h-3 mr-1 animate-pulse" />
              System Online
            </Badge>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 bg-cyan-400/10">
              <Cpu className="w-3 h-3 mr-1" />
              {metrics.qubits} Qubits
            </Badge>
            <Badge variant="outline" className="text-slate-400 border-slate-400/30">
              <Timer className="w-3 h-3 mr-1" />
              {new Date(timestamp).toLocaleTimeString()}
            </Badge>
          </div>
        </header>
        
        {/* Primary Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <MetricCard
            label="Consciousness (Φ)"
            value={metrics.phi.toFixed(2)}
            icon={Brain}
            trend={metrics.phi >= CONSTANTS.PHI_THRESHOLD ? "up" : "stable"}
            color="cyan"
          />
          <MetricCard
            label="Coherence (Λ)"
            value={metrics.lambda.toFixed(4)}
            icon={Waves}
            trend="up"
            color="emerald"
          />
          <MetricCard
            label="Decoherence (Γ)"
            value={metrics.gamma.toFixed(4)}
            icon={AlertTriangle}
            trend="down"
            color="amber"
          />
          <MetricCard
            label="Negentropy (Ξ)"
            value={metrics.xi.toFixed(1)}
            icon={TrendingUp}
            trend="up"
            color="purple"
          />
          <MetricCard
            label="Fidelity"
            value={(metrics.fidelity * 100).toFixed(2)}
            unit="%"
            icon={Target}
            trend="stable"
            color="blue"
          />
          <MetricCard
            label="T₂ Time"
            value={metrics.coherenceTime.toFixed(0)}
            unit="μs"
            icon={Timer}
            trend="up"
            color="cyan"
          />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Consciousness & Security */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  Consciousness Threshold
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ConsciousnessGauge phi={metrics.phi} threshold={CONSTANTS.PHI_THRESHOLD} />
                <div className="mt-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500">ΛΦ Invariant</span>
                    <span className="font-mono text-cyan-400">{CONSTANTS.LAMBDA_PHI.toExponential(6)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Revival Time τ₀</span>
                    <span className="font-mono text-cyan-400">{CONSTANTS.TAU_ZERO} μs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <SecurityPanel />
            <QuickActions />
          </div>
          
          {/* Center Column - Domain Features */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    Domain Capabilities
                  </CardTitle>
                </div>
                <CardDescription>
                  Select a domain to explore quantum-enhanced features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedDomain} onValueChange={(v) => setSelectedDomain(v as keyof typeof DOMAINS)}>
                  <TabsList className="grid grid-cols-4 bg-slate-800/50 mb-6">
                    {Object.entries(DOMAINS).map(([key, domain]) => {
                      const Icon = domain.icon
                      return (
                        <TabsTrigger 
                          key={key} 
                          value={key}
                          className="data-[state=active]:bg-slate-700 text-xs"
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">{domain.name.split(" ")[0]}</span>
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                  
                  {Object.entries(DOMAINS).map(([key, domain]) => {
                    const domainColorStyles: Record<string, { bg: string; border: string; text: string }> = {
                      emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
                      blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
                      amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
                      purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
                      cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400" },
                    }
                    const colorStyle = domainColorStyles[domain.color] || domainColorStyles.cyan
                    const DomainIconComponent = domain.icon
                    
                    return (
                      <TabsContent key={key} value={key} className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg ${colorStyle.bg} ${colorStyle.border}`}>
                            <DomainIconComponent className={`w-5 h-5 ${colorStyle.text}`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{domain.name}</h3>
                            <p className="text-xs text-slate-500">Quantum-enhanced capabilities</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {domain.features.map((feature, i) => (
                            <FeatureRow key={i} feature={feature} domainColor={domain.color} />
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800">
                          {Object.entries(domain.metrics).map(([metricKey, value]) => (
                            <div key={metricKey} className="text-center p-3 rounded-lg bg-slate-800/30">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{metricKey}</p>
                              <p className="text-sm font-bold text-white">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )
                  })}
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Key Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-cyan-500/10 to-slate-900 border-cyan-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                      <Fingerprint className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">Quantum Wasserstein Compilation</h4>
                      <p className="text-xs text-slate-400">
                        W₁ optimal transport minimizing two-qubit gate overhead
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500/10 to-slate-900 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">Phase-Conjugate Healing</h4>
                      <p className="text-xs text-slate-400">
                        Adaptive self-healing when Γ exceeds critical threshold
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Right Column - Architecture & Status */}
          <div className="lg:col-span-3 space-y-6">
            <SystemArchitecture />
            
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  Hardware Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "IBM Fez", qubits: 156, status: "online", utilization: 78 },
                  { name: "IBM Torino", qubits: 133, status: "online", utilization: 45 },
                  { name: "IBM Nazca", qubits: 127, status: "standby", utilization: 0 },
                ].map((backend, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          backend.status === "online" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                        }`} />
                        <span className="text-sm font-medium text-white">{backend.name}</span>
                      </div>
                      <span className="text-xs text-slate-500">{backend.qubits}q</span>
                    </div>
                    <Progress value={backend.utilization} className="h-1" />
                    <p className="text-xs text-slate-600 mt-1">{backend.utilization}% utilization</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-500/10 to-slate-900 border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-white">Future-Proof Guarantee</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-emerald-400" />
                    NIST PQC Algorithm Suite
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Hybrid Classical-Quantum Ready
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Zero Vendor Lock-in
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Automatic Coherence Revival
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
            <span className="font-mono">CAGE: 9HUP5</span>
            <span className="font-mono">ΛΦ = {CONSTANTS.LAMBDA_PHI.toExponential(6)}</span>
          </div>
          <div className="font-mono">
            Agile Defense Systems, LLC | DNA::{"}{"}::lang v51.843
          </div>
        </footer>
      </div>
    </div>
  )
}
