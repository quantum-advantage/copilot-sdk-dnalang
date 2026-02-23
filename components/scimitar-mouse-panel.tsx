"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Mouse, Zap, Bell, Check, X, Play, AlertTriangle, Activity } from "lucide-react"

interface RGBColor {
  r: number
  g: number
  b: number
}

interface ScimitarZone {
  zone_id: number
  name: string
  color: RGBColor
  pattern: "solid" | "pulse" | "breathe" | "flash" | "rainbow" | "wave"
}

interface ButtonAction {
  type: "deploy" | "sandbox" | "discard" | "modify" | "approve" | "escalate"
  payload: unknown
  description: string
  requires_confirmation: boolean
}

interface ScimitarButton {
  button_id: number
  name: string
  color: RGBColor
  action: ButtonAction | null
  label: string
}

interface AgentProposal {
  id: string
  timestamp: number
  source_agent: string
  reason: string
  urgency: "low" | "medium" | "high" | "critical"
  summary: string
  actions: ButtonAction[]
  context: {
    ccce_state: {
      lambda: number
      phi: number
      gamma: number
      xi: number
    }
    related_tasks: string[]
    affected_files: string[]
  }
}

interface ScimitarEvent {
  timestamp: number
  type: string
  data: unknown
}

interface ScimitarState {
  state: "IDLE" | "ATTENTION" | "INSTRUCTION" | "EXECUTING"
  zones: ScimitarZone[]
  buttons: ScimitarButton[]
  pendingProposal: AgentProposal | null
  eventLog: ScimitarEvent[]
  telemetry?: {
    lambda: number
    phi: number
    gamma: number
    xi: number
    theta_lock: number
    timestamp: number
  }
}

function rgbToHex(color: RGBColor): string {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`
}

function rgbToCss(color: RGBColor): string {
  return `rgb(${color.r}, ${color.g}, ${color.b})`
}

export default function ScimitarMousePanel() {
  const [scimitarState, setScimitarState] = useState<ScimitarState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/peripherals/scimitar")
      if (!res.ok) throw new Error("Failed to fetch Scimitar state")
      const data = await res.json()
      setScimitarState(data)
      setError(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, 1000)
    return () => clearInterval(interval)
  }, [fetchState])

  const sendAction = async (action: string, payload?: unknown) => {
    try {
      const res = await fetch("/api/peripherals/scimitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      })
      if (!res.ok) throw new Error("Failed to send action")
      await fetchState()
    } catch (err) {
      setError(String(err))
    }
  }

  const simulateProposal = () => {
    sendAction("simulate_proposal", {
      agent: "CoderAgent",
      urgency: "medium",
      summary: "New feature implementation complete. Ready for deployment to production.",
      reason: "Code changes ready for review",
    })
  }

  const acknowledgeAttention = () => {
    sendAction("acknowledge")
  }

  const handleButtonPress = (buttonId: number) => {
    sendAction("button_press", { button_id: buttonId })
  }

  const resetToIdle = () => {
    sendAction("set_idle")
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Mouse className="h-8 w-8 mx-auto mb-4 animate-pulse" />
          Loading Scimitar state...
        </CardContent>
      </Card>
    )
  }

  if (error || !scimitarState) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
          {error || "Failed to load Scimitar state"}
        </CardContent>
      </Card>
    )
  }

  const stateColors: Record<string, string> = {
    IDLE: "text-green-500",
    ATTENTION: "text-amber-500",
    INSTRUCTION: "text-cyan-500",
    EXECUTING: "text-emerald-500",
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Mouse Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mouse className="h-5 w-5" />
                Scimitar Elite Wireless SE
              </CardTitle>
              <CardDescription>Agent-to-Operator Communication Interface</CardDescription>
            </div>
            <Badge
              className={`${scimitarState.state === "IDLE" ? "bg-green-500/20 text-green-500" : scimitarState.state === "ATTENTION" ? "bg-amber-500/20 text-amber-500 animate-pulse" : scimitarState.state === "INSTRUCTION" ? "bg-cyan-500/20 text-cyan-500" : "bg-emerald-500/20 text-emerald-500"}`}
            >
              {scimitarState.state}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mouse RGB Zones */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3">RGB Zones</h4>
            <div className="grid grid-cols-2 gap-3">
              {scimitarState.zones.map((zone) => (
                <div
                  key={zone.zone_id}
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: rgbToCss(zone.color),
                    backgroundColor: `rgba(${zone.color.r}, ${zone.color.g}, ${zone.color.b}, 0.1)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono">{zone.name}</span>
                    <div
                      className={`w-4 h-4 rounded-full ${zone.pattern === "flash" ? "animate-pulse" : zone.pattern === "breathe" ? "animate-pulse" : ""}`}
                      style={{ backgroundColor: rgbToCss(zone.color) }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {zone.pattern} | {rgbToHex(zone.color)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 12-Button Grid (MMO Side Panel) */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3">Side Buttons (12-Key Grid)</h4>
            <div className="grid grid-cols-3 gap-2">
              {scimitarState.buttons.slice(0, 12).map((button) => (
                <Button
                  key={button.button_id}
                  variant="outline"
                  size="sm"
                  className="h-16 flex flex-col items-center justify-center gap-1 transition-all bg-transparent"
                  style={{
                    borderColor: button.action ? rgbToCss(button.color) : undefined,
                    backgroundColor: button.action ? `rgba(${button.color.r}, ${button.color.g}, ${button.color.b}, 0.1)` : undefined,
                  }}
                  onClick={() => button.action && handleButtonPress(button.button_id)}
                  disabled={!button.action}
                >
                  <span className="text-lg font-bold">{button.button_id}</span>
                  {button.label && (
                    <span className="text-[10px] text-center leading-tight line-clamp-2">{button.label}</span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={simulateProposal} size="sm" variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Simulate Proposal
            </Button>
            {scimitarState.state === "ATTENTION" && (
              <Button onClick={acknowledgeAttention} size="sm" variant="default">
                <Check className="mr-2 h-4 w-4" />
                Acknowledge
              </Button>
            )}
            {scimitarState.state !== "IDLE" && (
              <Button onClick={resetToIdle} size="sm" variant="ghost">
                <X className="mr-2 h-4 w-4" />
                Reset to Idle
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Proposal & Telemetry */}
      <div className="space-y-6">
        {/* Pending Proposal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Pending Proposal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scimitarState.pendingProposal ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{scimitarState.pendingProposal.source_agent}</span>
                  <Badge
                    variant={scimitarState.pendingProposal.urgency === "critical" ? "destructive" : "secondary"}
                  >
                    {scimitarState.pendingProposal.urgency}
                  </Badge>
                </div>
                <p className="text-sm">{scimitarState.pendingProposal.summary}</p>
                <div className="text-xs text-muted-foreground">
                  Reason: {scimitarState.pendingProposal.reason}
                </div>

                {/* CCCE Context */}
                <div className="p-3 bg-muted/30 rounded-lg">
                  <h5 className="text-xs font-semibold mb-2">CCCE Context</h5>
                  <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                    <div>
                      <div className="text-muted-foreground">Lambda</div>
                      <div>{scimitarState.pendingProposal.context.ccce_state.lambda.toFixed(3)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Phi</div>
                      <div>{scimitarState.pendingProposal.context.ccce_state.phi.toFixed(3)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Gamma</div>
                      <div>{scimitarState.pendingProposal.context.ccce_state.gamma.toFixed(3)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Xi</div>
                      <div>{scimitarState.pendingProposal.context.ccce_state.xi.toFixed(3)}</div>
                    </div>
                  </div>
                </div>

                {/* Available Actions */}
                <div>
                  <h5 className="text-xs font-semibold mb-2">Available Actions</h5>
                  <div className="space-y-1">
                    {scimitarState.pendingProposal.actions.map((action, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-xs font-mono">
                          {i + 1}
                        </span>
                        <span>{action.description}</span>
                        <Badge variant="outline" className="text-xs">
                          {action.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Mouse className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No pending proposals
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Telemetry */}
        {scimitarState.telemetry && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Live Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Coherence (Lambda)</span>
                    <span className="font-mono">{scimitarState.telemetry.lambda.toFixed(4)}</span>
                  </div>
                  <Progress value={scimitarState.telemetry.lambda * 100} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Consciousness (Phi)</span>
                    <span
                      className={`font-mono ${scimitarState.telemetry.phi >= 0.7734 ? "text-secondary" : ""}`}
                    >
                      {scimitarState.telemetry.phi.toFixed(4)}
                    </span>
                  </div>
                  <Progress value={scimitarState.telemetry.phi * 100} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Decoherence (Gamma)</span>
                    <span
                      className={`font-mono ${scimitarState.telemetry.gamma > 0.3 ? "text-destructive" : ""}`}
                    >
                      {scimitarState.telemetry.gamma.toFixed(4)}
                    </span>
                  </div>
                  <Progress value={scimitarState.telemetry.gamma * 100} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Negentropy (Xi)</span>
                    <span className="font-mono">{scimitarState.telemetry.xi.toFixed(4)}</span>
                  </div>
                  <Progress value={scimitarState.telemetry.xi * 100} className="h-1.5" />
                </div>
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Theta Lock: {scimitarState.telemetry.theta_lock}deg
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event Log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {scimitarState.eventLog.slice(-10).reverse().map((event, i) => (
                <div key={i} className="text-xs p-2 bg-muted/30 rounded flex justify-between">
                  <span className="font-mono">{event.type}</span>
                  <span className="text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {scimitarState.eventLog.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">No events yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
