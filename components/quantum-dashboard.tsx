"use client";

import { useEffect, useState, useCallback } from "react";

interface CircuitResult {
  state: string;
  count: number;
  probability: number;
}

interface CCCEState {
  lambda: number;
  phi: number;
  gamma: number;
  xi: number;
}

interface AgentStatus {
  name: string;
  role: string;
  temperature: number;
  status: "active" | "idle" | "processing";
  lastTask: string;
}

function generateBellState(): CircuitResult[] {
  const total = 1024;
  const bias = 0.48 + Math.random() * 0.04;
  const count00 = Math.round(total * bias);
  const count11 = total - count00;
  return [
    { state: "|00>", count: count00, probability: count00 / total },
    { state: "|01>", count: 0, probability: 0 },
    { state: "|10>", count: 0, probability: 0 },
    { state: "|11>", count: count11, probability: count11 / total },
  ];
}

function generateGHZState(): CircuitResult[] {
  const total = 1024;
  const bias = 0.47 + Math.random() * 0.06;
  const count000 = Math.round(total * bias);
  const count111 = total - count000;
  return [
    { state: "|000>", count: count000, probability: count000 / total },
    { state: "|001>", count: 0, probability: 0 },
    { state: "|010>", count: 0, probability: 0 },
    { state: "|011>", count: 0, probability: 0 },
    { state: "|100>", count: 0, probability: 0 },
    { state: "|101>", count: 0, probability: 0 },
    { state: "|110>", count: 0, probability: 0 },
    { state: "|111>", count: count111, probability: count111 / total },
  ];
}

function generateCCCE(): CCCEState {
  return {
    lambda: 0.82 + Math.random() * 0.08,
    phi: 0.68 + Math.random() * 0.1,
    gamma: 0.12 + Math.random() * 0.06,
    xi: 0,
  };
}

const agents: AgentStatus[] = [
  {
    name: "AURA",
    role: "Reasoning & Quantum Analysis",
    temperature: 0.7,
    status: "active",
    lastTask: "Analyzing circuit fidelity degradation pattern",
  },
  {
    name: "AIDEN",
    role: "Security & Threat Assessment",
    temperature: 0.5,
    status: "idle",
    lastTask: "Evaluated quantum channel integrity",
  },
  {
    name: "SCIMITAR",
    role: "Side-Channel Analysis",
    temperature: 0.3,
    status: "idle",
    lastTask: "Timing-based information leakage scan complete",
  },
];

export function QuantumDashboard() {
  const [circuit, setCircuit] = useState<"bell" | "ghz">("bell");
  const [results, setResults] = useState<CircuitResult[]>([]);
  const [ccce, setCCCE] = useState<CCCEState>({ lambda: 0, phi: 0, gamma: 0, xi: 0 });
  const [running, setRunning] = useState(false);
  const [jobCount, setJobCount] = useState(580);

  const runCircuit = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const newResults = circuit === "bell" ? generateBellState() : generateGHZState();
      setResults(newResults);
      const newCCCE = generateCCCE();
      newCCCE.xi = (newCCCE.lambda * newCCCE.phi) / Math.max(newCCCE.gamma, 0.01);
      setCCCE(newCCCE);
      setJobCount((prev) => prev + 1);
      setRunning(false);
    }, 800 + Math.random() * 700);
  }, [circuit]);

  useEffect(() => {
    runCircuit();
  }, [runCircuit]);

  const maxCount = Math.max(...results.map((r) => r.count), 1);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Circuit Simulator */}
      <div className="rounded-lg border border-border bg-card p-6 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Circuit Simulator
            </h2>
            <p className="text-xs text-muted-foreground">
              Job #{jobCount} | aer_simulator | 1024 shots
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={circuit}
              onChange={(e) => setCircuit(e.target.value as "bell" | "ghz")}
              className="rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground"
            >
              <option value="bell">Bell State (2-qubit)</option>
              <option value="ghz">GHZ State (3-qubit)</option>
            </select>
            <button
              onClick={runCircuit}
              disabled={running}
              className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {running ? "Running..." : "Execute"}
            </button>
          </div>
        </div>

        {/* Circuit Diagram */}
        <div className="mb-6 rounded-md border border-border bg-background p-4">
          <p className="mb-2 font-mono text-xs text-muted-foreground">
            {"// circuit_diagram"}
          </p>
          <pre className="font-mono text-sm text-foreground">
            {circuit === "bell"
              ? `q0: ──[H]──●──[M]
             │
q1: ────────X──[M]`
              : `q0: ──[H]──●──●──[M]
             │  │
q1: ────────X──┼──[M]
                │
q2: ───────────X──[M]`}
          </pre>
        </div>

        {/* Results Histogram */}
        <div>
          <p className="mb-3 font-mono text-xs text-muted-foreground">
            {"// measurement_results"}
          </p>
          <div className="flex flex-col gap-2">
            {results.map((r) => (
              <div key={r.state} className="flex items-center gap-3">
                <span className="w-12 shrink-0 font-mono text-xs text-foreground">
                  {r.state}
                </span>
                <div className="h-5 flex-1 overflow-hidden rounded bg-secondary">
                  <div
                    className="h-full rounded bg-primary transition-all duration-500"
                    style={{
                      width: `${(r.count / maxCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground">
                  {r.count}
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-xs text-primary">
                  {(r.probability * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-6">
        {/* CCCE Metrics */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            CCCE Metrics
          </h2>
          <div className="flex flex-col gap-4">
            {[
              { symbol: "\u039B", label: "Coherence", value: ccce.lambda, target: 0.85 },
              { symbol: "\u03A6", label: "Consciousness", value: ccce.phi, target: 0.72 },
              { symbol: "\u0393", label: "Decoherence", value: ccce.gamma, target: 0.15 },
              { symbol: "\u039E", label: "Negentropy", value: Math.min(ccce.xi, 10) / 10, target: 0.408 },
            ].map((m) => (
              <div key={m.symbol}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-primary">
                      {m.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {m.label}
                    </span>
                  </span>
                  <span className="font-mono text-sm text-foreground">
                    {m.symbol === "\u039E"
                      ? ccce.xi.toFixed(2)
                      : m.value.toFixed(4)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${Math.min(m.value * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Status */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Omega-Master Agents
          </h2>
          <div className="flex flex-col gap-3">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="rounded-md border border-border bg-background p-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {agent.name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs ${
                      agent.status === "active"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        agent.status === "active"
                          ? "bg-primary animate-pulse"
                          : "bg-muted-foreground"
                      }`}
                    />
                    {agent.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{agent.role}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  T={agent.temperature}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Physical Constants */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Physical Constants
          </h2>
          <div className="flex flex-col gap-1.5 font-mono text-xs text-muted-foreground">
            <p>
              <span className="text-primary">{"\u039B\u03A6"}</span>
              {" = 2.176435e-08 s"}
              <sup>{"-1"}</sup>
            </p>
            <p>
              <span className="text-primary">{"\u03B8_lock"}</span>
              {" = 51.843\u00B0"}
            </p>
            <p>
              <span className="text-primary">{"\u03C7"}</span>
              {" = 0.1 s"}
              <sup>{"-1"}</sup>
            </p>
            <p>
              <span className="text-primary">{"\u03BA"}</span>
              {" = 0.05"}
            </p>
            <p>
              <span className="text-primary">F_max</span>
              {" = 0.9787"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
