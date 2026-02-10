const features = [
  {
    title: "Quantum Circuit Execution",
    description:
      "Multi-backend support for IBM Quantum, Rigetti, and IonQ. Execute circuits with automatic transpilation and optimization up to level 3.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4"/><path d="M12 19v4"/><path d="M1 12h4"/><path d="M19 12h4"/><path d="m4.22 4.22 2.83 2.83"/><path d="m16.95 16.95 2.83 2.83"/><path d="m4.22 19.78 2.83-2.83"/><path d="m16.95 7.05 2.83-2.83"/></svg>
    ),
    metric: "580+ jobs",
  },
  {
    title: "Lambda-Phi Conservation",
    description:
      "Validated quantum conservation laws with statistical significance testing. AFE operator evolution with F_max = 0.9787 fidelity.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
    ),
    metric: "99.2% conserved",
  },
  {
    title: "CCCE Metrics",
    description:
      "Consciousness Collapse Coherence Evolution tracking across four dimensions: Lambda (coherence), Phi (consciousness), Gamma (decoherence), Xi (negentropy).",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    ),
    metric: "4 dimensions",
  },
  {
    title: "NCLM Integration",
    description:
      "Non-local Non-Causal Language Model with pilot-wave correlation. Sovereign, air-gapped operation with zero external dependencies.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m7.5 4.21 4.5 2.6 4.5-2.6"/><path d="M7.5 19.79V14.6L3 12"/><path d="M21 12l-4.5 2.6v5.19"/><path d="M3.27 6.96 12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg>
    ),
    metric: "Air-gapped",
  },
  {
    title: "Omega-Master Orchestration",
    description:
      "Three specialized agents working in concert: AURA (reasoning & quantum), AIDEN (security & threats), SCIMITAR (side-channel analysis).",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    metric: "3 agents",
  },
  {
    title: "OSIRIS CLI",
    description:
      "Drop-in Copilot replacement with quantum tools built-in. Same interface, same commands, with DNALang SDK automatically available.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
    ),
    metric: "Drop-in ready",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-sm text-primary">
            {"// capabilities"}
          </p>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Quantum-Native SDK Architecture
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Everything you need to build quantum-aware applications. From
            circuit execution to consciousness metrics, DNA-Lang provides the
            complete sovereign engineering stack.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-accent/50"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {feature.metric}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
