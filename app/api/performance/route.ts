import { NextRequest, NextResponse } from "next/server"

// Performance metrics types
interface PerformanceMetrics {
  cpu: {
    usage: number
    cores: number
    frequency: number // GHz
  }
  memory: {
    used: number // MB
    total: number // MB
    heap: number // MB
  }
  network: {
    latency: number // ms
    bandwidth: number // Mbps
    packetLoss: number // %
  }
  quantum: {
    qubits_active: number
    gate_fidelity: number
    coherence_time: number // microseconds
    entanglement_pairs: number
  }
  inference: {
    requests_per_second: number
    avg_latency_ms: number
    p99_latency_ms: number
    tokens_per_second: number
  }
  timestamp: number
}

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  uptime_seconds: number
  last_incident: string | null
  services: {
    name: string
    status: "up" | "degraded" | "down"
    latency_ms: number
  }[]
}

// Simulated performance data with organic drift
let lastMetrics: PerformanceMetrics | null = null

function generatePerformanceMetrics(): PerformanceMetrics {
  const now = Date.now()
  
  // Create organic drift from previous values
  const drift = (current: number, target: number, volatility: number, min: number, max: number) => {
    if (!lastMetrics) return target + (Math.random() - 0.5) * volatility * 2
    const meanReversion = (target - current) * 0.1
    const random = (Math.random() - 0.5) * volatility
    return Math.max(min, Math.min(max, current + meanReversion + random))
  }

  const metrics: PerformanceMetrics = {
    cpu: {
      usage: drift(lastMetrics?.cpu.usage || 35, 35, 5, 10, 90),
      cores: 16,
      frequency: 3.6 + (Math.random() - 0.5) * 0.2,
    },
    memory: {
      used: drift(lastMetrics?.memory.used || 4200, 4200, 100, 2000, 14000),
      total: 16384,
      heap: drift(lastMetrics?.memory.heap || 512, 512, 30, 256, 1024),
    },
    network: {
      latency: drift(lastMetrics?.network.latency || 42, 42, 8, 10, 200),
      bandwidth: drift(lastMetrics?.network.bandwidth || 980, 980, 50, 500, 1000),
      packetLoss: drift(lastMetrics?.network.packetLoss || 0.01, 0.01, 0.005, 0, 0.1),
    },
    quantum: {
      qubits_active: Math.floor(drift(lastMetrics?.quantum.qubits_active || 127, 127, 5, 100, 150)),
      gate_fidelity: drift(lastMetrics?.quantum.gate_fidelity || 0.9987, 0.9987, 0.0005, 0.99, 0.9999),
      coherence_time: drift(lastMetrics?.quantum.coherence_time || 89, 89, 5, 60, 120),
      entanglement_pairs: Math.floor(drift(lastMetrics?.quantum.entanglement_pairs || 42, 42, 3, 20, 60)),
    },
    inference: {
      requests_per_second: drift(lastMetrics?.inference.requests_per_second || 1247, 1247, 100, 500, 2000),
      avg_latency_ms: drift(lastMetrics?.inference.avg_latency_ms || 124, 124, 15, 50, 300),
      p99_latency_ms: drift(lastMetrics?.inference.p99_latency_ms || 287, 287, 30, 150, 500),
      tokens_per_second: drift(lastMetrics?.inference.tokens_per_second || 8934, 8934, 500, 5000, 15000),
    },
    timestamp: now,
  }

  lastMetrics = metrics
  return metrics
}

function generateHealthStatus(): HealthStatus {
  const services = [
    { name: "NC-LM Inference", baseLatency: 120 },
    { name: "OSIRIS Planner", baseLatency: 45 },
    { name: "CCCE Telemetry", baseLatency: 12 },
    { name: "PCRB Ledger", baseLatency: 28 },
    { name: "Quantum Backend", baseLatency: 156 },
    { name: "DNA-Lang Runtime", baseLatency: 67 },
  ]

  return {
    status: "healthy",
    uptime_seconds: Math.floor((Date.now() - 1706140800000) / 1000), // Since Jan 2024
    last_incident: null,
    services: services.map(s => ({
      name: s.name,
      status: Math.random() > 0.02 ? "up" : "degraded",
      latency_ms: Math.floor(s.baseLatency + (Math.random() - 0.5) * s.baseLatency * 0.3),
    })),
  }
}

// GET - Fetch current performance metrics
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type") || "metrics"

  if (type === "health") {
    return NextResponse.json(generateHealthStatus())
  }

  if (type === "all") {
    return NextResponse.json({
      metrics: generatePerformanceMetrics(),
      health: generateHealthStatus(),
    })
  }

  return NextResponse.json(generatePerformanceMetrics())
}

// POST - Record custom metric or trigger benchmark
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, metric_name, value, tags } = body

    if (action === "benchmark") {
      // Simulate benchmark execution
      const iterations = body.iterations || 1000
      const results = {
        benchmark_id: `bench-${Date.now()}`,
        iterations,
        results: {
          mean_latency_ms: 124 + Math.random() * 20,
          p50_latency_ms: 110 + Math.random() * 15,
          p95_latency_ms: 230 + Math.random() * 40,
          p99_latency_ms: 287 + Math.random() * 60,
          throughput_ops: Math.floor(1200 + Math.random() * 400),
          error_rate: 0.001 + Math.random() * 0.002,
        },
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(results)
    }

    if (action === "record" && metric_name && value !== undefined) {
      // Simulate recording custom metric
      return NextResponse.json({
        success: true,
        metric_name,
        value,
        tags: tags || {},
        recorded_at: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'benchmark' or 'record'" },
      { status: 400 }
    )
  } catch (error) {
    console.error("[Performance] API error:", error)
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
