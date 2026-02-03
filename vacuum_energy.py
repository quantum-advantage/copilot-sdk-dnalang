#!/usr/bin/env python3
"""
Vacuum Energy Extraction at θ_lock - HIGH RISK/HIGH REWARD
Tests if circuits at θ_lock extract energy from vacuum fluctuations
"""
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Operator
from qiskit_aer import AerSimulator
import json

THETA_LOCK = 51.843 * np.pi / 180

def create_circuit_at_angle(n_qubits, theta):
    qc = QuantumCircuit(n_qubits)
    qc.h(0)
    for i in range(1, n_qubits):
        qc.cx(0, i)
    for i in range(n_qubits):
        qc.ry(theta, i)
    qc.save_statevector()
    return qc

def compute_energy(statevector, n_qubits):
    """Compute <H> where H = sum of Pauli Z on each qubit"""
    H = np.zeros((2**n_qubits, 2**n_qubits))
    for i in range(n_qubits):
        Z_i = 1
        for j in range(n_qubits):
            if j == i:
                Z_i = np.kron(Z_i, np.array([[1, 0], [0, -1]]))
            else:
                Z_i = np.kron(Z_i, np.eye(2))
        H += Z_i
    
    psi = statevector.data
    energy = np.real(np.dot(np.conj(psi), np.dot(H, psi)))
    return energy

print("="*65)
print("VACUUM ENERGY EXTRACTION TEST - HIGH RISK")
print("="*65)

n_qubits = 4
backend = AerSimulator(method='statevector')

# Test θ_lock vs control angles
angles = [0, 30, THETA_LOCK*180/np.pi, 60, 90]
energies = []

print(f"\nTesting vacuum energy at different rotation angles (n={n_qubits})")
print(f"Hamiltonian: H = sum(Z_i)\n")

for angle_deg in angles:
    angle_rad = angle_deg * np.pi / 180
    qc = create_circuit_at_angle(n_qubits, angle_rad)
    result = backend.run(qc, shots=1).result()
    sv = result.get_statevector()
    energy = compute_energy(sv, n_qubits)
    energies.append(energy)
    
    marker = " ← θ_lock" if abs(angle_deg - 51.843) < 0.1 else ""
    print(f"θ = {angle_deg:6.2f}° → ⟨H⟩ = {energy:+.6f}{marker}")

# Find minimum energy
min_idx = np.argmin(energies)
min_angle = angles[min_idx]
min_energy = energies[min_idx]

print(f"\n{'='*65}")
print(f"Minimum energy: ⟨H⟩ = {min_energy:+.6f} at θ = {min_angle:.2f}°")

theta_lock_energy = energies[2]
if min_energy < -3.5:
    print("\n⚠️  Negative energy detected (below ground state)")
    if abs(min_angle - 51.843) < 1.0:
        print("🌟 BREAKTHROUGH: Vacuum energy extraction at θ_lock!")
        status = "DETECTED"
    else:
        print(f"   But minimum at θ = {min_angle:.2f}°, not θ_lock")
        status = "NEGATIVE_ELSEWHERE"
else:
    print(f"\n✓ No anomalous vacuum coupling detected")
    print(f"   θ_lock energy: {theta_lock_energy:+.6f} (expected range)")
    status = "NOMINAL"

with open("vacuum_energy_results.json", "w") as f:
    json.dump({"angles": angles, "energies": energies, "min_energy": min_energy,
               "min_angle": min_angle, "theta_lock_energy": theta_lock_energy, 
               "status": status}, f)
print("\n✓ Saved results\n")
