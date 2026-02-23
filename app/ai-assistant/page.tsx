"use client"

import { useState, useRef, useEffect, Suspense, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Sparkles,
  Bot,
  User,
  Code2,
  Dna,
  Zap,
  Activity,
  Globe,
  Shield,
  Copy,
  Check,
  RefreshCw,
  Settings2,
  Cpu,
  Network,
  Workflow,
  Mic,
  Paperclip,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { callNCLMInfer, generateAIResponse, type AIMessage, type AIConnectionStatus, type AIUsageMetrics } from "@/lib/ai-client"

const quickPrompts = [
  { label: "Explain DNA-Lang syntax", icon: Code2 },
  { label: "Debug quantum circuit", icon: Workflow },
  { label: "Optimize performance", icon: Zap },
  { label: "Generate codon template", icon: Dna },
]

const systemCapabilities = [
  { icon: Globe, title: "Non-Local Processing", description: "Distributed quantum inference" },
  { icon: Cpu, title: "Quantum-Enhanced", description: "Superposition reasoning" },
  { icon: Shield, title: "Secure Connection", description: "E2E encrypted" },
  { icon: Network, title: "Low Latency", description: "~120ms response" },
]

function formatTime(date: Date) {
  const h = date.getHours()
  const m = date.getMinutes()
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`
}

function AIAssistantContent() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm the DNA-Lang Quantum AI Assistant. I can help you with code generation, debugging, optimization, and understanding biological computing paradigms. How can I assist you today?",
      timestamp: new Date(),
      metadata: { model: "quantum-gpt-4", tokens: 42, latency: 124 },
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<AIConnectionStatus>({
    status: "connected",
    latency: 142,
    endpoint: "qai.dna-lang.io",
    protocol: "QEC-TLS 1.3",
    lastHeartbeat: new Date(),
  })
  const [usage, setUsage] = useState<AIUsageMetrics>({
    tokensUsed: 847,
    tokensLimit: 10000,
    queriesUsed: 3,
    queriesLimit: 100,
    sessionStart: new Date(),
  })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showCapabilities, setShowCapabilities] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus((prev) => ({
        ...prev,
        latency: Math.floor(Math.random() * 80) + 100,
        lastHeartbeat: new Date(),
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    // Call NC-LM API for inference
    const response = await callNCLMInfer(input.trim())

    const assistantMessage: AIMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response.content,
      timestamp: new Date(),
      metadata: response.metadata,
    }

    setMessages((prev) => [...prev, assistantMessage])
    setUsage((prev) => ({
      ...prev,
      tokensUsed: prev.tokensUsed + (response.metadata.tokens || 0),
      queriesUsed: prev.queriesUsed + 1,
    }))
    setIsProcessing(false)
  }, [input, isProcessing])

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="md:hidden p-2 -ml-2 hover:bg-muted rounded-xl transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold">Quantum AI</h1>
              <div className="flex items-center gap-1.5">
                <Activity
                  className={cn(
                    "h-2.5 w-2.5",
                    connectionStatus.status === "connected" ? "text-secondary animate-pulse" : "text-muted-foreground",
                  )}
                />
                <span className="text-[10px] text-muted-foreground">{connectionStatus.latency}ms</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-9 w-9 p-0"
              onClick={() => setShowCapabilities(!showCapabilities)}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:flex h-9 w-9 p-0">
              <Settings2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {showCapabilities && (
          <div className="lg:hidden px-4 pb-3 border-t border-border bg-muted/30 animate-fade-in">
            <div className="grid grid-cols-2 gap-2 pt-3">
              {systemCapabilities.map((cap) => (
                <div key={cap.title} className="flex items-center gap-2 p-2 bg-background rounded-lg">
                  <cap.icon className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{cap.title}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{cap.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Tokens: {usage.tokensUsed.toLocaleString()}/{usage.tokensLimit.toLocaleString()}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {usage.queriesUsed}/{usage.queriesLimit} queries
              </Badge>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col max-w-[900px] mx-auto w-full">
          {/* Messages */}
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            <div className="space-y-4 py-4 pb-32 md:pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2 sm:gap-3 animate-fade-in",
                    message.role === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center",
                      message.role === "user"
                        ? "bg-primary/20 text-primary"
                        : "bg-gradient-to-br from-secondary/20 to-primary/20 text-secondary",
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex-1 max-w-[90%] sm:max-w-[80%]",
                      message.role === "user" && "flex flex-col items-end",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm",
                      )}
                    >
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 px-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.metadata && (
                        <>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-[10px] text-muted-foreground">{message.metadata.latency}ms</span>
                          {message.metadata.phi && (
                            <>
                              <span className="text-[10px] text-muted-foreground">•</span>
                              <span className={`text-[10px] ${message.metadata.conscious ? "text-secondary" : "text-muted-foreground"}`}>
                                Φ {message.metadata.phi.toFixed(3)}
                              </span>
                            </>
                          )}
                        </>
                      )}
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-0.5 ml-1">
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors touch-feedback"
                            aria-label="Copy message"
                          >
                            {copiedId === message.id ? (
                              <Check className="h-3 w-3 text-secondary" />
                            ) : (
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            )}
                          </button>
                          <button className="p-1.5 hover:bg-muted rounded-lg transition-colors touch-feedback hidden sm:block">
                            <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button className="p-1.5 hover:bg-muted rounded-lg transition-colors touch-feedback hidden sm:block">
                            <ThumbsDown className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex gap-2 sm:gap-3 animate-fade-in">
                  <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-secondary/20 to-primary/20 text-secondary">
                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-3 sm:px-4 py-2.5 sm:py-3">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Processing quantum inference...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:relative bg-background/95 backdrop-blur-xl border-t border-border md:border-0 p-3 md:p-4 safe-area-bottom md:pb-4">
            {/* Quick Prompts - horizontal scroll on mobile */}
            <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none -mx-1 px-1">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => handleQuickPrompt(prompt.label)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-xs transition-colors touch-feedback"
                >
                  <prompt.icon className="h-3 w-3 text-primary" />
                  <span className="whitespace-nowrap">{prompt.label}</span>
                </button>
              ))}
            </div>

            <div className="relative flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Ask about DNA-Lang..."
                  className="w-full min-h-[48px] max-h-[120px] py-3 pl-4 pr-12 bg-muted border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <button className="p-2 hover:bg-background rounded-xl transition-colors hidden sm:block">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 hover:bg-background rounded-xl transition-colors hidden sm:block">
                    <Mic className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <Button
                size="lg"
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="h-12 w-12 p-0 rounded-xl shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-[280px] border-l border-border p-4 space-y-4">
          <GlassCard depth={1}>
            <h3 className="font-semibold text-sm mb-3">System Capabilities</h3>
            <div className="space-y-3">
              {systemCapabilities.map((cap) => (
                <div key={cap.title} className="flex items-start gap-3">
                  <div className="p-1.5 bg-primary/10 rounded-md shrink-0">
                    <cap.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{cap.title}</div>
                    <div className="text-xs text-muted-foreground">{cap.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard depth={1}>
            <h3 className="font-semibold text-sm mb-3">Connection Info</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model</span>
                <span className="font-mono">quantum-gpt-4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Endpoint</span>
                <span className="font-mono">{connectionStatus.endpoint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protocol</span>
                <span className="font-mono">{connectionStatus.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Latency</span>
                <span className="font-mono text-secondary">~{connectionStatus.latency}ms</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard depth={1}>
            <h3 className="font-semibold text-sm mb-3">Usage This Session</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Tokens</span>
                  <span>
                    {usage.tokensUsed.toLocaleString()} / {usage.tokensLimit.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(usage.tokensUsed / usage.tokensLimit) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Queries</span>
                  <span>
                    {usage.queriesUsed} / {usage.queriesLimit}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full transition-all duration-500"
                    style={{ width: `${(usage.queriesUsed / usage.queriesLimit) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

const DynamicAIAssistantContent = dynamic(
  () => Promise.resolve(AIAssistantContent),
  { ssr: false }
)

export default function AIAssistantPage() {
  return (
    <Suspense fallback={null}>
      <DynamicAIAssistantContent />
    </Suspense>
  )
}
