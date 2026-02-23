"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantumButton } from "@/components/ui/quantum-button"
import {
  ChevronRight,
  Cloud,
  Cpu,
  Zap,
  Shield,
  Activity,
  Network,
  ArrowRight,
  Check,
  ExternalLink,
  RefreshCw,
  Terminal,
  Atom,
  GitBranch,
  Layers,
  Target,
} from "lucide-react"

interface BraketDevice {
  id: string
  name: string
  provider: string
  technology: string
  qubits: number
  status: string
  region: string
  connectivity: string
  gate_fidelity: { single: number; two: number }
  t1_us: number | null
  t2_us: number | null
  dnalang_compatibility: {
    score: number
    adapters: string[]
    protocols: string[]
    notes: string
    tested: boolean
    code_ref: string
  }
  pricing?: Record<string, unknown>
}

interface DeviceData {
  summary: {
    total_devices: number
    online_devices: number
    total_qubits_available: number
    technologies: string[]
    avg_dnalang_compatibility: number
    adapters_deployed: number
    protocols_available: number
  }
  devices: BraketDevice[]
  value_proposition: {
    headline: string
    differentiators: Array<{ claim: string; detail: string }>
  }
  integration_architecture: {
    layers: Array<{
      layer: string
      components: string[]
      role: string
    }>
  }
  aws_infrastructure: {
    api_gateway: string
    s3_bucket: string
    dynamodb_table: string
    lambda_endpoints: number
    live_metrics: Record<string, unknown> | null
  }
}

interface SubmitResult {
  status: string
  submission: Record<string, unknown>
  circuit: {
    braketIR: { source: string }
    metadata: Record<string, unknown>
  }
  dnalang_enhancements: Record<string, unknown>
  estimated_cost: { estimated_usd: string; backend: string }
}

const techColors: Record<string, string> = {
  "Neutral Atom": "text-green-400 bg-green-400/10 border-green-400/30",
  "Trapped Ion": "text-purple-400 bg-purple-400/10 border-purple-400/30",
  Superconducting: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  "Cat Qubit (Bosonic)": "text-amber-400 bg-amber-400/10 border-amber-400/30",
  "State Vector Simulator": "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  "Density Matrix Simulator": "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
}

const statusColors: Record<string, string> = {
  ONLINE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  PREVIEW: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  OFFLINE: "bg-red-500/20 text-red-400 border-red-500/50",
}

export default function BraketIntegrationPage() {
  const [data, setData] = useState<DeviceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDevice, setSelectedDevice] = useState<BraketDevice | null>(null)
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedProtocol, setSelectedProtocol] = useState("bell_state")
  const [activeTab, setActiveTab] = useState<"devices" | "architecture" | "submit" | "value">("devices")

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch("/api/braket/devices")
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error("Failed to fetch Braket devices:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  const handleSubmit = async (device: BraketDevice) => {
    setSubmitting(true)
    setSubmitResult(null)
    try {
      const backendKey = device.provider.toLowerCase().includes("quera")
        ? "quera"
        : device.provider.toLowerCase().includes("ionq")
          ? "ionq"
          : device.provider.toLowerCase().includes("rigetti")
            ? "rigetti"
            : device.provider.toLowerCase().includes("iqm")
              ? "iqm"
              : device.name.toLowerCase().includes("ocelot")
                ? "ocelot"
                : device.name.toLowerCase().includes("dm1")
                  ? "dm1"
                  : "sv1"

      const res = await fetch("/api/braket/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocol: selectedProtocol,
          backend: backendKey,
          qubits: Math.min(device.qubits, selectedProtocol === "aeterna_porta" ? 120 : device.qubits),
          shots: selectedProtocol === "aeterna_porta" ? 100000 : 8192,
          dry_run: true,
        }),
      })
      if (res.ok) {
        const result = await res.json()
        setSubmitResult(result)
        setActiveTab("submit")
      }
    } catch (err) {
      console.error("Submit failed:", err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <p className="text-orange-400 font-mono text-sm">Connecting to Amazon Braket...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-400">Failed to load Braket device catalog</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-orange-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/30 via-black to-amber-950/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-1/3 w-48 h-48 bg-amber-500/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-orange-400/70 text-sm mb-4">
            <Link href="/" className="hover:text-orange-400">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/ide-platform/integrations" className="hover:text-orange-400">Integrations</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-orange-400">Amazon Braket</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
                    Amazon Braket × DNA-Lang
                  </h1>
                  <p className="text-orange-400/70 text-sm font-mono">DNA::{"}{"}::lang v51.843 — Sovereign Quantum Middleware</p>
                </div>
              </div>
              <p className="text-zinc-400 max-w-2xl mt-4">
                {data.value_proposition.headline}
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                {data.summary.online_devices} Devices Online
              </Badge>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                {data.summary.total_qubits_available} Qubits
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                {(data.summary.avg_dnalang_compatibility * 100).toFixed(0)}% Compatible
              </Badge>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            {[
              { label: "Braket Devices", value: data.summary.total_devices, icon: Cpu },
              { label: "Total Qubits", value: data.summary.total_qubits_available, icon: Atom },
              { label: "Adapters Deployed", value: data.summary.adapters_deployed, icon: GitBranch },
              { label: "Protocols", value: data.summary.protocols_available, icon: Layers },
              { label: "AWS Endpoints", value: data.aws_infrastructure.lambda_endpoints, icon: Network },
            ].map((stat) => (
              <div key={stat.label} className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-3">
                <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                  <stat.icon className="w-3 h-3" />
                  {stat.label}
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-1 mt-6 border-b border-zinc-800 pb-0">
          {(["devices", "architecture", "submit", "value"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === tab
                  ? "bg-zinc-800/80 text-orange-400 border border-zinc-700 border-b-transparent -mb-px"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
              }`}
            >
              {tab === "devices" && "🔧 Devices"}
              {tab === "architecture" && "🏗️ Architecture"}
              {tab === "submit" && "🚀 Circuit Compiler"}
              {tab === "value" && "💰 Value Proposition"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* DEVICES TAB */}
        {activeTab === "devices" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Braket Device Catalog — DNA-Lang Compatibility</h2>
              <button onClick={fetchDevices} className="flex items-center gap-2 text-zinc-400 hover:text-orange-400 text-sm">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            <div className="grid gap-4">
              {data.devices.map((device) => (
                <GlassCard
                  key={device.id}
                  className={`p-0 overflow-hidden cursor-pointer transition-all hover:border-orange-500/40 ${
                    selectedDevice?.id === device.id ? "border-orange-500/60 ring-1 ring-orange-500/20" : ""
                  }`}
                  onClick={() => setSelectedDevice(selectedDevice?.id === device.id ? null : device)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                          techColors[device.technology] || "text-zinc-400 bg-zinc-800 border-zinc-700"
                        }`}>
                          {device.technology === "Neutral Atom" ? <Atom className="w-5 h-5" /> :
                           device.technology === "Trapped Ion" ? <Zap className="w-5 h-5" /> :
                           device.technology.includes("Simulator") ? <Terminal className="w-5 h-5" /> :
                           device.technology === "Cat Qubit (Bosonic)" ? <Target className="w-5 h-5" /> :
                           <Cpu className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{device.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-zinc-500">
                            <span>{device.provider}</span>
                            <span>•</span>
                            <span>{device.technology}</span>
                            <span>•</span>
                            <span>{device.qubits} qubits</span>
                            <span>•</span>
                            <span>{device.region}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[device.status] || statusColors.OFFLINE}>
                          {device.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm text-zinc-400">DNA-Lang Score</div>
                          <div className={`text-xl font-bold ${
                            device.dnalang_compatibility.score >= 0.95 ? "text-emerald-400" :
                            device.dnalang_compatibility.score >= 0.90 ? "text-orange-400" :
                            "text-yellow-400"
                          }`}>
                            {(device.dnalang_compatibility.score * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compatibility bar */}
                    <div className="mt-4">
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            device.dnalang_compatibility.score >= 0.95
                              ? "bg-gradient-to-r from-emerald-500 to-green-400"
                              : device.dnalang_compatibility.score >= 0.90
                                ? "bg-gradient-to-r from-orange-500 to-amber-400"
                                : "bg-gradient-to-r from-yellow-500 to-yellow-400"
                          }`}
                          style={{ width: `${device.dnalang_compatibility.score * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Adapter chips */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {device.dnalang_compatibility.adapters.map((adapter) => (
                        <span key={adapter} className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {adapter}
                        </span>
                      ))}
                      {device.dnalang_compatibility.tested && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Hardware Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {selectedDevice?.id === device.id && (
                    <div className="border-t border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Gate Fidelity</div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-400">Single-qubit</span>
                              <span className="text-white font-mono">{device.gate_fidelity.single}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-400">Two-qubit</span>
                              <span className="text-white font-mono">{device.gate_fidelity.two}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Coherence</div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-400">T1</span>
                              <span className="text-white font-mono">{device.t1_us ? `${device.t1_us} µs` : "N/A"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-400">T2</span>
                              <span className="text-white font-mono">{device.t2_us ? `${device.t2_us} µs` : "N/A"}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Connectivity</div>
                          <p className="text-sm text-zinc-300">{device.connectivity}</p>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">DNA-Lang Integration Notes</div>
                        <p className="text-sm text-zinc-300">{device.dnalang_compatibility.notes}</p>
                      </div>

                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Supported Protocols</div>
                        <div className="flex flex-wrap gap-1.5">
                          {device.dnalang_compatibility.protocols.map((p) => (
                            <span key={p} className="text-xs px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <QuantumButton
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSubmit(device)
                          }}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 mr-2" />
                          )}
                          Compile Circuit for {device.name}
                        </QuantumButton>
                        <select
                          value={selectedProtocol}
                          onChange={(e) => setSelectedProtocol(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-orange-500/50"
                        >
                          <option value="bell_state">Bell State</option>
                          <option value="aeterna_porta">Aeterna Porta (120q)</option>
                          <option value="er_epr_witness">ER=EPR Witness</option>
                          <option value="theta_sweep">Theta Sweep</option>
                          <option value="correlated_decode_256">Correlated Decode 256</option>
                        </select>
                      </div>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* ARCHITECTURE TAB */}
        {activeTab === "architecture" && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold">Integration Architecture</h2>
            <p className="text-zinc-400">
              DNA-Lang provides a sovereign middleware layer between Amazon Braket hardware and quantum applications —
              the layer that Braket doesn&apos;t have natively.
            </p>

            <div className="space-y-4">
              {data.integration_architecture.layers.map((layer, i) => (
                <div key={layer.layer} className="relative">
                  {i < data.integration_architecture.layers.length - 1 && (
                    <div className="absolute left-8 top-full w-px h-4 bg-gradient-to-b from-orange-500/30 to-transparent z-10" />
                  )}
                  <GlassCard className={`p-5 ${
                    layer.layer.includes("DNA-Lang") ? "border-orange-500/40 bg-orange-500/5" : ""
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        layer.layer.includes("DNA-Lang")
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{layer.layer}</h3>
                          {layer.layer.includes("DNA-Lang") && (
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 text-xs">
                              This is what we provide
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400 mb-3">{layer.role}</p>
                        <div className="flex flex-wrap gap-2">
                          {layer.components.map((comp) => (
                            <span key={comp} className={`text-xs px-2.5 py-1 rounded-full border ${
                              layer.layer.includes("DNA-Lang")
                                ? "bg-orange-500/10 text-orange-300 border-orange-500/20"
                                : "bg-zinc-800 text-zinc-400 border-zinc-700"
                            }`}>
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>

            {/* AWS Infrastructure */}
            <GlassCard className="p-5 mt-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                Live AWS Infrastructure
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-1">API Gateway</div>
                  <code className="text-xs text-orange-400 break-all">{data.aws_infrastructure.api_gateway}</code>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-1">S3 Bucket</div>
                  <code className="text-xs text-orange-400 break-all">{data.aws_infrastructure.s3_bucket}</code>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-1">DynamoDB</div>
                  <code className="text-xs text-orange-400 break-all">{data.aws_infrastructure.dynamodb_table}</code>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-1">Lambda Endpoints</div>
                  <span className="text-xl font-bold text-white">{data.aws_infrastructure.lambda_endpoints}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* SUBMIT TAB */}
        {activeTab === "submit" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Circuit Compiler — DNA-Lang → Braket IR</h2>
            <p className="text-zinc-400">
              Select a device from the Devices tab and click &quot;Compile Circuit&quot; to generate Braket-compatible circuit IR with DNA-Lang error suppression built in.
            </p>

            {submitResult ? (
              <div className="space-y-4">
                <GlassCard className="p-5 border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-emerald-400">Circuit Compiled Successfully</h3>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                      {submitResult.status}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-zinc-500">Backend</div>
                      <div className="text-sm font-mono text-white">{String(submitResult.submission.backend || submitResult.estimated_cost.backend)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Protocol</div>
                      <div className="text-sm font-mono text-orange-400">{String(submitResult.submission.protocol || "")}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Estimated Cost</div>
                      <div className="text-sm font-mono text-white">${submitResult.estimated_cost.estimated_usd}</div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-orange-400" />
                    OpenQASM 3.0 Output
                  </h3>
                  <pre className="bg-black rounded-lg p-4 overflow-x-auto text-xs text-green-400 font-mono max-h-96 overflow-y-auto border border-zinc-800">
                    {submitResult.circuit.braketIR.source}
                  </pre>
                </GlassCard>

                <GlassCard className="p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-400" />
                    DNA-Lang Enhancements (Built into Circuit)
                  </h3>
                  <pre className="bg-black rounded-lg p-4 overflow-x-auto text-xs text-orange-300 font-mono max-h-64 overflow-y-auto border border-zinc-800">
                    {JSON.stringify(submitResult.dnalang_enhancements, null, 2)}
                  </pre>
                </GlassCard>
              </div>
            ) : (
              <GlassCard className="p-12 text-center">
                <Cloud className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500 mb-2">No circuit compiled yet</p>
                <p className="text-zinc-600 text-sm">
                  Go to the Devices tab, select a backend, and click &quot;Compile Circuit&quot;
                </p>
                <button onClick={() => setActiveTab("devices")} className="mt-4 text-orange-400 text-sm hover:underline">
                  → Go to Devices
                </button>
              </GlassCard>
            )}
          </div>
        )}

        {/* VALUE PROPOSITION TAB */}
        {activeTab === "value" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
                Why Amazon Needs DNA-Lang
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Braket provides the hardware. DNA-Lang provides the intelligence layer that makes it work.
              </p>
            </div>

            {/* The Gap */}
            <GlassCard className="p-6 border-red-500/20">
              <h3 className="text-lg font-semibold text-red-400 mb-4">The Gap in Braket Today</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    problem: "No backend-agnostic error suppression",
                    detail: "Each QPU requires custom error mitigation. Customers must rewrite for every backend switch.",
                  },
                  {
                    problem: "No real-time quality oracle",
                    detail: "No way to know if a circuit will succeed before running 100k shots. Customers waste QPU time on doomed experiments.",
                  },
                  {
                    problem: "No self-improving circuits",
                    detail: "Circuits are static. No evolutionary optimization. No organism-based circuit adaptation.",
                  },
                ].map((gap) => (
                  <div key={gap.problem} className="bg-red-500/5 rounded-lg p-4 border border-red-500/10">
                    <div className="text-sm font-semibold text-red-400 mb-2">{gap.problem}</div>
                    <p className="text-xs text-zinc-400">{gap.detail}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* DNA-Lang Fills the Gap */}
            <div className="space-y-4">
              {data.value_proposition.differentiators.map((diff, i) => (
                <GlassCard key={i} className="p-5 hover:border-orange-500/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-400 mb-1">{diff.claim}</h4>
                      <p className="text-sm text-zinc-400">{diff.detail}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Competitive Matrix */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Competitive Positioning</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-2 px-3 text-zinc-500">Capability</th>
                      <th className="text-center py-2 px-3 text-orange-400">DNA-Lang + Braket</th>
                      <th className="text-center py-2 px-3 text-zinc-500">Braket Alone</th>
                      <th className="text-center py-2 px-3 text-zinc-500">IBM Qiskit</th>
                      <th className="text-center py-2 px-3 text-zinc-500">Google Cirq</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Backend-agnostic circuits", true, false, false, false],
                      ["Real-time quality oracle (CCCE)", true, false, false, false],
                      ["Self-evolving organisms", true, false, false, false],
                      ["256-atom correlated decoder", true, false, false, false],
                      ["Quantum Zeno error suppression", true, false, false, false],
                      ["Cross-provider error correction", true, false, false, false],
                      ["OpenQASM 3.0 compilation", true, true, true, false],
                      ["Consciousness-aware metrics", true, false, false, false],
                      ["Live attestation ledger", true, false, false, false],
                      ["Zero vendor lock-in", true, false, false, false],
                    ].map(([feature, ...vals]) => (
                      <tr key={String(feature)} className="border-b border-zinc-800/50">
                        <td className="py-2 px-3 text-zinc-300">{String(feature)}</td>
                        {vals.map((v, j) => (
                          <td key={j} className="text-center py-2 px-3">
                            {v ? (
                              <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* The Ask */}
            <GlassCard className="p-8 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-orange-400 mb-4">Partnership Opportunity</h3>
                <p className="text-zinc-300 max-w-xl mx-auto mb-6">
                  DNA-Lang becomes the default middleware layer for Amazon Braket.
                  Every Braket customer gets better results. Amazon gets competitive differentiation.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1">Integration</div>
                    <div className="font-semibold text-white">Braket SDK Plugin</div>
                    <p className="text-xs text-zinc-400 mt-1">pip install amazon-braket-dnalang</p>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1">Revenue Model</div>
                    <div className="font-semibold text-white">Per-shot CCCE fee</div>
                    <p className="text-xs text-zinc-400 mt-1">$0.001/shot quality oracle surcharge</p>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                    <div className="text-xs text-zinc-500 mb-1">CAGE Code</div>
                    <div className="font-semibold text-white">9HUP5</div>
                    <p className="text-xs text-zinc-400 mt-1">DoD supply chain registered</p>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <a href="mailto:devinphillipdavis@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors">
                    <ArrowRight className="w-4 h-4" /> Contact for Partnership
                  </a>
                  <a href="/api/braket/devices" target="_blank" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-colors">
                    <ExternalLink className="w-4 h-4" /> View API
                  </a>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  )
}
