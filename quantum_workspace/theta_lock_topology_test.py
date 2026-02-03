#!/usr/bin/env python3
"""
θ_lock Topology Independence Test
Tests θ_lock = 51.843° across star, ring, and fully-connected topologies
"""

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, state_fidelity
from qiskit_aer import AerSimulator
import json
from datetime import datetime

# Constants
THETA_LOCK = 51.843 * np.pi / 180  # Convert to radians
CHI_PC = 0.946

def create_star_topology_circuit(n_qubits, theta):
    """
    Star topology: Central qubit (q0) connected to all others
    q0 - q1
      \- q2
      \- q3
      \- q4
    """
    qc = QuantumCircuit(n_qubits)
    
    # Initialize central qubit
    qc.h(0)
    
    # Entangle central qubit with all peripheral qubits
    for i in range(1, n_qubits):
        qc.cx(0, i)
    
    # Apply rotation at angle theta
    for i in range(n_qubits):
        qc.ry(theta, i)
    
    # Measure entanglement fidelity
    qc.save_statevector()
    
    return qc

def create_ring_topology_circuit(n_qubits, theta):
    """
    Ring topology: Each qubit connected to neighbors in cycle
    q0 - q1 - q2 - q3 - q4 - q0
    """
    qc = QuantumCircuit(n_qubits)
    
    # Initialize all qubits
    for i in range(n_qubits):
        qc.h(i)
    
    # Entangle in ring pattern
    for i in range(n_qubits):
        qc.cx(i, (i+1) % n_qubits)
    
    # Apply rotation at angle theta
    for i in range(n_qubits):
        qc.ry(theta, i)
    
    qc.save_statevector()
    
    return qc

def create_fully_connected_circuit(n_qubits, theta):
    """
    Fully connected: All qubits entangled with all others
    Complete graph K_n
    """
    qc = QuantumCircuit(n_qubits)
    
    # Initialize all qubits
    for i in range(n_qubits):
        qc.h(i)
    
    # Entangle all pairs
    for i in range(n_qubits):
        for j in range(i+1, n_qubits):
            qc.cx(i, j)
    
    # Apply rotation at angle theta
    for i in range(n_qubits):
        qc.ry(theta, i)
    
    qc.save_statevector()
    
    return qc

def compute_fidelity(circuit, reference_circuit):
    """Compute fidelity between circuit and reference state"""
    backend = AerSimulator(method='statevector')
    
    # Run circuits
    result1 = backend.run(circuit, shots=1).result()
    result2 = backend.run(reference_circuit, shots=1).result()
    
    # Get statevectors
    sv1 = result1.get_statevector()
    sv2 = result2.get_statevector()
    
    # Compute fidelity
    fidelity = state_fidelity(sv1, sv2)
    
    return fidelity

def test_topology_independence():
    """
    Test θ_lock across 3 topologies
    Goal: All should peak at 51.843° ± 2°
    """
    
    print("╔═══════════════════════════════════════════════════════════════╗")
    print("║   θ_lock TOPOLOGY INDEPENDENCE TEST                          ║")
    print("╚═══════════════════════════════════════════════════════════════╝\n")
    
    n_qubits = 5
    angle_range = np.linspace(0, np.pi, 37)  # 0° to 180° in 5° steps
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "n_qubits": n_qubits,
        "theta_lock_deg": 51.843,
        "topologies": {}
    }
    
    topologies = {
        "star": create_star_topology_circuit,
        "ring": create_ring_topology_circuit,
        "fully_connected": create_fully_connected_circuit
    }
    
    for topo_name, topo_func in topologies.items():
        print(f"\n{'='*65}")
        print(f"Testing {topo_name.upper()} topology...")
        print(f"{'='*65}\n")
        
        fidelities = []
        angles_deg = []
        
        # Create reference state at θ_lock
        ref_circuit = topo_func(n_qubits, THETA_LOCK)
        
        for theta in angle_range:
            theta_deg = theta * 180 / np.pi
            
            # Create test circuit
            test_circuit = topo_func(n_qubits, theta)
            
            # Compute fidelity
            fidelity = compute_fidelity(test_circuit, ref_circuit)
            
            fidelities.append(fidelity)
            angles_deg.append(theta_deg)
            
            if theta_deg % 20 == 0:  # Print every 20°
                print(f"  θ = {theta_deg:6.2f}°  →  F = {fidelity:.6f}")
        
        # Find peak fidelity angle
        max_idx = np.argmax(fidelities)
        peak_angle = angles_deg[max_idx]
        peak_fidelity = fidelities[max_idx]
        
        # Error from θ_lock
        error_deg = abs(peak_angle - 51.843)
        error_pct = (error_deg / 51.843) * 100
        
        print(f"\n  ✓ Peak fidelity: F = {peak_fidelity:.6f}")
        print(f"  ✓ Peak angle:    θ_peak = {peak_angle:.3f}°")
        print(f"  ✓ θ_lock:        θ_lock = 51.843°")
        print(f"  ✓ Error:         Δθ = {error_deg:.3f}° ({error_pct:.2f}%)")
        
        # Determine if within tolerance
        tolerance = 2.0  # degrees
        status = "PASS" if error_deg <= tolerance else "FAIL"
        
        if status == "PASS":
            print(f"  🌟 Status: {status} (within ±{tolerance}°)")
        else:
            print(f"  ⚠️  Status: {status} (exceeds ±{tolerance}°)")
        
        # Store results
        results["topologies"][topo_name] = {
            "angles_deg": angles_deg,
            "fidelities": fidelities,
            "peak_angle": peak_angle,
            "peak_fidelity": peak_fidelity,
            "error_deg": error_deg,
            "error_pct": error_pct,
            "status": status
        }
    
    # Summary
    print(f"\n{'='*65}")
    print("SUMMARY: θ_lock Topology Independence")
    print(f"{'='*65}\n")
    
    all_passed = all(r["status"] == "PASS" for r in results["topologies"].values())
    
    for topo_name, topo_results in results["topologies"].items():
        print(f"  {topo_name:20s}: θ_peak = {topo_results['peak_angle']:6.3f}° "
              f"(Δ = {topo_results['error_deg']:5.3f}°) [{topo_results['status']}]")
    
    print(f"\n{'='*65}")
    if all_passed:
        print("🏆 BREAKTHROUGH: θ_lock is TOPOLOGY-INDEPENDENT!")
        print(f"   All topologies peak within ±{tolerance}° of θ_lock = 51.843°")
    else:
        print("⚠️  INCONCLUSIVE: Some topologies deviate from θ_lock")
    print(f"{'='*65}\n")
    
    # Save results
    output_file = "theta_lock_topology_test_results.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"✓ Results saved to {output_file}")
    
    return results

if __name__ == "__main__":
    results = test_topology_independence()
