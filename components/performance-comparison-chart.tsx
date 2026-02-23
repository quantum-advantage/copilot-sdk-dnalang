"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

/**
 * Performance Comparison Chart
 * Shows DNA-Lang superiority over traditional frameworks
 */
export function PerformanceComparisonChart() {
  const data = [
    {
      metric: "Search",
      "DNA-Lang": 95,
      React: 45,
      "Node.js": 50,
      Java: 40,
    },
    {
      metric: "State Mgmt",
      "DNA-Lang": 98,
      React: 70,
      "Node.js": 60,
      Java: 55,
    },
    {
      metric: "Self-Healing",
      "DNA-Lang": 100,
      React: 0,
      "Node.js": 0,
      Java: 0,
    },
    {
      metric: "Evolution",
      "DNA-Lang": 92,
      React: 0,
      "Node.js": 0,
      Java: 0,
    },
    {
      metric: "Security",
      "DNA-Lang": 96,
      React: 60,
      "Node.js": 65,
      Java: 70,
    },
    {
      metric: "Networking",
      "DNA-Lang": 100,
      React: 75,
      "Node.js": 80,
      Java: 70,
    },
  ]

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#10b981]/20 rounded-md">
            <BarChart3 className="h-5 w-5 text-[#10b981]" />
          </div>
          <h3 className="text-lg font-semibold">Performance Comparison</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          DNA-Lang Superiority
        </Badge>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{
              value: "Performance Score",
              angle: -90,
              position: "insideLeft",
              style: { fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="DNA-Lang" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="React" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Node.js" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Java" fill="#d97706" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <div className="text-xs text-muted-foreground mb-1">Average Advantage</div>
          <div className="text-2xl font-bold text-[#10b981]">+47%</div>
          <div className="text-xs text-muted-foreground mt-1">vs traditional frameworks</div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <div className="text-xs text-muted-foreground mb-1">Unique Features</div>
          <div className="text-2xl font-bold text-[#8b5cf6]">4</div>
          <div className="text-xs text-muted-foreground mt-1">Not available elsewhere</div>
        </div>
      </div>
    </Card>
  )
}
