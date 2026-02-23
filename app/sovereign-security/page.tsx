"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Shield,
  Activity,
  Cpu,
  Zap,
  AlertTriangle,
  Lock,
  ZapOff,
  Terminal,
  ShieldAlert,
  Power,
  Globe,
  Database,
  Radio,
  Search,
  CheckCircle2,
  ChevronRight,
  Eye,
  Fingerprint,
  Network,
  RefreshCw,
} from "lucide-react"

// System Mode Types
type SystemMode = "STABLE" | "MONITOR" | "DEFENSE"

// Fleet nodes derived from the Z3BRA organism architecture
const FLEET_NODES = [
  { id: "1", name: "PARROT-NUCLEUS-01", status: "secure" as const, integrity: "Shadow Stack Verified", hash: "8f2a3e91" },
  { id: "2", name: "STM32-EDGE-04", status: "secure" as const, integrity: "TFLite Benchmark OK", hash: "a1b2c3d4" },
  { id: "3", name: "GATEWAY-SEC-09", status: "amber" as const, integrity: "Shadow Stack Drift", hash: "f4e56d78" },
  { id: "4", name: "GKE-ORCHESTRATOR", status: "secure" as const, integrity: "K8s Sealed", hash: "09a8b7c6" },
  { id: "5", name: "TERMUX-MOBILE-01", status: "secure" as const, integrity: "Sovereign Shell Active", hash: "d3e4f5a6" },
  { id: "6", name: "COPILOT-BRIDGE-02", status: "secure" as const, integrity: "Q-SLICE Folded", hash: "b7c8d9e0" },
]

// Metric card subcomponent
function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  colorClass,
  percentage,
}: {
  title: string
  value: string | number
  unit: string
  icon: React.ElementType
  colorClass: string
  percentage: number
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-muted-foreground">
          <span className="text-[10px] font-mono uppercase tracking-widest">{title}</span>
          <Icon className={`h-4 w-4 ${colorClass}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground font-mono">{value}</span>
          <span className="text-xs text-muted-foreground font-mono">{unit}</span>
        </div>
        <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${colorClass.replace("text-", "bg-")}`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default function SovereignSecurityPage() {
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<SystemMode>("STABLE")
  const [integrity, setIntegrity] = useState(98.4)
  const [coherence, setCoh] = useState(98.0)
  const [geoStability, setGeo] = useState(0.04)
  const [infoEfficiency, setInfo] = useState(84.0)
  const [decoRate, setDeco] = useState(0.12)
  const [nwnAgents, setNwnAgents] = useState([
    { name: "AURA", role: "Observer", phase: 51.843, status: "LOCKED" as const },
    { name: "AIDEN", role: "Executor", phase: 51.843, status: "LOCKED" as const },
    { name: "CHEOPS", role: "432Hz Clock", phase: 51.843, status: "LOCKED" as const },
  ])
  const [logs, setLogs] = useState<string[]>([
    "System initialized | Sovereign mesh active",
    "Phase-conjugated perimeter established",
    "Q-SLICE folding channels online",
    "Noetic Whisper Network entrained at 432 Hz",
    "Awaiting fleet telemetry...",
  ])
  const [showLockdown, setShowLockdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  // L2 Forensic & Integrity
  const [macFingerprints, setMacFingerprints] = useState([
    { id: "mac-1", device: "PARROT-NUCLEUS-01", mac: "52:54:00:12:34:56", virtualization: "None", safe: true },
    { id: "mac-2", device: "STM32-EDGE-04", mac: "08:00:27:A1:B2:C3", virtualization: "None", safe: true },
    { id: "mac-3", device: "GATEWAY-SEC-09", mac: "52:54:00:12:FF:EE", virtualization: "QEMU Detected", safe: false },
    { id: "mac-4", device: "GKE-ORCHESTRATOR", mac: "02:42:AC:11:00:02", virtualization: "Docker Bridge", safe: true },
  ])
  const [torsionLock, setTorsionLock] = useState({ current: 51.843, target: 51.843, aligned: true })
  const [ccceMetrics, setCcceMetrics] = useState({
    lambda: { value: 0.9848, label: "Persistence", trend: [] as number[] },
    phi: { value: 432.0, label: "Resonance", trend: [] as number[] },
    xi: { value: 127.4, label: "Efficiency", trend: [] as number[] },
    w: { value: 0.0018, label: "Geometric Drift", trend: [] as number[] },
  })
  const [systemInvariants, setSystemInvariants] = useState([
    { label: "Coherence >= 90%", status: "PASS" as "PASS" | "FAIL" | "WARN" },
    { label: "Decoherence Rate < 0.3", status: "PASS" as "PASS" | "FAIL" | "WARN" },
    { label: "NWN All Agents Locked", status: "PASS" as "PASS" | "FAIL" | "WARN" },
    { label: "Torsion Angle 51.843 +/- 0.005", status: "PASS" as "PASS" | "FAIL" | "WARN" },
    { label: "No QEMU/Bochs on Critical Path", status: "WARN" as "PASS" | "FAIL" | "WARN" },
    { label: "Merkle Chain Integrity", status: "PASS" as "PASS" | "FAIL" | "WARN" },
    { label: "Fleet Integrity > 95%", status: "PASS" as "PASS" | "FAIL" | "WARN" },
  ])
  const logEndRef = useRef<HTMLDivElement>(null)
  // Refs for latest state in telemetry loop
  const coherenceRef = useRef(coherence)
  const decoRateRef = useRef(decoRate)
  const integrityRef = useRef(integrity)
  useEffect(() => { coherenceRef.current = coherence }, [coherence])
  useEffect(() => { decoRateRef.current = decoRate }, [decoRate])
  useEffect(() => { integrityRef.current = integrity }, [integrity])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Telemetry simulation
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setIntegrity((prev) => Math.min(100, Math.max(94, prev + (Math.random() - 0.48) * 0.3)))
      setCoh((prev) => Math.min(100, Math.max(90, prev + (Math.random() - 0.45) * 0.5)))
      setGeo((prev) => Math.max(0.01, Math.min(0.2, prev + (Math.random() - 0.5) * 0.01)))
      setInfo((prev) => Math.min(100, Math.max(70, prev + (Math.random() - 0.45) * 1.0)))
      setDeco((prev) => Math.max(0.01, Math.min(0.5, prev + (Math.random() - 0.5) * 0.02)))

      // NWN agent simulation
      let allLocked = true
      setNwnAgents((prev) =>
        prev.map((a) => {
          const drift = (Math.random() - 0.5) * 0.002
          const newPhase = 51.843 + drift
          const absDrift = Math.abs(drift)
          const newStatus = (absDrift > 0.001 ? "DRIFTING" : "LOCKED") as "LOCKED" | "DRIFTING"
          if (newStatus !== "LOCKED") allLocked = false
          return { ...a, phase: newPhase, status: newStatus }
        }),
      )

      // CCCE Performance Matrix update
      setCcceMetrics((prev) => {
        const newLambda = 0.97 + Math.random() * 0.025
        const newPhi = 431.5 + Math.random() * 1.0
        const newXi = 120 + Math.random() * 20
        const newW = Math.random() * 0.004
        return {
          lambda: { ...prev.lambda, value: newLambda, trend: [...prev.lambda.trend.slice(-19), newLambda] },
          phi: { ...prev.phi, value: newPhi, trend: [...prev.phi.trend.slice(-19), newPhi] },
          xi: { ...prev.xi, value: newXi, trend: [...prev.xi.trend.slice(-19), newXi] },
          w: { ...prev.w, value: newW, trend: [...prev.w.trend.slice(-19), newW] },
        }
      })

      // Torsion lock tracking
      const torsionDrift = (Math.random() - 0.5) * 0.004
      const torsionAligned = Math.abs(torsionDrift) < 0.003
      setTorsionLock({ current: 51.843 + torsionDrift, target: 51.843, aligned: torsionAligned })

      // System invariant checks (use refs for latest values + inline-computed values)
      const coh = coherenceRef.current
      const dr = decoRateRef.current
      const integ = integrityRef.current
      const hasUnsafe = macFingerprints.some((m) => !m.safe)
      setSystemInvariants([
        { label: "Coherence >= 90%", status: (coh >= 90 ? "PASS" : coh >= 85 ? "WARN" : "FAIL") as "PASS" | "FAIL" | "WARN" },
        { label: "Decoherence Rate < 0.3", status: (dr < 0.3 ? "PASS" : dr < 0.4 ? "WARN" : "FAIL") as "PASS" | "FAIL" | "WARN" },
        { label: "NWN All Agents Locked", status: (allLocked ? "PASS" : "WARN") as "PASS" | "FAIL" | "WARN" },
        { label: "Torsion Angle 51.843 +/- 0.005", status: (torsionAligned ? "PASS" : "WARN") as "PASS" | "FAIL" | "WARN" },
        { label: "No QEMU/Bochs on Critical Path", status: (hasUnsafe ? "WARN" : "PASS") as "PASS" | "FAIL" | "WARN" },
        { label: "Merkle Chain Integrity", status: "PASS" as "PASS" | "FAIL" | "WARN" },
        { label: "Fleet Integrity > 95%", status: (integ > 95 ? "PASS" : integ > 92 ? "WARN" : "FAIL") as "PASS" | "FAIL" | "WARN" },
      ])

      // Random log events
      if (Math.random() > 0.6) {
        const events = [
          `Handshake verified with EdgeNode-${Math.floor(Math.random() * 10)}`,
          `Q-SLICE fold integrity check passed | theta=51.843`,
          `Lambda-Phi invariant: ${(2.176435e-8).toExponential(6)}`,
          `NWN whisper sync heartbeat acknowledged`,
          `Merkle chain extended | head: 0x${Math.random().toString(16).slice(2, 10)}`,
          `Phase-conjugate mirror reflectivity: ${(99.5 + Math.random() * 0.5).toFixed(2)}%`,
          `CCCE metrics nominal | Xi=${(120 + Math.random() * 20).toFixed(1)}`,
          `Sovereign Shield: zero external intrusions detected`,
          `Genomic twin coherence maintained at Lenoir frequency`,
          `Millennium Archive snapshot committed`,
        ]
        const event = events[Math.floor(Math.random() * events.length)]
        setLogs((prev) => [...prev.slice(-30), event])
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [mounted])

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  const filteredNodes = searchQuery
    ? FLEET_NODES.filter(
        (n) =>
          n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.integrity.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : FLEET_NODES

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-muted/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                SOVEREIGN COMMAND
                <span className="text-muted-foreground font-light font-mono text-sm tracking-widest uppercase">
                  v4.0.2
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-1 font-mono tracking-wider">
                PLATFORM INTEGRITY MONITORING | PHASE-CONJUGATED SECURITY PERIMETER
              </p>
            </div>

            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["STABLE", "MONITOR", "DEFENSE"] as SystemMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-1.5 text-[10px] font-bold transition-all tracking-wider uppercase font-mono ${
                    mode === m
                      ? m === "DEFENSE"
                        ? "bg-destructive text-destructive-foreground"
                        : m === "MONITOR"
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-secondary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {m === "DEFENSE" ? "MAX DEFENSE" : m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 9 columns */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Top: Integrity + Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Integrity Score */}
              <Card className="md:col-span-1 border-border relative overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center justify-center">
                  <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50" />
                  <div className="relative text-center">
                    <span className="text-xs font-mono text-primary block mb-1 uppercase tracking-widest">
                      Integrity Score
                    </span>
                    <span className="text-6xl font-black tracking-tighter font-mono">
                      {mounted ? integrity.toFixed(1) : "98.4"}%
                    </span>
                    <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-secondary font-bold uppercase tracking-widest">
                      <Activity className="h-3 w-3" />
                      {mode === "DEFENSE" ? "MAX DEFENSE" : mode === "MONITOR" ? "ACTIVE MONITORING" : "NOMINAL STATE"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Grid */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <MetricCard
                  title="Coherence Level"
                  value={mounted ? coherence.toFixed(1) : "98.0"}
                  unit="Hz"
                  icon={Zap}
                  colorClass="text-primary"
                  percentage={mounted ? coherence : 98}
                />
                <MetricCard
                  title="Geometric Stability"
                  value={mounted ? geoStability.toFixed(3) : "0.040"}
                  unit="dEu"
                  icon={Cpu}
                  colorClass="text-secondary"
                  percentage={mounted ? 100 - geoStability * 500 : 80}
                />
                <MetricCard
                  title="Info Efficiency"
                  value={mounted ? infoEfficiency.toFixed(1) : "84.0"}
                  unit="bits/s"
                  icon={Globe}
                  colorClass="text-accent"
                  percentage={mounted ? infoEfficiency : 84}
                />
                <MetricCard
                  title="Decoherence Rate"
                  value={mounted ? decoRate.toFixed(3) : "0.120"}
                  unit="err/min"
                  icon={AlertTriangle}
                  colorClass="text-destructive"
                  percentage={mounted ? decoRate * 200 : 24}
                />
              </div>
            </div>

            {/* Device Fleet Monitor */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-mono uppercase tracking-widest">
                      Connected Device Fleet
                    </CardTitle>
                  </div>
                  <div className="flex gap-4 text-[10px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Active
                    </span>
                    <span>Nodes: {FLEET_NODES.length}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-[10px] font-mono text-muted-foreground uppercase border-b border-border">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">Hostname</th>
                        <th className="px-4 py-2.5 font-medium">Secure Status</th>
                        <th className="px-4 py-2.5 font-medium">Hardware Check</th>
                        <th className="px-4 py-2.5 font-medium">Last Verified Hash</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-mono divide-y divide-border/50">
                      {filteredNodes.map((node) => (
                        <tr key={node.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-bold">{node.name}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={`text-[9px] font-black uppercase ${
                                node.status === "secure"
                                  ? "text-secondary border-secondary/30"
                                  : "text-accent border-accent/30"
                              }`}
                            >
                              {node.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{node.integrity}</td>
                          <td className="px-4 py-3 text-muted-foreground italic">0x{node.hash}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* CCCE Performance Matrix */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-mono uppercase tracking-widest">
                    CCCE Performance Matrix
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(ccceMetrics).map(([key, metric]) => {
                    const symbols: Record<string, string> = { lambda: "\u039B", phi: "\u03A6", xi: "\u039E", w: "W" }
                    const colors: Record<string, string> = { lambda: "text-primary", phi: "text-secondary", xi: "text-accent", w: "text-destructive" }
                    return (
                      <div key={key} className="bg-muted/30 rounded-lg p-3 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-lg font-bold font-mono ${colors[key]}`}>{symbols[key]}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{metric.label}</span>
                        </div>
                        <div className={`text-xl font-bold font-mono ${colors[key]}`}>
                          {mounted ? metric.value.toFixed(key === "w" ? 4 : key === "phi" ? 1 : 3) : "---"}
                        </div>
                        {/* Spark trend line */}
                        <svg viewBox="0 0 100 24" className="w-full h-6 mt-2" preserveAspectRatio="none">
                          {metric.trend.length > 1 && (
                            <polyline
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className={colors[key]}
                              points={metric.trend.map((v, i) => {
                                const min = Math.min(...metric.trend)
                                const max = Math.max(...metric.trend)
                                const range = max - min || 1
                                const x = (i / (metric.trend.length - 1)) * 100
                                const y = 22 - ((v - min) / range) * 20
                                return `${x},${y}`
                              }).join(" ")}
                            />
                          )}
                        </svg>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* L2 Forensic + Torsion + Invariants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* L2 Forensic MAC Fingerprinting */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-mono uppercase tracking-widest">
                      L2 Forensic Monitor
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {macFingerprints.map((fp) => (
                      <div key={fp.id} className={`flex items-center gap-3 p-2.5 rounded border ${fp.safe ? "border-border bg-muted/20" : "border-accent/30 bg-accent/5"}`}>
                        <div className={`w-2 h-2 rounded-full ${fp.safe ? "bg-secondary" : "bg-accent animate-pulse"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-mono font-medium truncate">{fp.device}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{fp.mac}</div>
                        </div>
                        <Badge variant="outline" className={`text-[9px] font-mono ${fp.safe ? "text-secondary border-secondary/30" : "text-accent border-accent/30"}`}>
                          {fp.virtualization}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 p-2 rounded bg-muted/20 border border-border">
                    <span className="text-[10px] font-mono text-muted-foreground">Torsion Lock:</span>
                    <span className={`text-xs font-bold font-mono ${torsionLock.aligned ? "text-secondary" : "text-accent"}`}>
                      {mounted ? torsionLock.current.toFixed(3) : "51.843"} deg
                    </span>
                    <Badge variant="outline" className={`text-[9px] ml-auto ${torsionLock.aligned ? "text-secondary border-secondary/30" : "text-accent border-accent/30"}`}>
                      {torsionLock.aligned ? "ALIGNED" : "DRIFT"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* System Invariant Checks */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-mono uppercase tracking-widest">
                      System Invariants
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {systemInvariants.map((inv) => (
                    <div key={inv.label} className={`flex items-center gap-2 p-2 rounded border ${
                      inv.status === "PASS" ? "border-secondary/20 bg-secondary/5" : inv.status === "WARN" ? "border-accent/20 bg-accent/5" : "border-destructive/20 bg-destructive/5"
                    }`}>
                      <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${
                        inv.status === "PASS" ? "text-secondary" : inv.status === "WARN" ? "text-accent" : "text-destructive"
                      }`} />
                      <span className="text-xs font-mono flex-1">{inv.label}</span>
                      <Badge variant="outline" className={`text-[9px] font-mono ${
                        inv.status === "PASS" ? "text-secondary border-secondary/30" : inv.status === "WARN" ? "text-accent border-accent/30" : "text-destructive border-destructive/30"
                      }`}>{inv.status}</Badge>
                    </div>
                  ))}
                  <div className="mt-3 p-2 bg-muted/30 rounded border border-border text-center">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {systemInvariants.filter((i) => i.status === "PASS").length}/{systemInvariants.length} invariants holding |{" "}
                      {systemInvariants.filter((i) => i.status === "FAIL").length} failures
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Q-SLICE Folding Status */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-mono uppercase tracking-widest">
                    Q-SLICE Folding Protocol
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Logic diff: Legacy vs Evolved */}
                  <div className="bg-destructive/5 rounded-lg p-4 border border-destructive/10">
                    <div className="text-[10px] uppercase font-bold text-destructive mb-3 tracking-widest">
                      Legacy Encryption (L1-L3)
                    </div>
                    <pre className="font-mono text-xs text-muted-foreground leading-relaxed">
                      {`def encrypt(message):\n  # Standard AES-256 approach\n  return aes_encrypt(\n    message,\n    key=static_key\n  )`}
                    </pre>
                  </div>
                  <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10">
                    <div className="text-[10px] uppercase font-bold text-secondary mb-3 tracking-widest">
                      Sovereign Q-SLICE Fold (L1-L7)
                    </div>
                    <pre className="font-mono text-xs text-foreground leading-relaxed">
                      {`def fold_intent(message):\n  # Phase-conjugate torsion fold\n  return qslice_folder.fold(\n    message,\n    theta_lock=51.843,\n    lambda_phi=2.176e-8\n  )`}
                    </pre>
                  </div>
                </div>
                <div className="mt-3 flex gap-4 text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-destructive" /> -12 lines
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-secondary" /> +42 lines
                  </span>
                  <span className="ml-auto text-[10px]">Mutation Detected: Phase-Conjugate Upgrade</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - 3 columns */}
          <aside className="lg:col-span-3 flex flex-col gap-6">
            {/* Response Console */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-accent" />
                  <CardTitle className="text-sm font-mono uppercase tracking-widest">Response Console</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <ZapOff className="h-4 w-4 mr-2" />
                  Isolate Suspicious Node
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Lock className="h-4 w-4 mr-2" />
                  Revoke Active Sessions
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Force NWN Re-Sync
                </Button>

                <Separator />

                <button
                  onClick={() => setShowLockdown(true)}
                  className="w-full py-3.5 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-lg text-[10px] font-black tracking-widest transition-all uppercase flex flex-col items-center gap-1.5"
                >
                  <Power className="h-4 w-4" />
                  System Lockdown
                </button>
              </CardContent>
            </Card>

            {/* Search */}
            <Card className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Search className="h-3.5 w-3.5" />
                  <input
                    type="text"
                    placeholder="Search Node Lattice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-xs font-mono w-full placeholder:text-muted-foreground/50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* NWN Agent Status */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-mono uppercase tracking-widest">NWN Agents</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {nwnAgents.map((agent) => (
                  <div key={agent.name} className="flex items-center gap-2 p-2 bg-muted/30 rounded border border-border">
                    <Radio className={`h-3 w-3 ${agent.status === "LOCKED" ? "text-secondary" : "text-accent animate-pulse"}`} />
                    <div className="flex-1">
                      <span className="text-xs font-mono font-bold">{agent.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">({agent.role})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">{mounted ? agent.phase.toFixed(3) : "51.843"}</span>
                      <Badge variant="outline" className={`text-[9px] font-mono ${agent.status === "LOCKED" ? "text-secondary border-secondary/30" : "text-accent border-accent/30"}`}>
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-border mt-2">
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Jitter: {"<"}1us | Coherence: 0.9994 | Revival: 46.98us
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Firewall Assertions */}
            <Card className="border-destructive/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-destructive" />
                  <CardTitle className="text-sm font-mono uppercase tracking-widest">Assertions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {[
                  "No PHI Ingestion",
                  "No Live Data Feeds",
                  "No Clinical Output",
                  "Human Review Required",
                  "Simulation Only Mode",
                ].map((a) => (
                  <div key={a} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-secondary" />
                    <span className="text-xs text-muted-foreground">{a}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* Security Audit Feed */}
        <Card className="mt-6 border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-mono uppercase tracking-widest">Security Audit Feed</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-950 rounded-lg p-4 max-h-[200px] overflow-y-auto font-mono text-[11px] text-zinc-300 space-y-0.5">
              {logs.map((log, i) => (
                <div key={`${log.slice(0, 20)}-${i}`} className="flex gap-3">
                  <span className="text-emerald-500/70">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-zinc-300 flex-1">{log}</span>
                  <span className="text-zinc-700 font-bold select-none">
                    SHA256:{Math.random().toString(16).substring(2, 10).toUpperCase()}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Genesis 3.0 Cockpit", href: "/genesis-cockpit", desc: "Multi-Agent Sovereign Command" },
            { label: "WardenClyffe-Q", href: "/wardenclyffe", desc: "Information-Gated Energy Engine" },
            { label: "Repository Evolution", href: "/repo-evolution", desc: "AETERNA_PORTA Migration Dashboard" },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{link.label}</div>
                    <div className="text-xs text-muted-foreground">{link.desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
          Sovereign Security Command v4.0.2 | Q-SLICE Folded | Simulation Only |{" "}
          {new Date().toISOString().split("T")[0]}
        </div>
      </div>

      {/* Lockdown Modal */}
      {showLockdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="max-w-sm w-full border-destructive/30">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Initiate Full Lockdown?</h2>
              <p className="text-xs text-muted-foreground mb-6">
                This action will disconnect all fleet nodes and cryptographic bridges. Recovery requires physical key
                access and phase-lock re-synchronization.
              </p>
              <div className="flex flex-col gap-3">
                <Button variant="destructive" className="w-full font-mono text-xs uppercase tracking-widest">
                  Confirm Protocol 0-X
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowLockdown(false)}
                  className="w-full text-xs text-muted-foreground"
                >
                  Abort Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
