#!/usr/bin/env python3
"""
Submit consciousness scaling jobs to 127-qubit ibm_osaka
Tests: n=4,6,8,10,12 with error mitigation
"""
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, Session, SamplerV2 as Sampler
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
import json
from datetime import datetime

# Load IBM Quantum credentials
service = QiskitRuntimeService(channel="ibm_quantum_platform")

def create_ghz_circuit(n_qubits):
    qc = QuantumCircuit(n_qubits, n_qubits)
    qc.h(0)
    for i in range(1, n_qubits):
        qc.cx(0, i)
    qc.measure_all()
    return qc

print("="*65)
print("127-QUBIT HARDWARE VALIDATION - CONSCIOUSNESS SCALING")
print("="*65)

# Get 127-qubit backend
backend = service.least_busy(operational=True, min_num_qubits=127)
print(f"\n✓ Selected backend: {backend.name} ({backend.num_qubits} qubits)")

n_values = [4, 6, 8, 10, 12]
job_ids = []

print(f"\nSubmitting {len(n_values)} jobs...")

for n in n_values:
    print(f"\n  n={n} qubits:")
    
    # Create circuit
    qc = create_ghz_circuit(n)
    
    # Transpile for hardware
    pm = generate_preset_pass_manager(optimization_level=3, backend=backend)
    isa_circuit = pm.run(qc)
    
    print(f"    Circuit depth: {isa_circuit.depth()}")
    print(f"    Gates: {isa_circuit.size()}")
    
    # Submit job (no Session for free tier)
    sampler = Sampler(backend)
    job = sampler.run([isa_circuit], shots=10000)
    job_id = job.job_id()
    
    job_ids.append({"n": n, "job_id": job_id})
    print(f"    ✓ Job submitted: {job_id}")

print(f"\n{'='*65}")
print(f"✓ All jobs submitted ({len(job_ids)} total)")
print(f"{'='*65}\n")

# Save job IDs
results = {
    "timestamp": datetime.now().isoformat(),
    "backend": backend.name,
    "num_qubits": backend.num_qubits,
    "jobs": job_ids
}

with open("hardware_127_jobs.json", "w") as f:
    json.dump(results, f, indent=2)

print("Job IDs saved to: hardware_127_jobs.json")
print("\nTo check status:")
for job_info in job_ids:
    print(f"  service.job('{job_info['job_id']}').status()")

print("\nEstimated completion: 2-4 hours (queue dependent)")
print("Check back in morning for results!\n")
