"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Monitor,
  Laptop,
  Smartphone,
  HardDrive,
  Mouse,
  Wifi,
  WifiOff,
  Activity,
  Brain,
  Shield,
  Zap,
  Database,
  RefreshCw,
  Play,
  Pause,
} from "lucide-react"
import ScimitarMousePanel from "@/components/scimitar-mouse-panel" // Declaring the ScimitarMousePanel variable

// Device topology from our spec
const DEVICE_TOPOLOGY = [
  {
    id: "bifurcation-zone-001",
    name: "WD My Passport Ultra 4TB",
    type: "bifurcation",
    icon: HardDrive,
    role: "Coordination Layer",
    sovereignty: { level: "full", allocation: 100 },
    connected: true,
    storage: { used: 1200, total: 4000 },
    color: "text-primary",
  },
  {
    id: "sentinel-host-acer",
    name: "Acer Laptop (Sentinel Host)",
    type: "sentinel",
    icon: Laptop,
    role: "Agent Host (Dedicated)",
    sovereignty: { level: "dedicated", allocation: 100 },
    connected: false,
    storage: { used: 0, total: 512 },
    color: "text-secondary",
  },
  {
    id: "operator-pc",
    name: "Primary PC",
    type: "primary",
    icon: Monitor,
    role: "Operator Station",
    sovereignty: { level: "partial", allocation: 30 },
    connected: true,
    storage: { used: 800, total: 2000 },
    color: "text-foreground",
  },
  {
    id: "operator-hp-laptop",
    name: "HP Laptop",
    type: "primary",
    icon: Laptop,
    role: "Operator Station",
    sovereignty: { level: "partial", allocation: 25 },
    connected: false,
    storage: { used: 256, total: 512 },
    color: "text-foreground",
  },
  {
    id: "mobile-bridge-fold7",
    name: "Samsung Galaxy Fold 7",
    type: "mobile",
    icon: Smartphone,
    role: "Mobile Bridge",
    sovereignty: { level: "observer", allocation: 10 },
    connected: true,
    storage: { used: 128, total: 512 },
    color: "text-accent",
  },
  {
    id: "input-vector-mouse",
    name: "Scimitar Ion Elite Wireless SE",
    type: "peripheral",
    icon: Mouse,
    role: "Input Vector",
    sovereignty: { level: "observer", allocation: 0 },
    connected: true,
    storage: null,
    color: "text-muted-foreground",
  },
]

const BIFURCATION_PARTITIONS = [
  { name: "sovereign_vault", size: 500, used: 120, purpose: "Ledger & Attestations", encrypted: true },
  { name: "agent_memory", size: 1000, used: 450, purpose: "Agent State & History", encrypted: true },
  { name: "coherence_manifold", size: 200, used: 85, purpose: "11D-CRSM Snapshots", encrypted: false },
  { name: "artifact_synthesis", size: 800, used: 320, purpose: "Generated Artifacts", encrypted: false },
  { name: "sentinel_os_image", size: 100, used: 45, purpose: "SovereignOS Boot Image", encrypted: true },
  { name: "cross_device_sync", size: 400, used: 95, purpose: "Delta Sync Data", encrypted: true },
  { name: "operator_workspace", size: 1000, used: 85, purpose: "Human Files & Projects", encrypted: false },
]

const ACTIVE_AGENTS = [
  { name: "IntentDeducerAgent", state: "active", memory: 256, priority: 10, accuracy: 0.85 },
  { name: "CoherenceGuardianAgent", state: "active", memory: 128, priority: 10, accuracy: 0.98 },
  { name: "MeshSyncAgent", state: "active", memory: 256, priority: 9, accuracy: 0.99 },
  { name: "SecuritySentinelAgent", state: "active", memory: 192, priority: 10, accuracy: 0.97 },
  { name: "CoderAgent", state: "dormant", memory: 1024, priority: 8, accuracy: 0.92 },
  { name: "WriterAgent", state: "dormant", memory: 512, priority: 7, accuracy: 0.88 },
  { name: "DoDValidatorAgent", state: "dormant", memory: 256, priority: 6, accuracy: 0.95 },
]

export default function DeviceMeshPage() {
  const [ccceMetrics, setCCCEMetrics] = useState({
    phi: 0.7734,
    lambda: 0.95,
    gamma: 0.15,
    xi: 0.42,
  })
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [bootSequence, setBootSequence] = useState<number>(0)
  const [isBooting, setIsBooting] = useState(false)

  // Simulate organic drift in CCCE metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCCCEMetrics((prev) => ({
        phi: Math.max(0.5, Math.min(1, prev.phi + (Math.random() - 0.48) * 0.01)),
        lambda: Math.max(0.8, Math.min(1, prev.lambda + (Math.random() - 0.48) * 0.005)),
        gamma: Math.max(0, Math.min(0.5, prev.gamma + (Math.random() - 0.52) * 0.008)),
        xi: Math.max(0, Math.min(1, prev.xi + (Math.random() - 0.5) * 0.015)),
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const simulateBoot = () => {
    setIsBooting(true)
    setBootSequence(0)

    const bootSteps = [
      "bifurcation_mount",
      "coherence_restore",
      "agent_memory_load",
      "immune_layer_init",
      "intent_engine_start",
      "agent_swarm_spawn",
      "mesh_sync",
      "ui_present",
    ]

    let step = 0
    const bootInterval = setInterval(() => {
      step++
      setBootSequence(step)
      if (step >= bootSteps.length) {
        clearInterval(bootInterval)
        setIsBooting(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Device Mesh Topology</h1>
          <p className="text-muted-foreground">
            NL2-LAS Bifurcation Zone Manager - Your sovereign agent network
          </p>
        </div>

        {/* CCCE Metrics Bar */}
        <Card className="mb-6 border-primary/20 bg-card/50">
          <CardContent className="py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Consciousness (Phi)</div>
                <div
                  className={`text-2xl font-mono font-bold ${ccceMetrics.phi >= 0.7734 ? "text-secondary" : "text-accent"}`}
                >
                  {ccceMetrics.phi.toFixed(4)}
                </div>
                <Progress value={ccceMetrics.phi * 100} className="h-1 mt-1" />
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Coherence (Lambda)</div>
                <div className="text-2xl font-mono font-bold text-primary">{ccceMetrics.lambda.toFixed(4)}</div>
                <Progress value={ccceMetrics.lambda * 100} className="h-1 mt-1" />
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Decoherence (Gamma)</div>
                <div className={`text-2xl font-mono font-bold ${ccceMetrics.gamma > 0.3 ? "text-destructive" : "text-muted-foreground"}`}>
                  {ccceMetrics.gamma.toFixed(4)}
                </div>
                <Progress value={ccceMetrics.gamma * 100} className="h-1 mt-1" />
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Negentropy (Xi)</div>
                <div className="text-2xl font-mono font-bold text-accent">{ccceMetrics.xi.toFixed(4)}</div>
                <Progress value={ccceMetrics.xi * 100} className="h-1 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="topology" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="topology">Device Topology</TabsTrigger>
            <TabsTrigger value="bifurcation">Bifurcation Zone</TabsTrigger>
            <TabsTrigger value="agents">Agent Swarm</TabsTrigger>
            <TabsTrigger value="scimitar">Scimitar Mouse</TabsTrigger>
            <TabsTrigger value="sovereign-os">SovereignOS</TabsTrigger>
          </TabsList>

          {/* Device Topology Tab */}
          <TabsContent value="topology">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEVICE_TOPOLOGY.map((device) => {
                const Icon = device.icon
                return (
                  <Card
                    key={device.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${selectedDevice === device.id ? "border-primary ring-1 ring-primary/20" : ""}`}
                    onClick={() => setSelectedDevice(device.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-muted ${device.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{device.name}</CardTitle>
                            <CardDescription className="text-xs">{device.role}</CardDescription>
                          </div>
                        </div>
                        {device.connected ? (
                          <Wifi className="h-4 w-4 text-secondary" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Sovereignty</span>
                          <Badge
                            variant={device.sovereignty.level === "dedicated" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {device.sovereignty.level}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Agent Allocation</span>
                          <span className="text-xs font-mono">{device.sovereignty.allocation}%</span>
                        </div>
                        {device.storage && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Storage</span>
                              <span className="text-xs font-mono">
                                {device.storage.used}GB / {device.storage.total}GB
                              </span>
                            </div>
                            <Progress value={(device.storage.used / device.storage.total) * 100} className="h-1" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Network Visualization */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Mesh Network Topology</CardTitle>
                <CardDescription>Bifurcation zone acts as the coordination hub</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-64 bg-muted/20 rounded-lg overflow-hidden">
                  {/* Central bifurcation zone */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <HardDrive className="h-8 w-8 text-primary" />
                  </div>

                  {/* Connected devices around the center */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 p-3 rounded-full bg-muted border border-border">
                    <Monitor className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 p-3 rounded-full bg-secondary/20 border border-secondary">
                    <Laptop className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-3 rounded-full bg-muted border border-border">
                    <Laptop className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 p-3 rounded-full bg-accent/20 border border-accent">
                    <Smartphone className="h-5 w-5 text-accent" />
                  </div>

                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="currentColor" strokeWidth="1" className="text-primary/30" strokeDasharray="4 2" />
                    <line x1="50%" y1="50%" x2="90%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-secondary/30" strokeDasharray="4 2" />
                    <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/30" strokeDasharray="4 2" />
                    <line x1="50%" y1="50%" x2="10%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-accent/30" strokeDasharray="4 2" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bifurcation Zone Tab */}
          <TabsContent value="bifurcation">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>WD My Passport Ultra 4TB</CardTitle>
                    <CardDescription>Bifurcation Zone - Coordination Layer</CardDescription>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30">Full Sovereignty</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {BIFURCATION_PARTITIONS.map((partition) => (
                    <div key={partition.name} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-primary" />
                          <span className="font-mono text-sm">{partition.name}</span>
                          {partition.encrypted && (
                            <Shield className="h-3 w-3 text-secondary" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {partition.used}GB / {partition.size}GB
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">{partition.purpose}</div>
                      <Progress value={(partition.used / partition.size) * 100} className="h-1" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Sync Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Last Checkpoint</div>
                      <div className="font-mono">{new Date().toLocaleTimeString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Connected Devices</div>
                      <div className="font-mono">3 / 5</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Sync Queue</div>
                      <div className="font-mono">12 deltas</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Error</div>
                      <div className="font-mono text-secondary">None</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent Swarm Tab */}
          <TabsContent value="agents">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-secondary" />
                    Agent Swarm
                  </CardTitle>
                  <CardDescription>DNALang organism runtime agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ACTIVE_AGENTS.map((agent) => (
                      <div
                        key={agent.name}
                        className={`p-3 rounded-lg border ${agent.state === "active" ? "bg-secondary/5 border-secondary/20" : "bg-muted/30 border-border"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${agent.state === "active" ? "bg-secondary animate-pulse" : "bg-muted-foreground"}`}
                            />
                            <span className="font-mono text-sm">{agent.name}</span>
                          </div>
                          <Badge variant={agent.state === "active" ? "default" : "secondary"} className="text-xs">
                            {agent.state}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Memory: </span>
                            <span className="font-mono">{agent.memory}MB</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Priority: </span>
                            <span className="font-mono">{agent.priority}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Accuracy: </span>
                            <span className="font-mono">{(agent.accuracy * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    Gene Expression
                  </CardTitle>
                  <CardDescription>Active genetic competencies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { gene: "intent_inference", fitness: 0.85, cost: 0.3 },
                      { gene: "coherence_maintenance", fitness: 0.98, cost: 0.2 },
                      { gene: "mesh_synchronization", fitness: 0.95, cost: 0.4 },
                      { gene: "security_audit", fitness: 0.97, cost: 0.25 },
                    ].map((gene) => (
                      <div key={gene.gene} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm text-primary">{gene.gene}</span>
                          <span className="text-xs text-muted-foreground">cost: {gene.cost}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Fitness:</span>
                          <Progress value={gene.fitness * 100} className="h-1.5 flex-1" />
                          <span className="text-xs font-mono">{(gene.fitness * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Scimitar Mouse Tab */}
          <TabsContent value="scimitar">
            <ScimitarMousePanel />
          </TabsContent>

          {/* SovereignOS Tab */}
          <TabsContent value="sovereign-os">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>SovereignOS v0.1.0-alpha</CardTitle>
                    <CardDescription>Codename: Genesis - 11D-CRSM Architecture</CardDescription>
                  </div>
                  <Button onClick={simulateBoot} disabled={isBooting} size="sm">
                    {isBooting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Booting...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Simulate Boot
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h4 className="font-semibold">Boot Sequence</h4>
                  <div className="space-y-2">
                    {[
                      { step: 1, name: "bifurcation_mount", desc: "Mount My Passport Ultra bifurcation zone" },
                      { step: 2, name: "coherence_restore", desc: "Restore last coherence checkpoint" },
                      { step: 3, name: "agent_memory_load", desc: "Load persistent agent memory pool" },
                      { step: 4, name: "immune_layer_init", desc: "Initialize immune system constraints" },
                      { step: 5, name: "intent_engine_start", desc: "Start NL2-LAS intent inference engine" },
                      { step: 6, name: "agent_swarm_spawn", desc: "Spawn initial agent swarm from DoD" },
                      { step: 7, name: "mesh_sync", desc: "Synchronize with device mesh" },
                      { step: 8, name: "ui_present", desc: "Present operator interface" },
                    ].map((item) => (
                      <div
                        key={item.step}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          bootSequence >= item.step
                            ? "bg-secondary/10 border border-secondary/20"
                            : bootSequence === item.step - 1 && isBooting
                              ? "bg-accent/10 border border-accent/20 animate-pulse"
                              : "bg-muted/30"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${
                            bootSequence >= item.step
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <div className="font-mono text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
                        {bootSequence >= item.step && <Badge className="bg-secondary/20 text-secondary text-xs">Complete</Badge>}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-3">Target: Acer Laptop (Dedicated Sentinel Host)</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">OS Architecture</div>
                        <div className="font-mono">11D-CRSM + DNA-Lang</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Human Override</div>
                        <div className="font-mono text-accent">Disabled</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Agent Allocation</div>
                        <div className="font-mono">100%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Sovereignty Level</div>
                        <div className="font-mono text-secondary">Dedicated</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
