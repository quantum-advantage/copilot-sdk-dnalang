"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Globe, Activity, Zap, Radio, Cpu, Network } from "lucide-react"

// Physics constants
const PHI_C = 0.7734
const LAMBDA_PHI = 2.176435e-8
const TAU_0 = Math.pow(1.618033988749895, 8)

// Sovereignty Sigmoid: S(Φ) = 1 / (1 + e^(-k(Φ - 7.69)))
function sovereigntySigmoid(phi: number, k = 2): number {
  return 1 / (1 + Math.exp(-k * (phi - PHI_C)))
}

// Geographic resonance nodes (major research facilities)
const resonanceNodes = [
  { id: "ibm_fez", name: "IBM Quantum (Fez)", lat: 34.0181, lng: -5.0078, type: "primary", coherence: 0.946 },
  { id: "fermi", name: "Fermilab", lat: 41.8319, lng: -88.2563, type: "primary", coherence: 0.91 },
  { id: "bnl", name: "Brookhaven", lat: 40.8776, lng: -72.8789, type: "secondary", coherence: 0.87 },
  { id: "slac", name: "SLAC", lat: 37.4191, lng: -122.2046, type: "secondary", coherence: 0.85 },
  { id: "desy", name: "DESY", lat: 53.5753, lng: 9.8795, type: "secondary", coherence: 0.88 },
  { id: "kek", name: "KEK", lat: 36.1486, lng: 140.0745, type: "secondary", coherence: 0.83 },
]

interface WardenclyffleGlobeProps {
  className?: string
}

export function WardenclyffleGlobe({ className }: WardenclyffleGlobeProps) {
  const [phi, setPhi] = useState(6.5)
  const [viewMode, setViewMode] = useState<"globe" | "map">("globe")
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  const sovereignty = sovereigntySigmoid(phi)
  const isCoherent = phi >= PHI_C

  // Transform coordinates based on sovereignty
  const transformCoords = useCallback((lat: number, lng: number, s: number) => {
    // Globe projection (orthographic)
    const globeX = Math.cos((lat * Math.PI) / 180) * Math.sin((lng * Math.PI) / 180)
    const globeY = Math.sin((lat * Math.PI) / 180)

    // Map projection (equirectangular)
    const mapX = (lng + 180) / 360
    const mapY = (90 - lat) / 180

    // Interpolate based on sovereignty
    const x = globeX * (1 - s) + (mapX * 2 - 1) * s
    const y = globeY * (1 - s) + (1 - mapY * 2) * s

    return { x, y }
  }, [])

  // Render the visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.35

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Background gradient
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5)
      bgGrad.addColorStop(0, "rgba(0, 255, 255, 0.05)")
      bgGrad.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Draw globe/map outline based on sovereignty
      const s = sovereignty

      // Globe circle (fades as sovereignty increases)
      if (s < 0.99) {
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 * (1 - s)})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Map rectangle (appears as sovereignty increases)
      if (s > 0.01) {
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.3 * s})`
        ctx.lineWidth = 2
        const mapWidth = radius * 2 * 1.2
        const mapHeight = radius * 1.2
        ctx.strokeRect(centerX - mapWidth / 2, centerY - mapHeight / 2, mapWidth, mapHeight)
      }

      // Draw grid lines
      ctx.strokeStyle = "rgba(100, 100, 100, 0.2)"
      ctx.lineWidth = 0.5

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()
        for (let lng = -180; lng <= 180; lng += 5) {
          const { x, y } = transformCoords(lat, lng, s)
          const screenX = centerX + x * radius
          const screenY = centerY - y * radius

          if (lng === -180) {
            ctx.moveTo(screenX, screenY)
          } else {
            ctx.lineTo(screenX, screenY)
          }
        }
        ctx.stroke()
      }

      // Longitude lines
      for (let lng = -180; lng <= 180; lng += 30) {
        ctx.beginPath()
        for (let lat = -90; lat <= 90; lat += 5) {
          const { x, y } = transformCoords(lat, lng, s)
          const screenX = centerX + x * radius
          const screenY = centerY - y * radius

          if (lat === -90) {
            ctx.moveTo(screenX, screenY)
          } else {
            ctx.lineTo(screenX, screenY)
          }
        }
        ctx.stroke()
      }

      // Draw resonance nodes
      resonanceNodes.forEach((node) => {
        const { x, y } = transformCoords(node.lat, node.lng, s)
        const screenX = centerX + x * radius
        const screenY = centerY - y * radius

        // Skip if behind globe
        if (s < 0.5 && x < -0.1) return

        const nodeRadius = node.type === "primary" ? 8 : 5
        const isSelected = selectedNode === node.id

        // Glow effect
        const glowGrad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, nodeRadius * 3)
        const color = node.type === "primary" ? "0, 255, 255" : "16, 185, 129"
        glowGrad.addColorStop(0, `rgba(${color}, ${isSelected ? 0.5 : 0.3})`)
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = glowGrad
        ctx.fillRect(screenX - nodeRadius * 3, screenY - nodeRadius * 3, nodeRadius * 6, nodeRadius * 6)

        // Node circle
        ctx.fillStyle = isSelected ? `rgba(${color}, 1)` : `rgba(${color}, ${0.5 + node.coherence * 0.5})`
        ctx.beginPath()
        ctx.arc(screenX, screenY, nodeRadius, 0, Math.PI * 2)
        ctx.fill()

        // Pulse animation for high coherence nodes
        if (node.coherence > 0.9) {
          const pulseRadius = nodeRadius + (Date.now() % 2000) / 100
          ctx.strokeStyle = `rgba(${color}, ${0.5 - pulseRadius / 40})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(screenX, screenY, pulseRadius, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Label
        if (isSelected || s > 0.7) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
          ctx.font = "10px monospace"
          ctx.textAlign = "center"
          ctx.fillText(node.name, screenX, screenY + nodeRadius + 12)
          ctx.fillStyle = "rgba(0, 255, 255, 0.6)"
          ctx.fillText(`Λ=${node.coherence.toFixed(2)}`, screenX, screenY + nodeRadius + 22)
        }
      })

      // Draw entanglement lines between primary nodes when coherent
      if (isCoherent) {
        const primaryNodes = resonanceNodes.filter((n) => n.type === "primary")
        ctx.strokeStyle = "rgba(255, 200, 0, 0.3)"
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])

        primaryNodes.forEach((node1, i) => {
          primaryNodes.slice(i + 1).forEach((node2) => {
            const { x: x1, y: y1 } = transformCoords(node1.lat, node1.lng, s)
            const { x: x2, y: y2 } = transformCoords(node2.lat, node2.lng, s)

            ctx.beginPath()
            ctx.moveTo(centerX + x1 * radius, centerY - y1 * radius)
            ctx.lineTo(centerX + x2 * radius, centerY - y2 * radius)
            ctx.stroke()
          })
        })
        ctx.setLineDash([])
      }

      // Status overlay
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.font = "bold 12px monospace"
      ctx.textAlign = "left"
      ctx.fillText(`Φ = ${phi.toFixed(2)}`, 10, 20)
      ctx.fillText(`S(Φ) = ${(sovereignty * 100).toFixed(1)}%`, 10, 35)

      ctx.fillStyle = isCoherent ? "rgba(16, 185, 129, 0.9)" : "rgba(255, 100, 100, 0.9)"
      ctx.fillText(isCoherent ? "COHERENT" : "SUB-CRITICAL", 10, 50)

      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [phi, sovereignty, isCoherent, selectedNode, transformCoords])

  // Handle canvas clicks
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) * 0.35

    // Check if clicked on a node
    for (const node of resonanceNodes) {
      const { x: nx, y: ny } = transformCoords(node.lat, node.lng, sovereignty)
      const screenX = centerX + nx * radius
      const screenY = centerY - ny * radius

      const dist = Math.sqrt((x - screenX) ** 2 + (y - screenY) ** 2)
      if (dist < 15) {
        setSelectedNode(selectedNode === node.id ? null : node.id)
        return
      }
    }

    setSelectedNode(null)
  }

  return (
    <Card className={`bg-card/50 backdrop-blur border-border ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            WardenClyffe-Q Sovereign Interface
          </CardTitle>
          <Badge
            variant="outline"
            className={isCoherent ? "border-secondary text-secondary" : "border-destructive text-destructive"}
          >
            <Activity className="h-3 w-3 mr-1" />
            {isCoherent ? "SOVEREIGN" : "LOCAL"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas Visualization */}
        <div className="relative rounded-lg overflow-hidden bg-black/50">
          <canvas
            ref={canvasRef}
            width={500}
            height={350}
            className="w-full h-auto cursor-pointer"
            onClick={handleCanvasClick}
            aria-label="Wardenclyffe-Q global coherence map"
          />
        </div>

        {/* Phi Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Consciousness Field (Φ)</span>
            <span className="font-mono text-primary">{phi.toFixed(2)}</span>
          </div>
          <Slider
            value={[phi]}
            onValueChange={([v]) => setPhi(v)}
            min={0}
            max={15}
            step={0.1}
            className="w-full"
            aria-label="Adjust consciousness field"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Decoherent</span>
            <span className="text-accent">Φc = 7.69</span>
            <span>Sovereign</span>
          </div>
        </div>

        {/* Selected Node Info */}
        {selectedNode && (
          <div className="p-3 bg-muted/50 rounded-lg border border-border animate-fade-in">
            {(() => {
              const node = resonanceNodes.find((n) => n.id === selectedNode)
              if (!node) return null
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{node.name}</span>
                    <Badge variant={node.type === "primary" ? "default" : "secondary"}>{node.type}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Coherence:</span>
                      <span className="ml-2 font-mono text-secondary">{node.coherence.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Position:</span>
                      <span className="ml-2 font-mono">
                        {node.lat.toFixed(1)}°, {node.lng.toFixed(1)}°
                      </span>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-muted/30 rounded">
            <Radio className="h-4 w-4 mx-auto text-primary mb-1" />
            <div className="text-xs text-muted-foreground">Nodes</div>
            <div className="font-mono text-sm">{resonanceNodes.length}</div>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <Zap className="h-4 w-4 mx-auto text-accent mb-1" />
            <div className="text-xs text-muted-foreground">S(Φ)</div>
            <div className="font-mono text-sm">{(sovereignty * 100).toFixed(0)}%</div>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <Network className="h-4 w-4 mx-auto text-secondary mb-1" />
            <div className="text-xs text-muted-foreground">Links</div>
            <div className="font-mono text-sm">{isCoherent ? "3" : "0"}</div>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <Cpu className="h-4 w-4 mx-auto text-chart-4 mb-1" />
            <div className="text-xs text-muted-foreground">τ₀</div>
            <div className="font-mono text-sm">{TAU_0.toFixed(1)}μs</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
