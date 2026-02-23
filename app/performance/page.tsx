"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Cpu,
  HardDrive,
  Wifi,
  Atom,
  Zap,
  Clock,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Activity,
  Server,
  Gauge,
  BarChart3,
  TrendingUp,
} from "lucide-react"

interface PerformanceMetrics {
  cpu: { usage: number; cores: number; frequency: number }
  memory: { used: number; total: number; heap: number }
  network: { latency: number; bandwidth: number; packetLoss: number }
  quantum: { qubits_active: number; gate_fidelity: number; coherence_time: number; entanglement_pairs: number }
  inference: { requests_per_second: number; avg_latency_ms: number; p99_latency_ms: number; tokens_per_second: number }
  timestamp: number
}

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  uptime_seconds: number
  last_incident: string | null
  services: { name: string; status: "up" | "degraded" | "down"; latency_ms: number }[]
}

interface MetricHistory {
  timestamp: number
  value: number
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [cpuHistory, setCpuHistory] = useState<MetricHistory[]>([])
  const [memoryHistory, setMemoryHistory] = useState<MetricHistory[]>([])
  const [latencyHistory, setLatencyHistory] = useState<MetricHistory[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetch("/api/performance?type=all")
      const data = await response.json()
      
      setMetrics(data.metrics)
      setHealth(data.health)
      
      const now = Date.now()
      setCpuHistory(prev => [...prev.slice(-29), { timestamp: now, value: data.metrics.cpu.usage }])
      setMemoryHistory(prev => [...prev.slice(-29), { timestamp: now, value: (data.metrics.memory.used / data.metrics.memory.total) * 100 }])
      setLatencyHistory(prev => [...prev.slice(-29), { timestamp: now, value: data.metrics.inference.avg_latency_ms }])
    } catch (error) {
      console.error("[v0] Performance fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 2000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${mins}m`
  }

  if (loading || !metrics || !health) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    )
  }

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
                <BarChart3 className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">Performance Monitor</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={health.status === "healthy" ? "default" : "destructive"}
                  className={health.status === "healthy" ? "bg-secondary text-secondary-foreground" : ""}
                >
                  {health.status === "healthy" && <CheckCircle className="h-3 w-3 mr-1" />}
                  {health.status !== "healthy" && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {health.status.toUpperCase()}
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
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <Clock className="h-4 w-4 text-secondary" />
            </div>
            <div className="text-2xl font-bold font-mono">{formatUptime(health.uptime_seconds)}</div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Requests/sec</span>
              <Zap className="h-4 w-4 text-accent" />
            </div>
            <div className="text-2xl font-bold font-mono">{metrics.inference.requests_per_second.toFixed(0)}</div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Latency</span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold font-mono">{metrics.inference.avg_latency_ms.toFixed(0)}ms</div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Tokens/sec</span>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </div>
            <div className="text-2xl font-bold font-mono">{metrics.inference.tokens_per_second.toLocaleString()}</div>
          </Card>
        </div>

        {/* System Resources */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* CPU */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">CPU</h3>
                <p className="text-xs text-muted-foreground">{metrics.cpu.cores} cores @ {metrics.cpu.frequency.toFixed(1)} GHz</p>
              </div>
              <span className="ml-auto text-2xl font-bold font-mono">{metrics.cpu.usage.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.cpu.usage} className="h-2 mb-4" />
            <div className="flex items-end gap-0.5 h-12">
              {cpuHistory.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/30 rounded-t transition-all"
                  style={{ height: `${h.value}%` }}
                />
              ))}
            </div>
          </Card>

          {/* Memory */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Memory</h3>
                <p className="text-xs text-muted-foreground">{(metrics.memory.used / 1024).toFixed(1)} / {(metrics.memory.total / 1024).toFixed(0)} GB</p>
              </div>
              <span className="ml-auto text-2xl font-bold font-mono">{((metrics.memory.used / metrics.memory.total) * 100).toFixed(1)}%</span>
            </div>
            <Progress value={(metrics.memory.used / metrics.memory.total) * 100} className="h-2 mb-4" />
            <div className="flex items-end gap-0.5 h-12">
              {memoryHistory.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-secondary/30 rounded-t transition-all"
                  style={{ height: `${h.value}%` }}
                />
              ))}
            </div>
          </Card>

          {/* Network */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Wifi className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Network</h3>
                <p className="text-xs text-muted-foreground">{metrics.network.bandwidth.toFixed(0)} Mbps</p>
              </div>
              <span className="ml-auto text-2xl font-bold font-mono">{metrics.network.latency.toFixed(0)}ms</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Packet Loss</span>
                <div className="font-mono">{(metrics.network.packetLoss * 100).toFixed(3)}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">P99 Latency</span>
                <div className="font-mono">{metrics.inference.p99_latency_ms.toFixed(0)}ms</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quantum Metrics */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Atom className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">Quantum Backend</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold font-mono text-primary">{metrics.quantum.qubits_active}</div>
              <div className="text-sm text-muted-foreground mt-1">Active Qubits</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold font-mono text-secondary">{(metrics.quantum.gate_fidelity * 100).toFixed(2)}%</div>
              <div className="text-sm text-muted-foreground mt-1">Gate Fidelity</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold font-mono text-accent">{metrics.quantum.coherence_time.toFixed(0)}μs</div>
              <div className="text-sm text-muted-foreground mt-1">Coherence Time</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold font-mono">{metrics.quantum.entanglement_pairs}</div>
              <div className="text-sm text-muted-foreground mt-1">Entangled Pairs</div>
            </div>
          </div>
        </Card>

        {/* Services Status */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <Server className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">Service Health</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {health.services.map((service) => (
              <div 
                key={service.name}
                className={`p-4 rounded-lg border ${
                  service.status === "up" 
                    ? "border-secondary/30 bg-secondary/5" 
                    : service.status === "degraded"
                    ? "border-accent/30 bg-accent/5"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{service.name}</span>
                  <Badge 
                    variant={service.status === "up" ? "outline" : "destructive"}
                    className={service.status === "up" ? "text-secondary border-secondary" : ""}
                  >
                    {service.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gauge className="h-3 w-3" />
                  <span className="font-mono">{service.latency_ms}ms</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Footer links */}
        <div className="flex items-center justify-between mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/telemetry" className="hover:text-foreground transition-colors">
              CCCE Telemetry
            </Link>
            <Link href="/ai-assistant" className="hover:text-foreground transition-colors">
              NC-LM Chat
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
