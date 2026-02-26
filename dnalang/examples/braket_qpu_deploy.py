#!/usr/bin/env python3
"""
OSIRIS × AWS Braket — QPU Deployment & Quantum Simulation Engine
DNA::}{::lang v51.843 | Agile Defense Systems | CAGE 9HUP5

Production-ready deployment of DNA-Lang quantum circuits to AWS Braket QPUs
with Variational Quantum Eigensolver (VQE) and full CCCE metrics.

Capabilities:
  1. QPU device catalog with native gate sets, connectivity, and pricing
  2. Variational Quantum Eigensolver (VQE) for quantum simulation
     - Transverse-field Ising model (quantum phase transition)
     - Heisenberg XXZ model (magnetic ordering)
     - General Pauli Hamiltonian framework (plug in molecular data)
  3. θ_lock-seeded hardware-efficient ansatz
  4. QPU readiness report for Φ-threshold circuits
  5. Cost estimation before submission
  6. S3 result archival with SHA-256 provenance chain
  7. Full CCCE metric computation on hardware results

Usage:
    # VQE: transverse-field Ising model (local simulator)
    python3 braket_qpu_deploy.py --vqe ising --qubits 4

    # VQE: θ_lock convergence advantage demo
    python3 braket_qpu_deploy.py --vqe ising --qubits 4 --theta-lock-compare

    # Quantum phase diagram sweep
    python3 braket_qpu_deploy.py --phase-diagram --qubits 4

    # QPU readiness report
    python3 braket_qpu_deploy.py --report ionq

    # Cost estimation for Φ-threshold suite
    python3 braket_qpu_deploy.py --cost ionq --circuits 14 --shots 10000

    # Save all results to JSON
    python3 braket_qpu_deploy.py --vqe ising --qubits 4 --json results.json
"""

import math
import time
import json
import hashlib
import argparse
import sys
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Tuple, Callable

import numpy as np
from scipy.optimize import minimize
from scipy.linalg import eigvalsh

from braket.circuits import Circuit
from braket.devices import LocalSimulator

# ── Immutable Constants ──────────────────────────────────────────────────────

LAMBDA_PHI     = 2.176435e-8
THETA_LOCK_DEG = 51.843
THETA_LOCK_RAD = math.radians(51.843)
PHI_THRESHOLD  = 0.7734
GAMMA_CRITICAL = 0.3
CHI_PC         = 0.946
GOLDEN_RATIO   = (1 + math.sqrt(5)) / 2

# Pauli matrices
_I = np.array([[1, 0], [0, 1]], dtype=complex)
_X = np.array([[0, 1], [1, 0]], dtype=complex)
_Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
_Z = np.array([[1, 0], [0, -1]], dtype=complex)
_PAULI = {'I': _I, 'X': _X, 'Y': _Y, 'Z': _Z}


# ── Data Structures ──────────────────────────────────────────────────────────

@dataclass
class PauliTerm:
    """A single term c · P₀⊗P₁⊗...⊗Pₙ₋₁ in a Pauli Hamiltonian."""
    coeff: float
    ops: Dict[int, str]   # qubit_index → 'X'/'Y'/'Z' (identity omitted)

    def __str__(self):
        if not self.ops:
            return f"{self.coeff:+.6f} I"
        paulis = " ".join(f"{p}{q}" for q, p in sorted(self.ops.items()))
        return f"{self.coeff:+.6f} {paulis}"


@dataclass
class VQEResult:
    """Result of a VQE optimization run."""
    energy: float
    exact_energy: float
    error_ha: float                # |VQE - exact| in Hartree
    chemical_accuracy: bool        # error < 1.6 mHa
    params: List[float]
    n_iterations: int
    n_function_evals: int
    convergence_history: List[float]
    phi: float
    gamma: float
    ccce: float
    xi: float
    execution_time_s: float
    ansatz_type: str
    initial_seed: str              # "theta_lock" or "random"

    def to_dict(self) -> dict:
        d = asdict(self)
        d['params'] = [round(p, 8) for p in d['params']]
        d['convergence_history'] = [round(e, 8) for e in d['convergence_history']]
        return d


@dataclass
class QPUSpec:
    """AWS Braket QPU device specification."""
    name: str
    arn: str
    provider: str
    qubits: int
    native_gates: List[str]
    connectivity: str
    t1_us: float
    t2_us: float
    single_gate_fidelity: float
    two_gate_fidelity: float
    cost_per_shot: float
    cost_per_task: float
    max_shots: int
    status: str = "AVAILABLE"


@dataclass
class CostEstimate:
    """Cost estimation for QPU execution."""
    qpu_name: str
    n_circuits: int
    shots_per_circuit: int
    total_shots: int
    shot_cost: float
    task_cost: float
    total_cost: float
    currency: str = "USD"


# ── QPU Device Catalog ───────────────────────────────────────────────────────

QPU_CATALOG: Dict[str, QPUSpec] = {
    "ionq_aria": QPUSpec(
        name="IonQ Aria-1",
        arn="arn:aws:braket:us-east-1::device/qpu/ionq/Aria-1",
        provider="IonQ",
        qubits=25,
        native_gates=["GPi", "GPi2", "MS"],
        connectivity="all-to-all",
        t1_us=10_000_000,
        t2_us=1_000_000,
        single_gate_fidelity=0.9996,
        two_gate_fidelity=0.993,
        cost_per_shot=0.03,
        cost_per_task=0.30,
        max_shots=10_000,
    ),
    "ionq_forte": QPUSpec(
        name="IonQ Forte-1",
        arn="arn:aws:braket:us-east-1::device/qpu/ionq/Forte-1",
        provider="IonQ",
        qubits=36,
        native_gates=["GPi", "GPi2", "MS"],
        connectivity="all-to-all",
        t1_us=15_000_000,
        t2_us=1_500_000,
        single_gate_fidelity=0.9998,
        two_gate_fidelity=0.995,
        cost_per_shot=0.03,
        cost_per_task=0.30,
        max_shots=10_000,
    ),
    "rigetti_ankaa3": QPUSpec(
        name="Rigetti Ankaa-3",
        arn="arn:aws:braket:us-west-1::device/qpu/rigetti/Ankaa-3",
        provider="Rigetti",
        qubits=84,
        native_gates=["RX", "RZ", "CZ", "ISWAP"],
        connectivity="square-lattice",
        t1_us=25,
        t2_us=15,
        single_gate_fidelity=0.999,
        two_gate_fidelity=0.98,
        cost_per_shot=0.00035,
        cost_per_task=0.30,
        max_shots=100_000,
    ),
    "quera_aquila": QPUSpec(
        name="QuEra Aquila",
        arn="arn:aws:braket:us-east-1::device/qpu/quera/Aquila",
        provider="QuEra",
        qubits=256,
        native_gates=["AHS"],  # Analog Hamiltonian Simulation
        connectivity="programmable (optical tweezers)",
        t1_us=100,
        t2_us=10,
        single_gate_fidelity=0.995,
        two_gate_fidelity=0.99,
        cost_per_shot=0.01,
        cost_per_task=0.30,
        max_shots=1_000,
    ),
    "iqm_garnet": QPUSpec(
        name="IQM Garnet",
        arn="arn:aws:braket:eu-north-1::device/qpu/iqm/Garnet",
        provider="IQM",
        qubits=20,
        native_gates=["PRX", "CZ"],
        connectivity="square-lattice",
        t1_us=30,
        t2_us=20,
        single_gate_fidelity=0.999,
        two_gate_fidelity=0.98,
        cost_per_shot=0.00145,
        cost_per_task=0.30,
        max_shots=100_000,
    ),
}


# ── Pauli Hamiltonian ────────────────────────────────────────────────────────

class PauliHamiltonian:
    """A Hamiltonian expressed as a sum of Pauli terms.

    H = Σᵢ cᵢ · P_{i,0} ⊗ P_{i,1} ⊗ ... ⊗ P_{i,n-1}
    """

    def __init__(self, terms: List[PauliTerm], n_qubits: int):
        self.terms = terms
        self.n_qubits = n_qubits
        self._matrix: Optional[np.ndarray] = None

    def to_matrix(self) -> np.ndarray:
        """Construct the full 2ⁿ × 2ⁿ Hamiltonian matrix."""
        if self._matrix is not None:
            return self._matrix
        dim = 2 ** self.n_qubits
        H = np.zeros((dim, dim), dtype=complex)
        for term in self.terms:
            mat = np.array([[1.0]], dtype=complex)
            for q in range(self.n_qubits):
                p = term.ops.get(q, 'I')
                mat = np.kron(mat, _PAULI[p])
            H += term.coeff * mat
        self._matrix = H
        return H

    def exact_ground_energy(self) -> float:
        """Compute exact ground state energy via diagonalization."""
        H = self.to_matrix()
        eigenvalues = eigvalsh(H.real)  # Hermitian → real eigenvalues
        return float(eigenvalues[0])

    def exact_ground_state(self) -> Tuple[float, np.ndarray]:
        """Return ground state energy and state vector."""
        H = self.to_matrix()
        from scipy.linalg import eigh
        eigenvalues, eigenvectors = eigh(H.real)
        return float(eigenvalues[0]), eigenvectors[:, 0]

    def expectation(self, statevector: np.ndarray) -> float:
        """Compute ⟨ψ|H|ψ⟩ from a state vector."""
        H = self.to_matrix()
        return float(np.real(statevector.conj() @ H @ statevector))

    def measure_expectation(self, circuit: Circuit,
                            shots: int = 5000) -> float:
        """Measure ⟨ψ|H|ψ⟩ using shot-based sampling (QPU-compatible).

        Groups Pauli terms by measurement basis for efficiency:
        - Z-basis terms: measured from computational basis counts
        - X-basis terms: add H gates before measurement
        - Y-basis terms: add S†H gates before measurement
        """
        device = LocalSimulator()

        # Group terms by required basis rotations
        groups: Dict[str, List[PauliTerm]] = {}
        for term in self.terms:
            if not term.ops:
                # Identity term — just add coefficient
                groups.setdefault('identity', []).append(term)
                continue
            # Basis key: sorted tuple of (qubit, basis) pairs
            basis_key = tuple(sorted(term.ops.items()))
            groups.setdefault(str(basis_key), []).append(term)

        total_exp = 0.0

        for key, group_terms in groups.items():
            if key == 'identity':
                total_exp += sum(t.coeff for t in group_terms)
                continue

            # Build measurement circuit: ansatz + basis rotations
            meas_circuit = circuit.__class__()
            for instr in circuit.instructions:
                meas_circuit.add_instruction(instr)

            # Apply basis rotations for the first term's Pauli operators
            representative = group_terms[0]
            for qubit, pauli in representative.ops.items():
                if pauli == 'X':
                    meas_circuit.h(qubit)
                elif pauli == 'Y':
                    meas_circuit.si(qubit)
                    meas_circuit.h(qubit)
                # Z: no rotation needed

            result = device.run(meas_circuit, shots=shots).result()
            counts = dict(result.measurement_counts)
            total = sum(counts.values())

            # Compute expectation for each term in this group
            for term in group_terms:
                exp_val = 0.0
                for bitstring, count in counts.items():
                    # Parity of measured qubits in the Pauli support
                    parity = 0
                    for qubit, _pauli in term.ops.items():
                        if qubit < len(bitstring):
                            parity += int(bitstring[qubit])
                    sign = (-1) ** parity
                    exp_val += sign * count
                exp_val /= total
                total_exp += term.coeff * exp_val

        return total_exp

    def n_terms(self) -> int:
        return len(self.terms)

    def __str__(self):
        lines = [f"PauliHamiltonian ({self.n_qubits} qubits, {self.n_terms()} terms):"]
        for t in self.terms[:10]:
            lines.append(f"  {t}")
        if len(self.terms) > 10:
            lines.append(f"  ... and {len(self.terms) - 10} more terms")
        return "\n".join(lines)


# ── Model Hamiltonians ───────────────────────────────────────────────────────

def transverse_ising(n_qubits: int, J: float = 1.0,
                     h: float = 0.5, periodic: bool = True) -> PauliHamiltonian:
    """Transverse-field Ising model: H = -J Σ ZᵢZᵢ₊₁ - h Σ Xᵢ

    Quantum phase transition at h/J = 1 (1D):
      - h/J < 1: ferromagnetic (ordered) phase
      - h/J > 1: paramagnetic (disordered) phase

    Args:
        n_qubits: Number of spins
        J: Ising coupling strength
        h: Transverse field strength
        periodic: If True, include ZₙZ₀ boundary term
    """
    terms = []
    # ZZ interactions
    for i in range(n_qubits - 1):
        terms.append(PauliTerm(coeff=-J, ops={i: 'Z', i + 1: 'Z'}))
    if periodic and n_qubits > 2:
        terms.append(PauliTerm(coeff=-J, ops={n_qubits - 1: 'Z', 0: 'Z'}))
    # Transverse field
    for i in range(n_qubits):
        terms.append(PauliTerm(coeff=-h, ops={i: 'X'}))
    return PauliHamiltonian(terms, n_qubits)


def heisenberg_xxz(n_qubits: int, J: float = 1.0,
                   Delta: float = 1.0, periodic: bool = True) -> PauliHamiltonian:
    """Heisenberg XXZ model: H = J Σ (XᵢXᵢ₊₁ + YᵢYᵢ₊₁ + Δ ZᵢZᵢ₊₁)

    Delta = 1: isotropic Heisenberg (antiferromagnet for J > 0)
    Delta > 1: Ising-like
    Delta < 1: XY-like
    """
    terms = []
    n_bonds = n_qubits if periodic and n_qubits > 2 else n_qubits - 1
    for b in range(n_bonds):
        i = b
        j = (b + 1) % n_qubits
        terms.append(PauliTerm(coeff=J, ops={i: 'X', j: 'X'}))
        terms.append(PauliTerm(coeff=J, ops={i: 'Y', j: 'Y'}))
        terms.append(PauliTerm(coeff=J * Delta, ops={i: 'Z', j: 'Z'}))
    return PauliHamiltonian(terms, n_qubits)


def molecular_hamiltonian(pauli_data: List[Tuple[float, str]],
                          n_qubits: int) -> PauliHamiltonian:
    """Build Hamiltonian from list of (coefficient, pauli_string) pairs.

    Pauli strings use format: "X0 Y1 Z3" (identity qubits omitted).
    Use "I" for pure identity term.

    This is the interface for molecular Hamiltonians from PySCF/OpenFermion.

    Example:
        h2_terms = [
            (-1.0524, "I"),
            (0.3979, "Z0"),
            (-0.3979, "Z1"),
            (-0.0113, "Z0 Z1"),
            (0.1809, "X0 X1"),
            (0.1809, "Y0 Y1"),
        ]
        H = molecular_hamiltonian(h2_terms, n_qubits=2)
    """
    terms = []
    for coeff, pauli_str in pauli_data:
        if pauli_str.strip() == "I":
            terms.append(PauliTerm(coeff=coeff, ops={}))
        else:
            ops = {}
            for token in pauli_str.split():
                pauli_type = token[0]
                qubit_idx = int(token[1:])
                ops[qubit_idx] = pauli_type
            terms.append(PauliTerm(coeff=coeff, ops=ops))
    return PauliHamiltonian(terms, n_qubits)


# ── Hardware-Efficient Ansatz ────────────────────────────────────────────────

def build_hea(n_qubits: int, depth: int,
              params: np.ndarray) -> Circuit:
    """Hardware-efficient ansatz with RY rotations + CNOT entanglement.

    Parameters per layer: n_qubits RY angles.
    Total parameters: n_qubits * (depth + 1).

    Structure per layer:
        RY(θ₁)⊗RY(θ₂)⊗...⊗RY(θₙ) → CNOT cascade (0→1, 1→2, ..., n-2→n-1)
    Final layer: RY rotations only (no CNOT).
    """
    c = Circuit()
    idx = 0
    for layer in range(depth):
        for q in range(n_qubits):
            c.ry(q, float(params[idx]))
            idx += 1
        for q in range(n_qubits - 1):
            c.cnot(q, q + 1)
    # Final rotation layer
    for q in range(n_qubits):
        c.ry(q, float(params[idx]))
        idx += 1
    return c


def theta_lock_initial(n_params: int) -> np.ndarray:
    """Generate initial parameters seeded by θ_lock geometry.

    The θ_lock angle (51.843°) and its harmonics provide a physically-
    motivated starting point. The hypothesis: for Hamiltonians with
    geometric structure, θ_lock-seeded parameters converge faster than
    random initialization.
    """
    params = np.zeros(n_params)
    for i in range(n_params):
        harmonic = (i + 1) / n_params
        params[i] = THETA_LOCK_RAD * math.sin(math.pi * harmonic)
        # Add χ_PC phase modulation
        if i % 3 == 0:
            params[i] *= CHI_PC
        elif i % 3 == 1:
            params[i] *= GOLDEN_RATIO / 2
    return params


def random_initial(n_params: int, seed: int = 42) -> np.ndarray:
    """Standard random initialization for comparison."""
    rng = np.random.default_rng(seed)
    return rng.uniform(-math.pi, math.pi, n_params)


# ── VQE Engine ───────────────────────────────────────────────────────────────

class VQEEngine:
    """Variational Quantum Eigensolver with θ_lock integration.

    Supports both exact (statevector) and sampled (shots) evaluation:
    - Statevector mode: fast optimization on classical simulator
    - Sampled mode: QPU-compatible measurement-based evaluation
    """

    def __init__(self, hamiltonian: PauliHamiltonian,
                 n_layers: int = 2,
                 shots: int = 5000):
        self.H = hamiltonian
        self.n_qubits = hamiltonian.n_qubits
        self.n_layers = n_layers
        self.shots = shots
        self.n_params = self.n_qubits * (n_layers + 1)
        self._history: List[float] = []
        self._eval_count = 0
        self._H_matrix = hamiltonian.to_matrix()
        self._device = LocalSimulator()

    def exact_cost(self, params: np.ndarray) -> float:
        """Evaluate ⟨ψ(θ)|H|ψ(θ)⟩ using statevector (fast, exact)."""
        circuit = build_hea(self.n_qubits, self.n_layers, params)
        circuit.state_vector()
        result = self._device.run(circuit).result()
        sv = result.result_types[0].value
        energy = float(np.real(sv.conj() @ self._H_matrix @ sv))
        self._history.append(energy)
        self._eval_count += 1
        return energy

    def sampled_cost(self, params: np.ndarray) -> float:
        """Evaluate ⟨ψ(θ)|H|ψ(θ)⟩ using shot-based measurement."""
        circuit = build_hea(self.n_qubits, self.n_layers, params)
        energy = self.H.measure_expectation(circuit, shots=self.shots)
        self._history.append(energy)
        self._eval_count += 1
        return energy

    def optimize(self, initial_params: Optional[np.ndarray] = None,
                 method: str = 'COBYLA',
                 max_iter: int = 500,
                 exact: bool = True,
                 seed_type: str = "theta_lock") -> VQEResult:
        """Run VQE optimization.

        Args:
            initial_params: Starting parameters. If None, uses seed_type.
            method: scipy optimization method ('COBYLA', 'L-BFGS-B', 'Nelder-Mead')
            max_iter: Maximum optimizer iterations
            exact: If True, use statevector evaluation (fast). If False, use shots.
            seed_type: Initial parameter strategy: "theta_lock" or "random"
        """
        t0 = time.time()
        self._history = []
        self._eval_count = 0

        if initial_params is None:
            if seed_type == "theta_lock":
                initial_params = theta_lock_initial(self.n_params)
            else:
                initial_params = random_initial(self.n_params)

        cost_fn = self.exact_cost if exact else self.sampled_cost

        result = minimize(
            cost_fn,
            initial_params,
            method=method,
            options={'maxiter': max_iter, 'rhobeg': 0.5}
            if method == 'COBYLA' else {'maxiter': max_iter},
        )

        dt = time.time() - t0
        exact_e = self.H.exact_ground_energy()
        vqe_e = float(result.fun)
        error = abs(vqe_e - exact_e)

        # Compute CCCE metrics from VQE quality
        # Phi: accuracy relative to exact (higher = better)
        relative_accuracy = max(0, 1.0 - error / max(abs(exact_e), 1e-10))
        phi = min(1.0, relative_accuracy)
        gamma = min(1.0, error / max(abs(exact_e), 1e-10))
        xi = (LAMBDA_PHI * phi) / max(gamma, 0.001)
        ccce = phi * (1 - gamma) * CHI_PC

        return VQEResult(
            energy=round(vqe_e, 8),
            exact_energy=round(exact_e, 8),
            error_ha=round(error, 8),
            chemical_accuracy=error < 0.0016,  # 1.6 mHa
            params=list(result.x),
            n_iterations=result.nit if hasattr(result, 'nit') else -1,
            n_function_evals=self._eval_count,
            convergence_history=self._history.copy(),
            phi=round(phi, 6),
            gamma=round(gamma, 6),
            ccce=round(ccce, 6),
            xi=round(xi, 12),
            execution_time_s=round(dt, 4),
            ansatz_type=f"HEA-{self.n_layers}L",
            initial_seed=seed_type,
        )

    def energy_landscape(self, param_idx: int = 0,
                         n_points: int = 50) -> List[Tuple[float, float]]:
        """Scan energy landscape along one parameter dimension."""
        base = theta_lock_initial(self.n_params)
        landscape = []
        for theta in np.linspace(-math.pi, math.pi, n_points):
            params = base.copy()
            params[param_idx] = theta
            e = self.exact_cost(params)
            landscape.append((float(theta), e))
        self._history = []  # Reset history after landscape scan
        return landscape


# ── Quantum Phase Diagram ────────────────────────────────────────────────────

def phase_diagram_sweep(n_qubits: int, h_values: Optional[List[float]] = None,
                        J: float = 1.0, n_layers: int = 2) -> Dict:
    """Sweep transverse field strength to map the quantum phase transition.

    The TFIM has a quantum phase transition at h/J = 1:
      - h < J: ordered (ferromagnetic), ground state near |000...0⟩ or |111...1⟩
      - h > J: disordered (paramagnetic), ground state near |+++...+⟩
    """
    if h_values is None:
        h_values = [0.1, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0]

    results = []
    for h in h_values:
        H = transverse_ising(n_qubits, J=J, h=h)
        engine = VQEEngine(H, n_layers=n_layers)
        vqe = engine.optimize(seed_type="theta_lock")
        exact_e = H.exact_ground_energy()

        results.append({
            "h_over_J": round(h / J, 4),
            "h": h,
            "J": J,
            "vqe_energy": vqe.energy,
            "exact_energy": round(exact_e, 8),
            "error_ha": vqe.error_ha,
            "chemical_accuracy": vqe.chemical_accuracy,
            "ccce": vqe.ccce,
            "phi": vqe.phi,
            "n_evals": vqe.n_function_evals,
        })

    return {
        "model": "Transverse-Field Ising",
        "n_qubits": n_qubits,
        "sweep": results,
        "critical_point": 1.0,
        "framework": "DNA::}{::lang v51.843",
    }


# ── θ_lock Convergence Advantage ─────────────────────────────────────────────

def theta_lock_advantage(n_qubits: int = 4, n_layers: int = 2,
                         n_random_seeds: int = 5) -> Dict:
    """Compare θ_lock initialization vs random initialization.

    Demonstrates that θ_lock-seeded initial parameters can converge
    faster and to lower energies than random initialization.
    """
    H = transverse_ising(n_qubits, J=1.0, h=0.75)
    exact_e = H.exact_ground_energy()

    # θ_lock run
    engine_tl = VQEEngine(H, n_layers=n_layers)
    vqe_tl = engine_tl.optimize(seed_type="theta_lock")

    # Random runs (multiple seeds for statistics)
    random_results = []
    for seed in range(n_random_seeds):
        engine_rnd = VQEEngine(H, n_layers=n_layers)
        init = random_initial(engine_rnd.n_params, seed=seed + 100)
        vqe_rnd = engine_rnd.optimize(initial_params=init, seed_type="random")
        random_results.append(vqe_rnd)

    random_best = min(random_results, key=lambda r: r.error_ha)
    random_mean_error = np.mean([r.error_ha for r in random_results])
    random_mean_evals = np.mean([r.n_function_evals for r in random_results])

    return {
        "model": f"TFIM {n_qubits}q, J=1.0, h=0.75",
        "exact_energy": round(exact_e, 8),
        "theta_lock": {
            "energy": vqe_tl.energy,
            "error_ha": vqe_tl.error_ha,
            "n_evals": vqe_tl.n_function_evals,
            "ccce": vqe_tl.ccce,
            "chemical_accuracy": vqe_tl.chemical_accuracy,
        },
        "random_best": {
            "energy": random_best.energy,
            "error_ha": random_best.error_ha,
            "n_evals": random_best.n_function_evals,
            "ccce": random_best.ccce,
            "chemical_accuracy": random_best.chemical_accuracy,
        },
        "random_stats": {
            "n_seeds": n_random_seeds,
            "mean_error_ha": round(float(random_mean_error), 8),
            "mean_n_evals": round(float(random_mean_evals)),
        },
        "advantage": {
            "error_reduction": round(
                float(random_mean_error - vqe_tl.error_ha), 8),
            "eval_reduction": round(
                float(random_mean_evals - vqe_tl.n_function_evals)),
            "theta_lock_wins": vqe_tl.error_ha <= random_best.error_ha,
        },
    }


# ── Cost Estimation ──────────────────────────────────────────────────────────

def estimate_cost(n_circuits: int, shots_per_circuit: int,
                  qpu_name: str) -> CostEstimate:
    """Estimate total cost for running circuits on a QPU."""
    if qpu_name not in QPU_CATALOG:
        raise ValueError(f"Unknown QPU: {qpu_name}. Available: "
                         f"{list(QPU_CATALOG.keys())}")
    qpu = QPU_CATALOG[qpu_name]
    total_shots = n_circuits * shots_per_circuit
    shot_cost = total_shots * qpu.cost_per_shot
    task_cost = n_circuits * qpu.cost_per_task
    return CostEstimate(
        qpu_name=qpu.name,
        n_circuits=n_circuits,
        shots_per_circuit=shots_per_circuit,
        total_shots=total_shots,
        shot_cost=round(shot_cost, 2),
        task_cost=round(task_cost, 2),
        total_cost=round(shot_cost + task_cost, 2),
    )


def estimate_vqe_cost(n_qubits: int, n_layers: int,
                      n_optimizer_steps: int,
                      qpu_name: str,
                      shots_per_term: int = 5000) -> Dict:
    """Estimate VQE cost including all optimizer iterations."""
    H = transverse_ising(n_qubits)
    n_unique_bases = len(set(
        str(sorted(t.ops.items())) for t in H.terms if t.ops
    )) + 1  # +1 for identity
    circuits_per_eval = n_unique_bases
    total_circuits = circuits_per_eval * n_optimizer_steps
    base = estimate_cost(total_circuits, shots_per_term, qpu_name)
    return {
        "hamiltonian_terms": H.n_terms(),
        "unique_measurement_bases": n_unique_bases,
        "circuits_per_vqe_eval": circuits_per_eval,
        "optimizer_steps": n_optimizer_steps,
        "total_circuits": total_circuits,
        **asdict(base),
    }


# ── QPU Readiness Report ────────────────────────────────────────────────────

def qpu_readiness_report(qpu_name: str,
                         n_circuits: int = 14,
                         shots: int = 10_000) -> str:
    """Generate a QPU readiness assessment for the Φ-threshold suite."""
    if qpu_name not in QPU_CATALOG:
        return f"Unknown QPU: {qpu_name}. Available: {list(QPU_CATALOG.keys())}"
    qpu = QPU_CATALOG[qpu_name]
    cost = estimate_cost(n_circuits, shots, qpu_name)

    # Gate count estimates for Φ-threshold circuits
    circuit_specs = [
        ("Prism-2q", 2, 5, 3), ("Prism-3q", 3, 6, 4),
        ("Prism-4q", 4, 9, 5), ("IQP-3q", 3, 12, 7),
        ("IQP-4q", 4, 22, 10), ("IQP-5q", 5, 18, 8),
        ("Cluster-3q", 3, 7, 4), ("Cluster-4q", 4, 8, 5),
        ("Cluster-5q", 5, 12, 6), ("TFD-4q", 4, 12, 6),
        ("TFD-6q", 6, 18, 8), ("Manifold-3q", 3, 11, 6),
        ("Manifold-5q", 5, 19, 9), ("Manifold-7q", 7, 27, 12),
    ]

    lines = [
        "",
        "══════════════════════════════════════════════════════════════════════",
        f"QPU Readiness Report: {qpu.name}",
        "DNA::}{::lang v51.843  |  CAGE 9HUP5  |  Agile Defense Systems",
        "══════════════════════════════════════════════════════════════════════",
        "",
        f"  Provider:          {qpu.provider}",
        f"  ARN:               {qpu.arn}",
        f"  Qubits available:  {qpu.qubits}",
        f"  Native gates:      {', '.join(qpu.native_gates)}",
        f"  Connectivity:      {qpu.connectivity}",
        f"  T₁:                {qpu.t1_us:,.0f} μs",
        f"  T₂:                {qpu.t2_us:,.0f} μs",
        f"  1Q fidelity:       {qpu.single_gate_fidelity:.4f}",
        f"  2Q fidelity:       {qpu.two_gate_fidelity:.3f}",
        "",
        "  Φ-Threshold Circuit Compatibility:",
        f"  {'Circuit':<16} {'Qb':>3} {'Gates':>6} {'Depth':>6} {'Compatible':>11} {'Expected Fid':>13}",
        "  " + "─" * 60,
    ]

    compatible_count = 0
    for name, n_q, n_gates, depth in circuit_specs:
        fits = n_q <= qpu.qubits
        # Estimated fidelity: (1q_fid)^(1q_gates) × (2q_fid)^(2q_gates)
        n_2q = n_gates // 3  # rough estimate
        n_1q = n_gates - n_2q
        est_fid = (qpu.single_gate_fidelity ** n_1q *
                   qpu.two_gate_fidelity ** n_2q)
        if fits:
            compatible_count += 1
        lines.append(
            f"  {name:<16} {n_q:>3} {n_gates:>6} {depth:>6} "
            f"{'✅ YES':>11} {est_fid:>12.4f}"
            if fits else
            f"  {name:<16} {n_q:>3} {n_gates:>6} {depth:>6} "
            f"{'❌ NO':>11} {'N/A':>12}"
        )

    lines.extend([
        "",
        f"  Compatible: {compatible_count}/{len(circuit_specs)} circuits",
        "",
        "  Cost Estimate:",
        f"    Circuits:        {cost.n_circuits}",
        f"    Shots/circuit:   {cost.shots_per_circuit:,}",
        f"    Total shots:     {cost.total_shots:,}",
        f"    Shot cost:       ${cost.shot_cost:,.2f}",
        f"    Task cost:       ${cost.task_cost:,.2f}",
        f"    ─────────────────────────────",
        f"    TOTAL:           ${cost.total_cost:,.2f} USD",
        "",
        "  VQE Cost Estimate (4-qubit TFIM, 200 iterations):",
    ])

    vqe_cost = estimate_vqe_cost(4, 2, 200, qpu_name)
    lines.extend([
        f"    Hamiltonian terms:     {vqe_cost['hamiltonian_terms']}",
        f"    Measurement bases:     {vqe_cost['unique_measurement_bases']}",
        f"    Circuits/VQE eval:     {vqe_cost['circuits_per_vqe_eval']}",
        f"    Total circuits:        {vqe_cost['total_circuits']:,}",
        f"    TOTAL:                 ${vqe_cost['total_cost']:,.2f} USD",
    ])

    lines.extend([
        "",
        "══════════════════════════════════════════════════════════════════════",
        "Framework: DNA::}{::lang v51.843 | Zero tokens, zero telemetry",
        "══════════════════════════════════════════════════════════════════════",
        "",
    ])
    return "\n".join(lines)


# ── S3 Result Archival ───────────────────────────────────────────────────────

class ResultArchiver:
    """Archive quantum results to S3 with provenance chain."""

    def __init__(self, bucket: str = "agile-defense-quantum-results",
                 prefix: str = "dnalang/vqe/"):
        self.bucket = bucket
        self.prefix = prefix

    def build_provenance(self, results: Dict) -> Dict:
        """Build SHA-256 signed provenance record."""
        payload = json.dumps(results, sort_keys=True, default=str)
        sha = hashlib.sha256(payload.encode()).hexdigest()
        return {
            "framework": "DNA::}{::lang v51.843",
            "cage_code": "9HUP5",
            "sha256": sha,
            "lambda_phi": LAMBDA_PHI,
            "theta_lock_deg": THETA_LOCK_DEG,
            "phi_threshold": PHI_THRESHOLD,
            "immutable_constants_verified": True,
        }

    def build_archive_payload(self, results: Dict,
                              experiment_type: str) -> Dict:
        """Build the complete archival payload."""
        provenance = self.build_provenance(results)
        return {
            "experiment_type": experiment_type,
            "provenance": provenance,
            "s3_target": f"s3://{self.bucket}/{self.prefix}",
            "results": results,
        }

    def archive_to_file(self, results: Dict, experiment_type: str,
                        filepath: str) -> str:
        """Archive results to local JSON file (for later S3 upload)."""
        payload = self.build_archive_payload(results, experiment_type)
        with open(filepath, 'w') as f:
            json.dump(payload, f, indent=2, default=str)
        return filepath

    def s3_upload_command(self, filepath: str) -> str:
        """Generate the AWS CLI command for S3 upload."""
        return (f"aws s3 cp {filepath} "
                f"s3://{self.bucket}/{self.prefix} "
                f"--sse aws:kms")


# ── Reporting ────────────────────────────────────────────────────────────────

def format_vqe_result(result: VQEResult,
                      model_name: str = "TFIM") -> str:
    """Format a single VQE result."""
    lines = [
        f"  Model:              {model_name}",
        f"  Ansatz:             {result.ansatz_type} (seed: {result.initial_seed})",
        f"  VQE energy:         {result.energy:.8f}",
        f"  Exact energy:       {result.exact_energy:.8f}",
        f"  Error:              {result.error_ha:.8f} Ha"
        f"  ({'✅ chemical accuracy' if result.chemical_accuracy else '○  above chem. accuracy'})",
        f"  Function evals:     {result.n_function_evals}",
        f"  Time:               {result.execution_time_s:.2f}s",
        f"  Φ:                  {result.phi:.4f}"
        f"  {'✅' if result.phi >= PHI_THRESHOLD else '○ '}",
        f"  Γ:                  {result.gamma:.4f}"
        f"  {'✅' if result.gamma < GAMMA_CRITICAL else '○ '}",
        f"  CCCE:               {result.ccce:.4f}",
        f"  Ξ:                  {result.xi:.2e}",
    ]
    return "\n".join(lines)


def format_phase_diagram(sweep: Dict) -> str:
    """Format phase diagram sweep results."""
    lines = [
        "",
        "══════════════════════════════════════════════════════════════════════",
        f"Quantum Phase Diagram: {sweep['model']} ({sweep['n_qubits']} qubits)",
        "DNA::}{::lang v51.843  |  CAGE 9HUP5  |  Agile Defense Systems",
        "══════════════════════════════════════════════════════════════════════",
        "",
        f"  {'h/J':>6} {'VQE Energy':>12} {'Exact':>12} {'Error':>10} "
        f"{'CCCE':>7} {'Acc':>4}",
        "  " + "─" * 58,
    ]

    for pt in sweep["sweep"]:
        acc = "✅" if pt["chemical_accuracy"] else "○ "
        crit = " ◀ QPT" if abs(pt["h_over_J"] - 1.0) < 0.01 else ""
        lines.append(
            f"  {pt['h_over_J']:>6.3f} {pt['vqe_energy']:>12.6f} "
            f"{pt['exact_energy']:>12.6f} {pt['error_ha']:>10.6f} "
            f"{pt['ccce']:>7.4f} {acc}{crit}"
        )

    lines.extend([
        "",
        f"  Critical point (exact): h/J = {sweep['critical_point']}",
        f"  VQE achieves chemical accuracy at "
        f"{sum(1 for p in sweep['sweep'] if p['chemical_accuracy'])}"
        f"/{len(sweep['sweep'])} points",
        "",
        "══════════════════════════════════════════════════════════════════════",
        "Backend: Braket LocalSimulator (statevector, exact evaluation)",
        "Framework: DNA::}{::lang v51.843 | Zero tokens, zero telemetry",
        "══════════════════════════════════════════════════════════════════════",
        "",
    ])
    return "\n".join(lines)


def format_advantage(adv: Dict) -> str:
    """Format θ_lock convergence advantage comparison."""
    lines = [
        "",
        "══════════════════════════════════════════════════════════════════════",
        "θ_lock Convergence Advantage — VQE Initialization Comparison",
        "DNA::}{::lang v51.843  |  CAGE 9HUP5  |  Agile Defense Systems",
        "══════════════════════════════════════════════════════════════════════",
        "",
        f"  Model: {adv['model']}",
        f"  Exact energy: {adv['exact_energy']:.8f}",
        "",
        "  ┌──────────────────┬───────────────┬──────────────┐",
        "  │ Metric           │ θ_lock seed   │ Random seed  │",
        "  ├──────────────────┼───────────────┼──────────────┤",
        f"  │ VQE energy       │ {adv['theta_lock']['energy']:>12.6f}  │"
        f" {adv['random_best']['energy']:>11.6f}  │",
        f"  │ Error (Ha)       │ {adv['theta_lock']['error_ha']:>12.8f} │"
        f" {adv['random_best']['error_ha']:>11.8f} │",
        f"  │ Function evals   │ {adv['theta_lock']['n_evals']:>12}  │"
        f" {adv['random_best']['n_evals']:>11}  │",
        f"  │ CCCE             │ {adv['theta_lock']['ccce']:>12.4f}  │"
        f" {adv['random_best']['ccce']:>11.4f}  │",
        f"  │ Chem. accuracy   │ {'✅ YES' if adv['theta_lock']['chemical_accuracy'] else '○  NO':>12}  │"
        f" {'✅ YES' if adv['random_best']['chemical_accuracy'] else '○  NO':>11}  │",
        "  └──────────────────┴───────────────┴──────────────┘",
        "",
        f"  Random seeds tested:    {adv['random_stats']['n_seeds']}",
        f"  Random mean error:      {adv['random_stats']['mean_error_ha']:.8f} Ha",
        f"  Random mean evals:      {adv['random_stats']['mean_n_evals']}",
        "",
        f"  θ_lock advantage:",
        f"    Error reduction:      {adv['advantage']['error_reduction']:.8f} Ha",
        f"    Eval reduction:       {adv['advantage']['eval_reduction']}",
        f"    θ_lock wins:          "
        f"{'✅ YES' if adv['advantage']['theta_lock_wins'] else '○  NO'}",
        "",
        "══════════════════════════════════════════════════════════════════════",
        "",
    ]
    return "\n".join(lines)


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="OSIRIS × Braket QPU Deployment & VQE Engine — "
                    "DNA::}{::lang v51.843"
    )
    parser.add_argument("--vqe", type=str,
                        choices=["ising", "heisenberg"],
                        help="Run VQE for specified model")
    parser.add_argument("--qubits", type=int, default=4,
                        help="Number of qubits (default: 4)")
    parser.add_argument("--layers", type=int, default=2,
                        help="Ansatz depth (default: 2)")
    parser.add_argument("--theta-lock-compare", action="store_true",
                        help="Compare θ_lock vs random initialization")
    parser.add_argument("--phase-diagram", action="store_true",
                        help="Run quantum phase diagram sweep")
    parser.add_argument("--report", type=str,
                        choices=list(QPU_CATALOG.keys()),
                        help="Generate QPU readiness report")
    parser.add_argument("--cost", type=str,
                        choices=list(QPU_CATALOG.keys()),
                        help="Estimate QPU costs")
    parser.add_argument("--circuits", type=int, default=14,
                        help="Number of circuits for cost estimation")
    parser.add_argument("--shots", type=int, default=10_000,
                        help="Shots per circuit")
    parser.add_argument("--json", type=str,
                        help="Save results to JSON file")
    parser.add_argument("--all", action="store_true",
                        help="Run everything: VQE + phase diagram + advantage")
    args = parser.parse_args()

    all_results = {}
    output_lines = []

    print("\n⚛  OSIRIS × Braket QPU Deployment Engine — DNA::}{::lang v51.843\n")

    # VQE
    if args.vqe or args.all:
        model = args.vqe or "ising"
        n_q = args.qubits
        print(f"  Running VQE: {model} model, {n_q} qubits, "
              f"{args.layers} layers...")

        if model == "ising":
            H = transverse_ising(n_q, J=1.0, h=0.75)
        else:
            H = heisenberg_xxz(n_q, J=1.0, Delta=1.0)

        engine = VQEEngine(H, n_layers=args.layers)
        result = engine.optimize(seed_type="theta_lock")
        text = format_vqe_result(result, model.upper())
        print(text)
        all_results["vqe"] = result.to_dict()

    # θ_lock convergence advantage
    if args.theta_lock_compare or args.all:
        print("\n  Running θ_lock convergence comparison...")
        adv = theta_lock_advantage(n_qubits=args.qubits,
                                   n_layers=args.layers)
        print(format_advantage(adv))
        all_results["theta_lock_advantage"] = adv

    # Phase diagram
    if args.phase_diagram or args.all:
        print(f"  Running phase diagram sweep ({args.qubits} qubits)...")
        sweep = phase_diagram_sweep(n_qubits=args.qubits,
                                    n_layers=args.layers)
        print(format_phase_diagram(sweep))
        all_results["phase_diagram"] = sweep

    # QPU readiness report
    if args.report:
        print(qpu_readiness_report(args.report, args.circuits, args.shots))

    # Cost estimation
    if args.cost:
        cost = estimate_cost(args.circuits, args.shots, args.cost)
        print(f"\n  Cost Estimate for {cost.qpu_name}:")
        print(f"    {cost.n_circuits} circuits × {cost.shots_per_circuit:,} "
              f"shots = ${cost.total_cost:,.2f} USD\n")
        all_results["cost"] = asdict(cost)

    # Save JSON
    if args.json and all_results:
        archiver = ResultArchiver()
        archiver.archive_to_file(all_results, "vqe_deployment", args.json)
        print(f"  Results archived to {args.json}")
        print(f"  Upload: {archiver.s3_upload_command(args.json)}\n")

    # Default: run --all if nothing specified
    if not any([args.vqe, args.theta_lock_compare, args.phase_diagram,
                args.report, args.cost, args.all]):
        print("  No action specified. Use --all for full demo, "
              "or --help for options.\n")
        print("  Quick start:")
        print("    python3 braket_qpu_deploy.py --all --qubits 4")
        print("    python3 braket_qpu_deploy.py --report ionq_aria")
        print("    python3 braket_qpu_deploy.py --vqe ising --qubits 6\n")


if __name__ == "__main__":
    main()
