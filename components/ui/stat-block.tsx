"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatBlockProps {
  label: string
  value: string | number
  unit?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  description?: string
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "telemetry" | "compact"
  colorScheme?: "primary" | "secondary" | "accent" | "coherence" | "decoherence" | "consciousness"
  subtext?: string
}

const gradientColors = {
  primary: "oklch(0.7 0.15 195)",
  secondary: "oklch(0.65 0.18 160)",
  accent: "oklch(0.75 0.18 85)",
  coherence: "oklch(0.7 0.15 195)",
  decoherence: "oklch(0.6 0.22 25)",
  consciousness: "oklch(0.65 0.18 160)",
}

export function StatBlock({
  label,
  value,
  unit,
  trend,
  trendValue,
  description,
  className,
  size = "md",
  variant = "default",
  colorScheme = "primary",
  subtext,
}: StatBlockProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-secondary" : trend === "down" ? "text-destructive" : "text-muted-foreground"

  const colorMap = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    coherence: "text-primary",
    decoherence: "text-destructive",
    consciousness: "text-secondary",
  }

  const variantStyles = {
    default: "space-y-1",
    telemetry: "p-4 rounded-lg bg-card border border-border relative overflow-hidden",
    compact: "space-y-0.5",
  }

  return (
    <div className={cn(variantStyles[variant], className)}>
      {variant === "telemetry" && (
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top right, ${gradientColors[colorScheme]} 0%, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}

      <div className={cn("relative z-10", variant === "telemetry" && "space-y-2")}>
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "font-bold font-mono",
              size === "sm" && "text-xl",
              size === "md" && "text-2xl",
              size === "lg" && "text-4xl",
              colorMap[colorScheme],
            )}
          >
            {value}
          </span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>

        {subtext && <div className="text-[10px] text-muted-foreground">{subtext}</div>}

        {(trend || description) && (
          <div className="flex items-center gap-2 text-xs">
            {trend && (
              <span className={cn("flex items-center gap-0.5", trendColor)}>
                <TrendIcon className="h-3 w-3" />
                {trendValue}
              </span>
            )}
            {description && <span className="text-muted-foreground">{description}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
