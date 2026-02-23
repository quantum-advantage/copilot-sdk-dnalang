"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Code2,
  Bug,
  FolderTree,
  Terminal,
  Workflow,
  Puzzle,
  Wrench,
  LayoutDashboard,
  Book,
  Plug,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
  Dna,
  Menu,
  MessageSquare,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const sidebarItems = [
  { icon: Home, label: "Overview", href: "/ide-platform", shortcut: "O" },
  { icon: Code2, label: "Editor", href: "/ide-platform/editor", shortcut: "E" },
  { icon: Workflow, label: "Circuit Designer", href: "/ide-platform/circuit-designer", shortcut: "C" },
  { icon: Bug, label: "Debugger", href: "/ide-platform/debugger", shortcut: "D" },
  { icon: Terminal, label: "Terminal", href: "/ide-platform/terminal", shortcut: "T" },
  { icon: FolderTree, label: "Projects", href: "/ide-platform/projects", shortcut: "P" },
  { icon: Wrench, label: "Builder", href: "/ide-platform/builder", shortcut: "B" },
  { icon: LayoutDashboard, label: "Templates", href: "/ide-platform/templates", shortcut: "L" },
  { icon: Puzzle, label: "Marketplace", href: "/ide-platform/marketplace", shortcut: "M" },
  { icon: Plug, label: "Integrations", href: "/ide-platform/integrations", shortcut: "I" },
  { icon: MessageSquare, label: "AI Assistant", href: "/ai-assistant", shortcut: "A" },
  { icon: Book, label: "Docs", href: "/ide-platform/docs", shortcut: "?" },
  { icon: Settings, label: "Settings", href: "/ide-platform/settings", shortcut: "," },
]

export function IDESidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const DesktopSidebar = () => (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-card/50 backdrop-blur-sm border-r border-border z-40 transition-all duration-300",
          "hidden md:block", // Hide on mobile
          collapsed ? "w-14" : "w-56",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={cn(
              "flex items-center gap-2 p-3 border-b border-border",
              collapsed ? "justify-center" : "justify-between",
            )}
          >
            {!collapsed && (
              <div className="flex items-center gap-2">
                <Dna className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">IDE Platform</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <ScrollArea className="flex-1 py-2">
            <ul className="space-y-1 px-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href
                const ItemIcon = item.icon

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all",
                      isActive
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <ItemIcon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                          {item.shortcut}
                        </kbd>
                      </>
                    )}
                  </Link>
                )

                if (collapsed) {
                  return (
                    <li key={item.href}>
                      <Tooltip>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-2">
                          {item.label}
                          <kbd className="h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                            {item.shortcut}
                          </kbd>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  )
                }

                return <li key={item.href}>{linkContent}</li>
              })}
            </ul>
          </ScrollArea>

          {/* Footer */}
          {!collapsed && (
            <div className="p-3 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>DNA-Lang v1.0.0</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  Quantum
                </Badge>
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )

  const MobileSidebarTrigger = () => {
    if (!mounted) return null
    return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden fixed top-16 left-2 z-50 h-10 w-10 p-0 bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-sm"
          aria-label="Open IDE menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-primary" />
            <span>IDE Platform</span>
          </SheetTitle>
          <SheetDescription className="sr-only">IDE navigation sidebar</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="py-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              const ItemIcon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm transition-all active:bg-muted/80",
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <ItemIcon className={cn("h-5 w-5", isActive && "text-primary")} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              )
            })}
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>DNA-Lang v1.0.0</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Quantum
              </Badge>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )}

  return (
    <>
      <DesktopSidebar />
      <MobileSidebarTrigger />
    </>
  )
}
