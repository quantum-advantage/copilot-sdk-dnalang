const citations = [
  {
    source: "IBM TechXchange Community",
    title: "Quantum circuit fidelity for agile systems",
    excerpt:
      "The DNA-Lang specification views a quantum circuit as a formal, computational artifact whose real-world fidelity is an intrinsic part of its definition.",
    date: "Oct 27, 2025",
    url: "https://community.ibm.com",
  },
  {
    source: "IBM TechXchange Community",
    title: "The Evolving Landscape of AI Model Training Services",
    excerpt:
      "The core of our approach is the DNALANG Quantum Operating System, a framework designed to eliminate disorder (Entropy) in both computational and physical systems.",
    date: "Oct 25, 2025",
    url: "https://community.ibm.com",
  },
  {
    source: "Yarn Package Registry",
    title: "dnaos-ultimate",
    excerpt:
      "The Ultimate DNA-Lang Runtime: Multi-Agent Evolution, MCP Tools, and Phase-Conjugate Intelligence for Living Software Systems.",
    date: "2025",
    url: "https://classic.yarnpkg.com/en/package/dnaos-ultimate",
  },
];

const timeline = [
  {
    date: "Dec 2024",
    event: "DNA-Lang specification published with 138 research sources",
  },
  {
    date: "Jan 2025",
    event: "Lambda-Phi conservation validated: F_max = 0.9787",
  },
  {
    date: "Oct 2025",
    event: "IBM TechXchange citations recognizing quantum circuit fidelity work",
  },
  {
    date: "Jan 2026",
    event: "OSIRIS CLI integration with GitHub Copilot SDK complete",
  },
  {
    date: "Jan 2026",
    event: "580+ quantum jobs, 515K+ shots processed on IBM Quantum hardware",
  },
  {
    date: "Feb 2026",
    event: "Sovereign Fleet Architecture and OSIRIS DevOS deployment strategy",
  },
];

export function CitationsSection() {
  return (
    <section className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-sm text-primary">
              {"// provenance"}
            </p>
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Published Record
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              DNA-Lang is recognized in the global research community with
              citations on IBM TechXchange and published packages on public
              registries.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {citations.map((cite) => (
                <a
                  key={cite.title}
                  href={cite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/30"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-xs text-primary">
                      {cite.source}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {cite.date}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary">
                    {cite.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {cite.excerpt}
                  </p>
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 font-mono text-sm text-primary">
              {"// timeline"}
            </p>
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Development Timeline
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Active development and continuous shipping, from initial
              specification through hardware validation to production
              deployment.
            </p>

            <div className="relative mt-8">
              <div className="absolute left-3 top-0 h-full w-px bg-border" />
              <div className="flex flex-col gap-6">
                {timeline.map((item, i) => (
                  <div key={i} className="relative flex gap-4 pl-10">
                    <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                    <div>
                      <span className="font-mono text-xs text-primary">
                        {item.date}
                      </span>
                      <p className="mt-0.5 text-sm text-foreground">
                        {item.event}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
