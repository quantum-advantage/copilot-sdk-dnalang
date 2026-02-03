#!/bin/bash
# DNALang SDK Virtual Environment Setup

echo "=== DNALang SDK Setup ==="
echo ""

# Create virtual environment
echo "[1/5] Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "[2/5] Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "[3/5] Upgrading pip..."
pip install --upgrade pip

# Install DNALang SDK with quantum dependencies
echo "[4/5] Installing DNALang SDK..."
pip install -e ".[quantum]"

# Verify installation
echo "[5/5] Verifying installation..."
python -c "from dnalang_sdk import DNALangCopilotClient; print('✓ DNALang SDK installed successfully')"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "To activate the environment in the future:"
echo "  source venv/bin/activate"
echo ""
echo "To run examples:"
echo "  python ../cookbook/dnalang/basic/hello_quantum.py"
echo ""
