import { NextResponse } from "next/server"

const AWS_API = "https://mwkeczoay4.execute-api.us-east-2.amazonaws.com"

export async function GET() {
  try {
    const res = await fetch(`${AWS_API}/api/experiments`, {
      next: { revalidate: 60 },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({
      count: 0,
      experiments: [],
      source: "fallback",
      note: "AWS API unreachable — cached data unavailable",
    })
  }
}
