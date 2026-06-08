'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PALETTE } from './Materials';

/**
 * Stylized 3D logo for a few highlighted skills. Each one is built from
 * primitive geometry (no external models) but composed to read as the
 * actual brand. The non-highlight skills keep their generic category
 * shapes via SkillsHall's <CategoryShape>.
 */

interface Props {
  id: string;
  scale?: number;
}

function rotate(ref: React.RefObject<THREE.Group | null>, speed = 0.5) {
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * speed;
  });
}

function mat(color: string, emissive = color, intensity = 0.55) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={intensity}
      metalness={0.85}
      roughness={0.2}
      toneMapped={false}
    />
  );
}

function Docker({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.5);
  // A stylized container ship: a half-ellipsoid hull with stacked containers.
  return (
    <group ref={ref} scale={scale}>
      {/* Hull */}
      <mesh position={[0, -0.05, 0]} scale={[0.85, 0.25, 0.4]}>
        <sphereGeometry args={[0.42, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {mat('#0ea5e9', '#0284c7', 0.45)}
      </mesh>
      {/* Containers — 3×2 grid */}
      {[-1, 0, 1].flatMap((x) =>
        [0, 1].map((y) => (
          <mesh key={`c-${x}-${y}`} position={[x * 0.22, 0.18 + y * 0.18, 0]}>
            <boxGeometry args={[0.18, 0.16, 0.32]} />
            {mat('#0ea5e9', '#0284c7', 0.6)}
          </mesh>
        )),
      )}
      {/* Top single container (whale's "smile") */}
      <mesh position={[0, 0.54, 0]}>
        <boxGeometry args={[0.18, 0.16, 0.32]} />
        {mat('#22d3ee', '#0ea5e9', 0.8)}
      </mesh>
    </group>
  );
}

function Kubernetes({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.6);
  // Heptagonal helm wheel.
  return (
    <group ref={ref} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.06, 7]} />
        {mat('#326CE5', '#326CE5', 0.6)}
      </mesh>
      {/* Spokes */}
      {Array.from({ length: 7 }).map((_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.21, 0, Math.sin(a) * 0.21]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.32, 0.04, 0.04]} />
            {mat('#326CE5', '#5b8ee8', 0.7)}
          </mesh>
        );
      })}
      {/* Hub */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        {mat('#ffffff', '#cfe2ff', 1.4)}
      </mesh>
    </group>
  );
}

function AWSLogo({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.4);
  // Smile arc + box clusters suggest the AWS look.
  return (
    <group ref={ref} scale={scale}>
      {/* The smile (torus segment) */}
      <mesh position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]}>
        <torusGeometry args={[0.34, 0.05, 8, 24, Math.PI * 0.7]} />
        {mat('#FF9900', '#ff7a00', 0.7)}
      </mesh>
      {/* Arrow head at one end */}
      <mesh position={[0.32, -0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <coneGeometry args={[0.08, 0.16, 4]} />
        {mat('#FF9900', '#ff7a00', 0.8)}
      </mesh>
      {/* Service blocks above */}
      {[-0.18, 0, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0.16, 0]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          {mat('#1f2937', '#FF9900', 0.6 + i * 0.05)}
        </mesh>
      ))}
    </group>
  );
}

function Terraform({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.6);
  // A stack of T shapes.
  return (
    <group ref={ref} scale={scale}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[(i - 1) * 0.06, (i - 1) * 0.22, 0]}>
          <mesh>
            <boxGeometry args={[0.5, 0.1, 0.1]} />
            {mat('#7C3AED', '#a855f7', 0.55 + i * 0.1)}
          </mesh>
          <mesh position={[0, -0.18, 0]}>
            <boxGeometry args={[0.1, 0.3, 0.1]} />
            {mat('#7C3AED', '#a855f7', 0.55 + i * 0.1)}
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Python({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.5);
  // Two interlocking torus arcs — yellow snake, blue snake.
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.22, 0.08, 12, 24, Math.PI]} />
        {mat('#3776AB', '#5b9bd5', 0.6)}
      </mesh>
      <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.22, 0.08, 12, 24, Math.PI]} />
        {mat('#FFD43B', '#fde68a', 0.7)}
      </mesh>
      {/* Eyes */}
      <mesh position={[0.18, 0.18, 0.09]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        {mat('#fff', '#fff', 2)}
      </mesh>
      <mesh position={[-0.18, -0.18, 0.09]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        {mat('#fff', '#fff', 2)}
      </mesh>
    </group>
  );
}

function ArchLinux({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.5);
  // Triangular pyramid like the Arch arrow logo.
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <coneGeometry args={[0.32, 0.62, 3]} />
        {mat('#1793D1', '#67e8f9', 0.7)}
      </mesh>
      {/* Inner highlight strut */}
      <mesh position={[0, 0.04, 0]} scale={[0.6, 0.6, 0.6]}>
        <coneGeometry args={[0.32, 0.62, 3]} />
        {mat('#0e7490', '#22d3ee', 1.1)}
      </mesh>
    </group>
  );
}

function OpenAI({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Interlocking ring of small spheres echoing the OpenAI knot.
  return (
    <group ref={ref} scale={scale}>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.32, Math.sin(a) * 0.32, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            {mat('#10A37F', '#34d399', 1.2)}
          </mesh>
        );
      })}
      <mesh>
        <torusGeometry args={[0.32, 0.012, 6, 48]} />
        {mat('#10A37F', '#34d399', 1.5)}
      </mesh>
    </group>
  );
}

function Postgres({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Stylized elephant head — sphere body + two ear-like flaps + trunk.
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        {mat('#336791', '#5b89b0', 0.55)}
      </mesh>
      {/* Ears */}
      <mesh position={[-0.28, 0.05, 0]} rotation={[0, 0, 0.5]} scale={[0.55, 0.9, 0.2]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        {mat('#336791', '#5b89b0', 0.5)}
      </mesh>
      <mesh position={[0.28, 0.05, 0]} rotation={[0, 0, -0.5]} scale={[0.55, 0.9, 0.2]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        {mat('#336791', '#5b89b0', 0.5)}
      </mesh>
      {/* Trunk */}
      <mesh position={[0, -0.22, 0.1]} rotation={[Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.24, 12]} />
        {mat('#336791', '#5b89b0', 0.5)}
      </mesh>
    </group>
  );
}

function Prometheus({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Flame-like spire.
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <coneGeometry args={[0.18, 0.6, 16]} />
        {mat('#E6522C', '#fbbf24', 1.2)}
      </mesh>
      <mesh position={[0, -0.05, 0]} scale={[0.7, 0.8, 0.7]}>
        <coneGeometry args={[0.18, 0.6, 16]} />
        {mat('#E6522C', '#ef4444', 1.6)}
      </mesh>
      <mesh position={[0, -0.34, 0]}>
        <torusGeometry args={[0.14, 0.025, 6, 24]} />
        {mat('#E6522C', '#fbbf24', 1.5)}
      </mesh>
    </group>
  );
}

// Map of skill id → logo component. Anything not in this map falls back to
// the generic category shape in SkillsHall.tsx.
const LOGOS: Record<string, (props: { scale?: number }) => React.JSX.Element> = {
  docker: Docker,
  kubernetes: Kubernetes,
  aws: AWSLogo,
  terraform: Terraform,
  python: Python,
  arch: ArchLinux,
  openai: OpenAI,
  postgresql: Postgres,
  prometheus: Prometheus,
};

export default function SkillLogo({ id, scale = 1 }: Props) {
  const Logo = LOGOS[id];
  if (!Logo) return null;
  return <Logo scale={scale} />;
}

export function hasCustomLogo(id: string): boolean {
  return id in LOGOS;
}

// Reusable highlight color picker — different brand color per logo.
export function logoTint(id: string): string {
  switch (id) {
    case 'docker':
      return '#0ea5e9';
    case 'kubernetes':
      return '#326CE5';
    case 'aws':
      return '#FF9900';
    case 'terraform':
      return '#7C3AED';
    case 'python':
      return '#3776AB';
    case 'arch':
      return '#1793D1';
    case 'openai':
      return '#10A37F';
    case 'postgresql':
      return '#336791';
    case 'prometheus':
      return '#E6522C';
    default:
      return PALETTE.neonCyan;
  }
}
