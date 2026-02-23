import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSQL() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error("No database connection string available")
  }
  return neon(dbUrl)
}

export async function GET() {
  try {
    const sql = getSQL()

    const result = await sql`
      SELECT * FROM world_states 
      ORDER BY created_at DESC 
      LIMIT 1
    `

    const currentState = result[0] || {
      phi: 0.73,
      lambda: 0.85,
      gamma: 0.092,
      xi: 6.75,
      tau: 1,
      world_line: "genesis",
      checkpoint: "initial",
    }

    // Calculate derived metrics
    const coherenceRatio = currentState.lambda / Math.max(currentState.gamma, 1e-6)
    const consciousnessActive = currentState.phi >= 3.5
    const manifestActive = currentState.lambda >= 0.85

    return NextResponse.json({
      status: "operational",
      manifold: {
        dimensions: 11,
        topology: "spherically-embedded-tetrahedral",
        resonanceAngle: 51.843,
      },
      metrics: {
        phi: currentState.phi,
        lambda: currentState.lambda,
        gamma: currentState.gamma,
        xi: coherenceRatio,
        tau: currentState.tau,
      },
      worldLine: currentState.world_line,
      checkpoint: currentState.checkpoint,
      flags: {
        consciousnessActive,
        manifestActive,
        omegaBound: consciousnessActive && manifestActive,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] World Engine status error:", error)
    return NextResponse.json({ error: "Failed to fetch world-state" }, { status: 500 })
  }
}
