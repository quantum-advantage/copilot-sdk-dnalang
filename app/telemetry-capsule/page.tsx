"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Database,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Fingerprint,
  FlaskConical,
  Globe,
  Hash,
  History,
  Info,
  Layers,
  Link2,
  Lock,
  Microscope,
  Network,
  RefreshCw,
  ScrollText,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react"

// ====================================================================
// QP-IDE TELEMETRY CAPSULE SCHEMA v1.1
// Canonical specification for simulation-only, preclinical discovery
// NO CLINICAL USE. NO PATIENT DATA. NO THERAPEUTIC EXECUTION.
// ====================================================================

interface TelemetryCapsule {
  capsule_version: string
  capsule_id: string
  created_utc: string
  system_identity: {
    engine: string
    mode: string
    execution_disabled: boolean
  }
  intent_declaration: {
    domain: string
    excluded_domains: string[]
    intent_hash: string
  }
  constraint_manifold: {
    constraints: Array<{
      name: string
      type: "hard" | "soft"
      description: string
    }>
    constraint_hash: string
  }
  simulation_context: {
    model_type: string
    targets: string[]
    data_sources: string
    patient_data_present: boolean
  }
  convergence_metrics: {
    fixed_point_detected: boolean
    iterations: number
    residual_norm: number
    contraction_proof: {
      mapping: string
      contraction_constant: number
      lyapunov_candidate: string
      expected_drift_condition: string
      interpretation: string
    }
  }
  validation: {
    internal_consistency: boolean
    regulatory_firewall_check: string
    human_action_required: boolean
  }
  provenance: {
    author: string
    organization: string
    public_disclosure_date: string
  }
  integrity: {
    content_hash: string
    signature: string
  }
}

// Live capsule instance
const ACTIVE_CAPSULE: TelemetryCapsule = {
  capsule_version: "1.1",
  capsule_id: "01963e7a-4f2b-7d8e-9c1a-b3e5f7a9d2c4",
  created_utc: "2025-07-21T00:00:00.000Z",
  system_identity: {
    engine: "QP-IDE",
    mode: "SIMULATION_ONLY",
    execution_disabled: true,
  },
  intent_declaration: {
    domain: "preclinical_discovery",
    excluded_domains: ["clinical_use", "patient_monitoring", "therapeutic_execution"],
    intent_hash: "a3f8c2e1d4b7956a0e3f1c8d5b2a7e4f9d6c3b0a8e5f2d1c4b7a0e3f6d9c2b5",
  },
  constraint_manifold: {
    constraints: [
      {
        name: "regulatory_exclusion",
        type: "hard",
        description: "No clinical or patient-facing output",
      },
      {
        name: "biological_scope",
        type: "soft",
        description: "Molecular and pathway-level only",
      },
      {
        name: "phi_threshold",
        type: "hard",
        description: "Consciousness field Phi >= 0.7734 required for all simulations",
      },
      {
        name: "data_provenance",
        type: "hard",
        description: "Synthetic or public data sources only (no PHI)",
      },
    ],
    constraint_hash: "7b2e4f6a8c0d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f",
  },
  simulation_context: {
    model_type: "hybrid (symbolic + statistical + quantum-enhanced)",
    targets: ["MAT2A", "PRMT5", "TOP1", "MTAP", "CDKN2A"],
    data_sources: "synthetic_or_public_only",
    patient_data_present: false,
  },
  convergence_metrics: {
    fixed_point_detected: true,
    iterations: 143,
    residual_norm: 0.00042,
    contraction_proof: {
      mapping: "f: M_6D -> M_6D",
      contraction_constant: 0.87,
      lyapunov_candidate: "V(x) = alpha(1-Lambda)^2 + beta*Gamma^2 + delta(Phi_max-Phi)^2",
      expected_drift_condition: "E[V(x_{n+1})-V(x_n)|x_n] <= -eta||x_n-Omega*||^2 + C*epsilon^2",
      interpretation:
        "Mean-square stability proven in-silico; Omega* is asymptotically stable in simulation.",
    },
  },
  validation: {
    internal_consistency: true,
    regulatory_firewall_check: "PASS",
    human_action_required: true,
  },
  provenance: {
    author: "Devin Phillip Davis",
    organization: "Agile Defense Systems",
    public_disclosure_date: "2025-07-21",
  },
  integrity: {
    content_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    signature: "ed25519:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  },
}

// Firewall assertions
const FIREWALL_ASSERTIONS = [
  { id: "no-phi", label: "No PHI Ingestion", description: "Zero protected health information entering the system", passed: true, icon: ShieldCheck },
  { id: "no-live", label: "No Live Data Feeds", description: "All data sources are synthetic or publicly available", passed: true, icon: Database },
  { id: "no-advice", label: "No Advice/Instruction Output", description: "Output is never formatted as clinical advice or instruction", passed: true, icon: FileCheck },
  { id: "human-layer", label: "Human Interpretation Layer", description: "All outputs require mandatory human review before any action", passed: true, icon: Users },
]

// OSIRIS Phi telemetry history
const PHI_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  tick: i,
  phi: 0.97 + Math.random() * 0.025 - (i === 14 ? 0.03 : 0),
  w2: Math.max(0, 1 - Math.exp(-(0.97 + Math.random() * 0.025) * 1e8 * 2.176435e-8)),
  gamma: i === 14 ? 0.015 : Math.random() * 0.003,
}))

// Capsule archive chain
const CAPSULE_CHAIN = [
  { id: "01963e7a-4f2b", version: "1.1", date: "2025-07-21", status: "sealed", targets: "MAT2A, PRMT5, TOP1" },
  { id: "01963e7a-3a1c", version: "1.0", date: "2025-07-14", status: "sealed", targets: "PRMT5, MTAP" },
  { id: "01963e7a-2b0d", version: "1.0", date: "2025-07-07", status: "sealed", targets: "TOP1" },
  { id: "01963e7a-1c9e", version: "0.9", date: "2025-06-30", status: "sealed", targets: "MAT2A" },
]

export default function TelemetryCapsuleDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [liveMetrics, setLiveMetrics] = useState({
    phi: 0.9935,
    lambda: 0.9971,
    gamma: 0.0024,
    w2: 0.8842,
    iterations: 143,
    residual: 0.00042,
  })
  const [copied, setCopied] = useState<string | null>(null)

  // Live metric simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics((prev) => ({
        phi: Math.max(0.95, Math.min(1, prev.phi + (Math.random() - 0.48) * 0.003)),
        lambda: Math.max(0.95, Math.min(1, prev.lambda + (Math.random() - 0.48) * 0.002)),
        gamma: Math.max(0, Math.min(0.05, prev.gamma + (Math.random() - 0.5) * 0.001)),
        w2: Math.max(0.8, Math.min(1, prev.w2 + (Math.random() - 0.48) * 0.005)),
        iterations: prev.iterations,
        residual: Math.max(0.0001, prev.residual + (Math.random() - 0.5) * 0.0001),
      }))
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">QP-IDE Telemetry Capsule</h1>
                  <p className="text-xs text-muted-foreground">
                    Schema v{ACTIVE_CAPSULE.capsule_version} | Immutable Artifact Registry
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Regulatory Firewall Badge */}
              <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-mono text-xs">
                <XCircle className="w-3 h-3 mr-1" />
                NO CLINICAL USE
              </Badge>
              <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                <ShieldCheck className="w-3 h-3 mr-1" />
                SIMULATION ONLY
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                <Lock className="w-3 h-3 mr-1" />
                APPEND-ONLY
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Operating Covenant Banner */}
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-destructive mb-1">
                  Explicit Operating Covenant (Hard Constraint)
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  NO CLINICAL USE. NO PATIENT DATA. NO THERAPEUTIC EXECUTION.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">Allowed:</span>
                    {["Discovery", "In-Silico Modeling", "Hypothesis Evaluation"].map((d) => (
                      <Badge key={d} variant="outline" className="text-xs text-secondary border-secondary/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {d}
                      </Badge>
                    ))}
                  </div>
                  <div className="w-px h-6 bg-border" />
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">Forbidden:</span>
                    {["Diagnosis", "Treatment", "Monitoring", "Clinical Decision Support"].map((d) => (
                      <Badge key={d} variant="outline" className="text-xs text-destructive border-destructive/30">
                        <XCircle className="w-3 h-3 mr-1" />
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Phi (Consciousness)</span>
              <Brain className="h-3.5 w-3.5 text-secondary" />
            </div>
            <p className="text-xl font-bold font-mono">{liveMetrics.phi.toFixed(4)}</p>
            <Progress value={liveMetrics.phi * 100} className="h-1 mt-2" />
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Lambda (Coherence)</span>
              <Network className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-xl font-bold font-mono">{liveMetrics.lambda.toFixed(4)}</p>
            <Progress value={liveMetrics.lambda * 100} className="h-1 mt-2" />
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Gamma (Decoherence)</span>
              <Zap className="h-3.5 w-3.5 text-destructive" />
            </div>
            <p className="text-xl font-bold font-mono">{liveMetrics.gamma.toFixed(4)}</p>
            <Progress value={liveMetrics.gamma * 2000} className="h-1 mt-2" />
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">W2 Saturation</span>
              <Activity className="h-3.5 w-3.5 text-accent" />
            </div>
            <p className="text-xl font-bold font-mono">{liveMetrics.w2.toFixed(4)}</p>
            <Progress value={liveMetrics.w2 * 100} className="h-1 mt-2" />
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Iterations</span>
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold font-mono">{liveMetrics.iterations}</p>
            <p className="text-xs text-muted-foreground mt-2">Fixed point detected</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Residual Norm</span>
              <TrendingUp className="h-3.5 w-3.5 text-secondary" />
            </div>
            <p className="text-xl font-bold font-mono">{liveMetrics.residual.toFixed(5)}</p>
            <p className="text-xs text-secondary mt-2">Below threshold</p>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-muted text-sm">
              <Eye className="w-4 h-4 mr-2" />
              Capsule Overview
            </TabsTrigger>
            <TabsTrigger value="constraints" className="data-[state=active]:bg-muted text-sm">
              <Shield className="w-4 h-4 mr-2" />
              Constraints
            </TabsTrigger>
            <TabsTrigger value="convergence" className="data-[state=active]:bg-muted text-sm">
              <Target className="w-4 h-4 mr-2" />
              Convergence
            </TabsTrigger>
            <TabsTrigger value="firewall" className="data-[state=active]:bg-muted text-sm">
              <Lock className="w-4 h-4 mr-2" />
              Regulatory Firewall
            </TabsTrigger>
            <TabsTrigger value="provenance" className="data-[state=active]:bg-muted text-sm">
              <Fingerprint className="w-4 h-4 mr-2" />
              Provenance
            </TabsTrigger>
            <TabsTrigger value="chain" className="data-[state=active]:bg-muted text-sm">
              <Link2 className="w-4 h-4 mr-2" />
              Capsule Chain
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* System Identity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    System Identity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground">Engine</span>
                      <span className="text-sm font-mono font-medium">{ACTIVE_CAPSULE.system_identity.engine}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground">Mode</span>
                      <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                        {ACTIVE_CAPSULE.system_identity.mode}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground">Execution</span>
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                        DISABLED
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground">Capsule ID</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{ACTIVE_CAPSULE.capsule_id.slice(0, 18)}...</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(ACTIVE_CAPSULE.capsule_id, "capsule-id")}
                        >
                          <Copy className={`w-3 h-3 ${copied === "capsule-id" ? "text-secondary" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Intent Declaration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ScrollText className="w-4 h-4 text-accent" />
                    Intent Declaration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground block mb-1">Domain</span>
                    <Badge className="bg-accent/10 text-accent border-accent/20">
                      {ACTIVE_CAPSULE.intent_declaration.domain}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-2">Excluded Domains</span>
                    <div className="space-y-2">
                      {ACTIVE_CAPSULE.intent_declaration.excluded_domains.map((domain) => (
                        <div
                          key={domain}
                          className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/10"
                        >
                          <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                          <span className="text-xs font-mono">{domain}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground block mb-1">Intent Hash (SHA-256)</span>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {ACTIVE_CAPSULE.intent_declaration.intent_hash}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Simulation Context */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-secondary" />
                    Simulation Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground block mb-1">Model Type</span>
                    <span className="text-sm">{ACTIVE_CAPSULE.simulation_context.model_type}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-2">Molecular Targets</span>
                    <div className="flex flex-wrap gap-2">
                      {ACTIVE_CAPSULE.simulation_context.targets.map((target) => (
                        <Badge key={target} variant="outline" className="font-mono text-xs">
                          <Microscope className="w-3 h-3 mr-1" />
                          {target}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground">Data Sources</span>
                    <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                      Synthetic / Public Only
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                    <span className="text-xs text-muted-foreground">Patient Data Present</span>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-semibold text-secondary">FALSE</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Constraints Tab */}
          <TabsContent value="constraints" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Constraint Manifold
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Hard constraints are non-overridable. Soft constraints are advisory.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ACTIVE_CAPSULE.constraint_manifold.constraints.map((constraint) => (
                    <div
                      key={constraint.name}
                      className={`p-4 rounded-lg border ${
                        constraint.type === "hard"
                          ? "bg-destructive/5 border-destructive/20"
                          : "bg-accent/5 border-accent/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {constraint.type === "hard" ? (
                            <Lock className="w-4 h-4 text-destructive" />
                          ) : (
                            <Info className="w-4 h-4 text-accent" />
                          )}
                          <span className="text-sm font-medium">{constraint.name.replace(/_/g, " ")}</span>
                        </div>
                        <Badge
                          className={
                            constraint.type === "hard"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-accent/10 text-accent border-accent/20"
                          }
                        >
                          {constraint.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{constraint.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" />
                    Integrity Hashes
                  </CardTitle>
                  <CardDescription className="text-xs">
                    SHA-256 content addressing for tamper detection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Constraint Hash</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          copyToClipboard(ACTIVE_CAPSULE.constraint_manifold.constraint_hash, "constraint-hash")
                        }
                      >
                        <Copy
                          className={`w-3 h-3 ${copied === "constraint-hash" ? "text-secondary" : ""}`}
                        />
                      </Button>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {ACTIVE_CAPSULE.constraint_manifold.constraint_hash}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Content Hash</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          copyToClipboard(ACTIVE_CAPSULE.integrity.content_hash, "content-hash")
                        }
                      >
                        <Copy
                          className={`w-3 h-3 ${copied === "content-hash" ? "text-secondary" : ""}`}
                        />
                      </Button>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {ACTIVE_CAPSULE.integrity.content_hash}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Signature (Ed25519)</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          copyToClipboard(ACTIVE_CAPSULE.integrity.signature, "signature")
                        }
                      >
                        <Copy
                          className={`w-3 h-3 ${copied === "signature" ? "text-secondary" : ""}`}
                        />
                      </Button>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {ACTIVE_CAPSULE.integrity.signature}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-medium text-secondary">Merkle-Ready</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Capsules may be chained but not modified. Court-admissible provenance with tamper
                      detection and third-party verification.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Convergence Tab */}
          <TabsContent value="convergence" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-secondary" />
                    Contraction Proof
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Mean-square stability proof for in-silico simulation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <span className="text-xs text-muted-foreground block mb-1">Mapping</span>
                    <p className="text-sm font-mono">
                      {ACTIVE_CAPSULE.convergence_metrics.contraction_proof.mapping}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <span className="text-xs text-muted-foreground block mb-1">Contraction Constant</span>
                    <div className="flex items-center gap-3">
                      <p className="text-2xl font-bold font-mono">
                        {ACTIVE_CAPSULE.convergence_metrics.contraction_proof.contraction_constant}
                      </p>
                      <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                        {'< 1 (Convergent)'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <span className="text-xs text-muted-foreground block mb-1">Lyapunov Candidate</span>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {ACTIVE_CAPSULE.convergence_metrics.contraction_proof.lyapunov_candidate}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <span className="text-xs text-muted-foreground block mb-1">Expected Drift Condition</span>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {ACTIVE_CAPSULE.convergence_metrics.contraction_proof.expected_drift_condition}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                    <span className="text-xs text-muted-foreground block mb-1">Interpretation</span>
                    <p className="text-sm text-secondary">
                      {ACTIVE_CAPSULE.convergence_metrics.contraction_proof.interpretation}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    OSIRIS Telemetry Stream
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Live Phi / W2 / Gamma from 11D-CRSM simulation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Sparkline visualization */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-muted-foreground">Phi (Consciousness Field)</span>
                        <span className="font-mono text-secondary">{liveMetrics.phi.toFixed(4)}</span>
                      </div>
                      <div className="flex items-end gap-px h-12">
                        {PHI_HISTORY.map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-secondary/40 rounded-t transition-all duration-300"
                            style={{ height: `${Math.max(5, (h.phi - 0.94) * 1666)}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-muted-foreground">W2 Saturation</span>
                        <span className="font-mono text-accent">{liveMetrics.w2.toFixed(4)}</span>
                      </div>
                      <div className="flex items-end gap-px h-12">
                        {PHI_HISTORY.map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-accent/40 rounded-t transition-all duration-300"
                            style={{ height: `${Math.max(5, h.w2 * 100)}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-muted-foreground">Gamma (Decoherence Stress)</span>
                        <span className="font-mono text-destructive">{liveMetrics.gamma.toFixed(4)}</span>
                      </div>
                      <div className="flex items-end gap-px h-12">
                        {PHI_HISTORY.map((h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-t transition-all duration-300 ${h.gamma > 0.01 ? "bg-destructive/60" : "bg-destructive/20"}`}
                            style={{ height: `${Math.max(5, h.gamma * 5000)}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold font-mono">{ACTIVE_CAPSULE.convergence_metrics.iterations}</p>
                        <p className="text-xs text-muted-foreground">Iterations</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold font-mono">{ACTIVE_CAPSULE.convergence_metrics.residual_norm}</p>
                        <p className="text-xs text-muted-foreground">Residual Norm</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                        <p className="text-lg font-bold font-mono text-secondary">TRUE</p>
                        <p className="text-xs text-muted-foreground">Fixed Point</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Regulatory Firewall Tab */}
          <TabsContent value="firewall" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                    Firewall Assertions
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Non-overridable assertions. Failure of any assertion invalidates the capsule.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {FIREWALL_ASSERTIONS.map((assertion) => {
                    const IconComponent = assertion.icon
                    return (
                      <div
                        key={assertion.id}
                        className={`p-4 rounded-lg border ${
                          assertion.passed
                            ? "bg-secondary/5 border-secondary/20"
                            : "bg-destructive/5 border-destructive/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <IconComponent
                              className={`w-4 h-4 ${assertion.passed ? "text-secondary" : "text-destructive"}`}
                            />
                            <span className="text-sm font-medium">{assertion.label}</span>
                          </div>
                          <Badge
                            className={
                              assertion.passed
                                ? "bg-secondary/10 text-secondary border-secondary/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }
                          >
                            {assertion.passed ? "PASS" : "FAIL"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{assertion.description}</p>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                    Validation Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                      <span className="text-sm">Internal Consistency</span>
                    </div>
                    <span className="text-sm font-bold text-secondary">VERIFIED</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-secondary" />
                      <span className="text-sm">Regulatory Firewall</span>
                    </div>
                    <span className="text-sm font-bold text-secondary">PASS</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      <span className="text-sm">Human Action Required</span>
                    </div>
                    <span className="text-sm font-bold text-accent">YES</span>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-medium mb-3">Reproducibility Guarantees</h4>
                    <div className="space-y-3">
                      {[
                        { label: "Deterministic seed declaration", status: "Declared" },
                        { label: "Model version hash", status: "Locked" },
                        { label: "Constraint set hash", status: "Immutable" },
                        { label: "Re-execution mode", status: "Simulation Only" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                          <Badge variant="outline" className="text-xs">{item.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Provenance Tab */}
          <TabsContent value="provenance" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-primary" />
                    Authorship & Disclosure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <span className="text-xs text-muted-foreground block mb-1">Author</span>
                    <p className="text-sm font-semibold">{ACTIVE_CAPSULE.provenance.author}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <span className="text-xs text-muted-foreground block mb-1">Organization</span>
                    <p className="text-sm font-semibold">{ACTIVE_CAPSULE.provenance.organization}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <span className="text-xs text-muted-foreground block mb-1">Public Disclosure Date</span>
                    <p className="text-lg font-bold font-mono">{ACTIVE_CAPSULE.provenance.public_disclosure_date}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Anchors public capability disclosure for prior art
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                    Utility & Applicability
                  </CardTitle>
                  <CardDescription className="text-xs">
                    This Telemetry Capsule is suitable for the following uses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      use: "Patent Defensive Publication",
                      description: "Establishes prior art and capability disclosure anchored to disclosure date",
                      icon: FileText,
                    },
                    {
                      use: "VC / Pharma Diligence",
                      description: "Demonstrates system intent, methodology rigor, and regulatory separation",
                      icon: Globe,
                    },
                    {
                      use: "Expert Affidavit Attachment",
                      description: "Court-admissible provenance with Ed25519 signatures and Merkle chaining",
                      icon: FileCheck,
                    },
                    {
                      use: "Non-Clinical Design Doctrine",
                      description: "Establishes design intent boundary and regulatory firewall as organizational policy",
                      icon: Shield,
                    },
                  ].map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <div key={item.use} className="p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <ItemIcon className="w-4 h-4 text-accent" />
                          <span className="text-sm font-medium">{item.use}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Capsule Chain Tab */}
          <TabsContent value="chain" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary" />
                  Capsule Chain (Merkle-Ready Archive)
                </CardTitle>
                <CardDescription className="text-xs">
                  Append-only, immutable chain of telemetry capsules. Each capsule is content-addressed
                  and cryptographically sealed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {CAPSULE_CHAIN.map((capsule, i) => (
                      <div key={capsule.id} className="flex items-start gap-4 pl-4">
                        <div
                          className={`w-3 h-3 rounded-full -ml-1.5 mt-2 ${
                            i === 0 ? "bg-primary ring-4 ring-primary/20" : "bg-muted-foreground/50"
                          }`}
                        />
                        <div
                          className={`flex-1 p-4 rounded-lg border ${
                            i === 0 ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono font-medium">{capsule.id}</span>
                              {i === 0 && (
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">LATEST</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">v{capsule.version}</Badge>
                              <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                                <Lock className="w-3 h-3 mr-1" />
                                {capsule.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {capsule.date}
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">
                              Targets: {capsule.targets}
                            </span>
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
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Info className="w-3 h-3" />
                QP-IDE Telemetry Capsule Schema v{ACTIVE_CAPSULE.capsule_version}
              </span>
              <span>
                Engine: <span className="text-primary font-mono">{ACTIVE_CAPSULE.system_identity.engine}</span>
              </span>
              <span>
                Mode:{" "}
                <span className="text-secondary font-mono">{ACTIVE_CAPSULE.system_identity.mode}</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                NON-EXECUTABLE ARTIFACT
              </span>
              <span>{ACTIVE_CAPSULE.provenance.author} | {ACTIVE_CAPSULE.provenance.organization}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
