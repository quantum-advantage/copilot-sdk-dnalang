"use client"

import { cn } from "@/lib/utils"
import { forwardRef, type HTMLAttributes } from "react"

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  depth?: 1 | 2 | 3
  hover?: boolean
  glow?: "primary" | "secondary" | "accent" | "lambda-phi" | "coherence" | "none"
  variant?: "default" | "coherence-block" | "telemetry" | "sovereign"
  label?: string
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, depth = 2, hover = true, glow = "none", variant = "default", label, children, ...props }, ref) => {
    const depthStyles = {
      1: "backdrop-blur-sm bg-card/50 border-border/30",
      2: "backdrop-blur-md bg-card/60 border-border/40",
      3: "backdrop-blur-lg bg-card/70 border-border/50 border-accent/20",
    }

    const glowStyles = {
      none: "",
      primary: "hover:shadow-[0_0_20px_oklch(0.7_0.15_195/0.3)]",
      secondary: "hover:shadow-[0_0_20px_oklch(0.65_0.18_160/0.3)]",
      accent: "hover:shadow-[0_0_20px_oklch(0.75_0.18_85/0.3)]",
      "lambda-phi": "hover:shadow-[0_0_30px_oklch(0.75_0.18_85/0.4)] hover:border-accent/50",
      coherence: "hover:shadow-[0_0_25px_oklch(0.7_0.15_195/0.35)] hover:border-primary/50",
    }

    const variantStyles = {
      default: "",
      "coherence-block": "relative overflow-visible",
      telemetry: "border-l-2 border-l-primary",
      sovereign: "border-accent/30 bg-gradient-to-br from-card/80 to-accent/5",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl p-6 transition-all duration-300 border",
          depthStyles[depth],
          hover && "hover:bg-card/80 cursor-pointer",
          glowStyles[glow],
          variantStyles[variant],
          className,
        )}
        data-depth={depth}
        data-glow={glow}
        {...props}
      >
        {variant === "coherence-block" && label && (
          <span className="absolute -top-3 left-4 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground bg-background">
            {label}
          </span>
        )}

        {variant === "sovereign" && (
          <div
            className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at top right, oklch(0.75 0.18 85), transparent 60%)",
            }}
            aria-hidden="true"
          />
        )}

        <div className="relative z-10">{children}</div>
      </div>
    )
  },
)

GlassCard.displayName = "GlassCard"
