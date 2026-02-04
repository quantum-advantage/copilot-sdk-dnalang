"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Atom,
  Beaker,
  Cpu,
  Activity,
  FlaskConical,
  Zap,
  BarChart3,
  Layers,
  Play,
  Pause,
  RotateCcw,
  Download,
  Plus,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Settings,
  Sparkles,
} from "lucide-react"

// Types for the dashboard
interface SimulationJob {
  id: string
  name: string
  type: "energy" | "optimization" | "workflow"
  status: "queued" | "running" | "completed" | "failed"
  progress: number
  quantumAdvantage: number
  startTime: string
  estimatedCompletion?: string
}

interface SAMAnalogData {
  id: string
  name: string
  stability: number
  matCompatibility: number
  mtCompatibility: number
  synthesisYield: number
  isostere: string
}

export default function QuantumDrugDiscoveryPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedBackend, setSelectedBackend] = useState("simulator")
  const [maxQubits, setMaxQubits] = useState([32])
  const [errorMitigation, setErrorMitigation] = useState(true)
  const [isSimulating, setIsSimulating] = useState(false)

  // Sample data
  const simulationJobs: SimulationJob[] = [
    {
      id: "sim-001",
      name: "BRCA1 Binding Site Analysis",
      type: "energy",
      status: "completed",
      progress: 100,
      quantumAdvantage: 15.2,
      startTime: "2024-01-15 10:30",
    },
    {
      id: "sim-002",
      name: "SAM-Tetrazole Optimization",
      type: "optimization",
      status: "running",
      progress: 67,
      quantumAdvantage: 8.5,
      startTime: "2024-01-15 11:15",
      estimatedCompletion: "12:30",
    },
    {
      id: "sim-003",
      name: "MT Target Elucidation Workflow",
      type: "workflow",
      status: "queued",
      progress: 0,
      quantumAdvantage: 0,
      startTime: "Pending",
    },
  ]

  const samAnalogs: SAMAnalogData[] = [
    { id: "tsam-1", name: "tSAM-Methyl", stability: 95, matCompatibility: 65, mtCompatibility: 85, synthesisYield: 77, isostere: "tetrazole" },
    { id: "tsam-2", name: "tSAM-Allyl", stability: 92, matCompatibility: 58, mtCompatibility: 78, synthesisYield: 72, isostere: "tetrazole" },
    { id: "asam-1", name: "aSAM-Methyl", stability: 75, matCompatibility: 80, mtCompatibility: 82, synthesisYield: 85, isostere: "amide" },
    { id: "sam-1", name: "SAM-Propargyl", stability: 45, matCompatibility: 90, mtCompatibility: 88, synthesisYield: 65, isostere: "native" },
    { id: "pmsam-1", name: "pmSAM-Methyl", stability: 88, matCompatibility: 55, mtCompatibility: 70, synthesisYield: 60, isostere: "ProMet" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500"
      case "running": return "bg-blue-500"
      case "queued": return "bg-amber-500"
      case "failed": return "bg-red-500"
      default: return "bg-muted"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case "running": return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      case "queued": return <Clock className="h-4 w-4 text-amber-500" />
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Atom className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Quantum Drug Discovery Platform</h1>
              <p className="text-sm text-muted-foreground">
                Quantum-enhanced molecular simulation and SAM analog optimization
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Cpu className="h-3 w-3" />
              {selectedBackend === "simulator" ? "Quantum Simulator" : selectedBackend.toUpperCase()}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              {maxQubits[0]} Qubits
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="simulation" className="gap-2">
              <Atom className="h-4 w-4" />
              <span className="hidden sm:inline">Simulation</span>
            </TabsTrigger>
            <TabsTrigger value="sam-analogs" className="gap-2">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">SAM Analogs</span>
            </TabsTrigger>
            <TabsTrigger value="synthesis" className="gap-2">
              <Beaker className="h-4 w-4" />
              <span className="hidden sm:inline">Synthesis</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Simulations</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">1 running, 2 queued</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quantum Advantage</CardTitle>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15.2x</div>
                  <p className="text-xs text-muted-foreground">Average speedup factor</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">SAM Analogs</CardTitle>
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">In optimization library</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Synthesis Routes</CardTitle>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Optimized pathways</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Simulations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Simulations</CardTitle>
                  <CardDescription>Quantum molecular simulations and workflows</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {simulationJobs.map((job) => (
                      <div key={job.id} className="flex items-center gap-4">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(job.status)}`} />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{job.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {job.type}
                            </Badge>
                          </div>
                          {job.status === "running" && (
                            <Progress value={job.progress} className="h-1" />
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {getStatusIcon(job.status)}
                            <span>{job.status}</span>
                            {job.quantumAdvantage > 0 && (
                              <>
                                <span className="text-muted">|</span>
                                <Zap className="h-3 w-3" />
                                <span>{job.quantumAdvantage}x advantage</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* SAM Analog Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>SAM Analog Performance</CardTitle>
                  <CardDescription>Stability and compatibility metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {samAnalogs.slice(0, 4).map((analog) => (
                      <div key={analog.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{analog.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {analog.isostere}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{analog.synthesisYield}% yield</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Stability</span>
                              <span>{analog.stability}%</span>
                            </div>
                            <Progress value={analog.stability} className="h-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>MAT</span>
                              <span>{analog.matCompatibility}%</span>
                            </div>
                            <Progress value={analog.matCompatibility} className="h-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>MT</span>
                              <span>{analog.mtCompatibility}%</span>
                            </div>
                            <Progress value={analog.mtCompatibility} className="h-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quantum Computing Alert */}
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Quantum Enhancement Active</AlertTitle>
              <AlertDescription>
                VQE-based molecular energy calculations are providing up to 15x speedup for systems under 20 atoms.
                Error mitigation is enabled using surface code protocols.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Simulation Tab */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Simulation Controls */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>New Simulation</CardTitle>
                  <CardDescription>Configure quantum molecular simulation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Simulation Type</Label>
                    <Select defaultValue="vqe">
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vqe">VQE Energy Calculation</SelectItem>
                        <SelectItem value="qaoa">QAOA Optimization</SelectItem>
                        <SelectItem value="qpe">Quantum Phase Estimation</SelectItem>
                        <SelectItem value="workflow">Full Discovery Workflow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Molecule</Label>
                    <Select defaultValue="sam">
                      <SelectTrigger>
                        <SelectValue placeholder="Select molecule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sam">SAM (Native)</SelectItem>
                        <SelectItem value="tsam">tSAM (Tetrazole)</SelectItem>
                        <SelectItem value="asam">aSAM (Amide)</SelectItem>
                        <SelectItem value="custom">Custom SMILES</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ansatz Circuit</Label>
                    <Select defaultValue="uccsd">
                      <SelectTrigger>
                        <SelectValue placeholder="Select ansatz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uccsd">UCCSD</SelectItem>
                        <SelectItem value="hardware">Hardware Efficient</SelectItem>
                        <SelectItem value="adaptive">Adaptive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Iterations</Label>
                    <Input type="number" defaultValue={100} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Label>Error Mitigation</Label>
                    <Switch checked={errorMitigation} onCheckedChange={setErrorMitigation} />
                  </div>

                  <Button className="w-full gap-2" onClick={() => setIsSimulating(!isSimulating)}>
                    {isSimulating ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause Simulation
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Start Simulation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Simulation Results */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Simulation Results</CardTitle>
                  <CardDescription>Real-time quantum computation output</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Ground State Energy</div>
                        <div className="text-2xl font-bold">-152.34 Ha</div>
                        <div className="text-xs text-muted-foreground">Converged in 47 iterations</div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">HOMO-LUMO Gap</div>
                        <div className="text-2xl font-bold">3.42 eV</div>
                        <div className="text-xs text-muted-foreground">Favorable for reactivity</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Quantum Advantage</div>
                        <div className="text-2xl font-bold">12.5x</div>
                        <div className="text-xs text-muted-foreground">vs classical DFT</div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Confidence Score</div>
                        <div className="text-2xl font-bold">94.2%</div>
                        <div className="text-xs text-muted-foreground">High reliability</div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Resources Used</span>
                      <span className="text-muted-foreground">16 qubits, depth 24</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Shot Count</span>
                      <span className="text-muted-foreground">8,192</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Compute Time</span>
                      <span className="text-muted-foreground">2.34s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SAM Analogs Tab */}
          <TabsContent value="sam-analogs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">SAM Analog Library</h2>
                <p className="text-sm text-muted-foreground">
                  Manage and optimize SAM analogs for methyltransferase applications
                </p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Analog
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {samAnalogs.map((analog) => (
                <Card key={analog.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{analog.name}</CardTitle>
                      <Badge variant={analog.isostere === "tetrazole" ? "default" : "secondary"}>
                        {analog.isostere}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Stability (t1/2)</span>
                        <span className="font-medium">{analog.stability}%</span>
                      </div>
                      <Progress value={analog.stability} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">MAT Compatibility</span>
                        <span className="font-medium">{analog.matCompatibility}%</span>
                      </div>
                      <Progress value={analog.matCompatibility} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">MT Compatibility</span>
                        <span className="font-medium">{analog.mtCompatibility}%</span>
                      </div>
                      <Progress value={analog.mtCompatibility} className="h-2" />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Synthesis Yield</span>
                      <Badge variant="outline">{analog.synthesisYield}%</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Atom className="h-3 w-3 mr-1" />
                        Simulate
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Beaker className="h-3 w-3 mr-1" />
                        Optimize
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Synthesis Tab */}
          <TabsContent value="synthesis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Synthesis Route Optimizer</CardTitle>
                <CardDescription>
                  Quantum-enhanced optimization of synthesis pathways for SAM analogs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Target Compound</Label>
                    <Select defaultValue="tsam">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tsam">Tetrazole Methionine (tMet)</SelectItem>
                        <SelectItem value="asam">Amide Methionine (aMet)</SelectItem>
                        <SelectItem value="promet">ProMet (cyclic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Steps</Label>
                    <Input type="number" defaultValue={5} />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Yield Target</Label>
                    <div className="flex items-center gap-2">
                      <Slider defaultValue={[65]} max={100} step={5} />
                      <span className="w-12 text-sm">65%</span>
                    </div>
                  </div>
                </div>

                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Optimize Route
                </Button>

                <Separator />

                {/* Optimized Route Display */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Optimized Synthesis Route: tMet</h3>
                  <div className="space-y-3">
                    {[
                      { step: 1, name: "Boc Protection", yield: 97, time: "5h", quantum: false },
                      { step: 2, name: "Nitrile Formation", yield: 97, time: "3h", quantum: true },
                      { step: 3, name: "Tetrazole Formation", yield: 87, time: "16h", quantum: true },
                      { step: 4, name: "Deprotection", yield: 79, time: "0.5h", quantum: false },
                    ].map((step) => (
                      <div key={step.step} className="flex items-center gap-4 rounded-lg border p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{step.name}</span>
                            {step.quantum && (
                              <Badge variant="secondary" className="gap-1 text-xs">
                                <Zap className="h-3 w-3" />
                                Quantum Optimized
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{step.yield}%</div>
                          <div className="text-xs text-muted-foreground">{step.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                    <span className="font-semibold">Overall Yield</span>
                    <span className="text-2xl font-bold">65%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quantum Backend Configuration</CardTitle>
                <CardDescription>Configure quantum computing resources and parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Quantum Backend</Label>
                      <Select value={selectedBackend} onValueChange={setSelectedBackend}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simulator">Local Simulator</SelectItem>
                          <SelectItem value="ibm">IBM Quantum</SelectItem>
                          <SelectItem value="ionq">IonQ</SelectItem>
                          <SelectItem value="rigetti">Rigetti</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum Qubits: {maxQubits[0]}</Label>
                      <Slider value={maxQubits} onValueChange={setMaxQubits} min={4} max={64} step={4} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Error Mitigation</Label>
                        <p className="text-xs text-muted-foreground">Apply surface code error correction</p>
                      </div>
                      <Switch checked={errorMitigation} onCheckedChange={setErrorMitigation} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Optimization Algorithm</Label>
                      <Select defaultValue="cobyla">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cobyla">COBYLA</SelectItem>
                          <SelectItem value="spsa">SPSA</SelectItem>
                          <SelectItem value="adam">ADAM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Shot Count</Label>
                      <Select defaultValue="8192">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1024">1,024</SelectItem>
                          <SelectItem value="4096">4,096</SelectItem>
                          <SelectItem value="8192">8,192</SelectItem>
                          <SelectItem value="16384">16,384</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Automatic Fallback</Label>
                        <p className="text-xs text-muted-foreground">Use classical methods when quantum is inefficient</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <RotateCcw className="h-4 w-4" />
                    Reset Defaults
                  </Button>
                  <Button className="gap-2">
                    <Download className="h-4 w-4" />
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
