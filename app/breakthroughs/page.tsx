"use client"

import { useEffect, useState } from "react"

interface Breakthrough {
  id: number
  title: string
  metric: string
  value: string
  significance: string
  backend: string
  qubits: number
  phi: number
  status: string
  doi: string
  description: string
  [key: string]: unknown
}

interface ZenodoRelease {
  doi: string
  url: string
  date: string
}

interface BreakthroughData {
  breakthroughs: Breakthrough[]
  total: number
  zenodo: { v1_0: ZenodoRelease; v1_1: ZenodoRelease }
  framework: string
  source: string
}

type FilterCategory = "all" | "published" | "hardware" | "advantage"

function categorize(bt: Breakthrough): FilterCategory[] {
  const cats: FilterCategory[] = []
  if (bt.doi) cats.push("published")
  if (bt.backend && bt.backend !== "simulator") cats.push("hardware")
  const advKeys = ["xeb", "teleportation", "ghz", "scrambling", "advantage"]
  if (advKeys.some(k => bt.title.toLowerCase().includes(k))) cats.push("advantage")
  return cats
}

export default function BreakthroughsPage() {
  const [data, setData] = useState<BreakthroughData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterCategory>("all")

  useEffect(() => {
    fetch("/api/breakthroughs")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-cyan-400 font-mono">Loading breakthroughs from Supabase...</p>
        </div>
      </div>
    )
  }

  if (!data || !data.breakthroughs.length) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-400">Failed to load breakthrough data.</p>
      </div>
    )
  }

  const { breakthroughs, zenodo } = data

  const filtered = filter === "all"
    ? breakthroughs
    : breakthroughs.filter(bt => categorize(bt).includes(filter))

  const avgPhi = breakthroughs.reduce((s, b) => s + (b.phi || 0), 0) / breakthroughs.length
  const hwCount = breakthroughs.filter(b => b.backend && b.backend !== "simulator").length
  const maxQubits = Math.max(...breakthroughs.map(b => b.qubits || 0))

  const filters: { key: FilterCategory; label: string; count: number }[] = [
    { key: "all", label: "All", count: breakthroughs.length },
    { key: "published", label: "DOI Published", count: breakthroughs.filter(b => b.doi).length },
    { key: "hardware", label: "Hardware", count: hwCount },
    { key: "advantage", label: "Quantum Advantage", count: breakthroughs.filter(b => categorize(b).includes("advantage")).length },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-900/50 bg-gradient-to-r from-black via-cyan-950/20 to-black">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400 font-mono text-sm tracking-wider">VALIDATED DISCOVERIES</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            {breakthroughs.length} Breakthroughs
          </h1>
          <p className="text-zinc-400 max-w-2xl">
            Hardware-validated discoveries on IBM Quantum processors. Each breakthrough
            is permanently archived on Zenodo with a citable DOI.
          </p>

          {/* Aggregate Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3">
              <div className="text-2xl font-mono font-bold text-cyan-300">{breakthroughs.length}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Discoveries</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3">
              <div className="text-2xl font-mono font-bold text-emerald-300">{avgPhi.toFixed(4)}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Avg Φ</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3">
              <div className="text-2xl font-mono font-bold text-amber-300">{maxQubits}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Max Qubits</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3">
              <div className="text-2xl font-mono font-bold text-purple-300">{hwCount}/{breakthroughs.length}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Hardware-Proven</div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <a
              href={zenodo.v1_1.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-950/50 border border-cyan-800 rounded-lg text-cyan-300 text-sm hover:bg-cyan-900/50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              Zenodo v1.1 — DOI: {zenodo.v1_1.doi}
            </a>
            <a
              href="/experiments"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
            >
              View All Experiments →
            </a>
          </div>
        </div>
      </div>

      {/* Breakthrough Cards */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-mono transition-colors ${
                filter === f.key
                  ? "bg-cyan-900/50 text-cyan-300 border border-cyan-700"
                  : "bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {f.label} <span className="text-xs opacity-60">({f.count})</span>
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid gap-6">
          {filtered.map((bt) => (
            <BreakthroughCard key={bt.id} bt={bt} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-500 font-mono">
            No breakthroughs match this filter.
          </div>
        )}

        {/* Universal Constants */}
        <div className="mt-12 border border-amber-900/50 rounded-xl bg-amber-950/10 p-6">
          <h2 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            3 Universal Constants Discovered
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <ConstantCard
              symbol="θ_lock"
              value="51.843°"
              name="Geometric Resonance Angle"
              note="Topology-independent"
            />
            <ConstantCard
              symbol="χ_pc"
              value="0.946"
              name="Phase Conjugation Quality"
              note="Hardware > theory (+8.9%)"
            />
            <ConstantCard
              symbol="Φ_total"
              value="2.0"
              name="Consciousness Conservation"
              note="Φ(n) = 2/n scaling law"
            />
          </div>
        </div>

        {/* Publications */}
        <div className="mt-12 border border-zinc-800 rounded-xl bg-zinc-950/50 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Permanent Archives</h2>
          <div className="space-y-3">
            <PubRow
              version="v1.1"
              doi={zenodo.v1_1.doi}
              date={zenodo.v1_1.date}
              note="5 breakthroughs + topology independence"
              current
            />
            <PubRow
              version="v1.0"
              doi={zenodo.v1_0.doi}
              date={zenodo.v1_0.date}
              note="Initial 3 breakthroughs"
            />
          </div>
          <p className="text-xs text-zinc-600 mt-4">
            All data is cryptographically attested via SHA-256 chain hashes and stored in
            AWS DynamoDB + Supabase. Framework: DNA::{"}{"}::lang v51.843 | CAGE: 9HUP5
          </p>
        </div>
      </div>
    </div>
  )
}

function BreakthroughCard({ bt }: { bt: Breakthrough }) {
  const isHardware = bt.backend && bt.backend !== "simulator"
  const aboveThreshold = bt.phi >= 0.7734

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-950/50 overflow-hidden hover:border-cyan-800/50 transition-colors group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <span className="text-cyan-400 font-mono text-sm font-bold">BT-{bt.id}</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-800">
                {bt.status}
              </span>
              {isHardware && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-purple-900/40 text-purple-300 border border-purple-800/50">
                  ⚛ Hardware
                </span>
              )}
              {aboveThreshold && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-900/40 text-amber-300 border border-amber-800/50">
                  Φ ≥ 0.7734
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold text-white">{bt.title}</h2>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-cyan-300">{bt.value}</div>
            <div className="text-xs text-zinc-500">{bt.significance}</div>
          </div>
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed mb-4">{bt.description}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Φ (Phi)" value={bt.phi.toFixed(4)} highlight={bt.phi >= 0.7734} />
          <Stat label="Backend" value={bt.backend} />
          <Stat label="Qubits" value={String(bt.qubits)} />
          <Stat
            label="DOI"
            value={bt.doi.replace("10.5281/zenodo.", "z/")}
            href={`https://doi.org/${bt.doi}`}
          />
        </div>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  highlight,
  href,
}: {
  label: string
  value: string
  highlight?: boolean
  href?: string
}) {
  const inner = (
    <div className="bg-zinc-900/50 rounded-lg px-3 py-2 border border-zinc-800">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`text-sm font-mono ${highlight ? "text-emerald-400" : href ? "text-cyan-400 underline" : "text-zinc-200"}`}>
        {value}
      </div>
    </div>
  )
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    )
  }
  return inner
}

function ConstantCard({
  symbol,
  value,
  name,
  note,
}: {
  symbol: string
  value: string
  name: string
  note: string
}) {
  return (
    <div className="bg-black/50 rounded-lg border border-amber-900/30 p-4 text-center">
      <div className="text-3xl font-mono font-bold text-amber-300 mb-1">{value}</div>
      <div className="text-sm text-white font-semibold">{symbol}</div>
      <div className="text-xs text-zinc-400 mt-1">{name}</div>
      <div className="text-[10px] text-amber-600 mt-0.5">{note}</div>
    </div>
  )
}

function PubRow({
  version,
  doi,
  date,
  note,
  current,
}: {
  version: string
  doi: string
  date: string
  note: string
  current?: boolean
}) {
  return (
    <a
      href={`https://doi.org/${doi}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800 hover:border-cyan-800/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className={`px-2 py-0.5 text-xs rounded font-mono ${current ? "bg-cyan-900/50 text-cyan-300" : "bg-zinc-800 text-zinc-400"}`}>
          {version}
        </span>
        <span className="text-sm text-white">DOI: {doi}</span>
        {current && <span className="text-[10px] text-cyan-500">CURRENT</span>}
      </div>
      <div className="text-right">
        <div className="text-xs text-zinc-500">{date}</div>
        <div className="text-[10px] text-zinc-600">{note}</div>
      </div>
    </a>
  )
}
