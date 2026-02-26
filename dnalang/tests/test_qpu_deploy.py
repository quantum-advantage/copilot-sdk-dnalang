#!/usr/bin/env python3
"""
Tests for braket_qpu_deploy.py — QPU Deployment & VQE Engine
DNA::}{::lang v51.843 | Agile Defense Systems | CAGE 9HUP5
"""
import math
import sys
import os
import pytest
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'examples'))
from braket_qpu_deploy import (
    LAMBDA_PHI, THETA_LOCK_DEG, THETA_LOCK_RAD, PHI_THRESHOLD,
    GAMMA_CRITICAL, CHI_PC,
    PauliTerm, VQEResult, QPUSpec, CostEstimate,
    PauliHamiltonian, _I, _X, _Y, _Z,
    transverse_ising, heisenberg_xxz, molecular_hamiltonian,
    build_hea, theta_lock_initial, random_initial,
    VQEEngine, phase_diagram_sweep, theta_lock_advantage,
    estimate_cost, estimate_vqe_cost,
    QPU_CATALOG, ResultArchiver,
    format_vqe_result, format_phase_diagram, format_advantage,
    qpu_readiness_report,
)


# ── Constants ────────────────────────────────────────────────────────────────

class TestConstants:
    def test_lambda_phi(self):
        assert LAMBDA_PHI == 2.176435e-8

    def test_theta_lock(self):
        assert THETA_LOCK_DEG == 51.843

    def test_theta_lock_rad(self):
        assert abs(THETA_LOCK_RAD - math.radians(51.843)) < 1e-12

    def test_phi_threshold(self):
        assert PHI_THRESHOLD == 0.7734

    def test_gamma_critical(self):
        assert GAMMA_CRITICAL == 0.3

    def test_chi_pc(self):
        assert CHI_PC == 0.946

    def test_pauli_matrices_hermitian(self):
        for name, mat in [('X', _X), ('Y', _Y), ('Z', _Z)]:
            assert np.allclose(mat, mat.conj().T), f"{name} not Hermitian"

    def test_pauli_matrices_square_to_identity(self):
        for name, mat in [('X', _X), ('Y', _Y), ('Z', _Z)]:
            assert np.allclose(mat @ mat, _I), f"{name}² ≠ I"

    def test_pauli_commutation(self):
        # [X, Y] = 2iZ
        assert np.allclose(_X @ _Y - _Y @ _X, 2j * _Z)


# ── PauliTerm ────────────────────────────────────────────────────────────────

class TestPauliTerm:
    def test_identity_term(self):
        t = PauliTerm(coeff=1.5, ops={})
        assert "I" in str(t)
        assert t.coeff == 1.5

    def test_single_pauli(self):
        t = PauliTerm(coeff=-0.5, ops={0: 'Z'})
        assert t.ops == {0: 'Z'}

    def test_multi_pauli(self):
        t = PauliTerm(coeff=0.25, ops={0: 'X', 1: 'Y', 2: 'Z'})
        assert len(t.ops) == 3

    def test_str_format(self):
        t = PauliTerm(coeff=0.5, ops={0: 'Z', 1: 'Z'})
        s = str(t)
        assert "Z0" in s
        assert "Z1" in s


# ── PauliHamiltonian ─────────────────────────────────────────────────────────

class TestPauliHamiltonian:
    def test_identity_hamiltonian(self):
        H = PauliHamiltonian([PauliTerm(2.0, {})], n_qubits=1)
        mat = H.to_matrix()
        assert np.allclose(mat, 2.0 * _I)

    def test_single_z(self):
        H = PauliHamiltonian([PauliTerm(1.0, {0: 'Z'})], n_qubits=1)
        mat = H.to_matrix()
        assert np.allclose(mat, _Z)

    def test_two_qubit_zz(self):
        H = PauliHamiltonian([PauliTerm(1.0, {0: 'Z', 1: 'Z'})], n_qubits=2)
        mat = H.to_matrix()
        expected = np.kron(_Z, _Z)
        assert np.allclose(mat, expected)

    def test_exact_ground_energy_simple(self):
        # H = -Z: eigenvalues are +1, -1. Ground = -1
        H = PauliHamiltonian([PauliTerm(-1.0, {0: 'Z'})], n_qubits=1)
        assert abs(H.exact_ground_energy() - (-1.0)) < 1e-10

    def test_exact_ground_state(self):
        # H = -X: ground state is |+⟩
        H = PauliHamiltonian([PauliTerm(-1.0, {0: 'X'})], n_qubits=1)
        e, psi = H.exact_ground_state()
        assert abs(e - (-1.0)) < 1e-10
        # |+⟩ = [1/√2, 1/√2]
        assert abs(abs(psi[0]) - 1 / math.sqrt(2)) < 1e-10

    def test_expectation_ground(self):
        H = PauliHamiltonian([PauliTerm(-1.0, {0: 'Z'})], n_qubits=1)
        psi = np.array([1, 0], dtype=complex)  # |0⟩
        assert abs(H.expectation(psi) - (-1.0)) < 1e-10

    def test_expectation_excited(self):
        H = PauliHamiltonian([PauliTerm(-1.0, {0: 'Z'})], n_qubits=1)
        psi = np.array([0, 1], dtype=complex)  # |1⟩
        assert abs(H.expectation(psi) - 1.0) < 1e-10

    def test_matrix_hermitian(self):
        H = transverse_ising(3, J=1.0, h=0.5)
        mat = H.to_matrix()
        assert np.allclose(mat, mat.conj().T)

    def test_n_terms(self):
        H = transverse_ising(3, J=1.0, h=0.5, periodic=True)
        # 3 ZZ terms (periodic) + 3 X terms = 6
        assert H.n_terms() == 6

    def test_str_output(self):
        H = transverse_ising(2, J=1.0, h=0.5, periodic=False)
        s = str(H)
        assert "PauliHamiltonian" in s
        assert "2 qubits" in s


# ── Model Hamiltonians ───────────────────────────────────────────────────────

class TestModelHamiltonians:
    def test_ising_2q_eigenvalues(self):
        H = transverse_ising(2, J=1.0, h=0.0, periodic=False)
        # H = -Z₀Z₁, eigenvalues: -1, -1, 1, 1 → ground = -1
        e0 = H.exact_ground_energy()
        assert abs(e0 - (-1.0)) < 1e-10

    def test_ising_2q_with_field(self):
        H = transverse_ising(2, J=1.0, h=1.0, periodic=False)
        e0 = H.exact_ground_energy()
        # Ground energy should be more negative than -1
        assert e0 < -1.0

    def test_ising_periodic_vs_open(self):
        H_open = transverse_ising(4, J=1.0, h=0.5, periodic=False)
        H_pbc = transverse_ising(4, J=1.0, h=0.5, periodic=True)
        # Periodic has more ZZ terms → lower ground energy
        assert H_pbc.exact_ground_energy() < H_open.exact_ground_energy()

    def test_heisenberg_isotropic(self):
        H = heisenberg_xxz(2, J=1.0, Delta=1.0, periodic=False)
        e0 = H.exact_ground_energy()
        # Singlet state energy for 2-site Heisenberg: -3J/4 = -0.75
        # With our convention H = J(XX + YY + ZZ):
        # In singlet: ⟨XX⟩=⟨YY⟩=⟨ZZ⟩=-1, so E = 3J*(-1) = -3
        # But with periodic=False, 1 bond: E = -3
        assert e0 < 0

    def test_heisenberg_terms_count(self):
        H = heisenberg_xxz(3, periodic=True)
        # 3 bonds × 3 terms (XX, YY, ZZ) = 9
        assert H.n_terms() == 9

    def test_molecular_hamiltonian_interface(self):
        data = [
            (-1.05, "I"),
            (0.40, "Z0"),
            (-0.40, "Z1"),
            (-0.01, "Z0 Z1"),
            (0.18, "X0 X1"),
        ]
        H = molecular_hamiltonian(data, n_qubits=2)
        assert H.n_qubits == 2
        assert H.n_terms() == 5
        e0 = H.exact_ground_energy()
        assert isinstance(e0, float)


# ── Ansatz ───────────────────────────────────────────────────────────────────

class TestAnsatz:
    def test_hea_qubit_count(self):
        params = np.zeros(6)  # 2 qubits × (1 layer + 1) = 6 ← wrong
        # Actually: n_qubits * (depth + 1) = 2 * (1 + 1) = 4
        params = np.zeros(4)
        c = build_hea(2, 1, params)
        assert c.qubit_count == 2

    def test_hea_param_count(self):
        n_q, depth = 3, 2
        n_params = n_q * (depth + 1)
        assert n_params == 9
        params = np.zeros(n_params)
        c = build_hea(n_q, depth, params)
        assert c.qubit_count == 3

    def test_theta_lock_initial_shape(self):
        params = theta_lock_initial(10)
        assert len(params) == 10

    def test_theta_lock_initial_deterministic(self):
        p1 = theta_lock_initial(8)
        p2 = theta_lock_initial(8)
        assert np.allclose(p1, p2)

    def test_random_initial_shape(self):
        params = random_initial(10)
        assert len(params) == 10

    def test_random_initial_range(self):
        params = random_initial(100)
        assert np.all(params >= -math.pi)
        assert np.all(params <= math.pi)

    def test_random_initial_seed(self):
        p1 = random_initial(10, seed=42)
        p2 = random_initial(10, seed=42)
        assert np.allclose(p1, p2)

    def test_different_seeds_differ(self):
        p1 = random_initial(10, seed=42)
        p2 = random_initial(10, seed=99)
        assert not np.allclose(p1, p2)


# ── VQE Engine ───────────────────────────────────────────────────────────────

class TestVQEEngine:
    def test_exact_cost_returns_float(self):
        H = transverse_ising(2, J=1.0, h=0.5, periodic=False)
        engine = VQEEngine(H, n_layers=1)
        params = theta_lock_initial(engine.n_params)
        e = engine.exact_cost(params)
        assert isinstance(e, float)

    def test_optimize_converges_2q(self):
        H = transverse_ising(2, J=1.0, h=0.5, periodic=False)
        engine = VQEEngine(H, n_layers=1)
        result = engine.optimize(max_iter=200)
        # Should get close to exact
        assert result.error_ha < 0.1

    def test_optimize_reaches_chemical_accuracy_2q(self):
        H = transverse_ising(2, J=1.0, h=0.75, periodic=False)
        engine = VQEEngine(H, n_layers=2)
        result = engine.optimize(max_iter=500)
        assert result.chemical_accuracy

    def test_vqe_result_fields(self):
        H = transverse_ising(2, J=1.0, h=0.5, periodic=False)
        engine = VQEEngine(H, n_layers=1)
        result = engine.optimize(max_iter=100)
        assert hasattr(result, 'energy')
        assert hasattr(result, 'exact_energy')
        assert hasattr(result, 'ccce')
        assert hasattr(result, 'phi')
        assert hasattr(result, 'gamma')
        assert hasattr(result, 'xi')
        assert result.ansatz_type == "HEA-1L"

    def test_vqe_result_to_dict(self):
        H = transverse_ising(2, periodic=False)
        engine = VQEEngine(H, n_layers=1)
        result = engine.optimize(max_iter=50)
        d = result.to_dict()
        assert isinstance(d, dict)
        assert 'energy' in d
        assert 'ccce' in d

    def test_convergence_history(self):
        H = transverse_ising(2, periodic=False)
        engine = VQEEngine(H, n_layers=1)
        result = engine.optimize(max_iter=50)
        assert len(result.convergence_history) > 0

    def test_energy_landscape(self):
        H = transverse_ising(2, J=1.0, h=0.5, periodic=False)
        engine = VQEEngine(H, n_layers=1)
        landscape = engine.energy_landscape(param_idx=0, n_points=10)
        assert len(landscape) == 10
        assert all(isinstance(x, tuple) for x in landscape)
        assert all(len(x) == 2 for x in landscape)


# ── Phase Diagram ────────────────────────────────────────────────────────────

class TestPhaseDiagram:
    def test_sweep_returns_dict(self):
        sweep = phase_diagram_sweep(2, h_values=[0.5, 1.0], n_layers=1)
        assert isinstance(sweep, dict)
        assert 'sweep' in sweep
        assert len(sweep['sweep']) == 2

    def test_sweep_energies_decrease_with_field(self):
        sweep = phase_diagram_sweep(2, h_values=[0.5, 1.0, 2.0],
                                    n_layers=1)
        energies = [pt['exact_energy'] for pt in sweep['sweep']]
        # Energies should decrease as field increases (more negative)
        assert energies[-1] < energies[0]

    def test_sweep_has_critical_point(self):
        sweep = phase_diagram_sweep(2, n_layers=1)
        assert sweep['critical_point'] == 1.0


# ── θ_lock Advantage ─────────────────────────────────────────────────────────

class TestThetaLockAdvantage:
    def test_advantage_returns_dict(self):
        adv = theta_lock_advantage(n_qubits=2, n_layers=1,
                                   n_random_seeds=2)
        assert isinstance(adv, dict)
        assert 'theta_lock' in adv
        assert 'random_best' in adv
        assert 'advantage' in adv

    def test_advantage_has_energies(self):
        adv = theta_lock_advantage(n_qubits=2, n_layers=1,
                                   n_random_seeds=2)
        assert 'energy' in adv['theta_lock']
        assert 'energy' in adv['random_best']


# ── QPU Catalog ──────────────────────────────────────────────────────────────

class TestQPUCatalog:
    def test_catalog_not_empty(self):
        assert len(QPU_CATALOG) >= 3

    def test_ionq_aria_exists(self):
        assert 'ionq_aria' in QPU_CATALOG
        qpu = QPU_CATALOG['ionq_aria']
        assert qpu.qubits == 25
        assert qpu.provider == "IonQ"

    def test_rigetti_exists(self):
        assert 'rigetti_ankaa3' in QPU_CATALOG

    def test_quera_exists(self):
        assert 'quera_aquila' in QPU_CATALOG

    def test_all_qpus_have_required_fields(self):
        for name, qpu in QPU_CATALOG.items():
            assert qpu.name, f"{name} missing name"
            assert qpu.arn, f"{name} missing arn"
            assert qpu.qubits > 0, f"{name} invalid qubits"
            assert qpu.cost_per_shot > 0, f"{name} missing pricing"


# ── Cost Estimation ──────────────────────────────────────────────────────────

class TestCostEstimation:
    def test_basic_cost(self):
        cost = estimate_cost(10, 1000, "ionq_aria")
        assert cost.n_circuits == 10
        assert cost.shots_per_circuit == 1000
        assert cost.total_shots == 10000
        assert cost.total_cost > 0

    def test_ionq_pricing(self):
        cost = estimate_cost(1, 1000, "ionq_aria")
        # 1000 shots × $0.03/shot = $30 + $0.30 task = $30.30
        assert cost.shot_cost == 30.0
        assert cost.task_cost == 0.30
        assert cost.total_cost == 30.30

    def test_rigetti_cheaper_per_shot(self):
        cost_ionq = estimate_cost(1, 1000, "ionq_aria")
        cost_rig = estimate_cost(1, 1000, "rigetti_ankaa3")
        assert cost_rig.shot_cost < cost_ionq.shot_cost

    def test_unknown_qpu_raises(self):
        with pytest.raises(ValueError):
            estimate_cost(1, 1000, "nonexistent_qpu")

    def test_vqe_cost_estimate(self):
        cost = estimate_vqe_cost(4, 2, 200, "rigetti_ankaa3")
        assert 'total_circuits' in cost
        assert cost['total_circuits'] > 0


# ── Result Archiver ──────────────────────────────────────────────────────────

class TestResultArchiver:
    def test_provenance_sha256(self):
        archiver = ResultArchiver()
        results = {"test": "data"}
        prov = archiver.build_provenance(results)
        assert 'sha256' in prov
        assert len(prov['sha256']) == 64
        assert prov['lambda_phi'] == LAMBDA_PHI

    def test_provenance_deterministic(self):
        archiver = ResultArchiver()
        results = {"test": "data"}
        p1 = archiver.build_provenance(results)
        p2 = archiver.build_provenance(results)
        assert p1['sha256'] == p2['sha256']

    def test_archive_payload(self):
        archiver = ResultArchiver()
        payload = archiver.build_archive_payload({"data": 1}, "vqe")
        assert payload['experiment_type'] == "vqe"
        assert 'provenance' in payload
        assert 'results' in payload

    def test_s3_command(self):
        archiver = ResultArchiver(bucket="my-bucket", prefix="test/")
        cmd = archiver.s3_upload_command("/tmp/results.json")
        assert "s3://my-bucket/test/" in cmd
        assert "--sse aws:kms" in cmd

    def test_archive_to_file(self, tmp_path):
        archiver = ResultArchiver()
        filepath = str(tmp_path / "test_results.json")
        archiver.archive_to_file({"data": 1}, "test", filepath)
        import json
        with open(filepath) as f:
            data = json.load(f)
        assert data['experiment_type'] == "test"


# ── Reporting ────────────────────────────────────────────────────────────────

class TestReporting:
    def test_format_vqe_result(self):
        result = VQEResult(
            energy=-1.5, exact_energy=-1.6, error_ha=0.1,
            chemical_accuracy=False, params=[0.5], n_iterations=10,
            n_function_evals=50, convergence_history=[-1.0, -1.5],
            phi=0.9, gamma=0.1, ccce=0.85, xi=1e-6,
            execution_time_s=1.0, ansatz_type="HEA-1L",
            initial_seed="theta_lock"
        )
        text = format_vqe_result(result)
        assert "VQE energy" in text
        assert "Exact energy" in text
        assert "CCCE" in text

    def test_format_phase_diagram(self):
        sweep = {
            "model": "TFIM",
            "n_qubits": 2,
            "sweep": [
                {"h_over_J": 0.5, "vqe_energy": -1.0, "exact_energy": -1.0,
                 "error_ha": 0.0, "chemical_accuracy": True, "ccce": 0.9,
                 "phi": 0.95, "n_evals": 50}
            ],
            "critical_point": 1.0,
        }
        text = format_phase_diagram(sweep)
        assert "Phase Diagram" in text
        assert "QPT" not in text  # h=0.5, not 1.0

    def test_format_advantage(self):
        adv = {
            "model": "TFIM 2q",
            "exact_energy": -1.5,
            "theta_lock": {"energy": -1.49, "error_ha": 0.01,
                           "n_evals": 50, "ccce": 0.94,
                           "chemical_accuracy": True},
            "random_best": {"energy": -1.48, "error_ha": 0.02,
                            "n_evals": 60, "ccce": 0.92,
                            "chemical_accuracy": True},
            "random_stats": {"n_seeds": 3, "mean_error_ha": 0.03,
                             "mean_n_evals": 65},
            "advantage": {"error_reduction": 0.02, "eval_reduction": 15,
                          "theta_lock_wins": True},
        }
        text = format_advantage(adv)
        assert "θ_lock" in text
        assert "Random" in text

    def test_qpu_readiness_report(self):
        text = qpu_readiness_report("ionq_aria")
        assert "IonQ" in text
        assert "Compatible" in text
        assert "Cost" in text


# ── Measurement-Based Expectation ────────────────────────────────────────────

class TestMeasurementExpectation:
    def test_z_expectation_ground_state(self):
        """⟨0|Z|0⟩ = 1"""
        from braket.circuits import Circuit
        H = PauliHamiltonian([PauliTerm(1.0, {0: 'Z'})], n_qubits=1)
        c = Circuit()
        c.i(0)  # Identity gate (Braket requires ≥1 gate)
        exp = H.measure_expectation(c, shots=5000)
        assert abs(exp - 1.0) < 0.1  # Shot noise tolerance

    def test_x_expectation_plus_state(self):
        """⟨+|X|+⟩ = 1"""
        from braket.circuits import Circuit
        H = PauliHamiltonian([PauliTerm(1.0, {0: 'X'})], n_qubits=1)
        c = Circuit()
        c.h(0)  # |+⟩ state
        exp = H.measure_expectation(c, shots=5000)
        assert abs(exp - 1.0) < 0.1


# ── Integration ──────────────────────────────────────────────────────────────

class TestIntegration:
    def test_full_vqe_pipeline_2q(self):
        """End-to-end: build Hamiltonian → VQE → verify accuracy."""
        H = transverse_ising(2, J=1.0, h=0.5, periodic=False)
        engine = VQEEngine(H, n_layers=2)
        result = engine.optimize(max_iter=300)
        assert result.energy <= result.exact_energy + 0.01
        assert result.ccce > 0
        assert result.phi > 0

    def test_vqe_matches_exact_diag(self):
        """VQE energy should be ≥ exact ground state energy."""
        H = transverse_ising(2, J=1.0, h=1.0, periodic=False)
        engine = VQEEngine(H, n_layers=2)
        result = engine.optimize(max_iter=500)
        # Variational principle: VQE ≥ exact
        assert result.energy >= result.exact_energy - 1e-6

    def test_heisenberg_vqe(self):
        """VQE on Heisenberg model."""
        H = heisenberg_xxz(2, J=1.0, Delta=1.0, periodic=False)
        engine = VQEEngine(H, n_layers=2)
        result = engine.optimize(max_iter=300)
        assert result.error_ha < 1.0  # Reasonable convergence
