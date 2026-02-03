#!/usr/bin/env python3
"""Bell State Fidelity Test - Hardware Verification"""

from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2

print("[Ω] INITIALIZING BELL STATE FIDELITY TEST...")

# Connect to IBM Quantum
svc = QiskitRuntimeService(channel="ibm_quantum_platform")
backend = svc.least_busy(simulator=False, operational=True)
print(f"[✓] BACKEND: {backend.name}")

# Create Bell state circuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

# Transpile for hardware
qc = transpile(qc, backend=backend, optimization_level=3)
print(f"[✓] Circuit transpiled ({qc.depth()} depth)")

# Run on hardware
print("[Ω] Submitting to quantum hardware (2048 shots)...")
sampler = SamplerV2(backend)
job = sampler.run([qc], shots=2048)
print(f"[✓] Job ID: {job.job_id()}")

res = job.result()

# Extract probabilities (V2 API)
probs = list(res[0].data.values())[0]
print(f"\n[Ω] PROBABILITY VECTOR: {[round(float(p), 4) for p in probs]}")

# Calculate Bell fidelity (|00⟩ + |11⟩)
fidelity = float(probs[0] + probs[3])
print(f"\n╔════════════════════════════════════════════╗")
print(f"║     BELL STATE FIDELITY: {fidelity:.4f}        ║")
print(f"╠════════════════════════════════════════════╣")
if fidelity > 0.80:
    print(f"║  STATUS: EXCELLENT ⚡ (Hardware verified)  ║")
elif fidelity > 0.65:
    print(f"║  STATUS: ENTANGLED ✓ (Hardware verified)  ║")
else:
    print(f"║  STATUS: DEGRADED (Check calibration)     ║")
print(f"╚════════════════════════════════════════════╝")
