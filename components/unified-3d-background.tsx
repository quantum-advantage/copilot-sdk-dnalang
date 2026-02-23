"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { DNAHelix, QuantumParticles } from "./dna-helix-background"

export function Unified3DBackground() {
  return (
    <div className="fixed inset-0 -z-10 opacity-25">
      <Canvas camera={{ position: [0, 0, 18], fov: 55 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#d97706" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#3b82f6" />
        <pointLight position={[0, 15, 0]} intensity={0.8} color="#10b981" />
        <DNAHelix />
        <QuantumParticles />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  )
}
