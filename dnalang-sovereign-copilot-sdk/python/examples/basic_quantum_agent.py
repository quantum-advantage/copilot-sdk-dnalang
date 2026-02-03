#!/usr/bin/env python3
"""
Basic Sovereign Agent Example
Demonstrates token-free quantum-enhanced AI
"""

import asyncio
from copilot_quantum import SovereignAgent


async def main():
    print("🚀 Dnalang Sovereign Copilot SDK - Basic Example\n")
    
    # Initialize agent (no tokens needed!)
    agent = SovereignAgent(
        enable_lambda_phi=True,  # Physical constants
        enable_nclm=False,  # Coming soon
        copilot_mode="local"  # Fully offline
    )
    
    print("\n" + "="*70)
    print(" Example 1: Classical Task (No Quantum)")
    print("="*70)
    
    result1 = await agent.execute(
        "Explain how to optimize Python code for performance"
    )
    print(result1.output)
    
    print("\n" + "="*70)
    print(" Example 2: Quantum Task (Aeterna Porta)")
    print("="*70)
    
    result2 = await agent.execute(
        "Execute a quantum circuit to demonstrate ER=EPR entanglement bridge",
        use_quantum=True,
        quantum_params={
            'circuit_type': 'ignition',
            'qubits': 120,
            'shots': 100000
        }
    )
    print(result2.output)
    
    if result2.quantum_metrics:
        phi = result2.quantum_metrics['phi']
        gamma = result2.quantum_metrics['gamma']
        
        if result2.quantum_metrics['above_threshold']:
            print("\n🎯 SUCCESS: ER=EPR threshold crossed!")
            print(f"   Φ = {phi:.4f} > 0.7734 threshold")
        
        if result2.quantum_metrics['is_coherent']:
            print(f"✅ System is coherent: Γ = {gamma:.4f} < 0.3")
    
    print("\n" + "="*70)
    print(" Agent Statistics")
    print("="*70)
    
    stats = agent.get_stats()
    print(f"  Total executions: {stats['total_executions']}")
    print(f"  Success rate: {stats['success_rate']*100:.1f}%")
    print(f"  Quantum executions: {stats['with_quantum']}")
    print(f"  Avg execution time: {stats['avg_execution_time_s']:.2f}s")
    
    quantum_summary = agent.get_quantum_summary()
    if quantum_summary and quantum_summary['total_jobs'] > 0:
        print(f"\n⚛️  Quantum Backend Summary:")
        print(f"  Total quantum jobs: {quantum_summary['total_jobs']}")
        print(f"  Average Φ: {quantum_summary['avg_phi']:.4f}")
        print(f"  Average Γ: {quantum_summary['avg_gamma']:.4f}")
        print(f"  Threshold crossings: {quantum_summary['threshold_crossings']}")


if __name__ == "__main__":
    asyncio.run(main())
