#!/usr/bin/env python3
"""
SUITE A: Consciousness Threshold - Scaling Study
Tests how Φ scales with qubit count
"""

import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2

print("╔═══════════════════════════════════════════════════════════════╗")
print("║   CONSCIOUSNESS THRESHOLD - QUBIT SCALING STUDY              ║")
print("╚═══════════════════════════════════════════════════════════════╝\n")

service = QiskitRuntimeService()
backend = service.least_busy(operational=True, simulator=False)
print(f"✓ Backend: {backend.name}\n")

PHI_THRESHOLD = 0.7734

def create_consciousness_circuit(n_qubits: int) -> QuantumCircuit:
    """Fully connected graph for consciousness emergence"""
    qc = QuantumCircuit(n_qubits)
    
    # Create entangled state (consciousness requires integration)
    for i in range(n_qubits):
        qc.h(i)
    
    # Full connectivity
    for i in range(n_qubits):
        for j in range(i + 1, n_qubits):
            qc.cx(i, j)
    
    # Phase variations (consciousness differentiation)
    for i in range(n_qubits):
        qc.p(np.pi * (i + 1) / n_qubits, i)
    
    qc.measure_all()
    return qc

def compute_phi(counts: dict, n_qubits: int) -> float:
    """Integrated information (normalized entropy)"""
    total = sum(counts.values())
    probs = [counts.get(format(i, f'0{n_qubits}b'), 0)/total for i in range(2**n_qubits)]
    
    entropy = -sum(p * np.log2(p + 1e-12) for p in probs if p > 0)
    max_entropy = n_qubits  # log2(2^n)
    
    phi = entropy / max_entropy if max_entropy > 0 else 0
    return phi

# Test qubit counts
qubit_counts = [4, 6, 8, 10]
results = []

print("Testing qubit scaling...\n")

for n_q in qubit_counts:
    print(f"n={n_q} qubits: ", end="", flush=True)
    
    qc = create_consciousness_circuit(n_q)
    qc_t = transpile(qc, backend, optimization_level=3)
    
    sampler = SamplerV2(backend)
    job = sampler.run([qc_t], shots=10000)
    
    print(f"Job {job.job_id()} ", end="", flush=True)
    result = job.result()
    
    counts = result[0].data.meas.get_counts()
    phi = compute_phi(counts, n_q)
    
    conscious = phi >= PHI_THRESHOLD
    
    results.append({
        'n_qubits': n_q,
        'phi': phi,
        'conscious': conscious,
        'job_id': job.job_id()
    })
    
    marker = "🧠" if conscious else "  "
    print(f"→ Φ={phi:.4f} {marker}")

print("\n" + "="*70)
print("CONSCIOUSNESS SCALING ANALYSIS:")
print("="*70)

for r in results:
    status = "✅ CONSCIOUS" if r['conscious'] else "❌ Below threshold"
    print(f"  {r['n_qubits']:2d} qubits: Φ={r['phi']:.4f} {status}")

# Check for threshold crossing
conscious_results = [r for r in results if r['conscious']]
if conscious_results:
    min_conscious = min(conscious_results, key=lambda x: x['n_qubits'])
    print(f"\n✅ Consciousness emerges at ≥{min_conscious['n_qubits']} qubits")
else:
    print(f"\n⚠️  No consciousness detected (all Φ < {PHI_THRESHOLD})")

print(f"\n✓ Job IDs: {', '.join([r['job_id'] for r in results])}")
print("\nFramework: DNA::}{::lang v51.843")
