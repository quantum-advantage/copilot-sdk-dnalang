"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Atom,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Beaker,
  Telescope,
  Sigma,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react"

interface Prediction {
  prediction_id: string
  observable: string
  predicted_value: number
  unit: string
  uncertainty: number | null
  derivation: string
  status: string
  mechanism: string
  experiment_to_test: string
  current_experimental: number | null
  current_exp_uncertainty: number | null
  current_exp_source: string
  sigma_deviation: number | null
  problem_ids: number[]
}

interface PredictionData {
  framework: {
    name: string
    constants: Record<string, number>
    total_constants: number
    tuned_parameters: number
  }
  summary: {
    total_predictions: number
    consistent: number
    tension: number
    untested_or_below_bound: number
    avg_sigma_testable: number
    verdict: string
  }
  predictions: Prediction[]
  significance: {
    p_value_all_within_1sigma: number
    description: string
    nearest_hard_test: string
    standout: string
  }
}

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircle2; label: string }> = {
  consistent: { color: "emerald", icon: CheckCircle2, label: "Consistent" },
  below_bound: { color: "amber", icon: Clock, label: "Below Bound" },
  untested: { color: "blue", icon: Beaker, label: "Untested" },
  tension: { color: "red", icon: AlertTriangle, label: "In Tension" },
}

function formatValue(v: number, unit: string): string {
  if (Math.abs(v) < 1e-10) return v.toExponential(3)
  if (Math.abs(v) > 100) return v.toFixed(1)
  if (unit === "seconds") return v.toFixed(1) + " s"
  if (unit === "meters") return v.toExponential(3) + " m"
  if (unit === "radians") return v.toExponential(3) + " rad"
  if (unit === "e-folds") return v.toFixed(3)
  return v.toPrecision(5)
}

function SigmaBar({ sigma }: { sigma: number | null }) {
  if (sigma === null) return <span className="text-slate-500 text-xs">N/A</span>
  const pct = Math.min(sigma / 3, 1) * 100
  const color = sigma < 1 ? "bg-emerald-500" : sigma < 2 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1 }}
        />
      </div>
      <span className="text-xs font-mono text-slate-300">{sigma.toFixed(2)}σ</span>
    </div>
  )
}

export default function PredictionsPage() {
  const [data, setData] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"all" | "consistent" | "untested">("all")

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/predictions")
      if (res.ok) {
        const d = await res.json()
        setData(d)
      }
    } catch { /* keep loading state */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <Atom className="w-6 h-6 animate-spin" />
          <span className="font-mono">Loading predictions from Supabase...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">
        Failed to load predictions
      </div>
    )
  }

  const filtered = tab === "all"
    ? data.predictions
    : tab === "consistent"
      ? data.predictions.filter(p => p.status === "consistent")
      : data.predictions.filter(p => ["untested", "below_bound"].includes(p.status))

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                <Telescope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Penteract Predictions</h1>
                <p className="text-xs text-slate-400">{data.framework.name} · {data.framework.total_constants} constants · {data.framework.tuned_parameters} tuned parameters</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-mono">
                {data.summary.avg_sigma_testable}σ avg
              </div>
              <div className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-mono">
                {data.summary.total_predictions} predictions
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{data.summary.total_predictions}</div>
            <div className="text-xs text-slate-400 mt-1">Total Predictions</div>
          </div>
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-emerald-400">{data.summary.consistent}</div>
            <div className="text-xs text-slate-400 mt-1">Consistent</div>
          </div>
          <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{data.summary.tension}</div>
            <div className="text-xs text-slate-400 mt-1">In Tension</div>
          </div>
          <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-amber-400">{data.summary.untested_or_below_bound}</div>
            <div className="text-xs text-slate-400 mt-1">Awaiting Test</div>
          </div>
          <div className="bg-slate-900/50 border border-violet-500/20 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-violet-400">{data.summary.avg_sigma_testable}σ</div>
            <div className="text-xs text-slate-400 mt-1">Avg Deviation</div>
          </div>
        </div>

        {/* Significance Box */}
        <motion.div
          className="bg-gradient-to-r from-violet-900/30 to-cyan-900/30 border border-violet-500/30 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-violet-400 mt-1 shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Statistical Significance</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                {data.significance.description}. The probability of all testable predictions landing within
                1σ by chance: <span className="font-mono text-violet-300">{(data.significance.p_value_all_within_1sigma * 100).toFixed(2)}%</span>.
              </p>
              <div className="mt-3 flex items-center gap-2 text-cyan-400 text-sm">
                <Target className="w-4 h-4" />
                <span className="font-semibold">Nearest hard test:</span>
                <span className="text-slate-300">{data.significance.nearest_hard_test}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Framework Constants */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Framework Constants (Immutable)</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(data.framework.constants).map(([key, val]) => (
              <div key={key} className="text-center">
                <div className="font-mono text-cyan-400 text-sm">{typeof val === "number" && val < 0.001 ? val.toExponential(6) : val}</div>
                <div className="text-xs text-slate-500 mt-1">{key.replace(/_/g, " ")}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["all", "consistent", "untested"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {t === "all" ? `All (${data.summary.total_predictions})` :
               t === "consistent" ? `Consistent (${data.summary.consistent})` :
               `Awaiting Test (${data.summary.untested_or_below_bound})`}
            </button>
          ))}
        </div>

        {/* Predictions Table */}
        <div className="space-y-4">
          {filtered.map((p, i) => {
            const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.untested
            const StatusIcon = cfg.icon
            return (
              <motion.div
                key={p.prediction_id}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-bold text-cyan-400">{p.prediction_id}</span>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-${cfg.color}-500/10 text-${cfg.color}-400 border border-${cfg.color}-500/20`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-400">{p.mechanism.replace(/_/g, " ")}</span>
                    </div>
                    <h3 className="text-white font-semibold mb-1">{p.observable}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Predicted</div>
                        <div className="font-mono text-lg text-violet-400">
                          {formatValue(p.predicted_value, p.unit)}
                          {p.uncertainty && <span className="text-sm text-slate-500"> ± {p.uncertainty < 0.001 ? p.uncertainty.toExponential(0) : p.uncertainty}</span>}
                        </div>
                      </div>
                      {p.current_experimental !== null && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Measured</div>
                          <div className="font-mono text-lg text-emerald-400">
                            {formatValue(p.current_experimental, p.unit)}
                            {p.current_exp_uncertainty && <span className="text-sm text-slate-500"> ± {p.current_exp_uncertainty}</span>}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Deviation</div>
                        <SigmaBar sigma={p.sigma_deviation} />
                      </div>
                    </div>

                    {p.derivation && (
                      <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Derivation</div>
                        <code className="text-xs text-slate-300 font-mono break-all">{p.derivation}</code>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                      <Sigma className="w-3 h-3" />
                      <span>Test with:</span>
                      <span className="text-slate-300">{p.experiment_to_test}</span>
                    </div>
                    {p.current_exp_source && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <ExternalLink className="w-3 h-3" />
                        <span>{p.current_exp_source}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* LiteBIRD Countdown */}
        <motion.div
          className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <Telescope className="w-8 h-8 text-amber-400" />
            <div>
              <h3 className="text-white font-semibold">Make-or-Break Test: LiteBIRD (~2032)</h3>
              <p className="text-sm text-slate-300 mt-1">
                PENT-007 predicts <span className="font-mono text-amber-400">r = 0.00298</span>. LiteBIRD will measure r to σ ≈ 0.001.
                If detected at ~3σ, the framework predicted it years in advance from a geometric resonance angle.
                If not detected, the framework needs fundamental revision. <span className="text-amber-400 font-semibold">No wiggle room.</span>
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-amber-400 shrink-0" />
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-600 py-8">
          Data sourced from Supabase · {data.framework.name} · {data.framework.total_constants} constants, {data.framework.tuned_parameters} tuning · DNA::{"}{"}::lang v51.843
        </div>
      </main>
    </div>
  )
}
