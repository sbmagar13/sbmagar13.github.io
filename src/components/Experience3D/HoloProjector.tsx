'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PALETTE } from './Materials';

interface Props {
  position?: [number, number, number];
  beamHeight?: number;
  beamColor?: string;
}

/**
 * A projector base for the holographic avatar. A short pedestal of
 * concentric metal rings with a glowing emitter on top, plus a long
 * volumetric light cone (the projection beam) rising from it.
 */
export default function HoloProjector({
  position = [0, -2.0, 0],
  beamHeight = 4.2,
  beamColor = PALETTE.neonCyan,
}: Props) {
  const emitterRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (emitterRef.current) {
      const mat = emitterRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.5 + 0.5 * Math.sin(t * 2);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Heavy base */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.55, 0.7, 0.12, 32]} />
        <meshStandardMaterial color={PALETTE.rubber} metalness={0.6} roughness={0.6} />
      </mesh>

      {/* Mid section */}
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.5, 0.1, 32]} />
        <meshStandardMaterial color={PALETTE.steel} metalness={0.85} roughness={0.4} />
      </mesh>

      {/* Top emitter ring (slowly spins) */}
      <mesh
        ref={ringRef}
        position={[0, 0.18, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.32, 0.025, 12, 64]} />
        <meshStandardMaterial
          color={beamColor}
          emissive={beamColor}
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>

      {/* Center emitter (pulses) */}
      <mesh ref={emitterRef} position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshStandardMaterial
          color={beamColor}
          emissive={beamColor}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* Status pip on the side */}
      <mesh position={[0.45, 0.04, 0.3]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial
          color={PALETTE.ledGreen}
          emissive={PALETTE.ledGreen}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* Projection beam (semi-transparent cone widening upward) */}
      <mesh position={[0, 0.2 + beamHeight / 2, 0]}>
        <coneGeometry args={[1.5, beamHeight, 32, 1, true]} />
        <meshBasicMaterial
          color={beamColor}
          transparent
          opacity={0.04}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Thinner inner beam */}
      <mesh position={[0, 0.2 + beamHeight / 2, 0]}>
        <coneGeometry args={[0.6, beamHeight, 32, 1, true]} />
        <meshBasicMaterial
          color={beamColor}
          transparent
          opacity={0.05}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
