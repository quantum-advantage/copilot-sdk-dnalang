"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Code2,
  Puzzle,
  Layers,
  ArrowRight,
  Terminal,
  Workflow,
  FolderTree,
  Bug,
  Palette,
  Boxes,
  Sparkles,
  BookOpen,
  MessageSquare,
  ChevronRight,
  Zap,
  BarChart3,
  GitBranch,
  Plug,
  Eye,
  Users,
  Search,
  FileCode,
  RefreshCw,
  Dna,
} from "lucide-react"
import { Tooltip } from "@/components/ui/tooltip"

const capabilityCategories = { /* same as your current object */ }

export default function CapabilitiesPage() {
  const [activeTab, setActiveTab] = useState("core-ide")

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 inline-flex items-center gap-1">
            <Layers className="h-3 w-3" />
            Platform Capabilities
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need to Build IDEs
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive suite of 35+ features designed for creating, customizing, and extending development
            environments.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent mb-8">
            {Object.entries(capabilityCategories).map(([key, category]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
              >
                <Tooltip content={category.title}>
                  <category.icon className="h-4 w-4" />
                </Tooltip>
                <span className="hidden sm:inline">{category.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(capabilityCategories).map(([key, category]) => (
            <TabsContent key={key} value={key}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">{category.title}</h2>
                <p className="text-muted-foreground">{category.description}</p>
              </div>

              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.features.map((feature) => (
                  <Card
                    key={feature.title}
                    className="p-6 hover:border-primary/50 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex items-center justify-center">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {feature.highlights.map((highlight) => (
                            <Tooltip key={highlight} content={highlight}>
                              <Badge variant="secondary" className="text-xs cursor-default">
                                {highlight}
                              </Badge>
                            </Tooltip>
                          ))}
                        </div>
                        <Link href={feature.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 -ml-2 flex items-center justify-start"
                          >
                            Learn More <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* CTA */}
        <div className="text-center mt-16 py-12 border-t border-border">
          <h2 className="text-2xl font-bold mb-4">Ready to Experience All Features?</h2>
          <p className="text-muted-foreground mb-6">
            Launch the IDE platform and start building your custom environment today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ide-platform">
              <Button size="lg" className="gap-2 flex items-center justify-center">
                <Dna className="h-4 w-4" />
                Launch IDE Platform
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/ide-platform/docs">
              <Button size="lg" variant="outline" className="gap-2 flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
