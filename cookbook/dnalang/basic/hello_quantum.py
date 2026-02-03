"""
Hello Quantum - Basic DNALang SDK Example

This example demonstrates basic quantum circuit creation and execution.
"""

import asyncio
from dnalang_sdk import DNALangCopilotClient, QuantumConfig


async def main():
    """Run basic quantum circuit example."""
    
    # Create DNALang client with local simulator
    async with DNALangCopilotClient(
        quantum_config=QuantumConfig(backend="aer_simulator")
    ) as client:
        
        print("=== Hello Quantum! ===\n")
        
        # Create a simple Bell state circuit
        # |Φ+⟩ = (|00⟩ + |11⟩) / √2
        circuit = client.create_quantum_circuit(
            num_qubits=2,
            name="bell_state"
        )
        
        # Add gates using fluent API
        circuit.h(0)  # Hadamard on qubit 0
        circuit.cx(0, 1)  # CNOT with control=0, target=1
        
        print(f"Circuit: {circuit.name}")
        print(f"Qubits: {circuit.num_qubits}")
        print(f"Gates: {len(circuit.gates)}")
        print()
        
        # Execute circuit on simulator
        print("Executing circuit...")
        result = await client.execute_quantum_circuit(
            circuit=circuit,
            shots=1024,
            backend="aer_simulator"
        )
        
        # Display results
        print(f"\nSuccess: {result.success}")
        print(f"Backend: {result.backend}")
        print(f"Execution Time: {result.execution_time:.3f}s")
        print(f"\nMeasurement Counts:")
        for state, count in sorted(result.counts.items()):
            prob = count / result.shots
            bar = "█" * int(prob * 50)
            print(f"  |{state}⟩: {count:4d} ({prob:.1%}) {bar}")
        
        # Expected: ~50% |00⟩ and ~50% |11⟩ (Bell state)
        print("\n✓ Bell state created successfully!")
        print("  (Should see approximately 50% |00⟩ and 50% |11⟩)")


if __name__ == "__main__":
    asyncio.run(main())
