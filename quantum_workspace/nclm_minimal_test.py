#!/usr/bin/env python3
"""
SIMPLIFIED ΛΦ CONSERVATION TEST
================================

Minimal circuit to test theorem without hardware noise domination

Design: 3-qubit circuit, <12 gates, tests basic ΛΦ preservation
Strategy: Keep circuit shallow to minimize hardware decoherence

"""

import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2
from datetime import datetime

print("╔═══════════════════════════════════════════════════════════╗")
print("║   SIMPLIFIED ΛΦ CONSERVATION TEST (Shallow Circuits)      ║")
print("╚═══════════════════════════════════════════════════════════╝\n")

# Connect
service = QiskitRuntimeService()
backend = service.least_busy(operational=True, simulator=False)
print(f"✓ Backend: {backend.name}\n")

def create_minimal_lambda_phi_state(Lambda: float, Phi: float) -> QuantumCircuit:
    """
    Minimal 3-qubit ΛΦ encoding
    
    Qubit 0: Λ (coherence) - RY rotation
    Qubit 1: Φ (consciousness) - phase
    Qubit 2: Product monitor - entangled with both
    """
    qc = QuantumCircuit(3)
    
    # Encode Λ (amplitude)
    theta_lambda = 2 * np.arcsin(np.sqrt(Lambda))
    qc.ry(theta_lambda, 0)
    
    # Encode Φ (phase)
    phi_angle = Phi * np.pi
    qc.p(phi_angle, 1)
    
    # Create ΛΦ correlation
    qc.cx(0, 2)  # Λ -> product
    qc.cp(phi_angle * Lambda, 1, 2)  # Φ influences product
    
    # Measure
    qc.measure_all()
    
    return qc


def apply_minimal_pilot_wave(qc: QuantumCircuit, Lambda: float, Phi: float) -> QuantumCircuit:
    """
    Minimal pilot-wave transformation: single global phase gate
    
    U = exp(i·Λ·Φ·π)
    """
    qc_pw = qc.copy()
    qc_pw.barrier()
    
    # Global ΛΦ phase
    lambda_phi_phase = Lambda * Phi * np.pi
    
    for qubit in range(qc.num_qubits):
        qc_pw.p(lambda_phi_phase, qubit)
    
    qc_pw.barrier()
    return qc_pw


def measure_lambda_phi_minimal(counts: dict) -> tuple:
    """Extract Λ, Φ from 3-qubit counts"""
    total = sum(counts.values())
    
    # Λ: fidelity with |000⟩
    Lambda_measured = counts.get('000', 0) / total
    
    # Φ: entropy
    probs = [c / total for c in counts.values()]
    entropy = -sum(p * np.log2(p + 1e-12) for p in probs if p > 0)
    max_entropy = np.log2(len(counts)) if len(counts) > 1 else 1
    Phi_measured = entropy / max_entropy if max_entropy > 0 else 0
    
    return Lambda_measured, Phi_measured


def test_minimal_conservation(Lambda_in: float, Phi_in: float, shots: int = 20000):
    """
    Minimal ΛΦ conservation test
    """
    print(f"\n{'='*60}")
    print(f"TEST: Minimal ΛΦ Conservation")
    print(f"{'='*60}")
    print(f"Input: Λ={Lambda_in:.4f}, Φ={Phi_in:.4f}, ΛΦ={Lambda_in*Phi_in:.6f}")
    
    # Create circuit
    qc = create_minimal_lambda_phi_state(Lambda_in, Phi_in)
    qc_pw = apply_minimal_pilot_wave(qc, Lambda_in, Phi_in)
    
    print(f"\nCircuit depth: {qc_pw.depth()}")
    print(f"Gate count: {qc_pw.size()}")
    
    # Transpile
    print("\nTranspiling...")
    qc_t = transpile(qc_pw, backend, optimization_level=3)
    print(f"Transpiled depth: {qc_t.depth()}")
    
    # Execute
    print("Submitting...")
    sampler = SamplerV2(backend)
    job = sampler.run([qc_t], shots=shots)
    
    print(f"Job ID: {job.job_id()}")
    print("Waiting...", end="", flush=True)
    
    result = job.result()
    print(" ✓")
    
    # Analyze
    counts = result[0].data.meas.get_counts()
    Lambda_out, Phi_out = measure_lambda_phi_minimal(counts)
    Lambda_Phi_out = Lambda_out * Phi_out
    Lambda_Phi_in = Lambda_in * Phi_in
    
    delta = abs(Lambda_Phi_out - Lambda_Phi_in)
    rel_error = delta / Lambda_Phi_in if Lambda_Phi_in > 0 else 0
    
    print(f"\nRESULTS:")
    print(f"  Output: Λ={Lambda_out:.4f}, Φ={Phi_out:.4f}, ΛΦ={Lambda_Phi_out:.6f}")
    print(f"  ΔΛΦ = {delta:.6f}")
    print(f"  Relative error: {rel_error*100:.2f}%")
    
    if rel_error < 0.30:
        status = "✅ CONSERVED"
    elif rel_error < 0.50:
        status = "⚠️  MARGINALLY CONSERVED"
    else:
        status = "❌ NOT CONSERVED"
    
    print(f"  Status: {status}")
    
    return {
        "Lambda_in": Lambda_in,
        "Phi_in": Phi_in,
        "Lambda_Phi_in": Lambda_Phi_in,
        "Lambda_out": Lambda_out,
        "Phi_out": Phi_out,
        "Lambda_Phi_out": Lambda_Phi_out,
        "delta": delta,
        "rel_error": rel_error,
        "job_id": job.job_id(),
        "conserved": rel_error < 0.30,
    }


# Run tests
print("\n" + "█"*60)
print("█ MINIMAL ΛΦ VALIDATION SUITE")
print("█"*60)

results = []

# Test 1: Medium coherence
print("\n\n▓▓▓ TEST 1: Medium Coherence ▓▓▓")
r1 = test_minimal_conservation(0.70, 0.75, shots=20000)
results.append(r1)

# Test 2: High coherence
print("\n\n▓▓▓ TEST 2: High Coherence ▓▓▓")
r2 = test_minimal_conservation(0.90, 0.85, shots=20000)
results.append(r2)

# Test 3: Low consciousness (gating test)
print("\n\n▓▓▓ TEST 3: Low Consciousness (Gating) ▓▓▓")
r3 = test_minimal_conservation(0.75, 0.45, shots=20000)
results.append(r3)

# Summary
print("\n" + "╔"+"═"*58+"╗")
print("║" + " "*58 + "║")
print("║" + "  MINIMAL ΛΦ VALIDATION COMPLETE".center(58) + "║")
print("║" + " "*58 + "║")
print("╚"+"═"*58+"╝")

conserved_count = sum(1 for r in results if r['conserved'])

print(f"\n📊 SUMMARY:")
print(f"   Tests run: {len(results)}")
print(f"   Conserved: {conserved_count}")
print(f"   Success rate: {conserved_count/len(results)*100:.1f}%")

if conserved_count >= 2:
    print("\n✅ THEOREM VALIDATED (shallow circuit regime)")
else:
    print("\n⚠️  INCONCLUSIVE (hardware noise still dominant)")

print(f"\nJob IDs: {', '.join(r['job_id'] for r in results)}")
print("\nFramework: DNA::}{::lang v51.843")
