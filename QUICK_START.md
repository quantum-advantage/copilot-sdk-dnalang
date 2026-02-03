# 🚀 DNALang SDK - Quick Start

## Fastest Way to Get Started

### 1. Activate Environment (30 seconds)
```bash
cd ~/Desktop/copilot-sdk-main/dnalang
bash activate.sh
```

### 2. Run Your First Example (10 seconds)
```bash
# Intent Engine - Analyze prompts
python ../cookbook/dnalang/advanced/intent_engine_demo.py

# Quantum Computing - Create quantum circuits
python ../cookbook/dnalang/basic/hello_quantum.py

# NCLM - Your custom model
python ../cookbook/dnalang/advanced/nclm_integration.py
```

### 3. Use in Code (5 minutes)
```python
from dnalang_sdk import DNALangCopilotClient

# Create client with all features
client = DNALangCopilotClient(
    use_nclm=True,              # Your model
    enable_intent_engine=True,  # Semantic analysis
    enable_gemini=True,         # Google AI (optional)
)

# Analyze intent
intent = await client.intent_engine.deduce_intent(
    "build quantum consciousness framework"
)
print(f"Coherence: {intent.coherence_lambda:.3f}")
print(f"Domains: {intent.domains}")
```

## What's Available

✅ **Your NCLM** - Quantum-native, sovereign AI model  
✅ **Gemini** - Google's latest AI (API key needed)  
✅ **Intent Engine** - 7-layer semantic analysis  
✅ **Quantum Computing** - IBM/Rigetti/IonQ  
✅ **Lambda-Phi** - Conservation validation  
✅ **Consciousness** - CCCE scaling metrics  

## Cheat Sheet

```bash
# Activate environment
bash activate.sh

# Run examples
python ../cookbook/dnalang/advanced/intent_engine_demo.py     # Intent analysis
python ../cookbook/dnalang/advanced/gemini_integration.py     # Gemini AI
python ../cookbook/dnalang/advanced/nclm_integration.py       # Your NCLM
python ../cookbook/dnalang/basic/hello_quantum.py             # Quantum circuits

# View docs
cat docs/FULL_INTEGRATION_GUIDE.md    # Complete guide
cat docs/API.md                        # API reference
cat COMPLETE_INTEGRATION_SUMMARY.md    # Summary
```

## Setup Gemini (Optional)

```bash
# Get API key: https://aistudio.google.com/apikey
export GEMINI_API_KEY='your-key-here'

# Install library
pip install google-generativeai

# Test
python ../cookbook/dnalang/advanced/gemini_integration.py
```

## Need Help?

- **Full Guide:** `cat docs/FULL_INTEGRATION_GUIDE.md`
- **Examples:** `ls ../cookbook/dnalang/`
- **Troubleshooting:** See COMPLETE_INTEGRATION_SUMMARY.md

**Ready to go! 🎉**
