import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.DNA_SUPABASE_URL || process.env.NEXT_PUBLIC_DNA_SUPABASE_URL || "",
  process.env.DNA_SUPABASE_SERVICE_ROLE_KEY || process.env.DNA_SUPABASE_ANON_KEY || ""
)

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { jobId } = params

    // Query real job from Supabase
    const { data: job, error } = await supabase
      .from("quantum_jobs")
      .select("*")
      .eq("job_id", jobId)
      .maybeSingle()

    if (error) {
      console.error("[Quantum] Job query error:", error)
      return NextResponse.json({ error: "Database query failed", detail: error.message }, { status: 500 })
    }

    if (!job) {
      return NextResponse.json({ error: `Job ${jobId} not found` }, { status: 404 })
    }

    return NextResponse.json({
      jobId: job.job_id,
      organismId: job.metadata?.organism_id || null,
      geneId: job.metadata?.gene_id || null,
      status: job.status,
      backend: job.backend,
      submittedAt: job.submitted_at,
      completedAt: job.completed_at,
      result: job.result || null,
      qubits: job.qubits,
      shots: job.shots,
      protocol: job.protocol,
      source: "Supabase quantum_jobs (live)",
    })
  } catch (error) {
    console.error("[Quantum] Error getting job status:", error)
    return NextResponse.json({ error: "Failed to get job status", detail: String(error) }, { status: 500 })
  }
}
