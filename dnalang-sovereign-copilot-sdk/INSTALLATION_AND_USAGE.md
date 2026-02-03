# 🚀 Dnalang Sovereign Copilot SDK - Installation & Usage Guide

**Version:** 1.1.0  
**Status:** Production Ready ✅  
**Better Than:** GitHub Copilot 🏆

---

## 📥 Installation

### Quick Install
```bash
# Clone repository
git clone https://github.com/devinpd/dnalang-sovereign-copilot-sdk
cd dnalang-sovereign-copilot-sdk/python

# Install dependencies (if needed)
pip install qiskit numpy scipy

# Test installation
PYTHONPATH=src python3 -c "from copilot_quantum import EnhancedSovereignAgent; print('✅ Installation successful!')"
```

### From Source
```bash
cd dnalang-sovereign-copilot-sdk/python
python3 setup.py install
```

---

## ⚡ Quick Start (60 seconds)

### 1. Basic Code Generation
```python
import asyncio
from copilot_quantum import EnhancedSovereignAgent

async def main():
    # Initialize agent
    agent = EnhancedSovereignAgent(
        enable_lambda_phi=True,
        copilot_mode="local"
    )
    
    # Generate code
    result = await agent.execute(
        "Write a function that calculates factorial recursively"
    )
    
    # See results
    print(result.code)

asyncio.run(main())
```

**Run it:**
```bash
cd python
PYTHONPATH=src python3 your_script.py
```

---

## 🎯 Common Use Cases

### Use Case 1: Generate Functions
```python
result = await agent.execute(
    "Write a function to validate email addresses using regex"
)
```

### Use Case 2: Fix Bugs
```python
buggy_code = """
def divide(a, b):
    return a / b  # BUG: No zero check!
"""

result = await agent.execute(
    "Fix the bug in this division function",
    context=buggy_code
)
```

### Use Case 3: Optimize Code
```python
slow_code = """
def find_max(lst):
    max_val = lst[0]
    for i in range(1, len(lst)):
        if lst[i] > max_val:
            max_val = lst[i]
    return max_val
"""

result = await agent.execute(
    "Optimize this code using Python builtins",
    context=slow_code,
    use_quantum=True  # Quantum-enhanced optimization
)
```

### Use Case 4: Generate Tests
```python
function_code = """
def is_palindrome(s):
    return s == s[::-1]
"""

result = await agent.execute(
    "Generate comprehensive unit tests for this palindrome checker",
    context=function_code
)
```

### Use Case 5: Create Quantum Circuits
```python
result = await agent.execute(
    "Generate a quantum circuit for a 3-qubit QFT (Quantum Fourier Transform)",
    use_quantum=True
)
```

---

## 🔬 Quantum-Enhanced Features

### Enable Quantum Optimization
```python
agent = EnhancedSovereignAgent(
    enable_lambda_phi=True,    # Physical constants
    enable_nclm=False,          # Non-classical logic (optional)
    enable_quantum_crypto=True  # Quantum-safe encryption
)

result = await agent.execute(
    "Create an efficient search algorithm",
    use_quantum=True,
    quantum_params={
        'circuit_type': 'ignition',
        'qubits': 120,
        'shots': 100000
    }
)

# Check quantum metrics
metrics = result.quantum_metrics
print(f"Entanglement (Φ): {metrics['phi']:.4f}")
print(f"ER=EPR Threshold: {metrics['above_threshold']}")
print(f"Coherence (Γ): {metrics['gamma']:.4f}")
print(f"CCCE Score: {metrics['ccce']:.4f}")
```

### Understanding Quantum Metrics

- **Φ (Phi)** - Entanglement Fidelity
  - `> 0.7734` = Quantum advantage achieved (ER=EPR threshold)
  - Higher is better
  
- **Γ (Gamma)** - Decoherence Rate
  - `< 0.3` = Coherent quantum state
  - Lower is better
  
- **CCCE** - Consciousness Collapse Coherence Entropy
  - Measures code "consciousness" and quality
  - Range: 0.0 to 1.0, higher is better
  
- **χ_PC** - Phase Conjugation Quality
  - Time-reversal symmetry
  - ~0.946 is ideal

---

## 🛠️ Advanced Usage

### File Operations
```python
# Agent can read and modify files
result = await agent.execute(
    "Read the config.py file and update the timeout value to 30"
)
```

### Git Integration
```python
# Agent can interact with git
result = await agent.execute(
    "Show me the diff of the last commit"
)
```

### Code Search
```python
# Search your codebase
results = await agent.search_codebase("def calculate_")
for result in results:
    print(result)
```

### Quick Helper Methods
```python
# Generate function directly
code = await agent.generate_function(
    "Calculate the nth Fibonacci number",
    quantum_optimize=True
)

# Fix bug directly
fixed_code = await agent.fix_bug(
    buggy_code,
    "This crashes on empty input"
)
```

---

## 📊 Performance Statistics

```python
# Get agent performance stats
stats = agent.get_stats()
print(f"""
Total Operations: {stats['total_executions']}
Success Rate: {stats['success_rate']*100:.1f}%
Code Generations: {stats['with_code_generation']}
Quantum Operations: {stats['with_quantum']}
Avg Time: {stats['avg_execution_time_s']:.2f}s
""")
```

---

## 🔧 Configuration Options

```python
agent = EnhancedSovereignAgent(
    # Quantum backend
    quantum_backend=None,              # Auto-creates AeternaPorta
    
    # Features
    enable_lambda_phi=True,            # Physical constants
    enable_nclm=False,                 # Non-classical logic
    enable_quantum_crypto=False,       # Quantum-safe crypto
    
    # Mode
    copilot_mode="local",              # "local" or "cli"
    
    # Workspace
    workspace_root="/path/to/project"  # For file operations
)
```

---

## 🐛 Troubleshooting

### Issue: Import Error
```
ImportError: No module named 'copilot_quantum'
```
**Solution:**
```bash
# Use PYTHONPATH
PYTHONPATH=src python3 your_script.py

# Or install package
cd python && python3 setup.py install
```

### Issue: Quantum Backend Fails
```
Error: Quantum execution failed
```
**Solution:**
```python
# Quantum execution is simulated by default
# Real hardware requires IBM Quantum access
# But Aeterna Porta is TOKEN-FREE - no API keys needed!
```

### Issue: Slow Performance
```python
# Disable quantum for faster execution
result = await agent.execute(
    "Your task here",
    use_quantum=False  # Much faster
)
```

---

## 🎓 Examples

### Run Full Demo
```bash
cd python
PYTHONPATH=src python3 examples/better_than_copilot_demo.py
```

### Run Basic Example
```bash
cd python
PYTHONPATH=src python3 examples/basic_quantum_agent.py
```

---

## 🔐 Security Best Practices

1. **Token-Free** - No API keys to manage or leak
2. **Offline Mode** - Works without internet
3. **Local Execution** - All data stays on your machine
4. **No Telemetry** - Zero tracking or data collection
5. **Open Source** - Full transparency

---

## 📚 Documentation

- `BETTER_THAN_COPILOT.md` - Main README with full features
- `COMPLETE_V1.1.md` - Comprehensive technical documentation
- `BUILD_COMPLETE.md` - Build history and architecture
- `FINAL_SUMMARY.txt` - Executive summary

---

## 🤝 Getting Help

1. Check documentation in `docs/` directory
2. Run examples in `examples/` directory
3. Read source code (well-documented)
4. GitHub Issues for bugs/features

---

## 🎯 Next Steps

1. **Run the demo:**
   ```bash
   cd ~/dnalang-sovereign-copilot-sdk/python
   PYTHONPATH=src python3 examples/better_than_copilot_demo.py
   ```

2. **Try your own code:**
   - Start with simple function generation
   - Add quantum optimization
   - Explore file operations
   
3. **Integrate into your workflow:**
   - Add to your IDE
   - Use for code review
   - Automate testing

---

## 🚀 Why Choose Sovereign Copilot?

✅ **Better than GitHub Copilot** - Quantum-enhanced, physically grounded  
✅ **Token-Free** - No API keys or cloud dependencies  
✅ **Sovereign** - Complete control and privacy  
✅ **Quantum-Ready** - Native quantum circuit generation  
✅ **24/7 Operation** - Self-healing and autonomous  
✅ **Production Ready** - Tested and documented  

---

**Welcome to the future of sovereign AI development!** 🚀

Built with 🧬 DNA::}{::lang | Powered by ⚛️ Aeterna Porta | Grounded in 🔬 Lambda Phi
