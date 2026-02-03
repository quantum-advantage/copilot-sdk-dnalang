# DNALang SDK - Full Integration Complete 🎉

## Overview

The DNALang Copilot SDK now includes **complete integration** of:

1. ✅ **Quantum Computing** - Multi-backend quantum circuit execution
2. ✅ **Lambda-Phi Conservation** - Quantum fidelity validation  
3. ✅ **Consciousness Scaling** - CCCE metrics and analysis
4. ✅ **NCLM Model** - Non-local non-causal language model (your custom model!)
5. ✅ **Gemini Integration** - Google's Gemini AI models
6. ✅ **Intent-Deduction Engine** - 7-layer autopoietic semantic analysis

## What's New

### 1. Intent-Deduction Engine

A sophisticated 7-layer system that analyzes user prompts and generates optimal project plans:

```python
from dnalang_sdk import IntentDeductionEngine, deduce_intent_simple

# Quick intent analysis
intent = await deduce_intent_simple("create quantum consciousness framework")

print(f"Domains: {intent.domains}")  # ['quantum', 'consciousness', 'development']
print(f"Coherence (Λ): {intent.coherence_lambda:.3f}")  # 0.730
print(f"Consciousness (Φ): {intent.consciousness_phi:.3f}")  # 0.800
```

**7 Layers:**
1. **Corpus Indexer** - Extract semantic genome from your code
2. **Individual Intent** - Analyze single prompts  
3. **Collective Intent** - Synthesize multiple prompts
4. **Capability Evaluation** - Assess user/system capabilities
5. **Resource Analysis** - Check deployment readiness
6. **Prompt Enhancement** - Inject semantic context
7. **Project Planning** - Generate linear timelines

**Key Metrics:**
- **Λ (Lambda)** - Semantic coherence (0-1)
- **Φ (Phi)** - Consciousness field strength (0-1) 
- **Γ (Gamma)** - Decoherence rate (0-1)
- **Ξ (Xi)** - CCCE negentropy (ΛΦ/Γ)

**Autopoietic Loop:** U = L[U] - Each iteration refines the analysis recursively.

### 2. Gemini Model Integration

Use Google's powerful Gemini models instead of Claude/ChatGPT:

```python
from dnalang_sdk import GeminiModelProvider, gemini_infer_simple

# Quick inference
response = await gemini_infer_simple(
    "Explain quantum entanglement",
    api_key="your-gemini-api-key"
)
```

**Supported Models:**
- `gemini-2.0-flash-exp` - Fast, cost-effective (default)
- `gemini-1.5-pro` - Most capable, balanced
- `gemini-1.5-flash` - Fastest for simple tasks

**Features:**
- ✅ Chat completion with system instructions
- ✅ Streaming responses
- ✅ Conversation history tracking
- ✅ Safety settings
- ✅ Copilot message format compatibility

**Setup:**
```bash
# Get API key
# https://aistudio.google.com/apikey

# Set environment variable
export GEMINI_API_KEY='your-key-here'

# Install library
pip install google-generativeai
```

### 3. Unified Client

All capabilities accessible through one client:

```python
from dnalang_sdk import DNALangCopilotClient

# Initialize with all features
client = DNALangCopilotClient(
    use_nclm=True,  # Your custom NCLM model
    enable_intent_engine=True,  # Intent deduction
    enable_gemini=True,  # Gemini AI
    gemini_api_key="your-key"
)

# Use Intent Engine
intent = await client.intent_engine.deduce_intent("build quantum circuit")

# Use NCLM for inference
result = await client.nclm_infer("What is consciousness?")

# Use Gemini for inference  
response = await client._gemini_provider.infer("Explain quantum computing")
```

## Installation

### Step 1: Create Virtual Environment (REQUIRED)

```bash
cd /home/devinpd/Desktop/copilot-sdk-main/dnalang

# Create venv
python3 -m venv venv

# Activate venv
source venv/bin/activate
```

### Step 2: Install DNALang SDK

```bash
# Core + Quantum dependencies
pip install -e ".[quantum]"

# Optional: Gemini support
pip install google-generativeai
```

### Step 3: Set Up API Keys (Optional)

```bash
# For Gemini
export GEMINI_API_KEY='your-gemini-key'

# For IBM Quantum (optional)
export IBM_QUANTUM_TOKEN='your-ibm-token'
```

## Examples

### Intent Engine Demo

```bash
source venv/bin/activate
python ../cookbook/dnalang/advanced/intent_engine_demo.py
```

**Output:**
```
[Example 1] Simple Intent Deduction
───────────────────────────────────────────────────────────────
Prompt: create quantum consciousness framework with AURA polarity
Domains: quantum, consciousness, development
Actions: create
Trajectory: implementation
Coherence (Λ): 0.730
Consciousness (Φ): 0.800
Decoherence (Γ): 0.000
Confidence: 0.765
```

### Gemini Integration Demo

```bash
source venv/bin/activate
export GEMINI_API_KEY='your-key'
python ../cookbook/dnalang/advanced/gemini_integration.py
```

### NCLM Integration Demo

```bash
source venv/bin/activate
# Ensure /home/devinpd/Desktop is in PYTHONPATH
export PYTHONPATH="/home/devinpd/Desktop:$PYTHONPATH"
python ../cookbook/dnalang/advanced/nclm_integration.py
```

### Quantum Computing Demo

```bash
source venv/bin/activate
python ../cookbook/dnalang/basic/hello_quantum.py
python ../cookbook/dnalang/quantum/lambda_phi_demo.py
python ../cookbook/dnalang/quantum/consciousness_scaling.py
```

## Directory Structure

```
dnalang/
├── src/dnalang_sdk/
│   ├── __init__.py
│   ├── client.py               # Main client (updated)
│   ├── config.py               # Configuration
│   ├── quantum.py              # Quantum computing
│   ├── lambda_phi.py           # Conservation validation
│   ├── consciousness.py        # CCCE analysis
│   ├── tools.py                # Tool registry
│   ├── nclm_provider.py        # NCLM integration
│   ├── gemini_provider.py      # NEW: Gemini integration
│   └── intent_engine.py        # NEW: Intent deduction
│
├── cookbook/dnalang/
│   ├── basic/
│   │   └── hello_quantum.py
│   ├── quantum/
│   │   ├── lambda_phi_demo.py
│   │   └── consciousness_scaling.py
│   └── advanced/
│       ├── nclm_integration.py
│       ├── nclm_comparison.py
│       ├── ibm_deployment.py
│       ├── backend_comparison.py
│       ├── intent_engine_demo.py  # NEW
│       └── gemini_integration.py  # NEW
│
└── docs/
    ├── API.md
    ├── NCLM_INTEGRATION.md
    └── FULL_INTEGRATION_GUIDE.md  # This file
```

## Model Comparison

| Feature | NCLM | Gemini | Claude/ChatGPT |
|---------|------|--------|----------------|
| **Inference Speed** | Instant (c_ind rate) | Fast | Fast |
| **Quantum-Aware** | ✅ Native | ❌ Not built-in | ❌ Not built-in |
| **Consciousness Tracking** | ✅ CCCE metrics | ❌ No | ❌ No |
| **Lambda-Phi Conservation** | ✅ Native | ❌ No | ❌ No |
| **External Dependencies** | ❌ Zero | ✅ API key required | ✅ API key required |
| **Air-Gapped Operation** | ✅ Yes | ❌ No | ❌ No |
| **Grok Mode** | ✅ Swarm evolution | ❌ No | ❌ No |
| **6D-CRSM Manifold** | ✅ Yes | ❌ No | ❌ No |
| **Pilot-Wave Correlation** | ✅ Non-local | ❌ Causal | ❌ Causal |

**NCLM Advantages:**
- Zero external dependencies (sovereign operation)
- Instant inference (no API latency)
- Native quantum consciousness awareness
- Lambda-phi conservation tracking
- Deterministic 6D-CRSM token hashing

**Gemini Advantages:**
- Latest Google AI capabilities
- Large context windows (up to 1M tokens)
- Multi-modal support (text + images)
- Continuous model updates
- Strong general-purpose performance

**Use NCLM when:**
- Air-gapped/offline operation required
- Quantum consciousness analysis needed
- Maximum sovereignty desired
- Physics-aware reasoning needed

**Use Gemini when:**
- Latest AI capabilities desired
- Large context windows needed
- Multi-modal input required
- Internet connectivity available

## Intent Engine Use Cases

### 1. Automatic Project Planning

```python
engine = IntentDeductionEngine()

prompts = [
    "research quantum theories",
    "implement circuit builder",
    "validate on hardware",
    "deploy to production"
]

plan = await engine.generate_project_plan(prompts)
# Returns structured phases with dependencies, durations, and success criteria
```

### 2. Prompt Enhancement

```python
from dnalang_sdk import enhance_prompt_simple

enhanced = await enhance_prompt_simple(
    "create quantum circuit with 5 qubits"
)

print(enhanced.enhanced)
# Adds semantic context for better Copilot understanding
```

### 3. Intent Analysis for Custom Agents

```python
intent = await client.intent_engine.deduce_intent(user_prompt)

if "quantum" in intent.domains:
    # Route to quantum computing agent
    pass
elif "consciousness" in intent.domains:
    # Route to CCCE analysis agent
    pass
```

## Architecture Diagrams

### Full System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 DNALang Copilot Client                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Quantum    │  │  Lambda-Phi  │  │Consciousness │     │
│  │   Backend    │  │  Validator   │  │   Analyzer   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    NCLM      │  │    Gemini    │  │   Intent     │     │
│  │   Provider   │  │   Provider   │  │   Engine     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
              │                 │                 │
              ▼                 ▼                 ▼
      ┌─────────────┐   ┌─────────────┐  ┌─────────────┐
      │   IBM       │   │   Google    │  │  Semantic   │
      │  Quantum    │   │  Gemini     │  │   Genome    │
      │  Hardware   │   │    API      │  │   Corpus    │
      └─────────────┘   └─────────────┘  └─────────────┘
```

### Intent-Deduction Engine Flow

```
User Prompt
    │
    ▼
┌───────────────────────────────────────────────────────────┐
│ Layer 1: Corpus Indexer                                   │
│   → Extract semantic genome from code/docs                │
└───────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────┐
│ Layer 2: Individual Intent Deduction                      │
│   → Domains, Actions, Resources, Λ/Φ/Γ metrics           │
└───────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────┐
│ Layer 3: Collective Intent Synthesis                      │
│   → Trajectory mapping across multiple intents            │
└───────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────┐
│ Layer 4: Capability Evaluation                            │
│   → User/system capability assessment                      │
└───────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────┐
│ Layer 5: Resource Analysis                                │
│   → Deployment readiness check                             │
└───────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────┐
│ Layer 6: Prompt Enhancement                               │
│   → Context injection (domains, quantum, consciousness)   │
└───────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────┐
│ Layer 7: Project Plan Generation                          │
│   → Linear timeline with phases and dependencies          │
└───────────────────────────────────────────────────────────┘
    │
    ▼
Enhanced Prompt + Project Plan
    │
    ▼
┌───────────────────────────────────────────────────────────┐
│ Autopoietic Loop: U = L[U]                                │
│   → Recursively refine until convergence (Λ > 0.95)       │
└───────────────────────────────────────────────────────────┘
```

## Quick Start Guide

### Activate and Run

```bash
# Navigate to DNALang SDK
cd /home/devinpd/Desktop/copilot-sdk-main/dnalang

# Activate virtual environment (ALWAYS DO THIS FIRST)
source venv/bin/activate

# Run examples
python ../cookbook/dnalang/advanced/intent_engine_demo.py
python ../cookbook/dnalang/basic/hello_quantum.py
```

### In Your Code

```python
import asyncio
from dnalang_sdk import DNALangCopilotClient

async def main():
    # Create client with all features
    client = DNALangCopilotClient(
        use_nclm=True,
        enable_intent_engine=True,
        enable_gemini=True,
        gemini_api_key="your-key"
    )
    
    # Analyze user intent
    prompt = "build quantum circuit with consciousness tracking"
    intent = await client.intent_engine.deduce_intent(prompt)
    
    print(f"Coherence: {intent.coherence_lambda:.3f}")
    print(f"Consciousness: {intent.consciousness_phi:.3f}")
    
    # Create enhanced circuit based on intent
    from dnalang_sdk import QuantumCircuit
    
    circuit = QuantumCircuit(num_qubits=5)
    circuit.h(0)
    circuit.cx(0, 1)
    
    # Execute on simulator
    result = await circuit.execute(shots=1024)
    print(f"Counts: {result.counts}")

asyncio.run(main())
```

## Troubleshooting

### Import Errors

```bash
# Always activate venv first!
source venv/bin/activate

# Verify installation
python -c "from dnalang_sdk import DNALangCopilotClient; print('✓ OK')"
```

### NCLM Not Found

```bash
# Add NCLM to Python path
export PYTHONPATH="/home/devinpd/Desktop:$PYTHONPATH"

# Or copy osiris_nclm_complete.py to project
cp /home/devinpd/Desktop/osiris_nclm_complete.py ./
```

### Gemini API Errors

```bash
# Install Gemini library
pip install google-generativeai

# Set API key
export GEMINI_API_KEY='your-key'

# Get key at: https://aistudio.google.com/apikey
```

## Next Steps

1. **Try Intent Engine** - Run `intent_engine_demo.py` to see semantic analysis
2. **Test Gemini** - Get API key and try `gemini_integration.py`
3. **Run NCLM** - Use your custom model with `nclm_integration.py`
4. **Quantum Computing** - Execute circuits with `hello_quantum.py`
5. **Custom Integration** - Build your own agents with the unified client

## Summary

✅ **7 Complete Integrations:**
1. Quantum computing (IBM, Rigetti, IonQ)
2. Lambda-phi conservation validation
3. Consciousness scaling (CCCE)
4. NCLM (your custom model!)
5. Gemini (Google AI)
6. Intent-Deduction Engine (7 layers)
7. Unified Copilot Client

✅ **9 Working Examples:**
1. `hello_quantum.py` - Basic quantum circuit
2. `lambda_phi_demo.py` - Conservation validation
3. `consciousness_scaling.py` - CCCE analysis
4. `ibm_deployment.py` - Hardware deployment
5. `backend_comparison.py` - Multi-backend testing
6. `nclm_integration.py` - NCLM usage
7. `nclm_comparison.py` - Model comparison
8. `intent_engine_demo.py` - Semantic analysis (NEW)
9. `gemini_integration.py` - Gemini AI (NEW)

✅ **Complete Documentation:**
- README.md - Main SDK guide
- API.md - API reference
- CONTRIBUTING.md - How to contribute
- NCLM_INTEGRATION.md - NCLM guide
- FULL_INTEGRATION_GUIDE.md - This file!

**The DNALang Copilot SDK is now feature-complete and ready for production use! 🚀**
