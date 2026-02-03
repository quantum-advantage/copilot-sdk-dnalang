#!/usr/bin/env python3
"""IBM Quantum Setup - Save token and test connection"""

from qiskit_ibm_runtime import QiskitRuntimeService

# Save IBM Quantum token
TOKEN = "99ezCffRM-zVWhRhJr4N3RQWLrVgZKGcJckZXEzehSQK"

print("[Ω] Saving IBM Quantum token...")
QiskitRuntimeService.save_account(channel="ibm_quantum_platform", token=TOKEN, overwrite=True)
print("[✓] Token saved successfully")

# Test connection
print("\n[Ω] Testing connection to IBM Quantum...")
service = QiskitRuntimeService(channel="ibm_quantum_platform")
backends = service.backends()

print(f"[✓] Connected! Available backends: {len(backends)}")
print("\n[BACKENDS]")
for backend in backends[:5]:  # Show first 5
    try:
        status = "ONLINE" if backend.status().operational else "OFFLINE"
    except:
        status = "UNKNOWN"
    print(f"  • {backend.name:20s} - {status}")

print("\n[Ω] Finding least busy backend...")
backend = service.least_busy(simulator=False, operational=True)
print(f"[✓] RECOMMENDED: {backend.name}")
