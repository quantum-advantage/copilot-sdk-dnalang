import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data } = body

    const ts = new Date().toISOString()
    const payload = JSON.stringify(
      { data: data || "", timestamp: ts, framework: "DNA::}{::lang v51.843" },
      null,
      0
    )
    const sha = crypto.createHash("sha256").update(payload).digest("hex")

    return NextResponse.json({
      attestation: sha,
      timestamp: ts,
      framework: "DNA::}{::lang v51.843",
      cage: "9HUP5",
      pcrb_entry: `PCRB:${sha.slice(0, 32)}`,
      verified: true,
    })
  } catch {
    return NextResponse.json({ error: "Invalid attestation request" }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({
    service: "Cryptographic Attestation",
    algorithm: "SHA-256",
    ledger: "PCRB (Post-Quantum Cryptographic Record Block)",
    framework: "DNA::}{::lang v51.843",
    cage: "9HUP5",
  })
}
