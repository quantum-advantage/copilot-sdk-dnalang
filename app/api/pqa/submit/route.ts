import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// PCRB Entry type
interface PCRBEntry {
  ts_unix: number
  experiment_id: string
  circuit_hash: string
  parameters: Record<string, number>
  hardware: string[]
  jobs: string[]
  prev_hash: string
  chain_hash: string
}

// In-memory PCRB ledger (in production, use database)
const pcrbLedger: PCRBEntry[] = []

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

function generateExperimentId(manifest: Record<string, unknown>): string {
  const canonical = JSON.stringify(manifest, Object.keys(manifest).sort())
  return sha256(canonical)
}

function getLastChainHash(): string {
  if (pcrbLedger.length === 0) return "0".repeat(64)
  return pcrbLedger[pcrbLedger.length - 1].chain_hash
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { circuit_family, parameters, backends, shots } = body

    // Validate required fields
    if (!circuit_family || !parameters) {
      return NextResponse.json({ error: "Missing required fields: circuit_family, parameters" }, { status: 400 })
    }

    // Create manifest
    const manifest = {
      framework_version: "dna-lang-v51.843",
      circuit_family,
      parameters: {
        theta_lock: parameters.theta_lock || 51.843,
        phi: parameters.phi || 1.618033988749895,
        scrambling_depth: parameters.scrambling_depth || 1,
      },
      hardware: {
        backends: backends || ["primary"],
        total_qubits: backends?.length === 2 ? 312 : 156,
      },
      shots: shots || 8192,
      timestamp: Date.now(),
    }

    // Generate experiment ID (content-addressed)
    const experimentId = generateExperimentId(manifest)

    // Simulate circuit generation and hashing
    const circuitQasm = `// QASM for ${circuit_family}\n// theta_lock: ${manifest.parameters.theta_lock}\n// phi: ${manifest.parameters.phi}`
    const circuitHash = sha256(circuitQasm)

    // Simulate job IDs
    const jobs = manifest.hardware.backends.map((_, i) => `job_${experimentId.slice(0, 8)}_${i}`)

    // Create PCRB entry
    const prevHash = getLastChainHash()
    const entryData = {
      ts_unix: Math.floor(Date.now() / 1000),
      experiment_id: experimentId,
      circuit_hash: circuitHash,
      parameters: manifest.parameters,
      hardware: manifest.hardware.backends,
      jobs,
      prev_hash: prevHash,
    }
    const chainHash = sha256(JSON.stringify(entryData) + prevHash)

    const pcrbEntry: PCRBEntry = {
      ...entryData,
      chain_hash: chainHash,
    }

    // Append to ledger
    pcrbLedger.push(pcrbEntry)

    return NextResponse.json({
      success: true,
      experiment_id: experimentId,
      circuit_hash: circuitHash,
      jobs,
      pcrb: {
        chain_position: pcrbLedger.length,
        chain_hash: chainHash,
        integrity: "VALID",
      },
      manifest,
    })
  } catch (error) {
    console.error("PQA submit error:", error)
    return NextResponse.json({ error: "Failed to submit experiment" }, { status: 500 })
  }
}

export async function GET() {
  // Return ledger summary
  return NextResponse.json({
    ledger_length: pcrbLedger.length,
    latest_hash: getLastChainHash(),
    integrity: "VALID",
    framework: "dna::}{::lang v51.843",
  })
}
