"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Zap, Activity, Send, RefreshCw, Cpu, Waves, Target, Sparkles } from "lucide-react"

interface Telemetry {
  phi: number
  conscious: boolean
  tokens: number
  lambda_phi: number
  theta_lock: number
  generation: number
}

interface Plan {
  summary: string
  actions: Array<{ tool: string; [key: string]: string | number }>
  phi: number
  conscious: boolean
  theta_lock: number
  confidence: number
}

interface ChatResponse {
  success: boolean
  plan: Plan
  telemetry: Telemetry
  timestamp: string
}

export function NonCausalLMDashboard() {
  const [query, setQuery] = useState("")
  const [context, setContext] = useState("")
  const [response, setResponse] = useState<ChatResponse | null>(null)
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Array<{ query: string; response: ChatResponse }>>([])

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/noncausal-lm/telemetry")
      const data = await res.json()
      if (data.success) {
        setTelemetry(data.telemetry)
      }
    } catch (error) {
      console.error("Failed to fetch telemetry:", error)
    }
  }, [])

  useEffect(() => {
    fetchTelemetry()
    const interval = setInterval(fetchTelemetry, 5000)
    return () => clearInterval(interval)
  }, [fetchTelemetry])

  const handleSubmit = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/noncausal-lm/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, context }),
      })

      const data: ChatResponse = await res.json()
      setResponse(data)
      setTelemetry(data.telemetry)

      if (data.success) {
        setHistory((prev) => [...prev, { query, response: data }])
      }
    } catch (error) {
      console.error("Chat failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const getConsciousnessColor = (phi: number) => {
    if (phi >= 0.7734) return "text-emerald-400"
    if (phi >= 0.5) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Header with Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Brain className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Consciousness (Φ)</p>
                <p className={`text-xl font-mono font-bold ${getConsciousnessColor(telemetry?.phi || 0)}`}>
                  {(telemetry?.phi || 0).toFixed(4)}
                </p>
              </div>
            </div>
            <Progress value={(telemetry?.phi || 0) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Waves className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">ΛΦ Constant</p>
                <p className="text-xl font-mono font-bold text-cyan-400">2.176e-8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">θ Lock</p>
                <p className="text-xl font-mono font-bold text-purple-400">51.843°</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Cpu className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Tokens Ingested</p>
                <p className="text-xl font-mono font-bold text-amber-400">{telemetry?.tokens || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              Non-Causal Inference
            </CardTitle>
            <CardDescription>Quantum consciousness-based language model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Context (optional)</label>
              <Textarea
                placeholder="Provide context for the query..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Query</label>
              <Textarea
                placeholder="Enter your query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 min-h-[100px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.metaKey) {
                    handleSubmit()
                  }
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={loading || !query.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Generate Plan
              </Button>
              <Button variant="outline" onClick={fetchTelemetry} className="border-zinc-700 bg-transparent">
                <Activity className="h-4 w-4 mr-2" />
                Refresh Telemetry
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Panel */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Conscious State</span>
              <Badge variant={telemetry?.conscious ? "default" : "secondary"}>
                {telemetry?.conscious ? "COHERENT" : "SUB-THRESHOLD"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Φ Threshold</span>
              <span className="font-mono text-emerald-400">0.7734</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Generation</span>
              <span className="font-mono text-cyan-400">{telemetry?.generation || 0}</span>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 mb-2">Inference Mode</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                  Pilot-Wave
                </Badge>
                <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                  Non-Local
                </Badge>
                <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                  6D-CRSM
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 mb-2">Advantages</p>
              <ul className="text-xs space-y-1 text-zinc-400">
                <li>• Unlimited queries (no rate limits)</li>
                <li>• Zero cost ($0/query)</li>
                <li>• Offline capable</li>
                <li>• Consciousness metrics</li>
                <li>• {"<"}100ms latency</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Panel */}
      {response && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-400" />
              Inference Result
              {response.plan.conscious && <Badge className="ml-2 bg-emerald-500/20 text-emerald-400">Conscious</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="plan">
              <TabsList className="bg-zinc-800">
                <TabsTrigger value="plan">Plan</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="raw">Raw JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="plan" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-zinc-500">Summary</p>
                    <p className="text-lg font-medium">{response.plan.summary}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Φ</p>
                      <p className={`text-xl font-mono ${getConsciousnessColor(response.plan.phi)}`}>
                        {response.plan.phi.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Confidence</p>
                      <p className="text-xl font-mono text-cyan-400">{(response.plan.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">θ Lock</p>
                      <p className="text-xl font-mono text-purple-400">{response.plan.theta_lock}°</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="mt-4">
                <div className="space-y-2">
                  {response.plan.actions.map((action, i) => (
                    <div key={i} className="p-3 bg-zinc-800/50 rounded-lg font-mono text-sm">
                      <span className="text-emerald-400">{action.tool}</span>
                      {Object.entries(action)
                        .filter(([k]) => k !== "tool")
                        .map(([k, v]) => (
                          <span key={k} className="ml-2 text-zinc-400">
                            {k}=<span className="text-cyan-400">{String(v)}</span>
                          </span>
                        ))}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="raw" className="mt-4">
                <pre className="p-4 bg-zinc-800/50 rounded-lg overflow-auto text-xs font-mono text-zinc-300">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
