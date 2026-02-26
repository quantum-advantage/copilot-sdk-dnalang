import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const backend = searchParams.get("backend")
    const limit = parseInt(searchParams.get("limit") || "50")

    let query = supabase
      .from("quantum_experiments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (status) query = query.eq("status", status)
    if (backend) query = query.eq("backend", backend)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Compute aggregate metrics
    const completed = (data || []).filter((e) => e.status === "completed")
    const avgPhi = completed.length
      ? completed.reduce((s, e) => s + (e.phi || 0), 0) / completed.length
      : 0
    const avgGamma = completed.length
      ? completed.reduce((s, e) => s + (e.gamma || 0), 0) / completed.length
      : 0
    const totalShots = completed.reduce((s, e) => s + (e.shots || 0), 0)
    const totalQubits = Math.max(...completed.map((e) => e.qubits_used || 0), 0)
    const uniqueBackends = [...new Set(completed.map((e) => e.backend))]

    return NextResponse.json({
      experiments: data || [],
      metrics: {
        total: data?.length || 0,
        completed: completed.length,
        avg_phi: parseFloat(avgPhi.toFixed(4)),
        avg_gamma: parseFloat(avgGamma.toFixed(4)),
        total_shots: totalShots,
        max_qubits: totalQubits,
        backends: uniqueBackends,
        phi_above_threshold: completed.filter((e) => (e.phi || 0) >= 0.7734).length,
        coherent: completed.filter((e) => (e.gamma || 0) < 0.3).length,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
