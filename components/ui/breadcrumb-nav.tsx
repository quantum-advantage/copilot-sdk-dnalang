"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const routeLabels: Record<string, string> = {
  "quantum-os": "Quantum OS",
  orchestrator: "Orchestrator",
  ccce: "CCCE Engine",
  uqcb: "UQCB Bridge",
  "pqa-service": "PQA Service",
  "physics-research": "Physics Research",
  "noncausal-lm": "NC-LM",
  "world-engine": "World Engine",
  "omega-analysis": "Omega Analysis",
  "data-platform": "Data Platform",
  "scimitar-power-dashboard": "Power Dashboard",
  architecture: "Architecture",
  "research-gateway": "Community",
  setup: "Settings",
  devices: "Devices",
}

interface BreadcrumbNavProps {
  className?: string
}

export function BreadcrumbNav({ className }: BreadcrumbNavProps) {
  const pathname = usePathname()

  if (pathname === "/") return null

  const segments = pathname.split("/").filter(Boolean)

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm", className)}>
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Home"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
      </Link>

      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const isLast = index === segments.length - 1
        const label = routeLabels[segment] || segment.replace(/-/g, " ")

        return (
          <div key={href} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" aria-hidden="true" />
            {isLast ? (
              <span className="text-foreground font-medium capitalize" aria-current="page">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors capitalize p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
