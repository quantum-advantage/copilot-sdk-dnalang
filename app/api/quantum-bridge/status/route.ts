import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.DNA_SUPABASE_URL || process.env.NEXT_PUBLIC_DNA_SUPABASE_URL || "",
  process.env.DNA_SUPABASE_SERVICE_ROLE_KEY || process.env.DNA_SUPABASE_ANON_KEY || ""
)

const AWS_API = "https://mwkeczoay4.execute-api.us-east-2.amazonaws.com"

export async function GET() {
  try {
    // Check Supabase connectivity
    const t0 = Date.now()
    const { count: expCount, error: dbErr } = await supabase
      .from("quantum_experiments")
      .select("*", { count: "exact", head: true })
    const dbLatency = Date.now() - t0
    const supabaseUp = !dbErr

    // Check AWS Lambda API
    let awsUp = false
    let awsLatency = 0
    try {
      const t1 = Date.now()
      const res = await fetch(`${AWS_API}/api/health`, { signal: AbortSignal.timeout(3000) })
      awsLatency = Date.now() - t1
      awsUp = res.ok
    } catch { /* timeout */ }

    // Fetch recent job counts
    const { count: jobCount } = await supabase
      .from("quantum_jobs")
      .select("*", { count: "exact", head: true })

    const { count: attestCount } = await supabase
      .from("attestation_ledger")
      .select("*", { count: "exact", head: true })

    return NextResponse.json({
      supabase: supabaseUp,
      aws_lambda: awsUp,
      ibmQuantum: (expCount || 0) > 0,
      services: {
        supabase: { up: supabaseUp, latency_ms: dbLatency, experiments: expCount || 0 },
        aws: { up: awsUp, latency_ms: awsLatency },
        quantum_jobs: { count: jobCount || 0 },
        attestations: { count: attestCount || 0 },
      },
      source: "live",
      lastUpdate: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Bridge] Status error:", error)
    return NextResponse.json(
      { error: "Failed to check bridge status", detail: String(error) },
      { status: 500 }
    )
  }
}
