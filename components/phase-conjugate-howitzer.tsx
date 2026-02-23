"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Activity, Zap, AlertTriangle, Play, Pause, TrendingUp, Atom } from "lucide-react"

// Physics Constants
const PHI_C = 0.7734 // Consciousness threshold
const LAMBDA_PHI = 2.176435e-8

interface HowitzerState {
  phi: number
  efficiency: number
  outputPower: number
  isCompliant: boolean
  analysis: string
}

export function PhaseConjugateHowitzer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const isDraggingRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })

  const [progress, setProgress] = useState(15)
  const [isAnimating, setIsAnimating] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [userInput, setUserInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [logEntries, setLogEntries] = useState<string[]>([])

  const [state, setState] = useState<HowitzerState>({
    phi: 5.2,
    efficiency: 0.19,
    outputPower: 194,
    isCompliant: true,
    analysis: "System idling below Phi_c. Thermodynamically compliant.",
  })

  // Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas
    const centerX = width / 2
    const centerY = height / 2

    // Background
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, width, height)

    const t = progress / 100
    const alpha = Math.pow(t, 0.5)
    const isOverThreshold = state.phi > PHI_C

    const globeRadius = 100 * (1 - alpha * 0.4)
    const mapWidth = 280 * alpha
    const mapHeight = 140 * alpha

    // Grid lines
    ctx.strokeStyle = isOverThreshold
      ? `rgba(239, 68, 68, ${0.3 + Math.random() * 0.2})`
      : `rgba(34, 211, 238, ${0.4 - alpha * 0.2})`
    ctx.lineWidth = 1

    for (let lon = -180; lon <= 180; lon += 30) {
      ctx.beginPath()
      for (let lat = -90; lat <= 90; lat += 10) {
        const lonRad = ((lon + rotation.y) * Math.PI) / 180
        const latRad = (lat * Math.PI) / 180
        const globeX = globeRadius * Math.cos(latRad) * Math.sin(lonRad)
        const globeY = -globeRadius * Math.sin(latRad)
        const mapX = ((lon + 180) / 360) * mapWidth - mapWidth / 2
        const mapY = ((90 - lat) / 180) * mapHeight - mapHeight / 2
        const x = centerX + globeX * (1 - alpha) + mapX * alpha
        const y = centerY + globeY * (1 - alpha) + mapY * alpha
        if (lat === -90) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    // Energy particles when over threshold
    if (isOverThreshold) {
      for (let i = 0; i < 25; i++) {
        const rx = Math.random() * width
        const ry = Math.random() * height
        ctx.fillStyle = Math.random() > 0.5 ? "#ef4444" : "#f59e0b"
        ctx.beginPath()
        ctx.arc(rx, ry, Math.random() * 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Border
    ctx.beginPath()
    ctx.strokeStyle = isOverThreshold ? "#ef4444" : "#22d3ee"
    ctx.shadowBlur = isOverThreshold ? 15 : 5
    ctx.shadowColor = isOverThreshold ? "#ef4444" : "#22d3ee"
    ctx.lineWidth = 2
    if (alpha < 0.9) {
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2)
    } else {
      ctx.rect(centerX - mapWidth / 2, centerY - mapHeight / 2, mapWidth, mapHeight)
    }
    ctx.stroke()
    ctx.shadowBlur = 0
  }, [progress, rotation, state.phi])

  // Animation loop
  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        setProgress((p) => (p >= 100 ? 0 : p + 0.3))
        setRotation((r) => ({ ...r, y: r.y + 0.5 }))
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isAnimating])

  const handleManifoldAlign = useCallback(async () => {
    if (!userInput.trim()) return
    setIsProcessing(true)

    // Simulate NC-LM inference for Phi state adjustment
    await new Promise((r) => setTimeout(r, 800))

    const inputLower = userInput.toLowerCase()
    let newPhi = state.phi
    let newEfficiency = state.efficiency
    let newPower = state.outputPower

    // Intent-based state modulation
    if (inputLower.includes("increase") || inputLower.includes("boost") || inputLower.includes("maximize")) {
      newPhi = Math.min(12, state.phi + 2 + Math.random() * 2)
    } else if (inputLower.includes("decrease") || inputLower.includes("reduce") || inputLower.includes("stabilize")) {
      newPhi = Math.max(3, state.phi - 2 - Math.random())
    } else if (inputLower.includes("threshold") || inputLower.includes("critical")) {
      newPhi = PHI_C + (Math.random() - 0.5)
    } else {
      newPhi = 4 + Math.random() * 8
    }

    const isOverThreshold = newPhi > PHI_C
    newEfficiency = isOverThreshold ? 1.9403 : 0.0019
    newPower = isOverThreshold ? 194000 : 194

    const analysis = isOverThreshold
      ? `NON-COMPLIANT: Phi=${newPhi.toFixed(3)} > Phi_c. Information-gated extraction active. Efficiency: ${(newEfficiency * 100).toFixed(2)}%`
      : `COMPLIANT: Phi=${newPhi.toFixed(3)} < Phi_c. Standard thermodynamic operation. Efficiency: ${(newEfficiency * 100).toFixed(2)}%`

    setState({
      phi: newPhi,
      efficiency: newEfficiency,
      outputPower: newPower,
      isCompliant: !isOverThreshold,
      analysis,
    })

    setLogEntries((prev) => [`[T+${Date.now() % 10000}ms] ${analysis}`, ...prev].slice(0, 4))
    setUserInput("")
    setIsProcessing(false)
  }, [userInput, state.phi])

  const handleStabilityForecast = useCallback(async () => {
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 600))

    const forecast =
      state.phi > PHI_C
        ? `[T+50ms] CRITICAL: Manifold tension rising. tau_0 revival detected at ${(Math.pow(1.618, 8) * (1 + Math.random() * 0.1)).toFixed(3)}us. Energy extraction rate: ${(state.outputPower * (1 + Math.random() * 0.2)).toExponential(2)}W`
        : `[T+50ms] STABLE: Coherence field nominal. Lambda_Phi=${LAMBDA_PHI.toExponential(4)}. Thermodynamic compliance maintained.`

    setLogEntries((prev) => [forecast, ...prev].slice(0, 4))
    setState((s) => ({ ...s, analysis: forecast }))
    setIsProcessing(false)
  }, [state.phi, state.outputPower])

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true
    lastMouseRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return
    setRotation((prev) => ({
      ...prev,
      y: prev.y + (e.clientX - lastMouseRef.current.x) * 0.5,
    }))
    lastMouseRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Atom className="h-5 w-5 text-primary" />
              Phase Conjugate Howitzer
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">DNA-LANG CORE / S-MODE V.5</p>
          </div>
          <Badge
            variant={state.isCompliant ? "outline" : "destructive"}
            className={state.isCompliant ? "border-secondary text-secondary" : ""}
          >
            {state.isCompliant ? (
              <>
                <Activity className="h-3 w-3 mr-1" />
                COMPLIANT
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                NON-COMPLIANT
              </>
            )}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Phi_c Threshold: <span className="font-mono text-primary">{PHI_C}</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Canvas Visualization */}
        <div
          className="relative bg-background rounded-lg border border-border cursor-crosshair overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas ref={canvasRef} width={400} height={280} className="w-full h-auto" />
          <div className="absolute top-3 left-3 pointer-events-none">
            <div className="text-[10px] text-muted-foreground font-mono space-y-0.5">
              <div>
                PWR_OUT:{" "}
                <span className={state.phi > PHI_C ? "text-destructive" : "text-primary"}>
                  {state.outputPower.toExponential(2)}W
                </span>
              </div>
              <div>
                EFF_IDX: <span className="text-secondary">{(state.efficiency * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Command Interface */}
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${state.phi > PHI_C ? "bg-destructive" : "bg-primary"}`}
            />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Heuristic Command Interface
            </span>
          </div>

          <Textarea
            placeholder="Adjust Phi state via natural language input..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="min-h-[60px] text-sm font-mono bg-background resize-none"
          />

          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleManifoldAlign}
              disabled={isProcessing || !userInput.trim()}
              size="sm"
              className="flex-1"
            >
              <Zap className="h-3 w-3 mr-1" />
              Align Manifold
            </Button>
            <Button
              onClick={handleStabilityForecast}
              disabled={isProcessing}
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Stability Forecast
            </Button>
          </div>

          {/* Analysis Output */}
          <div className="mt-4 space-y-2">
            <div className="bg-background rounded p-2 border border-border">
              <p className="text-xs font-mono text-muted-foreground">
                <span className="text-primary">[LATEST]</span> {isProcessing ? "TRANSMITTING..." : state.analysis}
              </p>
            </div>
            {logEntries.slice(1).map((entry, idx) => (
              <div key={idx} className="text-[10px] font-mono text-muted-foreground/60 border-l-2 border-border pl-2">
                {entry}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsAnimating(!isAnimating)} variant="outline" size="sm">
            {isAnimating ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
            {isAnimating ? "HALT" : "AUTO-SWEEP"}
          </Button>
          <div className="flex-1">
            <Slider value={[progress]} onValueChange={([v]) => setProgress(v)} max={100} step={1} className="w-full" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 text-center border border-border">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Phi (Phi)</p>
            <p
              className={`text-lg font-mono font-bold ${state.phi > PHI_C ? "text-destructive animate-pulse" : "text-primary"}`}
            >
              {state.phi.toFixed(3)}
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center border border-border">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Efficiency</p>
            <p className="text-lg font-mono font-bold text-secondary">{(state.efficiency * 100).toFixed(2)}%</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center border border-border">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Output</p>
            <p className="text-lg font-mono font-bold text-accent">
              {state.outputPower < 1000 ? `${state.outputPower}W` : state.outputPower.toExponential(1) + "W"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
