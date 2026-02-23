"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings, Play, Pause, RotateCcw, Eye, EyeOff, Sparkles, Zap, ChevronDown, ChevronUp } from "lucide-react"

interface BackgroundControlsProps {
  onAnimationSpeedChange: (speed: number) => void
  onParticleCountChange: (count: number) => void
  onToggleAnimation: (enabled: boolean) => void
  onToggleParticles: (enabled: boolean) => void
  onToggleHelix: (enabled: boolean) => void
  onRotationSpeedChange: (speed: number) => void
  onReset: () => void
}

export function BackgroundControls({
  onAnimationSpeedChange,
  onParticleCountChange,
  onToggleAnimation,
  onToggleParticles,
  onToggleHelix,
  onRotationSpeedChange,
  onReset,
}: BackgroundControlsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [particleCount, setParticleCount] = useState(2000)
  const [rotationSpeed, setRotationSpeed] = useState(0.2)
  const [animationEnabled, setAnimationEnabled] = useState(true)
  const [particlesEnabled, setParticlesEnabled] = useState(true)
  const [helixEnabled, setHelixEnabled] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Check for user's motion preference
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(motionQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
      if (e.matches) {
        setAnimationEnabled(false)
        onToggleAnimation(false)
      }
    }

    motionQuery.addEventListener("change", handleChange)
    return () => motionQuery.removeEventListener("change", handleChange)
  }, [onToggleAnimation])

  const handleAnimationSpeedChange = (value: number[]) => {
    const speed = value[0]
    setAnimationSpeed(speed)
    onAnimationSpeedChange(speed)
  }

  const handleParticleCountChange = (value: number[]) => {
    const count = value[0]
    setParticleCount(count)
    onParticleCountChange(count)
  }

  const handleRotationSpeedChange = (value: number[]) => {
    const speed = value[0]
    setRotationSpeed(speed)
    onRotationSpeedChange(speed)
  }

  const handleToggleAnimation = (checked: boolean) => {
    setAnimationEnabled(checked)
    onToggleAnimation(checked)
  }

  const handleToggleParticles = (checked: boolean) => {
    setParticlesEnabled(checked)
    onToggleParticles(checked)
  }

  const handleToggleHelix = (checked: boolean) => {
    setHelixEnabled(checked)
    onToggleHelix(checked)
  }

  const handleReset = () => {
    setAnimationSpeed(1)
    setParticleCount(2000)
    setRotationSpeed(0.2)
    setAnimationEnabled(true)
    setParticlesEnabled(true)
    setHelixEnabled(true)
    onReset()
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="glass-card p-4 w-80">
        <div className="flex items-center justify-between cursor-pointer mb-3" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#d97706]" />
            <h3 className="font-semibold">Background Controls</h3>
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>

        {isOpen && (
          <div className="space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* Reduced Motion Warning */}
            {reducedMotion && (
              <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded text-xs text-amber-200">
                Reduced motion mode detected. Animations are limited for accessibility.
              </div>
            )}

            {/* Animation Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="animation-toggle" className="flex items-center gap-2 cursor-pointer">
                {animationEnabled ? (
                  <Play className="h-4 w-4 text-[#10b981]" />
                ) : (
                  <Pause className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Animations</span>
              </Label>
              <Switch
                id="animation-toggle"
                checked={animationEnabled}
                onCheckedChange={handleToggleAnimation}
                disabled={reducedMotion}
              />
            </div>

            {/* DNA Helix Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="helix-toggle" className="flex items-center gap-2 cursor-pointer">
                {helixEnabled ? (
                  <Eye className="h-4 w-4 text-[#3b82f6]" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">DNA Helix</span>
              </Label>
              <Switch id="helix-toggle" checked={helixEnabled} onCheckedChange={handleToggleHelix} />
            </div>

            {/* Particles Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="particles-toggle" className="flex items-center gap-2 cursor-pointer">
                {particlesEnabled ? (
                  <Sparkles className="h-4 w-4 text-[#8b5cf6]" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">Quantum Particles</span>
              </Label>
              <Switch id="particles-toggle" checked={particlesEnabled} onCheckedChange={handleToggleParticles} />
            </div>

            {/* Animation Speed Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#d97706]" />
                  Animation Speed
                </Label>
                <span className="text-xs text-muted-foreground">{animationSpeed.toFixed(1)}x</span>
              </div>
              <Slider
                value={[animationSpeed]}
                onValueChange={handleAnimationSpeedChange}
                min={0.1}
                max={3}
                step={0.1}
                disabled={!animationEnabled}
                className="w-full"
              />
            </div>

            {/* Rotation Speed Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Rotation Speed</Label>
                <span className="text-xs text-muted-foreground">{rotationSpeed.toFixed(1)}</span>
              </div>
              <Slider
                value={[rotationSpeed]}
                onValueChange={handleRotationSpeedChange}
                min={0}
                max={1}
                step={0.05}
                disabled={!animationEnabled}
                className="w-full"
              />
            </div>

            {/* Particle Count Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Particle Density</Label>
                <span className="text-xs text-muted-foreground">{particleCount}</span>
              </div>
              <Slider
                value={[particleCount]}
                onValueChange={handleParticleCountChange}
                min={500}
                max={5000}
                step={100}
                disabled={!particlesEnabled}
                className="w-full"
              />
            </div>

            {/* Reset Button */}
            <Button onClick={handleReset} variant="outline" className="w-full mt-4 bg-transparent" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>

            {/* Performance Info */}
            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
              <p>Tip: Lower particle count and animation speed for better performance on mobile devices.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
