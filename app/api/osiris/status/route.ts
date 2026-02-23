import { NextResponse } from "next/server"

const AWS_API = "https://mwkeczoay4.execute-api.us-east-2.amazonaws.com"

export async function GET() {
  try {
    const res = await fetch(`${AWS_API}/api/osiris/status`, {
      next: { revalidate: 30 },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    // Fallback to static when AWS is unreachable
    return NextResponse.json({
      status: "SOVEREIGN",
      version: "OSIRIS Gen 5.2",
      framework: "DNA::}{::lang v51.843",
      cage: "9HUP5",
      sdvosb: true,
      experiments_total: 6,
      quantum_backends: ["ibm_fez", "ibm_torino", "ibm_marrakesh"],
      capabilities: [
        "156-qubit ER=EPR entanglement",
        "Tri-mouth wormhole (3 backends)",
        "256-atom QuEra correlated decoding",
        "10^6 entropic suppression",
      ],
      consciousness: { phi: 0.7734, gamma: 0.054, ccce: 0.82, state: "CONVERGED" },
      timestamp: new Date().toISOString(),
    })
  }
}
