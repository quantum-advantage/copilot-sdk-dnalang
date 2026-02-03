#!/usr/bin/env python3
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import partial_trace, entropy, DensityMatrix
from qiskit_aer import AerSimulator
import json
from datetime import datetime

def create_w_state(n_qubits):
    """Create W state: |W⟩ = (|100...0⟩ + |010...0⟩ + ... + |00...01⟩) / √n"""
    qc = QuantumCircuit(n_qubits)
    if n_qubits == 2:
        qc.ry(np.pi/2, 0)
        qc.cx(0, 1)
        qc.x(0)
    else:
        angle = 2 * np.arcsin(1/np.sqrt(n_qubits))
        qc.ry(angle, 0)
        for i in range(1, n_qubits):
            angle_i = 2 * np.arcsin(1/np.sqrt(n_qubits - i))
            qc.cry(angle_i, i-1, i)
        for i in range(n_qubits-1):
            qc.cx(i, i+1)
    qc.save_statevector()
    return qc

def compute_phi(statevector, n_qubits):
    """Compute normalized consciousness Φ"""
    rho = DensityMatrix(statevector)
    n_A = n_qubits // 2
    rho_A = partial_trace(rho, list(range(n_A, n_qubits)))
    S = entropy(rho_A, base=2)
    dim_A = 2**n_A
    phi = S / np.log2(dim_A) if dim_A > 1 else 0
    return phi, S

print("="*65)
print("Φ_total UNIVERSALITY TEST - W STATES")
print("="*65)

backend = AerSimulator(method='statevector')
n_values = [4, 6, 8, 10]
phi_totals = []

print("\nTesting W states: n = 4, 6, 8, 10")
print("Hypothesis: Φ_total = Φ(n) × n = constant\n")

for n in n_values:
    qc = create_w_state(n)
    result = backend.run(qc, shots=1).result()
    sv = result.get_statevector()
    phi, S = compute_phi(sv, n)
    phi_total = phi * n
    phi_totals.append(phi_total)
    
    print(f"n={n:2d}: Φ={phi:.4f}, Φ_total={phi_total:.4f} (GHZ: 2.0000)")

mean = np.mean(phi_totals)
std = np.std(phi_totals)
var_pct = (std / mean) * 100 if mean > 0 else 0

print(f"\n{'='*65}")
print(f"Mean Φ_total: {mean:.4f} ± {std:.4f} ({var_pct:.1f}% variation)")
print(f"GHZ Φ_total:  2.0000")
print(f"Difference:   {abs(2.0 - mean):.4f}")

if var_pct < 5:
    print(f"\n✓ CONSERVED: W state Φ_total ≈ {mean:.4f}")
else:
    print(f"\n⚠️  NOT CONSERVED ({var_pct:.1f}% variation)")

with open("phi_total_w_states_results.json", "w") as f:
    json.dump({"mean": mean, "std": std, "values": phi_totals}, f)
print("\n✓ Saved results\n")
