"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface BridgeStatus {
  adb: boolean
  z3bra: boolean
  ibmQuantum: boolean
  auraChatbot: boolean
  androidPackets: number
  quantumExecutions: number
  lastUpdate: string
}

export function QuantumBridgeMonitor() {
  const [status, setStatus] = useState<BridgeStatus>({
    adb: false,
    z3bra: false,
    ibmQuantum: false,
    auraChatbot: false,
    androidPackets: 0,
    quantumExecutions: 0,
    lastUpdate: "Never",
  })

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/quantum-bridge/status")
        if (res.ok) {
          const data = await res.json()
          setStatus(data)
        }
      } catch (error) {
        console.error("[v0] Quantum bridge status fetch failed:", error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/50 backdrop-blur-xl border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">ADB Connection</div>
              <div className="text-2xl font-bold mt-1">{status.adb ? "Connected" : "Offline"}</div>
            </div>
            <Badge variant={status.adb ? "default" : "secondary"}>{status.adb ? "✅" : "❌"}</Badge>
          </div>
        </Card>

        <Card className="p-4 bg-card/50 backdrop-blur-xl border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Z3bra Framework</div>
              <div className="text-2xl font-bold mt-1">{status.z3bra ? "Active" : "Offline"}</div>
            </div>
            <Badge variant={status.z3bra ? "default" : "secondary"}>{status.z3bra ? "✅" : "❌"}</Badge>
          </div>
        </Card>

        <Card className="p-4 bg-card/50 backdrop-blur-xl border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">IBM Quantum</div>
              <div className="text-2xl font-bold mt-1">{status.ibmQuantum ? "Ready" : "Offline"}</div>
            </div>
            <Badge variant={status.ibmQuantum ? "default" : "secondary"}>{status.ibmQuantum ? "✅" : "❌"}</Badge>
          </div>
        </Card>

        <Card className="p-4 bg-card/50 backdrop-blur-xl border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Aura Chatbot</div>
              <div className="text-2xl font-bold mt-1">{status.auraChatbot ? "Online" : "Offline"}</div>
            </div>
            <Badge variant={status.auraChatbot ? "default" : "secondary"}>{status.auraChatbot ? "✅" : "❌"}</Badge>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-card/50 backdrop-blur-xl border-primary/20">
        <h3 className="text-lg font-semibold mb-4">Telemetry Statistics</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Android Packets</span>
              <span className="font-mono font-bold">{status.androidPackets}</span>
            </div>
            <Progress value={status.androidPackets % 100} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Quantum Executions</span>
              <span className="font-mono font-bold">{status.quantumExecutions}</span>
            </div>
            <Progress value={status.quantumExecutions % 100} className="h-2" />
          </div>

          <div className="pt-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground">Last Update: {status.lastUpdate}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
