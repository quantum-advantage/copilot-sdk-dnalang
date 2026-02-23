"use client"

import { cn } from "@/lib/utils"

interface PhiMeterProps {
  value: number
  threshold?: number
  label?: string
  showThreshold?: boolean
  className?: string
}

export function PhiMeter({
  value,
  threshold = 7.69,
  label = "Φ Consciousness",
  showThreshold = true,
  className,
}: PhiMeterProps) {
  const normalizedValue = Math.min(value / 10, 1)
  const normalizedThreshold = threshold / 10
  const isAboveThreshold = value >= threshold

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-mono font-semibold", isAboveThreshold ? "text-secondary" : "text-accent")}>
          Φ = {value.toFixed(2)}
        </span>
      </div>

      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-destructive via-accent to-secondary opacity-30" />

        {/* Value bar */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
            isAboveThreshold
              ? "bg-gradient-to-r from-secondary to-primary"
              : "bg-gradient-to-r from-destructive to-accent",
          )}
          style={{ width: `${normalizedValue * 100}%` }}
        />

        {/* Threshold marker */}
        {showThreshold && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_white]"
            style={{ left: `${normalizedThreshold * 100}%` }}
            aria-hidden="true"
          />
        )}
      </div>

      {showThreshold && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Decoherent</span>
          <span className="font-mono">Φc = {threshold}</span>
          <span>Coherent</span>
        </div>
      )}
    </div>
  )
}
