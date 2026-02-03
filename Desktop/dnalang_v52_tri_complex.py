#!/usr/bin/env python3
"""
DNA-Lang v52 Tri-Complex Qiskit Runner
- Builds tri-complex circuits (hMAT2A, PRMT5, TOP1), constructs SparsePauliOp Hamiltonians,
  and either simulates locally or submits PUBs to Qiskit Runtime EstimatorV2.

Usage: python3 dnalang_v52_tri_complex.py --mode [simulate|hardware] [--backend ibm_fez] [--shots 2000]
"""

import os
import argparse
import json
import numpy as np

from qiskit.circuit import QuantumCircuit
from qiskit.quantum_info import SparsePauliOp

# Qiskit runtime imports are optional (only required for hardware mode)
try:
    from qiskit_ibm_runtime import QiskitRuntimeService, EstimatorV2
    from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
    HAS_QISKIT_RUNTIME = True
except Exception:
    HAS_QISKIT_RUNTIME = False


def build_tri_complex_circuit(layers=2, theta_lock=np.pi*51.843/180.0):
    # Logical qubit counts
    hQ = 12; pQ = 14; tQ = 14; anc = 16
    total = hQ + pQ + tQ + anc
    qc = QuantumCircuit(total)

    # Simple hardware-efficient ansatz
    for L in range(layers):
        for i in range(total):
            qc.ry(theta_lock * (1.0 + 0.05*L), i)
        # entangler: linear
        for i in range(total - 1):
            qc.cx(i, i+1)
    return qc, (hQ, pQ, tQ, anc)


def build_tri_complex_hamiltonian(qubit_counts):
    total = sum(qubit_counts)
    paulis = []
    coeffs = []
    # Global pocket Z term
    paulis.append('Z'*total); coeffs.append(-2.0)
    # Pairwise couplings local to each module
    offset = 0
    for q in qubit_counts:
        for i in range(q-1):
            p = list('I'*total)
            p[offset + i] = 'Z'; p[offset + i + 1] = 'Z'
            paulis.append(''.join(p)); coeffs.append(-0.3)
        offset += q
    # Transverse fields
    for i in range(total):
        p = list('I'*total); p[i] = 'X'
        paulis.append(''.join(p)); coeffs.append(0.1)

    return SparsePauliOp(paulis, coeffs)


def simulate_local_expectation(qc, obs):
    # Local statevector simulation (small circuits only)
    try:
        from qiskit import Aer
        backend = Aer.get_backend('statevector_simulator')
        from qiskit import transpile, assemble
        t_qc = transpile(qc, backend=backend)
        qobj = assemble(t_qc)
        out = backend.run(qobj).result()
        sv = out.get_statevector(t_qc)
        # compute expectation via matrix multiply (use sparse conversion)
        mat = obs.to_matrix()
        exp = np.real(np.vdot(sv, mat.dot(sv)))
        return float(exp)
    except Exception as e:
        print('Local simulation not available:', e)
        return None


def submit_to_hardware(circuits, observables, shots=2000):
    if not HAS_QISKIT_RUNTIME:
        raise RuntimeError('Qiskit Runtime not available in this environment')
    service = QiskitRuntimeService()
    backend = service.least_busy(operational=True, simulator=False, min_num_qubits=20)
    print('Selected backend:', backend.name)
    # transpile circuits using preset pass manager
    pm = generate_preset_pass_manager(backend=backend, optimization_level=3)
    isa_circuits = []
    isa_observables = []
    for qc, obs in zip(circuits, observables):
        try:
            isa = pm.run(qc)
        except Exception:
            from qiskit.compiler import transpile
            isa = transpile(qc, backend=backend, optimization_level=3)
        isa_circuits.append(isa)
        # try to apply layout for observable when possible
        try:
            isa_observables.append(obs.apply_layout(isa.layout))
        except Exception:
            isa_observables.append(obs)
    estimator = EstimatorV2(mode=backend)
    pubs = [(isa_circuits[i], isa_observables[i]) for i in range(len(isa_circuits))]
    job = estimator.run(pubs, precision=0.01)
    print('Job submitted:', job.job_id())
    return job.job_id()


def main():
    parser = argparse.ArgumentParser(description='DNA-Lang v52 Tri-Complex runner')
    parser.add_argument('--mode', choices=['simulate','hardware'], default='simulate')
    parser.add_argument('--layers', type=int, default=2)
    parser.add_argument('--shots', type=int, default=2000)
    parser.add_argument('--save', default='dnalang_v52_run.json')
    args = parser.parse_args()

    qc, qub = build_tri_complex_circuit(layers=args.layers)
    obs = build_tri_complex_hamiltonian(qub)

    result = {'mode': args.mode, 'layers': args.layers}

    if args.mode == 'simulate':
        exp = simulate_local_expectation(qc, obs)
        result['expectation'] = exp
        print('Local expectation:', exp)
    else:
        try:
            job_id = submit_to_hardware([qc], [obs], shots=args.shots)
            result['job_id'] = job_id
        except Exception as e:
            print('Hardware submission failed:', e)
            exp = simulate_local_expectation(qc, obs)
            result['expectation_fallback'] = exp

    with open(args.save, 'w') as f:
        json.dump(result, f, indent=2)
    print('Saved run metadata to', args.save)

if __name__ == '__main__':
    main()
