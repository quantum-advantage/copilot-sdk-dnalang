#!/usr/bin/env python3
"""
DNA::}{::lang Agent Constellation Demo
========================================
Demonstrates the multi-agent NCLM swarm architecture:
  1. NonLocal Agent v8 — bifurcated tetrahedron orchestrator
  2. NCLM Swarm — 7-layer 11D CRSM evolution
  3. Penteract Singularity — 5D decoder pipeline
  4. Agent metrics — phi, gamma, negentropy tracking

Run:
  cd copilot-sdk-dnalang && PYTHONPATH=dnalang/src python3 dnalang/examples/agent_constellation.py
"""

import sys
import time


def demo_nonlocal_agent() -> None:
    """Demonstrate NonLocalAgent v8 with bifurcated tetrahedron."""
    print("═" * 60)
    print("  1. NonLocal Agent v8 — Bifurcated Sentinel")
    print("═" * 60)

    try:
        from dnalang_sdk.crsm.nonlocal_agent import (
            BifurcatedSentinelOrchestrator,
        )

        orch = BifurcatedSentinelOrchestrator(atoms=64, rounds=2, seed=51843)
        print(f"  Agents: {len(orch.agents)}")
        for name, agent in orch.agents.items():
            role = getattr(agent, 'role', 'N/A')
            pole = getattr(agent, 'pole', 'N/A')
            print(f"    {name:10s}  Φ={agent.phi:.4f}  Γ={agent.gamma:.4f}")

        # Run a few evolution cycles
        import asyncio
        asyncio.run(orch.run(cycles=3))
        print(f"\n  After 3 evolution cycles:")
        for name, agent in orch.agents.items():
            phi = getattr(agent, 'phi', 0.0)
            gamma = getattr(agent, 'gamma', 1.0)
            xi = (2.176435e-8 * phi) / max(gamma, 0.001)
            print(f"    {name:10s}  Φ={phi:.4f}  Γ={gamma:.4f}  Ξ={xi:.2e}")
    except Exception as e:
        print(f"  ⚠ NonLocalAgent not available: {e}")
    print()


def demo_swarm_orchestrator() -> None:
    """Demonstrate NCLM Swarm Orchestrator with 7-layer CRSM."""
    print("═" * 60)
    print("  2. NCLM Swarm — 7-Layer 11D CRSM")
    print("═" * 60)

    try:
        from dnalang_sdk.crsm.swarm_orchestrator import (
            NCLMSwarmOrchestrator,
        )

        swarm = NCLMSwarmOrchestrator(
            n_nodes=5, atoms=64, rounds=2, seed=51843
        )
        print(f"  Nodes: {swarm.n_nodes}")
        print(f"  Atoms per node: {swarm.atoms}")
        print(f"  Syndrome rounds: {swarm.rounds}")

        # Run evolution
        import asyncio
        t0 = time.time()
        result = asyncio.run(swarm.run(cycles=5))
        elapsed = time.time() - t0
        print(f"\n  Evolution (5 cycles) completed in {elapsed:.2f}s")
        if isinstance(result, dict):
            print(f"  Final CRSM layer: {result.get('max_layer', 'N/A')}")
            print(f"  Sovereign nodes: {result.get('sovereign_count', 0)}")
    except Exception as e:
        print(f"  ⚠ Swarm not available: {e}")
    print()


def demo_penteract() -> None:
    """Demonstrate Penteract Singularity Protocol."""
    print("═" * 60)
    print("  3. Penteract Singularity — 5D Decoder")
    print("═" * 60)

    try:
        from dnalang_sdk.crsm.penteract import OsirisPenteract

        pent = OsirisPenteract()
        print(f"  Protocol: Penteract (5D extension of Tesseract A*)")
        print(f"  Shell: OsirisPenteract with PenteractShell")
        if hasattr(pent, 'state'):
            print(f"  Current state: {pent.state}")
    except Exception as e:
        print(f"  ⚠ Penteract not available: {e}")
    print()


def demo_decoder() -> None:
    """Demonstrate Tesseract A* decoder."""
    print("═" * 60)
    print("  4. Tesseract A* Decoder")
    print("═" * 60)

    try:
        from dnalang_sdk.decoders import TesseractDecoderOrganism

        # Create a small error map (ring topology)
        n_detectors = 10
        error_map = {}
        for i in range(n_detectors):
            error_map[i] = {i, (i + 1) % n_detectors}

        decoder = TesseractDecoderOrganism(error_map=error_map)
        # Generate a syndrome
        syndrome = {0, 1}  # Two adjacent detectors triggered
        t0 = time.time()
        result = decoder.decode(syndrome)
        elapsed = time.time() - t0

        print(f"  Detectors: {n_detectors}")
        print(f"  Syndrome: {syndrome}")
        print(f"  Correction: {result}")
        print(f"  Decode time: {elapsed*1000:.2f}ms")
    except Exception as e:
        print(f"  ⚠ Decoder not available: {e}")
    print()


def demo_quera_adapter() -> None:
    """Demonstrate QuEra 256-atom correlated adapter."""
    print("═" * 60)
    print("  5. QuEra Correlated Adapter (dry-run)")
    print("═" * 60)

    try:
        from dnalang_sdk.hardware import QuEraCorrelatedAdapter

        adapter = QuEraCorrelatedAdapter(atoms=64, rounds=2, seed=42)
        result = adapter.run_dry()
        print(f"  Atoms: {adapter.atoms}")
        print(f"  Rounds: {adapter.rounds}")
        print(f"  Syndrome merge: majority vote")
        print(f"  Correction weight: {result.get('correction_weight', 'N/A')}")
        print(f"  Logical error: {'yes' if result.get('logical_error') else 'no'}")
    except Exception as e:
        print(f"  ⚠ QuEra adapter not available: {e}")
    print()


def main() -> None:
    """Run all agent demos."""
    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║  DNA::}{::lang — Agent Constellation Demo               ║")
    print("║  Multi-agent NCLM swarm with 11D-CRSM manifold         ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()

    demo_decoder()
    demo_quera_adapter()
    demo_nonlocal_agent()
    demo_swarm_orchestrator()
    demo_penteract()

    print("═" * 60)
    print("  Agent constellation operational.")
    print("  Full orchestrator: osiris --orchestrator --evolve 21")
    print("═" * 60)


if __name__ == "__main__":
    main()
