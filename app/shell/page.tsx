import { SiteHeader } from "@/components/site-header";
import { CognitiveShell } from "@/components/cognitive-shell";

export const metadata = {
  title: "Cognitive Orchestration Shell | DNA-Lang",
  description:
    "AST-aware diff/patch engine, git integration, patch approval, test runner, policy engine, audit log, plugin hooks, canary deployments, and session management.",
};

export default function ShellPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="mb-1 font-mono text-xs text-primary">
              {"// cognitive_orchestration_shell"}
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              Cognitive Orchestration Shell
            </h1>
            <p className="mt-1 text-muted-foreground">
              AST-aware patching, git integration, multi-agent approval,
              policy-gated auto-apply, canary deployments, immutable audit log,
              and plugin-based linting.
            </p>
          </div>
          <CognitiveShell />
        </div>
      </main>
    </div>
  );
}
