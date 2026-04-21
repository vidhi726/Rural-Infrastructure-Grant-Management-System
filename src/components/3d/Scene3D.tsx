'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField({ count = 5000 }) {
    const ref = useRef<THREE.Points>(null)

    const positions = useMemo(() => {
        const positions = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50
        }
        return positions
    }, [count])

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.02
            ref.current.rotation.y = state.clock.elapsedTime * 0.03
        }
    })

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#3b82f6"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    )
}

function FloatingOrbs() {
    const orbRef1 = useRef<THREE.Mesh>(null)
    const orbRef2 = useRef<THREE.Mesh>(null)
    const orbRef3 = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        const t = state.clock.elapsedTime

        if (orbRef1.current) {
            orbRef1.current.position.y = Math.sin(t * 0.5) * 2 + 3
            orbRef1.current.position.x = Math.cos(t * 0.3) * 3 - 5
        }
        if (orbRef2.current) {
            orbRef2.current.position.y = Math.sin(t * 0.4 + 1) * 2 - 2
            orbRef2.current.position.x = Math.cos(t * 0.4 + 1) * 4 + 5
        }
        if (orbRef3.current) {
            orbRef3.current.position.y = Math.sin(t * 0.6 + 2) * 3
            orbRef3.current.position.x = Math.cos(t * 0.5 + 2) * 3
        }
    })

    return (
        <>
            <mesh ref={orbRef1} position={[-5, 3, -10]}>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshBasicMaterial color="#1e40af" transparent opacity={0.3} />
            </mesh>
            <mesh ref={orbRef2} position={[5, -2, -8]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color="#059669" transparent opacity={0.3} />
            </mesh>
            <mesh ref={orbRef3} position={[0, 0, -12]}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.2} />
            </mesh>
        </>
    )
}

function GlowingRing() {
    const ringRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (ringRef.current) {
            ringRef.current.rotation.z = state.clock.elapsedTime * 0.1
            ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.3
        }
    })

    return (
        <mesh ref={ringRef} position={[0, 0, -15]}>
            <torusGeometry args={[8, 0.1, 16, 100]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
        </mesh>
    )
}

export default function Scene3D() {
    return (
        <div className="fixed inset-0 -z-10">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 75 }}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.5} />
                <ParticleField />
                <FloatingOrbs />
                <GlowingRing />
            </Canvas>
        </div>
    )
}
