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
  const [backendFilter, setBackendFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "phi" | "qubits" | "shots">("date")

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

  const backends = [...new Set(experiments.map(e => e.backend))].sort()
  const filtered = backendFilter === "all" ? experiments : experiments.filter(e => e.backend === backendFilter)
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "phi") return (b.phi || 0) - (a.phi || 0)
    if (sortBy === "qubits") return (b.qubits_used || 0) - (a.qubits_used || 0)
    if (sortBy === "shots") return (b.shots || 0) - (a.shots || 0)
    return 0 // date = default order from API
  })

  const best = experiments.reduce(
    (best, e) => (e.phi && e.phi > (best?.phi || 0) ? e : best),
    null as Experiment | null
  )

  const aboveThreshold = experiments.filter(e => e.phi && e.phi >= 0.7734).length
  const coherent = experiments.filter(e => e.gamma !== null && e.gamma < 0.3).length

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

        {/* Phi Threshold Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-emerald-950/20 border-emerald-900/30">
            <CardContent className="p-4">
              <div className="text-2xl font-mono font-bold text-emerald-400">{aboveThreshold}/{experiments.length}</div>
              <div className="text-xs text-emerald-600 font-mono">Φ ≥ 0.7734 (Above Threshold)</div>
            </CardContent>
          </Card>
          <Card className="bg-cyan-950/20 border-cyan-900/30">
            <CardContent className="p-4">
              <div className="text-2xl font-mono font-bold text-cyan-400">{coherent}/{experiments.length}</div>
              <div className="text-xs text-cyan-600 font-mono">Γ &lt; 0.3 (Coherent)</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-950/20 border-purple-900/30">
            <CardContent className="p-4">
              <div className="text-2xl font-mono font-bold text-purple-400">{backends.length}</div>
              <div className="text-xs text-purple-600 font-mono">Unique Backends</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-green-600 text-xs font-mono">BACKEND:</span>
          <button
            onClick={() => setBackendFilter("all")}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${backendFilter === "all" ? "bg-green-900/50 text-green-300 border border-green-700" : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600"}`}
          >
            All ({experiments.length})
          </button>
          {backends.map(b => (
            <button
              key={b}
              onClick={() => setBackendFilter(b)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${backendFilter === b ? "bg-green-900/50 text-green-300 border border-green-700" : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600"}`}
            >
              {b} ({experiments.filter(e => e.backend === b).length})
            </button>
          ))}
          <span className="ml-4 text-green-600 text-xs font-mono">SORT:</span>
          {(["date", "phi", "qubits", "shots"] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${sortBy === s ? "bg-green-900/50 text-green-300 border border-green-700" : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600"}`}
            >
              {s === "phi" ? "Φ" : s === "qubits" ? "Qubits" : s === "shots" ? "Shots" : "Date"}
            </button>
          ))}
        </div>

        {/* Experiments Table */}
        <Card className="bg-gray-950 border-green-900/30">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono">
              {backendFilter === "all" ? `All Experiments (${experiments.length})` : `${backendFilter} — ${filtered.length} experiments`}
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
                  {sorted.map((exp) => (
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
