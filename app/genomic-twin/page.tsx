"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Brain,
  MessageSquare,
  Database,
  Server,
  Zap,
  Shield,
  Activity,
  Code2,
  FileJson,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Copy,
  RefreshCw,
  Settings,
  ChevronRight,
} from "lucide-react"

const apiEndpoints = [
  {
    method: "POST",
    endpoint: "/api/generate",
    description: "Single-turn agent tasks, code/genomics snippet generation",
    example: `curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Summarize VCF variants for EXON 12",
  "format": "json",
  "stream": false
}'`,
  },
  {
    method: "POST",
    endpoint: "/api/chat",
    description: "Multi-agent conversations, assistant-driven workflows",
    example: `curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [{"role": "user", "content": "Plan PK simulation"}],
  "tools": [{"type": "function", "function": {...}}]
}'`,
  },
  {
    method: "POST",
    endpoint: "/api/embed",
    description: "Vectorize papers, EHR notes, variant annotations",
    example: `curl http://localhost:11434/api/embed -d '{
  "model": "llama3.2",
  "input": "BRCA1 variant c.5266dupC"
}'`,
  },
  {
    method: "GET",
    endpoint: "/api/tags",
    description: "Inventory and runtime resource management",
    example: `curl http://localhost:11434/api/tags`,
  },
]

const complianceFeatures = [
  { icon: Shield, label: "Device Encryption", description: "Model blobs encrypted at rest" },
  { icon: CheckCircle2, label: "SHA-256 Verification", description: "Blob integrity validation" },
  { icon: Clock, label: "Audit Logging", description: "Timestamped operation logs" },
  { icon: AlertCircle, label: "IRB/Ethics Gating", description: "Experiment approval workflow" },
]

const modelStatus = [
  { name: "llama3.2-genomics", status: "running", memory: "4.2GB", requests: "1,247" },
  { name: "clinical-embed-v2", status: "idle", memory: "1.8GB", requests: "892" },
  { name: "variant-classifier", status: "running", memory: "2.1GB", requests: "3,421" },
]

export default function GenomicTwinPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(0)
  const [chatInput, setChatInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 shrink-0">
              <Brain className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Genomic Twin</h1>
                <Badge className="bg-secondary/20 text-secondary border-secondary/30">Beta</Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                AI-powered genomic analysis platform with RAG pipelines, real-time inference, and clinical JSON outputs.
                Built on the model-serving API for deterministic, auditable LLM operations.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/ide-platform/docs">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <FileJson className="h-4 w-4" />
                  API Docs
                </Button>
              </Link>
              <Button className="gap-2">
                <Zap className="h-4 w-4" />
                Launch Console
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Server className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-xs text-muted-foreground">Active Models</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <MessageSquare className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">5.5K</div>
                    <div className="text-xs text-muted-foreground">Requests Today</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Database className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">8.1GB</div>
                    <div className="text-xs text-muted-foreground">Memory Used</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-4/10">
                    <Activity className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">42ms</div>
                    <div className="text-xs text-muted-foreground">Avg Latency</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Integration Map */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Integration Map</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {apiEndpoints.map((api, i) => (
                  <div
                    key={api.endpoint}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => setSelectedEndpoint(i)}
                  >
                    <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                      {api.method}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <code className="text-sm text-primary font-mono">{api.endpoint}</code>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{api.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Live Chat Demo */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-medium">Live Chat Demo</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  <Activity className="h-2.5 w-2.5 mr-1 text-secondary animate-pulse" />
                  Connected
                </Badge>
              </div>
              <ScrollArea className="h-[300px] p-4">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="p-2 rounded-full bg-muted shrink-0 h-8 w-8 flex items-center justify-center">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">
                        Welcome to Genomic Twin. I can help you analyze variants, generate clinical reports, and answer
                        genomics questions. How can I assist you today?
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about genomic analysis..."
                    className="flex-1 px-4 py-2 rounded-lg bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button size="icon" disabled={!chatInput || isProcessing}>
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-2">
                {apiEndpoints.map((api, i) => (
                  <button
                    key={api.endpoint}
                    onClick={() => setSelectedEndpoint(i)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedEndpoint === i ? "bg-primary/10 border border-primary/30" : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {api.method}
                      </Badge>
                      <code className="text-sm font-mono">{api.endpoint}</code>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{api.description}</p>
                  </button>
                ))}
              </div>
              <Card className="lg:col-span-2 overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    <span className="font-medium">Example Request</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCode(apiEndpoints[selectedEndpoint].example)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <ScrollArea className="h-[400px]">
                  <pre className="p-4 text-sm font-mono text-muted-foreground overflow-x-auto">
                    <code>{apiEndpoints[selectedEndpoint].example}</code>
                  </pre>
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Deployed Models</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Button size="sm">
                  <Zap className="h-4 w-4 mr-1" />
                  Deploy New
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {modelStatus.map((model) => (
                <Card key={model.name} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${model.status === "running" ? "bg-secondary/10" : "bg-muted"}`}>
                      <Server
                        className={`h-5 w-5 ${model.status === "running" ? "text-secondary" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{model.name}</span>
                        <Badge
                          variant="outline"
                          className={model.status === "running" ? "border-secondary/50 text-secondary" : ""}
                        >
                          {model.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Memory: {model.memory}</span>
                        <span>Requests: {model.requests}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Security & Compliance</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {complianceFeatures.map((feature) => (
                  <div key={feature.label} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <feature.icon className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <div className="font-medium">{feature.label}</div>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Data Handling</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                  <span>PHI processing performed locally where possible to minimize third-party exposure</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                  <span>All create/push/pull operations are signed and timestamped for audit trails</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                  <span>Schema validation enforced for clinical fields to prevent hallucinated recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                  <span>Model registry with version pins and automated validation before deployment</span>
                </li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
