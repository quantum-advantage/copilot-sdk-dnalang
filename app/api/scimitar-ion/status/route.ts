import { NextResponse } from "next/server"

// Proxy to Python Flask backend (Scimitar-Ion Bridge)
const FLASK_API_URL = process.env.SCIMITAR_ION_API_URL || "http://localhost:5000"

export async function GET() {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/scimitar-ion/status`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "offline",
          lambda: 0,
          phi: 0,
          gamma: 1,
          xi: 0,
          tau: 0,
          checkpoint: "OFFLINE",
          powerStability: 0,
          negentropicRecovery: 0,
        },
        { status: 200 },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Scimitar-Ion status fetch failed:", error)
    return NextResponse.json(
      {
        status: "error",
        lambda: 0,
        phi: 0,
        gamma: 1,
        xi: 0,
        tau: 0,
        checkpoint: "ERROR",
        powerStability: 0,
        negentropicRecovery: 0,
      },
      { status: 200 },
    )
  }
}
