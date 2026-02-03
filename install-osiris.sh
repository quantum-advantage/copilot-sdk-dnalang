#!/bin/bash
# OSIRIS Installation Script

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   OSIRIS Installation - Quantum Development CLI              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Get actual SDK root
SDK_ROOT="/home/devinpd/Desktop/copilot-sdk-main"
BIN_DIR="$SDK_ROOT/bin"

echo "📁 SDK Root: $SDK_ROOT"
echo ""

# Make osiris executable
chmod +x "$BIN_DIR/osiris"
echo "✓ Made osiris executable"

SHELL_RC="$HOME/.bashrc"

# Check if already in PATH
if grep -q "copilot-sdk-main/bin" "$SHELL_RC" 2>/dev/null; then
    echo "✓ Already in PATH ($SHELL_RC)"
else
    echo "" >> "$SHELL_RC"
    echo "# OSIRIS - DNALang Quantum Development CLI" >> "$SHELL_RC"
    echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$SHELL_RC"
    echo "✓ Added to PATH ($SHELL_RC)"
fi

# Step 4: Set up DNALang SDK environment
DNALANG_DIR="$SDK_ROOT/dnalang"

if [ -d "$DNALANG_DIR/venv" ]; then
    echo "✓ Virtual environment found"
else
    echo "⚠ Virtual environment not found"
    echo "  Run: cd $DNALANG_DIR && bash activate.sh"
fi

# Step 5: Create convenience aliases
cat >> "$SHELL_RC" << 'EOF'

# OSIRIS Aliases
alias osiris-dev-dna='osiris dev dnalang.dev'
alias osiris-dev-qa='osiris dev quantum-advantage.dev'
alias osiris-quantum='osiris quantum'
alias osiris-ccce='osiris ccce'
EOF

echo "✓ Added convenience aliases"

# Step 6: Set up project directories
echo ""
echo "📁 Checking project directories..."

PROJECTS_DIR="$HOME/Desktop"

# dnalang.dev
if [ -d "$PROJECTS_DIR/dnalang.dev" ]; then
    echo "✓ dnalang.dev found"
else
    echo "⚠ dnalang.dev not found at $PROJECTS_DIR/dnalang.dev"
    echo "  Create with: mkdir -p $PROJECTS_DIR/dnalang.dev"
fi

# quantum-advantage.dev
if [ -d "$PROJECTS_DIR/quantum-advantage.dev" ]; then
    echo "✓ quantum-advantage.dev found"
else
    echo "⚠ quantum-advantage.dev not found at $PROJECTS_DIR/quantum-advantage.dev"
    echo "  Create with: mkdir -p $PROJECTS_DIR/quantum-advantage.dev"
fi

# Step 7: Create desktop launcher (optional)
DESKTOP_FILE="$HOME/.local/share/applications/osiris.desktop"
if [ ! -f "$DESKTOP_FILE" ]; then
    mkdir -p "$HOME/.local/share/applications"
    cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Name=OSIRIS Quantum Dev CLI
Comment=DNALang Quantum Development Environment
Exec=gnome-terminal -- bash -c "osiris; bash"
Icon=utilities-terminal
Terminal=true
Type=Application
Categories=Development;
EOF
    echo "✓ Created desktop launcher"
fi

# Step 8: Test installation
echo ""
echo "🧪 Testing installation..."

# Source the shell RC to get new PATH
export PATH="$BIN_DIR:$PATH"

if command -v osiris &> /dev/null; then
    echo "✓ osiris command is available"
else
    echo "⚠ osiris not in PATH yet"
    echo "  Restart your terminal or run: source $SHELL_RC"
fi

# Final instructions
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   Installation Complete!                                      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "To activate OSIRIS, restart your terminal or run:"
echo "  source $SHELL_RC"
echo ""
echo "Then use:"
echo "  osiris dev dnalang.dev              # Develop dnalang.dev"
echo "  osiris dev quantum-advantage.dev    # Develop quantum-advantage.dev"
echo "  osiris quantum bell                 # Create quantum circuits"
echo "  osiris agent \"task\"                 # Orchestrate with agents"
echo "  osiris ccce                         # Check consciousness metrics"
echo "  osiris chat                         # Interactive Copilot"
echo ""
echo "Convenience aliases:"
echo "  osiris-dev-dna                      # Quick: osiris dev dnalang.dev"
echo "  osiris-dev-qa                       # Quick: osiris dev quantum-advantage.dev"
echo "  osiris-quantum                      # Quick: osiris quantum"
echo "  osiris-ccce                         # Quick: osiris ccce"
echo ""
echo "Documentation:"
echo "  $SDK_ROOT/OMEGA_MASTER_COMPLETE_INTEGRATION.md"
echo ""
