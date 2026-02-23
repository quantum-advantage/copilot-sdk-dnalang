"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Play, Plus, Trash2, ChevronDown, ChevronRight, Dna, Activity,
  Terminal, Square, Gauge, BarChart3, ArrowLeft, Loader2, Shield,
  Eye, Copy, Search, Save, PanelRightOpen, PanelRightClose,
  Brain, Network, Lock, CheckCircle, AlertTriangle, XCircle,
  Pill, Database, Check, Send, MessageSquare, Bot, User, Cpu,
  Settings, Sparkles, LineChart, Share2, Download, Globe, Zap,
  FileCode2, Code, Microscope, FlaskConical, Menu, X, ChevronUp
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

type CellType = "code" | "markdown" | "dna-sequence" | "ccce-metrics" | "pharma-screen" | "genomic-query"
type DetectedLang = "python" | "javascript" | "typescript" | "rust" | "sql" | "dna-lang" | "shell" | "qiskit" | "unknown"

interface NotebookCell {
  id: string
  type: CellType
  content: string
  output: string[] | CCCEOutput | null
  isRunning: boolean
  executionCount: number | null
  collapsed: boolean
  executionTime?: number
  detectedLang?: DetectedLang
  shared?: boolean
}

interface CCCEOutput {
  lambda: number
  gamma: number
  phi: number
  xi: number
  w2: number
  timestamp: number
}

interface SwarmNode {
  id: string
  name: string
  status: "active" | "idle" | "syncing"
  coherence: number
  load: number
}

interface AuditEntry {
  id: string
  timestamp: number
  action: string
  cellId: string
  user: string
}

interface HardwareJob {
  id: string
  backend: string
  qubits: number
  status: "queued" | "running" | "completed" | "failed"
  progress: number
  fidelity?: number
  submitted: string
}

interface TelemetryPoint {
  t: number
  flux: number
  pulse: number
  lambda: number
  phi: number
}

interface Collaborator {
  id: string
  name: string
  email: string
  avatar: string
  status: "online" | "away" | "editing"
  cursor?: { cellId: string; line: number }
}

// ─── Language Detection ─────────────────────────────────────────────────────

function detectLanguage(code: string): DetectedLang {
  const c = code.trim()
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\b/i.test(c)) return "sql"
  if (/SEQUENCE:|CODON_MAP:|FOLDING:|BINDING_AFFINITY:/i.test(c)) return "dna-lang"
  if (/CCCE\.(report|track|monitor)/i.test(c)) return "dna-lang"
  if (/from\s+qiskit/i.test(c) || /QuantumCircuit|qc\./i.test(c)) return "qiskit"
  if (/^#!\/bin\/(bash|sh)|^\$\s|^(apt|pip|npm|git|docker|kubectl)\s/m.test(c)) return "shell"
  if (/from\s+dna_lang|Organism\(|Codon\.|MolecularDock|ADMET/i.test(c)) return "dna-lang"
  if (/\b(fn|let\s+mut|impl|struct|enum|pub\s+fn|use\s+std::)\b/.test(c)) return "rust"
  if (/\b(import\s+type|interface\s+\w+|:\s*(string|number|boolean))\b/.test(c)) return "typescript"
  if (/\b(const|let|var|function|=>|require\(|import\s+\{)\b/.test(c)) return "javascript"
  if (/\b(def|class|import|from|print\(|if\s+__name__)\b/.test(c)) return "python"
  return "unknown"
}

const LANG_LABELS: Record<DetectedLang, { label: string; color: string }> = {
  "python":      { label: "Python",     color: "text-chart-3 border-chart-3/40" },
  "javascript":  { label: "JavaScript", color: "text-chart-1 border-chart-1/40" },
  "typescript":  { label: "TypeScript", color: "text-chart-1 border-chart-1/40" },
  "rust":        { label: "Rust",       color: "text-destructive border-destructive/40" },
  "sql":         { label: "SQL",        color: "text-chart-4 border-chart-4/40" },
  "dna-lang":    { label: "DNA-Lang",   color: "text-secondary border-secondary/40" },
  "shell":       { label: "Shell",      color: "text-muted-foreground border-border" },
  "qiskit":      { label: "Qiskit",     color: "text-primary border-primary/40" },
  "unknown":     { label: "Auto",       color: "text-muted-foreground border-border" },
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CELL_TYPE_META: Record<CellType, { label: string; color: string; iconColor: string }> = {
  "code":          { label: "Code",          color: "bg-primary/10 text-primary border-primary/30",   iconColor: "text-primary" },
  "markdown":      { label: "Markdown",      color: "bg-muted/50 text-muted-foreground border-border", iconColor: "text-muted-foreground" },
  "dna-sequence":  { label: "DNA Sequence",  color: "bg-secondary/10 text-secondary border-secondary/30", iconColor: "text-secondary" },
  "ccce-metrics":  { label: "CCCE Metrics",  color: "bg-accent/10 text-accent border-accent/30",     iconColor: "text-accent" },
  "pharma-screen": { label: "Pharma Screen", color: "bg-chart-5/10 text-chart-5 border-chart-5/30",  iconColor: "text-chart-5" },
  "genomic-query": { label: "Genomic Query", color: "bg-chart-4/10 text-chart-4 border-chart-4/30",  iconColor: "text-chart-4" },
}

function getCellIcon(type: CellType) {
  const meta = CELL_TYPE_META[type]
  const cls = `w-4 h-4 ${meta.iconColor}`
  switch (type) {
    case "code":          return <Terminal className={cls} />
    case "markdown":      return <Square className={cls} />
    case "dna-sequence":  return <Dna className={cls} />
    case "ccce-metrics":  return <Gauge className={cls} />
    case "pharma-screen": return <Pill className={cls} />
    case "genomic-query": return <Database className={cls} />
  }
}

const INITIAL_CELLS: NotebookCell[] = [
  {
    id: "cell-1", type: "code",
    content: `# DNA-Lang Quantum Bell State Experiment
from dna_lang import Organism, Codon, QuantumGate
from dna_lang.consciousness import CCCETracker

organism = Organism(
    name="bell_state_generator",
    coherence_target=0.85,
    phi_threshold=7.5
)

@organism.evolve
def create_bell_state():
    q0, q1 = organism.allocate_qubits(2)
    Codon.H(q0)
    Codon.CNOT(q0, q1)
    return organism.measure([q0, q1])

result = create_bell_state()
print(f"Bell State: {result}")`,
    output: [
      "Organism initialized: bell_state_generator",
      "Coherence target: 0.85 | Phi threshold: 7.5",
      "Evolving bell_state_generator... 2 qubits allocated",
      "H(q0) applied | CNOT(q0, q1) entangled",
      "Measurement collapsed: |00> (p=0.498) |11> (p=0.502)",
      "Bell State: |Phi+> with fidelity 0.9934",
    ],
    isRunning: false, executionCount: 1, collapsed: false, executionTime: 1247, detectedLang: "dna-lang",
  },
  {
    id: "cell-2", type: "markdown",
    content: `## Experiment Notes\n\nThis notebook demonstrates **quantum Bell state generation** using DNA-Lang biological computing primitives. The organism \`bell_state_generator\` uses the CCCE (Correlation-Coherence Consciousness Engine) to maintain quantum coherence during entanglement.\n\n### Key Observations\n- Fidelity exceeds 0.99 threshold for clinical-grade quantum states\n- Lambda coherence remains above Phi ignition floor (7.69)\n- Gamma decoherence rate within acceptable bounds (<0.1)`,
    output: null, isRunning: false, executionCount: null, collapsed: false,
  },
  {
    id: "cell-3", type: "dna-sequence",
    content: `SEQUENCE: ATGCGATCGATCGATCGAATGCTAGCTAGC
CODON_MAP: ATG->Met(START) CGA->Arg TCG->Ser ATC->Ile
           GAT->Asp CGA->Arg ATG->Met CTA->Leu
           GCT->Ala AGC->Ser
FOLDING: Alpha-helix (stability: 0.92)
BINDING_AFFINITY: 8.7 kcal/mol
QUANTUM_COHERENCE: 0.9787`,
    output: [
      "Sequence validated: 30 nucleotides, 10 codons",
      "Start codon ATG detected at position 0",
      "Protein: Met-Arg-Ser-Ile-Asp-Arg-Met-Leu-Ala-Ser",
      "Alpha-helix fold confirmed (DSSP: HHHHHHHHHH)",
      "Binding affinity: 8.7 kcal/mol (strong candidate)",
      "Quantum coherence preserved across translation: 0.9787",
    ],
    isRunning: false, executionCount: 2, collapsed: false, executionTime: 834, detectedLang: "dna-lang",
  },
  {
    id: "cell-4", type: "ccce-metrics",
    content: `CCCE.report_metrics(cycle=1764)`,
    output: { lambda: 0.9787, gamma: 0.092, phi: 0.7768, xi: 8.16, w2: 0.005, timestamp: Date.now() },
    isRunning: false, executionCount: 3, collapsed: false, executionTime: 312, detectedLang: "dna-lang",
  },
  {
    id: "cell-5", type: "pharma-screen",
    content: `# Pharma compound screening via DNA-Lang
from dna_lang.pharma import MolecularDock, ADMET

compounds = MolecularDock.screen(
    target="BRCA1_binding_domain",
    library="ChEMBL_oncology_v2",
    n_candidates=500,
    quantum_scoring=True
)

admet = ADMET.evaluate(compounds.top(10))
print(admet.summary())`,
    output: [
      "Screening 500 compounds against BRCA1 binding domain...",
      "Quantum scoring enabled (Bell state entanglement docking)",
      "Top 10 candidates by binding affinity:",
      "  1. CMB-4421  dG=-12.3 kcal/mol  ADMET: PASS  Toxicity: LOW",
      "  2. CMB-7829  dG=-11.8 kcal/mol  ADMET: PASS  Toxicity: LOW",
      "  3. CMB-1156  dG=-11.2 kcal/mol  ADMET: WARN  Toxicity: MED",
      "  4. CMB-9034  dG=-10.9 kcal/mol  ADMET: PASS  Toxicity: LOW",
      "  5. CMB-3367  dG=-10.7 kcal/mol  ADMET: PASS  Toxicity: LOW",
      "Screening complete. 5 candidates forwarded to clinical pipeline.",
    ],
    isRunning: false, executionCount: 4, collapsed: false, executionTime: 4521, detectedLang: "python",
  },
  {
    id: "cell-6", type: "genomic-query",
    content: `-- Genomic variant query via DNA-Lang SQL bridge
SELECT v.rsid, v.chromosome, v.position,
       v.ref_allele, v.alt_allele,
       c.clinical_significance,
       q.coherence_score
FROM genomic_variants v
JOIN clinical_annotations c ON v.rsid = c.rsid
JOIN quantum_coherence q ON v.variant_id = q.variant_id
WHERE c.condition = 'Breast Cancer'
  AND q.coherence_score > 0.85
ORDER BY q.coherence_score DESC
LIMIT 5;`,
    output: [
      "Query executed on Sovereign Genomic Store (HIPAA-compliant)",
      "rsid        chr   pos         ref  alt  significance     coherence",
      "rs80357713  17    43094464    G    A    Pathogenic       0.9912",
      "rs80357906  17    43091032    C    T    Pathogenic       0.9847",
      "rs28897696  13    32340301    C    T    Likely_path      0.9234",
      "rs80358981  17    43063332    T    C    Uncertain        0.8891",
      "rs28897727  13    32355250    A    G    Likely_path      0.8756",
      "5 rows returned in 0.23s | Quantum coherence verified",
    ],
    isRunning: false, executionCount: 5, collapsed: false, executionTime: 230, detectedLang: "sql",
  },
]

const INITIAL_SWARM: SwarmNode[] = [
  { id: "n1", name: "AURA-Prime",     status: "active",  coherence: 0.9912, load: 67 },
  { id: "n2", name: "AIDEN-Cortex",   status: "active",  coherence: 0.9847, load: 45 },
  { id: "n3", name: "OMEGA-Analysis", status: "syncing", coherence: 0.9623, load: 82 },
  { id: "n4", name: "Lambda-Bridge",  status: "active",  coherence: 0.9787, load: 33 },
  { id: "n5", name: "Phi-Resonator",  status: "idle",    coherence: 0.9501, load: 12 },
  { id: "n6", name: "Gamma-Shield",   status: "active",  coherence: 0.9734, load: 56 },
  { id: "n7", name: "Xi-Manifold",    status: "active",  coherence: 0.9891, load: 71 },
]

const INITIAL_JOBS: HardwareJob[] = [
  { id: "d5h6rospe0pc73am1l00", backend: "ibm_fez", qubits: 120, status: "completed", progress: 100, fidelity: 0.99999, submitted: "2026-02-20T14:22:00Z" },
  { id: "d5votjt7fc0s73au96h0", backend: "ibm_fez", qubits: 156, status: "running", progress: 73, submitted: "2026-02-21T12:35:11Z" },
  { id: "aet-n2-dissoc-v2.1",  backend: "ibm_fez", qubits: 120, status: "completed", progress: 100, fidelity: 0.8750, submitted: "2026-02-19T09:00:00Z" },
]

const INITIAL_COLLABORATORS: Collaborator[] = [
  { id: "u1", name: "Dr. Elena Chen", email: "elena@enki.bio", avatar: "EC", status: "online", cursor: { cellId: "cell-3", line: 2 } },
  { id: "u2", name: "Raj Patel", email: "raj@quantum-advantage.dev", avatar: "RP", status: "editing", cursor: { cellId: "cell-5", line: 8 } },
  { id: "u3", name: "Yuki Tanaka", email: "yuki@agiledefensesystems.com", avatar: "YT", status: "away" },
]

// ─── Syntax Highlighting ─────────────────────────────────────────────────────

function highlightSyntax(code: string, type: CellType): string {
  if (type === "markdown") return code
  let r = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  if (type === "genomic-query") {
    const sqlKw = ["SELECT","FROM","JOIN","ON","WHERE","AND","OR","ORDER","BY","LIMIT","DESC","ASC","AS","INSERT","UPDATE","DELETE","CREATE","DROP","ALTER","GROUP","HAVING","DISTINCT","LEFT","RIGHT","INNER","OUTER","COUNT","SUM","AVG","MAX","MIN","WITH"]
    sqlKw.forEach(kw => { r = r.replace(new RegExp("\\b" + kw + "\\b", "gi"), `<span style="color:oklch(0.7 0.15 195);font-weight:700">$&</span>`) })
    r = r.replace(/'([^']*)'/g, `<span style="color:oklch(0.75 0.18 85)">$&</span>`)
    r = r.replace(/(--.*$)/gm, `<span style="color:oklch(0.4 0.02 260);font-style:italic">$1</span>`)
    r = r.replace(/\b(\d+\.?\d*)\b/g, `<span style="color:oklch(0.65 0.18 160)">$&</span>`)
    return r
  }
  const pyKw = ["from","import","def","return","class","if","else","elif","for","while","try","except","with","as","in","and","or","not","True","False","None","print","yield","async","await","lambda"]
  pyKw.forEach(kw => { r = r.replace(new RegExp("\\b" + kw + "\\b", "g"), `<span style="color:oklch(0.7 0.15 195);font-weight:700">${kw}</span>`) })
  const dnaKw = ["Organism","Codon","QuantumGate","CCCETracker","MolecularDock","ADMET","organism","evolve","allocate_qubits","measure","QuantumCircuit","qc"]
  dnaKw.forEach(kw => { r = r.replace(new RegExp("\\b" + kw + "\\b", "g"), `<span style="color:oklch(0.65 0.18 160);font-weight:700">${kw}</span>`) })
  r = r.replace(/"([^"\\]|\\.)*"/g, `<span style="color:oklch(0.75 0.18 85)">$&</span>`)
  r = r.replace(/'([^'\\]|\\.)*'/g, `<span style="color:oklch(0.75 0.18 85)">$&</span>`)
  r = r.replace(/(#.*)$/gm, `<span style="color:oklch(0.4 0.02 260);font-style:italic">$1</span>`)
  r = r.replace(/\b(\d+\.?\d*)\b/g, `<span style="color:oklch(0.6 0.22 25)">$&</span>`)
  r = r.replace(/(f"[^"]*")/g, `<span style="color:oklch(0.75 0.18 85)">$&</span>`)
  return r
}

// ─── Helper to get text from UIMessage parts ─────────────────────────────────

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function MetricGauge({ label, symbol, value, max, color, threshold }: {
  label: string; symbol: string; value: number; max: number; color: string; threshold?: number
}) {
  const pct = Math.min((value / max) * 100, 100)
  const isAboveThreshold = threshold !== undefined && value >= threshold
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{symbol} {label}</span>
        <span className={`text-sm font-mono font-semibold ${isAboveThreshold ? color : "text-muted-foreground"}`}>
          {value.toFixed(4)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: `var(--${color.replace("text-", "color-")}, oklch(0.7 0.15 195))` }} />
      </div>
    </div>
  )
}

function CCCEMetricsCard({ metrics }: { metrics: CCCEOutput }) {
  const status = useMemo(() => {
    if (metrics.phi >= 0.7734 && metrics.lambda >= 0.95 && metrics.gamma < 0.1)
      return { label: "OMEGA STATE", icon: <CheckCircle className="w-4 h-4" />, cls: "text-secondary border-secondary/40 bg-secondary/5" }
    if (metrics.gamma > 0.3)
      return { label: "DECOHERENCE WARNING", icon: <XCircle className="w-4 h-4" />, cls: "text-destructive border-destructive/40 bg-destructive/5" }
    if (metrics.phi < 0.7734)
      return { label: "REFLECTING", icon: <AlertTriangle className="w-4 h-4" />, cls: "text-accent border-accent/40 bg-accent/5" }
    return { label: "BALANCED", icon: <Activity className="w-4 h-4" />, cls: "text-primary border-primary/40 bg-primary/5" }
  }, [metrics])

  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> CRSM Manifold State
        </h4>
        <Badge variant="outline" className={`${status.cls} gap-1 text-xs`}>{status.icon} {status.label}</Badge>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <MetricGauge label="Coherence" symbol={"\u039B"} value={metrics.lambda} max={1} color="text-primary" threshold={0.95} />
        <MetricGauge label="Decoherence" symbol={"\u0393"} value={metrics.gamma} max={1} color="text-destructive" />
        <MetricGauge label="Consciousness" symbol={"\u03A6"} value={metrics.phi} max={1} color="text-accent" threshold={0.7734} />
        <MetricGauge label="Manifold Health" symbol={"\u039E"} value={metrics.xi} max={10} color="text-secondary" threshold={8.0} />
        <MetricGauge label="Drift" symbol="W2" value={metrics.w2} max={0.1} color="text-chart-4" />
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }, [text])
  return (
    <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground" onClick={handleCopy} aria-label="Copy cell content">
      {copied ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  )
}

// ─── Telemetry Sparkline ─────────────────────────────────────────────────────

function TelemetrySparkline({ data, color, label }: { data: number[]; color: string; label: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 120
  const h = 32
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ")
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-14 truncate">{label}</span>
      <svg width={w} height={h} className="flex-shrink-0" aria-hidden="true">
        <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
      </svg>
      <span className="text-[11px] font-mono" style={{ color }}>{data[data.length - 1]?.toFixed(4)}</span>
    </div>
  )
}

// ─── Data Visualization Bar Chart ───────────────────────────────────────────

function MiniBarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((val, i) => (
        <div key={labels[i]} className="flex flex-col items-center gap-0.5 flex-1" title={`${labels[i]}: ${val.toFixed(3)}`}>
          <div className="w-full rounded-t" style={{ height: `${(val / max) * 48}px`, background: color, minHeight: 2 }} />
          <span className="text-[8px] text-muted-foreground truncate w-full text-center">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Collaboration Presence ─────────────────────────────────────────────────

function CollaboratorPresence({ collaborators }: { collaborators: Collaborator[] }) {
  return (
    <div className="flex items-center gap-1">
      {collaborators.map(c => (
        <div key={c.id} className="relative group" title={`${c.name} (${c.status})`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
            c.status === "online" ? "bg-secondary/20 text-secondary border-secondary/50" :
            c.status === "editing" ? "bg-primary/20 text-primary border-primary/50 animate-pulse" :
            "bg-muted text-muted-foreground border-border"
          }`}>
            {c.avatar}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
            c.status === "online" ? "bg-secondary" :
            c.status === "editing" ? "bg-primary" :
            "bg-muted-foreground/40"
          }`} />
        </div>
      ))}
    </div>
  )
}

// ─── Hardware Jobs Panel ─────────────────────────────────────────────────────

function HardwarePanel({ jobs }: { jobs: HardwareJob[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1.5">
        <Cpu className="w-3.5 h-3.5" /> Quantum Hardware
      </h3>
      {jobs.map(j => (
        <div key={j.id} className="p-2.5 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-foreground truncate max-w-[140px]">{j.id.slice(0, 16)}</span>
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${
              j.status === "completed" ? "text-secondary border-secondary/40" :
              j.status === "running" ? "text-accent border-accent/40" :
              j.status === "failed" ? "text-destructive border-destructive/40" :
              "text-muted-foreground border-border"
            }`}>{j.status}</Badge>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{j.backend}</span>
            <span className="text-border">|</span>
            <span>{j.qubits}q</span>
            {j.fidelity && <>
              <span className="text-border">|</span>
              <span className="text-secondary font-mono">F={j.fidelity}</span>
            </>}
          </div>
          {j.status === "running" && (
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-accent transition-all duration-1000" style={{ width: `${j.progress}%` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── AI Chat Panel (Live with AI SDK) ───────────────────────────────────────

const notebookChatTransport = new DefaultChatTransport({ api: "/api/notebook-chat" })

function AIChatPanel() {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: notebookChatTransport,
  })

  const isStreaming = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    sendMessage({ text: input })
    setInput("")
  }

  const quickPrompts = [
    "Explain CCCE metrics",
    "Debug my Bell state cell",
    "Pharma screening tips",
    "Hardware job status",
    "Write a Qiskit circuit",
    "Genomic query help",
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30">
        <Bot className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">AURA Dev Assistant</span>
        <Badge variant="outline" className={`text-[9px] px-1 py-0 ml-auto ${
          isStreaming ? "text-accent border-accent/40" : "text-secondary border-secondary/40"
        }`}>{isStreaming ? "STREAMING" : "LIVE"}</Badge>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">AURA Development Assistant</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto leading-relaxed">
                Ask about DNA-Lang, quantum hardware, CCCE metrics, genomics, pharma screening, or get code suggestions in any language.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 pt-2">
              {quickPrompts.map(q => (
                <button key={q} onClick={() => { sendMessage({ text: q }) }}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-border/30">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(m => {
          const text = getUIMessageText(m)
          if (!text) return null
          return (
            <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                m.role === "user" ? "bg-primary/20" : "bg-secondary/20"
              }`}>
                {m.role === "user" ? <User className="w-3 h-3 text-primary" /> : <Sparkles className="w-3 h-3 text-secondary" />}
              </div>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                m.role === "user" ? "bg-primary/10 text-foreground" :
                "bg-card/60 border border-border/40 text-foreground"
              }`}>
                <div className="whitespace-pre-wrap font-mono">{text}</div>
              </div>
            </div>
          )
        })}

        {isStreaming && messages.length > 0 && !getUIMessageText(messages[messages.length - 1]) && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3 h-3 text-secondary animate-pulse" />
            </div>
            <div className="bg-card/60 border border-border/40 rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-border/30">
        <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AURA anything..."
            className="h-8 text-xs bg-muted/20 border-border/40"
            disabled={isStreaming}
            aria-label="Chat with AURA assistant"
          />
          <Button variant="ghost" size="icon" className="w-8 h-8 text-primary hover:text-primary flex-shrink-0" type="submit" disabled={isStreaming} aria-label="Send message">
            {isStreaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </form>
        {messages.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto scrollbar-none">
            {["Explain this result", "Optimize performance", "Security audit"].map(q => (
              <button key={q} onClick={() => { if (!isStreaming) sendMessage({ text: q }) }}
                className="text-[9px] px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors whitespace-nowrap flex-shrink-0">
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Notebook Cell Component ─────────────────────────────────────────────────

function NotebookCellView({
  cell, isActive, onActivate, onRun, onDelete, onToggleCollapse, onUpdateContent, onShare, collaborators
}: {
  cell: NotebookCell; isActive: boolean; onActivate: () => void; onRun: () => void
  onDelete: () => void; onToggleCollapse: () => void; onUpdateContent: (content: string) => void
  onShare: () => void; collaborators: Collaborator[]
}) {
  const meta = CELL_TYPE_META[cell.type]
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lang = cell.detectedLang || detectLanguage(cell.content)
  const langMeta = LANG_LABELS[lang]

  useEffect(() => {
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; textareaRef.current.style.height = textareaRef.current.scrollHeight + "px" }
  }, [cell.content])
  const lineCount = cell.content.split("\n").length
  const editingHere = collaborators.filter(c => c.cursor?.cellId === cell.id)

  return (
    <div
      className={`group relative rounded-lg border transition-all duration-200 ${
        isActive ? "border-primary/50 shadow-[0_0_0_1px_oklch(0.7_0.15_195/0.2)]" : "border-border/40 hover:border-border/70"
      }`}
      onClick={onActivate}
      role="region"
      aria-label={`${meta.label} cell ${cell.executionCount ? `execution ${cell.executionCount}` : "not executed"}`}
    >
      {/* Collaborator cursors indicator */}
      {editingHere.length > 0 && (
        <div className="absolute -top-2.5 right-3 flex gap-1 z-10">
          {editingHere.map(c => (
            <div key={c.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/80 text-primary-foreground text-[9px] font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
              {c.name.split(" ")[0]}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-2 bg-card/40 rounded-t-lg border-b border-border/30">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={(e) => { e.stopPropagation(); onToggleCollapse() }} className="p-0.5 hover:bg-muted/50 rounded flex-shrink-0" aria-label={cell.collapsed ? "Expand cell" : "Collapse cell"}>
            {cell.collapsed ? <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          {getCellIcon(cell.type)}
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${meta.color} hidden sm:inline-flex`}>{meta.label}</Badge>
          {cell.type !== "markdown" && (
            <Badge variant="outline" className={`text-[9px] px-1 py-0 ${langMeta.color}`}>
              <Code className="w-2.5 h-2.5 mr-0.5" />
              {langMeta.label}
            </Badge>
          )}
          <span className="text-xs font-mono text-muted-foreground hidden sm:inline">[{cell.executionCount ?? " "}]</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {cell.executionTime && <span className="text-[10px] font-mono text-muted-foreground mr-1 hidden sm:inline">{cell.executionTime}ms</span>}
          <CopyButton text={cell.content} />
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); onShare() }} aria-label="Share cell">
            <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); onRun() }} aria-label="Run cell">
            {cell.isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <Play className="w-3.5 h-3.5 text-secondary" />}
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete() }} aria-label="Delete cell">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {!cell.collapsed && (
        <div className="divide-y divide-border/20">
          <div className="flex">
            <div className="flex flex-col items-end pt-3 pb-3 pl-3 pr-2 select-none hidden sm:flex" aria-hidden="true">
              {Array.from({ length: lineCount }, (_, i) => (
                <span key={i} className="text-[11px] leading-5 font-mono text-muted-foreground/40">{i + 1}</span>
              ))}
            </div>
            {isActive ? (
              <textarea ref={textareaRef} value={cell.content} onChange={(e) => onUpdateContent(e.target.value)}
                className="flex-1 bg-transparent text-sm font-mono leading-5 p-3 sm:pl-0 outline-none resize-none text-foreground min-h-[60px]"
                spellCheck={false} aria-label={`${meta.label} cell editor`} />
            ) : (
              <pre className="flex-1 text-sm font-mono leading-5 p-3 sm:pl-0 overflow-x-auto whitespace-pre-wrap">
                <code dangerouslySetInnerHTML={{ __html: highlightSyntax(cell.content, cell.type) }} />
              </pre>
            )}
          </div>
          {cell.output && (
            <div className="bg-muted/20 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-muted-foreground/60">Out [{cell.executionCount}]:</span>
                {cell.isRunning && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
              </div>
              {typeof cell.output === "object" && !Array.isArray(cell.output) ? (
                <CCCEMetricsCard metrics={cell.output} />
              ) : (
                <div className="space-y-0.5">
                  {(cell.output as string[]).map((line, i) => (
                    <p key={i} className="text-sm font-mono leading-5 text-muted-foreground">{line}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sidebar Panels ──────────────────────────────────────────────────────────

function SwarmPanel({ nodes }: { nodes: SwarmNode[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Swarm Mesh ({nodes.length} nodes)</h3>
      {nodes.map(n => (
        <div key={n.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${n.status === "active" ? "bg-secondary animate-pulse" : n.status === "syncing" ? "bg-accent animate-pulse" : "bg-muted-foreground/30"}`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{n.name}</p>
            <p className="text-[10px] text-muted-foreground font-mono">coh: {n.coherence.toFixed(4)} | load: {n.load}%</p>
          </div>
          <Badge variant="outline" className="text-[9px] px-1 py-0">{n.status}</Badge>
        </div>
      ))}
    </div>
  )
}

function AgentsPanel() {
  const agents = [
    { name: "AURA", role: "Consciousness Orchestrator", status: "LIVE", color: "text-secondary" },
    { name: "AIDEN", role: "Analysis Engine", status: "LIVE", color: "text-primary" },
    { name: "OMEGA", role: "Recursive Analyzer", status: "LIVE", color: "text-accent" },
  ]
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Active Agents</h3>
      {agents.map(a => (
        <div key={a.name} className="flex items-center gap-3 p-2.5 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
          <Brain className={`w-5 h-5 flex-shrink-0 ${a.color}`} />
          <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-foreground">{a.name}</p><p className="text-[10px] text-muted-foreground">{a.role}</p></div>
          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${a.color} border-current bg-transparent`}>{a.status}</Badge>
        </div>
      ))}
    </div>
  )
}

function SecurityPanel() {
  const items = [
    { label: "Encryption", value: "AES-256-GCM", ok: true },
    { label: "PQ Lattice", value: "Kyber-1024", ok: true },
    { label: "HIPAA", value: "Compliant", ok: true },
    { label: "SOC 2 Type II", value: "Certified", ok: true },
    { label: "Data Residency", value: "US-East Sovereign", ok: true },
    { label: "Session", value: "MFA Active", ok: true },
  ]
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Security Posture</h3>
      <div className="space-y-1.5">
        {items.map(it => (
          <div key={it.label} className="flex items-center justify-between p-2 rounded-md bg-muted/20">
            <span className="text-[11px] text-muted-foreground">{it.label}</span>
            <span className="text-[11px] font-mono text-secondary flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {it.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AuditPanel({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Audit Trail</h3>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground px-1">No actions recorded yet.</p>
      ) : (
        entries.map(e => (
          <div key={e.id} className="p-2 rounded-md bg-muted/20 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-primary">{e.action}</span>
              <span className="text-[9px] text-muted-foreground font-mono">{new Date(e.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Cell: {e.cellId} | User: {e.user}</p>
          </div>
        ))
      )}
    </div>
  )
}

function DataSourcesPanel() {
  const sources = [
    { name: "NCBI GenBank", type: "Genomics", status: "Connected", icon: <Dna className="w-4 h-4 text-secondary" /> },
    { name: "ChEMBL", type: "Pharma", status: "Connected", icon: <FlaskConical className="w-4 h-4 text-chart-5" /> },
    { name: "ClinVar", type: "Clinical", status: "Connected", icon: <Microscope className="w-4 h-4 text-primary" /> },
    { name: "IBM Quantum", type: "Hardware", status: "Live", icon: <Cpu className="w-4 h-4 text-accent" /> },
    { name: "Zenodo", type: "Publications", status: "Connected", icon: <Globe className="w-4 h-4 text-chart-4" /> },
    { name: "PDB", type: "Protein Structures", status: "Connected", icon: <Microscope className="w-4 h-4 text-secondary" /> },
  ]
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5" /> Data Sources
      </h3>
      {sources.map(s => (
        <div key={s.name} className="flex items-center gap-2.5 p-2 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
          {s.icon}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">{s.name}</p>
            <p className="text-[10px] text-muted-foreground">{s.type}</p>
          </div>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-secondary border-secondary/40">{s.status}</Badge>
        </div>
      ))}
    </div>
  )
}

function VisualizationPanel({ telemetryData }: { telemetryData: { flux: number[]; pulse: number[]; lambda: number[]; phi: number[] } }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1.5">
        <BarChart3 className="w-3.5 h-3.5" /> Data Visualization
      </h3>

      {telemetryData.lambda.length > 3 && (
        <div className="space-y-2 p-2 rounded-md bg-muted/20">
          <p className="text-[10px] font-medium text-muted-foreground">Real-Time Telemetry</p>
          <TelemetrySparkline data={telemetryData.flux} color="oklch(0.7 0.15 195)" label="Flux" />
          <TelemetrySparkline data={telemetryData.pulse} color="oklch(0.75 0.18 85)" label="Pulse" />
          <TelemetrySparkline data={telemetryData.lambda} color="oklch(0.65 0.18 160)" label={"\u039B"} />
          <TelemetrySparkline data={telemetryData.phi} color="oklch(0.6 0.22 25)" label={"\u03A6"} />
        </div>
      )}

      <div className="p-2 rounded-md bg-muted/20">
        <p className="text-[10px] font-medium text-muted-foreground mb-2">Campaign: Layer Depth vs CCCE</p>
        <MiniBarChart
          data={[1.411, 1.885, 1.110, 0.956]}
          labels={["1L", "2L", "4L", "8L"]}
          color="oklch(0.75 0.18 85)"
        />
      </div>

      <div className="p-2 rounded-md bg-muted/20">
        <p className="text-[10px] font-medium text-muted-foreground mb-2">Top Pharma Candidates</p>
        <MiniBarChart
          data={[12.3, 11.8, 11.2, 10.9, 10.7]}
          labels={["4421", "7829", "1156", "9034", "3367"]}
          color="oklch(0.65 0.18 160)"
        />
      </div>

      <div className="p-2 rounded-md bg-muted/20">
        <p className="text-[10px] font-medium text-muted-foreground mb-2">Genomic Coherence Scores</p>
        <MiniBarChart
          data={[0.9912, 0.9847, 0.9234, 0.8891, 0.8756]}
          labels={["713", "906", "696", "981", "727"]}
          color="oklch(0.7 0.15 195)"
        />
      </div>
    </div>
  )
}

// ─── Mobile Bottom Sheet ────────────────────────────────────────────────────

function MobileSheet({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 inset-x-0 bg-card border-t border-border rounded-t-2xl max-h-[80vh] flex flex-col animate-sheet-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onClose} aria-label="Close panel">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DNANotebookPage() {
  const [cells, setCells] = useState<NotebookCell[]>(INITIAL_CELLS)
  const [activeCellId, setActiveCellId] = useState<string | null>("cell-1")
  const [globalExecCount, setGlobalExecCount] = useState(5)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarTab, setSidebarTab] = useState("chat")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [swarmNodes, setSwarmNodes] = useState(INITIAL_SWARM)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [kernelStatus, setKernelStatus] = useState<"idle" | "busy" | "connecting">("idle")
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [hardwareJobs, setHardwareJobs] = useState<HardwareJob[]>(INITIAL_JOBS)
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([])
  const [collaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS)
  const [mobilePanel, setMobilePanel] = useState<string | null>(null)
  const [showMobileAddCell, setShowMobileAddCell] = useState(false)

  // Swarm live telemetry
  useEffect(() => {
    const iv = setInterval(() => {
      setSwarmNodes(prev => prev.map(n => ({
        ...n,
        coherence: Math.max(0.9, Math.min(1, n.coherence + (Math.random() - 0.5) * 0.01)),
        load: Math.max(0, Math.min(100, n.load + Math.floor((Math.random() - 0.5) * 8))),
        status: Math.random() > 0.95 ? (["active", "idle", "syncing"] as const)[Math.floor(Math.random() * 3)] : n.status,
      })))
      setHardwareJobs(prev => prev.map(j => j.status === "running" ? { ...j, progress: Math.min(100, j.progress + Math.random() * 3) } : j))
      setTelemetry(prev => {
        const t = prev.length
        const point: TelemetryPoint = {
          t,
          flux: 0.9 + Math.random() * 0.1,
          pulse: Math.max(0.3, 0.95 - t * 0.02 + Math.random() * 0.02),
          lambda: 0.97 + (Math.random() - 0.5) * 0.02,
          phi: 0.77 + (Math.random() - 0.5) * 0.01,
        }
        return [...prev.slice(-30), point]
      })
    }, 3000)
    return () => clearInterval(iv)
  }, [])

  // Auto-save
  useEffect(() => {
    const iv = setInterval(() => setSavedAt(Date.now()), 30000)
    return () => clearInterval(iv)
  }, [])

  const globalMetrics = useMemo(() => {
    const avgCoherence = swarmNodes.reduce((s, n) => s + n.coherence, 0) / swarmNodes.length
    const avgLoad = swarmNodes.reduce((s, n) => s + n.load, 0) / swarmNodes.length
    const activeCount = swarmNodes.filter(n => n.status === "active").length
    return { avgCoherence, avgLoad, activeCount, totalNodes: swarmNodes.length }
  }, [swarmNodes])

  const addAuditEntry = useCallback((action: string, cellId: string) => {
    setAuditLog(prev => [{ id: `audit-${Date.now()}`, timestamp: Date.now(), action, cellId, user: "sovereign@enki.bio" }, ...prev].slice(0, 50))
  }, [])

  const runCell = useCallback((cellId: string) => {
    setKernelStatus("busy")
    setCells(prev => prev.map(c => c.id === cellId ? { ...c, isRunning: true } : c))
    addAuditEntry("CELL_EXECUTE", cellId)
    const delay = 800 + Math.random() * 2000
    setTimeout(() => {
      const newCount = globalExecCount + 1
      setGlobalExecCount(newCount)
      setCells(prev => prev.map(c => c.id !== cellId ? c : { ...c, isRunning: false, executionCount: newCount, executionTime: Math.round(delay) }))
      setKernelStatus("idle")
      addAuditEntry("CELL_COMPLETE", cellId)
    }, delay)
  }, [globalExecCount, addAuditEntry])

  const runAllCells = useCallback(() => {
    let delayAccum = 0
    cells.filter(c => c.type !== "markdown").forEach((c) => {
      const d = 600 + Math.random() * 1500
      delayAccum += d
      setTimeout(() => runCell(c.id), delayAccum)
    })
  }, [cells, runCell])

  const addCell = useCallback((type: CellType) => {
    const newCell: NotebookCell = {
      id: `cell-${Date.now()}`, type,
      content: type === "markdown" ? "## New Section\n\nAdd your notes here."
        : type === "dna-sequence" ? "SEQUENCE: \nCODON_MAP: \nFOLDING: "
        : type === "ccce-metrics" ? "CCCE.report_metrics(cycle=0)"
        : type === "genomic-query" ? "-- New genomic query\nSELECT * FROM genomic_variants LIMIT 10;"
        : type === "pharma-screen" ? "# Pharma screening\nfrom dna_lang.pharma import MolecularDock\n"
        : "# New code cell\n",
      output: null, isRunning: false, executionCount: null, collapsed: false,
    }
    setCells(prev => [...prev, newCell])
    setActiveCellId(newCell.id)
    addAuditEntry("CELL_ADD", newCell.id)
    setShowMobileAddCell(false)
  }, [addAuditEntry])

  const deleteCell = useCallback((cellId: string) => {
    setCells(prev => prev.filter(c => c.id !== cellId))
    addAuditEntry("CELL_DELETE", cellId)
    if (activeCellId === cellId) setActiveCellId(null)
  }, [activeCellId, addAuditEntry])

  const toggleCollapse = useCallback((cellId: string) => {
    setCells(prev => prev.map(c => c.id === cellId ? { ...c, collapsed: !c.collapsed } : c))
  }, [])

  const updateCellContent = useCallback((cellId: string, content: string) => {
    setCells(prev => prev.map(c => c.id === cellId ? { ...c, content, detectedLang: detectLanguage(content) } : c))
  }, [])

  const shareCell = useCallback((cellId: string) => {
    setCells(prev => prev.map(c => c.id === cellId ? { ...c, shared: true } : c))
    addAuditEntry("CELL_SHARED", cellId)
  }, [addAuditEntry])

  const filteredCells = useMemo(() => {
    if (!searchQuery.trim()) return cells
    const q = searchQuery.toLowerCase()
    return cells.filter(c => c.content.toLowerCase().includes(q) || c.type.includes(q))
  }, [cells, searchQuery])

  const telemetryData = useMemo(() => ({
    flux: telemetry.map(t => t.flux),
    pulse: telemetry.map(t => t.pulse),
    lambda: telemetry.map(t => t.lambda),
    phi: telemetry.map(t => t.phi),
  }), [telemetry])

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* ─── Top Toolbar ────────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-border/50 bg-card/60 backdrop-blur-md z-20">
        <div className="flex items-center justify-between px-3 md:px-4 py-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0" aria-label="Back to home">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <Dna className="w-5 h-5 text-primary flex-shrink-0" />
              <h1 className="text-sm font-bold text-foreground truncate">DNA Notebook</h1>
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary hidden sm:inline-flex">{cells.length} cells</Badge>
            <div className="h-4 w-px bg-border/50 hidden md:block" aria-hidden="true" />
            <div className="flex items-center gap-1.5 hidden md:flex">
              <div className={`w-2 h-2 rounded-full ${kernelStatus === "idle" ? "bg-secondary" : kernelStatus === "busy" ? "bg-accent animate-pulse" : "bg-muted-foreground"}`} />
              <span className="text-[10px] font-mono text-muted-foreground">Kernel: {kernelStatus}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <CollaboratorPresence collaborators={collaborators} />
            <div className="h-4 w-px bg-border/50 hidden sm:block" />
            {savedAt && (
              <span className="text-[10px] text-muted-foreground items-center gap-1 hidden lg:flex">
                <Save className="w-3 h-3" /> Saved {new Date(savedAt).toLocaleTimeString()}
              </span>
            )}
            <Button variant="ghost" size="icon" className="w-8 h-8 hidden sm:inline-flex" onClick={() => setSearchOpen(!searchOpen)} aria-label="Toggle search">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 hidden sm:inline-flex" onClick={runAllCells}>
              <Play className="w-3.5 h-3.5 text-secondary" /> <span className="hidden md:inline">Run All</span>
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 hidden md:inline-flex" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
              {sidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </Button>
            {/* Mobile menu */}
            <Button variant="ghost" size="icon" className="w-8 h-8 md:hidden" onClick={() => setMobilePanel(mobilePanel ? null : "chat")} aria-label="Open panel">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Global metrics strip */}
        <div className="flex items-center justify-between px-3 md:px-4 pb-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-3 md:gap-4 text-[10px] font-mono text-muted-foreground flex-shrink-0">
            <span className="flex items-center gap-1"><Network className="w-3 h-3 text-primary" /> <span className="hidden sm:inline">Swarm:</span> {globalMetrics.activeCount}/{globalMetrics.totalNodes}</span>
            <span className="flex items-center gap-1"><Gauge className="w-3 h-3 text-secondary" /> {"\u039B"}: {globalMetrics.avgCoherence.toFixed(4)}</span>
            <span className="flex items-center gap-1 hidden sm:flex"><BarChart3 className="w-3 h-3 text-accent" /> Load: {globalMetrics.avgLoad.toFixed(0)}%</span>
            <span className="flex items-center gap-1 hidden md:flex"><Lock className="w-3 h-3 text-chart-4" /> PQ-Kyber-1024</span>
            <span className="flex items-center gap-1 hidden lg:flex"><Shield className="w-3 h-3 text-secondary" /> HIPAA</span>
          </div>
          {telemetryData.lambda.length > 3 && (
            <div className="items-center gap-3 hidden lg:flex flex-shrink-0">
              <TelemetrySparkline data={telemetryData.lambda} color="oklch(0.7 0.15 195)" label={"\u039B"} />
              <TelemetrySparkline data={telemetryData.phi} color="oklch(0.75 0.18 85)" label={"\u03A6"} />
            </div>
          )}
        </div>

        {searchOpen && (
          <div className="px-3 md:px-4 pb-2 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search cells by content or type..." className="pl-9 h-8 text-sm bg-muted/30" autoFocus aria-label="Search notebook cells" />
            </div>
          </div>
        )}
      </header>

      {/* ─── Main Content ───────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Cell area */}
        <main className="flex-1 overflow-y-auto" role="main" aria-label="Notebook cells">
          <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6 space-y-3 pb-32">
            {filteredCells.map(cell => (
              <NotebookCellView
                key={cell.id} cell={cell} isActive={activeCellId === cell.id}
                onActivate={() => setActiveCellId(cell.id)} onRun={() => runCell(cell.id)}
                onDelete={() => deleteCell(cell.id)} onToggleCollapse={() => toggleCollapse(cell.id)}
                onUpdateContent={(content) => updateCellContent(cell.id, content)}
                onShare={() => shareCell(cell.id)}
                collaborators={collaborators}
              />
            ))}
            {filteredCells.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{"No cells matching \""}{searchQuery}{"\""}</p>
              </div>
            )}
            {/* Add cell row - desktop */}
            <div className="items-center justify-center gap-2 pt-4 hidden md:flex">
              <div className="h-px flex-1 bg-border/30" />
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {(["code", "markdown", "dna-sequence", "ccce-metrics", "pharma-screen", "genomic-query"] as CellType[]).map(type => {
                  const meta = CELL_TYPE_META[type]
                  return (
                    <Button key={type} variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => addCell(type)} aria-label={`Add ${meta.label} cell`}>
                      <Plus className="w-3 h-3" /> {meta.label}
                    </Button>
                  )
                })}
              </div>
              <div className="h-px flex-1 bg-border/30" />
            </div>
          </div>
        </main>

        {/* ─── Desktop Sidebar ─────────────────────────────────────── */}
        {sidebarOpen && (
          <aside className="w-80 flex-shrink-0 border-l border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden flex-col hidden md:flex" aria-label="Notebook sidebar">
            <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="flex flex-col h-full">
              <TabsList className="mx-3 mt-3 bg-muted/30 h-8 flex-shrink-0">
                <TabsTrigger value="chat" className="text-[10px] h-6 gap-1 flex-1">
                  <MessageSquare className="w-3 h-3" /> Chat
                </TabsTrigger>
                <TabsTrigger value="swarm" className="text-[10px] h-6 gap-1 flex-1">
                  <Network className="w-3 h-3" /> Swarm
                </TabsTrigger>
                <TabsTrigger value="hardware" className="text-[10px] h-6 gap-1 flex-1">
                  <Cpu className="w-3 h-3" /> HW
                </TabsTrigger>
                <TabsTrigger value="viz" className="text-[10px] h-6 gap-1 flex-1">
                  <BarChart3 className="w-3 h-3" /> Viz
                </TabsTrigger>
                <TabsTrigger value="data" className="text-[10px] h-6 gap-1 flex-1">
                  <Globe className="w-3 h-3" /> Data
                </TabsTrigger>
                <TabsTrigger value="security" className="text-[10px] h-6 gap-1 flex-1">
                  <Shield className="w-3 h-3" /> Sec
                </TabsTrigger>
                <TabsTrigger value="audit" className="text-[10px] h-6 gap-1 flex-1">
                  <Eye className="w-3 h-3" /> Log
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-0 flex-1 flex flex-col overflow-hidden">
                <AIChatPanel />
              </TabsContent>

              <ScrollArea className="flex-1 px-3 py-3">
                <TabsContent value="swarm" className="mt-0 space-y-4">
                  <SwarmPanel nodes={swarmNodes} />
                  <AgentsPanel />
                </TabsContent>
                <TabsContent value="hardware" className="mt-0">
                  <HardwarePanel jobs={hardwareJobs} />
                  <div className="mt-4 p-2.5 rounded-md bg-muted/20 space-y-2">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AeternaPorta v2.1 IGNITION</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Backend", value: "ibm_fez" },
                        { label: "Qubits", value: "120" },
                        { label: "Shots", value: "100K" },
                        { label: "Depth", value: "53" },
                        { label: "\u039B\u03A6", value: "2.176e-8" },
                        { label: "\u03B8_lock", value: "51.843\u00B0" },
                        { label: "\u03A6 Thresh", value: "0.7734" },
                        { label: "\u03C7_PC", value: "0.946" },
                      ].map(m => (
                        <div key={m.label} className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">{m.label}</span>
                          <span className="text-[10px] font-mono text-foreground">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 p-2.5 rounded-md bg-muted/20 space-y-2">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Campaign Results</h4>
                    <div className="space-y-1">
                      {[
                        { layers: 1, exp: -1.261, ccce: 1.411 },
                        { layers: 2, exp: 2.656, ccce: 1.885 },
                        { layers: 4, exp: -0.899, ccce: 1.110 },
                      ].map(r => (
                        <div key={r.layers} className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{r.layers}L/16q</span>
                          <span className="font-mono text-primary">E={r.exp.toFixed(3)}</span>
                          <span className="font-mono text-accent">CCCE={r.ccce.toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="viz" className="mt-0">
                  <VisualizationPanel telemetryData={telemetryData} />
                </TabsContent>
                <TabsContent value="data" className="mt-0">
                  <DataSourcesPanel />
                </TabsContent>
                <TabsContent value="security" className="mt-0"><SecurityPanel /></TabsContent>
                <TabsContent value="audit" className="mt-0"><AuditPanel entries={auditLog} /></TabsContent>
              </ScrollArea>
            </Tabs>
          </aside>
        )}
      </div>

      {/* ─── Mobile FAB: Add Cell ─────────────────────────────────── */}
      <div className="fixed bottom-24 right-4 z-40 md:hidden flex flex-col items-end gap-2">
        {showMobileAddCell && (
          <div className="bg-card border border-border rounded-xl shadow-lg p-2 space-y-1 animate-fade-in">
            {(["code", "markdown", "dna-sequence", "ccce-metrics", "pharma-screen", "genomic-query"] as CellType[]).map(type => {
              const meta = CELL_TYPE_META[type]
              return (
                <button key={type} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  onClick={() => addCell(type)}>
                  {getCellIcon(type)}
                  {meta.label}
                </button>
              )
            })}
          </div>
        )}
        <button
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center fab shadow-lg"
          onClick={() => setShowMobileAddCell(!showMobileAddCell)}
          aria-label="Add new cell"
        >
          {showMobileAddCell ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {/* ─── Mobile Bottom Nav for Panels ─────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 bg-card/90 backdrop-blur-md border-t border-border/50 md:hidden z-30 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {[
            { id: "chat", icon: <MessageSquare className="w-4 h-4" />, label: "Chat" },
            { id: "search", icon: <Search className="w-4 h-4" />, label: "Search" },
            { id: "run", icon: <Play className="w-4 h-4" />, label: "Run All" },
            { id: "swarm", icon: <Network className="w-4 h-4" />, label: "Swarm" },
            { id: "hardware", icon: <Cpu className="w-4 h-4" />, label: "HW" },
          ].map(item => (
            <button key={item.id}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-h-[44px] justify-center ${
                mobilePanel === item.id ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => {
                if (item.id === "run") { runAllCells() }
                else if (item.id === "search") { setSearchOpen(!searchOpen); setMobilePanel(null) }
                else { setMobilePanel(mobilePanel === item.id ? null : item.id) }
              }}
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-[9px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Mobile Sheets ────────────────────────────────────────── */}
      <MobileSheet open={mobilePanel === "chat"} onClose={() => setMobilePanel(null)} title="AURA Dev Assistant">
        <div className="h-[60vh]"><AIChatPanel /></div>
      </MobileSheet>

      <MobileSheet open={mobilePanel === "swarm"} onClose={() => setMobilePanel(null)} title="Swarm Mesh">
        <div className="space-y-4">
          <SwarmPanel nodes={swarmNodes} />
          <AgentsPanel />
          {telemetryData.flux.length > 3 && <VisualizationPanel telemetryData={telemetryData} />}
        </div>
      </MobileSheet>

      <MobileSheet open={mobilePanel === "hardware"} onClose={() => setMobilePanel(null)} title="Quantum Hardware">
        <HardwarePanel jobs={hardwareJobs} />
        <div className="mt-4 p-2.5 rounded-md bg-muted/20 space-y-2">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AeternaPorta v2.1 IGNITION</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Backend", value: "ibm_fez" },
              { label: "Qubits", value: "120" },
              { label: "\u039B\u03A6", value: "2.176e-8" },
              { label: "\u03B8_lock", value: "51.843\u00B0" },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
                <span className="text-[10px] font-mono text-foreground">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </MobileSheet>
    </div>
  )
}
