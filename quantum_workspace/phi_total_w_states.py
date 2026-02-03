#!/usr/bin/env python3
"""
Φ_total Universality Test - W States
Tests if Φ_total is conserved for W states (not just GHZ)
"""

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import partial_trace, entropy, Statevector
from qiskit_aer import AerSimulator
import json
from datetime import datetime

def create_w_state(n_qubits):
    """Create W state: |W⟩ = (|100...0⟩ + |010...0⟩ + ... + |00...01⟩) / √n"""
    qc = QuantumCircuit(n_qubits)
    
    # W state construction via controlled rotations
    if n_qubits == 2:
        # |W_2⟩ = (|01⟩ + |10⟩) / √2
        qc.ry(np.pi/2, 0)
        qc.cx(0, 1)
        qc.x(0)
    else:
        # General W state construction
        angle = 2 * np.arcsin(1/np.sqrt(n_qubits))
        qc.ry(angle, 0)
        
        for i in range(1, n_qubits):
            angle_i = 2 * np.arcsin(1/np.sqrt(n_qubits - i))
            qc.cry(angle_i, i-1, i)
        
        # Apply X gates in cascade to distribute excitation
        for i in range(n_qubits-1):
            qc.cx(i, i+1)
    
    qc.save_statevector()
    return qc

def compute_phi(statevector, n_qubits):
    """Compute normalized consciousness Φ"""
    rho = statevector.to_operator()
    
    # Bipartite split
    n_A = n_qubits // 2
    n_B = n_qubits - n_A
    
    # Trace out subsystem B
    rho_A = partial_trace(rho, list(range(n_A, n_qubits)))
    
    # Compute entropy
    S = entropy(rho_A, base=2)
    
    # Normalize
    dim_A = 2**n_A
    phi = S / np.log2(dim_A) if dim_A > 1 else 0
    
    return phi, S

print("╔═══════════════════════════════════════════════════════════════╗")
print("║         Φ_total UNIVERSALITY TEST - W STATES                ║")
print("╚═══════════════════════════════════════════════════════════════╝\n")

backend = AerSimulator(method='statevector')
n_values = [4, 6, 8, 10]

print("Testing W states for n = 4, 6, 8, 10 qubits")
print("Hypothesis: Φ_total = Φ(n) × n = constant\n")

results = {
    "timestamp": datetime.now().isoformat(),
    "state_type": "W_state",
    "hypothesis": "Phi_total = Phi(n) * n = constant",
    "trials": []
}

phi_totals = []

for n in n_values:
    print(f"{'='*65}")
    print(f"n = {n} qubits")
    print(f"{'='*65}")
    
    # Create W state
    qc = create_w_state(n)
    result = backend.run(qc, shots=1).result()
    sv = result.get_statevector()
    
    # Compute consciousness
    phi, S = compute_phi(sv, n)
    phi_total = phi * n
    phi_totals.append(phi_total)
    
    print(f"  Entropy S:           {S:.6f} bits")
    print(f"  Consciousness Φ(n):  {phi:.6f}")
    print(f"  Total Φ_total:       {phi_total:.6f}")
    print(f"  GHZ comparison:      {2.0:.6f} (GHZ Φ_total)")
    print()
    
    results["trials"].append({
        "n": n,
        "entropy": S,
        "phi": phi,
        "phi_total": phi_total
    })

# Analyze conservation
mean_phi_total = np.mean(phi_totals)
std_phi_total = np.std(phi_totals)
variation = (std_phi_total / mean_phi_total) * 100 if mean_phi_total > 0 else 0

print(f"{'='*65}")
print("ANALYSIS:")
print(f"{'='*65}")
print(f"Φ_total values: {[f'{pt:.4f}' for pt in phi_totals]}")
print(f"Mean Φ_total:   {mean_phi_total:.6f}")
print(f"Std Dev:        {std_phi_total:.6f}")
print(f"Variation:      {variation:.2f}%")
print()

if variation < 5:
    print(f"✓ CONSERVED: Φ_total is constant for W states!")
    print(f"  W state Φ_total ≈ {mean_phi_total:.4f}")
    print(f"  (Note: Different from GHZ Φ_total = 2.0)")
    status = "CONSERVED"
else:
    print(f"⚠️  NOT CONSERVED: Φ_total varies by {variation:.1f}%")
    status = "NOT_CONSERVED"

# Compare to GHZ
print(f"\nCOMPARISON TO GHZ:")
print(f"  GHZ Φ_total:   2.0000")
print(f"  W Φ_total:     {mean_phi_total:.4f}")
print(f"  Difference:    {abs(2.0 - mean_phi_total):.4f}")
print()

results["summary"] = {
    "mean_phi_total": mean_phi_total,
    "std_phi_total": std_phi_total,
    "variation_pct": variation,
    "status": status,
    "ghz_phi_total": 2.0,
    "difference_from_ghz": abs(2.0 - mean_phi_total)
}

with open("phi_total_w_states_results.json", "w") as f:
    json.dump(results, f, indent=2)

print(f"✓ Results saved to phi_total_w_states_results.json\n")
