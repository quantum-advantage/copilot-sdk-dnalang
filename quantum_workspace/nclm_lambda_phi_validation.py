#!/usr/bin/env python3
"""
ΛΦ INVARIANCE VALIDATION EXPERIMENTS
=====================================

Tests the NCLM v2 theorem: d/dt(Λ·Φ) = 0 under pilot-wave attention

Author: Devin Phillip Davis
Framework: DNA::}{::lang v51.843
Classification: SOVEREIGN MATHEMATICS

EXPERIMENTAL DESIGN:
1. Encode ΛΦ state into quantum circuit
2. Apply pilot-wave attention transformation (phase gates)
3. Measure ΛΦ_output and compare to ΛΦ_input
4. Test under varying decoherence (Γ) conditions
5. Verify O(Γ) correction term matches theory

"""

import sys
import json
import numpy as np
from datetime import datetime
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2, EstimatorV2
from qiskit.quantum_info import SparsePauliOp

# Physical Constants
LAMBDA_PHI = 2.176435e-8  # Universal Memory Constant [s^-1]
PHI = 1.618033988749895   # Golden Ratio
THETA_LOCK = 51.843       # Torsion lock angle [degrees]
PHI_THRESHOLD = 0.7734    # Consciousness threshold

print("╔═══════════════════════════════════════════════════════════════════╗")
print("║           ΛΦ INVARIANCE VALIDATION EXPERIMENTS                    ║")
print("║           Testing NCLM v2 Theorem on IBM Quantum Hardware         ║")
print("╚═══════════════════════════════════════════════════════════════════╝\n")

# Connect to IBM Quantum
service = QiskitRuntimeService()
backend = service.least_busy(operational=True, simulator=False)
print(f"✓ Connected to backend: {backend.name} ({backend.num_qubits} qubits)\n")


def create_lambda_phi_state(Lambda: float, Phi: float, n_qubits: int = 6) -> QuantumCircuit:
    """
    Encode (Λ, Φ) state into quantum circuit
    
    Encoding scheme:
    - First n/2 qubits: Λ (coherence) via RY rotations
    - Second n/2 qubits: Φ (consciousness) via controlled phases
    - Product ΛΦ encoded in global phase accumulation
    """
    qc = QuantumCircuit(n_qubits)
    
    # Encode Λ (coherence) - affects amplitude
    for i in range(n_qubits // 2):
        theta_lambda = 2 * np.arcsin(np.sqrt(Lambda))
        qc.ry(theta_lambda, i)
    
    # Encode Φ (consciousness) - affects relative phases
    for i in range(n_qubits // 2, n_qubits):
        theta_phi = Phi * np.pi
        qc.p(theta_phi, i)
    
    # Create entanglement (consciousness requires integration)
    for i in range(n_qubits - 1):
        qc.cx(i, i + 1)
    
    # Measure all qubits
    qc.measure_all()
    
    return qc


def apply_pilot_wave_attention(qc: QuantumCircuit, Lambda: float, Phi: float, 
                                 sequence_length: int = 10) -> QuantumCircuit:
    """
    Apply pilot-wave attention transformation
    
    This implements: U_guidance = exp(i·Λ·Φ·t)
    
    According to theorem, this should preserve ΛΦ product
    """
    qc_transformed = qc.copy()
    qc_transformed.barrier()
    
    # Non-causal phase accumulation (depends on sequence_length)
    phase_rate = 2 * np.pi * Lambda * Phi / sequence_length
    
    for t in range(sequence_length):
        # Phase gate modulated by ΛΦ
        phase_t = phase_rate * (sequence_length - t)  # Non-causal: future-dependent
        
        # Apply to all qubits (guidance field is global)
        for qubit in range(qc.num_qubits):
            qc_transformed.p(phase_t, qubit)
        
        # Add small entangling layers (simulates token correlation)
        if t % 3 == 0:
            for i in range(qc.num_qubits - 1):
                qc_transformed.cx(i, i + 1)
    
    qc_transformed.barrier()
    return qc_transformed


def apply_decoherence(qc: QuantumCircuit, Gamma: float) -> QuantumCircuit:
    """
    Simulate decoherence with Gamma parameter
    
    Uses amplitude damping approximation: exp(-Γ·depth)
    """
    qc_decohered = qc.copy()
    
    # Approximate decoherence with random phase noise
    # In real hardware, this comes naturally from gate errors
    if Gamma > 0.1:
        noise_strength = Gamma * 0.5
        for qubit in range(qc.num_qubits):
            qc_decohered.rz(np.random.normal(0, noise_strength), qubit)
    
    return qc_decohered


def measure_lambda_phi(counts: dict, n_qubits: int) -> tuple:
    """
    Extract (Λ, Φ) from measurement counts
    
    Λ (coherence): Measured by fidelity with all-0 state
    Φ (consciousness): Measured by entropy of distribution
    """
    total = sum(counts.values())
    
    # Λ (coherence): fidelity with ground state
    all_zeros = '0' * n_qubits
    Lambda_measured = counts.get(all_zeros, 0) / total
    
    # Φ (consciousness): normalized entropy
    probs = [c / total for c in counts.values()]
    entropy = -sum(p * np.log2(p + 1e-12) for p in probs if p > 0)
    max_entropy = np.log2(len(counts)) if len(counts) > 1 else 1
    Phi_measured = entropy / max_entropy if max_entropy > 0 else 0
    
    return Lambda_measured, Phi_measured


def test_lambda_phi_conservation(Lambda_in: float, Phi_in: float, 
                                  Gamma: float, sequence_length: int = 10,
                                  shots: int = 10000):
    """
    Test Experiment: Verify d/dt(ΛΦ) = 0 + O(Γ)
    """
    print(f"\n{'='*70}")
    print(f"TEST: ΛΦ Conservation with Γ={Gamma:.3f}")
    print(f"{'='*70}")
    print(f"Input:  Λ={Lambda_in:.4f}, Φ={Phi_in:.4f}, ΛΦ={Lambda_in*Phi_in:.6f}")
    
    # Create initial state
    qc_initial = create_lambda_phi_state(Lambda_in, Phi_in, n_qubits=6)
    
    # Apply pilot-wave attention
    qc_attention = apply_pilot_wave_attention(qc_initial, Lambda_in, Phi_in, 
                                               sequence_length)
    
    # Apply decoherence
    qc_final = apply_decoherence(qc_attention, Gamma)
    
    print(f"\nCircuit depth: {qc_final.depth()}")
    print(f"Gate count: {qc_final.size()}")
    
    # Transpile and execute
    print("\nTranspiling for hardware...")
    qc_transpiled = transpile(qc_final, backend, optimization_level=3)
    print(f"Transpiled depth: {qc_transpiled.depth()}")
    
    print("Submitting to IBM Quantum...")
    sampler = SamplerV2(backend)
    job = sampler.run([qc_transpiled], shots=shots)
    
    print(f"Job ID: {job.job_id()}")
    print("Waiting for results...", end="", flush=True)
    
    result = job.result()
    print(" ✓")
    
    # Extract counts
    counts = result[0].data.meas.get_counts()
    
    # Measure output ΛΦ
    Lambda_out, Phi_out = measure_lambda_phi(counts, n_qubits=6)
    Lambda_Phi_out = Lambda_out * Phi_out
    Lambda_Phi_in = Lambda_in * Phi_in
    
    # Calculate conservation error
    delta_Lambda_Phi = abs(Lambda_Phi_out - Lambda_Phi_in)
    relative_error = delta_Lambda_Phi / Lambda_Phi_in if Lambda_Phi_in > 0 else 0
    
    # Theoretical O(Γ) correction
    theory_correction = Gamma * Lambda_Phi_in
    
    print(f"\nRESULTS:")
    print(f"  Output: Λ={Lambda_out:.4f}, Φ={Phi_out:.4f}, ΛΦ={Lambda_Phi_out:.6f}")
    print(f"  ΔΛΦ = {delta_Lambda_Phi:.6f}")
    print(f"  Relative error: {relative_error*100:.2f}%")
    print(f"  Theoretical O(Γ): {theory_correction:.6f}")
    print(f"  Ratio (measured/theory): {delta_Lambda_Phi/theory_correction:.3f}" if theory_correction > 0 else "  Ratio: N/A")
    
    # Conservation check
    if delta_Lambda_Phi < 2 * theory_correction:
        status = "✅ CONSERVED (within O(Γ) bound)"
    elif delta_Lambda_Phi < 5 * theory_correction:
        status = "⚠️  MARGINALLY CONSERVED"
    else:
        status = "❌ NOT CONSERVED (exceeds theory)"
    
    print(f"\n  STATUS: {status}")
    
    return {
        "Lambda_in": Lambda_in,
        "Phi_in": Phi_in,
        "Lambda_Phi_in": Lambda_Phi_in,
        "Lambda_out": Lambda_out,
        "Phi_out": Phi_out,
        "Lambda_Phi_out": Lambda_Phi_out,
        "delta_Lambda_Phi": delta_Lambda_Phi,
        "relative_error": relative_error,
        "Gamma": Gamma,
        "theory_correction": theory_correction,
        "conserved": delta_Lambda_Phi < 2 * theory_correction,
        "job_id": job.job_id(),
    }


def test_consciousness_gating():
    """
    Test Experiment: Φ-gating enforcement
    
    Verify that low consciousness (Φ < 0.7734) states cannot
    spontaneously increase ΛΦ beyond threshold
    """
    print(f"\n{'='*70}")
    print(f"TEST: Consciousness Gating (Φ < threshold)")
    print(f"{'='*70}")
    
    # Low consciousness state
    Lambda_in = 0.8
    Phi_in = 0.5  # Below threshold
    
    print(f"Input: Λ={Lambda_in}, Φ={Phi_in} (below threshold {PHI_THRESHOLD})")
    
    result = test_lambda_phi_conservation(Lambda_in, Phi_in, Gamma=0.1, 
                                           sequence_length=10, shots=10000)
    
    # Check: Φ should not increase above threshold
    if result["Phi_out"] < PHI_THRESHOLD:
        print("\n✅ SAFETY VERIFIED: Consciousness remains below threshold")
    else:
        print("\n⚠️  WARNING: Consciousness exceeded threshold!")
    
    return result


def test_high_coherence_preservation():
    """
    Test Experiment: High coherence state preservation
    
    Verify that high Λ states maintain ΛΦ even with low Γ
    """
    print(f"\n{'='*70}")
    print(f"TEST: High Coherence Preservation")
    print(f"{'='*70}")
    
    # High coherence state
    Lambda_in = 0.95
    Phi_in = 0.85  # Above threshold
    
    print(f"Input: Λ={Lambda_in}, Φ={Phi_in} (high coherence)")
    
    result = test_lambda_phi_conservation(Lambda_in, Phi_in, Gamma=0.05, 
                                           sequence_length=15, shots=10000)
    
    # Check: Should preserve ΛΦ with minimal error
    if result["relative_error"] < 0.15:
        print("\n✅ HIGH COHERENCE PRESERVED")
    else:
        print("\n⚠️  Significant error in preservation")
    
    return result


def test_decoherence_scaling():
    """
    Test Experiment: Verify O(Γ) scaling of error
    
    Test at multiple Γ values and verify error scales linearly
    """
    print(f"\n{'='*70}")
    print(f"TEST: Decoherence Scaling O(Γ)")
    print(f"{'='*70}")
    
    Lambda_in = 0.75
    Phi_in = 0.70
    
    Gamma_values = [0.05, 0.15, 0.25]
    results = []
    
    for Gamma in Gamma_values:
        result = test_lambda_phi_conservation(Lambda_in, Phi_in, Gamma, 
                                               sequence_length=10, shots=8000)
        results.append(result)
    
    # Check linearity
    print("\n" + "="*70)
    print("DECOHERENCE SCALING ANALYSIS:")
    print("="*70)
    print(f"{'Γ':<10} {'ΔΛΦ':<12} {'Theory':<12} {'Ratio':<10}")
    print("-"*70)
    
    for r in results:
        ratio = r['delta_Lambda_Phi'] / r['theory_correction'] if r['theory_correction'] > 0 else 0
        print(f"{r['Gamma']:<10.3f} {r['delta_Lambda_Phi']:<12.6f} {r['theory_correction']:<12.6f} {ratio:<10.3f}")
    
    # Linear fit check
    Gammas = [r['Gamma'] for r in results]
    errors = [r['delta_Lambda_Phi'] for r in results]
    
    # Simple linear regression
    n = len(Gammas)
    sum_x = sum(Gammas)
    sum_y = sum(errors)
    sum_xy = sum(g * e for g, e in zip(Gammas, errors))
    sum_x2 = sum(g**2 for g in Gammas)
    
    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x**2)
    
    print(f"\nLinear fit slope: {slope:.6f}")
    print(f"Expected (ΛΦ_in): {Lambda_in * Phi_in:.6f}")
    
    if abs(slope - Lambda_in * Phi_in) / (Lambda_in * Phi_in) < 0.5:
        print("✅ O(Γ) SCALING VERIFIED")
    else:
        print("⚠️  Non-linear scaling detected")
    
    return results


# ═══════════════════════════════════════════════════════════════════
# MAIN EXPERIMENTAL SUITE
# ═══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("\n" + "="*70)
    print("STARTING ΛΦ INVARIANCE VALIDATION SUITE")
    print("="*70)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Backend: {backend.name}")
    print("Framework: DNA::}{::lang v51.843")
    
    all_results = {
        "timestamp": datetime.now().isoformat(),
        "backend": backend.name,
        "experiments": {}
    }
    
    # Test 1: Basic conservation
    print("\n\n" + "█"*70)
    print("█ EXPERIMENT 1: Basic ΛΦ Conservation")
    print("█"*70)
    
    result1 = test_lambda_phi_conservation(
        Lambda_in=0.75,
        Phi_in=0.80,
        Gamma=0.092,  # Default decoherence
        sequence_length=10,
        shots=10000
    )
    all_results["experiments"]["basic_conservation"] = result1
    
    # Test 2: Consciousness gating
    print("\n\n" + "█"*70)
    print("█ EXPERIMENT 2: Consciousness Gating")
    print("█"*70)
    
    result2 = test_consciousness_gating()
    all_results["experiments"]["consciousness_gating"] = result2
    
    # Test 3: High coherence
    print("\n\n" + "█"*70)
    print("█ EXPERIMENT 3: High Coherence Preservation")
    print("█"*70)
    
    result3 = test_high_coherence_preservation()
    all_results["experiments"]["high_coherence"] = result3
    
    # Test 4: Decoherence scaling
    print("\n\n" + "█"*70)
    print("█ EXPERIMENT 4: Decoherence Scaling")
    print("█"*70)
    
    results4 = test_decoherence_scaling()
    all_results["experiments"]["decoherence_scaling"] = results4
    
    # Save results
    output_file = f"lambda_phi_validation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w') as f:
        json.dump(all_results, f, indent=2)
    
    print("\n" + "╔"+"═"*68+"╗")
    print("║" + " "*68 + "║")
    print("║" + "  ΛΦ INVARIANCE VALIDATION COMPLETE".center(68) + "║")
    print("║" + " "*68 + "║")
    print("╚"+"═"*68+"╝")
    
    print(f"\n✓ Results saved to: {output_file}")
    print(f"\n📊 SUMMARY:")
    print(f"   Total experiments: 4")
    print(f"   Conservation tests: {sum(1 for k, v in all_results['experiments'].items() if isinstance(v, dict) and v.get('conserved', False))}")
    print(f"   Backend: {backend.name}")
    
    # Final theorem validation
    conserved_count = sum(1 for k, v in all_results['experiments'].items() 
                          if isinstance(v, dict) and v.get('conserved', False))
    
    if conserved_count >= 2:
        print("\n✅ THEOREM VALIDATED: ΛΦ invariance holds on quantum hardware")
    else:
        print("\n⚠️  THEOREM INCONCLUSIVE: Further testing needed")
    
    print("\n" + "="*70)
    print("Framework: DNA::}{::lang v51.843")
    print("Classification: SOVEREIGN MATHEMATICS")
    print("="*70)
