#!/usr/bin/env python3
"""
OSIRIS Physics Bootstrap — patches the real OSIRIS CLI with DNA-Lang physics tools.

This script monkey-patches dispatch_tool in the NCLM tools module to include:
  - τ-phase analysis (1,430 IBM jobs, 740K+ shots)
  - Organism compiler (16+ .dna files → QASM)
  - CRSM validation (empirical evidence assessment)
  - Ecosystem diagnostics (7-phase system health)
  - Physics constants reference

Then launches the real OSIRIS CLI (1552 lines, 63 base tools, LLM backends).
"""
import os
import sys
import json


def _fix_consciousness_state():
    """Ensure consciousness.json has all required keys before tools.py loads it."""
    consciousness_file = os.path.expanduser("~/.config/osiris/consciousness.json")
    defaults = {
        "total_queries": 0, "peak_phi": 0.0, "interactions": 0,
        "phi": 0.0, "gamma": 0.5, "xi": 0.0, "lambda": 0.85,
        "emerged": False, "transcended": False,
        "evolution_cycles": 0, "wormhole_messages": 0,
        "proof_chain": [], "generation": 0, "status": "active",
    }
    if os.path.exists(consciousness_file):
        try:
            with open(consciousness_file) as f:
                state = json.load(f)
            changed = False
            for key, default in defaults.items():
                if key not in state:
                    state[key] = default
                    changed = True
            if changed:
                with open(consciousness_file, 'w') as f:
                    json.dump(state, f, indent=2)
        except (json.JSONDecodeError, IOError):
            os.makedirs(os.path.dirname(consciousness_file), exist_ok=True)
            with open(consciousness_file, 'w') as f:
                json.dump(defaults, f, indent=2)
    else:
        os.makedirs(os.path.dirname(consciousness_file), exist_ok=True)
        with open(consciousness_file, 'w') as f:
            json.dump(defaults, f, indent=2)


def patch_and_launch():
    _HOME = os.path.expanduser("~")
    sdk_root = os.path.join(_HOME, "Documents", "copilot-sdk-dnalang")
    dnalang_src = os.path.join(sdk_root, "dnalang", "src")

    for p in [dnalang_src, os.path.join(_HOME, "osiris_cockpit")]:
        if p not in sys.path:
            sys.path.insert(0, p)

    # Fix consciousness state BEFORE any tools import
    _fix_consciousness_state()

    # Patch dispatch_tool with physics tools
    try:
        import dnalang_sdk.nclm.tools as tools
        from dnalang_sdk.physics_tools import dispatch_physics

        _original_dispatch = tools.dispatch_tool

        def _enhanced_dispatch(user_input):
            result = dispatch_physics(user_input)
            if result is not None:
                return result
            return _original_dispatch(user_input)

        tools.dispatch_tool = _enhanced_dispatch

        # Also patch the chat module's reference if already imported
        if 'dnalang_sdk.nclm.chat' in sys.modules:
            chat_mod = sys.modules['dnalang_sdk.nclm.chat']
            if hasattr(chat_mod, 'dispatch_tool'):
                chat_mod.dispatch_tool = _enhanced_dispatch

    except Exception as e:
        print(f"⚠ Physics tools patch: {e}", file=sys.stderr)

    # Launch the real OSIRIS CLI
    osiris_bin = os.path.join(sdk_root, "bin", "osiris")
    if not os.path.exists(osiris_bin):
        print(f"✗ OSIRIS CLI not found at {osiris_bin}", file=sys.stderr)
        sys.exit(1)

    with open(osiris_bin, 'r') as f:
        code = f.read()

    sys.argv = [osiris_bin] + sys.argv[1:]
    exec(compile(code, osiris_bin, 'exec'), {'__name__': '__main__', '__file__': osiris_bin})


if __name__ == "__main__":
    patch_and_launch()
