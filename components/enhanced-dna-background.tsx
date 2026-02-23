"use client"

import { useState, useCallback } from "react"
import { DNALangVisualizer } from "@/components/dna-helix-background"
import { BackgroundControls } from "@/components/background-controls"

export function EnhancedDNABackground() {
  const [config, setConfig] = useState({
    animationSpeed: 1,
    particleCount: 2000,
    rotationSpeed: 0.2,
    animationEnabled: true,
    particlesEnabled: true,
    helixEnabled: true,
  })

  const handleAnimationSpeedChange = useCallback((speed: number) => {
    setConfig((prev) => ({ ...prev, animationSpeed: speed }))
  }, [])

  const handleParticleCountChange = useCallback((count: number) => {
    setConfig((prev) => ({ ...prev, particleCount: count }))
  }, [])

  const handleToggleAnimation = useCallback((enabled: boolean) => {
    setConfig((prev) => ({ ...prev, animationEnabled: enabled }))
  }, [])

  const handleToggleParticles = useCallback((enabled: boolean) => {
    setConfig((prev) => ({ ...prev, particlesEnabled: enabled }))
  }, [])

  const handleToggleHelix = useCallback((enabled: boolean) => {
    setConfig((prev) => ({ ...prev, helixEnabled: enabled }))
  }, [])

  const handleRotationSpeedChange = useCallback((speed: number) => {
    setConfig((prev) => ({ ...prev, rotationSpeed: speed }))
  }, [])

  const handleReset = useCallback(() => {
    setConfig({
      animationSpeed: 1,
      particleCount: 2000,
      rotationSpeed: 0.2,
      animationEnabled: true,
      particlesEnabled: true,
      helixEnabled: true,
    })
  }, [])

  return (
    <>
      <DNALangVisualizer />
      <BackgroundControls
        onAnimationSpeedChange={handleAnimationSpeedChange}
        onParticleCountChange={handleParticleCountChange}
        onToggleAnimation={handleToggleAnimation}
        onToggleParticles={handleToggleParticles}
        onToggleHelix={handleToggleHelix}
        onRotationSpeedChange={handleRotationSpeedChange}
        onReset={handleReset}
      />
    </>
  )
}
