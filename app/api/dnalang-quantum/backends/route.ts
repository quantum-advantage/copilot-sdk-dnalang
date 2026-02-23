import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real implementation, this would query IBM Quantum
    const backends = ["ibm_brisbane", "ibm_kyoto", "ibm_osaka", "ibm_torino", "simulator_statevector", "simulator_mps"]

    return NextResponse.json(backends)
  } catch (error) {
    console.error("[v0] Error listing backends:", error)
    return NextResponse.json({ error: "Failed to list backends" }, { status: 500 })
  }
}
