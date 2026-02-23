import { RealTimeTelemetryDashboard } from "@/components/real-time-telemetry-dashboard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Activity, Zap, TrendingUp, Download, Upload, RefreshCw } from "lucide-react"

export default function DataPlatformPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Data Platform</h1>
              <p className="text-muted-foreground mt-2">Real-time data processing & quantum telemetry monitoring</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Activity className="h-3 w-3 mr-1" />
              Live Streaming
            </Badge>
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <Database className="h-3 w-3 mr-1" />
              PostgreSQL Connected
            </Badge>
            <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-400">
              <Zap className="h-3 w-3 mr-1" />
              Real-time Processing
            </Badge>
          </div>
        </div>

        {/* Real-time Dashboard */}
        <RealTimeTelemetryDashboard />

        {/* Data Management Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <Database className="h-8 w-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Data Storage</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Scalable PostgreSQL with automatic partitioning and compression
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Storage Used</span>
                <span className="text-foreground font-medium">24.3 GB</span>
              </div>
              <div className="flex justify-between">
                <span>Records</span>
                <span className="text-foreground font-medium">1.2M</span>
              </div>
              <div className="flex justify-between">
                <span>Compression</span>
                <span className="text-emerald-400 font-medium">72%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <Activity className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Real-time Processing</h3>
            <p className="text-sm text-muted-foreground mb-4">WebSocket streaming with sub-second latency</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Throughput</span>
                <span className="text-foreground font-medium">1,450/s</span>
              </div>
              <div className="flex justify-between">
                <span>Latency</span>
                <span className="text-emerald-400 font-medium">12ms</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime</span>
                <span className="text-emerald-400 font-medium">99.97%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
            <TrendingUp className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics Engine</h3>
            <p className="text-sm text-muted-foreground mb-4">Advanced visualizations and predictive analytics</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Active Dashboards</span>
                <span className="text-foreground font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span>Queries/min</span>
                <span className="text-foreground font-medium">850</span>
              </div>
              <div className="flex justify-between">
                <span>Cache Hit Rate</span>
                <span className="text-emerald-400 font-medium">94%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
