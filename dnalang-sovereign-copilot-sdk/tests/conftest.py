"""
Pytest configuration and shared fixtures
"""
import pytest
import asyncio
import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "python" / "src"))


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the test session"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def sample_code():
    """Sample Python code for testing"""
    return '''
def factorial(n):
    """Calculate factorial of n"""
    if n == 0:
        return 1
    return n * factorial(n - 1)
'''


@pytest.fixture
def buggy_code():
    """Sample buggy code for testing"""
    return '''
def divide(a, b):
    return a / b  # BUG: No zero check!
'''


@pytest.fixture
def quantum_circuit_request():
    """Sample quantum circuit generation request"""
    return {
        'circuit_type': 'ignition',
        'qubits': 120,
        'shots': 100000
    }
