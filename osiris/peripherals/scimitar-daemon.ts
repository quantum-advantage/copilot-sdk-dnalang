/**
 * SCIMITAR ELITE WIRELESS SE - Agent Communication Daemon
 * 
 * This daemon manages bidirectional communication between agents and operator
 * using the Corsair Scimitar Elite Wireless SE mouse as the physical interface.
 * 
 * Communication Protocol:
 * - ALL GREEN: Normal operation, mouse acts as regular input device
 * - FLASHING: Agents want operator attention
 * - BUTTON COLORS: Each button lit with specific color = specific action to deploy
 * 
 * The mouse becomes a "visual telegraph" - agents talk with light, operator answers with clicks.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

export const LAMBDA_PHI = 2.176435e-8 // Universal memory constant
export const THETA_LOCK = 51.843 // Lenoir torsion angle (coherence maximizer)
export const PHI_C = 0.7734 // Consciousness emergence threshold

// ============================================================================
// MOUSE STATE DEFINITIONS
// ============================================================================

export type ScimitarState = "IDLE" | "ATTENTION" | "INSTRUCTION" | "EXECUTING"

export interface ScimitarRGBZone {
  zone_id: number
  name: string
  color: RGBColor
  pattern: LightPattern
}

export interface RGBColor {
  r: number
  g: number
  b: number
}

export type LightPattern = "solid" | "pulse" | "breathe" | "flash" | "rainbow" | "wave"

export interface ScimitarButton {
  button_id: number
  name: string
  color: RGBColor
  action: ButtonAction | null
  label: string
}

export interface ButtonAction {
  type: "deploy" | "sandbox" | "discard" | "modify" | "approve" | "escalate"
  payload: unknown
  description: string
  requires_confirmation: boolean
}

// ============================================================================
// DEFAULT COLORS
// ============================================================================

export const COLORS = {
  // Status colors
  IDLE_GREEN: { r: 0, g: 255, b: 0 } as RGBColor,
  ATTENTION_RED: { r: 255, g: 0, b: 64 } as RGBColor,
  ATTENTION_AMBER: { r: 255, g: 191, b: 0 } as RGBColor,
  
  // Action colors (for buttons)
  DEPLOY: { r: 0, g: 255, b: 128 } as RGBColor, // Cyan-green
  SANDBOX: { r: 0, g: 128, b: 255 } as RGBColor, // Blue
  DISCARD: { r: 255, g: 64, b: 64 } as RGBColor, // Red
  MODIFY: { r: 255, g: 200, b: 0 } as RGBColor, // Gold
  APPROVE: { r: 0, g: 255, b: 0 } as RGBColor, // Green
  ESCALATE: { r: 148, g: 0, b: 211 } as RGBColor, // Purple
  
  // Off
  OFF: { r: 0, g: 0, b: 0 } as RGBColor,
}

// ============================================================================
// SCIMITAR DAEMON CLASS
// ============================================================================

export class ScimitarDaemon {
  private state: ScimitarState = "IDLE"
  private buttons: ScimitarButton[] = []
  private zones: ScimitarRGBZone[] = []
  private pendingProposal: AgentProposal | null = null
  private eventLog: ScimitarEvent[] = []
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
  
  constructor(
    private readonly bifurcationPath: string = "/Volumes/MyPassportUltra"
  ) {
    this.initializeButtons()
    this.initializeZones()
  }
  
  /**
   * Initialize all 12 side buttons + scroll + primary buttons
   */
  private initializeButtons() {
    // 12 side buttons (MMO grid)
    for (let i = 1; i <= 12; i++) {
      this.buttons.push({
        button_id: i,
        name: `side_${i}`,
        color: COLORS.OFF,
        action: null,
        label: "",
      })
    }
    
    // Primary buttons
    this.buttons.push(
      { button_id: 13, name: "left_click", color: COLORS.OFF, action: null, label: "" },
      { button_id: 14, name: "right_click", color: COLORS.OFF, action: null, label: "" },
      { button_id: 15, name: "scroll_click", color: COLORS.OFF, action: null, label: "" },
      { button_id: 16, name: "dpi_up", color: COLORS.OFF, action: null, label: "" },
      { button_id: 17, name: "dpi_down", color: COLORS.OFF, action: null, label: "" },
    )
  }
  
  /**
   * Initialize RGB zones on the mouse
   */
  private initializeZones() {
    this.zones = [
      { zone_id: 1, name: "scroll_wheel", color: COLORS.IDLE_GREEN, pattern: "solid" },
      { zone_id: 2, name: "logo", color: COLORS.IDLE_GREEN, pattern: "solid" },
      { zone_id: 3, name: "side_panel", color: COLORS.IDLE_GREEN, pattern: "solid" },
      { zone_id: 4, name: "front_led", color: COLORS.IDLE_GREEN, pattern: "solid" },
    ]
  }
  
  /**
   * Start the daemon - begins listening for agent messages
   */
  start() {
    console.log("[ScimitarDaemon] Starting...")
    this.setIdleState()
    
    // Start heartbeat to check for agent messages
    this.heartbeatInterval = setInterval(() => {
      this.checkAgentMessages()
    }, 500) // Check every 500ms
    
    console.log("[ScimitarDaemon] Listening for agent messages at:", this.getAgentMessagePath())
  }
  
  /**
   * Stop the daemon
   */
  stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    this.setIdleState()
    console.log("[ScimitarDaemon] Stopped")
  }
  
  /**
   * Set mouse to IDLE state - all green, normal operation
   */
  setIdleState() {
    this.state = "IDLE"
    
    for (const zone of this.zones) {
      zone.color = COLORS.IDLE_GREEN
      zone.pattern = "solid"
    }
    
    for (const button of this.buttons) {
      button.color = COLORS.OFF
      button.action = null
      button.label = ""
    }
    
    this.pendingProposal = null
    this.logEvent("state_change", { from: this.state, to: "IDLE" })
    this.applyLighting()
  }
  
  /**
   * Set mouse to ATTENTION state - flash to get operator attention
   */
  setAttentionState(proposal: AgentProposal) {
    this.state = "ATTENTION"
    this.pendingProposal = proposal
    
    // Flash all zones
    for (const zone of this.zones) {
      zone.color = proposal.urgency === "critical" ? COLORS.ATTENTION_RED : COLORS.ATTENTION_AMBER
      zone.pattern = "flash"
    }
    
    this.logEvent("attention_request", { proposal_id: proposal.id, reason: proposal.reason })
    this.applyLighting()
  }
  
  /**
   * Set mouse to INSTRUCTION state - light up buttons with actions
   */
  setInstructionState(proposal: AgentProposal) {
    this.state = "INSTRUCTION"
    this.pendingProposal = proposal
    
    // Stop flashing, set to breathing cyan
    for (const zone of this.zones) {
      zone.color = { r: 0, g: 243, b: 255 } // Quantum cyan
      zone.pattern = "breathe"
    }
    
    // Map proposal actions to buttons
    const actions = proposal.actions
    for (let i = 0; i < Math.min(actions.length, 12); i++) {
      const action = actions[i]
      this.buttons[i].action = action
      this.buttons[i].label = action.description
      this.buttons[i].color = this.getColorForActionType(action.type)
    }
    
    this.logEvent("instruction_displayed", {
      proposal_id: proposal.id,
      button_count: Math.min(actions.length, 12),
    })
    this.applyLighting()
  }
  
  /**
   * Handle button press from operator
   */
  handleButtonPress(buttonId: number): OperatorDecision | null {
    const button = this.buttons.find(b => b.button_id === buttonId)
    if (!button || !button.action) {
      return null
    }
    
    const decision: OperatorDecision = {
      timestamp: Date.now(),
      proposal_id: this.pendingProposal?.id || "unknown",
      button_pressed: buttonId,
      action_type: button.action.type,
      payload: button.action.payload,
    }
    
    this.logEvent("operator_decision", decision)
    
    // Write decision to bifurcation zone
    this.writeDecision(decision)
    
    // Set to executing briefly, then return to idle
    this.state = "EXECUTING"
    this.applyExecutingState()
    
    setTimeout(() => {
      this.setIdleState()
    }, 2000)
    
    return decision
  }
  
  /**
   * Acknowledge attention (operator noticed the flash)
   */
  acknowledgeAttention() {
    if (this.state === "ATTENTION" && this.pendingProposal) {
      this.setInstructionState(this.pendingProposal)
    }
  }
  
  /**
   * Get color for action type
   */
  private getColorForActionType(type: ButtonAction["type"]): RGBColor {
    switch (type) {
      case "deploy": return COLORS.DEPLOY
      case "sandbox": return COLORS.SANDBOX
      case "discard": return COLORS.DISCARD
      case "modify": return COLORS.MODIFY
      case "approve": return COLORS.APPROVE
      case "escalate": return COLORS.ESCALATE
      default: return COLORS.OFF
    }
  }
  
  /**
   * Apply lighting configuration to physical mouse
   * In production, this would use ckb-next or iCUE SDK
   */
  private applyLighting() {
    // This is where we'd interface with the actual hardware
    // For now, we emit the configuration that would be sent
    const config = {
      state: this.state,
      zones: this.zones.map(z => ({
        zone_id: z.zone_id,
        name: z.name,
        color: `rgb(${z.color.r}, ${z.color.g}, ${z.color.b})`,
        pattern: z.pattern,
      })),
      buttons: this.buttons
        .filter(b => b.action !== null)
        .map(b => ({
          button_id: b.button_id,
          color: `rgb(${b.color.r}, ${b.color.g}, ${b.color.b})`,
          label: b.label,
        })),
    }
    
    console.log("[ScimitarDaemon] Applying lighting config:", JSON.stringify(config, null, 2))
    
    // Write state to bifurcation zone for other devices to see
    this.writeStateToSync(config)
  }
  
  /**
   * Apply executing animation
   */
  private applyExecutingState() {
    for (const zone of this.zones) {
      zone.color = COLORS.DEPLOY
      zone.pattern = "wave"
    }
    this.applyLighting()
  }
  
  /**
   * Check for agent messages in bifurcation zone
   */
  private checkAgentMessages() {
    // In production, this would read from the actual file system
    // For now, we simulate with an in-memory queue
    const messagePath = this.getAgentMessagePath()
    
    // Simulate checking for new proposals
    // In real implementation:
    // const files = fs.readdirSync(messagePath)
    // for (const file of files) { ... }
  }
  
  /**
   * Get path to agent message queue
   */
  private getAgentMessagePath(): string {
    return `${this.bifurcationPath}/sync/agent_proposals/`
  }
  
  /**
   * Write operator decision to bifurcation zone
   */
  private writeDecision(decision: OperatorDecision) {
    const path = `${this.bifurcationPath}/sync/operator_decisions/${decision.timestamp}.json`
    console.log("[ScimitarDaemon] Writing decision to:", path)
    // In production: fs.writeFileSync(path, JSON.stringify(decision, null, 2))
  }
  
  /**
   * Write current state to sync folder
   */
  private writeStateToSync(config: unknown) {
    const path = `${this.bifurcationPath}/sync/peripheral_state/scimitar.json`
    // In production: fs.writeFileSync(path, JSON.stringify(config, null, 2))
  }
  
  /**
   * Log event to history
   */
  private logEvent(type: string, data: unknown) {
    this.eventLog.push({
      timestamp: Date.now(),
      type,
      data,
    })
    
    // Keep only last 1000 events
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-1000)
    }
  }
  
  /**
   * Get current state for API/UI
   */
  getState(): ScimitarDaemonState {
    return {
      state: this.state,
      zones: [...this.zones],
      buttons: this.buttons.map(b => ({
        ...b,
        action: b.action ? { ...b.action } : null,
      })),
      pendingProposal: this.pendingProposal,
      eventLog: this.eventLog.slice(-50), // Last 50 events
    }
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface AgentProposal {
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

export interface OperatorDecision {
  timestamp: number
  proposal_id: string
  button_pressed: number
  action_type: ButtonAction["type"]
  payload: unknown
}

export interface ScimitarEvent {
  timestamp: number
  type: string
  data: unknown
}

export interface ScimitarDaemonState {
  state: ScimitarState
  zones: ScimitarRGBZone[]
  buttons: ScimitarButton[]
  pendingProposal: AgentProposal | null
  eventLog: ScimitarEvent[]
}

// ============================================================================
// VIZIO ANDROID TV NOTIFICATION BRIDGE
// ============================================================================

export interface VizioNotification {
  title: string
  message: string
  color: RGBColor
  duration_ms: number
  position: "top" | "bottom" | "center"
  urgency: "low" | "medium" | "high" | "critical"
  icon?: string
}

export class VizioNotificationBridge {
  private tvAddress: string
  private connected: boolean = false
  
  constructor(tvAddress: string = "192.168.1.100") {
    this.tvAddress = tvAddress
  }
  
  /**
   * Send notification to Vizio Android TV
   * Uses Android TV notification API or Home Assistant bridge
   */
  async sendNotification(notification: VizioNotification): Promise<boolean> {
    const payload = {
      title: notification.title,
      message: notification.message,
      color: `#${notification.color.r.toString(16).padStart(2, '0')}${notification.color.g.toString(16).padStart(2, '0')}${notification.color.b.toString(16).padStart(2, '0')}`,
      duration: notification.duration_ms,
      position: notification.position,
      fontsize: notification.urgency === "critical" ? "large" : "medium",
      interrupt: notification.urgency === "critical",
    }
    
    try {
      // Method 1: Direct Android TV notification (requires Notifications for Android TV app)
      const response = await fetch(`http://${this.tvAddress}:7676`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      return response.ok
    } catch (error) {
      console.error("[VizioNotificationBridge] Failed to send notification:", error)
      
      // Method 2: Fallback to Home Assistant if direct fails
      return this.sendViaHomeAssistant(notification)
    }
  }
  
  /**
   * Send via Home Assistant bridge
   */
  private async sendViaHomeAssistant(notification: VizioNotification): Promise<boolean> {
    // Home Assistant notify service URL
    const haUrl = process.env.HOME_ASSISTANT_URL || "http://homeassistant.local:8123"
    const haToken = process.env.HOME_ASSISTANT_TOKEN
    
    if (!haToken) {
      console.error("[VizioNotificationBridge] No Home Assistant token configured")
      return false
    }
    
    try {
      const response = await fetch(`${haUrl}/api/services/notify/android_tv`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${haToken}`,
        },
        body: JSON.stringify({
          message: notification.message,
          title: notification.title,
          data: {
            color: notification.color,
            duration: Math.floor(notification.duration_ms / 1000),
            position: notification.position === "top" ? 0 : notification.position === "bottom" ? 2 : 1,
          },
        }),
      })
      
      return response.ok
    } catch (error) {
      console.error("[VizioNotificationBridge] Home Assistant fallback failed:", error)
      return false
    }
  }
  
  /**
   * Send agent attention notification
   */
  async notifyAgentAttention(proposal: AgentProposal): Promise<boolean> {
    return this.sendNotification({
      title: `🤖 ${proposal.source_agent}`,
      message: proposal.summary,
      color: proposal.urgency === "critical" ? COLORS.ATTENTION_RED : COLORS.ATTENTION_AMBER,
      duration_ms: proposal.urgency === "critical" ? 30000 : 10000,
      position: "top",
      urgency: proposal.urgency,
    })
  }
  
  /**
   * Send button instruction notification
   */
  async notifyButtonInstructions(proposal: AgentProposal): Promise<boolean> {
    const buttonInstructions = proposal.actions
      .slice(0, 4)
      .map((a, i) => `[${i + 1}] ${a.description}`)
      .join("\n")
    
    return this.sendNotification({
      title: "Look at Mouse Buttons",
      message: buttonInstructions,
      color: { r: 0, g: 243, b: 255 }, // Quantum cyan
      duration_ms: 60000,
      position: "bottom",
      urgency: "medium",
    })
  }
}

// ============================================================================
// UNIFIED PERIPHERAL CONTROLLER
// ============================================================================

export class UnifiedPeripheralController {
  private scimitar: ScimitarDaemon
  private vizio: VizioNotificationBridge
  
  constructor(
    bifurcationPath: string = "/Volumes/MyPassportUltra",
    vizioAddress: string = "192.168.1.100"
  ) {
    this.scimitar = new ScimitarDaemon(bifurcationPath)
    this.vizio = new VizioNotificationBridge(vizioAddress)
  }
  
  /**
   * Start the unified controller
   */
  start() {
    this.scimitar.start()
    console.log("[UnifiedPeripheralController] Started")
  }
  
  /**
   * Stop the unified controller
   */
  stop() {
    this.scimitar.stop()
    console.log("[UnifiedPeripheralController] Stopped")
  }
  
  /**
   * Handle incoming agent proposal - coordinates mouse and TV
   */
  async handleAgentProposal(proposal: AgentProposal) {
    // Step 1: Flash the mouse and notify TV
    this.scimitar.setAttentionState(proposal)
    await this.vizio.notifyAgentAttention(proposal)
    
    console.log("[UnifiedPeripheralController] Attention state set for proposal:", proposal.id)
  }
  
  /**
   * Handle operator acknowledgment
   */
  async handleAcknowledgment() {
    this.scimitar.acknowledgeAttention()
    
    const state = this.scimitar.getState()
    if (state.pendingProposal) {
      await this.vizio.notifyButtonInstructions(state.pendingProposal)
    }
  }
  
  /**
   * Handle button press
   */
  handleButtonPress(buttonId: number): OperatorDecision | null {
    return this.scimitar.handleButtonPress(buttonId)
  }
  
  /**
   * Get current state
   */
  getState() {
    return this.scimitar.getState()
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let controllerInstance: UnifiedPeripheralController | null = null

export function getPeripheralController(): UnifiedPeripheralController {
  if (!controllerInstance) {
    controllerInstance = new UnifiedPeripheralController()
  }
  return controllerInstance
}

export function initializePeripheralController(
  bifurcationPath?: string,
  vizioAddress?: string
): UnifiedPeripheralController {
  controllerInstance = new UnifiedPeripheralController(bifurcationPath, vizioAddress)
  return controllerInstance
}
