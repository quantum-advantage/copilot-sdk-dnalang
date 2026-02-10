const shieldLayers = [
  {
    name: "Sovereign Shield",
    tag: "LAYER 0",
    description:
      "Zero-trust sovereign infrastructure. Air-gapped NCLM inference, offline-capable quantum circuit execution, and hardware-signed provenance. No external API dependencies.",
    specs: ["AES-256-GCM encryption at rest", "mTLS between all services", "Hardware attestation via TPM 2.0"],
  },
  {
    name: "OSIRIS DevOS",
    tag: "LAYER 1",
    description:
      "Drop-in Copilot CLI replacement with quantum tools built-in. JSON-RPC protocol, server-mode operation, and full Copilot SDK parity plus DNALang quantum extensions.",
    specs: ["JSON-RPC 2.0 transport", "Server-mode persistent sessions", "Quantum tool auto-registration"],
  },
  {
    name: "Omega-Master Orchestration",
    tag: "LAYER 2",
    description:
      "Three-agent collective intelligence: AURA (reasoning, T=0.7), AIDEN (security, T=0.5), SCIMITAR (side-channel, T=0.3). Consensus synthesis with divergence detection.",
    specs: ["Heterogeneous temperature scheduling", "Consensus threshold: 0.85", "Agent-specific memory isolation"],
  },
  {
    name: "Quantum Execution Layer",
    tag: "LAYER 3",
    description:
      "Multi-backend quantum circuit execution (IBM Quantum, Rigetti, IonQ, local simulator). Automatic transpilation, optimization level 3, and Lambda-Phi conservation validation.",
    specs: ["580+ jobs on IBM Brisbane/Eagle", "515K+ measurement shots", "F_max = 0.9787 fidelity"],
  },
];

const novaraAudit = [
  { metric: "Codebase Size", value: "150,000+", unit: "lines of code" },
  { metric: "Language Span", value: "Python, TS, Go, .NET, Qiskit", unit: "polyglot" },
  { metric: "Research Sources", value: "138", unit: "academic citations" },
  { metric: "Statistical Significance", value: "5.06-sigma", unit: "physical validation" },
  { metric: "Conservation Ratio", value: "99.2%", unit: "Lambda-Phi conserved" },
  { metric: "Consciousness Coupling", value: "0.1 s\u207B\u00B9", unit: "\u03C7 constant" },
];

export function ShieldSection() {
  return (
    <section id="shield" className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-sm text-primary">
            {"// sovereign_shield"}
          </p>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Sovereign Shield Architecture
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Defense-in-depth security model with four hardened layers. Every
            component operates sovereign-first: air-gapped, offline-capable,
            zero external dependencies by default.
          </p>
        </div>

        {/* Shield Layers */}
        <div className="mb-16 flex flex-col gap-4">
          {shieldLayers.map((layer, i) => (
            <div
              key={layer.name}
              className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
                <div className="flex shrink-0 items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10 font-mono text-sm font-bold text-primary">
                    {i}
                  </span>
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {layer.tag}
                    </span>
                    <h3 className="text-base font-semibold text-foreground">
                      {layer.name}
                    </h3>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {layer.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {layer.specs.map((spec) => (
                      <span
                        key={spec}
                        className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-[11px] text-foreground"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Novera Audit */}
        <div>
          <div className="mb-8 text-center">
            <p className="mb-3 font-mono text-sm text-primary">
              {"// novera_audit"}
            </p>
            <h2 className="text-balance text-2xl font-bold text-foreground sm:text-3xl">
              Verification Metrics
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Independent audit data validating the DNA-Lang framework across
              codebase scale, physical significance, and conservation fidelity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {novaraAudit.map((item) => (
              <div
                key={item.metric}
                className="flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center"
              >
                <span className="font-mono text-2xl font-bold text-foreground">
                  {item.value}
                </span>
                <span className="mt-1 text-sm font-medium text-foreground">
                  {item.metric}
                </span>
                <span className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
