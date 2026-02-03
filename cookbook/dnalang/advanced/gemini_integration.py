#!/usr/bin/env python3
"""
Gemini Model Integration Example

Demonstrates using Google's Gemini models as an alternative to Claude/ChatGPT
within the DNALang Copilot SDK. Shows basic inference, streaming, and 
integration with quantum consciousness tracking.
"""

import asyncio
import os
from dnalang_sdk import (
    GeminiModelProvider,
    GeminiConfig,
    CopilotGeminiAdapter,
    gemini_infer_simple
)


async def main():
    print("═══════════════════════════════════════════════════════════════")
    print("   Gemini Model Integration Demo")
    print("   Google AI in DNALang SDK")
    print("═══════════════════════════════════════════════════════════════\n")
    
    # Check for API key
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        print("[WARNING] No Gemini API key found!")
        print("Set GEMINI_API_KEY or GOOGLE_API_KEY environment variable")
        print()
        print("Example usage (with mock responses):\n")
        api_key = "demo-key"  # Will fail but shows structure
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 1: Simple Inference
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("[Example 1] Simple Inference")
    print("─" * 63)
    
    provider = GeminiModelProvider(api_key=api_key)
    
    prompt = "Explain quantum entanglement in simple terms"
    result = await provider.infer(prompt)
    
    print(f"Prompt: {prompt}")
    print(f"Model: {result.get('model', 'N/A')}")
    
    if "error" in result:
        print(f"Error: {result['error']}")
        print(f"Response: {result['response'][:200]}...")
    else:
        print(f"Response: {result['response'][:200]}...")
        print(f"Response Time: {result.get('response_time', 0):.2f}s")
        print(f"Tokens: {result.get('completion_tokens', 0)}")
    print()
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 2: With System Instruction
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("[Example 2] With System Instruction")
    print("─" * 63)
    
    system_instruction = """You are a quantum physics expert specializing in 
consciousness research. Explain concepts using lambda-phi conservation 
principles and CCCE (Consciousness Collapse Coherence Evolution) metrics."""
    
    prompt = "How does consciousness relate to quantum measurement?"
    result = await provider.infer(prompt, system_instruction=system_instruction)
    
    print(f"System: {system_instruction[:80]}...")
    print(f"Prompt: {prompt}")
    
    if "error" not in result:
        print(f"Response: {result['response'][:200]}...")
    else:
        print(f"Error: {result['error']}")
    print()
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 3: Streaming Response
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("[Example 3] Streaming Response")
    print("─" * 63)
    
    prompt = "Write a haiku about quantum computing"
    print(f"Prompt: {prompt}")
    print("Response (streaming): ", end="", flush=True)
    
    chunk_count = 0
    async for chunk in provider.stream_infer(prompt):
        if not chunk.startswith("[ERROR]"):
            print(chunk, end="", flush=True)
            chunk_count += 1
        else:
            print(f"\n{chunk}")
    
    print(f"\n(Received {chunk_count} chunks)")
    print()
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 4: Copilot Message Format Adapter
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("[Example 4] Copilot Message Format")
    print("─" * 63)
    
    adapter = CopilotGeminiAdapter(provider)
    
    messages = [
        {
            "role": "system",
            "content": "You are a helpful quantum computing assistant."
        },
        {
            "role": "user",
            "content": "What's a qubit?"
        }
    ]
    
    completion = await adapter.chat_completion(messages)
    
    print(f"Messages: {len(messages)}")
    
    if "choices" in completion:
        response_msg = completion["choices"][0]["message"]
        print(f"Response: {response_msg['content'][:200]}...")
        print(f"Finish Reason: {completion['choices'][0]['finish_reason']}")
        
        if "usage" in completion:
            usage = completion["usage"]
            print(f"Tokens: {usage['total_tokens']} "
                  f"(prompt: {usage['prompt_tokens']}, "
                  f"completion: {usage['completion_tokens']})")
    print()
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 5: Session Statistics
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("[Example 5] Session Statistics")
    print("─" * 63)
    
    stats = provider.get_session_stats()
    
    print(f"Model: {stats['model']}")
    print(f"Total Requests: {stats['total_requests']}")
    print(f"Total Tokens: {stats['total_tokens']}")
    print(f"Avg Response Time: {stats['avg_response_time']:.2f}s")
    print(f"Conversation Length: {stats['conversation_length']}")
    print()
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Example 6: Model Configuration
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("[Example 6] Custom Configuration")
    print("─" * 63)
    
    custom_config = GeminiConfig(
        model="gemini-2.0-flash-exp",  # Fast model
        temperature=0.9,  # More creative
        max_output_tokens=2048,
        top_p=0.95,
        top_k=40
    )
    
    provider_custom = GeminiModelProvider(config=custom_config, api_key=api_key)
    
    print(f"Model: {custom_config.model}")
    print(f"Temperature: {custom_config.temperature}")
    print(f"Max Tokens: {custom_config.max_output_tokens}")
    print(f"Top-P: {custom_config.top_p}")
    print(f"Top-K: {custom_config.top_k}")
    print()
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Summary
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    print("═══════════════════════════════════════════════════════════════")
    print("   Gemini Integration - Available Models")
    print("═══════════════════════════════════════════════════════════════")
    print()
    print("Recommended Models:")
    print("  • gemini-2.0-flash-exp - Fast, cost-effective")
    print("  • gemini-1.5-pro - Most capable, balanced")
    print("  • gemini-1.5-flash - Fastest, good for simple tasks")
    print()
    print("Setup Instructions:")
    print("  1. Get API key: https://aistudio.google.com/apikey")
    print("  2. Set environment variable:")
    print("     export GEMINI_API_KEY='your-key-here'")
    print("  3. Install library:")
    print("     pip install google-generativeai")
    print()
    print("Features:")
    print("  ✓ Chat completion with system instructions")
    print("  ✓ Streaming responses")
    print("  ✓ Conversation history tracking")
    print("  ✓ Safety settings")
    print("  ✓ Copilot message format compatibility")
    print()


if __name__ == "__main__":
    asyncio.run(main())
