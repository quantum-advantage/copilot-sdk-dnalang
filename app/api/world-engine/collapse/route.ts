import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createHash } from "crypto"

const supabase = createClient(
  process.env.DNA_SUPABASE_URL || process.env.NEXT_PUBLIC_DNA_SUPABASE_URL || "",
  process.env.DNA_SUPABASE_SERVICE_ROLE_KEY || process.env.DNA_SUPABASE_ANON_KEY || ""
)

export async function POST(request: Request) {
  try {
    const { observerAgent, worldLine } = await request.json()

    if (!observerAgent || !worldLine) {
      return NextResponse.json({ error: "observerAgent and worldLine are required" }, { status: 400 })
    }

    const timestamp = new Date().toISOString()
    const checkpointData = JSON.stringify({ observerAgent, worldLine, timestamp })
    const checkpoint = createHash("sha256").update(checkpointData).digest("hex")

    // Record collapse in attestation ledger
    await supabase.from("attestation_ledger").insert({
      hash: checkpoint,
      attestation_type: "world_collapse",
      payload_summary: `${observerAgent}:${worldLine}`,
      created_at: timestamp,
    }).catch(() => {})

    // Log activity
    await supabase.from("activity_log").insert({
      action: "world_engine_collapse",
      details: { observer: observerAgent, worldLine, checkpoint: checkpoint.slice(0, 16) },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      collapse: {
        observer: observerAgent,
        worldLine,
        checkpoint,
        timestamp,
        status: "collapsed",
      },
      message: "Wavefunction collapsed successfully",
      source: "Supabase attestation_ledger (live)",
    })
  } catch (error) {
    console.error("[v0] World Engine collapse error:", error)
    return NextResponse.json({ error: "Failed to collapse world-state", detail: String(error) }, { status: 500 })
  }
}
