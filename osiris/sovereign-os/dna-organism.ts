/**
 * DNALang Organism Runtime
 * 
 * The biological computing paradigm for SovereignOS.
 * Genes = skills/tools, Agents = expressed phenotypes, Immune layer = constraint enforcement
 */

// ============================================================================
// GENE DEFINITIONS (Skills/Tools)
// ============================================================================

export interface Gene {
  id: string
  name: string
  inputs: string[]
  outputs: string[]
  fitness_function: string
  expression_cost: number
  mutations: GeneMutation[]
}

export interface GeneMutation {
  trigger: string
  transformation: string
  fitness_delta: number
}

export const CORE_GENOME: Gene[] = [
  {
    id: "gene-intent-inference",
    name: "intent_inference",
    inputs: ["signal_stream", "context_vector"],
    outputs: ["intent_hypothesis", "confidence_score"],
    fitness_function: "accuracy(predicted_intent, actual_outcome)",
    expression_cost: 0.3,
    mutations: [
      { trigger: "low_accuracy", transformation: "expand_signal_types", fitness_delta: 0.1 },
      { trigger: "high_latency", transformation: "prune_signal_processing", fitness_delta: -0.05 },
    ],
  },
  {
    id: "gene-code-synthesis",
    name: "code_synthesis",
    inputs: ["intent_vector", "language_spec", "context"],
    outputs: ["artifact.code", "test_suite"],
    fitness_function: "compile_success * test_pass_rate * coherence_score",
    expression_cost: 0.7,
    mutations: [
      { trigger: "compile_failure", transformation: "increase_type_checking", fitness_delta: 0.15 },
      { trigger: "test_failure", transformation: "expand_edge_cases", fitness_delta: 0.1 },
    ],
  },
  {
    id: "gene-document-synthesis",
    name: "document_synthesis",
    inputs: ["intent_vector", "format_spec", "evidence_refs"],
    outputs: ["artifact.document", "citation_graph"],
    fitness_function: "completeness * accuracy * legal_compliance",
    expression_cost: 0.5,
    mutations: [
      { trigger: "incomplete_coverage", transformation: "expand_research", fitness_delta: 0.1 },
      { trigger: "citation_missing", transformation: "deepen_sourcing", fitness_delta: 0.2 },
    ],
  },
  {
    id: "gene-coherence-maintenance",
    name: "coherence_maintenance",
    inputs: ["manifold_state", "target_phi", "target_lambda"],
    outputs: ["control_signal", "stability_report"],
    fitness_function: "phi_proximity * lambda_stability * gamma_suppression",
    expression_cost: 0.2,
    mutations: [
      { trigger: "phi_drop", transformation: "increase_checkpoint_frequency", fitness_delta: 0.05 },
      { trigger: "gamma_spike", transformation: "activate_damping", fitness_delta: 0.1 },
    ],
  },
  {
    id: "gene-mesh-sync",
    name: "mesh_synchronization",
    inputs: ["device_states", "bifurcation_path"],
    outputs: ["sync_delta", "conflict_resolution"],
    fitness_function: "sync_completeness * latency_inverse * conflict_resolution_rate",
    expression_cost: 0.4,
    mutations: [
      { trigger: "sync_conflict", transformation: "enable_crdt", fitness_delta: 0.15 },
      { trigger: "high_latency", transformation: "delta_compression", fitness_delta: 0.1 },
    ],
  },
  {
    id: "gene-dod-validation",
    name: "dod_validation",
    inputs: ["artifact", "dod_predicates"],
    outputs: ["validation_result", "gap_analysis"],
    fitness_function: "predicate_satisfaction_rate * completeness",
    expression_cost: 0.3,
    mutations: [
      { trigger: "predicate_failure", transformation: "suggest_remediation", fitness_delta: 0.2 },
    ],
  },
  {
    id: "gene-security-audit",
    name: "security_audit",
    inputs: ["action_stream", "policy_set"],
    outputs: ["audit_log", "violation_alerts"],
    fitness_function: "detection_rate * false_positive_inverse",
    expression_cost: 0.25,
    mutations: [
      { trigger: "missed_violation", transformation: "expand_pattern_matching", fitness_delta: 0.3 },
    ],
  },
]

// ============================================================================
// AGENT DEFINITIONS (Expressed Phenotypes)
// ============================================================================

export interface Agent {
  id: string
  name: string
  expresses: string[] // Gene IDs
  constraints: string[]
  memory_mb: number
  priority: number
  state: AgentState
  phenotype: AgentPhenotype
}

export type AgentState = "dormant" | "spawning" | "active" | "paused" | "terminating"

export interface AgentPhenotype {
  response_latency_ms: number
  accuracy_score: number
  resource_efficiency: number
  cooperation_score: number
}

export const CORE_AGENTS: Agent[] = [
  {
    id: "agent-intent-deducer",
    name: "IntentDeducerAgent",
    expresses: ["gene-intent-inference"],
    constraints: ["no_raw_data_storage", "privacy_preserving"],
    memory_mb: 256,
    priority: 10,
    state: "active",
    phenotype: {
      response_latency_ms: 50,
      accuracy_score: 0.85,
      resource_efficiency: 0.9,
      cooperation_score: 0.95,
    },
  },
  {
    id: "agent-coder",
    name: "CoderAgent",
    expresses: ["gene-code-synthesis", "gene-dod-validation"],
    constraints: ["sandboxed_execution", "no_network_without_approval"],
    memory_mb: 1024,
    priority: 8,
    state: "dormant",
    phenotype: {
      response_latency_ms: 2000,
      accuracy_score: 0.92,
      resource_efficiency: 0.7,
      cooperation_score: 0.88,
    },
  },
  {
    id: "agent-writer",
    name: "WriterAgent",
    expresses: ["gene-document-synthesis"],
    constraints: ["evidence_citation_required", "no_fabrication"],
    memory_mb: 512,
    priority: 7,
    state: "dormant",
    phenotype: {
      response_latency_ms: 1500,
      accuracy_score: 0.88,
      resource_efficiency: 0.8,
      cooperation_score: 0.9,
    },
  },
  {
    id: "agent-coherence-guardian",
    name: "CoherenceGuardianAgent",
    expresses: ["gene-coherence-maintenance"],
    constraints: ["always_active", "minimal_interference"],
    memory_mb: 128,
    priority: 10,
    state: "active",
    phenotype: {
      response_latency_ms: 10,
      accuracy_score: 0.98,
      resource_efficiency: 0.95,
      cooperation_score: 1.0,
    },
  },
  {
    id: "agent-mesh-syncer",
    name: "MeshSyncAgent",
    expresses: ["gene-mesh-sync"],
    constraints: ["bifurcation_zone_only", "encrypted_transfer"],
    memory_mb: 256,
    priority: 9,
    state: "active",
    phenotype: {
      response_latency_ms: 100,
      accuracy_score: 0.99,
      resource_efficiency: 0.85,
      cooperation_score: 0.95,
    },
  },
  {
    id: "agent-dod-validator",
    name: "DoDValidatorAgent",
    expresses: ["gene-dod-validation"],
    constraints: ["read_only_artifacts", "no_modification"],
    memory_mb: 256,
    priority: 6,
    state: "dormant",
    phenotype: {
      response_latency_ms: 500,
      accuracy_score: 0.95,
      resource_efficiency: 0.9,
      cooperation_score: 0.92,
    },
  },
  {
    id: "agent-security-sentinel",
    name: "SecuritySentinelAgent",
    expresses: ["gene-security-audit"],
    constraints: ["immutable_logs", "no_log_deletion"],
    memory_mb: 192,
    priority: 10,
    state: "active",
    phenotype: {
      response_latency_ms: 5,
      accuracy_score: 0.97,
      resource_efficiency: 0.92,
      cooperation_score: 1.0,
    },
  },
]

// ============================================================================
// SWARM FORMATION (DoD-Driven)
// ============================================================================

export interface SwarmFormation {
  id: string
  goal: string
  agents: string[]
  dod_predicates: DoDPredicate[]
  state: SwarmState
  formation_time: number
  completion_time?: number
}

export type SwarmState = "forming" | "executing" | "validating" | "complete" | "failed"

export interface DoDPredicate {
  id: string
  description: string
  check: string
  satisfied: boolean
}

/**
 * Form an optimal agent swarm for a given goal
 * A* = argmin_A (|A| + Γ(A))
 * Minimize swarm size while minimizing friction
 */
export function formSwarm(
  goal: string,
  requiredCompetencies: string[],
  availableAgents: Agent[]
): SwarmFormation {
  // Find agents that can cover the required competencies
  const selectedAgents: Agent[] = []
  const coveredCompetencies = new Set<string>()
  
  // Greedy selection by priority and coverage
  const sortedAgents = [...availableAgents].sort((a, b) => b.priority - a.priority)
  
  for (const agent of sortedAgents) {
    const agentCompetencies = agent.expresses
    const newCoverage = agentCompetencies.filter(c => 
      requiredCompetencies.some(req => c.includes(req)) && !coveredCompetencies.has(c)
    )
    
    if (newCoverage.length > 0) {
      selectedAgents.push(agent)
      for (const comp of newCoverage) {
        coveredCompetencies.add(comp)
      }
    }
    
    // Check if all competencies covered
    if (requiredCompetencies.every(req => 
      Array.from(coveredCompetencies).some(c => c.includes(req))
    )) {
      break
    }
  }
  
  // Generate DoD predicates for the goal
  const dodPredicates = generateDoDPredicates(goal)
  
  return {
    id: `swarm-${Date.now()}`,
    goal,
    agents: selectedAgents.map(a => a.id),
    dod_predicates: dodPredicates,
    state: "forming",
    formation_time: Date.now(),
  }
}

function generateDoDPredicates(goal: string): DoDPredicate[] {
  // Generate standard DoD predicates based on goal type
  const predicates: DoDPredicate[] = [
    {
      id: "dod-artifact-exists",
      description: "Primary artifact has been created",
      check: "artifact !== null && artifact.content.length > 0",
      satisfied: false,
    },
    {
      id: "dod-validation-passed",
      description: "Artifact passes validation checks",
      check: "validator.validate(artifact).success === true",
      satisfied: false,
    },
    {
      id: "dod-coherence-maintained",
      description: "System coherence above threshold during execution",
      check: "min(phi_history) >= 0.7 && max(gamma_history) < 0.3",
      satisfied: false,
    },
    {
      id: "dod-no-regressions",
      description: "No existing functionality broken",
      check: "regression_tests.all_pass === true",
      satisfied: false,
    },
  ]
  
  // Add goal-specific predicates
  if (goal.toLowerCase().includes("code")) {
    predicates.push({
      id: "dod-code-compiles",
      description: "Generated code compiles without errors",
      check: "compiler.compile(artifact).errors.length === 0",
      satisfied: false,
    })
    predicates.push({
      id: "dod-tests-pass",
      description: "All generated tests pass",
      check: "test_runner.run(artifact.tests).failures === 0",
      satisfied: false,
    })
  }
  
  if (goal.toLowerCase().includes("document")) {
    predicates.push({
      id: "dod-citations-valid",
      description: "All citations are valid and verifiable",
      check: "citation_validator.validate(artifact.citations).all_valid === true",
      satisfied: false,
    })
  }
  
  return predicates
}

// ============================================================================
// ORGANISM RUNTIME
// ============================================================================

export interface OrganismRuntime {
  genome: Gene[]
  agents: Agent[]
  active_swarms: SwarmFormation[]
  coherence_state: CoherenceState
  immune_active: boolean
  uptime_ms: number
}

export interface CoherenceState {
  phi: number
  lambda: number
  gamma: number
  xi: number
  checkpoint_id: string
}

export class DNALangOrganism {
  private runtime: OrganismRuntime
  
  constructor() {
    this.runtime = {
      genome: [...CORE_GENOME],
      agents: [...CORE_AGENTS],
      active_swarms: [],
      coherence_state: {
        phi: 0.7734,
        lambda: 0.95,
        gamma: 0.15,
        xi: 0.42,
        checkpoint_id: `checkpoint-${Date.now()}`,
      },
      immune_active: true,
      uptime_ms: 0,
    }
  }
  
  /**
   * Express a gene (activate its functionality)
   */
  expressGene(geneId: string): boolean {
    const gene = this.runtime.genome.find(g => g.id === geneId)
    if (!gene) return false
    
    // Check if expression cost is affordable
    const currentLoad = this.calculateLoad()
    if (currentLoad + gene.expression_cost > 1.0) {
      console.log(`[Organism] Cannot express ${geneId}: load would exceed 1.0`)
      return false
    }
    
    console.log(`[Organism] Expressing gene: ${gene.name}`)
    return true
  }
  
  /**
   * Spawn an agent (bring from dormant to active)
   */
  spawnAgent(agentId: string): boolean {
    const agent = this.runtime.agents.find(a => a.id === agentId)
    if (!agent) return false
    
    if (agent.state !== "dormant") {
      console.log(`[Organism] Agent ${agentId} is not dormant, current state: ${agent.state}`)
      return false
    }
    
    agent.state = "spawning"
    
    // Simulate spawn delay
    setTimeout(() => {
      agent.state = "active"
      console.log(`[Organism] Agent ${agent.name} is now active`)
    }, 100)
    
    return true
  }
  
  /**
   * Form a swarm for a goal
   */
  formSwarmForGoal(goal: string, competencies: string[]): SwarmFormation {
    const swarm = formSwarm(goal, competencies, this.runtime.agents)
    this.runtime.active_swarms.push(swarm)
    
    // Spawn required agents
    for (const agentId of swarm.agents) {
      this.spawnAgent(agentId)
    }
    
    return swarm
  }
  
  /**
   * Check if all DoD predicates are satisfied for a swarm
   */
  validateSwarm(swarmId: string): boolean {
    const swarm = this.runtime.active_swarms.find(s => s.id === swarmId)
    if (!swarm) return false
    
    return swarm.dod_predicates.every(p => p.satisfied)
  }
  
  /**
   * Get current system load
   */
  private calculateLoad(): number {
    const activeAgents = this.runtime.agents.filter(a => a.state === "active")
    const totalMemory = activeAgents.reduce((sum, a) => sum + a.memory_mb, 0)
    const maxMemory = 4096 // Assume 4GB max
    return totalMemory / maxMemory
  }
  
  /**
   * Get organism status
   */
  getStatus(): OrganismRuntime {
    return { ...this.runtime }
  }
  
  /**
   * Update coherence state
   */
  updateCoherence(phi: number, lambda: number, gamma: number, xi: number): void {
    this.runtime.coherence_state = {
      phi,
      lambda,
      gamma,
      xi,
      checkpoint_id: `checkpoint-${Date.now()}`,
    }
    
    // Trigger immune response if needed
    if (phi < 0.5 || gamma > 0.3) {
      this.triggerImmuneResponse("coherence_violation")
    }
  }
  
  /**
   * Trigger immune response
   */
  private triggerImmuneResponse(trigger: string): void {
    console.log(`[Organism] Immune response triggered: ${trigger}`)
    
    if (trigger === "coherence_violation") {
      // Pause non-essential agents
      for (const agent of this.runtime.agents) {
        if (agent.priority < 8 && agent.state === "active") {
          agent.state = "paused"
          console.log(`[Organism] Paused agent: ${agent.name}`)
        }
      }
    }
  }
}

// Export singleton instance
export const organism = new DNALangOrganism()
