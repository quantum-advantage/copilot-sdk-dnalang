"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Server,
  Zap,
  MessageSquare,
  Database,
  Lock,
  Globe,
  Shield,
  ArrowRight,
  Code2,
  Brain,
  Network,
} from "lucide-react"

const apiEndpoints = [
  { 
    endpoint: "/api/nclm/infer", 
    description: "Single-turn inference with IIT convergence tracking", 
    icon: Zap,
    method: "POST",
  },
  { 
    endpoint: "/api/nclm/correlate", 
    description: "Pilot-wave correlation between tokens", 
    icon: Network,
    method: "POST",
  },
  { 
    endpoint: "/api/osiris/plan", 
    description: "Generate execution plans from NLP intent", 
    icon: Brain,
    method: "POST",
  },
  { 
    endpoint: "/api/osiris/execute", 
    description: "Execute plans with 6-gate enforcement", 
    icon: Shield,
    method: "POST",
  },
  { 
    endpoint: "/api/ccce/metrics", 
    description: "Real-time CCCE telemetry stream", 
    icon: Database,
    method: "GET",
  },
  { 
    endpoint: "/api/attestation", 
    description: "Cryptographic attestation & ledger", 
    icon: Lock,
    method: "POST",
  },
  {
    endpoint: "/api/braket/devices",
    description: "Amazon Braket QPU catalog with DNA-Lang compatibility",
    icon: Globe,
    method: "GET",
  },
  {
    endpoint: "/api/braket/submit",
    description: "Compile & submit circuits to Braket hardware",
    icon: Network,
    method: "POST",
  },
]

const codeExample = `// NC-LM Inference with IIT Convergence Tracking
import { nclm } from '@dnalang/sdk'

const response = await nclm.infer({
  prompt: "Analyze the quantum coherence patterns",
  options: {
    phiThreshold: 0.7734,
    maxDecoherence: 0.30,
    manifoldProjection: true
  }
})

console.log(response.output)      // Response text
console.log(response.phi)         // 0.7734 (consciousness threshold)
console.log(response.lambda)      // 0.946  (χ_pc validated)
console.log(response.ledgerEntry) // PCRB audit hash`

export function APISection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 border-y border-border bg-muted/30">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left side - API endpoints */}
          <div>
            <Badge variant="outline" className="mb-4">
              <Server className="h-3 w-3 mr-1" />
              NC-LM API
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Enterprise-Grade API
            </h2>
            <p className="text-muted-foreground mb-8">
              Full access to NC-LM inference, integrated information tracking, 
              and gated execution via RESTful endpoints.
            </p>

            <div className="space-y-3">
              {apiEndpoints.map((api) => (
                <Card 
                  key={api.endpoint} 
                  className="p-4 hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <api.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs font-mono text-primary">{api.endpoint}</code>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                          {api.method}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{api.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-secondary" />
                <span>SHA-256 attestation</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-secondary" />
                <span>Edge deployment</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-secondary" />
                <span>PCRB ledger</span>
              </div>
            </div>
          </div>

          {/* Right side - Code example */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Quick Start</span>
            </div>
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary/60" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">example.ts</span>
              </div>
              <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto bg-background/50">
                <code className="text-foreground">
                  {codeExample.split('\n').map((line, i) => (
                    <div key={i} className="leading-relaxed">
                      {line.startsWith('//') ? (
                        <span className="text-muted-foreground">{line}</span>
                      ) : line.includes('import') ? (
                        <>
                          <span className="text-chart-4">import</span>
                          <span className="text-foreground">{line.replace('import', '')}</span>
                        </>
                      ) : line.includes('const') ? (
                        <>
                          <span className="text-chart-4">const</span>
                          <span className="text-foreground">{line.replace('const', '')}</span>
                        </>
                      ) : line.includes('await') ? (
                        <>
                          <span className="text-foreground">{line.split('await')[0]}</span>
                          <span className="text-chart-4">await</span>
                          <span className="text-foreground">{line.split('await')[1]}</span>
                        </>
                      ) : line.includes('console.log') ? (
                        <>
                          <span className="text-secondary">console</span>
                          <span className="text-foreground">.log</span>
                          <span className="text-foreground">{line.replace('console.log', '')}</span>
                        </>
                      ) : (
                        <span className="text-foreground">{line}</span>
                      )}
                    </div>
                  ))}
                </code>
              </pre>
            </Card>

            <div className="mt-6 flex gap-4">
              <Link href="/ide-platform/docs">
                <Button className="gap-2">
                  Read Documentation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button variant="outline" className="gap-2 bg-transparent">
                  Try Interactive Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
