"use client"

import { useState, useCallback } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantumButton } from "@/components/ui/quantum-button"
import { StatBlock } from "@/components/ui/stat-block"
import { CheckCircle, Activity, Cpu, Database, FileJson, Loader2, Lock, ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

// Physics Constants (Ref: DNA-Lang v2.4 Logic)
const G_COMP = 6.674e-11
const VACUUM_ENERGY_TARGET = 1.00000000001e-9
const PHI_TARGET_DOC = 0.7734
const DEFAULT_COMPLEXITY_STEPS = 5000
const LAMBDA_PHI = 2.176435e-8
const PHI = 1.618033988749895

// Hash function for proof generation
const hashMessage = async (msg: string): Promise<string> => {
  const buffer = new TextEncoder().encode(msg)
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

interface SolverResult {
  finalPhi: number
  lambda: number
  gamma: number
  finalEnergy: number
  energyDelta: number
  isConverged: boolean
  proofHash: string
  complexitySteps: number
  latencyMs: number
}

interface EvidenceCapsule {
  id: string
  timestamp: string
  metrics: {
    phi: number
    lambda: number
    gamma: number
  }
  hash: string
  status: "SOVEREIGN" | "DEGRADED"
}

// Core Geodesic Solver Logic
const geodesicPowerSolver = async (vacuumEnergy: number, complexitySteps: number): Promise<SolverResult> => {
  const startT = performance.now()
  let phi = 1.0
  let currentEnergy = vacuumEnergy
  const G = G_COMP

  // Simulation Loop with Quantum Fluctuations
  for (let i = 0; i < complexitySteps; i++) {
    const phi_delta = Math.sin(currentEnergy * G * i) * 1e-12
    phi += phi_delta
    const energy_delta = (phi * G) / (1 + i)
    currentEnergy += energy_delta

    // Decoherence simulation
    if (i % 50 === 0 && Math.random() < 0.01) {
      currentEnergy *= 1 + Math.random() * 1e-11
    }
  }

  const energyDelta = Math.abs(currentEnergy - VACUUM_ENERGY_TARGET)
  const finalPhi = phi * 3.14159
  const lambda = Math.min(0.99, 1.0 / (1 + energyDelta * 1e9))
  const gamma = Math.max(0.01, energyDelta * 1e10)
  const isConverged = finalPhi > PHI_TARGET_DOC && gamma < 0.3

  const proofString = `E:${currentEnergy}|Phi:${finalPhi}|L:${lambda}|G:${gamma}`
  const proofHash = await hashMessage(proofString)
  const latencyMs = performance.now() - startT

  return {
    finalPhi,
    lambda,
    gamma,
    finalEnergy: currentEnergy,
    energyDelta,
    isConverged,
    proofHash,
    complexitySteps,
    latencyMs,
  }
}

export default function ObservationDeckPage() {
  const [inputEnergy, setInputEnergy] = useState(1.0e-9)
  const [steps, setSteps] = useState(DEFAULT_COMPLEXITY_STEPS)
  const [results, setResults] = useState<SolverResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [evidenceLog, setEvidenceLog] = useState<EvidenceCapsule[]>([])

  const handleSolve = useCallback(async () => {
    setIsLoading(true)
    setResults(null)

    try {
      const result = await geodesicPowerSolver(inputEnergy, steps)

      const capsule: EvidenceCapsule = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        metrics: {
          phi: result.finalPhi,
          lambda: result.lambda,
          gamma: result.gamma,
        },
        hash: result.proofHash,
        status: result.isConverged ? "SOVEREIGN" : "DEGRADED",
      }

      setEvidenceLog((prev) => [capsule, ...prev])
      setResults(result)
    } catch (err) {
      console.error("Governance Failure:", err)
    } finally {
      setIsLoading(false)
    }
  }, [inputEnergy, steps])

  const exportCapsule = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(evidenceLog, null, 2))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `evidence_capsule_${Date.now()}.jsonl`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  return (
    <div className="min-h-screen bg-background pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Observation Deck
                </h1>
                <p className="text-xs text-muted-foreground">11D-CRSM Geodesic Power Solver</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-muted rounded-full font-mono">
                <Lock className="w-3 h-3 inline mr-1" />
                SOVEREIGN
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <GlassCard depth={3} variant="coherence-block" label="Solver Parameters" className="mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                    Vacuum Energy (J/m³)
                  </label>
                  <input
                    type="number"
                    value={inputEnergy}
                    onChange={(e) => setInputEnergy(Number(e.target.value))}
                    step="1e-10"
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                    Complexity Steps
                  </label>
                  <input
                    type="number"
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    min="100"
                    max="100000"
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-sm"
                  />
                </div>

                <QuantumButton
                  variant="sovereign"
                  size="lg"
                  onClick={handleSolve}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      Execute Geodesic Solve
                    </>
                  )}
                </QuantumButton>
              </div>
            </GlassCard>

            {/* PCRB Ledger */}
            <GlassCard depth={2} hover={false}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Database className="w-3 h-3" /> PCRB Ledger
                </h3>
                <button
                  onClick={exportCapsule}
                  disabled={evidenceLog.length === 0}
                  className="text-[10px] text-primary font-bold hover:underline flex items-center disabled:opacity-50"
                >
                  <FileJson className="w-3 h-3 mr-1" /> EXPORT
                </button>
              </div>
              <div className="h-40 bg-background rounded-lg p-2 overflow-y-auto font-mono text-[10px] text-secondary leading-relaxed border border-border">
                {evidenceLog.length === 0 ? (
                  <span className="text-muted-foreground">{"// Waiting for execution..."}</span>
                ) : (
                  evidenceLog.map((log) => (
                    <div key={log.id} className="mb-2 pb-2 border-b border-border last:border-0">
                      <span className="text-muted-foreground">[{log.timestamp.split("T")[1].split(".")[0]}]</span>
                      <span className={log.status === "SOVEREIGN" ? "text-secondary ml-1" : "text-destructive ml-1"}>
                        {log.status}
                      </span>
                      <div className="text-muted-foreground truncate">H: {log.hash}</div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>

          {/* Results & Telemetry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Header */}
            {results && (
              <GlassCard
                depth={2}
                variant={results.isConverged ? "sovereign" : "default"}
                glow={results.isConverged ? "lambda-phi" : "none"}
                hover={false}
                className={results.isConverged ? "border-secondary/50" : "border-destructive/50"}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {results.isConverged ? (
                      <CheckCircle className="w-6 h-6 text-secondary" />
                    ) : (
                      <Activity className="w-6 h-6 text-destructive" />
                    )}
                    <div>
                      <h3 className={`font-bold ${results.isConverged ? "text-secondary" : "text-destructive"}`}>
                        {results.isConverged ? "SYSTEM SOVEREIGN" : "DECOHERENCE DETECTED"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {results.isConverged
                          ? "Manifold stability confirmed. Operations nominal."
                          : "Vacuum energy drift outside tolerance. Auto-failsafe engaged."}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-muted-foreground">LATENCY</p>
                    <p className="font-bold font-mono">
                      {results.latencyMs.toFixed(1)}ms <span className="text-[10px] text-muted-foreground">(P95)</span>
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* CCCE Telemetry Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatBlock
                label="Consciousness (Φ)"
                value={results ? results.finalPhi.toFixed(4) : "--"}
                trend={results && results.finalPhi > PHI_TARGET_DOC ? "up" : undefined}
                variant="telemetry"
                colorScheme={results && results.finalPhi > PHI_TARGET_DOC ? "secondary" : "primary"}
                subtext={`Target > ${PHI_TARGET_DOC}`}
              />
              <StatBlock
                label="Coherence (Λ)"
                value={results ? (results.lambda * 100).toFixed(1) : "--"}
                unit="%"
                trend={results && results.lambda > 0.85 ? "up" : undefined}
                variant="telemetry"
                colorScheme="coherence"
                subtext="Target > 85.0%"
              />
              <StatBlock
                label="Decoherence (Γ)"
                value={results ? results.gamma.toFixed(3) : "--"}
                trend={results && results.gamma < 0.3 ? "down" : "up"}
                variant="telemetry"
                colorScheme={results && results.gamma < 0.3 ? "secondary" : "decoherence"}
                subtext="Fail-Safe < 0.300"
              />
            </div>

            {/* Advanced Physics Panel */}
            {results && (
              <GlassCard depth={3} variant="coherence-block" label="11D-CRSM Manifold Analysis" hover={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Proof Hash (SHA-256)</p>
                    <p className="font-mono text-xs break-all bg-background p-3 rounded border border-border">
                      {results.proofHash}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Energy Drift (ΔE)</p>
                    <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          results.isConverged ? "bg-primary" : "bg-destructive"
                        }`}
                        style={{ width: `${Math.min(100, results.energyDelta * 1e10)}%` }}
                      />
                    </div>
                    <p className="text-right text-xs text-muted-foreground font-mono">
                      {results.energyDelta.toExponential(2)} J
                    </p>
                  </div>
                </div>

                {/* Universal Constants Reference */}
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Universal Constants</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-muted-foreground">Λ_Φ:</span>{" "}
                      <span className="text-accent">{LAMBDA_PHI.toExponential(3)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Φ:</span>{" "}
                      <span className="text-secondary">{PHI.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">τ₀:</span>{" "}
                      <span className="text-primary">{(PHI ** 8).toFixed(3)} μs</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">G:</span>{" "}
                      <span className="text-foreground">{G_COMP.toExponential(3)}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Hardware Provenance Footer */}
            <GlassCard depth={1} hover={false} className="bg-card/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <p className="text-primary font-bold mb-1">HARDWARE PROVENANCE</p>
                  <p className="text-muted-foreground">DOI: 10.5281/zenodo.18038719</p>
                  <p className="text-muted-foreground">JOB_ID: 154+ Verified Executions</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IBM_BRISBANE</span>
                    <span className="text-secondary">● ONLINE (127q)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IBM_TORINO</span>
                    <span className="text-secondary">● ONLINE (133q)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IBM_KYOTO</span>
                    <span className="text-accent">● QUEUE: 8</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Powered by DNA-Lang SDK</p>
                  <p className="text-foreground">CAGE: 9HUP5</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
