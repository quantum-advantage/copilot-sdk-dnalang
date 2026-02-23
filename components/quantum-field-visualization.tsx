"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Atom } from "lucide-react"

/**
 * Quantum Field Visualization
 * Visualizes quantum entanglement and coherence
 */
export function QuantumFieldVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [particleCount, setParticleCount] = useState(0)
  const [entanglements, setEntanglements] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Quantum particles
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      phase: number
      entangledWith: number[]
      color: string
    }

    const particles: Particle[] = []
    const particleCount = 50

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        phase: Math.random() * Math.PI * 2,
        entangledWith: [],
        color: ["#3b82f6", "#8b5cf6", "#10b981", "#d97706"][Math.floor(Math.random() * 4)],
      })
    }

    // Create entanglements
    particles.forEach((p, i) => {
      const entangleCount = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < entangleCount; j++) {
        const target = Math.floor(Math.random() * particleCount)
        if (target !== i && !p.entangledWith.includes(target)) {
          p.entangledWith.push(target)
        }
      }
    })

    let animationId: number

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      let totalEntanglements = 0

      // Draw entanglement lines
      particles.forEach((p, i) => {
        p.entangledWith.forEach((targetIndex) => {
          const target = particles[targetIndex]
          const distance = Math.sqrt(Math.pow(p.x - target.x, 2) + Math.pow(p.y - target.y, 2))

          if (distance < 200) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(target.x, target.y)

            const opacity = 1 - distance / 200
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.3})`
            ctx.lineWidth = 1
            ctx.stroke()

            totalEntanglements++
          }
        })
      })

      // Update and draw particles
      particles.forEach((p) => {
        // Update position
        p.x += p.vx
        p.y += p.vy

        // Bounce off walls
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Keep in bounds
        p.x = Math.max(0, Math.min(canvas.width, p.x))
        p.y = Math.max(0, Math.min(canvas.height, p.y))

        // Update phase
        p.phase += 0.05

        // Draw particle
        const size = 3 + Math.sin(p.phase) * 2

        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()

        // Glow effect
        ctx.beginPath()
        ctx.arc(p.x, p.y, size + 3, 0, Math.PI * 2)
        ctx.fillStyle = p.color + "40"
        ctx.fill()
      })

      setParticleCount(particles.length)
      setEntanglements(totalEntanglements)

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#8b5cf6]/20 rounded-md">
            <Atom className="h-5 w-5 text-[#8b5cf6]" />
          </div>
          <h3 className="text-lg font-semibold">Quantum Field</h3>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            {particleCount} particles
          </Badge>
          <Badge variant="outline" className="text-xs">
            {entanglements} entanglements
          </Badge>
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-[400px] rounded-lg bg-background/50" />

      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#3b82f6]" />
          <span className="text-xs text-muted-foreground">Adenine</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#10b981]" />
          <span className="text-xs text-muted-foreground">Thymine</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#8b5cf6]" />
          <span className="text-xs text-muted-foreground">Guanine</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#d97706]" />
          <span className="text-xs text-muted-foreground">Cytosine</span>
        </div>
      </div>
    </Card>
  )
}
