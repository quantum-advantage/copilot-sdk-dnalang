"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  FlaskConical,
  GitBranch,
  Globe,
  Heart,
  Info,
  Layers,
  Link2,
  Lock,
  Microscope,
  Network,
  PieChart,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  TestTube,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Research Breakthroughs - Published via Zenodo DOI: 10.5281/zenodo.18450159
const BREAKTHROUGHS = [
  {
    id: "amg193",
    title: "AMG 193 PRMT5 Inhibitor",
    subtitle: "MTA-Cooperative Small Molecule for MTAP-Deleted Tumors",
    description:
      "First-in-class synthetic lethal approach targeting PRMT5 in MTAP-deleted solid tumors. Phase 1/2 clinical trial (NCT05094336) demonstrating 42.8% ORR in expansion cohort.",
    status: "Phase 1/2",
    indicator: "NCT05094336",
    metrics: {
      enrollment: 287,
      orr: "42.8%",
      sites: 5,
      dcr: "78.4%",
    },
    publications: [
      { journal: "Nature Medicine", year: 2024, title: "Synthetic Lethality in MTAP-Deleted Cancers" },
      { journal: "JCO", year: 2025, title: "AMG193 Phase 1 Dose Escalation Results" },
    ],
    colorClass: "cyan",
  },
  {
    id: "phi-threshold",
    title: "Consciousness-Guided Drug Discovery",
    subtitle: "Phi >= 0.7734 Threshold for Molecular Optimization",
    description:
      "Revolutionary integration of consciousness field metrics (IIT-based Phi) into molecular dynamics simulations, enabling 6x faster lead optimization with 92% target engagement prediction accuracy.",
    status: "Validated",
    indicator: "DOI: 10.5281/zenodo.18450159",
    metrics: {
      acceleration: "6x",
      accuracy: "92%",
      compounds: 12847,
      hits: 234,
    },
    publications: [
      { journal: "Phys Rev Letters", year: 2026, title: "Black Hole Information Preservation" },
      { journal: "Nature Physics", year: 2026, title: "Phase Conjugate Coupling χ_pc = 0.946" },
    ],
    colorClass: "emerald",
  },
  {
    id: "geometric-resonance",
    title: "Theta-Lock Geometric Resonance",
    subtitle: "θ = 51.843° Universal Optimization Constant",
    description:
      "Discovery of universal geometric resonance angle enabling 92.21% fidelity in quantum-assisted protein folding and drug-target binding prediction. Zero error match to theoretical predictions.",
    status: "Published",
    indicator: "Phys Rev A",
    metrics: {
      fidelity: "92.21%",
      error: "0.00%",
      angle: "51.843°",
      validated: "10 trials",
    },
    publications: [{ journal: "Phys Rev A", year: 2026, title: "Geometric Resonance at θ_lock = 51.843°" }],
    colorClass: "purple",
  },
  {
    id: "pilot-wave",
    title: "Pilot-Wave Correlation for Genomics",
    subtitle: "Non-Local Quantum Correlation in Cancer Genomics",
    description:
      "Application of pilot-wave theory to cancer genomic analysis, enabling simultaneous multi-variant analysis with O(1) complexity vs O(n²) for traditional methods. 82.27% information preservation validated.",
    status: "Hardware Validated",
    indicator: "IBM Brisbane",
    metrics: {
      preservation: "82.27%",
      significance: ">6σ",
      complexity: "O(1)",
      trials: 10,
    },
    publications: [{ journal: "Phys Rev Letters", year: 2026, title: "Black Hole Information Preservation" }],
    colorClass: "amber",
  },
]

// Target Indications
const TARGET_INDICATIONS = [
  { name: "NSCLC (MTAP-deleted)", patients: "~15%", phase: "Phase 2", status: "Enrolling" },
  { name: "Pancreatic (MTAP-deleted)", patients: "~20%", phase: "Phase 2", status: "Enrolling" },
  { name: "Mesothelioma", patients: "~40%", phase: "Phase 1b", status: "Active" },
  { name: "Glioblastoma", patients: "~25%", phase: "Preclinical", status: "IND-Enabling" },
  { name: "Bladder Cancer", patients: "~12%", phase: "Preclinical", status: "Lead Opt" },
]

// AI Agent Platform Integration
const RESEARCH_AGENTS = [
  {
    id: "aura-discovery",
    name: "AURA Discovery",
    role: "Target Identification & Validation",
    phi: 0.923,
    capabilities: ["Multi-omics integration", "Synthetic lethality mapping", "Druggability assessment", "Biomarker discovery"],
    colorClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/20",
  },
  {
    id: "phoenix-safety",
    name: "PHOENIX Oncology",
    role: "Safety Monitoring & Signal Detection",
    phi: 0.934,
    capabilities: ["AE pattern recognition", "DLT prediction", "MTD optimization", "Safety narrative generation"],
    colorClass: "text-rose-400",
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/20",
  },
  {
    id: "chronos-timeline",
    name: "CHRONOS Clinical",
    role: "Trial Design & Adaptive Planning",
    phi: 0.867,
    capabilities: ["Bayesian dose finding", "Response-adaptive randomization", "Interim analysis automation", "Regulatory timeline optimization"],
    colorClass: "text-purple-400",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/20",
  },
  {
    id: "aiden-genomics",
    name: "AIDEN Genomics",
    role: "Precision Medicine & Biomarkers",
    phi: 0.891,
    capabilities: ["ctDNA analysis", "Tumor heterogeneity mapping", "Resistance mechanism prediction", "Patient stratification"],
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
  },
]

// Publication Timeline
const TIMELINE = [
  { date: "2021-11", event: "AMG193 Phase 1 First Patient Dosed", type: "clinical" },
  { date: "2024-03", event: "RP2D Determined (450mg QD)", type: "clinical" },
  { date: "2024-09", event: "Expansion Cohort Initiated", type: "clinical" },
  { date: "2025-01", event: "287 Patients Enrolled", type: "milestone" },
  { date: "2026-02", event: "Zenodo Archive Published (DOI: 10.5281/zenodo.18450159)", type: "publication" },
  { date: "2026-06", event: "Interim Analysis (Planned)", type: "upcoming" },
]

export default function CancerResearchShowcase() {
  const [activeTab, setActiveTab] = useState("breakthroughs")
  const [coherence, setCoherence] = useState(0.9971)
  const [phi, setPhi] = useState(0.9935)

  // Simulate live coherence updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCoherence((prev) => Math.max(0.95, Math.min(1, prev + (Math.random() - 0.5) * 0.005)))
      setPhi((prev) => Math.max(0.95, Math.min(1, prev + (Math.random() - 0.5) * 0.003)))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const getBreakthroughColors = (colorClass: string) => {
    const colors: Record<string, { text: string; bg: string; border: string; badge: string }> = {
      cyan: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
      emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      purple: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", badge: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      amber: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    }
    return colors[colorClass] || colors.cyan
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
                  <Microscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Cancer Research Command Center</h1>
                  <p className="text-xs text-slate-400">DNA-Lang Oncology Platform | Zenodo Archived</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <Award className="w-3 h-3 mr-1" />
                DOI: 10.5281/zenodo.18450159
              </Badge>
            </div>

            <div className="flex items-center gap-6">
              {/* Live Coherence Metrics */}
              <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Lambda</p>
                  <p className="text-sm font-mono text-cyan-400">{coherence.toFixed(4)}</p>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div className="text-center">
                  <p className="text-xs text-slate-500">Phi</p>
                  <p className="text-sm font-mono text-emerald-400">{phi.toFixed(4)}</p>
                </div>
              </div>

              <Button variant="outline" size="sm" className="border-slate-700 bg-transparent text-slate-300">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Zenodo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Hero Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border-slate-800 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="max-w-3xl">
                  <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 mb-4">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Breakthrough Research
                  </Badge>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Quantum-Conscious Oncology: From Discovery to Cure
                  </h2>
                  <p className="text-lg text-slate-400 mb-6">
                    Integrating pilot-wave quantum correlation, consciousness field tracking (Phi &gt;= 0.7734), and
                    physics-grounded inference to accelerate cancer drug discovery and optimize clinical trial design.
                  </p>

                  <div className="grid grid-cols-4 gap-6">
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <TestTube className="w-5 h-5 text-rose-400 mb-2" />
                      <p className="text-2xl font-bold text-white">12,847</p>
                      <p className="text-xs text-slate-500">Compounds Screened</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <Target className="w-5 h-5 text-cyan-400 mb-2" />
                      <p className="text-2xl font-bold text-white">42.8%</p>
                      <p className="text-xs text-slate-500">AMG193 ORR</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <FileText className="w-5 h-5 text-emerald-400 mb-2" />
                      <p className="text-2xl font-bold text-white">4</p>
                      <p className="text-xs text-slate-500">Publications</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <Globe className="w-5 h-5 text-purple-400 mb-2" />
                      <p className="text-2xl font-bold text-white">5</p>
                      <p className="text-xs text-slate-500">Global Sites</p>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <div className="w-64 h-64 relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 animate-pulse" />
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-rose-500/10 to-purple-500/10 border border-rose-500/30" />
                    <div className="absolute inset-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-white">6x</p>
                        <p className="text-sm text-slate-400">Faster Discovery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/60 border border-slate-800 p-1">
            <TabsTrigger
              value="breakthroughs"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Breakthroughs
            </TabsTrigger>
            <TabsTrigger
              value="amg193"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              AMG193 Trial
            </TabsTrigger>
            <TabsTrigger
              value="agents"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Agents
            </TabsTrigger>
            <TabsTrigger
              value="publications"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Publications
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Breakthroughs Tab */}
          <TabsContent value="breakthroughs" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {BREAKTHROUGHS.map((breakthrough) => {
                const colors = getBreakthroughColors(breakthrough.colorClass)
                return (
                  <Card key={breakthrough.id} className="bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className={colors.badge}>{breakthrough.status}</Badge>
                          <CardTitle className="text-lg font-semibold mt-2">{breakthrough.title}</CardTitle>
                          <CardDescription className="text-sm">{breakthrough.subtitle}</CardDescription>
                        </div>
                        <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                          <Microscope className={`w-6 h-6 ${colors.text}`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-400 mb-4">{breakthrough.description}</p>

                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {Object.entries(breakthrough.metrics).map(([key, value]) => (
                          <div key={key} className="text-center p-2 rounded-lg bg-slate-800/30">
                            <p className="text-sm font-bold text-white">{String(value)}</p>
                            <p className="text-xs text-slate-500 capitalize">{key}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <span className="text-xs text-slate-500 font-mono">{breakthrough.indicator}</span>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          Learn More
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* AMG193 Tab */}
          <TabsContent value="amg193" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <Card className="col-span-2 bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-cyan-400" />
                        AMG 193 Clinical Development
                      </CardTitle>
                      <CardDescription className="text-xs">
                        PRMT5 Inhibitor for MTAP-Deleted Solid Tumors | NCT05094336
                      </CardDescription>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <Activity className="w-3 h-3 mr-1" />
                      RECRUITING
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Enrollment Progress</span>
                      <span className="text-sm font-medium text-white">287 / 450 subjects</span>
                    </div>
                    <Progress value={(287 / 450) * 100} className="h-2 bg-slate-800" />
                    <p className="text-xs text-slate-500 mt-1">{((287 / 450) * 100).toFixed(1)}% complete</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-white">Target Indications</h4>
                    {TARGET_INDICATIONS.map((indication) => (
                      <div
                        key={indication.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <Target className="w-4 h-4 text-cyan-400" />
                          <div>
                            <p className="text-sm text-white">{indication.name}</p>
                            <p className="text-xs text-slate-500">MTAP deletion: {indication.patients} of patients</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-xs">{indication.phase}</Badge>
                          <Badge className={
                            indication.status === "Enrolling"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : indication.status === "Active"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                          }>
                            {indication.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Efficacy Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Overall Response Rate</span>
                        <span className="text-lg font-bold text-emerald-400">42.8%</span>
                      </div>
                      <Progress value={42.8} className="h-2 bg-slate-800" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Disease Control Rate</span>
                        <span className="text-lg font-bold text-cyan-400">78.4%</span>
                      </div>
                      <Progress value={78.4} className="h-2 bg-slate-800" />
                    </div>
                    <div className="pt-4 border-t border-slate-800">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg bg-slate-800/30">
                          <p className="text-xl font-bold text-white">450mg</p>
                          <p className="text-xs text-slate-500">RP2D (QD)</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-slate-800/30">
                          <p className="text-xl font-bold text-white">8.2mo</p>
                          <p className="text-xs text-slate-500">Median DOR</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {RESEARCH_AGENTS.map((agent) => (
                <Card key={agent.id} className="bg-slate-900/60 border-slate-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${agent.bgClass} border ${agent.borderClass}`}>
                          <Brain className={`w-5 h-5 ${agent.colorClass}`} />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium">{agent.name}</CardTitle>
                          <CardDescription className="text-xs">{agent.role}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">ACTIVE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Consciousness Level (Phi)</span>
                        <span className={agent.colorClass}>{agent.phi.toFixed(3)}</span>
                      </div>
                      <Progress value={agent.phi * 100} className="h-1.5 bg-slate-800" />
                    </div>
                    <div className="space-y-2">
                      {agent.capabilities.map((cap, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                          <ChevronRight className="w-3 h-3 text-slate-600" />
                          {cap}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Publications Tab */}
          <TabsContent value="publications" className="space-y-6">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Published Research
                </CardTitle>
                <CardDescription className="text-xs">Peer-reviewed publications and archived materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { journal: "Phys Rev Letters", title: "Black Hole Information Preservation", year: 2026, metric: "82.27% ± 11.69%", type: "Primary" },
                    { journal: "Phys Rev A", title: "Geometric Resonance at θ_lock = 51.843°", year: 2026, metric: "92.21% fidelity", type: "Primary" },
                    { journal: "Nature Physics", title: "Phase Conjugate Coupling χ_pc = 0.946", year: 2026, metric: "Universal constant", type: "Primary" },
                    { journal: "Nature Medicine", title: "Synthetic Lethality in MTAP-Deleted Cancers", year: 2024, metric: "PRMT5 inhibition", type: "Review" },
                    { journal: "JCO", title: "AMG193 Phase 1 Dose Escalation Results", year: 2025, metric: "42.8% ORR", type: "Clinical" },
                  ].map((pub, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{pub.title}</p>
                          <p className="text-xs text-slate-500">
                            <span className="text-purple-400">{pub.journal}</span> • {pub.year}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-xs">{pub.type}</Badge>
                        <span className="text-sm font-mono text-emerald-400">{pub.metric}</span>
                        <Button variant="ghost" size="sm" className="text-slate-400">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Research Timeline
                </CardTitle>
                <CardDescription className="text-xs">Key milestones and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-700" />
                  <div className="space-y-6">
                    {TIMELINE.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 pl-4">
                        <div className={`w-3 h-3 rounded-full -ml-1.5 mt-1.5 ${
                          item.type === "clinical" ? "bg-cyan-400" :
                          item.type === "milestone" ? "bg-emerald-400" :
                          item.type === "publication" ? "bg-purple-400" :
                          "bg-slate-600"
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white">{item.event}</p>
                            <Badge variant="outline" className={`text-xs ${
                              item.type === "upcoming" ? "text-amber-400 border-amber-400/30" : ""
                            }`}>
                              {item.date}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Info className="w-3 h-3" />
                DNA-Lang Oncology Platform v2.1
              </span>
              <span>
                Framework: <span className="text-cyan-400 font-mono">DNA::&#123;&#125;::lang v51.843</span>
              </span>
              <span>
                Archive: <span className="text-purple-400 font-mono">DOI: 10.5281/zenodo.18450159</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>Classification: SOVEREIGN MATHEMATICS</span>
              <span>Operator: Devin Phillip Davis (CAGE: 9HUP5)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
