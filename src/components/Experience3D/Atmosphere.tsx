'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DustProps {
  count?: number;
  radius?: number;
  height?: number;
  color?: string;
  size?: number;
}

/**
 * Cinematic dust motes — slow upward drift with a slight horizontal sway.
 * Renders as a single Points object with vertex colors and additive
 * blending so the motes pop against the bloom pass.
 */
export function DustMotes({
  count = 600,
  radius = 14,
  height = 8,
  color = '#22d3ee',
  size = 0.03,
}: DustProps) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * radius * 2;
      positions[i * 3 + 1] = Math.random() * height - height / 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * radius * 2;
      speeds[i] = 0.05 + Math.random() * 0.12;
      phases[i] = Math.random() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [count, radius, height]);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const speeds = ref.current.geometry.attributes.speed as THREE.BufferAttribute;
    const phases = ref.current.geometry.attributes.phase as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + speeds.getX(i) * 0.015;
      // Loop: when a mote rises past the ceiling, drop it back to the floor.
      if (y > height / 2) y = -height / 2;
      pos.setY(i, y);
      // Horizontal sway adds life without being obvious.
      const phase = phases.getX(i);
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.2 + phase) * 0.0008);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface VolumetricBeamProps {
  position: [number, number, number];
  height?: number;
  topRadius?: number;
  bottomRadius?: number;
  color?: string;
  opacity?: number;
}

/**
 * Fake-volumetric light cone (cheap version of god rays). A semi-transparent
 * inverted cone shaded with additive blending — looks like a beam of light
 * cutting through dust when combined with <DustMotes />.
 */
export function VolumetricBeam({
  position,
  height = 6,
  topRadius = 0.08,
  bottomRadius = 1.6,
  color = '#22d3ee',
  opacity = 0.08,
}: VolumetricBeamProps) {
  return (
    <mesh position={[position[0], position[1] - height / 2, position[2]]}>
      <coneGeometry args={[bottomRadius, height, 32, 1, true]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/**
 * A long horizontal neon strip light. Reads as an emissive cylinder. Place
 * along racks for that cyberpunk underglow.
 */
export function NeonStrip({
  start,
  end,
  color = '#22d3ee',
  thickness = 0.04,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  thickness?: number;
}) {
  const { position, length, rotation } = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
    const euler = new THREE.Euler().setFromQuaternion(quat);
    return { position: mid.toArray() as [number, number, number], length: len, rotation: [euler.x, euler.y, euler.z] as [number, number, number] };
  }, [start, end]);

  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[thickness, thickness, length, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
        toneMapped={false}
      />
    </mesh>
  );
}
