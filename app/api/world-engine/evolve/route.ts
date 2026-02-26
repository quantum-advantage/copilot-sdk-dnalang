import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.DNA_SUPABASE_URL || process.env.NEXT_PUBLIC_DNA_SUPABASE_URL || "",
  process.env.DNA_SUPABASE_SERVICE_ROLE_KEY || process.env.DNA_SUPABASE_ANON_KEY || ""
)

function deterministicHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export async function POST(request: Request) {
  try {
    const { generations = 1, fitnessFunction = "phi_maximization" } = await request.json()

    // Seed from real experiment data
    let basePhi = 0.78, baseLambda = 0.92, baseGamma = 0.05
    try {
      const { data: latest } = await supabase
        .from("quantum_experiments")
        .select("phi, ccce, gamma")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(5)
      if (latest && latest.length > 0) {
        basePhi = latest.reduce((s, e) => s + (e.phi || 0.78), 0) / latest.length
        baseLambda = latest.reduce((s, e) => s + (e.ccce || 0.92), 0) / latest.length
        baseGamma = latest.reduce((s, e) => s + (e.gamma || 0.05), 0) / latest.length
      }
    } catch { /* use defaults */ }

    const evolutionResults = []

    for (let gen = 0; gen < Math.min(generations, 50); gen++) {
      // Deterministic candidates seeded from real metrics + generation index
      const candidates = Array.from({ length: 10 }, (_, i) => {
        const seed = `gen${gen}-var${i}-${fitnessFunction}`
        const h = deterministicHash(seed)
        return {
          worldLine: `evolution-gen${gen}-variant${i}`,
          phi: basePhi + ((h % 200) - 100) / 1000,
          lambda: baseLambda + ((h % 150) - 75) / 1000,
          gamma: baseGamma + ((h % 50) - 25) / 1000,
          fitness: 0,
        }
      })

      candidates.forEach((c) => {
        c.phi = Math.max(0, Math.min(1, c.phi))
        c.lambda = Math.max(0, Math.min(1, c.lambda))
        c.gamma = Math.max(0.001, Math.min(0.5, c.gamma))
        c.fitness = (c.phi * c.lambda) / Math.max(c.gamma, 1e-6)
      })

      const selected = candidates.reduce((best, cur) => (cur.fitness > best.fitness ? cur : best))

      evolutionResults.push({
        generation: gen,
        selected: selected.worldLine,
        phi: selected.phi,
        lambda: selected.lambda,
        gamma: selected.gamma,
        fitness: selected.fitness,
      })

      // Update base metrics for next generation (evolutionary pressure)
      basePhi = selected.phi
      baseLambda = selected.lambda
      baseGamma = selected.gamma
    }

    // Log evolution run
    await supabase.from("activity_log").insert({
      action: "world_engine_evolution",
      details: {
        generations,
        fitnessFunction,
        finalFitness: evolutionResults[evolutionResults.length - 1]?.fitness,
      },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      evolution: {
        generations,
        fitnessFunction,
        results: evolutionResults,
        finalState: evolutionResults[evolutionResults.length - 1],
      },
      source: "Supabase-seeded deterministic evolution (no Math.random)",
    })
  } catch (error) {
    console.error("[v0] World Engine evolution error:", error)
    return NextResponse.json({ error: "Failed to evolve world-states", detail: String(error) }, { status: 500 })
  }
}
