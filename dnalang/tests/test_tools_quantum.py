"""Tests for tools.py and quantum.py modules."""

import json
import pytest

from dnalang_sdk.quantum import QuantumCircuit, QuantumResult
from dnalang_sdk.tools import (
    ToolRegistry,
    QuantumExecutionTool,
    LambdaPhiValidationTool,
    ConsciousnessScalingTool,
)


# ═══════════════════════════════════════════════════════════════════════════════
# QuantumCircuit Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestQuantumCircuit:
    """Tests for QuantumCircuit dataclass."""

    def test_creation_defaults(self):
        qc = QuantumCircuit(num_qubits=3)
        assert qc.num_qubits == 3
        assert qc.gates == []
        assert qc.name is None
        assert qc.metadata == {}

    def test_creation_with_args(self):
        gates = [{"type": "h", "target": 0}]
        qc = QuantumCircuit(num_qubits=2, gates=gates, name="bell", metadata={"v": 1})
        assert qc.num_qubits == 2
        assert len(qc.gates) == 1
        assert qc.name == "bell"
        assert qc.metadata == {"v": 1}

    def test_add_gate(self):
        qc = QuantumCircuit(num_qubits=2)
        result = qc.add_gate("h", target=0)
        assert result is qc  # returns self
        assert len(qc.gates) == 1
        assert qc.gates[0] == {"type": "h", "target": 0}

    def test_h_gate(self):
        qc = QuantumCircuit(num_qubits=1)
        result = qc.h(0)
        assert result is qc
        assert qc.gates[-1] == {"type": "h", "target": 0}

    def test_x_gate(self):
        qc = QuantumCircuit(num_qubits=1)
        result = qc.x(0)
        assert result is qc
        assert qc.gates[-1] == {"type": "x", "target": 0}

    def test_y_gate(self):
        qc = QuantumCircuit(num_qubits=1)
        result = qc.y(0)
        assert result is qc
        assert qc.gates[-1] == {"type": "y", "target": 0}

    def test_z_gate(self):
        qc = QuantumCircuit(num_qubits=1)
        result = qc.z(0)
        assert result is qc
        assert qc.gates[-1] == {"type": "z", "target": 0}

    def test_cx_gate(self):
        qc = QuantumCircuit(num_qubits=2)
        result = qc.cx(0, 1)
        assert result is qc
        assert qc.gates[-1] == {"type": "cx", "control": 0, "target": 1}

    def test_gate_chaining(self):
        qc = QuantumCircuit(num_qubits=2)
        qc.h(0).cx(0, 1).x(1).z(0)
        assert len(qc.gates) == 4
        assert qc.gates[0]["type"] == "h"
        assert qc.gates[1]["type"] == "cx"
        assert qc.gates[2]["type"] == "x"
        assert qc.gates[3]["type"] == "z"

    def test_to_json(self):
        qc = QuantumCircuit(num_qubits=2, name="test")
        qc.h(0).cx(0, 1)
        json_str = qc.to_json()
        data = json.loads(json_str)
        assert data["num_qubits"] == 2
        assert data["name"] == "test"
        assert len(data["gates"]) == 2

    def test_from_json(self):
        data = {
            "num_qubits": 3,
            "gates": [{"type": "h", "target": 0}],
            "name": "restored",
            "metadata": {"key": "val"},
        }
        qc = QuantumCircuit.from_json(json.dumps(data))
        assert qc.num_qubits == 3
        assert qc.name == "restored"
        assert len(qc.gates) == 1
        assert qc.metadata == {"key": "val"}

    def test_json_roundtrip(self):
        qc = QuantumCircuit(num_qubits=4, name="roundtrip")
        qc.h(0).cx(0, 1).y(2).z(3)
        restored = QuantumCircuit.from_json(qc.to_json())
        assert restored.num_qubits == qc.num_qubits
        assert restored.name == qc.name
        assert restored.gates == qc.gates
        assert restored.metadata == qc.metadata

    def test_empty_circuit_json_roundtrip(self):
        qc = QuantumCircuit(num_qubits=1)
        restored = QuantumCircuit.from_json(qc.to_json())
        assert restored.num_qubits == 1
        assert restored.gates == []

    def test_multiple_gates_same_qubit(self):
        qc = QuantumCircuit(num_qubits=1)
        qc.h(0).x(0).y(0).z(0)
        assert len(qc.gates) == 4


# ═══════════════════════════════════════════════════════════════════════════════
# QuantumResult Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestQuantumResult:
    """Tests for QuantumResult dataclass."""

    def test_creation(self):
        result = QuantumResult(
            counts={"00": 500, "11": 500},
            backend="aer_simulator",
            shots=1000,
            execution_time=0.5,
        )
        assert result.counts == {"00": 500, "11": 500}
        assert result.backend == "aer_simulator"
        assert result.shots == 1000
        assert result.execution_time == 0.5
        assert result.success is True

    def test_defaults(self):
        result = QuantumResult(counts={}, backend="sim", shots=100, execution_time=0.1)
        assert result.success is True
        assert result.lambda_phi_conserved is None
        assert result.ccce_metric is None
        assert result.job_id is None
        assert result.metadata == {}

    def test_get_probabilities(self):
        result = QuantumResult(
            counts={"00": 300, "11": 700},
            backend="sim",
            shots=1000,
            execution_time=0.1,
        )
        probs = result.get_probabilities()
        assert abs(probs["00"] - 0.3) < 1e-9
        assert abs(probs["11"] - 0.7) < 1e-9

    def test_get_probabilities_single_outcome(self):
        result = QuantumResult(
            counts={"000": 1024},
            backend="sim",
            shots=1024,
            execution_time=0.1,
        )
        probs = result.get_probabilities()
        assert abs(probs["000"] - 1.0) < 1e-9

    def test_get_most_frequent_default(self):
        result = QuantumResult(
            counts={"00": 100, "01": 200, "10": 300, "11": 400},
            backend="sim",
            shots=1000,
            execution_time=0.1,
        )
        top = result.get_most_frequent()
        assert len(top) == 1
        assert top[0] == ("11", 400)

    def test_get_most_frequent_n(self):
        result = QuantumResult(
            counts={"00": 100, "01": 200, "10": 300, "11": 400},
            backend="sim",
            shots=1000,
            execution_time=0.1,
        )
        top = result.get_most_frequent(n=2)
        assert len(top) == 2
        assert top[0] == ("11", 400)
        assert top[1] == ("10", 300)

    def test_get_most_frequent_exceeds_count(self):
        result = QuantumResult(
            counts={"0": 500, "1": 500},
            backend="sim",
            shots=1000,
            execution_time=0.1,
        )
        top = result.get_most_frequent(n=5)
        assert len(top) == 2

    def test_optional_fields(self):
        result = QuantumResult(
            counts={"0": 1024},
            backend="ibm_fez",
            shots=1024,
            execution_time=1.5,
            success=False,
            lambda_phi_conserved=0.95,
            ccce_metric=0.87,
            job_id="job_123",
            metadata={"error": "timeout"},
        )
        assert result.success is False
        assert result.lambda_phi_conserved == 0.95
        assert result.ccce_metric == 0.87
        assert result.job_id == "job_123"
        assert result.metadata["error"] == "timeout"


# ═══════════════════════════════════════════════════════════════════════════════
# Tool Classes Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestQuantumExecutionTool:
    """Tests for QuantumExecutionTool."""

    def test_name_and_description(self):
        tool = QuantumExecutionTool()
        assert tool.name == "execute_quantum_circuit"
        assert isinstance(tool.description, str)
        assert len(tool.description) > 0

    def test_to_definition_structure(self):
        tool = QuantumExecutionTool()
        defn = tool.to_definition()
        assert defn["name"] == "execute_quantum_circuit"
        assert "description" in defn
        assert "parameters" in defn
        params = defn["parameters"]
        assert params["type"] == "object"
        assert "num_qubits" in params["properties"]
        assert "gates" in params["properties"]
        assert "backend" in params["properties"]
        assert "shots" in params["properties"]
        assert "num_qubits" in params["required"]
        assert "gates" in params["required"]


class TestLambdaPhiValidationTool:
    """Tests for LambdaPhiValidationTool."""

    def test_name_and_description(self):
        tool = LambdaPhiValidationTool()
        assert tool.name == "validate_lambda_phi_conservation"
        assert isinstance(tool.description, str)

    def test_to_definition_structure(self):
        tool = LambdaPhiValidationTool()
        defn = tool.to_definition()
        assert defn["name"] == "validate_lambda_phi_conservation"
        params = defn["parameters"]
        assert "num_qubits" in params["properties"]
        assert "gates" in params["properties"]
        assert "operator" in params["properties"]
        assert "num_trials" in params["properties"]
        assert "num_qubits" in params["required"]
        assert "gates" in params["required"]


class TestConsciousnessScalingTool:
    """Tests for ConsciousnessScalingTool."""

    def test_name_and_description(self):
        tool = ConsciousnessScalingTool()
        assert tool.name == "measure_consciousness_scaling"
        assert isinstance(tool.description, str)

    def test_to_definition_structure(self):
        tool = ConsciousnessScalingTool()
        defn = tool.to_definition()
        assert defn["name"] == "measure_consciousness_scaling"
        params = defn["parameters"]
        assert "qubit_range" in params["properties"]
        assert "num_samples" in params["properties"]


# ═══════════════════════════════════════════════════════════════════════════════
# ToolRegistry Tests
# ═══════════════════════════════════════════════════════════════════════════════


class TestToolRegistry:
    """Tests for ToolRegistry."""

    def test_initialization_registers_defaults(self):
        registry = ToolRegistry()
        names = registry.get_all_tool_names()
        assert "execute_quantum_circuit" in names
        assert "validate_lambda_phi_conservation" in names
        assert "measure_consciousness_scaling" in names
        assert len(names) == 3

    def test_get_tool(self):
        registry = ToolRegistry()
        tool = registry.get_tool("execute_quantum_circuit")
        assert tool is not None
        assert isinstance(tool, QuantumExecutionTool)

    def test_get_tool_nonexistent(self):
        registry = ToolRegistry()
        assert registry.get_tool("nonexistent") is None

    def test_register_tool(self):
        registry = ToolRegistry()

        class CustomTool:
            name = "custom_tool"
            description = "A custom tool"
            def to_definition(self):
                return {"name": self.name, "description": self.description, "parameters": {}}

        registry.register_tool(CustomTool())
        assert "custom_tool" in registry.get_all_tool_names()
        assert registry.get_tool("custom_tool") is not None

    def test_get_tool_definitions(self):
        registry = ToolRegistry()
        definitions = registry.get_tool_definitions()
        assert isinstance(definitions, list)
        assert len(definitions) == 3
        for defn in definitions:
            assert "name" in defn
            assert "description" in defn
            assert "parameters" in defn

    def test_register_overwrites_existing(self):
        registry = ToolRegistry()

        class FakeTool:
            name = "execute_quantum_circuit"
            description = "Overwritten"
            def to_definition(self):
                return {"name": self.name, "description": self.description, "parameters": {}}

        registry.register_tool(FakeTool())
        tool = registry.get_tool("execute_quantum_circuit")
        assert tool.description == "Overwritten"
