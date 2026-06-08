'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CableProps {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
  packetCount?: number;
  speed?: number;
  arch?: number;     // how much the cable arcs up over the midpoint
  thickness?: number;
}

/**
 * A fiber-optic cable rendered as a TubeGeometry along a quadratic-bezier
 * curve between two anchor points, with N glowing "packets" drifting along
 * the same curve.
 *
 * Cheap and reads beautifully under bloom.
 */
export default function CableFlow({
  from,
  to,
  color = '#22d3ee',
  packetCount = 3,
  speed = 0.18,
  arch = 0.6,
  thickness = 0.018,
}: CableProps) {
  const curve = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.y += arch;
    // Quadratic Bezier wrapped in CatmullRom for smoother evaluation along t.
    return new THREE.CatmullRomCurve3([a, mid, b], false, 'catmullrom', 0.5);
  }, [from, to, arch]);

  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, 40, thickness, 6, false),
    [curve, thickness],
  );

  const packetRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    for (let i = 0; i < packetCount; i++) {
      const m = packetRefs.current[i];
      if (!m) continue;
      const offset = i / packetCount;
      const tt = (t + offset) % 1;
      const pos = curve.getPoint(tt);
      m.position.copy(pos);
    }
  });

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.25}
          toneMapped={false}
          transparent
          opacity={0.35}
        />
      </mesh>
      {Array.from({ length: packetCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) packetRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
