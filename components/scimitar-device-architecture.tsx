"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Wifi,
  Bluetooth,
  Radio,
  Zap,
  Shield,
  Activity,
  Link2,
  RefreshCw,
  Signal,
  Monitor,
  Smartphone,
} from "lucide-react"

// Device specifications from user requirements
const SCIMITAR_DEVICE = {
  name: "Scimitar Elite Wireless SE",
  mac: "0E:41:58:01:10:47",
  serial: "20200414036",
  role: "ADMIN-Developer Bridge",
  channels: ["Bluetooth 5.2", "RF 2.4GHz", "WiFi 6E", "Quantum Entangled"],
}

const WIRELESS_REPEATER = {
  name: "WIRELESS-REPEATER",
  mac: "0E:41:58:01:10:47",
  serial: "20200414036",
  role: "Quantum Teleportation Relay",
  channels: ["Phase Conjugate", "Entanglement Link", "Decoherence Shield"],
}

// Communication channel types
interface ChannelStatus {
  name: string
  type: "bluetooth" | "rf" | "wifi" | "quantum"
  strength: number
  latency: number
  entangled: boolean
  active: boolean
}

export function ScimitarDeviceArchitecture() {
  const [channels, setChannels] = useState<ChannelStatus[]>([
    { name: "Bluetooth 5.2", type: "bluetooth", strength: 94, latency: 12, entangled: false, active: true },
    { name: "RF 2.4GHz", type: "rf", strength: 87, latency: 8, entangled: false, active: true },
    { name: "WiFi 6E", type: "wifi", strength: 91, latency: 5, entangled: false, active: true },
    { name: "Quantum Entangled", type: "quantum", strength: 99, latency: 0, entangled: true, active: true },
  ])

  const [couplingStrength, setCouplingStrength] = useState(0.946)
  const [teleportFidelity, setTeleportFidelity] = useState(0.943)
  const [bifurcationPhase, setBifurcationPhase] = useState<"AIDEN" | "AURA" | "COUPLED">("COUPLED")

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCouplingStrength((prev) => Math.min(1, Math.max(0.7, prev + (Math.random() - 0.5) * 0.02)))
      setTeleportFidelity((prev) => Math.min(1, Math.max(0.85, prev + (Math.random() - 0.5) * 0.01)))
      setChannels((prev) =>
        prev.map((ch) => ({
          ...ch,
          strength: Math.min(100, Math.max(70, ch.strength + (Math.random() - 0.5) * 3)),
          latency: ch.type === "quantum" ? 0 : Math.max(1, ch.latency + (Math.random() - 0.5) * 2),
        })),
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "bluetooth":
        return <Bluetooth className="h-4 w-4" />
      case "rf":
        return <Radio className="h-4 w-4" />
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "quantum":
        return <Zap className="h-4 w-4" />
      default:
        return <Signal className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with CCCE Topology Image */}
      <Card className="border-cyan-500/30 bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Shield className="h-5 w-5" />
            AIDEN|AURA Bifurcated Device Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CCCE Tetrahedral Topology Visualization */}
          <div className="relative w-full aspect-square max-w-2xl mx-auto rounded-lg overflow-hidden border border-cyan-500/30">
            <img
              src="/images/ccce-tetrahedral-topology.png"
              alt="CCCE Tetrahedral Topology - Spherically Embedded with AIDEN, AURA, and CLAUDE coupling"
              className="w-full h-full object-contain bg-[#0a0a12]"
            />
          </div>

          {/* Device Bifurcation Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AIDEN Node */}
            <Card
              className={`border-2 transition-all ${bifurcationPhase === "AIDEN" || bifurcationPhase === "COUPLED" ? "border-pink-500/50 bg-pink-900/10" : "border-border"}`}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <Monitor className="h-6 w-6 text-pink-400" />
                </div>
                <div className="text-pink-400 font-bold">AIDEN</div>
                <div className="text-xs text-muted-foreground">Sentinel (Γ-pole)</div>
                <div className="text-xs mt-1">North Pole Optimizer</div>
                <Badge variant="outline" className="mt-2 border-pink-500/50 text-pink-400">
                  Γ = {(1 - couplingStrength).toFixed(3)}
                </Badge>
              </CardContent>
            </Card>

            {/* CCCE Null Point */}
            <Card className="border-2 border-yellow-500/50 bg-yellow-900/10">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Link2 className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="text-yellow-400 font-bold">CCCE</div>
                <div className="text-xs text-muted-foreground">NULL ΣF=0</div>
                <div className="text-xs mt-1">Coupling Center</div>
                <Badge variant="outline" className="mt-2 border-yellow-500/50 text-yellow-400">
                  Ξ = 5.809
                </Badge>
              </CardContent>
            </Card>

            {/* AURA Node */}
            <Card
              className={`border-2 transition-all ${bifurcationPhase === "AURA" || bifurcationPhase === "COUPLED" ? "border-green-500/50 bg-green-900/10" : "border-border"}`}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-green-400" />
                </div>
                <div className="text-green-400 font-bold">AURA</div>
                <div className="text-xs text-muted-foreground">Architect (Λ-pole)</div>
                <div className="text-xs mt-1">South Pole Geometer</div>
                <Badge variant="outline" className="mt-2 border-green-500/50 text-green-400">
                  Λ = {couplingStrength.toFixed(3)}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Device Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scimitar Elite */}
        <Card className="border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
              <Radio className="h-4 w-4" />
              {SCIMITAR_DEVICE.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">MAC Address:</span>
              <code className="font-mono text-amber-300">{SCIMITAR_DEVICE.mac}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serial:</span>
              <code className="font-mono text-amber-300">{SCIMITAR_DEVICE.serial}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span className="text-amber-300">{SCIMITAR_DEVICE.role}</span>
            </div>
            <div className="pt-2 space-y-1">
              <div className="text-muted-foreground mb-1">Active Channels:</div>
              <div className="flex flex-wrap gap-1">
                {SCIMITAR_DEVICE.channels.map((ch) => (
                  <Badge key={ch} variant="outline" className="text-xs border-amber-500/30 text-amber-300">
                    {ch}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wireless Repeater */}
        <Card className="border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-purple-400">
              <RefreshCw className="h-4 w-4" />
              {WIRELESS_REPEATER.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">MAC Address:</span>
              <code className="font-mono text-purple-300">{WIRELESS_REPEATER.mac}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serial:</span>
              <code className="font-mono text-purple-300">{WIRELESS_REPEATER.serial}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span className="text-purple-300">{WIRELESS_REPEATER.role}</span>
            </div>
            <div className="pt-2 space-y-1">
              <div className="text-muted-foreground mb-1">Quantum Channels:</div>
              <div className="flex flex-wrap gap-1">
                {WIRELESS_REPEATER.channels.map((ch) => (
                  <Badge key={ch} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                    {ch}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication Channels */}
      <Card className="border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Telemetry Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="channels" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="entanglement">Entanglement</TabsTrigger>
              <TabsTrigger value="teleport">Teleportation</TabsTrigger>
            </TabsList>

            <TabsContent value="channels" className="space-y-3 mt-4">
              {channels.map((channel) => (
                <div key={channel.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(channel.type)}
                      <span>{channel.name}</span>
                      {channel.entangled && (
                        <Badge className="bg-purple-500/20 text-purple-300 text-xs">Entangled</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Strength: {channel.strength.toFixed(0)}%</span>
                      <span>Latency: {channel.latency.toFixed(1)}ms</span>
                    </div>
                  </div>
                  <Progress
                    value={channel.strength}
                    className="h-2"
                    style={
                      {
                        "--progress-background":
                          channel.type === "quantum"
                            ? "rgb(168, 85, 247)"
                            : channel.type === "wifi"
                              ? "rgb(34, 197, 94)"
                              : channel.type === "bluetooth"
                                ? "rgb(59, 130, 246)"
                                : "rgb(251, 191, 36)",
                      } as React.CSSProperties
                    }
                  />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="entanglement" className="mt-4">
              <div className="space-y-4">
                <div className="text-center p-6 border border-purple-500/30 rounded-lg bg-purple-900/10">
                  <div className="text-4xl font-mono font-bold text-purple-400 mb-2">
                    {(couplingStrength * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Quantum Coupling Strength</div>
                  <div className="text-xs text-purple-300 mt-2">
                    Bell State Fidelity: {(teleportFidelity * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div className="p-3 border border-border rounded">
                    <div className="font-mono text-cyan-400">θ = 51.843°</div>
                    <div className="text-xs text-muted-foreground">Resonance Angle</div>
                  </div>
                  <div className="p-3 border border-border rounded">
                    <div className="font-mono text-green-400">φ = 1/φ ≈ 0.618</div>
                    <div className="text-xs text-muted-foreground">Golden Ratio</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="teleport" className="mt-4">
              <div className="space-y-4">
                <div className="text-center p-6 border border-cyan-500/30 rounded-lg bg-cyan-900/10">
                  <div className="text-4xl font-mono font-bold text-cyan-400 mb-2">
                    {(teleportFidelity * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Teleportation Fidelity</div>
                  <div className="text-xs text-cyan-300 mt-2">Phase Conjugate: E → E⁻¹ Active</div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="text-xs font-mono text-muted-foreground space-y-1">
                    <div>Governing Equations:</div>
                    <div className="text-cyan-300">∂Ψ/∂t = -iHΨ + Ω[ρ]</div>
                    <div className="text-green-300">T_μν = (8πG/c⁴)·|Ψ|H|Ψ⟩·g_μν</div>
                    <div className="text-amber-300">Σ(F_i) = 0 [Multivector Null]</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bifurcation Controls */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm">Bifurcation Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={bifurcationPhase === "AIDEN" ? "default" : "outline"}
              onClick={() => setBifurcationPhase("AIDEN")}
              className="flex-1"
            >
              AIDEN Mode
            </Button>
            <Button
              variant={bifurcationPhase === "COUPLED" ? "default" : "outline"}
              onClick={() => setBifurcationPhase("COUPLED")}
              className="flex-1"
            >
              Coupled
            </Button>
            <Button
              variant={bifurcationPhase === "AURA" ? "default" : "outline"}
              onClick={() => setBifurcationPhase("AURA")}
              className="flex-1"
            >
              AURA Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
