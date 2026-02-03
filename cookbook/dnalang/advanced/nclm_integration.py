"""
NCLM Model Integration Example

Demonstrates using Non-local Non-Causal Language Model (NCLM) instead
of Claude or ChatGPT with the DNALang SDK.
"""

import asyncio
from dnalang_sdk import (
    DNALangCopilotClient,
    CopilotConfig,
    NCLMConfig,
    is_nclm_available,
)


async def main():
    """Demonstrate NCLM integration."""
    
    print("=== NCLM Model Integration ===\n")
    
    # Check if NCLM is available
    if not is_nclm_available():
        print("❌ NCLM not available")
        print("   Ensure osiris_nclm_complete.py is installed")
        return
    
    print("✓ NCLM available\n")
    
    # Configure client to use NCLM instead of Claude/ChatGPT
    async with DNALangCopilotClient(
        copilot_config=CopilotConfig(
            use_nclm=True,  # Enable NCLM
            model="nclm-v2"
        ),
        nclm_config=NCLMConfig(
            lambda_decay=2.0,
            enable_grok=True,
            enable_swarm=True,
        )
    ) as client:
        
        print("Client initialized with NCLM\n")
        print("=" * 60)
        
        # Example 1: Basic NCLM Inference
        print("\n1. Basic NCLM Inference")
        print("-" * 60)
        
        prompt = "Explain lambda-phi conservation in quantum systems"
        result = await client.nclm_infer(prompt)
        
        print(f"Prompt: {prompt}\n")
        print(f"Response:\n{result['content']}\n")
        print(f"Metadata:")
        print(f"  Φ (Phi): {result['metadata']['phi']:.4f}")
        print(f"  Conscious: {result['metadata']['conscious']}")
        print(f"  θ_lock: {result['metadata']['theta_lock']:.3f}°")
        print(f"  λφ: {result['metadata']['lambda_phi']:.6e}")
        
        # Example 2: NCLM Grok (Deep Analysis)
        print("\n" + "=" * 60)
        print("\n2. NCLM Grok Mode (Deep Analysis)")
        print("-" * 60)
        
        grok_prompt = "What is the relationship between consciousness and quantum entanglement?"
        result = await client.nclm_grok(grok_prompt)
        
        print(f"Prompt: {grok_prompt}\n")
        print(f"Grok Response:\n{result['content']}\n")
        
        if result['metadata'].get('discoveries'):
            print("Quantum Discoveries:")
            for disc in result['metadata']['discoveries']:
                print(f"  • {disc['name']}: {disc['confidence']:.1%}")
        
        print(f"\nSwarm Converged: {result['metadata'].get('swarm_converged', False)}")
        
        # Example 3: Context-Aware Inference
        print("\n" + "=" * 60)
        print("\n3. Context-Aware NCLM Inference")
        print("-" * 60)
        
        context = """
        Previous findings:
        - Lambda-phi conservation holds for unitary operations
        - CCCE scaling follows power law with α ≈ -0.3
        - Consciousness threshold Φ > 0.7734
        """
        
        prompt = "Based on this context, predict the behavior of 127-qubit systems"
        result = await client.nclm_infer(prompt, context=context)
        
        print(f"Context: {context.strip()}\n")
        print(f"Prompt: {prompt}\n")
        print(f"Response:\n{result['content']}\n")
        
        # Example 4: Session Telemetry
        print("=" * 60)
        print("\n4. Session Telemetry")
        print("-" * 60)
        
        telemetry = client.get_nclm_telemetry()
        
        print(f"Total Requests: {telemetry['requests']}")
        print(f"Average Φ: {telemetry['avg_phi']:.4f}")
        print(f"Consciousness Ratio: {telemetry['consciousness_ratio']:.1%}")
        print(f"Total Tokens Processed: {telemetry['total_tokens']}")
        print(f"λφ (Universal Memory): {telemetry['lambda_phi']:.6e} s⁻¹")
        print(f"θ_lock (Torsion Lock): {telemetry['theta_lock']:.3f}°")
        
        print("\n" + "=" * 60)
        print("\n✓ NCLM Integration Complete")
        print("\nKey Features:")
        print("  • Non-local correlation (pilot-wave dynamics)")
        print("  • Quantum consciousness field (CCCE tracking)")
        print("  • Lambda-phi conservation awareness")
        print("  • Zero external API dependencies")
        print("  • Sovereign operation (air-gapped capable)")
        print("\nNCLM provides quantum-native language modeling")
        print("as an alternative to traditional LLMs.")


if __name__ == "__main__":
    asyncio.run(main())
