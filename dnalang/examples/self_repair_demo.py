#!/usr/bin/env python3
"""
DNA::}{::lang Self-Repair Engine Demo
======================================
Demonstrates the autonomous self-repair system:
  1. Token auto-discovery (finds IBM Quantum credentials)
  2. Error classification (categorizes failures)
  3. Fix strategies (applies targeted corrections)
  4. Decorator-based auto-retry with self-healing

Run:
  cd copilot-sdk-dnalang && PYTHONPATH=dnalang/src python3 dnalang/examples/self_repair_demo.py
"""

import asyncio
from dnalang_sdk.self_repair import (
    SelfRepairEngine,
    discover_ibm_token,
    ensure_ibm_token,
    with_self_repair,
)


def demo_token_discovery() -> None:
    """Demonstrate automatic IBM Quantum token discovery."""
    print("═" * 60)
    print("  1. Token Auto-Discovery")
    print("═" * 60)

    token = discover_ibm_token()
    if token:
        masked = token[:8] + "..." + token[-4:] if len(token) > 16 else "****"
        print(f"  ✅ Found token: {masked}")
    else:
        print("  ○ No token found (dry-run mode)")

    # ensure_ibm_token sets the env var if found
    found = ensure_ibm_token()
    print(f"  Token in environment: {'yes' if found else 'no'}")
    print()


def demo_error_classification() -> None:
    """Demonstrate error classification and analysis."""
    print("═" * 60)
    print("  2. Error Classification")
    print("═" * 60)

    from dnalang_sdk.self_repair import parse_error

    test_errors = [
        "ImportError: No module named 'qiskit_aer'",
        "ConnectionError: Failed to connect to IBM Quantum",
        "ValueError: Circuit has 0 qubits",
        "PermissionError: Permission denied: '/root/data'",
        "RuntimeError: Quantum job timed out after 300s",
    ]

    for err_text in test_errors:
        sig = parse_error(err_text)
        print(f"  {sig.error_type:20s} → category: {sig.category}")
        print(f"  {'':20s}   strategy: {sig.fix_strategy}")
    print()


def demo_fix_strategies() -> None:
    """Demonstrate targeted fix strategies."""
    print("═" * 60)
    print("  3. Fix Strategies (attempt_repair)")
    print("═" * 60)

    engine = SelfRepairEngine()
    from dnalang_sdk.self_repair import parse_error

    err_text = "ImportError: No module named 'qiskit_aer'"
    sig = parse_error(err_text)
    success, message = engine.attempt_repair(sig)

    print(f"  Error: {err_text}")
    print(f"  Category: {sig.category}")
    print(f"  Strategy: {sig.fix_strategy}")
    print(f"  Repair attempted: {'✅' if success else '○'}")
    print(f"  Result: {message}")
    print()


async def demo_self_repair_decorator() -> None:
    """Demonstrate with_self_repair wrapper."""
    print("═" * 60)
    print("  4. Auto-Retry with Self-Healing")
    print("═" * 60)

    call_count = 0

    def flaky_quantum_task() -> str:
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise ConnectionError("Transient backend failure")
        return "Quantum task completed successfully"

    try:
        result = with_self_repair(flaky_quantum_task, max_retries=3)
        print(f"  ✅ Result: {result}")
        print(f"  Attempts needed: {call_count}")
    except Exception as e:
        print(f"  ○ Expected: retries exhausted ({e})")
        print(f"  Attempts made: {call_count}")
    print()


async def main() -> None:
    """Run all self-repair demos."""
    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║  DNA::}{::lang — Self-Repair Engine Demo                ║")
    print("║  Autonomous error recovery & token discovery            ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()

    demo_token_discovery()
    demo_error_classification()
    demo_fix_strategies()
    await demo_self_repair_decorator()

    print("═" * 60)
    print("  Self-repair engine ready for production use.")
    print("  Import: from dnalang_sdk.self_repair import SelfRepairEngine")
    print("═" * 60)


if __name__ == "__main__":
    asyncio.run(main())
