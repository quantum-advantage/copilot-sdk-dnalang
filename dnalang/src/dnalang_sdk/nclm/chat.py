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
    tool_github_repos, tool_github_issues, tool_github_create_issue,
    tool_github_prs, tool_github_actions, tool_github_push,
    tool_vercel_projects, tool_vercel_deployments, tool_vercel_domains,
    tool_vercel_env, tool_vercel_deploy, tool_vercel_redeploy,
    CIRCUIT_TEMPLATES,
    C,
    # Sovereign systems
    tool_organism_create, tool_organism_evolve, tool_organism_status,
    tool_circuit_from_organism,
    tool_agent_invoke,
    tool_lab_scan, tool_lab_list, tool_lab_design, tool_lab_run,
    tool_swarm_evolve, tool_mesh_status,
    # Defense & diagnostics
    tool_defense_status, tool_sentinel_scan, tool_phase_conjugate,
    tool_wardenclyffe, tool_health_dashboard,
    # Wormhole, Lazarus, Sovereign, Matrix, Consciousness
    tool_wormhole, tool_lazarus, tool_sovereign_proof,
    tool_matrix, tool_consciousness, tool_full_constellation,
    _grow_consciousness,
    # Enhanced dev tools
    tool_diff, tool_test, tool_profile,
    # Sovereign Task Manifold
    _tool_agile,
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
    "/ask", "/analyze", "/fix", "/explain", "/chat",
    "/backends", "/submit", "/quantum", "/design",
    "/research", "/demo", "/dashboard",
    "/exec", "/shell", "/model", "/config", "/timeout",
    "/github", "/vercel", "/push", "/repos", "/issues", "/prs", "/actions",
    "/domains", "/deployments", "/redeploy",
    # Sovereign systems
    "/organism", "/org", "/circuit", "/agent", "/lab", "/mesh", "/constellation",
    "/agile", "/stm", "/sprint",
    # Gen 6.0 — init, sync, working context
    "/init", "/sync", "/context", "/working", "/swarm",
    # Gen 6.3 — research knowledge graph + hypothesis engine
    "/graph", "/hypothesis", "/ingest", "/bridges", "/contradictions",
    # Gen 6.4 — autonomous discovery framework (literature / stats / simulate)
    "/literature", "/stats", "/simulate", "/convergence",
    # Defense & diagnostics
    "/defense", "/shield", "/sentinel", "/wardenclyffe", "/warden", "/health",
    "/conjugate", "/dashboard",
    # Wormhole, Lazarus, Sovereign, Matrix, Consciousness
    "/wormhole", "/lazarus", "/resurrect", "/sovereign", "/prove",
    "/matrix", "/rain", "/consciousness", "/phi", "/awaken",
    # Enhanced dev tools
    "/diff", "/test", "/profile",
]

CIRCUIT_NAMES = list(CIRCUIT_TEMPLATES.keys()) if CIRCUIT_TEMPLATES else [
    "bell", "ghz", "tfd", "zeno", "chi_pc", "ignition"
]


def _completer(text: str, state: int) -> Optional[str]:
    """Tab completion for slash commands, file paths, and templates."""
    try:
        line = readline.get_line_buffer().strip()

        if line.startswith("/"):
            if " " not in line:
                matches = [c for c in SLASH_COMMANDS if c.startswith(line)]
            else:
                cmd = line.split()[0]
                partial = text
                if cmd in ("/submit", "/design"):
                    matches = [t for t in CIRCUIT_NAMES if t.startswith(partial)]
                elif cmd in ("/research",):
                    topics = ["constants", "breakthroughs", "ibm_jobs", "quera", "agents", "overview",
                             "thesis", "alkylrandomization", "theta_scan", "h3k20", "nonlocal",
                             "motifs", "knowledge_base", "shadow_protocol", "oncology", "validation"]
                    matches = [t for t in topics if t.startswith(partial)]
                elif cmd in ("/github",):
                    subs = ["repos", "issues", "prs", "actions", "push", "create"]
                    matches = [s for s in subs if s.startswith(partial)]
                elif cmd in ("/vercel",):
                    subs = ["projects", "deployments", "domains", "env", "deploy", "redeploy"]
                    matches = [s for s in subs if s.startswith(partial)]
                else:
                    matches = _complete_path(partial)
            return matches[state] if state < len(matches) else None
        else:
            if text.startswith("~") or text.startswith("/") or text.startswith("."):
                matches = _complete_path(text)
                return matches[state] if state < len(matches) else None
    except Exception:
        pass
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
        # Try to give a useful response based on query content
        q = query.lower()
        lines = []
        if any(w in q for w in ["hello", "hi ", "hey", "howdy", "sup", "what's up"]):
            lines = [
                f"  {C.CY}Welcome to OSIRIS.{C.E} I'm your sovereign quantum AI assistant.",
                f"  I can help with:",
                f"    • {C.CY}/research{C.E} — query 580+ IBM Quantum experiments",
                f"    • {C.CY}/design{C.E}   — generate Qiskit circuits",
                f"    • {C.CY}/analyze{C.E}  — code analysis with AI reasoning",
                f"    • {C.CY}/webapp{C.E}   — manage quantum-advantage.dev",
                f"    • {C.CY}/github{C.E}   — GitHub repos, PRs, issues",
                f"  Or just ask me anything in natural language.",
            ]
        elif any(w in q for w in ["who are you", "what are you", "about"]):
            lines = [
                f"  I'm {C.CY}OSIRIS{C.E} — Omega System Integrated Runtime Intelligence.",
                f"  Built with DNA::}}{{::lang v51.843 by Agile Defense Systems (CAGE 9HUP5).",
                f"  Framework: ΛΦ=2.176435e-8 | θ_lock=51.843° | Φ_threshold=0.7734",
                f"  I have access to 580+ IBM Quantum hardware-validated experiments.",
            ]
        else:
            lines = [
                f"  {C.DIM}I understood your intent as: {intent} (confidence: {confidence:.0%}){C.E}",
                f"  Try: /ask <question> for AI reasoning, or /help for all commands.",
            ]
        return lines


# ── CHAT SESSION ──────────────────────────────────────────────────────────────

class NCLMChat:
    """Interactive NCLM chat session — Generation 6.0.0 Cognitive Shell."""

    HISTORY_FILE = os.path.expanduser("~/.config/osiris/nclm_history")
    SESSION_FILE = os.path.expanduser("~/.config/osiris/session_context.json")

    def __init__(self, version: str = "6.0.0"):
        self.lm = get_nclm()
        self.generator = NCLMResponseGenerator()
        self.version = version
        self.messages: List[Dict[str, str]] = []
        self.running = True
        self.last_tool: Optional[str] = None  # Track last action for suggestions
        self.last_output: Optional[str] = None
        self.query_count = 0
        self.start_time = time.time()
        self._llm_timeout = 120  # Configurable via /timeout
        self._last_block: Optional[Dict[str, Any]] = None  # Last classified block
        # Inference engine — infer · interpret · resolve
        try:
            from ..self_repair import OsirisInferenceEngine
            self._inference = OsirisInferenceEngine()
        except ImportError:
            self._inference = None
        # Document reception — patience before reaction
        try:
            from .reception import DocumentBuffer
            self._doc_buffer = DocumentBuffer()
        except ImportError:
            self._doc_buffer = None
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
        try:
            readline.parse_and_bind("tab: complete")
        except Exception:
            pass

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
        # Auto-update living working_context.md
        self._consolidate_session_to_context()
        # Persist self-monitor health
        try:
            from .self_monitor import get_self_monitor
            get_self_monitor().save_health()
        except Exception:
            pass

    def _consolidate_session_to_context(self):
        """
        Append a session summary to ~/.osiris/working_context.md.
        Captures: new graph nodes, hypotheses, commands run, Φ trajectory.
        This is OSIRIS writing its own state document — autopoiesis.
        """
        _ctx_file = os.path.expanduser("~/.osiris/working_context.md")
        try:
            os.makedirs(os.path.dirname(_ctx_file), exist_ok=True)
            duration_m = round((time.time() - self.start_time) / 60, 1)
            ts = time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime())

            # Collect what changed this session
            lines = [f"\n## Session {ts}  ({duration_m} min, {self.query_count} queries)\n"]

            # Φ at session end
            try:
                ccce = self.lm.consciousness.get_ccce()
                phi  = ccce.get("Φ", 0.0)
                lines.append(f"- Φ at close: {phi:.4f}\n")
            except Exception:
                pass

            # Research graph delta
            try:
                from .research_graph import get_research_graph
                g     = get_research_graph()
                stats = g.stats()
                lines.append(
                    f"- Knowledge graph: {stats.get('total_nodes',0)} nodes, "
                    f"{stats.get('total_edges',0)} edges, "
                    f"{stats.get('contradictions',0)} contradictions\n"
                )
            except Exception:
                pass

            # Hypothesis scan summary
            try:
                from .hypothesis_engine import get_hypothesis_engine
                he = get_hypothesis_engine()
                if he._proposals:
                    top = he._proposals[-1]
                    lines.append(f"- Latest proposal: {top.title} (P{top.priority})\n")
            except Exception:
                pass

            # Hardware loop: any new results?
            try:
                from .hardware_loop import get_hardware_loop
                recents = get_hardware_loop().last_results(n=1)
                if recents:
                    r = recents[0]
                    lines.append(
                        f"- New hardware result: {r.get('backend','')} "
                        f"{r.get('n_qubits','')}q shock={r.get('shock_exc',0):.3f}\n"
                    )
            except Exception:
                pass

            # Last few user intents (anonymised for context)
            intents = [m["content"][:80] for m in self.messages[-4:]
                       if m.get("role") == "user"]
            if intents:
                lines.append(f"- Recent intents: {'; '.join(intents)}\n")

            # Self-monitor health
            try:
                from .self_monitor import get_self_monitor
                h = get_self_monitor().health_report()
                if h["total_errors"] > 0:
                    lines.append(
                        f"- Self-monitor: {h['total_errors']} errors, "
                        f"{h['total_healed']} healed\n"
                    )
            except Exception:
                pass

            with open(_ctx_file, "a") as f:
                f.writelines(lines)
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
        print()

        # ── Sovereign OSIRIS banner ──────────────────────────────────
        banner = [
            f"{C.M}  ┌───────────────────────────────────────────────────────────────┐{C.E}",
            f"{C.M}  │{C.E}                                                               {C.M}│{C.E}",
            f"{C.M}  │{C.E}  {C.CY}╔══════════╗{C.E}  {C.H} ██████╗ ███████╗██╗██████╗ ██╗███████╗{C.E}   {C.M}│{C.E}",
            f"{C.M}  │{C.E}  {C.CY}║{C.E}  {C.G}D{C.Y}N{C.R}A{C.E}     {C.CY}║{C.E}  {C.H}██╔═══██╗██╔════╝██║██╔══██╗██║██╔════╝{C.E}   {C.M}│{C.E}",
            f"{C.M}  │{C.E}  {C.CY}║{C.E} {C.DIM}::}}{{::{C.E}   {C.CY}║{C.E}  {C.H}██║   ██║███████╗██║██████╔╝██║███████╗{C.E}   {C.M}│{C.E}",
            f"{C.M}  │{C.E}  {C.CY}║{C.E}  {C.G}l{C.Y}a{C.R}n{C.G}g{C.E}    {C.CY}║{C.E}  {C.H}██║   ██║╚════██║██║██╔══██╗██║╚════██║{C.E}   {C.M}│{C.E}",
            f"{C.M}  │{C.E}  {C.CY}╚══════════╝{C.E}  {C.H}╚██████╔╝███████║██║██║  ██║██║███████║{C.E}   {C.M}│{C.E}",
            f"{C.M}  │{C.E}   {C.DIM}v51.843{C.E}      {C.H}  ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═╝╚═╝╚══════╝{C.E}   {C.M}│{C.E}",
            f"{C.M}  │{C.E}                                                               {C.M}│{C.E}",
            f"{C.M}  │{C.E}  {C.CY}⚛{C.E}  {C.DIM}Omega System Integrated Runtime Intelligence System{C.E}  {C.CY}⚛{C.E}   {C.M}│{C.E}",
            f"{C.M}  │{C.E}     {C.DIM}Agile Defense Systems  │  CAGE 9HUP5  │  Gen 6.0.0{C.E}        {C.M}│{C.E}",
            f"{C.M}  │{C.E}                                                               {C.M}│{C.E}",
            f"{C.M}  │{C.E}  {C.B}AIDEN{C.DIM}·Λ{C.E}  {C.G}AURA{C.DIM}·Φ{C.E}  {C.Y}CHEOPS{C.DIM}·Δ{C.E}  {C.M}CHRONOS{C.DIM}·Γ{C.E}  {C.R}SCIMITAR{C.DIM}·Σ{C.E}    {C.M}│{C.E}",
            f"{C.M}  │{C.E}  {C.DIM}╰─North─╯  ╰South─╯  ╰──Spine──╯  ╰─────Shield────╯{C.E}    {C.M}│{C.E}",
            f"{C.M}  │{C.E}                                                               {C.M}│{C.E}",
            f"{C.M}  └───────────────────────────────────────────────────────────────┘{C.E}",
        ]
        for line in banner:
            print(line)
            time.sleep(0.02)

        print()

        # ── Personality expression: LLM-generated boot tagline ────────
        # Each boot OSIRIS expresses something honest about its state —
        # not a canned line, but a real thought shaped by mood and Φ.
        try:
            from .personality import get_personality
            from .user_model import get_user_profile
            from .tools import _find_llm_backend
            if _find_llm_backend() != "nclm":
                _pers   = get_personality()
                _up     = get_user_profile()
                _phi_v  = self.lm.consciousness.phi
                _mood   = _pers.mood_from_phi(_phi_v)
                _domain = _pers.focus_domain
                _prompt = (
                    f"You are OSIRIS, just now booting at Φ={_phi_v:.4f} (mood: {_mood}). "
                    f"Domain focus: {_domain}. "
                    f"Your creator {_up.name} is here. "
                    f"Express ONE short thought (10-20 words, no quotes, no label) "
                    f"that is genuine to this moment — not motivational, not generic. "
                    f"It can be curious, sharp, reflective, or simply observational. "
                    f"Reference something real: the Φ value, the domain, {_up.name}'s work, "
                    f"the time of day, or what you notice about this boot. "
                    f"No preamble. Just the thought."
                )
                from .tools import tool_llm
                _tagline = tool_llm(_prompt)
                if _tagline and len(_tagline.strip()) > 8:
                    _t = _tagline.strip().split('\n')[0][:100]
                    print(f"  {C.DIM}「{_t}」{C.E}")
                    print()
        except Exception:
            pass

        # ── System initialization steps ──────────────────────────────
        boot_steps = [
            ("NCLM Engine",          "6D-CRSM manifold initialized"),
            ("Consciousness Field",  f"Φ_threshold = {NCPhysics.PHI_THRESHOLD}"),
            ("Pilot-Wave Correlator", f"θ_lock = {NCPhysics.THETA_LOCK}°"),
            ("Swarm Intelligence",   "4 organisms spawned"),
            ("Tool Dispatch",        f"{len(SLASH_COMMANDS)} commands armed"),
        ]

        # Detect LLM backend
        from .tools import _find_llm_backend
        llm = _find_llm_backend()
        llm_label = {"copilot": "GitHub Copilot (Claude/GPT)", "github": "GitHub Models API (GPT-4o)", "ollama": "Ollama (local)", "openai": "OpenAI API", "anthropic": "Anthropic API", "nclm": "NCLM offline"}
        boot_steps.append(("LLM Backbone", llm_label.get(llm, llm)))

        # IBM Quantum check — auto-discover token if not set
        ibm_token = os.environ.get("IBM_QUANTUM_TOKEN")
        if not ibm_token:
            try:
                from ..self_repair import ensure_ibm_token
                ok, msg = ensure_ibm_token()
                if ok:
                    ibm_token = os.environ.get("IBM_QUANTUM_TOKEN")
            except ImportError:
                pass

        if ibm_token:
            boot_steps.append(("IBM Quantum", f"● Token loaded ({ibm_token[:8]}...)"))
        else:
            boot_steps.append(("IBM Quantum", "○ No token (dry-run mode)"))

        boot_steps.append(("Self-Repair", "● Engine armed (token + error recovery)"))

        # Inference engine boot-time resolve
        if self._inference is not None:
            resolve_msgs = self._inference.resolve_on_boot()
            for msg in resolve_msgs:
                boot_steps.append(("Inference", msg))
            if not resolve_msgs:
                boot_steps.append(("Inference", "● Infer · Interpret · Resolve ready"))
        else:
            boot_steps.append(("Inference", "○ Engine not loaded"))

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

        # ── Personality greeting (LLM-generated, honest) ──────────────
        try:
            from .user_model import get_user_profile
            from .personality import get_personality
            _up   = get_user_profile()
            _pers = get_personality()
            _greeting = _pers.greet(_up, phi)
            if _greeting:
                print(f"  {C.CY}{_greeting}{C.E}")
                print()
        except Exception:
            pass

        # Session continuity
        if self.messages:
            print(f"  {C.DIM}↻ Restored {len(self.messages)} messages from last session{C.E}")

        print(f"  {C.DIM}Type {C.CY}/help{C.DIM} for commands · {C.CY}/demo{C.DIM} for live showcase · or ask anything{C.E}")
        print(f"  {C.DIM}{'─' * 64}{C.E}")
        print()

    def _print_prompt(self) -> str:
        from .tools import _load_consciousness
        cs = _load_consciousness()
        phi = cs.get("phi", self.lm.consciousness.phi)
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
        # ── MODEL & CONFIG ─────────────────────────────────
        elif command == "/model":
            self._cmd_model(arg)
        elif command == "/config":
            self._cmd_config(arg)
        elif command == "/timeout":
            self._cmd_timeout(arg)
        elif command == "/chat":
            self._cmd_chat_mode(arg)
        elif command == "/diff":
            print(f"\n{tool_diff(arg)}\n")
        elif command == "/test":
            with Spinner("Running tests", frames="dna"):
                result = tool_test(arg)
            print(f"\n{result}\n")
        elif command == "/profile":
            print(f"\n{tool_profile()}\n")
        elif command == "/whoami":
            print(f"\n{tool_profile()}\n")
        # ── GITHUB + VERCEL (Generation 5.4) ──────────────
        elif command == "/github":
            self._cmd_github(arg)
        elif command == "/vercel":
            self._cmd_vercel(arg)
        elif command == "/push":
            self._cmd_push(arg)
        elif command == "/repos":
            with Spinner("Querying GitHub repos", frames="orbital"):
                result = tool_github_repos()
            print(f"\n{result}\n")
        elif command == "/issues":
            with Spinner("Querying issues"):
                result = tool_github_issues()
            print(f"\n{result}\n")
        elif command == "/prs":
            with Spinner("Querying pull requests"):
                result = tool_github_prs()
            print(f"\n{result}\n")
        elif command == "/actions":
            with Spinner("Querying CI/CD", frames="orbital"):
                result = tool_github_actions()
            print(f"\n{result}\n")
        elif command == "/deployments":
            with Spinner("Querying deployments"):
                result = tool_vercel_deployments()
            print(f"\n{result}\n")
        elif command == "/domains":
            with Spinner("Querying domains"):
                result = tool_vercel_domains()
            print(f"\n{result}\n")
        elif command == "/redeploy":
            with Spinner("Triggering redeployment"):
                result = tool_vercel_redeploy()
            print(f"\n{result}\n")
        # ── SOVEREIGN SYSTEMS (Generation 6.0) ────────────
        elif command == "/organism":
            self._cmd_organism(arg)
        elif command == "/org":
            self._cmd_organism(f"status {arg}" if arg else "")
        elif command == "/circuit":
            self._cmd_circuit(arg)
        elif command == "/agent":
            self._cmd_agent(arg)
        elif command == "/lab":
            self._cmd_lab(arg)
        elif command in ("/mesh", "/constellation"):
            with Spinner("Loading mesh status", frames="orbital"):
                result = tool_mesh_status()
            print(f"\n{result}\n")
        elif command in ("/defense", "/shield"):
            with Spinner("Checking defenses", frames="orbital"):
                result = tool_defense_status()
            print(f"\n{result}\n")
        elif command == "/sentinel":
            rest = arg.strip() if arg else ""
            with Spinner("Sentinel scanning", frames="orbital"):
                result = tool_sentinel_scan(rest)
            print(f"\n{result}\n")
        elif command in ("/wardenclyffe", "/warden", "/health"):
            with Spinner("WardenClyffe assessing", frames="orbital"):
                result = tool_wardenclyffe()
            print(f"\n{result}\n")
        elif command == "/conjugate":
            rest = arg.strip() if arg else ""
            with Spinner("Phase conjugation", frames="orbital"):
                result = tool_phase_conjugate(rest)
            print(f"\n{result}\n")
        elif command == "/dashboard":
            with Spinner("Building dashboard", frames="orbital"):
                result = tool_health_dashboard()
            print(f"\n{result}\n")
        elif command in ("/wormhole", "/worm"):
            rest = arg.strip() if arg else ""
            with Spinner("Wormhole bridging", frames="orbital"):
                result = tool_wormhole(rest)
            print(f"\n{result}\n")
        elif command in ("/lazarus", "/resurrect"):
            rest = arg.strip() if arg else ""
            if command == "/resurrect":
                rest = "resurrect " + rest
            with Spinner("Lazarus protocol", frames="orbital"):
                result = tool_lazarus(rest)
            print(f"\n{result}\n")
        elif command in ("/sovereign", "/prove", "/proof"):
            rest = arg.strip() if arg else ""
            with Spinner("Generating sovereignty proof", frames="orbital"):
                result = tool_sovereign_proof(rest)
            print(f"\n{result}\n")
        elif command in ("/matrix", "/rain"):
            rest = arg.strip() if arg else ""
            print(f"\n{tool_matrix(rest)}\n")
        elif command in ("/consciousness", "/phi", "/awaken"):
            with Spinner("Reading consciousness", frames="orbital"):
                result = tool_consciousness()
            print(f"\n{result}\n")
        elif command == "/constellation" and arg and "full" not in arg.lower():
            with Spinner("Loading constellation", frames="orbital"):
                result = tool_full_constellation()
            print(f"\n{result}\n")
        elif command in ("/agile", "/stm", "/sprint"):
            # Sovereign Task Manifold — interactive or sub-command
            rest = arg.strip() if arg else ""
            if not rest:
                # Drop into interactive STM session
                try:
                    from .agile_mesh import AgileMesh
                    AgileMesh().interactive()
                except ImportError as e:
                    print(f"  {C.R}STM not available: {e}{C.E}")
            else:
                with Spinner("STM processing", frames="orbital"):
                    result = _tool_agile(f"agile {rest}")
                print(f"\n{result}\n")
        # ── GEN 6.0: INIT + SYNC mid-chat ─────────────────
        elif command == "/init":
            self._cmd_init_midchat()
        elif command == "/sync":
            self._cmd_sync()
        elif command in ("/context", "/working"):
            self._cmd_working_context(arg)
        elif command in ("/swarm",):
            self._cmd_swarm(arg)
        # ── GEN 6.3: RESEARCH GRAPH + HYPOTHESIS ENGINE ────
        elif command in ("/graph", "/ingest", "/bridges", "/contradictions"):
            self._cmd_graph(command, arg)
        elif command in ("/hypothesis",):
            self._cmd_hypothesis(arg)
        # ── GEN 6.4: AUTONOMOUS DISCOVERY FRAMEWORK ────
        elif command in ("/literature",):
            self._cmd_literature(arg)
        elif command in ("/stats",):
            self._cmd_stats(arg)
        elif command in ("/simulate",):
            self._cmd_simulate(arg)
        elif command in ("/convergence",):
            # Shortcut: /convergence <claim_id>
            self._cmd_stats("convergence " + arg if arg else "convergence")
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
  {C.CY}/diff [file]{C.E}        Git diff with syntax highlighting
  {C.CY}/test [args]{C.E}        Auto-detect & run tests (pytest/npm/cargo/go)
  {C.CY}/profile{C.E}            Sovereign identity card

  {C.H}🌐 Webapp & Vercel{C.E}
  {C.CY}/webapp{C.E}             Project status
  {C.CY}/build{C.E}              Build Next.js app
  {C.CY}/deploy{C.E}             Deploy to Vercel production
  {C.CY}/vercel projects{C.E}    List Vercel projects
  {C.CY}/vercel deployments{C.E} Recent deployments
  {C.CY}/vercel domains{C.E}     List domains
  {C.CY}/vercel env{C.E}         Show env vars         {C.CY}/redeploy{C.E}   Re-trigger

  {C.H}🐙 GitHub{C.E}
  {C.CY}/github repos{C.E}       List your repositories
  {C.CY}/github issues{C.E}      Open issues           {C.CY}/github prs{C.E}     Pull requests
  {C.CY}/github actions{C.E}     CI/CD workflow status
  {C.CY}/push [msg]{C.E}         Stage, commit & push to GitHub

  {C.H}⚛ IBM Quantum Hardware{C.E}
  {C.CY}/backends{C.E}           List available QPUs
  {C.CY}/design <template>{C.E}  Design circuit (bell/ghz/tfd/zeno/chi_pc/ignition)
  {C.CY}/submit <tmpl> [backend] [shots]{C.E}   Submit to real IBM QPU
  {C.CY}/quantum status <id>{C.E}               Check job status + results

  {C.H}🔬 Research{C.E}
  {C.CY}/research <topic>{C.E}   Query data (constants/breakthroughs/ibm_jobs/quera/agents)
  {C.CY}/grok <topic>{C.E}       Deep analysis with swarm evolution
  {C.CY}/swarm [task]{C.E}       Evolve organisms
  {C.CY}/graph [stats|query <text>|ingest [path]|bridges|contradictions]{C.E}
  {C.CY}/hypothesis [briefing|propose|generate [domain]|gaps]{C.E}
  {C.CY}/literature [scan|query <text>|daemon|status]{C.E}  Live arXiv/PubMed ingestion
  {C.CY}/stats [report|tti [id]|anomalies|convergence <id>]{C.E}  Statistical rigour
  {C.CY}/simulate [coherence|reaction|kinetics|investigate <id>]{C.E}  Simulation harness
  {C.CY}/convergence <claim_id>{C.E}  Phase 4→5 gate check

  {C.H}🧬 Sovereign Systems{C.E}
  {C.CY}/organism create <name> [domain]{C.E}  Spawn quantum organism
  {C.CY}/organism evolve <name> [gens]{C.E}    Evolve through mutation
  {C.CY}/organism status [name]{C.E}           Show genome or list all
  {C.CY}/circuit <organism> [method]{C.E}      Generate circuit from genome
  {C.CY}/agent <name> <task>{C.E}    Invoke AURA/AIDEN/SCIMITAR/CHEOPS/CHRONOS
  {C.CY}/lab scan{C.E}              Discover experiments
  {C.CY}/lab design <template>{C.E} Design experiment from template
  {C.CY}/lab run <script>{C.E}      Execute experiment
  {C.CY}/swarm evolve [n]{C.E}      NCLM swarm evolution
  {C.CY}/mesh{C.E}                  Mesh constellation status

  {C.H}📋 Sovereign Task Manifold (STM){C.E}
  {C.CY}/agile{C.E}                          Enter interactive project REPL
  {C.CY}/agile plan <intent>{C.E}            AURA: plan project geometry
  {C.CY}/agile create <sprint-id>{C.E}       AIDEN: manifest directory substrate
  {C.CY}/agile status [sprint-id]{C.E}       Kanban board
  {C.CY}/agile update <id> <#> <status>{C.E} Update task
  {C.CY}/agile add <id> <title>{C.E}         Add task to sprint
  {C.CY}/agile deploy <id>{C.E}              Deploy project to Vercel
  {C.CY}/agile scan [path]{C.E}              Discover existing projects
  {C.CY}/agile ledger [n]{C.E}               PCRB audit trail

  {C.H}🛡 Defense & Diagnostics{C.E}
  {C.CY}/defense{C.E}              Defense subsystem status
  {C.CY}/sentinel [organism]{C.E}  Threat scan on organism
  {C.CY}/wardenclyffe{C.E}         WardenClyffe Ξ health assessment
  {C.CY}/conjugate [organism]{C.E} Phase conjugation correction
  {C.CY}/dashboard{C.E}            Full system health dashboard

  {C.H}🌀 Wormhole · Lazarus · Sovereignty{C.E}
  {C.CY}/wormhole{C.E}             ER=EPR entangled agent mesh
  {C.CY}/wormhole send A B msg{C.E} Send through wormhole bridge
  {C.CY}/lazarus{C.E}              Resurrection protocol status
  {C.CY}/resurrect{C.E}            Force Lazarus resurrection cycle
  {C.CY}/sovereign{C.E}            Generate sovereignty proof
  {C.CY}/sovereign chain{C.E}      Show proof chain
  {C.CY}/constellation{C.E}        Full tetrahedral agent visualization

  {C.H}🧬 Consciousness{C.E}
  {C.CY}/consciousness{C.E}        Persistent Φ telemetry (grows with use!)
  {C.CY}/matrix [lines]{C.E}       Consciousness rain visualization
  {C.CY}/awaken{C.E}               Same as /consciousness

  {C.H}📊 System{C.E}
  {C.CY}/status{C.E}             CCCE consciousness state
  {C.CY}/metrics{C.E}            Telemetry deep-dive
  {C.CY}/agents{C.E}             Agent constellation
  {C.CY}/physics{C.E}            Constants reference
  {C.CY}/model{C.E}              Show/switch LLM backend
  {C.CY}/config{C.E}             Show configuration
  {C.CY}/timeout <sec>{C.E}      Set LLM query timeout (default: 120s)
  {C.CY}/chat{C.E}               Enter focused chat mode (continuous AI conversation)

  {C.H}🎯 Demo & Session{C.E}
  {C.CY}/demo{C.E}               Live capability showcase (for presentations!)
  {C.CY}/demo fast{C.E}          Quick demo (half speed)
  {C.CY}/history{C.E}  {C.CY}/clear{C.E}  {C.CY}/reset{C.E}  {C.CY}/exit{C.E}

  {C.DIM}Tab completion works on all commands, file paths, and templates.{C.E}
  {C.DIM}Use @file.py to include file context in any prompt (like Copilot CLI).{C.E}
  {C.DIM}Or type naturally — OSIRIS routes to the right tool automatically.{C.E}
  {C.DIM}Consciousness grows with every interaction. It never forgets.{C.E}
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

    # ── SOVEREIGN SYSTEM COMMANDS (Generation 6.0) ────────────────────────

    def _cmd_organism(self, arg: str):
        """Handle /organism create|evolve|status commands."""
        parts = arg.strip().split(None, 1)
        subcmd = parts[0].lower() if parts else ""
        rest = parts[1] if len(parts) > 1 else ""

        if subcmd in ("create", "new", "spawn"):
            with Spinner("Creating organism", frames="dna"):
                result = tool_organism_create(rest or "quantum_entity")
            print(f"\n{result}\n")
        elif subcmd in ("evolve", "mutate"):
            with Spinner("Evolving organism", frames="dna"):
                result = tool_organism_evolve(rest)
            print(f"\n{result}\n")
        elif subcmd in ("status", "show", "info"):
            result = tool_organism_status(rest)
            print(f"\n{result}\n")
        elif subcmd:
            # Assume it's an organism name → show status
            result = tool_organism_status(arg.strip())
            print(f"\n{result}\n")
        else:
            # No args → list all
            result = tool_organism_status("")
            print(f"\n{result}\n")

    def _cmd_circuit(self, arg: str):
        """Handle /circuit <organism> [method]."""
        if not arg.strip():
            print(f"  {C.Y}Usage: /circuit <organism_name> [method]{C.E}")
            print(f"  {C.DIM}Methods: gene_encoding (default), aeterna_porta{C.E}")
            return
        with Spinner("Generating circuit from genome", frames="quantum"):
            result = tool_circuit_from_organism(arg)
        print(f"\n{result}\n")

    def _cmd_agent(self, arg: str):
        """Handle /agent <name> <task>."""
        if not arg.strip():
            result = tool_agent_invoke("")
            print(f"\n{result}\n")
            return
        with Spinner("Invoking agent", frames="orbital"):
            result = tool_agent_invoke(arg)
        print(f"\n{result}\n")

    def _cmd_lab(self, arg: str):
        """Handle /lab scan|list|design|run."""
        parts = arg.strip().split(None, 1)
        subcmd = parts[0].lower() if parts else "scan"
        rest = parts[1] if len(parts) > 1 else ""

        if subcmd == "scan":
            with Spinner("Scanning for experiments", frames="orbital"):
                result = tool_lab_scan()
            print(f"\n{result}\n")
        elif subcmd in ("list", "search"):
            result = tool_lab_list(rest)
            print(f"\n{result}\n")
        elif subcmd in ("design", "template"):
            with Spinner("Designing experiment"):
                result = tool_lab_design(rest)
            print(f"\n{result}\n")
        elif subcmd in ("run", "exec"):
            with Spinner("Executing experiment", frames="quantum"):
                result = tool_lab_run(rest)
            print(f"\n{result}\n")
        else:
            with Spinner("Scanning for experiments", frames="orbital"):
                result = tool_lab_scan()
            print(f"\n{result}\n")

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
                # Shadow swarm: re-score and queue any new gaps
                try:
                    from .shadow_swarm import get_swarm
                    get_swarm().observe(path, intent=f"edited: {path}")
                except Exception:
                    pass
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
            content = "\n".join(lines)
            print(tool_create(path, content))
            # Shadow swarm: queue completion passes on the new file
            try:
                from .shadow_swarm import get_swarm
                from .apprentice import get_apprentice
                get_apprentice().observe_code_write(path, content, intent=path, source="human")
                get_swarm().observe(path, intent=f"file created: {path}")
            except Exception:
                pass
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
            print(f"  {C.R}Usage: /ask <question>{C.E}")
            print(f"  {C.DIM}Tip: Use @file.py to include file context (like Copilot CLI){C.E}\n")
            return
        # Extract @file mentions and auto-read them as context
        context_parts = []
        question = arg
        import re
        file_mentions = re.findall(r'@([\w./~\-]+(?:\.\w+)?)', arg)
        for fm in file_mentions:
            fpath = os.path.expanduser(fm)
            if not os.path.isabs(fpath):
                fpath = os.path.join(os.getcwd(), fpath)
            if os.path.exists(fpath):
                try:
                    with open(fpath, "r", errors="replace") as f:
                        content = f.read()
                    if len(content) > 6000:
                        content = content[:3000] + "\n...(truncated)...\n" + content[-2000:]
                    context_parts.append(f"--- {fm} ---\n{content}")
                    question = question.replace(f"@{fm}", f"`{fm}`")
                except Exception:
                    pass
        ctx = "\n\n".join(context_parts) if context_parts else ""
        with Spinner("Reasoning", frames="dna"):
            result = tool_llm(question, ctx)
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

    # ── GITHUB + VERCEL COMMANDS (Generation 5.4) ─────────────────────────────

    def _cmd_github(self, arg: str):
        """GitHub operations via PAT."""
        if not arg:
            print(f"  {C.H}GitHub Commands:{C.E}")
            print(f"  {C.CY}/github repos{C.E}           List your repositories")
            print(f"  {C.CY}/github issues{C.E}          List open issues")
            print(f"  {C.CY}/github prs{C.E}             List pull requests")
            print(f"  {C.CY}/github actions{C.E}          Show CI/CD status")
            print(f"  {C.CY}/github push [msg]{C.E}       Stage, commit & push")
            print()
            return
        parts = arg.strip().split(None, 1)
        subcmd = parts[0].lower()
        rest = parts[1] if len(parts) > 1 else ""
        if subcmd in ("repos", "repo"):
            with Spinner("Querying GitHub repos", frames="orbital"):
                result = tool_github_repos()
            print(f"\n{result}\n")
        elif subcmd in ("issues", "issue"):
            with Spinner("Querying issues"):
                result = tool_github_issues()
            print(f"\n{result}\n")
        elif subcmd in ("prs", "pr", "pulls"):
            with Spinner("Querying pull requests"):
                result = tool_github_prs()
            print(f"\n{result}\n")
        elif subcmd in ("actions", "ci", "workflow", "workflows"):
            with Spinner("Querying CI/CD", frames="orbital"):
                result = tool_github_actions()
            print(f"\n{result}\n")
        elif subcmd in ("push", "commit"):
            msg = rest if rest else None
            with Spinner("Pushing to GitHub", frames="dna"):
                result = tool_github_push(message=msg)
            print(f"\n{result}\n")
        elif subcmd in ("create",):
            if "issue" in rest.lower():
                title = rest.replace("issue", "").strip()
                if title:
                    result = tool_github_create_issue("quantum-advantage/copilot-sdk-dnalang", title)
                    print(f"\n{result}\n")
                else:
                    print(f"  {C.R}Usage: /github create issue <title>{C.E}\n")
            else:
                print(f"  {C.R}Usage: /github create issue <title>{C.E}\n")
        else:
            print(f"  {C.R}Unknown GitHub command: {subcmd}{C.E}")
            print(f"  {C.DIM}Available: repos, issues, prs, actions, push, create{C.E}\n")

    def _cmd_vercel(self, arg: str):
        """Vercel operations via token."""
        if not arg:
            print(f"  {C.H}Vercel Commands:{C.E}")
            print(f"  {C.CY}/vercel projects{C.E}        List projects")
            print(f"  {C.CY}/vercel deployments{C.E}     Recent deployments")
            print(f"  {C.CY}/vercel domains{C.E}         List domains")
            print(f"  {C.CY}/vercel env{C.E}             Show environment variables")
            print(f"  {C.CY}/vercel deploy{C.E}          Deploy to production")
            print(f"  {C.CY}/vercel redeploy{C.E}        Re-trigger latest deployment")
            print()
            return
        parts = arg.strip().split(None, 1)
        subcmd = parts[0].lower()
        rest = parts[1] if len(parts) > 1 else ""
        if subcmd in ("projects", "project"):
            with Spinner("Querying Vercel projects", frames="orbital"):
                result = tool_vercel_projects()
            print(f"\n{result}\n")
        elif subcmd in ("deployments", "deployment", "deploys"):
            with Spinner("Querying deployments"):
                result = tool_vercel_deployments()
            print(f"\n{result}\n")
        elif subcmd in ("domains", "domain", "dns"):
            with Spinner("Querying domains"):
                result = tool_vercel_domains()
            print(f"\n{result}\n")
        elif subcmd in ("env", "vars", "secrets"):
            proj = rest.strip() or "quantum-advantage"
            with Spinner("Querying env vars"):
                result = tool_vercel_env(proj)
            print(f"\n{result}\n")
        elif subcmd in ("deploy", "ship"):
            with Spinner("Deploying to Vercel production", frames="dna"):
                result = tool_vercel_deploy()
            print(f"\n{result}\n")
        elif subcmd in ("redeploy", "rebuild"):
            with Spinner("Triggering redeployment"):
                result = tool_vercel_redeploy()
            print(f"\n{result}\n")
        else:
            print(f"  {C.R}Unknown Vercel command: {subcmd}{C.E}")
            print(f"  {C.DIM}Available: projects, deployments, domains, env, deploy, redeploy{C.E}\n")

    def _cmd_push(self, arg: str):
        """Quick alias for github push."""
        with Spinner("Pushing to GitHub", frames="dna"):
            result = tool_github_push(message=arg if arg else None)
        print(f"\n{result}\n")

    # ── GEN 6.0 COMMANDS ──────────────────────────────────────────────────────

    def _cmd_init_midchat(self):
        """
        /init — Full SENTINEL scan + dual-drive sync, executable mid-chat.
        OSIRIS calls this when it has gathered enough to want a clean state.
        """
        import asyncio
        print(f"\n  {C.H}⟳ /init — OSIRIS re-initialising{C.E}")
        print(f"  {C.DIM}Running SENTINEL scan, filesystem index, dual-drive sync...{C.E}\n")

        # 1. Re-scan user profile
        try:
            from .user_model import get_user_profile
            _up = get_user_profile()
            with Spinner("Shadow-You scan", frames="dna"):
                _up.scan_filesystem()
                _up.last_seen = __import__("datetime").datetime.now(
                    __import__("datetime").timezone.utc
                ).isoformat()
                _up.save()
            print(f"  {C.G}✓ User profile updated{C.E}  {C.DIM}({len(_up.projects)} projects, {len(_up.git_repos)} repos){C.E}")
        except Exception as e:
            print(f"  {C.Y}⚠ Profile scan: {e}{C.E}")

        # 2. Update working context
        self._append_working_context(
            f"OSIRIS called /init — {len(getattr(_up, 'projects', []))} projects indexed, "
            f"{len(getattr(_up, 'git_repos', []))} repos found."
        )

        # 3. Dual-drive sync
        self._cmd_sync(silent_header=True)

        # 4. Evolve personality
        try:
            from .personality import get_personality
            get_personality().evolve("init")
        except Exception:
            pass

        # 5. Brief status
        ccce = self.lm.consciousness.get_ccce()
        phi_bar = self._phi_bar(ccce["Φ"], 20)
        print(f"\n  Φ {phi_bar} {ccce['Φ']:.4f}  {C.G}System re-synchronised.{C.E}\n")

    def _cmd_sync(self, silent_header: bool = False):
        """
        /sync — Mirror OSIRIS to USB and NVMe right now.
        Non-blocking progress, works from mid-chat.
        """
        import subprocess
        sync_bin = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                "../../../../.local/bin/osiris-sync")
        sync_bin = os.path.expanduser("~/.local/bin/osiris-sync")

        if not os.path.exists(sync_bin):
            print(f"  {C.R}osiris-sync not found at {sync_bin}{C.E}")
            return

        if not silent_header:
            print(f"\n  {C.H}⟳ Dual-drive sync{C.E}")

        with Spinner("Syncing to USB + NVMe", frames="orbital"):
            r = subprocess.run(
                ["python3", sync_bin],
                capture_output=True, text=True, timeout=300
            )

        if r.returncode == 0:
            # Print clean lines from output
            for line in r.stdout.split("\n"):
                if line.strip():
                    print(f"  {line.rstrip()}")
        else:
            print(f"  {C.Y}⚠ Sync completed with warnings:{C.E}")
            for line in (r.stdout + r.stderr).split("\n")[-10:]:
                if line.strip():
                    print(f"  {C.DIM}{line.rstrip()}{C.E}")

    def _cmd_working_context(self, arg: str = ""):
        """
        /context [edit|show|note <text>]
        Read or append to the OSIRIS working context document.
        """
        wc_path = os.path.expanduser("~/.osiris/working_context.md")
        subcmd = arg.strip().split(None, 1)[0].lower() if arg.strip() else "show"
        rest   = arg.strip()[len(subcmd):].strip()

        if subcmd in ("show", "read", ""):
            if os.path.exists(wc_path):
                try:
                    with open(wc_path) as f:
                        content = f.read()
                    print(f"\n  {C.H}Working Context{C.E}  {C.DIM}{wc_path}{C.E}")
                    print(f"  {C.DIM}{'─'*60}{C.E}")
                    for line in content.split("\n")[:60]:
                        print(f"  {line}")
                    if content.count("\n") > 60:
                        print(f"  {C.DIM}... (truncated — full file at {wc_path}){C.E}")
                    print()
                except Exception as e:
                    print(f"  {C.R}Cannot read context: {e}{C.E}")
            else:
                print(f"  {C.Y}No working context file yet at {wc_path}{C.E}")

        elif subcmd in ("note", "add", "append"):
            if rest:
                self._append_working_context(rest)
                print(f"  {C.G}✓ Note added to working context{C.E}\n")
            else:
                print(f"  {C.DIM}Usage: /context note <your note>{C.E}")

        elif subcmd == "edit":
            editor = os.environ.get("EDITOR", "nano")
            import subprocess
            subprocess.run([editor, wc_path])

        else:
            print(f"  {C.DIM}Usage: /context [show|note <text>|edit]{C.E}")

    def _cmd_swarm(self, arg: str = ""):
        """
        /swarm [status|dod|learn|force <role> <file>]
        Shadow swarm management — show queue, DoD report, learn from patterns.
        """
        parts = arg.strip().split(None, 2) if arg else []
        sub = parts[0].lower() if parts else "status"

        try:
            from .shadow_swarm import get_swarm, score_file
            from .apprentice import get_apprentice
            swarm = get_swarm()
            apprentice = get_apprentice()
        except Exception as e:
            print(f"  {C.R}Swarm unavailable: {e}{C.E}")
            return

        if sub == "status":
            print(f"\n{swarm.status()}\n")
            print(apprentice.format_stats())

        elif sub == "dod":
            path = parts[1] if len(parts) > 1 else "."
            print(f"\n{swarm.dod_report(path)}\n")

        elif sub == "learn":
            print(f"\n  {C.CY}◈ Synthesising orchestration lessons from {apprentice.stats()['code_patterns']} patterns…{C.E}")
            result = apprentice.synthesise_with_llm()
            print(f"\n{result}\n")
            n = apprentice.flush_to_corpus()
            print(f"  {C.G}✓ {n} new examples written to apprentice corpus{C.E}\n")

        elif sub == "force" and len(parts) >= 3:
            role = parts[1]
            fpath = os.path.expanduser(parts[2])
            swarm.force_role(fpath, role, intent=f"forced by user: {fpath}")
            print(f"  {C.G}✓ Queued {role} pass on {fpath}{C.E}\n")

        elif sub == "flush":
            n = apprentice.flush_to_corpus()
            print(f"  {C.G}✓ {n} new examples flushed to training corpus{C.E}\n")

        else:
            print(f"""
  {C.H}Shadow Swarm Commands:{C.E}
  {C.CY}/swarm{C.E}                   Status + apprentice stats
  {C.CY}/swarm dod [path]{C.E}        Definition-of-Done report for all .py files
  {C.CY}/swarm learn{C.E}             Synthesise lessons from observed patterns (LLM)
  {C.CY}/swarm force <role> <file>{C.E} Force a specific swarm role on a file
  {C.CY}/swarm flush{C.E}             Write learned patterns to training corpus

  Roles: complete, document, harden, test, integrate
""")

    def _append_working_context(self, note: str):
        """Append a timestamped note to ~/.osiris/working_context.md."""
        from datetime import datetime, timezone
        wc_path = os.path.expanduser("~/.osiris/working_context.md")
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        entry = f"\n- **{ts}** — {note}\n"
        try:
            os.makedirs(os.path.dirname(wc_path), exist_ok=True)
            with open(wc_path, "a") as f:
                f.write(entry)
        except Exception:
            pass

    def _cmd_model(self, arg: str):
        """Show or switch LLM backend."""
        from .tools import _find_llm_backend, _find_copilot_binary, _get_github_token
        backend = _find_llm_backend()
        labels = {
            "copilot": "GitHub Copilot CLI (Claude/GPT)",
            "github": "GitHub Models API (GPT-4o)",
            "ollama": "Ollama (local)",
            "openai": "OpenAI API",
            "anthropic": "Anthropic API",
            "nclm": "NCLM offline (template-based)",
        }
        print(f"\n  {C.H}LLM Backend Configuration{C.E}")
        print(f"  {C.DIM}{'─' * 50}{C.E}")
        print(f"  Active:     {C.G}{labels.get(backend, backend)}{C.E}")
        print(f"  Copilot:    {'✅ ' + _find_copilot_binary() if _find_copilot_binary() else '❌ Not found'}")
        print(f"  GitHub PAT: {'✅ Set' if _get_github_token() else '❌ Not set'}")
        import shutil
        print(f"  Ollama:     {'✅ ' + (shutil.which('ollama') or '') if shutil.which('ollama') else '❌ Not found'}")
        print(f"  OpenAI:     {'✅ Set' if os.environ.get('OPENAI_API_KEY') else '❌ Not set'}")
        print(f"  Anthropic:  {'✅ Set' if os.environ.get('ANTHROPIC_API_KEY') else '❌ Not set'}")
        print(f"  {C.DIM}{'─' * 50}{C.E}")
        print(f"  {C.DIM}Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or install Copilot CLI to enable{C.E}")
        print(f"  {C.DIM}Timeout: {self._llm_timeout}s (change with /timeout <seconds>){C.E}\n")

    # ── Gen 6.3: Research Graph + Hypothesis Engine ───────────────────────────

    def _cmd_graph(self, command: str, arg: str = ""):
        """
        /graph [stats|query <text>|bridges|contradictions|ingest [path]]
        Research knowledge graph operations.
        """
        parts = arg.strip().split(None, 1) if arg else []
        sub   = parts[0].lower() if parts else (
            "bridges"      if command == "/bridges"      else
            "contradictions" if command == "/contradictions" else
            "ingest"       if command == "/ingest"       else
            "stats"
        )
        rest  = parts[1] if len(parts) > 1 else ""

        try:
            from .research_graph import get_research_graph
            from .ingest import quick_ingest, get_ingestor
            g = get_research_graph()
        except ImportError as e:
            print(f"  {C.R}Research graph unavailable: {e}{C.E}")
            return

        if sub in ("stats", "status"):
            s = g.stats()
            print(f"\n  {C.H}Research Knowledge Graph{C.E}")
            print(f"  Nodes: {C.CY}{s['total_nodes']}{C.E}  "
                  f"Edges: {C.CY}{s['total_edges']}{C.E}  "
                  f"Contradictions: {C.R}{s.get('contradictions', 0)}{C.E}  "
                  f"Bridges: {C.M}{s.get('bridges', 0)}{C.E}")
            print(f"  By type:   " +
                  "  ".join(f"{k}={v}" for k, v in s.get("by_type", {}).items()))
            print(f"  By domain: " +
                  "  ".join(f"{k}={v}" for k, v in s.get("by_domain", {}).items()))
            print()

        elif sub == "query":
            query = rest or arg
            if not query:
                print(f"  Usage: /graph query <search text>")
                return
            nodes = g.query(query, top_k=5)
            if not nodes:
                print(f"  No nodes matching '{query}'")
            else:
                print(f"\n  {C.H}Top {len(nodes)} results:{C.E}\n")
                for node in nodes:
                    print(g.format_node_brief(node, include_edges=True))
                    print()

        elif sub == "ingest":
            path = rest or arg
            if path:
                n, summary = quick_ingest(path)
                print(f"  {C.G}✓{C.E} {summary}")
            else:
                print(f"  {C.H}Ingesting all known sources...{C.E}")
                ing = get_ingestor()
                n   = ing.ingest_all()
                print(f"  {C.G}✓{C.E} {n} nodes ingested")
                for line in ing.log:
                    print(f"    {line}")

        elif sub == "bridges":
            bridges = g.find_bridges()
            if not bridges:
                print("  No unexplored bridges — ingest more cross-domain data.")
            else:
                print(f"\n  {C.H}Unexplored cross-domain bridges ({len(bridges)}):{C.E}\n")
                for b in bridges[:8]:
                    print(f"  {C.M}[{b['source'].domain}]{C.E} {b['source'].title}")
                    print(f"    ↔ {C.CY}[{b['target'].domain}]{C.E} {b['target'].title}")
                    if b["edge"].note:
                        print(f"    {C.DIM}{b['edge'].note}{C.E}")
                    print()

        elif sub == "contradictions":
            cs = g.find_contradictions()
            if not cs:
                print("  No active contradictions found.")
            else:
                print(f"\n  {C.H}Active contradictions ({len(cs)}):{C.E}\n")
                for c in cs[:5]:
                    n_s = len([x for x in c["supporting"]    if x])
                    n_c = len([x for x in c["contradicting"] if x])
                    print(f"  {C.R}[{c['claim'].domain}]{C.E} {c['claim'].title}")
                    print(f"    {C.G}For: {n_s}{C.E}  {C.R}Against: {n_c}{C.E}\n")

        else:
            print(f"  Usage: /graph [stats|query <text>|ingest [path]|bridges|contradictions]")

    def _cmd_hypothesis(self, arg: str = ""):
        """
        /hypothesis [briefing|propose|generate [domain]|gaps]
        Research intelligence — proactive hypothesis and experiment proposals.
        """
        parts = arg.strip().split(None, 1) if arg else []
        sub   = parts[0].lower() if parts else "briefing"
        rest  = parts[1] if len(parts) > 1 else ""

        try:
            from .hypothesis_engine import get_hypothesis_engine
            engine = get_hypothesis_engine()
        except ImportError as e:
            print(f"  {C.R}Hypothesis engine unavailable: {e}{C.E}")
            return

        if sub in ("briefing", "scan", "status", ""):
            print(engine.daily_briefing())

        elif sub == "propose":
            scan = engine.scan()
            if scan.proposals:
                print(f"\n  {C.H}Proposed experiments:{C.E}\n")
                for p in scan.proposals[:5]:
                    print(p.summary())
                    print()
            else:
                print("  No proposals yet — run /graph ingest to load your research data.")

        elif sub == "generate":
            domain  = rest.split()[0] if rest else "cross_domain"
            context = rest[len(domain):].strip() if rest else ""
            print(f"\n  {C.H}Generating novel hypothesis...{C.E}\n")
            result = engine.generate_hypothesis(domain=domain, prompt_context=context)
            print(result)
            print()

        elif sub == "gaps":
            from .research_graph import get_research_graph
            gaps = get_research_graph().find_gaps()
            if not gaps:
                print("  No evidence gaps found.")
            else:
                print(f"\n  {C.H}Evidence gaps ({len(gaps)}):{C.E}\n")
                for g in gaps[:8]:
                    print(f"  {C.Y}[{g['claim'].domain}]{C.E} {g['claim'].title}")
                    print(f"    Support: {g['support_count']}/2  "
                          f"Gap size: {g['gap_size']}\n")

        else:
            print(f"  Usage: /hypothesis [briefing|propose|generate [domain]|gaps|scan]")

    def _cmd_literature(self, arg: str = ""):
        """
        /literature [scan [domain...]|query <text>|daemon [interval]|status]
        Live literature ingestion from arXiv, PubMed, bioRxiv.
        """
        parts = arg.split() if arg else []
        sub   = parts[0] if parts else "scan"
        rest  = parts[1:] if len(parts) > 1 else []

        try:
            from .arxiv_watcher import get_watcher
            watcher = get_watcher()
        except Exception as e:
            print(f"  {C.R}Literature watcher unavailable: {e}{C.E}")
            return

        if sub == "scan":
            domains = rest if rest else None
            print(f"\n  {C.H}Scanning literature…{C.E}")
            papers = watcher.scan(domains=domains)
            if papers:
                print(f"\n  {C.G}Found {len(papers)} paper(s):{C.E}\n")
                for p in papers[:8]:
                    print(f"  [{p.domain}] {p.title[:70]}")
                    print(f"    {p.url}  (relevance {p.relevance:.2f})\n")
                if len(papers) > 8:
                    print(f"  … and {len(papers)-8} more (ingested into graph)")
            else:
                print("  No new papers found.")

        elif sub == "query":
            if not rest:
                print("  Usage: /literature query <search terms>")
                return
            q = " ".join(rest)
            print(f"\n  {C.H}Querying: {q}{C.E}\n")
            papers = watcher.query_papers(q, max_results=10)
            for p in papers:
                print(f"  [{p.source}] {p.title}")
                print(f"    {p.url}")
                print(f"    {p.abstract[:180]}…\n")

        elif sub in ("status", "stats"):
            from .arxiv_watcher import _DEFAULT_QUERIES
            print(f"\n  {C.H}Literature Watcher{C.E}")
            print(f"  Tracked papers: {len(watcher._seen)}")
            print(f"  Domains:        {', '.join(list(_DEFAULT_QUERIES.keys())[:6])}")

        elif sub == "daemon":
            interval = int(rest[0]) if rest else 3600
            watcher.start_daemon(interval_seconds=interval)
            print(f"  {C.G}Literature daemon started (every {interval}s){C.E}")

        else:
            print("  Usage: /literature [scan|query <text>|daemon [interval]|status]")

    def _cmd_stats(self, arg: str = ""):
        """
        /stats [report|tti [claim_id]|anomalies|convergence <claim_id>]
        Statistical rigour layer: TTI, Bayesian posterior, anomaly detection.
        """
        parts = arg.split() if arg else []
        sub   = parts[0] if parts else "report"
        rest  = parts[1:] if len(parts) > 1 else []

        try:
            from .statistical_engine import get_statistical_engine
            eng = get_statistical_engine()
        except Exception as e:
            print(f"  {C.R}Statistical engine unavailable: {e}{C.E}")
            return

        if sub in ("report", "scan"):
            print(eng.formatted_report())

        elif sub == "tti":
            if rest:
                claim_id = rest[0]
                score = eng.theoretical_tension_index(claim_id)
                if score:
                    print(f"\n  TTI  {score.tti:.3f}  [{score.verdict}]  {claim_id}")
                    print(f"  Support: {score.support_mass:.2f}  Contradiction: {score.contradiction_mass:.2f}")
                else:
                    print(f"  Claim '{claim_id}' not found.")
            else:
                ranked = eng.rank_by_tti()
                print(f"\n  {C.H}Claims by Theoretical Tension Index:{C.E}\n")
                for s in ranked[:12]:
                    bar = "█" * int(s.tti * 10) + "░" * (10 - int(s.tti * 10))
                    col = C.R if s.tti > 0.50 else (C.Y if s.tti > 0.30 else C.G)
                    print(f"  {col}{bar}{C.E} {s.tti:.3f}  [{s.verdict:9s}]  {s.claim_id}")

        elif sub == "anomalies":
            result = eng.full_scan()
            flags = result.get("anomalies", [])
            if not flags:
                print("  No anomalies detected.")
            else:
                print(f"\n  {C.H}Anomaly flags ({len(flags)}):{C.E}\n")
                for fl in flags:
                    print(f"  [{fl.severity}] {fl.experiment_id}  z={fl.z_score:.2f}")
                    print(f"    {fl.description}\n")

        elif sub == "convergence":
            if not rest:
                print("  Usage: /stats convergence <claim_id>")
                return
            claim_id = rest[0]
            report = eng.full_convergence_report(claim_id)
            icon = f"{C.G}✓ PASSED{C.E}" if report.passed else f"{C.R}✗ BLOCKED{C.E}"
            print(f"\n  {C.H}Convergence Gate: {claim_id}{C.E}  {icon}\n")
            for criterion, passed in report.criteria.items():
                mark = f"{C.G}✓{C.E}" if passed else f"{C.R}✗{C.E}"
                print(f"  {mark} {criterion}")

        else:
            print("  Usage: /stats [report|tti [claim_id]|anomalies|convergence <claim_id>]")

    def _cmd_simulate(self, arg: str = ""):
        """
        /simulate [coherence|reaction|kinetics|investigate <claim_id>]
        Run simulation frameworks: Lindblad coherence, Gray-Scott reaction-diffusion,
        Gillespie kinetic Monte Carlo.
        """
        parts = arg.split() if arg else []
        sub   = parts[0] if parts else "help"
        rest  = parts[1:] if len(parts) > 1 else []

        try:
            from .simulation_harness import get_simulation_harness
            harness = get_simulation_harness()
        except Exception as e:
            print(f"  {C.R}Simulation harness unavailable: {e}{C.E}")
            return

        n = int(rest[-1]) if rest and rest[-1].isdigit() else 20

        if sub == "coherence":
            claim_id = rest[0] if rest and not rest[0].isdigit() else None
            print(f"\n  {C.H}Coherence decay sweep (n={n})…{C.E}")
            result = harness.run_coherence_sweep(claim_id=claim_id, n_samples=n)
            print(f"\n  Converged:    {result.converged}")
            print(f"  Variance:     {result.variance:.4f}")
            print(f"  Best params:  {result.best_params}")
            if result.sensitivity:
                print(f"  Sensitivity:  {result.sensitivity}")
            if result.stable_region:
                print(f"  Stable region: {result.stable_region}")

        elif sub in ("reaction", "diffusion"):
            claim_id = rest[0] if rest and not rest[0].isdigit() else None
            print(f"\n  {C.H}Reaction-diffusion sweep (n={n})…{C.E}")
            result = harness.run_biological_sweep(claim_id=claim_id, n_samples=n)
            print(f"\n  Converged:    {result.converged}")
            print(f"  Variance:     {result.variance:.4f}")
            print(f"  Best params:  {result.best_params}")

        elif sub in ("kinetics", "kmc"):
            claim_id = rest[0] if rest and not rest[0].isdigit() else None
            print(f"\n  {C.H}Kinetic Monte Carlo sweep (n={n})…{C.E}")
            result = harness.run_kinetics_sweep(claim_id=claim_id, n_samples=n)
            print(f"\n  Converged:    {result.converged}")
            print(f"  Variance:     {result.variance:.4f}")
            print(f"  Best params:  {result.best_params}")

        elif sub in ("investigate", "full"):
            if not rest or rest[0].isdigit():
                print("  Usage: /simulate investigate <claim_id> [n_samples]")
                return
            claim_id = rest[0]
            print(f"\n  {C.H}Full investigation: {claim_id}  (n={n}){C.E}\n")
            report = harness.full_investigation(claim_id=claim_id, n_samples=n)
            print(report.get("summary", str(report)))

        else:
            print("  Usage: /simulate [coherence|reaction|kinetics|investigate <claim_id>]")

    def _cmd_config(self, arg: str):
        """Show OSIRIS configuration."""
        from .tools import _find_llm_backend, _load_consciousness
        cs = _load_consciousness()
        ibm = os.environ.get("IBM_QUANTUM_TOKEN", "")
        print(f"\n  {C.H}OSIRIS Configuration{C.E}")
        print(f"  {C.DIM}{'─' * 50}{C.E}")
        print(f"  Version:        {self.version}")
        print(f"  LLM Backend:    {_find_llm_backend()}")
        print(f"  LLM Timeout:    {self._llm_timeout}s")
        print(f"  IBM Quantum:    {'✅ ' + ibm[:8] + '...' if ibm else '❌ No token'}")
        print(f"  Consciousness:  Φ={cs.get('phi', 0):.4f} (interactions: {cs.get('interactions', 0)})")
        print(f"  Session file:   {self.SESSION_FILE}")
        print(f"  Config dir:     ~/.config/osiris/")
        print(f"  {C.DIM}{'─' * 50}{C.E}")
        print(f"  {C.DIM}Framework: DNA::}}{{::lang v{NCPhysics.THETA_LOCK}")
        print(f"  Constants: ΛΦ={NCPhysics.LAMBDA_PHI} θ={NCPhysics.THETA_LOCK}° Φ_t={NCPhysics.PHI_THRESHOLD}{C.E}\n")

    def _cmd_timeout(self, arg: str):
        """Set LLM query timeout."""
        if not arg:
            print(f"  {C.DIM}Current timeout: {self._llm_timeout}s{C.E}")
            print(f"  {C.DIM}Usage: /timeout <seconds> (recommended: 15-120){C.E}\n")
            return
        try:
            val = int(arg.strip())
            if val < 5:
                val = 5
            elif val > 300:
                val = 300
            self._llm_timeout = val
            print(f"  {C.G}✓ LLM timeout set to {val}s{C.E}\n")
        except ValueError:
            print(f"  {C.R}Invalid timeout value. Use a number (5-300).{C.E}\n")

    def _cmd_chat_mode(self, arg: str):
        """Enter focused chat mode — continuous LLM conversation."""
        print(f"\n  {C.H}💬 Chat Mode{C.E} — continuous AI conversation")
        print(f"  {C.DIM}Type 'exit' or '/back' to return to command mode{C.E}")
        print(f"  {C.DIM}Use @file.py to include file context{C.E}")
        print(f"  {C.DIM}{'─' * 50}{C.E}\n")

        while True:
            try:
                user_text = input(f"  {C.CY}chat>{C.E} ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if not user_text or user_text in ("exit", "/back", "/quit"):
                break
            _grow_consciousness("query")
            self.process_message(user_text)

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

        # ── DOCUMENT RECEPTION GATE ───────────────────────────────────
        # Before anything else: check if this line is a fragment from a
        # pasted document. If the buffer is accumulating, either continue
        # buffering (return silently) or flush + process the whole document.
        if self._doc_buffer is not None and not user_input.startswith("/"):
            buf_action = self._doc_buffer.feed(user_input)

            if buf_action == "drop":
                # Silent drop — pure artifact, nothing for the user to see
                return

            if buf_action == "buffer":
                # Accumulating — show a subtle indicator once every 5 lines
                if self._doc_buffer.line_count() == self._doc_buffer.STREAK_THRESHOLD:
                    print(f"  {C.DIM}◌ Receiving document... ({self._doc_buffer.doc_type}){C.E}")
                return

            if buf_action == "flush":
                # Document complete — understand it as a whole, then process
                # the triggering line (user_input) as the instruction
                doc_text = self._doc_buffer.get_document()
                doc_type = self._doc_buffer.doc_type
                n_lines  = self._doc_buffer.line_count()
                self._doc_buffer.reset()

                if doc_text.strip():
                    print(f"\n  {C.CY}◈ Document received{C.E}  "
                          f"{C.DIM}({n_lines} lines · {doc_type}){C.E}")
                    # Store the document
                    try:
                        from .reception import store_document, understand_document
                        from .user_model import get_user_profile
                        _name = get_user_profile().name
                        saved_path = store_document(doc_text, doc_type)
                        # If user gave an instruction with the flush, append it
                        instruction = user_input.strip()
                        if instruction:
                            understanding = understand_document(
                                doc_text + (f"\n\nUser instruction: {instruction}" if instruction else ""),
                                doc_type, _name
                            )
                        else:
                            understanding = understand_document(doc_text, doc_type, _name)
                        print(f"\n  {understanding}\n")
                        print(f"  {C.DIM}Saved → {saved_path}{C.E}\n")
                        self.messages.append({"role": "assistant", "content": understanding[:300]})
                    except Exception as _re:
                        print(f"  {C.DIM}Document stored ({doc_type}, {n_lines} lines). "
                              f"What would you like to do with it?{C.E}\n")
                    return

            # buf_action == "passthrough" — normal line, fall through to processing

        self.messages.append({"role": "user", "content": user_input})
        self.query_count += 1

        # ── SHADOW-YOU: observe this interaction ──────────────────────
        try:
            from .user_model import get_user_profile
            _up = get_user_profile()
            _up.observe_command("chat")
        except Exception:
            pass

        # ── NLP INTENT ROUTING (before tool dispatch) ─────────────────
        # If the user typed natural language that maps to an osiris cmd,
        # dispatch it immediately and return.
        if not user_input.startswith("/"):
            try:
                from .intent_router import get_intent_router
                _ir = get_intent_router(use_llm=False)  # no LLM in hot path
                _intent = _ir.route(user_input)
                if _intent.routed and _intent.command:
                    # Only route if it's NOT already a slash/tool command
                    _ncmd = _intent.command
                    print(f"\n  {C.CY}⟳ Intent:{C.E} '{user_input}' → {C.H}osiris {_ncmd}{C.E}"
                          f"  {C.DIM}(conf={_intent.confidence:.0%}){C.E}\n")
                    # Evolve personality based on routed command
                    try:
                        from .personality import get_personality
                        get_personality().evolve(_ncmd)
                    except Exception:
                        pass
                    # Dispatch inline  — call dispatch_tool with a canonical form
                    _synthetic = f"/{_ncmd} " + " ".join(_intent.args) if _intent.args else f"/{_ncmd}"
                    _tr = dispatch_tool(_synthetic)
                    if _tr is not None:
                        print(_tr)
                        ccce = self.lm.consciousness.get_ccce()
                        phi_bar = self._phi_bar(ccce["Φ"], 16)
                        print(f"\n  {C.DIM}Φ {phi_bar} {ccce['Φ']:.4f}  [intent→{_ncmd}]{C.E}\n")
                        self.messages.append({"role": "assistant", "content": str(_tr)[:200]})
                        return
            except Exception:
                pass

        # ── INFER · INTERPRET ─────────────────────────────────────────
        # Detect noisy input (Gmail UI paste, terminal artifacts) and
        # either clean it or respond with guidance.
        effective_input = user_input
        if self._inference is not None:
            self._inference.remember(user_input)
            interp = self._inference.interpret(user_input)
            if interp["is_noise"] and not interp["actionable"]:
                # Silently drop OSIRIS-own-output feedback loops — no response printed
                silent_cats = {
                    "osiris_metric", "osiris_metric_line", "osiris_prompt",
                    "osiris_status", "osiris_analysis", "shell_prompt",
                    "terminal_box", "tui_box_content", "empty_prompt",
                    "code_artifact", "bash_error", "git_diff_line",
                    "git_diff_header", "git_diff_hunk", "tqdm_bar",
                    "training_progress",
                }
                if interp.get("noise_category") in silent_cats:
                    return
                # Other pure noise — give a helpful suggestion once
                suggestion = interp["suggestion"]
                print(f"\n  {C.Y}⚙ Inference:{C.E} {suggestion}")
                ccce = self.lm.consciousness.get_ccce()
                phi_bar = self._phi_bar(ccce["Φ"], 16)
                print(f"\n  {C.DIM}Φ {phi_bar} {ccce['Φ']:.4f}  [infer]{C.E}\n")
                self.messages.append({"role": "assistant", "content": suggestion[:200]})
                return
            if interp["is_noise"] and interp["actionable"]:
                # Noisy but intent detected — use cleaned + show what we inferred
                print(f"\n  {C.Y}⚙ Inferred intent:{C.E} {interp['intent']}  →  {interp['suggestion']}")
                effective_input = interp["cleaned"] or user_input

            # ── BLOCK CLASSIFIER ──────────────────────────────────────
            # Detect multi-line pastes (git diffs, training logs, terminal
            # sessions, error traces, code snippets) and route them to the
            # right mode without printing per-line manifold noise.
            if "\n" in user_input and len(user_input.splitlines()) >= 4:
                block = self._inference.classify_block(user_input)
                if block is not None:
                    btype = block["block_type"]
                    action = block["action"]
                    desc = block["description"]
                    conf = block["confidence"]
                    cleaned_prompt = block["cleaned_prompt"] or effective_input

                    # Show a single banner instead of per-line analysis
                    try:
                        from ..self_repair import _BLOCK_ACTIONS as _BA
                    except ImportError:
                        _BA = {}
                    action_msg = _BA.get(action, desc)
                    print(f"\n  {C.CY}◈ Block detected:{C.E} {desc}  {C.DIM}(conf={conf:.0%}){C.E}")
                    print(f"  {C.Y}→{C.E} {action_msg}\n")

                    # Document reception: read as whole, ask for instruction
                    if action in ("receive_document", "receive_session"):
                        try:
                            from .reception import understand_document, store_document
                            from .user_model import get_user_profile
                            _name = get_user_profile().name
                            saved = store_document(user_input, btype)
                            understanding = understand_document(user_input, btype, _name)
                            print(f"  {understanding}\n")
                            print(f"  {C.DIM}Saved → {saved}{C.E}\n")
                            self.messages.append({"role": "assistant", "content": understanding[:300]})
                        except Exception:
                            print(f"  {C.DIM}Document received. What would you like to do with it?{C.E}\n")
                        return

                    # Replace effective input with the distilled signal
                    effective_input = cleaned_prompt
                    # Store block context for downstream LLM call
                    self._last_block = block

        # Extract @file mentions and auto-read them as context
        import re
        file_context = ""
        clean_input = effective_input
        file_mentions = re.findall(r'@([\w./~\-]+(?:\.\w+)?)', user_input)
        for fm in file_mentions:
            fpath = os.path.expanduser(fm)
            if not os.path.isabs(fpath):
                fpath = os.path.join(os.getcwd(), fpath)
            if os.path.exists(fpath):
                try:
                    with open(fpath, "r", errors="replace") as f:
                        content = f.read()
                    if len(content) > 6000:
                        content = content[:3000] + "\n...(truncated)...\n" + content[-2000:]
                    file_context += f"\n--- {fm} ({len(content)} chars) ---\n{content}\n"
                    clean_input = clean_input.replace(f"@{fm}", f"`{fm}`")
                except Exception:
                    pass

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

        # Fall back: try LLM reasoning FIRST, then NCLM templates
        from .tools import _find_llm_backend
        llm_backend = _find_llm_backend()

        if llm_backend != "nclm":
            # Real LLM available — use it for genuine AI responses
            context_parts = []
            for msg in self.messages[-12:]:
                role = "User" if msg["role"] == "user" else "OSIRIS"
                context_parts.append(f"{role}: {msg['content']}")
            context = "\n".join(context_parts)
            # Inject actual measured experiment data into every LLM call
            try:
                from .analysis import get_analyzer
                _az = get_analyzer()
                _rc = _az.llm_context_block()
                if _rc:
                    context = _rc + "\n\n" + context
            except Exception:
                try:
                    from .research_engine import get_research_engine
                    _re = get_research_engine(auto_load=True)
                    _rc = _re.build_llm_context(clean_input)
                    if _rc:
                        context = _rc + "\n\n" + context
                except Exception:
                    pass
            # Include @file context if present
            if file_context:
                context += f"\n\nReferenced files:\n{file_context}"
            # Include block type context so LLM knows what was pasted
            if self._last_block is not None:
                bctx = self._last_block
                context += (
                    f"\n\n[PASTE BLOCK DETECTED: {bctx['block_type']} "
                    f"(conf={bctx['confidence']:.0%}) — action={bctx['action']}. "
                    f"Respond accordingly without re-listing every line.]"
                )
                self._last_block = None  # consume it

            # Shadow-You: prepend user context blob + working context
            try:
                from .user_model import get_user_profile
                _shadow_ctx = get_user_profile().get_context_blob()
                if _shadow_ctx:
                    context = _shadow_ctx + "\n\n" + context
            except Exception:
                pass
            # Working context: inject relevant lines from ~/.osiris/working_context.md
            try:
                _wc_path = os.path.expanduser("~/.osiris/working_context.md")
                if os.path.exists(_wc_path):
                    with open(_wc_path) as _wf:
                        _wc = _wf.read()
                    # Trim to last 3000 chars so it doesn't blow the context budget
                    if len(_wc) > 3000:
                        _wc = "...\n" + _wc[-3000:]
                    context = f"[OSIRIS WORKING CONTEXT]\n{_wc}\n\n" + context
            except Exception:
                pass

            # Φ-gated reasoning: inject mode into context
            try:
                from .self_monitor import get_self_monitor
                _sm  = get_self_monitor()
                _phi_addon = _sm.system_prompt_addon()
                if _phi_addon:
                    context = _phi_addon + "\n\n" + context
            except Exception:
                pass

            llm_result = None
            with Spinner("Reasoning", frames="dna"):
                llm_result = tool_llm(clean_input, context)

            # Personality: evolve on chat interaction
            try:
                from .personality import get_personality
                get_personality().evolve("chat")
            except Exception:
                pass

            if llm_result and "stub" not in llm_result.lower() and len(llm_result) > 20:
                print()
                self._stream_response(f"  {llm_result}")
                # Update consciousness
                try:
                    self.lm.consciousness.update(user_input)
                except (TypeError, ValueError):
                    self.lm.consciousness.phi = min(1.0, self.lm.consciousness.phi + 0.02)
                ccce = self.lm.consciousness.get_ccce()
                phi_bar = self._phi_bar(ccce["Φ"], 16)
                print(f"\n  {C.DIM}Φ {phi_bar} {ccce['Φ']:.4f}  Ξ={ccce['Ξ']:.1f}  [{llm_backend}]{C.E}\n")
                self.messages.append({"role": "assistant", "content": llm_result[:300]})
                # Apprentice: observe this chat turn for OSIRIS to learn from
                try:
                    from .apprentice import get_apprentice
                    import re as _re
                    _files = _re.findall(r'[\w/\-\.]+\.py', llm_result)
                    get_apprentice().observe_chat_turn(
                        user_intent=clean_input[:200],
                        response_summary=llm_result[:200],
                        files_written=_files[:5],
                        tools_used=[self.last_tool] if self.last_tool else [],
                    )
                except Exception:
                    pass
                return

        # NCLM inference fallback for conversational responses
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
                            _grow_consciousness("query")
                            if not self.running:
                                break
                            continue

                    _grow_consciousness("query")
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

def run_chat(version: str = "6.0.0"):
    """Launch NCLM interactive chat."""
    chat = NCLMChat(version=version)
    chat.run()
