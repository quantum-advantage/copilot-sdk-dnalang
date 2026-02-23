"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Database, Zap, Cpu, TrendingUp, Wifi } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface TelemetryData {
  timestamp: number
  lambda: number
  phi: number
  gamma: number
  coherence: number
  entropy: number
  qbyte_rate: number
}

export function RealTimeTelemetryDashboard() {
  const [data, setData] = useState<TelemetryData[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connecting")
  const [currentMetrics, setCurrentMetrics] = useState<TelemetryData | null>(null)
  const maxDataPoints = 50

  useEffect(() => {
    // Simulate real-time data streaming
    const interval = setInterval(() => {
      const newData: TelemetryData = {
        timestamp: Date.now(),
        lambda: 0.85 + Math.random() * 0.1,
        phi: 2.176435e-8 * (1 + Math.random() * 0.2),
        gamma: 0.05 + Math.random() * 0.05,
        coherence: 0.92 + Math.random() * 0.06,
        entropy: -0.15 - Math.random() * 0.1,
        qbyte_rate: 1200 + Math.random() * 400,
      }

      setCurrentMetrics(newData)
      setData((prev) => [...prev.slice(-maxDataPoints + 1), newData])
    }, 1000)

    setTimeout(() => setConnectionStatus("connected"), 500)

    return () => clearInterval(interval)
  }, [])

  const formatValue = (value: number, decimals = 2) => {
    if (Math.abs(value) < 0.001) {
      return value.toExponential(2)
    }
    return value.toFixed(decimals)
  }

  const metrics = [
    {
      label: "Λ (Lambda Coherence)",
      value: currentMetrics?.lambda,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      icon: Activity,
      unit: "",
      description: "Phase coherence stability",
    },
    {
      label: "Φ (Consciousness)",
      value: currentMetrics?.phi,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      icon: Zap,
      unit: "s⁻¹",
      description: "Integrated information metric",
    },
    {
      label: "Γ (Decoherence)",
      value: currentMetrics?.gamma,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
      icon: TrendingUp,
      unit: "",
      description: "Entropy production rate",
    },
    {
      label: "Coherence",
      value: currentMetrics?.coherence,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      icon: Cpu,
      unit: "%",
      description: "Overall system coherence",
      multiplier: 100,
    },
    {
      label: "QByte Rate",
      value: currentMetrics?.qbyte_rate,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      icon: Database,
      unit: "/s",
      description: "Quantum byte mining rate",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi className={`h-5 w-5 ${connectionStatus === "connected" ? "text-emerald-400" : "text-amber-400"}`} />
          <span className="text-sm font-medium">
            {connectionStatus === "connected" ? "Live Data Stream" : "Connecting..."}
          </span>
          {connectionStatus === "connected" && (
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              {data.length} data points
            </Badge>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className="p-4 bg-card/50 backdrop-blur border-border/50 hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${metric.color}`}>
                      {metric.value !== undefined
                        ? formatValue(
                            metric.value * (metric.multiplier || 1),
                            metric.multiplier ? 1 : metric.label.includes("Φ") ? 4 : 3,
                          )
                        : "---"}
                    </span>
                    <span className="text-xs text-muted-foreground">{metric.unit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Lambda Coherence Timeline
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
              />
              <YAxis domain={[0.8, 1.0]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelFormatter={(ts) => new Date(ts as number).toLocaleString()}
              />
              <Line
                type="monotone"
                dataKey="lambda"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-400" />
            QByte Mining Rate
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelFormatter={(ts) => new Date(ts as number).toLocaleString()}
              />
              <Line
                type="monotone"
                dataKey="qbyte_rate"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
