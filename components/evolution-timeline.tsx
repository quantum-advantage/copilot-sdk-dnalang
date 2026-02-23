"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

/**
 * Evolution Timeline
 * Shows system improvement over generations
 */
export function EvolutionTimeline() {
  const [data, setData] = useState<Array<{ generation: number; fitness: number; coherence: number }>>([])

  useEffect(() => {
    // Generate evolution data
    const evolutionData = []
    let fitness = 50
    let coherence = 70

    for (let i = 0; i <= 50; i++) {
      // Evolutionary improvement with some noise
      fitness = Math.min(100, fitness + Math.random() * 2 + 0.5)
      coherence = Math.min(100, coherence + Math.random() * 1.5 + 0.3)

      evolutionData.push({
        generation: i,
        fitness: Math.round(fitness * 10) / 10,
        coherence: Math.round(coherence * 10) / 10,
      })
    }

    setData(evolutionData)
  }, [])

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#d97706]/20 rounded-md">
            <TrendingUp className="h-5 w-5 text-[#d97706]" />
          </div>
          <h3 className="text-lg font-semibold">Evolution Timeline</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          50 Generations
        </Badge>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorFitness" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCoherence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="generation"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{
              value: "Generation",
              position: "insideBottom",
              offset: -5,
              style: { fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Area
            type="monotone"
            dataKey="fitness"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorFitness)"
            name="Fitness"
          />
          <Area
            type="monotone"
            dataKey="coherence"
            stroke="#8b5cf6"
            fillOpacity={1}
            fill="url(#colorCoherence)"
            name="Coherence"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <div className="text-xs text-muted-foreground mb-1">Fitness Gain</div>
          <div className="text-xl font-bold text-[#10b981]">+50%</div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <div className="text-xs text-muted-foreground mb-1">Coherence Gain</div>
          <div className="text-xl font-bold text-[#8b5cf6]">+30%</div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <div className="text-xs text-muted-foreground mb-1">Improvement Rate</div>
          <div className="text-xl font-bold text-[#d97706]">+1.6%/gen</div>
        </div>
      </div>
    </Card>
  )
}
