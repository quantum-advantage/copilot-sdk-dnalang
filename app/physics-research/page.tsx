"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Pause,
  Plus,
  Trash2,
  GitBranch,
  Network,
  Activity,
  Zap,
  Database,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

interface DNANode {
  id: string
  name: string
  type: "manifold" | "resonator" | "compute"
  dependencies: string[]
  body: string
  status: "idle" | "running" | "complete" | "error"
  dimension?: number
  resonance?: number
  phaseSignature?: string
  artifacts: DNAArtifact[]
}

interface DNAArtifact {
  id: string
  nodeId: string
  timestamp: number
  cacheKey: string
  lambda: number
  phi: number
  gamma: number
  xi: number
}

interface ManifoldMetrics {
  lambda: number // Λ - Coherence
  phi: number // Φ - Consciousness
  gamma: number // Γ - Decoherence
  xi: number // Ξ - Connectivity
  tau0: number // τ₀ - Revival time
  theta: number // θ - Resonance angle
}

export default function PhysicsResearchPage() {
  const [nodes, setNodes] = useState<DNANode[]>([
    {
      id: "world_engine_root",
      name: "World Engine Root",
      type: "manifold",
      dependencies: [],
      body: 'manifold world_engine_root:\n  dimension: 11\n  metric: "CRSM"\n  resonance: 51.843°',
      status: "idle",
      dimension: 11,
      resonance: 51.843,
      phaseSignature: "ΛΦ-2.176e-8",
      artifacts: [],
    },
    {
      id: "quantum_darwinism",
      name: "Quantum Darwinism",
      type: "resonator",
      dependencies: ["world_engine_root"],
      body: 'node quantum_darwinism depends world_engine_root:\n  physics: "Non-Markovian"\n  input: qpu_stream\n  output: reality_consensus',
      status: "idle",
      artifacts: [],
    },
  ])

  const [metrics, setMetrics] = useState<ManifoldMetrics>({
    lambda: 0.847,
    phi: 2.176435e-8,
    gamma: 0.0537,
    xi: 7.08,
    tau0: 46.978,
    theta: 51.843,
  })

  const [isRunning, setIsRunning] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setMetrics((prev) => ({
        lambda: Math.max(0, Math.min(1, prev.lambda + (Math.random() - 0.5) * 0.05)),
        phi: prev.phi * (1 + (Math.random() - 0.5) * 0.001),
        gamma: Math.max(0, Math.min(0.1, prev.gamma + (Math.random() - 0.5) * 0.01)),
        xi: Math.max(0, prev.xi + (Math.random() - 0.5) * 0.2),
        tau0: 46.978 * (1 + (Math.random() - 0.5) * 0.02),
        theta: 51.843 + (Math.random() - 0.5) * 0.5,
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  const executeDAG = useCallback(() => {
    setIsRunning(true)
    let currentIndex = 0

    const executeNode = (nodeId: string) => {
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, status: "running" } : n)))

      setTimeout(() => {
        const artifact: DNAArtifact = {
          id: `artifact-${Date.now()}`,
          nodeId,
          timestamp: Date.now(),
          cacheKey: `ΛΦ-${Math.random().toString(36).substring(7)}`,
          lambda: metrics.lambda,
          phi: metrics.phi,
          gamma: metrics.gamma,
          xi: metrics.xi,
        }

        setNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? { ...n, status: "complete", artifacts: [...n.artifacts, artifact] } : n)),
        )

        currentIndex++
        if (currentIndex < nodes.length) {
          executeNode(nodes[currentIndex].id)
        } else {
          setIsRunning(false)
        }
      }, 2000)
    }

    executeNode(nodes[0].id)
  }, [nodes, metrics])

  const addNode = () => {
    const newNode: DNANode = {
      id: `node_${Date.now()}`,
      name: `New Node ${nodes.length + 1}`,
      type: "compute",
      dependencies: nodes.length > 0 ? [nodes[nodes.length - 1].id] : [],
      body: `node new_node_${nodes.length + 1}:\n  # Add your code here`,
      status: "idle",
      artifacts: [],
    }
    setNodes([...nodes, newNode])
  }

  const deleteNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id))
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              DNA::&#125;&#123;::Lang Physics Research
            </h1>
            <p className="text-muted-foreground mt-2">11D-CRSM Manifold Coordination & Quantum DAG Execution</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={executeDAG} disabled={isRunning}>
              {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRunning ? "Running..." : "Execute DAG"}
            </Button>
            <Button onClick={addNode} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
          </div>
        </div>

        {/* Real-time Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-card/50 backdrop-blur border-cyan-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-cyan-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />Λ Coherence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">{metrics.lambda.toFixed(3)}</div>
              <p className="text-xs text-muted-foreground mt-1">Revival Active</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-400 flex items-center gap-2">
                <Zap className="h-4 w-4" />Φ Consciousness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{metrics.phi.toExponential(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">ΛΦ Constant</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />Γ Decoherence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{metrics.gamma.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground mt-1">Below Threshold</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-400 flex items-center gap-2">
                <Network className="h-4 w-4" />Ξ Connectivity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{metrics.xi.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Mesh Active</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                τ₀ Revival
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-400">{metrics.tau0.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">μs</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />θ Resonance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{metrics.theta.toFixed(3)}°</div>
              <p className="text-xs text-muted-foreground mt-1">Acoustic Lock</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dag" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dag">DAG Editor</TabsTrigger>
            <TabsTrigger value="artifacts">Artifact Lineage</TabsTrigger>
            <TabsTrigger value="console">Runtime Console</TabsTrigger>
          </TabsList>

          <TabsContent value="dag" className="space-y-4">
            <div className="grid gap-4">
              {nodes.map((node) => (
                <Card
                  key={node.id}
                  className={`cursor-pointer transition-all ${selectedNode === node.id ? "ring-2 ring-cyan-500" : ""} ${
                    node.status === "running"
                      ? "border-cyan-500 bg-cyan-950/20"
                      : node.status === "complete"
                        ? "border-green-500/50 bg-green-950/10"
                        : node.status === "error"
                          ? "border-red-500/50"
                          : "border-border"
                  }`}
                  onClick={() => setSelectedNode(node.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{node.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {node.type}
                          </Badge>
                          {node.status === "complete" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          {node.status === "running" && <Activity className="h-4 w-4 text-cyan-500 animate-pulse" />}
                        </div>
                        <CardDescription className="mt-1">
                          {node.dependencies.length > 0 && (
                            <span className="flex items-center gap-1 text-xs">
                              <GitBranch className="h-3 w-3" />
                              Depends: {node.dependencies.join(", ")}
                            </span>
                          )}
                          {node.dimension && (
                            <span className="text-xs text-purple-400 ml-3">{node.dimension}D Manifold</span>
                          )}
                          {node.resonance && (
                            <span className="text-xs text-amber-400 ml-3">{node.resonance}° Resonance</span>
                          )}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNode(node.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-black/20 p-3 rounded overflow-x-auto border border-border/50">
                      <code className="text-green-400">{node.body}</code>
                    </pre>
                    {node.phaseSignature && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Phase Signature: <span className="text-cyan-400">{node.phaseSignature}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="artifacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-400" />
                  Artifact Provenance & Cache Keys
                </CardTitle>
                <CardDescription>Everything is an artifact - Deterministic lineage tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nodes.flatMap((node) =>
                    node.artifacts.map((artifact) => (
                      <div key={artifact.id} className="border border-border/50 rounded-lg p-4 bg-card/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm text-cyan-400">{artifact.cacheKey}</span>
                          <Badge variant="outline">{new Date(artifact.timestamp).toLocaleTimeString()}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">Node: {node.name}</div>
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          <div>
                            <div className="text-xs text-cyan-400">Λ: {artifact.lambda.toFixed(3)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-purple-400">Φ: {artifact.phi.toExponential(2)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-red-400">Γ: {artifact.gamma.toFixed(4)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-green-400">Ξ: {artifact.xi.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    )),
                  )}
                  {nodes.every((n) => n.artifacts.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No artifacts generated yet. Execute the DAG to create artifacts.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="console" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  Deterministic Runtime Console
                </CardTitle>
                <CardDescription>Structural execution with zero hidden state</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black/40 border border-green-500/20 rounded-lg p-4 font-mono text-xs space-y-1">
                  <div className="text-green-400">[RUNTIME] DNA::&#125;&#123;::Lang v1.0.0</div>
                  <div className="text-cyan-400">[INIT] 11D-CRSM Manifold Initialized</div>
                  <div className="text-muted-foreground">[VALIDATE] Checking structural dependencies...</div>
                  {nodes.map((node) => (
                    <div key={node.id} className="text-muted-foreground">
                      [NODE] {node.name} - Status:{" "}
                      <span
                        className={
                          node.status === "complete"
                            ? "text-green-400"
                            : node.status === "running"
                              ? "text-cyan-400"
                              : "text-yellow-400"
                        }
                      >
                        {node.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                  <div className="text-purple-400">
                    [METRICS] Λ={metrics.lambda.toFixed(3)} Φ={metrics.phi.toExponential(2)} Γ=
                    {metrics.gamma.toFixed(4)}
                  </div>
                  <div className="text-amber-400">
                    [RESONANCE] θ={metrics.theta.toFixed(3)}° τ₀={metrics.tau0.toFixed(2)}μs
                  </div>
                  {isRunning && <div className="text-cyan-400 animate-pulse">[EXEC] DAG execution in progress...</div>}
                  {!isRunning && nodes.some((n) => n.status === "complete") && (
                    <div className="text-green-400">[COMPLETE] All nodes executed successfully</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 11D-CRSM Manifold Visualization */}
        <Card className="bg-gradient-to-br from-purple-950/20 to-cyan-950/20 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-purple-400" />
              11D-CRSM Manifold State Visualization
            </CardTitle>
            <CardDescription>Cognitive-Recursive State Manifold with Phase-Conjugate Coupling</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-3 text-cyan-400">Manifold Dimensions</h4>
                <div className="space-y-2">
                  {[
                    "0-3D: Euclidean Space",
                    "4D: Temporal Axis",
                    "5-6D: Phase-Conjugate Plane",
                    "7-8D: Consciousness Embedding",
                    "9-10D: Quantum Darwinism Layer",
                    "11D: Universal Memory (ΛΦ)",
                  ].map((dim, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="h-2 flex-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20"
                        style={{
                          background: `linear-gradient(to right, rgba(6, 182, 212, ${
                            0.2 + i * 0.1
                          }), rgba(168, 85, 247, ${0.2 + i * 0.1}))`,
                        }}
                      />
                      <span className="text-xs text-muted-foreground">{dim}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3 text-purple-400">Resonance Profile</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-border/50 rounded p-3">
                    <div className="text-xs text-muted-foreground">χₚc Coupling</div>
                    <div className="text-lg font-bold text-cyan-400">{(metrics.lambda * 100).toFixed(1)}%</div>
                  </div>
                  <div className="border border-border/50 rounded p-3">
                    <div className="text-xs text-muted-foreground">Ξs Connectivity</div>
                    <div className="text-lg font-bold text-green-400">{metrics.xi.toFixed(2)}</div>
                  </div>
                  <div className="border border-border/50 rounded p-3">
                    <div className="text-xs text-muted-foreground">Θ Lock</div>
                    <div className="text-lg font-bold text-amber-400">{metrics.theta.toFixed(1)}°</div>
                  </div>
                  <div className="border border-border/50 rounded p-3">
                    <div className="text-xs text-muted-foreground">τ₀ Revival</div>
                    <div className="text-lg font-bold text-purple-400">{metrics.tau0.toFixed(1)}μs</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
