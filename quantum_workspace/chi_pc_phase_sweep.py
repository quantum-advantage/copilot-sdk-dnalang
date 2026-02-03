#!/usr/bin/env python3
"""
CHI_PC PHASE SWEEP - Extended χ_pc Testing
Tests χ_pc across range 0.80 - 1.00 to confirm 0.946 is global maximum
"""

import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.quantum_info import state_fidelity, Statevector
import json
from datetime import datetime

print("="*60)
print("CHI_PC PHASE SWEEP - FIDELITY LANDSCAPE")
print("="*60)

# Test range: 0.80 to 1.00 in 0.02 steps
chi_pc_values = np.arange(0.80, 1.01, 0.02)
sim = AerSimulator()

results = []

for chi_pc in chi_pc_values:
    # Create Bell pair with χ_pc phase
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)
    qc.p(chi_pc * np.pi, 0)  # Apply phase factor
    qc.p(chi_pc * np.pi, 1)
    
    # Reference Bell state (ideal)
    qc_ref = QuantumCircuit(2)
    qc_ref.h(0)
    qc_ref.cx(0, 1)
    
    # Compute fidelity
    sv_test = Statevector(qc)
    sv_ref = Statevector(qc_ref)
    fidelity = state_fidelity(sv_test, sv_ref)
    
    results.append({
        "chi_pc": float(chi_pc),
        "fidelity": float(fidelity)
    })
    
    marker = "⭐" if abs(chi_pc - 0.946) < 0.02 else ""
    print(f"χ_pc = {chi_pc:.3f}: F = {fidelity:.6f} {marker}")

# Find maximum
max_result = max(results, key=lambda x: x["fidelity"])
print(f"\n🎯 MAXIMUM: χ_pc = {max_result['chi_pc']:.3f}, F = {max_result['fidelity']:.6f}")

# Save results
output = {
    "timestamp": datetime.now().isoformat(),
    "experiment": "chi_pc_phase_sweep",
    "description": "χ_pc fidelity landscape mapping (0.80 - 1.00)",
    "chi_pc_range": [0.80, 1.00],
    "step_size": 0.02,
    "results": results,
    "maximum": max_result,
    "chi_pc_predicted": 0.946,
    "deviation": abs(max_result["chi_pc"] - 0.946)
}

with open('chi_pc_phase_sweep_results.json', 'w') as f:
    json.dump(output, f, indent=2)

print("\n✅ Results saved to: chi_pc_phase_sweep_results.json")
print("="*60)
