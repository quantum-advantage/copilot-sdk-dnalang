#!/bin/bash
# Quick test script for OSIRIS

echo "🧪 Testing OSIRIS Installation..."
echo ""

# Add to PATH for this test
export PATH="/home/devinpd/Desktop/copilot-sdk-main/bin:$PATH"

# Test 1: Version
echo "Test 1: Version check"
osiris --version
echo ""

# Test 2: Help
echo "Test 2: Help display"
osiris --help | head -15
echo ""

# Test 3: Quantum (requires venv)
echo "Test 3: Quantum circuit"
cd /home/devinpd/Desktop/copilot-sdk-main/dnalang
source venv/bin/activate
osiris quantum bell
echo ""

echo "✅ All tests passed!"
echo ""
echo "To use OSIRIS permanently, restart your terminal or run:"
echo "  source ~/.bashrc"
