#!/bin/bash
# Run tests for Dnalang Sovereign Copilot SDK

set -e

echo "🧪 Dnalang Sovereign Copilot SDK - Test Runner"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Parse arguments
TEST_TYPE="${1:-all}"
VERBOSE=""
if [[ "$2" == "-v" || "$2" == "--verbose" ]]; then
    VERBOSE="-v"
fi

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo -e "${RED}❌ pytest not found${NC}"
    echo ""
    echo "Install with:"
    echo "  cd $REPO_ROOT/python"
    echo "  pip install -e \".[dev]\""
    echo ""
    exit 1
fi

# Check if pytest-asyncio is installed
if ! python3 -c "import pytest_asyncio" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  pytest-asyncio not found${NC}"
    echo "Installing pytest-asyncio..."
    pip install pytest-asyncio
    echo ""
fi

cd "$REPO_ROOT/python"

echo "📍 Working directory: $(pwd)"
echo "🎯 Test type: $TEST_TYPE"
echo ""

# Run tests based on type
case "$TEST_TYPE" in
    "all")
        echo "Running ALL tests..."
        PYTHONPATH=src pytest ../tests $VERBOSE
        ;;
    "unit")
        echo "Running UNIT tests..."
        PYTHONPATH=src pytest ../tests/unit $VERBOSE
        ;;
    "integration")
        echo "Running INTEGRATION tests..."
        PYTHONPATH=src pytest ../tests/integration $VERBOSE -m integration
        ;;
    "quick")
        echo "Running QUICK tests (unit only, fail fast)..."
        PYTHONPATH=src pytest ../tests/unit $VERBOSE -x
        ;;
    "coverage")
        echo "Running tests with COVERAGE..."
        if ! command -v coverage &> /dev/null; then
            echo "Installing coverage..."
            pip install coverage pytest-cov
        fi
        PYTHONPATH=src pytest ../tests $VERBOSE --cov=copilot_quantum --cov-report=term --cov-report=html
        echo ""
        echo -e "${GREEN}✅ Coverage report generated: htmlcov/index.html${NC}"
        ;;
    *)
        echo -e "${RED}❌ Unknown test type: $TEST_TYPE${NC}"
        echo ""
        echo "Usage: $0 [all|unit|integration|quick|coverage] [-v]"
        echo ""
        echo "Examples:"
        echo "  $0              # Run all tests"
        echo "  $0 unit         # Run unit tests only"
        echo "  $0 integration  # Run integration tests only"
        echo "  $0 quick        # Run unit tests, stop on first failure"
        echo "  $0 coverage     # Run with coverage report"
        echo "  $0 all -v       # Run all tests with verbose output"
        echo ""
        exit 1
        ;;
esac

TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Tests passed!${NC}"
else
    echo -e "${RED}❌ Tests failed!${NC}"
fi

exit $TEST_EXIT_CODE
