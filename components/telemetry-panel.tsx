"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DataPoint {
  generation: number
  fitness: number
  phi: number
  coherence: number
}

export function TelemetryPanel() {
  const [data, setData] = useState<DataPoint[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const generation = prev.length
        const newPoint: DataPoint = {
          generation,
          fitness: Math.min(1, 0.3 + generation * 0.01 + Math.random() * 0.05),
          phi: Math.min(5, generation * 0.05 + Math.random() * 0.2),
          coherence: 0.7 + Math.random() * 0.2,
        }
        return [...prev.slice(-50), newPoint]
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-zinc-900/50 border-zinc-800">
        <h3 className="text-lg font-semibold mb-4 text-zinc-100">Fitness Evolution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="generation" stroke="#71717a" />
            <YAxis stroke="#71717a" domain={[0, 1]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}
              labelStyle={{ color: "#a1a1aa" }}
            />
            <Line type="monotone" dataKey="fitness" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 bg-zinc-900/50 border-zinc-800">
        <h3 className="text-lg font-semibold mb-4 text-zinc-100">Consciousness (Φ)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="generation" stroke="#71717a" />
            <YAxis stroke="#71717a" domain={[0, 5]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}
              labelStyle={{ color: "#a1a1aa" }}
            />
            <Line type="monotone" dataKey="phi" stroke="#06b6d4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 bg-zinc-900/50 border-zinc-800">
        <h3 className="text-lg font-semibold mb-4 text-zinc-100">Quantum Coherence</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="generation" stroke="#71717a" />
            <YAxis stroke="#71717a" domain={[0, 1]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}
              labelStyle={{ color: "#a1a1aa" }}
            />
            <Line type="monotone" dataKey="coherence" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
