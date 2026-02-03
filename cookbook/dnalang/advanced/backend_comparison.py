"""
Multi-Backend Comparison Example

Compare quantum circuit execution across different backends.
"""

import asyncio
import time
from dnalang_sdk import (
    DNALangCopilotClient,
    QuantumConfig,
)


async def run_on_backend(client, circuit, backend_name, shots=1024):
    """Run circuit on specified backend and return results."""
    start = time.time()
    
    try:
        result = await client.execute_quantum_circuit(
            circuit=circuit,
            backend=backend_name,
            shots=shots,
        )
        elapsed = time.time() - start
        
        return {
            "backend": backend_name,
            "success": result.success,
            "execution_time": elapsed,
            "counts": result.counts,
            "shots": result.shots,
        }
    except Exception as e:
        return {
            "backend": backend_name,
            "success": False,
            "error": str(e),
            "execution_time": time.time() - start,
        }


async def main():
    """Compare backends for quantum execution."""
    
    print("=== Multi-Backend Comparison ===\n")
    
    # Create client
    async with DNALangCopilotClient(
        quantum_config=QuantumConfig()
    ) as client:
        
        # Create test circuit (GHZ state)
        circuit = client.create_quantum_circuit(num_qubits=4, name="ghz_4")
        circuit.h(0)
        for i in range(1, 4):
            circuit.cx(0, i)
        
        print(f"Test Circuit: {circuit.name}")
        print(f"Qubits: {circuit.num_qubits}")
        print(f"Gates: {len(circuit.gates)}\n")
        
        # List of backends to compare
        backends = [
            "aer_simulator",           # Local simulator (fast)
            # "ibm_brisbane",          # IBM 127-qubit (requires token)
            # "ibm_kyoto",             # IBM 127-qubit (requires token)
        ]
        
        print("Running on backends...\n")
        
        # Run on all backends
        results = []
        for backend in backends:
            print(f"Testing {backend}...")
            result = await run_on_backend(client, circuit, backend, shots=1024)
            results.append(result)
            
            if result["success"]:
                print(f"  ✓ Success ({result['execution_time']:.2f}s)")
            else:
                print(f"  ✗ Failed: {result.get('error', 'Unknown')}")
        
        # Compare results
        print("\n=== Comparison ===\n")
        
        print("Performance:")
        print("-" * 60)
        for r in results:
            if r["success"]:
                print(f"  {r['backend']:20s}: {r['execution_time']:6.2f}s")
        
        print("\nMeasurement Statistics:")
        print("-" * 60)
        for r in results:
            if r["success"] and "counts" in r:
                # Expected states for GHZ: |0000⟩ and |1111⟩
                all_zeros = '0' * 4
                all_ones = '1' * 4
                
                counts = r["counts"]
                total = sum(counts.values())
                
                prob_zeros = counts.get(all_zeros, 0) / total
                prob_ones = counts.get(all_ones, 0) / total
                coherence = prob_zeros + prob_ones
                
                print(f"\n  {r['backend']}:")
                print(f"    |0000⟩: {prob_zeros:.1%}")
                print(f"    |1111⟩: {prob_ones:.1%}")
                print(f"    Coherence: {coherence:.1%}")
        
        # Lambda-phi validation across backends
        print("\n=== Lambda-Phi Conservation ===\n")
        
        validator = client.create_lambda_phi_validator()
        
        for backend in ["aer_simulator"]:  # Only simulator for demo
            print(f"Validating on {backend}...")
            
            # Temporarily set backend
            client.quantum_config.default_backend = backend
            
            result = await validator.validate_conservation(
                circuit=circuit,
                operator="Z",
                num_trials=20,
            )
            
            status = "✓ CONSERVED" if result.conserved else "✗ NOT CONSERVED"
            print(f"  {status}")
            print(f"  Ratio: {result.conservation_ratio:.4f}")
        
        print("\n=== Analysis Complete ===")
        print("\nRecommendations:")
        print("• Use aer_simulator for fast prototyping")
        print("• Use IBM hardware for validation and publication")
        print("• Monitor coherence metrics for noise characterization")


if __name__ == "__main__":
    asyncio.run(main())
