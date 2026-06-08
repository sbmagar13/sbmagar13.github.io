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

  // Each packet gets a stable size + phase so the flow has visual rhythm
  // instead of looking like a perfectly uniform conveyor belt.
  const packetSpec = useMemo(
    () =>
      Array.from({ length: packetCount }).map((_, i) => ({
        scale: 0.7 + ((Math.sin(i * 13.7) + 1) / 2) * 0.7, // 0.7 → 1.4
        offset: i / packetCount + ((Math.sin(i * 31.3) + 1) / 2) * 0.05, // jitter
      })),
    [packetCount],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    for (let i = 0; i < packetCount; i++) {
      const m = packetRefs.current[i];
      if (!m) continue;
      const spec = packetSpec[i];
      const tt = (t + spec.offset) % 1;
      const pos = curve.getPoint(tt);
      m.position.copy(pos);
      // Brightness fades in/out at the endpoints, feels like a packet
      // emerging from a node and arriving at the next.
      const edgeFade = Math.min(1, Math.sin(tt * Math.PI) * 1.4);
      const breathe = 0.85 + 0.15 * Math.sin(state.clock.elapsedTime * 6 + i);
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 2.5 * edgeFade * breathe + 0.6;
      // Subtle scale pulse.
      const scale = spec.scale * (0.95 + 0.1 * Math.sin(state.clock.elapsedTime * 8 + i));
      m.scale.setScalar(scale);
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
          <sphereGeometry args={[0.038, 12, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
