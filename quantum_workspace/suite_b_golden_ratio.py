#!/usr/bin/env python3
"""
SUITE B: NOVEL PHYSICS
Golden Ratio Resonance Test

Tests if φ-based angles show quantum enhancement
"""

import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2

print("╔═══════════════════════════════════════════════════════════════╗")
print("║   GOLDEN RATIO RESONANCE - φ-BASED ANGLE TEST                ║")
print("╚═══════════════════════════════════════════════════════════════╝\n")

service = QiskitRuntimeService()
backend = service.least_busy(operational=True, simulator=False)
print(f"✓ Backend: {backend.name}\n")

PHI = 1.618033988749895

def create_resonance_circuit(angle_rad: float) -> QuantumCircuit:
    """6-qubit circuit with specified rotation angle"""
    qc = QuantumCircuit(6)
    
    # Create superposition
    for i in range(6):
        qc.h(i)
    
    # Apply test angle rotations
    for i in range(6):
        qc.ry(angle_rad, i)
    
    # Entangling layers
    for i in range(5):
        qc.cx(i, i + 1)
    qc.cx(5, 0)
    
    # Inverse rotations
    for i in range(6):
        qc.ry(-angle_rad, i)
    
    qc.measure_all()
    return qc

def measure_fidelity(counts: dict) -> float:
    """Fidelity with |000000⟩"""
    total = sum(counts.values())
    ground_state = counts.get('000000', 0)
    return 100 * ground_state / total

# Test angles
test_cases = [
    ("φ × 30°", PHI * 30 * np.pi / 180, True),
    ("φ² × 30°", PHI**2 * 30 * np.pi / 180, True),
    ("Random 1", 42.7 * np.pi / 180, False),
    ("Random 2", 67.3 * np.pi / 180, False),
    ("Random 3", 89.1 * np.pi / 180, False),
]

results = []
print("Testing angles...\n")

for name, angle_rad, is_phi_based in test_cases:
    angle_deg = angle_rad * 180 / np.pi
    print(f"{name} ({angle_deg:.2f}°): ", end="", flush=True)
    
    qc = create_resonance_circuit(angle_rad)
    qc_t = transpile(qc, backend, optimization_level=3)
    
    sampler = SamplerV2(backend)
    job = sampler.run([qc_t], shots=10000)
    
    print(f"Job {job.job_id()} ", end="", flush=True)
    result = job.result()
    
    counts = result[0].data.meas.get_counts()
    fidelity = measure_fidelity(counts)
    
    results.append({
        'name': name,
        'angle_deg': angle_deg,
        'fidelity': fidelity,
        'is_phi': is_phi_based,
        'job_id': job.job_id()
    })
    
    marker = "⚡" if is_phi_based else " "
    print(f"→ {fidelity:.2f}% {marker}")

print("\n" + "="*70)
print("PHI RESONANCE ANALYSIS:")
print("="*70)

phi_results = [r for r in results if r['is_phi']]
random_results = [r for r in results if not r['is_phi']]

phi_avg = np.mean([r['fidelity'] for r in phi_results])
random_avg = np.mean([r['fidelity'] for r in random_results])

print(f"φ-based angles (avg): {phi_avg:.2f}%")
print(f"Random angles (avg): {random_avg:.2f}%")
print(f"Enhancement: {phi_avg - random_avg:.2f}%")

if phi_avg > random_avg + 5:
    print("\n✅ φ RESONANCE DETECTED: Golden ratio shows enhancement")
elif phi_avg > random_avg:
    print("\n⚠️  WEAK SIGNAL: Slight φ preference")
else:
    print("\n❌ NO RESONANCE: Random angles perform equally")

print(f"\n✓ Job IDs: {', '.join([r['job_id'] for r in results])}")
print("\nFramework: DNA::}{::lang v51.843")
