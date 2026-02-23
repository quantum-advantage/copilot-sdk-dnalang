import { DNALangQuantumConsole } from "@/components/dnalang-quantum-console"
import { Unified3DBackground } from "@/components/unified-3d-background"

export default function QuantumHardwarePage() {
  return (
    <>
      <Unified3DBackground />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            DNALang Quantum Hardware
          </h1>
          <p className="text-muted-foreground">
            Execute quantum circuits on real IBM Quantum hardware using biological computing paradigms
          </p>
        </div>

        <DNALangQuantumConsole />

        <div className="mt-8 p-6 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-primary/20 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              Get your IBM Quantum API key from{" "}
              <a
                href="https://quantum.ibm.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                quantum.ibm.com
              </a>
            </li>
            <li>
              Add your API key to the <code className="px-2 py-1 bg-background/50 rounded">apikey.json</code> file
            </li>
            <li>
              Install Python dependencies:{" "}
              <code className="px-2 py-1 bg-background/50 rounded">pip install qiskit qiskit-ibm-runtime</code>
            </li>
            <li>Select a circuit type and backend, then click "Execute on Hardware"</li>
            <li>Monitor job status and download results when complete</li>
          </ol>
        </div>
      </div>
    </>
  )
}
