"""
Tests for BraketAdapter — Amazon Braket integration for DNA::}{::lang v51.843

Tests cover:
- BraketResult dataclass and metrics
- BraketCircuitCompiler (all protocols)
- QuEraAHSBuilder (ring, grid, theta_lock topologies)
- BraketAdapter (compile, submit dry-run, device listing, cost estimation)
- Protocol ↔ QuantumMetrics interop
"""

import json
import math
import pytest

from copilot_quantum.braket_adapter import (
    BraketAdapter,
    BraketBackend,
    BraketCircuitCompiler,
    BraketResult,
    Protocol,
    QuEraAHSBuilder,
)
from copilot_quantum.quantum_engine import (
    LAMBDA_PHI_M,
    THETA_LOCK_DEG,
    PHI_THRESHOLD_FIDELITY,
    GAMMA_CRITICAL_RATE,
    CHI_PC_QUALITY,
    DRIVE_AMPLITUDE,
    QuantumMetrics,
)


# ---------------------------------------------------------------------------
# BraketResult
# ---------------------------------------------------------------------------

class TestBraketResult:
    def test_above_threshold_true(self):
        r = BraketResult("t1", "sv1", "bell", "COMPLETED", 100, 2, phi=0.85)
        assert r.above_threshold() is True

    def test_above_threshold_false(self):
        r = BraketResult("t1", "sv1", "bell", "COMPLETED", 100, 2, phi=0.5)
        assert r.above_threshold() is False

    def test_is_coherent_true(self):
        r = BraketResult("t1", "sv1", "bell", "COMPLETED", 100, 2, gamma=0.1)
        assert r.is_coherent() is True

    def test_is_coherent_false(self):
        r = BraketResult("t1", "sv1", "bell", "COMPLETED", 100, 2, gamma=0.5)
        assert r.is_coherent() is False

    def test_negentropy(self):
        r = BraketResult("t1", "sv1", "bell", "COMPLETED", 100, 2,
                         phi=0.85, gamma=0.1)
        xi = r.negentropy()
        assert xi == pytest.approx(LAMBDA_PHI_M * 0.85 / 0.1, rel=1e-6)

    def test_negentropy_zero_gamma(self):
        r = BraketResult("t1", "sv1", "bell", "COMPLETED", 100, 2,
                         phi=0.85, gamma=0.0)
        xi = r.negentropy()
        # Should use 0.001 floor
        assert xi == pytest.approx(LAMBDA_PHI_M * 0.85 / 0.001, rel=1e-6)

    def test_to_quantum_metrics(self):
        r = BraketResult("task-123", BraketBackend.IONQ_ARIA.value,
                         "bell_state", "COMPLETED", 8192, 2,
                         phi=0.9, gamma=0.05, ccce=0.88, chi_pc=0.946,
                         execution_time_s=1.5)
        qm = r.to_quantum_metrics()
        assert isinstance(qm, QuantumMetrics)
        assert qm.phi == 0.9
        assert qm.gamma == 0.05
        assert qm.backend.startswith("braket:")
        assert qm.job_id == "task-123"
        assert qm.above_threshold() is True

    def test_to_dict(self):
        r = BraketResult("t1", "sv1", "bell", "COMPLETED", 100, 2,
                         phi=0.85, gamma=0.1, ccce=0.8, chi_pc=0.946)
        d = r.to_dict()
        assert d["phi"] == 0.85
        assert d["above_threshold"] is True
        assert d["is_coherent"] is True
        assert "negentropy" in d


# ---------------------------------------------------------------------------
# BraketCircuitCompiler
# ---------------------------------------------------------------------------

class TestBraketCircuitCompiler:
    @pytest.fixture
    def compiler(self):
        return BraketCircuitCompiler()

    def test_compile_header(self, compiler):
        qasm = compiler.compile(Protocol.BELL_STATE, qubits=2)
        assert qasm.startswith("OPENQASM 3.0;")
        assert "stdgates.inc" in qasm
        assert "DNA::}{::lang" in qasm
        assert f"{THETA_LOCK_DEG}" in qasm

    def test_compile_bell_state(self, compiler):
        qasm = compiler.compile(Protocol.BELL_STATE, qubits=2)
        assert "h q[0];" in qasm
        assert "cx q[0], q[1];" in qasm
        assert "rz(" in qasm
        assert "measure" in qasm

    def test_compile_chi_pc_bell(self, compiler):
        qasm = compiler.compile(Protocol.CHI_PC_BELL, qubits=2)
        assert "barrier" in qasm
        phase = CHI_PC_QUALITY * math.pi
        assert f"{phase:.6f}" in qasm

    def test_compile_aeterna_porta(self, compiler):
        qasm = compiler.compile(Protocol.AETERNA_PORTA, qubits=120)
        assert "TFD Preparation" in qasm
        assert "Quantum Zeno" in qasm
        assert "Floquet drive" in qasm
        assert "Dynamic feed-forward" in qasm
        theta_rad = math.radians(THETA_LOCK_DEG)
        assert f"ry({theta_rad:.6f})" in qasm
        # Should have 120 measurement lines
        assert qasm.count("= measure") >= 120

    def test_compile_aeterna_porta_zeno_ancillas(self, compiler):
        qasm = compiler.compile(Protocol.AETERNA_PORTA, qubits=120)
        # Ancillas are qubits 100-119 (n_l=50, n_r=50, 20 ancillas)
        assert "q[100]" in qasm

    def test_compile_er_epr_witness(self, compiler):
        # ER-EPR uses same compiler as aeterna_porta
        qasm = compiler.compile(Protocol.ER_EPR_WITNESS, qubits=120)
        assert "TFD Preparation" in qasm

    def test_compile_theta_sweep(self, compiler):
        qasm = compiler.compile(Protocol.THETA_SWEEP, qubits=4)
        assert "19 steps" in qasm or "Step 18" in qasm
        assert "ry(" in qasm

    def test_compile_correlated_decode(self, compiler):
        qasm = compiler.compile(Protocol.CORRELATED_DECODE, qubits=256)
        assert "256-atom" in qasm or "ring topology" in qasm
        assert qasm.count("h q[") >= 256
        assert qasm.count("cx q[") >= 256

    def test_compile_cat_qubit_bridge(self, compiler):
        qasm = compiler.compile(Protocol.CAT_QUBIT_BRIDGE, qubits=5)
        assert "Ocelot" in qasm or "cat-qubit" in qasm.lower() or "Cat-qubit" in qasm
        assert "cx q[0]" in qasm

    def test_compile_ocelot_witness(self, compiler):
        qasm = compiler.compile(Protocol.OCELOT_WITNESS, qubits=8)
        assert "Ocelot" in qasm or "distance" in qasm
        assert "h q[0];" in qasm

    def test_compile_ghz_depth(self, compiler):
        qasm = compiler.compile(Protocol.GHZ_DEPTH, qubits=8)
        assert "GHZ" in qasm
        assert "h q[0];" in qasm
        # Should have chain of CX gates
        assert "cx q[0], q[1];" in qasm
        assert "cx q[6], q[7];" in qasm

    def test_compile_zeno_suppression(self, compiler):
        qasm = compiler.compile(Protocol.ZENO_SUPPRESSION, qubits=5)
        assert "Zeno" in qasm
        assert "Round" in qasm

    def test_compile_all_protocols(self, compiler):
        """Ensure every Protocol enum compiles without error."""
        for proto in Protocol:
            q = 120 if "aeterna" in proto.value or "decode" in proto.value else 4
            qasm = compiler.compile(proto, qubits=q)
            assert "OPENQASM 3.0;" in qasm
            assert "measure" in qasm

    def test_compile_unknown_protocol_falls_back(self, compiler):
        qasm = compiler.compile("unknown_protocol", qubits=2)
        assert "OPENQASM 3.0;" in qasm  # falls back to bell state


# ---------------------------------------------------------------------------
# QuEraAHSBuilder
# ---------------------------------------------------------------------------

class TestQuEraAHSBuilder:
    def test_ring_topology(self):
        builder = QuEraAHSBuilder(atoms=64)
        program = builder.build_ring_topology()
        assert program["braketSchemaHeader"]["name"] == "braket.ir.ahs.program"
        sites = program["setup"]["ahs_register"]["sites"]
        assert len(sites) == 64
        assert len(program["setup"]["ahs_register"]["filling"]) == 64

    def test_grid_topology(self):
        builder = QuEraAHSBuilder(atoms=100)
        program = builder.build_grid_topology(rows=10, cols=10)
        sites = program["setup"]["ahs_register"]["sites"]
        assert len(sites) == 100

    def test_theta_lock_topology(self):
        builder = QuEraAHSBuilder(atoms=128)
        program = builder.build_theta_lock_topology()
        sites = program["setup"]["ahs_register"]["sites"]
        assert len(sites) == 128
        meta = program["metadata"]
        assert meta["theta_lock_deg"] == THETA_LOCK_DEG
        assert meta["topology"] == "theta_lock_spiral"

    def test_max_atoms_capped(self):
        builder = QuEraAHSBuilder(atoms=500)
        assert builder.atoms == 256  # capped at AQUILA_MAX_ATOMS

    def test_rabi_tuned_to_theta_lock(self):
        builder = QuEraAHSBuilder(atoms=16)
        program = builder.build_ring_topology()
        rabi_values = program["hamiltonian"]["drivingFields"][0]["amplitude"]["time_series"]["values"]
        peak = max(rabi_values)
        expected = builder.RABI_MAX_RAD_S * math.sin(math.radians(THETA_LOCK_DEG))
        assert peak == pytest.approx(expected, rel=1e-6)

    def test_detuning_sweep(self):
        builder = QuEraAHSBuilder(atoms=16, time_us=4.0)
        program = builder.build_ring_topology()
        det_values = program["hamiltonian"]["drivingFields"][0]["detuning"]["time_series"]["values"]
        # Should sweep from negative to positive through zero
        assert det_values[0] < 0
        assert det_values[1] == 0
        assert det_values[2] > 0

    def test_program_is_json_serializable(self):
        builder = QuEraAHSBuilder(atoms=32)
        program = builder.build_ring_topology()
        serialized = json.dumps(program)
        assert len(serialized) > 100

    def test_metadata_includes_constants(self):
        builder = QuEraAHSBuilder(atoms=64)
        program = builder.build_ring_topology()
        meta = program["metadata"]
        assert meta["lambda_phi"] == LAMBDA_PHI_M
        assert meta["cage_code"] == "9HUP5"
        assert meta["framework"] == "DNA::}{::lang v51.843"


# ---------------------------------------------------------------------------
# BraketAdapter
# ---------------------------------------------------------------------------

class TestBraketAdapter:
    @pytest.fixture
    def adapter(self):
        return BraketAdapter()

    def test_compile_protocol(self, adapter):
        qasm = adapter.compile(Protocol.BELL_STATE, qubits=2)
        assert "OPENQASM 3.0;" in qasm

    def test_compile_ahs_ring(self, adapter):
        program = adapter.compile_ahs(atoms=64, topology="ring")
        assert program["braketSchemaHeader"]["name"] == "braket.ir.ahs.program"
        assert len(program["setup"]["ahs_register"]["sites"]) == 64

    def test_compile_ahs_grid(self, adapter):
        program = adapter.compile_ahs(atoms=64, topology="grid")
        assert len(program["setup"]["ahs_register"]["sites"]) == 64

    def test_compile_ahs_theta_lock(self, adapter):
        program = adapter.compile_ahs(atoms=128, topology="theta_lock")
        assert program["metadata"]["topology"] == "theta_lock_spiral"

    def test_submit_dry_run(self, adapter):
        result = adapter.submit(
            Protocol.AETERNA_PORTA,
            device=BraketBackend.SV1,
            qubits=120,
            shots=100000,
            dry_run=True,
        )
        assert result.status == "COMPILED"
        assert result.qubits == 120
        assert result.shots == 100000
        assert "dnalang-aeterna_porta-" in result.task_id
        assert len(result.openqasm_source) > 100
        assert result.metadata["framework"] == "DNA::}{::lang v51.843"
        assert result.metadata["cage_code"] == "9HUP5"

    def test_submit_dry_run_with_tags(self, adapter):
        result = adapter.submit(
            Protocol.BELL_STATE,
            dry_run=True,
            tags={"experiment": "test-123"},
        )
        assert result.metadata["tags"]["experiment"] == "test-123"

    def test_submit_ahs_dry_run(self, adapter):
        result = adapter.submit_ahs(atoms=256, topology="ring", shots=100, dry_run=True)
        assert result.status == "COMPILED"
        assert result.qubits == 256
        assert result.device == BraketBackend.QUERA_AQUILA.value
        assert "ahs_ring" in result.protocol

    def test_job_history(self, adapter):
        adapter.submit(Protocol.BELL_STATE, dry_run=True)
        adapter.submit(Protocol.CHI_PC_BELL, dry_run=True)
        assert len(adapter.job_history) == 2

    def test_list_devices(self, adapter):
        devices = adapter.list_devices()
        assert len(devices) == len(BraketBackend)
        names = [d["name"] for d in devices]
        assert "QUERA_AQUILA" in names
        assert "SV1" in names
        for d in devices:
            assert 0 < d["compatibility"] <= 1.0

    def test_cost_estimation(self, adapter):
        result = adapter.submit(
            Protocol.AETERNA_PORTA,
            device=BraketBackend.QUERA_AQUILA,
            qubits=120,
            shots=100000,
            dry_run=True,
        )
        # QuEra: $0.30/task + $0.01/shot
        assert result.cost_usd == pytest.approx(0.30 + 0.01 * 100000, rel=0.01)

    def test_cost_simulator_free(self, adapter):
        result = adapter.submit(Protocol.BELL_STATE, device=BraketBackend.SV1,
                                dry_run=True)
        assert result.cost_usd == 0.0

    def test_metrics_summary_empty(self, adapter):
        summary = adapter.get_metrics_summary()
        assert summary["total_jobs"] == 0

    def test_detect_backend_type(self, adapter):
        assert adapter._detect_backend_type(BraketBackend.QUERA_AQUILA.value) == "quera"
        assert adapter._detect_backend_type(BraketBackend.IONQ_ARIA.value) == "ionq"
        assert adapter._detect_backend_type(BraketBackend.RIGETTI_ANKAA.value) == "rigetti"
        assert adapter._detect_backend_type(BraketBackend.IQM_GARNET.value) == "iqm"
        assert adapter._detect_backend_type(BraketBackend.SV1.value) == "simulator"


# ---------------------------------------------------------------------------
# Protocol enum
# ---------------------------------------------------------------------------

class TestProtocol:
    def test_all_protocols_have_values(self):
        for proto in Protocol:
            assert isinstance(proto.value, str)
            assert len(proto.value) > 0

    def test_protocol_count(self):
        assert len(Protocol) == 10


# ---------------------------------------------------------------------------
# BraketBackend enum
# ---------------------------------------------------------------------------

class TestBraketBackend:
    def test_all_arns_valid(self):
        for b in BraketBackend:
            assert b.value.startswith("arn:aws:braket")

    def test_backend_count(self):
        assert len(BraketBackend) == 8


# ---------------------------------------------------------------------------
# Constants integrity
# ---------------------------------------------------------------------------

class TestConstants:
    def test_theta_lock_in_openqasm(self):
        compiler = BraketCircuitCompiler()
        qasm = compiler.compile(Protocol.AETERNA_PORTA, qubits=120)
        theta_rad = math.radians(THETA_LOCK_DEG)
        assert f"{theta_rad:.6f}" in qasm

    def test_chi_pc_in_bell(self):
        compiler = BraketCircuitCompiler()
        qasm = compiler.compile(Protocol.BELL_STATE, qubits=2)
        phase = CHI_PC_QUALITY * math.pi
        assert f"{phase:.6f}" in qasm

    def test_drive_amplitude_in_floquet(self):
        compiler = BraketCircuitCompiler()
        qasm = compiler.compile(Protocol.AETERNA_PORTA, qubits=120)
        assert f"{DRIVE_AMPLITUDE:.4f}" in qasm
