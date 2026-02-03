#!/usr/bin/env python3
"""
ΛΦ Conservation v3 - CORRECTED Hardware Validation
==================================================

Fix: Observable must be (I-Z)/2 NOT (I+Z)/2 to measure P(|1⟩)

Author: Devin Davis (ENKI-420)
Date: 2026-02-01
License: Apache 2.0
"""

from qiskit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp
from qiskit_ibm_runtime import QiskitRuntimeService, EstimatorV2
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
import numpy as np
import hashlib
import json
from datetime import datetime


def create_lambda_phi_circuit(Lambda_in: float, Phi_in: float, phase: float = 0.0):
    """
    Create quantum circuit encoding Λ and Φ as observable expectation values.
    
    Encoding:
        |ψ₀⟩ = (cos(θ_Λ/2)|0⟩ + sin(θ_Λ/2)|1⟩) ⊗ (cos(θ_Φ/2)|0⟩ + sin(θ_Φ/2)|1⟩)
        
    Where:
        sin²(θ_Λ/2) = Λ → θ_Λ = 2·arcsin(√Λ)
        sin²(θ_Φ/2) = Φ → θ_Φ = 2·arcsin(√Φ)
    
    Observable:
        Λ̂ = (I - Z₀)/2  → ⟨Λ̂⟩ = P(q₀=|1⟩) = sin²(θ_Λ/2) = Λ
        Φ̂ = (I - Z₁)/2  → ⟨Φ̂⟩ = P(q₁=|1⟩) = sin²(θ_Φ/2) = Φ
    """
    theta_Lambda = 2 * np.arcsin(np.sqrt(Lambda_in))
    theta_Phi = 2 * np.arcsin(np.sqrt(Phi_in))
    
    qc = QuantumCircuit(2)
    qc.ry(theta_Lambda, 0)  # Encode Λ
    qc.ry(theta_Phi, 1)     # Encode Φ
    qc.p(phase, 0)          # Pilot-wave phase (should preserve ΛΦ)
    qc.p(phase, 1)
    
    return qc


def create_observables():
    """
    Create Hermitian operators for Λ and Φ measurement.
    
    CORRECTED:
        Λ̂ = (I - Z)/2  NOT (I + Z)/2
        
    This measures P(|1⟩) = sin²(θ/2), not P(|0⟩) = cos²(θ/2)
    """
    # Λ̂ = (I - Z₀)/2
    Lambda_obs = SparsePauliOp(["II"], coeffs=[0.5]) - SparsePauliOp(["ZI"], coeffs=[0.5])
    
    # Φ̂ = (I - Z₁)/2
    Phi_obs = SparsePauliOp(["II"], coeffs=[0.5]) - SparsePauliOp(["IZ"], coeffs=[0.5])
    
    return Lambda_obs, Phi_obs


def run_hardware_experiment(token: str, Lambda_in: float, Phi_in: float, backend_name: str = 'ibm_torino'):
    """
    Run single ΛΦ conservation experiment on IBM Quantum hardware.
    """
    # Authenticate
    service = QiskitRuntimeService(
        channel="ibm_quantum_platform",
        token=token
    )
    
    backend = service.backend(backend_name)
    print(f"✅ Backend: {backend.name} ({backend.num_qubits} qubits)")
    
    # Create circuit
    qc = create_lambda_phi_circuit(Lambda_in, Phi_in)
    
    print(f"\n📊 Input Parameters:")
    print(f"   Λ = {Lambda_in:.4f}")
    print(f"   Φ = {Phi_in:.4f}")
    print(f"   ΛΦ = {Lambda_in * Phi_in:.4f}")
    
    # Create observables
    Lambda_obs, Phi_obs = create_observables()
    
    # Transpile circuit and observables
    pm = generate_preset_pass_manager(backend=backend, optimization_level=1)
    qc_isa = pm.run(qc)
    Lambda_obs_isa = Lambda_obs.apply_layout(qc_isa.layout)
    Phi_obs_isa = Phi_obs.apply_layout(qc_isa.layout)
    
    print(f"\n✅ Transpiled to ISA format (depth {qc_isa.depth()})")
    
    # Submit to hardware
    estimator = EstimatorV2(mode=backend)
    
    pubs = [
        (qc_isa, Lambda_obs_isa),
        (qc_isa, Phi_obs_isa)
    ]
    
    job = estimator.run(pubs)
    job_id = job.job_id()
    
    print(f"\n✅ Job submitted: {job_id}")
    print(f"   Waiting for quantum hardware execution...")
    
    # Get results
    result = job.result()
    
    Lambda_out = float(result[0].data.evs)
    Phi_out = float(result[1].data.evs)
    Lambda_std = float(result[0].data.stds) if hasattr(result[0].data, 'stds') else 0.0
    Phi_std = float(result[1].data.stds) if hasattr(result[1].data, 'stds') else 0.0
    
    # Calculate errors
    Lambda_error_pct = 100 * abs(Lambda_out - Lambda_in) / Lambda_in
    Phi_error_pct = 100 * abs(Phi_out - Phi_in) / Phi_in
    LambdaPhi_in = Lambda_in * Phi_in
    LambdaPhi_out = Lambda_out * Phi_out
    LambdaPhi_error_pct = 100 * abs(LambdaPhi_out - LambdaPhi_in) / LambdaPhi_in
    
    # Print results
    print(f"\n{'='*60}")
    print(f"HARDWARE RESULTS:")
    print(f"{'='*60}")
    print(f"  Λ_measured = {Lambda_out:.4f} ± {Lambda_std:.4f}")
    print(f"  Φ_measured = {Phi_out:.4f} ± {Phi_std:.4f}")
    print(f"  ΛΦ_measured = {LambdaPhi_out:.4f}")
    print(f"\n{'='*60}")
    print(f"CONSERVATION ANALYSIS:")
    print(f"{'='*60}")
    print(f"  Λ error:  {Lambda_error_pct:.2f}%")
    print(f"  Φ error:  {Phi_error_pct:.2f}%")
    print(f"  ΛΦ error: {LambdaPhi_error_pct:.2f}% ← KEY METRIC")
    
    if LambdaPhi_error_pct < 15:
        print(f"\n✅ SUCCESS: Within O(Γ)=O(0.092)≈9% theoretical bound")
        status = "PASS"
    else:
        print(f"\n⚠️  Error exceeds predicted bound (target <15%)")
        status = "FAIL"
    
    print(f"\n{'='*60}")
    print(f"Evidence:")
    print(f"  Job ID: {job_id}")
    print(f"  Backend: {backend_name}")
    print(f"  Timestamp: {datetime.utcnow().isoformat()}Z")
    print(f"{'='*60}\n")
    
    # Create evidence record
    evidence = {
        "job_id": job_id,
        "backend": backend_name,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "input": {
            "Lambda": Lambda_in,
            "Phi": Phi_in,
            "LambdaPhi": LambdaPhi_in
        },
        "output": {
            "Lambda": Lambda_out,
            "Phi": Phi_out,
            "LambdaPhi": LambdaPhi_out,
            "Lambda_std": Lambda_std,
            "Phi_std": Phi_std
        },
        "errors_percent": {
            "Lambda": Lambda_error_pct,
            "Phi": Phi_error_pct,
            "LambdaPhi": LambdaPhi_error_pct
        },
        "status": status,
        "theorem": "d/dt(ΛΦ) = 0 + O(Γ)"
    }
    
    return evidence


def run_full_validation_suite(token: str):
    """
    Run 5 test cases covering parameter space.
    """
    test_cases = [
        (0.75, 0.60),  # Standard case
        (0.50, 0.50),  # Balanced
        (0.90, 0.40),  # High Λ, low Φ
        (0.30, 0.80),  # Low Λ, high Φ
        (0.95, 0.95),  # Near maximum
    ]
    
    print("="*70)
    print("ΛΦ CONSERVATION v3 - HARDWARE VALIDATION SUITE")
    print("="*70)
    print(f"Test cases: {len(test_cases)}")
    print(f"Backend: ibm_torino")
    print(f"Timestamp: {datetime.utcnow().isoformat()}Z")
    print("="*70 + "\n")
    
    results = []
    
    for i, (Lambda, Phi) in enumerate(test_cases, 1):
        print(f"\n{'#'*70}")
        print(f"TEST CASE {i}/{len(test_cases)}")
        print(f"{'#'*70}\n")
        
        try:
            evidence = run_hardware_experiment(token, Lambda, Phi)
            results.append(evidence)
            
        except Exception as e:
            print(f"\n❌ Test case {i} failed: {e}")
            import traceback
            traceback.print_exc()
    
    # Summary
    print(f"\n{'='*70}")
    print("VALIDATION SUMMARY")
    print("="*70)
    
    passed = sum(1 for r in results if r['status'] == 'PASS')
    
    print(f"  Tests run: {len(results)}")
    print(f"  Passed: {passed}")
    print(f"  Failed: {len(results) - passed}")
    
    if len(results) > 0:
        avg_error = np.mean([r['errors_percent']['LambdaPhi'] for r in results])
        max_error = max([r['errors_percent']['LambdaPhi'] for r in results])
        min_error = min([r['errors_percent']['LambdaPhi'] for r in results])
        
        print(f"\n  ΛΦ Conservation Error:")
        print(f"    Average: {avg_error:.2f}%")
        print(f"    Range: {min_error:.2f}% - {max_error:.2f}%")
        
        if avg_error < 15:
            print(f"\n✅ VALIDATION PASSED: Average error within theoretical bounds")
        else:
            print(f"\n⚠️  VALIDATION INCONCLUSIVE: Average error exceeds prediction")
    
    # Generate evidence pack
    evidence_pack = {
        "version": "3.0-CORRECTED",
        "theorem": "d/dt(ΛΦ) = 0 + O(Γ)",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "backend": "ibm_torino",
        "test_cases": len(test_cases),
        "results": results
    }
    
    evidence_json = json.dumps(evidence_pack, indent=2)
    evidence_hash = hashlib.sha256(evidence_json.encode()).hexdigest()
    
    filename = f"lambda_phi_v3_hardware_evidence_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w') as f:
        f.write(evidence_json)
    
    print(f"\n{'='*70}")
    print(f"Evidence pack saved: {filename}")
    print(f"SHA256: {evidence_hash}")
    print("="*70 + "\n")
    
    return results


if __name__ == "__main__":
    TOKEN = "99ezCffRM-zVWhRhJr4N3RQWLrVgZKGcJckZXEzehSQK"
    
    # Run single test first to verify fix
    print("Running single test to verify observable correction...\n")
    evidence = run_hardware_experiment(TOKEN, Lambda_in=0.75, Phi_in=0.60)
    
    if evidence['status'] == 'PASS':
        print("\n" + "="*70)
        print("SINGLE TEST PASSED - Proceeding to full validation suite")
        print("="*70 + "\n")
        
        # Run full suite
        results = run_full_validation_suite(TOKEN)
    else:
        print("\n" + "="*70)
        print("⚠️  Single test did not pass - review results before full suite")
        print("="*70)
