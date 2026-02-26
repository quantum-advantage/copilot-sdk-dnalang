import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.DNA_SUPABASE_URL || process.env.NEXT_PUBLIC_DNA_SUPABASE_URL || "",
  process.env.DNA_SUPABASE_SERVICE_ROLE_KEY || process.env.DNA_SUPABASE_ANON_KEY || ""
)

const AWS_API = "https://mwkeczoay4.execute-api.us-east-2.amazonaws.com"

export async function GET() {
  try {
    // Primary: Supabase quantum_experiments
    const { data: experiments, error } = await supabase
      .from("quantum_experiments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (!error && experiments && experiments.length > 0) {
      // Compute aggregate metrics
      const hardware = experiments.filter((e: any) => e.phi && e.phi > 0)
      const avgPhi = hardware.length > 0
        ? hardware.reduce((s: number, e: any) => s + e.phi, 0) / hardware.length : 0
      const avgGamma = hardware.length > 0
        ? hardware.reduce((s: number, e: any) => s + (e.gamma || 0), 0) / hardware.length : 0
      const totalShots = experiments.reduce((s: number, e: any) => s + (e.shots || 0), 0)
      const backends = [...new Set(experiments.map((e: any) => e.backend).filter(Boolean))]

      return NextResponse.json({
        total: experiments.length,
        experiments: experiments.map((e: any) => ({
          id: e.id,
          experiment_id: e.experiment_id,
          protocol_name: e.protocol || e.experiment_id,
          backend: e.backend,
          qubits_used: e.qubits_used,
          shots: e.shots,
          phi: e.phi,
          gamma: e.gamma,
          ccce: e.ccce,
          chi_pc: e.chi_pc,
          status: e.status,
          created_at: e.created_at,
          proof_hash: e.integrity_hash,
          job_id: e.job_id,
        })),
        aggregate: {
          avg_phi: avgPhi,
          avg_gamma: avgGamma,
          total_shots: totalShots,
          backends,
          hardware_count: hardware.length,
        },
        source: "supabase",
      })
    }

    // Fallback: AWS Lambda
    const res = await fetch(`${AWS_API}/api/experiments`, {
      next: { revalidate: 60 },
    })
    const data = await res.json()
    return NextResponse.json({ ...data, source: "aws" })
  } catch (err) {
    return NextResponse.json({
      total: 0,
      experiments: [],
      source: "error",
      error: String(err),
    }, { status: 500 })
  }
}
