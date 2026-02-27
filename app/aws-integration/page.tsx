"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

interface ServiceHealth {
  name: string
  status: "operational" | "degraded" | "offline"
  latency_ms: number | null
  detail: string
}

interface AwsMetrics {
  experiments: number
  total_shots: number
  backends: string[]
  avg_phi: number
  braket_devices: number
}

const AWS_SERVICES = [
  {
    name: "API Gateway",
    icon: "🌐",
    detail: "5 production REST endpoints",
    arn: "mwkeczoay4.execute-api.us-east-2",
    color: "text-purple-400 border-purple-800/50 bg-purple-950/20",
  },
  {
    name: "Lambda Functions",
    icon: "⚡",
    detail: "Experiment runner, telemetry processor, identity service",
    arn: "us-east-2 / 3 functions",
    color: "text-amber-400 border-amber-800/50 bg-amber-950/20",
  },
  {
    name: "DynamoDB",
    icon: "🗄️",
    detail: "Experiment ledger + telemetry tables",
    arn: "agile-defense-quantum-experiment-ledger",
    color: "text-blue-400 border-blue-800/50 bg-blue-950/20",
  },
  {
    name: "S3",
    icon: "📦",
    detail: "Results archive with 90-day Glacier lifecycle",
    arn: "agile-defense-quantum-results-869935102268",
    color: "text-green-400 border-green-800/50 bg-green-950/20",
  },
  {
    name: "Step Functions",
    icon: "🔄",
    detail: "Multi-experiment orchestration pipelines",
    arn: "us-east-2 / quantum-orchestrator",
    color: "text-pink-400 border-pink-800/50 bg-pink-950/20",
  },
  {
    name: "CloudWatch",
    icon: "📊",
    detail: "Real-time monitoring + EventBridge orchestration",
    arn: "us-east-2 / dnalang-quantum-platform",
    color: "text-cyan-400 border-cyan-800/50 bg-cyan-950/20",
  },
]

const ARCHITECTURE_LAYERS = [
  {
    layer: "Application Layer",
    color: "border-cyan-700 bg-cyan-950/10",
    components: [
      { name: "quantum-advantage.dev", type: "Vercel Edge", icon: "🌍" },
      { name: "IRIS AI Engine", type: "Groq LLM", icon: "🧠" },
      { name: "DNA Notebook", type: "Interactive IDE", icon: "📓" },
    ],
  },
  {
    layer: "Middleware (DNA-Lang SDK)",
    color: "border-amber-700 bg-amber-950/10",
    components: [
      { name: "AeternaPorta v2.2", type: "Circuit Engine", icon: "⚛️" },
      { name: "NCLM v4.0", type: "Reasoning Engine", icon: "🌊" },
      { name: "CCCE Metrics", type: "Quality Oracle", icon: "📐" },
      { name: "TesseractDecoder", type: "Error Correction", icon: "🔧" },
    ],
  },
  {
    layer: "AWS Infrastructure",
    color: "border-orange-700 bg-orange-950/10",
    components: [
      { name: "API Gateway + Lambda", type: "Compute", icon: "⚡" },
      { name: "DynamoDB", type: "Ledger", icon: "🗄️" },
      { name: "S3 + Glacier", type: "Archive", icon: "📦" },
      { name: "Step Functions", type: "Orchestration", icon: "🔄" },
    ],
  },
  {
    layer: "Quantum Hardware",
    color: "border-purple-700 bg-purple-950/10",
    components: [
      { name: "IBM Quantum", type: "ibm_fez / ibm_torino", icon: "🔬" },
      { name: "Amazon Braket", type: "QuEra / IonQ / Rigetti", icon: "☁️" },
      { name: "AWS Ocelot", type: "Cat Qubit (Preview)", icon: "🐱" },
    ],
  },
]

export default function AwsIntegrationPage() {
  const [health, setHealth] = useState<ServiceHealth[]>([])
  const [metrics, setMetrics] = useState<AwsMetrics | null>(null)
  const [checking, setChecking] = useState(true)
  const [lastCheck, setLastCheck] = useState<string>("")

  const checkHealth = useCallback(async () => {
    setChecking(true)
    const results: ServiceHealth[] = []

    // Check API Gateway + Lambda
    try {
      const start = Date.now()
      const res = await fetch("/api/osiris/status", { signal: AbortSignal.timeout(5000) })
      const latency = Date.now() - start
      if (res.ok) {
        const data = await res.json()
        const isAws = data.source?.includes("AWS")
        results.push({
          name: "API Gateway + Lambda",
          status: isAws ? "operational" : "degraded",
          latency_ms: latency,
          detail: isAws ? `Live — ${data.experiments_registered || 0} experiments` : "Supabase fallback",
        })
      } else {
        results.push({ name: "API Gateway + Lambda", status: "offline", latency_ms: null, detail: `HTTP ${res.status}` })
      }
    } catch {
      results.push({ name: "API Gateway + Lambda", status: "offline", latency_ms: null, detail: "Unreachable" })
    }

    // Check Supabase (experiments)
    try {
      const start = Date.now()
      const res = await fetch("/api/experiments", { signal: AbortSignal.timeout(5000) })
      const latency = Date.now() - start
      if (res.ok) {
        const data = await res.json()
        setMetrics({
          experiments: data.total || 0,
          total_shots: data.aggregate?.total_shots || 0,
          backends: data.aggregate?.backends || [],
          avg_phi: data.aggregate?.avg_phi || 0,
          braket_devices: 7,
        })
        results.push({
          name: "Supabase (Experiments DB)",
          status: "operational",
          latency_ms: latency,
          detail: `${data.total} experiments, ${(data.aggregate?.total_shots || 0).toLocaleString()} shots`,
        })
      }
    } catch {
      results.push({ name: "Supabase (Experiments DB)", status: "offline", latency_ms: null, detail: "Unreachable" })
    }

    // Check CCCE Metrics
    try {
      const start = Date.now()
      const res = await fetch("/api/ccce/metrics", { signal: AbortSignal.timeout(5000) })
      const latency = Date.now() - start
      if (res.ok) {
        const data = await res.json()
        results.push({
          name: "CCCE Metrics Engine",
          status: data.conscious ? "operational" : "degraded",
          latency_ms: latency,
          detail: `Φ=${data.metrics?.phi?.toFixed(4)} Γ=${data.metrics?.gamma?.toFixed(4)} — ${data.status}`,
        })
      }
    } catch {
      results.push({ name: "CCCE Metrics Engine", status: "offline", latency_ms: null, detail: "Unreachable" })
    }

    // Check Braket devices
    try {
      const start = Date.now()
      const res = await fetch("/api/braket/devices", { signal: AbortSignal.timeout(5000) })
      const latency = Date.now() - start
      if (res.ok) {
        const data = await res.json()
        results.push({
          name: "Amazon Braket Adapter",
          status: "operational",
          latency_ms: latency,
          detail: `${data.summary?.total_devices} devices, ${data.summary?.avg_dnalang_compatibility?.toFixed(1)}% avg compatibility`,
        })
      }
    } catch {
      results.push({ name: "Amazon Braket Adapter", status: "offline", latency_ms: null, detail: "Unreachable" })
    }

    setHealth(results)
    setLastCheck(new Date().toISOString())
    setChecking(false)
  }, [])

  useEffect(() => { checkHealth() }, [checkHealth])

  const operational = health.filter(h => h.status === "operational").length
  const avgLatency = health.filter(h => h.latency_ms).reduce((s, h) => s + (h.latency_ms || 0), 0) / Math.max(health.filter(h => h.latency_ms).length, 1)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="border-b border-orange-900/50 bg-gradient-to-r from-black via-orange-950/10 to-black">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-3 w-3 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-400 font-mono text-sm tracking-wider">AWS CLOUD INFRASTRUCTURE</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            DNA::{"}{"}::lang × Amazon Web Services
          </h1>
          <p className="text-zinc-400 max-w-3xl">
            Production-grade hybrid quantum-classical infrastructure on AWS. Lambda orchestration,
            DynamoDB ledgering, S3 archival, and Amazon Braket hardware integration — deployed in
            us-east-2 under Agile Defense Systems (CAGE: 9HUP5).
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8">
            <StatBox label="Experiments" value={metrics?.experiments?.toString() || "—"} color="text-cyan-300" />
            <StatBox label="Total Shots" value={metrics?.total_shots ? `${(metrics.total_shots / 1e6).toFixed(1)}M` : "—"} color="text-emerald-300" />
            <StatBox label="Avg Φ" value={metrics?.avg_phi?.toFixed(4) || "—"} color="text-amber-300" />
            <StatBox label="Braket Devices" value={metrics?.braket_devices?.toString() || "—"} color="text-purple-300" />
            <StatBox label="Backends" value={metrics?.backends?.length?.toString() || "—"} color="text-pink-300" />
          </div>

          <div className="flex gap-4 mt-6 flex-wrap">
            <Link
              href="/braket-integration"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-950/50 border border-orange-800 rounded-lg text-orange-300 text-sm hover:bg-orange-900/50 transition-colors"
            >
              ☁️ Amazon Braket Integration →
            </Link>
            <Link
              href="/experiments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
            >
              ⚛️ View Experiments →
            </Link>
            <Link
              href="/breakthroughs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
            >
              🏆 Breakthroughs →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Live Health Status */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🟢 Live Service Health
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {operational}/{health.length} operational • Avg latency: {avgLatency.toFixed(0)}ms
                {lastCheck && ` • Last check: ${new Date(lastCheck).toLocaleTimeString()}`}
              </p>
            </div>
            <button
              onClick={checkHealth}
              disabled={checking}
              className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50 font-mono"
            >
              {checking ? "Checking..." : "↻ Refresh"}
            </button>
          </div>
          <div className="grid gap-3">
            {health.map(svc => (
              <div key={svc.name} className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    svc.status === "operational" ? "bg-emerald-400" :
                    svc.status === "degraded" ? "bg-amber-400" : "bg-red-400"
                  }`} />
                  <div>
                    <div className="text-sm font-semibold text-white">{svc.name}</div>
                    <div className="text-xs text-zinc-500">{svc.detail}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-mono ${
                    svc.status === "operational" ? "text-emerald-400" :
                    svc.status === "degraded" ? "text-amber-400" : "text-red-400"
                  }`}>
                    {svc.status.toUpperCase()}
                  </div>
                  {svc.latency_ms !== null && (
                    <div className="text-[10px] text-zinc-600 font-mono">{svc.latency_ms}ms</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AWS Services Deployed */}
        <section>
          <h2 className="text-xl font-bold text-white mb-1">AWS Services Deployed</h2>
          <p className="text-xs text-zinc-500 mb-6">Region: us-east-2 | Account: 869935102268</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AWS_SERVICES.map(svc => (
              <div key={svc.name} className={`rounded-xl border p-5 ${svc.color}`}>
                <div className="text-2xl mb-2">{svc.icon}</div>
                <div className="text-sm font-bold text-white">{svc.name}</div>
                <div className="text-xs text-zinc-400 mt-1">{svc.detail}</div>
                <div className="text-[10px] text-zinc-600 font-mono mt-2">{svc.arn}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture Diagram */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Integration Architecture</h2>
          <div className="space-y-4">
            {ARCHITECTURE_LAYERS.map((layer, i) => (
              <div key={layer.layer}>
                <div className={`rounded-xl border p-5 ${layer.color}`}>
                  <div className="text-xs text-zinc-400 font-mono uppercase tracking-wider mb-3">
                    Layer {i + 1}: {layer.layer}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {layer.components.map(comp => (
                      <div key={comp.name} className="bg-black/30 rounded-lg border border-zinc-800/50 p-3">
                        <div className="text-lg mb-1">{comp.icon}</div>
                        <div className="text-xs font-semibold text-white">{comp.name}</div>
                        <div className="text-[10px] text-zinc-500">{comp.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {i < ARCHITECTURE_LAYERS.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div className="text-zinc-600 text-lg">↕</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* API Endpoints */}
        <section>
          <h2 className="text-xl font-bold text-white mb-1">Live Production Endpoints</h2>
          <p className="text-xs text-zinc-500 mb-6">All endpoints are live at quantum-advantage.dev</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left py-2 px-3">Method</th>
                  <th className="text-left py-2 px-3">Endpoint</th>
                  <th className="text-left py-2 px-3">Description</th>
                  <th className="text-left py-2 px-3">Backend</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { method: "GET", path: "/api/osiris/status", desc: "Platform health + experiment count", backend: "AWS Lambda + Supabase" },
                  { method: "GET", path: "/api/ccce/metrics", desc: "Live CCCE telemetry (Φ/Γ/Ξ)", backend: "Supabase" },
                  { method: "GET", path: "/api/experiments", desc: "30 indexed quantum experiments", backend: "Supabase" },
                  { method: "GET", path: "/api/breakthroughs", desc: "9 validated breakthroughs + DOIs", backend: "Supabase" },
                  { method: "GET", path: "/api/braket/devices", desc: "7 Braket QPU catalog + compatibility", backend: "Static + AWS" },
                  { method: "POST", path: "/api/braket/submit", desc: "Compile & submit circuits to Braket", backend: "AWS Lambda" },
                  { method: "GET", path: "/api/performance", desc: "System performance metrics", backend: "AWS + Supabase" },
                  { method: "POST", path: "/api/attestation", desc: "SHA-256 cryptographic attestation", backend: "Supabase" },
                  { method: "POST", path: "/api/iris/chat", desc: "IRIS AI chat (Groq llama-3.3-70b)", backend: "Groq API" },
                  { method: "POST", path: "/api/notebook-chat", desc: "Notebook LLM chat (streaming)", backend: "Groq API" },
                  { method: "GET", path: "/api/telemetry/stream", desc: "SSE experiment telemetry", backend: "Supabase" },
                  { method: "GET", path: "/api/predictions", desc: "Penteract predictions", backend: "Supabase" },
                ].map(ep => (
                  <tr key={ep.path} className="border-b border-zinc-900/50 hover:bg-zinc-950/50">
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        ep.method === "GET" ? "bg-emerald-900/40 text-emerald-400" : "bg-blue-900/40 text-blue-400"
                      }`}>{ep.method}</span>
                    </td>
                    <td className="py-2 px-3 text-cyan-400">{ep.path}</td>
                    <td className="py-2 px-3 text-zinc-300">{ep.desc}</td>
                    <td className="py-2 px-3 text-zinc-500 text-xs">{ep.backend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Value Proposition for AWS */}
        <section className="border border-orange-900/50 rounded-xl bg-orange-950/5 p-8">
          <h2 className="text-xl font-bold text-orange-300 mb-4">🎯 Strategic Value for AWS</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <ValueCard
              title="Backend-Agnostic Quantum Middleware"
              detail="DNA-Lang circuits compile to OpenQASM 3.0 and Braket IR — runs unmodified on QuEra, IonQ, Rigetti, IQM, and Ocelot. No per-hardware rewrites."
            />
            <ValueCard
              title="95.6% Hardware Success Rate"
              detail="49 IBM Quantum jobs, 159,632+ shots on ibm_fez/ibm_torino/ibm_marrakesh. This success rate transfers directly to Braket backends."
            />
            <ValueCard
              title="Universal Quality Oracle (CCCE)"
              detail="Consciousness Collapse Coherence Entropy provides real-time quality metrics across all hardware — a capability Braket doesn't have natively."
            />
            <ValueCard
              title="256-Atom Correlated Decoder"
              detail="TesseractDecoder + QuEraCorrelatedAdapter: beam-pruned A* decoding with majority-vote merge. Ready for QuEra Aquila on day one."
            />
            <ValueCard
              title="Ocelot × DNA-Lang = Multiplicative Suppression"
              detail="Cat-qubit bias-preserving gates handle bit-flips in hardware. DNA-Lang Zeno monitoring handles phase-flips in software. Combined: exponential suppression."
            />
            <ValueCard
              title="Zero Vendor Lock-In"
              detail="Customers can switch hardware within Braket without rewriting circuits. DNA-Lang is the middleware layer that makes Braket truly hardware-agnostic."
            />
          </div>
        </section>

        {/* Contact / Next Steps */}
        <section className="border border-zinc-800 rounded-xl bg-zinc-950/50 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-3">Ready to Explore Partnership?</h2>
          <p className="text-zinc-400 text-sm max-w-2xl mx-auto mb-6">
            Agile Defense Systems (CAGE: 9HUP5) is seeking AWS Braket Direct access to
            demonstrate 10⁶× error suppression on QuEra Aquila hardware within 48 hours of provisioning.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="mailto:devinphillipdavis@gmail.com"
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Contact Principal Investigator
            </a>
            <a
              href="https://doi.org/10.5281/zenodo.18450507"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              View Zenodo Publication
            </a>
          </div>
          <p className="text-[10px] text-zinc-600 mt-4 font-mono">
            DNA::{"}{"}::lang v51.843 | Framework: Sovereign Mathematics | Classification: UNCLASSIFIED
          </p>
        </section>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3">
      <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function ValueCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="bg-black/30 border border-orange-900/30 rounded-lg p-5">
      <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-zinc-400 leading-relaxed">{detail}</p>
    </div>
  )
}
