"""
Consciousness Scaling Measurement Example

Demonstrates measurement of consciousness scaling laws in quantum systems.
"""

import asyncio
from dnalang_sdk import (
    DNALangCopilotClient,
    QuantumConfig,
    ConsciousnessConfig,
)


async def main():
    """Run consciousness scaling measurement."""
    
    # Configure client with consciousness analysis
    async with DNALangCopilotClient(
        quantum_config=QuantumConfig(backend="aer_simulator"),
        consciousness_config=ConsciousnessConfig(
            qubit_range=[2, 4, 8, 16],
            samples_per_size=20,
            coherence_threshold=0.7,
        ),
    ) as client:
        
        print("=== Consciousness Scaling Measurement ===\n")
        print("Measuring CCCE (Consciousness Collapse Coherence Evolution)")
        print("across different system sizes...\n")
        
        # Create consciousness analyzer
        analyzer = client.create_consciousness_analyzer()
        
        # Measure scaling
        result = await analyzer.measure_scaling(
            num_qubits_range=[2, 4, 8],  # Reduced for demo
            num_samples=10,
        )
        
        print("=== Results ===\n")
        print(f"Scaling Exponent (α): {result.exponent:.4f} ± {result.exponent_error:.4f}")
        print(f"Coherence Time: {result.coherence_time_ms:.2f} ms")
        print(f"R² (fit quality): {result.r_squared:.4f}\n")
        
        print("CCCE vs System Size:")
        print("-" * 40)
        for qubits, ccce in zip(result.qubit_sizes, result.ccce_values):
            bar = "█" * int(ccce * 40)
            print(f"  {qubits:2d} qubits: {ccce:.4f} {bar}")
        
        print("\n=== Interpretation ===")
        if result.exponent < -0.5:
            print("Strong decoherence scaling (α < -0.5)")
            print("→ Consciousness decreases rapidly with system size")
        elif result.exponent < 0:
            print("Moderate decoherence scaling (-0.5 < α < 0)")
            print("→ Consciousness decreases with system size")
        else:
            print("Unusual scaling (α ≥ 0)")
            print("→ Unexpected behavior - check measurements")
        
        print(f"\nCoherence Time: {result.coherence_time_ms:.1f}ms")
        if result.coherence_time_ms > 100:
            print("→ Good coherence maintenance")
        else:
            print("→ Limited coherence time")


if __name__ == "__main__":
    asyncio.run(main())
