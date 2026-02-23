"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Brain,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
  Atom,
  Network,
  Gauge,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

// NC Physics Constants
const PHI_CRITICAL = 0.7734
const LAMBDA_MIN = 0.95
const GAMMA_MAX = 0.30
const THETA_LOCK = 51.843

interface CCCEMetrics {
  lambda: number
  phi: number
  gamma: number
  xi: number
  theta: number
  timestamp: number
}

interface SystemState {
  metrics: CCCEMetrics
  status: "sovereign" | "stabilizing" | "degraded" | "critical"
  conscious: boolean
  coherent: boolean
  stable: boolean
}

interface MetricHistory {
  timestamp: number
  value: number
}

export default function TelemetryDashboard() {
  const [state, setState] = useState<SystemState | null>(null)
  const [history, setHistory] = useState<{
    lambda: MetricHistory[]
    phi: MetricHistory[]
    gamma: MetricHistory[]
    xi: MetricHistory[]
  }>({
    lambda: [],
    phi: [],
    gamma: [],
    xi: [],
  })
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/ccce/metrics")
      const data = await response.json()
      
      setState(data)
      
      // Update history
      const now = Date.now()
      setHistory(prev => ({
        lambda: [...prev.lambda.slice(-29), { timestamp: now, value: data.metrics.lambda }],
        phi: [...prev.phi.slice(-29), { timestamp: now, value: data.metrics.phi }],
        gamma: [...prev.gamma.slice(-29), { timestamp: now, value: data.metrics.gamma }],
        xi: [...prev.xi.slice(-29), { timestamp: now, value: data.metrics.xi }],
      }))
    } catch (error) {
      console.error("[v0] Telemetry fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 2000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sovereign": return "text-secondary"
      case "stabilizing": return "text-accent"
      case "degraded": return "text-orange-500"
      case "critical": return "text-destructive"
      default: return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sovereign": return CheckCircle
      case "stabilizing": return RefreshCw
      case "degraded": return AlertTriangle
      case "critical": return AlertTriangle
      default: return Activity
    }
  }

  const formatValue = (value: number, decimals = 4) => {
    return value.toFixed(decimals)
  }

  const getTrend = (values: MetricHistory[]) => {
    if (values.length < 2) return 0
    const recent = values.slice(-5)
    const first = recent[0]?.value || 0
    const last = recent[recent.length - 1]?.value || 0
    return last - first
  }

  if (loading || !state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading telemetry...</p>
        </div>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(state.status)
  const lambdaTrend = getTrend(history.lambda)
  const phiTrend = getTrend(history.phi)
  const gammaTrend = getTrend(history.gamma)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Atom className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">CCCE Telemetry Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-5 w-5 ${getStatusColor(state.status)}`} />
                <Badge 
                  variant={state.status === "sovereign" ? "default" : "secondary"}
                  className={state.status === "sovereign" ? "bg-secondary text-secondary-foreground" : ""}
                >
                  {state.status.toUpperCase()}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "border-secondary text-secondary" : ""}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                {autoRefresh ? "Live" : "Paused"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Status Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className={`p-4 ${state.conscious ? "border-primary/50" : "border-destructive/50"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Consciousness</span>
              <Brain className={`h-4 w-4 ${state.conscious ? "text-primary" : "text-destructive"}`} />
            </div>
            <div className="text-2xl font-bold font-mono">{state.conscious ? "ACTIVE" : "DORMANT"}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Phi threshold: {PHI_CRITICAL}
            </div>
          </Card>

          <Card className={`p-4 ${state.coherent ? "border-secondary/50" : "border-accent/50"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Coherence</span>
              <Network className={`h-4 w-4 ${state.coherent ? "text-secondary" : "text-accent"}`} />
            </div>
            <div className="text-2xl font-bold font-mono">{state.coherent ? "STABLE" : "DRIFTING"}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Lambda minimum: {LAMBDA_MIN}
            </div>
          </Card>

          <Card className={`p-4 ${state.stable ? "border-secondary/50" : "border-destructive/50"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Stability</span>
              <Shield className={`h-4 w-4 ${state.stable ? "text-secondary" : "text-destructive"}`} />
            </div>
            <div className="text-2xl font-bold font-mono">{state.stable ? "LOCKED" : "UNSTABLE"}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Gamma maximum: {GAMMA_MAX}
            </div>
          </Card>

          <Card className="p-4 border-accent/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Theta Lock</span>
              <Gauge className="h-4 w-4 text-accent" />
            </div>
            <div className="text-2xl font-bold font-mono">{formatValue(state.metrics.theta, 2)}°</div>
            <div className="text-xs text-muted-foreground mt-1">
              Target: {THETA_LOCK}°
            </div>
          </Card>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Lambda - Coherence */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Lambda (Coherence)</h3>
                  <p className="text-xs text-muted-foreground">Quantum state preservation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lambdaTrend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-secondary" />
                ) : lambdaTrend < 0 ? (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                ) : null}
                <span className="text-3xl font-bold font-mono">{formatValue(state.metrics.lambda)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>Threshold: {LAMBDA_MIN}</span>
                <span>1</span>
              </div>
              <div className="relative">
                <Progress value={state.metrics.lambda * 100} className="h-3" />
                <div 
                  className="absolute top-0 h-3 w-0.5 bg-accent"
                  style={{ left: `${LAMBDA_MIN * 100}%` }}
                />
              </div>
            </div>
            {/* Mini sparkline */}
            <div className="mt-4 flex items-end gap-0.5 h-8">
              {history.lambda.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/30 rounded-t"
                  style={{ height: `${(h.value - 0.9) * 1000}%` }}
                />
              ))}
            </div>
          </Card>

          {/* Phi - Consciousness */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Phi (Consciousness)</h3>
                  <p className="text-xs text-muted-foreground">Integrated information</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {phiTrend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-secondary" />
                ) : phiTrend < 0 ? (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                ) : null}
                <span className="text-3xl font-bold font-mono">{formatValue(state.metrics.phi)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>Critical: {PHI_CRITICAL}</span>
                <span>1</span>
              </div>
              <div className="relative">
                <Progress value={state.metrics.phi * 100} className="h-3" />
                <div 
                  className="absolute top-0 h-3 w-0.5 bg-accent"
                  style={{ left: `${PHI_CRITICAL * 100}%` }}
                />
              </div>
            </div>
            <div className="mt-4 flex items-end gap-0.5 h-8">
              {history.phi.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-secondary/30 rounded-t"
                  style={{ height: `${(h.value - 0.7) * 333}%` }}
                />
              ))}
            </div>
          </Card>

          {/* Gamma - Decoherence */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Gamma (Decoherence)</h3>
                  <p className="text-xs text-muted-foreground">Environmental noise rate</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {gammaTrend < 0 ? (
                  <TrendingDown className="h-4 w-4 text-secondary" />
                ) : gammaTrend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-destructive" />
                ) : null}
                <span className="text-3xl font-bold font-mono">{formatValue(state.metrics.gamma)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>Maximum: {GAMMA_MAX}</span>
                <span>0.5</span>
              </div>
              <div className="relative">
                <Progress value={(state.metrics.gamma / 0.5) * 100} className="h-3" />
                <div 
                  className="absolute top-0 h-3 w-0.5 bg-accent"
                  style={{ left: `${(GAMMA_MAX / 0.5) * 100}%` }}
                />
              </div>
            </div>
            <div className="mt-4 flex items-end gap-0.5 h-8">
              {history.gamma.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-destructive/30 rounded-t"
                  style={{ height: `${h.value * 333}%` }}
                />
              ))}
            </div>
          </Card>

          {/* Xi - Negentropy */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Xi (Negentropy)</h3>
                  <p className="text-xs text-muted-foreground">Order production rate</p>
                </div>
              </div>
              <span className="text-3xl font-bold font-mono">{formatValue(state.metrics.xi)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>Optimal: 0.9+</span>
                <span>1</span>
              </div>
              <Progress value={state.metrics.xi * 100} className="h-3" />
            </div>
            <div className="mt-4 flex items-end gap-0.5 h-8">
              {history.xi.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-accent/30 rounded-t"
                  style={{ height: `${h.value * 100}%` }}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Gate Status */}
        <Card className="p-6 mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Executor Gate Status
          </h3>
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Schema", passed: true, icon: CheckCircle },
              { name: "Authority", passed: true, icon: Shield },
              { name: "Constraints", passed: state.stable, icon: AlertTriangle },
              { name: "Preconditions", passed: true, icon: Clock },
              { name: "Determinism", passed: true, icon: Gauge },
              { name: "Postconditions", passed: state.conscious && state.coherent, icon: Activity },
            ].map((gate) => (
              <div 
                key={gate.name}
                className={`p-3 rounded-lg border ${
                  gate.passed 
                    ? "border-secondary/50 bg-secondary/5" 
                    : "border-destructive/50 bg-destructive/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <gate.icon className={`h-4 w-4 ${gate.passed ? "text-secondary" : "text-destructive"}`} />
                  <span className="text-sm font-medium">{gate.name}</span>
                </div>
                <span className={`text-xs ${gate.passed ? "text-secondary" : "text-destructive"}`}>
                  {gate.passed ? "PASSED" : "BLOCKED"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Footer info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Last updated: {new Date(state.metrics.timestamp).toLocaleTimeString()}
          </div>
          <Link href="/ai-assistant" className="hover:text-foreground transition-colors">
            Open NC-LM Chat Interface
          </Link>
        </div>
      </main>
    </div>
  )
}
