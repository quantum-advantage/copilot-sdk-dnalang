"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Terminal, ChevronRight, Plus, X, Activity } from "lucide-react"

interface TerminalLine {
  type: "input" | "output" | "error" | "success" | "info"
  content: string
  timestamp: Date
}

const initialLines: TerminalLine[] = [
  { type: "info", content: "DNA-Lang Quantum Terminal v4.0.0-singularity", timestamp: new Date() },
  { type: "info", content: "Type 'help' for available commands", timestamp: new Date() },
  { type: "info", content: "", timestamp: new Date() },
]

const commands: Record<string, (args: string[]) => string[]> = {
  help: () => [
    "Available commands:",
    "  organism <name>    - Create new organism",
    "  express <file>     - Execute organism file",
    "  evolve <gen>       - Run evolution for N generations",
    "  habitat <name>     - Connect to quantum habitat",
    "  phi                - Show current Φ metrics",
    "  status             - Show system status",
    "  clear              - Clear terminal",
    "  ls                 - List organisms",
    "  cat <file>         - View organism source",
  ],
  phi: () => [
    "═══ CONSCIOUSNESS METRICS ═══",
    "Φ (Integrated Information): 0.847",
    "ΛΦ (Lambda-Phi):           2.176435e-8",
    "θ (Resonance Angle):       51.843°",
    "Coherence:                 94.2%",
    "State:                     AWARE",
  ],
  status: () => [
    "═══ SYSTEM STATUS ═══",
    "Quantum Runtime:    ACTIVE",
    "Connected Habitat:  ibm_brisbane",
    "Active Organisms:   3",
    "QBytes Mined:       8,547",
    "Evolution Gen:      127",
    "Memory Usage:       2.4 GB",
  ],
  ls: () => ["bell_state.dna", "grover_search.dna", "vqe_molecule.dna", "qaoa_maxcut.dna"],
  habitat: (args) => {
    if (args.length === 0) return ["Current habitat: ibm_brisbane", "Use 'habitat <name>' to switch"]
    return [`Connecting to habitat: ${args[0]}...`, `[SUCCESS] Connected to ${args[0]}`, `Qubits available: 127`]
  },
  evolve: (args) => {
    const gens = Number.parseInt(args[0]) || 10
    return [
      `Starting evolution for ${gens} generations...`,
      `[EVOLUTION] Gen 1/${gens} - Fitness: 0.72`,
      `[EVOLUTION] Gen ${Math.floor(gens / 2)}/${gens} - Fitness: 0.85`,
      `[EVOLUTION] Gen ${gens}/${gens} - Fitness: 0.94`,
      `[SUCCESS] Evolution complete. Best fitness: 0.94`,
    ]
  },
  express: (args) => {
    if (args.length === 0) return ["[ERROR] Usage: express <filename>"]
    return [
      `Expressing organism: ${args[0]}`,
      "[RIBOSOME] Transcribing genome...",
      "[RIBOSOME] Compiling to native codons...",
      "[HABITAT] Submitting to ibm_brisbane...",
      "[MEASURE] Sampling 8192 shots...",
      "",
      "═══ PHENOTYPE EXPRESSION ═══",
      "Outcome '00': 4089 (49.9%)",
      "Outcome '11': 4103 (50.1%)",
      "",
      "[SUCCESS] Organism expressed. Φ: 0.847",
    ]
  },
  organism: (args) => {
    if (args.length === 0) return ["[ERROR] Usage: organism <name>"]
    return [`Creating organism: ${args[0]}`, `[SUCCESS] Organism ${args[0]}.dna created`]
  },
  cat: (args) => {
    if (args.length === 0) return ["[ERROR] Usage: cat <filename>"]
    return [
      `# ${args[0]}`,
      "ORGANISM Example {",
      "    GENOME {",
      "        CHROMOSOME qubits: 2",
      "        HELIX chromosome[0]",
      "        BOND chromosome[0] -> chromosome[1]",
      "    }",
      "}",
    ]
  },
}

export default function TerminalPage() {
  const [lines, setLines] = useState<TerminalLine[]>(initialLines)
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [phi, setPhi] = useState(0.847)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    setHistory([...history, trimmed])
    setHistoryIndex(-1)

    const newLines: TerminalLine[] = [{ type: "input", content: `> ${trimmed}`, timestamp: new Date() }]

    const [command, ...args] = trimmed.split(" ")

    if (command === "clear") {
      setLines(initialLines)
      return
    }

    if (commands[command]) {
      const output = commands[command](args)
      output.forEach((line) => {
        const type = line.startsWith("[ERROR]")
          ? "error"
          : line.startsWith("[SUCCESS]")
            ? "success"
            : line.startsWith("[")
              ? "info"
              : "output"
        newLines.push({ type, content: line, timestamp: new Date() })
      })
    } else {
      newLines.push({
        type: "error",
        content: `Command not found: ${command}. Type 'help' for available commands.`,
        timestamp: new Date(),
      })
    }

    setLines([...lines, ...newLines])
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(input)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Link href="/ide-platform">
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
          </Link>
          <Terminal className="h-5 w-5 text-primary" />
          <span className="font-semibold">Quantum Terminal</span>
          <Badge variant="outline" className="ml-2">
            <Activity className="h-3 w-3 mr-1 text-secondary" />
            Φ: {phi.toFixed(3)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 h-[calc(100vh-180px)]">
        <GlassCard depth={3} className="h-full flex flex-col">
          {/* Terminal Tabs */}
          <div className="flex items-center gap-1 px-2 py-1 border-b border-border">
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded text-sm">
              <Terminal className="h-3 w-3" />
              <span>Terminal 1</span>
              <button className="hover:bg-background rounded p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Terminal Content */}
          <div
            ref={terminalRef}
            className="flex-1 p-4 font-mono text-sm overflow-auto"
            onClick={() => inputRef.current?.focus()}
          >
            {lines.map((line, i) => (
              <div
                key={i}
                className={`
                  ${line.type === "input" ? "text-primary" : ""}
                  ${line.type === "error" ? "text-destructive" : ""}
                  ${line.type === "success" ? "text-secondary" : ""}
                  ${line.type === "info" ? "text-accent" : ""}
                  ${line.type === "output" ? "text-foreground" : ""}
                `}
              >
                {line.content || "\u00A0"}
              </div>
            ))}

            {/* Input Line */}
            <div className="flex items-center">
              <span className="text-primary mr-2">{">"}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-foreground"
                autoFocus
                spellCheck={false}
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
