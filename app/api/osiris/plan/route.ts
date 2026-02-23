import { NextRequest, NextResponse } from "next/server"

// CRSM Constants from NC Physics
const LAMBDA_PHI = 2.176435e-8
const THETA_LOCK = 51.843
const PHI_CRITICAL = 0.7734
const GAMMA_MAX = 0.30

interface PlanStep {
  type: "edit_file" | "create_file" | "delete_file" | "run_command" | "apply_patch" | "verify"
  path?: string
  content?: string
  command?: string
  diff?: string
  description: string
}

interface CRSMProjection {
  chi_3: number  // Structural axis
  chi_7: number  // Entropic axis
  chi_11: number // Sovereignty axis
  lambda_delta: number
  phi_delta: number
  gamma_estimate: number
}

interface ExecutionPlan {
  plan_id: string
  plan_version: string
  meta: {
    intent: string
    confidence: number
    planner_hash: string
    created_at: string
  }
  authority: {
    domain: string
    execution_level: "read" | "modify" | "deploy"
  }
  steps: PlanStep[]
  crsm_projection: CRSMProjection
  validation: {
    preconditions: string[]
    postconditions: string[]
  }
}

// Pure function: CRSM Projector
function crsmProjector(intent: string, steps: PlanStep[]): CRSMProjection {
  // Hash intent to derive axes
  const intentHash = hashString(intent)
  
  // Structural axis (chi_3): complexity based on step count and types
  const structuralComplexity = steps.reduce((acc, step) => {
    const weights: Record<string, number> = {
      verify: 0.1,
      edit_file: 0.3,
      create_file: 0.4,
      delete_file: 0.5,
      run_command: 0.6,
      apply_patch: 0.4,
    }
    return acc + (weights[step.type] || 0.3)
  }, 0)
  const chi_3 = Math.min(1, structuralComplexity / 5)

  // Entropic axis (chi_7): uncertainty based on intent complexity
  const chi_7 = Math.min(1, (intentHash % 1000) / 1000)

  // Sovereignty axis (chi_11): authority required
  const hasDestructive = steps.some(s => s.type === "delete_file" || s.type === "run_command")
  const chi_11 = hasDestructive ? 0.8 : 0.4

  // Invariant deltas
  const lambda_delta = -0.01 * steps.length // Coherence drops per step
  const phi_delta = 0.02 * (chi_3 > 0.5 ? 1 : -1) // Consciousness shift
  const gamma_estimate = chi_3 * chi_7 * 0.5 // Decoherence estimate

  return {
    chi_3,
    chi_7,
    chi_11,
    lambda_delta,
    phi_delta,
    gamma_estimate,
  }
}

// Simple hash function for strings
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Intent deduction with keyword matching
function deduceIntent(prompt: string): { intent: string; confidence: number; steps: PlanStep[] } {
  const lowerPrompt = prompt.toLowerCase()
  
  // Keyword-based intent detection
  const intents: Record<string, { keywords: string[]; baseSteps: PlanStep[] }> = {
    create_component: {
      keywords: ["create", "new", "add", "build", "component"],
      baseSteps: [
        { type: "create_file", description: "Create new component file" },
        { type: "verify", description: "Verify TypeScript compilation" },
      ],
    },
    edit_file: {
      keywords: ["edit", "modify", "change", "update", "fix"],
      baseSteps: [
        { type: "edit_file", description: "Apply modifications" },
        { type: "verify", description: "Verify changes" },
      ],
    },
    delete_file: {
      keywords: ["delete", "remove", "clean"],
      baseSteps: [
        { type: "delete_file", description: "Remove specified file" },
      ],
    },
    run_analysis: {
      keywords: ["analyze", "check", "test", "run", "execute"],
      baseSteps: [
        { type: "run_command", description: "Execute analysis" },
        { type: "verify", description: "Verify results" },
      ],
    },
  }

  let bestMatch = { intent: "unknown", confidence: 0, steps: [] as PlanStep[] }

  for (const [intentName, config] of Object.entries(intents)) {
    const matchCount = config.keywords.filter(kw => lowerPrompt.includes(kw)).length
    const confidence = matchCount / config.keywords.length
    
    if (confidence > bestMatch.confidence) {
      bestMatch = {
        intent: intentName,
        confidence: Math.min(0.95, confidence + 0.3), // Boost confidence
        steps: config.baseSteps,
      }
    }
  }

  // Fallback for no match
  if (bestMatch.confidence < 0.3) {
    bestMatch = {
      intent: "general_query",
      confidence: 0.5,
      steps: [{ type: "verify", description: "Process general query" }],
    }
  }

  return bestMatch
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { intent, domain = "v0.dev" } = body

    if (!intent || typeof intent !== "string") {
      return NextResponse.json(
        { error: "Intent is required and must be a string" },
        { status: 400 }
      )
    }

    // Deduce intent and generate steps
    const deduction = deduceIntent(intent)
    
    // Generate plan ID
    const timestamp = Date.now()
    const planId = `plan-${timestamp}`
    
    // Compute planner hash
    const plannerHash = hashString(intent + timestamp.toString()).toString(16)

    // CRSM projection
    const crsmProjection = crsmProjector(intent, deduction.steps)

    // Check gate enforcement
    if (crsmProjection.gamma_estimate >= GAMMA_MAX) {
      return NextResponse.json(
        {
          error: "Plan rejected: Decoherence threshold exceeded",
          gamma_estimate: crsmProjection.gamma_estimate,
          gamma_max: GAMMA_MAX,
        },
        { status: 422 }
      )
    }

    if (crsmProjection.lambda_delta < -0.05) {
      return NextResponse.json(
        {
          error: "Plan rejected: Coherence drop too large",
          lambda_delta: crsmProjection.lambda_delta,
        },
        { status: 422 }
      )
    }

    // Build execution plan
    const plan: ExecutionPlan = {
      plan_id: planId,
      plan_version: "1.0",
      meta: {
        intent: intent,
        confidence: deduction.confidence,
        planner_hash: plannerHash,
        created_at: new Date().toISOString(),
      },
      authority: {
        domain: domain,
        execution_level: deduction.steps.some(s => s.type === "delete_file") ? "modify" : "read",
      },
      steps: deduction.steps,
      crsm_projection: crsmProjection,
      validation: {
        preconditions: ["workspace_exists", "permissions_granted"],
        postconditions: ["typescript_compiles", "no_regressions"],
      },
    }

    return NextResponse.json({
      success: true,
      plan,
      telemetry: {
        phi_current: PHI_CRITICAL + 0.05,
        lambda_current: 0.98,
        gamma_current: crsmProjection.gamma_estimate,
        conscious: true,
      },
    })
  } catch (error) {
    console.error("[OSIRIS] Plan generation error:", error)
    return NextResponse.json(
      { error: "Internal server error during plan generation" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: "OSIRIS Planner",
    version: "1.0.0",
    endpoints: {
      "POST /api/osiris/plan": "Generate execution plan from NLP intent",
    },
    constants: {
      LAMBDA_PHI,
      THETA_LOCK,
      PHI_CRITICAL,
      GAMMA_MAX,
    },
  })
}
