"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ShellTab =
  | "overview"
  | "diff"
  | "git"
  | "approval"
  | "tests"
  | "policy"
  | "audit"
  | "plugins"
  | "sessions";

interface DiffHunk {
  file: string;
  language: string;
  before: string;
  after: string;
  astDelta: string;
  rank: number;
  approved: boolean | null;
}

interface GitCommit {
  sha: string;
  message: string;
  author: string;
  timestamp: string;
  files: number;
  insertions: number;
  deletions: number;
}

interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  failures: { name: string; error: string }[];
}

interface CoverageFile {
  path: string;
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target: string;
  hash: string;
}

interface CanaryStage {
  name: string;
  traffic: number;
  status: "pending" | "running" | "passed" | "failed";
  errorRate: number;
}

interface Plugin {
  id: string;
  name: string;
  type: "linter" | "fixer" | "hook" | "analytics";
  enabled: boolean;
  version: string;
  lastRun: string;
  issues: number;
}

interface TelemetryPoint {
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "flat";
}

interface AgentVote {
  agent: string;
  role: string;
  vote: "approve" | "reject" | "abstain";
  confidence: number;
  reason: string;
}

interface SessionData {
  id: string;
  name: string;
  created: string;
  patches: number;
  tests: number;
  status: "active" | "archived";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DIFFS: DiffHunk[] = [
  {
    file: "src/quantum/circuit.ts",
    language: "typescript",
    before: `function executeCircuit(shots: number) {
  const results = [];
  for (let i = 0; i < shots; i++) {
    results.push(measure());
  }
  return results;
}`,
    after: `async function executeCircuit(shots: number): Promise<MeasureResult[]> {
  const results = await Promise.all(
    Array.from({ length: shots }, () => measure())
  );
  return results.filter(Boolean);
}`,
    astDelta: "FunctionDecl → AsyncFunctionDecl · ReturnType added · ForLoop → Promise.all · Array.filter added",
    rank: 94,
    approved: null,
  },
  {
    file: "lib/lambda-phi/validator.py",
    language: "python",
    before: `def validate(circuit, ops):
    ratio = compute_ratio(circuit, ops)
    return ratio > 0.87`,
    after: `def validate(circuit: QuantumCircuit, ops: list[str]) -> ValidationResult:
    ratio = compute_ratio(circuit, ops)
    significance = statistical_test(ratio)
    return ValidationResult(passed=ratio > 0.87, p_value=significance)`,
    astDelta: "FunctionDef · TypeAnnotations added · BoolReturn → NamedTuple return",
    rank: 87,
    approved: null,
  },
];

const MOCK_COMMITS: GitCommit[] = [
  {
    sha: "a1b2c3d",
    message: "feat: add async circuit execution with Promise.all",
    author: "AURA",
    timestamp: "2026-02-23T01:10:00Z",
    files: 3,
    insertions: 48,
    deletions: 21,
  },
  {
    sha: "e4f5a6b",
    message: "fix: lambda-phi validator type annotations",
    author: "AIDEN",
    timestamp: "2026-02-23T00:55:00Z",
    files: 1,
    insertions: 12,
    deletions: 5,
  },
  {
    sha: "7c8d9e0",
    message: "refactor: extract consciousness analyzer to module",
    author: "SCIMITAR",
    timestamp: "2026-02-22T23:40:00Z",
    files: 6,
    insertions: 135,
    deletions: 98,
  },
];

const MOCK_TESTS: TestResult[] = [
  {
    suite: "QuantumCircuit",
    passed: 48,
    failed: 1,
    skipped: 2,
    duration: 1240,
    failures: [
      {
        name: "test_ghz_state_fidelity",
        error: "AssertionError: fidelity 0.832 < threshold 0.85",
      },
    ],
  },
  {
    suite: "LambdaPhiValidator",
    passed: 32,
    failed: 0,
    skipped: 0,
    duration: 880,
    failures: [],
  },
  {
    suite: "NCLMProvider",
    passed: 21,
    failed: 0,
    skipped: 4,
    duration: 320,
    failures: [],
  },
];

const MOCK_COVERAGE: CoverageFile[] = [
  { path: "src/quantum/circuit.ts", statements: 94, branches: 88, functions: 100, lines: 94 },
  { path: "src/quantum/backend.ts", statements: 81, branches: 75, functions: 87, lines: 82 },
  { path: "lib/lambda-phi/validator.py", statements: 97, branches: 91, functions: 100, lines: 97 },
  { path: "lib/nclm/provider.py", statements: 73, branches: 68, functions: 80, lines: 74 },
  { path: "lib/consciousness/analyzer.py", statements: 88, branches: 83, functions: 92, lines: 88 },
];

const MOCK_AUDIT: AuditEntry[] = [
  {
    id: "evt-001",
    ts: "2026-02-23T01:10:12Z",
    actor: "AURA",
    action: "PATCH_APPLIED",
    target: "src/quantum/circuit.ts",
    hash: "sha256:4a9f1c…",
  },
  {
    id: "evt-002",
    ts: "2026-02-23T01:09:44Z",
    actor: "operator",
    action: "PATCH_APPROVED",
    target: "src/quantum/circuit.ts",
    hash: "sha256:b72e3d…",
  },
  {
    id: "evt-003",
    ts: "2026-02-23T01:08:30Z",
    actor: "AIDEN",
    action: "POLICY_CHECK",
    target: "auto-apply gate",
    hash: "sha256:e91a0f…",
  },
  {
    id: "evt-004",
    ts: "2026-02-23T00:55:01Z",
    actor: "AURA",
    action: "PATCH_RANKED",
    target: "lib/lambda-phi/validator.py",
    hash: "sha256:c30b7e…",
  },
  {
    id: "evt-005",
    ts: "2026-02-23T00:40:18Z",
    actor: "system",
    action: "ROLLBACK_TRIGGERED",
    target: "canary:v0.2.1-rc3",
    hash: "sha256:f48d2a…",
  },
];

const MOCK_CANARY: CanaryStage[] = [
  { name: "Canary 5%", traffic: 5, status: "passed", errorRate: 0.01 },
  { name: "Canary 25%", traffic: 25, status: "passed", errorRate: 0.02 },
  { name: "Canary 50%", traffic: 50, status: "running", errorRate: 0.03 },
  { name: "Full Rollout", traffic: 100, status: "pending", errorRate: 0 },
];

const MOCK_PLUGINS: Plugin[] = [
  { id: "eslint", name: "ESLint", type: "linter", enabled: true, version: "8.57", lastRun: "2min ago", issues: 3 },
  { id: "ruff", name: "Ruff", type: "linter", enabled: true, version: "0.3.4", lastRun: "2min ago", issues: 1 },
  { id: "prettier", name: "Prettier", type: "fixer", enabled: true, version: "3.2", lastRun: "5min ago", issues: 0 },
  { id: "ast-guard", name: "AST Guard", type: "hook", enabled: true, version: "1.0", lastRun: "10s ago", issues: 0 },
  { id: "telemetry-hook", name: "Telemetry Hook", type: "analytics", enabled: true, version: "2.1", lastRun: "10s ago", issues: 0 },
  { id: "bandit", name: "Bandit", type: "linter", enabled: false, version: "1.7", lastRun: "never", issues: 0 },
];

const MOCK_TELEMETRY: TelemetryPoint[] = [
  { label: "Patches / hr", value: 24, unit: "patches", trend: "up" },
  { label: "Test Pass Rate", value: 97.8, unit: "%", trend: "up" },
  { label: "Avg. Apply Time", value: 1.4, unit: "s", trend: "down" },
  { label: "Rollbacks / day", value: 0, unit: "events", trend: "flat" },
  { label: "Coverage Δ", value: +2.3, unit: "%", trend: "up" },
  { label: "Agent Latency", value: 340, unit: "ms", trend: "down" },
];

const MOCK_VOTES: AgentVote[] = [
  { agent: "AURA", role: "Reasoning", vote: "approve", confidence: 0.94, reason: "Pattern matches idiomatic async upgrade; tests pass." },
  { agent: "AIDEN", role: "Security", vote: "approve", confidence: 0.88, reason: "No new attack surface. Promise.all is sandboxed." },
  { agent: "SCIMITAR", role: "Side-Channel", vote: "abstain", confidence: 0.5, reason: "Timing analysis incomplete on async path." },
];

const MOCK_SESSIONS: SessionData[] = [
  { id: "sess-20260223", name: "Async Circuit Refactor", created: "2026-02-23T00:00:00Z", patches: 3, tests: 102, status: "active" },
  { id: "sess-20260222", name: "Lambda-Phi Typing", created: "2026-02-22T10:00:00Z", patches: 1, tests: 53, status: "archived" },
  { id: "sess-20260220", name: "NCLM v2 Integration", created: "2026-02-20T08:00:00Z", patches: 7, tests: 180, status: "archived" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs font-medium ${color}`}
    >
      {children}
    </span>
  );
}

function ProgressBar({ value, max = 100, color = "bg-primary" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 ${className}`}>
      {children}
    </div>
  );
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

function OverviewPanel() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_TELEMETRY.map((t) => (
          <Card key={t.label}>
            <p className="text-xs text-muted-foreground">{t.label}</p>
            <div className="mt-1 flex items-end gap-1">
              <span className="font-mono text-2xl font-bold text-foreground">
                {t.value}
              </span>
              <span className="mb-0.5 font-mono text-xs text-muted-foreground">
                {t.unit}
              </span>
              <span
                className={`mb-0.5 ml-auto font-mono text-xs ${
                  t.trend === "up"
                    ? "text-primary"
                    : t.trend === "down"
                    ? "text-red-400"
                    : "text-muted-foreground"
                }`}
              >
                {t.trend === "up" ? "↑" : t.trend === "down" ? "↓" : "→"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Pipeline Health
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { label: "AST Diff Engine", status: "operational" },
            { label: "Git Integration", status: "operational" },
            { label: "Policy Gate", status: "operational" },
            { label: "Test Runner", status: "warning" },
            { label: "Canary Deployment", status: "operational" },
            { label: "Audit Log", status: "operational" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{s.label}</span>
              <Badge
                color={
                  s.status === "operational"
                    ? "bg-primary/10 text-primary"
                    : "bg-yellow-500/10 text-yellow-400"
                }
              >
                {s.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DiffPanel() {
  const [selected, setSelected] = useState(0);
  const diff = MOCK_DIFFS[selected];

  return (
    <div className="flex flex-col gap-6">
      {/* Patch selector */}
      <div className="flex gap-2">
        {MOCK_DIFFS.map((d, i) => (
          <button
            key={d.file}
            onClick={() => setSelected(i)}
            className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ${
              i === selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {d.file.split("/").pop()}
          </button>
        ))}
      </div>

      {/* AST Delta */}
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            {"// ast_delta · "}{diff.file}
          </p>
          <Badge color="bg-primary/10 text-primary">rank {diff.rank}</Badge>
        </div>
        <code className="block rounded-md bg-secondary px-3 py-2 font-mono text-xs text-foreground">
          {diff.astDelta}
        </code>
      </Card>

      {/* Inline Diff */}
      <Card>
        <p className="mb-3 font-mono text-xs text-muted-foreground">
          {"// inline_diff"}
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-1 text-xs text-red-400">− before</p>
            <pre className="overflow-x-auto rounded-md bg-red-500/5 p-3 font-mono text-xs leading-relaxed text-foreground border border-red-500/20">
              {diff.before}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-xs text-primary">+ after</p>
            <pre className="overflow-x-auto rounded-md bg-primary/5 p-3 font-mono text-xs leading-relaxed text-foreground border border-primary/20">
              {diff.after}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}

function GitPanel() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Branch Status
          </h3>
          <Badge color="bg-primary/10 text-primary">main ← shell/patch-2</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Ahead", value: "3 commits" },
            { label: "Behind", value: "0 commits" },
            { label: "Conflicts", value: "0 files" },
          ].map((s) => (
            <div key={s.label} className="rounded-md bg-secondary px-3 py-2">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-mono text-sm font-semibold text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Recent Commits
        </h3>
        <div className="flex flex-col divide-y divide-border">
          {MOCK_COMMITS.map((c) => (
            <div key={c.sha} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-foreground">{c.message}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {c.sha} · {c.author} · {new Date(c.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <span className="font-mono text-xs text-primary">
                    +{c.insertions}
                  </span>
                  <span className="font-mono text-xs text-red-400">
                    -{c.deletions}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ApprovalPanel() {
  const [diffs, setDiffs] = useState(MOCK_DIFFS);

  const vote = useCallback((index: number, decision: boolean) => {
    setDiffs((prev) =>
      prev.map((d, i) => (i === index ? { ...d, approved: decision } : d))
    );
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Patch Ranking */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Patch Ranking
        </h3>
        <div className="flex flex-col gap-3">
          {[...diffs]
            .sort((a, b) => b.rank - a.rank)
            .map((d, i) => (
              <div key={d.file} className="flex items-center gap-3">
                <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-mono text-xs text-foreground">
                    {d.file}
                  </p>
                  <ProgressBar value={d.rank} />
                </div>
                <span className="font-mono text-xs text-primary">{d.rank}</span>
              </div>
            ))}
        </div>
      </Card>

      {/* Multi-agent Votes */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Multi-Agent Approval
        </h3>
        <div className="flex flex-col gap-3">
          {MOCK_VOTES.map((v) => (
            <div
              key={v.agent}
              className="rounded-md border border-border bg-background p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-foreground">
                  {v.agent}
                </span>
                <Badge
                  color={
                    v.vote === "approve"
                      ? "bg-primary/10 text-primary"
                      : v.vote === "reject"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }
                >
                  {v.vote} · {(v.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{v.role}</p>
              <p className="mt-1 text-xs text-muted-foreground">{v.reason}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Operator Approval */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Operator Review
        </h3>
        <div className="flex flex-col gap-4">
          {diffs.map((d, i) => (
            <div
              key={d.file}
              className="rounded-md border border-border bg-background p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-foreground">{d.file}</span>
                {d.approved === null ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => vote(i, true)}
                      className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => vote(i, false)}
                      className="rounded-md border border-red-500/40 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <Badge
                    color={
                      d.approved
                        ? "bg-primary/10 text-primary"
                        : "bg-red-500/10 text-red-400"
                    }
                  >
                    {d.approved ? "✓ approved" : "✗ rejected"}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TestsPanel() {
  const [refactoring, setRefactoring] = useState(false);
  const [refactorLog, setRefactorLog] = useState<string[]>([]);

  const runRefactor = useCallback(() => {
    setRefactoring(true);
    setRefactorLog([]);
    const steps = [
      "Analyzing failure: test_ghz_state_fidelity …",
      "AST parse of src/quantum/circuit.ts",
      "Identifying decoherence threshold constant …",
      "Proposing patch: lower threshold to 0.83 ± tolerance …",
      "Applying patch via policy engine …",
      "Re-running test_ghz_state_fidelity …",
      "✓ Test passed (fidelity=0.849 ≥ 0.83)",
    ];
    steps.forEach((step, i) => {
      setTimeout(() => {
        setRefactorLog((prev) => [...prev, step]);
        if (i === steps.length - 1) setRefactoring(false);
      }, (i + 1) * 600);
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Test Suites */}
      <div className="grid gap-4 sm:grid-cols-3">
        {MOCK_TESTS.map((t) => {
          const total = t.passed + t.failed + t.skipped;
          return (
            <Card key={t.suite}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{t.suite}</p>
                <span className="font-mono text-xs text-muted-foreground">
                  {t.duration}ms
                </span>
              </div>
              <ProgressBar
                value={t.passed}
                max={total}
                color={t.failed > 0 ? "bg-yellow-500" : "bg-primary"}
              />
              <div className="mt-2 flex gap-3">
                <span className="font-mono text-xs text-primary">
                  {t.passed} pass
                </span>
                {t.failed > 0 && (
                  <span className="font-mono text-xs text-red-400">
                    {t.failed} fail
                  </span>
                )}
                {t.skipped > 0 && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {t.skipped} skip
                  </span>
                )}
              </div>
              {t.failures.map((f) => (
                <div
                  key={f.name}
                  className="mt-2 rounded-md bg-red-500/10 px-2 py-1"
                >
                  <p className="font-mono text-xs text-red-400">{f.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {f.error}
                  </p>
                </div>
              ))}
            </Card>
          );
        })}
      </div>

      {/* Error Refactor Loop */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Autonomous Error Refactor Loop
          </h3>
          <button
            onClick={runRefactor}
            disabled={refactoring}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {refactoring ? "Running…" : "Run Refactor"}
          </button>
        </div>
        {refactorLog.length > 0 && (
          <div className="flex flex-col gap-1 rounded-md bg-secondary p-3">
            {refactorLog.map((line, i) => (
              <p key={i} className="font-mono text-xs text-foreground">
                <span className="text-primary">›</span> {line}
              </p>
            ))}
          </div>
        )}
      </Card>

      {/* Coverage Report */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Coverage Report
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">File</th>
                <th className="pb-2 pr-3 font-medium">Stmts</th>
                <th className="pb-2 pr-3 font-medium">Branch</th>
                <th className="pb-2 pr-3 font-medium">Funcs</th>
                <th className="pb-2 font-medium">Lines</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_COVERAGE.map((f) => (
                <tr key={f.path}>
                  <td className="py-2 pr-4 text-foreground">
                    {f.path.split("/").pop()}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={
                        f.statements >= 90 ? "text-primary" : "text-yellow-400"
                      }
                    >
                      {f.statements}%
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={
                        f.branches >= 85 ? "text-primary" : "text-yellow-400"
                      }
                    >
                      {f.branches}%
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={
                        f.functions >= 90 ? "text-primary" : "text-yellow-400"
                      }
                    >
                      {f.functions}%
                    </span>
                  </td>
                  <td className="py-2">
                    <span
                      className={
                        f.lines >= 90 ? "text-primary" : "text-yellow-400"
                      }
                    >
                      {f.lines}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PolicyPanel() {
  const [autoApply, setAutoApply] = useState(false);
  const [canaryStages, setCanaryStages] = useState(MOCK_CANARY);

  const advanceCanary = useCallback(() => {
    setCanaryStages((prev) => {
      const runningIdx = prev.findIndex((s) => s.status === "running");
      if (runningIdx === -1) return prev;
      return prev.map((s, i) => {
        if (i === runningIdx) return { ...s, status: "passed" as const };
        if (i === runningIdx + 1) return { ...s, status: "running" as const };
        return s;
      });
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Policy Config */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Auto-Apply Policy Engine
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { id: "tests-pass", label: "All tests must pass", enforced: true },
            { id: "coverage", label: "Coverage ≥ 85%", enforced: true },
            { id: "peer-review", label: "Agent quorum (2/3 approve)", enforced: true },
            { id: "operator", label: "Operator sign-off required", enforced: !autoApply },
          ].map((rule) => (
            <div key={rule.id} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
              <span className="text-sm text-foreground">{rule.label}</span>
              <Badge
                color={rule.enforced ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
              >
                {rule.enforced ? "enforced" : "waived"}
              </Badge>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
            <span className="text-sm text-foreground">Safe auto-apply mode</span>
            <button
              onClick={() => setAutoApply((v) => !v)}
              className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors ${
                autoApply ? "bg-primary" : "bg-secondary"
              }`}
              role="switch"
              aria-checked={autoApply}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${
                  autoApply ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Canary Deployment */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Canary Deployment
          </h3>
          <button
            onClick={advanceCanary}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent"
          >
            Advance Stage
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {canaryStages.map((stage) => (
            <div
              key={stage.name}
              className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
            >
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  stage.status === "passed"
                    ? "bg-primary"
                    : stage.status === "running"
                    ? "bg-yellow-400 animate-pulse"
                    : stage.status === "failed"
                    ? "bg-red-400"
                    : "bg-secondary"
                }`}
              />
              <span className="flex-1 text-sm text-foreground">{stage.name}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {stage.traffic}% traffic
              </span>
              <Badge
                color={
                  stage.status === "passed"
                    ? "bg-primary/10 text-primary"
                    : stage.status === "running"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : stage.status === "failed"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-secondary text-muted-foreground"
                }
              >
                {stage.status}
              </Badge>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Autonomous rollback triggers at error rate &gt; 1%. Rollback latency &lt; 30s.
        </p>
      </Card>
    </div>
  );
}

function AuditPanel() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Immutable Audit Log
          </h3>
          <Badge color="bg-primary/10 text-primary">append-only · SHA-256</Badge>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {MOCK_AUDIT.map((e) => (
            <div key={e.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge color="bg-secondary text-foreground">{e.action}</Badge>
                    <span className="truncate font-mono text-xs text-muted-foreground">
                      {e.target}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {e.actor} · {new Date(e.ts).toLocaleTimeString()} · {e.hash}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {e.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PluginsPanel() {
  const [plugins, setPlugins] = useState(MOCK_PLUGINS);

  const toggle = useCallback((id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Plugin Registry
        </h3>
        <div className="flex flex-col divide-y divide-border">
          {plugins.map((p) => (
            <div key={p.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {p.name}
                    </span>
                    <Badge
                      color={
                        p.type === "linter"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : p.type === "fixer"
                          ? "bg-primary/10 text-primary"
                          : p.type === "hook"
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-blue-500/10 text-blue-400"
                      }
                    >
                      {p.type}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      v{p.version}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    Last run: {p.lastRun}
                    {p.issues > 0 && (
                      <span className="ml-2 text-yellow-400">
                        {p.issues} issue{p.issues !== 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => toggle(p.id)}
                  className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors ${
                    p.enabled ? "bg-primary" : "bg-secondary"
                  }`}
                  role="switch"
                  aria-checked={p.enabled}
                  aria-label={`Toggle ${p.name}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${
                      p.enabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SessionsPanel() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [importing, setImporting] = useState(false);

  const exportSession = useCallback((id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) return;
    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessions]);

  const importSession = useCallback(() => {
    setImporting(true);
    setTimeout(() => {
      const newSession: SessionData = {
        id: `sess-import-${Date.now()}`,
        name: "Imported Session",
        created: new Date().toISOString(),
        patches: 0,
        tests: 0,
        status: "active",
      };
      setSessions((prev) => [newSession, ...prev]);
      setImporting(false);
    }, 800);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Sessions</h3>
          <button
            onClick={importSession}
            disabled={importing}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-accent disabled:opacity-50"
          >
            {importing ? "Importing…" : "Import Session"}
          </button>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {sessions.map((s) => (
            <div key={s.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-foreground">{s.name}</span>
                    <Badge
                      color={
                        s.status === "active"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }
                    >
                      {s.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {s.id} · {s.patches} patches · {s.tests} tests ·{" "}
                    {new Date(s.created).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => exportSession(s.id)}
                  className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Shell Component ─────────────────────────────────────────────────────

const TABS: { id: ShellTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "diff", label: "Diff & Patch" },
  { id: "git", label: "Git" },
  { id: "approval", label: "Approval" },
  { id: "tests", label: "Tests" },
  { id: "policy", label: "Policy" },
  { id: "audit", label: "Audit Log" },
  { id: "plugins", label: "Plugins" },
  { id: "sessions", label: "Sessions" },
];

export function CognitiveShell() {
  const [activeTab, setActiveTab] = useState<ShellTab>("overview");

  return (
    <div>
      {/* Tab Bar */}
      <div className="mb-6 overflow-x-auto border-b border-border">
        <div className="flex gap-1 pb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewPanel />}
      {activeTab === "diff" && <DiffPanel />}
      {activeTab === "git" && <GitPanel />}
      {activeTab === "approval" && <ApprovalPanel />}
      {activeTab === "tests" && <TestsPanel />}
      {activeTab === "policy" && <PolicyPanel />}
      {activeTab === "audit" && <AuditPanel />}
      {activeTab === "plugins" && <PluginsPanel />}
      {activeTab === "sessions" && <SessionsPanel />}
    </div>
  );
}
