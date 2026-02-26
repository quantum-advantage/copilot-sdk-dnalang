import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.DNA_SUPABASE_URL || process.env.NEXT_PUBLIC_DNA_SUPABASE_URL || "",
  process.env.DNA_SUPABASE_SERVICE_ROLE_KEY || process.env.DNA_SUPABASE_ANON_KEY || ""
)

export async function GET() {
  try {
    // Pull real backends from completed experiments
    const { data: backendRows } = await supabase
      .from("quantum_experiments")
      .select("backend")
      .not("backend", "is", null)

    const realBackends = [...new Set((backendRows || []).map(r => r.backend).filter(Boolean))]

    // Always include simulators
    const simulators = ["simulator_statevector", "simulator_mps", "braket_local"]
    const allBackends = [...new Set([...realBackends, ...simulators])]

    return NextResponse.json({
      backends: allBackends,
      hardware: realBackends,
      simulators,
      total: allBackends.length,
      source: "Supabase quantum_experiments (live)",
    })
  } catch (error) {
    console.error("[Backends] Error:", error)
    return NextResponse.json({ error: "Failed to list backends", detail: String(error) }, { status: 500 })
  }
}
