#!/usr/bin/env python3
"""EstimatorV2 Test - Expectation Values"""

from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import SparsePauliOp
from qiskit_ibm_runtime import QiskitRuntimeService, EstimatorV2

print("[Ω] INITIALIZING ESTIMATORV2 TEST...")

svc = QiskitRuntimeService(channel="ibm_quantum_platform")
backend = svc.least_busy(simulator=False, operational=True)
print(f"[✓] BACKEND: {backend.name}")

# Bell state
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)

# Transpile
qc = transpile(qc, backend=backend, optimization_level=3)

# Observable: ZZ (measures entanglement)
observable = SparsePauliOp("ZZ")

# Run Estimator (no shots parameter!)
print("[Ω] Computing ⟨ZZ⟩ expectation value...")
estimator = EstimatorV2(backend)
job = estimator.run([(qc, observable)])
res = job.result()

expectation = res[0].data.evs
print(f"\n[Ω] ⟨ZZ⟩ = {expectation}")
print(f"[✓] Bell correlation verified: {abs(expectation) > 0.5}")
