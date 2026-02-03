"""
Lambda-Phi Conservation Validation Example

Demonstrates validation of lambda-phi conservation laws in quantum circuits.
"""

import asyncio
from dnalang_sdk import (
    DNALangCopilotClient,
    QuantumConfig,
    LambdaPhiConfig,
)


async def main():
    """Run lambda-phi conservation validation."""
    
    # Configure client with lambda-phi validation
    async with DNALangCopilotClient(
        quantum_config=QuantumConfig(backend="aer_simulator"),
        lambda_phi_config=LambdaPhiConfig(
            num_trials=100,
            significance_level=0.05,
            operators=["X", "Y", "Z"],
        ),
    ) as client:
        
        print("=== Lambda-Phi Conservation Validation ===\n")
        
        # Create a unitary circuit (should conserve lambda-phi)
        circuit = client.create_quantum_circuit(num_qubits=3, name="conservation_test")
        circuit.h(0)
        circuit.cx(0, 1)
        circuit.cx(1, 2)
        circuit.h(2)
        
        print(f"Testing circuit: {circuit.name}")
        print(f"Gates: {len(circuit.gates)}\n")
        
        # Create validator
        validator = client.create_lambda_phi_validator()
        
        # Test conservation for different operators
        for operator in ["X", "Y", "Z"]:
            print(f"Testing {operator} operator conservation...")
            
            result = await validator.validate_conservation(
                circuit=circuit,
                operator=operator,
                num_trials=50,
            )
            
            status = "✓ CONSERVED" if result.conserved else "✗ NOT CONSERVED"
            print(f"  {status}")
            print(f"  Conservation Ratio: {result.conservation_ratio:.4f}")
            print(f"  P-value: {result.p_value:.6f}")
            print(f"  Mean Expectation: {result.mean_expectation:.4f} ± {result.std_expectation:.4f}")
            print()
        
        print("\n=== Lambda-Phi Validation Complete ===")
        print("Unitary circuits should conserve quantum operators.")


if __name__ == "__main__":
    asyncio.run(main())
