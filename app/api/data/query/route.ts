import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSQL() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error("No database connection string available")
  }
  return neon(dbUrl)
}

export async function POST(request: NextRequest) {
  try {
    const { timeRange, metrics, aggregation } = await request.json()

    const sql = getSQL()

    // Build dynamic query based on parameters
    const query = `
      SELECT 
        time_bucket('${aggregation || "1 minute"}', timestamp) AS time,
        AVG(lambda) as lambda,
        AVG(phi) as phi,
        AVG(gamma) as gamma,
        AVG(coherence) as coherence,
        AVG(qbyte_rate) as qbyte_rate
      FROM telemetry_data
      WHERE timestamp >= NOW() - INTERVAL '${timeRange || "1 hour"}'
      GROUP BY time
      ORDER BY time DESC
      LIMIT 1000
    `

    const results = await sql(query)

    return NextResponse.json({
      data: results,
      count: results.length,
      timeRange,
      aggregation,
    })
  } catch (error) {
    console.error("[v0] Data query error:", error)

    // Return mock data for development
    const mockData = Array.from({ length: 50 }, (_, i) => ({
      time: new Date(Date.now() - i * 60000).toISOString(),
      lambda: 0.85 + Math.random() * 0.1,
      phi: 2.176435e-8 * (1 + Math.random() * 0.2),
      gamma: 0.05 + Math.random() * 0.05,
      coherence: 0.92 + Math.random() * 0.06,
      qbyte_rate: 1200 + Math.random() * 400,
    }))

    return NextResponse.json({
      data: mockData,
      count: mockData.length,
      timeRange: "1 hour",
      aggregation: "1 minute",
      mock: true,
    })
  }
}
