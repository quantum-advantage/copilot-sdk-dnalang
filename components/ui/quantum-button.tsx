"use client"

import type React from "react"
import { useState, useRef, forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface QuantumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "compliance" | "sovereign"
  size?: "sm" | "md" | "lg"
  showCharge?: boolean
  coherenceLevel?: number
}

export const QuantumButton = forwardRef<HTMLButtonElement, QuantumButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      showCharge = true,
      coherenceLevel = 0.85,
      children,
      onMouseDown,
      onMouseUp,
      ...props
    },
    ref,
  ) => {
    const [isCharging, setIsCharging] = useState(false)
    const [chargeComplete, setChargeComplete] = useState(false)
    const [complianceState, setComplianceState] = useState<"classical" | "quantum">("classical")
    const chargeRef = useRef<NodeJS.Timeout | null>(null)

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (showCharge) {
        setIsCharging(true)
        setChargeComplete(false)
        chargeRef.current = setTimeout(() => {
          setChargeComplete(true)
          if (variant === "compliance") {
            setComplianceState((prev) => (prev === "classical" ? "quantum" : "classical"))
          }
        }, 600)
      }
      onMouseDown?.(e)
    }

    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (showCharge) {
        setIsCharging(false)
        if (chargeRef.current) {
          clearTimeout(chargeRef.current)
        }
      }
      onMouseUp?.(e)
    }

    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden"

    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-border bg-transparent hover:bg-muted",
      ghost: "hover:bg-muted",
      compliance: cn(
        "text-white transition-all duration-500",
        complianceState === "classical" ? "compliance-gradient-classical" : "compliance-gradient-quantum",
      ),
      sovereign: "sovereign-gradient text-white hover:shadow-lg hover:shadow-accent/30",
    }

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          showCharge && "quantum-btn",
          isCharging && "scale-[0.98]",
          chargeComplete && "animate-haptic",
          className,
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsCharging(false)
          if (chargeRef.current) clearTimeout(chargeRef.current)
        }}
        data-compliance-state={variant === "compliance" ? complianceState : undefined}
        data-coherence={coherenceLevel}
        aria-pressed={props["aria-pressed"]}
        {...props}
      >
        {variant === "sovereign" && (
          <span
            className="absolute inset-0 rounded-md animate-pulse-glow opacity-50"
            style={{
              background: `radial-gradient(circle at center, var(--lambda-phi) 0%, transparent 70%)`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Charge ring indicator */}
        {showCharge && isCharging && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="301.6"
              strokeDashoffset="301.6"
              className="opacity-30 animate-[charge-ring_0.6s_ease-out_forwards]"
              style={{
                transformOrigin: "center",
                transform: "rotate(-90deg)",
              }}
            />
          </svg>
        )}

        {variant === "compliance" && (
          <span
            className={cn(
              "absolute top-1 right-1 w-2 h-2 rounded-full transition-colors duration-300",
              complianceState === "classical" ? "bg-blue-400" : "bg-amber-400 animate-pulse",
            )}
            aria-hidden="true"
          />
        )}

        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    )
  },
)

QuantumButton.displayName = "QuantumButton"
