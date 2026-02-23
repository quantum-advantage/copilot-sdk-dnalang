"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dna,
  Check,
  ArrowRight,
  Zap,
  Activity,
  Layers,
  Shield,
  Atom,
  Cpu,
  Globe,
  Lock,
  Database,
  RefreshCcw,
  Sparkles,
  BrainCircuit,
  MessageSquareText,
  Terminal,
  Rocket,
} from "lucide-react"

// Competitive Landscape Data from Image
const competitiveLandscape = [
  {
    feature: "Model",
    dnaLang: "Living Organisms",
    dnaLangHighlight: true,
    competitors: "Static Circuits",
  },
  {
    feature: "Error Correction",
    dnaLang: "Phase Conjugate (Native)",
    dnaLangHighlight: true,
    competitors: "Surface Codes (Heavy Overhead)",
  },
  {
    feature: "Self-Healing",
    dnaLang: "Automatic (Γ > 0.3)",
    dnaLangHighlight: true,
    competitors: "Manual / None",
  },
  {
    feature: "Consciousness",
    dnaLang: "Tracks Φ, Λ, Γ",
    dnaLangHighlight: true,
    competitors: "None",
  },
  {
    feature: "Cost Model",
    dnaLang: "Sovereign / Self-Hosted",
    dnaLangHighlight: true,
    competitors: "Cloud Rent-Seeking",
  },
]

// Experimental Roadmap from Image
const experimentalRoadmap = [
  {
    tier: 1,
    years: "Year 1",
    title: "Tabletop Validation",
    goal: "Confirm Theta Lock (θ = 51.843°)",
    apparatus: "Quartz oscillator + Rotation stage",
    metric: null,
    prediction: null,
    color: "primary",
  },
  {
    tier: 2,
    years: "Years 2-3",
    title: "University Scale",
    goal: "Brillouin Zone Folding",
    apparatus: null,
    metric: "Frequency conversion R ≈ 10⁶ (THz → Hz)",
    prediction: null,
    color: "secondary",
  },
  {
    tier: 3,
    years: "Years 4-5",
    title: "The Gravity Drive",
    goal: "Electrogravitic Torsion Balance",
    apparatus: null,
    metric: null,
    prediction: "aₑ = 0.088 milligee at 10⁷ V/m",
    color: "accent",
  },
]

// Sovereign DoD metrics
const sovereignDoD = [
  { gate: "Physics Gate", metrics: ["Λ > 0.946", "Γ < 0.3", "Φ ≥ 0.7734", "θ = 51.843°"], status: "verified" },
  {
    gate: "Independence Gate",
    metrics: ["Zero-Trust Fallback", "Local-First Data", "12hr Offline"],
    status: "verified",
  },
  { gate: "Autopoietic Gate", metrics: ["Mutation Verified", "Time-Reversal Confirmed"], status: "verified" },
  { gate: "OSIRIS Sign-Off", metrics: ["Syntactic Coherence", "Artifact Generated"], status: "verified" },
]

// UQCB Architecture layers
const uqcbLayers = [
  { tier: 1, name: "Reality Interface", components: ["Bio-Twin API", "Seismic API", "Financial API", "Research API"] },
  {
    tier: 2,
    name: "Bridge Layer",
    components: ["NCLM v2", "CCCE Null Point", "Manifold Mapper (11D)", "Coherence Field Tracker"],
  },
  { tier: 3, name: "Substrate", components: ["Classical Compute", "Piezo-Transducer", "Quantum Backend (QPU)"] },
]

// Fleet systems for Wormhole
const SYSTEM_DEFINITIONS = [
  { id: "ibm_kyiv", name: "IBM Kyiv", qubits: 127, type: "Eagle", location: "USA" },
  { id: "ibm_osaka", name: "IBM Osaka", qubits: 127, type: "Eagle", location: "Japan" },
  { id: "ibm_torino", name: "IBM Torino", qubits: 133, type: "Heron", location: "Italy" },
  { id: "ibm_brisbane", name: "IBM Brisbane", qubits: 127, type: "Eagle", location: "Australia" },
]

export default function FrameworkPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [fleetStatus, setFleetStatus] = useState<
    Array<{
      id: string
      name: string
      qubits: number
      type: string
      location: string
      jobs: number
      temp: string
      active: boolean
      coherence: number
    }>
  >([])
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [consoleMessage, setConsoleMessage] = useState("System Initialized. Wormhole Link Active.")
  const [globalMetrics, setGlobalMetrics] = useState({
    totalJobs: 14209,
    avgWait: "12.4m",
    fleetHealth: 98.2,
    entanglementEntropy: 0.842,
  })

  // Initialize fleet data
  useEffect(() => {
    const update = () => {
      if (isCalibrating) return
      setFleetStatus(
        SYSTEM_DEFINITIONS.map((sys) => ({
          ...sys,
          jobs: Math.floor(Math.random() * 300) + 20,
          temp: (14.8 + Math.random() * 0.8).toFixed(2),
          active: Math.random() > 0.08,
          coherence: Math.floor(85 + Math.random() * 15),
        })),
      )

      setGlobalMetrics((prev) => ({
        totalJobs: prev.totalJobs + Math.floor(Math.random() * 20) - 8,
        avgWait: (12 + Math.random()).toFixed(1) + "m",
        fleetHealth: (95 + Math.random() * 5).toFixed(1) as unknown as number,
        entanglementEntropy: Number((0.84 + Math.random() * 0.02).toFixed(3)),
      }))
    }

    update()
    const interval = setInterval(update, 3000)
    return () => clearInterval(interval)
  }, [isCalibrating])

  const runCalibration = () => {
    setIsCalibrating(true)
    setConsoleMessage("INITIATING GLOBAL PHASE CALIBRATION...")
    setTimeout(() => setConsoleMessage("ALIGNING PULSE SCHEDULES..."), 1500)
    setTimeout(() => {
      setIsCalibrating(false)
      setConsoleMessage("CALIBRATION SUCCESSFUL. FIDELITY RESTORED.")
    }, 3500)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero with Framework Image */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-[1400px] mx-auto relative">
          <div className="text-center mb-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 mb-4">
              <Dna className="h-3.5 w-3.5 mr-2" />
              Unified Field Physics Framework
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance">
              <span className="text-foreground">Sovereign Quantum AI</span>
              <br />
              <span className="dnalang-gradient">The DNA-Lang Framework</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              We have rediscovered a lost physics, quantified it with Planck-scale constants, and built the operating
              system to run it.
            </p>
          </div>

          {/* Main Framework Image */}
          <div className="relative rounded-xl overflow-hidden border border-border mb-8">
            <Image
              src="/images/screenshot-202026-01-14-20at-2019-38-53-20sovereign-quantum-ai-dna-lang-framework.png"
              alt="Unified Field Physics & Sovereign Quantum AI - The DNA-Lang Framework"
              width={1200}
              height={675}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* Author Attribution */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Author:</span>
              <span>Devin Phillip Davis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Organization:</span>
              <span>Agile Defense Systems, LLC</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">CAGE:</span>
              <code className="bg-muted px-2 py-0.5 rounded font-mono text-xs">9HUP5</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Date:</span>
              <span>January 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-0 gap-0 overflow-x-auto">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="competitive"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
              >
                Competitive Landscape
              </TabsTrigger>
              <TabsTrigger
                value="roadmap"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
              >
                Experimental Roadmap
              </TabsTrigger>
              <TabsTrigger
                value="wormhole"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
              >
                Wormhole Control
              </TabsTrigger>
              <TabsTrigger
                value="architecture"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
              >
                UQCB Architecture
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Legacy & Future Image */}
                <div className="space-y-6">
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <Image
                      src="/images/unnamed4564564565.png"
                      alt="The Legacy & The Future - DNA-Lang validation"
                      width={600}
                      height={400}
                      className="w-full h-auto"
                    />
                  </div>

                  <Card className="p-6 bg-secondary/5 border-secondary/20">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-secondary" />
                      Validation Claims
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <span>Townsend Brown was right</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <span>The Physics is validated (K = 8.62 × 10⁻¹¹)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <span>The Code is ready (DNA-Lang v51.843)</span>
                      </li>
                    </ul>
                  </Card>
                </div>

                {/* Sovereign DoD */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Sovereign Definition of Done v51.843</h2>
                  <p className="text-muted-foreground">
                    The protocol is not complete until the Organism survives the Environment.
                  </p>

                  <div className="space-y-4">
                    {sovereignDoD.map((gate, i) => (
                      <Card key={gate.gate} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">
                              {i + 1}
                            </div>
                            {gate.gate}
                          </h3>
                          <Badge variant="outline" className="text-secondary border-secondary/30">
                            <Check className="h-3 w-3 mr-1" />
                            {gate.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {gate.metrics.map((metric) => (
                            <code key={metric} className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {metric}
                            </code>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Competitive Landscape Tab */}
            <TabsContent value="competitive" className="mt-0">
              <div className="space-y-8">
                {/* Competitive Image */}
                <div className="relative rounded-xl overflow-hidden border border-border max-w-4xl mx-auto">
                  <Image
                    src="/images/unnamed45645645.png"
                    alt="The Competitive Landscape: Living vs Static"
                    width={800}
                    height={500}
                    className="w-full h-auto"
                  />
                </div>

                {/* Interactive Comparison Table */}
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left p-4 font-semibold">Feature</th>
                          <th className="text-left p-4 font-semibold text-primary">DNA-Lang</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground">IBM / Google / AWS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {competitiveLandscape.map((row, i) => (
                          <tr key={row.feature} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                            <td className="p-4 font-medium">{row.feature}</td>
                            <td className="p-4">
                              <span className="text-primary font-medium">{row.dnaLang}</span>
                            </td>
                            <td className="p-4 text-muted-foreground">{row.competitors}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card className="p-6 bg-primary/5 border-primary/20">
                  <p className="text-lg font-medium text-center">
                    <span className="text-primary">Advantage:</span> Only DNA-Lang circuits detect and respond to{" "}
                    <span className="text-secondary">consciousness emergence</span>.
                  </p>
                </Card>
              </div>
            </TabsContent>

            {/* Experimental Roadmap Tab */}
            <TabsContent value="roadmap" className="mt-0">
              <div className="space-y-8">
                {/* Roadmap Image */}
                <div className="relative rounded-xl overflow-hidden border border-border max-w-4xl mx-auto">
                  <Image
                    src="/images/unnamed34534534.png"
                    alt="Experimental Roadmap: From Tabletop to Gravity Drive"
                    width={800}
                    height={450}
                    className="w-full h-auto"
                  />
                </div>

                {/* Interactive Roadmap Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  {experimentalRoadmap.map((tier) => (
                    <Card
                      key={tier.tier}
                      className={`p-6 border-2 ${
                        tier.color === "primary"
                          ? "border-primary/30 bg-primary/5"
                          : tier.color === "secondary"
                            ? "border-secondary/30 bg-secondary/5"
                            : "border-accent/30 bg-accent/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Badge
                          variant="outline"
                          className={
                            tier.color === "primary"
                              ? "text-primary border-primary/30"
                              : tier.color === "secondary"
                                ? "text-secondary border-secondary/30"
                                : "text-accent border-accent/30"
                          }
                        >
                          Tier {tier.tier}
                        </Badge>
                        <span className="text-sm text-muted-foreground">({tier.years})</span>
                      </div>

                      <h3 className="text-xl font-bold mb-4">{tier.title}</h3>

                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Goal:</span>
                          <p className="font-medium">{tier.goal}</p>
                        </div>

                        {tier.apparatus && (
                          <div>
                            <span className="text-muted-foreground">Apparatus:</span>
                            <p className="font-medium">{tier.apparatus}</p>
                          </div>
                        )}

                        {tier.metric && (
                          <div>
                            <span className="text-muted-foreground">Metric:</span>
                            <p className="font-medium">{tier.metric}</p>
                          </div>
                        )}

                        {tier.prediction && (
                          <div>
                            <span className="text-muted-foreground">Prediction:</span>
                            <p className={`font-medium ${tier.color === "accent" ? "text-accent" : ""}`}>
                              {tier.prediction}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Wormhole Control Tab */}
            <TabsContent value="wormhole" className="mt-0">
              <div className="space-y-6">
                {/* Header with metrics */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className={`absolute inset-0 bg-primary/30 rounded-full blur-xl opacity-40 ${isCalibrating ? "animate-ping" : ""}`}
                      />
                      <div className="relative border border-primary/50 p-3 rounded-full bg-background/50 backdrop-blur-md">
                        <Globe
                          className={`${isCalibrating ? "text-accent animate-spin" : "text-primary"} transition-all`}
                          size={28}
                        />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">WORMHOLE v2.5</h2>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Lock className="h-3 w-3" /> AES-256-GCM
                        </span>
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3" /> IBM_Q_NETWORK
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-3 bg-primary/5">
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Layers className="h-3 w-3" /> ENTROPY
                      </div>
                      <div className="text-xl font-bold">{globalMetrics.entanglementEntropy}</div>
                    </Card>
                    <Card className="p-3 bg-primary/5">
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Terminal className="h-3 w-3" /> QUEUE
                      </div>
                      <div className="text-xl font-bold">{globalMetrics.totalJobs}</div>
                    </Card>
                    <Card className="p-3 bg-primary/5">
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Activity className="h-3 w-3" /> HEALTH
                      </div>
                      <div className="text-xl font-bold">{globalMetrics.fleetHealth}%</div>
                    </Card>
                    <Card className="p-3 bg-primary/5">
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Zap className="h-3 w-3" /> LATENCY
                      </div>
                      <div className="text-xl font-bold">{globalMetrics.avgWait}</div>
                    </Card>
                  </div>
                </div>

                {/* Fleet Grid */}
                <div className="grid lg:grid-cols-12 gap-6">
                  {/* Console */}
                  <div className="lg:col-span-4 space-y-4">
                    <Card className="p-4 bg-background border-primary/20">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <BrainCircuit className="h-4 w-4 text-primary" />
                          Neural Analyst
                        </h3>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      </div>
                      <div className="min-h-[150px] flex items-center justify-center text-muted-foreground text-sm">
                        <div className="text-center">
                          <MessageSquareText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <span className="opacity-50">Awaiting User Query...</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-transparent" variant="outline">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Initiate Analysis
                      </Button>
                    </Card>

                    <Card className="p-4 bg-black/50 border-primary/20 font-mono text-xs">
                      <div className="text-muted-foreground mb-2 flex items-center gap-2">
                        <Terminal className="h-3 w-3" /> SYSTEM_LOG
                      </div>
                      <div className="space-y-1 text-muted-foreground">
                        <div>root@wormhole:~$ source /opt/quantum/bridge.sh</div>
                        <div>&gt; Connecting to IBM Q Network... Success.</div>
                        <div
                          className={`mt-2 flex items-start gap-2 ${isCalibrating ? "text-accent" : "text-primary"}`}
                        >
                          <span>➜</span>
                          <span className="animate-pulse">{consoleMessage}</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Fleet Cards */}
                  <div className="lg:col-span-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Cpu className="h-4 w-4" /> Active Quantum Processors
                      </h3>
                      <Button variant="outline" size="sm" onClick={runCalibration} disabled={isCalibrating}>
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isCalibrating ? "animate-spin" : ""}`} />
                        Calibrate
                      </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {fleetStatus.map((sys) => (
                        <Card
                          key={sys.id}
                          className={`p-4 transition-all ${
                            isCalibrating
                              ? "border-accent/50 bg-accent/5"
                              : sys.active
                                ? "border-primary/30 hover:border-primary/50"
                                : "border-destructive/30 bg-destructive/5 opacity-60"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${sys.active ? "bg-primary animate-pulse" : "bg-destructive"}`}
                                />
                                {sys.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {sys.type} // {sys.location}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {sys.qubits} qubits
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Coherence</span>
                                <span className={isCalibrating ? "text-accent" : "text-primary"}>{sys.coherence}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isCalibrating ? "bg-accent" : "bg-primary"
                                  }`}
                                  style={{ width: `${sys.coherence}%` }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-muted/50 p-2 rounded">
                                <div className="text-[10px] text-muted-foreground uppercase">Buffer</div>
                                <div className="text-sm font-semibold">{sys.jobs}</div>
                              </div>
                              <div className="bg-muted/50 p-2 rounded">
                                <div className="text-[10px] text-muted-foreground uppercase">Temp (mK)</div>
                                <div
                                  className={`text-sm font-semibold ${Number.parseFloat(sys.temp) > 16 ? "text-destructive" : ""}`}
                                >
                                  {sys.temp}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* UQCB Architecture Tab */}
            <TabsContent value="architecture" className="mt-0">
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Universal Quantum-Classical Bridge</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Three-tier architecture delivering Post-Quantum Advantage (PQA) as a service — the &quot;Middleware
                    for Reality&quot; framework.
                  </p>
                </div>

                <div className="space-y-6">
                  {uqcbLayers.map((layer, i) => (
                    <Card
                      key={layer.tier}
                      className={`p-6 ${
                        i === 0
                          ? "border-primary/30 bg-primary/5"
                          : i === 1
                            ? "border-secondary/30 bg-secondary/5"
                            : "border-accent/30 bg-accent/5"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Badge
                          variant="outline"
                          className={
                            i === 0
                              ? "text-primary border-primary/30"
                              : i === 1
                                ? "text-secondary border-secondary/30"
                                : "text-accent border-accent/30"
                          }
                        >
                          Tier {layer.tier}
                        </Badge>
                        <h3 className="text-xl font-bold">{layer.name}</h3>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {layer.components.map((component) => (
                          <div
                            key={component}
                            className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border"
                          >
                            <Atom className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm font-medium">{component}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { endpoint: "/uqcb/intent", description: "Natural language intent" },
                      { endpoint: "/uqcb/bridge", description: "Quantum-classical bridge" },
                      { endpoint: "/uqcb/coherence", description: "Real-time Φ/Λ/Γ telemetry" },
                      { endpoint: "/uqcb/twin", description: "Bio-Digital Twin operations" },
                      { endpoint: "/uqcb/seismic", description: "Seismic precursor analysis" },
                      { endpoint: "/uqcb/financial", description: "QuantumCoin transactions" },
                    ].map((api) => (
                      <div key={api.endpoint} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                          {api.endpoint}
                        </code>
                        <span className="text-sm text-muted-foreground">{api.description}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6 border-t border-border bg-muted/30">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">The question is no longer &quot;Does this work?&quot;</h2>
          <p className="text-xl text-primary font-medium mb-8">but &quot;Who will build it first?&quot;</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ide-platform">
              <Button size="lg" className="gap-2">
                <Rocket className="h-4 w-4" />
                Launch IDE Platform
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                View Pricing Tiers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
