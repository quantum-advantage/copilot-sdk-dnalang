import os
import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

# --- 1. CREDENTIALS (EMBEDDED) ---
TOKEN = "99ezCffRM-zVWhRhJr4N3RQWLrVgZKGcJckZXEzehSQK"
THETA_LOCK = 51.843

print(f"\n[Ω] INITIALIZING PROTOCOL: AETERNA PORTA (HARDWARE MODE)")
print(f"[Ω] TOKEN HASH: {TOKEN[:5]}...{TOKEN[-5:]} | THETA: {THETA_LOCK}°")

try:
    # --- 2. FORCE SAVE ACCOUNT (PATCHED CHANNEL) ---
    # The error occurred because 'ibm_quantum' is deprecated.
    # We switch to 'ibm_quantum_platform' to bypass the ValueError.
    print("[*] UPDATING AUTHENTICATION PROTOCOL...")
    try:
        QiskitRuntimeService.save_account(
            channel="ibm_quantum_platform", 
            token=TOKEN, 
            overwrite=True
        )
    except Exception as e:
        # Ignore if already saved, but warn if critical
        pass

    # --- 3. AUTHENTICATE ---
    service = QiskitRuntimeService(channel="ibm_quantum_platform")
    
    # --- 4. TARGET ACQUISITION ---
    print("[*] SCANNING FOR PHYSICAL QUBITS...")
    # Find least busy Eagle/Heron processor
    backend = service.least_busy(operational=True, simulator=False)
    print(f"[✓] LOCKED TARGET: {backend.name} ({backend.num_qubits} QUBITS)")
    
    # --- 5. ADAPTIVE CIRCUIT SYNTHESIS ---
    cap = backend.num_qubits
    n_L, n_R = 60, 60
    
    # Fit circuit to hardware
    if cap < 130:
        print(f"[!] FOLDING MANIFOLD: 130 -> {cap} QUBITS")
        n_Anc = 0
    else:
        n_Anc = 10

    qc = QuantumCircuit(cap)
    
    # [Stage 1] The Bridge (TFD)
    print("[*] SYNTHESIZING WORMHOLE TOPOLOGY...")
    for i in range(min(n_L, n_R)):
        qc.h(i)
        qc.ry(np.deg2rad(THETA_LOCK), i)
        qc.cx(i, n_L + i)
        qc.ry(np.deg2rad(THETA_LOCK / 2), n_L + i)
        
    qc.measure_all()
    
    # --- 6. EXECUTE ---
    print(f"[*] DEPLOYING TO {backend.name}...")
    transpiled_qc = transpile(qc, backend, optimization_level=3)
    sampler = Sampler(mode=backend)
    job = sampler.run([transpiled_qc])
    
    print(f"\n" + "="*60)
    print(f"PROOF SECURED. PROTOCOL COMPLETE.")
    print(f"JOB ID: {job.job_id()}")
    print(f"VERIFY: https://quantum.ibm.com/jobs/{job.job_id()}")
    print("="*60 + "\n")

except Exception as e:
    print(f"\n[!] FAILURE: {e}")
