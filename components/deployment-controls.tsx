"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, Square } from "lucide-react"

export function DeploymentControls() {
  const [backend, setBackend] = useState("ibm_torino")
  const [shots, setShots] = useState("8192")
  const [status, setStatus] = useState<"idle" | "deploying" | "running" | "stopped">("idle")

  const handleDeploy = () => {
    setStatus("deploying")
    setTimeout(() => setStatus("running"), 2000)
  }

  const handleStop = () => {
    setStatus("stopped")
    setTimeout(() => setStatus("idle"), 1000)
  }

  return (
    <Card className="p-6 bg-zinc-900/50 border-zinc-800">
      <h3 className="text-lg font-semibold mb-4 text-zinc-100">Deployment Controls</h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="backend" className="text-zinc-400">
            Quantum Backend
          </Label>
          <Select value={backend} onValueChange={setBackend}>
            <SelectTrigger id="backend" className="bg-zinc-800 border-zinc-700 text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="ibm_torino">IBM Torino (133 qubits)</SelectItem>
              <SelectItem value="ibm_kyiv">IBM Kyiv (127 qubits)</SelectItem>
              <SelectItem value="ibm_sherbrooke">IBM Sherbrooke (127 qubits)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="shots" className="text-zinc-400">
            Shots
          </Label>
          <Input
            id="shots"
            type="number"
            value={shots}
            onChange={(e) => setShots(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleDeploy}
            disabled={status === "running" || status === "deploying"}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {status === "deploying" ? "Deploying..." : "Deploy"}
          </Button>

          <Button onClick={handleStop} disabled={status !== "running"} variant="destructive" className="flex-1">
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Status:</span>
            <span
              className={`font-semibold ${
                status === "running"
                  ? "text-green-400"
                  : status === "deploying"
                    ? "text-yellow-400"
                    : status === "stopped"
                      ? "text-red-400"
                      : "text-zinc-400"
              }`}
            >
              {status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
