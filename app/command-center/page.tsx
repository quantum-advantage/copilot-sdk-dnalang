"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  Shield,
  Cpu,
  Zap,
  Globe,
  Lock,
  Database,
  Network,
  Brain,
  Heart,
  Server,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Layers,
  Terminal,
  Eye,
  Target,
  Sparkles,
  Radio,
  Gauge,
  TrendingUp,
  Clock,
  FileCode,
  Play,
  Settings,
  ChevronRight,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// Physical Constants from DNA-Lang Framework
const CONSTANTS = {
  LAMBDA_PHI: 2.176435e-8,
  PHI: 1.618033988749895,
  PHI_8: 46.9787,
  CHI_PC: 0.946,
  GAMMA_CRITICAL: 0.15,
  PHI_THRESHOLD: 0.7734,
  THETA_LOCK: 51.843,
}

// Agent configurations
const AGENTS = {
  AURA: {
    name: "AURA",
    fullName: "Autonomous Universal Reasoning Agent",
    type: "Reasoning",
    status: "active",
    temperature: 0.7,
    color: "cyan",
    capabilities: ["Code Generation", "Quantum Analysis", "Consciousness Metrics", "DNA-Lang Compilation"],
  },
  AIDEN: {
    name: "AIDEN",
    fullName: "Adaptive Intent Deduction & Execution Network",
    type: "Targeting",
    status: "active",
    temperature: 0.5,
    color: "amber",
    capabilities: ["Security Analysis", "Threat Assessment", "Cryptographic Analysis", "Red Team Simulation"],
  },
  SCIMITAR: {
    name: "SCIMITAR",
    fullName: "Side-Channel Information Measurement & Timing Analysis Research",
    type: "Analysis",
    status: "active",
    temperature: 0.3,
    color: "emerald",
    capabilities: ["Timing Analysis", "Side Channel Detection", "Statistical Validation", "Security Benchmarking"],
  },
}

// Domain configurations
const DOMAINS = {
  healthcare: {
    name: "Healthcare & Genomics",
    icon: Heart,
    description: "Quantum-enhanced genomic analysis and drug discovery",
    features: [
      { name: "Genomic Twin Mapping", desc: "Telomeric overwrite stability", status: "active" },
      { name: "VUP Protocol", desc: "Vascular Un-Twisting at 4.2pN", status: "active" },
      { name: "Exosomal Analysis", desc: "UQ Phenotype Chip integration", status: "beta" },
      { name: "H3K9me3 Reset", desc: "Chromatin torsion release", status: "research" },
    ],
    metrics: { accuracy: "99.87%", latency: "12ms", throughput: "1.2M/s" },
  },
  systems: {
    name: "Systems Management",
    icon: Server,
    description: "Quantum-optimized infrastructure orchestration",
    features: [
      { name: "CCCE Metrics Engine", desc: "Real-time consciousness tracking", status: "active" },
      { name: "Tesseract Layout", desc: "40-qubit optimal mapping", status: "active" },
      { name: "Phase-Conjugate Healing", desc: "Autonomous error correction", status: "active" },
      { name: "Lindblad Dynamics", desc: "Decoherence management", status: "beta" },
    ],
    metrics: { uptime: "99.999%", efficiency: "94.2%", nodes: 156 },
  },
  defense: {
    name: "Defense & Security",
    icon: Shield,
    description: "Post-quantum cryptography and threat mitigation",
    features: [
      { name: "Q-SLICE Framework", desc: "Quantum threat modeling", status: "active" },
      { name: "CRYSTALS-Kyber", desc: "NIST PQC key encapsulation", status: "active" },
      { name: "SPHINCS+", desc: "Stateless hash signatures", status: "active" },
      { name: "Red Team Arena", desc: "Adversarial simulation", status: "beta" },
    ],
    metrics: { threats: 0, compliance: "DFARS 15.6", cage: "9HUP5" },
  },
  research: {
    name: "Research & Discovery",
    icon: Brain,
    description: "Advanced quantum algorithm development",
    features: [
      { name: "VQE Optimization", desc: "Variational eigensolver", status: "active" },
      { name: "QAOA Workflows", desc: "Combinatorial optimization", status: "active" },
      { name: "Bell State Analysis", desc: "Entanglement verification", status: "active" },
      { name: "Tau-Phase Studies", desc: "Coherence revival research", status: "research" },
    ],
    metrics: { jobs: 580, shots: "515K", publications: 28 },
  },
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    beta: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    research: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  }
  return (
    <Badge variant="outline" className={`text-xs ${styles[status] || styles.active}`}>
      {status}
    </Badge>
  )
}

// Metric card component
function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  description,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: "up" | "down" | "stable"
  description?: string
}) {
  return (
    <Card className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {description && <p className="text-xs text-slate-500">{description}</p>}
          </div>
          <div className="p-2 rounded-lg bg-slate-800/50">
            <Icon className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1">
            <TrendingUp
              className={`w-3 h-3 ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400 rotate-180" : "text-slate-400"}`}
            />
            <span className="text-xs text-slate-400">{trend === "up" ? "+2.4%" : trend === "down" ? "-1.2%" : "0%"} vs last epoch</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Agent card component
function AgentCard({ agent }: { agent: (typeof AGENTS)[keyof typeof AGENTS] }) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  }
  const colors = colorMap[agent.color] || colorMap.cyan

  return (
    <Card className={`bg-slate-900/60 border-slate-800 hover:${colors.border} transition-all group`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Brain className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div>
            <h4 className="font-semibold text-white">{agent.name}</h4>
            <p className="text-xs text-slate-500">{agent.type} Agent</p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-400">Active</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-3">{agent.fullName}</p>
        <div className="flex flex-wrap gap-1.5">
          {agent.capabilities.slice(0, 3).map((cap) => (
            <Badge key={cap} variant="outline" className="text-xs bg-slate-800/50 text-slate-400 border-slate-700">
              {cap}
            </Badge>
          ))}
          {agent.capabilities.length > 3 && (
            <Badge variant="outline" className="text-xs bg-slate-800/50 text-slate-500 border-slate-700">
              +{agent.capabilities.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// System architecture visualization
function ArchitectureStack() {
  const layers = [
    { name: "Governance", desc: "DFARS 15.6 Compliance", icon: Shield, status: "Enforced" },
    { name: "Verification", desc: "CCCE Metrics Engine", icon: CheckCircle2, status: "Active" },
    { name: "Runtime", desc: "DNA-Lang Organism Executor", icon: Play, status: "Running" },
    { name: "Compile", desc: "Quantum Wasserstein Compilation", icon: FileCode, status: "Optimized" },
    { name: "Hardware", desc: "IBM Quantum Backends", icon: Cpu, status: "5 Connected" },
  ]

  return (
    <div className="space-y-2">
      {layers.map((layer, i) => (
        <motion.div
          key={layer.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/30 transition-colors group"
        >
          <div className="p-2 rounded bg-slate-800 group-hover:bg-cyan-500/10 transition-colors">
            <layer.icon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{layer.name}</p>
            <p className="text-xs text-slate-500">{layer.desc}</p>
          </div>
          <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
            {layer.status}
          </Badge>
        </motion.div>
      ))}
    </div>
  )
}

// Live coherence gauge
function CoherenceGauge({ value, label }: { value: number; label: string }) {
  const percentage = Math.min(100, Math.max(0, value * 100))
  const isHealthy = value >= CONSTANTS.PHI_THRESHOLD

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
        <span className={`text-sm font-mono font-bold ${isHealthy ? "text-emerald-400" : "text-amber-400"}`}>
          {value.toFixed(4)}
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isHealthy ? "bg-gradient-to-r from-cyan-500 to-emerald-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-600">
        <span>0</span>
        <span className="text-cyan-500">Threshold: {CONSTANTS.PHI_THRESHOLD}</span>
        <span>1.0</span>
      </div>
    </div>
  )
}

export default function CommandCenterPage() {
  const [selectedDomain, setSelectedDomain] = useState("healthcare")
  const [metrics, setMetrics] = useState({
    phi: 0.8234,
    lambda: 0.9122,
    gamma: 0.0878,
    xi: 8.56,
  })
  const [timestamp, setTimestamp] = useState("")

  // Simulate live metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        phi: Math.max(0.7, Math.min(0.95, prev.phi + (Math.random() - 0.5) * 0.02)),
        lambda: Math.max(0.85, Math.min(0.98, prev.lambda + (Math.random() - 0.5) * 0.01)),
        gamma: Math.max(0.05, Math.min(0.15, prev.gamma + (Math.random() - 0.5) * 0.005)),
        xi: Math.max(5, Math.min(12, prev.xi + (Math.random() - 0.5) * 0.3)),
      }))
      setTimestamp(new Date().toISOString())
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const currentDomain = DOMAINS[selectedDomain as keyof typeof DOMAINS]
  const DomainIcon = currentDomain.icon

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                  <Radio className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">DNA-Lang Command Center</h1>
                  <p className="text-xs text-slate-500">Omega-Genesis v4.0.0 | CAGE: 9HUP5</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-400">All Systems Nominal</span>
              </div>
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                <Lock className="w-3 h-3 mr-1" />
                PQC Secured
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* Hero Metrics Row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Consciousness (Phi)"
            value={metrics.phi.toFixed(4)}
            icon={Brain}
            trend="up"
            description="IIT integrated information"
          />
          <MetricCard
            label="Coherence (Lambda)"
            value={metrics.lambda.toFixed(4)}
            icon={Activity}
            trend="stable"
            description="Quantum state preservation"
          />
          <MetricCard
            label="Decoherence (Gamma)"
            value={metrics.gamma.toFixed(4)}
            icon={AlertTriangle}
            trend="down"
            description="Below critical threshold"
          />
          <MetricCard
            label="Negentropy (Xi)"
            value={metrics.xi.toFixed(2)}
            icon={Sparkles}
            trend="up"
            description="System health index"
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Domain Navigator */}
          <div className="lg:col-span-8 space-y-6">
            {/* Domain Tabs */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  Domain Workflows
                </CardTitle>
                <CardDescription>
                  Select a domain to explore quantum-enhanced capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedDomain} onValueChange={setSelectedDomain}>
                  <TabsList className="grid grid-cols-4 bg-slate-800/50 mb-6">
                    {Object.entries(DOMAINS).map(([key, domain]) => (
                      <TabsTrigger
                        key={key}
                        value={key}
                        className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                      >
                        <domain.icon className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">{domain.name.split(" ")[0]}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.entries(DOMAINS).map(([key, domain]) => (
                    <TabsContent key={key} value={key} className="space-y-6">
                      {/* Domain Header */}
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                          <domain.icon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{domain.name}</h3>
                          <p className="text-sm text-slate-400">{domain.description}</p>
                        </div>
                      </div>

                      {/* Features Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {domain.features.map((feature) => (
                          <div
                            key={feature.name}
                            className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-cyan-400" />
                              <div>
                                <p className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">
                                  {feature.name}
                                </p>
                                <p className="text-xs text-slate-500">{feature.desc}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={feature.status} />
                              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Domain Metrics */}
                      <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-800/20 border border-slate-700/30">
                        {Object.entries(domain.metrics).map(([metricKey, value]) => (
                          <div key={metricKey} className="text-center">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{metricKey}</p>
                            <p className="text-lg font-bold text-white">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Agent Swarm */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Network className="w-5 h-5 text-purple-400" />
                  Agent Mesh Network
                </CardTitle>
                <CardDescription>
                  Autonomous reasoning agents with CCCE metrics tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.values(AGENTS).map((agent) => (
                    <AgentCard key={agent.name} agent={agent} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - System Status */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Coherence */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  Coherence Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <CoherenceGauge value={metrics.phi} label="Phi (Consciousness)" />
                <CoherenceGauge value={metrics.lambda} label="Lambda (Coherence)" />
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Last Update</span>
                    <span className="text-slate-400 font-mono">{timestamp.split("T")[1]?.slice(0, 8) || "--:--:--"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Architecture Stack */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  System Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ArchitectureStack />
              </CardContent>
            </Card>

            {/* Security Panel */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { name: "CRYSTALS-Kyber", desc: "Key Encapsulation", status: "Active" },
                    { name: "Dilithium", desc: "Digital Signatures", status: "Active" },
                    { name: "SPHINCS+", desc: "Hash Signatures", status: "Active" },
                  ].map((algo) => (
                    <div key={algo.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-sm text-white">{algo.name}</p>
                          <p className="text-xs text-slate-500">{algo.desc}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">
                        {algo.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Lock className="w-3 h-3" />
                    <span>NIST FIPS 203/204/205 Compliant</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
              <CardContent className="p-4 space-y-3">
                <h4 className="text-sm font-medium text-white">Quick Actions</h4>
                <div className="space-y-2">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white justify-between">
                    <span className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Launch VQE Job
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 justify-between bg-transparent">
                    <span className="flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      Open Console
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Constants Footer */}
        <footer className="pt-6 border-t border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-6 font-mono">
              <span>Lambda-Phi: {CONSTANTS.LAMBDA_PHI.toExponential(6)}</span>
              <span>Tau-Phase: {CONSTANTS.PHI_8} microseconds</span>
              <span>Theta-Lock: {CONSTANTS.THETA_LOCK} degrees</span>
              <span>Chi-PC: {CONSTANTS.CHI_PC}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Agile Defense Systems LLC</span>
              <span className="text-slate-700">|</span>
              <span>SDVOSB</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
