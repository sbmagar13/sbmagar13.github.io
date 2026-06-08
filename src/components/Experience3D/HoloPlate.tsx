'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform float uTime;
uniform float uOpacity;
uniform vec3 uTint;
uniform float uScanlineFreq;
uniform float uRgbSplit;
varying vec2 vUv;

// Cheap pseudo-random for the flicker. Stable per uv.
float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  vec2 uv = vUv;

  // Subtle warp at the edges so it bends like a hologram, not a flat photo.
  float bend = (uv.x - 0.5) * (uv.y - 0.5) * 0.04;
  uv += vec2(bend, bend * 0.5);

  // RGB split, sample the three channels at slightly offset UVs.
  float r = texture2D(uMap, uv + vec2( uRgbSplit, 0.0)).r;
  float g = texture2D(uMap, uv).g;
  float b = texture2D(uMap, uv - vec2( uRgbSplit, 0.0)).b;
  vec3 color = vec3(r, g, b);

  // Horizontal scan lines.
  float scan = 0.78 + 0.22 * sin(uv.y * uScanlineFreq + uTime * 5.0);
  color *= scan;

  // Every few seconds, a fast horizontal glitch sweeps through.
  float glitch = step(0.985, sin(uTime * 0.7));
  float yBand = step(0.95, sin(uv.y * 60.0 + uTime * 18.0));
  color += glitch * yBand * vec3(0.0, 0.4, 0.6);

  // Subtle noise flicker overall.
  float noise = hash(floor(uTime * 30.0) + uv.y * 100.0) * 0.05;
  color += noise;

  // Cool tint, lighter mix so the actual face stays recognizable.
  color = mix(color, uTint * (0.4 + dot(color, vec3(0.3, 0.6, 0.1))), 0.22);

  // Edge fade so it doesn't look like a hard-edged photo.
  float edge = smoothstep(0.0, 0.08, uv.x)
             * smoothstep(0.0, 0.08, 1.0 - uv.x)
             * smoothstep(0.0, 0.08, uv.y)
             * smoothstep(0.0, 0.06, 1.0 - uv.y);

  float alpha = uOpacity * edge;
  gl_FragColor = vec4(color, alpha);
}
`;

interface Props {
  imageUrl: string;
  position?: [number, number, number];
  size?: [number, number];
  tint?: string;
  opacity?: number;
}

export default function HoloPlate({
  imageUrl,
  position = [0, 0, 0],
  size = [2.6, 3.4],
  tint = '#22d3ee',
  opacity = 0.95,
}: Props) {
  const texture = useTexture(imageUrl);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uTint: { value: new THREE.Color(tint) },
      uScanlineFreq: { value: 220 },
      uRgbSplit: { value: 0.0022 },
    }),
    [texture, opacity, tint],
  );

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group position={position}>
      {/* The photo plate */}
      <mesh>
        <planeGeometry args={size} />
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={VERT}
          fragmentShader={FRAG}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* A dark backplate so the photo reads against the void instead of
          competing with whatever's behind it. */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[size[0] * 1.04, size[1] * 1.04]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.65} depthWrite={false} />
      </mesh>

      {/* Edge frame, thin lit rectangle to read as a "panel". Emissive
          intensity kept low so bloom doesn't turn the border into a halo. */}
      {[
        { p: [0, size[1] / 2, 0.01], s: [size[0] * 1.04, 0.014, 0.005] },
        { p: [0, -size[1] / 2, 0.01], s: [size[0] * 1.04, 0.014, 0.005] },
        { p: [-size[0] / 2, 0, 0.01], s: [0.014, size[1] * 1.04, 0.005] },
        { p: [size[0] / 2, 0, 0.01], s: [0.014, size[1] * 1.04, 0.005] },
      ].map((side, i) => (
        <mesh key={i} position={side.p as [number, number, number]}>
          <boxGeometry args={side.s as [number, number, number]} />
          <meshStandardMaterial
            color={tint}
            emissive={tint}
            emissiveIntensity={0.6}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
