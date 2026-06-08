'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A flat panel with a custom shader that draws moving "energy lines"
 * across its surface plus a hex-grid undertone. Used as overlay decoration
 * on rack panels and other surfaces.
 *
 * Cheap, pure fragment-shader math, no textures.
 */

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uDensity;
uniform float uOpacity;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hexgrid(vec2 uv, float scale) {
  uv *= scale;
  vec2 r = vec2(1.0, 1.7320508);
  vec2 h = r * 0.5;
  vec2 a = mod(uv, r) - h;
  vec2 b = mod(uv - h, r) - h;
  vec2 g = dot(a, a) < dot(b, b) ? a : b;
  float d = max(abs(g.x), abs(g.y));
  return smoothstep(0.94, 0.96, d);
}

void main() {
  vec2 uv = vUv;

  // Two crossing diagonal sweeps with the bright peak moving.
  float a = sin(uv.x * 18.0 + uv.y * 6.0 - uTime * uSpeed) * 0.5 + 0.5;
  float b = sin(uv.y * 22.0 - uv.x * 5.0 + uTime * uSpeed * 0.7) * 0.5 + 0.5;
  float lines = pow(a * b, 6.0) * 3.5;

  // Hex grid underlay.
  float hex = hexgrid(uv, uDensity);

  // Random data flicker.
  float flicker = hash(floor(vec2(uv.x * 30.0, uv.y * 16.0 + uTime * 4.0))) * 0.1;

  float intensity = lines + hex * 0.35 + flicker;
  vec3 color = uColor * intensity;

  // Subtle gradient so the bottom is darker.
  color *= 0.6 + uv.y * 0.6;

  gl_FragColor = vec4(color, intensity * uOpacity);
}
`;

interface Props {
  position?: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number];
  color?: string;
  speed?: number;
  density?: number;
  opacity?: number;
}

export default function EnergyPanel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = [1, 1],
  color = '#22d3ee',
  speed = 2,
  density = 14,
  opacity = 0.9,
}: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uSpeed: { value: speed },
      uDensity: { value: density },
      uOpacity: { value: opacity },
    }),
    [color, speed, density, opacity],
  );

  useFrame((s) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime;
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
