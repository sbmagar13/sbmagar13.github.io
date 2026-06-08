'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BurstProps {
  position: [number, number, number];
  color?: string;
  count?: number;
  /** Lifetime in seconds before the burst fades and unmounts. */
  duration?: number;
  /** Called when the burst is done so the parent can clean up state. */
  onDone?: () => void;
}

/**
 * A single short-lived particle burst. Spawns N spheres at the given
 * position, then animates them flying outward along randomized rays
 * with gravity + drag, fading to zero alpha over `duration` seconds.
 *
 * Mount one of these whenever you want to mark a click. Pass a fresh
 * `key` per burst so React unmounts and remounts cleanly.
 */
export default function ClickBurst({
  position,
  color = '#22d3ee',
  count = 26,
  duration = 0.9,
  onDone,
}: BurstProps) {
  const groupRef = useRef<THREE.Group>(null);
  const startTimeRef = useRef<number | null>(null);

  // Pre-compute each particle's launch direction + speed once.
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map(() => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 3 + Math.random() * 3.5;
        return {
          dir: new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi),
          ).multiplyScalar(speed),
          scale: 0.4 + Math.random() * 0.7,
        };
      }),
    [count],
  );

  const meshRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    if (startTimeRef.current === null) startTimeRef.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    const t = Math.min(elapsed / duration, 1);

    // Position + scale + opacity per particle.
    particles.forEach((p, i) => {
      const m = meshRefs.current[i];
      if (!m) return;
      const damp = 1 - Math.pow(1 - t, 3); // ease-out cubic
      m.position.set(
        p.dir.x * damp,
        p.dir.y * damp - 1.5 * t * t, // a hint of gravity
        p.dir.z * damp,
      );
      const fade = 1 - t;
      m.scale.setScalar(p.scale * (0.6 + 0.6 * fade));
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = fade * fade;
    });

    if (t >= 1 && onDone) onDone();
  });

  useEffect(() => {
    if (!onDone) return;
    // Safety net in case useFrame doesn't tick (e.g. tab hidden).
    const id = setTimeout(onDone, duration * 1000 + 200);
    return () => clearTimeout(id);
  }, [onDone, duration]);

  return (
    <group ref={groupRef} position={position}>
      {particles.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) meshRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={1}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Central shockwave ring */}
      <Shockwave color={color} duration={duration} />
    </group>
  );
}

function Shockwave({ color, duration }: { color: string; duration: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const startRef = useRef<number | null>(null);
  useFrame((state) => {
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const t = Math.min((state.clock.elapsedTime - startRef.current) / duration, 1);
    if (!ref.current) return;
    const scale = 0.4 + t * 4;
    ref.current.scale.setScalar(scale);
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = (1 - t) * 0.6;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.4, 0.5, 48]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * Queue manager. Holds 0..N active bursts and renders them. Use the
 * returned `trigger(position, color)` to fire a burst from outside.
 */
export function useBurstQueue() {
  const [bursts, setBursts] = useState<
    Array<{ id: number; position: [number, number, number]; color: string }>
  >([]);
  const counter = useRef(0);

  const trigger = (position: [number, number, number], color = '#22d3ee') => {
    counter.current += 1;
    const id = counter.current;
    setBursts((b) => [...b, { id, position, color }]);
  };

  const remove = (id: number) => {
    setBursts((b) => b.filter((x) => x.id !== id));
  };

  return { bursts, trigger, remove };
}
