import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.DNA_SUPABASE_URL || process.env.NEXT_PUBLIC_DNA_SUPABASE_URL || "",
  process.env.DNA_SUPABASE_SERVICE_ROLE_KEY || process.env.DNA_SUPABASE_ANON_KEY || ""
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { circuit, config, organismId, geneId, jobId } = body

    if (!config?.backend) {
      return NextResponse.json({ error: "config.backend is required" }, { status: 400 })
    }

    // Record job in Supabase quantum_jobs table
    const jobRecord = {
      job_id: jobId || `job-${Date.now()}`,
      backend: config.backend,
      qubits: config.qubits || circuit?.qubits || 2,
      shots: config.shots || 1024,
      status: "submitted",
      submitted_at: new Date().toISOString(),
      protocol: organismId ? `organism:${organismId}/${geneId}` : "circuit_submission",
      metadata: { circuit_depth: circuit?.depth, gene_id: geneId, organism_id: organismId },
    }

    const { error: insertErr } = await supabase.from("quantum_jobs").insert(jobRecord)
    if (insertErr) console.error("[Quantum] Job insert error:", insertErr)

    // Also log to activity_log
    await supabase.from("activity_log").insert({
      action: "quantum_job_submitted",
      details: { job_id: jobRecord.job_id, backend: config.backend, qubits: jobRecord.qubits },
    })

    return NextResponse.json({
      jobId: jobRecord.job_id,
      status: "submitted",
      backend: config.backend,
      submittedAt: jobRecord.submitted_at,
      source: "Supabase quantum_jobs (live)",
    })
  } catch (error) {
    console.error("[Quantum] Error submitting job:", error)
    return NextResponse.json({ error: "Failed to submit quantum job", detail: String(error) }, { status: 500 })
  }
}
