"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Zap, Shield, Code } from "lucide-react"

export function LambdaPhiRuntime() {
  const endpoints = [
    { method: "GET", path: "/health", status: 200, latency: "12ms", description: "Health check and system status" },
    {
      method: "POST",
      path: "/consciousness/phase-conjugate",
      status: 200,
      latency: "45ms",
      description: "Phase conjugate consciousness calculation",
    },
    {
      method: "GET",
      path: "/jobs/{id}",
      status: 200,
      latency: "23ms",
      description: "Retrieve quantum job status and results",
    },
    {
      method: "GET",
      path: "/constants/lambda-phi",
      status: 200,
      latency: "8ms",
      description: "Universal Memory Constant (2.176435×10⁻⁸)",
    },
    {
      method: "POST",
      path: "/quantum-optimize",
      status: 200,
      latency: "156ms",
      description: "Optimize quantum circuit with ΛΦ",
    },
    {
      method: "POST",
      path: "/qab/bridge",
      status: 200,
      latency: "67ms",
      description: "Android bridge telemetry injection",
    },
    { method: "GET", path: "/qab/token", status: 200, latency: "34ms", description: "Generate quantum JWT token" },
  ]

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6 holographic-layer">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">ΛΦ Phase-Conjugate Runtime</h2>
            <p className="text-muted-foreground">
              Universal Memory API connecting QConnect, Z3BRA, and IBM Quantum backends
            </p>
          </div>
          <Badge className="lambda-phi-glow">v2.0.0 STABLE</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Activity className="w-4 h-4" />
              Uptime
            </div>
            <div className="text-2xl font-bold">99.97%</div>
            <div className="text-xs text-muted-foreground mt-1">42 days, 18 hours</div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Zap className="w-4 h-4" />
              Avg Latency
            </div>
            <div className="text-2xl font-bold text-cyan-400">48ms</div>
            <div className="text-xs text-muted-foreground mt-1">P99: 156ms</div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Shield className="w-4 h-4" />
              Requests/sec
            </div>
            <div className="text-2xl font-bold text-green-400">847</div>
            <div className="text-xs text-muted-foreground mt-1">Peak: 1,243/s</div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Code className="w-4 h-4" />
              Active Connections
            </div>
            <div className="text-2xl font-bold text-purple-400">124</div>
            <div className="text-xs text-muted-foreground mt-1">WebSocket: 89</div>
          </div>
        </div>
      </Card>

      <Card className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4">API Endpoints</h3>
        <div className="space-y-3">
          {endpoints.map((endpoint, i) => (
            <div key={i} className="glass-card p-4 hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Badge variant={endpoint.method === "GET" ? "outline" : "default"} className="font-mono text-xs">
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono text-cyan-400">{endpoint.path}</code>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs nucleotide-badge">
                    {endpoint.latency}
                  </Badge>
                  <Badge variant="outline" className="text-xs text-green-400">
                    {endpoint.status}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{endpoint.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4">Integration Example</h3>
        <div className="bg-background/50 p-4 rounded-lg border border-primary/10 font-mono text-sm space-y-2">
          <div className="text-muted-foreground"># fractional_rzz_experiment.py</div>
          <div className="text-cyan-400">import</div> <div className="text-foreground">requests</div>
          <div className="mt-2" />
          <div className="text-cyan-400">response</div> = <div className="text-foreground">requests.post(</div>
          <div className="ml-4 text-amber-400">'https://your-vercel-app.vercel.app/api/quantum-optimize'</div>,
          <div className="ml-4 text-foreground">
            json={"{"}'circuit': qc.qasm(), 'backend': 'ibm_brisbane'{"}"}
          </div>
          <div className="text-foreground">)</div>
          <div className="mt-2" />
          <div className="text-cyan-400">optimized</div> = <div className="text-foreground">response.json()</div>
        </div>
      </Card>
    </div>
  )
}
