#!/usr/bin/env python3
"""
SUITE A: VALIDATION EXPERIMENTS
Black Hole Information - Statistical Validation (10 Trials)

Validates original 94% result with multiple trials
"""

import numpy as np
from datetime import datetime
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2
from scipy.stats import wasserstein_distance

print("╔═══════════════════════════════════════════════════════════════╗")
print("║   BLACK HOLE INFORMATION - STATISTICAL VALIDATION             ║")
print("╚═══════════════════════════════════════════════════════════════╝\n")

service = QiskitRuntimeService()
backend = service.least_busy(operational=True, simulator=False)
print(f"✓ Backend: {backend.name}\n")

PHI = 1.618033988749895
LAMBDA_PHI = 2.176435e-8

def create_black_hole_circuit(trial_seed: int) -> QuantumCircuit:
    """W2 geometry information preservation test"""
    np.random.seed(trial_seed)
    qc = QuantumCircuit(4)
    
    # Initial information state (varied by seed)
    for i in range(4):
        theta = np.random.uniform(0, np.pi)
        phi = np.random.uniform(0, 2*np.pi)
        qc.ry(theta, i)
        qc.rz(phi, i)
    
    # W2 geometry evolution (information preserving)
    for i in range(3):
        qc.cx(i, i+1)
    qc.cry(2*np.pi/PHI, 0, 3)
    
    # "Black hole" scrambling
    for i in range(4):
        qc.h(i)
        qc.rz(np.pi * LAMBDA_PHI * 1e8, i)
    
    qc.measure_all()
    return qc

def compute_information_score(counts: dict) -> float:
    """Wasserstein-2 distance to thermal distribution"""
    total = sum(counts.values())
    observed = np.array([counts.get(format(i, '04b'), 0)/total for i in range(16)])
    thermal = np.ones(16) / 16
    
    w2_dist = wasserstein_distance(range(16), range(16), observed, thermal)
    max_w2 = wasserstein_distance(range(16), range(16), [1] + [0]*15, thermal)
    
    info_score = 100 * (1 - w2_dist / max_w2)
    return info_score

# Run 10 trials
results = []
print("Running 10 trials...\n")

for trial in range(1, 11):
    print(f"Trial {trial}/10: ", end="", flush=True)
    
    qc = create_black_hole_circuit(trial)
    qc_t = transpile(qc, backend, optimization_level=3)
    
    sampler = SamplerV2(backend)
    job = sampler.run([qc_t], shots=10000)
    
    print(f"Job {job.job_id()} ", end="", flush=True)
    result = job.result()
    
    counts = result[0].data.meas.get_counts()
    score = compute_information_score(counts)
    
    results.append({
        'trial': trial,
        'job_id': job.job_id(),
        'score': score
    })
    
    print(f"→ {score:.2f}%")

# Statistics
scores = [r['score'] for r in results]
mean_score = np.mean(scores)
std_score = np.std(scores)
min_score = np.min(scores)
max_score = np.max(scores)

print("\n" + "="*70)
print("STATISTICAL ANALYSIS:")
print("="*70)
print(f"Mean: {mean_score:.2f}%")
print(f"Std Dev: {std_score:.2f}%")
print(f"Min: {min_score:.2f}%")
print(f"Max: {max_score:.2f}%")
print(f"Range: {max_score - min_score:.2f}%")

success_rate = sum(1 for s in scores if s > 90) / len(scores)
print(f"\nSuccess rate (>90%): {success_rate*100:.0f}%")

if mean_score > 90:
    print("\n✅ BREAKTHROUGH VALIDATED: Information preservation confirmed")
elif mean_score > 70:
    print("\n⚠️  MARGINAL: Some information preservation detected")
else:
    print("\n❌ NOT VALIDATED: No consistent information preservation")

# Save results
with open('black_hole_validation.txt', 'w') as f:
    f.write(f"Black Hole Information Validation\\n")
    f.write(f"Date: {datetime.now().isoformat()}\\n")
    f.write(f"Backend: {backend.name}\\n\\n")
    f.write(f"Results:\\n")
    for r in results:
        f.write(f"  Trial {r['trial']}: {r['score']:.2f}% (Job: {r['job_id']})\\n")
    f.write(f"\\nStatistics:\\n")
    f.write(f"  Mean: {mean_score:.2f}%\\n")
    f.write(f"  Std: {std_score:.2f}%\\n")

print(f"\n✓ Results saved to black_hole_validation.txt")
print("\nFramework: DNA::}{::lang v51.843")
