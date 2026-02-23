"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Cpu,
  Network,
  Atom,
  FlaskConical,
  Brain,
  Layers,
  Settings,
  Search,
  ArrowRight,
  Database,
  Globe,
  Shield,
  Sigma,
  Users,
  Workflow,
  Radio,
  Home,
  Zap,
} from "lucide-react"

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  action?: () => void
  category: string
  shortcut?: string
}

const commands: CommandItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/", category: "Navigation", shortcut: "G H" },
  {
    id: "quantum-os",
    label: "Quantum OS",
    description: "Desktop environment",
    icon: Cpu,
    href: "/quantum-os",
    category: "Platform",
    shortcut: "G Q",
  },
  {
    id: "orchestrator",
    label: "AIDEN|AURA Orchestrator",
    description: "Multi-agent control",
    icon: Network,
    href: "/orchestrator",
    category: "Platform",
  },
  {
    id: "ccce",
    label: "CCCE Engine",
    description: "Coherence engine",
    icon: Atom,
    href: "/ccce",
    category: "Platform",
  },
  {
    id: "uqcb",
    label: "UQCB Bridge",
    description: "Quantum-Classical Bridge",
    icon: Workflow,
    href: "/uqcb",
    category: "Platform",
  },
  {
    id: "pqa",
    label: "PQA Service",
    description: "Post-Quantum Advantage",
    icon: Shield,
    href: "/pqa-service",
    category: "Platform",
  },
  {
    id: "physics",
    label: "Physics Research Lab",
    description: "DAG node editor",
    icon: FlaskConical,
    href: "/physics-research",
    category: "Research",
  },
  {
    id: "nclm",
    label: "Non-Causal LM",
    description: "Sovereign inference",
    icon: Brain,
    href: "/noncausal-lm",
    category: "Research",
  },
  {
    id: "world-engine",
    label: "World Engine",
    description: "11D manifold control",
    icon: Globe,
    href: "/world-engine",
    category: "Research",
  },
  {
    id: "omega",
    label: "Omega Analysis",
    description: "Recursive formalism",
    icon: Sigma,
    href: "/omega-analysis",
    category: "Research",
  },
  {
    id: "genesis",
    label: "Genesis 3.0 Cockpit",
    description: "Sovereign telemetry command",
    icon: Radio,
    href: "/genesis-cockpit",
    category: "Platform",
  },
  {
    id: "sovereign-security",
    label: "Sovereign Security",
    description: "Platform integrity command center",
    icon: Shield,
    href: "/sovereign-security",
    category: "Platform",
  },
  {
    id: "repo-evolution",
    label: "Repository Evolution",
    description: "AETERNA_PORTA migration dashboard",
    icon: Workflow,
    href: "/repo-evolution",
    category: "Tools",
  },
  {
    id: "wardenclyffe",
    label: "WardenClyffe-Q Engine",
    description: "Information-gated energy extraction",
    icon: Zap,
    href: "/wardenclyffe",
    category: "Platform",
  },
  {
    id: "data",
    label: "Data Platform",
    description: "Real-time telemetry",
    icon: Database,
    href: "/data-platform",
    category: "Tools",
  },
  {
    id: "power",
    label: "Power Dashboard",
    description: "Piezo-swap metrics",
    icon: Radio,
    href: "/scimitar-power-dashboard",
    category: "Tools",
  },
  {
    id: "arch",
    label: "Architecture",
    description: "System overview",
    icon: Layers,
    href: "/architecture",
    category: "Tools",
  },
  {
    id: "community",
    label: "Research Gateway",
    description: "Community portal",
    icon: Users,
    href: "/research-gateway",
    category: "Community",
  },
  {
    id: "settings",
    label: "Settings",
    description: "Platform configuration",
    icon: Settings,
    href: "/setup",
    category: "Settings",
  },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase()
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.category.toLowerCase().includes(searchLower)
    )
  })

  const groupedCommands = filteredCommands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = []
      acc[cmd.category].push(cmd)
      return acc
    },
    {} as Record<string, CommandItem[]>,
  )

  const handleSelect = useCallback(
    (cmd: CommandItem) => {
      if (cmd.href) {
        router.push(cmd.href)
      } else if (cmd.action) {
        cmd.action()
      }
      setOpen(false)
      setSearch("")
    },
    [router],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
        return
      }

      if (!open) return

      // Close on escape
      if (e.key === "Escape") {
        setOpen(false)
        setSearch("")
        return
      }

      // Navigate with arrows
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault()
        handleSelect(filteredCommands[selectedIndex])
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, filteredCommands, selectedIndex, handleSelect])

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  if (!mounted || !open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-hidden="true" />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <input
            id="command-palette-title"
            type="text"
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            autoFocus
            autoComplete="off"
            aria-label="Search commands"
          />
          <kbd className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto py-2" role="listbox">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">No commands found</div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} role="group" aria-labelledby={`category-${category}`}>
                <div
                  id={`category-${category}`}
                  className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  {category}
                </div>
                {items.map((cmd) => {
                  const globalIndex = filteredCommands.indexOf(cmd)
                  const isSelected = globalIndex === selectedIndex
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors",
                        isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
                      )}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <cmd.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-muted-foreground truncate">{cmd.description}</div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      <ArrowRight
                        className={cn("h-4 w-4 transition-opacity", isSelected ? "opacity-100" : "opacity-0")}
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
            <span>Toggle</span>
          </div>
        </div>
      </div>
    </div>
  )
}
