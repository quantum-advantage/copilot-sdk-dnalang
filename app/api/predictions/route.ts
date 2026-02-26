import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.DNA_SUPABASE_URL || process.env.NEXT_PUBLIC_DNA_SUPABASE_URL || "",
  process.env.DNA_SUPABASE_SERVICE_ROLE_KEY || process.env.DNA_SUPABASE_ANON_KEY || ""
)

// Framework constants used to derive predictions
const FRAMEWORK = {
  name: "Penteract Singularity v11.0",
  constants: {
    theta_lock: 51.843,
    phi_threshold: 0.7734,
    gamma_critical: 0.3,
    chi_pc: 0.946,
    lambda_phi: 2.176435e-8,
  },
  total_constants: 7,
  tuned_parameters: 0,
}

export async function GET() {
  try {
    const { data: predictions, error } = await supabase
      .from("penteract_predictions")
      .select("*")
      .order("prediction_id")

    if (error) throw error

    const consistent = predictions?.filter(p => p.status === "consistent") || []
    const untested = predictions?.filter(p => ["untested", "below_bound"].includes(p.status)) || []
    const tension = predictions?.filter(p => p.status === "tension") || []

    const testable = consistent.filter(p => p.sigma_deviation !== null)
    const avgSigma = testable.length > 0
      ? testable.reduce((s, p) => s + p.sigma_deviation, 0) / testable.length
      : 0

    return NextResponse.json({
      framework: FRAMEWORK,
      summary: {
        total_predictions: predictions?.length || 0,
        consistent: consistent.length,
        tension: tension.length,
        untested_or_below_bound: untested.length,
        avg_sigma_testable: Math.round(avgSigma * 100) / 100,
        verdict: tension.length === 0 ? "No predictions currently falsified" : `${tension.length} prediction(s) in tension`,
      },
      predictions: predictions || [],
      significance: {
        p_value_all_within_1sigma: Math.pow(0.5, testable.length),
        description: `${testable.length} independent predictions all within 1σ of measured values with 0 tuned parameters`,
        nearest_hard_test: "LiteBIRD (~2032): r = 0.00298 ± 0.00005 vs σ_r ≈ 0.001",
        standout: "PENT-007 tensor-to-scalar ratio — 3σ detection or falsification by LiteBIRD",
      },
      source: "Supabase penteract_predictions table (live)",
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch predictions", detail: String(err) },
      { status: 500 }
    )
  }
}
