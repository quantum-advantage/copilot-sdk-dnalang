"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Code2,
  Layers,
  Settings,
  Menu,
  X,
  ChevronRight,
  Dna,
  Workflow,
  Bug,
  Terminal,
  FolderTree,
  Puzzle,
  Palette,
  Boxes,
  BookOpen,
  Plug,
  MessageSquare,
  Rocket,
  Search,
  Bell,
  Zap,
  Activity,
  BarChart3,
  Globe,
  Cpu,
  Compass,
  Radio,
  Bot,
  Swords,
  Brain,
  CreditCard,
  Network, // Network icon imported
} from "lucide-react"

const bottomNavItems = [
  { icon: Home, label: "Home", href: "/", badge: null },
  { icon: Dna, label: "SHIFT", href: "/shift-platform", badge: null },
  { icon: Code2, label: "Editor", href: "/ide-platform/editor", badge: null },
  { icon: Menu, label: "More", href: "#menu", badge: null },
]

const menuSections = [
  {
    title: "SHIFT Platform",
    items: [
      { icon: Dna, label: "Overview", href: "/shift-platform", description: "Z3BRA OS & MCP SDK" },
      { icon: Bot, label: "IRIS Engine", href: "/shift-platform/iris", description: "Multi-agent orchestration" },
      { icon: Swords, label: "Code Arena", href: "/shift-platform/code-arena", description: "AI coding battles" },
      { icon: Radio, label: "Osiris Copilot", href: "/osiris-copilot", description: "Holographic interface" },
      { icon: Network, label: "Agent Collaboration", href: "/agent-collaboration", description: "Quantum agent mesh" },
    ],
  },
  {
    title: "IDE Platform",
    items: [
      { icon: Layers, label: "Overview", href: "/ide-platform", description: "Platform dashboard" },
      { icon: Code2, label: "Genome Editor", href: "/ide-platform/editor", description: "Code editing" },
      {
        icon: Workflow,
        label: "Circuit Designer",
        href: "/ide-platform/circuit-designer",
        description: "Visual builder",
      },
      { icon: Bug, label: "Debugger", href: "/ide-platform/debugger", description: "Quantum debugging" },
      { icon: Terminal, label: "Terminal", href: "/ide-platform/terminal", description: "Command line" },
      { icon: FolderTree, label: "Projects", href: "/ide-platform/projects", description: "Project manager" },
    ],
  },
  {
    title: "Customize",
    items: [
      { icon: Palette, label: "IDE Builder", href: "/ide-platform/builder", description: "Workspace config" },
      { icon: Boxes, label: "Templates", href: "/ide-platform/templates", description: "Starter templates" },
      { icon: Puzzle, label: "Marketplace", href: "/ide-platform/marketplace", description: "Extensions" },
      { icon: Plug, label: "Integrations", href: "/ide-platform/integrations", description: "External tools" },
    ],
  },
  {
    title: "AI & Analytics",
    items: [
      { icon: MessageSquare, label: "AI Assistant", href: "/ai-assistant", description: "Quantum AI helper" },
      { icon: Compass, label: "Osiris Bridge", href: "/osiris-bridge", description: "11D-CRSM PALS" },
      { icon: Zap, label: "AAF Dashboard", href: "/aaf-dashboard", description: "Living Framework" },
      { icon: BarChart3, label: "Analytics", href: "/analytics", description: "Performance metrics" },
      { icon: Cpu, label: "Quantum OS", href: "/quantum-os", description: "System environment" },
    ],
  },
  {
    title: "Resources",
    items: [
      { icon: BookOpen, label: "Documentation", href: "/ide-platform/docs", description: "Guides & API" },
      { icon: CreditCard, label: "Pricing", href: "/pricing", description: "Subscription tiers" },
      { icon: Globe, label: "Community", href: "/research-gateway", description: "Research gateway" },
      { icon: Settings, label: "Settings", href: "/ide-platform/settings", description: "Configuration" },
    ],
  },
]

const quickActions = [
  { icon: Search, label: "Search", action: "search" },
  { icon: Bell, label: "Alerts", action: "notifications", badge: 2 },
  { icon: Brain, label: "IRIS", action: "iris" },
]

export function MobileNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
        setNavVisible(false)
      } else {
        setNavVisible(true)
      }
      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  if (!mounted) return null

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom transition-transform duration-300",
          !navVisible && "translate-y-full",
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="grid grid-cols-4 h-16">
          {bottomNavItems.map((item) => {
            if (item.href === "#menu") {
              return (
                <Sheet key={item.label} open={menuOpen} onOpenChange={setMenuOpen}>
                  <SheetTrigger asChild>
                    <button
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all touch-feedback select-none-touch",
                        menuOpen ? "text-primary" : "text-muted-foreground",
                      )}
                      aria-label="Open menu"
                    >
                      <div className={cn("p-2 rounded-xl transition-all", menuOpen && "bg-primary/10")}>
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                      </div>
                      <span>{item.label}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
                    <div className="p-4 pb-0">
                      <SheetHeader className="pb-4">
                        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
                        <SheetTitle className="flex items-center gap-2 text-left">
                          <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
                            <Dna className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <span className="dnalang-gradient font-bold">{"DNA::}{::lang"}</span>
                            <p className="text-xs text-muted-foreground font-normal">Hybrid Quantum-Classical Platform</p>
                          </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Platform navigation menu</SheetDescription>
          </SheetHeader>

                      <div className="flex gap-2 py-3">
                        {quickActions.map((action) => (
                          <button
                            key={action.label}
                            className="relative flex-1 flex flex-col items-center gap-1.5 p-3 bg-muted/50 hover:bg-muted rounded-xl transition-colors touch-feedback"
                          >
                            <action.icon className="h-5 w-5 text-primary" />
                            <span className="text-xs text-muted-foreground">{action.label}</span>
                            {action.badge && (
                              <span className="absolute top-2 right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full">
                                {action.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <ScrollArea className="h-[calc(85vh-180px)] px-4">
                      <div className="space-y-6 pb-8">
                        {menuSections.map((section) => (
                          <div key={section.title}>
                            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                              {section.title}
                            </h3>
                            <div className="space-y-1">
                              {section.items.map((item) => (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setMenuOpen(false)}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] touch-feedback",
                                    isActive(item.href)
                                      ? "bg-primary/10 text-primary"
                                      : "hover:bg-muted active:bg-muted",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "p-2 rounded-xl transition-colors",
                                      isActive(item.href) ? "bg-primary/20" : "bg-muted",
                                    )}
                                  >
                                    <item.icon className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{item.label}</div>
                                    <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}

                        <div className="pt-4 border-t border-border space-y-3">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                              <Activity className="h-3 w-3 text-secondary animate-pulse" />
                              <span className="text-xs text-muted-foreground">Z3BRA Status</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] border-secondary/50 text-secondary">
                              Φ = 7.69 Converged
                            </Badge>
                          </div>
                          <Link href="/shift-platform" onClick={() => setMenuOpen(false)}>
                            <Button className="w-full h-14 text-base font-semibold gap-2" size="lg">
                              <Rocket className="h-5 w-5" />
                              Launch SHIFT Platform
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              )
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all touch-feedback select-none-touch",
                  isActive(item.href) ? "text-primary" : "text-muted-foreground",
                )}
              >
                <div className={cn("relative p-2 rounded-xl transition-all", isActive(item.href) && "bg-primary/10")}>
                  <item.icon className="h-5 w-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[8px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
                {isActive(item.href) && <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
