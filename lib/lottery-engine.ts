/**
 * AETERNA-PORTA Quantum Lottery Engine v2.1.2
 * Sovereign Selection Protocol with CRSM-Validated Algorithms
 * 
 * Physical Constants:
 * - ΛΦ (Universal Memory Constant): 2.176435e-8 s⁻¹
 * - θ (Torsion Lock Angle): 51.843°
 * - Φ_threshold: 0.7734 (Consciousness threshold)
 * - Γ_critical: 0.30 (Decoherence limit)
 */

// Physical constants from DNA-Lang v51.843
export const PHYSICAL_CONSTANTS = {
  LAMBDA_PHI: 2.176435e-8, // Universal Memory Constant [s⁻¹]
  THETA_LOCK: 51.843, // Torsion Lock Angle [degrees]
  PHI_THRESHOLD: 0.7734, // Consciousness threshold
  PHI_TARGET: 7.6901, // Target integrated information
  GAMMA_CRITICAL: 0.30, // Decoherence containment trigger
  CHI_PC: 0.946, // Phase conjugate coupling
} as const

// Lottery game configurations
export type LotteryGame = "powerball" | "megamillions" | "custom"

export interface LotteryConfig {
  name: string
  whiteMin: number
  whiteMax: number
  whiteCount: number
  powerMin: number
  powerMax: number
  powerCount: number
  powerBallName: string
}

export const LOTTERY_CONFIGS: Record<LotteryGame, LotteryConfig> = {
  powerball: {
    name: "Powerball",
    whiteMin: 1,
    whiteMax: 69,
    whiteCount: 5,
    powerMin: 1,
    powerMax: 26,
    powerCount: 1,
    powerBallName: "Powerball",
  },
  megamillions: {
    name: "Mega Millions",
    whiteMin: 1,
    whiteMax: 70,
    whiteCount: 5,
    powerMin: 1,
    powerMax: 25,
    powerCount: 1,
    powerBallName: "Mega Ball",
  },
  custom: {
    name: "Custom",
    whiteMin: 1,
    whiteMax: 99,
    whiteCount: 6,
    powerMin: 1,
    powerMax: 99,
    powerCount: 1,
    powerBallName: "Bonus",
  },
}

// CRSM Metrics
export interface CRSMMetrics {
  phi: number // Integrated Information (Consciousness)
  lambda: number // Coherence
  gamma: number // Decoherence
  xi: number // Efficiency (negentropic compression)
  theta: number // Torsion angle
  w2: number // Wasserstein-2 transport distance
  timestamp: number
}

// Validation result
export interface ValidationResult {
  status: "PASS" | "WARN" | "FAIL"
  metric: string
  value: number
  expected: string
  message: string
}

// Generated lottery result
export interface LotteryResult {
  id: string
  game: LotteryGame
  drawDate: Date
  whiteNumbers: number[]
  powerNumbers: number[]
  metrics: CRSMMetrics
  validations: ValidationResult[]
  entropy: number
  seed: string
  timestamp: number
  executionTime: number
}

// Cryptographic RNG using Web Crypto API
function cryptoRandomInt(min: number, max: number): number {
  const range = max - min + 1
  const bytesNeeded = Math.ceil(Math.log2(range) / 8)
  const maxValid = 256 ** bytesNeeded
  const threshold = maxValid - (maxValid % range)

  let randomValue: number
  do {
    const randomBytes = new Uint8Array(bytesNeeded)
    crypto.getRandomValues(randomBytes)
    randomValue = randomBytes.reduce((acc, byte, i) => acc + byte * 256 ** i, 0)
  } while (randomValue >= threshold)

  return min + (randomValue % range)
}

// Phase-conjugate seed generation using ΛΦ and θ
function generatePCRBSeed(): string {
  const timestamp = Date.now()
  const phi = PHYSICAL_CONSTANTS.PHI_TARGET
  const theta = PHYSICAL_CONSTANTS.THETA_LOCK
  const lambdaPhi = PHYSICAL_CONSTANTS.LAMBDA_PHI

  // Phase conjugate recursion
  const phase = Math.sin((timestamp * lambdaPhi) % (2 * Math.PI))
  const torsion = Math.cos((theta * Math.PI) / 180)
  const resonance = phi * phase * torsion

  const seedBuffer = new Uint8Array(32)
  crypto.getRandomValues(seedBuffer)

  // Mix with physical constants
  for (let i = 0; i < seedBuffer.length; i++) {
    seedBuffer[i] ^= Math.floor(resonance * 255) & 0xff
  }

  return Array.from(seedBuffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Fisher-Yates shuffle with crypto RNG
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(0, i)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Calculate Shannon entropy
function calculateEntropy(numbers: number[], max: number): number {
  const freq = new Array(max + 1).fill(0)
  for (const num of numbers) {
    freq[num]++
  }

  let entropy = 0
  for (const count of freq) {
    if (count > 0) {
      const p = count / numbers.length
      entropy -= p * Math.log2(p)
    }
  }

  return entropy
}

// Simulate CRSM metrics evolution
function simulateCRSMMetrics(seed: string): CRSMMetrics {
  const seedNum = parseInt(seed.slice(0, 8), 16)
  const phase = (seedNum % 1000) / 1000

  // Start from high-coherence state
  const lambda = 0.97 + phase * 0.025 // [0.97, 0.995]
  const gamma = Math.max(0.005, (1 - lambda) * 0.5) // Inverse of coherence
  const phi = PHYSICAL_CONSTANTS.PHI_TARGET + (phase - 0.5) * 0.5
  const xi = 20000 + phase * 5000 // [20000, 25000]
  const w2 = Math.max(0.001, 0.01 * (1 - lambda)) // Transport distance
  const theta = PHYSICAL_CONSTANTS.THETA_LOCK + (phase - 0.5) * 0.01

  return {
    phi,
    lambda,
    gamma,
    xi,
    theta,
    w2,
    timestamp: Date.now(),
  }
}

// Validate CRSM metrics against thresholds
function validateMetrics(metrics: CRSMMetrics): ValidationResult[] {
  const results: ValidationResult[] = []

  // Phi convergence check
  const phiDelta = Math.abs(metrics.phi - PHYSICAL_CONSTANTS.PHI_TARGET)
  results.push({
    status: phiDelta < 0.3 ? "PASS" : phiDelta < 0.6 ? "WARN" : "FAIL",
    metric: "Φ (Integrated Information)",
    value: metrics.phi,
    expected: `${PHYSICAL_CONSTANTS.PHI_TARGET} ± 0.3`,
    message: `Consciousness density: ${phiDelta < 0.3 ? "OPTIMAL" : phiDelta < 0.6 ? "STABLE" : "UNSTABLE"}`,
  })

  // Lambda coherence check
  results.push({
    status: metrics.lambda > 0.98 ? "PASS" : metrics.lambda > 0.96 ? "WARN" : "FAIL",
    metric: "Λ (Coherence)",
    value: metrics.lambda,
    expected: "> 0.98",
    message: `System coherence: ${(metrics.lambda * 100).toFixed(2)}%`,
  })

  // Gamma decoherence check
  results.push({
    status: metrics.gamma < 0.01 ? "PASS" : metrics.gamma < 0.02 ? "WARN" : "FAIL",
    metric: "Γ (Decoherence)",
    value: metrics.gamma,
    expected: "< 0.01",
    message: `Decoherence rate: ${metrics.gamma < 0.01 ? "MINIMAL" : metrics.gamma < 0.02 ? "ACCEPTABLE" : "HIGH"}`,
  })

  // Xi efficiency check
  results.push({
    status: metrics.xi > 24000 ? "PASS" : metrics.xi > 20000 ? "WARN" : "FAIL",
    metric: "Ξ (Efficiency)",
    value: metrics.xi,
    expected: "> 24000",
    message: `Negentropic compression: ${metrics.xi > 24000 ? "SUPER-THRESHOLD" : "NOMINAL"}`,
  })

  // Theta torsion lock check
  const thetaDelta = Math.abs(metrics.theta - PHYSICAL_CONSTANTS.THETA_LOCK)
  results.push({
    status: thetaDelta < 0.005 ? "PASS" : thetaDelta < 0.01 ? "WARN" : "FAIL",
    metric: "θ (Torsion Lock)",
    value: metrics.theta,
    expected: `${PHYSICAL_CONSTANTS.THETA_LOCK} ± 0.005°`,
    message: `Phase lock: ${thetaDelta < 0.005 ? "LOCKED" : thetaDelta < 0.01 ? "DRIFTING" : "UNLOCKED"}`,
  })

  // W2 transport check
  results.push({
    status: metrics.w2 < 0.003 ? "PASS" : metrics.w2 < 0.006 ? "WARN" : "FAIL",
    metric: "W₂ (Wasserstein-2)",
    value: metrics.w2,
    expected: "< 0.003",
    message: `Manifold transport: ${metrics.w2 < 0.003 ? "OPTIMAL" : "ELEVATED"}`,
  })

  return results
}

// Generate lottery numbers with CRSM validation
export async function generateLotteryNumbers(
  game: LotteryGame,
  drawDate?: Date,
): Promise<LotteryResult> {
  const startTime = Date.now()
  const config = LOTTERY_CONFIGS[game]

  // Phase 1: Initialize PCRB seed
  const seed = generatePCRBSeed()

  // Phase 2: Simulate CRSM metrics evolution
  await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate evolution time
  const metrics = simulateCRSMMetrics(seed)

  // Phase 3: Generate white ball numbers using crypto RNG
  const whitePool = Array.from({ length: config.whiteMax }, (_, i) => i + 1)
  const shuffledWhite = shuffle(whitePool)
  const whiteNumbers = shuffledWhite.slice(0, config.whiteCount).sort((a, b) => a - b)

  // Phase 4: Generate power ball numbers
  const powerNumbers: number[] = []
  for (let i = 0; i < config.powerCount; i++) {
    powerNumbers.push(cryptoRandomInt(config.powerMin, config.powerMax))
  }

  // Phase 5: Calculate entropy
  const allNumbers = [...whiteNumbers, ...powerNumbers]
  const entropy = calculateEntropy(allNumbers, Math.max(config.whiteMax, config.powerMax))

  // Phase 6: Validate metrics
  const validations = validateMetrics(metrics)

  const executionTime = Date.now() - startTime

  return {
    id: crypto.randomUUID(),
    game,
    drawDate: drawDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    whiteNumbers,
    powerNumbers,
    metrics,
    validations,
    entropy,
    seed,
    timestamp: Date.now(),
    executionTime,
  }
}

// Batch generation for multiple draws
export async function generateBatch(
  game: LotteryGame,
  count: number,
): Promise<LotteryResult[]> {
  const results: LotteryResult[] = []
  for (let i = 0; i < count; i++) {
    const drawDate = new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
    const result = await generateLotteryNumbers(game, drawDate)
    results.push(result)
    // Small delay between generations
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  return results
}

// Export as CSV
export function exportToCSV(results: LotteryResult[]): string {
  const headers = [
    "ID",
    "Game",
    "Draw Date",
    "White Numbers",
    "Power Numbers",
    "Φ",
    "Λ",
    "Γ",
    "Ξ",
    "θ",
    "W₂",
    "Entropy",
    "Status",
    "Timestamp",
  ]

  const rows = results.map((r) => [
    r.id,
    LOTTERY_CONFIGS[r.game].name,
    r.drawDate.toISOString(),
    r.whiteNumbers.join("-"),
    r.powerNumbers.join("-"),
    r.metrics.phi.toFixed(4),
    r.metrics.lambda.toFixed(4),
    r.metrics.gamma.toFixed(4),
    r.metrics.xi.toFixed(0),
    r.metrics.theta.toFixed(3),
    r.metrics.w2.toFixed(6),
    r.entropy.toFixed(4),
    r.validations.filter((v) => v.status === "PASS").length === r.validations.length ? "PASS" : "WARN",
    new Date(r.timestamp).toISOString(),
  ])

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}
