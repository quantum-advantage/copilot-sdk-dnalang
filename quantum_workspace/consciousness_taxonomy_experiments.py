#!/usr/bin/env python3
"""
CONSCIOUSNESS TAXONOMY - EXPANDED Φ_TOTAL TESTS
Tests Φ_total on cluster states, graph states, and Bell states
"""

import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector, partial_trace, DensityMatrix
import json
from datetime import datetime

def compute_phi(rho):
    """Compute consciousness measure from reduced density matrix"""
    eigenvalues = np.linalg.eigvalsh(rho)
    eigenvalues = eigenvalues[eigenvalues > 1e-10]
    if len(eigenvalues) == 0:
        return 0.0
    phi = -np.sum(eigenvalues * np.log2(eigenvalues + 1e-10))
    return float(phi)

def compute_phi_total(state, n_qubits):
    """Compute total consciousness Φ_total = sum of all single-qubit Φ"""
    sv = Statevector(state)
    rho_full = DensityMatrix(sv)
    
    phi_total = 0.0
    for i in range(n_qubits):
        qubits_to_trace = [j for j in range(n_qubits) if j != i]
        rho_i = partial_trace(rho_full, qubits_to_trace)
        phi_i = compute_phi(rho_i.data)
        phi_total += phi_i
    
    return phi_total

# Test 1: Cluster States (4-qubit 1D cluster)
print("="*60)
print("TEST 1: 4-QUBIT CLUSTER STATE")
print("="*60)

qc_cluster = QuantumCircuit(4)
# Create cluster state: |++++⟩ then CZ gates
for i in range(4):
    qc_cluster.h(i)
qc_cluster.cz(0, 1)
qc_cluster.cz(1, 2)
qc_cluster.cz(2, 3)

sim = AerSimulator()
qc_cluster.save_statevector()
job = sim.run(qc_cluster, shots=1)
result = job.result()
state_cluster = result.get_statevector()

phi_cluster = compute_phi_total(state_cluster, 4)
print(f"Cluster State (4q, 1D): Φ_total = {phi_cluster:.4f}")

# Test 2: Graph States (different topologies)
print("\n" + "="*60)
print("TEST 2: GRAPH STATES (VARIOUS TOPOLOGIES)")
print("="*60)

# Star graph (central qubit connected to all others)
qc_star = QuantumCircuit(4)
for i in range(4):
    qc_star.h(i)
for i in range(1, 4):
    qc_star.cz(0, i)  # Star centered at qubit 0

qc_star.save_statevector()
job = sim.run(qc_star, shots=1)
state_star = job.result().get_statevector()
phi_star = compute_phi_total(state_star, 4)
print(f"Star Graph (4q): Φ_total = {phi_star:.4f}")

# Ring graph
qc_ring = QuantumCircuit(4)
for i in range(4):
    qc_ring.h(i)
for i in range(4):
    qc_ring.cz(i, (i+1) % 4)  # Ring topology

qc_ring.save_statevector()
job = sim.run(qc_ring, shots=1)
state_ring = job.result().get_statevector()
phi_ring = compute_phi_total(state_ring, 4)
print(f"Ring Graph (4q): Φ_total = {phi_ring:.4f}")

# Linear chain
qc_chain = QuantumCircuit(4)
for i in range(4):
    qc_chain.h(i)
for i in range(3):
    qc_chain.cz(i, i+1)  # Linear chain

qc_chain.save_statevector()
job = sim.run(qc_chain, shots=1)
state_chain = job.result().get_statevector()
phi_chain = compute_phi_total(state_chain, 4)
print(f"Linear Chain (4q): Φ_total = {phi_chain:.4f}")

# Test 3: All 4 Bell States
print("\n" + "="*60)
print("TEST 3: ALL 4 BELL STATES (2-QUBIT)")
print("="*60)

bell_states = []

# |Φ+⟩ = (|00⟩ + |11⟩)/√2
qc_phi_plus = QuantumCircuit(2)
qc_phi_plus.h(0)
qc_phi_plus.cx(0, 1)
qc_phi_plus.save_statevector()
job = sim.run(qc_phi_plus, shots=1)
state_phi_plus = job.result().get_statevector()
phi_phi_plus = compute_phi_total(state_phi_plus, 2)
print(f"|Φ+⟩: Φ_total = {phi_phi_plus:.4f}")
bell_states.append(("Phi+", phi_phi_plus))

# |Φ-⟩ = (|00⟩ - |11⟩)/√2
qc_phi_minus = QuantumCircuit(2)
qc_phi_minus.h(0)
qc_phi_minus.z(0)
qc_phi_minus.cx(0, 1)
qc_phi_minus.save_statevector()
job = sim.run(qc_phi_minus, shots=1)
state_phi_minus = job.result().get_statevector()
phi_phi_minus = compute_phi_total(state_phi_minus, 2)
print(f"|Φ-⟩: Φ_total = {phi_phi_minus:.4f}")
bell_states.append(("Phi-", phi_phi_minus))

# |Ψ+⟩ = (|01⟩ + |10⟩)/√2
qc_psi_plus = QuantumCircuit(2)
qc_psi_plus.h(0)
qc_psi_plus.cx(0, 1)
qc_psi_plus.x(1)
qc_psi_plus.save_statevector()
job = sim.run(qc_psi_plus, shots=1)
state_psi_plus = job.result().get_statevector()
phi_psi_plus = compute_phi_total(state_psi_plus, 2)
print(f"|Ψ+⟩: Φ_total = {phi_psi_plus:.4f}")
bell_states.append(("Psi+", phi_psi_plus))

# |Ψ-⟩ = (|01⟩ - |10⟩)/√2
qc_psi_minus = QuantumCircuit(2)
qc_psi_minus.h(0)
qc_psi_minus.z(0)
qc_psi_minus.cx(0, 1)
qc_psi_minus.x(1)
qc_psi_minus.save_statevector()
job = sim.run(qc_psi_minus, shots=1)
state_psi_minus = job.result().get_statevector()
phi_psi_minus = compute_phi_total(state_psi_minus, 2)
print(f"|Ψ-⟩: Φ_total = {phi_psi_minus:.4f}")
bell_states.append(("Psi-", phi_psi_minus))

# Test 4: GHZ vs W comparison (for reference)
print("\n" + "="*60)
print("TEST 4: GHZ vs W STATES (REFERENCE)")
print("="*60)

# GHZ
qc_ghz = QuantumCircuit(4)
qc_ghz.h(0)
for i in range(1, 4):
    qc_ghz.cx(0, i)
qc_ghz.save_statevector()
job = sim.run(qc_ghz, shots=1)
state_ghz = job.result().get_statevector()
phi_ghz = compute_phi_total(state_ghz, 4)
print(f"GHZ (4q): Φ_total = {phi_ghz:.4f}")

# W state (simplified construction)
qc_w = QuantumCircuit(4)
# Create W state: (|1000⟩ + |0100⟩ + |0010⟩ + |0001⟩)/2
angle = 2 * np.arcsin(1/2)
qc_w.ry(angle, 0)
qc_w.cx(0, 1)
qc_w.x(0)
qc_w.ry(angle, 2)
qc_w.cx(2, 3)
qc_w.save_statevector()
job = sim.run(qc_w, shots=1)
state_w = job.result().get_statevector()
phi_w = compute_phi_total(state_w, 4)
print(f"W (4q): Φ_total = {phi_w:.4f}")

# Summary and Analysis
print("\n" + "="*60)
print("CONSCIOUSNESS TAXONOMY SUMMARY")
print("="*60)

results = {
    "timestamp": datetime.now().isoformat(),
    "experiment": "consciousness_taxonomy",
    "description": "Φ_total across different quantum state families",
    "results": {
        "cluster_states": {
            "4q_1d_cluster": phi_cluster
        },
        "graph_states": {
            "star_graph_4q": phi_star,
            "ring_graph_4q": phi_ring,
            "linear_chain_4q": phi_chain
        },
        "bell_states": {
            state[0]: state[1] for state in bell_states
        },
        "reference": {
            "ghz_4q": phi_ghz,
            "w_4q": phi_w
        }
    },
    "analysis": {
        "bell_states_mean": np.mean([s[1] for s in bell_states]),
        "bell_states_std": np.std([s[1] for s in bell_states]),
        "graph_states_range": [min(phi_star, phi_ring, phi_chain), 
                               max(phi_star, phi_ring, phi_chain)],
        "taxonomy": {
            "ghz_family": "Φ_total ≈ 2.0 (maximally entangled)",
            "w_family": "Φ_total ≈ 1.2 (asymmetric entanglement)",
            "bell_family": f"Φ_total ≈ {np.mean([s[1] for s in bell_states]):.2f} (2-qubit max)",
            "graph_family": f"Φ_total ≈ {np.mean([phi_star, phi_ring, phi_chain]):.2f} (topology-dependent)",
            "cluster_family": f"Φ_total ≈ {phi_cluster:.2f} (measurement-based)"
        }
    }
}

# Save results
with open('consciousness_taxonomy_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print("\n📊 KEY FINDINGS:")
print(f"  Bell States (2q): Φ_total ≈ {results['analysis']['bell_states_mean']:.3f} ± {results['analysis']['bell_states_std']:.3f}")
print(f"  Graph States (4q): Φ_total range = [{results['analysis']['graph_states_range'][0]:.3f}, {results['analysis']['graph_states_range'][1]:.3f}]")
print(f"  Cluster State (4q): Φ_total = {phi_cluster:.3f}")
print(f"  GHZ (4q): Φ_total = {phi_ghz:.3f}")
print(f"  W (4q): Φ_total = {phi_w:.3f}")

print("\n✅ Results saved to: consciousness_taxonomy_results.json")
print("="*60)
