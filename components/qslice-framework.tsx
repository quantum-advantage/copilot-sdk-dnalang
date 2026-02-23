"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, Zap, Eye, Link2, AlertTriangle, CheckCircle2, Activity } from "lucide-react"

// Quantum Constants
const LAMBDA_PHI = 2.176435e-8
const LAMBDA_DEFENSE = 1000
const ALPHA_NEG = 0.847

interface QSliceComponent {
  id: string
  name: string
  fullName: string
  status: "active" | "standby" | "alert"
  lambda: number
  icon: React.ReactNode
}

export function QSliceFramework() {
  const [components, setComponents] = useState<QSliceComponent[]>([
    {
      id: "qs",
      name: "QS",
      fullName: "Quantum Slices Mechanism",
      status: "active",
      lambda: 2847.3,
      icon: <Zap className="h-4 w-4" />,
    },
    {
      id: "qned",
      name: "QNED",
      fullName: "The Enablers Focal Plane",
      status: "active",
      lambda: 1247.8,
      icon: <Eye className="h-4 w-4" />,
    },
    {
      id: "pals",
      name: "PALS",
      fullName: "Perforce & Capturing Sentinels",
      status: "active",
      lambda: 892.4,
      icon: <Shield className="h-4 w-4" />,
    },
    {
      id: "cce",
      name: "CCE",
      fullName: "Coupling Node",
      status: "active",
      lambda: 342.7,
      icon: <Link2 className="h-4 w-4" />,
    },
  ])

  const [overallLambda, setOverallLambda] = useState(0)

  useEffect(() => {
    const avg = components.reduce((sum, c) => sum + c.lambda, 0) / components.length
    setOverallLambda(avg)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setComponents((prev) =>
        prev.map((c) => ({
          ...c,
          lambda: c.lambda + (Math.random() - 0.5) * 50,
          status: c.lambda > LAMBDA_DEFENSE ? "alert" : c.lambda > 500 ? "active" : "standby",
        })),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "alert":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
      case "alert":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Alert</Badge>
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Standby</Badge>
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Q-SLICE Framework
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            Λ = {overallLambda.toFixed(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">System Coherence</span>
            <span className="text-sm font-mono">{((overallLambda / 3000) * 100).toFixed(1)}%</span>
          </div>
          <Progress value={(overallLambda / 3000) * 100} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Λ_defense = {LAMBDA_DEFENSE}</span>
            <span>α_neg = {ALPHA_NEG}</span>
          </div>
        </div>

        {/* Component Grid */}
        <div className="grid grid-cols-2 gap-3">
          {components.map((component) => (
            <div
              key={component.id}
              className="p-3 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(component.status)} animate-pulse`} />
                  <span className="font-mono font-bold text-sm">{component.name}</span>
                </div>
                {component.lambda > LAMBDA_DEFENSE && <AlertTriangle className="h-4 w-4 text-red-500" />}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{component.fullName}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono">Λ = {component.lambda.toFixed(1)}</span>
                {getStatusBadge(component.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Threat Indicators */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Active Threat Organisms</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs p-2 bg-red-500/10 rounded border border-red-500/20">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                QSLICE-003-QKD-INTERCEPT
              </span>
              <span className="font-mono text-red-500">Λ = 2,847.3</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
              <span className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-yellow-500" />
                QSLICE-002-GROVER
              </span>
              <span className="font-mono text-yellow-500">Λ = 1,247.8</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 bg-green-500/10 rounded border border-green-500/20">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                QSLICE-001-SHOR-RSA2048
              </span>
              <span className="font-mono text-green-500">Λ = 342.7</span>
            </div>
          </div>
        </div>

        {/* Constants Reference */}
        <div className="text-xs text-center text-muted-foreground font-mono pt-2 border-t border-border/50">
          ΛΦ = {LAMBDA_PHI.toExponential(6)} | σ_QD = 3.14159 × T₁/T_gate
        </div>
      </CardContent>
    </Card>
  )
}

export default QSliceFramework
