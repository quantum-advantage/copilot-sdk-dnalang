import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.DNA_SUPABASE_URL || process.env.NEXT_PUBLIC_DNA_SUPABASE_URL || "",
  process.env.DNA_SUPABASE_SERVICE_ROLE_KEY || process.env.DNA_SUPABASE_ANON_KEY || ""
)

const PHI_CRITICAL = 0.7734
const THETA_LOCK = 51.843
const LAMBDA_PHI = 2.176435e-8

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const entropy = body.entropy

    // Fetch latest real phi from experiments if no entropy provided
    let phi: number
    if (entropy !== undefined && entropy !== null) {
      phi = Math.log2(1 + entropy) * PHI_CRITICAL
    } else {
      const { data } = await supabase
        .from("quantum_experiments")
        .select("phi, gamma, ccce")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      phi = data?.phi || PHI_CRITICAL
    }

    const coherence = Math.exp(-(body.entropy || 0.1) * 0.1)
    const gamma = 1 - coherence

    return NextResponse.json({
      phi,
      coherence,
      gamma,
      entanglement: Math.sqrt(phi * coherence),
      phaseConjugate: {
        forward: phi,
        reverse: phi * Math.cos((THETA_LOCK * Math.PI) / 180),
      },
      lambdaPhiModulation: phi * LAMBDA_PHI,
      aboveThreshold: phi >= PHI_CRITICAL,
      source: entropy !== undefined ? "computed" : "supabase",
    })
  } catch (error) {
    console.error("[LambdaPhi] Consciousness error:", error)
    return NextResponse.json(
      { error: "Failed to compute consciousness metrics", detail: String(error) },
      { status: 400 }
    )
  }
}
