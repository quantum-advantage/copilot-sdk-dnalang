"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const NUCLEOTIDES = ["A", "T", "G", "C"] as const
const COLORS = {
  A: "text-blue-400",
  T: "text-emerald-400",
  G: "text-purple-400",
  C: "text-amber-400",
}

export function NucleotideSequence({ length = 50, className }: { length?: number; className?: string }) {
  const [sequence, setSequence] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    // Generate random DNA sequence
    const seq = Array.from({ length }, () => NUCLEOTIDES[Math.floor(Math.random() * NUCLEOTIDES.length)])
    setSequence(seq)

    // Animate sequence
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % length)
    }, 100)

    return () => clearInterval(interval)
  }, [length])

  return (
    <div className={cn("flex flex-wrap gap-1 font-mono text-sm", className)}>
      {sequence.map((nucleotide, i) => (
        <span
          key={i}
          className={cn(
            "transition-all duration-300",
            COLORS[nucleotide as keyof typeof COLORS],
            i === activeIndex && "scale-125 font-bold nucleotide-badge",
          )}
        >
          {nucleotide}
        </span>
      ))}
    </div>
  )
}
