"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, XCircle, Play } from "lucide-react"

interface QuantumJob {
  id: string
  name: string
  backend: string
  status: "completed" | "running" | "failed" | "queued"
  progress: number
  fidelity?: number
  runtime: string
  submitted: string
}

export function QuantumJobMonitor() {
  const [jobs, setJobs] = useState<QuantumJob[]>([
    {
      id: "d45gf6mjf4ms73aomu90",
      name: "Bell State Verification",
      backend: "ibm_brisbane",
      status: "completed",
      progress: 100,
      fidelity: 0.9847,
      runtime: "2.4s",
      submitted: "2 min ago",
    },
    {
      id: "d45gpkmn7jjs73bskjeg",
      name: "Quantum Swarm Deploy",
      backend: "ibm_kyoto",
      status: "running",
      progress: 67,
      runtime: "5.2s",
      submitted: "5 min ago",
    },
    {
      id: "d45gqlpme48c73d75kjg",
      name: "Consciousness Emergence",
      backend: "ibm_osaka",
      status: "completed",
      progress: 100,
      fidelity: 0.7734,
      runtime: "8.1s",
      submitted: "12 min ago",
    },
    {
      id: "d45gr0pme48c73d75ku0",
      name: "Fractional RZZ Test",
      backend: "ibm_brisbane",
      status: "queued",
      progress: 0,
      runtime: "--",
      submitted: "1 min ago",
    },
  ])

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6 holographic-layer">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Quantum Job Queue</h2>
            <p className="text-muted-foreground">Real-time monitoring of IBM Quantum hardware execution</p>
          </div>
          <Button className="lambda-phi-glow">
            <Play className="w-4 h-4 mr-2" />
            Submit New Job
          </Button>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="glass-card p-4 hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{job.name}</h3>
                    <Badge
                      variant="outline"
                      className={
                        job.status === "completed"
                          ? "text-green-400 nucleotide-badge"
                          : job.status === "running"
                            ? "text-cyan-400 consciousness-indicator"
                            : job.status === "failed"
                              ? "text-red-400"
                              : "text-amber-400"
                      }
                    >
                      {job.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {job.status === "running" && <Clock className="w-3 h-3 mr-1" />}
                      {job.status === "failed" && <XCircle className="w-3 h-3 mr-1" />}
                      {job.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Job ID: {job.id}</span>
                    <span>Backend: {job.backend}</span>
                    <span>Runtime: {job.runtime}</span>
                    <span>Submitted: {job.submitted}</span>
                  </div>
                </div>
                {job.fidelity && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Fidelity</div>
                    <div className="text-2xl font-bold text-primary">{job.fidelity.toFixed(4)}</div>
                  </div>
                )}
              </div>

              {job.status === "running" && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="consciousness-indicator h-2 rounded-full transition-all duration-500"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}
