"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Cpu, Activity, Shield, Atom, Lock, Zap, Database } from "lucide-react"
import {
  CCCEngine,
  type QByte,
  QUANTUM_CONSTANTS,
  SecurityClearance,
  CLEARANCE_FEATURES,
} from "@/lib/ccce/correlation-coherence-engine"

interface CCCEDashboardProps {
  userClearance?: SecurityClearance
}

export function CCCEDashboard({ userClearance = SecurityClearance.OPEN_SOURCE }: CCCEDashboardProps) {
  const [engine] = useState(() => new CCCEngine())
  const [qbytes, setQbytes] = useState<QByte[]>([])
  const [metrics, setMetrics] = useState({
    totalQBytes: 0,
    avgCoherence: 0,
    avgConsciousness: 0,
    avgDecoherence: 0,
    lambdaScore: 0,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)

  const clearanceConfig = CLEARANCE_FEATURES[userClearance]

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setIsProcessing(true)
      setProcessingProgress(0)

      try {
        const buffer = await file.arrayBuffer()

        // Simulate progressive processing
        for (let i = 0; i <= 100; i += 10) {
          setProcessingProgress(i)
          await new Promise((r) => setTimeout(r, 200))
        }

        const newQbytes = await engine.processWorkloadZip(buffer)
        setQbytes(engine.getMinedQBytes())
        setMetrics(engine.computeAggregateMetrics())
      } catch (error) {
        console.error("Error processing workload:", error)
      } finally {
        setIsProcessing(false)
        setProcessingProgress(100)
      }
    },
    [engine],
  )

  // Check clearance limits
  const isWithinLimit = clearanceConfig.qbyteLimit === -1 || qbytes.length < clearanceConfig.qbyteLimit

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Cpu className="h-6 w-6 text-cyan-400" />
            Correlation Coherence Construction Engine
          </h2>
          <p className="text-muted-foreground">QByte Mining with Phase Conjugation and Tensor Calculus</p>
        </div>
        <Badge
          variant={userClearance === SecurityClearance.TOP_SECRET ? "default" : "secondary"}
          className={
            userClearance === SecurityClearance.TOP_SECRET
              ? "bg-red-600"
              : userClearance === SecurityClearance.ENTERPRISE
                ? "bg-blue-600"
                : "bg-gray-600"
          }
        >
          <Shield className="h-3 w-3 mr-1" />
          {clearanceConfig.name}
        </Badge>
      </div>

      {/* Universal Constants Display */}
      <Card className="p-4 bg-gradient-to-r from-cyan-950/50 to-purple-950/50 border-cyan-500/30">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3">Hardware-Validated Quantum Constants</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Lambda Phi</div>
            <div className="font-mono font-bold">{QUANTUM_CONSTANTS.LAMBDA_PHI.toExponential(6)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Resonance</div>
            <div className="font-mono font-bold">{QUANTUM_CONSTANTS.RESONANCE_ANGLE}deg</div>
          </div>
          <div>
            <div className="text-muted-foreground">Consciousness</div>
            <div className="font-mono font-bold">{QUANTUM_CONSTANTS.CONSCIOUSNESS_THRESHOLD}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Defense</div>
            <div className="font-mono font-bold">{QUANTUM_CONSTANTS.DEFENSE_THRESHOLD}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Negentropic</div>
            <div className="font-mono font-bold">{QUANTUM_CONSTANTS.NEGENTROPIC_RATE}</div>
          </div>
        </div>
      </Card>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Panel */}
        <Card className="p-6 col-span-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-400" />
            Workload Upload
          </h3>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors">
              <input
                type="file"
                accept=".zip"
                onChange={handleFileUpload}
                disabled={isProcessing || !isWithinLimit}
                className="hidden"
                id="workload-upload"
              />
              <label
                htmlFor="workload-upload"
                className={`cursor-pointer ${!isWithinLimit || isProcessing ? "opacity-50" : ""}`}
              >
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drop IBM Quantum workload ZIP here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              </label>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing...</span>
                  <span>{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}

            {!isWithinLimit && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <p className="text-sm text-amber-400 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  QByte limit reached. Upgrade clearance for more.
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p>Allowed backends: {clearanceConfig.backends.join(", ")}</p>
              <p>QByte limit: {clearanceConfig.qbyteLimit === -1 ? "Unlimited" : clearanceConfig.qbyteLimit}</p>
            </div>
          </div>
        </Card>

        {/* Metrics Panel */}
        <Card className="p-6 col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Mining Metrics
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-background/50 rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-cyan-400">{metrics.totalQBytes}</div>
              <div className="text-xs text-muted-foreground">Total QBytes</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-green-400">{(metrics.avgCoherence * 100).toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Avg Coherence (Lambda)</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-purple-400">{metrics.avgConsciousness.toFixed(4)}</div>
              <div className="text-xs text-muted-foreground">Avg Consciousness (Phi)</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-amber-400">{metrics.lambdaScore.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Lambda Score</div>
            </div>
          </div>

          {/* QByte Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-4 py-2 border-b border-border">
              <span className="text-sm font-medium">Mined QBytes ({qbytes.length})</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {qbytes.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Atom className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No QBytes mined yet. Upload a workload to begin.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Backend</th>
                      <th className="px-4 py-2 text-right">Lambda</th>
                      <th className="px-4 py-2 text-right">Phi</th>
                      <th className="px-4 py-2 text-right">Gamma</th>
                      <th className="px-4 py-2 text-right">Fidelity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qbytes.slice(-20).map((qb, i) => (
                      <tr key={qb.id} className="border-t border-border/50 hover:bg-muted/10">
                        <td className="px-4 py-2 font-mono text-xs">{qb.id.slice(0, 12)}...</td>
                        <td className="px-4 py-2">
                          <Badge variant="outline" className="text-xs">
                            {qb.backend}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right font-mono">{(qb.coherence * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2 text-right font-mono">{qb.consciousness.toFixed(4)}</td>
                        <td className="px-4 py-2 text-right font-mono">{qb.decoherence.toFixed(4)}</td>
                        <td className="px-4 py-2 text-right font-mono">{(qb.fidelity * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Security Clearance Upgrade */}
      {userClearance !== SecurityClearance.TOP_SECRET && (
        <Card className="p-6 bg-gradient-to-r from-red-950/30 to-amber-950/30 border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-400" />
                Upgrade Security Clearance
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Access more IBM Quantum backends and unlimited QByte mining
              </p>
            </div>
            <div className="flex gap-3">
              {userClearance === SecurityClearance.OPEN_SOURCE && (
                <Button className="bg-blue-600 hover:bg-blue-500">
                  <Zap className="h-4 w-4 mr-2" />
                  Enterprise ($299/mo)
                </Button>
              )}
              <Button className="bg-red-600 hover:bg-red-500">
                <Shield className="h-4 w-4 mr-2" />
                Top Secret ($999/mo)
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
