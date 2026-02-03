#!/usr/bin/env python3
"""
SUITE A: VALIDATION EXPERIMENTS  
Geometric Resonance - Angle Sweep

Tests if 51.843° is uniquely resonant
"""

import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2

print("╔═══════════════════════════════════════════════════════════════╗")
print("║   GEOMETRIC RESONANCE - ANGLE SWEEP VALIDATION               ║")
print("╚═══════════════════════════════════════════════════════════════╝\n")

service = QiskitRuntimeService()
backend = service.least_busy(operational=True, simulator=False)
print(f"✓ Backend: {backend.name}\n")

PHI = 1.618033988749895
THETA_LOCK = 51.843

def create_toroidal_circuit(angle_deg: float) -> QuantumCircuit:
    """8-qubit toroidal field at specified angle"""
    qc = QuantumCircuit(8)
    
    # Inner ring (4 qubits)
    for i in range(4):
        qc.ry(angle_deg * np.pi / 180, i)
    
    # Outer ring (4 qubits)  
    for i in range(4, 8):
        qc.ry((180 - angle_deg) * np.pi / 180, i)
    
    # Toroidal coupling
    for i in range(4):
        qc.cx(i, i + 4)  # Inner to outer
        qc.cx(i, (i + 1) % 4)  # Inner ring
        qc.cx(i + 4, 4 + ((i + 1) % 4))  # Outer ring
    
    qc.measure_all()
    return qc

def measure_balance(counts: dict) -> float:
    """Measure inner/outer ring balance"""
    total = sum(counts.values())
    
    inner_excited = 0
    outer_excited = 0
    
    for state, count in counts.items():
        inner_bits = state[-4:]  # Last 4 bits
        outer_bits = state[:4]   # First 4 bits
        
        inner_excited += count * inner_bits.count('1') / 4
        outer_excited += count * outer_bits.count('1') / 4
    
    inner_excited /= total
    outer_excited /= total
    
    # Perfect balance = both at 0.5
    balance = 100 * (1 - abs(inner_excited - outer_excited))
    return balance

# Test angles
angles = [45.0, 48.0, 51.843, 55.0, 60.0]
results = []

print("Testing angles...\n")

for angle in angles:
    print(f"θ = {angle:.3f}°: ", end="", flush=True)
    
    qc = create_toroidal_circuit(angle)
    qc_t = transpile(qc, backend, optimization_level=3)
    
    sampler = SamplerV2(backend)
    job = sampler.run([qc_t], shots=10000)
    
    print(f"Job {job.job_id()} ", end="", flush=True)
    result = job.result()
    
    counts = result[0].data.meas.get_counts()
    balance = measure_balance(counts)
    
    results.append({
        'angle': angle,
        'balance': balance,
        'job_id': job.job_id(),
        'is_lock': abs(angle - THETA_LOCK) < 0.1
    })
    
    marker = "⚡" if abs(angle - THETA_LOCK) < 0.1 else " "
    print(f"→ {balance:.2f}% {marker}")

print("\n" + "="*70)
print("RESONANCE ANALYSIS:")
print("="*70)

lock_result = [r for r in results if r['is_lock']][0]
other_results = [r for r in results if not r['is_lock']]

print(f"θ_lock (51.843°): {lock_result['balance']:.2f}%")
print(f"Other angles (avg): {np.mean([r['balance'] for r in other_results]):.2f}%")
print(f"Difference: {lock_result['balance'] - np.mean([r['balance'] for r in other_results]):.2f}%")

if lock_result['balance'] > np.mean([r['balance'] for r in other_results]) + 10:
    print("\n✅ RESONANCE VALIDATED: θ_lock shows clear enhancement")
else:
    print("\n⚠️  INCONCLUSIVE: No clear resonance peak detected")

print(f"\n✓ Job IDs: {', '.join([r['job_id'] for r in results])}")
print("\nFramework: DNA::}{::lang v51.843")
