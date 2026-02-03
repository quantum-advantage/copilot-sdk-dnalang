"""Tests for DNALang SDK core functionality."""

import pytest
import asyncio
from dnalang_sdk import (
    DNALangCopilotClient,
    QuantumConfig,
    QuantumCircuit,
)


@pytest.mark.asyncio
async def test_client_creation():
    """Test client creation with default config."""
    client = DNALangCopilotClient()
    assert client is not None
    assert client.quantum_config is not None


@pytest.mark.asyncio
async def test_quantum_circuit_creation():
    """Test quantum circuit creation."""
    client = DNALangCopilotClient()
    
    circuit = client.create_quantum_circuit(num_qubits=2)
    assert circuit.num_qubits == 2
    assert len(circuit.gates) == 0
    
    circuit.h(0)
    circuit.cx(0, 1)
    assert len(circuit.gates) == 2


@pytest.mark.asyncio
async def test_circuit_execution_simulator():
    """Test circuit execution on simulator."""
    async with DNALangCopilotClient(
        quantum_config=QuantumConfig(backend="aer_simulator")
    ) as client:
        
        circuit = client.create_quantum_circuit(num_qubits=2)
        circuit.h(0).cx(0, 1)
        
        result = await client.execute_quantum_circuit(
            circuit=circuit,
            shots=100,
            backend="aer_simulator"
        )
        
        assert result.success
        assert result.shots == 100
        assert len(result.counts) > 0


@pytest.mark.asyncio
async def test_lambda_phi_validator_creation():
    """Test lambda-phi validator creation."""
    client = DNALangCopilotClient()
    validator = client.create_lambda_phi_validator()
    
    assert validator is not None
    assert validator.config is not None


@pytest.mark.asyncio
async def test_consciousness_analyzer_creation():
    """Test consciousness analyzer creation."""
    client = DNALangCopilotClient()
    analyzer = client.create_consciousness_analyzer()
    
    assert analyzer is not None
    assert analyzer.config is not None


def test_quantum_circuit_serialization():
    """Test circuit JSON serialization."""
    circuit = QuantumCircuit(num_qubits=3)
    circuit.h(0).cx(0, 1).cx(1, 2)
    
    json_str = circuit.to_json()
    assert json_str is not None
    
    restored = QuantumCircuit.from_json(json_str)
    assert restored.num_qubits == circuit.num_qubits
    assert len(restored.gates) == len(circuit.gates)
