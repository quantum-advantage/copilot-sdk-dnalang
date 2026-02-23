import { NextResponse } from "next/server"

// Physical constants
const LAMBDA_PHI = 2.176435e-8
const PHI_C = 0.7734
const THETA_LOCK = 51.843

// Simulated Scimitar state (in production, this would come from the daemon)
let scimitarState: ScimitarState = {
  state: "IDLE",
  zones: [
    { zone_id: 1, name: "scroll_wheel", color: { r: 0, g: 255, b: 0 }, pattern: "solid" },
    { zone_id: 2, name: "logo", color: { r: 0, g: 255, b: 0 }, pattern: "solid" },
    { zone_id: 3, name: "side_panel", color: { r: 0, g: 255, b: 0 }, pattern: "solid" },
    { zone_id: 4, name: "front_led", color: { r: 0, g: 255, b: 0 }, pattern: "solid" },
  ],
  buttons: Array.from({ length: 12 }, (_, i) => ({
    button_id: i + 1,
    name: `side_${i + 1}`,
    color: { r: 0, g: 0, b: 0 },
    action: null,
    label: "",
  })),
  pendingProposal: null,
  eventLog: [],
}

interface RGBColor {
  r: number
  g: number
  b: number
}

interface ScimitarZone {
  zone_id: number
  name: string
  color: RGBColor
  pattern: "solid" | "pulse" | "breathe" | "flash" | "rainbow" | "wave"
}

interface ButtonAction {
  type: "deploy" | "sandbox" | "discard" | "modify" | "approve" | "escalate"
  payload: unknown
  description: string
  requires_confirmation: boolean
}

interface ScimitarButton {
  button_id: number
  name: string
  color: RGBColor
  action: ButtonAction | null
  label: string
}

interface AgentProposal {
  id: string
  timestamp: number
  source_agent: string
  reason: string
  urgency: "low" | "medium" | "high" | "critical"
  summary: string
  actions: ButtonAction[]
  context: {
    ccce_state: {
      lambda: number
      phi: number
      gamma: number
      xi: number
    }
    related_tasks: string[]
    affected_files: string[]
  }
}

interface ScimitarEvent {
  timestamp: number
  type: string
  data: unknown
}

interface ScimitarState {
  state: "IDLE" | "ATTENTION" | "INSTRUCTION" | "EXECUTING"
  zones: ScimitarZone[]
  buttons: ScimitarButton[]
  pendingProposal: AgentProposal | null
  eventLog: ScimitarEvent[]
}

const COLORS = {
  IDLE_GREEN: { r: 0, g: 255, b: 0 },
  ATTENTION_RED: { r: 255, g: 0, b: 64 },
  ATTENTION_AMBER: { r: 255, g: 191, b: 0 },
  DEPLOY: { r: 0, g: 255, b: 128 },
  SANDBOX: { r: 0, g: 128, b: 255 },
  DISCARD: { r: 255, g: 64, b: 64 },
  MODIFY: { r: 255, g: 200, b: 0 },
  APPROVE: { r: 0, g: 255, b: 0 },
  ESCALATE: { r: 148, g: 0, b: 211 },
  QUANTUM_CYAN: { r: 0, g: 243, b: 255 },
}

function getColorForActionType(type: ButtonAction["type"]): RGBColor {
  switch (type) {
    case "deploy": return COLORS.DEPLOY
    case "sandbox": return COLORS.SANDBOX
    case "discard": return COLORS.DISCARD
    case "modify": return COLORS.MODIFY
    case "approve": return COLORS.APPROVE
    case "escalate": return COLORS.ESCALATE
    default: return { r: 0, g: 0, b: 0 }
  }
}

export async function GET() {
  // Add organic drift to simulate live system
  const driftedState = {
    ...scimitarState,
    telemetry: {
      lambda: 0.95 + Math.sin(Date.now() * LAMBDA_PHI) * 0.03,
      phi: PHI_C + Math.cos(Date.now() * LAMBDA_PHI * 2) * 0.02,
      gamma: 0.15 + Math.random() * 0.05,
      xi: 0.42 + Math.sin(Date.now() * 0.001) * 0.08,
      theta_lock: THETA_LOCK,
      timestamp: Date.now(),
    },
  }
  
  return NextResponse.json(driftedState)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, payload } = body
    
    switch (action) {
      case "set_idle":
        scimitarState = {
          ...scimitarState,
          state: "IDLE",
          zones: scimitarState.zones.map(z => ({
            ...z,
            color: COLORS.IDLE_GREEN,
            pattern: "solid" as const,
          })),
          buttons: scimitarState.buttons.map(b => ({
            ...b,
            color: { r: 0, g: 0, b: 0 },
            action: null,
            label: "",
          })),
          pendingProposal: null,
        }
        addEvent("state_change", { to: "IDLE" })
        break
        
      case "set_attention":
        const proposal = payload as AgentProposal
        scimitarState = {
          ...scimitarState,
          state: "ATTENTION",
          zones: scimitarState.zones.map(z => ({
            ...z,
            color: proposal.urgency === "critical" ? COLORS.ATTENTION_RED : COLORS.ATTENTION_AMBER,
            pattern: "flash" as const,
          })),
          pendingProposal: proposal,
        }
        addEvent("attention_request", { proposal_id: proposal.id, urgency: proposal.urgency })
        break
        
      case "acknowledge":
        if (scimitarState.state === "ATTENTION" && scimitarState.pendingProposal) {
          const prop = scimitarState.pendingProposal
          scimitarState = {
            ...scimitarState,
            state: "INSTRUCTION",
            zones: scimitarState.zones.map(z => ({
              ...z,
              color: COLORS.QUANTUM_CYAN,
              pattern: "breathe" as const,
            })),
            buttons: scimitarState.buttons.map((b, i) => {
              const action = prop.actions[i]
              if (action) {
                return {
                  ...b,
                  color: getColorForActionType(action.type),
                  action,
                  label: action.description,
                }
              }
              return b
            }),
          }
          addEvent("acknowledged", { proposal_id: prop.id })
        }
        break
        
      case "button_press":
        const { button_id } = payload
        const button = scimitarState.buttons.find(b => b.button_id === button_id)
        if (button?.action && scimitarState.pendingProposal) {
          const decision = {
            timestamp: Date.now(),
            proposal_id: scimitarState.pendingProposal.id,
            button_pressed: button_id,
            action_type: button.action.type,
            payload: button.action.payload,
          }
          addEvent("operator_decision", decision)
          
          // Set executing state
          scimitarState = {
            ...scimitarState,
            state: "EXECUTING",
            zones: scimitarState.zones.map(z => ({
              ...z,
              color: COLORS.DEPLOY,
              pattern: "wave" as const,
            })),
          }
          
          // Return to idle after 2 seconds (simulated)
          setTimeout(() => {
            scimitarState = {
              ...scimitarState,
              state: "IDLE",
              zones: scimitarState.zones.map(z => ({
                ...z,
                color: COLORS.IDLE_GREEN,
                pattern: "solid" as const,
              })),
              buttons: scimitarState.buttons.map(b => ({
                ...b,
                color: { r: 0, g: 0, b: 0 },
                action: null,
                label: "",
              })),
              pendingProposal: null,
            }
          }, 2000)
          
          return NextResponse.json({ success: true, decision })
        }
        break
        
      case "simulate_proposal":
        // For testing: simulate an agent proposal
        const testProposal: AgentProposal = {
          id: `proposal-${Date.now()}`,
          timestamp: Date.now(),
          source_agent: payload?.agent || "CoderAgent",
          reason: payload?.reason || "Code deployment ready",
          urgency: payload?.urgency || "medium",
          summary: payload?.summary || "New feature implementation complete. Ready for deployment.",
          actions: [
            { type: "deploy", payload: { target: "production" }, description: "Deploy to Production", requires_confirmation: true },
            { type: "sandbox", payload: { target: "staging" }, description: "Test in Sandbox", requires_confirmation: false },
            { type: "modify", payload: { action: "edit" }, description: "Modify Code", requires_confirmation: false },
            { type: "discard", payload: { action: "reject" }, description: "Discard Changes", requires_confirmation: true },
          ],
          context: {
            ccce_state: {
              lambda: 0.92,
              phi: 0.78,
              gamma: 0.12,
              xi: 0.45,
            },
            related_tasks: ["TASK-001", "TASK-002"],
            affected_files: ["app/page.tsx", "lib/utils.ts"],
          },
        }
        
        scimitarState = {
          ...scimitarState,
          state: "ATTENTION",
          zones: scimitarState.zones.map(z => ({
            ...z,
            color: testProposal.urgency === "critical" ? COLORS.ATTENTION_RED : COLORS.ATTENTION_AMBER,
            pattern: "flash" as const,
          })),
          pendingProposal: testProposal,
        }
        addEvent("proposal_simulated", { proposal_id: testProposal.id })
        break
        
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
    
    return NextResponse.json({ success: true, state: scimitarState })
  } catch (error) {
    console.error("[Scimitar API] Error:", error)
    return NextResponse.json(
      { error: "Failed to process action", details: String(error) },
      { status: 500 }
    )
  }
}

function addEvent(type: string, data: unknown) {
  scimitarState.eventLog.push({
    timestamp: Date.now(),
    type,
    data,
  })
  
  // Keep only last 100 events
  if (scimitarState.eventLog.length > 100) {
    scimitarState.eventLog = scimitarState.eventLog.slice(-100)
  }
}
