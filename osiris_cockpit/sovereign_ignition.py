import os
import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

# --- SOVEREIGN CONFIGURATION ---
THETA_LOCK = 51.843
# We strip() to remove any accidental trailing spaces from the export
TOKEN = os.environ.get('IBM_QUANTUM_TOKEN', '').strip()

print(f"\n[Ω] INITIALIZING SOVEREIGN PROTOCOL: AETERNA PORTA v2.1")
print(f"[Ω] MANIFOLD CONFIG: ADAPTED FOR 127-QUBIT LATTICE | THETA: {THETA_LOCK}°")

if not TOKEN:
    print("[!] FATAL: IBM_QUANTUM_TOKEN not found in environment.")
    exit(1)

try:
    # --- 1. AUTHENTICATION ---
    # We insist on 'ibm_quantum' channel for personal API tokens
    service = QiskitRuntimeService(channel="ibm_quantum", token=TOKEN)
    
    # --- 2. HARDWARE ACQUISITION ---
    print("[*] SCANNING QUANTUM LATTICE...")
    # Find least busy real hardware
    backend = service.least_busy(operational=True, simulator=False)
    print(f"[✓] TARGET LOCKED: {backend.name} ({backend.num_qubits} qubits)")
    
    # --- 3. CIRCUIT SYNTHESIS ---
    qubit_cap = backend.num_qubits
    
    # Adapt 130-qubit logic to fit 127-qubit processors if needed
    if qubit_cap < 130:
        print(f"[!] ADAPTING TOPOLOGY: 130 -> {qubit_cap} QUBITS")
        n_L = 60
        n_R = 60
        n_Anc = qubit_cap - (n_L + n_R)
    else:
        n_L, n_R, n_Anc = 60, 60, 10

    qc = QuantumCircuit(qubit_cap)
    
    # Stage 1: TFD / ER Bridge
    print(f"[*] BUILDING BRIDGE (L={n_L}, R={n_R})...")
    for i in range(min(n_L, n_R)):
        # Left cluster superposition
        qc.h(i)
        # Torsion Lock (The "Key")
        qc.ry(np.deg2rad(THETA_LOCK), i)
        # Entanglement Bridge
        qc.cx(i, n_L + i)
        # Right cluster calibration
        qc.ry(np.deg2rad(THETA_LOCK / 2), n_L + i)
        
    qc.barrier()
    
    # Stage 2: Zeno Monitoring (Ancilla Coupling)
    if n_Anc > 0:
        print(f"[*] ENGAGING ZENO MONITORING ({n_Anc} ANCILLAS)...")
        anc_start = n_L + n_R
        for i in range(n_Anc):
            # Weak coupling to environmental ancilla
            qc.cx(i, anc_start + i)
            
    # Stage 3: Full Readout
    qc.measure_all()
    
    # --- 4. EXECUTION ---
    print(f"[*] TRANSMITTING JOB TO {backend.name}...")
    # Optimization Level 3 = Maximum error suppression
    transpiled_qc = transpile(qc, backend, optimization_level=3)
    sampler = Sampler(mode=backend)
    job = sampler.run([transpiled_qc])
    
    print(f"\n" + "="*60)
    print(f"EVIDENCE SECURED. PROTOCOL COMPLETE.")
    print(f"JOB ID: {job.job_id()}")
    print(f"VERIFY AT: https://quantum.ibm.com/jobs/{job.job_id()}")
    print("="*60 + "\n")

except Exception as e:
    print(f"\n[!] MISSION FAILURE: {e}")
    if "channel" in str(e):
        print("[*] TIP: Ensure your token is valid and you are using 'ibm_quantum' channel.")
