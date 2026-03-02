"""pytest configuration — ensure all OSIRIS sub-packages are importable."""
import sys
import os

# Make 'dnalang' importable as a top-level package (for dnalang.experiments.*)
# tests/ → dnalang/ → copilot-sdk-dnalang/  (need the last one in sys.path)
_sdk_parent = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _sdk_parent not in sys.path:
    sys.path.insert(0, _sdk_parent)
