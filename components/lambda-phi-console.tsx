"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"

// ΛΦ Universal Memory Constant
const LAMBDA_PHI = 2.176435e-8

export function ToroidalManifold() {
  const torusRef = useRef<THREE.Mesh>(null)
  const innerTorusRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (torusRef.current) {
      torusRef.current.rotation.x = Math.sin(t * 0.2) * 0.3
      torusRef.current.rotation.y = t * 0.3
    }

    if (innerTorusRef.current) {
      innerTorusRef.current.rotation.x = -Math.sin(t * 0.3) * 0.2
      innerTorusRef.current.rotation.y = -t * 0.4
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.1
    }
  })

  // Create coherence field particles
  const particleCount = 500
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI * 2
      const r = 3 + Math.random() * 2

      pos[i * 3] = r * Math.sin(theta) * Math.cos(phi)
      pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi)
      pos[i * 3 + 2] = r * Math.cos(theta)
    }
    return pos
  }, [])

  return (
    <group>
      {/* Outer toroidal manifold - negentropic warmth */}
      <mesh ref={torusRef}>
        <torusGeometry args={[2.5, 0.4, 32, 100]} />
        <meshStandardMaterial
          color="#d97706"
          emissive="#d97706"
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
          wireframe
        />
      </mesh>

      {/* Inner toroidal manifold - magnetic blue */}
      <mesh ref={innerTorusRef}>
        <torusGeometry args={[2, 0.3, 32, 100]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} transparent opacity={0.6} />
      </mesh>

      {/* Coherence field particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#10b981" transparent opacity={0.6} sizeAttenuation />
      </points>

      {/* ΛΦ constant display */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.3}
        color="#d97706"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Geist-Bold.ttf"
      >
        ΛΦ
      </Text>

      <Text
        position={[0, -0.5, 0]}
        fontSize={0.15}
        color="#3b82f6"
        anchorX="center"
        anchorY="middle"
        font="/fonts/GeistMono-Regular.ttf"
      >
        {LAMBDA_PHI.toExponential(6)}
      </Text>
    </group>
  )
}

export function PhaseConjugateField() {
  const fieldRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (fieldRef.current) {
      const t = state.clock.elapsedTime
      fieldRef.current.rotation.z = t * 0.5
      // @ts-ignore
      fieldRef.current.material.uniforms.time.value = t
    }
  })

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color("#d97706") },
          color2: { value: new THREE.Color("#3b82f6") },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color1;
          uniform vec3 color2;
          varying vec2 vUv;
          
          void main() {
            vec2 center = vec2(0.5, 0.5);
            float dist = distance(vUv, center);
            float wave = sin(dist * 20.0 - time * 2.0) * 0.5 + 0.5;
            vec3 color = mix(color1, color2, wave);
            float alpha = (1.0 - dist) * 0.3 * wave;
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    [],
  )

  return (
    <mesh ref={fieldRef} material={shaderMaterial}>
      <planeGeometry args={[8, 8, 32, 32]} />
    </mesh>
  )
}
