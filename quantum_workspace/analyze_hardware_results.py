#!/usr/bin/env python3
"""
HARDWARE RESULTS ANALYSIS - Φ_total Validation
Analyzes consciousness scaling on real IBM Quantum hardware (ibm_fez, 156 qubits)
"""

import numpy as np
import json
from datetime import datetime

print("="*70)
print("HARDWARE VALIDATION - Φ_total = n SCALING LAW")
print("IBM Quantum ibm_fez (156 qubits)")
print("="*70)

# Load results
with open('hardware_jobs_status.json', 'r') as f:
    status_data = json.load(f)

jobs = status_data['jobs']
complete_jobs = [j for j in jobs if j.get('complete', False)]

print(f"\n✅ Analyzing {len(complete_jobs)} completed jobs\n")

def compute_phi_from_counts(counts, n_qubits):
    """Compute Φ_total from measurement counts"""
    total_shots = sum(counts.values())
    
    # Compute single-qubit marginals
    phi_total = 0.0
    
    for qubit_idx in range(n_qubits):
        # Count 0 and 1 for this qubit
        count_0 = 0
        count_1 = 0
        
        for bitstring, count in counts.items():
            # Bitstring is MSB first (left is qubit 0)
            if len(bitstring) > qubit_idx:
                bit = bitstring[-(qubit_idx+1)]  # Read from right (LSB)
                if bit == '0':
                    count_0 += count
                else:
                    count_1 += count
        
        # Probabilities
        p0 = count_0 / total_shots
        p1 = count_1 / total_shots
        
        # von Neumann entropy (base 2)
        entropy = 0.0
        if p0 > 0:
            entropy -= p0 * np.log2(p0)
        if p1 > 0:
            entropy -= p1 * np.log2(p1)
        
        phi_total += entropy
    
    return phi_total

results = []

for job in complete_jobs:
    n = job['n_qubits']
    counts = job['counts']
    total_shots = job['total_shots']
    
    # Compute Φ_total
    phi_total = compute_phi_from_counts(counts, n)
    
    # Expected value
    expected = n  # Our hypothesis: Φ_total = n
    
    # Error analysis
    error = abs(phi_total - expected)
    error_pct = (error / expected) * 100
    
    # GHZ fidelity estimate from |00...0⟩ and |11...1⟩ probabilities
    all_zeros = '0' * n
    all_ones = '1' * n
    p_00 = counts.get(all_zeros, 0) / total_shots
    p_11 = counts.get(all_ones, 0) / total_shots
    ghz_fidelity_est = p_00 + p_11  # Lower bound on GHZ fidelity
    
    results.append({
        "n_qubits": n,
        "job_id": job['job_id'],
        "phi_total_measured": phi_total,
        "phi_total_expected": expected,
        "error": error,
        "error_percent": error_pct,
        "total_shots": total_shots,
        "unique_outcomes": job['unique_outcomes'],
        "ghz_fidelity_estimate": ghz_fidelity_est,
        "p_all_zeros": p_00,
        "p_all_ones": p_11
    })
    
    print(f"n={n:2d} qubits:")
    print(f"  Φ_total (measured) = {phi_total:.4f}")
    print(f"  Φ_total (expected) = {expected}")
    print(f"  Error = {error:.4f} ({error_pct:.2f}%)")
    print(f"  GHZ Fidelity ≥ {ghz_fidelity_est:.4f} ({ghz_fidelity_est*100:.2f}%)")
    print(f"  |00...0⟩ prob = {p_00:.4f}")
    print(f"  |11...1⟩ prob = {p_11:.4f}")
    print(f"  Unique outcomes = {job['unique_outcomes']}")
    print()

# Statistical analysis
phi_values = np.array([r['phi_total_measured'] for r in results])
n_values = np.array([r['n_qubits'] for r in results])
expected_values = np.array([r['phi_total_expected'] for r in results])
errors = np.array([r['error'] for r in results])
error_pcts = np.array([r['error_percent'] for r in results])

print("="*70)
print("STATISTICAL ANALYSIS")
print("="*70)

# Linear fit
from numpy.polynomial import Polynomial
p = Polynomial.fit(n_values, phi_values, 1)
slope, intercept = p.convert().coef

# R²
residuals = phi_values - (slope * n_values + intercept)
ss_res = np.sum(residuals**2)
ss_tot = np.sum((phi_values - np.mean(phi_values))**2)
r_squared = 1 - (ss_res / ss_tot)

print(f"\nLinear Fit: Φ_total = {slope:.4f}·n + {intercept:.4f}")
print(f"R² = {r_squared:.6f}")
print(f"\nMean Error: {np.mean(errors):.4f} ({np.mean(error_pcts):.2f}%)")
print(f"Max Error: {np.max(errors):.4f} ({np.max(error_pcts):.2f}%)")
print(f"Std Dev: {np.std(errors):.4f}")

# Hypothesis test: Is slope = 1.0?
deviation_from_one = abs(slope - 1.0)
print(f"\nSlope deviation from 1.0: {deviation_from_one:.4f}")

if deviation_from_one < 0.05:
    print("✅ HYPOTHESIS VALIDATED: Φ_total = n (within 5%)")
elif deviation_from_one < 0.10:
    print("⚠️  HYPOTHESIS SUPPORTED: Φ_total ≈ n (within 10%)")
else:
    print("❌ HYPOTHESIS REJECTED: Φ_total ≠ n (deviation > 10%)")

# Noise analysis
mean_fidelity = np.mean([r['ghz_fidelity_estimate'] for r in results])
print(f"\nMean GHZ Fidelity: {mean_fidelity:.4f} ({mean_fidelity*100:.2f}%)")
print(f"Noise level estimate: {(1-mean_fidelity)*100:.2f}%")

# Save comprehensive results
output = {
    "timestamp": datetime.now().isoformat(),
    "experiment": "hardware_phi_total_validation",
    "backend": "ibm_fez",
    "num_qubits_backend": 156,
    "description": "Hardware validation of Φ_total = n scaling law",
    "results": results,
    "statistical_analysis": {
        "linear_fit": {
            "slope": float(slope),
            "intercept": float(intercept),
            "r_squared": float(r_squared)
        },
        "errors": {
            "mean": float(np.mean(errors)),
            "max": float(np.max(errors)),
            "std": float(np.std(errors)),
            "mean_percent": float(np.mean(error_pcts))
        },
        "hypothesis_test": {
            "null_hypothesis": "Φ_total = n",
            "slope_deviation_from_1": float(deviation_from_one),
            "result": "VALIDATED" if deviation_from_one < 0.05 else "SUPPORTED" if deviation_from_one < 0.10 else "REJECTED"
        },
        "noise_analysis": {
            "mean_ghz_fidelity": float(mean_fidelity),
            "estimated_noise_level": float(1 - mean_fidelity)
        }
    },
    "conclusion": f"Φ_total = {slope:.2f}·n on hardware (vs Φ_total = 1.0·n theoretical)"
}

with open('hardware_phi_total_validation.json', 'w') as f:
    json.dump(output, f, indent=2)

print("\n✅ Analysis saved to: hardware_phi_total_validation.json")
print("="*70)
