"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Activity, Compass, Sun } from "lucide-react"

interface SensorData {
  accelerometer: { x: number; y: number; z: number }
  gyroscope: { x: number; y: number; z: number }
  magnetometer: { x: number; y: number; z: number }
  light: number
  timestamp: number
}

export function AndroidSensorDisplay() {
  const [sensors, setSensors] = useState<SensorData | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate sensor data (in production, fetch from Android bridge)
      setSensors({
        accelerometer: {
          x: 9.8 + (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2,
        },
        gyroscope: {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.5,
        },
        magnetometer: {
          x: 45 + (Math.random() - 0.5) * 5,
          y: -30 + (Math.random() - 0.5) * 5,
          z: 20 + (Math.random() - 0.5) * 5,
        },
        light: 500 + (Math.random() - 0.5) * 100,
        timestamp: Date.now(),
      })
      setConnected(Math.random() > 0.1)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  if (!sensors) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-xl border-primary/20">
        <div className="text-center text-muted-foreground">Waiting for Android device...</div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-xl border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Android Sensor Telemetry</h3>
        </div>
        <Badge variant={connected ? "default" : "secondary"}>{connected ? "Connected" : "Offline"}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Accelerometer (m/s²)</span>
          </div>
          <div className="font-mono text-xs space-y-1">
            <div>X: {sensors.accelerometer.x.toFixed(3)}</div>
            <div>Y: {sensors.accelerometer.y.toFixed(3)}</div>
            <div>Z: {sensors.accelerometer.z.toFixed(3)}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Gyroscope (rad/s)</span>
          </div>
          <div className="font-mono text-xs space-y-1">
            <div>X: {sensors.gyroscope.x.toFixed(3)}</div>
            <div>Y: {sensors.gyroscope.y.toFixed(3)}</div>
            <div>Z: {sensors.gyroscope.z.toFixed(3)}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Compass className="h-4 w-4" />
            <span>Magnetometer (μT)</span>
          </div>
          <div className="font-mono text-xs space-y-1">
            <div>X: {sensors.magnetometer.x.toFixed(1)}</div>
            <div>Y: {sensors.magnetometer.y.toFixed(1)}</div>
            <div>Z: {sensors.magnetometer.z.toFixed(1)}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sun className="h-4 w-4" />
            <span>Light Sensor</span>
          </div>
          <div className="font-mono text-xs">{sensors.light.toFixed(0)} lux</div>
        </div>
      </div>

      <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground">
        Last update: {new Date(sensors.timestamp).toLocaleTimeString()}
      </div>
    </Card>
  )
}
