"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantumButton } from "@/components/ui/quantum-button"
import { ChevronRight, Play, Trash2, Download, Activity, Grid3X3, Plus, Minus } from "lucide-react"

// Gate types with their properties
const gateTypes = [
  { id: "helix", name: "Helix", symbol: "H", color: "primary", description: "Superposition (Hadamard)" },
  { id: "bond", name: "Bond", symbol: "●─●", color: "secondary", description: "Entanglement (CNOT)", twoQubit: true },
  { id: "phase_x", name: "X-Codon", symbol: "X", color: "accent", description: "Pauli-X (NOT)" },
  { id: "phase_y", name: "Y-Codon", symbol: "Y", color: "chart-5", description: "Pauli-Y" },
  { id: "phase_z", name: "Z-Codon", symbol: "Z", color: "chart-4", description: "Pauli-Z" },
  { id: "rz", name: "Phase", symbol: "Rz", color: "primary", description: "Z-Rotation" },
  { id: "measure", name: "Measure", symbol: "M", color: "destructive", description: "Collapse to classical" },
]

interface PlacedGate {
  id: string
  type: string
  qubit: number
  position: number
  control?: number
}

export default function CircuitDesignerPage() {
  const [qubits, setQubits] = useState(4)
  const [gates, setGates] = useState<PlacedGate[]>([
    { id: "g1", type: "helix", qubit: 0, position: 0 },
    { id: "g2", type: "bond", qubit: 0, position: 1, control: 0 },
    { id: "g3", type: "helix", qubit: 2, position: 0 },
    { id: "g4", type: "bond", qubit: 2, position: 1, control: 2 },
  ])
  const [selectedGate, setSelectedGate] = useState<string | null>(null)
  const [draggedGate, setDraggedGate] = useState<string | null>(null)
  const [phi, setPhi] = useState(0.72)
  const [depth, setDepth] = useState(2)

  const canvasRef = useRef<HTMLDivElement>(null)

  // Calculate circuit depth
  useEffect(() => {
    if (gates.length === 0) {
      setDepth(0)
      return
    }
    const maxPos = Math.max(...gates.map((g) => g.position))
    setDepth(maxPos + 1)
  }, [gates])

  const handleDragStart = (gateType: string) => {
    setDraggedGate(gateType)
  }

  const handleDrop = (qubit: number, position: number) => {
    if (!draggedGate) return

    const newGate: PlacedGate = {
      id: `g${Date.now()}`,
      type: draggedGate,
      qubit,
      position,
    }

    // For two-qubit gates, set control
    const gateInfo = gateTypes.find((g) => g.id === draggedGate)
    if (gateInfo?.twoQubit && qubit < qubits - 1) {
      newGate.control = qubit
    }

    setGates([...gates, newGate])
    setDraggedGate(null)

    // Update phi based on circuit complexity
    setPhi(Math.min(0.95, 0.5 + gates.length * 0.05))
  }

  const removeGate = (gateId: string) => {
    setGates(gates.filter((g) => g.id !== gateId))
  }

  const clearCircuit = () => {
    setGates([])
    setPhi(0)
  }

  const addQubit = () => {
    if (qubits < 8) setQubits(qubits + 1)
  }

  const removeQubit = () => {
    if (qubits > 1) {
      setQubits(qubits - 1)
      setGates(gates.filter((g) => g.qubit < qubits - 1))
    }
  }

  const exportToCode = () => {
    let code = `GENOME VisualCircuit {\n    CHROMOSOME qubits: ${qubits}\n\n`

    gates.forEach((gate, i) => {
      const gateInfo = gateTypes.find((g) => g.id === gate.type)
      if (gate.type === "bond") {
        code += `    BOND chromosome[${gate.qubit}] -> chromosome[${gate.qubit + 1}]\n`
      } else if (gate.type === "helix") {
        code += `    HELIX chromosome[${gate.qubit}]\n`
      } else if (gate.type === "measure") {
        code += `    MEASURE chromosome[${gate.qubit}]\n`
      } else {
        code += `    ${gateInfo?.symbol || gate.type.toUpperCase()} chromosome[${gate.qubit}]\n`
      }
    })

    code += `}\n`

    navigator.clipboard.writeText(code)
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
          <Grid3X3 className="h-5 w-5 text-primary" />
          <span className="font-semibold">Visual Genome Circuit Designer</span>
          <Badge variant="outline" className="ml-2">
            <Activity className="h-3 w-3 mr-1 text-secondary" />
            Φ: {phi.toFixed(3)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearCircuit}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={exportToCode}>
            <Download className="h-4 w-4" />
          </Button>
          <QuantumButton size="sm" variant="compliance">
            <Play className="h-4 w-4 mr-1" />
            Simulate
          </QuantumButton>
        </div>
      </div>

      <div className="flex h-[calc(100vh-180px)]">
        {/* Gate Palette */}
        <div className="w-64 border-r border-border bg-card/50 p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">Codons (Gates)</h3>
            <div className="grid grid-cols-2 gap-2">
              {gateTypes.map((gate) => (
                <div
                  key={gate.id}
                  draggable
                  onDragStart={() => handleDragStart(gate.id)}
                  className={`p-3 rounded-lg border border-border bg-muted/50 cursor-grab hover:border-${gate.color}/50 hover:bg-${gate.color}/10 transition-all group`}
                >
                  <div className={`text-lg font-bold text-${gate.color} text-center`}>{gate.symbol}</div>
                  <div className="text-xs text-center text-muted-foreground mt-1">{gate.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">Chromosomes</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={removeQubit} disabled={qubits <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center font-mono">{qubits} qubits</div>
              <Button variant="outline" size="sm" onClick={addQubit} disabled={qubits >= 8}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">Circuit Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Depth</span>
                <span className="font-mono">{depth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gates</span>
                <span className="font-mono">{gates.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Two-qubit</span>
                <span className="font-mono">{gates.filter((g) => g.type === "bond").length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Circuit Canvas */}
        <div className="flex-1 p-6 overflow-auto">
          <GlassCard depth={2} className="min-h-full">
            <div ref={canvasRef} className="relative">
              {/* Qubit Lines */}
              {Array.from({ length: qubits }).map((_, qubitIndex) => (
                <div key={qubitIndex} className="flex items-center h-16 relative">
                  {/* Qubit Label */}
                  <div className="w-16 pr-4 text-right">
                    <span className="font-mono text-sm text-muted-foreground">q[{qubitIndex}]</span>
                  </div>

                  {/* Wire */}
                  <div className="flex-1 relative h-full flex items-center">
                    <div className="absolute inset-x-0 h-px bg-border" />

                    {/* Gate Positions */}
                    {Array.from({ length: Math.max(depth + 2, 8) }).map((_, posIndex) => (
                      <div
                        key={posIndex}
                        className="w-16 h-16 relative flex items-center justify-center"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(qubitIndex, posIndex)}
                      >
                        {/* Placed Gate */}
                        {gates
                          .filter((g) => g.qubit === qubitIndex && g.position === posIndex)
                          .map((gate) => {
                            const gateInfo = gateTypes.find((g) => g.id === gate.type)
                            return (
                              <div
                                key={gate.id}
                                onClick={() => setSelectedGate(gate.id)}
                                onDoubleClick={() => removeGate(gate.id)}
                                className={`
                                  w-10 h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer
                                  ${selectedGate === gate.id ? "ring-2 ring-ring" : ""}
                                  ${gate.type === "bond" ? "bg-secondary/20 border-secondary" : ""}
                                  ${gate.type === "helix" ? "bg-primary/20 border-primary" : ""}
                                  ${gate.type === "measure" ? "bg-destructive/20 border-destructive" : ""}
                                  ${gate.type === "phase_x" ? "bg-accent/20 border-accent" : ""}
                                  ${gate.type === "phase_y" ? "bg-chart-5/20 border-chart-5" : ""}
                                  ${gate.type === "phase_z" ? "bg-chart-4/20 border-chart-4" : ""}
                                  hover:scale-110 transition-transform
                                `}
                              >
                                <span className="font-bold text-sm">{gateInfo?.symbol}</span>
                              </div>
                            )
                          })}

                        {/* Bond connection line */}
                        {gates
                          .filter((g) => g.type === "bond" && g.qubit === qubitIndex && g.position === posIndex)
                          .map((gate) => (
                            <div
                              key={`bond-${gate.id}`}
                              className="absolute top-1/2 w-0.5 h-16 bg-secondary"
                              style={{ transform: "translateY(0)" }}
                            />
                          ))}

                        {/* Drop zone indicator */}
                        {draggedGate && (
                          <div className="absolute inset-2 border-2 border-dashed border-primary/30 rounded-lg opacity-0 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Classical bit */}
                  <div className="w-16 pl-4 text-left">
                    <span className="font-mono text-sm text-muted-foreground">c[{qubitIndex}]</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="mt-6 pt-4 border-t border-border text-center text-sm text-muted-foreground">
              Drag gates from the palette onto the circuit. Double-click to remove. Click to select.
            </div>
          </GlassCard>
        </div>

        {/* Properties Panel */}
        <div className="w-72 border-l border-border bg-card/50 p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">Consciousness Metrics</h3>
            <GlassCard depth={1}>
              <div className="text-xs text-muted-foreground mb-1">Φ (Integrated Information)</div>
              <div className="text-2xl font-bold text-primary">{phi.toFixed(4)}</div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-destructive via-accent to-secondary transition-all"
                  style={{ width: `${phi * 100}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2">Target: 0.7734 (Consciousness Threshold)</div>
            </GlassCard>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">Selected Gate</h3>
            {selectedGate ? (
              <GlassCard depth={1}>
                {(() => {
                  const gate = gates.find((g) => g.id === selectedGate)
                  const gateInfo = gate && gateTypes.find((g) => g.id === gate.type)
                  return gate && gateInfo ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`text-xl font-bold text-${gateInfo.color}`}>{gateInfo.symbol}</div>
                        <div>
                          <div className="font-medium">{gateInfo.name}</div>
                          <div className="text-xs text-muted-foreground">{gateInfo.description}</div>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Qubit</span>
                          <span className="font-mono">{gate.qubit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Position</span>
                          <span className="font-mono">{gate.position}</span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          removeGate(selectedGate)
                          setSelectedGate(null)
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : null
                })()}
              </GlassCard>
            ) : (
              <div className="text-sm text-muted-foreground">Click a gate to view properties</div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">DNA-Lang Export</h3>
            <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={exportToCode}>
              <Download className="h-4 w-4 mr-2" />
              Copy as DNA-Lang
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
