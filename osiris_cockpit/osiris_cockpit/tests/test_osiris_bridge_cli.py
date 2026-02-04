import sys
import os
import pytest

# Ensure project root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from osiris_bridge_cli import OsirisBridgeCLI


def test_cmd_bootstrap():
    cli = OsirisBridgeCLI()
    res = cli.cmd_bootstrap()
    assert isinstance(res, dict)
    assert res['status'] == 'CONVERGED'
    assert 'theta' in res
    assert abs(res['theta'] - 51.843) < 1e-6
