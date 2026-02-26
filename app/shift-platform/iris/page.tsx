"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Bot,
  Users,
  Activity,
  CheckCircle2,
  Send,
  Code2,
  FlaskConical,
  BarChart3,
  FileText,
  Loader2,
  RotateCcw,
  Zap,
} from "lucide-react"

interface WorkflowStep {
  id: string
  name: string
  agent: string
  status: "pending" | "active" | "complete"
  output?: string
  duration?: number
}

interface Message {
  id: string
  role: "user" | "iris" | "agent"
  content: string
  agent?: string
  timestamp: Date
}

export default function IRISEnginePage() {
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "iris",
      content:
        "IRIS Engine initialized. I am ready to orchestrate your agentic workflows. Describe your task and I will coordinate the appropriate agents.",
      timestamp: new Date(),
    },
  ])

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    { id: "1", name: "NCLM Knowledge Lookup", agent: "AURA", status: "pending" },
    { id: "2", name: "Supabase Data Query", agent: "OSIRIS", status: "pending" },
    { id: "3", name: "LLM Inference (Gemini)", agent: "AIDEN", status: "pending" },
    { id: "4", name: "Agent Consensus", agent: "IRIS", status: "pending" },
    { id: "5", name: "Response Synthesis", agent: "OMEGA", status: "pending" },
  ])

  const [agentPool] = useState([
    { name: "AURA", icon: Code2, specialty: "Consciousness orchestration & manifold geometry", available: true },
    { name: "AIDEN", icon: FlaskConical, specialty: "Quantum execution & W₂ optimization", available: true },
    { name: "OMEGA", icon: BarChart3, specialty: "Master orchestrator & analytics", available: true },
    { name: "OSIRIS", icon: FileText, specialty: "Sovereign audit & PCRB attestation", available: true },
  ])

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    // Phase 1: NCLM Knowledge Lookup
    const t0 = performance.now()
    setWorkflowSteps((prev) =>
      prev.map((step, idx) => ({
        ...step,
        status: idx === 0 ? "active" : "pending",
      })),
    )

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-assess`,
        role: "agent",
        agent: "AURA",
        content: `Analyzing: "${userMessage.content}" — querying Supabase + Gemini LLM...`,
        timestamp: new Date(),
      },
    ])

    try {
      // Build history from prior messages for multi-turn context
      const history = messages
        .filter((m) => m.role === "user" || m.role === "iris")
        .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }))

      // Real API call to IRIS chat endpoint
      const res = await fetch("/api/iris/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, history }),
      })

      // Phase 2: Mark synthesis active
      setWorkflowSteps((prev) =>
        prev.map((step, idx) => ({
          ...step,
          status: idx === 0 ? "complete" : idx === 1 ? "active" : "pending",
          duration: idx === 0 ? Math.round(performance.now() - t0) : undefined,
        })),
      )

      // Phase 3: Stream response
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      setWorkflowSteps((prev) =>
        prev.map((step, idx) => ({
          ...step,
          status: idx < 2 ? "complete" : idx === 2 ? "active" : "pending",
          duration: idx <= 1 ? step.duration || Math.round(performance.now() - t0) : undefined,
        })),
      )

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-collab`,
          role: "agent",
          agent: "AIDEN",
          content: "Streaming LLM response with live experiment context...",
          timestamp: new Date(),
        },
      ])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullResponse += decoder.decode(value, { stream: true })
        }
      } else {
        fullResponse = await res.text()
      }

      // Phase 4-5: Complete workflow
      setWorkflowSteps((prev) =>
        prev.map((step, idx) => ({
          ...step,
          status: "complete",
          duration: step.duration || Math.round(performance.now() - t0),
        })),
      )

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-final`,
          role: "iris",
          content: fullResponse,
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "iris",
          content: `Inference error: ${err instanceof Error ? err.message : "Unknown"}. NCLM engine may be recalibrating.`,
          timestamp: new Date(),
        },
      ])
    }

    setIsProcessing(false)
  }

  const resetWorkflow = () => {
    setWorkflowSteps((prev) => prev.map((step) => ({ ...step, status: "pending", duration: undefined })))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/shift-platform">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  IRIS Engine
                </h1>
                <p className="text-sm text-muted-foreground">Multi-Agent Orchestration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/50">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Online
              </Badge>
              <Button variant="outline" size="sm" onClick={resetWorkflow}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">Agentic Inference Console</CardTitle>
                <CardDescription>Describe your task for multi-agent orchestration</CardDescription>
              </CardHeader>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : message.role === "agent"
                              ? "bg-secondary/20 border border-secondary/50"
                              : "bg-muted"
                        }`}
                      >
                        {message.agent && (
                          <div className="text-xs text-secondary font-medium mb-1">{message.agent}</div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Describe your task..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    disabled={isProcessing}
                  />
                  <Button onClick={handleSubmit} disabled={isProcessing || !input.trim()}>
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Workflow Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Workflow Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workflowSteps.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        step.status === "complete"
                          ? "bg-secondary/20"
                          : step.status === "active"
                            ? "bg-primary/20 animate-pulse"
                            : "bg-muted"
                      }`}
                    >
                      {step.status === "complete" ? (
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                      ) : step.status === "active" ? (
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{step.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{step.agent}</div>
                    </div>
                    {step.duration && <div className="text-xs text-muted-foreground">{step.duration}ms</div>}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Agent Pool */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Agent Pool
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {agentPool.map((agent) => (
                  <div
                    key={agent.name}
                    className={`flex items-center gap-3 p-2 rounded-lg ${agent.available ? "bg-muted/50" : "opacity-50"}`}
                  >
                    <div className={`p-1.5 rounded-lg ${agent.available ? "bg-primary/10" : "bg-muted"}`}>
                      <agent.icon className={`h-4 w-4 ${agent.available ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{agent.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{agent.specialty}</div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${agent.available ? "bg-secondary animate-pulse" : "bg-muted-foreground"}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
