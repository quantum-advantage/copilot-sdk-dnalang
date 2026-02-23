"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

interface Agent {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  fitness: number
}

export function SwarmVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [avgFitness, setAvgFitness] = useState(0)

  useEffect(() => {
    // Initialize agents
    const initialAgents: Agent[] = Array.from({ length: 64 }, (_, i) => ({
      id: i,
      x: Math.random() * 400,
      y: Math.random() * 300,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      fitness: Math.random(),
    }))
    setAgents(initialAgents)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      ctx.fillStyle = "rgb(9, 9, 11)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw agents
      setAgents((prevAgents) => {
        const newAgents = prevAgents.map((agent) => {
          let { x, y, vx, vy, fitness } = agent

          // Update position
          x += vx
          y += vy

          // Bounce off walls
          if (x < 0 || x > canvas.width) vx *= -1
          if (y < 0 || y > canvas.height) vy *= -1

          // Keep in bounds
          x = Math.max(0, Math.min(canvas.width, x))
          y = Math.max(0, Math.min(canvas.height, y))

          // Slowly improve fitness
          fitness = Math.min(1, fitness + Math.random() * 0.001)

          return { ...agent, x, y, vx, vy, fitness }
        })

        // Calculate average fitness
        const avg = newAgents.reduce((sum, a) => sum + a.fitness, 0) / newAgents.length
        setAvgFitness(avg)

        // Draw agents
        newAgents.forEach((agent) => {
          const hue = agent.fitness * 180 + 180 // Blue to cyan
          ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`
          ctx.beginPath()
          ctx.arc(agent.x, agent.y, 3, 0, Math.PI * 2)
          ctx.fill()

          // Draw connections to nearby agents
          newAgents.forEach((other) => {
            if (other.id <= agent.id) return
            const dx = other.x - agent.x
            const dy = other.y - agent.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 50) {
              ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${0.1 * (1 - dist / 50)})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(agent.x, agent.y)
              ctx.lineTo(other.x, other.y)
              ctx.stroke()
            }
          })
        })

        return newAgents
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
    <Card className="p-6 bg-zinc-900/50 border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-100">Quantum Swarm (64 Agents)</h3>
        <div className="text-sm">
          <span className="text-zinc-400">Avg Fitness: </span>
          <span className="text-cyan-400 font-mono">{avgFitness.toFixed(3)}</span>
        </div>
      </div>

      <canvas ref={canvasRef} width={400} height={300} className="w-full bg-zinc-950 rounded border border-zinc-800" />
    </Card>
  )
}
