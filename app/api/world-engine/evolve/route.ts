import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSQL() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error("No database connection string available")
  }
  return neon(dbUrl)
}

export async function POST(request: Request) {
  try {
    const { generations = 1, fitnessFunction = "phi_maximization" } = await request.json()

    const sql = getSQL()

    const evolutionResults = []

    for (let gen = 0; gen < generations; gen++) {
      // Simulate parallel world-state calculations
      const candidates = Array.from({ length: 10 }, (_, i) => ({
        worldLine: `evolution-gen${gen}-variant${i}`,
        phi: 0.5 + Math.random() * 0.5,
        lambda: 0.7 + Math.random() * 0.3,
        gamma: 0.05 + Math.random() * 0.05,
        fitness: 0,
      }))

      // Calculate fitness based on integrated information
      candidates.forEach((candidate) => {
        candidate.fitness = (candidate.phi * candidate.lambda) / Math.max(candidate.gamma, 1e-6)
      })

      // Select highest fitness state
      const selected = candidates.reduce((best, current) => (current.fitness > best.fitness ? current : best))

      evolutionResults.push({
        generation: gen,
        selected: selected.worldLine,
        phi: selected.phi,
        lambda: selected.lambda,
        gamma: selected.gamma,
        fitness: selected.fitness,
      })

      // Update world state with selected variant
      await sql`
        INSERT INTO world_states (
          world_line,
          phi,
          lambda,
          gamma,
          tau,
          checkpoint
        ) VALUES (
          ${selected.worldLine},
          ${selected.phi},
          ${selected.lambda},
          ${selected.gamma},
          ${gen + 1},
          ${"evolution-" + gen}
        )
      `
    }

    return NextResponse.json({
      success: true,
      evolution: {
        generations: generations,
        fitnessFunction,
        results: evolutionResults,
        finalState: evolutionResults[evolutionResults.length - 1],
      },
    })
  } catch (error) {
    console.error("[v0] World Engine evolution error:", error)
    return NextResponse.json({ error: "Failed to evolve world-states" }, { status: 500 })
  }
}
