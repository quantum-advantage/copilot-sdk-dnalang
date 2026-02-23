"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  Smartphone,
  Cpu,
  Key,
  Wifi,
  Shield,
  Zap,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
} from "lucide-react"

// Lambda-Phi Universal Constant
const LAMBDA_PHI = 2.176435e-8

interface SetupStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [deviceFound, setDeviceFound] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    ibmQuantumToken: "",
    deviceName: "",
    connectionType: "bluetooth" as "bluetooth" | "adb" | "network",
  })

  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: "account",
      title: "Create Account",
      description: "Set up your DNA-Lang credentials",
      icon: <Key className="h-5 w-5" />,
      completed: false,
    },
    {
      id: "organization",
      title: "Organization",
      description: "Configure your organization",
      icon: <Shield className="h-5 w-5" />,
      completed: false,
    },
    {
      id: "quantum",
      title: "IBM Quantum",
      description: "Connect to quantum hardware",
      icon: <Cpu className="h-5 w-5" />,
      completed: false,
    },
    {
      id: "android",
      title: "Android Bridge",
      description: "Set up device connection",
      icon: <Smartphone className="h-5 w-5" />,
      completed: false,
    },
    {
      id: "complete",
      title: "Complete",
      description: "Finalize your setup",
      icon: <Zap className="h-5 w-5" />,
      completed: false,
    },
  ])

  const progress = (currentStep / (steps.length - 1)) * 100

  const handleScanDevices = async () => {
    setIsScanning(true)
    setDeviceFound(false)

    // Simulate device scanning
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setDeviceFound(true)
    setFormData((prev) => ({ ...prev, deviceName: "Samsung Galaxy Fold 7" }))
    setIsScanning(false)
  }

  const handleConnectDevice = async () => {
    setConnectionStatus("connecting")

    // Simulate connection
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setConnectionStatus("connected")

    // Mark step as completed
    const newSteps = [...steps]
    newSteps[3].completed = true
    setSteps(newSteps)
  }

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      const newSteps = [...steps]
      newSteps[currentStep].completed = true
      setSteps(newSteps)
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0:
        return (
          formData.email.length > 0 && formData.password.length >= 8 && formData.password === formData.confirmPassword
        )
      case 1:
        return formData.organizationName.length > 0
      case 2:
        return formData.ibmQuantumToken.length > 0
      case 3:
        return connectionStatus === "connected"
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl font-mono font-bold text-primary">dna::{"}{"}::lang</span>
            <Badge variant="outline" className="font-mono text-xs">
              v1.0.0-ΛΦ
            </Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">Z3bra Quantum OS Setup</h1>
          <p className="text-muted-foreground">Configure your quantum computing environment</p>
          <p className="text-xs font-mono text-muted-foreground mt-1">ΛΦ = {LAMBDA_PHI.toExponential(6)}</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${index <= currentStep ? "text-primary" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    step.completed
                      ? "bg-primary border-primary text-primary-foreground"
                      : index === currentStep
                        ? "border-primary"
                        : "border-muted"
                  }`}
                >
                  {step.completed ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep].icon}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 0: Account Creation */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showApiKey ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Passwords do not match
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Organization */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org">Organization Name</Label>
                  <Input
                    id="org"
                    placeholder="Agile Defense Systems LLC"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  />
                </div>
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Security & Compliance
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> DFARS 15.6 Compliant
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> Zero-Trust Architecture
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> Phase Conjugate Encryption
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 2: IBM Quantum */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ibmToken">IBM Quantum API Token</Label>
                  <div className="relative">
                    <Input
                      id="ibmToken"
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter your IBM Quantum token"
                      value={formData.ibmQuantumToken}
                      onChange={(e) => setFormData({ ...formData, ibmQuantumToken: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your token from{" "}
                    <a
                      href="https://quantum-computing.ibm.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      quantum-computing.ibm.com
                    </a>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">8,500+</p>
                    <p className="text-xs text-muted-foreground">Quantum Executions</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">86.9%</p>
                    <p className="text-xs text-muted-foreground">Bell State Fidelity</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Android Bridge */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <Tabs
                  defaultValue="bluetooth"
                  onValueChange={(v) => setFormData({ ...formData, connectionType: v as any })}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="bluetooth">Bluetooth</TabsTrigger>
                    <TabsTrigger value="adb">ADB/USB</TabsTrigger>
                    <TabsTrigger value="network">Network</TabsTrigger>
                  </TabsList>
                  <TabsContent value="bluetooth" className="space-y-4">
                    <div className="p-4 border border-dashed rounded-lg text-center">
                      {!deviceFound ? (
                        <>
                          <Wifi className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-3">Scan for nearby Android devices</p>
                          <Button onClick={handleScanDevices} disabled={isScanning}>
                            {isScanning ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Scanning...
                              </>
                            ) : (
                              "Scan for Devices"
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Smartphone className="h-12 w-12 mx-auto mb-3 text-primary" />
                          <p className="font-medium">{formData.deviceName}</p>
                          <p className="text-xs text-muted-foreground mb-3">Ready to connect</p>
                          <Button
                            onClick={handleConnectDevice}
                            disabled={connectionStatus === "connecting" || connectionStatus === "connected"}
                          >
                            {connectionStatus === "connecting" ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Connecting...
                              </>
                            ) : connectionStatus === "connected" ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Connected
                              </>
                            ) : (
                              "Connect Device"
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="adb" className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-mono mb-2">Run in Termux:</p>
                      <code className="text-xs bg-background p-2 rounded block">adb connect 192.168.1.x:5555</code>
                    </div>
                  </TabsContent>
                  <TabsContent value="network" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Device IP Address</Label>
                      <Input placeholder="192.168.1.100" />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Setup Complete!</h3>
                  <p className="text-muted-foreground">Your Z3bra Quantum OS environment is ready</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Organization</p>
                    <p className="font-medium">{formData.organizationName || "Not set"}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Android Bridge</p>
                    <p className="font-medium">{formData.deviceName || "Not connected"}</p>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={() => (window.location.href = "/quantum-os")}>
                  Launch Z3bra OS
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button onClick={handleNextStep} disabled={!validateCurrentStep()}>
              {currentStep === 3 ? "Complete Setup" : "Continue"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
