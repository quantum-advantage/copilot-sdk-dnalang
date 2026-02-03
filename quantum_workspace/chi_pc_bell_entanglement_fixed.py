#!/usr/bin/env python3
"""
χ_pc Bell State Entanglement Witness (FIXED)
Tests if χ_pc appears in entanglement measures (concurrence, negativity)
"""

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import partial_trace, DensityMatrix, concurrence, entropy
from qiskit_aer import AerSimulator
import json
from datetime import datetime

CHI_PC = 0.946

def create_bell_with_chi_phase(chi_factor=1.0):
    """Create Bell pair with χ_pc phase modulation"""
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)
    phase = chi_factor * CHI_PC * np.pi
    qc.rz(phase, 0)
    qc.rz(phase, 1)
    qc.save_statevector()
    return qc

def compute_entanglement_measures(statevector):
    """Compute concurrence and negativity"""
    rho = DensityMatrix(statevector)
    
    # Concurrence
    C = concurrence(rho)
    
    # Negativity via partial transpose
    rho_pt = rho.partial_transpose([0])
    eigenvalues = np.linalg.eigvalsh(rho_pt.data)
    negativity = np.sum(np.abs(eigenvalues[eigenvalues < 0]))
    
    # Entanglement entropy
    rho_A = partial_trace(rho, [1])  # Fixed: use partial_trace function
    S = entropy(rho_A, base=2)
    
    return C, negativity, S

print("╔═══════════════════════════════════════════════════════════════╗")
print("║     χ_pc BELL STATE ENTANGLEMENT WITNESS (FIXED)            ║")
print("╚═══════════════════════════════════════════════════════════════╝\n")

backend = AerSimulator(method='statevector')
chi_factors = [0.0, 0.5, 0.946, 1.0, 1.5, 2.0]

print(f"Testing χ_pc phase modulation on Bell pairs")
print(f"χ_pc = {CHI_PC}")
print(f"Testing factors: {chi_factors}\n")

results = {
    "timestamp": datetime.now().isoformat(),
    "chi_pc": CHI_PC,
    "test_type": "entanglement_witness",
    "trials": []
}

print(f"{'Factor':<10} {'Phase (rad)':<12} {'Concurrence':<14} {'Negativity':<14} {'Entropy':<10}")
print(f"{'='*70}")

for chi_factor in chi_factors:
    qc = create_bell_with_chi_phase(chi_factor)
    result = backend.run(qc, shots=1).result()
    sv = result.get_statevector()
    
    C, neg, S = compute_entanglement_measures(sv)
    
    phase = chi_factor * CHI_PC * np.pi
    print(f"{chi_factor:<10.3f} {phase:<12.4f} {C:<14.6f} {neg:<14.6f} {S:<10.6f}")
    
    results["trials"].append({
        "chi_factor": chi_factor,
        "phase_rad": phase,
        "concurrence": C,
        "negativity": neg,
        "entropy": S
    })

print(f"\n{'='*70}")
print("ANALYSIS:")
print(f"{'='*70}")

# Check for χ_pc signature
chi_pc_idx = chi_factors.index(0.946)
C_chi = results["trials"][chi_pc_idx]["concurrence"]
neg_chi = results["trials"][chi_pc_idx]["negativity"]
S_chi = results["trials"][chi_pc_idx]["entropy"]

C_baseline = results["trials"][0]["concurrence"]
neg_baseline = results["trials"][0]["negativity"]

print(f"\nBaseline (no phase):")
print(f"  Concurrence:  {C_baseline:.6f}")
print(f"  Negativity:   {neg_baseline:.6f}")

print(f"\nAt χ_pc = {CHI_PC}:")
print(f"  Concurrence:  {C_chi:.6f}")
print(f"  Negativity:   {neg_chi:.6f}")
print(f"  Entropy:      {S_chi:.6f}")

delta_C = abs(C_chi - C_baseline)
delta_neg = abs(neg_chi - neg_baseline)

if delta_C > 0.01 or delta_neg > 0.01:
    print(f"\n✓ χ_pc SIGNATURE DETECTED!")
    print(f"  ΔConcurrence: {delta_C:.6f}")
    print(f"  ΔNegativity:  {delta_neg:.6f}")
    status = "DETECTED"
else:
    print(f"\n⚠️  No significant χ_pc signature in entanglement measures")
    status = "NOT_DETECTED"

results["summary"] = {
    "chi_pc_concurrence": C_chi,
    "chi_pc_negativity": neg_chi,
    "chi_pc_entropy": S_chi,
    "baseline_concurrence": C_baseline,
    "baseline_negativity": neg_baseline,
    "delta_concurrence": delta_C,
    "delta_negativity": delta_neg,
    "status": status
}

with open("chi_pc_bell_entanglement_results.json", "w") as f:
    json.dump(results, f, indent=2)

print(f"\n✓ Results saved to chi_pc_bell_entanglement_results.json\n")
