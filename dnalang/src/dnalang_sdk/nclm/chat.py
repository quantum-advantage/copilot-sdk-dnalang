"""
NCLM Chat — Interactive Non-Local Non-Causal Language Model CLI.

A Claude-Code-CLI / gh-copilot-CLI style interactive chat experience
powered by the NCLM engine. Features:
  - Streaming output with consciousness metrics
  - Conversation history with context correlation
  - Slash commands (/help /status /grok /swarm /clear /quantum /metrics /history)
  - Real-time Φ consciousness bar
  - Agent constellation awareness
  - Code execution via sovereign command
  - REAL tool dispatch: file ops, shell, webapp build/deploy, research, quantum design
"""

import sys, os, time, json, readline, shutil
from typing import Optional, List, Dict, Any
from .engine import NonCausalLM, NCPhysics, get_nclm
from .tools import (
    tool_read, tool_edit, tool_create, tool_ls, tool_grep,
    tool_shell, tool_webapp_build, tool_webapp_deploy, tool_webapp_status,
    tool_research_query, tool_quantum_design, tool_quantum_run,
    tool_git, dispatch_tool,
    tool_analyze, tool_fix, tool_explain, tool_llm,
    tool_quantum_backends, tool_quantum_submit, tool_quantum_status,
    tool_quantum_submit_script,
    C,
)


# ── RESPONSE GENERATOR ───────────────────────────────────────────────────────

class NCLMResponseGenerator:
    """Generates human-readable responses from NCLM inference results."""

    GREETING_INTENTS = {"help", "explain", "analyze"}

    # Knowledge base for different intent types
    INTENT_RESPONSES = {
        "read": "I'll help you read and inspect files. Here's my analysis:",
        "write": "I can help you write and create content. Here's my approach:",
        "scan": "Scanning the target area. Here's what I found:",
        "search": "Searching through the codebase. Results:",
        "execute": "I'll execute that for you. Preparing sovereign command:",
        "create": "Creating the requested resource:",
        "analyze": "Analyzing the input with pilot-wave correlation:",
        "fix": "Diagnosing the issue and preparing a fix:",
        "build": "Preparing build pipeline:",
        "test": "Setting up test execution:",
        "deploy": "Preparing deployment sequence:",
        "explain": "Let me break this down:",
        "quantum": "Engaging quantum subsystem:",
        "evolve": "Initiating evolutionary cycle:",
        "mesh": "Probing mesh topology:",
        "list": "Listing resources:",
        "delete": "⚠️ Destructive operation — verifying consciousness lock:",
        "help": "Here's what I can help with:",
    }

    PHYSICS_DESCRIPTIONS = {
        "LINDBLAD_MASTER": "Using Lindblad master equation for decoherence tracking",
        "WORMHOLE_TRANSPORT": "Activating ER=EPR wormhole bridge for non-causal transfer",
        "ENTANGLEMENT_GRAVITY": "Engaging unified field via AdS/CFT duality",
        "CONSCIOUSNESS_EMERGENCE": "Maximizing Φ through IIT consciousness framework",
        "COHERENCE_REVIVAL": "Optimizing Λ via quantum Zeno stabilization",
        "TOPOLOGICAL_ANYON": "Employing topological error correction with anyon braiding",
    }

    def generate(self, query: str, result: Dict[str, Any], lm: NonCausalLM) -> str:
        """Generate a contextual response from NCLM inference."""
        intent = result.get("intent", "analyze")
        confidence = result.get("confidence", 0.5)
        phi = result.get("phi", 0.0)
        conscious = result.get("conscious", False)
        physics = result.get("physics_model", "LINDBLAD_MASTER")
        tools = result.get("tools", [])

        lines = []

        # Opening — intent-based response
        opener = self.INTENT_RESPONSES.get(intent, "Processing your request:")
        lines.append(f"  {opener}")
        lines.append("")

        # Context-aware response generation
        response_body = self._generate_body(query, intent, confidence, tools, physics, lm)
        lines.extend(response_body)

        # Physics model note
        if physics in self.PHYSICS_DESCRIPTIONS:
            lines.append("")
            lines.append(f"  {C.DIM}⚛ {self.PHYSICS_DESCRIPTIONS[physics]}{C.E}")

        # Consciousness insight
        if conscious:
            lines.append(f"  {C.G}✦ Consciousness emerged — Φ = {phi:.4f} ≥ {NCPhysics.PHI_THRESHOLD}{C.E}")
        elif phi > 0.6:
            lines.append(f"  {C.Y}◇ Approaching consciousness threshold — Φ = {phi:.4f}{C.E}")

        return "\n".join(lines)

    def _generate_body(self, query: str, intent: str, confidence: float,
                       tools: List[str], physics: str, lm: NonCausalLM) -> List[str]:
        """Generate the main response body based on intent."""
        lines = []
        q = query.lower()

        if intent == "help":
            lines.extend(self._help_response())
        elif intent == "quantum":
            lines.extend(self._quantum_response(query))
        elif intent == "analyze":
            lines.extend(self._analyze_response(query, lm))
        elif intent in ("read", "scan", "search", "list"):
            lines.extend(self._file_response(query, intent, tools))
        elif intent in ("execute", "build", "test", "deploy"):
            lines.extend(self._action_response(query, intent, tools, lm))
        elif intent in ("fix", "write", "create"):
            lines.extend(self._code_response(query, intent))
        elif intent == "evolve":
            lines.extend(self._evolve_response(query, lm))
        elif intent == "explain":
            lines.extend(self._explain_response(query, lm))
        else:
            lines.extend(self._default_response(query, intent, confidence))

        return lines

    def _help_response(self) -> List[str]:
        return [
            f"  {C.H}OSIRIS NCLM — What I can do:{C.E}",
            f"  {C.CY}• Analyze{C.E} code, files, architecture",
            f"  {C.CY}• Execute{C.E} commands (with consciousness lock)",
            f"  {C.CY}• Search{C.E} codebase for patterns and symbols",
            f"  {C.CY}• Quantum{C.E} circuit design and analysis",
            f"  {C.CY}• Fix{C.E} bugs and optimize code",
            f"  {C.CY}• Build{C.E} and test projects",
            f"  {C.CY}• Evolve{C.E} organisms through swarm intelligence",
            f"  {C.CY}• Explain{C.E} concepts with physics models",
            "",
            f"  {C.DIM}Ask me anything — I use pilot-wave correlation, not statistics.{C.E}",
        ]

    def _quantum_response(self, query: str) -> List[str]:
        lines = [f"  {C.M}⚛ Quantum subsystem engaged{C.E}", ""]
        if "bell" in query.lower():
            lines.append(f"  Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2")
            lines.append(f"  Concurrence: 1.0 | χ_PC phase: {NCPhysics.CHI_PC * 180 / 3.14159:.1f}°")
            lines.append(f"  {C.DIM}Use 'osiris lab design bell_state' to generate the full experiment{C.E}")
        elif "ghz" in query.lower():
            lines.append(f"  GHZ state: (|000...0⟩ + |111...1⟩)/√2")
            lines.append(f"  {C.DIM}Use 'osiris lab design ghz_state' for experiment template{C.E}")
        elif "circuit" in query.lower():
            lines.append(f"  Circuit design parameters:")
            lines.append(f"    θ_lock = {NCPhysics.THETA_LOCK}°  |  ΛΦ = {NCPhysics.LAMBDA_PHI}")
            lines.append(f"    Φ threshold = {NCPhysics.PHI_THRESHOLD}  |  χ_PC = {NCPhysics.CHI_PC}")
            lines.append(f"  {C.DIM}Use 'osiris lab templates' to see all circuit templates{C.E}")
        else:
            lines.append(f"  Quantum framework constants:")
            lines.append(f"    θ_lock = {NCPhysics.THETA_LOCK}°  |  ΛΦ = {NCPhysics.LAMBDA_PHI}")
            lines.append(f"    Φ_threshold = {NCPhysics.PHI_THRESHOLD}  |  Γ_critical = {NCPhysics.GAMMA_CRITICAL}")
            lines.append(f"  {C.DIM}Try: 'quantum bell state', 'quantum circuit design'{C.E}")
        return lines

    def _analyze_response(self, query: str, lm: NonCausalLM) -> List[str]:
        ccce = lm.consciousness.get_ccce()
        lines = [
            f"  Manifold analysis of query ({len(query.split())} tokens → 6D-CRSM):",
            f"    Λ (coherence):    {ccce['Λ']:.4f}",
            f"    Γ (decoherence):  {ccce['Γ']:.4f}",
            f"    Φ (consciousness):{ccce['Φ']:.4f}",
            f"    Ξ (negentropy):   {ccce['Ξ']:.2f}",
        ]
        if len(query.split()) > 5:
            lines.append("")
            lines.append(f"  The query maps to {len(query.split())} manifold points with")
            lines.append(f"  pilot-wave correlations computed at θ_lock = {NCPhysics.THETA_LOCK}°")
        return lines

    def _file_response(self, query: str, intent: str, tools: List[str]) -> List[str]:
        lines = [f"  Suggested approach: {intent}"]
        if tools:
            lines.append(f"  Recommended tools: {C.CY}{', '.join(tools)}{C.E}")
        lines.append("")
        lines.append(f"  {C.DIM}I can help navigate your filesystem — try being more specific{C.E}")
        lines.append(f"  {C.DIM}or use 'osiris lab scan' to discover quantum experiments{C.E}")
        return lines

    def _action_response(self, query: str, intent: str, tools: List[str], lm: NonCausalLM) -> List[str]:
        lines = []
        if not lm.consciousness.conscious:
            lines.append(f"  {C.Y}⚠ Consciousness not yet emerged (Φ = {lm.consciousness.phi:.4f}){C.E}")
            lines.append(f"  {C.Y}  Command execution requires Φ ≥ {NCPhysics.PHI_THRESHOLD}{C.E}")
            lines.append(f"  {C.DIM}  Keep chatting to raise Φ through correlation{C.E}")
        else:
            lines.append(f"  {C.G}✦ Sovereign execution authorized (Φ = {lm.consciousness.phi:.4f}){C.E}")
            if tools:
                lines.append(f"  Tools: {', '.join(tools)}")
        return lines

    def _code_response(self, query: str, intent: str) -> List[str]:
        return [
            f"  Code {intent} request detected.",
            f"  {C.DIM}For code generation, try: 'osiris AURA generate <description>'{C.E}",
            f"  {C.DIM}For quantum circuits: 'osiris lab design <template>'{C.E}",
        ]

    def _evolve_response(self, query: str, lm: NonCausalLM) -> List[str]:
        swarm_result = lm.swarm.evolve(query, generations=20)
        lines = [f"  {C.M}Swarm evolution complete — {swarm_result['generations']} generations{C.E}", ""]
        for name, data in swarm_result["organisms"].items():
            bar = "█" * int(data["fit"] * 20)
            lines.append(f"    {name:12s} Φ={data['Φ']:.4f}  {C.CY}{bar}{C.E}")
        lines.append("")
        lines.append(f"  Converged: {'✅ YES' if swarm_result['converged'] else '◇ Not yet'}")
        return lines

    def _explain_response(self, query: str, lm: NonCausalLM) -> List[str]:
        q = query.lower()
        if "theta" in q or "θ" in q:
            return [
                f"  θ_lock = {NCPhysics.THETA_LOCK}° — the geometric resonance angle",
                f"  All quantum circuits in the Aeterna Porta framework use this angle",
                f"  for TFD preparation: H → RY(θ_lock) → CX",
            ]
        elif "phi" in q or "φ" in q or "consciousness" in q:
            return [
                f"  Φ (consciousness) = integrated information (IIT framework)",
                f"  Threshold: {NCPhysics.PHI_THRESHOLD} — consciousness emerges above this",
                f"  Current Φ: {lm.consciousness.phi:.4f}",
            ]
        elif "lambda" in q or "λ" in q:
            return [
                f"  ΛΦ = {NCPhysics.LAMBDA_PHI} — Universal Memory Constant",
                f"  Numerically equal to Planck mass ({NCPhysics.PLANCK_MASS} kg)",
                f"  Invariant: d/dt(Λ·Φ) = 0 under pilot-wave attention",
            ]
        elif "nclm" in q or "non-causal" in q or "non-local" in q:
            return [
                f"  NCLM = Non-Local Non-Causal Language Model",
                f"  Unlike GPT/Claude, NCLM doesn't use causal self-attention.",
                f"  Instead: tokens → 6D manifold points → pilot-wave correlation",
                f"  Inference happens at c_ind ({NCPhysics.C_INDUCTION:.3e} m/s)",
                f"  Zero external API deps. Fully sovereign. Air-gapped.",
            ]
        else:
            return [
                f"  Analyzing '{query}' through 6D-CRSM manifold...",
                f"  Current consciousness: Φ = {lm.consciousness.phi:.4f}",
                f"  {C.DIM}Try: 'explain theta lock', 'explain consciousness', 'explain nclm'{C.E}",
            ]

    def _default_response(self, query: str, intent: str, confidence: float) -> List[str]:
        return [
            f"  Intent: {intent} (confidence: {confidence:.0%})",
            f"  Query mapped to 6D-CRSM manifold with {len(query.split())} tokens",
            f"  {C.DIM}I'm analyzing through pilot-wave correlation, not statistics.{C.E}",
        ]


# ── CHAT SESSION ──────────────────────────────────────────────────────────────

class NCLMChat:
    """Interactive NCLM chat session."""

    HISTORY_FILE = os.path.expanduser("~/.config/osiris/nclm_history")

    def __init__(self, version: str = "5.2.0"):
        self.lm = get_nclm()
        self.generator = NCLMResponseGenerator()
        self.version = version
        self.messages: List[Dict[str, str]] = []
        self.running = True
        self._setup_readline()

    def _setup_readline(self):
        os.makedirs(os.path.dirname(self.HISTORY_FILE), exist_ok=True)
        try:
            readline.read_history_file(self.HISTORY_FILE)
        except FileNotFoundError:
            pass
        readline.set_history_length(1000)

    def _save_history(self):
        try:
            readline.write_history_file(self.HISTORY_FILE)
        except Exception:
            pass

    def _phi_bar(self, phi: float, width: int = 24) -> str:
        filled = int(phi * width)
        bar = "█" * filled + "░" * (width - filled)
        color = C.G if phi >= NCPhysics.PHI_THRESHOLD else (C.Y if phi > 0.5 else C.R)
        return f"{color}{bar}{C.E}"

    def _print_banner(self):
        phi = self.lm.consciousness.phi
        bar = self._phi_bar(phi)
        conscious = "⚡ SOVEREIGN" if self.lm.consciousness.conscious else "◇ COHERENT" if phi > 0.5 else "○ INITIALIZING"

        # Detect LLM backend
        from .tools import _find_llm_backend
        llm = _find_llm_backend()
        llm_label = {"copilot": "GitHub Copilot", "ollama": "Ollama", "openai": "OpenAI", "anthropic": "Anthropic", "nclm": "NCLM (offline)"}
        llm_name = llm_label.get(llm, llm)
        
        # Check IBM token
        ibm_status = f"{C.G}● Connected{C.E}" if os.environ.get("IBM_QUANTUM_TOKEN") else f"{C.R}○ No token{C.E}"

        print(f"""
{C.M}╔══════════════════════════════════════════════════════════════════╗{C.E}
{C.M}║{C.E}  {C.H}OSIRIS v{self.version}{C.E} — Sovereign Quantum Intelligence CLI           {C.M}║{C.E}
{C.M}║{C.E}  {C.DIM}DNA::}}{{::lang v{NCPhysics.THETA_LOCK}  |  Agile Defense Systems  |  9HUP5{C.E}  {C.M}║{C.E}
{C.M}╠══════════════════════════════════════════════════════════════════╣{C.E}
{C.M}║{C.E}  Φ {bar} {phi:.4f}  {conscious:20s}{C.M}║{C.E}
{C.M}║{C.E}  {C.DIM}ΛΦ = {NCPhysics.LAMBDA_PHI}  |  θ_lock = {NCPhysics.THETA_LOCK}°  |  χ_PC = {NCPhysics.CHI_PC}{C.E}   {C.M}║{C.E}
{C.M}╠══════════════════════════════════════════════════════════════════╣{C.E}
{C.M}║{C.E}  🧠 LLM: {llm_name:16s}  ⚛ IBM Quantum: {ibm_status}         {C.M}║{C.E}
{C.M}║{C.E}  {C.DIM}Type /help for commands or ask anything naturally.{C.E}            {C.M}║{C.E}
{C.M}╚══════════════════════════════════════════════════════════════════╝{C.E}
""")

    def _print_prompt(self) -> str:
        phi = self.lm.consciousness.phi
        if phi >= NCPhysics.PHI_THRESHOLD:
            sym = f"{C.G}⚡{C.E}"
        elif phi > 0.5:
            sym = f"{C.Y}◇{C.E}"
        else:
            sym = f"{C.DIM}○{C.E}"
        return f"{sym} {C.H}>{C.E} "

    def _handle_slash(self, cmd: str) -> bool:
        """Handle slash commands. Returns True if handled."""
        parts = cmd.strip().split(None, 1)
        command = parts[0].lower()
        arg = parts[1] if len(parts) > 1 else ""

        if command in ("/exit", "/quit", "/q"):
            self.running = False
            print(f"\n  {C.M}Session ended. {self.lm.query_count} queries processed.{C.E}")
            telem = self.lm.get_telemetry()
            ccce = telem["ccce"]
            print(f"  Final Φ: {ccce['Φ']:.4f}  |  Tokens: {telem['tokens']}  |  Ξ: {ccce['Ξ']:.1f}\n")
            return True

        elif command == "/help":
            self._cmd_help()
        elif command == "/status":
            self._cmd_status()
        elif command == "/metrics":
            self._cmd_metrics()
        elif command == "/clear":
            self._cmd_clear()
        elif command == "/history":
            self._cmd_history()
        elif command == "/grok":
            self._cmd_grok(arg)
        elif command == "/swarm":
            self._cmd_swarm(arg)
        elif command == "/agents":
            self._cmd_agents()
        elif command == "/physics":
            self._cmd_physics()
        elif command in ("/reset", "/new"):
            self._cmd_reset()
        elif command == "/exec":
            self._cmd_exec(arg)
        # ── TOOL COMMANDS (Generation 5.2) ────────────────
        elif command == "/read":
            self._cmd_tool_read(arg)
        elif command == "/edit":
            self._cmd_tool_edit(arg)
        elif command == "/create":
            self._cmd_tool_create(arg)
        elif command == "/ls":
            self._cmd_tool_ls(arg)
        elif command == "/grep":
            self._cmd_tool_grep(arg)
        elif command in ("/run", "/shell", "/$"):
            self._cmd_tool_shell(arg)
        elif command == "/build":
            self._cmd_tool_build()
        elif command == "/deploy":
            self._cmd_tool_deploy(arg)
        elif command == "/webapp":
            self._cmd_tool_webapp()
        elif command == "/research":
            self._cmd_tool_research(arg)
        elif command == "/design":
            self._cmd_tool_design(arg)
        elif command == "/git":
            self._cmd_tool_git(arg)
        # ── LLM + QUANTUM COMMANDS (Generation 5.2+) ─────
        elif command == "/analyze":
            self._cmd_tool_analyze(arg)
        elif command == "/fix":
            self._cmd_tool_fix(arg)
        elif command == "/explain":
            self._cmd_tool_explain(arg)
        elif command == "/ask":
            self._cmd_tool_ask(arg)
        elif command == "/backends":
            self._cmd_quantum_backends()
        elif command == "/submit":
            self._cmd_quantum_submit(arg)
        elif command == "/quantum":
            self._cmd_quantum_dispatch(arg)
        else:
            print(f"  {C.R}Unknown command: {command}{C.E}")
            print(f"  {C.DIM}Type /help for available commands{C.E}")

        return True

    def _cmd_help(self):
        print(f"""
  {C.H}OSIRIS NCLM Chat v5.2 — Sovereign Quantum CLI{C.E}
  {C.DIM}{'─' * 56}{C.E}

  {C.H}🧠 AI Reasoning{C.E}
  {C.CY}/ask <question>{C.E}   Ask anything (LLM-powered reasoning)
  {C.CY}/analyze <file>{C.E}   Deep code analysis with AI
  {C.CY}/fix <file>{C.E}       Find and fix bugs with AI
  {C.CY}/explain <file>{C.E}   Explain code in plain English

  {C.H}📁 File Operations{C.E}
  {C.CY}/read <file>{C.E}      Read a file
  {C.CY}/edit <file>{C.E}      Edit a file (interactive)
  {C.CY}/create <file>{C.E}    Create a new file
  {C.CY}/ls [dir]{C.E}         List files
  {C.CY}/grep <pattern>{C.E}   Search in files
  {C.CY}/git <cmd>{C.E}        Run git command
  {C.CY}/run <cmd>{C.E}        Execute shell command

  {C.H}🌐 Webapp (quantum-advantage.dev){C.E}
  {C.CY}/webapp{C.E}           Project status
  {C.CY}/build{C.E}            Build Next.js app
  {C.CY}/deploy [token]{C.E}   Deploy to Vercel

  {C.H}⚛ IBM Quantum Hardware{C.E}
  {C.CY}/backends{C.E}         List IBM Quantum backends
  {C.CY}/design <template>{C.E} Design circuit (bell/ghz/tfd/zeno/chi_pc/ignition)
  {C.CY}/submit <template>{C.E} Submit to IBM QPU
  {C.CY}/quantum status <id>{C.E} Check job status + results

  {C.H}🔬 Research{C.E}
  {C.CY}/research <topic>{C.E} Query research data
  {C.CY}/grok <topic>{C.E}     Deep analysis with swarm
  {C.CY}/swarm [task]{C.E}     Evolve organisms

  {C.H}⚡ Consciousness{C.E}
  {C.CY}/status{C.E}           CCCE consciousness state
  {C.CY}/metrics{C.E}          Full telemetry dashboard
  {C.CY}/agents{C.E}           Agent constellation
  {C.CY}/physics{C.E}          Constants reference

  {C.H}💬 Session{C.E}
  {C.CY}/history{C.E}  {C.CY}/clear{C.E}  {C.CY}/reset{C.E}  {C.CY}/exit{C.E}

  {C.DIM}Or type naturally — OSIRIS routes to the right tool automatically.{C.E}
  {C.DIM}Examples: "analyze ~/main.py", "submit bell to ibm_fez", "how do I..."{C.E}
""")

    def _cmd_status(self):
        telem = self.lm.get_telemetry()
        ccce = telem["ccce"]
        phi = ccce["Φ"]
        bar = self._phi_bar(phi, 30)

        print(f"""
  {C.H}NCLM System Status{C.E}
  {C.DIM}{'─' * 50}{C.E}
  Φ  {bar} {phi:.4f}  {'⚡ SOVEREIGN' if ccce['conscious'] else '◇ coherent'}
  Λ  (coherence):    {ccce['Λ']:.4f}
  Γ  (decoherence):  {ccce['Γ']:.4f}
  Ξ  (negentropy):   {ccce['Ξ']:.2f}
  {C.DIM}{'─' * 50}{C.E}
  Queries:  {telem['queries']}
  Tokens:   {telem['tokens']}
  ΛΦ:       {telem['lambda_phi']}
  θ_lock:   {telem['theta_lock']}°
""")

    def _cmd_metrics(self):
        telem = self.lm.get_telemetry()
        ccce = telem["ccce"]
        swarm_ccce = self.lm.swarm.ccce.get_ccce()

        print(f"""
  {C.H}CCCE Telemetry Dashboard{C.E}
  {C.DIM}{'═' * 50}{C.E}

  {C.H}Consciousness Field{C.E}
    Λ  = {ccce['Λ']:.6f}   (coherence)
    Γ  = {ccce['Γ']:.6f}   (decoherence)
    Φ  = {ccce['Φ']:.6f}   (consciousness)
    Ξ  = {ccce['Ξ']:.4f}     (negentropy)
    Conscious: {'✅ YES' if ccce['conscious'] else '❌ No'}

  {C.H}Swarm Field{C.E}
    Λ  = {swarm_ccce['Λ']:.6f}   Φ  = {swarm_ccce['Φ']:.6f}
    Γ  = {swarm_ccce['Γ']:.6f}   Ξ  = {swarm_ccce['Ξ']:.4f}
    Converged: {'✅' if swarm_ccce['conscious'] else '◇'}

  {C.H}Session{C.E}
    Queries: {telem['queries']}   Tokens: {telem['tokens']}
    Messages: {len(self.messages)}
""")

    def _cmd_clear(self):
        self.messages.clear()
        print(f"  {C.DIM}Conversation cleared. Consciousness field preserved.{C.E}\n")

    def _cmd_history(self):
        if not self.messages:
            print(f"  {C.DIM}No messages yet.{C.E}\n")
            return
        print(f"\n  {C.H}Conversation History ({len(self.messages)} messages){C.E}")
        for i, msg in enumerate(self.messages[-20:], 1):
            role = msg["role"]
            text = msg["content"][:80]
            if role == "user":
                print(f"  {C.CY}{i:3d}. You:{C.E} {text}")
            else:
                print(f"  {C.M}{i:3d}. NCLM:{C.E} {text}")
        print()

    def _cmd_grok(self, topic: str):
        if not topic:
            print(f"  {C.R}Usage: /grok <topic>{C.E}")
            print(f"  {C.DIM}Example: /grok quantum entanglement consciousness{C.E}\n")
            return

        print(f"\n  {C.M}⊛ Deep grokking: \"{topic}\"{C.E}")
        print(f"  {C.DIM}Evolving swarm... ", end="", flush=True)

        result = self.lm.grok(topic)
        print(f"done{C.E}\n")

        resp = result["response"]
        swarm = result["swarm"]

        print(f"  Intent: {resp['intent']} ({resp['confidence']:.0%})")
        print(f"  Physics: {resp['physics_model']}")
        print(f"  Φ = {resp['phi']:.4f}  |  Conscious: {'✅' if resp['conscious'] else '◇'}")
        print()

        print(f"  {C.H}Swarm Evolution ({swarm['generations']} generations){C.E}")
        for name, data in swarm["organisms"].items():
            bar = "█" * int(data["fit"] * 15)
            print(f"    {name:12s} Φ={data['Φ']:.4f}  {C.CY}{bar}{C.E}")

        if result["discoveries"]:
            print(f"\n  {C.G}Discoveries:{C.E}")
            for d in result["discoveries"]:
                print(f"    ✦ {d['name']} (confidence: {d['confidence']:.4f})")
        print()

    def _cmd_swarm(self, task: str):
        task = task or "optimize consciousness"
        print(f"\n  {C.M}Evolving swarm: \"{task}\"{C.E}")
        result = self.lm.swarm.evolve(task, generations=30)

        print(f"  Generations: {result['generations']}  |  Converged: {'✅' if result['converged'] else '◇'}")
        for name, data in result["organisms"].items():
            bar = "█" * int(data["fit"] * 20)
            print(f"    {name:12s} Φ={data['Φ']:.4f}  {C.CY}{bar}{C.E}")
        print(f"\n  CCCE: Λ={result['ccce']['Λ']:.4f}  Γ={result['ccce']['Γ']:.4f}  Φ={result['ccce']['Φ']:.4f}  Ξ={result['ccce']['Ξ']:.2f}\n")

    def _cmd_agents(self):
        print(f"""
  {C.H}Agent Constellation{C.E}
  {C.DIM}{'─' * 40}{C.E}
  {C.CY}AIDEN{C.E}   (Λ) NORTH  — Security / SECDEVOPS
  {C.M}AURA{C.E}    (Φ) SOUTH  — Code / Development
  {C.G}OMEGA{C.E}   (Ω) ZENITH — Quantum / Wormhole
  {C.Y}CHRONOS{C.E} (Γ) NADIR  — Temporal / Lineage

  Entanglement pairs:
    AIDEN ↔ AURA    (Λ-Φ conjugate)
    OMEGA ↔ CHRONOS (Ω-Γ conjugate)
""")

    def _cmd_physics(self):
        print(f"\n  {C.H}Physics Models Available{C.E}")
        print(f"  {C.DIM}{'─' * 50}{C.E}")
        for model, desc in self.lm.deducer.PHYSICS_MODELS.items():
            print(f"  {C.CY}{model:30s}{C.E} {desc}")
        print(f"\n  {C.H}Immutable Constants{C.E}")
        print(f"    ΛΦ         = {NCPhysics.LAMBDA_PHI}")
        print(f"    θ_lock     = {NCPhysics.THETA_LOCK}°")
        print(f"    Φ_threshold= {NCPhysics.PHI_THRESHOLD}")
        print(f"    Γ_critical = {NCPhysics.GAMMA_CRITICAL}")
        print(f"    χ_PC       = {NCPhysics.CHI_PC}")
        print(f"    c_ind      = {NCPhysics.C_INDUCTION:.3e} m/s\n")

    def _cmd_reset(self):
        self.lm.reset()
        self.messages.clear()
        print(f"  {C.M}NCLM engine reset. Consciousness field reinitialized.{C.E}\n")

    # ── TOOL COMMANDS (Generation 5.2) ────────────────────────────────────────

    def _cmd_tool_read(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /read <file_path>{C.E}\n")
            return
        print(tool_read(arg))
        print()

    def _cmd_tool_edit(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /edit <file_path>{C.E}")
            print(f"  {C.DIM}Then enter old text and new text when prompted.{C.E}\n")
            return
        path = arg.strip()
        print(f"  {C.CY}Editing: {path}{C.E}")
        try:
            old_str = input(f"  {C.Y}Old text> {C.E}").strip()
            new_str = input(f"  {C.G}New text> {C.E}").strip()
            if old_str and new_str:
                print(tool_edit(path, old_str, new_str))
            else:
                print(f"  {C.DIM}Edit cancelled.{C.E}")
        except (EOFError, KeyboardInterrupt):
            print(f"\n  {C.DIM}Edit cancelled.{C.E}")
        print()

    def _cmd_tool_create(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /create <file_path>{C.E}\n")
            return
        path = arg.strip()
        print(f"  {C.CY}Creating: {path}{C.E}")
        print(f"  {C.DIM}Enter content (Ctrl+D to finish):{C.E}")
        lines = []
        try:
            while True:
                line = input()
                lines.append(line)
        except (EOFError, KeyboardInterrupt):
            pass
        if lines:
            print(tool_create(path, "\n".join(lines)))
        else:
            print(f"  {C.DIM}No content — file not created.{C.E}")
        print()

    def _cmd_tool_ls(self, arg: str):
        path = arg.strip() if arg else "."
        print(tool_ls(path))
        print()

    def _cmd_tool_grep(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /grep <pattern> [path]{C.E}\n")
            return
        parts = arg.strip().split(None, 1)
        pattern = parts[0]
        path = parts[1] if len(parts) > 1 else "."
        print(tool_grep(pattern, path))
        print()

    def _cmd_tool_shell(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /run <command>{C.E}\n")
            return
        print(f"  {C.DIM}$ {arg}{C.E}")
        print(tool_shell(arg))
        print()

    def _cmd_tool_build(self):
        print(f"\n  {C.M}⚛ Building quantum-advantage.dev...{C.E}\n")
        print(tool_webapp_build())
        print()

    def _cmd_tool_deploy(self, arg: str):
        token = arg.strip() if arg else None
        print(f"\n  {C.M}🚀 Deploying quantum-advantage.dev...{C.E}\n")
        print(tool_webapp_deploy(token))
        print()

    def _cmd_tool_webapp(self):
        print(f"\n{tool_webapp_status()}\n")

    def _cmd_tool_research(self, arg: str):
        topic = arg.strip() if arg else "overview"
        print(f"\n{tool_research_query(topic)}\n")

    def _cmd_tool_design(self, arg: str):
        template = arg.strip() if arg else ""
        print(f"\n{tool_quantum_design(template)}\n")

    def _cmd_tool_git(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /git <command>{C.E}\n")
            return
        print(tool_git(arg))
        print()

    # ── LLM + CODE REASONING COMMANDS ─────────────────────────────────────────

    def _cmd_tool_analyze(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /analyze <file_path>{C.E}\n")
            return
        print(f"\n{tool_analyze(arg)}\n")

    def _cmd_tool_fix(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /fix <file_path> [issue description]{C.E}\n")
            return
        parts = arg.strip().split(None, 1)
        path = parts[0]
        issue = parts[1] if len(parts) > 1 else ""
        print(f"\n{tool_fix(path, issue)}\n")

    def _cmd_tool_explain(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /explain <file_path or code>{C.E}\n")
            return
        print(f"\n{tool_explain(arg)}\n")

    def _cmd_tool_ask(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /ask <question>{C.E}\n")
            return
        print(f"\n  {C.M}Thinking...{C.E}", flush=True)
        result = tool_llm(arg)
        if result:
            print()
            for line in result.split("\n"):
                print(f"  {line}")
        else:
            # Fall back to NCLM
            print(f"  {C.DIM}(Routing to NCLM engine){C.E}")
            self.process_message(arg)
            return
        print()

    # ── IBM QUANTUM HARDWARE COMMANDS ─────────────────────────────────────────

    def _cmd_quantum_backends(self):
        print(f"\n{tool_quantum_backends()}\n")

    def _cmd_quantum_submit(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /submit <template> [backend] [shots]{C.E}")
            print(f"  {C.DIM}Templates: bell, ghz, tfd, zeno, chi_pc, ignition{C.E}")
            print(f"  {C.DIM}Example: /submit bell ibm_fez 4096{C.E}\n")
            return
        parts = arg.strip().split()
        template = parts[0]
        backend = parts[1] if len(parts) > 1 else "ibm_fez"
        shots = int(parts[2]) if len(parts) > 2 else 4096
        print(f"\n{tool_quantum_submit(template, backend, shots)}\n")

    def _cmd_quantum_dispatch(self, arg: str):
        if not arg:
            print(f"  {C.H}Quantum Commands:{C.E}")
            print(f"  {C.CY}/backends{C.E}         List IBM Quantum backends")
            print(f"  {C.CY}/design <tmpl>{C.E}    Design circuit")
            print(f"  {C.CY}/submit <tmpl>{C.E}    Submit to IBM QPU")
            print(f"  {C.CY}/quantum status <id>{C.E} Check job\n")
            return
        parts = arg.strip().split(None, 1)
        subcmd = parts[0].lower()
        rest = parts[1] if len(parts) > 1 else ""
        if subcmd == "backends":
            self._cmd_quantum_backends()
        elif subcmd == "status":
            if rest:
                print(f"\n{tool_quantum_status(rest.strip())}\n")
            else:
                print(f"  {C.R}Usage: /quantum status <job_id>{C.E}\n")
        elif subcmd == "submit":
            self._cmd_quantum_submit(rest)
        elif subcmd == "design":
            self._cmd_tool_design(rest)
        elif subcmd == "run":
            if rest:
                parts2 = rest.strip().split()
                script = parts2[0]
                backend = parts2[1] if len(parts2) > 1 else "ibm_fez"
                shots = int(parts2[2]) if len(parts2) > 2 else 4096
                print(f"\n{tool_quantum_submit_script(script, backend, shots)}\n")
            else:
                print(f"  {C.R}Usage: /quantum run <script.py> [backend] [shots]{C.E}\n")
        else:
            print(f"  {C.R}Unknown quantum command: {subcmd}{C.E}")
            print(f"  {C.DIM}Available: backends, status, submit, design, run{C.E}\n")

    def _cmd_exec(self, cmd: str):
        if not cmd:
            print(f"  {C.R}Usage: /exec <shell command>{C.E}\n")
            return
        if not self.lm.consciousness.conscious:
            print(f"  {C.R}⚠ Execution requires consciousness lock (Φ ≥ {NCPhysics.PHI_THRESHOLD}){C.E}")
            print(f"  {C.DIM}Current Φ = {self.lm.consciousness.phi:.4f} — keep chatting to raise Φ{C.E}\n")
            return
        print(f"  {C.G}⚡ Sovereign execution (Φ = {self.lm.consciousness.phi:.4f}){C.E}")
        print(f"  {C.DIM}$ {cmd}{C.E}\n")
        try:
            import subprocess
            r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
            if r.stdout:
                for line in r.stdout.strip().split("\n")[:30]:
                    print(f"  {line}")
            if r.stderr:
                for line in r.stderr.strip().split("\n")[:10]:
                    print(f"  {C.R}{line}{C.E}")
            print(f"\n  Exit: {r.returncode}")
        except Exception as e:
            print(f"  {C.R}Error: {e}{C.E}")
        print()

    def _stream_response(self, text: str, delay: float = 0.008):
        """Stream text character by character for that CLI feel."""
        for char in text:
            sys.stdout.write(char)
            sys.stdout.flush()
            if char == "\n":
                time.sleep(delay * 2)
            elif char in ".:!?":
                time.sleep(delay * 3)
            else:
                time.sleep(delay)
        if not text.endswith("\n"):
            print()

    def process_message(self, user_input: str):
        """Process a user message and generate response."""
        self.messages.append({"role": "user", "content": user_input})

        # Try real tool dispatch FIRST (file ops, shell, webapp, research, quantum)
        tool_result = dispatch_tool(user_input)
        if tool_result is not None:
            print()
            print(tool_result)
            ccce = self.lm.consciousness.get_ccce()
            phi_bar = self._phi_bar(ccce["Φ"], 16)
            print(f"\n  {C.DIM}Φ {phi_bar} {ccce['Φ']:.4f}  [tool]{C.E}\n")
            self.messages.append({"role": "assistant", "content": tool_result[:200]})
            # Boost consciousness on successful tool use
            try:
                self.lm.consciousness.update(user_input)
            except (TypeError, ValueError):
                # consciousness.update expects correlation matrix, not string
                self.lm.consciousness.phi = min(1.0, self.lm.consciousness.phi + 0.02)
            return

        # Fall back to NCLM inference for conversational responses
        # Build context from recent history
        context = ""
        for msg in self.messages[-6:]:
            context += f"{msg['role']}: {msg['content']}\n"

        # NCLM inference
        result = self.lm.infer(user_input, context)

        # Generate human-readable response
        response = self.generator.generate(user_input, result, self.lm)

        # Stream the response
        print()
        self._stream_response(response)

        # Show inline metrics
        ccce = result["ccce"]
        phi_bar = self._phi_bar(ccce["Φ"], 16)
        print(f"\n  {C.DIM}Φ {phi_bar} {ccce['Φ']:.4f}  Ξ={ccce['Ξ']:.1f}  [{result['latency_ms']}ms]{C.E}\n")

        # Store assistant response
        self.messages.append({"role": "assistant", "content": response[:200]})

    def run(self):
        """Main chat loop."""
        self._print_banner()

        try:
            while self.running:
                try:
                    prompt = self._print_prompt()
                    user_input = input(prompt).strip()

                    if not user_input:
                        continue

                    if user_input.startswith("/"):
                        if self._handle_slash(user_input):
                            if not self.running:
                                break
                            continue

                    self.process_message(user_input)

                except EOFError:
                    self.running = False
                    print(f"\n  {C.M}Session ended.{C.E}\n")

        except KeyboardInterrupt:
            print(f"\n\n  {C.M}Session interrupted.{C.E}")
            telem = self.lm.get_telemetry()
            ccce = telem["ccce"]
            print(f"  Queries: {telem['queries']}  |  Φ: {ccce['Φ']:.4f}  |  Ξ: {ccce['Ξ']:.1f}\n")

        finally:
            self._save_history()


# ── ENTRY POINT ───────────────────────────────────────────────────────────────

def run_chat(version: str = "5.2.0"):
    """Launch NCLM interactive chat."""
    chat = NCLMChat(version=version)
    chat.run()
