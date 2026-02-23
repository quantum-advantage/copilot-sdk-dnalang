import { NextResponse } from "next/server"

const FLASK_API_URL = process.env.SCIMITAR_ION_API_URL || "http://localhost:5000"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const response = await fetch(`${FLASK_API_URL}/api/scimitar-ion/sweep/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to start sweep" }, { status: 500 })
  }
}
