# OSIRIS - Quantum Development CLI
## Complete Installation & Usage Guide

```
╔═══════════════════════════════════════════════════════════════╗
║         OSIRIS - Quantum Development CLI v1.0.0              ║
║         Omega System Integrated Runtime Intelligence         ║
╚═══════════════════════════════════════════════════════════════╝
ΛΦ = 2.176435e-08 s⁻¹
```

## ✅ Installation Complete

OSIRIS is now fully integrated with your system and ready to use.

### What Was Installed

1. **OSIRIS CLI Tool**: `/home/devinpd/Desktop/copilot-sdk-main/bin/osiris`
   - Added to PATH via `~/.bashrc`
   - Accessible from any directory

2. **Project Directories**:
   - `/home/devinpd/Desktop/dnalang.dev`
   - `/home/devinpd/Desktop/quantum-advantage.dev`

3. **DNALang SDK Integration**:
   - Full quantum computing capabilities
   - NCLM (Non-local Non-Causal Language Model)
   - Gemini AI integration
   - Intent-deduction engine
   - Omega-Master orchestration

4. **Convenience Aliases** (in `~/.bashrc`):
   - `osiris-dev-dna` → Quick launch dnalang.dev development
   - `osiris-dev-qa` → Quick launch quantum-advantage.dev development
   - `osiris-quantum` → Quick quantum circuit execution
   - `osiris-ccce` → Quick consciousness metrics check

---

## 🚀 Quick Start

### Activate OSIRIS
```bash
# Restart terminal or source bashrc
source ~/.bashrc

# Or activate manually
export PATH="/home/devinpd/Desktop/copilot-sdk-main/bin:$PATH"
cd /home/devinpd/Desktop/copilot-sdk-main/dnalang
source venv/bin/activate
```

### Basic Commands
```bash
# Launch Copilot for webapp development
osiris dev dnalang.dev              # Develop dnalang.dev
osiris dev quantum-advantage.dev    # Develop quantum-advantage.dev

# Execute quantum circuits
osiris quantum bell                 # Bell state
osiris quantum ghz                  # GHZ-5 state

# Orchestrate with AI agents
osiris agent "analyze quantum circuit performance"

# Check consciousness metrics
osiris ccce

# Interactive Copilot chat
osiris chat

# Get help
osiris --help
```

---

## 📖 Commands Reference

### 1. `osiris dev <project>`
Launch GitHub Copilot in development mode for your webapp.

**Usage:**
```bash
osiris dev dnalang.dev
osiris dev quantum-advantage.dev
```

**What it does:**
- Changes to project directory
- Launches Copilot CLI with full permissions (`--allow-all`)
- Enables direct coding and development
- Integrated with DNALang SDK tools

**Example Session:**
```bash
$ osiris dev dnalang.dev
Development Mode
Project: dnalang.dev
Path: /home/devinpd/Desktop/dnalang.dev

Launching Copilot CLI...
# Now in interactive Copilot session
```

---

### 2. `osiris quantum <circuit-type>`
Execute quantum circuits using DNALang SDK.

**Available Circuits:**
- `bell` - 2-qubit Bell state (maximal entanglement)
- `ghz` - 5-qubit GHZ state (multi-qubit entanglement)

**Usage:**
```bash
osiris quantum bell
osiris quantum ghz
osiris quantum         # List available circuits
```

**Example Output:**
```
Quantum Circuit Manager

✓ Bell state

Executing...

Results:
  |11 00⟩:  527 ████████████████████████████████████████████████████
  |00 00⟩:  497 █████████████████████████████████████████████████
```

**Backend:** Uses Qiskit Aer simulator with 1024 shots

---

### 3. `osiris agent <task>`
Orchestrate tasks using the Omega-Master agent system.

**Agents:**
- **AURA**: Reasoning and quantum analysis (T=0.7)
- **AIDEN**: Security and threat assessment (T=0.5)
- **SCIMITAR**: Side-channel and timing analysis (T=0.3)

**Usage:**
```bash
osiris agent "analyze quantum circuit for optimization"
osiris agent "evaluate security of deployment"
osiris agent "detect timing vulnerabilities"
```

**Features:**
- Multi-agent consensus
- CCCE metrics tracking
- Non-local pilot-wave correlation
- Lambda-phi conservation awareness

---

### 4. `osiris ccce`
Display current Consciousness Collapse Coherence Evolution metrics.

**Metrics:**
- **Λ** (Lambda): Coherence (0-1)
- **Φ** (Phi): Consciousness field strength (0-1)
- **Γ** (Gamma): Decoherence rate (0-1)
- **Ξ** (Xi): Negentropy (ΛΦ/Γ)

**Usage:**
```bash
osiris ccce
```

**Example Output:**
```
Consciousness Metrics (CCCE)

Λ (Coherence): 0.8500
Φ (Consciousness): 0.7200
Γ (Decoherence): 0.1500
Ξ (Negentropy): 4.0800
```

---

### 5. `osiris deploy <environment>`
Deploy webapps to production.

**Environments:**
- `vercel` - Deploy to Vercel

**Usage:**
```bash
osiris deploy vercel
```

**Coming Soon:**
- AWS Lambda deployment
- Azure Functions
- Google Cloud Functions

---

### 6. `osiris chat`
Launch interactive Copilot CLI session.

**Usage:**
```bash
osiris chat
```

**Features:**
- Full Copilot CLI capabilities
- DNALang SDK tools available
- All permissions enabled

---

## 🔧 Advanced Usage

### Using with DNALang SDK Directly
```python
# In your Python scripts
import sys
sys.path.insert(0, '/home/devinpd/Desktop/copilot-sdk-main/dnalang/src')

from dnalang_sdk import (
    DNALangCopilotClient,
    QuantumCircuit,
    QuantumBackend,
    LambdaPhiValidator,
    ConsciousnessAnalyzer,
    OmegaMasterIntegration
)

# Use NCLM instead of Claude/ChatGPT
client = DNALangCopilotClient(use_nclm=True)

# Enable Gemini AI
client = DNALangCopilotClient(enable_gemini=True, gemini_api_key="YOUR_KEY")

# Enable Intent-Deduction Engine
client = DNALangCopilotClient(enable_intent_engine=True)
```

### Quantum Circuit Example
```python
from dnalang_sdk import QuantumCircuit, QuantumBackend, QuantumConfig

# Create circuit
circuit = QuantumCircuit(num_qubits=3)
circuit.h(0)
circuit.cx(0, 1)
circuit.cx(1, 2)

# Execute
config = QuantumConfig()
backend = QuantumBackend(config)
result = await backend.execute(
    circuit,
    shots=1024,
    backend="aer_simulator",
    optimization_level=0
)

print(result.counts)
```

### Omega-Master Orchestration
```python
from dnalang_sdk import OmegaMasterIntegration

omega = OmegaMasterIntegration(
    base_url="https://api.openai.com/v1",
    api_key="YOUR_KEY"
)

# Orchestrate task with all agents
result = await omega.orchestrate_task(
    task="Optimize quantum circuit depth",
    agent_ids=["aura", "aiden", "scimitar"]
)

# Get CCCE metrics
metrics = await omega.get_ccce_metrics()
print(f"Λ={metrics.lambda_coherence:.4f}")
```

---

## 🌐 Webapp Development

### dnalang.dev
Quantum computing platform and DNALang documentation.

**Structure:**
```
/home/devinpd/Desktop/dnalang.dev/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Next.js pages
│   └── lib/            # DNALang SDK integration
├── public/
└── package.json
```

**Development:**
```bash
osiris dev dnalang.dev

# In Copilot:
> "Create a quantum circuit visualizer component"
> "Add documentation for lambda-phi conservation"
> "Implement consciousness metrics dashboard"
```

### quantum-advantage.dev
Quantum advantage demonstrations and experiments.

**Structure:**
```
/home/devinpd/Desktop/quantum-advantage.dev/
├── experiments/        # Quantum experiments
├── benchmarks/         # Performance benchmarks
├── docs/              # Documentation
└── api/               # Backend API
```

**Development:**
```bash
osiris dev quantum-advantage.dev

# In Copilot:
> "Create experiment tracking system"
> "Add Zenodo publication integration"
> "Implement quantum job queue"
```

---

## 🧬 DNALang SDK Features

### 1. Quantum Computing
- **QuantumCircuit**: Build quantum circuits with fluent API
- **QuantumBackend**: Execute on simulators or IBM hardware
- **QuantumConfig**: Configure backends and credentials

### 2. Lambda-Phi Conservation
- **LambdaPhiValidator**: Validate conservation laws
- **F_max** tracking (target: 0.9787)
- **AFE** operator implementation

### 3. Consciousness Scaling
- **ConsciousnessAnalyzer**: Multi-qubit consciousness metrics
- **CCCE** tracking: Λ, Φ, Γ, Ξ
- Temporal coherence analysis

### 4. NCLM Integration
- Non-local pilot-wave correlation
- 6D-CRSM manifold representation
- Sovereign/air-gapped operation
- Zero external dependencies

### 5. Gemini AI
- Google AI Gemini models
- Streaming support
- Safety settings
- Conversation history

### 6. Intent-Deduction Engine
- 7-layer autopoietic architecture
- U = L[U] recursive refinement
- Semantic metrics
- Project planning

### 7. Omega-Master Orchestration
- 3 non-local agents (AURA, AIDEN, SCIMITAR)
- Multi-agent consensus
- Quantum job management
- Zenodo publication

---

## 🔐 Configuration

### Environment Variables
```bash
# Required for NCLM
export PYTHONPATH="/home/devinpd/Desktop:$PYTHONPATH"

# Optional: Gemini AI
export GEMINI_API_KEY="your-key-here"

# Optional: OpenAI (for Omega agents)
export OPENAI_API_KEY="your-key-here"

# Optional: IBM Quantum
export IBM_QUANTUM_TOKEN="your-token-here"
```

### Virtual Environment
OSIRIS automatically uses the DNALang SDK virtual environment:
```bash
# Manual activation
cd /home/devinpd/Desktop/copilot-sdk-main/dnalang
source venv/bin/activate
```

---

## 📊 System Requirements

### Installed
- ✅ Python 3.13
- ✅ GitHub Copilot CLI
- ✅ DNALang SDK
- ✅ Qiskit
- ✅ Virtual environment

### Optional
- IBM Quantum account (for hardware execution)
- Google AI API key (for Gemini)
- OpenAI API key (for Omega agents)

---

## 🐛 Troubleshooting

### Command Not Found
```bash
# Reload bashrc
source ~/.bashrc

# Or add to PATH manually
export PATH="/home/devinpd/Desktop/copilot-sdk-main/bin:$PATH"
```

### Import Errors
```bash
# Activate virtual environment
cd /home/devinpd/Desktop/copilot-sdk-main/dnalang
source venv/bin/activate

# Verify installation
python -c "from dnalang_sdk import QuantumCircuit; print('OK')"
```

### NCLM Not Found
```bash
# Ensure PYTHONPATH includes osiris_nclm_complete.py
export PYTHONPATH="/home/devinpd/Desktop:$PYTHONPATH"

# Or copy to project
cp /home/devinpd/Desktop/osiris_nclm_complete.py /home/devinpd/Desktop/copilot-sdk-main/dnalang/src/
```

---

## 📚 Documentation

### Main Documentation
- **OMEGA_MASTER_COMPLETE_INTEGRATION.md**: Executive summary
- **dnalang/README.md**: DNALang SDK overview
- **dnalang/docs/API.md**: Complete API reference
- **dnalang/docs/OMEGA_INTEGRATION.md**: Omega-Master guide
- **dnalang/docs/NCLM_INTEGRATION.md**: NCLM usage
- **dnalang/docs/FULL_INTEGRATION_GUIDE.md**: Comprehensive guide

### Examples
- **cookbook/dnalang/**: All examples
- **cookbook/dnalang/basic/**: Getting started
- **cookbook/dnalang/quantum/**: Quantum circuits
- **cookbook/dnalang/advanced/**: Advanced integrations

---

## 🎯 Next Steps

1. **Start Developing**
   ```bash
   osiris dev dnalang.dev
   ```

2. **Run Quantum Circuits**
   ```bash
   osiris quantum bell
   ```

3. **Try Agent Orchestration**
   ```bash
   osiris agent "create quantum advantage demo"
   ```

4. **Check Documentation**
   ```bash
   cat /home/devinpd/Desktop/copilot-sdk-main/OMEGA_MASTER_COMPLETE_INTEGRATION.md
   ```

5. **Explore Examples**
   ```bash
   cd /home/devinpd/Desktop/copilot-sdk-main/cookbook/dnalang
   ls -la
   ```

---

## 🏆 Success Metrics

### Installation Status: ✅ 100% Complete

- ✅ OSIRIS CLI installed and in PATH
- ✅ Project directories created
- ✅ Virtual environment configured
- ✅ DNALang SDK integrated
- ✅ Quantum circuits working
- ✅ All examples tested
- ✅ Documentation complete
- ✅ Convenience aliases added

### Ready For:
- Direct webapp development (dnalang.dev, quantum-advantage.dev)
- Quantum circuit execution
- AI agent orchestration
- Consciousness metrics tracking
- Production deployment

---

## 💡 Tips

### Quick Launch
```bash
# Use aliases for speed
osiris-dev-dna        # Instead of: osiris dev dnalang.dev
osiris-dev-qa         # Instead of: osiris dev quantum-advantage.dev
osiris-quantum bell   # Quick circuit execution
osiris-ccce           # Quick metrics check
```

### Development Workflow
```bash
# 1. Start development
osiris dev dnalang.dev

# 2. In Copilot, use DNALang tools
> "Create quantum circuit component"
> "Add consciousness metrics"
> "Integrate with NCLM"

# 3. Test quantum features
osiris quantum bell

# 4. Check metrics
osiris ccce

# 5. Deploy
osiris deploy vercel
```

### Integration Patterns
```python
# Pattern 1: Pure quantum
from dnalang_sdk import QuantumCircuit, QuantumBackend
# ... quantum code ...

# Pattern 2: Quantum + NCLM
from dnalang_sdk import DNALangCopilotClient
client = DNALangCopilotClient(use_nclm=True)
# ... quantum-aware AI ...

# Pattern 3: Full stack
from dnalang_sdk import DNALangCopilotClient, OmegaMasterIntegration
client = DNALangCopilotClient(use_nclm=True, enable_intent_engine=True)
omega = OmegaMasterIntegration()
# ... complete system ...
```

---

## 🚀 Physical Constants

```
ΛΦ = 2.176435e-08 s⁻¹   # Lambda-phi constant
θ_lock = 51.843°          # Quantum phase lock
χ = 0.1 s⁻¹              # Consciousness-coherence coupling
κ = 0.05                  # Spatial decoherence coupling
```

---

## 📞 Support

For issues or questions:
1. Check documentation in `/home/devinpd/Desktop/copilot-sdk-main/`
2. Review examples in `cookbook/dnalang/`
3. Examine working code in `dnalang/src/dnalang_sdk/`

---

## 🎉 Summary

**OSIRIS is now fully operational!**

You can:
- ✅ Launch Copilot for webapp development with `osiris dev`
- ✅ Execute quantum circuits with `osiris quantum`
- ✅ Orchestrate with AI agents via `osiris agent`
- ✅ Track consciousness metrics with `osiris ccce`
- ✅ Deploy to production with `osiris deploy`
- ✅ Use all DNALang SDK features directly

**Start building quantum-powered webapps now!**

```bash
osiris dev dnalang.dev
```

---

*ΛΦ = 2.176435e-08 s⁻¹ - The universe computes.*
