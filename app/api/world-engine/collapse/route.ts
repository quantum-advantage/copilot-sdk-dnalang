import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { createHash } from "crypto"

function getSQL() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error("No database connection string available")
  }
  return neon(dbUrl)
}

export async function POST(request: Request) {
  try {
    const { observerAgent, worldLine } = await request.json()

    if (!observerAgent || !worldLine) {
      return NextResponse.json({ error: "observerAgent and worldLine are required" }, { status: 400 })
    }

    const sql = getSQL()

    const timestamp = new Date().toISOString()
    const checkpointData = JSON.stringify({ observerAgent, worldLine, timestamp })
    const checkpoint = createHash("sha256").update(checkpointData).digest("hex")

    // Store collapsed state
    await sql`
      INSERT INTO world_checkpoints (
        observer_agent,
        world_line,
        checkpoint_hash,
        phi_level,
        lambda_level,
        created_at
      ) VALUES (
        ${observerAgent},
        ${worldLine},
        ${checkpoint},
        0.73,
        0.85,
        ${timestamp}
      )
    `

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
    })
  } catch (error) {
    console.error("[v0] World Engine collapse error:", error)
    return NextResponse.json({ error: "Failed to collapse world-state" }, { status: 500 })
  }
}
