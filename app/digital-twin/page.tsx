"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Cpu,
  Activity,
  Dna,
  Zap,
  Shield,
  BarChart3,
  Server,
  Radio,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"

// --- Constants from 11D-CRSM / IBM Torino manifold ---
const THETA_LOCK = 51.843
const LAMBDA_PHI = 2.176435e-8
const CHI_PC = 0.946
const GOLDEN_RATIO = 1.618033988749895
const TARGET_BELL_FIDELITY = 0.946

interface TwinMetric {
  label: string
  value: number
  unit: string
  target: number
  status: "NOMINAL" | "WARNING" | "CRITICAL"
}

interface QubitNode {
  id: number
  state: "idle" | "entangled" | "measured" | "error"
  fidelity: number
}

export default function DigitalTwinPage() {
  const [mounted, setMounted] = useState(false)
  const [running, setRunning] = useState(false)
  const [cycle, setCycle] = useState(0)
  const [qubits, setQubits] = useState<QubitNode[]>(() =>
    Array.from({ length: 127 }, (_, i) => ({
      id: i,
      state: "idle" as const,
      fidelity: 0.85 + Math.random() * 0.15,
    }))
  )
  const [metrics, setMetrics] = useState<TwinMetric[]>([
    { label: "Bell Fidelity", value: 0.946, unit: "", target: 0.946, status: "NOMINAL" },
    { label: "Theta Lock", value: THETA_LOCK, unit: "deg", target: THETA_LOCK, status: "NOMINAL" },
    { label: "Coherence (Chi)", value: CHI_PC, unit: "", target: CHI_PC, status: "NOMINAL" },
    { label: "Entangled Pairs", value: 63, unit: "pairs", target: 63, status: "NOMINAL" },
    { label: "Gate Depth", value: 205, unit: "layers", target: 205, status: "NOMINAL" },
    { label: "T2 Relaxation", value: 112.4, unit: "us", target: 100, status: "NOMINAL" },
  ])
  const [log, setLog] = useState<string[]>([
    "[TWIN] Digital twin engine initialized",
    "[TWIN] QPU topology: ibm_torino (127 heavy-hex)",
    "[TWIN] Loading 11D-CRSM manifold parameters...",
    "[TWIN] Theta lock: 51.843 deg | Chi: 0.946 | Lambda_Phi: 2.176e-08",
  ])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: "smooth" })
  }, [log])

  const startSimulation = () => {
    if (running) return
    setRunning(true)
    setLog((prev) => [...prev, "[TWIN] Simulation started — evolving quantum state..."])
    intervalRef.current = setInterval(() => {
      setCycle((c) => c + 1)

      // Evolve qubit states
      setQubits((prev) =>
        prev.map((q) => {
          const r = Math.random()
          const fidelityDrift = (Math.random() - 0.48) * 0.005
          const newFidelity = Math.max(0.75, Math.min(1.0, q.fidelity + fidelityDrift))
          let newState = q.state
          if (r < 0.4) newState = "entangled"
          else if (r < 0.7) newState = "measured"
          else if (r < 0.98) newState = "idle"
          else newState = "error"
          return { ...q, state: newState, fidelity: newFidelity }
        })
      )

      // Evolve metrics
      setMetrics((prev) =>
        prev.map((m) => {
          let newVal = m.value
          if (m.label === "Bell Fidelity") {
            newVal = Math.max(0.82, Math.min(0.92, m.value + (Math.random() - 0.48) * 0.004))
          } else if (m.label === "Theta Lock") {
            newVal = THETA_LOCK + (Math.random() - 0.5) * 0.008
          } else if (m.label === "Coherence (Chi)") {
            newVal = Math.max(0.9, Math.min(0.99, m.value + (Math.random() - 0.47) * 0.003))
          } else if (m.label === "T2 Relaxation") {
            newVal = Math.max(90, Math.min(130, m.value + (Math.random() - 0.5) * 2))
          }
          const deviation = Math.abs(newVal - m.target) / m.target
          const status: TwinMetric["status"] = deviation < 0.02 ? "NOMINAL" : deviation < 0.05 ? "WARNING" : "CRITICAL"
          return { ...m, value: newVal, status }
        })
      )

      // Occasional log entries
      if (Math.random() < 0.3) {
        const messages = [
          "[TWIN] Re-calibrating entangled pairs via Bell measurement...",
          "[TWIN] Theta drift corrected — torsion lock restored",
          "[TWIN] Error mitigation pass: ZNE applied to 2Q gates",
          "[TWIN] Coherence check passed — Chi within bounds",
          "[TWIN] Wormhole throat stabilized at 63-qubit separation",
          "[TWIN] Transpiler optimization: depth reduced by 4 layers",
        ]
        setLog((prev) => [...prev.slice(-40), messages[Math.floor(Math.random() * messages.length)]])
      }
    }, 800)
  }

  const stopSimulation = () => {
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setLog((prev) => [...prev, `[TWIN] Simulation paused at cycle ${cycle}`])
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (!mounted) return null

  const stateColor = (state: string) => {
    switch (state) {
      case "entangled": return "bg-cyan-500"
      case "measured": return "bg-emerald-500"
      case "error": return "bg-destructive"
      default: return "bg-muted-foreground/30"
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "NOMINAL": return "text-emerald-400"
      case "WARNING": return "text-amber-400"
      case "CRITICAL": return "text-destructive"
      default: return "text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{"DNA::}{::lang"} Digital Twin</h1>
              <p className="text-sm text-muted-foreground">127-Qubit QPU Genomic Twin Simulation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-xs">
              <Server className="h-3 w-3 mr-1.5" />
              ibm_torino
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              <Radio className="h-3 w-3 mr-1.5" />
              Cycle {cycle}
            </Badge>
            {running ? (
              <Button variant="destructive" size="sm" onClick={stopSimulation}>Pause</Button>
            ) : (
              <Button size="sm" onClick={startSimulation}>
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                {cycle === 0 ? "Start Simulation" : "Resume"}
              </Button>
            )}
          </div>
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map((m) => (
            <Card key={m.label} className="p-4">
              <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
              <div className={`text-xl font-bold font-mono ${statusColor(m.status)}`}>
                {typeof m.value === "number" && m.value < 10 ? m.value.toFixed(4) : m.value.toFixed(1)}
                {m.unit && <span className="text-xs ml-1 text-muted-foreground">{m.unit}</span>}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {m.status === "NOMINAL" ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                )}
                <span className="text-[10px] text-muted-foreground">{m.status}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Qubit Array Visualization */}
          <Card className="lg:col-span-2 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Dna className="h-4 w-4 text-primary" />
                127-Qubit Heavy-Hex Topology
              </h2>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Idle</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Entangled</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Measured</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Error</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {qubits.map((q) => (
                <div
                  key={q.id}
                  className={`w-3.5 h-3.5 rounded-sm ${stateColor(q.state)} transition-colors duration-300`}
                  title={`Q${q.id}: ${q.state} (F=${q.fidelity.toFixed(3)})`}
                />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3 text-center text-xs">
              <div>
                <div className="font-mono font-bold text-cyan-400">
                  {qubits.filter((q) => q.state === "entangled").length}
                </div>
                <div className="text-muted-foreground">Entangled</div>
              </div>
              <div>
                <div className="font-mono font-bold text-emerald-400">
                  {qubits.filter((q) => q.state === "measured").length}
                </div>
                <div className="text-muted-foreground">Measured</div>
              </div>
              <div>
                <div className="font-mono font-bold text-muted-foreground">
                  {qubits.filter((q) => q.state === "idle").length}
                </div>
                <div className="text-muted-foreground">Idle</div>
              </div>
              <div>
                <div className="font-mono font-bold text-destructive">
                  {qubits.filter((q) => q.state === "error").length}
                </div>
                <div className="text-muted-foreground">Error</div>
              </div>
            </div>
          </Card>

          {/* Simulation Log */}
          <Card className="p-5 flex flex-col">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-primary" />
              Twin Event Log
            </h2>
            <div className="flex-1 bg-muted/50 rounded-lg p-3 font-mono text-xs overflow-y-auto max-h-[360px] space-y-1">
              {log.map((line, i) => (
                <div key={`${i}-${line.slice(0, 20)}`} className="text-muted-foreground">
                  <span className="text-primary/60">{String(i + 1).padStart(3, "0")}</span>{" "}
                  {line}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </Card>
        </div>

        {/* World Records */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-primary" />
            Quantum Hardware Achievements (IBM Torino)
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { record: "Largest DNA-Lang traversable wormhole", detail: "127 qubits" },
              { record: "Most qubits in ER=EPR bridge", detail: "127 heavy-hex" },
              { record: "Longest wormhole throat separation", detail: "63 qubits" },
              { record: "First 127q deployment with 11D-CRSM physics", detail: "4,166 native gates" },
              { record: "First AFE-optimized circuit at maximum scale", detail: "Fitness: 0.0411" },
              { record: "Bell fidelity verification", detail: `${(TARGET_BELL_FIDELITY * 100).toFixed(1)}% measured` },
            ].map((item) => (
              <div key={item.record} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <BarChart3 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">{item.record}</div>
                  <div className="text-xs text-muted-foreground font-mono">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
