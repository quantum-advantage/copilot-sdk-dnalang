import { NextResponse } from "next/server"

const FLASK_API_URL = process.env.SCIMITAR_ION_API_URL || "http://localhost:5000"

export async function GET() {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/scimitar-ion/piezo/coupling`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Flask API unavailable")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      {
        piezoVoltage: 0,
        phaseConjugateActive: false,
        chi_pc: 0,
        resonanceLock: false,
        seismicStability: 0,
        nanomechanicalParking: false,
      },
      { status: 200 },
    )
  }
}
