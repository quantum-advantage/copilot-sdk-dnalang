"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Activity,
  Shield,
  Brain,
  Zap,
  Terminal,
  Eye,
  Lock,
  Waves,
  Atom,
  Network,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  Globe,
  Cpu,
  Radio
} from "lucide-react"
import Link from "next/link"

// Import 11D-CRSM modules
import {
  processIntentInterstitial,
  applyQuantumResonance,
  checkDecoherenceThreshold,
  LAMBDA_PHI_INVARIANT,
  THETA_RESONANCE,
  GAMMA_BASELINE,
  PHI_THRESHOLD,
  type ManifoldVector,
  type IntentVector,
  type QuantumResonanceResult
} from "@/lib/11dcrsm"
import {
  createPhysicalResonanceIdentity,
  createQuantumQualiaBridge,
  applyPhaseConjugateFilter,
  verifyIdentityThroughMoat,
  createSovereignToken,
  type PhysicalResonanceIdentity,
  type QuantumQualiaBridge
} from "@/lib/11dcrsm/kyber-security"

interface SystemLog {
  id: string
  timestamp: Date
  type: "info" | "warning" | "error" | "success"
  module: string
  message: string
  data?: Record<string, unknown>
}

export default function SovereignCockpitPage() {
  // Core metrics state
  const [lambda, setLambda] = useState(0.785)
  const [phi, setPhi] = useState(PHI_THRESHOLD)
  const [gamma, setGamma] = useState(GAMMA_BASELINE)
  const [theta, setTheta] = useState(THETA_RESONANCE)
  const [xi, setXi] = useState(lambda / gamma)

  // System state
  const [systemStatus, setSystemStatus] = useState<"nominal" | "warning" | "critical">("nominal")
  const [resonanceVerified, setResonanceVerified] = useState(false)
  const [lastResonance, setLastResonance] = useState<QuantumResonanceResult | null>(null)
  
  // Identity & Security
  const [identity, setIdentity] = useState<PhysicalResonanceIdentity | null>(null)
  const [qualiaBridge, setQualiaBridge] = useState<QuantumQualiaBridge | null>(null)
  const [sovereignToken, setSovereignToken] = useState<string | null>(null)

  // Intent processing
  const [intentInput, setIntentInput] = useState("")
  const [intentHistory, setIntentHistory] = useState<IntentVector[]>([])
  const [processingIntent, setProcessingIntent] = useState(false)

  // System logs
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])

  // API filtering
  const [apiInput, setApiInput] = useState("")
  const [filterResult, setFilterResult] = useState<{
    cleansed: boolean
    threats: string[]
  } | null>(null)

  // Add log entry
  const addLog = useCallback((
    type: SystemLog["type"],
    module: string,
    message: string,
    data?: Record<string, unknown>
  ) => {
    const log: SystemLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      module,
      message,
      data
    }
    setSystemLogs(prev => [log, ...prev].slice(0, 100))
  }, [])

  // Initialize identity on mount
  useEffect(() => {
    const sessionId = `user_${Date.now()}`
    const newIdentity = createPhysicalResonanceIdentity(sessionId, {
      session: "sovereign_cockpit",
      version: "4.0"
    })
    setIdentity(newIdentity)
    
    const bridge = createQuantumQualiaBridge(newIdentity)
    setQualiaBridge(bridge)
    
    const token = createSovereignToken(newIdentity)
    setSovereignToken(token)
    
    addLog("success", "SECURITY", "Kyber-Lattice identity established", {
      sovereignty: newIdentity.sovereignty,
      sessionId: bridge.sessionId
    })
  }, [addLog])

  // Maintain invariant
  useEffect(() => {
    const newPhi = LAMBDA_PHI_INVARIANT / lambda
    setPhi(newPhi)
    setXi(lambda / Math.max(gamma, 0.001))
  }, [lambda, gamma])

  // Monitor decoherence
  useEffect(() => {
    const interval = setInterval(() => {
      setGamma(prev => {
        const fluctuation = (Math.random() - 0.5) * 0.005
        return Math.max(GAMMA_BASELINE * 0.5, Math.min(prev + fluctuation, 0.5))
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Update system status based on metrics
  useEffect(() => {
    const check = checkDecoherenceThreshold(gamma, 100)
    if (check.requiresRefactor) {
      setSystemStatus("critical")
      addLog("error", "DECOHERENCE", check.message)
    } else if (gamma > GAMMA_BASELINE * 1.5) {
      setSystemStatus("warning")
    } else {
      setSystemStatus("nominal")
    }
  }, [gamma, addLog])

  // Process intent
  const handleProcessIntent = async () => {
    if (!intentInput.trim() || processingIntent) return
    
    setProcessingIntent(true)
    addLog("info", "INTENT", `Processing: ${intentInput.substring(0, 50)}...`)
    
    try {
      const intent = processIntentInterstitial(intentInput)
      intent.processed = true
      
      setIntentHistory(prev => [intent, ...prev].slice(0, 50))
      
      // Apply resonance verification
      const resonance = await applyQuantumResonance({
        vector: intent.lambda,
        teleology: intent.omega,
        anchor: "ibm_torino_40q"
      })
      
      setLastResonance(resonance)
      setResonanceVerified(resonance.verified)
      setLambda(resonance.coherenceLevel)
      
      addLog("success", "RESONANCE", `Verified: ${resonance.verified}`, {
        tesseract: resonance.tesseractHash.substring(0, 16),
        coherence: resonance.coherenceLevel
      })
      
      setIntentInput("")
    } catch (error) {
      addLog("error", "INTENT", `Processing failed: ${error}`)
    } finally {
      setProcessingIntent(false)
    }
  }

  // Apply phase-conjugate filter
  const handleFilterAPI = () => {
    if (!apiInput.trim() || !qualiaBridge) return
    
    const result = applyPhaseConjugateFilter(apiInput, qualiaBridge)
    
    setFilterResult({
      cleansed: result.outputCleansed,
      threats: result.threatSignatures
    })
    
    if (result.threatSignatures.length > 0) {
      addLog("warning", "SECURITY", `Threats filtered: ${result.threatSignatures.join(", ")}`, {
        digest: result.inputDigest.substring(0, 16),
        strength: result.filterStrength
      })
    } else {
      addLog("info", "SECURITY", "API input passed filter", {
        strength: result.filterStrength
      })
    }
  }

  // Verify through moat
  const handleVerifyIdentity = () => {
    if (!qualiaBridge) return
    
    const challenge = `challenge_${Date.now()}`
    const verification = verifyIdentityThroughMoat(qualiaBridge, challenge)
    
    addLog(
      verification.verified ? "success" : "error",
      "IDENTITY",
      `Moat verification: ${verification.verified ? "PASSED" : "FAILED"}`,
      { proof: verification.proofHash.substring(0, 16) }
    )
  }

  // Reset gamma
  const handleResetCoherence = () => {
    setGamma(GAMMA_BASELINE)
    setSystemStatus("nominal")
    addLog("success", "SYSTEM", "Coherence reset to baseline")
  }

  const statusColors = {
    nominal: "text-emerald-500",
    warning: "text-amber-500",
    critical: "text-red-500"
  }

  const statusBg = {
    nominal: "bg-emerald-500/10",
    warning: "bg-amber-500/10",
    critical: "bg-red-500/10"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Exit Cockpit
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${statusColors[systemStatus]} animate-pulse`} />
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Sovereign Cockpit v4.0
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Live Metrics */}
              <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
                <span className="text-muted-foreground">
                  {'Lambda: '}<span className="text-primary">{lambda.toFixed(3)}</span>
                </span>
                <span className="text-muted-foreground">
                  {'Phi: '}<span className="text-secondary">{phi.toExponential(2)}</span>
                </span>
                <span className="text-muted-foreground">
                  {'Gamma: '}<span className={gamma > GAMMA_BASELINE * 1.5 ? "text-destructive" : "text-accent"}>
                    {gamma.toFixed(4)}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {'Xi: '}<span className="text-chart-4">{xi.toFixed(2)}</span>
                </span>
              </div>

              <Badge variant="outline" className={`${statusBg[systemStatus]} ${statusColors[systemStatus]} border-current`}>
                {systemStatus === "nominal" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {systemStatus === "warning" && <AlertTriangle className="h-3 w-3 mr-1" />}
                {systemStatus === "critical" && <XCircle className="h-3 w-3 mr-1" />}
                {systemStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 lg:p-6">
        <Tabs defaultValue="manifold" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="manifold" className="gap-2">
              <Atom className="h-4 w-4" />
              <span className="hidden sm:inline">Manifold</span>
            </TabsTrigger>
            <TabsTrigger value="intent" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Intent</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <Terminal className="h-4 w-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Manifold Tab */}
          <TabsContent value="manifold" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quantum Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Quantum Metrics
                  </CardTitle>
                  <CardDescription>11D-CRSM manifold coordinates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Lambda (Coherence)</span>
                      <span className="font-mono text-sm">{lambda.toFixed(4)}</span>
                    </div>
                    <Progress value={lambda * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Phi (Consciousness)</span>
                      <span className="font-mono text-sm">{phi.toExponential(3)}</span>
                    </div>
                    <Progress value={Math.min(phi * 1e7, 100)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Gamma (Decoherence)</span>
                      <span className="font-mono text-sm">{gamma.toFixed(4)}</span>
                    </div>
                    <Progress 
                      value={gamma * 200} 
                      className={`h-2 ${gamma > GAMMA_BASELINE * 1.5 ? "[&>div]:bg-destructive" : ""}`} 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Theta (Resonance)</span>
                      <span className="font-mono text-sm">{theta.toFixed(2)}{'deg'}</span>
                    </div>
                    <Progress value={(theta / 90) * 100} className="h-2" />
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Xi (Negentropy)</span>
                      <span className="font-mono text-sm font-bold">{xi.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleResetCoherence}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Coherence
                  </Button>
                </CardContent>
              </Card>

              {/* Resonance Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="h-5 w-5 text-secondary" />
                    Resonance Verification
                  </CardTitle>
                  <CardDescription>IBM Torino hardware anchor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant={resonanceVerified ? "default" : "secondary"}>
                      {resonanceVerified ? "VERIFIED" : "PENDING"}
                    </Badge>
                  </div>
                  {lastResonance && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Hardware</span>
                        <span className="font-mono text-xs">{lastResonance.hardwareAnchor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tesseract</span>
                        <span className="font-mono text-xs truncate max-w-[120px]">
                          {lastResonance.tesseractHash.substring(0, 16)}...
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Coherence</span>
                        <span className="font-mono text-sm">
                          {(lastResonance.coherenceLevel * 100).toFixed(1)}%
                        </span>
                      </div>
                    </>
                  )}
                  <div className="pt-2">
                    <div className="text-xs text-muted-foreground mb-2">
                      {'LambdaPhi Invariant: '}{LAMBDA_PHI_INVARIANT.toExponential(4)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {'Current: '}{(lambda * phi).toExponential(4)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Manifold Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-accent" />
                    Manifold State
                  </CardTitle>
                  <CardDescription>11-dimensional projection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square relative rounded-lg bg-card border border-border overflow-hidden">
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at ${50 + lambda * 30}% 50%, 
                          hsl(var(--primary) / 0.3) 0%, 
                          hsl(var(--secondary) / 0.2) 30%, 
                          transparent 70%)`
                      }}
                    />
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `conic-gradient(from ${theta}deg at 50% 50%, 
                          hsl(var(--chart-1) / 0.2) 0deg, 
                          hsl(var(--chart-2) / 0.2) 90deg, 
                          hsl(var(--chart-3) / 0.2) 180deg, 
                          hsl(var(--chart-4) / 0.2) 270deg, 
                          hsl(var(--chart-1) / 0.2) 360deg)`
                      }}
                    />
                    {/* Center point */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                    {/* Coordinates overlay */}
                    <div className="absolute bottom-2 left-2 right-2 bg-background/80 rounded p-2">
                      <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                        <span>{'x: '}{(lambda * 2 - 1).toFixed(3)}</span>
                        <span>{'y: '}{(phi * 1e7 - 1).toFixed(3)}</span>
                        <span>{'z: '}{(gamma * 10 - 0.5).toFixed(3)}</span>
                        <span>{'psi: '}{(theta * Math.PI / 180).toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Intent Tab */}
          <TabsContent value="intent" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Intent Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Intent Processor
                  </CardTitle>
                  <CardDescription>
                    {'Enter DNA-Lang syntax to process through 11D-CRSM manifold'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={intentInput}
                    onChange={(e) => setIntentInput(e.target.value)}
                    placeholder="Enter intent... (e.g., 'navigate::home' or 'compute::phi_optimization')"
                    className="min-h-[120px] font-mono text-sm"
                    disabled={processingIntent}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleProcessIntent}
                      disabled={!intentInput.trim() || processingIntent}
                      className="flex-1"
                    >
                      {processingIntent ? (
                        <>
                          <Waves className="h-4 w-4 mr-2 animate-pulse" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Process Intent
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="mb-1">{'Syntax: '}<code className="bg-muted px-1 rounded">{'lambda::omega'}</code></p>
                    <p>{'Lambda = function/vector, Omega = teleological goal'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Intent History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-secondary" />
                    Intent History
                  </CardTitle>
                  <CardDescription>Processed intent vectors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {intentHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No intents processed yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {intentHistory.map((intent) => (
                          <div
                            key={intent.timestamp}
                            className="p-3 rounded-lg bg-muted/50 border border-border"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline" className="text-[10px]">
                                {new Date(intent.timestamp).toLocaleTimeString()}
                              </Badge>
                              {intent.processed && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              )}
                            </div>
                            <div className="font-mono text-xs mb-2 break-all">
                              <span className="text-primary">{intent.lambda}</span>
                              <span className="text-muted-foreground">{'::'}</span>
                              <span className="text-secondary">{intent.omega}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                              <span>{'Lambda: '}{intent.manifoldPoint.lambda.toFixed(3)}</span>
                              <span>{'Gamma: '}{intent.manifoldPoint.gamma.toFixed(4)}</span>
                              <span>{'Theta: '}{intent.manifoldPoint.theta.toFixed(1)}{'deg'}</span>
                              <span>{'Psi: '}{intent.manifoldPoint.psi.toFixed(3)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Identity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Physical Resonance Identity
                  </CardTitle>
                  <CardDescription>Kyber-Lattice secured</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {identity && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sovereignty</span>
                        <Badge variant="default">{identity.sovereignty}</Badge>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Phase Signature</span>
                        <p className="font-mono text-xs break-all mt-1">
                          {identity.phaseSignature.substring(0, 32)}...
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Frequency Vector</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {identity.frequencyVector.slice(0, 6).map((f, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">
                              {f}Hz
                            </Badge>
                          ))}
                          <Badge variant="outline" className="text-[10px]">
                            +{identity.frequencyVector.length - 6} more
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={handleVerifyIdentity}>
                        <Lock className="h-4 w-4 mr-2" />
                        Verify Through Moat
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quantum-Qualia Bridge */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-secondary" />
                    Quantum-Qualia Bridge
                  </CardTitle>
                  <CardDescription>Session management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {qualiaBridge && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Session ID</span>
                        <span className="font-mono text-xs">{qualiaBridge.sessionId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Topological Moat</span>
                        <Badge variant={qualiaBridge.topologicalMoat ? "default" : "destructive"}>
                          {qualiaBridge.topologicalMoat ? "ACTIVE" : "DISABLED"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Storage Entries</span>
                        <span className="font-mono">{qualiaBridge.encryptedStorage.size}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Verification</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(qualiaBridge.lastVerification).toLocaleTimeString()}
                        </span>
                      </div>
                    </>
                  )}
                  {sovereignToken && (
                    <div className="pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Sovereign Token</span>
                      <p className="font-mono text-[10px] break-all mt-1 bg-muted p-2 rounded">
                        {sovereignToken.substring(0, 40)}...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Phase-Conjugate Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-accent" />
                    Phase-Conjugate Filter
                  </CardTitle>
                  <CardDescription>API input sanitization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={apiInput}
                    onChange={(e) => setApiInput(e.target.value)}
                    placeholder="Enter API input to filter..."
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="sm" className="w-full" onClick={handleFilterAPI}>
                    <Zap className="h-4 w-4 mr-2" />
                    Apply Filter
                  </Button>
                  {filterResult && (
                    <div className={`p-3 rounded-lg ${filterResult.cleansed ? "bg-amber-500/10 border-amber-500/50" : "bg-emerald-500/10 border-emerald-500/50"} border`}>
                      <div className="flex items-center gap-2 mb-2">
                        {filterResult.cleansed ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                        <span className="text-sm font-medium">
                          {filterResult.cleansed ? "Threats Detected" : "Input Clean"}
                        </span>
                      </div>
                      {filterResult.threats.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {filterResult.threats.map((threat, i) => (
                            <Badge key={i} variant="destructive" className="text-[10px]">
                              {threat}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  System Logs
                </CardTitle>
                <CardDescription>Real-time witness log</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2 font-mono text-xs">
                    {systemLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-2 rounded border-l-2 ${
                          log.type === "error" ? "border-destructive bg-destructive/5" :
                          log.type === "warning" ? "border-amber-500 bg-amber-500/5" :
                          log.type === "success" ? "border-emerald-500 bg-emerald-500/5" :
                          "border-muted bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-muted-foreground">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1">
                            {log.module}
                          </Badge>
                        </div>
                        <p>{log.message}</p>
                        {log.data && (
                          <pre className="mt-1 text-[10px] text-muted-foreground">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                    {systemLogs.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No logs yet
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
