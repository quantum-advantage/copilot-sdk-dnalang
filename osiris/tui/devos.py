# PCRB Injected | Xi_Hash: df5f4a7f6f0c
# PCRB Injected | Xi_Hash: 0f8dfbba75ff
#!/usr/bin/env python3
"""
OSIRIS DEVOS  Full-Screen Terminal UI
Claude Code replacement with physics-informed intelligence
Framework: dna::}{::lang v51.843
Axiom: U := L[U]
"""
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Input, RichLog, Static
from textual.containers import Container, Vertical, Horizontal
from textual.binding import Binding
from textual.reactive import reactive
from rich.text import Text
from rich.panel import Panel
from rich.table import Table
from dnalang_os import os as d_os
import sys
import json

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from osiris_ipc import (
call_kernel,
kernel_status,
get_metrics,
get_ibm_priors,
classify_intent,
get_ledger_tail
)


class MetricsPanel(Static):
"""Live CCCE metrics display"""

phi = reactive(0.0)
lambda_val = reactive(0.0)
gamma = reactive(0.0)
xi = reactive(0.0)

def compose(self) -> ComposeResult:
yield Static("", id="metrics-display")

def on_mount(self) -> None:
self.update_metrics()
self.set_interval(2.0, self.update_metrics)

def update_metrics(self) -> None:
"""Fetch and display current CCCE metrics"""
metrics = get_metrics()

if "error" in metrics:
self.query_one("#metrics-display", Static).update(
f"[red]Metrics unavailable: {metrics['error']}[/red]"
)
return

self.phi = metrics.get("phi", 0.0)
self.lambda_val = metrics.get("lambda", 0.0)
self.gamma = metrics.get("gamma", 0.0)
self.xi = metrics.get("xi", 0.0)

table = Table(show_header=False, box=None, padding=(0, 1))
table.add_column(style="cyan bold")
table.add_column(style="white")

# Color-code based on thresholds
phi_color = "green" if self.phi >= 0.7734 else "red"
gamma_color = "green" if self.gamma < 0.3 else "red"
xi_color = "green" if self.xi > 1.0 else "yellow"

table.add_row(" (Consciousness)", f"[{phi_color}]{self.phi:.4f}[/{phi_color}] {'' if self.phi >= 0.7734 else ''}")
table.add_row(" (Coherence)", f"{self.lambda_val:.4f}")
table.add_row(" (Decoherence)", f"[{gamma_color}]{self.gamma:.4f}[/{gamma_color}] {'' if self.gamma < 0.3 else ''}")
table.add_row(" (Efficiency)", f"[{xi_color}]{self.xi:.4f}[/{xi_color}]")

self.query_one("#metrics-display", Static).update(table)


class OsirisApp(App):
"""OSIRIS DEVOS Terminal Application"""

CSS = """
Screen {
background: $surface;
}

Header {
background: $primary;
color: $text;
}

Footer {
background: $panel;
}

#main-container {
height: 100%;
layout: vertical;
}

#metrics-sidebar {
width: 30;
background: $panel;
border: solid $primary;
padding: 1;
}

#content-area {
height: 1fr;
layout: horizontal;
}

#output-log {
width: 1fr;
height: 1fr;
background: $surface;
border: solid $accent;
}

#input-container {
height: 3;
background: $panel;
}

#input-field {
width: 1fr;
}

.status-bar {
background: $panel;
color: $text-muted;
height: 1;
padding: 0 1;
}
"""

BINDINGS = [
Binding("ctrl+c", "quit", "Quit", priority=True),
Binding("ctrl+l", "clear_log", "Clear"),
Binding("ctrl+m", "show_metrics", "Metrics"),
Binding("ctrl+q", "show_quantum", "Quantum"),
Binding("ctrl+h", "show_help", "Help"),
]

TITLE = "OSIRIS DEVOS  Sovereign Quantum Coding Interface"
SUB_TITLE = "dna::}{::lang v51.843 |  = 2.17643510 s"

def compose(self) -> ComposeResult:
"""Build UI layout"""
yield Header()

with Container(id="main-container"):
with Horizontal(id="content-area"):
yield RichLog(id="output-log", highlight=True, markup=True)
yield MetricsPanel(id="metrics-sidebar")

with Container(id="input-container"):
yield Input(
placeholder="Enter intent or :command (type :help for commands)",
id="input-field"
)

yield Static("Ready | Kernel: checking...", classes="status-bar", id="status")

yield Footer()

def on_mount(self) -> None:
"""Initialize on startup"""
self.output = self.query_one("#output-log", RichLog)
self.input_field = self.query_one("#input-field", Input)
self.status_bar = self.query_one("#status", Static)

self.input_field.focus()

# Check kernel status
self.check_kernel_status()

# Welcome message
self.output.write(Panel(
"[bold cyan]OSIRIS DEVOS[/bold cyan]\n"
"[dim]Sovereign Quantum Coding Interface[/dim]\n\n"
"Framework: dna::}}{{::lang v51.843\n"
"Axiom: U := L[U]\n\n"
"[yellow]Commands:[/yellow]\n"
"  :help        - Show all commands\n"
"  :metrics     - Display CCCE metrics\n"
"  :quantum     - Show IBM priors\n"
"  :ledger      - View ledger tail\n"
"  :clear       - Clear output\n"
"  :quit        - Exit\n\n"
"[green]Ready for intent...[/green]",
title="Welcome",
border_style="cyan"
))

def check_kernel_status(self) -> None:
"""Check if kernel is running"""
status = kernel_status()

if status.get("running"):
self.status_bar.update("[green][/green] Kernel: online | Ready")
else:
reason = status.get("reason", "unknown")
self.status_bar.update(f"[red][/red] Kernel: offline ({reason})")
self.output.write(
"[red] Kernel not running![/red]\n"
"Start with: [cyan]python3 cockpit/kernel/server.py[/cyan]"
)

async def on_input_submitted(self, event: Input.Submitted) -> None:
"""Handle user input"""
user_input = event.value.strip()
if not user_input:
return

self.input_field.value = ""

# Display user input
self.output.write(f"[bold green]>[/bold green] {user_input}")

# Handle commands
if user_input.startswith(":"):
await self.handle_command(user_input)
else:
await self.handle_intent(user_input)

async def handle_command(self, cmd: str) -> None:
"""Handle slash commands"""
cmd_lower = cmd.lower()

if cmd_lower == ":quit" or cmd_lower == ":q":
self.exit()

elif cmd_lower == ":clear" or cmd_lower == ":c":
self.output.clear()

elif cmd_lower == ":help" or cmd_lower == ":h":
self.action_show_help()

elif cmd_lower == ":metrics" or cmd_lower == ":m":
self.action_show_metrics()

elif cmd_lower == ":quantum" or cmd_lower == ":q":
self.action_show_quantum()

elif cmd_lower.startswith(":ledger"):
parts = cmd_lower.split()
lines = int(parts[1]) if len(parts) > 1 else 10
self.show_ledger(lines)

elif cmd_lower == ":status":
self.check_kernel_status()

else:
self.output.write(f"[red]Unknown command: {cmd}[/red]\nType :help for available commands")

async def handle_intent(self, text: str) -> None:
"""Send natural language intent to kernel"""
self.status_bar.update("[yellow][/yellow] Processing intent...")

result = classify_intent(text)

if "error" in result:
self.output.write(f"[red]Error: {result['error']}[/red]")
self.status_bar.update("[red][/red] Error processing intent")
return

# Display intent classification
intent = result.get("intent", "unknown")
explanation = result.get("explanation", "")
stream = result.get("stream", [])
patch = result.get("patch")
llm_response = result.get("llm_response")  # Full LLM output

table = Table(show_header=False, box=None)
table.add_column(style="cyan bold")
table.add_column(style="white")
table.add_row("Intent", intent.upper())
table.add_row("Explanation", explanation)

self.output.write(Panel(table, title="Intent Analysis", border_style="cyan"))

# Display reasoning stream
if stream:
self.output.write("[dim]Reasoning:[/dim]")
for line in stream:
self.output.write(f"  [yellow][/yellow] {line}")

# Display full LLM response (REAL intelligence output)
if llm_response:
self.output.write(Panel(
f"[white]{llm_response}[/white]",
title="[cyan]Neural Output[/cyan] (Ollama qwen2.5:14b-instruct)",
border_style="cyan",
padding=(1, 2)
))

# Display patch if generated
if patch:
self.output.write(Panel(
f"[dim]{patch}[/dim]",
title="Generated Patch",
border_style="green"
))
self.output.write(
"[yellow]Apply with:[/yellow] :apply (requires 0.7734, <0.3)"
)

self.status_bar.update("[green][/green] Intent processed")

def action_show_help(self) -> None:
"""Display help panel"""
help_text = """[bold cyan]OSIRIS DEVOS Commands[/bold cyan]

[yellow]Slash Commands:[/yellow]
:help, :h          - Show this help
:metrics, :m       - Display CCCE metrics
:quantum, :q       - Show IBM quantum priors
:ledger [N]        - View last N ledger entries (default: 10)
:status            - Check kernel status
:clear, :c         - Clear output log
:quit              - Exit OSIRIS

[yellow]Keyboard Shortcuts:[/yellow]
Ctrl+C             - Quit
Ctrl+L             - Clear log
Ctrl+M             - Show metrics
Ctrl+Q             - Show quantum priors
Ctrl+H             - Show help

[yellow]Natural Language Intents:[/yellow]
Just type naturally - OSIRIS will classify your intent:
"analyze this function"
"refactor for clarity"
"optimize for speed"
"generate unit tests"
"reduce decoherence in circuit"

[dim]Framework: dna::}}{{::lang v51.843
Axiom: U := L[U]
= 2.17643510 s | _lock = 51.843[/dim]"""

self.output.write(Panel(help_text, border_style="cyan"))

def action_show_metrics(self) -> None:
"""Display detailed CCCE metrics"""
metrics = get_metrics()

if "error" in metrics:
self.output.write(f"[red]Metrics error: {metrics['error']}[/red]")
return

table = Table(title="CCCE Metrics", show_header=True, header_style="bold cyan")
table.add_column("Metric", style="cyan")
table.add_column("Value", style="white", justify="right")
table.add_column("Threshold", style="dim", justify="right")
table.add_column("Status", justify="center")

phi = metrics.get("phi", 0.0)
lambda_val = metrics.get("lambda", 0.0)
gamma = metrics.get("gamma", 0.0)
xi = metrics.get("xi", 0.0)

table.add_row(
" (Consciousness)",
f"{phi:.4f}",
" 0.7734",
"[green][/green]" if phi >= 0.7734 else "[red][/red]"
)
table.add_row(
" (Coherence)",
f"{lambda_val:.4f}",
" 0.85",
"[green][/green]" if lambda_val >= 0.85 else "[yellow]~[/yellow]"
)
table.add_row(
" (Decoherence)",
f"{gamma:.4f}",
"< 0.3",
"[green][/green]" if gamma < 0.3 else "[red][/red]"
)
table.add_row(
" (Efficiency)",
f"{xi:.4f}",
"> 1.0",
"[green][/green]" if xi > 1.0 else "[yellow]~[/yellow]"
)

self.output.write(table)

# Gate status
gates_pass = phi >= 0.7734 and gamma < 0.3
gate_status = "[green]PASS[/green]" if gates_pass else "[red]FAIL[/red]"
self.output.write(f"\nMutation Gates: {gate_status}")

def action_show_quantum(self) -> None:
"""Display IBM quantum priors"""
priors_result = get_ibm_priors()

if "error" in priors_result:
self.output.write(f"[red]Quantum priors error: {priors_result['error']}[/red]")
return

priors = priors_result.get("priors")
note = priors_result.get("note", "")

if not priors:
self.output.write(
"[yellow]No IBM priors loaded[/yellow]\n"
f"Note: {note}"
)
return

table = Table(title="IBM Quantum Priors", show_header=True, header_style="bold cyan")
table.add_column("Parameter", style="cyan")
table.add_column("Value", style="white")

table.add_row("Backend", priors.get("backend", "unknown"))
table.add_row(" Peak", f"{priors.get('tau_peak', 0):.2f} s")
table.add_row("Confidence", f"{priors.get('confidence', 0):.3f}")
table.add_row("Lambda ()", f"{priors.get('lambda', 0):.4f}")
table.add_row("Phi ()", f"{priors.get('phi', 0):.4f}")
table.add_row("Gamma ()", f"{priors.get('gamma', 0):.4f}")
table.add_row("Xi ()", f"{priors.get('xi', 0):.4f}")
table.add_row("Source", priors.get("source", "unknown"))

self.output.write(table)

if note:
self.output.write(f"[dim]Note: {note}[/dim]")

def show_ledger(self, lines: int = 10) -> None:
"""Display ledger tail"""
ledger_result = get_ledger_tail(lines)

if "error" in ledger_result:
self.output.write(f"[red]Ledger error: {ledger_result['error']}[/red]")
return

entries = ledger_result.get("entries", [])
total = ledger_result.get("total", 0)

if not entries:
self.output.write("[yellow]Ledger is empty[/yellow]")
return

self.output.write(f"[bold]Ledger Tail[/bold] (showing last {len(entries)} of {total} entries)\n")

for entry in entries:
self.output.write(
f"[cyan]{entry.get('id', 'unknown')}[/cyan] "
f"[dim]{entry.get('type', 'unknown')}[/dim] "
f"[yellow][/yellow] {entry.get('chain_hash', 'none')[:8]}"
)

def action_clear_log(self) -> None:
"""Clear output log"""
self.output.clear()
self.output.write("[dim]Log cleared[/dim]")


def main():
"""Launch OSIRIS TUI"""
app = OsirisApp()
app.run()


if __name__ == "__main__":
main()
