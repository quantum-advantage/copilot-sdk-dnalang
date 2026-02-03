# Test Suite for Dnalang Sovereign Copilot SDK

Comprehensive test coverage for all SDK components.

## Structure

```
tests/
├── conftest.py              # Pytest configuration and fixtures
├── unit/                    # Unit tests (fast, isolated)
│   ├── test_agent.py
│   ├── test_enhanced_agent.py
│   ├── test_quantum_engine.py
│   ├── test_code_generator.py
│   └── test_dev_tools.py
└── integration/             # Integration tests (slower, real workflows)
    ├── test_workflows.py
    ├── test_code_generation.py
    └── test_dev_tools_integration.py
```

## Running Tests

### Install Test Dependencies

```bash
cd python
pip install -e ".[dev]"
```

Or install manually:
```bash
pip install pytest pytest-asyncio
```

### Run All Tests

```bash
# From repository root
pytest

# Or from python directory
cd python
pytest ../tests
```

### Run Specific Test Categories

```bash
# Unit tests only (fast)
pytest tests/unit

# Integration tests only
pytest tests/integration

# Specific test file
pytest tests/unit/test_quantum_engine.py

# Specific test class
pytest tests/unit/test_quantum_engine.py::TestQuantumMetrics

# Specific test method
pytest tests/unit/test_quantum_engine.py::TestQuantumMetrics::test_above_threshold_true
```

### Run with Options

```bash
# Verbose output
pytest -v

# Show print statements
pytest -s

# Stop on first failure
pytest -x

# Run only tests matching pattern
pytest -k "quantum"

# Skip integration tests
pytest -m "not integration"

# Show coverage
pytest --cov=copilot_quantum --cov-report=html
```

### Async Tests

All async tests use `@pytest.mark.asyncio` decorator and run automatically with pytest-asyncio plugin.

## Test Coverage

### Unit Tests (~150 tests)

- **Quantum Engine** (test_quantum_engine.py)
  - Physical constants validation
  - QuantumMetrics dataclass
  - Threshold and coherence checks
  - LambdaPhiEngine functionality
  - AeternaPorta backend initialization

- **Code Generator** (test_code_generator.py)
  - CodeIntent enum
  - Intent recognition from natural language
  - Code generation for functions, classes
  - Bug fixing
  - Code optimization
  - Test generation
  - Documentation generation

- **Developer Tools** (test_dev_tools.py)
  - File operations (read, write, list)
  - Code search (grep-like functionality)
  - Code analysis (metrics, issues, suggestions)
  - Function and class extraction
  - Project structure analysis
  - Git operations

- **Agents** (test_agent.py, test_enhanced_agent.py)
  - Agent initialization and configuration
  - Basic execution
  - Result structures
  - Statistics tracking
  - Quantum execution modes

### Integration Tests (~50 tests)

- **Complete Workflows** (test_workflows.py)
  - Code generation to execution
  - Bug fix workflows
  - Quantum circuit generation
  - Multi-agent scenarios
  - End-to-end development sessions

- **Code Generation** (test_code_generation.py)
  - Multiple function generation
  - Class generation with methods
  - Bug fixing for various error types
  - Code optimization
  - Refactoring
  - Quantum-enhanced vs classical generation
  - Multi-language support

- **Developer Tools Integration** (test_dev_tools_integration.py)
  - Complete file workflows
  - Project analysis
  - Search and replace workflows
  - Dependency analysis
  - Code quality analysis
  - Complex code analysis scenarios

## Fixtures (conftest.py)

- `event_loop` - Async event loop for the test session
- `sample_code` - Sample Python code for testing
- `buggy_code` - Sample buggy code for bug-fixing tests
- `quantum_circuit_request` - Sample quantum circuit parameters

## Writing New Tests

### Unit Test Example

```python
import pytest
from copilot_quantum import SovereignAgent

class TestMyFeature:
    def test_basic_functionality(self):
        """Test basic feature works"""
        agent = SovereignAgent()
        assert agent is not None
    
    @pytest.mark.asyncio
    async def test_async_operation(self):
        """Test async feature"""
        agent = SovereignAgent()
        result = await agent.execute("test")
        assert result.success is True
```

### Integration Test Example

```python
import pytest

@pytest.mark.integration
class TestCompleteWorkflow:
    @pytest.mark.asyncio
    async def test_end_to_end(self):
        """Test complete workflow"""
        # Setup
        agent = EnhancedSovereignAgent()
        
        # Execute workflow
        result = await agent.execute("task")
        
        # Verify
        assert result.success is True
```

## CI/CD Integration

Tests are designed to work in CI/CD pipelines:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: |
    pip install -e ".[dev]"
    pytest --cov=copilot_quantum
```

## Mocking Quantum Backend

For tests that don't need real quantum hardware, the SDK uses mock/simulation mode automatically. No special configuration needed.

## Test Markers

- `@pytest.mark.integration` - Marks integration tests (can be skipped)
- `@pytest.mark.asyncio` - Marks async tests (required for async functions)
- `@pytest.mark.slow` - Marks slow tests (can be skipped for quick runs)

## Troubleshooting

### Import Errors

```bash
# Ensure PYTHONPATH includes src directory
cd python
PYTHONPATH=src pytest ../tests
```

### Async Errors

```bash
# Install pytest-asyncio
pip install pytest-asyncio

# Or specify mode in conftest.py
pytest --asyncio-mode=auto
```

### Test Discovery Issues

```bash
# Verify pytest can find tests
pytest --collect-only
```

## Current Status

✅ Unit tests: Complete  
✅ Integration tests: Complete  
✅ Fixtures: Complete  
⚠️ Coverage: Run `pytest --cov` to check  
⏳ E2E tests with real quantum backend: Optional (requires IBM tokens)

## Next Steps

1. Run full test suite: `pytest -v`
2. Check coverage: `pytest --cov=copilot_quantum --cov-report=html`
3. Review coverage report in `htmlcov/index.html`
4. Add more tests for edge cases as needed
