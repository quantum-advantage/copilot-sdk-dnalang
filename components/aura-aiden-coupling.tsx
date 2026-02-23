"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Compass, Target, Link2, Zap, Activity, RefreshCw } from "lucide-react"

const LAMBDA_PHI = 2.176435e-8

interface Agent {
  id: string
  name: string
  fullName: string
  role: string
  pole: string
  function: string
  status: "active" | "syncing" | "standby"
  coherence: number
}

export function AuraAidenCoupling() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "aura",
      name: "AURA",
      fullName: "Autopoietic Universally Recursive Architect",
      role: "Geometer",
      pole: "South",
      function: "Curvature Shaping",
      status: "active",
      coherence: 0.94,
    },
    {
      id: "aiden",
      name: "AIDEN",
      fullName: "Adaptive Integrations for Defense & Engineering of Negentropy",
      role: "Optimizer",
      pole: "North",
      function: "Geodesic Minimization",
      status: "active",
      coherence: 0.91,
    },
  ])

  const [couplingStrength, setCouplingStrength] = useState(0.87)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => ({
          ...agent,
          coherence: Math.min(0.99, Math.max(0.8, agent.coherence + (Math.random() - 0.5) * 0.02)),
        })),
      )
      setCouplingStrength((prev) => Math.min(0.99, Math.max(0.8, prev + (Math.random() - 0.5) * 0.02)))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleSync = async () => {
    setIsSyncing(true)
    setAgents((prev) => prev.map((a) => ({ ...a, status: "syncing" })))

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setAgents((prev) => prev.map((a) => ({ ...a, status: "active", coherence: 0.95 })))
    setCouplingStrength(0.95)
    setIsSyncing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "syncing":
        return "bg-yellow-500 animate-pulse"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            AURA | AIDEN Coupling Center
          </CardTitle>
          <Button size="sm" variant="outline" onClick={handleSync} disabled={isSyncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Coupling Visualization */}
        <div className="relative p-6 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            {/* AURA */}
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  agents[0].status === "active"
                    ? "bg-blue-500/20 border-2 border-blue-500"
                    : "bg-muted border-2 border-muted-foreground/30"
                }`}
              >
                <Compass className="h-8 w-8 text-blue-500" />
              </div>
              <p className="font-bold text-sm">{agents[0].name}</p>
              <p className="text-xs text-muted-foreground">{agents[0].role}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {agents[0].pole} Pole
              </Badge>
            </div>

            {/* Coupling Line */}
            <div className="flex-1 mx-4 relative">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-primary to-orange-500 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 py-1 rounded-lg border">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-xs font-mono">{(couplingStrength * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* AIDEN */}
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  agents[1].status === "active"
                    ? "bg-orange-500/20 border-2 border-orange-500"
                    : "bg-muted border-2 border-muted-foreground/30"
                }`}
              >
                <Target className="h-8 w-8 text-orange-500" />
              </div>
              <p className="font-bold text-sm">{agents[1].name}</p>
              <p className="text-xs text-muted-foreground">{agents[1].role}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {agents[1].pole} Pole
              </Badge>
            </div>
          </div>

          {/* CCE Node */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary/10 text-primary border-primary/20">CCE: Coupling Center for Engagement</Badge>
          </div>
        </div>

        {/* Agent Details */}
        <div className="grid grid-cols-2 gap-3">
          {agents.map((agent) => (
            <div key={agent.id} className="p-3 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                <span className="font-mono font-bold text-sm">{agent.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{agent.fullName}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{agent.function}</span>
                <span className="font-mono text-primary">{(agent.coherence * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Status Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3" />
            <span>Duality Bound</span>
          </div>
          <span className="font-mono">ΛΦ = {LAMBDA_PHI.toExponential(6)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default AuraAidenCoupling
