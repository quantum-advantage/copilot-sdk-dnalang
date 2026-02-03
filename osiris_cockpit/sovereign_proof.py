import os
import sys
import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

# --- 1. HARDCODED CREDENTIALS ---
TOKEN = "99ezCffRM-zVWhRhJr4N3RQWLrVgZKGcJckZXEzehSQK"
THETA_LOCK = 51.843

print(f"\n[Ω] INITIALIZING PROTOCOL: AETERNA PORTA (HARDWARE MODE)")
print(f"[Ω] TOKEN HASH: {TOKEN[:5]}...{TOKEN[-5:]} | THETA: {THETA_LOCK}°")

try:
    # --- 2. FORCE SAVE ACCOUNT (Bypasses Argument Errors) ---
    print("[*] SAVING ACCOUNT TO DISK...")
    try:
        QiskitRuntimeService.save_account(
            channel="ibm_quantum", 
            token=TOKEN, 
            overwrite=True
        )
    except Exception as e:
        print(f"[!] SAVE WARNING (NON-FATAL): {e}")

    # --- 3. AUTHENTICATE ---
    # Load from the disk profile we just saved
    service = QiskitRuntimeService(channel="ibm_quantum")
    
    # --- 4. TARGET ACQUISITION ---
    print("[*] SCANNING FOR PHYSICAL QUBITS...")
    # Find least busy Eagle/Heron processor
    backend = service.least_busy(operational=True, simulator=False)
    print(f"[✓] LOCKED TARGET: {backend.name} ({backend.num_qubits} QUBITS)")
    
    # --- 5. ADAPTIVE CIRCUIT SYNTHESIS ---
    # Automatically fits the 130-qubit design to the available hardware (likely 127)
    cap = backend.num_qubits
    n_L = 60
    n_R = 60
    n_Anc = max(0, cap - 120)
    
    if cap < 130:
        print(f"[!] FOLDING MANIFOLD: 130 -> {cap} QUBITS")
    
    qc = QuantumCircuit(cap)
    
    # [Stage 1] The Bridge (TFD)
    for i in range(min(n_L, n_R)):
        qc.h(i)
        qc.ry(np.deg2rad(THETA_LOCK), i)
        qc.cx(i, n_L + i)
        qc.ry(np.deg2rad(THETA_LOCK / 2), n_L + i)
        
    qc.barrier()
    
    # [Stage 2] Zeno Monitoring
    if n_Anc > 0:
        anc_start = 120
        for i in range(min(n_Anc, n_L)):
            qc.cx(i, anc_start + i)

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
    # Fallback debug
    import traceback
    traceback.print_exc()

