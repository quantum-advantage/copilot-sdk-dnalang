# Contributing to DNALang SDK

Thank you for your interest in contributing to DNALang SDK! This guide will help you get started.

## Code of Conduct

Please read and follow our [Code of Conduct](../../CODE_OF_CONDUCT.md).

## Getting Started

### Development Setup

1. **Fork and clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/copilot-sdk
cd copilot-sdk/dnalang
```

2. **Create a virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install in development mode:**
```bash
pip install -e ".[dev,quantum]"
```

4. **Run tests:**
```bash
pytest tests/
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Use prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `test/` - Tests
- `refactor/` - Code refactoring

### 2. Make Changes

- Follow the coding standards below
- Write tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Run all tests
pytest tests/

# Run with coverage
pytest --cov=dnalang_sdk tests/

# Run specific test file
pytest tests/test_quantum.py

# Run linter
pylint src/dnalang_sdk

# Format code
black src/ tests/
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add quantum circuit optimization"
```

Use conventional commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `chore:` - Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Coding Standards

### Python Style

- Follow PEP 8
- Use type hints
- Maximum line length: 100 characters
- Use docstrings for all public functions

Example:
```python
async def execute_circuit(
    circuit: QuantumCircuit,
    shots: int = 1024,
    backend: str = "aer_simulator",
) -> QuantumResult:
    """
    Execute quantum circuit on specified backend.
    
    Args:
        circuit: Quantum circuit to execute
        shots: Number of measurement shots
        backend: Backend identifier
        
    Returns:
        QuantumResult with execution data
        
    Raises:
        ValueError: If circuit is invalid
        RuntimeError: If execution fails
    """
    # Implementation
```

### Documentation

- Document all public APIs
- Include examples in docstrings
- Update README.md for new features
- Add cookbook examples for significant features

### Testing

- Write unit tests for new functions
- Write integration tests for new features
- Aim for >80% code coverage
- Use pytest fixtures for common setups

Example:
```python
@pytest.mark.asyncio
async def test_circuit_execution():
    """Test circuit execution on simulator."""
    async with DNALangCopilotClient() as client:
        circuit = client.create_quantum_circuit(num_qubits=2)
        circuit.h(0).cx(0, 1)
        
        result = await client.execute_quantum_circuit(circuit)
        
        assert result.success
        assert len(result.counts) > 0
```

## Areas for Contribution

### High Priority

- [ ] Additional quantum backend support (IonQ, Rigetti, etc.)
- [ ] Circuit optimization algorithms
- [ ] Error mitigation strategies
- [ ] Performance benchmarks
- [ ] More cookbook examples

### Medium Priority

- [ ] Visualization tools
- [ ] Circuit analysis tools
- [ ] Noise modeling
- [ ] Hardware-specific optimizations
- [ ] Integration tests

### Documentation

- [ ] Tutorial videos
- [ ] Blog posts
- [ ] Jupyter notebooks
- [ ] API reference improvements
- [ ] Troubleshooting guides

## Feature Requests

We welcome feature requests! Before submitting:

1. Check existing issues
2. Describe the use case
3. Provide examples if possible
4. Discuss implementation approach

Create an issue with the `enhancement` label.

## Bug Reports

Found a bug? Please report it!

1. Check if it's already reported
2. Provide a minimal reproduction
3. Include system information
4. Describe expected vs actual behavior

Create an issue with the `bug` label.

## Review Process

### Pull Request Checklist

- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Code follows style guide
- [ ] Commit messages are clear
- [ ] No merge conflicts

### Review Timeline

- Small fixes: 1-2 days
- Features: 3-7 days
- Major changes: 1-2 weeks

### Approval Process

1. Automated tests must pass
2. Code review by maintainer
3. Documentation review
4. Integration testing
5. Merge to main

## Community

### Getting Help

- [GitHub Issues](https://github.com/github/copilot-sdk/issues)
- [Discussions](https://github.com/github/copilot-sdk/discussions)
- [Discord](https://discord.gg/dnalang) (if available)

### Contributors

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for list of contributors.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to reach out:
- Open an issue
- Start a discussion
- Contact maintainers

Thank you for contributing to DNALang SDK! 🚀
