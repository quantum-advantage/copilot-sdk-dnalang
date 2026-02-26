"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/ui/command-palette"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dna,
  ChevronDown,
  Network,
  Cpu,
  Atom,
  FlaskConical,
  Settings,
  Layers,
  Users,
  Keyboard,
  Workflow,
  Search,
  Code2,
  Puzzle,
  FolderTree,
  Bug,
  Terminal,
  Palette,
  Boxes,
  BookOpen,
  Plug,
  Rocket,
  MessageSquare,
  X,
  Compass,
  Zap,
  Radio,
  Bot,
  Swords,
  CreditCard,
  Globe,
  Sparkles,
  FileText,
  Shield,
  Lock,
  Microscope,
  Fingerprint,
  Cloud,
  Telescope,
} from "lucide-react"

const navGroups = [
  {
    label: "IDE Platform",
    items: [
      {
        href: "/ide-platform",
        label: "Overview",
        icon: Layers,
        description: "IDE development platform",
        shortcut: "I O",
      },
      {
        href: "/ide-platform/editor",
        label: "Genome Editor",
        icon: Code2,
        description: "DNA-Lang code editor",
        shortcut: "I E",
      },
      {
        href: "/dna-notebook",
        label: "DNA Notebook",
        icon: FileText,
        description: "Colab-style notebooks",
        shortcut: "I N",
      },
      {
        href: "/ide-platform/circuit-designer",
        label: "Circuit Designer",
        icon: Workflow,
        description: "Visual genome builder",
        shortcut: "I C",
      },
      {
        href: "/ide-platform/debugger",
        label: "Debugger",
        icon: Bug,
        description: "Quantum debugging",
        shortcut: "I D",
      },
      {
        href: "/ide-platform/terminal",
        label: "Terminal",
        icon: Terminal,
        description: "Quantum terminal",
        shortcut: "I T",
      },
      {
        href: "/ide-platform/projects",
        label: "Projects",
        icon: FolderTree,
        description: "Project management",
        shortcut: "I P",
      },
    ],
  },
  {
    label: "SHIFT Platform",
    items: [
      {
        href: "/shift-platform",
        label: "Overview",
        icon: Dna,
        description: "Z3BRA OS & MCP SDK",
        shortcut: "S O",
      },
      {
        href: "/shift-platform/iris",
        label: "IRIS Engine",
        icon: Bot,
        description: "Multi-agent orchestration",
        shortcut: "S I",
      },
      {
        href: "/shift-platform/code-arena",
        label: "Code Arena",
        icon: Swords,
        description: "AI coding battles",
        shortcut: "S C",
      },
      {
        href: "/dev-swarm-arena",
        label: "Dev Swarm Arena",
        icon: Sparkles,
        description: "Autonomous swarm coding",
        shortcut: "S W",
      },
      {
        href: "/agent-collaboration",
        label: "Agent Collaboration",
        icon: Network,
        description: "Quantum agent mesh",
        shortcut: "S A",
      },
      {
        href: "/osiris-copilot",
        label: "Osiris Copilot",
        icon: Radio,
        description: "Holographic interface",
        shortcut: "S P",
      },
    ],
  },
  {
    label: "AI & Tools",
    items: [
      {
        href: "/ai-assistant",
        label: "AI Assistant",
        icon: MessageSquare,
        description: "Quantum AI helper",
        shortcut: "A I",
      },
      {
        href: "/osiris-bridge",
        label: "Osiris Bridge",
        icon: Compass,
        description: "11D-CRSM PALS Cockpit",
        shortcut: "A O",
      },
      {
        href: "/aaf-dashboard",
        label: "AAF Dashboard",
        icon: Zap,
        description: "Adaptive Autopoietic Framework",
        shortcut: "A F",
      },
      {
        href: "/device-mesh",
        label: "Device Mesh",
        icon: Network,
        description: "NL2-LAS Bifurcation Zone",
        shortcut: "A M",
      },
      {
        href: "/telemetry",
        label: "Telemetry",
        icon: Radio,
        description: "CCCE Live Metrics",
        shortcut: "A T",
      },
      {
        href: "/performance",
        label: "Performance",
        icon: Cpu,
        description: "System Performance",
        shortcut: "A P",
      },
      {
        href: "/sovereign-cockpit",
        label: "System Cockpit",
        icon: Shield,
        description: "Phase-Conjugate Genesis",
        shortcut: "A S",
      },
      {
        href: "/asae-terminal",
        label: "ASAE Terminal",
        icon: Lock,
        description: "Manifold Sealed Report",
        shortcut: "A E",
      },
      {
        href: "/quantum-command",
        label: "Quantum Command",
        icon: Globe,
        description: "Post-Quantum Interface",
        shortcut: "A Q",
      },
      {
        href: "/post-quantum",
        label: "PQ Command Center",
        icon: Shield,
        description: "Post-Quantum Dashboard",
        shortcut: "A U",
      },
      {
        href: "/command-center",
        label: "Command Center",
        icon: Radio,
        description: "Unified DNA-Lang Dashboard",
        shortcut: "A C",
      },
      {
        href: "/organism-dashboard",
        label: "Organism Registry",
        icon: Boxes,
        description: "Strategic Assets Dashboard",
        shortcut: "A R",
      },
      {
        href: "/braket-integration",
        label: "Braket Integration",
        icon: Cloud,
        description: "Amazon Braket × DNA-Lang",
        shortcut: "A B",
      },
      {
        href: "/predictions",
        label: "Physics Predictions",
        icon: Telescope,
        description: "12 falsifiable predictions",
        shortcut: "A P",
      },
      {
        href: "/clinical-trials",
        label: "Clinical Trials",
        icon: FlaskConical,
        description: "AMG193 Trial Management",
        shortcut: "A L",
      },
      {
        href: "/cancer-research",
        label: "Cancer Research",
        icon: Microscope,
        description: "Oncology Command Center",
        shortcut: "A N",
      },
      {
        href: "/telemetry-capsule",
        label: "Telemetry Capsule",
        icon: Fingerprint,
        description: "QP-IDE Capsule Registry",
        shortcut: "A P",
      },
      { href: "/quantum-os", label: "Quantum OS", icon: Cpu, description: "Desktop environment", shortcut: "T O" },
      {
        href: "/orchestrator",
        label: "Orchestrator",
        icon: Network,
        description: "AIDEN|AURA control",
        shortcut: "T R",
      },
      { href: "/ccce", label: "CCCE Engine", icon: Atom, description: "Coherence engine", shortcut: "T C" },
    ],
  },
  {
    label: "Customize",
    items: [
      {
        href: "/ide-platform/builder",
        label: "IDE Builder",
        icon: Palette,
        description: "Workspace customizer",
        shortcut: "C B",
      },
      {
        href: "/ide-platform/templates",
        label: "Templates",
        icon: Boxes,
        description: "Starter templates",
        shortcut: "C T",
      },
      {
        href: "/ide-platform/marketplace",
        label: "Marketplace",
        icon: Puzzle,
        description: "Extensions & plugins",
        shortcut: "C M",
      },
      {
        href: "/ide-platform/integrations",
        label: "Integrations",
        icon: Plug,
        description: "External tools",
        shortcut: "C I",
      },
      {
        href: "/ide-platform/settings",
        label: "Settings",
        icon: Settings,
        description: "IDE configuration",
        shortcut: "C S",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        href: "/ide-platform/docs",
        label: "Documentation",
        icon: BookOpen,
        description: "Guides & API reference",
        shortcut: "R D",
      },
      {
        href: "/framework",
        label: "Framework",
        icon: Globe,
        description: "Unified Field Physics",
        shortcut: "R F",
      },
      {
        href: "/sovereign-stack",
        label: "Platform Stack",
        icon: Shield,
        description: "SSRA & Triadic Governance",
        shortcut: "R S",
      },
      {
        href: "/pricing",
        label: "Pricing",
        icon: CreditCard,
        description: "Subscription tiers",
        shortcut: "R $",
      },
      {
        href: "/physics-research",
        label: "Physics Lab",
        icon: FlaskConical,
        description: "DAG node editor",
        shortcut: "R P",
      },
      { href: "/architecture", label: "Architecture", icon: Layers, description: "System overview", shortcut: "R A" },
    ],
  },
]

export function Navigation() {
  const pathname = usePathname()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [mounted, setMounted] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowShortcuts((prev) => !prev)
        return
      }

      if (e.altKey) {
        if (e.key === "h") {
          window.location.href = "/"
        } else if (e.key === "s") {
          window.location.href = "/shift-platform"
        } else if (e.key === "i") {
          window.location.href = "/ide-platform"
        } else if (e.key === "e") {
          window.location.href = "/ide-platform/editor"
        } else if (e.key === "d") {
          window.location.href = "/ide-platform/docs"
        } else if (e.key === "a") {
          window.location.href = "/ai-assistant"
        } else if (e.key === "o") {
          window.location.href = "/osiris-bridge"
        } else if (e.key === "f") {
          window.location.href = "/aaf-dashboard"
        } else if (e.key === "c") {
          window.location.href = "/osiris-copilot"
        } else if (e.key === "$") {
          window.location.href = "/pricing"
        } else if (e.key === "g") {
          window.location.href = "/framework"
        } else if (e.key === "w") {
          window.location.href = "/dev-swarm-arena"
        } else if (e.key === "n") {
          window.location.href = "/dna-notebook"
        } else if (e.key === "v") {
          window.location.href = "/sovereign-stack"
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      {/* Command Palette - only mount after hydration */}
      {mounted && <CommandPalette />}

      <header
        className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="banner"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              aria-label="DNA::}{::lang Home"
            >
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Dna className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <span className="font-semibold text-sm hidden sm:block">
                <span className="dnalang-gradient">{"DNA::}{::lang"}</span>
              </span>
            </Link>

            {/* Desktop Navigation - defer Radix DropdownMenu until mounted */}
            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {mounted ? navGroups.map((group) => (
                <DropdownMenu key={group.label}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="nav-link gap-1"
                      aria-expanded="false"
                      aria-haspopup="menu"
                    >
                      {group.label}
                      <ChevronDown className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">{group.label}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {group.items.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 cursor-pointer"
                          aria-current={pathname === item.href ? "page" : undefined}
                        >
                          <item.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{item.label}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                          {item.shortcut && (
                            <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              {item.shortcut}
                            </kbd>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )) : navGroups.map((group) => (
                <Button key={group.label} variant="ghost" size="sm" className="nav-link gap-1">
                  {group.label}
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                </Button>
              ))}

              <Link href="/research-gateway">
                <Button
                  variant="ghost"
                  size="sm"
                  className="nav-link"
                  aria-current={pathname === "/research-gateway" ? "page" : undefined}
                >
                  <Users className="h-4 w-4 mr-1" aria-hidden="true" />
                  Community
                </Button>
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const event = new KeyboardEvent("keydown", { key: "k", metaKey: true })
                  window.dispatchEvent(event)
                }}
                aria-label="Open command palette"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <kbd className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
                onClick={() => setShowShortcuts((prev) => !prev)}
                aria-label="Toggle keyboard shortcuts"
                aria-pressed={showShortcuts}
              >
                <Keyboard className="h-4 w-4" aria-hidden="true" />
              </Button>

              <Link href="/ide-platform/settings" className="hidden sm:block">
                <Button variant="ghost" size="sm" aria-label="Settings">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>

              <Link href="/shift-platform">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Rocket className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  <span className="hidden sm:inline">SHIFT Platform</span>
                  <span className="sm:hidden">SHIFT</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Breadcrumb - shows on subpages */}
          {pathname !== "/" && (
            <div className="pb-2 -mt-1 hidden sm:block">
              <BreadcrumbNav />
            </div>
          )}
        </div>
      </header>

      {showShortcuts && (
        <div
          className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowShortcuts(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
        >
          <div
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="shortcuts-title" className="text-lg font-semibold">
                Keyboard Shortcuts
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowShortcuts(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Global</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Command Palette</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">⌘ K</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Go to Home</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + H</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>SHIFT Platform</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + S</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IDE Platform</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + I</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Genome Editor</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + E</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>DNA Notebook</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + N</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>AI Assistant</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + A</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Osiris Bridge</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + O</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Osiris Copilot</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + C</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>AAF Dashboard</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + F</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Framework</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + G</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Dev Swarm Arena</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + W</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Documentation</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + D</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pricing</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + $</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Platform Stack</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">Alt + V</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Show Shortcuts</span>
                    <kbd className="font-mono bg-muted px-2 py-0.5 rounded text-xs">?</kbd>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                Press <kbd className="font-mono bg-muted px-1 rounded">Esc</kbd> to close this dialog
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
