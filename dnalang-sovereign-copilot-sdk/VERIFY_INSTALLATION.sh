#!/bin/bash

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  🚀 DNALANG SOVEREIGN COPILOT SDK v1.1 - INSTALLATION VERIFICATION"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS="${GREEN}✅ PASS${NC}"
FAIL="${RED}❌ FAIL${NC}"
WARN="${YELLOW}⚠️  WARN${NC}"

ERRORS=0

# Test 1: Check directory structure
echo "📁 Test 1: Directory Structure"
if [ -d "python/src/copilot_quantum" ]; then
    echo -e "   $PASS - Core package exists"
else
    echo -e "   $FAIL - Core package missing"
    ERRORS=$((ERRORS+1))
fi

if [ -f "python/src/copilot_quantum/enhanced_agent.py" ]; then
    echo -e "   $PASS - Enhanced agent exists"
else
    echo -e "   $FAIL - Enhanced agent missing"
    ERRORS=$((ERRORS+1))
fi

if [ -f "python/src/copilot_quantum/code_generator.py" ]; then
    echo -e "   $PASS - Code generator exists"
else
    echo -e "   $FAIL - Code generator missing"
    ERRORS=$((ERRORS+1))
fi

echo ""

# Test 2: Check Python dependencies
echo "🐍 Test 2: Python Environment"
python3 --version > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "   $PASS - Python 3 installed"
else
    echo -e "   $FAIL - Python 3 not found"
    ERRORS=$((ERRORS+1))
fi

python3 -c "import asyncio" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "   $PASS - asyncio available"
else
    echo -e "   $FAIL - asyncio not available"
    ERRORS=$((ERRORS+1))
fi

python3 -c "import numpy" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "   $PASS - numpy installed"
else
    echo -e "   $WARN - numpy not installed (optional)"
fi

echo ""

# Test 3: Check module imports
echo "📦 Test 3: Module Imports"
cd python
PYTHONPATH=src python3 -c "from copilot_quantum import EnhancedSovereignAgent" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "   $PASS - EnhancedSovereignAgent imports"
else
    echo -e "   $FAIL - EnhancedSovereignAgent import failed"
    ERRORS=$((ERRORS+1))
fi

PYTHONPATH=src python3 -c "from copilot_quantum import QuantumNLPCodeGenerator" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "   $PASS - QuantumNLPCodeGenerator imports"
else
    echo -e "   $FAIL - QuantumNLPCodeGenerator import failed"
    ERRORS=$((ERRORS+1))
fi

PYTHONPATH=src python3 -c "from copilot_quantum import AeternaPorta" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "   $PASS - AeternaPorta imports"
else
    echo -e "   $FAIL - AeternaPorta import failed"
    ERRORS=$((ERRORS+1))
fi

cd ..
echo ""

# Test 4: Check documentation
echo "📚 Test 4: Documentation"
if [ -f "BETTER_THAN_COPILOT.md" ]; then
    echo -e "   $PASS - Main README exists"
else
    echo -e "   $FAIL - Main README missing"
    ERRORS=$((ERRORS+1))
fi

if [ -f "INSTALLATION_AND_USAGE.md" ]; then
    echo -e "   $PASS - Installation guide exists"
else
    echo -e "   $FAIL - Installation guide missing"
    ERRORS=$((ERRORS+1))
fi

if [ -f "COMPLETE_V1.1.md" ]; then
    echo -e "   $PASS - Complete docs exist"
else
    echo -e "   $FAIL - Complete docs missing"
    ERRORS=$((ERRORS+1))
fi

echo ""

# Test 5: Check examples
echo "�� Test 5: Examples"
if [ -f "python/examples/better_than_copilot_demo.py" ]; then
    echo -e "   $PASS - Demo example exists"
else
    echo -e "   $FAIL - Demo example missing"
    ERRORS=$((ERRORS+1))
fi

if [ -f "python/examples/basic_quantum_agent.py" ]; then
    echo -e "   $PASS - Basic example exists"
else
    echo -e "   $FAIL - Basic example missing"
    ERRORS=$((ERRORS+1))
fi

echo ""

# Test 6: Quick functionality test
echo "⚡ Test 6: Quick Functionality Test"
cd python
RESULT=$(PYTHONPATH=src python3 -c "
from copilot_quantum import EnhancedSovereignAgent
agent = EnhancedSovereignAgent()
print('OK')
" 2>&1)

if [[ $RESULT == *"OK"* ]]; then
    echo -e "   $PASS - Agent initialization successful"
else
    echo -e "   $FAIL - Agent initialization failed"
    ERRORS=$((ERRORS+1))
fi
cd ..

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"

# Final result
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED - INSTALLATION VERIFIED!${NC}"
    echo ""
    echo "✅ Your Dnalang Sovereign Copilot SDK v1.1 is ready to use!"
    echo ""
    echo "Next steps:"
    echo "  1. cd python"
    echo "  2. PYTHONPATH=src python3 examples/better_than_copilot_demo.py"
    echo ""
    echo "🚀 Better than GitHub Copilot, 100% Sovereign, Token-Free"
else
    echo -e "${RED}❌ VERIFICATION FAILED - $ERRORS ERROR(S) FOUND${NC}"
    echo ""
    echo "Please fix the errors above and run this script again."
    exit 1
fi

echo "═══════════════════════════════════════════════════════════════════════════════"
