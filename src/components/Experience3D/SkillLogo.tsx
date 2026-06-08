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
      {/* Containers, 3×2 grid */}
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
  // Two interlocking torus arcs, yellow snake, blue snake.
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
  // Stylized elephant head, sphere body + two ear-like flaps + trunk.
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

function Aurora({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.5);
  // PostgreSQL-blue disk stack with a glowing global ring around it.
  return (
    <group ref={ref} scale={scale}>
      {[0, 0.12, 0.24].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.3 - i * 0.02, 0.3 - i * 0.02, 0.08, 32]} />
          {mat('#336791', '#5b89b0', 0.55 + i * 0.1)}
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2.4, 0, 0]} position={[0, 0.12, 0]}>
        <torusGeometry args={[0.5, 0.015, 6, 48]} />
        {mat('#22d3ee', '#67e8f9', 1.6)}
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, Math.PI / 3]} position={[0, 0.12, 0]}>
        <torusGeometry args={[0.42, 0.012, 6, 48]} />
        {mat('#a855f7', '#c084fc', 1.4)}
      </mesh>
    </group>
  );
}

function TerragruntLogo({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Stylized "TG" pulled into a layered octagonal foundation.
  return (
    <group ref={ref} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.42, 0.12, 8]} />
        {mat('#5C4EE5', '#7B6CFF', 0.55)}
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.45, 0.1, 0.1]} />
        {mat('#5C4EE5', '#7B6CFF', 0.7)}
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.1, 0.22, 0.1]} />
        {mat('#5C4EE5', '#7B6CFF', 0.7)}
      </mesh>
    </group>
  );
}

function ECSFargate({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.5);
  // AWS orange container with floating compute cubes above (Fargate, no servers).
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[0.55, 0.18, 0.4]} />
        {mat('#FF9900', '#ff7a00', 0.55)}
      </mesh>
      {[-0.18, 0, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0.16 + (i === 1 ? 0.05 : 0), 0]}>
          <boxGeometry args={[0.13, 0.13, 0.13]} />
          {mat('#FF9900', '#ffb84d', 0.85)}
        </mesh>
      ))}
    </group>
  );
}

function GrafanaLogo({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.6);
  // Orange diamond + offset ring (a nod to the Grafana mark).
  return (
    <group ref={ref} scale={scale}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.35, 0.35, 0.06]} />
        {mat('#F46800', '#fb923c', 0.9)}
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <torusGeometry args={[0.18, 0.02, 6, 48]} />
        {mat('#FFFFFF', '#ffedd5', 1.5)}
      </mesh>
      <mesh position={[0.14, 0.04, 0.06]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        {mat('#FFFFFF', '#ffedd5', 2)}
      </mesh>
    </group>
  );
}

function OpenTelemetryLogo({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.6);
  // Central hex + four corner nodes connected by rods (collector idea).
  return (
    <group ref={ref} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 6]} />
        {mat('#F5A800', '#fbbf24', 0.9)}
      </mesh>
      {[
        [0.32, 0, 0],
        [-0.32, 0, 0],
        [0, 0.32, 0],
        [0, -0.32, 0],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          {mat('#FFFFFF', '#fde68a', 1.8)}
        </mesh>
      ))}
      {[
        { p: [0.16, 0, 0] as const, r: [0, 0, Math.PI / 2] as const, l: 0.32 },
        { p: [-0.16, 0, 0] as const, r: [0, 0, Math.PI / 2] as const, l: 0.32 },
        { p: [0, 0.16, 0] as const, r: [0, 0, 0] as const, l: 0.32 },
        { p: [0, -0.16, 0] as const, r: [0, 0, 0] as const, l: 0.32 },
      ].map((rod, i) => (
        <mesh key={i} position={[...rod.p]} rotation={[...rod.r]}>
          <cylinderGeometry args={[0.012, 0.012, rod.l, 6]} />
          {mat('#F5A800', '#fbbf24', 1)}
        </mesh>
      ))}
    </group>
  );
}

function MCPLogo({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.6);
  // Three nodes linked by glowing tubes, a nod to model + tools + context.
  return (
    <group ref={ref} scale={scale}>
      {[
        [0, 0.32, 0],
        [-0.28, -0.16, 0],
        [0.28, -0.16, 0],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          {mat('#D97706', '#fbbf24', 1.2)}
        </mesh>
      ))}
      {[
        { from: [0, 0.32, 0], to: [-0.28, -0.16, 0] },
        { from: [0, 0.32, 0], to: [0.28, -0.16, 0] },
        { from: [-0.28, -0.16, 0], to: [0.28, -0.16, 0] },
      ].map((edge, i) => {
        const a = new THREE.Vector3(...edge.from);
        const b = new THREE.Vector3(...edge.to);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const len = a.distanceTo(b);
        const dir = b.clone().sub(a).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
        const euler = new THREE.Euler().setFromQuaternion(quat);
        return (
          <mesh
            key={i}
            position={[mid.x, mid.y, mid.z]}
            rotation={[euler.x, euler.y, euler.z]}
          >
            <cylinderGeometry args={[0.018, 0.018, len, 8]} />
            {mat('#fbbf24', '#fcd34d', 1.4)}
          </mesh>
        );
      })}
    </group>
  );
}

// ===== Additional stack-specific logos =====

function Lambda({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Stylized lambda symbol: two crossing diagonal bars on an AWS-orange base.
  return (
    <group ref={ref} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.08, 6]} />
        {mat('#FF9900', '#ff7a00', 0.7)}
      </mesh>
      {/* Long stroke of the lambda */}
      <mesh position={[0, 0.05, 0.05]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.5, 0.07, 0.05]} />
        {mat('#FFFFFF', '#ffedd5', 2)}
      </mesh>
      {/* Foot of the lambda */}
      <mesh position={[0.08, -0.12, 0.05]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.28, 0.07, 0.05]} />
        {mat('#FFFFFF', '#ffedd5', 2)}
      </mesh>
    </group>
  );
}

function Jenkins({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Butler head: pale sphere with a flat-disc bowler hat and bow tie.
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.28, 24, 24]} />
        {mat('#F0F0F0', '#fff', 0.45)}
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 24]} />
        {mat('#0D1117', '#0D1117', 0.2)}
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 24]} />
        {mat('#0D1117', '#0D1117', 0.2)}
      </mesh>
      {/* Eyes */}
      <mesh position={[0.1, 0.04, 0.24]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        {mat('#0D1117', '#0D1117', 0.5)}
      </mesh>
      <mesh position={[-0.1, 0.04, 0.24]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        {mat('#0D1117', '#0D1117', 0.5)}
      </mesh>
      {/* Bow tie */}
      <mesh position={[0, -0.22, 0.2]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.16, 0.08, 0.05]} />
        {mat('#E54E2D', '#fb923c', 1.1)}
      </mesh>
    </group>
  );
}

function GitLabCI({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Two layered orange tetrahedrons suggesting the GitLab tanuki shape.
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, 0.04, 0]}>
        <coneGeometry args={[0.3, 0.5, 4]} />
        {mat('#FC6D26', '#fb923c', 0.9)}
      </mesh>
      <mesh position={[0, 0.34, 0]} scale={0.6} rotation={[Math.PI, Math.PI / 4, 0]}>
        <coneGeometry args={[0.3, 0.5, 4]} />
        {mat('#FCA326', '#fbbf24', 1.1)}
      </mesh>
    </group>
  );
}

function GithubActions({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Octagonal play-button-like shape (the GH Actions mark).
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.32, 0.32, 0.08, 8]} />
        {mat('#2088FF', '#5eaaff', 0.7)}
      </mesh>
      <mesh position={[0.03, 0, 0.05]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.05, 3]} />
        {mat('#FFFFFF', '#dbeafe', 1.6)}
      </mesh>
    </group>
  );
}

function Ansible({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.5);
  // Red sphere with three orbital rings (the Ansible mark).
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        {mat('#EE0000', '#ef4444', 0.75)}
      </mesh>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.32, 0.012, 6, 48]} />
        {mat('#FFFFFF', '#fecaca', 1.4)}
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 3, 0]}>
        <torusGeometry args={[0.32, 0.012, 6, 48]} />
        {mat('#FFFFFF', '#fecaca', 1.4)}
      </mesh>
    </group>
  );
}

function Redis({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Stacked angular red wedges (the Redis cube/disk vibe).
  return (
    <group ref={ref} scale={scale}>
      {[0.18, 0.06, -0.06].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.3 - i * 0.03, 0.3 - i * 0.03, 0.1, 4]} />
          {mat('#DC382D', '#ef4444', 0.7 + i * 0.1)}
        </mesh>
      ))}
    </group>
  );
}

function DynamoDB({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Blue hexagonal disk with a glowing inner ring.
  return (
    <group ref={ref} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.1, 6]} />
        {mat('#3334B9', '#6366f1', 0.8)}
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.018, 6, 32]} />
        {mat('#FFFFFF', '#c7d2fe', 1.6)}
      </mesh>
    </group>
  );
}

function S3Bucket({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Cylindrical bucket with a brim, signature S3 red.
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.26, 0.22, 0.42, 24]} />
        {mat('#E25444', '#f87171', 0.7)}
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 24]} />
        {mat('#7A1F1A', '#b91c1c', 0.5)}
      </mesh>
      {/* "S3" stylized as a horizontal stripe */}
      <mesh position={[0, 0, 0.28]}>
        <boxGeometry args={[0.18, 0.08, 0.01]} />
        {mat('#FFFFFF', '#ffffff', 2)}
      </mesh>
    </group>
  );
}

function CloudFront({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Stylized cloud with a lightning bolt through it.
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[-0.1, 0, 0]} scale={[1.2, 0.8, 0.8]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        {mat('#8C4FFF', '#a78bfa', 0.7)}
      </mesh>
      <mesh position={[0.12, 0.06, 0]} scale={[1, 0.9, 0.9]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        {mat('#8C4FFF', '#a78bfa', 0.7)}
      </mesh>
      {/* Lightning bolt */}
      <mesh position={[0, -0.14, 0.1]} rotation={[0, 0, Math.PI / 8]}>
        <boxGeometry args={[0.06, 0.3, 0.04]} />
        {mat('#FFFFFF', '#fbbf24', 2)}
      </mesh>
    </group>
  );
}

function Cloudflare({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Triangular cloud, the Cloudflare orange shape.
  return (
    <group ref={ref} scale={scale}>
      <mesh rotation={[0, 0, 0]}>
        <coneGeometry args={[0.35, 0.5, 3]} />
        {mat('#F38020', '#fb923c', 0.85)}
      </mesh>
      <mesh position={[0, 0.18, 0]} scale={[0.6, 0.6, 0.6]}>
        <coneGeometry args={[0.35, 0.5, 3]} />
        {mat('#FAAD3F', '#fbbf24', 1.1)}
      </mesh>
    </group>
  );
}

function Ubuntu({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Orange ring with three "friends" dots arranged like the Ubuntu mark.
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <torusGeometry args={[0.3, 0.04, 8, 32]} />
        {mat('#E95420', '#fb923c', 0.85)}
      </mesh>
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          {mat('#E95420', '#fb923c', 1.1)}
        </mesh>
      ))}
    </group>
  );
}

function Bash({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.45);
  // Terminal window with a $ prompt.
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <boxGeometry args={[0.55, 0.4, 0.04]} />
        {mat('#1F2937', '#1F2937', 0.4)}
      </mesh>
      <mesh position={[0, 0.16, 0.03]}>
        <boxGeometry args={[0.55, 0.06, 0.005]} />
        {mat('#4ADE80', '#86efac', 1)}
      </mesh>
      {/* Three colored dots like a terminal window */}
      {[-0.22, -0.18, -0.14].map((x, i) => (
        <mesh key={i} position={[x, 0.16, 0.04]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          {mat(['#ef4444', '#fbbf24', '#22c55e'][i], ['#ef4444', '#fbbf24', '#22c55e'][i], 2)}
        </mesh>
      ))}
      {/* The $ prompt suggested by a small box */}
      <mesh position={[-0.18, -0.02, 0.03]}>
        <boxGeometry args={[0.04, 0.12, 0.005]} />
        {mat('#4ADE80', '#86efac', 1.5)}
      </mesh>
      <mesh position={[-0.04, -0.02, 0.03]}>
        <boxGeometry args={[0.18, 0.02, 0.005]} />
        {mat('#4ADE80', '#86efac', 1.5)}
      </mesh>
    </group>
  );
}

function JavaScript({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.5);
  // Bright yellow rounded cube, JS classic.
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        {mat('#F7DF1E', '#fde047', 0.6)}
      </mesh>
      <mesh position={[0.05, -0.1, 0.21]}>
        <boxGeometry args={[0.04, 0.18, 0.005]} />
        {mat('#1F2937', '#1F2937', 0.3)}
      </mesh>
      <mesh position={[0.13, -0.07, 0.21]}>
        <boxGeometry args={[0.04, 0.12, 0.005]} />
        {mat('#1F2937', '#1F2937', 0.3)}
      </mesh>
    </group>
  );
}

function Django({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Green pillar with horizontal stripes (Django mark vibe).
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <boxGeometry args={[0.28, 0.5, 0.18]} />
        {mat('#092E20', '#10b981', 0.6)}
      </mesh>
      {[0.16, 0.02, -0.12].map((y, i) => (
        <mesh key={i} position={[0, y, 0.1]}>
          <boxGeometry args={[0.3, 0.04, 0.01]} />
          {mat('#44B78B', '#6ee7b7', 1.4 - i * 0.2)}
        </mesh>
      ))}
    </group>
  );
}

function Flask({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Conical flask shape pointing up.
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, 0.05, 0]}>
        <coneGeometry args={[0.22, 0.42, 24]} />
        {mat('#3B82F6', '#60a5fa', 0.55)}
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
        {mat('#1E40AF', '#3b82f6', 0.6)}
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
        {mat('#0F172A', '#1e293b', 0.4)}
      </mesh>
    </group>
  );
}

function PyTorchLogo({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Stylized PyTorch flame: orange torus with a dot inside (heat-source shape).
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <torusGeometry args={[0.22, 0.06, 12, 32, Math.PI * 1.6]} />
        {mat('#EE4C2C', '#fb923c', 0.9)}
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        {mat('#EE4C2C', '#fb923c', 1.6)}
      </mesh>
    </group>
  );
}

function Loki({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Blue rounded teardrop shape (Loki's drop mark, a nod to Grafana family).
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        {mat('#FFCD3C', '#fde68a', 0.9)}
      </mesh>
      <mesh position={[0, 0.16, 0]} scale={[0.6, 1, 0.6]}>
        <coneGeometry args={[0.18, 0.32, 16]} />
        {mat('#FFCD3C', '#fde68a', 0.9)}
      </mesh>
    </group>
  );
}

function ELK({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Three stacked colored bars: Elasticsearch (teal), Logstash (gold), Kibana (pink).
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, -0.16, 0]}>
        <boxGeometry args={[0.5, 0.1, 0.18]} />
        {mat('#00BFB3', '#5eead4', 0.8)}
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.18]} />
        {mat('#FEC514', '#fde047', 0.9)}
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.18]} />
        {mat('#F04E98', '#f472b6', 0.85)}
      </mesh>
    </group>
  );
}

function CloudWatch({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // An eye-like ring with a pupil.
  return (
    <group ref={ref} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.26, 0.05, 12, 36]} />
        {mat('#759C3E', '#a3e635', 0.85)}
      </mesh>
      <mesh>
        <sphereGeometry args={[0.13, 24, 24]} />
        {mat('#1F2937', '#1F2937', 0.4)}
      </mesh>
      <mesh position={[0, 0, 0.13]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        {mat('#22D3EE', '#67e8f9', 2.2)}
      </mesh>
    </group>
  );
}

function AwsIAM({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Shield with a key-like glyph.
  return (
    <group ref={ref} scale={scale}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.22, 0.06, 0.5, 5]} />
        {mat('#DD344C', '#f43f5e', 0.65)}
      </mesh>
      <mesh position={[0, 0.04, 0.16]}>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
        {mat('#FFFFFF', '#ffffff', 1.6)}
      </mesh>
      <mesh position={[0, 0.16, 0.16]}>
        <torusGeometry args={[0.05, 0.012, 8, 24]} />
        {mat('#FFFFFF', '#ffffff', 1.6)}
      </mesh>
    </group>
  );
}

function LangChain({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.5);
  // Two interlocked torus links.
  return (
    <group ref={ref} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.05, 10, 32]} />
        {mat('#06B6D4', '#67e8f9', 0.9)}
      </mesh>
      <mesh position={[0.18, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.18, 0.05, 10, 32]} />
        {mat('#10B981', '#34d399', 0.9)}
      </mesh>
    </group>
  );
}

function OneUptime({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  rotate(ref, 0.55);
  // Pulse-monitor blip on a status panel.
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <boxGeometry args={[0.5, 0.28, 0.04]} />
        {mat('#0F172A', '#0F172A', 0.4)}
      </mesh>
      <mesh position={[-0.15, 0, 0.025]}>
        <boxGeometry args={[0.04, 0.06, 0.01]} />
        {mat('#22D3EE', '#67e8f9', 2)}
      </mesh>
      <mesh position={[-0.05, 0, 0.025]}>
        <boxGeometry args={[0.04, 0.18, 0.01]} />
        {mat('#22D3EE', '#67e8f9', 2)}
      </mesh>
      <mesh position={[0.05, 0, 0.025]}>
        <boxGeometry args={[0.04, 0.1, 0.01]} />
        {mat('#22D3EE', '#67e8f9', 2)}
      </mesh>
      <mesh position={[0.15, 0, 0.025]}>
        <boxGeometry args={[0.04, 0.04, 0.01]} />
        {mat('#22D3EE', '#67e8f9', 2)}
      </mesh>
    </group>
  );
}

// Map of skill id → logo component. Anything not in this map falls back to
// the generic category shape in SkillsHall.tsx.
const LOGOS: Record<string, (props: { scale?: number }) => React.JSX.Element> = {
  // Core highlights
  docker: Docker,
  kubernetes: Kubernetes,
  aws: AWSLogo,
  terraform: Terraform,
  terragrunt: TerragruntLogo,
  'ecs-fargate': ECSFargate,
  aurora: Aurora,
  python: Python,
  arch: ArchLinux,
  openai: OpenAI,
  postgresql: Postgres,
  prometheus: Prometheus,
  grafana: GrafanaLogo,
  opentelemetry: OpenTelemetryLogo,
  mcp: MCPLogo,
  // Extended DevOps stack
  lambda: Lambda,
  jenkins: Jenkins,
  'gitlab-ci': GitLabCI,
  'github-actions': GithubActions,
  ansible: Ansible,
  redis: Redis,
  dynamodb: DynamoDB,
  s3: S3Bucket,
  cloudfront: CloudFront,
  cloudflare: Cloudflare,
  ubuntu: Ubuntu,
  bash: Bash,
  javascript: JavaScript,
  django: Django,
  flask: Flask,
  pytorch: PyTorchLogo,
  loki: Loki,
  elk: ELK,
  elasticsearch: ELK,
  cloudwatch: CloudWatch,
  'aws-iam': AwsIAM,
  langchain: LangChain,
  oneuptime: OneUptime,
};

export default function SkillLogo({ id, scale = 1 }: Props) {
  const Logo = LOGOS[id];
  if (!Logo) return null;
  return <Logo scale={scale} />;
}

export function hasCustomLogo(id: string): boolean {
  return id in LOGOS;
}

// Reusable highlight color picker, different brand color per logo.
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
    case 'terragrunt':
      return '#5C4EE5';
    case 'ecs-fargate':
      return '#FF9900';
    case 'aurora':
      return '#336791';
    case 'grafana':
      return '#F46800';
    case 'opentelemetry':
      return '#F5A800';
    case 'mcp':
      return '#D97706';
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
    case 'lambda':
      return '#FF9900';
    case 'jenkins':
      return '#D33833';
    case 'gitlab-ci':
      return '#FC6D26';
    case 'github-actions':
      return '#2088FF';
    case 'ansible':
      return '#EE0000';
    case 'redis':
      return '#DC382D';
    case 'dynamodb':
      return '#3334B9';
    case 's3':
      return '#E25444';
    case 'cloudfront':
      return '#8C4FFF';
    case 'cloudflare':
      return '#F38020';
    case 'ubuntu':
      return '#E95420';
    case 'bash':
      return '#4ADE80';
    case 'javascript':
      return '#F7DF1E';
    case 'django':
      return '#44B78B';
    case 'flask':
      return '#3B82F6';
    case 'pytorch':
      return '#EE4C2C';
    case 'loki':
    case 'elk':
    case 'elasticsearch':
      return '#FFCD3C';
    case 'cloudwatch':
      return '#759C3E';
    case 'aws-iam':
      return '#DD344C';
    case 'langchain':
      return '#06B6D4';
    case 'oneuptime':
      return '#22D3EE';
    default:
      return PALETTE.neonCyan;
  }
}
