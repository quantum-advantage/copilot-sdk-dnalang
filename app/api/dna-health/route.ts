/**
 * DNA-Lang Health Check API
 * Evolutionary server with immune system
 */

import { NextResponse } from "next/server"
import { immuneSystem } from "@/lib/dna-lang/immune-system"
import { quantumNetwork } from "@/lib/dna-lang/quantum-network"
import { photosyntheticLimiter } from "@/lib/dna-lang/photosynthetic-limiter"
import { LAMBDA_PHI, calculateCoherence } from "@/lib/dna-lang"

export async function GET(request: Request) {
  const clientId = request.headers.get("x-client-id") || "anonymous"

  // Photosynthetic rate limiting
  if (!photosyntheticLimiter.hasToken(clientId)) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: "Photosynthetic tokens depleted. Please wait for regeneration.",
        rateLimitStatus: photosyntheticLimiter.getStatus(clientId),
      },
      { status: 429 },
    )
  }

  // Consume token
  photosyntheticLimiter.consumeToken(clientId)

  // Immune system check
  const immuneStatus = immuneSystem.getStatus()

  // Quantum network stats
  const networkStats = quantumNetwork.getNetworkStats()

  // System coherence
  const coherence = calculateCoherence(300, Date.now() / 1000)

  // Health metrics
  const health = {
    status: "operational",
    timestamp: new Date().toISOString(),
    lambdaPhi: LAMBDA_PHI,
    coherence: coherence,
    immuneSystem: {
      ...immuneStatus,
      antibodies: immuneSystem.getAntibodies().slice(0, 5),
      activeTCells: immuneSystem.getActiveTCells().slice(0, 5),
      activeThreats: immuneSystem.getActiveThreats(),
    },
    quantumNetwork: networkStats,
    rateLimiting: photosyntheticLimiter.getStatus(clientId),
    version: "5.0.0",
  }

  return NextResponse.json(health)
}

export async function POST(request: Request) {
  const clientId = request.headers.get("x-client-id") || "anonymous"

  // Rate limiting
  if (!photosyntheticLimiter.hasToken(clientId)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  photosyntheticLimiter.consumeToken(clientId)

  try {
    const body = await request.json()

    // Simulate threat detection
    if (body.action === "detect_threat") {
      const { signature, type, severity } = body

      const isBlocked = immuneSystem.detectThreat(signature, type || "malware", severity || 0.5)

      return NextResponse.json({
        blocked: isBlocked,
        immuneStatus: immuneSystem.getStatus(),
      })
    }

    // Quantum message
    if (body.action === "quantum_send") {
      const { channelId, data } = body

      await quantumNetwork.send(channelId, data)

      return NextResponse.json({
        success: true,
        message: "Quantum message sent instantly",
      })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
