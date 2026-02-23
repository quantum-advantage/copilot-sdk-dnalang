"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Chrome,
  Code2,
  Download,
  ExternalLink,
  Star,
  Users,
  CheckCircle2,
  Zap,
  Shield,
  Bot,
  Sparkles,
  GitBranch,
  Terminal,
  Puzzle,
} from "lucide-react"

const chromeFeatures = [
  {
    icon: Bot,
    title: "AI Sidebar Assistant",
    description: "Real-time agentic orchestration directly in your browser with context-aware suggestions.",
  },
  {
    icon: Zap,
    title: "Instant Inference",
    description: "Quick access to IRIS multi-agent workflows without leaving your current tab.",
  },
  {
    icon: Shield,
    title: "Privacy-First",
    description: "Local processing with optional cloud sync. Your data stays yours.",
  },
  {
    icon: Sparkles,
    title: "Smart Context",
    description: "Automatically understands page content for relevant AI assistance.",
  },
]

const vscodeFeatures = [
  {
    icon: Code2,
    title: "Inline Code Actions",
    description: "AI-powered code completions, refactoring, and explanations right in your editor.",
  },
  {
    icon: GitBranch,
    title: "Git Integration",
    description: "Smart commit messages, PR descriptions, and code review assistance.",
  },
  {
    icon: Terminal,
    title: "Terminal AI",
    description: "Natural language to shell commands with context from your project.",
  },
  {
    icon: Puzzle,
    title: "Multi-Agent Workflows",
    description: "Access full IRIS orchestration for complex development tasks.",
  },
]

const installStats = {
  chrome: { users: 12500, rating: 4.8, reviews: 342 },
  vscode: { users: 28400, rating: 4.9, reviews: 891 },
}

export default function ExtensionsPage() {
  const [activeTab, setActiveTab] = useState("chrome")

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
                  <Download className="h-5 w-5 text-primary" />
                  SHIFT-AI Extensions
                </h1>
                <p className="text-sm text-muted-foreground">Free downloads for Chrome and VS Code</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Free Forever
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="chrome" className="gap-2">
              <Chrome className="h-4 w-4" />
              Chrome Extension
            </TabsTrigger>
            <TabsTrigger value="vscode" className="gap-2">
              <Code2 className="h-4 w-4" />
              VS Code Extension
            </TabsTrigger>
          </TabsList>

          {/* Chrome Extension Tab */}
          <TabsContent value="chrome" className="space-y-6">
            {/* Hero Card */}
            <Card className="bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-primary/20">
                    <Chrome className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">SHIFT-AI for Chrome</CardTitle>
                    <CardDescription className="text-base">
                      AI-powered sidebar for agentic orchestration and inference workflows
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono font-bold">{installStats.chrome.users.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm">users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-mono font-bold">{installStats.chrome.rating}</span>
                    <span className="text-muted-foreground text-sm">({installStats.chrome.reviews} reviews)</span>
                  </div>
                  <Badge variant="outline">Version 2.4.1</Badge>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="gap-2">
                    <Download className="h-5 w-5" />
                    Add to Chrome
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {chromeFeatures.map((feature) => (
                <Card key={feature.title} className="card-hover">
                  <CardHeader className="pb-2">
                    <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Screenshot Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How it works</CardTitle>
                <CardDescription>The SHIFT-AI sidebar integrates seamlessly with your browsing experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg bg-muted/50 border border-border flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Chrome className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Extension preview</p>
                    <p className="text-xs">Click "Add to Chrome" to get started</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VS Code Extension Tab */}
          <TabsContent value="vscode" className="space-y-6">
            {/* Hero Card */}
            <Card className="bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 border-blue-500/30">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-blue-500/20">
                    <Code2 className="h-10 w-10 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">SHIFT-AI for VS Code</CardTitle>
                    <CardDescription className="text-base">
                      AI coding assistant with integrated multi-agent orchestration
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono font-bold">{installStats.vscode.users.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm">installs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-mono font-bold">{installStats.vscode.rating}</span>
                    <span className="text-muted-foreground text-sm">({installStats.vscode.reviews} reviews)</span>
                  </div>
                  <Badge variant="outline">Version 3.1.0</Badge>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Download className="h-5 w-5" />
                    Install Extension
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                    View on Marketplace
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {vscodeFeatures.map((feature) => (
                <Card key={feature.title} className="card-hover">
                  <CardHeader className="pb-2">
                    <div className="p-2 rounded-lg bg-blue-500/10 w-fit mb-2">
                      <feature.icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Installation Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Installation</CardTitle>
                <CardDescription>Get started in seconds with these simple steps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { step: 1, title: "Open VS Code", description: "Launch your VS Code editor" },
                    { step: 2, title: "Open Extensions", description: "Press Ctrl+Shift+X (Cmd+Shift+X on Mac)" },
                    { step: 3, title: "Search SHIFT-AI", description: "Find and install the official extension" },
                    { step: 4, title: "Start Coding", description: "Use Ctrl+Shift+A to activate AI assistance" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Comparison Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6 text-center">Choose the right extension for you</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Chrome className="h-6 w-6 text-primary" />
                  <CardTitle>Chrome Extension</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {[
                    "Best for browsing and research",
                    "Context-aware AI assistance",
                    "Works on any website",
                    "Quick access sidebar",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Code2 className="h-6 w-6 text-blue-400" />
                  <CardTitle>VS Code Extension</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {[
                    "Best for development workflows",
                    "Inline code completions",
                    "Git and terminal integration",
                    "Full IRIS agent access",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
