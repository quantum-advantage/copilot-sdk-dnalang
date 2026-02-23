"use client"

import { useState } from "react"
import { CCCEDashboard } from "@/components/ccce-dashboard"
import { SecurityClearance } from "@/lib/ccce/correlation-coherence-engine"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cpu, FileText, Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CCCEPage() {
  const [clearance, setClearance] = useState<SecurityClearance>(SecurityClearance.ENTERPRISE)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Cpu className="h-6 w-6 text-cyan-400" />
                <span className="font-bold text-lg">CCCE</span>
                <span className="text-muted-foreground text-sm">/ QByte Mining</span>
              </div>
            </div>

            {/* Clearance Selector (for demo) */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Demo Clearance:</span>
              <select
                value={clearance}
                onChange={(e) => setClearance(e.target.value as SecurityClearance)}
                className="bg-background border border-border rounded px-2 py-1 text-sm"
              >
                <option value={SecurityClearance.OPEN_SOURCE}>Open Source</option>
                <option value={SecurityClearance.ENTERPRISE}>Enterprise</option>
                <option value={SecurityClearance.TOP_SECRET}>Top Secret</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard">
              <Cpu className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="docs">
              <FileText className="h-4 w-4 mr-2" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <CCCEDashboard userClearance={clearance} />
          </TabsContent>

          <TabsContent value="docs">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">CCCE Architecture Documentation</h2>

              <div className="prose prose-invert max-w-none space-y-6">
                <section>
                  <h3 className="text-xl font-semibold text-cyan-400">Overview</h3>
                  <p className="text-muted-foreground">
                    The Correlation Coherence Construction Engine (CCCE) processes IBM Quantum workload files (.zip) to
                    facilitate QByte mining using advanced phase conjugation techniques, tetrahedral geometry
                    embeddings, and quaternionic tensor calculus.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-cyan-400">Core Modules</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <strong>Data Extraction:</strong> Parses IBM Quantum ZIP workloads into raw qubit data
                    </li>
                    <li>
                      <strong>Quantum State Correlation:</strong> Computes Lambda, Phi, and Gamma tensors
                    </li>
                    <li>
                      <strong>Harmonic Resonance:</strong> Acoustic coupling via 51.843 degree resonance
                    </li>
                    <li>
                      <strong>Tensor Computation:</strong> 3D tensor calculus with spherical embeddings
                    </li>
                    <li>
                      <strong>Feedback Communication:</strong> Iterative correction and calibration
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-cyan-400">Mathematical Framework</h3>
                  <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm">
                    <p>Lambda Score: Lambda = F(circuit) * T_coherence * E_fitness</p>
                    <p>Quantum Darwinism: sigma_QD = 3.14159 * T1 / T_gate</p>
                    <p>Informational Ricci Flow: kappa_IRT = h_bar / (2*pi * k_B * T_decoherence)</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-cyan-400">6D-CRSM Integration</h3>
                  <p className="text-muted-foreground">
                    The engine operates within the 6-Dimensional Cognitive Resonance State Machine, coordinating AURA
                    (observer) and AIDEN (executor) agents for optimal QByte extraction.
                  </p>
                </section>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">CCCE Settings</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium">Default Backend</label>
                    <select className="w-full mt-1 bg-background border border-border rounded px-3 py-2">
                      <option>ibm_torino</option>
                      <option>ibm_brisbane</option>
                      <option>ibm_kyiv</option>
                      <option>aer_simulator</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Processing Mode</label>
                    <select className="w-full mt-1 bg-background border border-border rounded px-3 py-2">
                      <option>Standard</option>
                      <option>High Fidelity</option>
                      <option>Fast Mining</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">API Key (IBM Quantum)</label>
                  <input
                    type="password"
                    placeholder="Enter your IBM Quantum API key"
                    className="w-full mt-1 bg-background border border-border rounded px-3 py-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Get your API key from quantum.ibm.com</p>
                </div>

                <Button className="bg-cyan-600 hover:bg-cyan-500">Save Settings</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
