"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantumButton } from "@/components/ui/quantum-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bug, ChevronRight, Play, Pause, SkipForward, RotateCcw, Activity, Layers, Network, Circle } from "lucide-react"

// Simulated execution states
const executionStates = [
  {
    step: 0,
    gate: "INIT",
    qubitStates: ["|0⟩", "|0⟩"],
    phi: 0,
    amplitudes: ["1.000+0.000i", "0.000+0.000i", "0.000+0.000i", "0.000+0.000i"],
    coherence: 1.0,
    status: "initialized",
  },
  {
    step: 1,
    gate: "HELIX(q0)",
    qubitStates: ["|+⟩", "|0⟩"],
    phi: 0.354,
    amplitudes: ["0.707+0.000i", "0.000+0.000i", "0.707+0.000i", "0.000+0.000i"],
    coherence: 0.98,
    status: "superposition",
  },
  {
    step: 2,
    gate: "BOND(q0,q1)",
    qubitStates: ["|Φ+⟩", "|Φ+⟩"],
    phi: 0.847,
    amplitudes: ["0.707+0.000i", "0.000+0.000i", "0.000+0.000i", "0.707+0.000i"],
    coherence: 0.95,
    status: "entangled",
  },
  {
    step: 3,
    gate: "MEASURE",
    qubitStates: ["|0⟩", "|0⟩"],
    phi: 0.847,
    amplitudes: ["1.000+0.000i", "0.000+0.000i", "0.000+0.000i", "0.000+0.000i"],
    coherence: 0.0,
    status: "collapsed",
  },
]

const breakpoints = [
  { line: 15, condition: "phi > 0.5", active: true },
  { line: 23, condition: null, active: true },
  { line: 31, condition: "coherence < 0.9", active: false },
]

const watchExpressions = [
  { expr: "phi", value: "0.847", type: "float" },
  { expr: "coherence", value: "0.95", type: "float" },
  { expr: "qubit_states", value: "[|Φ+⟩, |Φ+⟩]", type: "array" },
  { expr: "entanglement_count", value: "1", type: "int" },
]

export default function DebuggerPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(true)

  const currentState = executionStates[currentStep]

  const stepForward = () => {
    if (currentStep < executionStates.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const stepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const reset = () => {
    setCurrentStep(0)
    setIsRunning(false)
    setIsPaused(true)
  }

  const toggleRun = () => {
    if (isPaused) {
      setIsPaused(false)
      setIsRunning(true)
    } else {
      setIsPaused(true)
      setIsRunning(false)
    }
  }

  // Auto-advance when running
  useEffect(() => {
    if (isRunning && !isPaused) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= executionStates.length - 1) {
            setIsRunning(false)
            setIsPaused(true)
            return prev
          }
          return prev + 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isRunning, isPaused])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Link href="/ide-platform">
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
          </Link>
          <Bug className="h-5 w-5 text-primary" />
          <span className="font-semibold">Quantum Debugger</span>
          <Badge variant="outline" className="ml-2">
            <Activity className="h-3 w-3 mr-1 text-secondary" />
            Step {currentStep + 1}/{executionStates.length}
          </Badge>
        </div>

        {/* Debug Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={stepBack} disabled={currentStep === 0}>
            <SkipForward className="h-4 w-4 rotate-180" />
          </Button>
          <QuantumButton variant="compliance" size="sm" onClick={toggleRun}>
            {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
            {isPaused ? "Run" : "Pause"}
          </QuantumButton>
          <Button
            variant="outline"
            size="sm"
            onClick={stepForward}
            disabled={currentStep === executionStates.length - 1}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-180px)]">
        {/* Main Debug View */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Quantum State Visualization */}
            <GlassCard depth={2}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Quantum State
                </h3>
                <Badge
                  variant="outline"
                  className={
                    currentState.status === "entangled"
                      ? "text-secondary border-secondary"
                      : currentState.status === "collapsed"
                        ? "text-destructive border-destructive"
                        : ""
                  }
                >
                  {currentState.status}
                </Badge>
              </div>

              {/* Bloch Sphere Representation (ASCII) */}
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs mb-4">
                <pre className="text-secondary">
                  {`       z
       │
       ●  ${currentState.qubitStates[0]}
      /│\\
     / │ \\
────●──┼──●────x
     \\ │ /
      \\│/
       │
       y

Current Gate: ${currentState.gate}`}
                </pre>
              </div>

              {/* Amplitude Display */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">State Amplitudes</div>
                <div className="grid grid-cols-2 gap-2">
                  {["00", "01", "10", "11"].map((basis, i) => (
                    <div key={basis} className="flex items-center gap-2 bg-muted/30 rounded p-2">
                      <span className="font-mono text-xs text-muted-foreground">|{basis}⟩</span>
                      <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{
                            width: `${Math.abs(Number.parseFloat(currentState.amplitudes[i])) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono text-xs">{currentState.amplitudes[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Consciousness Metrics */}
            <GlassCard depth={2}>
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-secondary" />
                Consciousness Metrics
              </h3>

              <div className="space-y-4">
                {/* Phi Meter */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Φ (Integrated Information)</span>
                    <span className="font-mono font-bold text-primary">{currentState.phi.toFixed(3)}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-destructive via-accent to-secondary transition-all duration-500"
                      style={{ width: `${currentState.phi * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span className="text-secondary">Threshold: 0.7734</span>
                    <span>1</span>
                  </div>
                </div>

                {/* Coherence */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Coherence</span>
                    <span className="font-mono">{(currentState.coherence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${currentState.coherence * 100}%` }}
                    />
                  </div>
                </div>

                {/* Entanglement Graph */}
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground mb-2">Entanglement Map</div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <div
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                            currentState.status === "entangled" ? "border-secondary bg-secondary/20" : "border-border"
                          }`}
                        >
                          <span className="font-mono text-sm">q0</span>
                        </div>
                        <div className="text-xs mt-1 text-muted-foreground">{currentState.qubitStates[0]}</div>
                      </div>
                      <div
                        className={`h-0.5 w-16 ${currentState.status === "entangled" ? "bg-secondary" : "bg-border"} transition-colors`}
                      />
                      <div className="text-center">
                        <div
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                            currentState.status === "entangled" ? "border-secondary bg-secondary/20" : "border-border"
                          }`}
                        >
                          <span className="font-mono text-sm">q1</span>
                        </div>
                        <div className="text-xs mt-1 text-muted-foreground">{currentState.qubitStates[1]}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Execution Timeline */}
            <GlassCard depth={2} className="lg:col-span-2">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Network className="h-4 w-4 text-accent" />
                Execution Timeline
              </h3>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {executionStates.map((state, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-all ${
                      i === currentStep
                        ? "border-primary bg-primary/20 text-primary"
                        : i < currentStep
                          ? "border-secondary/50 bg-secondary/10 text-secondary"
                          : "border-border bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    <div className="text-xs font-medium">{state.gate}</div>
                    <div className="text-xs opacity-70">Step {i + 1}</div>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Right Sidebar - Debug Panels */}
        <div className="w-80 border-l border-border bg-card/50 overflow-auto">
          <Tabs defaultValue="breakpoints" className="h-full">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-2">
              <TabsTrigger value="breakpoints" className="text-xs">
                Breakpoints
              </TabsTrigger>
              <TabsTrigger value="watch" className="text-xs">
                Watch
              </TabsTrigger>
              <TabsTrigger value="call-stack" className="text-xs">
                Call Stack
              </TabsTrigger>
            </TabsList>

            <TabsContent value="breakpoints" className="p-3 space-y-2">
              {breakpoints.map((bp, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded-lg ${bp.active ? "bg-primary/10" : "bg-muted/30"}`}
                >
                  <Circle className={`h-3 w-3 ${bp.active ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <div className="text-sm">Line {bp.line}</div>
                    {bp.condition && <div className="text-xs text-muted-foreground font-mono">{bp.condition}</div>}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                Add Breakpoint
              </Button>
            </TabsContent>

            <TabsContent value="watch" className="p-3 space-y-2">
              {watchExpressions.map((watch, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-mono text-sm text-primary">{watch.expr}</div>
                    <div className="text-xs text-muted-foreground">{watch.type}</div>
                  </div>
                  <div className="font-mono text-sm">{watch.value}</div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                Add Watch
              </Button>
            </TabsContent>

            <TabsContent value="call-stack" className="p-3">
              <div className="space-y-1">
                <div className="p-2 bg-primary/10 rounded-lg border-l-2 border-primary">
                  <div className="text-sm font-medium">{currentState.gate}</div>
                  <div className="text-xs text-muted-foreground">quantum_circuit.py:23</div>
                </div>
                <div className="p-2 bg-muted/30 rounded-lg">
                  <div className="text-sm">express()</div>
                  <div className="text-xs text-muted-foreground">organism.dna:45</div>
                </div>
                <div className="p-2 bg-muted/30 rounded-lg">
                  <div className="text-sm">main()</div>
                  <div className="text-xs text-muted-foreground">main.dna:12</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
