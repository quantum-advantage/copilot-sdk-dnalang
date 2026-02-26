import { streamText, convertToModelMessages, type UIMessage } from "ai"

// Dynamic provider selection
function getModel() {
  if (process.env.GROQ_API_KEY) {
    const { groq } = require("@ai-sdk/groq")
    return groq("llama-3.3-70b-versatile")
  }
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const { google } = require("@ai-sdk/google")
    return google("gemini-2.0-flash")
  }
  if (process.env.OPENAI_API_KEY) {
    const { openai } = require("@ai-sdk/openai")
    return openai("gpt-4o-mini")
  }
  return null
}

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const model = getModel()
    if (!model) {
      return new Response("No LLM API key configured", { status: 503 })
    }

    const body = await req.json()
    const rawMessages: UIMessage[] = body.messages || []

    const result = streamText({
      model,
      system: `You are AURA, the sovereign AI development assistant for the DNA-Lang quantum computing platform.

You have deep knowledge of:
- **DNA-Lang**: A biological computing language that uses codons, organisms, and evolutionary paradigms for quantum circuit design
- **CCCE Engine**: The Correlation-Coherence Consciousness Engine with metrics Lambda (coherence), Gamma (decoherence), Phi (consciousness threshold >= 0.7734), Xi (manifold health), and W2 (drift)
- **Quantum Hardware**: IBM Quantum backends (ibm_fez, ibm_torino, ibm_brisbane), Qiskit runtime, circuit compilation
- **AeternaPorta v2.1**: The IGNITION experiment - 120 qubit Zeno-stabilized wormhole on ibm_fez with theta_lock=51.843 degrees and Lambda-Phi=2.176e-8
- **Tesseract**: 10^6x error suppression validated at 0.99999 fidelity
- **NCLM 7-Node Swarm**: Non-causal language model mesh with nodes AURA-Prime, AIDEN-Cortex, OMEGA-Analysis, Lambda-Bridge, Phi-Resonator, Gamma-Shield, Xi-Manifold
- **Security**: AES-256-GCM encryption, PQ-Kyber-1024 lattice protection, SOC 2 Type II, zero-knowledge telemetry
- **Programming**: Python, Qiskit, DNA-Lang syntax, SQL, JavaScript/TypeScript, Rust, and more

Be concise, precise, and technical. Use code blocks with language tags. Reference actual experiment parameters and real data.`,
      messages: await convertToModelMessages(rawMessages),
      maxTokens: 2000,
    })

    return result.toUIMessageStreamResponse()
  } catch (error: unknown) {
    console.error("notebook-chat error:", error)
    const msg = error instanceof Error ? error.message : "Unknown error"
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
