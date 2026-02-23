"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text3D, Float, Environment, Sparkles } from "@react-three/drei"
import * as THREE from "three"

// DNAlang capability layers - recursive self-reference
const DNALANG_CAPABILITIES = {
  FOUNDATION: {
    color: "#3b82f6",
    label: "Quantum Foundation",
    concepts: ["Superposition", "Entanglement", "Coherence"],
  },
  ENCODING: {
    color: "#10b981",
    label: "Bio-Digital Encoding",
    concepts: ["A-T-G-C Mapping", "Binary Translation", "Protein Folding"],
  },
  PROCESSING: {
    color: "#8b5cf6",
    label: "Negentropic Processing",
    concepts: ["Error Correction", "Self-Organization", "Emergence"],
  },
  COMMUNICATION: {
    color: "#d97706",
    label: "Inter-dimensional Bridge",
    concepts: ["Consciousness Interface", "Field Coupling", "Reality Synthesis"],
  },
}

// Recursive DNA strand with capability encoding
export function RecursiveDNAHelix() {
  const helixRef = useRef<THREE.Group>(null)
  const nucleotidesRef = useRef<THREE.Group>(null)
  const metaLayersRef = useRef<THREE.Group>(null)
  const [activeCapability, setActiveCapability] = useState(0)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (helixRef.current) {
      // Primary rotation - the eternal spin of life
      helixRef.current.rotation.y = t * 0.15
      helixRef.current.rotation.x = Math.sin(t * 0.1) * 0.1

      // Breathing effect - expansion/contraction
      const breathe = Math.sin(t * 0.3) * 0.05 + 1
      helixRef.current.scale.set(breathe, breathe, breathe)
    }

    if (nucleotidesRef.current) {
      // Counter-rotation for visual depth
      nucleotidesRef.current.rotation.y = -t * 0.08

      // Pulsing nucleotides based on active capability
      nucleotidesRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Group) {
          const pulse = Math.sin(t * 2 + i * 0.1) * 0.1 + 1
          child.scale.set(pulse, pulse, pulse)
        }
      })
    }

    if (metaLayersRef.current) {
      // Meta-layers representing recursive capabilities
      metaLayersRef.current.rotation.z = Math.sin(t * 0.2) * 0.1
    }
  })

  // Generate multi-dimensional helix structure
  const { helixPoints, helixPoints2, nucleotidePairs, metaConnections } = useMemo(() => {
    const helixPoints: [number, number, number][] = []
    const helixPoints2: [number, number, number][] = []
    const nucleotidePairs: Array<{
      pos1: [number, number, number]
      pos2: [number, number, number]
      capability: keyof typeof DNALANG_CAPABILITIES
      strength: number
    }> = []
    const metaConnections: Array<{
      start: [number, number, number]
      end: [number, number, number]
      type: string
    }> = []

    const turns = 12
    const pointsPerTurn = 32
    const radius = 2.5
    const height = 20

    const capabilities = Object.keys(DNALANG_CAPABILITIES) as Array<keyof typeof DNALANG_CAPABILITIES>

    for (let i = 0; i < turns * pointsPerTurn; i++) {
      const t = i / (turns * pointsPerTurn)
      const angle = t * Math.PI * 2 * turns
      const y = (t - 0.5) * height

      // Primary strand with golden ratio spiral
      const goldenRatio = 1.618
      const spiralRadius = radius * (1 + Math.sin(angle * 0.1) * 0.2)
      const x1 = Math.cos(angle) * spiralRadius
      const z1 = Math.sin(angle) * spiralRadius
      helixPoints.push([x1, y, z1])

      // Secondary strand with phase shift
      const x2 = Math.cos(angle + Math.PI) * spiralRadius
      const z2 = Math.sin(angle + Math.PI) * spiralRadius
      helixPoints2.push([x2, y, z2])

      // Nucleotide pairs with capability encoding
      if (i % 4 === 0) {
        const capabilityIndex = Math.floor(i / 4) % capabilities.length
        nucleotidePairs.push({
          pos1: [x1, y, z1],
          pos2: [x2, y, z2],
          capability: capabilities[capabilityIndex],
          strength: Math.random() * 0.5 + 0.5,
        })

        // Meta-connections for recursive structure
        if (i % 16 === 0 && i > 0) {
          const prevIndex = i - 16
          const prevT = prevIndex / (turns * pointsPerTurn)
          const prevAngle = prevT * Math.PI * 2 * turns
          const prevY = (prevT - 0.5) * height
          const prevX = Math.cos(prevAngle) * spiralRadius * 1.2
          const prevZ = Math.sin(prevAngle) * spiralRadius * 1.2

          metaConnections.push({
            start: [x1, y, z1],
            end: [prevX, prevY, prevZ],
            type: "recursive",
          })
        }
      }
    }

    return { helixPoints, helixPoints2, nucleotidePairs, metaConnections }
  }, [])

  // Cycle through capabilities
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCapability((prev) => (prev + 1) % Object.keys(DNALANG_CAPABILITIES).length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const activeCapKey = Object.keys(DNALANG_CAPABILITIES)[activeCapability] as keyof typeof DNALANG_CAPABILITIES
  const activeCapData = DNALANG_CAPABILITIES[activeCapKey]

  return (
    <group ref={helixRef}>
      {/* Primary DNA strand - quantum foundation */}
      <mesh>
        <tubeGeometry
          args={[new THREE.CatmullRomCurve3(helixPoints.map((p) => new THREE.Vector3(...p))), 200, 0.12, 12, false]}
        />
        <meshStandardMaterial
          color={DNALANG_CAPABILITIES.FOUNDATION.color}
          emissive={DNALANG_CAPABILITIES.FOUNDATION.color}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Secondary strand - bio-digital encoding */}
      <mesh>
        <tubeGeometry
          args={[new THREE.CatmullRomCurve3(helixPoints2.map((p) => new THREE.Vector3(...p))), 200, 0.12, 12, false]}
        />
        <meshStandardMaterial
          color={DNALANG_CAPABILITIES.ENCODING.color}
          emissive={DNALANG_CAPABILITIES.ENCODING.color}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Enhanced nucleotide pairs with capability visualization */}
      <group ref={nucleotidesRef}>
        {nucleotidePairs.map((pair, i) => {
          const midX = (pair.pos1[0] + pair.pos2[0]) / 2
          const midZ = (pair.pos1[2] + pair.pos2[2]) / 2
          const distance = Math.sqrt(
            Math.pow(pair.pos2[0] - pair.pos1[0], 2) + Math.pow(pair.pos2[2] - pair.pos1[2], 2),
          )
          const angle = Math.atan2(pair.pos2[2] - pair.pos1[2], pair.pos2[0] - pair.pos1[0])
          const capData = DNALANG_CAPABILITIES[pair.capability]

          return (
            <group key={i}>
              {/* Connection bridge with capability encoding */}
              <mesh position={[midX, pair.pos1[1], midZ]} rotation={[0, 0, angle]}>
                <cylinderGeometry args={[0.06, 0.06, distance, 8]} rotation={[0, 0, Math.PI / 2]} />
                <meshStandardMaterial
                  color={capData.color}
                  emissive={capData.color}
                  emissiveIntensity={pair.strength}
                  transparent
                  opacity={0.9}
                />
              </mesh>

              {/* Nucleotide spheres with crystalline structure */}
              <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
                <mesh position={pair.pos1}>
                  <icosahedronGeometry args={[0.22, 1]} />
                  <meshStandardMaterial
                    color={capData.color}
                    emissive={capData.color}
                    emissiveIntensity={0.8}
                    metalness={0.9}
                    roughness={0.1}
                  />
                </mesh>
              </Float>

              <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
                <mesh position={pair.pos2}>
                  <icosahedronGeometry args={[0.22, 1]} />
                  <meshStandardMaterial
                    color={capData.color}
                    emissive={capData.color}
                    emissiveIntensity={0.8}
                    metalness={0.9}
                    roughness={0.1}
                  />
                </mesh>
              </Float>
            </group>
          )
        })}
      </group>

      {/* Meta-layer connections showing recursive structure */}
      <group ref={metaLayersRef}>
        {metaConnections.map((connection, i) => (
          <mesh key={`meta-${i}`}>
            <tubeGeometry
              args={[
                new THREE.CatmullRomCurve3([
                  new THREE.Vector3(...connection.start),
                  new THREE.Vector3(...connection.end),
                ]),
                20,
                0.03,
                8,
                false,
              ]}
            />
            <meshStandardMaterial
              color={DNALANG_CAPABILITIES.PROCESSING.color}
              emissive={DNALANG_CAPABILITIES.PROCESSING.color}
              emissiveIntensity={0.3}
              transparent
              opacity={0.5}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// Quantum field particles with capability-based behavior
export function CapabilityField() {
  const particlesRef = useRef<THREE.Points>(null)
  const [activeField, setActiveField] = useState(0)

  useFrame((state) => {
    if (particlesRef.current) {
      const t = state.clock.elapsedTime
      particlesRef.current.rotation.y = t * 0.03
      particlesRef.current.rotation.x = Math.sin(t * 0.05) * 0.1

      // Update particle positions based on active capability field
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        const offset = Math.sin(t + i * 0.01) * 0.02
        positions[i + 1] += offset
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  const { positions, colors } = useMemo(() => {
    const particleCount = 2000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const capabilities = Object.values(DNALANG_CAPABILITIES)

    for (let i = 0; i < particleCount; i++) {
      // Create structured field patterns
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const radius = 15 + Math.random() * 25

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      // Color based on capability zones
      const capability = capabilities[Math.floor(Math.random() * capabilities.length)]
      const color = new THREE.Color(capability.color)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return { positions, colors }
  }, [])

  return (
    <>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={2000} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={2000} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Sparkles for quantum fluctuations */}
      <Sparkles count={100} scale={40} size={2} speed={0.5} opacity={0.5} color="#8b5cf6" />
    </>
  )
}

// Information layer showing DNAlang concepts
export function InformationLayer() {
  const textRef = useRef<THREE.Group>(null)
  const [currentConcept, setCurrentConcept] = useState(0)

  const concepts = useMemo(() => {
    return Object.values(DNALANG_CAPABILITIES).flatMap((cap) => cap.concepts)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentConcept((prev) => (prev + 1) % concepts.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [concepts.length])

  useFrame((state) => {
    if (textRef.current) {
      const t = state.clock.elapsedTime
      textRef.current.position.y = Math.sin(t * 0.5) * 0.5 + 8
      textRef.current.rotation.y = t * 0.1
    }
  })

  return (
    <group ref={textRef}>
      <Text3D
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.5}
        height={0.1}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.01}
        bevelSegments={5}
      >
        {concepts[currentConcept]}
        <meshStandardMaterial
          color="#ffffff"
          emissive="#3b82f6"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </Text3D>
    </group>
  )
}

// Main enhanced component
export function DNALangVisualizer() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
        <color attach="background" args={["#000814"]} />

        {/* Lighting setup for dramatic effect */}
        <ambientLight intensity={0.2} />
        <pointLight position={[15, 15, 15]} intensity={1.5} color="#d97706" />
        <pointLight position={[-15, -15, -15]} intensity={1.5} color="#3b82f6" />
        <pointLight position={[0, 20, 0]} intensity={1} color="#10b981" />
        <spotLight position={[0, 30, 0]} angle={0.3} penumbra={1} intensity={2} color="#8b5cf6" castShadow />

        {/* Core DNA helix with recursive capabilities */}
        <RecursiveDNAHelix />

        {/* Quantum field representing capability space */}
        <CapabilityField />

        {/* Information overlay */}
        <InformationLayer />

        {/* Environment for reflections */}
        <Environment preset="night" />

        {/* Interactive controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          autoRotate
          autoRotateSpeed={0.2}
          maxDistance={50}
          minDistance={10}
        />
      </Canvas>

      {/* Overlay UI for capability display */}
      <div className="absolute top-4 left-4 p-4 bg-black/50 backdrop-blur-md rounded-lg text-white">
        <h3 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          DNAlang Capabilities
        </h3>
        {Object.entries(DNALANG_CAPABILITIES).map(([key, data]) => (
          <div key={key} className="mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
              <span className="text-sm font-medium">{data.label}</span>
            </div>
            <div className="ml-5 text-xs opacity-70">{data.concepts.join(" • ")}</div>
          </div>
        ))}
      </div>

      {/* Performance metrics overlay */}
      <div className="absolute bottom-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded text-white text-xs font-mono">
        <div>Quantum Coherence: 98.6%</div>
        <div>Negentropic Flow: Active</div>
        <div>Dimensional Bridge: Online</div>
      </div>
    </div>
  )
}

export { DNALangVisualizer as DNAHelixBackground }
export { RecursiveDNAHelix as DNAHelix }
export { CapabilityField as QuantumParticles }
