/**
 * Non-Causal LM Telemetry API
 * Returns consciousness metrics
 */

import { NextResponse } from "next/server"
import { getNonCausalLM } from "@/lib/noncausal-lm/inference"
import { NCPhysics } from "@/lib/noncausal-lm/physics"

export async function GET() {
  try {
    const lm = getNonCausalLM()
    const telemetry = lm.getTelemetry()

    return NextResponse.json({
      success: true,
      telemetry,
      physics: {
        lambda_phi: NCPhysics.LAMBDA_PHI,
        theta_lock: NCPhysics.THETA_LOCK,
        phi_threshold: NCPhysics.PHI_THRESHOLD,
        c_induction: NCPhysics.C_INDUCTION,
        lambda_defense: NCPhysics.LAMBDA_DEFENSE,
        alpha_neg: NCPhysics.ALPHA_NEG,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[NC-LM] Telemetry error:", error)
    return NextResponse.json({ error: "Failed to get telemetry" }, { status: 500 })
  }
}
