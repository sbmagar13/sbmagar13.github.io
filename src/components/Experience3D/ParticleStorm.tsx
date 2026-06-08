'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * GPU-driven particle storm. Positions are computed in a vertex shader
 * from per-particle attributes (seed, speed, base position) and a single
 * uniform `uTime`. JavaScript only touches `uTime` once per frame, so the
 * cost stays roughly the same whether you render 100 or 10k particles.
 *
 * Behaviours:
 *   • drift: slow upward drift with sideways sway (atmosphere)
 *   • storm: fast 3D swirl around the origin (energy field)
 *   • rain: vertical fall with horizontal jitter (matrix-style)
 *   • orbit: particles orbit the origin on inclined rings
 */
type Behavior = 'drift' | 'storm' | 'rain' | 'orbit';

interface Props {
  count?: number;
  bounds?: [number, number, number]; // [x, y, z] half-extents
  color?: string;
  size?: number;
  speed?: number;
  behavior?: Behavior;
  opacity?: number;
}

const VERT = /* glsl */ `
attribute vec3 aSeed;
attribute float aSpeed;
attribute float aPhase;
uniform float uTime;
uniform vec3 uBounds;
uniform float uSize;
uniform float uMode; // 0 drift, 1 storm, 2 rain, 3 orbit

varying float vAlpha;

vec3 driftPos(vec3 seed, float speed, float phase) {
  float y = mod(seed.y * uBounds.y + uTime * speed * 0.3, uBounds.y * 2.0) - uBounds.y;
  float x = seed.x * uBounds.x + sin(uTime * 0.5 + phase) * 0.4;
  float z = seed.z * uBounds.z + cos(uTime * 0.4 + phase) * 0.4;
  return vec3(x, y, z);
}

vec3 stormPos(vec3 seed, float speed, float phase) {
  float r = mix(0.5, uBounds.x, abs(seed.x));
  float a = phase + uTime * speed;
  float y = sin(uTime * speed * 0.7 + seed.y * 6.28) * uBounds.y * 0.9;
  return vec3(cos(a) * r, y, sin(a) * r);
}

vec3 rainPos(vec3 seed, float speed, float phase) {
  float y = mod(seed.y * uBounds.y - uTime * speed * 2.5, uBounds.y * 2.0) - uBounds.y;
  float x = seed.x * uBounds.x + sin(uTime + phase) * 0.15;
  float z = seed.z * uBounds.z + cos(uTime + phase) * 0.15;
  return vec3(x, y, z);
}

vec3 orbitPos(vec3 seed, float speed, float phase) {
  float r = mix(2.0, uBounds.x, abs(seed.x));
  float a = phase + uTime * speed * 0.5;
  float inc = seed.y * 1.2;
  return vec3(
    cos(a) * r * cos(inc),
    sin(inc) * r * 0.6,
    sin(a) * r * cos(inc)
  );
}

void main() {
  vec3 pos;
  if (uMode < 0.5) pos = driftPos(aSeed, aSpeed, aPhase);
  else if (uMode < 1.5) pos = stormPos(aSeed, aSpeed, aPhase);
  else if (uMode < 2.5) pos = rainPos(aSeed, aSpeed, aPhase);
  else pos = orbitPos(aSeed, aSpeed, aPhase);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  // Size attenuated by depth so far particles are smaller.
  gl_PointSize = uSize * (300.0 / -mv.z);
  // Fade in/out with vertical position so loops are seamless.
  float vertical = clamp(0.5 + 0.5 * pos.y / uBounds.y, 0.0, 1.0);
  vAlpha = mix(0.2, 1.0, vertical) * (0.6 + 0.4 * sin(uTime * aSpeed + aPhase));
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
void main() {
  // Soft round point.
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p);
  float a = smoothstep(0.5, 0.0, d) * vAlpha * uOpacity;
  gl_FragColor = vec4(uColor, a);
}
`;

export default function ParticleStorm({
  count = 4000,
  bounds = [10, 8, 10],
  color = '#22d3ee',
  size = 18,
  speed = 1,
  behavior = 'drift',
  opacity = 0.6,
}: Props) {
  const mode = useMemo(
    () => ({ drift: 0, storm: 1, rain: 2, orbit: 3 }[behavior]),
    [behavior],
  );

  const geometry = useMemo(() => {
    const seeds = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      seeds[i * 3 + 0] = (Math.random() - 0.5) * 2;
      seeds[i * 3 + 1] = (Math.random() - 0.5) * 2;
      seeds[i * 3 + 2] = (Math.random() - 0.5) * 2;
      speeds[i] = 0.5 + Math.random() * 1.5;
      phases[i] = Math.random() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    // Dummy position attribute (positions come from the vertex shader)
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBounds: { value: new THREE.Vector3(...bounds) },
      uSize: { value: size },
      uMode: { value: mode },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    }),
    [bounds, size, mode, color, opacity],
  );

  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame((s) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime * speed;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
