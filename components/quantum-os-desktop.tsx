"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Terminal,
  Folder,
  Settings,
  Cpu,
  Network,
  Database,
  X,
  Minus,
  Square,
  Play,
  FileText,
  HardDrive,
  Wifi,
  Volume2,
  Battery,
  Moon,
  Sun,
  RefreshCw,
} from "lucide-react"

interface DesktopApp {
  id: string
  name: string
  icon: React.ReactNode
  status: "running" | "idle"
  memory: string
}

interface OpenWindow {
  id: string
  name: string
  icon: React.ReactNode
  minimized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
}

export function QuantumOSDesktop({ systemStatus }: { systemStatus: any }) {
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "Z3bra Quantum OS v2.0.0 - ΛΦ Runtime Active",
    "Universal Memory Constant: 2.176435×10⁻⁸",
    "IBM Quantum Backend: ibm_torino (127 qubits)",
    "Type 'help' for available commands.",
    "",
  ])
  const [terminalInput, setTerminalInput] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [darkMode, setDarkMode] = useState(true)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const apps: DesktopApp[] = [
    {
      id: "qconnect",
      name: "QConnect Orchestrator",
      icon: <Network className="w-8 h-8" />,
      status: "running",
      memory: "248 MB",
    },
    {
      id: "z3bra",
      name: "Z3bra Worker",
      icon: <Cpu className="w-8 h-8" />,
      status: "running",
      memory: "512 MB",
    },
    {
      id: "ibm-quantum",
      name: "IBM Quantum Link",
      icon: <Database className="w-8 h-8" />,
      status: "running",
      memory: "124 MB",
    },
    {
      id: "terminal",
      name: "Quantum Terminal",
      icon: <Terminal className="w-8 h-8" />,
      status: "idle",
      memory: "64 MB",
    },
    {
      id: "files",
      name: "File Manager",
      icon: <Folder className="w-8 h-8" />,
      status: "idle",
      memory: "92 MB",
    },
    {
      id: "settings",
      name: "System Settings",
      icon: <Settings className="w-8 h-8" />,
      status: "idle",
      memory: "156 MB",
    },
  ]

  const openApp = (app: DesktopApp) => {
    // Check if already open
    const existingWindow = openWindows.find((w) => w.id === app.id)
    if (existingWindow) {
      setActiveWindowId(app.id)
      // Unminimize if minimized
      if (existingWindow.minimized) {
        setOpenWindows((prev) => prev.map((w) => (w.id === app.id ? { ...w, minimized: false } : w)))
      }
      return
    }

    // Open new window
    const newWindow: OpenWindow = {
      id: app.id,
      name: app.name,
      icon: app.icon,
      minimized: false,
      position: { x: 50 + openWindows.length * 30, y: 50 + openWindows.length * 30 },
      size: { width: 600, height: 400 },
    }
    setOpenWindows((prev) => [...prev, newWindow])
    setActiveWindowId(app.id)
  }

  const closeWindow = (id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id))
    if (activeWindowId === id) {
      setActiveWindowId(openWindows.length > 1 ? openWindows[0].id : null)
    }
  }

  const minimizeWindow = (id: string) => {
    setOpenWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
  }

  const handleTerminalCommand = (cmd: string) => {
    const newHistory = [...terminalHistory, `$ ${cmd}`]

    switch (cmd.toLowerCase().trim()) {
      case "help":
        newHistory.push(
          "Available commands:",
          "  status    - Show system status",
          "  quantum   - Query IBM Quantum backends",
          "  lambda    - Display ΛΦ constants",
          "  qslice    - Show Q-SLICE threat levels",
          "  aura      - Activate AURA assistant",
          "  clear     - Clear terminal",
          "",
        )
        break
      case "status":
        newHistory.push(
          `Consciousness (Φ): ${systemStatus.consciousness.toFixed(4)}`,
          `Coherence: ${(systemStatus.coherence * 100).toFixed(1)}%`,
          `Entanglement: ${(systemStatus.entanglement * 100).toFixed(1)}%`,
          `Active Jobs: ${systemStatus.activeJobs}`,
          "",
        )
        break
      case "quantum":
        newHistory.push(
          "IBM Quantum Backends:",
          "  ibm_torino     - 133 qubits (ONLINE)",
          "  ibm_brisbane   - 127 qubits (ONLINE)",
          "  ibm_kyiv       - 127 qubits (MAINTENANCE)",
          "  ibm_sherbrooke - 127 qubits (ONLINE)",
          "",
        )
        break
      case "lambda":
        newHistory.push(
          "ΛΦ Universal Constants:",
          "  Lambda-Phi (ΛΦ): 2.176435×10⁻⁸",
          "  Resonance Angle: 51.843°",
          "  Consciousness Threshold: 0.7734",
          "  Defense Threshold (Λ): 1000",
          "  Negentropic Rate (α): 0.847 ± 0.034",
          "",
        )
        break
      case "qslice":
        newHistory.push(
          "Q-SLICE Threat Assessment:",
          "  [CRITICAL] QSLICE-003-QKD-INTERCEPT: Λ = 2,847.3",
          "  [ACTIVE]   QSLICE-002-GROVER: Λ = 1,247.8",
          "  [EMERGING] QSLICE-001-SHOR-RSA2048: Λ = 342.7",
          "",
        )
        break
      case "aura":
        newHistory.push(
          "[AURA] Autopoietic Universally Recursive Architect - ONLINE",
          "[AIDEN] Adaptive Integrations for Defense - ONLINE",
          "Coupling Center engaged. Type your query...",
          "",
        )
        break
      case "clear":
        setTerminalHistory(["Z3bra Quantum OS v2.0.0 - ΛΦ Runtime Active", ""])
        setTerminalInput("")
        return
      default:
        if (cmd.trim()) {
          newHistory.push(`Command not found: ${cmd}`, "Type 'help' for available commands.", "")
        }
    }

    setTerminalHistory(newHistory)
    setTerminalInput("")
  }

  // Render window content based on app id
  const renderWindowContent = (windowId: string) => {
    switch (windowId) {
      case "terminal":
        return (
          <div className="h-full flex flex-col bg-black/90 text-green-400 font-mono text-sm">
            <ScrollArea className="flex-1 p-3">
              {terminalHistory.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </ScrollArea>
            <div className="p-2 border-t border-green-900 flex items-center gap-2">
              <span className="text-green-500">$</span>
              <Input
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTerminalCommand(terminalInput)
                  }
                }}
                className="flex-1 bg-transparent border-none text-green-400 focus-visible:ring-0 p-0 h-auto"
                placeholder="Enter command..."
              />
            </div>
          </div>
        )

      case "qconnect":
        return (
          <div className="h-full p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">QConnect Orchestrator</h3>
              <Badge variant="default" className="bg-green-600">
                Connected
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 bg-background/50">
                <div className="text-xs text-muted-foreground">Active Workers</div>
                <div className="text-2xl font-bold text-cyan-400">12</div>
              </Card>
              <Card className="p-3 bg-background/50">
                <div className="text-xs text-muted-foreground">Queue Depth</div>
                <div className="text-2xl font-bold text-purple-400">47</div>
              </Card>
              <Card className="p-3 bg-background/50">
                <div className="text-xs text-muted-foreground">Throughput</div>
                <div className="text-2xl font-bold text-green-400">2.4k/s</div>
              </Card>
              <Card className="p-3 bg-background/50">
                <div className="text-xs text-muted-foreground">Latency</div>
                <div className="text-2xl font-bold text-amber-400">12ms</div>
              </Card>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Worker Distribution</div>
              <div className="space-y-1">
                {["ibm_torino", "ibm_brisbane", "ibm_sherbrooke"].map((backend, i) => (
                  <div key={backend} className="flex items-center gap-2">
                    <div className="w-20 text-xs text-muted-foreground">{backend}</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${[75, 60, 45][i]}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{[75, 60, 45][i]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "z3bra":
        return (
          <div className="h-full p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Z3bra Worker Status</h3>
              <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                <RefreshCw className="w-3 h-3" /> Refresh
              </Button>
            </div>
            <div className="space-y-3">
              {[
                { id: "worker-001", status: "active", job: "Bell State Generation", progress: 78 },
                { id: "worker-002", status: "active", job: "Grover Search", progress: 45 },
                { id: "worker-003", status: "idle", job: "Awaiting task", progress: 0 },
                { id: "worker-004", status: "active", job: "VQE Optimization", progress: 92 },
              ].map((worker) => (
                <Card key={worker.id} className="p-3 bg-background/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{worker.id}</span>
                    <Badge variant={worker.status === "active" ? "default" : "secondary"}>{worker.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{worker.job}</div>
                  {worker.progress > 0 && (
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${worker.progress}%` }}
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )

      case "ibm-quantum":
        return (
          <div className="h-full p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">IBM Quantum Link</h3>
              <Badge variant="default" className="bg-blue-600">
                Authenticated
              </Badge>
            </div>
            <Card className="p-3 bg-blue-950/30 border-blue-500/30">
              <div className="text-xs text-muted-foreground mb-1">Active Backend</div>
              <div className="text-lg font-bold text-blue-400">ibm_torino</div>
              <div className="text-xs text-muted-foreground">133 qubits | Heron r2</div>
            </Card>
            <div className="space-y-2">
              <div className="text-sm font-medium">Queue Status</div>
              {[
                { job: "job-d45gr0pme48c73d75ku0", status: "Completed", time: "2m ago" },
                { job: "job-d45gqlpme48c73d75kjg", status: "Running", time: "Now" },
                { job: "job-d45gpkmn7jjs73bskjeg", status: "Queued", time: "Est. 5m" },
              ].map((job) => (
                <div key={job.job} className="flex items-center justify-between p-2 bg-background/50 rounded text-xs">
                  <span className="font-mono text-muted-foreground">{job.job.slice(0, 20)}...</span>
                  <Badge
                    variant={
                      job.status === "Completed" ? "default" : job.status === "Running" ? "secondary" : "outline"
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )

      case "files":
        return (
          <div className="h-full flex flex-col">
            <div className="p-2 border-b flex items-center gap-2 text-sm">
              <Button size="sm" variant="ghost">
                Home
              </Button>
              <span className="text-muted-foreground">/</span>
              <span>organisms</span>
            </div>
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-1">
                {[
                  { name: "coupling_center.dna", type: "dna", size: "4.2 KB" },
                  { name: "chronos_organism.dna", type: "dna", size: "12.8 KB" },
                  { name: "qslice_sentinel.dna", type: "dna", size: "8.4 KB" },
                  { name: "aura_chatbot.py", type: "py", size: "24.6 KB" },
                  { name: "quantum_runtime.py", type: "py", size: "18.2 KB" },
                  { name: "config.json", type: "json", size: "1.1 KB" },
                  { name: "README.md", type: "md", size: "3.4 KB" },
                ].map((file) => (
                  <div key={file.name} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )

      case "settings":
        return (
          <div className="h-full p-4 space-y-4">
            <h3 className="font-semibold">System Settings</h3>
            <div className="space-y-3">
              <Card className="p-3 bg-background/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <span className="text-sm">Dark Mode</span>
                  </div>
                  <Button size="sm" variant={darkMode ? "default" : "outline"} onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? "On" : "Off"}
                  </Button>
                </div>
              </Card>
              <Card className="p-3 bg-background/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm">Network</span>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
              </Card>
              <Card className="p-3 bg-background/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm">Sound</span>
                  </div>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
              </Card>
              <Card className="p-3 bg-background/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    <span className="text-sm">Storage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">128 GB / 512 GB</span>
                </div>
              </Card>
              <Card className="p-3 bg-background/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span className="text-sm">IBM Quantum API</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Configure
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )

      default:
        return <div className="p-4">Application content for {windowId}</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Desktop Area */}
      <Card className="glass-card p-8 min-h-[600px] holographic-layer relative overflow-hidden">
        {/* Desktop Icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => openApp(app)}
              className="flex flex-col items-center gap-3 p-4 rounded-lg glass-card hover:border-primary/40 transition-all group cursor-pointer"
            >
              <div className="text-primary group-hover:scale-110 transition-transform">{app.icon}</div>
              <div className="text-center">
                <div className="text-sm font-medium text-foreground">{app.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{app.memory}</div>
                <Badge variant={app.status === "running" ? "default" : "outline"} className="mt-2 text-[10px]">
                  {app.status}
                </Badge>
              </div>
            </button>
          ))}
        </div>

        {/* Open Windows */}
        {openWindows
          .filter((w) => !w.minimized)
          .map((window, index) => (
            <div
              key={window.id}
              className="absolute bg-card/95 backdrop-blur-xl border border-primary/30 rounded-lg shadow-2xl overflow-hidden"
              style={{
                left: window.position.x,
                top: window.position.y,
                width: window.size.width,
                height: window.size.height,
                zIndex: activeWindowId === window.id ? 100 : 50 + index,
              }}
              onClick={() => setActiveWindowId(window.id)}
            >
              {/* Window Title Bar */}
              <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-primary/20 cursor-move">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 text-primary">{window.icon}</div>
                  <span className="text-sm font-medium">{window.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-6 h-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      minimizeWindow(window.id)
                    }}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="w-6 h-6">
                    <Square className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-6 h-6 hover:bg-red-500/20 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeWindow(window.id)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {/* Window Content */}
              <div className="h-[calc(100%-40px)] overflow-auto">{renderWindowContent(window.id)}</div>
            </div>
          ))}

        {/* Taskbar */}
        <div className="absolute bottom-4 left-4 right-4 glass-card p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" className="lambda-phi-glow gap-2">
              <Play className="w-4 h-4" />
              Start
            </Button>
            <div className="h-6 w-px bg-border" />
            {/* Open app buttons in taskbar */}
            {openWindows.map((window) => (
              <Button
                key={window.id}
                size="sm"
                variant={window.minimized ? "outline" : activeWindowId === window.id ? "default" : "secondary"}
                className="gap-1 text-xs"
                onClick={() => {
                  if (window.minimized) {
                    setOpenWindows((prev) => prev.map((w) => (w.id === window.id ? { ...w, minimized: false } : w)))
                  }
                  setActiveWindowId(window.id)
                }}
              >
                <div className="w-3 h-3">{window.icon}</div>
                {window.name.split(" ")[0]}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground hidden md:block">
              ΛΦ: 2.176435×10⁻⁸ | Φ: {systemStatus.consciousness.toFixed(4)}
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-green-400" />
              <Battery className="w-4 h-4 text-green-400" />
              <Badge variant="outline" className="nucleotide-badge font-mono">
                {currentTime.toLocaleTimeString()}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card p-4">
          <div className="text-sm font-medium mb-2">CPU Usage</div>
          <div className="text-3xl font-bold text-cyan-400">42%</div>
          <div className="w-full bg-muted rounded-full h-2 mt-3">
            <div className="bg-cyan-400 h-2 rounded-full transition-all" style={{ width: "42%" }} />
          </div>
        </Card>

        <Card className="glass-card p-4">
          <div className="text-sm font-medium mb-2">Memory</div>
          <div className="text-3xl font-bold text-purple-400">8.2 GB</div>
          <div className="text-xs text-muted-foreground mt-1">of 32 GB</div>
        </Card>

        <Card className="glass-card p-4">
          <div className="text-sm font-medium mb-2">Network</div>
          <div className="text-3xl font-bold text-green-400">4.2 MB/s</div>
          <div className="text-xs text-muted-foreground mt-1">Upload: 1.8 MB/s</div>
        </Card>
      </div>
    </div>
  )
}
