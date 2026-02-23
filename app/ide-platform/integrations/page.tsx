"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { QuantumButton } from "@/components/ui/quantum-button"
import {
  ChevronRight,
  Plug,
  Check,
  Settings,
  ExternalLink,
  RefreshCw,
  Cloud,
  Database,
  GitBranch,
  Terminal,
  Shield,
  Zap,
  Activity,
} from "lucide-react"

const integrations = [
  {
    id: "ibm-quantum",
    name: "IBM Quantum",
    description: "Connect to IBM's quantum processors and simulators",
    category: "Quantum Hardware",
    status: "connected",
    icon: Cloud,
    color: "text-blue-500",
    config: {
      apiKey: "•••••••••••••••",
      backend: "ibm_brisbane",
      shots: 8192,
    },
  },
  {
    id: "aws-braket",
    name: "AWS Braket",
    description: "Amazon's fully managed quantum computing service",
    category: "Quantum Hardware",
    status: "available",
    icon: Cloud,
    color: "text-orange-500",
    config: null,
  },
  {
    id: "azure-quantum",
    name: "Azure Quantum",
    description: "Microsoft's quantum computing platform",
    category: "Quantum Hardware",
    status: "available",
    icon: Cloud,
    color: "text-cyan-500",
    config: null,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Version control and collaboration for your organisms",
    category: "Development",
    status: "connected",
    icon: GitBranch,
    color: "text-foreground",
    config: {
      username: "dna-developer",
      repos: 12,
    },
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Store organism results and evolution history",
    category: "Database",
    status: "connected",
    icon: Database,
    color: "text-emerald-500",
    config: {
      project: "dnalang-prod",
      tables: 8,
    },
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Deploy and host your DNA-Lang applications",
    category: "Deployment",
    status: "connected",
    icon: Zap,
    color: "text-foreground",
    config: {
      team: "dna-team",
      projects: 3,
    },
  },
  {
    id: "prometheus",
    name: "Prometheus",
    description: "Monitor organism performance and metrics",
    category: "Monitoring",
    status: "available",
    icon: Activity,
    color: "text-red-500",
    config: null,
  },
  {
    id: "vault",
    name: "HashiCorp Vault",
    description: "Secure secrets management for API keys",
    category: "Security",
    status: "available",
    icon: Shield,
    color: "text-amber-500",
    config: null,
  },
]

const categories = ["All", "Quantum Hardware", "Development", "Database", "Deployment", "Monitoring", "Security"]

function IntegrationsContent() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [syncingId, setSyncingId] = useState<string | null>(null)

  const filteredIntegrations = integrations.filter((i) => selectedCategory === "All" || i.category === selectedCategory)

  const connectedCount = integrations.filter((i) => i.status === "connected").length

  const handleSync = (id: string) => {
    setSyncingId(id)
    setTimeout(() => setSyncingId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Link href="/ide-platform">
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
          </Link>
          <Plug className="h-5 w-5 text-primary" />
          <span className="font-semibold">Integration Hub</span>
          <Badge variant="outline" className="ml-2">
            <Check className="h-3 w-3 mr-1 text-secondary" />
            {connectedCount} connected
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Settings className="h-4 w-4" />
            Global Settings
          </Button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard depth={1} className="text-center">
            <div className="text-2xl font-bold text-primary">{connectedCount}</div>
            <div className="text-sm text-muted-foreground">Connected</div>
          </GlassCard>
          <GlassCard depth={1} className="text-center">
            <div className="text-2xl font-bold text-secondary">{integrations.length - connectedCount}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </GlassCard>
          <GlassCard depth={1} className="text-center">
            <div className="text-2xl font-bold text-accent">3</div>
            <div className="text-sm text-muted-foreground">Quantum Backends</div>
          </GlassCard>
          <GlassCard depth={1} className="text-center">
            <div className="text-2xl font-bold">100%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </GlassCard>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => (
            <GlassCard
              key={integration.id}
              depth={2}
              className={integration.status === "connected" ? "border-secondary/30" : ""}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${integration.color}`}>
                    <integration.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{integration.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {integration.category}
                    </Badge>
                  </div>
                </div>
                {integration.status === "connected" ? (
                  <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline">Available</Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>

              {integration.config && (
                <div className="bg-muted/30 rounded-lg p-3 mb-4 space-y-1 text-sm">
                  {Object.entries(integration.config).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <span className="font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                {integration.status === "connected" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 bg-transparent"
                      onClick={() => handleSync(integration.id)}
                    >
                      {syncingId === integration.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Sync
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <QuantumButton variant="compliance" size="sm" className="flex-1">
                    <Plug className="h-3 w-3 mr-1" />
                    Connect
                  </QuantumButton>
                )}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Custom Integration */}
        <GlassCard depth={2}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <Terminal className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Custom Integration</h3>
                <p className="text-sm text-muted-foreground">Connect any service using webhooks or REST API</p>
              </div>
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <ExternalLink className="h-4 w-4" />
              Documentation
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={null}>
      <IntegrationsContent />
    </Suspense>
  )
}
