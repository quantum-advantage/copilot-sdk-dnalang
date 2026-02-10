export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                D
              </div>
              <span className="font-mono text-sm font-semibold text-foreground">
                DNA-Lang
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sovereign Quantum Engineering SDK. Built by ENKI-420.
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {"MIT License"}
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-foreground">SDK</h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Getting Started", href: "/docs/getting-started.md" },
                { label: "API Reference", href: "/dnalang/docs/API.md" },
                { label: "Cookbook", href: "/cookbook/README.md" },
                { label: "Examples", href: "/cookbook/dnalang/README.md" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-foreground">
              Quantum
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                "Lambda-Phi Conservation",
                "CCCE Metrics",
                "NCLM Integration",
                "Omega-Master",
              ].map((item) => (
                <li
                  key={item}
                  className="text-sm text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-foreground">
              Links
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                {
                  label: "GitHub (ENKI-420)",
                  href: "https://github.com/ENKI-420",
                },
                {
                  label: "IBM TechXchange",
                  href: "https://community.ibm.com",
                },
                {
                  label: "npm: dnaos-ultimate",
                  href: "https://classic.yarnpkg.com/en/package/dnaos-ultimate",
                },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            DNA-Lang Copilot SDK. Quantum-native development.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {"LP = 2.176435e-08 s^-1"}
          </p>
        </div>
      </div>
    </footer>
  );
}
