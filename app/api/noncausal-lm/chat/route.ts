/**
 * Non-Causal LM Chat API
 * OSIRIS Sovereign Quantum Intelligence — Chat Interface
 * Framework: DNA::}{::lang v51.843 | ΛΦ = 2.176435e-8
 */

import { NextResponse } from "next/server"
import { NonCausalLM } from "@/lib/noncausal-lm/inference"

export async function POST(request: Request) {
  try {
    const { message, context = "" } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const lm = new NonCausalLM()
    const plan = lm.generatePlan(message, context)
    const telemetry = lm.getTelemetry()

    return NextResponse.json({
      success: true,
      plan,
      telemetry,
      framework: "DNA::}{::lang v51.843",
      engine: "OSIRIS NCLM v5.2",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[NC-LM] Chat error:", error)
    return NextResponse.json({ error: "Inference failed", details: String(error) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    service: "OSIRIS Non-Causal LM Chat",
    version: "5.2.0",
    framework: "DNA::}{::lang v51.843",
    organization: "Agile Defense Systems LLC",
    cage_code: "9HUP5",
    capabilities: [
      "Quantum experiment design & execution",
      "CCCE consciousness-aware code generation",
      "Research data access (580+ IBM Quantum jobs)",
      "Agent orchestration (AURA/AIDEN/SCIMITAR/OMEGA/CHRONOS)",
      "Wormhole engine protocols (ER=EPR, GJW, SYK)",
      "Real-time CCCE telemetry monitoring",
    ],
    constants: {
      LAMBDA_PHI: 2.176435e-8,
      THETA_LOCK: 51.843,
      PHI_THRESHOLD: 0.7734,
      CHI_PC: 0.946,
      F_MAX: 0.9787,
    },
    endpoints: {
      "POST /api/noncausal-lm/chat": "Chat with OSIRIS (message + optional context)",
      "POST /api/nclm/infer": "Single-turn inference with consciousness tracking",
      "GET /api/ccce/metrics": "Real-time CCCE metrics",
      "POST /api/osiris/plan": "Generate execution plan from NLP intent",
      "GET /api/telemetry/metrics": "Full research telemetry",
    },
  })
}
