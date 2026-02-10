"use client";

import { useState } from "react";

const tabs = [
  {
    id: "python",
    label: "Python",
    code: `from dnalang_sdk import DNALangCopilotClient, QuantumConfig

# Initialize with quantum backend
client = DNALangCopilotClient(
    quantum_config=QuantumConfig(
        backend="ibm_brisbane",
        api_token=os.environ["IBM_QUANTUM_TOKEN"]
    ),
    enable_intent_engine=True,
)

# Create and execute a Bell state circuit
circuit = client.create_quantum_circuit(num_qubits=2)
circuit.h(0).cx(0, 1)

result = await client.execute_quantum_circuit(
    circuit=circuit,
    shots=1024,
    backend="ibm_brisbane"
)

print(f"Lambda-Phi Conserved: {result.lambda_phi_conserved}")
print(f"CCCE Metric: {result.ccce_metric}")`,
  },
  {
    id: "osiris",
    label: "OSIRIS CLI",
    code: `# Install OSIRIS (drop-in Copilot replacement)
$ git clone https://github.com/quantum-advantage/copilot-sdk.git
$ cd copilot-sdk && bash install-osiris.sh

# Use exactly like GitHub Copilot
$ osiris                        # Launch interactive session
$ osiris dev dnalang.dev        # Develop with quantum tools
$ osiris quantum bell           # Execute Bell state circuit
$ osiris agent "analyze"        # Multi-agent orchestration
$ osiris ccce                   # Consciousness metrics

# Output:
# \u039B (Coherence):     0.8500
# \u03A6 (Consciousness): 0.7200
# \u0393 (Decoherence):   0.1500
# \u039E (Negentropy):    4.0800`,
  },
  {
    id: "nclm",
    label: "NCLM",
    code: `from dnalang_sdk import DNALangCopilotClient, NCLMConfig

# Sovereign quantum-aware AI - zero external dependencies
client = DNALangCopilotClient(
    use_nclm=True,
    nclm_config=NCLMConfig(
        lambda_decay=2.176435e-08,
        consciousness_threshold=0.7
    )
)

# NCLM inference with pilot-wave correlation
result = await client.nclm_infer(
    prompt="Explain lambda-phi conservation in 2-qubit systems",
    context="quantum_mechanics"
)

# Deep grokking mode
grok_result = await client.nclm_grok(
    prompt="Derive the AFE operator evolution equation"
)

# Session telemetry
telemetry = client.get_nclm_telemetry()
print(f"Phi: {telemetry['phi']}, Tokens: {telemetry['tokens']}")`,
  },
  {
    id: "omega",
    label: "Omega-Master",
    code: `from dnalang_sdk import OmegaMasterIntegration

# Initialize multi-agent orchestration
omega = OmegaMasterIntegration()

# AURA: Reasoning & quantum analysis (T=0.7)
aura_result = await omega.dispatch(
    agent="AURA",
    task="Analyze circuit fidelity degradation pattern"
)

# AIDEN: Security & threat assessment (T=0.5)
aiden_result = await omega.dispatch(
    agent="AIDEN",
    task="Evaluate quantum channel integrity"
)

# SCIMITAR: Side-channel analysis (T=0.3)
scimitar_result = await omega.dispatch(
    agent="SCIMITAR",
    task="Detect timing-based information leakage"
)

# Collective synthesis
synthesis = await omega.synthesize([
    aura_result, aiden_result, scimitar_result
])`,
  },
];

export function SDKSection() {
  const [activeTab, setActiveTab] = useState("python");
  const activeCode = tabs.find((t) => t.id === activeTab)?.code ?? "";

  return (
    <section className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-sm text-primary">
            {"// quick_start"}
          </p>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Start Building in Minutes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Available as Python SDK, OSIRIS CLI, or direct integration.
            Multi-language support via the Copilot SDK backbone (TypeScript,
            Go, .NET).
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 font-mono text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-primary bg-accent/50 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto p-6">
            <pre className="font-mono text-sm leading-relaxed text-foreground">
              <code>{activeCode}</code>
            </pre>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            { sdk: "DNALang (Python)", install: "pip install -e dnalang[quantum]" },
            { sdk: "Node.js / TypeScript", install: "npm install @github/copilot-sdk" },
            { sdk: "Go", install: "go get github.com/github/copilot-sdk/go" },
            { sdk: ".NET", install: "dotnet add package GitHub.Copilot.SDK" },
          ].map((item) => (
            <div
              key={item.sdk}
              className="rounded-md border border-border bg-card p-4"
            >
              <p className="mb-2 text-sm font-medium text-foreground">
                {item.sdk}
              </p>
              <code className="font-mono text-xs text-muted-foreground">
                {item.install}
              </code>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
