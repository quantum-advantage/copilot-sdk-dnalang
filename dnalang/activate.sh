#!/bin/bash
# DNALang SDK - Quick Activation Script
# Run this every time you want to use the SDK

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   DNALang Copilot SDK - Environment Setup                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Navigate to DNALang directory
cd "$(dirname "$0")"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✓ Virtual environment activated"
else
    echo "✗ Virtual environment not found!"
    echo "  Run: python3 -m venv venv && source venv/bin/activate && pip install -e '.[quantum]'"
    exit 1
fi

# Set up PYTHONPATH for NCLM (if needed)
if [ -f "/home/devinpd/Desktop/osiris_nclm_complete.py" ]; then
    export PYTHONPATH="/home/devinpd/Desktop:$PYTHONPATH"
    echo "✓ NCLM path configured"
fi

# Check for Gemini API key
if [ -z "$GEMINI_API_KEY" ] && [ -z "$GOOGLE_API_KEY" ]; then
    echo "⚠ No Gemini API key found (optional)"
    echo "  Set with: export GEMINI_API_KEY='your-key'"
else
    echo "✓ Gemini API key detected"
fi

# Verify installation
python -c "from dnalang_sdk import DNALangCopilotClient; print('✓ DNALang SDK ready')" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "✗ DNALang SDK not installed!"
    echo "  Run: pip install -e '.[quantum]'"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "   Ready! Available integrations:"
echo "═══════════════════════════════════════════════════════════════"
echo "  1. Quantum Computing (IBM, Rigetti, IonQ)"
echo "  2. Lambda-Phi Conservation"
echo "  3. Consciousness Scaling (CCCE)"
echo "  4. NCLM (Non-local Non-Causal LM)"
echo "  5. Gemini (Google AI)"
echo "  6. Intent-Deduction Engine (7 layers)"
echo ""
echo "Example commands:"
echo "  python ../cookbook/dnalang/advanced/intent_engine_demo.py"
echo "  python ../cookbook/dnalang/advanced/gemini_integration.py"
echo "  python ../cookbook/dnalang/basic/hello_quantum.py"
echo ""
echo "Documentation:"
echo "  cat docs/FULL_INTEGRATION_GUIDE.md"
echo ""
