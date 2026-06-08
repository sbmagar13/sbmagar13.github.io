'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PALETTE } from './Materials';

interface Props {
  position?: [number, number, number];
  rotation?: [number, number, number];
  radius?: number;
  bladeCount?: number;
  speed?: number;
  /** When true, the fan throbs slightly in speed, feels more alive. */
  variable?: boolean;
}

/**
 * A real-looking server fan: hub + N angled blades + outer cage ring.
 * The blades are flat boxes rotated around the hub with a slight pitch
 * so they read as fan blades even when motion-blurred.
 */
export default function FanBlade({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  radius = 0.18,
  bladeCount = 5,
  speed = 4,
  variable = true,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);

  // Pre-build the blade geometries at fixed angles around the hub.
  const blades = useMemo(
    () =>
      Array.from({ length: bladeCount }).map((_, i) => ({
        angle: (i / bladeCount) * Math.PI * 2,
      })),
    [bladeCount],
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Small speed jitter so the spin doesn't look mechanical-perfect.
    const spinSpeed = variable ? speed + Math.sin(t * 0.3) * 0.6 : speed;
    groupRef.current.rotation.z = t * spinSpeed;
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Outer cage ring */}
      <mesh>
        <torusGeometry args={[radius * 1.05, radius * 0.05, 6, 32]} />
        <meshStandardMaterial color={PALETTE.steel} metalness={0.85} roughness={0.4} />
      </mesh>

      {/* Cage spokes, three thin bars across, like a real fan grill */}
      {[0, Math.PI / 3, (2 * Math.PI) / 3].map((a, i) => (
        <mesh key={i} rotation={[0, 0, a]} position={[0, 0, 0.005]}>
          <boxGeometry args={[radius * 2.1, radius * 0.04, 0.003]} />
          <meshStandardMaterial color={PALETTE.steelDark} metalness={0.7} roughness={0.55} />
        </mesh>
      ))}

      {/* Spinning blade assembly */}
      <group ref={groupRef}>
        {/* Hub */}
        <mesh>
          <cylinderGeometry args={[radius * 0.22, radius * 0.22, 0.025, 16]} />
          <meshStandardMaterial color={PALETTE.steelDark} metalness={0.9} roughness={0.3} />
        </mesh>
        {/* Hub center cap (raised) */}
        <mesh position={[0, 0, 0.015]}>
          <cylinderGeometry args={[radius * 0.1, radius * 0.1, 0.015, 12]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.6} />
        </mesh>
        {/* Blades */}
        {blades.map(({ angle }, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius * 0.55,
              Math.sin(angle) * radius * 0.55,
              0.005,
            ]}
            rotation={[0, 0, angle + Math.PI / 2]}
          >
            <boxGeometry args={[radius * 0.22, radius * 0.85, 0.012]} />
            <meshStandardMaterial
              color="#1f2937"
              metalness={0.4}
              roughness={0.55}
              emissive="#0ea5e9"
              emissiveIntensity={0.05}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
