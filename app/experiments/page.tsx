"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Experiment {
  id: number
  protocol_name: string
  backend: string
  qubits_used: number
  shots: number
  phi: number | null
  gamma: number | null
  ccce: number | null
  chi_pc: number | null
  status: string
  created_at: string
  proof_hash: string | null
}

interface AggregateMetrics {
  avg_phi: number
  avg_gamma: number
  total_shots: number
  backends: string[]
  hardware_count: number
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [aggregate, setAggregate] = useState<AggregateMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState("")

  useEffect(() => {
    fetch("/api/experiments")
      .then((r) => r.json())
      .then((data) => {
        setExperiments(data.experiments || [])
        setAggregate(data.aggregate || null)
        setSource(data.source || "unknown")
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-green-400">
        <div className="text-center">
          <div className="animate-pulse text-2xl mb-2">⚛️</div>
          <p className="font-mono">Loading quantum experiments...</p>
        </div>
      </div>
    )
  }

  const best = experiments.reduce(
    (best, e) => (e.phi && e.phi > (best?.phi || 0) ? e : best),
    null as Experiment | null
  )

  return (
    <div className="min-h-screen bg-black text-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-green-900/50 pb-6">
          <h1 className="text-3xl font-bold text-green-400 font-mono">
            ⚛️ Quantum Experiments — IBM Hardware Results
          </h1>
          <p className="text-green-600 mt-2 font-mono text-sm">
            DNA::{"}{"}::lang v51.843 | Agile Defense Systems | CAGE 9HUP5 |
            Source: {source}
          </p>
        </div>

        {/* Aggregate Metrics */}
        {aggregate && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MetricCard
              label="Avg Φ (Phi)"
              value={aggregate.avg_phi.toFixed(4)}
              threshold={0.7734}
              actual={aggregate.avg_phi}
            />
            <MetricCard
              label="Avg Γ (Gamma)"
              value={aggregate.avg_gamma.toFixed(4)}
              threshold={0.3}
              actual={aggregate.avg_gamma}
              inverted
            />
            <MetricCard
              label="Total Shots"
              value={aggregate.total_shots.toLocaleString()}
            />
            <MetricCard
              label="Hardware Experiments"
              value={String(aggregate.hardware_count)}
            />
            <MetricCard
              label="Backends"
              value={aggregate.backends.join(", ")}
            />
          </div>
        )}

        {/* Best Result */}
        {best && (
          <Card className="bg-green-950/30 border-green-500/50">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono text-lg">
                🏆 Best Hardware Result
              </CardTitle>
            </CardHeader>
            <CardContent className="font-mono text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-green-600">Protocol:</span>{" "}
                  <span className="text-green-300">{best.protocol_name}</span>
                </div>
                <div>
                  <span className="text-green-600">Backend:</span>{" "}
                  <span className="text-green-300">{best.backend}</span>
                </div>
                <div>
                  <span className="text-green-600">Φ:</span>{" "}
                  <span className="text-green-300 font-bold">
                    {best.phi?.toFixed(4)}
                  </span>
                </div>
                <div>
                  <span className="text-green-600">Qubits:</span>{" "}
                  <span className="text-green-300">{best.qubits_used}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experiments Table */}
        <Card className="bg-gray-950 border-green-900/30">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono">
              All Experiments ({experiments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-green-900/30 text-green-600">
                    <th className="text-left py-2 px-3">Protocol</th>
                    <th className="text-left py-2 px-3">Backend</th>
                    <th className="text-right py-2 px-3">Qubits</th>
                    <th className="text-right py-2 px-3">Shots</th>
                    <th className="text-right py-2 px-3">Φ</th>
                    <th className="text-right py-2 px-3">Γ</th>
                    <th className="text-right py-2 px-3">CCCE</th>
                    <th className="text-center py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {experiments.map((exp) => (
                    <tr
                      key={exp.id}
                      className="border-b border-green-900/10 hover:bg-green-950/20"
                    >
                      <td className="py-2 px-3 text-green-300 max-w-[200px] truncate">
                        {exp.protocol_name || "—"}
                      </td>
                      <td className="py-2 px-3 text-green-500">
                        {exp.backend || "—"}
                      </td>
                      <td className="py-2 px-3 text-right text-green-400">
                        {exp.qubits_used || "—"}
                      </td>
                      <td className="py-2 px-3 text-right text-green-400">
                        {exp.shots?.toLocaleString() || "—"}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={
                            exp.phi && exp.phi >= 0.7734
                              ? "text-green-400 font-bold"
                              : "text-yellow-500"
                          }
                        >
                          {exp.phi?.toFixed(4) || "—"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={
                            exp.gamma !== null && exp.gamma < 0.3
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {exp.gamma?.toFixed(4) || "—"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-green-400">
                        {exp.ccce?.toFixed(4) || "—"}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge
                          variant={
                            exp.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            exp.status === "completed"
                              ? "bg-green-900/50 text-green-400 border-green-700"
                              : "bg-yellow-900/50 text-yellow-400 border-yellow-700"
                          }
                        >
                          {exp.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-green-600 text-xs">
                        {exp.created_at
                          ? new Date(exp.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Proof Hashes */}
        <Card className="bg-gray-950 border-green-900/30">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono text-sm">
              🔒 Cryptographic Attestation Chain
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-xs text-green-700 space-y-1">
            {experiments
              .filter((e) => e.proof_hash)
              .slice(0, 10)
              .map((e) => (
                <div key={e.id}>
                  <span className="text-green-500">{e.protocol_name}:</span>{" "}
                  {e.proof_hash}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  threshold,
  actual,
  inverted,
}: {
  label: string
  value: string
  threshold?: number
  actual?: number
  inverted?: boolean
}) {
  const passed =
    threshold !== undefined && actual !== undefined
      ? inverted
        ? actual < threshold
        : actual >= threshold
      : undefined

  return (
    <Card className="bg-gray-950 border-green-900/30">
      <CardContent className="pt-4 pb-3 px-4">
        <p className="text-xs text-green-600 font-mono">{label}</p>
        <p
          className={`text-lg font-bold font-mono mt-1 ${
            passed === undefined
              ? "text-green-400"
              : passed
                ? "text-green-400"
                : "text-yellow-500"
          }`}
        >
          {value}
        </p>
        {passed !== undefined && (
          <p className="text-xs mt-1">{passed ? "✅" : "⚠️"}</p>
        )}
      </CardContent>
    </Card>
  )
}
