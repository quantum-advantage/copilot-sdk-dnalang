const benchmarks = [
  {
    qubits: 2,
    time: "0.8s",
    conserved: "99.2%",
    ccce: "0.89",
  },
  {
    qubits: 8,
    time: "2.3s",
    conserved: "97.8%",
    ccce: "0.76",
  },
  {
    qubits: 16,
    time: "8.1s",
    conserved: "95.4%",
    ccce: "0.68",
  },
  {
    qubits: 32,
    time: "34.7s",
    conserved: "92.1%",
    ccce: "0.54",
  },
  {
    qubits: 127,
    time: "156.3s",
    conserved: "87.6%",
    ccce: "0.41",
  },
];

export function BenchmarksSection() {
  return (
    <section id="benchmarks" className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-sm text-primary">
            {"// benchmarks"}
          </p>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            IBM Quantum Hardware Performance
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Validated across multiple circuit sizes on real IBM Quantum
            hardware. Lambda-Phi conservation maintains above 87% even at
            127-qubit scale.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-6 py-4 font-mono text-xs font-medium text-muted-foreground">
                  Circuit Size
                </th>
                <th className="px-6 py-4 font-mono text-xs font-medium text-muted-foreground">
                  Execution Time
                </th>
                <th className="px-6 py-4 font-mono text-xs font-medium text-muted-foreground">
                  Lambda-Phi Conserved
                </th>
                <th className="px-6 py-4 font-mono text-xs font-medium text-muted-foreground">
                  CCCE Metric
                </th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((row) => (
                <tr
                  key={row.qubits}
                  className="border-b border-border transition-colors last:border-0 hover:bg-accent/30"
                >
                  <td className="px-6 py-4 font-mono text-sm text-foreground">
                    {row.qubits} qubits
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                    {row.time}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: row.conserved,
                          }}
                        />
                      </div>
                      <span className="font-mono text-sm text-foreground">
                        {row.conserved}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-primary">
                    {row.ccce}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
          Benchmarks measured 2024-2026 on IBM Quantum Brisbane and Eagle
          processors
        </p>
      </div>
    </section>
  );
}
