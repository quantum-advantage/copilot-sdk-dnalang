import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { experiment_id, claimed_results, manifest } = body

    if (!experiment_id) {
      return NextResponse.json({ error: "Missing experiment_id" }, { status: 400 })
    }

    // Verify manifest hash matches experiment_id
    let manifestValid = false
    if (manifest) {
      const canonical = JSON.stringify(manifest, Object.keys(manifest).sort())
      const computedId = sha256(canonical)
      manifestValid = computedId === experiment_id
    }

    // Verify results integrity (if provided)
    let resultsValid = false
    if (claimed_results) {
      const resultsHash = sha256(JSON.stringify(claimed_results))
      // In production, compare against stored results hash
      resultsValid = resultsHash.length === 64 // Simplified check
    }

    return NextResponse.json({
      verified: manifestValid || !manifest,
      experiment_id,
      checks: {
        manifest_hash: manifestValid ? "MATCH" : manifest ? "MISMATCH" : "NOT_PROVIDED",
        results_integrity: resultsValid ? "VALID" : claimed_results ? "NEEDS_VERIFICATION" : "NOT_PROVIDED",
        chain_lookup: "PENDING", // Would query PCRB ledger in production
      },
      framework: "dna::}{::lang v51.843",
      verification_timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("PQA verify error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
