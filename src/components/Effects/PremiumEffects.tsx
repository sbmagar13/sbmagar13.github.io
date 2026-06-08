'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Holographic Shader Material
export function HolographicMaterial({ color = '#6366f1' }: { color?: string }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      color: { value: new THREE.Color(color) },
      opacity: { value: 0.8 },
    }),
    [color]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // Fresnel effect
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);

      // Scan lines
      float scanline = sin(vUv.y * 50.0 - time * 5.0) * 0.5 + 0.5;

      // Holographic interference
      float interference = sin(vPosition.y * 10.0 + time * 2.0) * 0.3 + 0.7;

      // Combine effects
      vec3 finalColor = color * (fresnel + 0.3) * scanline * interference;

      gl_FragColor = vec4(finalColor, opacity * (fresnel * 0.5 + 0.5));
    }
  `;

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      transparent
      side={THREE.DoubleSide}
    />
  );
}

// Energy Field Shader
export function EnergyFieldMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      color1: { value: new THREE.Color('#6366f1') },
      color2: { value: new THREE.Color('#8b5cf6') },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
      // Flowing energy pattern
      vec2 st = vUv * 5.0;
      float n = noise(st + time * 0.5);

      // Pulsing effect
      float pulse = sin(length(vUv - 0.5) * 10.0 - time * 3.0) * 0.5 + 0.5;

      // Color mixing
      vec3 color = mix(color1, color2, n * pulse);

      // Add glow
      float glow = 1.0 - length(vUv - 0.5) * 2.0;

      gl_FragColor = vec4(color, (n * pulse + glow) * 0.6);
    }
  `;

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      transparent
      blending={THREE.AdditiveBlending}
    />
  );
}

// Glitch Effect Component
export function GlitchEffect({ intensity = 1.0 }: { intensity?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && Math.random() > 0.98) {
      // Random glitch
      meshRef.current.position.x = (Math.random() - 0.5) * 0.1 * intensity;
      meshRef.current.position.y = (Math.random() - 0.5) * 0.1 * intensity;

      // Reset after brief moment
      setTimeout(() => {
        if (meshRef.current) {
          meshRef.current.position.x = 0;
          meshRef.current.position.y = 0;
        }
      }, 50);
    }
  });

  return <group ref={meshRef}>{/* Children will inherit glitch */}</group>;
}

// Chromatic Aberration Shader
export function ChromaticAberrationMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      aberration: { value: 0.01 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.aberration.value = 0.01 + Math.sin(state.clock.elapsedTime) * 0.005;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      transparent
    />
  );
}

// Particle Trail Effect
export function ParticleTrail({ count = 100, color = '#6366f1' }: { count?: number; color?: string }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    return { positions, velocities };
  }, [count]);

  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < count; i++) {
        positions[i * 3] += particles.velocities[i * 3];
        positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
        positions[i * 3 + 2] += particles.velocities[i * 3 + 2];

        // Wrap around
        if (Math.abs(positions[i * 3]) > 5) particles.velocities[i * 3] *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 5) particles.velocities[i * 3 + 1] *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 5) particles.velocities[i * 3 + 2] *= -1;
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Ripple Effect
export function RippleEffect({ position = [0, 0, 0] as [number, number, number] }) {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 - i * 0.5) * 0.5;
        ring.scale.set(scale, scale, scale);
        (ring as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          color: '#6366f1',
          transparent: true,
          opacity: 1 - (i / ringsRef.current!.children.length),
          side: THREE.DoubleSide,
        });
      });
    }
  });

  return (
    <group ref={ringsRef} position={position}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1 + i * 0.5, 0.05, 16, 100]} />
          <meshBasicMaterial
            color="#6366f1"
            transparent
            opacity={1 - i * 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// Bloom Effect (Post-processing simulation)
export function BloomLight({ position = [0, 0, 0] as [number, number, number], color = '#6366f1' }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  return (
    <>
      <pointLight ref={lightRef} position={position} color={color} intensity={1} distance={10} />
      <mesh position={position}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </>
  );
}
