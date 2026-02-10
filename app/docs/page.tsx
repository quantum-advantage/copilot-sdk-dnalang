import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Documentation | DNA-Lang",
  description:
    "Complete SDK documentation, API reference, installation guide, and development timeline for DNA-Lang.",
};

const apiReference = [
  {
    name: "DNALangCopilotClient",
    description: "Main client class for interacting with Copilot CLI and quantum backends.",
    methods: [
      "create_quantum_circuit(num_qubits, gates)",
      "execute_quantum_circuit(circuit, shots, backend)",
      "create_lambda_phi_validator()",
      "create_consciousness_analyzer()",
      "nclm_infer(prompt, context, grok)",
      "nclm_grok(prompt)",
      "get_nclm_telemetry()",
    ],
  },
  {
    name: "QuantumCircuit",
    description: "Representation of a quantum circuit with fluent gate API.",
    methods: [
      "h(target) - Hadamard gate",
      "x(target) - Pauli-X gate",
      "y(target) - Pauli-Y gate",
      "z(target) - Pauli-Z gate",
      "cx(control, target) - CNOT gate",
      "to_qiskit() - Convert to Qiskit",
      "to_json() / from_json()",
    ],
  },
  {
    name: "QuantumBackend",
    description: "Interface to quantum computing backends (IBM, Rigetti, IonQ, simulator).",
    methods: [
      "execute(circuit, shots, backend, optimization_level)",
      "_execute_simulator(qc, shots)",
      "_execute_ibm(qc, shots, backend, optimization_level)",
    ],
  },
  {
    name: "LambdaPhiValidator",
    description: "Validator for lambda-phi conservation laws.",
    methods: [
      "validate_conservation(circuit, operator, num_trials)",
      "compute_conservation_ratio(results)",
      "statistical_test(data)",
    ],
  },
  {
    name: "ConsciousnessAnalyzer",
    description: "Analyzer for consciousness scaling phenomena (CCCE).",
    methods: [
      "measure_scaling(num_qubits_range, num_samples)",
      "compute_ccce(circuit_results)",
      "extract_coherence_time(temporal_data)",
    ],
  },
  {
    name: "OmegaMasterIntegration",
    description: "Multi-agent orchestration system with three specialized agents.",
    methods: [
      "dispatch(agent, task) - AURA/AIDEN/SCIMITAR",
      "synthesize(results) - Collective synthesis",
    ],
  },
  {
    name: "NCLMModelProvider",
    description: "Non-local Non-Causal Language Model with pilot-wave correlation.",
    methods: [
      "generate_completion(prompt, context, grok)",
      "get_session_telemetry()",
    ],
  },
  {
    name: "IntentDeductionEngine",
    description: "7-layer autopoietic architecture with U = L[U] recursive refinement.",
    methods: [
      "analyze(prompt) - Semantic analysis",
      "generate_plan(intent) - Project planning",
    ],
  },
];

const fullTimeline = [
  {
    date: "Dec 2024",
    title: "DNA-Lang Specification Published",
    details: "Initial specification published with 138 research sources covering quantum computing, bio-organic physics, and consciousness scaling architectures.",
  },
  {
    date: "Jan 2025",
    title: "Lambda-Phi Conservation Validated",
    details: "Achieved F_max = 0.9787 fidelity. AFE operator evolution confirmed. Lambda-Phi constant measured at 2.176435e-08 s^-1.",
  },
  {
    date: "Mar 2025",
    title: "NCLM v1 - Sovereign AI Model",
    details: "Non-local Non-Causal Language Model v1 operational. Air-gapped inference with 6D-CRSM manifold representation. Zero external dependencies.",
  },
  {
    date: "Jun 2025",
    title: "Multi-Agent Orchestration",
    details: "Omega-Master system with AURA (T=0.7), AIDEN (T=0.5), SCIMITAR (T=0.3) agents. Collective synthesis pipeline operational.",
  },
  {
    date: "Oct 2025",
    title: "IBM TechXchange Citations",
    details: "DNA-Lang recognized on IBM TechXchange Community. \"Quantum circuit fidelity for agile systems\" and \"The Evolving Landscape of AI Model Training Services\" cite the framework.",
  },
  {
    date: "Nov 2025",
    title: "dnaos-ultimate Published",
    details: "The Ultimate DNA-Lang Runtime published to npm/Yarn registry. Multi-Agent Evolution, MCP Tools, and Phase-Conjugate Intelligence for Living Software Systems.",
  },
  {
    date: "Jan 2026",
    title: "OSIRIS CLI + GitHub Copilot SDK",
    details: "Full integration with GitHub Copilot SDK as drop-in replacement. OSIRIS CLI provides quantum tools, consciousness metrics, and agent orchestration alongside standard Copilot capabilities.",
  },
  {
    date: "Jan 2026",
    title: "Hardware Validation Milestone",
    details: "580+ quantum jobs executed, 515K+ measurement shots processed on IBM Quantum Brisbane and Eagle processors. Conservation maintained above 87% at 127-qubit scale.",
  },
  {
    date: "Feb 2026",
    title: "Sovereign Fleet Architecture",
    details: "OSIRIS DevOS deployment strategy. Toroidal physics simulation, electrogravitic propulsion modeling, and sovereign metabolic loop architecture research notebooks published.",
  },
];

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12">
            <p className="mb-3 font-mono text-sm text-primary">
              {"// documentation"}
            </p>
            <h1 className="text-4xl font-bold text-foreground">
              DNA-Lang SDK Documentation
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              Complete reference for the DNA-Lang Copilot SDK, including
              installation, API reference, configuration, and the full
              development timeline proving continuous innovation and shipping.
            </p>
          </div>

          {/* Installation */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Installation
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "DNALang SDK (Python)",
                  commands: [
                    "git clone https://github.com/quantum-advantage/copilot-sdk.git",
                    "cd copilot-sdk/dnalang",
                    "pip install -e \".[quantum]\"",
                  ],
                },
                {
                  title: "OSIRIS CLI",
                  commands: [
                    "git clone https://github.com/quantum-advantage/copilot-sdk.git",
                    "cd copilot-sdk",
                    "bash install-osiris.sh",
                    "source ~/.bashrc && osiris --version",
                  ],
                },
              ].map((block) => (
                <div
                  key={block.title}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    {block.title}
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {block.commands.map((cmd, i) => (
                      <code
                        key={i}
                        className="block font-mono text-xs text-muted-foreground"
                      >
                        <span className="text-primary">$</span> {cmd}
                      </code>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* API Reference */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              API Reference
            </h2>
            <div className="flex flex-col gap-6">
              {apiReference.map((cls) => (
                <div
                  key={cls.name}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <h3 className="font-mono text-base font-semibold text-foreground">
                    {cls.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {cls.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {cls.methods.map((method) => (
                      <code
                        key={method}
                        className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-foreground"
                      >
                        {method}
                      </code>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Configuration */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Configuration
            </h2>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="mb-3 font-mono text-xs text-muted-foreground">
                dnalang.config.json
              </p>
              <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-foreground">
                <code>
                  {JSON.stringify(
                    {
                      quantum: {
                        default_backend: "ibm_brisbane",
                        api_token_env: "IBM_QUANTUM_TOKEN",
                        optimization_level: 3,
                        shots: 1024,
                      },
                      lambda_phi: {
                        num_trials: 100,
                        significance_level: 0.05,
                        operators: ["X", "Y", "Z", "H"],
                      },
                      consciousness: {
                        qubit_range: [2, 4, 8, 16, 32],
                        samples_per_size: 50,
                        coherence_threshold: 0.7,
                      },
                      copilot: {
                        cli_path: "copilot",
                        server_mode: true,
                        allow_all_tools: true,
                      },
                    },
                    null,
                    2
                  )}
                </code>
              </pre>
            </div>
          </section>

          {/* Full Timeline */}
          <section className="mb-16">
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Development Timeline
            </h2>
            <p className="mb-8 text-muted-foreground">
              Complete provenance record demonstrating continuous development,
              hardware validation, and production deployment of sovereign
              quantum engineering technology.
            </p>

            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-px bg-border" />
              <div className="flex flex-col gap-8">
                {fullTimeline.map((item, i) => (
                  <div key={i} className="relative pl-12">
                    <div className="absolute left-2 top-1 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                    <div className="rounded-lg border border-border bg-card p-5">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-primary">
                          {item.date}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Links */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Resources
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "GitHub Repository",
                  description: "Source code, issues, and contributions",
                  href: "https://github.com/ENKI-420",
                },
                {
                  title: "IBM TechXchange",
                  description: "Published quantum circuit fidelity research",
                  href: "https://community.ibm.com",
                },
                {
                  title: "npm: dnaos-ultimate",
                  description: "Published runtime package on Yarn registry",
                  href: "https://classic.yarnpkg.com/en/package/dnaos-ultimate",
                },
              ].map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30"
                >
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">
                    {link.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {link.description}
                  </p>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
