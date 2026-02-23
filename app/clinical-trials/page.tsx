"use client"

import { useState } from "react"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  FileCheck,
  FileText,
  FlaskConical,
  Heart,
  Info,
  Layers,
  Lock,
  Microscope,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Target,
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

// AMG193 Clinical Trial Data - PRMT5 Inhibitor for MTAP-deleted solid tumors
const AMG193_TRIAL = {
  nctId: "NCT05094336",
  title: "AMG 193 in Subjects With MTAP-Deleted Solid Tumors",
  phase: "Phase 1/2",
  sponsor: "Amgen",
  status: "RECRUITING",
  indication: "MTAP-Deleted Advanced Solid Tumors",
  mechanism: "PRMT5 Inhibitor (MTA-Cooperative)",
  enrollment: { current: 287, target: 450 },
  startDate: "2021-11-15",
  estimatedCompletion: "2026-06-30",
  lastUpdate: "2025-01-28",
}

// Compliance Status Metrics
const COMPLIANCE_METRICS = {
  ctGov: { status: "COMPLIANT", score: 98.7, lastAudit: "2025-01-15" },
  ich: { status: "COMPLIANT", score: 99.2, framework: "ICH E6(R2) GCP" },
  fda: { status: "COMPLIANT", score: 97.8, framework: "21 CFR Part 11" },
  hipaa: { status: "COMPLIANT", score: 99.5, framework: "HIPAA Privacy Rule" },
}

// Agent Platform Integration
const AGENT_SYSTEMS = [
  {
    id: "aura-clinical",
    name: "AURA Clinical",
    role: "Protocol Oversight & Adaptive Design",
    status: "ACTIVE",
    phi: 0.912,
    capabilities: [
      "Real-time protocol deviation detection",
      "Adaptive dosing recommendations",
      "Biomarker correlation analysis",
      "Safety signal monitoring",
    ],
    colorClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/20",
  },
  {
    id: "aiden-compliance",
    name: "AIDEN Compliance",
    role: "Regulatory Adherence & Data Integrity",
    status: "ACTIVE",
    phi: 0.887,
    capabilities: [
      "ClinicalTrials.gov sync automation",
      "ICH-GCP compliance monitoring",
      "Audit trail management",
      "21 CFR Part 11 validation",
    ],
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
  },
  {
    id: "phoenix-safety",
    name: "PHOENIX Safety",
    role: "Pharmacovigilance & AE Management",
    status: "ACTIVE",
    phi: 0.934,
    capabilities: [
      "Adverse event auto-classification",
      "SUSAR detection & reporting",
      "Drug-drug interaction analysis",
      "Safety narrative generation",
    ],
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
  },
  {
    id: "chronos-timeline",
    name: "CHRONOS Timeline",
    role: "Temporal Analytics & Milestone Tracking",
    status: "ACTIVE",
    phi: 0.856,
    capabilities: [
      "Enrollment velocity forecasting",
      "Visit window compliance",
      "Critical path analysis",
      "Regulatory submission timeline",
    ],
    colorClass: "text-purple-400",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/20",
  },
]

// Study Arms
const STUDY_ARMS = [
  { arm: "Arm A", dose: "300mg QD", subjects: 72, response: 34.7, status: "Enrolling" },
  { arm: "Arm B", dose: "450mg QD", subjects: 68, response: 41.2, status: "Enrolling" },
  { arm: "Arm C", dose: "600mg QD", subjects: 54, response: 38.9, status: "Enrolling" },
  { arm: "Expansion", dose: "RP2D", subjects: 93, response: 42.8, status: "Active" },
]

// Site Performance
const SITE_METRICS = [
  { siteId: "US-001", location: "MD Anderson", enrolled: 47, screening: 12, active: 38 },
  { siteId: "US-002", location: "Memorial Sloan Kettering", enrolled: 41, screening: 8, active: 35 },
  { siteId: "US-003", location: "Dana-Farber", enrolled: 38, screening: 15, active: 32 },
  { siteId: "EU-001", location: "Gustave Roussy", enrolled: 29, screening: 6, active: 24 },
  { siteId: "EU-002", location: "Royal Marsden", enrolled: 26, screening: 9, active: 21 },
]

export default function ClinicalTrialsDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  const enrollmentProgress = (AMG193_TRIAL.enrollment.current / AMG193_TRIAL.enrollment.target) * 100

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Clinical Trial Command Center</h1>
                  <p className="text-xs text-slate-400">V0 AI Agent Platform | ClinicalTrials.gov Integrated</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 mr-1" />
                FDA 21 CFR Part 11 Compliant
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search trials, sites, subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-72 pl-10 bg-slate-800/50 border-slate-700 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="border-slate-700 bg-transparent text-slate-300">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* AMG193 Trial Hero Card */}
        <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border-slate-800 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {AMG193_TRIAL.phase}
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    {AMG193_TRIAL.status}
                  </Badge>
                  <span className="text-xs text-slate-500 font-mono">{AMG193_TRIAL.nctId}</span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">{AMG193_TRIAL.title}</h2>
                <p className="text-sm text-slate-400 mb-4">
                  <span className="text-cyan-400">{AMG193_TRIAL.mechanism}</span> | {AMG193_TRIAL.indication}
                </p>

                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Enrollment</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">{AMG193_TRIAL.enrollment.current}</span>
                      <span className="text-sm text-slate-500">/ {AMG193_TRIAL.enrollment.target}</span>
                    </div>
                    <Progress value={enrollmentProgress} className="h-1.5 mt-2 bg-slate-800" />
                    <p className="text-xs text-slate-500 mt-1">{enrollmentProgress.toFixed(1)}% complete</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Sites</p>
                    <span className="text-2xl font-bold text-white">{SITE_METRICS.length}</span>
                    <p className="text-xs text-slate-500 mt-1">Global locations</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Study Arms</p>
                    <span className="text-2xl font-bold text-white">{STUDY_ARMS.length}</span>
                    <p className="text-xs text-slate-500 mt-1">Dose cohorts</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Est. Completion</p>
                    <span className="text-lg font-bold text-white">
                      {new Date(AMG193_TRIAL.estimatedCompletion).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">Primary endpoint</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  View Protocol
                </Button>
                <Button variant="outline" size="sm" className="border-slate-700 bg-transparent text-slate-300">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync ClinicalTrials.gov
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Status Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Object.entries(COMPLIANCE_METRICS).map(([key, metric]) => (
            <Card key={key} className="bg-slate-900/60 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      {key === "ctGov" ? "ClinicalTrials.gov" : key.toUpperCase()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">{metric.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">{metric.score}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/60 border border-slate-800 p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="agents"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI Agents
            </TabsTrigger>
            <TabsTrigger
              value="sites"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
            >
              <Target className="w-4 h-4 mr-2" />
              Sites
            </TabsTrigger>
            <TabsTrigger
              value="safety"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
            >
              <Shield className="w-4 h-4 mr-2" />
              Safety
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Study Arms Performance */}
              <Card className="col-span-2 bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-cyan-400" />
                    Study Arms Performance
                  </CardTitle>
                  <CardDescription className="text-xs">Dose escalation and expansion cohorts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {STUDY_ARMS.map((arm) => (
                      <div
                        key={arm.arm}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <FlaskConical className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{arm.arm}</p>
                            <p className="text-xs text-slate-500">{arm.dose}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <p className="text-lg font-bold text-white">{arm.subjects}</p>
                            <p className="text-xs text-slate-500">Subjects</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-emerald-400">{arm.response}%</p>
                            <p className="text-xs text-slate-500">ORR</p>
                          </div>
                          <Badge
                            className={
                              arm.status === "Enrolling"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            }
                          >
                            {arm.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Key Milestones */}
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Key Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { milestone: "FPFV", date: "2021-11-15", status: "completed" },
                      { milestone: "RP2D Determination", date: "2024-03-22", status: "completed" },
                      { milestone: "Expansion Enrollment 50%", date: "2025-01-10", status: "completed" },
                      { milestone: "Interim Analysis", date: "2025-06-30", status: "upcoming" },
                      { milestone: "Primary Completion", date: "2026-06-30", status: "pending" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.status === "completed"
                              ? "bg-emerald-400"
                              : item.status === "upcoming"
                                ? "bg-amber-400"
                                : "bg-slate-600"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm text-white">{item.milestone}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(item.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        {item.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {item.status === "upcoming" && <Clock className="w-4 h-4 text-amber-400" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {AGENT_SYSTEMS.map((agent) => (
                <Card key={agent.id} className="bg-slate-900/60 border-slate-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${agent.bgClass} border ${agent.borderClass}`}>
                          <Zap className={`w-5 h-5 ${agent.colorClass}`} />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium">{agent.name}</CardTitle>
                          <CardDescription className="text-xs">{agent.role}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{agent.status}</Badge>
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

            {/* Agent Activity Feed */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Real-Time Agent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      agent: "AIDEN Compliance",
                      action: "Synchronized ClinicalTrials.gov record",
                      time: "2 min ago",
                      type: "sync",
                    },
                    {
                      agent: "PHOENIX Safety",
                      action: "Processed 3 new AE reports - all Grade 1-2",
                      time: "15 min ago",
                      type: "safety",
                    },
                    {
                      agent: "AURA Clinical",
                      action: "Protocol deviation detected at site US-002 - auto-remediation initiated",
                      time: "1 hour ago",
                      type: "alert",
                    },
                    {
                      agent: "CHRONOS Timeline",
                      action: "Updated enrollment forecast: +12 subjects by month-end",
                      time: "3 hours ago",
                      type: "forecast",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
                    >
                      {item.type === "alert" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : item.type === "safety" ? (
                        <Heart className="w-4 h-4 text-rose-400" />
                      ) : item.type === "sync" ? (
                        <RefreshCw className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          <span className="text-cyan-400">{item.agent}</span> - {item.action}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sites Tab */}
          <TabsContent value="sites" className="space-y-6">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Site Performance Dashboard
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time enrollment and subject status across all active sites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {SITE_METRICS.map((site) => (
                    <div
                      key={site.siteId}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <Database className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{site.location}</p>
                          <p className="text-xs text-slate-500 font-mono">{site.siteId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-xl font-bold text-white">{site.enrolled}</p>
                          <p className="text-xs text-slate-500">Enrolled</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-amber-400">{site.screening}</p>
                          <p className="text-xs text-slate-500">Screening</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-emerald-400">{site.active}</p>
                          <p className="text-xs text-slate-500">Active</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-slate-700 bg-transparent text-slate-300">
                          Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Safety Tab */}
          <TabsContent value="safety" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    AE Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { grade: "Grade 1", count: 156, color: "text-emerald-400" },
                      { grade: "Grade 2", count: 89, color: "text-amber-400" },
                      { grade: "Grade 3", count: 23, color: "text-orange-400" },
                      { grade: "Grade 4", count: 4, color: "text-rose-400" },
                      { grade: "Grade 5", count: 0, color: "text-red-500" },
                    ].map((item) => (
                      <div key={item.grade} className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">{item.grade}</span>
                        <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2 bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    PHOENIX Safety Agent Status
                  </CardTitle>
                  <CardDescription className="text-xs">Automated pharmacovigilance monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-white">SUSAR Detection</span>
                      </div>
                      <p className="text-xs text-slate-400">0 SUSARs in last 30 days</p>
                      <p className="text-xs text-slate-500 mt-1">Auto-reporting to FDA: ENABLED</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-white">Signal Detection</span>
                      </div>
                      <p className="text-xs text-slate-400">No new safety signals identified</p>
                      <p className="text-xs text-slate-500 mt-1">Last scan: 2 hours ago</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-white">DSMB Readiness</span>
                      </div>
                      <p className="text-xs text-slate-400">Next meeting: Feb 15, 2025</p>
                      <p className="text-xs text-slate-500 mt-1">Packages auto-generated</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-medium text-white">MedDRA Coding</span>
                      </div>
                      <p className="text-xs text-slate-400">100% auto-coded (v27.0)</p>
                      <p className="text-xs text-slate-500 mt-1">Manual review queue: 0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    ClinicalTrials.gov Integration
                  </CardTitle>
                  <CardDescription className="text-xs">Automated registry synchronization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-sm text-white">Record Status</p>
                          <p className="text-xs text-slate-500">NCT05094336</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">CURRENT</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-sm text-white">Last Sync</p>
                          <p className="text-xs text-slate-500">Auto-sync enabled</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-400">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-sm text-white">Next Required Update</p>
                          <p className="text-xs text-slate-500">Per FDAAA 801</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-400">14 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    Regulatory Framework Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { framework: "ICH E6(R2) GCP", status: "Compliant", score: 99.2 },
                      { framework: "21 CFR Part 11", status: "Compliant", score: 97.8 },
                      { framework: "HIPAA Privacy Rule", status: "Compliant", score: 99.5 },
                      { framework: "GDPR (EU Sites)", status: "Compliant", score: 98.1 },
                    ].map((item) => (
                      <div
                        key={item.framework}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-white">{item.framework}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-mono text-emerald-400">{item.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Audit Trail */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  Audit Trail (21 CFR Part 11 Compliant)
                </CardTitle>
                <CardDescription className="text-xs">Immutable record of all system actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    {
                      action: "ENROLLMENT_UPDATE",
                      user: "AIDEN-COMPLIANCE",
                      detail: "Subject 287 enrolled at site US-001",
                      timestamp: "2025-01-28T14:32:00Z",
                    },
                    {
                      action: "CT_GOV_SYNC",
                      user: "AIDEN-COMPLIANCE",
                      detail: "ClinicalTrials.gov record synchronized",
                      timestamp: "2025-01-28T12:00:00Z",
                    },
                    {
                      action: "AE_PROCESSED",
                      user: "PHOENIX-SAFETY",
                      detail: "3 AEs auto-coded and submitted to safety database",
                      timestamp: "2025-01-28T10:15:00Z",
                    },
                    {
                      action: "PROTOCOL_DEVIATION",
                      user: "AURA-CLINICAL",
                      detail: "Minor deviation logged at US-002 - visit window exceeded",
                      timestamp: "2025-01-28T09:45:00Z",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 font-mono text-xs"
                    >
                      <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
                        {item.action}
                      </Badge>
                      <span className="text-slate-500">{item.user}</span>
                      <span className="flex-1 text-slate-400">{item.detail}</span>
                      <span className="text-slate-600">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Protocol Constants */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Info className="w-3 h-3" />
                DNA-Lang Clinical v2.1
              </span>
              <span>
                Lambda-Phi: <span className="text-cyan-400 font-mono">0.7734</span>
              </span>
              <span>
                Agent Coherence: <span className="text-emerald-400 font-mono">STABLE</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>ClinicalTrials.gov ID: {AMG193_TRIAL.nctId}</span>
              <span>Last System Update: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
