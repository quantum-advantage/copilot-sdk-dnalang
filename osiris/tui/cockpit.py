#!/usr/bin/env python3
"""
OSIRIS COCKPIT  Rich TUI Edition
Real-time telemetry + Command execution + CCCE monitoring
"""

from pathlib import Path
import sys
import json
import time
import math
from datetime import datetime

# --- JSON coercion (np.generic -> python scalar) ---
def _json_default(o):
    """Normalize numpy scalars for JSON serialization"""
    try:
        import numpy as np
        if isinstance(o, np.integer):
            return int(o)
        elif isinstance(o, np.floating):
            return float(o)
        elif isinstance(o, np.ndarray):
            return o.tolist()
    except ImportError:
        pass
    return o

# Rich imports
try:
    from rich.console import Console
    from rich.layout import Layout
    from rich.panel import Panel
    from rich.live import Live
    from rich.table import Table
    from rich.text import Text
    from rich.prompt import Prompt
    from rich import box
except ImportError:
    print("[ERROR] Rich not installed")
    print("Install with: pip install rich")
    sys.exit(1)

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))
from sovereign_ollama import SovereignAgentOllama, CCCE_STATE, update_ccce, log_to_pcrb

# ============================================================================
# STATE MANIFOLD
# ============================================================================

def _metric(s, name: str, default=0.0):
    """Safe metric accessor - schema-tolerant telemetry getter"""
    # Accept s.phi OR s.metrics.phi OR dict-like
    if hasattr(s, name):
        return getattr(s, name)
    m = getattr(s, "metrics", None)
    if m is not None and hasattr(m, name):
        return getattr(m, name)
    if isinstance(s, dict) and name in s:
        return s[name]
    return default

class StateManifold:
    """7dCRSM state manifold with live updates"""

    def __init__(self):
        self.t0 = time.time()
        self.theta_star = 51.843
        self.phi_threshold = 0.7734
        self.phi = 0.0
        self.lambda_val = 0.0
        self.gamma = 0.0
        self.xi = 0.0
        self.theta = 0.0
        self.shots = 0
        self.gate_coherence = False
        self.gate_risk = False
        self.gate_torsion = False
        self.ci = None
        self.provenance = False
        self.armed = False
        self.delta_theta = 0.0

    def update(self):
        """Update state with organic drift"""
        dt = time.time() - self.t0
        drift = math.sin(dt / 5.0) * 0.02

        # Real values from CCCE_STATE
        self.phi = CCCE_STATE.get("phi", 0.0)
        self.lambda_val = CCCE_STATE.get("lambda", 0.0)
        self.gamma = CCCE_STATE.get("gamma", 0.0)
        self.xi = CCCE_STATE.get("xi", 0.0)
        self.theta = CCCE_STATE.get("theta", 0.0)
        self.shots = CCCE_STATE.get("shots", 0)

        self.gate_coherence = self.phi >= self.phi_threshold
        self.delta_theta = abs(self.theta - self.theta_star)

        if self.shots > 0:
            self.ci = 1.0 / math.sqrt(self.shots)
            self.provenance = True
        else:
            self.ci = None
            self.provenance = False

        self.gate_risk = self.gamma <= 0.30
        self.gate_torsion = self.delta_theta <= 0.10
        self.armed = self.gate_coherence and self.gate_risk and self.gate_torsion and self.provenance

# ============================================================================
# OSIRIS COCKPIT TUI
# ============================================================================

class OsirisCockpit:
    """Rich TUI for OSIRIS"""

    def __init__(self, agent: SovereignAgentOllama):
        self.console = Console()
        self.agent = agent
        self.manifold = StateManifold()
        self.logs = []
        self.command_history = []

    def log(self, message: str, style: str = "white"):
        """Add log entry"""
        ts = datetime.now().strftime("%H:%M:%S")
        self.logs.append(f"[{style}][{ts}] {message}[/{style}]")
        if len(self.logs) > 50:
            self.logs = self.logs[-50:]

    def get_telemetry_table(self) -> Panel:
        """Build telemetry panel"""
        self.manifold.update()
        s = self.manifold
        table = Table(show_header=True, header_style="bold cyan", box=box.SIMPLE_HEAVY, expand=True)
        table.add_column("METRIC", style="dim")
        table.add_column("VALUE", justify="right")
        table.add_column("STATUS", justify="center")

        # Phi
        phi = _metric(s, "phi", 0.0)
        gate_coherence = _metric(s, "gate_coherence", False)
        c_phi = "green" if gate_coherence else "red"
        table.add_row("(Consciousness)", f"{phi:.4f}", f"[{c_phi}]{'NOMINAL' if gate_coherence else 'LOW'}[/{c_phi}]")

        # Lambda
        lambda_val = _metric(s, "lambda_val", _metric(s, "lambda", 0.0))
        table.add_row("(Memory)", f"{lambda_val:.4f}", f"[dim]tracking[/dim]")

        # Gamma
        gamma = _metric(s, "gamma", 0.0)
        gate_risk = _metric(s, "gate_risk", False)
        c_gam = "green" if gate_risk else "red"
        table.add_row("(Decoherence)", f"{gamma:.4f}", f"[{c_gam}]{'SAFE' if gate_risk else 'HIGH'}[/{c_gam}]")

        # Xi
        xi = _metric(s, "xi", 0.0)
        c_xi = "green" if xi > 1.0 else "yellow"
        table.add_row("(Efficiency)", f"{xi:.2f}", f"[{c_xi}]{'OPTIMAL' if xi > 1.0 else 'SUBOPTIMAL'}[/{c_xi}]")

        # Torsion
        theta = _metric(s, "theta", 0.0)
        gate_torsion = _metric(s, "gate_torsion", False)
        c_tor = "green" if gate_torsion else "red"
        table.add_row("(Torsion)", f"{theta:.3f}", f"[{c_tor}]{'LOCKED' if gate_torsion else 'DRIFT'}[/{c_tor}]")

        # Shots
        if s.shots > 0:
            ci_val = f"{s.ci:.4f}"
            c_prov = "green"
            stat = "VALID"
        else:
            ci_val = "UNDEFINED"
            c_prov = "red"
            stat = "NULL"
        table.add_row("S (Shot Count)", str(s.shots), f"[{c_prov}]{stat}[/{c_prov}]")
        table.add_row("CI (Confidence)", ci_val, "[dim]provenance[/dim]")

        return Panel(table, title=f"[bold white]OSIRIS v{s.theta_star} | Session {self.agent.session_id}[/bold white]",
                     subtitle="[dim]7dCRSM Manifold[/dim]", border_style="blue")

    def get_arm_status(self) -> Panel:
        """Build ARM status panel"""
        s = self.manifold
        if s.armed:
            return Panel(Text(" ARMED: READY FOR EXECUTION ", justify="center", style="bold white on green"),
                         border_style="green")
        else:
            reasons = []
            if not s.gate_coherence:
                reasons.append("LOW_PHI")
            if not s.gate_risk:
                reasons.append("HIGH_GAMMA")
            if not s.gate_torsion:
                reasons.append("THETA_DRIFT")
            if not s.provenance:
                reasons.append("NO_SHOTS")
            return Panel(Text(f" HOLD: {', '.join(reasons)} ", justify="center", style="bold black on yellow"),
                         border_style="yellow")

    def get_terminal_panel(self) -> Panel:
        """Build terminal log panel"""
        log_text = Text()
        for entry in self.logs[-12:]:
            log_text.append(entry + "\n")
        return Panel(log_text, title="OPERATOR LOG", border_style="white", subtitle="[dim]Scroll:  | Input: Enter[/dim]")

    def render_layout(self) -> Layout:
        """Build complete layout"""
        layout = Layout()
        layout.split_column(Layout(name="telemetry", ratio=1),
                            Layout(name="status", size=3),
                            Layout(name="terminal", ratio=2))
        layout["telemetry"].update(self.get_telemetry_table())
        layout["status"].update(self.get_arm_status())
        layout["terminal"].update(self.get_terminal_panel())
        return layout

    def run(self):
        """Main TUI loop"""
        self.log("OSIRIS Cockpit initialized", style="green")
        self.log(f"Workspace: {self.agent.root}", style="dim")
        self.log(f"Model: {self.agent.ollama.model}", style="dim")
        self.log("Type 'exit' to quit, 'help' for commands", style="cyan")

        with Live(self.render_layout(), refresh_per_second=4, screen=False) as live:
            while True:
                self.manifold.update()
                live.update(self.render_layout())

                try:
                    user_input = Prompt.ask("\n[bold cyan]>[/bold cyan]")
                except KeyboardInterrupt:
                    break

                if not user_input.strip():
                    continue

                if user_input.lower() == "exit":
                    self.log("Shutting down...", style="yellow")
                    break

                if user_input.lower() == "help":
                    self.log("Commands: exit, help, ccce, manifest", style="cyan")
                    self.log("Or type any request for the agent", style="cyan")
                    continue

                if user_input.lower() == "ccce":
                    self.log(f"CCCE: {json.dumps(CCCE_STATE, indent=2)}", style="cyan")
                    continue

                if user_input.lower() == "manifest":
                    result = self.agent.manifest_cache.get_manifest(self.agent.root)
                    self.log(f"Manifest: {json.dumps(result['stats'], indent=2)}", style="cyan")
                    continue

                self.log(f"USER: {user_input}", style="cyan")
                # Placeholder for agent response
                self.log(f"THOUGHT: N/A", style="magenta")
                self.log(f"REPLY: N/A", style="green")

def main():
    """Entry point"""
    agent = SovereignAgentOllama()
    cockpit = OsirisCockpit(agent)
    cockpit.run()


if __name__ == "__main__":
    main()
