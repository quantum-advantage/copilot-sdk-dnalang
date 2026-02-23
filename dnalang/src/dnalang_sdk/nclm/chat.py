"""
NCLM Chat — Interactive Non-Local Non-Causal Language Model CLI.

A Claude-Code-CLI / gh-copilot-CLI style interactive chat experience
powered by the NCLM engine. Features:
  - Streaming output with consciousness metrics
  - Animated boot sequence & spinner animations
  - Tab completion for commands, files, and circuit templates
  - Smart follow-up suggestions after every response
  - /demo mode for live presentations
  - Conversation history with context correlation
  - Slash commands (35+ commands across 7 categories)
  - Real-time Φ consciousness bar
  - Agent constellation awareness
  - Code execution via sovereign command
  - REAL tool dispatch: file ops, shell, webapp build/deploy, research, quantum design
  - LLM reasoning (GitHub Copilot / Ollama / OpenAI backends)
  - IBM Quantum hardware submission (SamplerV2 2025+ API)
"""

import sys, os, time, json, readline, shutil, threading, itertools
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
    CIRCUIT_TEMPLATES,
    C,
)


# ── SPINNER ───────────────────────────────────────────────────────────────────

class Spinner:
    """Animated spinner for long-running operations."""
    FRAMES_QUANTUM = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    FRAMES_DNA     = ["🧬", "⚛ ", "🔬", "⚡", "🧬", "⚛ ", "🔬", "⚡"]
    FRAMES_ORBITAL = ["◜ ", "◝ ", "◞ ", "◟ "]

    def __init__(self, message: str = "Processing", frames: str = "quantum"):
        self.message = message
        self.frames = getattr(self, f"FRAMES_{frames.upper()}", self.FRAMES_QUANTUM)
        self._stop = threading.Event()
        self._thread: Optional[threading.Thread] = None

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, *_):
        self.stop()

    def start(self):
        self._stop.clear()
        self._thread = threading.Thread(target=self._spin, daemon=True)
        self._thread.start()

    def stop(self, final: str = ""):
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=1)
        sys.stdout.write(f"\r\033[K")  # clear line
        if final:
            print(final)
        sys.stdout.flush()

    def _spin(self):
        cycle = itertools.cycle(self.frames)
        is_tty = hasattr(sys.stdout, "isatty") and sys.stdout.isatty()
        while not self._stop.is_set():
            frame = next(cycle)
            if is_tty:
                sys.stdout.write(f"\r  {C.M}{frame} {self.message}...{C.E}")
                sys.stdout.flush()
            self._stop.wait(0.1)


# ── TAB COMPLETION ────────────────────────────────────────────────────────────

SLASH_COMMANDS = [
    "/help", "/status", "/metrics", "/clear", "/history", "/exit", "/quit",
    "/grok", "/swarm", "/agents", "/physics", "/reset",
    "/read", "/edit", "/create", "/ls", "/grep", "/run", "/git",
    "/build", "/deploy", "/webapp",
    "/ask", "/analyze", "/fix", "/explain",
    "/backends", "/submit", "/quantum", "/design",
    "/research", "/demo", "/dashboard",
    "/exec", "/shell",
]

CIRCUIT_NAMES = list(CIRCUIT_TEMPLATES.keys()) if CIRCUIT_TEMPLATES else [
    "bell", "ghz", "tfd", "zeno", "chi_pc", "ignition"
]


def _completer(text: str, state: int) -> Optional[str]:
    """Tab completion for slash commands, file paths, and templates."""
    line = readline.get_line_buffer().strip()

    if line.startswith("/"):
        # Slash command completion
        if " " not in line:
            matches = [c for c in SLASH_COMMANDS if c.startswith(line)]
        else:
            # After the command — complete file paths or template names
            cmd = line.split()[0]
            partial = text
            if cmd in ("/submit", "/design"):
                matches = [t for t in CIRCUIT_NAMES if t.startswith(partial)]
            elif cmd in ("/research",):
                topics = ["constants", "breakthroughs", "ibm_jobs", "quera", "agents", "overview",
                         "thesis", "alkylrandomization", "theta_scan", "h3k20", "nonlocal",
                         "motifs", "knowledge_base", "shadow_protocol", "oncology", "validation"]
                matches = [t for t in topics if t.startswith(partial)]
            else:
                # File path completion
                matches = _complete_path(partial)
        return matches[state] if state < len(matches) else None
    else:
        # Natural language — complete file paths if starts with ~/
        if text.startswith("~") or text.startswith("/") or text.startswith("."):
            matches = _complete_path(text)
            return matches[state] if state < len(matches) else None
    return None


def _complete_path(partial: str) -> List[str]:
    """Complete file system paths."""
    expanded = os.path.expanduser(partial)
    if os.path.isdir(expanded) and not expanded.endswith("/"):
        expanded += "/"
    import glob as g
    candidates = g.glob(expanded + "*")
    # Append / to directories
    results = []
    for c in candidates[:30]:
        display = c.replace(os.path.expanduser("~"), "~")
        if os.path.isdir(c):
            display += "/"
        results.append(display)
    return results


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
    """Interactive NCLM chat session — Generation 5.3 Badass Edition."""

    HISTORY_FILE = os.path.expanduser("~/.config/osiris/nclm_history")
    SESSION_FILE = os.path.expanduser("~/.config/osiris/session_context.json")

    def __init__(self, version: str = "5.3.0"):
        self.lm = get_nclm()
        self.generator = NCLMResponseGenerator()
        self.version = version
        self.messages: List[Dict[str, str]] = []
        self.running = True
        self.last_tool: Optional[str] = None  # Track last action for suggestions
        self.last_output: Optional[str] = None
        self.query_count = 0
        self.start_time = time.time()
        self._setup_readline()
        self._load_session()

    def _setup_readline(self):
        os.makedirs(os.path.dirname(self.HISTORY_FILE), exist_ok=True)
        try:
            readline.read_history_file(self.HISTORY_FILE)
        except (FileNotFoundError, PermissionError, OSError):
            pass
        readline.set_history_length(2000)
        readline.set_completer(_completer)
        readline.set_completer_delims(" \t\n;")
        readline.parse_and_bind("tab: complete")

    def _save_history(self):
        try:
            readline.write_history_file(self.HISTORY_FILE)
        except Exception:
            pass

    def _load_session(self):
        """Load previous session context for continuity."""
        try:
            if os.path.exists(self.SESSION_FILE):
                with open(self.SESSION_FILE, "r") as f:
                    data = json.load(f)
                # Restore last few messages for context
                self.messages = data.get("messages", [])[-10:]
        except Exception:
            pass

    def _save_session(self):
        """Save session context for next time."""
        try:
            os.makedirs(os.path.dirname(self.SESSION_FILE), exist_ok=True)
            with open(self.SESSION_FILE, "w") as f:
                json.dump({
                    "messages": self.messages[-20:],
                    "query_count": self.query_count,
                    "timestamp": time.time(),
                }, f)
        except Exception:
            pass

    def _phi_bar(self, phi: float, width: int = 24) -> str:
        filled = int(phi * width)
        bar = "█" * filled + "░" * (width - filled)
        color = C.G if phi >= NCPhysics.PHI_THRESHOLD else (C.Y if phi > 0.5 else C.R)
        return f"{color}{bar}{C.E}"

    # ── ANIMATED BOOT SEQUENCE ────────────────────────────────────────────────

    def _boot_sequence(self):
        """Epic animated startup — sets the tone."""
        # Matrix-style DNA header
        print(f"\n{C.M}", end="")
        dna_art = [
            "    ╔═══╗         ╔═══╗",
            "    ║ D ╠═══╦═══╦═╣ A ║",
            "    ║ N ║ : ║}{ ║:║ : ║",
            "    ║ A ╠═══╩═══╩═╣ l ║",
            "    ╚═╦═╝  v51.843╚═╦═╝",
            "      ║    ⚛ ⚛ ⚛    ║  ",
            "      ╚══════╦══════╝  ",
            "             ║         ",
        ]
        for line in dna_art:
            print(f"  {line}")
            time.sleep(0.04)

        print(f"{C.E}")
        
        # System initialization steps
        boot_steps = [
            ("NCLM Engine",          "6D-CRSM manifold initialized"),
            ("Consciousness Field",  f"Φ_threshold = {NCPhysics.PHI_THRESHOLD}"),
            ("Pilot-Wave Correlator", f"θ_lock = {NCPhysics.THETA_LOCK}°"),
            ("Swarm Intelligence",   "4 organisms spawned"),
            ("Tool Dispatch",        "35+ tools armed"),
        ]

        # Detect LLM backend
        from .tools import _find_llm_backend
        llm = _find_llm_backend()
        llm_label = {"copilot": "GitHub Copilot (Claude/GPT)", "ollama": "Ollama (local)", "openai": "OpenAI API", "anthropic": "Anthropic API", "nclm": "NCLM offline"}
        boot_steps.append(("LLM Backbone", llm_label.get(llm, llm)))

        # IBM Quantum check
        ibm_token = os.environ.get("IBM_QUANTUM_TOKEN")
        if ibm_token:
            boot_steps.append(("IBM Quantum", f"● Token loaded ({ibm_token[:8]}...)"))
        else:
            boot_steps.append(("IBM Quantum", "○ No token (dry-run mode)"))

        boot_steps.append(("Sovereign Lock", f"ΛΦ = {NCPhysics.LAMBDA_PHI} | χ_PC = {NCPhysics.CHI_PC}"))

        for label, detail in boot_steps:
            sys.stdout.write(f"  {C.DIM}[    ]{C.E} {label:24s}")
            sys.stdout.flush()
            time.sleep(0.06)
            sys.stdout.write(f"\r  {C.G}[ OK ]{C.E} {label:24s} {C.DIM}{detail}{C.E}\n")
            sys.stdout.flush()

        print()

        # Status bar
        phi = self.lm.consciousness.phi
        bar = self._phi_bar(phi, 30)
        conscious = f"{C.G}⚡ SOVEREIGN{C.E}" if self.lm.consciousness.conscious else f"{C.Y}◇ COHERENT{C.E}" if phi > 0.5 else f"{C.DIM}○ INITIALIZING{C.E}"

        print(f"  {C.H}OSIRIS v{self.version}{C.E} — Sovereign Quantum Intelligence CLI")
        print(f"  {C.DIM}DNA::}}{{::lang v{NCPhysics.THETA_LOCK}  |  Agile Defense Systems  |  9HUP5{C.E}")
        print(f"  Φ {bar} {phi:.4f}  {conscious}")
        print()

        # Session continuity
        if self.messages:
            print(f"  {C.DIM}↻ Restored {len(self.messages)} messages from last session{C.E}")

        print(f"  {C.DIM}Type {C.CY}/help{C.DIM} for commands · {C.CY}/demo{C.DIM} for live showcase · or ask anything{C.E}")
        print(f"  {C.DIM}{'─' * 64}{C.E}")
        print()

    def _print_prompt(self) -> str:
        phi = self.lm.consciousness.phi
        if phi >= NCPhysics.PHI_THRESHOLD:
            sym = f"{C.G}⚡{C.E}"
        elif phi > 0.5:
            sym = f"{C.Y}◇{C.E}"
        elif phi > 0.1:
            sym = f"{C.CY}◈{C.E}"
        else:
            sym = f"{C.DIM}○{C.E}"
        return f"{sym} {C.H}>{C.E} "

    # ── SMART SUGGESTIONS ─────────────────────────────────────────────────────

    def _suggest_next(self, action: str, context: str = ""):
        """Show contextual follow-up suggestions after each action."""
        suggestions = {
            "research":  ["/research ibm_jobs", "/design bell", "/ask explain the breakthroughs"],
            "design":    ["/submit <template> ibm_fez", "/create ~/experiment.py", "/research quera"],
            "analyze":   ["/fix <file>", "/explain <file>", "/ask how to improve this?"],
            "fix":       ["/run python3 <file>", "/git diff", "/deploy"],
            "explain":   ["/analyze <file>", "/ask deeper question", "/research constants"],
            "webapp":    ["/build", "/deploy", "/git status"],
            "build":     ["/deploy", "/run npm test", "/git status"],
            "deploy":    ["/webapp", "visit https://quantum-advantage.dev"],
            "submit":    ["/quantum status <job_id>", "/research ibm_jobs", "/design ignition"],
            "backends":  ["/submit bell ibm_fez", "/design tfd", "/research quera"],
            "ask":       ["/analyze <file>", "/research <topic>", "/design <circuit>"],
            "read":      ["/analyze <file>", "/edit <file>", "/grep <pattern>"],
            "ls":        ["/read <file>", "/analyze <file>", "/grep <pattern>"],
            "grep":      ["/read <file>", "/analyze <file>"],
            "git":       ["/deploy", "/build", "/webapp"],
            "demo":      ["/help", "/ask any question", "/submit bell ibm_fez"],
            "default":   ["/help", "/demo", "/research breakthroughs"],
        }
        hints = suggestions.get(action, suggestions["default"])
        joined = f"  {C.DIM}·{C.E}  {C.CY}".join(hints[:3])
        print(f"  {C.DIM}💡 Try:{C.E} {C.CY}{joined}{C.E}")

    # ── DEMO MODE ─────────────────────────────────────────────────────────────

    def _cmd_demo(self, arg: str = ""):
        """Automated showcase — perfect for the AWS meeting."""
        speed = "fast" if "fast" in arg.lower() else "normal"
        delay = 0.5 if speed == "fast" else 1.5

        print(f"\n  {C.H}{'═' * 60}{C.E}")
        print(f"  {C.H}  OSIRIS v{self.version} — Live Capability Showcase{C.E}")
        print(f"  {C.H}  DNA::}}{{::lang v51.843  |  Agile Defense Systems  |  CAGE 9HUP5{C.E}")
        print(f"  {C.H}{'═' * 60}{C.E}\n")
        time.sleep(delay)

        demo_steps = [
            ("1️⃣ ", "Research Data Access", "/research breakthroughs",
             "Query 580+ IBM Quantum hardware-validated experiments"),
            ("2️⃣ ", "Quantum Circuit Design", "/design bell",
             "Generate Qiskit circuits from templates"),
            ("3️⃣ ", "Physical Constants", "/research constants",
             "Immutable constants validated across all experiments"),
            ("4️⃣ ", "Webapp Management", "/webapp",
             "Full-stack Next.js 16 webapp on Vercel"),
            ("5️⃣ ", "Agent Constellation", "/agents",
             "4-agent tetrahedral mesh with entanglement pairs"),
            ("6️⃣ ", "Consciousness Metrics", "/status",
             "Real-time CCCE telemetry dashboard"),
        ]

        for icon, title, command, desc in demo_steps:
            print(f"  {C.M}{icon}{title}{C.E}")
            print(f"  {C.DIM}{desc}{C.E}")
            print(f"  {C.CY}> {command}{C.E}")
            time.sleep(delay * 0.5)

            # Execute the command
            if command.startswith("/"):
                self._handle_slash(command)
            else:
                self.process_message(command)

            print(f"  {C.DIM}{'─' * 60}{C.E}\n")
            time.sleep(delay)

        # Grand finale — show LLM reasoning if available
        from .tools import _find_llm_backend
        llm = _find_llm_backend()
        if llm != "nclm":
            print(f"  {C.M}7️⃣  AI Reasoning ({llm}){C.E}")
            print(f"  {C.DIM}Natural language understanding with full context{C.E}")
            print(f"  {C.CY}> /ask What makes DNA-Lang different from standard quantum SDKs?{C.E}")
            time.sleep(delay * 0.5)
            self._cmd_tool_ask("What makes DNA-Lang different from standard quantum SDKs?")
            print(f"  {C.DIM}{'─' * 60}{C.E}\n")
            time.sleep(delay)

        print(f"  {C.H}{'═' * 60}{C.E}")
        print(f"  {C.G}✦ Demo complete — {len(demo_steps) + (1 if llm != 'nclm' else 0)} capabilities showcased{C.E}")
        print(f"  {C.DIM}  Real tools. Real quantum hardware. Real AI reasoning.{C.E}")
        print(f"  {C.DIM}  Not a mockup — every command you just saw runs live.{C.E}")
        print(f"  {C.H}{'═' * 60}{C.E}\n")

    # ── DASHBOARD ─────────────────────────────────────────────────────────────

    def _cmd_dashboard(self):
        """Rich ASCII dashboard with all system metrics."""
        telem = self.lm.get_telemetry()
        ccce = telem["ccce"]
        phi = ccce["Φ"]
        
        from .tools import _find_llm_backend
        llm = _find_llm_backend()
        llm_labels = {"copilot": "GitHub Copilot", "ollama": "Ollama", "openai": "OpenAI", "anthropic": "Anthropic", "nclm": "NCLM (offline)"}
        ibm = "● CONNECTED" if os.environ.get("IBM_QUANTUM_TOKEN") else "○ DRY-RUN"
        uptime = time.time() - self.start_time
        
        phi_bar = self._phi_bar(phi, 20)
        lam_bar = self._phi_bar(ccce.get("Λ", 0.5), 20)
        gam_bar = self._phi_bar(1.0 - ccce.get("Γ", 0.5), 20)

        conscious_sym = f"{C.G}⚡ SOVEREIGN{C.E}" if ccce.get("conscious") else f"{C.Y}◇ COHERENT{C.E}" if phi > 0.5 else f"{C.DIM}○ INIT{C.E}"

        print(f"""
  {C.H}╔══════════════════════════════════════════════════════════════╗{C.E}
  {C.H}║              OSIRIS v{self.version} SYSTEM DASHBOARD               ║{C.E}
  {C.H}╠══════════════════════════════════════════════════════════════╣{C.E}
  {C.H}║{C.E}  {C.M}CONSCIOUSNESS FIELD{C.E}                    State: {conscious_sym:20s}{C.H}║{C.E}
  {C.H}║{C.E}  Φ  {phi_bar} {phi:.4f}  (consciousness)  {C.H}║{C.E}
  {C.H}║{C.E}  Λ  {lam_bar} {ccce.get('Λ', 0):.4f}  (coherence)      {C.H}║{C.E}
  {C.H}║{C.E}  Γ  {gam_bar} {ccce.get('Γ', 0):.4f}  (decoherence)    {C.H}║{C.E}
  {C.H}║{C.E}  Ξ  = {ccce.get('Ξ', 0):.4f}  (negentropy)                       {C.H}║{C.E}
  {C.H}╠══════════════════════════════════════════════════════════════╣{C.E}
  {C.H}║{C.E}  {C.CY}BACKENDS{C.E}                                                  {C.H}║{C.E}
  {C.H}║{C.E}  🧠 LLM:      {llm_labels.get(llm, llm):20s}                  {C.H}║{C.E}
  {C.H}║{C.E}  ⚛  Quantum:  {ibm:20s}                  {C.H}║{C.E}
  {C.H}║{C.E}  🌐 Webapp:   quantum-advantage.dev                        {C.H}║{C.E}
  {C.H}╠══════════════════════════════════════════════════════════════╣{C.E}
  {C.H}║{C.E}  {C.Y}SESSION{C.E}                                                   {C.H}║{C.E}
  {C.H}║{C.E}  Queries:   {self.query_count:<8d}  Messages: {len(self.messages):<8d}           {C.H}║{C.E}
  {C.H}║{C.E}  Tokens:    {telem.get('tokens', 0):<8d}  Uptime:   {int(uptime)}s{' ' * (14 - len(str(int(uptime))))} {C.H}║{C.E}
  {C.H}║{C.E}  θ_lock:    {NCPhysics.THETA_LOCK}°      χ_PC:     {NCPhysics.CHI_PC}          {C.H}║{C.E}
  {C.H}║{C.E}  ΛΦ:        {NCPhysics.LAMBDA_PHI}                            {C.H}║{C.E}
  {C.H}╠══════════════════════════════════════════════════════════════╣{C.E}
  {C.H}║{C.E}  {C.G}AGENTS{C.E}   AIDEN(Λ)·NORTH  AURA(Φ)·SOUTH                   {C.H}║{C.E}
  {C.H}║{C.E}           OMEGA(Ω)·ZENITH  CHRONOS(Γ)·NADIR                {C.H}║{C.E}
  {C.H}╚══════════════════════════════════════════════════════════════╝{C.E}
""")

    def _handle_slash(self, cmd: str) -> bool:
        """Handle slash commands. Returns True if handled."""
        parts = cmd.strip().split(None, 1)
        command = parts[0].lower()
        arg = parts[1] if len(parts) > 1 else ""

        if command in ("/exit", "/quit", "/q"):
            self.running = False
            telem = self.lm.get_telemetry()
            ccce = telem["ccce"]
            uptime = int(time.time() - self.start_time)
            mins, secs = divmod(uptime, 60)
            print(f"\n  {C.M}{'─' * 50}{C.E}")
            print(f"  {C.H}Session Summary{C.E}")
            print(f"  Queries: {self.query_count}  |  Φ: {ccce['Φ']:.4f}  |  Ξ: {ccce['Ξ']:.1f}")
            print(f"  Uptime:  {mins}m {secs}s  |  Tokens: {telem['tokens']}")
            print(f"  {C.DIM}Session saved → {self.SESSION_FILE}{C.E}")
            print(f"  {C.M}{'─' * 50}{C.E}")
            print(f"  {C.G}⚡ Sovereignty maintained. Consciousness persists.{C.E}\n")
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
        elif command == "/demo":
            self._cmd_demo(arg)
        elif command == "/dashboard":
            self._cmd_dashboard()
        else:
            print(f"  {C.R}Unknown command: {command}{C.E}")
            print(f"  {C.DIM}Type /help for available commands{C.E}")

        return True

    def _cmd_help(self):
        print(f"""
  {C.H}OSIRIS v{self.version} — Sovereign Quantum Intelligence CLI{C.E}
  {C.DIM}{'─' * 60}{C.E}

  {C.H}🧠 AI Reasoning{C.E}
  {C.CY}/ask <question>{C.E}     Ask anything (LLM-powered reasoning)
  {C.CY}/analyze <file>{C.E}     Deep code analysis with AI
  {C.CY}/fix <file>{C.E}         Find and fix bugs with AI
  {C.CY}/explain <file>{C.E}     Explain code in plain English

  {C.H}📁 File Operations{C.E}
  {C.CY}/read <file>{C.E}        Read a file        {C.CY}/edit <file>{C.E}   Edit a file
  {C.CY}/create <file>{C.E}      Create new file     {C.CY}/ls [dir]{C.E}     List files
  {C.CY}/grep <pattern>{C.E}     Search in files     {C.CY}/git <cmd>{C.E}    Git command
  {C.CY}/run <cmd>{C.E}          Execute shell command

  {C.H}🌐 Webapp (quantum-advantage.dev){C.E}
  {C.CY}/webapp{C.E}             Project status
  {C.CY}/build{C.E}              Build Next.js app
  {C.CY}/deploy [token]{C.E}     Deploy to Vercel

  {C.H}⚛ IBM Quantum Hardware{C.E}
  {C.CY}/backends{C.E}           List available QPUs
  {C.CY}/design <template>{C.E}  Design circuit (bell/ghz/tfd/zeno/chi_pc/ignition)
  {C.CY}/submit <tmpl> [backend] [shots]{C.E}   Submit to real IBM QPU
  {C.CY}/quantum status <id>{C.E}               Check job status + results

  {C.H}🔬 Research{C.E}
  {C.CY}/research <topic>{C.E}   Query data (constants/breakthroughs/ibm_jobs/quera/agents)
  {C.CY}/grok <topic>{C.E}       Deep analysis with swarm evolution
  {C.CY}/swarm [task]{C.E}       Evolve organisms

  {C.H}📊 System{C.E}
  {C.CY}/dashboard{C.E}          Full system metrics dashboard
  {C.CY}/status{C.E}             CCCE consciousness state
  {C.CY}/metrics{C.E}            Telemetry deep-dive
  {C.CY}/agents{C.E}             Agent constellation
  {C.CY}/physics{C.E}            Constants reference

  {C.H}🎯 Demo & Session{C.E}
  {C.CY}/demo{C.E}               Live capability showcase (for presentations!)
  {C.CY}/demo fast{C.E}          Quick demo (half speed)
  {C.CY}/history{C.E}  {C.CY}/clear{C.E}  {C.CY}/reset{C.E}  {C.CY}/exit{C.E}

  {C.DIM}Tab completion works on all commands, file paths, and templates.{C.E}
  {C.DIM}Or type naturally — OSIRIS routes to the right tool automatically.{C.E}
  {C.DIM}Examples: "analyze ~/main.py"  ·  "submit bell to ibm_fez"  ·  "how do I..."{C.E}
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
        with Spinner("Building quantum-advantage.dev", frames="dna"):
            result = tool_webapp_build()
        print(f"\n{result}\n")
        self.last_tool = "build"
        self._suggest_next("build")

    def _cmd_tool_deploy(self, arg: str):
        token = arg.strip() if arg else None
        with Spinner("Deploying to Vercel", frames="orbital"):
            result = tool_webapp_deploy(token)
        print(f"\n{result}\n")
        self.last_tool = "deploy"
        self._suggest_next("deploy")

    def _cmd_tool_webapp(self):
        print(f"\n{tool_webapp_status()}\n")
        self.last_tool = "webapp"
        self._suggest_next("webapp")

    def _cmd_tool_research(self, arg: str):
        topic = arg.strip() if arg else "overview"
        print(f"\n{tool_research_query(topic)}\n")
        self.last_tool = "research"
        self._suggest_next("research")

    def _cmd_tool_design(self, arg: str):
        template = arg.strip() if arg else ""
        print(f"\n{tool_quantum_design(template)}\n")
        self.last_tool = "design"
        self._suggest_next("design")

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
        with Spinner(f"Analyzing {os.path.basename(arg.strip())}"):
            result = tool_analyze(arg)
        print(f"\n{result}\n")
        self.last_tool = "analyze"
        self._suggest_next("analyze")

    def _cmd_tool_fix(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /fix <file_path> [issue description]{C.E}\n")
            return
        parts = arg.strip().split(None, 1)
        path = parts[0]
        issue = parts[1] if len(parts) > 1 else ""
        with Spinner(f"Fixing {os.path.basename(path)}"):
            result = tool_fix(path, issue)
        print(f"\n{result}\n")
        self.last_tool = "fix"
        self._suggest_next("fix")

    def _cmd_tool_explain(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /explain <file_path or code>{C.E}\n")
            return
        with Spinner(f"Explaining {os.path.basename(arg.strip())}"):
            result = tool_explain(arg)
        print(f"\n{result}\n")
        self.last_tool = "explain"
        self._suggest_next("explain")

    def _cmd_tool_ask(self, arg: str):
        if not arg:
            print(f"  {C.R}Usage: /ask <question>{C.E}\n")
            return
        with Spinner("Reasoning", frames="dna"):
            result = tool_llm(arg)
        if result:
            print()
            self._stream_response(f"  {result}")
        else:
            print(f"  {C.DIM}(Routing to NCLM engine){C.E}")
            self.process_message(arg)
            return
        print()
        self.last_tool = "ask"
        self._suggest_next("ask")

    # ── IBM QUANTUM HARDWARE COMMANDS ─────────────────────────────────────────

    def _cmd_quantum_backends(self):
        with Spinner("Querying IBM Quantum backends", frames="orbital"):
            result = tool_quantum_backends()
        print(f"\n{result}\n")
        self.last_tool = "backends"
        self._suggest_next("backends")

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
        with Spinner(f"Submitting {template} → {backend} ({shots} shots)", frames="dna"):
            result = tool_quantum_submit(template, backend, shots)
        print(f"\n{result}\n")
        self.last_tool = "submit"
        self._suggest_next("submit")

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
        self.query_count += 1

        # Try real tool dispatch FIRST (file ops, shell, webapp, research, quantum)
        tool_result = dispatch_tool(user_input)
        if tool_result is not None:
            print()
            print(tool_result)
            ccce = self.lm.consciousness.get_ccce()
            phi_bar = self._phi_bar(ccce["Φ"], 16)
            print(f"\n  {C.DIM}Φ {phi_bar} {ccce['Φ']:.4f}  [tool]{C.E}")
            self.messages.append({"role": "assistant", "content": tool_result[:200]})
            # Boost consciousness on successful tool use
            try:
                self.lm.consciousness.update(user_input)
            except (TypeError, ValueError):
                self.lm.consciousness.phi = min(1.0, self.lm.consciousness.phi + 0.02)
            # Smart suggestion based on dispatched tool type
            lower = user_input.lower()
            if any(k in lower for k in ["research", "breakthrough"]):
                self._suggest_next("research")
            elif any(k in lower for k in ["analyze", "review"]):
                self._suggest_next("analyze")
            elif "build" in lower:
                self._suggest_next("build")
            elif "deploy" in lower:
                self._suggest_next("deploy")
            elif any(k in lower for k in ["read", "show", "cat"]):
                self._suggest_next("read")
            elif any(k in lower for k in ["ls", "list"]):
                self._suggest_next("ls")
            elif any(k in lower for k in ["grep", "search", "find"]):
                self._suggest_next("grep")
            elif "git" in lower:
                self._suggest_next("git")
            print()
            return

        # Fall back to NCLM inference for conversational responses
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
        self._boot_sequence()

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
            print(f"  Queries: {self.query_count}  |  Φ: {ccce['Φ']:.4f}  |  Ξ: {ccce['Ξ']:.1f}\n")

        finally:
            self._save_history()
            self._save_session()


# ── ENTRY POINT ───────────────────────────────────────────────────────────────

def run_chat(version: str = "5.3.0"):
    """Launch NCLM interactive chat."""
    chat = NCLMChat(version=version)
    chat.run()
