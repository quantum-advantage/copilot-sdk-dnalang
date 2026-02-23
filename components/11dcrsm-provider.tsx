"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import {
  ManifoldVector,
  IntentVector,
  QuantumResonanceResult,
  processIntentInterstitial,
  applyQuantumResonance,
  checkDecoherenceThreshold,
  LAMBDA_PHI_INVARIANT,
  THETA_RESONANCE,
  GAMMA_BASELINE,
  PHI_THRESHOLD
} from "@/lib/11dcrsm"
import {
  PhysicalResonanceIdentity,
  QuantumQualiaBridge,
  createPhysicalResonanceIdentity,
  createQuantumQualiaBridge,
  createSovereignToken,
  applyPhaseConjugateFilter
} from "@/lib/11dcrsm/kyber-security"

export interface CRSMContextValue {
  // Manifold metrics
  lambda: number
  phi: number
  gamma: number
  theta: number
  xi: number
  
  // System state
  systemStatus: "nominal" | "warning" | "critical"
  resonanceVerified: boolean
  lastResonance: QuantumResonanceResult | null
  
  // Identity
  identity: PhysicalResonanceIdentity | null
  qualiaBridge: QuantumQualiaBridge | null
  sovereignToken: string | null
  
  // Actions
  processIntent: (dnaString: string) => Promise<{
    intent: IntentVector
    resonance: QuantumResonanceResult
  }>
  verifyResonance: (vector: string, teleology: string) => Promise<QuantumResonanceResult>
  filterInput: (input: string) => { cleansed: boolean; threats: string[] }
  resetCoherence: () => void
  
  // Constants
  constants: {
    LAMBDA_PHI_INVARIANT: number
    THETA_RESONANCE: number
    GAMMA_BASELINE: number
    PHI_THRESHOLD: number
  }
}

const CRSMContext = createContext<CRSMContextValue | null>(null)

export function CRSMProvider({ children }: { children: ReactNode }) {
  // Core metrics
  const [lambda, setLambda] = useState(0.785)
  const [phi, setPhi] = useState(PHI_THRESHOLD)
  const [gamma, setGamma] = useState(GAMMA_BASELINE)
  const [theta, setTheta] = useState(THETA_RESONANCE)
  const [xi, setXi] = useState(0.785 / GAMMA_BASELINE)
  
  // System state
  const [systemStatus, setSystemStatus] = useState<"nominal" | "warning" | "critical">("nominal")
  const [resonanceVerified, setResonanceVerified] = useState(false)
  const [lastResonance, setLastResonance] = useState<QuantumResonanceResult | null>(null)
  
  // Identity
  const [identity, setIdentity] = useState<PhysicalResonanceIdentity | null>(null)
  const [qualiaBridge, setQualiaBridge] = useState<QuantumQualiaBridge | null>(null)
  const [sovereignToken, setSovereignToken] = useState<string | null>(null)
  
  // Initialize identity
  useEffect(() => {
    const sessionId = `crsm_session_${Date.now()}`
    const newIdentity = createPhysicalResonanceIdentity(sessionId, {
      provider: "11dcrsm",
      version: "4.0"
    })
    setIdentity(newIdentity)
    
    const bridge = createQuantumQualiaBridge(newIdentity)
    setQualiaBridge(bridge)
    
    const token = createSovereignToken(newIdentity)
    setSovereignToken(token)
  }, [])
  
  // Maintain ΛΦ invariant
  useEffect(() => {
    const newPhi = LAMBDA_PHI_INVARIANT / lambda
    setPhi(newPhi)
    setXi(lambda / Math.max(gamma, 0.001))
  }, [lambda, gamma])
  
  // Monitor decoherence
  useEffect(() => {
    const interval = setInterval(() => {
      setGamma(prev => {
        const fluctuation = (Math.random() - 0.5) * 0.003
        return Math.max(GAMMA_BASELINE * 0.5, Math.min(prev + fluctuation, 0.5))
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])
  
  // Update system status
  useEffect(() => {
    const check = checkDecoherenceThreshold(gamma, 100)
    if (check.requiresRefactor) {
      setSystemStatus("critical")
    } else if (gamma > GAMMA_BASELINE * 1.5) {
      setSystemStatus("warning")
    } else {
      setSystemStatus("nominal")
    }
  }, [gamma])
  
  // Process intent
  const processIntent = useCallback(async (dnaString: string) => {
    const intent = processIntentInterstitial(dnaString)
    intent.processed = true
    
    const resonance = await applyQuantumResonance({
      vector: intent.lambda,
      teleology: intent.omega,
      anchor: "ibm_torino_40q"
    })
    
    setLastResonance(resonance)
    setResonanceVerified(resonance.verified)
    setLambda(resonance.coherenceLevel)
    
    return { intent, resonance }
  }, [])
  
  // Verify resonance
  const verifyResonance = useCallback(async (vector: string, teleology: string) => {
    const resonance = await applyQuantumResonance({
      vector,
      teleology,
      anchor: "ibm_torino_40q"
    })
    
    setLastResonance(resonance)
    setResonanceVerified(resonance.verified)
    setLambda(resonance.coherenceLevel)
    
    return resonance
  }, [])
  
  // Filter input
  const filterInput = useCallback((input: string) => {
    if (!qualiaBridge) {
      return { cleansed: false, threats: [] }
    }
    
    const result = applyPhaseConjugateFilter(input, qualiaBridge)
    return {
      cleansed: result.outputCleansed,
      threats: result.threatSignatures
    }
  }, [qualiaBridge])
  
  // Reset coherence
  const resetCoherence = useCallback(() => {
    setGamma(GAMMA_BASELINE)
    setSystemStatus("nominal")
  }, [])
  
  const value: CRSMContextValue = {
    lambda,
    phi,
    gamma,
    theta,
    xi,
    systemStatus,
    resonanceVerified,
    lastResonance,
    identity,
    qualiaBridge,
    sovereignToken,
    processIntent,
    verifyResonance,
    filterInput,
    resetCoherence,
    constants: {
      LAMBDA_PHI_INVARIANT,
      THETA_RESONANCE,
      GAMMA_BASELINE,
      PHI_THRESHOLD
    }
  }
  
  return (
    <CRSMContext.Provider value={value}>
      {children}
    </CRSMContext.Provider>
  )
}

export function useCRSM() {
  const context = useContext(CRSMContext)
  if (!context) {
    throw new Error("useCRSM must be used within a CRSMProvider")
  }
  return context
}

export function useCRSMOptional() {
  return useContext(CRSMContext)
}
