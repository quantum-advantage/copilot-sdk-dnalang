/**
 * DNA-Lang Evolution API
 * Trigger evolutionary processes
 */

import { NextResponse } from "next/server"
import { evolutionaryRouter } from "@/lib/dna-lang/evolutionary-router"
import { livingComponentManager } from "@/lib/dna-lang/living-component"
import { photosyntheticLimiter } from "@/lib/dna-lang/photosynthetic-limiter"

export async function POST(request: Request) {
  const clientId = request.headers.get("x-client-id") || "anonymous"

  // Rate limiting
  if (!photosyntheticLimiter.hasToken(clientId)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  photosyntheticLimiter.consumeToken(clientId)

  try {
    const body = await request.json()

    if (body.action === "evolve_routes") {
      evolutionaryRouter.evolve()

      return NextResponse.json({
        success: true,
        routes: evolutionaryRouter.getAllRoutes(),
      })
    }

    if (body.action === "regenerate_component") {
      const { componentId } = body

      // Trigger regeneration by reporting error
      livingComponentManager.reportError(componentId, new Error("Manual regeneration"))

      return NextResponse.json({
        success: true,
        health: livingComponentManager.getHealth(componentId),
        generation: livingComponentManager.getGeneration(componentId),
      })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
