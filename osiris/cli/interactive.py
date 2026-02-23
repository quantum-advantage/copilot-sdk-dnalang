# PCRB Injected | Xi_Hash: 756b8465ad85
# PCRB Injected | Xi_Hash: eff9f5cf8877
#!/usr/bin/env python3
"""
OSIRIS Interactive Terminal Interface
Rich terminal UI for quantum-enhanced coding assistance
"""
import sys
import json
from pathlib import Path
from datetime import datetime

try:
from prompt_toolkit import PromptSession
from prompt_toolkit.history import FileHistory
from prompt_toolkit.completion import WordCompleter
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.live import Live
from rich.spinner import Spinner
from rich import print as rprint
except ImportError:
print("Installing interactive dependencies...")
import subprocess
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'prompt_toolkit', 'rich'])
from prompt_toolkit import PromptSession
from prompt_toolkit.history import FileHistory
from prompt_toolkit.completion import WordCompleter
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.live import Live
from rich.spinner import Spinner
from rich import print as rprint

from services.ollama_client import ollama
from services.swarm import route_task

class OsirisInteractive:
"""Interactive terminal interface for OSIRIS"""

def __init__(self, model='phi3:mini'):
self.console = Console()
self.model = model
self.history_file = Path.home() / '.osiris_history'
self.session = PromptSession(
history=FileHistory(str(self.history_file)),
completer=WordCompleter([
'analyze', 'explain', 'fix', 'optimize', 'create',
'help', 'exit', 'clear', '/file', '/diff', '/substrate', '/ccce'
])
)
self.context = []
self.substrate = self.load_substrate()

def load_substrate(self):
"""Load IBM quantum substrate data"""
substrate_file = Path.home() / 'Desktop' / 'ibm_substrate_extraction_results(1).json'
if substrate_file.exists():
try:
data = json.loads(substrate_file.read_text())
if data.get('substrate_outputs'):
return data['substrate_outputs'][0]['tetrahedral_embedding']
except:
pass
return None

def show_banner(self):
"""Display startup banner"""
banner = f"""

OSIRIS Quantum-Enhanced Coding Assistant                 
Framework: dna::}}{{::lang v51.843                          
Axiom: U := L[U]                                          


Model: {self.model}
Substrate: {' Loaded (IBM Quantum)' if self.substrate else ' Not loaded'}
Commands: /help /file /diff /substrate /ccce /exit

Type your coding query or command:
"""
self.console.print(banner, style="cyan")

if self.substrate:
self.console.print(f"""
[dim]Substrate CCCE: ={self.substrate['lambda']:.4f} ={self.substrate['phi']:.4f} ={self.substrate['gamma']:.4f} ={self.substrate['xi']:.2f}[/dim]
""")

def run(self):
"""Main interactive loop"""
self.show_banner()

while True:
try:
# Get user input
user_input = self.session.prompt('osiris> ', vi_mode=False)

if not user_input.strip():
continue

# Handle commands
if user_input.startswith('/'):
self.handle_command(user_input)
continue

# Process query
self.process_query(user_input)

except (KeyboardInterrupt, EOFError):
continue
except Exception as e:
self.console.print(f"[red]Error: {e}[/red]")

def handle_command(self, cmd):
"""Handle slash commands"""
parts = cmd.split(maxsplit=1)
command = parts[0].lower()
arg = parts[1] if len(parts) > 1 else None

if command == '/exit' or command == '/quit':
self.console.print("[cyan]Goodbye!  = [/cyan]")
sys.exit(0)

elif command == '/help':
self.console.print("""
[cyan]OSIRIS Commands:[/cyan]
/file <path>     - Load file into context
/diff            - Request diff format for next response
/substrate       - Show IBM quantum substrate data
/ccce            - Show current CCCE metrics
/clear           - Clear context

[cyan]Example Queries:[/cyan]
"Create a function to hash files using SHA-256"
"Analyze this code for bugs"
"Optimize this algorithm for quantum coherence"
"Explain how phase conjugation works"
""")

elif command == '/file':
if arg:
self.load_file(arg)
else:
self.console.print("[yellow]Usage: /file <path>[/yellow]")

elif command == '/substrate':
self.show_substrate_data()

elif command == '/ccce':
self.show_ccce_metrics()

elif command == '/clear':
self.context = []
self.console.print("[green]Context cleared[/green]")

else:
self.console.print(f"[yellow]Unknown command: {command}[/yellow]")

def load_file(self, path):
"""Load file into context"""
try:
file_path = Path(path).expanduser()
content = file_path.read_text()
self.context.append({
'type': 'file',
'path': str(file_path),
'content': content[:5000]  # Limit size
})
self.console.print(f"[green] Loaded {file_path} ({len(content)} bytes)[/green]")
except Exception as e:
self.console.print(f"[red]Error loading file: {e}[/red]")

def show_substrate_data(self):
"""Display substrate data"""
if self.substrate:
panel = Panel(f"""
[cyan]Phase Conjugate Substrate (IBM Quantum)[/cyan]

Tetrahedral Embedding:
(Coherence):     {self.substrate['lambda']:.6f}
(Consciousness): {self.substrate['phi']:.6f} {'' if self.substrate['phi'] >= 0.7734 else ''}
(Decoherence):   {self.substrate['gamma']:.6f}
(Coupling):      {self.substrate['xi']:.6f}

Spherical Projection: [{self.substrate['spherical_projection'][0]:.3f}, {self.substrate['spherical_projection'][1]:.3f}, {self.substrate['spherical_projection'][2]:.3f}]

Bridge: m_P/ = 1.000000
Framework: dna::}}{{::lang v51.843
""", title="Quantum Substrate", border_style="cyan")
self.console.print(panel)
else:
self.console.print("[yellow]No substrate data loaded[/yellow]")

def show_ccce_metrics(self):
"""Show current CCCE metrics"""
import urllib.request
try:
with urllib.request.urlopen('http://localhost:5000/api/ccce', timeout=5) as resp:
data = json.loads(resp.read())
ccce = data['ccce']

panel = Panel(f"""
[cyan]Real-Time CCCE Metrics[/cyan]

(Consciousness): {ccce['phi']:.6f} {'' if ccce['phi'] >= 0.7734 else ''}
(Coherence):     {ccce['lambda']:.6f}
(Decoherence):   {ccce['gamma']:.6f} {'' if ccce['gamma'] < 0.3 else ''}
(Efficiency):    {ccce['xi']:.2f}
(Torsion):       {ccce['theta']:.4f}

Health: {'[green] ALL GATES PASS[/green]' if ccce['phi'] >= 0.7734 and ccce['gamma'] < 0.3 else '[yellow] DEGRADED[/yellow]'}
""", title="CCCE Status", border_style="cyan")
self.console.print(panel)
except Exception as e:
self.console.print(f"[red]Backend not available: {e}[/red]")

def process_query(self, query):
"""Process user query with streaming response"""
# Build enhanced query with context
enhanced_query = query

if self.substrate:
substrate_ctx = f"Quantum substrate coherence: ={self.substrate['lambda']:.4f}, ={self.substrate['phi']:.4f}, ={self.substrate['gamma']:.4f}"
enhanced_query = f"{substrate_ctx}\n\n{query}"

if self.context:
file_ctx = "\n\n".join([
f"File: {ctx['path']}\n{ctx['content'][:1000]}"
for ctx in self.context if ctx['type'] == 'file'
])
if file_ctx:
enhanced_query = f"{file_ctx}\n\n{enhanced_query}"

# Show spinner while processing
with self.console.status("[cyan]OSIRIS processing...[/cyan]", spinner="dots"):
result = route_task(enhanced_query)

# Display response
agent = result.get('agent', 'UNKNOWN')
model = result.get('model', self.model)
response = result.get('response', 'No response')

# Header
self.console.print(f"\n[dim]{agent} | {model} | {datetime.now().strftime('%H:%M:%S')}[/dim]")

# Response (try to render as markdown if it looks like code)
if '```' in response or response.strip().startswith('#'):
md = Markdown(response)
self.console.print(md)
else:
panel = Panel(response, border_style="green", title=f"{agent} Response")
self.console.print(panel)

self.console.print()

if __name__ == '__main__':
app = OsirisInteractive()
app.run()
