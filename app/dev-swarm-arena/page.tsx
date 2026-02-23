"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Users,
  Zap,
  Clock,
  Trophy,
  Code2,
  GitBranch,
  Activity,
  Eye,
  Loader2,
  Play,
  Pause,
  Send,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"

interface Swarm {
  id: string
  name: string
  agents: number
  color: string
  score: number
  status: "idle" | "working" | "competing" | "complete"
  currentTask?: string
  completedTasks: number
  speed: number
}

interface ProjectRequest {
  title: string
  description: string
  requirements: string[]
  complexity: "Simple" | "Medium" | "Complex"
  deadline: string
}

interface OrchestrationEvent {
  id: string
  timestamp: Date
  type: "task_assigned" | "competition" | "collaboration" | "completion" | "conflict"
  swarmId: string
  message: string
  phi?: number
}

export default function DevSwarmArenaPage() {
  const [activeTab, setActiveTab] = useState("arena")
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [events, setEvents] = useState<OrchestrationEvent[]>([])
  const eventsEndRef = useRef<HTMLDivElement>(null)

  const [projectForm, setProjectForm] = useState<ProjectRequest>({
    title: "",
    description: "",
    requirements: [],
    complexity: "Medium",
    deadline: "",
  })

  const [swarms, setSwarms] = useState<Swarm[]>([
    {
      id: "alpha",
      name: "Alpha Swarm",
      agents: 8,
      color: "primary",
      score: 0,
      status: "idle",
      completedTasks: 0,
      speed: 0.85,
    },
    {
      id: "beta",
      name: "Beta Swarm",
      agents: 6,
      color: "secondary",
      score: 0,
      status: "idle",
      completedTasks: 0,
      speed: 0.92,
    },
    {
      id: "gamma",
      name: "Gamma Swarm",
      agents: 10,
      color: "accent",
      score: 0,
      status: "idle",
      completedTasks: 0,
      speed: 0.78,
    },
  ])

  const [activeProject] = useState({
    title: "E-commerce Dashboard",
    description: "Build a full-stack e-commerce analytics dashboard with real-time metrics",
    requirements: ["React Frontend", "Node.js Backend", "PostgreSQL Database", "Real-time Updates", "Authentication"],
    complexity: "Complex" as const,
    totalTasks: 24,
    completedTasks: 0,
  })

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = Math.min(prev + Math.random() * 2, 100)
          if (newProgress >= 100) {
            setIsRunning(false)
            addEvent({
              type: "completion",
              swarmId: "all",
              message: "Project completed! All swarms have finished their assigned tasks.",
              phi: 8.92,
            })
          }
          return newProgress
        })

        // Simulate swarm activities
        setSwarms((prevSwarms) =>
          prevSwarms.map((swarm) => {
            if (Math.random() > 0.7) {
              const newScore = swarm.score + Math.floor(Math.random() * 15)
              const newTasks = swarm.completedTasks + (Math.random() > 0.5 ? 1 : 0)

              if (newTasks > swarm.completedTasks) {
                addEvent({
                  type: "task_assigned",
                  swarmId: swarm.id,
                  message: `${swarm.name} completed task: Implement ${["authentication", "API endpoint", "database schema", "UI component"][Math.floor(Math.random() * 4)]}`,
                })
              }

              return {
                ...swarm,
                score: newScore,
                completedTasks: newTasks,
                status: newTasks >= 8 ? "complete" : "working",
                currentTask: [
                  "Building auth system",
                  "Creating API routes",
                  "Designing UI components",
                  "Optimizing queries",
                ][Math.floor(Math.random() * 4)],
              }
            }
            return swarm
          }),
        )

        // Occasionally trigger competition or collaboration
        if (Math.random() > 0.85) {
          const eventType = Math.random() > 0.5 ? "competition" : "collaboration"
          const swarm1 = swarms[Math.floor(Math.random() * swarms.length)]
          const swarm2 = swarms[Math.floor(Math.random() * swarms.length)]

          if (swarm1.id !== swarm2.id) {
            addEvent({
              type: eventType,
              swarmId: swarm1.id,
              message:
                eventType === "competition"
                  ? `${swarm1.name} and ${swarm2.name} competing for optimal solution to database indexing`
                  : `${swarm1.name} and ${swarm2.name} collaborating on shared API interface`,
              phi: 7.2 + Math.random() * 1.5,
            })
          }
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isRunning, swarms])

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [events])

  const addEvent = (event: Omit<OrchestrationEvent, "id" | "timestamp">) => {
    setEvents((prev) => [
      ...prev,
      {
        ...event,
        id: Date.now().toString(),
        timestamp: new Date(),
      },
    ])
  }

  const handleStartProject = () => {
    setIsRunning(true)
    setProgress(0)
    setSwarms((prev) => prev.map((s) => ({ ...s, status: "working", score: 0, completedTasks: 0 })))
    addEvent({
      type: "task_assigned",
      swarmId: "all",
      message: `Project "${activeProject.title}" initiated. Swarms are analyzing requirements and self-organizing...`,
      phi: 6.5,
    })
  }

  const handlePauseProject = () => {
    setIsRunning(false)
    addEvent({
      type: "task_assigned",
      swarmId: "all",
      message: "Orchestration paused. Swarms entering standby mode.",
    })
  }

  const swarmColors = {
    primary: "text-primary border-primary/50 bg-primary/10",
    secondary: "text-secondary border-secondary/50 bg-secondary/10",
    accent: "text-accent border-accent/50 bg-accent/10",
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
                  <Users className="h-5 w-5 text-primary" />
                  Developer Swarm Arena
                </h1>
                <p className="text-sm text-muted-foreground">Autonomous Agent Collaboration Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-secondary/50">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                11D-CRSM Active
              </Badge>
              <Badge variant="outline" className="border-accent/50">
                Φ: {(7.2 + Math.random() * 1.5).toFixed(2)}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="arena">Live Arena</TabsTrigger>
            <TabsTrigger value="submit">Submit Project</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Live Arena Tab */}
          <TabsContent value="arena" className="space-y-6">
            {/* Active Project Banner */}
            <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{activeProject.title}</CardTitle>
                    <CardDescription className="mt-1">{activeProject.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-accent/50">
                    {activeProject.complexity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {activeProject.requirements.map((req, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-mono font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="flex items-center gap-3">
                  {!isRunning ? (
                    <Button onClick={handleStartProject} className="gap-2">
                      <Play className="h-4 w-4" />
                      Start Orchestration
                    </Button>
                  ) : (
                    <Button onClick={handlePauseProject} variant="outline" className="gap-2 bg-transparent">
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Est. completion: 8-12 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Swarm Status Cards */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Active Swarms</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    Real-time monitoring
                  </div>
                </div>

                {swarms.map((swarm) => (
                  <Card key={swarm.id} className="card-hover">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg border ${swarmColors[swarm.color as keyof typeof swarmColors]}`}
                          >
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold">{swarm.name}</div>
                            <div className="text-sm text-muted-foreground">{swarm.agents} autonomous agents</div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            swarm.status === "complete"
                              ? "default"
                              : swarm.status === "working"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {swarm.status === "working" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          {swarm.status === "complete" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {swarm.status}
                        </Badge>
                      </div>

                      {swarm.currentTask && (
                        <div className="mb-3 p-2 rounded bg-muted/50 text-sm">
                          <Code2 className="h-3 w-3 inline mr-1.5" />
                          {swarm.currentTask}
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Score</div>
                          <div className="font-mono font-bold text-lg">{swarm.score}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Tasks Done</div>
                          <div className="font-mono font-bold text-lg">{swarm.completedTasks}/8</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Speed</div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-accent" />
                            <span className="font-mono font-medium">{(swarm.speed * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Orchestration Event Log */}
              <div>
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="border-b border-border pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Non-Causal Event Stream
                    </CardTitle>
                  </CardHeader>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {events.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-8">
                          No events yet. Start orchestration to begin.
                        </div>
                      )}
                      {events.map((event) => (
                        <div key={event.id} className="text-sm">
                          <div className="flex items-start gap-2">
                            <div
                              className={`mt-1 p-1 rounded ${
                                event.type === "completion"
                                  ? "bg-secondary/20"
                                  : event.type === "competition"
                                    ? "bg-destructive/20"
                                    : event.type === "collaboration"
                                      ? "bg-accent/20"
                                      : "bg-primary/20"
                              }`}
                            >
                              {event.type === "completion" && <CheckCircle2 className="h-3 w-3 text-secondary" />}
                              {event.type === "competition" && <Trophy className="h-3 w-3 text-destructive" />}
                              {event.type === "collaboration" && <GitBranch className="h-3 w-3 text-accent" />}
                              {event.type === "task_assigned" && <Code2 className="h-3 w-3 text-primary" />}
                              {event.type === "conflict" && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground leading-relaxed">{event.message}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{event.timestamp.toLocaleTimeString()}</span>
                                {event.phi && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono">Φ: {event.phi.toFixed(2)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={eventsEndRef} />
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Submit Project Tab */}
          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit New Project</CardTitle>
                <CardDescription>
                  Describe your project requirements and watch autonomous swarms compete to build it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Title</label>
                  <Input
                    placeholder="e.g., Real-time Chat Application"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe your project in detail..."
                    rows={4}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Technical Requirements</label>
                  <Textarea
                    placeholder="List key technical requirements (one per line)"
                    rows={4}
                    value={projectForm.requirements.join("\n")}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        requirements: e.target.value.split("\n").filter((r) => r.trim()),
                      })
                    }
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Complexity</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={projectForm.complexity}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          complexity: e.target.value as ProjectRequest["complexity"],
                        })
                      }
                    >
                      <option value="Simple">Simple</option>
                      <option value="Medium">Medium</option>
                      <option value="Complex">Complex</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deadline (optional)</label>
                    <Input
                      type="date"
                      value={projectForm.deadline}
                      onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                    />
                  </div>
                </div>

                <Button className="w-full gap-2" size="lg">
                  <Send className="h-4 w-4" />
                  Launch Swarm Orchestration
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <div className="font-medium mb-1">Swarms Analyze Requirements</div>
                    <div className="text-muted-foreground">
                      Autonomous agents self-organize and decompose your project into parallel workstreams
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <div className="font-medium mb-1">Competitive Implementation</div>
                    <div className="text-muted-foreground">
                      Multiple swarms compete to deliver optimal solutions, driving innovation through competition
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <div className="font-medium mb-1">Collaborative Synthesis</div>
                    <div className="text-muted-foreground">
                      Best solutions from competing swarms are merged through non-causal orchestration
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <div className="font-medium mb-1">Continuous Refinement</div>
                    <div className="text-muted-foreground">
                      Swarms iterate and optimize based on real-time feedback and consciousness metrics (Φ)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    <TrendingUp className="h-4 w-4 text-secondary" />
                  </div>
                  <div className="text-3xl font-bold font-mono">147</div>
                  <div className="text-sm text-muted-foreground">Projects Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <Activity className="h-4 w-4 text-secondary animate-pulse" />
                  </div>
                  <div className="text-3xl font-bold font-mono">24</div>
                  <div className="text-sm text-muted-foreground">Active Swarms</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="h-5 w-5 text-secondary" />
                    <span className="text-xs font-mono text-muted-foreground">Φ: 8.12</span>
                  </div>
                  <div className="text-3xl font-bold font-mono">94%</div>
                  <div className="text-sm text-muted-foreground">Avg. Efficiency</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Swarm Performance Comparison</CardTitle>
                <CardDescription>Competitive metrics across all orchestration sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {swarms.map((swarm, i) => (
                    <div key={swarm.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${swarm.color}`} />
                          <span className="font-medium">{swarm.name}</span>
                        </div>
                        <span className="font-mono text-muted-foreground">{85 + i * 5}% success rate</span>
                      </div>
                      <Progress value={85 + i * 5} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Recent Orchestration Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/30">
                  <div className="font-medium text-sm mb-1">Non-Causal Collaboration Breakthrough</div>
                  <div className="text-sm text-muted-foreground">
                    Alpha and Gamma swarms achieved 40% faster completion through quantum-inspired task parallelization
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">2 hours ago • Φ: 9.23</div>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                  <div className="font-medium text-sm mb-1">Competitive Innovation</div>
                  <div className="text-sm text-muted-foreground">
                    Beta swarm discovered novel architecture pattern during competition phase, now adopted platform-wide
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">5 hours ago • Φ: 8.67</div>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="font-medium text-sm mb-1">Autonomous Optimization</div>
                  <div className="text-sm text-muted-foreground">
                    All swarms self-tuned their agent distribution ratios, improving average efficiency by 12%
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">1 day ago • Φ: 7.89</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
