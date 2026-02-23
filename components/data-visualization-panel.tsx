"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Database, Zap, Download } from "lucide-react"

interface DataVisualizationPanelProps {
  title: string
  data: any[]
  type?: "chart" | "table" | "grid"
}

export function DataVisualizationPanel({ title, data, type = "grid" }: DataVisualizationPanelProps) {
  const [timeRange, setTimeRange] = useState("1h")
  const [aggregation, setAggregation] = useState("1m")

  const exportData = () => {
    const csv = data.map((row) => Object.values(row).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `telemetry-${Date.now()}.csv`
    a.click()
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            {data.length} records
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">15m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="6h">6h</SelectItem>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7d</SelectItem>
            </SelectContent>
          </Select>

          <Select value={aggregation} onValueChange={setAggregation}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1s">1s</SelectItem>
              <SelectItem value="1m">1m</SelectItem>
              <SelectItem value="5m">5m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" variant="outline" onClick={exportData}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dynamic visualization based on type */}
      {type === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-muted-foreground">Avg Lambda</span>
            </div>
            <div className="text-2xl font-bold text-cyan-400">0.946</div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-muted-foreground">Avg Phi</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">0.7734</div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-muted-foreground">QByte Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">1.45K/s</div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-muted-foreground">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-amber-400">95.6%</div>
          </div>
        </div>
      )}

      {type === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-left text-muted-foreground">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Lambda</th>
                <th className="pb-3">Phi</th>
                <th className="pb-3">Gamma</th>
                <th className="pb-3">QByte/s</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2">{new Date(row.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2 text-cyan-400">{row.lambda?.toFixed(3)}</td>
                  <td className="py-2 text-emerald-400">{row.phi?.toExponential(2)}</td>
                  <td className="py-2 text-amber-400">{row.gamma?.toFixed(3)}</td>
                  <td className="py-2 text-purple-400">{Math.round(row.qbyte_rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
