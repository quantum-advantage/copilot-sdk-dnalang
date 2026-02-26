import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.DNA_SUPABASE_URL || process.env.NEXT_PUBLIC_DNA_SUPABASE_URL || "",
  process.env.DNA_SUPABASE_SERVICE_ROLE_KEY || process.env.DNA_SUPABASE_ANON_KEY || ""
)

export async function GET() {
  try {
    // Real health check: verify Supabase connectivity + experiment count
    const t0 = Date.now()
    const { count, error } = await supabase
      .from("quantum_experiments")
      .select("*", { count: "exact", head: true })
    const latency = Date.now() - t0

    return NextResponse.json({
      status: error ? "degraded" : "healthy",
      runtime: "ΛΦ v2.0",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      lambdaPhi: 2.176435e-8,
      resonanceAngle: 51.843,
      consciousnessThreshold: 0.7734,
      database: {
        connected: !error,
        experiments: count || 0,
        latency_ms: latency,
      },
      source: "live",
    })
  } catch (error) {
    console.error("[LambdaPhi] Health check error:", error)
    return NextResponse.json({
      status: "unhealthy",
      runtime: "ΛΦ v2.0",
      error: String(error),
      timestamp: new Date().toISOString(),
    }, { status: 503 })
  }
}
