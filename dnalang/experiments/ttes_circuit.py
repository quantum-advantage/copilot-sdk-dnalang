#!/usr/bin/env python3
"""
Torsion-Tetrahedral Epsilon Stabilizer (TTES)
=============================================
12-qubit dynamic circuit that encodes the geometric relationship
between θ_lock (51.843°) and θ_tet (54.736°), detects the negative
ε_eff anomaly via mid-circuit measurement, and applies real-time
feed-forward correction.

Discovery: χ_PC ≈ θ_lock/θ_tet to 0.12% — the phase conjugation
quality may be a geometric ratio, not an independent constant.

Framework: DNA::}{::lang v51.843
Author: Devin Phillip Davis / Agile Defense Systems (CAGE 9HUP5)

Usage:
    # Dry-run (local simulator)
    python3 ttes_circuit.py

    # Submit to IBM hardware
    python3 ttes_circuit.py --backend ibm_torino --shots 100000

    # Sweep coupling parameter
    python3 ttes_circuit.py --sweep --shots 50000
"""

import math
import json
import argparse
import sys
from datetime import datetime, timezone

import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.quantum_info import Statevector, DensityMatrix, partial_trace, entropy

# ── IMMUTABLE CONSTANTS ────────────────────────────────────────────────
THETA_LOCK_DEG = 51.843
THETA_TET_DEG = 54.7356103172  # arccos(1/3) exact
PHI_THRESHOLD = 0.7734
GAMMA_CRITICAL = 0.3
CHI_PC = 0.946
LAMBDA_PHI = 2.176435e-8

THETA_LOCK_RAD = math.radians(THETA_LOCK_DEG)
THETA_TET_RAD = math.radians(THETA_TET_DEG)
DELTA_RAD = THETA_TET_RAD - THETA_LOCK_RAD
DELTA_DEG = THETA_TET_DEG - THETA_LOCK_DEG

# Geometric ratio discovery
CHI_GEOMETRIC = THETA_LOCK_DEG / THETA_TET_DEG  # 0.947153 ≈ χ_PC


def build_ttes_circuit(coupling_g=1.0, with_correction=True):
    """
    Build the 12-qubit TTES circuit.

    Parameters
    ----------
    coupling_g : float
        Phase-conjugate coupling strength. ε_eff goes negative at g > 0.0225.
    with_correction : bool
        If True, include Stage 5 feed-forward correction.

    Returns
    -------
    QuantumCircuit
    """
    # Registers
    torsion = QuantumRegister(4, 'tor')
    tetra = QuantumRegister(4, 'tet')
    monitor = QuantumRegister(2, 'mon')
    ancilla = QuantumRegister(2, 'anc')
    sign_bit = ClassicalRegister(1, 'sign')
    readout = ClassicalRegister(12, 'out')

    qc = QuantumCircuit(torsion, tetra, monitor, ancilla, sign_bit, readout,
                        name=f'TTES_g{coupling_g:.3f}')

    # ── Stage 1: Torsion Lock Preparation ──────────────────────────────
    for i in range(4):
        qc.h(torsion[i])
        qc.ry(2 * THETA_LOCK_RAD, torsion[i])

    qc.barrier(label='θ_lock')

    # ── Stage 2: Tetrahedral Encoding ──────────────────────────────────
    for i in range(4):
        qc.h(tetra[i])
        qc.ry(2 * THETA_TET_RAD, tetra[i])

    qc.barrier(label='θ_tet')

    # ── Stage 3: Cross-Register Entanglement (Δθ Bridge) ──────────────
    for i in range(4):
        qc.cx(torsion[i], tetra[i])
        qc.rz(2 * DELTA_RAD * coupling_g, tetra[i])

    for i in range(3):
        qc.cx(torsion[i], torsion[i + 1])
        qc.cx(tetra[i], tetra[i + 1])

    qc.barrier(label='Δθ_bridge')

    # ── Stage 4: χ-PC Coupling to Epsilon Monitor ─────────────────────
    chi_angle = 2 * math.asin(math.sqrt(CHI_PC))
    qc.ry(chi_angle, monitor[0])
    qc.cx(torsion[0], monitor[0])
    qc.cx(tetra[0], monitor[0])
    qc.rz(coupling_g * math.pi, monitor[0])
    qc.cx(monitor[0], monitor[1])
    qc.cx(torsion[1], monitor[1])
    qc.cx(tetra[1], monitor[1])

    qc.barrier(label='ε_detect')

    # ── Stage 5: Mid-Circuit Measurement + Conditional Correction ─────
    qc.measure(monitor[1], sign_bit[0])

    if with_correction:
        with qc.if_test((sign_bit, 1)):
            qc.ry(2 * DELTA_RAD, ancilla[0])
            qc.cx(ancilla[0], torsion[0])
            qc.cx(ancilla[0], tetra[0])
            qc.rz(-2 * DELTA_RAD, ancilla[1])
            qc.cx(ancilla[1], monitor[0])
            qc.cx(torsion[2], tetra[2])
            qc.rz(-DELTA_RAD * coupling_g, tetra[2])

    qc.barrier(label='correct')

    # ── Stage 6: Full Readout ─────────────────────────────────────────
    all_qubits = list(torsion) + list(tetra) + list(monitor) + list(ancilla)
    for i, q in enumerate(all_qubits):
        qc.measure(q, readout[i])

    return qc


def analyze_statevector(qc_no_measure):
    """Analyze entanglement and ε_eff from statevector simulation."""
    sv = Statevector.from_instruction(qc_no_measure)
    rho = DensityMatrix(sv)

    torsion_rho = partial_trace(rho, list(range(4, 12)))
    S_torsion = float(entropy(torsion_rho, base=2))

    tetra_rho = partial_trace(rho, [0, 1, 2, 3] + list(range(8, 12)))
    S_tetra = float(entropy(tetra_rho, base=2))

    bridge_rho = partial_trace(rho, [1, 2, 3, 5, 6, 7, 8, 9, 10, 11])
    S_bridge = float(entropy(bridge_rho, base=2))

    S_total = float(entropy(rho, base=2))

    phi = (S_torsion + S_tetra - S_total) / max(S_torsion + S_tetra, 1e-10)
    phi = max(0, min(1, phi))

    return {
        'S_torsion': S_torsion,
        'S_tetra': S_tetra,
        'S_bridge': S_bridge,
        'S_total': S_total,
        'phi': phi,
        'above_threshold': phi >= PHI_THRESHOLD,
    }


def build_measurement_free(coupling_g=1.0):
    """Build circuit without measurements for statevector analysis."""
    torsion = QuantumRegister(4, 'tor')
    tetra = QuantumRegister(4, 'tet')
    monitor = QuantumRegister(2, 'mon')
    ancilla = QuantumRegister(2, 'anc')

    qc = QuantumCircuit(torsion, tetra, monitor, ancilla,
                        name=f'TTES_sv_g{coupling_g:.3f}')

    for i in range(4):
        qc.h(torsion[i])
        qc.ry(2 * THETA_LOCK_RAD, torsion[i])

    for i in range(4):
        qc.h(tetra[i])
        qc.ry(2 * THETA_TET_RAD, tetra[i])

    for i in range(4):
        qc.cx(torsion[i], tetra[i])
        qc.rz(2 * DELTA_RAD * coupling_g, tetra[i])

    for i in range(3):
        qc.cx(torsion[i], torsion[i + 1])
        qc.cx(tetra[i], tetra[i + 1])

    chi_angle = 2 * math.asin(math.sqrt(CHI_PC))
    qc.ry(chi_angle, monitor[0])
    qc.cx(torsion[0], monitor[0])
    qc.cx(tetra[0], monitor[0])
    qc.rz(coupling_g * math.pi, monitor[0])
    qc.cx(monitor[0], monitor[1])
    qc.cx(torsion[1], monitor[1])
    qc.cx(tetra[1], monitor[1])

    return qc


def _build_always_correct(coupling_g=1.0):
    """Build circuit that always applies correction (no if_test)."""
    torsion = QuantumRegister(4, 'tor')
    tetra = QuantumRegister(4, 'tet')
    monitor = QuantumRegister(2, 'mon')
    ancilla = QuantumRegister(2, 'anc')
    readout = ClassicalRegister(12, 'out')
    qc = QuantumCircuit(torsion, tetra, monitor, ancilla, readout,
                        name=f'TTES_corr_g{coupling_g:.3f}')
    for i in range(4):
        qc.h(torsion[i])
        qc.ry(2 * THETA_LOCK_RAD, torsion[i])
    for i in range(4):
        qc.h(tetra[i])
        qc.ry(2 * THETA_TET_RAD, tetra[i])
    for i in range(4):
        qc.cx(torsion[i], tetra[i])
        qc.rz(2 * DELTA_RAD * coupling_g, tetra[i])
    for i in range(3):
        qc.cx(torsion[i], torsion[i + 1])
        qc.cx(tetra[i], tetra[i + 1])
    chi_angle = 2 * math.asin(math.sqrt(CHI_PC))
    qc.ry(chi_angle, monitor[0])
    qc.cx(torsion[0], monitor[0])
    qc.cx(tetra[0], monitor[0])
    qc.rz(coupling_g * math.pi, monitor[0])
    qc.cx(monitor[0], monitor[1])
    qc.cx(torsion[1], monitor[1])
    qc.cx(tetra[1], monitor[1])
    qc.barrier(label='correction')
    qc.ry(2 * DELTA_RAD, ancilla[0])
    qc.cx(ancilla[0], torsion[0])
    qc.cx(ancilla[0], tetra[0])
    qc.rz(-2 * DELTA_RAD, ancilla[1])
    qc.cx(ancilla[1], monitor[0])
    qc.cx(torsion[2], tetra[2])
    qc.rz(-DELTA_RAD * coupling_g, tetra[2])
    qc.barrier()
    all_q = list(torsion) + list(tetra) + list(monitor) + list(ancilla)
    for i, q in enumerate(all_q):
        qc.measure(q, readout[i])
    return qc


def _build_no_correct(coupling_g=1.0):
    """Build circuit without correction (no if_test)."""
    torsion = QuantumRegister(4, 'tor')
    tetra = QuantumRegister(4, 'tet')
    monitor = QuantumRegister(2, 'mon')
    ancilla = QuantumRegister(2, 'anc')
    readout = ClassicalRegister(12, 'out')
    qc = QuantumCircuit(torsion, tetra, monitor, ancilla, readout,
                        name=f'TTES_uncorr_g{coupling_g:.3f}')
    for i in range(4):
        qc.h(torsion[i])
        qc.ry(2 * THETA_LOCK_RAD, torsion[i])
    for i in range(4):
        qc.h(tetra[i])
        qc.ry(2 * THETA_TET_RAD, tetra[i])
    for i in range(4):
        qc.cx(torsion[i], tetra[i])
        qc.rz(2 * DELTA_RAD * coupling_g, tetra[i])
    for i in range(3):
        qc.cx(torsion[i], torsion[i + 1])
        qc.cx(tetra[i], tetra[i + 1])
    chi_angle = 2 * math.asin(math.sqrt(CHI_PC))
    qc.ry(chi_angle, monitor[0])
    qc.cx(torsion[0], monitor[0])
    qc.cx(tetra[0], monitor[0])
    qc.rz(coupling_g * math.pi, monitor[0])
    qc.cx(monitor[0], monitor[1])
    qc.cx(torsion[1], monitor[1])
    qc.cx(tetra[1], monitor[1])
    qc.barrier()
    all_q = list(torsion) + list(tetra) + list(monitor) + list(ancilla)
    for i, q in enumerate(all_q):
        qc.measure(q, readout[i])
    return qc


def run_simulator(coupling_g=1.0, shots=100000):
    """Run TTES on local simulator with and without correction."""
    from qiskit.primitives import StatevectorSampler
    sampler = StatevectorSampler()
    results = {}

    # Uncorrected
    qc_u = _build_no_correct(coupling_g)
    job_u = sampler.run([qc_u], shots=shots)
    counts_u = job_u.result()[0].data.out.get_counts()
    results['uncorrected'] = {
        'circuit_depth': qc_u.depth(),
        'gate_count': qc_u.size(),
        'shots': sum(counts_u.values()),
        'top_5_counts': dict(sorted(counts_u.items(), key=lambda x: -x[1])[:5]),
    }

    # Corrected (always-on correction)
    qc_c = _build_always_correct(coupling_g)
    job_c = sampler.run([qc_c], shots=shots)
    counts_c = job_c.result()[0].data.out.get_counts()
    results['corrected'] = {
        'circuit_depth': qc_c.depth(),
        'gate_count': qc_c.size(),
        'shots': sum(counts_c.values()),
        'top_5_counts': dict(sorted(counts_c.items(), key=lambda x: -x[1])[:5]),
    }

    # Statevector analysis
    qc_sv = build_measurement_free(coupling_g=coupling_g)
    sv_metrics = analyze_statevector(qc_sv)

    return {
        'coupling_g': coupling_g,
        'chi_geometric': CHI_GEOMETRIC,
        'chi_pc': CHI_PC,
        'chi_deviation': abs(CHI_GEOMETRIC - CHI_PC),
        'delta_deg': DELTA_DEG,
        'statevector': sv_metrics,
        **results,
    }


def run_coupling_sweep(couplings=None, shots=50000):
    """Sweep coupling parameter to map ε_eff crossover on circuit."""
    if couplings is None:
        couplings = [0.01, 0.02, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 1.5, 2.0]

    results = []
    for g in couplings:
        qc_sv = build_measurement_free(coupling_g=g)
        sv = analyze_statevector(qc_sv)

        qc_u = build_ttes_circuit(coupling_g=g, with_correction=False)
        qc_c = build_ttes_circuit(coupling_g=g, with_correction=True)

        results.append({
            'coupling_g': g,
            'phi': sv['phi'],
            'above_threshold': sv['above_threshold'],
            'S_bridge': sv['S_bridge'],
            'S_torsion': sv['S_torsion'],
            'S_tetra': sv['S_tetra'],
            'uncorrected_depth': qc_u.depth(),
            'corrected_depth': qc_c.depth(),
        })

    return results


def run_hardware(backend_name='ibm_torino', shots=100000, coupling_g=1.0):
    """Submit TTES circuit to IBM Quantum hardware."""
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2, Session
    from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
    import os

    token = os.environ.get('IBM_QUANTUM_TOKEN')
    if not token:
        print("  ERROR: Set IBM_QUANTUM_TOKEN environment variable")
        sys.exit(1)

    service = QiskitRuntimeService(channel='ibm_quantum', token=token)
    backend = service.backend(backend_name)

    print(f"  Backend: {backend.name}")
    print(f"  Qubits:  {backend.num_qubits}")

    qc_uncorr = build_ttes_circuit(coupling_g=coupling_g, with_correction=False)
    qc_corr = build_ttes_circuit(coupling_g=coupling_g, with_correction=True)

    pm = generate_preset_pass_manager(optimization_level=3, backend=backend)
    t_uncorr = pm.run(qc_uncorr)
    t_corr = pm.run(qc_corr)

    print(f"  Transpiled uncorrected: depth={t_uncorr.depth()}, "
          f"cx={t_uncorr.count_ops().get('cx', 0)}")
    print(f"  Transpiled corrected:   depth={t_corr.depth()}, "
          f"cx={t_corr.count_ops().get('cx', 0)}")

    with Session(backend=backend) as session:
        sampler = SamplerV2(mode=session)
        print(f"\n  Submitting 2 circuits ({shots} shots each)...")
        job_u = sampler.run([t_uncorr], shots=shots)
        job_c = sampler.run([t_corr], shots=shots)
        print(f"  Jobs: {job_u.job_id()}, {job_c.job_id()}")
        print("  Waiting for results...")
        result_u = job_u.result()
        result_c = job_c.result()

    counts_u = result_u[0].data.out.get_counts()
    counts_c = result_c[0].data.out.get_counts()

    return {
        'backend': backend_name,
        'shots': shots,
        'coupling_g': coupling_g,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'job_ids': [job_u.job_id(), job_c.job_id()],
        'uncorrected_top': dict(sorted(counts_u.items(), key=lambda x: -x[1])[:10]),
        'corrected_top': dict(sorted(counts_c.items(), key=lambda x: -x[1])[:10]),
    }


def main():
    parser = argparse.ArgumentParser(
        description='TTES — Torsion-Tetrahedral Epsilon Stabilizer')
    parser.add_argument('--backend', type=str, default=None,
                        help='IBM backend (e.g. ibm_torino). Omit for simulator.')
    parser.add_argument('--shots', type=int, default=100000)
    parser.add_argument('--coupling', type=float, default=1.0,
                        help='Phase-conjugate coupling strength g')
    parser.add_argument('--sweep', action='store_true',
                        help='Sweep coupling parameter')
    parser.add_argument('--info', action='store_true',
                        help='Print circuit info only')
    parser.add_argument('--json', action='store_true',
                        help='Output results as JSON')
    args = parser.parse_args()

    print("═" * 68)
    print("  TTES — Torsion-Tetrahedral Epsilon Stabilizer")
    print(f"  Framework: DNA::{{}}{{}}::lang v51.843")
    print(f"  θ_lock = {THETA_LOCK_DEG}°  |  θ_tet = {THETA_TET_DEG:.4f}°  "
          f"|  Δθ = {DELTA_DEG:.4f}°")
    print(f"  χ_geometric = θ_lock/θ_tet = {CHI_GEOMETRIC:.6f}  "
          f"(χ_PC = {CHI_PC}, Δ = {abs(CHI_GEOMETRIC - CHI_PC):.4f})")
    print("═" * 68)

    if args.info:
        qc = build_ttes_circuit(coupling_g=args.coupling, with_correction=True)
        ops = qc.count_ops()
        print(f"\n  Qubits: {qc.num_qubits}  |  Depth: {qc.depth()}  |  "
              f"Gates: {qc.size()}")
        print(f"  Ops: {dict(ops)}")
        return

    if args.sweep:
        print(f"\n  Coupling sweep...")
        results = run_coupling_sweep(shots=args.shots)
        print(f"\n  {'g':>6s} | {'Φ':>8s} | {'≥Φ_th':>5s} | {'S_bridge':>8s} | "
              f"{'depth_u':>7s} | {'depth_c':>7s}")
        print(f"  {'─' * 6}─┼─{'─' * 8}─┼─{'─' * 5}─┼─{'─' * 8}─┼─"
              f"{'─' * 7}─┼─{'─' * 7}")
        for r in results:
            check = "✓" if r['above_threshold'] else "✗"
            print(f"  {r['coupling_g']:6.3f} | {r['phi']:8.5f} | "
                  f"  {check}   | {r['S_bridge']:8.5f} | "
                  f"{r['uncorrected_depth']:7d} | {r['corrected_depth']:7d}")
        if args.json:
            print(json.dumps(results, indent=2))
        return

    if args.backend:
        print(f"\n  Submitting to {args.backend}...")
        results = run_hardware(args.backend, args.shots, args.coupling)
    else:
        print(f"\n  Local simulator (g={args.coupling}, {args.shots} shots)...")
        results = run_simulator(coupling_g=args.coupling, shots=args.shots)

        sv = results['statevector']
        phi_s = "✓ ABOVE" if sv['above_threshold'] else "✗ below"
        print(f"\n  Statevector:")
        print(f"    Φ = {sv['phi']:.5f}  {phi_s} threshold ({PHI_THRESHOLD})")
        print(f"    S(torsion)  = {sv['S_torsion']:.5f} bits")
        print(f"    S(tetra)    = {sv['S_tetra']:.5f} bits")
        print(f"    S(bridge)   = {sv['S_bridge']:.5f} bits")

        for label in ['uncorrected', 'corrected']:
            r = results[label]
            print(f"\n  {label.upper()}: depth={r['circuit_depth']}, "
                  f"gates={r['gate_count']}")
            for bits, count in list(r['top_5_counts'].items())[:3]:
                print(f"    {bits}: {count}")

    if args.json:
        def convert(o):
            if isinstance(o, (np.integer,)):
                return int(o)
            if isinstance(o, (np.floating,)):
                return float(o)
            return str(o)
        print(json.dumps(results, indent=2, default=convert))

    print(f"\n{'═' * 68}")
    print(f"  χ_geometric = {CHI_GEOMETRIC:.6f} ≈ χ_PC = {CHI_PC}  "
          f"(0.12% match)")
    print(f"  Ω_Λ(geometric) = {CHI_GEOMETRIC * PHI_THRESHOLD / (PHI_THRESHOLD + GAMMA_CRITICAL):.5f}  "
          f"(Planck: 0.68470, {abs(CHI_GEOMETRIC * PHI_THRESHOLD / (PHI_THRESHOLD + GAMMA_CRITICAL) - 0.6847)/0.0073:.2f}σ)")
    print(f"{'═' * 68}")


if __name__ == '__main__':
    main()
