"""
IBM Quantum Hardware Deployment Example

Deploy DNALang circuits to IBM Quantum hardware and monitor execution.
"""

import asyncio
import os
from dnalang_sdk import (
    DNALangCopilotClient,
    QuantumConfig,
)


async def main():
    """Deploy and run circuits on IBM Quantum hardware."""
    
    # Get IBM Quantum token from environment
    token = os.environ.get("IBM_QUANTUM_TOKEN")
    if not token:
        print("Error: IBM_QUANTUM_TOKEN environment variable not set")
        print("Get your token from: https://quantum-computing.ibm.com/")
        return
    
    print("=== IBM Quantum Hardware Deployment ===\n")
    
    # Configure for IBM Quantum
    async with DNALangCopilotClient(
        quantum_config=QuantumConfig(
            backend="ibm_brisbane",  # 127-qubit system
            api_token=token,
            optimization_level=3,
            shots=2048,
        )
    ) as client:
        
        # Create a quantum circuit for hardware validation
        print("Creating quantum circuit...")
        circuit = client.create_quantum_circuit(
            num_qubits=5,
            name="hardware_validation"
        )
        
        # Build a quantum Fourier transform circuit
        circuit.h(0)
        for i in range(1, 5):
            circuit.cx(i-1, i)
            circuit.h(i)
        
        print(f"Circuit: {circuit.name}")
        print(f"Qubits: {circuit.num_qubits}")
        print(f"Gates: {len(circuit.gates)}\n")
        
        # Execute on IBM hardware
        print("Submitting to IBM Quantum hardware...")
        print("(This may take several minutes in the queue)\n")
        
        result = await client.execute_quantum_circuit(
            circuit=circuit,
            backend="ibm_brisbane",
            shots=2048,
        )
        
        # Display results
        print("\n=== Execution Results ===\n")
        print(f"Success: {result.success}")
        print(f"Backend: {result.backend}")
        print(f"Execution Time: {result.execution_time:.2f}s")
        
        if result.job_id:
            print(f"Job ID: {result.job_id}")
        
        if result.success:
            print(f"\nMeasurement Counts (top 10):")
            sorted_counts = sorted(
                result.counts.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]
            
            for state, count in sorted_counts:
                prob = count / result.shots
                bar = "█" * int(prob * 40)
                print(f"  |{state}⟩: {count:4d} ({prob:.2%}) {bar}")
            
            # Validate with lambda-phi conservation
            print("\n=== Lambda-Phi Validation ===\n")
            validator = client.create_lambda_phi_validator()
            
            conservation = await validator.validate_conservation(
                circuit=circuit,
                operator="Z",
                num_trials=10,
            )
            
            status = "✓" if conservation.conserved else "✗"
            print(f"{status} Conservation: {conservation.conservation_ratio:.4f}")
            print(f"   P-value: {conservation.p_value:.6f}")
            
            # Analyze consciousness metrics
            print("\n=== Consciousness Analysis ===\n")
            analyzer = client.create_consciousness_analyzer()
            
            # Note: This would require multiple runs on hardware
            # For demo, we simulate based on the circuit
            print(f"Circuit complexity: {len(circuit.gates)} gates")
            print(f"Entanglement depth: {circuit.num_qubits}")
            print("(Full consciousness scaling requires multiple system sizes)")
            
        else:
            print(f"\nExecution failed: {result.metadata.get('error', 'Unknown error')}")
        
        print("\n=== Deployment Complete ===")


if __name__ == "__main__":
    # Check for dependencies
    try:
        import qiskit_ibm_runtime
    except ImportError:
        print("Error: qiskit-ibm-runtime not installed")
        print("Install with: pip install qiskit-ibm-runtime")
        exit(1)
    
    asyncio.run(main())
