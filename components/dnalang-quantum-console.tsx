"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DNALangQuantumHardware,
  createBellStateCircuit,
  createGHZCircuit,
  type QuantumJob,
} from "@/lib/dnalang-quantum/quantum-hardware-interface"
import { Play, RefreshCw, Download, AlertCircle, CheckCircle, Clock } from "lucide-react"

export function DNALangQuantumConsole() {
  const [backend, setBackend] = useState("ibm_brisbane")
  const [jobs, setJobs] = useState<QuantumJob[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [selectedCircuit, setSelectedCircuit] = useState<"bell" | "ghz">("bell")

  const executeCircuit = async () => {
    setIsExecuting(true)

    try {
      // In production, load API key securely
      const hardware = new DNALangQuantumHardware("mock-api-key", {
        backend,
        shots: 2048,
        optimizationLevel: 3,
      })

      const circuit = selectedCircuit === "bell" ? createBellStateCircuit() : createGHZCircuit(3)

      const jobId = await hardware.submitCircuit(circuit, "organism-web-001", "QUANTUM_ENTANGLEMENT")

      // Poll for results
      const result = await hardware.waitForCompletion(jobId, 2000, 60000)

      const job = await hardware.getJobStatus(jobId)
      setJobs((prev) => [job, ...prev])
    } catch (error) {
      console.error("[v0] Execution failed:", error)
    } finally {
      setIsExecuting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-400" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-amber-400" />
    }
  }

  const downloadResults = (job: QuantumJob) => {
    const data = JSON.stringify(job, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quantum-job-${job.jobId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Execution Controls */}
      <Card className="p-6 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border-primary/20">
        <h3 className="text-lg font-semibold mb-4 text-foreground">DNALang Quantum Execution</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Circuit Type</label>
            <select
              value={selectedCircuit}
              onChange={(e) => setSelectedCircuit(e.target.value as "bell" | "ghz")}
              className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-lg text-foreground"
            >
              <option value="bell">Bell State (2 qubits)</option>
              <option value="ghz">GHZ State (3 qubits)</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Backend</label>
            <select
              value={backend}
              onChange={(e) => setBackend(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-lg text-foreground"
            >
              <option value="ibm_brisbane">IBM Brisbane</option>
              <option value="ibm_kyoto">IBM Kyoto</option>
              <option value="ibm_osaka">IBM Osaka</option>
              <option value="simulator">Simulator</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={executeCircuit}
              disabled={isExecuting}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Execute on Hardware
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Biological computing interface for IBM Quantum hardware</p>
          <p>Uses DNA-inspired protocols for circuit optimization and execution</p>
        </div>
      </Card>

      {/* Job History */}
      <Card className="p-6 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border-primary/20">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Execution History</h3>

        {jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No jobs executed yet</p>
            <p className="text-sm mt-2">Execute a circuit to see results here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.jobId} className="p-4 bg-background/50 border border-primary/10 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    <span className="font-mono text-sm">{job.jobId}</span>
                    <Badge variant="outline" className="text-xs">
                      {job.backend}
                    </Badge>
                  </div>

                  {job.status === "completed" && (
                    <Button size="sm" variant="ghost" onClick={() => downloadResults(job)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {job.result && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Fidelity</div>
                      <div className="font-semibold text-emerald-400">{(job.result.fidelity * 100).toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">W1 Distance</div>
                      <div className="font-semibold text-cyan-400">{job.result.w1Distance.toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Coherence</div>
                      <div className="font-semibold text-blue-400">
                        {(job.result.quantumCoherence * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Time</div>
                      <div className="font-semibold text-amber-400">{job.result.executionTime.toFixed(2)}s</div>
                    </div>
                  </div>
                )}

                {job.error && <div className="mt-2 text-sm text-red-400">Error: {job.error}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
