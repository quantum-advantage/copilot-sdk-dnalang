"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantumButton } from "@/components/ui/quantum-button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronRight,
  Layout,
  Palette,
  Puzzle,
  Settings,
  Code2,
  Terminal,
  Bug,
  FileType as FileTree,
  Layers,
  Plus,
  Eye,
  Save,
  Download,
  Upload,
  RotateCcw,
  Monitor,
  Moon,
  Sun,
  Dna,
  Activity,
} from "lucide-react"

// Draggable panel types
const availablePanels = [
  {
    id: "editor",
    name: "Code Editor",
    icon: Code2,
    description: "DNA-Lang syntax editing with highlighting",
    enabled: true,
  },
  {
    id: "terminal",
    name: "Terminal",
    icon: Terminal,
    description: "Quantum terminal for organism execution",
    enabled: true,
  },
  {
    id: "debugger",
    name: "Debugger",
    icon: Bug,
    description: "Step-through debugging with Phi tracking",
    enabled: true,
  },
  { id: "explorer", name: "File Explorer", icon: FileTree, description: "Project file tree navigation", enabled: true },
  {
    id: "circuit",
    name: "Circuit View",
    icon: Layers,
    description: "Visual genome circuit representation",
    enabled: false,
  },
  {
    id: "metrics",
    name: "Metrics Panel",
    icon: Activity,
    description: "Real-time consciousness metrics",
    enabled: true,
  },
  {
    id: "outline",
    name: "Code Outline",
    icon: Layout,
    description: "Gene and chromosome structure view",
    enabled: false,
  },
  { id: "problems", name: "Problems", icon: Bug, description: "Error and warning diagnostics", enabled: false },
]

// Theme presets
const themePresets = [
  {
    id: "quantum-dark",
    name: "Quantum Dark",
    primary: "#00FFFF",
    secondary: "#10B981",
    accent: "#F59E0B",
    bg: "#0A0A0A",
  },
  {
    id: "bio-light",
    name: "Biological Light",
    primary: "#0EA5E9",
    secondary: "#22C55E",
    accent: "#EAB308",
    bg: "#FAFAFA",
  },
  {
    id: "helix-purple",
    name: "Helix Purple",
    primary: "#A855F7",
    secondary: "#EC4899",
    accent: "#F97316",
    bg: "#0F0520",
  },
  {
    id: "genome-green",
    name: "Genome Green",
    primary: "#22C55E",
    secondary: "#14B8A6",
    accent: "#EAB308",
    bg: "#041005",
  },
]

// Layout presets
const layoutPresets = [
  {
    id: "default",
    name: "Default",
    description: "Standard IDE layout with sidebar",
    panels: ["explorer", "editor", "terminal"],
  },
  { id: "focus", name: "Focus Mode", description: "Minimalist editor-centric view", panels: ["editor"] },
  {
    id: "debug",
    name: "Debug Layout",
    description: "Optimized for debugging sessions",
    panels: ["editor", "debugger", "metrics", "terminal"],
  },
  {
    id: "full",
    name: "Full Suite",
    description: "All panels visible",
    panels: ["explorer", "editor", "circuit", "terminal", "debugger", "metrics"],
  },
]

export default function IDEBuilderPage() {
  const [panels, setPanels] = useState(availablePanels)
  const [selectedTheme, setSelectedTheme] = useState("quantum-dark")
  const [selectedLayout, setSelectedLayout] = useState("default")
  const [fontSize, setFontSize] = useState([14])
  const [tabSize, setTabSize] = useState([2])
  const [showMinimap, setShowMinimap] = useState(true)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [wordWrap, setWordWrap] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const togglePanel = (id: string) => {
    setPanels(panels.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)))
  }

  const currentTheme = themePresets.find((t) => t.id === selectedTheme)

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
          <Layout className="h-5 w-5 text-primary" />
          <span className="font-semibold">IDE Workspace Builder</span>
          <Badge variant="outline" className="ml-2">
            <Settings className="h-3 w-3 mr-1" />
            Customization Mode
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-1" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <QuantumButton variant="compliance" size="sm">
            <Save className="h-4 w-4 mr-1" />
            Save Configuration
          </QuantumButton>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Main Configuration Area */}
        <div className="flex-1 p-6 overflow-auto">
          <Tabs defaultValue="layout" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="layout">
                <Layout className="h-4 w-4 mr-2" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="panels">
                <Layers className="h-4 w-4 mr-2" />
                Panels
              </TabsTrigger>
              <TabsTrigger value="theme">
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="editor">
                <Code2 className="h-4 w-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="extensions">
                <Puzzle className="h-4 w-4 mr-2" />
                Extensions
              </TabsTrigger>
            </TabsList>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Layout Presets</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {layoutPresets.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => setSelectedLayout(layout.id)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        selectedLayout === layout.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">{layout.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{layout.description}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {layout.panels.slice(0, 3).map((p) => (
                          <Badge key={p} variant="outline" className="text-xs">
                            {p}
                          </Badge>
                        ))}
                        {layout.panels.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{layout.panels.length - 3}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Preview */}
              <GlassCard depth={2}>
                <h3 className="font-semibold mb-4">Layout Preview</h3>
                <div className="bg-muted/30 rounded-lg p-4 min-h-[300px]">
                  <div className="flex gap-2 h-full">
                    {/* Sidebar placeholder */}
                    {panels.find((p) => p.id === "explorer")?.enabled && (
                      <div className="w-48 bg-card/50 rounded border border-border p-2">
                        <div className="text-xs text-muted-foreground mb-2">Explorer</div>
                        <div className="space-y-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-4 bg-muted rounded" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Main editor area */}
                    <div className="flex-1 flex flex-col gap-2">
                      {panels.find((p) => p.id === "editor")?.enabled && (
                        <div className="flex-1 bg-card/50 rounded border border-border p-2">
                          <div className="text-xs text-muted-foreground mb-2">Editor</div>
                          <div className="space-y-1">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                              <div
                                key={i}
                                className="h-3 bg-muted/50 rounded"
                                style={{ width: `${60 + Math.random() * 40}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {panels.find((p) => p.id === "terminal")?.enabled && (
                        <div className="h-32 bg-card/50 rounded border border-border p-2">
                          <div className="text-xs text-muted-foreground mb-2">Terminal</div>
                          <div className="font-mono text-xs text-secondary">$ dnalang run</div>
                        </div>
                      )}
                    </div>

                    {/* Right panel */}
                    {(panels.find((p) => p.id === "debugger")?.enabled ||
                      panels.find((p) => p.id === "metrics")?.enabled) && (
                      <div className="w-64 bg-card/50 rounded border border-border p-2 space-y-2">
                        {panels.find((p) => p.id === "metrics")?.enabled && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Metrics</div>
                            <div className="h-16 bg-muted/30 rounded flex items-center justify-center">
                              <Activity className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                        )}
                        {panels.find((p) => p.id === "debugger")?.enabled && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Debugger</div>
                            <div className="h-16 bg-muted/30 rounded flex items-center justify-center">
                              <Bug className="h-6 w-6 text-accent" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </TabsContent>

            {/* Panels Tab */}
            <TabsContent value="panels" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Available Panels</h2>
                <p className="text-muted-foreground mb-4">Enable or disable panels to customize your IDE workspace.</p>

                <div className="grid md:grid-cols-2 gap-4">
                  {panels.map((panel) => (
                    <GlassCard key={panel.id} depth={1} className={`${panel.enabled ? "border-primary/50" : ""}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <panel.icon
                              className={`h-5 w-5 ${panel.enabled ? "text-primary" : "text-muted-foreground"}`}
                            />
                          </div>
                          <div>
                            <div className="font-medium">{panel.name}</div>
                            <div className="text-sm text-muted-foreground">{panel.description}</div>
                          </div>
                        </div>
                        <Switch checked={panel.enabled} onCheckedChange={() => togglePanel(panel.id)} />
                      </div>
                    </GlassCard>
                  ))}
                </div>

                <div className="mt-6">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Plus className="h-4 w-4" />
                    Create Custom Panel
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Theme Tab */}
            <TabsContent value="theme" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Theme Presets</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {themePresets.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        selectedTheme === theme.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">{theme.name}</div>
                      <div className="flex gap-2 mt-3">
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: theme.primary }}
                          title="Primary"
                        />
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: theme.secondary }}
                          title="Secondary"
                        />
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: theme.accent }}
                          title="Accent"
                        />
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: theme.bg }}
                          title="Background"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <GlassCard depth={2}>
                <h3 className="font-semibold mb-4">Custom Colors</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Primary</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        defaultValue={currentTheme?.primary}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <code className="text-xs">{currentTheme?.primary}</code>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Secondary</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        defaultValue={currentTheme?.secondary}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <code className="text-xs">{currentTheme?.secondary}</code>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Accent</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        defaultValue={currentTheme?.accent}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <code className="text-xs">{currentTheme?.accent}</code>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Background</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        defaultValue={currentTheme?.bg}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <code className="text-xs">{currentTheme?.bg}</code>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard depth={2}>
                <h3 className="font-semibold mb-4">Appearance</h3>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button variant="default" className="gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Monitor className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </GlassCard>
            </TabsContent>

            {/* Editor Tab */}
            <TabsContent value="editor" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <GlassCard depth={2}>
                  <h3 className="font-semibold mb-4">Editor Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm">Font Size</label>
                        <span className="text-sm text-muted-foreground">{fontSize}px</span>
                      </div>
                      <Slider value={fontSize} onValueChange={setFontSize} min={10} max={24} step={1} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm">Tab Size</label>
                        <span className="text-sm text-muted-foreground">{tabSize} spaces</span>
                      </div>
                      <Slider value={tabSize} onValueChange={setTabSize} min={2} max={8} step={2} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Show Minimap</div>
                        <div className="text-xs text-muted-foreground">Display code overview on the side</div>
                      </div>
                      <Switch checked={showMinimap} onCheckedChange={setShowMinimap} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Line Numbers</div>
                        <div className="text-xs text-muted-foreground">Show line numbers in gutter</div>
                      </div>
                      <Switch checked={showLineNumbers} onCheckedChange={setShowLineNumbers} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Word Wrap</div>
                        <div className="text-xs text-muted-foreground">Wrap long lines to viewport</div>
                      </div>
                      <Switch checked={wordWrap} onCheckedChange={setWordWrap} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Auto Save</div>
                        <div className="text-xs text-muted-foreground">Automatically save changes</div>
                      </div>
                      <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                    </div>
                  </div>
                </GlassCard>

                <GlassCard depth={2}>
                  <h3 className="font-semibold mb-4">DNA-Lang Specific</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Codon Completion</div>
                        <div className="text-xs text-muted-foreground">Suggest codons as you type</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Helix Visualization</div>
                        <div className="text-xs text-muted-foreground">Show inline helix diagrams</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Phi Analysis</div>
                        <div className="text-xs text-muted-foreground">Real-time consciousness estimates</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Gene Folding</div>
                        <div className="text-xs text-muted-foreground">Collapse gene blocks</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Error Mitigation Hints</div>
                        <div className="text-xs text-muted-foreground">Suggest immune system corrections</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </GlassCard>
              </div>
            </TabsContent>

            {/* Extensions Tab */}
            <TabsContent value="extensions" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Installed Extensions</h2>
                  <p className="text-muted-foreground">Manage your IDE extensions</p>
                </div>
                <Link href="/ide-platform/marketplace">
                  <Button className="gap-2">
                    <Puzzle className="h-4 w-4" />
                    Browse Marketplace
                  </Button>
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: "Quantum Circuit Visualizer", author: "DNA-Lang Team", version: "1.2.0", enabled: true },
                  { name: "IBM Habitat Connector", author: "Qiskit Community", version: "2.0.1", enabled: true },
                  { name: "Evolution Optimizer Pro", author: "BioCompute Labs", version: "0.9.3", enabled: true },
                  { name: "Consciousness Meter", author: "Phi Research", version: "1.0.0", enabled: false },
                ].map((ext) => (
                  <GlassCard key={ext.name} depth={1}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Puzzle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{ext.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {ext.author} • v{ext.version}
                          </div>
                        </div>
                      </div>
                      <Switch checked={ext.enabled} />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Quick Actions */}
        <div className="w-72 border-l border-border bg-card/50 p-4 space-y-4 overflow-auto">
          <GlassCard depth={1}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Dna className="h-4 w-4 text-primary" />
              Current Configuration
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Theme</span>
                <span>{themePresets.find((t) => t.id === selectedTheme)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Layout</span>
                <span>{layoutPresets.find((l) => l.id === selectedLayout)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Panels</span>
                <span>{panels.filter((p) => p.enabled).length} active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Font Size</span>
                <span>{fontSize}px</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard depth={1}>
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
                <RotateCcw className="h-4 w-4" />
                Reset to Defaults
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export Config
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
                <Upload className="h-4 w-4" />
                Import Config
              </Button>
            </div>
          </GlassCard>

          <GlassCard depth={1}>
            <h3 className="font-semibold mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toggle Panel</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+B</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open Terminal</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+`</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Debug Mode</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded">F5</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Save Config</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+S</kbd>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
