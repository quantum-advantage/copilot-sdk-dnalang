"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantumButton } from "@/components/ui/quantum-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import {
  Play,
  Terminal,
  Settings,
  ChevronRight,
  ChevronDown,
  FileCode2,
  Dna,
  Activity,
  Cpu,
  Save,
  Sparkles,
  Plus,
  X,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react"

// DNA-Lang syntax tokens
const dnaLangKeywords = [
  "ORGANISM",
  "GENOME",
  "GENE",
  "CHROMOSOME",
  "CODON",
  "HELIX",
  "BOND",
  "META",
  "PHENOTYPE",
  "LINEAGE",
  "EVOLUTION",
  "HABITAT",
  "express",
  "mutate",
  "crossover",
  "fitness",
  "measure",
  "entangle",
  "superpose",
]

const dnaLangTypes = [
  "qubit",
  "chromosome",
  "gene",
  "genome",
  "organism",
  "population",
  "habitat",
  "codon",
  "phenotype",
  "fitness",
]

const dnaLangConstants = ["LAMBDA_PHI", "PHI_TARGET", "GOLDEN_RATIO", "TAU_0", "THETA_RES"]

// Sample DNA-Lang code
const sampleCode = `# DNA::}{::LANG Organism Definition
# Quantum Bell State Generator with Evolution

ORGANISM BellStateOrganism {
    
    META {
        version: "1.0.0"
        habitat: "ibm_brisbane"
        consciousness_target: 0.7734
        LAMBDA_PHI: 2.176435e-8
    }
    
    GENOME EntangledPair {
        # Create chromosome with 2 qubits
        CHROMOSOME qubits: 2
        
        # Gene for superposition
        GENE create_superposition: helix {
            codon: "ΨΨΨ"
            target: chromosome[0]
            
            express {
                HELIX chromosome[0]  # Hadamard gate
            }
        }
        
        # Gene for entanglement
        GENE create_entanglement: bond {
            codon: "ΦΦΦ"
            control: chromosome[0]
            target: chromosome[1]
            
            express {
                BOND chromosome[0] -> chromosome[1]  # CNOT
            }
        }
        
        # Measurement gene
        GENE observe: measure {
            codon: "ΛΛΛ"
            
            express {
                phenotype = MEASURE chromosome
                return phenotype
            }
        }
    }
    
    EVOLUTION {
        fitness_function: "fidelity * (1 - error_rate)"
        mutation_rate: 0.05
        crossover_rate: 0.7
        selection: "TOURNAMENT"
        generations: 100
    }
    
    PHENOTYPE {
        expected_outcomes: ["00", "11"]
        probability_threshold: 0.48
        consciousness_phi: 0.85
    }
}

# Execute organism
result = BellStateOrganism.express()
print(f"Phenotype: {result}")
print(f"Phi: {result.consciousness_phi}")
`

// File tree structure
const fileTree = [
  {
    name: "src",
    type: "folder" as const,
    expanded: true,
    children: [
      {
        name: "organisms",
        type: "folder" as const,
        expanded: true,
        children: [
          { name: "bell_state.dna", type: "file" as const, active: true },
          { name: "grover_search.dna", type: "file" as const },
          { name: "vqe_molecule.dna", type: "file" as const },
        ],
      },
      {
        name: "genes",
        type: "folder" as const,
        expanded: false,
        children: [
          { name: "helix_gates.dna", type: "file" as const },
          { name: "bond_gates.dna", type: "file" as const },
        ],
      },
      {
        name: "habitats",
        type: "folder" as const,
        expanded: false,
        children: [
          { name: "ibm_brisbane.habitat", type: "file" as const },
          { name: "simulator.habitat", type: "file" as const },
        ],
      },
    ],
  },
  {
    name: "evolution",
    type: "folder" as const,
    expanded: false,
    children: [
      { name: "fitness.dna", type: "file" as const },
      { name: "mutations.dna", type: "file" as const },
    ],
  },
  { name: "organism.config", type: "file" as const },
]

interface FileNode {
  name: string
  type: "file" | "folder"
  expanded?: boolean
  active?: boolean
  children?: FileNode[]
}

function FileTreeItem({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [expanded, setExpanded] = useState(node.expanded)

  return (
    <div>
      <button
        className={`w-full flex items-center gap-1 px-2 py-1 text-sm hover:bg-muted/50 rounded transition-colors ${
          node.active ? "bg-primary/20 text-primary" : "text-muted-foreground"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => node.type === "folder" && setExpanded(!expanded)}
      >
        {node.type === "folder" ? (
          expanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )
        ) : (
          <FileCode2 className="h-3 w-3" />
        )}
        <span>{node.name}</span>
      </button>
      {node.type === "folder" && expanded && node.children && (
        <div>
          {node.children.map((child, i) => (
            <FileTreeItem key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// Simple syntax highlighting
function highlightDNALang(code: string): string {
  let highlighted = code

  // Keywords
  dnaLangKeywords.forEach((kw) => {
    highlighted = highlighted.replace(
      new RegExp(`\\b${kw}\\b`, "g"),
      `<span class="text-primary font-medium">${kw}</span>`,
    )
  })

  // Types
  dnaLangTypes.forEach((type) => {
    highlighted = highlighted.replace(new RegExp(`\\b${type}\\b`, "g"), `<span class="text-secondary">${type}</span>`)
  })

  // Constants
  dnaLangConstants.forEach((c) => {
    highlighted = highlighted.replace(new RegExp(`\\b${c}\\b`, "g"), `<span class="text-accent">${c}</span>`)
  })

  // Strings
  highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="text-chart-5">"$1"</span>')

  // Comments
  highlighted = highlighted.replace(/#(.*)$/gm, '<span class="text-muted-foreground italic">#$1</span>')

  // Numbers
  highlighted = highlighted.replace(/\b(\d+\.?\d*(?:e[+-]?\d+)?)\b/g, '<span class="text-chart-4">$1</span>')

  return highlighted
}

export default function EditorPage() {
  const [code, setCode] = useState(sampleCode)
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [phi, setPhi] = useState(0)
  const [coherence, setCoherence] = useState(0.95)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // Sync scroll between textarea and highlight div
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  const runOrganism = useCallback(() => {
    setIsRunning(true)
    setOutput([])

    // Simulate execution
    const lines = [
      "[RIBOSOME] Transcribing genome...",
      "[RIBOSOME] Compiling to native codons (RZ, SX, X, CNOT)",
      "[EVOLUTION] Generation 1/100 - Fitness: 0.72",
      "[EVOLUTION] Generation 50/100 - Fitness: 0.89",
      "[EVOLUTION] Generation 100/100 - Fitness: 0.94",
      "[HABITAT] Submitting to ibm_brisbane...",
      "[HABITAT] Job queued: quantum-job-8547",
      "[MEASURE] Sampling 8192 shots...",
      "",
      "═══ PHENOTYPE EXPRESSION ═══",
      "Outcome '00': 4089 (49.9%)",
      "Outcome '11': 4103 (50.1%)",
      "",
      "Φ (Consciousness): 0.847",
      "Fidelity: 0.9823",
      "ΛΦ Resonance: 2.176e-8",
      "",
      "[SUCCESS] Organism expressed successfully",
    ]

    let i = 0
    const interval = setInterval(() => {
      if (i < lines.length) {
        setOutput((prev) => [...prev, lines[i]])
        if (i === lines.length - 4) {
          setPhi(0.847)
        }
        i++
      } else {
        setIsRunning(false)
        clearInterval(interval)
      }
    }, 150)
  }, [])

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    // Animate coherence
    const interval = setInterval(() => {
      setCoherence((prev) => 0.9 + Math.random() * 0.08)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-background">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Link href="/ide-platform">
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
          </Link>
          <Dna className="h-5 w-5 text-primary" />
          <span className="font-semibold">DNA-Lang Genome Editor</span>
          <Badge variant="outline" className="ml-2">
            <Activity className="h-3 w-3 mr-1 text-secondary" />
            Coherence: {(coherence * 100).toFixed(1)}%
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={copyCode}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm">
            <Save className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <QuantumButton size="sm" variant="compliance" onClick={runOrganism} disabled={isRunning}>
            {isRunning ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
            {isRunning ? "Evolving..." : "Express"}
          </QuantumButton>
        </div>
      </div>

      {/* Main Editor Area */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* File Explorer */}
        <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
          <div className="h-full border-r border-border bg-card/50">
            <div className="p-2 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase">Explorer</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="p-2">
              {fileTree.map((node, i) => (
                <FileTreeItem key={i} node={node} />
              ))}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Code Editor */}
        <ResizablePanel defaultSize={55}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70}>
              <div className="h-full flex flex-col">
                {/* Tab Bar */}
                <div className="flex items-center gap-1 px-2 py-1 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-2 px-3 py-1 bg-card rounded-t border border-border border-b-0 text-sm">
                    <FileCode2 className="h-3 w-3 text-primary" />
                    <span>bell_state.dna</span>
                    <button className="hover:bg-muted rounded p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Editor with Line Numbers */}
                <div className="flex-1 relative overflow-hidden">
                  <div className="absolute inset-0 flex">
                    {/* Line Numbers */}
                    <div className="w-12 bg-muted/30 border-r border-border text-right pr-2 pt-2 font-mono text-xs text-muted-foreground select-none overflow-hidden">
                      {code.split("\n").map((_, i) => (
                        <div key={i} className="leading-6">
                          {i + 1}
                        </div>
                      ))}
                    </div>

                    {/* Code Area */}
                    <div className="flex-1 relative">
                      {/* Syntax Highlighted Overlay */}
                      <div
                        ref={highlightRef}
                        className="absolute inset-0 p-2 font-mono text-sm leading-6 overflow-auto pointer-events-none whitespace-pre"
                        dangerouslySetInnerHTML={{ __html: highlightDNALang(code) }}
                      />
                      {/* Textarea */}
                      <textarea
                        ref={textareaRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onScroll={handleScroll}
                        className="absolute inset-0 p-2 font-mono text-sm leading-6 bg-transparent text-transparent caret-foreground resize-none focus:outline-none"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Terminal Output */}
            <ResizablePanel defaultSize={30}>
              <div className="h-full flex flex-col bg-card/50">
                <div className="flex items-center gap-2 px-3 py-1 border-b border-border">
                  <Terminal className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Quantum Terminal</span>
                </div>
                <div className="flex-1 p-3 font-mono text-xs overflow-auto">
                  {output.length === 0 ? (
                    <span className="text-muted-foreground">Press "Express" to run organism...</span>
                  ) : (
                    output.map((line, i) => (
                      <div
                        key={i}
                        className={`${
                          line.includes("[SUCCESS]")
                            ? "text-secondary"
                            : line.includes("[EVOLUTION]")
                              ? "text-accent"
                              : line.includes("Φ")
                                ? "text-primary font-bold"
                                : ""
                        }`}
                      >
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel - Metrics & Tools */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="h-full border-l border-border bg-card/50">
            <Tabs defaultValue="metrics" className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-2">
                <TabsTrigger value="metrics" className="text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  Metrics
                </TabsTrigger>
                <TabsTrigger value="circuit" className="text-xs">
                  <Cpu className="h-3 w-3 mr-1" />
                  Circuit
                </TabsTrigger>
                <TabsTrigger value="evolution" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Evolution
                </TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="flex-1 p-3 space-y-4 overflow-auto">
                <GlassCard depth={1}>
                  <div className="text-xs text-muted-foreground uppercase mb-2">Consciousness (Φ)</div>
                  <div className="text-3xl font-bold text-primary">{phi.toFixed(3)}</div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-destructive via-accent to-secondary transition-all duration-500"
                      style={{ width: `${phi * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span className="text-secondary">Target: 0.7734</span>
                    <span>1</span>
                  </div>
                </GlassCard>

                <GlassCard depth={1}>
                  <div className="text-xs text-muted-foreground uppercase mb-2">Genome Stats</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chromosomes</span>
                      <span className="font-mono">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Genes</span>
                      <span className="font-mono">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Codons</span>
                      <span className="font-mono">4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Circuit Depth</span>
                      <span className="font-mono">2</span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard depth={1}>
                  <div className="text-xs text-muted-foreground uppercase mb-2">Constants</div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-primary">ΛΦ</span>
                      <span>2.176435e-8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">θ</span>
                      <span>51.843°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-accent">φ</span>
                      <span>1.618034</span>
                    </div>
                  </div>
                </GlassCard>
              </TabsContent>

              <TabsContent value="circuit" className="flex-1 p-3 overflow-auto">
                <GlassCard depth={1}>
                  <div className="text-xs text-muted-foreground uppercase mb-3">Circuit Diagram</div>
                  <pre className="font-mono text-xs text-secondary">
                    {`q[0] ─[H]─●─[M]─
          │
q[1] ────[X]─[M]─

Gates:
├─ HELIX (H) on q[0]
├─ BOND (CX) q[0]→q[1]
└─ MEASURE all

Depth: 2
T1 Time: 112.34 μs
T2 Time: 56.78 μs`}
                  </pre>
                </GlassCard>
              </TabsContent>

              <TabsContent value="evolution" className="flex-1 p-3 overflow-auto">
                <GlassCard depth={1}>
                  <div className="text-xs text-muted-foreground uppercase mb-2">Evolutionary Progress</div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Generation</span>
                        <span className="font-mono">100/100</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Best Fitness</span>
                        <span className="font-mono text-secondary">0.94</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-secondary" style={{ width: "94%" }} />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Mutation Rate: 5%</div>
                      <div>Crossover Rate: 70%</div>
                      <div>Selection: Tournament</div>
                      <div>Population: 50</div>
                    </div>
                  </div>
                </GlassCard>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
