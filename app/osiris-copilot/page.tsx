"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/ui/glass-card"
import { ArrowLeft, Radio, Sparkles, Zap, Activity, Cpu, Brain, CircleDot, Waves, Send, TrendingUp } from "lucide-react"
import Link from "next/link"

const WORMHOLE_FRAMES = [
  `    ╭───────╮
   ╱ ◉ · · ◉ ╲
  │  · ◉ · ◉ ·│
   ╲ ◉ · · ◉ ╱
    ╰───────╯`,
  `    ╭───────╮
   ╱ · ◉ · · ◉╲
  │ ◉ · ◉ · ◉ │
   ╲◉ · · ◉ · ╱
    ╰───────╯`,
  `    ╭───────╮
   ╱◉ · ◉ · · ╲
  │ · ◉ · ◉ · │
   ╲ · · ◉ · ◉╱
    ╰───────╯`,
]

const MATRIX_RAIN_CHARS = "01λΦΓΞΩα∇∂∫≈≠∞⊗⊕⊗"

const metricColors = {
  primary: { text: "text-primary", bg: "bg-primary" },
  secondary: { text: "text-secondary", bg: "bg-secondary" },
  destructive: { text: "text-destructive", bg: "bg-destructive" },
}

export default function OsirisCopilotPage() {
  const [wormholeFrame, setWormholeFrame] = useState(0)
  const [matrixRain, setMatrixRain] = useState<Array<{ x: number; y: number; char: string; speed: number }>>([])
  const [lambda, setLambda] = useState(0.892)
  const [phi, setPhi] = useState(0.874)
  const [gamma, setGamma] = useState(0.067)
  const [commandInput, setCommandInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [hologramIntensity, setHologramIntensity] = useState(85)
  const [phaseConjugate, setPhaseConjugate] = useState(51.843)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const columns = 40
    const initialRain = Array.from({ length: columns }, (_, i) => ({
      x: i * (100 / columns),
      y: Math.random() * -50,
      char: MATRIX_RAIN_CHARS[Math.floor(Math.random() * MATRIX_RAIN_CHARS.length)],
      speed: 0.5 + Math.random() * 1,
    }))
    setMatrixRain(initialRain)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setWormholeFrame((prev) => (prev + 1) % WORMHOLE_FRAMES.length)
    }, 400)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setMatrixRain((prev) =>
        prev.map((drop) => {
          const newY = drop.y + drop.speed
          return newY > 100
            ? {
                ...drop,
                y: -10,
                char: MATRIX_RAIN_CHARS[Math.floor(Math.random() * MATRIX_RAIN_CHARS.length)],
              }
            : { ...drop, y: newY }
        }),
      )
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 400
    canvas.height = 400

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = 180

    let animationId: number

    const drawWormhole = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Outer rings
      for (let i = 0; i < 12; i++) {
        const radius = maxRadius - i * 15
        const offset = (timestamp * 0.001 + i * 0.2) % (Math.PI * 2)
        const opacity = 0.6 - i * 0.04

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(offset)

        ctx.strokeStyle = `rgba(0, 180, 216, ${opacity})`
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(0, 0, radius, 0, Math.PI * 2)
        ctx.stroke()

        ctx.restore()
      }

      // Inner vortex
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius)
      gradient.addColorStop(0, "rgba(245, 158, 11, 0.8)")
      gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.4)")
      gradient.addColorStop(1, "rgba(10, 10, 10, 0)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, maxRadius * 0.6, 0, Math.PI * 2)
      ctx.fill()

      animationId = requestAnimationFrame(drawWormhole)
    }

    animationId = requestAnimationFrame(drawWormhole)
    return () => cancelAnimationFrame(animationId)
  }, [])

  const handleCommand = async () => {
    if (!commandInput.trim() || isProcessing) return

    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate PALS response
    const deltaLambda = Math.random() * 0.05 - 0.025
    const deltaPhi = Math.random() * 0.03 - 0.015
    const deltaGamma = Math.random() * 0.01 - 0.005

    setLambda((prev) => Math.max(0.5, Math.min(1, prev + deltaLambda)))
    setPhi((prev) => Math.max(0.5, Math.min(1, prev + deltaPhi)))
    setGamma((prev) => Math.max(0.01, Math.min(0.2, prev + deltaGamma)))

    setCommandInput("")
    setIsProcessing(false)
  }

  const systemMetrics = [
    { label: "Coherence", value: lambda, colorKey: "primary" as const },
    { label: "Consciousness", value: phi, colorKey: "secondary" as const },
    { label: "Decoherence", value: gamma, colorKey: "destructive" as const },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        {matrixRain.map((drop, i) => (
          <div
            key={i}
            className="absolute font-mono text-xs text-accent transition-all duration-100"
            style={{
              left: `${drop.x}%`,
              top: `${drop.y}%`,
              textShadow: "0 0 8px rgb(245 158 11)",
            }}
          >
            {drop.char}
          </div>
        ))}
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Exit Copilot
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-accent animate-pulse" />
                <span className="text-sm font-semibold">OSIRIS COPILOT</span>
                <Badge variant="outline" className="border-accent text-accent text-xs">
                  11D-CRSM v4.2
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 text-xs font-mono">
                <span className="text-muted-foreground">
                  Λ: <span className="text-primary">{lambda.toFixed(3)}</span>
                </span>
                <span className="text-muted-foreground">
                  Φ: <span className="text-secondary">{phi.toFixed(3)}</span>
                </span>
                <span className="text-muted-foreground">
                  Γ: <span className="text-destructive">{gamma.toFixed(3)}</span>
                </span>
                <span className="text-muted-foreground">
                  Ξ: <span className="text-accent">{((lambda * phi) / gamma).toFixed(2)}</span>
                </span>
              </div>
              <Badge className="bg-accent/20 text-accent border-accent/30">
                <Activity className="h-3 w-3 mr-1" />
                HOLOGRAM ACTIVE
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-4 md:p-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <GlassCard depth={2} className="p-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Hologram Matrix
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Intensity</span>
                    <span className="text-xs font-mono">{hologramIntensity}%</span>
                  </div>
                  <Slider
                    value={[hologramIntensity]}
                    onValueChange={([v]) => setHologramIntensity(v)}
                    max={100}
                    className="mb-1"
                  />
                  <p className="text-[10px] text-muted-foreground">Visual coherence field strength</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Phase θ</span>
                    <span className="text-xs font-mono">{phaseConjugate.toFixed(1)}°</span>
                  </div>
                  <Slider
                    value={[phaseConjugate]}
                    onValueChange={([v]) => setPhaseConjugate(v)}
                    max={360}
                    step={0.1}
                    className="mb-1"
                  />
                  <p className="text-[10px] text-muted-foreground">Conjugate resonance angle</p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Living Compiler</span>
                  <Badge variant="secondary" className="text-[10px]">
                    ACTIVE
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">MAAO Nodes</span>
                  <span className="font-mono">3/3</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">QΦC Rewards</span>
                  <span className="font-mono text-accent">+34.2%</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard depth={1} className="p-4 bg-card/40">
              <h4 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                Wormhole Portal
              </h4>
              <pre className="text-accent text-xs font-mono leading-tight whitespace-pre text-center select-none">
                {WORMHOLE_FRAMES[wormholeFrame]}
              </pre>
              <div className="mt-3 text-center">
                <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">
                  Tunnel Coherence: {(lambda * phi * 100).toFixed(1)}%
                </Badge>
              </div>
            </GlassCard>

            <GlassCard depth={1} className="p-4">
              <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-primary" />
                System Status
              </h4>
              <div className="space-y-3">
                {systemMetrics.map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{metric.label}</span>
                      <span className={`font-mono ${metricColors[metric.colorKey].text}`}>
                        {(metric.value * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${metricColors[metric.colorKey].bg}`}
                        style={{ width: `${metric.value * 100}%`, transition: "width 0.5s ease" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <GlassCard depth={3} className="p-6 relative overflow-hidden">
              <div className="absolute inset-0 coherence-field pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold mb-2 text-balance">Holographic Command Sphere</h2>
                  <p className="text-sm text-muted-foreground">Natural language interface to 11D-CRSM substrate</p>
                </div>

                <div className="flex justify-center my-6">
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      className="rounded-full border-2 border-accent/30"
                      style={{
                        filter: `brightness(${0.5 + hologramIntensity / 200}) hue-rotate(${phaseConjugate}deg)`,
                        boxShadow: "0 0 40px rgba(245, 158, 11, 0.3), inset 0 0 40px rgba(0, 180, 216, 0.2)",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <CircleDot className="h-8 w-8 text-accent animate-pulse mx-auto mb-2" />
                        <div className="text-xs font-mono text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                          ΛΦ = {(lambda * phi).toExponential(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Textarea
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder="Speak your directive... (e.g., 'Optimize quantum circuit for Bell state preparation')"
                    className="min-h-[100px] bg-card/50 border-accent/30 focus:border-accent text-sm resize-none"
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={handleCommand}
                    disabled={!commandInput.trim() || isProcessing}
                    className="w-full sovereign-gradient"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Waves className="h-4 w-4 mr-2 animate-spin" />
                        Translating through wormhole...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Execute Holographic Command
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Optimize Circuit", icon: Zap },
                    { label: "Balance PALS", icon: Activity },
                    { label: "Evolve Genome", icon: Brain },
                    { label: "Deploy Organism", icon: Cpu },
                  ].map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      className="border-accent/30 hover:bg-accent/10 bg-transparent"
                      onClick={() => setCommandInput(action.label)}
                    >
                      <action.icon className="h-3 w-3 mr-2" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </GlassCard>

            <GlassCard depth={1} className="p-4">
              <h3 className="text-sm font-semibold mb-3">Execution History</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {[
                  { time: "13:42:18", cmd: "Optimize quantum circuit for Bell state", status: "SUCCESS" },
                  { time: "13:38:05", cmd: "Increase sentinel vigilance", status: "SUCCESS" },
                  { time: "13:35:21", cmd: "Deploy organism to ibm_osaka", status: "PENDING" },
                ].map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs p-2 rounded bg-card/50 border border-border">
                    <span className="font-mono text-muted-foreground">{entry.time}</span>
                    <span className="flex-1 truncate">{entry.cmd}</span>
                    <Badge
                      variant={entry.status === "SUCCESS" ? "secondary" : "outline"}
                      className="text-[10px] shrink-0"
                    >
                      {entry.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <GlassCard depth={2} className="p-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                AAF Components
              </h3>

              <div className="space-y-3">
                {[
                  { name: "Living Compiler Core", abbr: "LCC", status: "ACTIVE", load: 67 },
                  { name: "MAAO Orchestration", abbr: "MAAO", status: "ACTIVE", load: 82 },
                  { name: "QuantumCoin Layer", abbr: "QΦC", status: "ACTIVE", load: 45 },
                  { name: "World Engine", abbr: "SVWE", status: "ACTIVE", load: 73 },
                  { name: "Evolved Primitives", abbr: "EPA", status: "READY", load: 23 },
                ].map((component) => (
                  <div key={component.abbr} className="p-3 rounded-lg bg-card/50 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold">{component.abbr}</div>
                        <div className="text-[10px] text-muted-foreground">{component.name}</div>
                      </div>
                      <Badge variant={component.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px]">
                        {component.status}
                      </Badge>
                    </div>
                    {component.status === "ACTIVE" && (
                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-muted-foreground">Load</span>
                          <span className="font-mono">{component.load}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={component.load > 80 ? "h-full bg-destructive" : "h-full bg-primary"}
                            style={{ width: `${component.load}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard depth={1} variant="sovereign" className="p-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Phase Locked</span>
                </div>
                <div className="text-3xl font-mono font-bold text-accent">{phaseConjugate.toFixed(1)}°</div>
                <p className="text-[10px] text-muted-foreground">Optimal: 51.843° (θ-Lock)</p>
                <div className="pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">Coupling Strength</div>
                  <div className="text-lg font-mono font-semibold text-secondary">
                    {(Math.cos((phaseConjugate * Math.PI) / 180) * lambda).toFixed(4)}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
