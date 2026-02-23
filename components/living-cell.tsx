"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useLivingComponent } from "@/lib/dna-lang/living-component"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Heart, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface LivingCellProps {
  id: string
  title: string
  children: React.ReactNode
  className?: string
}

/**
 * Living Cell Component - Self-healing with cellular regeneration
 */
export function LivingCell({ id, title, children, className }: LivingCellProps) {
  const { health, generation, reportError } = useLivingComponent(id, `cell_${id}_dna`)
  const [isRegenerating, setIsRegenerating] = useState(false)

  useEffect(() => {
    if (health < 0.5 && health > 0.3) {
      setIsRegenerating(true)
      const timer = setTimeout(() => setIsRegenerating(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [health])

  // Health color indicator
  const healthColor = health > 0.7 ? "text-[#10b981]" : health > 0.4 ? "text-[#d97706]" : "text-[#ef4444]"

  return (
    <Card
      className={cn(
        "relative overflow-hidden glass-card holographic-layer transition-all duration-500",
        isRegenerating && "animate-pulse",
        className,
      )}
    >
      {/* Cellular membrane effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${50 + health * 20}% ${50 + health * 20}%, var(--primary) 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Health indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
        <Badge variant="outline" className="text-xs gap-1">
          <Heart className={cn("h-3 w-3", healthColor)} />
          <span className={healthColor}>{Math.round(health * 100)}%</span>
        </Badge>
        <Badge variant="outline" className="text-xs gap-1">
          <Activity className="h-3 w-3 text-[#3b82f6]" />
          <span className="text-[#3b82f6]">Gen {generation}</span>
        </Badge>
      </div>

      {/* Mitosis animation during regeneration */}
      {isRegenerating && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-[#d97706] animate-spin" />
            <span className="text-sm font-medium text-[#d97706]">Regenerating...</span>
          </div>
        </div>
      )}

      <div className="p-6 relative z-10">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {children}
      </div>

      {/* Health bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-500",
            health > 0.7 ? "bg-[#10b981]" : health > 0.4 ? "bg-[#d97706]" : "bg-[#ef4444]",
          )}
          style={{ width: `${health * 100}%` }}
        />
      </div>
    </Card>
  )
}
