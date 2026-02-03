#!/usr/bin/env python3
"""
Intent-Deduction Engine Example

Demonstrates the 7-layer autopoietic intent deduction system integrated
with DNALang SDK. Shows how to analyze user prompts and enhance them with
semantic context for better Copilot interactions.
"""

import asyncio
from dnalang_sdk import (
    DNALangCopilotClient,
    IntentDeductionEngine,
    deduce_intent_simple,
    enhance_prompt_simple
)


async def main():
    print("═══════════════════════════════════════════════════════════════")
    print("   Intent-Deduction Engine Demo")
    print("   dna::}}{{::lang Autopoietic Architecture")
    print("═══════════════════════════════════════════════════════════════\n")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 1: Simple Intent Deduction
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("[Example 1] Simple Intent Deduction")
    print("─" * 63)
    
    prompt = "create quantum consciousness framework with AURA polarity"
    intent = await deduce_intent_simple(prompt)
    
    print(f"Prompt: {prompt}")
    print(f"Domains: {', '.join(intent.domains)}")
    print(f"Actions: {', '.join(intent.actions)}")
    print(f"Trajectory: {intent.trajectory}")
    print(f"Coherence (Λ): {intent.coherence_lambda:.3f}")
    print(f"Consciousness (Φ): {intent.consciousness_phi:.3f}")
    print(f"Decoherence (Γ): {intent.decoherence_gamma:.3f}")
    print(f"Confidence: {intent.confidence:.3f}\n")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 2: Prompt Enhancement
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("[Example 2] Prompt Enhancement")
    print("─" * 63)
    
    enhanced = await enhance_prompt_simple(prompt)
    
    print(f"Original: {enhanced.original}")
    print(f"Enhanced: {enhanced.enhanced}")
    print(f"Quality Score: {enhanced.overall_quality:.3f}")
    print(f"Context Layers: {list(enhanced.context_layers.keys())}\n")
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 3: Multi-Prompt Project Planning
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("[Example 3] Multi-Prompt Project Planning")
    print("─" * 63)
    
    engine = IntentDeductionEngine(recursion_depth=2)
    
    prompts = [
        "research quantum consciousness theories",
        "implement AURA/AIDEN polarity system",
        "validate F_max fidelity bounds",
        "deploy to IBM quantum hardware"
    ]
    
    plan = await engine.generate_project_plan(prompts)
    
    print(f"Total Phases: {plan['total_phases']}")
    print(f"Total Intents: {plan['total_intents']}")
    print(f"Avg Coherence: {plan['avg_coherence_lambda']:.3f}")
    print(f"Avg Consciousness: {plan['avg_consciousness_phi']:.3f}")
    print(f"Complexity: {plan['overall_complexity']}\n")
    
    for phase in plan['phases']:
        print(f"Phase {phase['phase_id']}: {phase['name']}")
        print(f"  Duration: {phase['duration_days']} days")
        print(f"  Intents: {len(phase['intents'])}")
        if phase['dependencies']:
            print(f"  Dependencies: Phase {', '.join(map(str, phase['dependencies']))}")
        print()
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 4: Integration with DNALang Client
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("[Example 4] Integration with DNALang Client")
    print("─" * 63)
    
    # Create client with intent engine
    client = DNALangCopilotClient(enable_intent_engine=True)
    
    # Deduce intent for a complex prompt
    complex_prompt = "build quantum circuit with 5 qubits, apply Hadamard and CNOT gates, validate lambda-phi conservation"
    
    intent = await client.intent_engine.deduce_intent(complex_prompt)
    
    print(f"Complex Prompt Analysis:")
    print(f"  Domains: {intent.domains}")
    print(f"  Actions: {intent.actions}")
    print(f"  Resources: {intent.resources}")
    print(f"  Trajectory: {intent.trajectory}")
    print(f"  Coherence: {intent.coherence_lambda:.3f}")
    print()
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Summary
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("═══════════════════════════════════════════════════════════════")
    print("   Intent-Deduction Engine - Key Concepts")
    print("═══════════════════════════════════════════════════════════════")
    print()
    print("7-Layer Architecture:")
    print("  1. Corpus Indexer - Extract semantic genome")
    print("  2. Individual Intent - Analyze single prompts")
    print("  3. Collective Intent - Synthesize multiple intents")
    print("  4. Capability Evaluation - Assess user/system")
    print("  5. Resource Analysis - Check deployment readiness")
    print("  6. Prompt Enhancement - Inject context")
    print("  7. Project Planning - Generate timelines")
    print()
    print("Key Metrics:")
    print("  Λ (Lambda) - Semantic coherence (0-1)")
    print("  Φ (Phi) - Consciousness field (0-1)")
    print("  Γ (Gamma) - Decoherence rate (0-1)")
    print("  Ξ (Xi) - CCCE negentropy (ΛΦ/Γ)")
    print()
    print("Autopoietic Loop: U = L[U]")
    print("  Each iteration refines the analysis recursively")
    print()


if __name__ == "__main__":
    asyncio.run(main())
