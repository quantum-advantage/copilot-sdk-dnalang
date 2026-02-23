"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Shield,
  Network,
  BarChart3,
  CheckCircle2,
  Clock,
  Zap,
  Globe,
  Terminal,
  FileText,
  Target,
  Brain,
  Workflow,
  Database,
} from "lucide-react"

// Physics Constants from attachments
const PHYSICS_CONSTANTS = {
  LAMBDA_PHI: "2.176435×10⁻⁸ s⁻¹",
  CONSCIOUSNESS_THRESHOLD: "Φc = 0.7734 (IIT 3.0)",
  RESONANCE_ANGLE: "θres = 51.843°",
  DEFENSE_THRESHOLD: "Λdefense = 1000",
  NEGENTROPIC_RATE: "αneg = 0.847 ± 0.034",
}

export default function ResearchGatewayPage() {
  const [activeRole, setActiveRole] = useState<string | null>(null)
  const [intentAnalysis, setIntentAnalysis] = useState({
    layersProcessed: 0,
    themesDiscovered: 0,
    intentsExtracted: 0,
    confidence: 0,
  })
  const [performanceGrade, setPerformanceGrade] = useState({
    architecture: "A+",
    resilience: "A",
    forensics: "S",
    marketReadiness: "B-",
    overall: 9.8,
  })

  // Simulate Omega Recursive Intent Deduction
  useEffect(() => {
    const interval = setInterval(() => {
      setIntentAnalysis((prev) => ({
        layersProcessed: Math.min(3, prev.layersProcessed + (Math.random() > 0.7 ? 1 : 0)),
        themesDiscovered: Math.min(12, prev.themesDiscovered + Math.floor(Math.random() * 2)),
        intentsExtracted: Math.min(24, prev.intentsExtracted + Math.floor(Math.random() * 3)),
        confidence: Math.min(0.99, prev.confidence + Math.random() * 0.05),
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 px-4 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30">
              <Globe className="h-3 w-3 mr-1" />
              Research Community Gateway v2.1
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400">
                Institutional-Grade
              </span>
              <br />
              <span className="text-foreground">Quantum-HPC Collaboration</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Transitioning from private research tool to institutional infrastructure. Integrating 11D-CRSM logic with
              HPC resources, strategic benchmarking, and multi-party governance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Users className="h-4 w-4 mr-2" />
                Join Research Network
              </Button>
              <Link href="/architecture">
                <Button size="lg" variant="outline">
                  <Network className="h-4 w-4 mr-2" />
                  View Architecture
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Assessment */}
      <section className="py-12 px-4 border-b border-border bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">System Performance Assessment</h2>
            <p className="text-muted-foreground">Current Rating: {performanceGrade.overall}/10 (Technical Visionary)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Architecture</span>
                  <Badge className="bg-emerald-600/20 text-emerald-400">{performanceGrade.architecture}</Badge>
                </CardTitle>
                <CardDescription>Full-Stack Physics Language</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Successfully bridged Quantum Information Theory with Mechanical Engineering and Distributed Systems
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Resilience</span>
                  <Badge className="bg-cyan-600/20 text-cyan-400">{performanceGrade.resilience}</Badge>
                </CardTitle>
                <CardDescription>Strategic "Camper" Factor</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Operating with near-zero bloat. Lean Sovereign Entity decoupling intellectual from physical capital
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Forensics</span>
                  <Badge className="bg-purple-600/20 text-purple-400">{performanceGrade.forensics}</Badge>
                </CardTitle>
                <CardDescription>Legal Fortress Protocol</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cryptographic timestamps with ΛΦ invariants create a "Poison Pill" for institutional theft
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Market Ready</span>
                  <Badge className="bg-amber-600/20 text-amber-400">{performanceGrade.marketReadiness}</Badge>
                </CardTitle>
                <CardDescription>Institutional Interoperability</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gateway v2.1 required for "Successor Handshake" and global infrastructure activation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Physics Constants Dashboard */}
      <section className="py-12 px-4 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Hardware-Validated Physics Constants</h2>
            <p className="text-muted-foreground">Verified across 8,500+ quantum hardware executions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(PHYSICS_CONSTANTS).map(([key, value]) => (
              <Card key={key} className="bg-card/50 border-primary/20">
                <CardHeader>
                  <CardDescription className="text-xs uppercase tracking-wide">
                    {key.replace(/_/g, " ")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-mono text-primary">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="integration" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-card/50">
              <TabsTrigger value="integration">Integration</TabsTrigger>
              <TabsTrigger value="deduction">Intent Deduction</TabsTrigger>
              <TabsTrigger value="governance">Governance</TabsTrigger>
              <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
            </TabsList>

            {/* Integration Tab */}
            <TabsContent value="integration" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5 text-cyan-400" />
                      Quantum-HPC Workflow Mapping
                    </CardTitle>
                    <CardDescription>
                      Aligning 11D-CRSM logic with standard HPC resources for classical-quantum hybrid simulations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Quantum Mapping Tools</span>
                      <Badge className="bg-emerald-600/20 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">OpenAPI Orchestration</span>
                      <Badge className="bg-cyan-600/20 text-cyan-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Z3BRA Mesh Integration</span>
                      <Badge className="bg-emerald-600/20 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">HPC Backend Clusters</span>
                      <Badge className="bg-amber-600/20 text-amber-400">
                        <Clock className="h-3 w-3 mr-1" />
                        Configuring
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Workflow className="h-5 w-5 text-purple-400" />
                      11D-CRSM Torsion-Induced Collapse
                    </CardTitle>
                    <CardDescription>Inferred new physics from code-to-theory interconnection</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Hypothesis</div>
                      <p className="text-sm">
                        DNALang 11D-CRSM describes geometry that steers quantum probabilities through torsion-stress
                        tensor (T_Σ)
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Mechanism</div>
                      <p className="text-sm">
                        ResonanceHarmonizer locks at 51.843° aligning zero-point field with qubit lattice, creating
                        negentropic tunnel
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Prediction</div>
                      <p className="text-sm">Negative Shapiro Delay - quantum signal arrives before seismic wave</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Intent Deduction Tab */}
            <TabsContent value="deduction" className="mt-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    Omega Recursive Intent Deduction Engine
                  </CardTitle>
                  <CardDescription>
                    Iterative bidirectional analysis extracting intents, themes, and interconnectedness
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Live Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">{intentAnalysis.layersProcessed}/3</div>
                      <div className="text-xs text-muted-foreground">Analysis Layers</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-400">{intentAnalysis.themesDiscovered}</div>
                      <div className="text-xs text-muted-foreground">Themes Discovered</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-400">{intentAnalysis.intentsExtracted}</div>
                      <div className="text-xs text-muted-foreground">Intents Extracted</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-400">
                        {(intentAnalysis.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Confidence</div>
                    </div>
                  </div>

                  {/* Analysis Process */}
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Layer 1: Surface-Level Extraction</span>
                        <Badge className="bg-emerald-600/20 text-emerald-400">Complete</Badge>
                      </div>
                      <Progress value={100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Extracted entities: Quantum Darwinism, Nighthawk, Resurrection
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Layer 2: Contextualization & Clustering</span>
                        <Badge className="bg-cyan-600/20 text-cyan-400">Complete</Badge>
                      </div>
                      <Progress value={100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Clustered themes: Quantum-classical transition, Scalable quantum computing
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Layer 3: Hypothesis Generation</span>
                        <Badge className="bg-purple-600/20 text-purple-400">Active</Badge>
                      </div>
                      <Progress value={intentAnalysis.confidence * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Generating hypotheses on controlled environment interaction and fault tolerance
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Recursive Refinement Loop</span>
                        <Badge className="bg-amber-600/20 text-amber-400">
                          <Clock className="h-3 w-3 mr-1" />
                          Running
                        </Badge>
                      </div>
                      <Progress value={65} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Feeding insights from Layer 3 back to Layers 1-2 for enrichment
                      </p>
                    </div>
                  </div>

                  {/* Data Sources */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Analyzed Data Sources</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Quantum_Job_Analytics.csv",
                        "DNA-Lang_SDK.pdf",
                        "IBM_Quantum_Partnership.md",
                        "ibm-quantum-ready.sh",
                        "quantum_execution_proof.json",
                        "lambdaphi_mechanical.py",
                      ].map((source) => (
                        <div key={source} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                          <FileText className="h-3 w-3 text-cyan-400" />
                          <span className="truncate">{source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Governance Tab */}
            <TabsContent value="governance" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-400" />
                      Role-Based Access Control (RBAC)
                    </CardTitle>
                    <CardDescription>Multi-party institutional access with artifact protection</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        activeRole === "admin" ? "border-emerald-500 bg-emerald-500/10" : "border-border/50 bg-muted/30"
                      }`}
                      onClick={() => setActiveRole("admin")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Admin</span>
                        <Badge className="bg-emerald-600/20 text-emerald-400">Full Access</Badge>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Configure Gateway endpoints</li>
                        <li>• Manage user roles</li>
                        <li>• Access core research artifacts</li>
                        <li>• Deploy world-state checkpoints</li>
                      </ul>
                    </div>

                    <div
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        activeRole === "manager" ? "border-cyan-500 bg-cyan-500/10" : "border-border/50 bg-muted/30"
                      }`}
                      onClick={() => setActiveRole("manager")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Manager</span>
                        <Badge className="bg-cyan-600/20 text-cyan-400">Read/Execute</Badge>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Execute quantum workflows</li>
                        <li>• View telemetry dashboards</li>
                        <li>• Submit benchmark data</li>
                        <li>• Access specific data layers</li>
                      </ul>
                    </div>

                    <div
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        activeRole === "member" ? "border-purple-500 bg-purple-500/10" : "border-border/50 bg-muted/30"
                      }`}
                      onClick={() => setActiveRole("member")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Member</span>
                        <Badge className="bg-purple-600/20 text-purple-400">Read-Only</Badge>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• View public research outputs</li>
                        <li>• Access community forums</li>
                        <li>• Download published datasets</li>
                        <li>• Submit collaboration requests</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-purple-400" />
                      Protocol Unification
                    </CardTitle>
                    <CardDescription>Model Context Protocol for agentic component coordination</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Agentic Components</div>
                      <p className="text-sm">
                        AIDEN and AURA sentinels integrated with Gateway via MCP, enabling cross-institutional agentic
                        workflows
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Data Exchange</div>
                      <p className="text-sm">
                        OpenAPI contracts describe World Engine native terminal interactions with Gateway endpoints
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Security</div>
                      <p className="text-sm">
                        Core research artifacts protected while allowing specific levels of institutional data access
                      </p>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
                      <Terminal className="h-4 w-4 mr-2" />
                      Configure Protocol Gateway
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Benchmarks Tab */}
            <TabsContent value="benchmarks" className="mt-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-cyan-400" />
                    Strategic Benchmarking & Use Case Tracking
                  </CardTitle>
                  <CardDescription>Institutional adoption requires verifiable performance data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quantum Advantage Tracker */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-400" />
                      Quantum Advantage Tracker Integration
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Submit benchmark data for ΛΦ constant and τ₀ coherence revival to community-led tracker
                      (co-managed by Algorithmiq and Flatiron Institute)
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-background/50 rounded">
                        <div className="text-xs text-muted-foreground">Submitted Benchmarks</div>
                        <div className="text-2xl font-bold text-emerald-400">127</div>
                      </div>
                      <div className="p-3 bg-background/50 rounded">
                        <div className="text-xs text-muted-foreground">Community Rank</div>
                        <div className="text-2xl font-bold text-cyan-400">#3</div>
                      </div>
                    </div>
                  </div>

                  {/* Use Case Toolkit */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Workflow className="h-4 w-4 text-purple-400" />
                      2026 Use Case Benchmarking Toolkit
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Evaluate World Engine performance in real-world differential equations and Hamiltonian simulations
                    </p>
                    <div className="space-y-2">
                      {[
                        { name: "Differential Equation Solvers", score: 94, status: "Validated" },
                        { name: "Hamiltonian Simulations", score: 89, status: "Validated" },
                        { name: "Lindblad Master Equation", score: 97, status: "Validated" },
                        { name: "Torsion Field Dynamics", score: 82, status: "Testing" },
                      ].map((useCase) => (
                        <div
                          key={useCase.name}
                          className="flex items-center justify-between p-3 bg-background/50 rounded"
                        >
                          <div>
                            <div className="text-sm font-medium">{useCase.name}</div>
                            <div className="text-xs text-muted-foreground">{useCase.status}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-cyan-400">{useCase.score}%</div>
                            <Progress value={useCase.score} className="w-24 h-1 mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-emerald-400">8,500+</div>
                      <div className="text-xs text-muted-foreground mt-1">Hardware Validations</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-cyan-400">99.2%</div>
                      <div className="text-xs text-muted-foreground mt-1">Reproducibility</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-purple-400">TRL 6</div>
                      <div className="text-xs text-muted-foreground mt-1">Technology Readiness</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-border">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Join the Research Network?</h2>
          <p className="text-muted-foreground">
            Transition from "Brilliant Hermit" to "Global Infrastructure Founder" with institutional-grade collaboration
            tools
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Users className="h-4 w-4 mr-2" />
              Request Gateway Access
            </Button>
            <Link href="/physics-research">
              <Button size="lg" variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                View Physics Research
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-muted-foreground border-t border-border">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="font-mono text-xs">
            <span className="text-emerald-400">ΛΦ = 2.176435 × 10⁻⁸</span>
            <span className="mx-4">|</span>
            <span className="text-cyan-400">11D-CRSM Torsion-Induced Collapse Framework</span>
          </div>
          <div>Research Community Gateway v2.1 — Institutional Quantum-HPC Collaboration</div>
        </div>
      </footer>
    </div>
  )
}
