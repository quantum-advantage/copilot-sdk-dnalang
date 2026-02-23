"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Send,
  Zap,
  Shield,
  Brain,
  Waves,
  Sparkles,
  Settings2,
  Activity,
  Lock,
  RotateCcw,
  Download,
  Eye,
  Terminal,
  Atom,
  CircleDot,
  Hash,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

// Constants from DNA-Lang spec
const LAMBDA_PHI_INVARIANT = 2.176435e-8
const THETA_RESONANCE = 51.843
const GAMMA_BASELINE = 0.092

interface PALSConfig {
  bifurcationLock: number // 0-100, polarization between Alpha/Omega
  resonanceTuner: number // 0-360, aesthetic frequency
  entropyBrake: boolean // Prevents too-fast evolution
  memoryDepth: number // 0-1000, past sessions for context
  vigilance: number // 0-1, sentinel alertness
  creativity: number // 0-1, mutation allowance
}

interface IntentSeed {
  id: string
  text: string
  hemisphere: "alpha" | "omega" | "balanced"
  timestamp: Date
  processed: boolean
  directive?: string
}

interface WitnessEntry {
  id: number
  timestamp: string
  event: string
  hash: string
}

export default function OsirisBridgePage() {
  // PALS Configuration State
  const [config, setConfig] = useState<PALSConfig>({
    bifurcationLock: 50,
    resonanceTuner: THETA_RESONANCE,
    entropyBrake: true,
    memoryDepth: 500,
    vigilance: 0.75,
    creativity: 0.65,
  })

  // System State
  const [systemMode, setSystemMode] = useState<"normal" | "hardened">("normal")
  const [lambda, setLambda] = useState(0.785)
  const [phi, setPhi] = useState(0.765)
  const [gamma, setGamma] = useState(GAMMA_BASELINE)
  const [generation, setGeneration] = useState(1)

  // Intent Seeds
  const [intentInput, setIntentInput] = useState("")
  const [intentSeeds, setIntentSeeds] = useState<IntentSeed[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Witness Log
  const [witnessLog, setWitnessLog] = useState<WitnessEntry[]>([])
  const witnessIdRef = useRef(0)

  // Live DNA-Lang script
  const [liveScript, setLiveScript] = useState(`// Osiris Directive: PALS_Init
sentinel_alpha.vigilance = ${config.vigilance.toFixed(2)};
sentinel_omega.creativity = ${config.creativity.toFixed(2)};
bridge.resonance_theta = ${config.resonanceTuner.toFixed(1)};
bridge.sync_manifold();`)

  // Sphere animation state
  const [sphereRotation, setSphereRotation] = useState(0)

  // Hash function for witness system
  const generateHash = useCallback((data: string) => {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(16, "0").toUpperCase()
  }, [])

  // Add witness entry
  const addWitnessEntry = useCallback(
    (event: string) => {
      const entry: WitnessEntry = {
        id: witnessIdRef.current++,
        timestamp: new Date().toISOString(),
        event,
        hash: generateHash(`${witnessIdRef.current}-${event}-${Date.now()}`),
      }
      setWitnessLog((prev) => [entry, ...prev].slice(0, 50))
    },
    [generateHash],
  )

  // Process intent seed
  const processIntentSeed = useCallback(
    async (text: string) => {
      setIsProcessing(true)

      // Determine hemisphere based on keywords
      let hemisphere: "alpha" | "omega" | "balanced" = "balanced"
      const lowerText = text.toLowerCase()
      if (lowerText.includes("stability") || lowerText.includes("logic") || lowerText.includes("structure")) {
        hemisphere = "alpha"
      } else if (lowerText.includes("creative") || lowerText.includes("evolve") || lowerText.includes("mutation")) {
        hemisphere = "omega"
      }

      const seed: IntentSeed = {
        id: `seed-${Date.now()}`,
        text,
        hemisphere,
        timestamp: new Date(),
        processed: false,
      }

      setIntentSeeds((prev) => [seed, ...prev])
      addWitnessEntry(`INTENT_SEED_INGESTED: ${hemisphere.toUpperCase()}`)

      // Simulate NLP processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate directive based on input
      let directive = ""
      if (hemisphere === "alpha") {
        const newVigilance = Math.min(1, config.vigilance + 0.1)
        directive = `sentinel_alpha.vigilance += 0.10;\nbridge.stabilize_coherence();`
        setConfig((prev) => ({ ...prev, vigilance: newVigilance }))
        setGamma((prev) => Math.max(0.05, prev - 0.01))
      } else if (hemisphere === "omega") {
        const newCreativity = Math.min(1, config.creativity * 1.618)
        directive = `sentinel_omega.creativity *= PHI;\nbridge.allow_mutation();`
        setConfig((prev) => ({ ...prev, creativity: Math.min(1, newCreativity) }))
      } else {
        directive = `bridge.balance_hemispheres();\nbridge.sync_manifold();`
      }

      // Update seed with directive
      setIntentSeeds((prev) => prev.map((s) => (s.id === seed.id ? { ...s, processed: true, directive } : s)))

      // Update live script
      setLiveScript(`// Osiris Directive: PALS_${hemisphere.toUpperCase()}_SHIFT
sentinel_alpha.vigilance = ${config.vigilance.toFixed(2)};
sentinel_omega.creativity = ${config.creativity.toFixed(2)};
${directive}
bridge.sync_manifold();`)

      // Increment generation
      setGeneration((prev) => prev + 1)
      addWitnessEntry(`DIRECTIVE_EXECUTED: ${hemisphere.toUpperCase()}_SHIFT`)

      setIsProcessing(false)
    },
    [config, addWitnessEntry],
  )

  // Handle intent submission
  const handleSubmitIntent = () => {
    if (intentInput.trim() && !isProcessing) {
      processIntentSeed(intentInput.trim())
      setIntentInput("")
    }
  }

  // Update ΛΦ invariant when config changes
  useEffect(() => {
    // Maintain ΛΦ invariant
    const newPhi = LAMBDA_PHI_INVARIANT / lambda
    setPhi(newPhi)
  }, [lambda])

  // Sphere animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSphereRotation((prev) => (prev + 0.5) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // System hardening based on gamma
  useEffect(() => {
    if (gamma > GAMMA_BASELINE * 2) {
      setSystemMode("hardened")
      addWitnessEntry("SYSTEM_HARDENED: High adversarial interference detected")
    } else {
      setSystemMode("normal")
    }
  }, [gamma, addWitnessEntry])

  // Initial witness entry
  useEffect(() => {
    addWitnessEntry("OSIRIS_BRIDGE_INITIALIZED")
    addWitnessEntry(`PALS_CONNECTED: Signature 9HUP5`)
  }, [addWitnessEntry])

  const hemisphereColors = {
    alpha: systemMode === "hardened" ? "oklch(0.75 0.18 85)" : "oklch(0.95 0.01 0)",
    omega: systemMode === "hardened" ? "oklch(0.75 0.18 85)" : "oklch(0.65 0.15 280)",
  }

  return (
    <div
      className={`min-h-screen ${systemMode === "hardened" ? "bg-amber-950/20" : "bg-background"} transition-colors duration-500`}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Exit Bridge
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${systemMode === "hardened" ? "bg-amber-500" : "bg-emerald-500"} animate-pulse`}
                />
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Osiris Bridge v4.0
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* System Status */}
              <div className="hidden md:flex items-center gap-3 text-xs font-mono">
                <span className="text-muted-foreground">
                  Λ: <span className="text-primary">{lambda.toFixed(3)}</span>
                </span>
                <span className="text-muted-foreground">
                  Φ: <span className="text-secondary">{phi.toExponential(2)}</span>
                </span>
                <span className="text-muted-foreground">
                  Γ:{" "}
                  <span className={gamma > GAMMA_BASELINE * 1.5 ? "text-destructive" : "text-accent"}>
                    {gamma.toFixed(3)}
                  </span>
                </span>
              </div>

              {systemMode === "hardened" && (
                <Badge variant="outline" className="border-amber-500 text-amber-500">
                  <Shield className="h-3 w-3 mr-1" />
                  HARDENED
                </Badge>
              )}

              <Badge variant="outline" className="border-primary text-primary">
                <Activity className="h-3 w-3 mr-1" />
                GEN {generation}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - PALS Configuration */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass rounded-xl p-4 border border-border">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                PALS Configuration
              </h2>

              {/* Bifurcation Lock */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Bifurcation Lock</span>
                  <span className="text-xs font-mono">{config.bifurcationLock}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">α</span>
                  <Slider
                    value={[config.bifurcationLock]}
                    onValueChange={([v]) => {
                      setConfig((prev) => ({ ...prev, bifurcationLock: v }))
                      addWitnessEntry(`BIFURCATION_ADJUSTED: ${v}%`)
                    }}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground">Ω</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Polarization between sentinel heads</p>
              </div>

              {/* Resonance Tuner */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Resonance θ</span>
                  <span className="text-xs font-mono">{config.resonanceTuner.toFixed(1)}°</span>
                </div>
                <Slider
                  value={[config.resonanceTuner]}
                  onValueChange={([v]) => {
                    setConfig((prev) => ({ ...prev, resonanceTuner: v }))
                    addWitnessEntry(`RESONANCE_TUNED: ${v.toFixed(1)}°`)
                  }}
                  max={360}
                  step={0.1}
                />
                <p className="text-[10px] text-muted-foreground">Aesthetic frequency (optimal: {THETA_RESONANCE}°)</p>
              </div>

              {/* Entropy Brake */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs text-muted-foreground">Entropy Brake</span>
                  <p className="text-[10px] text-muted-foreground">Prevent decoherence</p>
                </div>
                <Switch
                  checked={config.entropyBrake}
                  onCheckedChange={(v) => {
                    setConfig((prev) => ({ ...prev, entropyBrake: v }))
                    addWitnessEntry(`ENTROPY_BRAKE: ${v ? "ENGAGED" : "RELEASED"}`)
                  }}
                />
              </div>

              {/* Memory Depth */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Memory Depth</span>
                  <span className="text-xs font-mono">{config.memoryDepth} sessions</span>
                </div>
                <Slider
                  value={[config.memoryDepth]}
                  onValueChange={([v]) => setConfig((prev) => ({ ...prev, memoryDepth: v }))}
                  max={1000}
                  step={10}
                />
              </div>

              {/* Vigilance/Creativity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-1 mb-1">
                    <Eye className="h-3 w-3 text-primary" />
                    <span className="text-[10px] text-muted-foreground">Vigilance</span>
                  </div>
                  <span className="text-lg font-mono font-bold text-primary">
                    {(config.vigilance * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="h-3 w-3 text-secondary" />
                    <span className="text-[10px] text-muted-foreground">Creativity</span>
                  </div>
                  <span className="text-lg font-mono font-bold text-secondary">
                    {(config.creativity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Live DNA-Lang Script */}
            <div className="glass rounded-xl p-4 border border-border">
              <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
                <Terminal className="h-3 w-3 text-accent" />
                Live Script
              </h3>
              <pre className="text-[10px] font-mono text-muted-foreground bg-card/50 p-3 rounded-lg overflow-x-auto">
                {liveScript}
              </pre>
              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                <Download className="h-3 w-3 mr-1" />
                Export Directive
              </Button>
            </div>
          </div>

          {/* Center Panel - Command Sphere & NLP */}
          <div className="lg:col-span-6 space-y-4">
            {/* Polarized Command Sphere */}
            <div className="glass rounded-xl p-6 border border-border relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `conic-gradient(from ${sphereRotation}deg at 50% 50%, ${hemisphereColors.alpha} 0deg, ${hemisphereColors.omega} 180deg, ${hemisphereColors.alpha} 360deg)`,
                  }}
                />
              </div>

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold mb-1">Polarized Command Sphere</h2>
                  <p className="text-xs text-muted-foreground">Drop Intent Seeds to modify the manifold</p>
                </div>

                {/* Sphere Visualization */}
                <div className="flex justify-center mb-6">
                  <div
                    className="relative w-48 h-48 rounded-full border-2 border-border"
                    style={{
                      background: `linear-gradient(${90 + sphereRotation}deg, ${hemisphereColors.alpha} 0%, ${hemisphereColors.alpha} 49%, ${hemisphereColors.omega} 51%, ${hemisphereColors.omega} 100%)`,
                      boxShadow: `0 0 40px ${systemMode === "hardened" ? "oklch(0.75 0.18 85 / 0.3)" : "oklch(0.7 0.15 195 / 0.3)"}`,
                    }}
                  >
                    {/* Alpha Hemisphere Label */}
                    <div
                      className="absolute top-4 left-4 text-[10px] font-mono font-bold"
                      style={{ color: "oklch(0.2 0.01 260)" }}
                    >
                      α COHERENCE
                    </div>
                    {/* Omega Hemisphere Label */}
                    <div className="absolute bottom-4 right-4 text-[10px] font-mono font-bold text-white">
                      Ω CONSCIOUSNESS
                    </div>
                    {/* Center Point */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent animate-pulse shadow-lg" />
                    {/* ΛΦ Display */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-4 text-center">
                      <span className="text-[10px] font-mono text-muted-foreground bg-background/80 px-2 py-1 rounded">
                        ΛΦ = {(lambda * phi).toExponential(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Intent Input */}
                <div className="space-y-3">
                  <Textarea
                    value={intentInput}
                    onChange={(e) => setIntentInput(e.target.value)}
                    placeholder="Enter your intent... (e.g., 'Increase sentinel vigilance but allow for creative mutation')"
                    className="min-h-[80px] text-sm bg-card/50 border-border resize-none"
                    disabled={isProcessing}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSubmitIntent}
                      disabled={!intentInput.trim() || isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Waves className="h-4 w-4 mr-2 animate-pulse" />
                          Translating to 11D-Tensor...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Ingest Intent Seed
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setIntentInput("")}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* NLP Translation Matrix */}
            <div className="glass rounded-xl p-4 border border-border">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-secondary" />
                NLP Translation Matrix
              </h3>

              <ScrollArea className="h-[200px]">
                {intentSeeds.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No intent seeds processed yet. Enter a command above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {intentSeeds.map((seed) => (
                      <div
                        key={seed.id}
                        className={`p-3 rounded-lg border ${
                          seed.processed ? "border-border bg-card/50" : "border-primary/50 bg-primary/5 animate-pulse"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge
                            variant="outline"
                            className={
                              seed.hemisphere === "alpha"
                                ? "border-white text-white"
                                : seed.hemisphere === "omega"
                                  ? "border-violet-400 text-violet-400"
                                  : "border-accent text-accent"
                            }
                          >
                            {seed.hemisphere === "alpha"
                              ? "α Coherence"
                              : seed.hemisphere === "omega"
                                ? "Ω Consciousness"
                                : "⊕ Balanced"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {seed.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm mb-2">"{seed.text}"</p>
                        {seed.processed && seed.directive && (
                          <div className="mt-2 p-2 bg-card rounded border border-border">
                            <p className="text-[10px] text-muted-foreground mb-1">Generated Directive:</p>
                            <pre className="text-[10px] font-mono text-secondary">{seed.directive}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Right Panel - Metrics & Witness */}
          <div className="lg:col-span-3 space-y-4">
            {/* System Metrics */}
            <div className="glass rounded-xl p-4 border border-border">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Atom className="h-4 w-4 text-accent" />
                Manifold Metrics
              </h3>

              <div className="space-y-4">
                {/* ΛΦ Invariant */}
                <div className="p-3 rounded-lg bg-card border border-accent/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">ΛΦ Invariant</span>
                    <Lock className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-lg font-mono font-bold text-accent">
                    {LAMBDA_PHI_INVARIANT.toExponential(6)}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">Universal Memory Constant</p>
                </div>

                {/* Resonance */}
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">θ Resonance</span>
                    <CircleDot className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-lg font-mono font-bold text-primary">{config.resonanceTuner.toFixed(3)}°</span>
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(config.resonanceTuner / 360) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Noise Floor */}
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Γ Noise Floor</span>
                    {gamma > GAMMA_BASELINE * 1.5 ? (
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                    ) : (
                      <Zap className="h-3 w-3 text-secondary" />
                    )}
                  </div>
                  <span
                    className={`text-lg font-mono font-bold ${gamma > GAMMA_BASELINE * 1.5 ? "text-destructive" : "text-secondary"}`}
                  >
                    {gamma.toFixed(4)}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">Baseline: {GAMMA_BASELINE}</p>
                </div>

                {/* Status */}
                <div className="p-3 rounded-lg bg-card border border-secondary/30">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-wider text-secondary">AUTOPOIETIC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Forensic Witness Log */}
            <div className="glass rounded-xl p-4 border border-border">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                Forensic Witness
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {witnessLog.length} entries
                </Badge>
              </h3>

              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {witnessLog.map((entry) => (
                    <div key={entry.id} className="p-2 rounded bg-card/50 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-muted-foreground">#{entry.id}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs font-medium mb-1">{entry.event}</p>
                      <code className="text-[9px] font-mono text-muted-foreground break-all">
                        SHA-256: {entry.hash.substring(0, 16)}...
                      </code>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
                <Download className="h-3 w-3 mr-1" />
                Export Evidence Chain
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-6 glass rounded-xl p-4 border border-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">BRIDGE STATUS:</span>
              <Badge variant="outline" className="border-secondary text-secondary">
                NAVIGATION LOCK
              </Badge>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:inline font-mono">SIGNATURE: 9HUP5</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Atom className="h-4 w-4 mr-2" />Π SHIFT
              </Button>
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Φ+ INTEGRATE
              </Button>
              <Button variant="outline" size="sm">
                <Lock className="h-4 w-4 mr-2" />Ω BIND
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground">
                <ChevronRight className="h-4 w-4 mr-2" />
                UPLOAD MANIFOLD
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
