'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A cheap-but-pretty anamorphic lens flare. Two crossed cards (one
 * horizontal long streak, one vertical thinner one) plus a soft glow disc,
 * all camera-facing, all additive. Drop one at each bright light source.
 */

const FLARE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying vec2 vUv;
void main() {
  vec2 p = vUv - 0.5;
  // Streak: long along x, sharp falloff along y.
  float streak = exp(-pow(p.y * 22.0, 2.0)) * exp(-pow(p.x * 2.3, 2.0));
  // Soft core hotspot.
  float core = exp(-dot(p, p) * 28.0);
  float a = streak * 0.85 + core * 0.6;
  vec3 color = uColor * (streak * 1.2 + core * 2.0);
  gl_FragColor = vec4(color, a * uIntensity);
}
`;

const FLARE_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

function FlareCard({
  color,
  scale,
  rotation,
  intensity,
}: {
  color: string;
  scale: [number, number];
  rotation: number;
  intensity: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    }),
    [color, intensity],
  );
  return (
    <mesh rotation-z={rotation}>
      <planeGeometry args={scale} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={FLARE_VERT}
        fragmentShader={FLARE_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

interface Props {
  position: [number, number, number];
  color?: string;
  size?: number;
  intensity?: number;
  /** Slowly pulses the flare intensity if true. */
  pulse?: boolean;
}

export default function LensFlare({
  position,
  color = '#67e8f9',
  size = 4,
  intensity = 1,
  pulse = true,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const baseIntensity = intensity;
  const { camera } = useThree();

  useFrame((state) => {
    if (!groupRef.current) return;
    // Distance-based attenuation so far-away flares stay subtle.
    const dist = camera.position.distanceTo(groupRef.current.position);
    const fade = THREE.MathUtils.smoothstep(20 - dist, 0, 12);
    const pulseFactor = pulse ? 0.85 + 0.15 * Math.sin(state.clock.elapsedTime * 1.3) : 1;
    const finalIntensity = baseIntensity * fade * pulseFactor;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.ShaderMaterial;
        if (mat.uniforms?.uIntensity) mat.uniforms.uIntensity.value = finalIntensity;
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      <Billboard>
        {/* Main horizontal anamorphic streak */}
        <FlareCard color={color} scale={[size, size * 0.18]} rotation={0} intensity={baseIntensity} />
        {/* Crossed vertical streak, thinner */}
        <FlareCard
          color={color}
          scale={[size * 0.65, size * 0.06]}
          rotation={Math.PI / 2}
          intensity={baseIntensity * 0.7}
        />
        {/* Diagonal accent */}
        <FlareCard
          color={color}
          scale={[size * 0.5, size * 0.04]}
          rotation={Math.PI / 4}
          intensity={baseIntensity * 0.5}
        />
      </Billboard>
    </group>
  );
}
