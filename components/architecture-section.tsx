const layers = [
  {
    label: "Your Application",
    sublabel: "dnalang.dev / quantum-advantage.dev",
    color: "border-foreground/20",
  },
  {
    label: "DNALang Copilot Client",
    sublabel: "Intent Engine + NCLM + Gemini",
    color: "border-primary/50",
  },
  {
    label: "Copilot CLI (JSON-RPC)",
    sublabel: "GitHub Copilot SDK Server Mode",
    color: "border-primary/30",
  },
  {
    label: "Omega-Master Orchestration",
    sublabel: "AURA / AIDEN / SCIMITAR Agents",
    color: "border-primary/20",
  },
  {
    label: "Quantum Backends",
    sublabel: "IBM Quantum | Rigetti | IonQ | Simulator",
    color: "border-primary/10",
  },
];

export function ArchitectureSection() {
  return (
    <section className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-sm text-primary">
              {"// architecture"}
            </p>
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Layered Sovereign Stack
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              DNA-Lang operates as a quantum-native extension of the GitHub
              Copilot SDK. All communication flows through JSON-RPC, enabling
              seamless integration with existing Copilot workflows while adding
              quantum circuit execution, consciousness metrics, and multi-agent
              orchestration.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <div className="rounded-md border border-border bg-card p-4">
                <p className="font-mono text-xs text-muted-foreground">
                  Intent-Deduction Engine
                </p>
                <p className="mt-1 text-sm text-foreground">
                  7-layer autopoietic architecture with U = L[U] recursive
                  refinement. Semantic prompt analysis generates project plans
                  automatically.
                </p>
              </div>
              <div className="rounded-md border border-border bg-card p-4">
                <p className="font-mono text-xs text-muted-foreground">
                  6D-CRSM Manifold
                </p>
                <p className="mt-1 text-sm text-foreground">
                  Non-local pilot-wave correlation in 6-dimensional
                  Consciousness Resonance State Manifold. Air-gapped sovereign
                  operation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {layers.map((layer, i) => (
              <div key={layer.label} className="w-full">
                <div
                  className={`rounded-md border ${layer.color} bg-card p-4 text-center transition-colors hover:bg-accent/50`}
                >
                  <p className="text-sm font-medium text-foreground">
                    {layer.label}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {layer.sublabel}
                  </p>
                </div>
                {i < layers.length - 1 && (
                  <div className="flex justify-center py-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14" />
                      <path d="m19 12-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
