#!/usr/bin/env python3
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, state_fidelity
from qiskit_aer import AerSimulator
import json
from datetime import datetime

THETA_LOCK = 51.843 * np.pi / 180

def create_test_circuit(n_qubits, theta):
    qc = QuantumCircuit(n_qubits)
    qc.h(0)
    for i in range(1, n_qubits):
        qc.cx(0, i)
    for i in range(n_qubits):
        qc.ry(theta, i)
    qc.save_statevector()
    return qc

print("="*65)
print("θ_lock FINE-GRAINED RESOLUTION TEST")
print("="*65)

n_qubits = 5
angles_deg = np.arange(48, 55.5, 0.5)
backend = AerSimulator(method='statevector')

print(f"\nTesting {len(angles_deg)} angles: {angles_deg[0]}° to {angles_deg[-1]}°")
print(f"Resolution: 0.5°\nExpected: θ_lock = 51.843°\n")

ref_circuit = create_test_circuit(n_qubits, THETA_LOCK)
ref_result = backend.run(ref_circuit, shots=1).result()
ref_sv = ref_result.get_statevector()

fidelities = []
for angle_deg in angles_deg:
    angle_rad = angle_deg * np.pi / 180
    test_circuit = create_test_circuit(n_qubits, angle_rad)
    result = backend.run(test_circuit, shots=1).result()
    sv = result.get_statevector()
    fidelity = state_fidelity(sv, ref_sv)
    fidelities.append(fidelity)
    if angle_deg % 1.0 == 0:
        print(f"θ = {angle_deg:5.1f}° → F = {fidelity:.6f}")

peak_idx = np.argmax(fidelities)
peak_angle = angles_deg[peak_idx]
peak_fidelity = fidelities[peak_idx]
error_deg = abs(peak_angle - 51.843)

print(f"\n{'='*65}")
print(f"Peak: θ = {peak_angle:.1f}° (F = {peak_fidelity:.6f})")
print(f"θ_lock = 51.843°")
print(f"Error: Δθ = {error_deg:.1f}°")

if error_deg <= 0.5:
    print(f"\n✓ CONFIRMED: θ_lock = 51.843° ± 0.5°")
else:
    print(f"\n⚠️  Peak at {peak_angle}°")

with open("theta_lock_fine_scan_results.json", "w") as f:
    json.dump({"peak_angle": peak_angle, "error_deg": error_deg, "peak_fidelity": peak_fidelity}, f)
print("\n✓ Saved results\n")
