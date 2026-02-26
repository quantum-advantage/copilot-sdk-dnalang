import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.DNA_SUPABASE_URL || process.env.NEXT_PUBLIC_DNA_SUPABASE_URL || "",
  process.env.DNA_SUPABASE_SERVICE_ROLE_KEY || process.env.DNA_SUPABASE_ANON_KEY || ""
)

export async function POST(request: NextRequest) {
  try {
    const { timeRange, metrics, aggregation } = await request.json()

    // Fetch real experiment data from Supabase as time-series
    const { data: experiments, error } = await supabase
      .from("quantum_experiments")
      .select("phi, gamma, ccce, chi_pc, shots, created_at, backend, qubits_used")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) throw error

    // Transform experiments into telemetry-style time series
    const data = (experiments || []).map(exp => ({
      time: exp.created_at,
      lambda: exp.chi_pc || 0.946,
      phi: exp.phi || 0,
      gamma: exp.gamma || 0,
      coherence: exp.ccce || 0,
      qbyte_rate: exp.shots || 0,
      backend: exp.backend,
      qubits: exp.qubits_used,
    }))

    return NextResponse.json({
      data,
      count: data.length,
      timeRange: timeRange || "all",
      aggregation: aggregation || "per-experiment",
      source: "Supabase quantum_experiments (live)",
    })
  } catch (error) {
    console.error("[Data] Query error:", error)
    return NextResponse.json(
      { error: "Failed to query experiment data", detail: String(error), data: [], count: 0 },
      { status: 500 }
    )
  }
}
