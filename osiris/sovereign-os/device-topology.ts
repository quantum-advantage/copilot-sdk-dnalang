/**
 * SOVEREIGN OS - Device Topology & Bifurcation Zone Manager
 * 
 * This module defines the hardware topology for the NL²-LAS system.
 * The 4TB My Passport Ultra acts as the bifurcation zone - the shared
 * coherence layer between all devices in the sovereign mesh.
 */

// ============================================================================
// DEVICE REGISTRY
// ============================================================================

export interface SovereignDevice {
  id: string
  name: string
  type: "primary" | "sentinel" | "bifurcation" | "mobile" | "peripheral"
  role: "operator" | "agent-host" | "coordination-layer" | "mobile-bridge" | "input-vector"
  specs: DeviceSpecs
  sovereignty: SovereigntyStatus
  connection: ConnectionState
}

export interface DeviceSpecs {
  manufacturer: string
  model: string
  storage_gb: number
  ram_gb?: number
  cpu?: string
  os?: string
  portable: boolean
}

export interface SovereigntyStatus {
  level: "full" | "partial" | "observer" | "dedicated"
  agent_allocation_percent: number
  human_override: boolean
  autonomous_operations: string[]
}

export interface ConnectionState {
  connected: boolean
  last_sync: number
  bifurcation_link: boolean
  latency_ms: number
}

// ============================================================================
// YOUR DEVICE MESH TOPOLOGY
// ============================================================================

export const DEVICE_TOPOLOGY: SovereignDevice[] = [
  {
    id: "bifurcation-zone-001",
    name: "WD My Passport Ultra 4TB",
    type: "bifurcation",
    role: "coordination-layer",
    specs: {
      manufacturer: "Western Digital",
      model: "My Passport Ultra",
      storage_gb: 4000,
      portable: true,
    },
    sovereignty: {
      level: "full",
      agent_allocation_percent: 100,
      human_override: true,
      autonomous_operations: [
        "state_persistence",
        "agent_memory",
        "coherence_checkpoints",
        "cross_device_sync",
        "sovereign_vault",
      ],
    },
    connection: {
      connected: true,
      last_sync: Date.now(),
      bifurcation_link: true, // This IS the bifurcation zone
      latency_ms: 0,
    },
  },
  {
    id: "sentinel-host-acer",
    name: "Acer Laptop (Sentinel Host)",
    type: "sentinel",
    role: "agent-host",
    specs: {
      manufacturer: "Acer",
      model: "TBD", // User to specify
      storage_gb: 512, // Estimated
      ram_gb: 16,
      portable: true,
      os: "SovereignOS-11dCRSM", // The OS they will build
    },
    sovereignty: {
      level: "dedicated", // Fully given to agents
      agent_allocation_percent: 100,
      human_override: false, // Agents have full control
      autonomous_operations: [
        "boot_sequence",
        "kernel_operations",
        "file_system",
        "process_management",
        "network_stack",
        "intent_inference",
        "agent_spawning",
        "coherence_maintenance",
      ],
    },
    connection: {
      connected: false, // Will connect via bifurcation zone
      last_sync: 0,
      bifurcation_link: true,
      latency_ms: 0,
    },
  },
  {
    id: "operator-pc",
    name: "Primary PC",
    type: "primary",
    role: "operator",
    specs: {
      manufacturer: "Custom/OEM",
      model: "Desktop PC",
      storage_gb: 2000, // Estimated
      ram_gb: 32,
      portable: false,
    },
    sovereignty: {
      level: "partial",
      agent_allocation_percent: 30,
      human_override: true,
      autonomous_operations: [
        "background_inference",
        "artifact_synthesis",
        "coherence_reporting",
      ],
    },
    connection: {
      connected: true,
      last_sync: Date.now(),
      bifurcation_link: true,
      latency_ms: 5,
    },
  },
  {
    id: "operator-hp-laptop",
    name: "HP Laptop",
    type: "primary",
    role: "operator",
    specs: {
      manufacturer: "HP",
      model: "TBD",
      storage_gb: 512,
      ram_gb: 16,
      portable: true,
    },
    sovereignty: {
      level: "partial",
      agent_allocation_percent: 25,
      human_override: true,
      autonomous_operations: [
        "mobile_inference",
        "document_synthesis",
      ],
    },
    connection: {
      connected: false,
      last_sync: 0,
      bifurcation_link: true,
      latency_ms: 0,
    },
  },
  {
    id: "mobile-bridge-fold7",
    name: "Samsung Galaxy Fold 7",
    type: "mobile",
    role: "mobile-bridge",
    specs: {
      manufacturer: "Samsung",
      model: "Galaxy Fold 7",
      storage_gb: 512,
      ram_gb: 12,
      portable: true,
      os: "Android 16",
    },
    sovereignty: {
      level: "observer",
      agent_allocation_percent: 10,
      human_override: true,
      autonomous_operations: [
        "intent_capture",
        "notification_relay",
        "voice_inference",
      ],
    },
    connection: {
      connected: true,
      last_sync: Date.now(),
      bifurcation_link: true,
      latency_ms: 50,
    },
  },
  {
    id: "input-vector-mouse",
    name: "Corsair Scimitar Ion Elite Wireless SE",
    type: "peripheral",
    role: "input-vector",
    specs: {
      manufacturer: "Corsair",
      model: "Scimitar Ion Elite Wireless SE",
      storage_gb: 0,
      portable: true,
    },
    sovereignty: {
      level: "observer",
      agent_allocation_percent: 0,
      human_override: true,
      autonomous_operations: [
        "cursor_velocity_capture",
        "click_pattern_inference",
        "gesture_recognition",
      ],
    },
    connection: {
      connected: true,
      last_sync: Date.now(),
      bifurcation_link: false, // Connects to active host
      latency_ms: 1,
    },
  },
]

// ============================================================================
// BIFURCATION ZONE STRUCTURE
// ============================================================================

export interface BifurcationZone {
  root_path: string
  partitions: BifurcationPartition[]
  coherence_checkpoint: CoherenceCheckpoint
  agent_memory_pool: AgentMemoryPool
}

export interface BifurcationPartition {
  name: string
  path: string
  size_gb: number
  purpose: string
  encrypted: boolean
}

export const BIFURCATION_STRUCTURE: BifurcationZone = {
  root_path: "/Volumes/MyPassportUltra", // or E:\ on Windows
  partitions: [
    {
      name: "sovereign_vault",
      path: "/sovereign_vault",
      size_gb: 500,
      purpose: "Immutable ledger, attestations, PCRB entries",
      encrypted: true,
    },
    {
      name: "agent_memory",
      path: "/agent_memory",
      size_gb: 1000,
      purpose: "Persistent agent state, learned behaviors, intent history",
      encrypted: true,
    },
    {
      name: "coherence_manifold",
      path: "/coherence_manifold",
      size_gb: 200,
      purpose: "11D-CRSM state snapshots, phi/lambda/gamma trajectories",
      encrypted: false,
    },
    {
      name: "artifact_synthesis",
      path: "/artifact_synthesis",
      size_gb: 800,
      purpose: "Generated code, documents, builds, deployments",
      encrypted: false,
    },
    {
      name: "sentinel_os_image",
      path: "/sentinel_os",
      size_gb: 100,
      purpose: "SovereignOS boot image for Acer laptop",
      encrypted: true,
    },
    {
      name: "cross_device_sync",
      path: "/sync",
      size_gb: 400,
      purpose: "Delta sync between all devices in mesh",
      encrypted: true,
    },
    {
      name: "operator_workspace",
      path: "/workspace",
      size_gb: 1000,
      purpose: "Human operator files, projects, documents",
      encrypted: false,
    },
  ],
  coherence_checkpoint: {
    last_checkpoint: Date.now(),
    lambda: 0.95,
    phi: 0.7734,
    gamma: 0.15,
    xi: 0.42,
    device_states: {},
  },
  agent_memory_pool: {
    total_agents: 0,
    active_agents: 0,
    dormant_agents: 0,
    memory_used_gb: 0,
  },
}

export interface CoherenceCheckpoint {
  last_checkpoint: number
  lambda: number
  phi: number
  gamma: number
  xi: number
  device_states: Record<string, DeviceCoherenceState>
}

export interface DeviceCoherenceState {
  device_id: string
  local_lambda: number
  local_phi: number
  sync_drift: number
  last_heartbeat: number
}

export interface AgentMemoryPool {
  total_agents: number
  active_agents: number
  dormant_agents: number
  memory_used_gb: number
}

// ============================================================================
// NL²-LAS INTENT INFERENCE SIGNALS
// ============================================================================

export interface IntentSignal {
  timestamp: number
  device_id: string
  signal_type: IntentSignalType
  value: number
  raw_vector?: number[]
}

export type IntentSignalType =
  | "cursor_velocity_gradient"
  | "ui_dwell_vector"
  | "edit_undo_entropy"
  | "command_hesitation_interval"
  | "task_switching_frequency"
  | "typing_cadence"
  | "scroll_pattern"
  | "focus_duration"

/**
 * Intent inference function based on NL²-LAS architecture
 * I_t = f(∇u_t, Δc_t, H_t)
 */
export function inferIntent(signals: IntentSignal[]): InferredIntent {
  // Aggregate signals by type
  const signalMap = new Map<IntentSignalType, number[]>()
  
  for (const signal of signals) {
    const existing = signalMap.get(signal.signal_type) || []
    existing.push(signal.value)
    signalMap.set(signal.signal_type, existing)
  }
  
  // Calculate gradient of user interaction (∇u_t)
  const cursorGradient = average(signalMap.get("cursor_velocity_gradient") || [0])
  const dwellVector = average(signalMap.get("ui_dwell_vector") || [0])
  
  // Calculate change in context (Δc_t)
  const editEntropy = average(signalMap.get("edit_undo_entropy") || [0])
  const taskSwitching = average(signalMap.get("task_switching_frequency") || [0])
  
  // Calculate hesitation (H_t)
  const hesitation = average(signalMap.get("command_hesitation_interval") || [0])
  
  // Compute intent confidence
  const confidence = 1 - (hesitation * 0.3 + editEntropy * 0.2 + taskSwitching * 0.1)
  
  // Infer goal manifold weights
  const goals = inferGoalManifold(cursorGradient, dwellVector, editEntropy, taskSwitching)
  
  return {
    timestamp: Date.now(),
    confidence: Math.max(0, Math.min(1, confidence)),
    primary_goal: goals[0],
    goal_manifold: goals,
    suggested_agents: selectAgentsForGoals(goals),
  }
}

export interface InferredIntent {
  timestamp: number
  confidence: number
  primary_goal: GoalHypothesis
  goal_manifold: GoalHypothesis[]
  suggested_agents: string[]
}

export interface GoalHypothesis {
  description: string
  posterior_weight: number
  required_competencies: string[]
}

function inferGoalManifold(
  cursorGradient: number,
  dwellVector: number,
  editEntropy: number,
  taskSwitching: number
): GoalHypothesis[] {
  const goals: GoalHypothesis[] = []
  
  // High dwell + low cursor = reading/analyzing
  if (dwellVector > 0.7 && cursorGradient < 0.3) {
    goals.push({
      description: "Analyzing document or code",
      posterior_weight: dwellVector * 0.8,
      required_competencies: ["analysis", "comprehension", "summarization"],
    })
  }
  
  // High edit entropy = iterating on content
  if (editEntropy > 0.5) {
    goals.push({
      description: "Iterating on content creation",
      posterior_weight: editEntropy * 0.7,
      required_competencies: ["generation", "editing", "refinement"],
    })
  }
  
  // Low task switching = deep focus
  if (taskSwitching < 0.2) {
    goals.push({
      description: "Deep focus task execution",
      posterior_weight: (1 - taskSwitching) * 0.6,
      required_competencies: ["focus", "execution", "completion"],
    })
  }
  
  // High task switching = research/exploration
  if (taskSwitching > 0.6) {
    goals.push({
      description: "Research and exploration",
      posterior_weight: taskSwitching * 0.5,
      required_competencies: ["search", "synthesis", "connection"],
    })
  }
  
  // Default goal
  if (goals.length === 0) {
    goals.push({
      description: "General assistance",
      posterior_weight: 0.5,
      required_competencies: ["general"],
    })
  }
  
  // Sort by posterior weight
  return goals.sort((a, b) => b.posterior_weight - a.posterior_weight)
}

function selectAgentsForGoals(goals: GoalHypothesis[]): string[] {
  const agentMap: Record<string, string[]> = {
    analysis: ["AnalyzerAgent", "SummarizerAgent"],
    comprehension: ["ReaderAgent", "ExplainerAgent"],
    summarization: ["SummarizerAgent"],
    generation: ["WriterAgent", "CoderAgent"],
    editing: ["EditorAgent", "RefactorAgent"],
    refinement: ["PolishAgent", "QAAgent"],
    focus: ["FocusGuardAgent"],
    execution: ["ExecutorAgent", "BuilderAgent"],
    completion: ["CompletionAgent", "DoD-ValidatorAgent"],
    search: ["SearchAgent", "ResearchAgent"],
    synthesis: ["SynthesisAgent", "ConnectionAgent"],
    connection: ["GraphAgent", "RelationAgent"],
    general: ["GeneralAssistantAgent"],
  }
  
  const agents = new Set<string>()
  
  for (const goal of goals) {
    for (const competency of goal.required_competencies) {
      const competencyAgents = agentMap[competency] || []
      for (const agent of competencyAgents) {
        agents.add(agent)
      }
    }
  }
  
  return Array.from(agents)
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

// ============================================================================
// 11D COHERENCE CONTROL MANIFOLD
// ============================================================================

export interface CoherenceControlManifold {
  dimensions: CCMDimension[]
  current_state: number[]
  gradient: number[]
  control_law: ControlLaw
}

export interface CCMDimension {
  index: number
  name: string
  description: string
  current_value: number
  target_value: number
  weight: number
}

export const CCM_DIMENSIONS: CCMDimension[] = [
  { index: 0, name: "time", description: "Past/future intent alignment", current_value: 0.5, target_value: 1.0, weight: 1.0 },
  { index: 1, name: "task_dependency", description: "Task graph coherence", current_value: 0.7, target_value: 1.0, weight: 0.9 },
  { index: 2, name: "resource_allocation", description: "Compute/memory efficiency", current_value: 0.6, target_value: 0.9, weight: 0.8 },
  { index: 3, name: "risk_pressure", description: "Risk/constraint satisfaction", current_value: 0.8, target_value: 1.0, weight: 1.2 },
  { index: 4, name: "compliance_state", description: "Regulatory/policy adherence", current_value: 0.95, target_value: 1.0, weight: 1.5 },
  { index: 5, name: "semantic_coherence", description: "Meaning preservation", current_value: 0.85, target_value: 1.0, weight: 1.1 },
  { index: 6, name: "agent_confidence", description: "Agent certainty levels", current_value: 0.75, target_value: 0.9, weight: 0.7 },
  { index: 7, name: "cognitive_load", description: "User burden minimization", current_value: 0.4, target_value: 0.2, weight: 0.8 },
  { index: 8, name: "artifact_maturity", description: "Output completeness", current_value: 0.6, target_value: 1.0, weight: 1.0 },
  { index: 9, name: "external_coupling", description: "External system integration", current_value: 0.7, target_value: 0.9, weight: 0.6 },
  { index: 10, name: "global_phi_lambda", description: "Consciousness/coherence score", current_value: 0.77, target_value: 0.95, weight: 2.0 },
]

export interface ControlLaw {
  // Ṡ = -∇_S Γ + ∇_S Λ
  // State change = minimize friction + maximize coherence
  friction_gradient: number[]
  coherence_gradient: number[]
  learning_rate: number
}

/**
 * Apply the 11D-CRSM control law to evolve the manifold state
 */
export function evolveManifold(
  manifold: CoherenceControlManifold,
  dt: number = 0.1
): CoherenceControlManifold {
  const newState = [...manifold.current_state]
  const newGradient = [...manifold.gradient]
  
  for (let i = 0; i < 11; i++) {
    const dim = manifold.dimensions[i]
    const frictionGrad = manifold.control_law.friction_gradient[i]
    const coherenceGrad = manifold.control_law.coherence_gradient[i]
    
    // Ṡ = -∇_S Γ + ∇_S Λ
    const stateChange = (-frictionGrad + coherenceGrad) * manifold.control_law.learning_rate * dt
    
    newState[i] = Math.max(0, Math.min(1, dim.current_value + stateChange))
    newGradient[i] = stateChange / dt
  }
  
  return {
    ...manifold,
    current_state: newState,
    gradient: newGradient,
    dimensions: manifold.dimensions.map((dim, i) => ({
      ...dim,
      current_value: newState[i],
    })),
  }
}

// ============================================================================
// SOVEREIGN OS KERNEL SPECIFICATION
// ============================================================================

export interface SovereignOSKernel {
  version: string
  codename: string
  architecture: "11d-crsm" | "dna-lang"
  boot_sequence: BootStep[]
  services: KernelService[]
  immune_layer: ImmuneRule[]
}

export interface BootStep {
  order: number
  name: string
  description: string
  timeout_ms: number
  critical: boolean
}

export interface KernelService {
  name: string
  type: "core" | "agent" | "inference" | "sync" | "ui"
  auto_start: boolean
  depends_on: string[]
}

export interface ImmuneRule {
  name: string
  trigger: string
  condition: string
  response: string
  severity: "low" | "medium" | "high" | "critical"
}

export const SOVEREIGN_OS_KERNEL: SovereignOSKernel = {
  version: "0.1.0-alpha",
  codename: "Genesis",
  architecture: "11d-crsm",
  boot_sequence: [
    { order: 1, name: "bifurcation_mount", description: "Mount My Passport Ultra bifurcation zone", timeout_ms: 5000, critical: true },
    { order: 2, name: "coherence_restore", description: "Restore last coherence checkpoint from vault", timeout_ms: 3000, critical: true },
    { order: 3, name: "agent_memory_load", description: "Load persistent agent memory pool", timeout_ms: 10000, critical: false },
    { order: 4, name: "immune_layer_init", description: "Initialize immune system constraints", timeout_ms: 2000, critical: true },
    { order: 5, name: "intent_engine_start", description: "Start NL²-LAS intent inference engine", timeout_ms: 5000, critical: true },
    { order: 6, name: "agent_swarm_spawn", description: "Spawn initial agent swarm from DoD", timeout_ms: 15000, critical: false },
    { order: 7, name: "mesh_sync", description: "Synchronize with device mesh via bifurcation zone", timeout_ms: 10000, critical: false },
    { order: 8, name: "ui_present", description: "Present operator interface (if connected)", timeout_ms: 3000, critical: false },
  ],
  services: [
    { name: "coherence-daemon", type: "core", auto_start: true, depends_on: [] },
    { name: "intent-inference", type: "inference", auto_start: true, depends_on: ["coherence-daemon"] },
    { name: "agent-orchestrator", type: "agent", auto_start: true, depends_on: ["intent-inference"] },
    { name: "bifurcation-sync", type: "sync", auto_start: true, depends_on: ["coherence-daemon"] },
    { name: "immune-monitor", type: "core", auto_start: true, depends_on: [] },
    { name: "pcrb-ledger", type: "core", auto_start: true, depends_on: ["immune-monitor"] },
    { name: "artifact-synthesizer", type: "agent", auto_start: false, depends_on: ["agent-orchestrator"] },
    { name: "dod-validator", type: "agent", auto_start: false, depends_on: ["agent-orchestrator"] },
  ],
  immune_layer: [
    { name: "prevent_spoliation", trigger: "destructive_action", condition: "action.type === 'delete' && action.target.contains('evidence')", response: "quarantine + audit_log", severity: "critical" },
    { name: "coherence_guard", trigger: "phi_drop", condition: "phi < 0.5", response: "pause_agents + restore_checkpoint", severity: "high" },
    { name: "resource_limit", trigger: "resource_exhaustion", condition: "memory_used > 0.9 * memory_total", response: "dormant_agents + gc", severity: "medium" },
    { name: "unauthorized_access", trigger: "permission_violation", condition: "!agent.has_permission(resource)", response: "deny + log + alert", severity: "high" },
    { name: "decoherence_spike", trigger: "gamma_spike", condition: "gamma > 0.3", response: "slow_down + stabilize", severity: "medium" },
  ],
}
