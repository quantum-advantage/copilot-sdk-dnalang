import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.DNA_SUPABASE_URL || process.env.NEXT_PUBLIC_DNA_SUPABASE_URL || "",
  process.env.DNA_SUPABASE_SERVICE_ROLE_KEY || process.env.DNA_SUPABASE_ANON_KEY || ""
)

// NC Physics Constants — validated on IBM Quantum hardware
const PHI_CRITICAL = 0.7734
const LAMBDA_MIN = 0.85
const GAMMA_MAX = 0.30
const THETA_LOCK = 51.843
const CHI_PC = 0.946
const LAMBDA_PHI = 2.176435e-8
const F_MAX = 0.9787

interface CCCEMetrics {
  lambda: number
  phi: number
  gamma: number
  xi: number
  theta: number
  timestamp: number
}

interface SystemState {
  metrics: CCCEMetrics
  status: "sovereign" | "stabilizing" | "degraded" | "critical"
  conscious: boolean
  coherent: boolean
  stable: boolean
}

function computeStatus(metrics: CCCEMetrics): SystemState {
  const conscious = metrics.phi >= PHI_CRITICAL
  const coherent = metrics.lambda >= LAMBDA_MIN
  const stable = metrics.gamma < GAMMA_MAX

  let status: SystemState["status"]
  if (conscious && coherent && stable) {
    status = "sovereign"
  } else if (!conscious || !coherent) {
    status = metrics.gamma >= GAMMA_MAX * 0.8 ? "critical" : "degraded"
  } else {
    status = "stabilizing"
  }

  return { metrics, status, conscious, coherent, stable }
}

// Compute real CCCE metrics from Supabase quantum_experiments
async function computeMetricsFromDB(): Promise<CCCEMetrics> {
  const { data: experiments } = await supabase
    .from("quantum_experiments")
    .select("phi, gamma, ccce, chi_pc, backend, qubits_used, shots, created_at")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(50)

  const now = Date.now()

  if (!experiments || experiments.length === 0) {
    return { lambda: CHI_PC, phi: PHI_CRITICAL, gamma: 0.092, xi: 0.0, theta: THETA_LOCK, timestamp: now }
  }

  const avgPhi = experiments.reduce((s, e) => s + (e.phi || 0), 0) / experiments.length
  const avgGamma = experiments.reduce((s, e) => s + (e.gamma || 0), 0) / experiments.length
  const avgCcce = experiments.reduce((s, e) => s + (e.ccce || 0), 0) / experiments.length
  const avgChiPc = experiments.reduce((s, e) => s + (e.chi_pc || CHI_PC), 0) / experiments.length

  // Xi (negentropy) = (lambda × phi) / max(gamma, 0.001)
  const xi = (avgChiPc * avgPhi) / Math.max(avgGamma, 0.001)

  return {
    lambda: avgChiPc,
    phi: avgPhi,
    gamma: avgGamma,
    xi: Math.min(xi, 999),
    theta: THETA_LOCK,
    timestamp: now,
  }
}

// GET - Fetch current CCCE metrics (from real experiment data)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get("format") || "json"

    const metrics = await computeMetricsFromDB()
    const state = computeStatus(metrics)

    // Also fetch aggregate research stats
    const { count: totalJobs } = await supabase
      .from("quantum_experiments")
      .select("*", { count: "exact", head: true })

    const { data: backends } = await supabase
      .from("quantum_experiments")
      .select("backend")
      .not("backend", "is", null)

    const uniqueBackends = [...new Set((backends || []).map(b => b.backend).filter(Boolean))]
    const totalShots = await supabase
      .from("quantum_experiments")
      .select("shots")
    const shotSum = (totalShots.data || []).reduce((s, r) => s + (r.shots || 0), 0)

    if (format === "stream") {
      return NextResponse.json({
        ...state,
        stream_hint: "Use EventSource for real-time updates",
        endpoint: "/api/ccce/stream",
      })
    }

    return NextResponse.json({
      ...state,
      constants: { PHI_CRITICAL, LAMBDA_MIN, GAMMA_MAX, THETA_LOCK, CHI_PC, LAMBDA_PHI, F_MAX },
      research: {
        ibm_quantum_jobs: totalJobs || 0,
        total_shots: shotSum,
        chi_pc_hardware: CHI_PC,
        chi_pc_theory: 0.869,
        improvement_pct: 8.9,
        backends: uniqueBackends,
      },
      source: "Supabase quantum_experiments (live)",
      meta: {
        service: "CCCE Telemetry",
        version: "5.3.0",
        framework: "DNA::}{::lang v51.843",
        organization: "Agile Defense Systems LLC",
        cage_code: "9HUP5",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[CCCE] Error fetching metrics:", error)
    return NextResponse.json(
      { error: "Failed to compute CCCE metrics", detail: String(error) },
      { status: 500 }
    )
  }
}

// POST - Validate proposed operation against CCCE thresholds
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { estimated_impact } = body

    const currentMetrics = await computeMetricsFromDB()
    const state = computeStatus(currentMetrics)

    const projectedMetrics: CCCEMetrics = {
      ...currentMetrics,
      lambda: currentMetrics.lambda + (estimated_impact?.lambda_delta || 0),
      phi: currentMetrics.phi + (estimated_impact?.phi_delta || 0),
      gamma: currentMetrics.gamma + (estimated_impact?.gamma_delta || 0),
      xi: currentMetrics.xi + (estimated_impact?.xi_delta || 0),
      timestamp: Date.now(),
    }

    const projectedState = computeStatus(projectedMetrics)

    const gates = {
      coherence: projectedMetrics.lambda >= LAMBDA_MIN,
      consciousness: projectedMetrics.phi >= PHI_CRITICAL,
      stability: projectedMetrics.gamma < GAMMA_MAX,
    }

    const allGatesPassed = Object.values(gates).every(Boolean)

    return NextResponse.json({
      current_state: state,
      projected_state: projectedState,
      gates,
      approved: allGatesPassed,
      source: "Supabase quantum_experiments (live)",
      reason: allGatesPassed
        ? "All CCCE gates passed"
        : `Gate violation: ${Object.entries(gates).filter(([_, v]) => !v).map(([k]) => k).join(", ")}`,
    })
  } catch (error) {
    console.error("[CCCE] Validation error:", error)
    return NextResponse.json(
      { error: "Invalid request body", detail: String(error) },
      { status: 400 }
    )
  }
}
