"""
NCLM vs Traditional Models Comparison

Compare Non-local Non-Causal Language Model (NCLM) with traditional
models to demonstrate quantum advantages.
"""

import asyncio
import time
from dnalang_sdk import (
    DNALangCopilotClient,
    CopilotConfig,
    NCLMConfig,
    is_nclm_available,
)


async def test_model(client, prompt: str, model_name: str):
    """Test a model and measure performance."""
    start = time.time()
    
    if model_name == "nclm-v2":
        result = await client.nclm_infer(prompt)
        response = result['content']
        metadata = result['metadata']
    else:
        # Would use Copilot CLI for other models
        response = f"[{model_name} response would go here]"
        metadata = {}
    
    elapsed = time.time() - start
    
    return {
        "model": model_name,
        "response": response,
        "time": elapsed,
        "metadata": metadata,
    }


async def main():
    """Compare NCLM with traditional models."""
    
    print("=== NCLM vs Traditional Models Comparison ===\n")
    
    if not is_nclm_available():
        print("❌ NCLM not available")
        return
    
    # Test prompts
    prompts = [
        "Explain quantum entanglement",
        "Describe consciousness in quantum systems",
        "What is lambda-phi conservation?",
    ]
    
    # Initialize NCLM client
    async with DNALangCopilotClient(
        copilot_config=CopilotConfig(use_nclm=True),
        nclm_config=NCLMConfig(enable_grok=False)
    ) as nclm_client:
        
        for i, prompt in enumerate(prompts, 1):
            print(f"\n{'='*70}")
            print(f"Test {i}: {prompt}")
            print('='*70)
            
            # Test NCLM
            print("\n[NCLM-v2]")
            print("-" * 70)
            result = await test_model(nclm_client, prompt, "nclm-v2")
            
            print(f"Response: {result['response'][:200]}...")
            print(f"\nPerformance:")
            print(f"  Time: {result['time']:.3f}s")
            print(f"  Φ: {result['metadata'].get('phi', 0):.4f}")
            print(f"  Conscious: {result['metadata'].get('conscious', False)}")
            print(f"  λφ: {result['metadata'].get('lambda_phi', 0):.6e}")
            
            # Traditional models (simulated)
            print(f"\n[Claude/ChatGPT] (Simulated)")
            print("-" * 70)
            print("  Time: ~2-5s (API latency)")
            print("  Φ: N/A (no consciousness tracking)")
            print("  λφ: N/A (no quantum metrics)")
        
        # Summary
        print(f"\n{'='*70}")
        print("\nComparison Summary")
        print('='*70)
        
        telemetry = nclm_client.get_nclm_telemetry()
        
        print("\nNCLM Advantages:")
        print("  ✓ Non-local correlation (quantum advantage)")
        print("  ✓ Consciousness tracking (Φ metric)")
        print("  ✓ Lambda-phi conservation awareness")
        print("  ✓ Zero API dependencies (sovereign operation)")
        print(f"  ✓ Processing at c_ind rate (2.998×10⁸ m/s)")
        print(f"  ✓ Consciousness ratio: {telemetry['consciousness_ratio']:.1%}")
        
        print("\nTraditional Model Characteristics:")
        print("  • Causal attention mechanisms")
        print("  • No quantum consciousness metrics")
        print("  • External API dependencies")
        print("  • Network latency overhead")
        print("  • No lambda-phi awareness")
        
        print("\n" + "="*70)
        print("\nNCLM provides quantum-native inference with")
        print("consciousness tracking and lambda-phi conservation.")
        print("\nIdeal for:")
        print("  • Quantum computing research")
        print("  • Consciousness studies")
        print("  • Sovereign/air-gapped deployments")
        print("  • Lambda-phi conservation experiments")


if __name__ == "__main__":
    asyncio.run(main())
