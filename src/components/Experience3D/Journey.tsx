'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import CinematicEffects from './Effects';
import LensFlare from './LensFlare';
import ParticleStorm from './ParticleStorm';
import { PALETTE } from './Materials';

interface Milestone {
  year: string;
  title: string;
  description: string;
  // Which monument shape to draw (procedural — no models needed).
  shape: 'tower' | 'cluster' | 'orb' | 'cube' | 'helix' | 'book';
  color: string;
}

const MILESTONES: Milestone[] = [
  {
    year: '2020',
    title: 'First server, first incident',
    description:
      'Joined DevOps as a junior. Got handed a Linux server, broke it, fixed it, learned how production really feels.',
    shape: 'tower',
    color: PALETTE.neonCyan,
  },
  {
    year: '2021',
    title: 'Kubernetes day one',
    description:
      'Stood up the first k8s cluster. Helm charts, ingress controllers, lots of kubectl describe pod.',
    shape: 'cluster',
    color: PALETTE.neonBlue,
  },
  {
    year: '2022',
    title: 'IaC everywhere',
    description:
      'Migrated infrastructure to Terraform. Modules, remote state, drift detection. Stopped clicking around in consoles.',
    shape: 'cube',
    color: PALETTE.neonMagenta,
  },
  {
    year: '2023',
    title: 'Observability that pages',
    description:
      'Built the alerting stack that actually wakes the right person. Prometheus, Grafana, runbook-linked alerts.',
    shape: 'orb',
    color: PALETTE.ledAmber,
  },
  {
    year: '2024',
    title: 'Platform engineering',
    description:
      'Started turning the ops toolbox into a platform other engineers use without paging me. Internal templates, self-serve.',
    shape: 'helix',
    color: PALETTE.neonPurple,
  },
  {
    year: '2025',
    title: 'AI in the loop',
    description:
      'Wiring LLMs and MCP into DevOps tooling. Code review, triage, doc generation, infra analysis.',
    shape: 'book',
    color: PALETTE.ledWhite,
  },
];

function Monument({ shape, color }: { shape: Milestone['shape']; color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.3;
  });
  const mat = (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={0.5}
      metalness={0.85}
      roughness={0.22}
      toneMapped={false}
    />
  );

  switch (shape) {
    case 'tower':
      return (
        <group ref={ref}>
          {[0, 0.18, 0.36, 0.54].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <boxGeometry args={[0.5 - i * 0.05, 0.15, 0.5 - i * 0.05]} />
              {mat}
            </mesh>
          ))}
        </group>
      );
    case 'cluster':
      return (
        <group ref={ref}>
          {[
            [0, 0, 0],
            [0.3, 0.25, 0.15],
            [-0.3, 0.25, -0.15],
            [0, 0.5, 0.3],
            [0.25, 0.6, -0.25],
          ].map((p, i) => (
            <mesh key={i} position={p as [number, number, number]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              {mat}
            </mesh>
          ))}
        </group>
      );
    case 'orb':
      return (
        <group ref={ref}>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.42, 32, 32]} />
            {mat}
          </mesh>
          <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.02, 6, 64]} />
            <meshStandardMaterial
              color={PALETTE.ledWhite}
              emissive={PALETTE.ledWhite}
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
        </group>
      );
    case 'cube':
      return (
        <group ref={ref}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.55, 0.55, 0.55]} />
            {mat}
          </mesh>
        </group>
      );
    case 'helix':
      return (
        <group ref={ref}>
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 4;
            const y = (i / 24) * 0.8;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.25, y, Math.sin(a) * 0.25]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                {mat}
              </mesh>
            );
          })}
        </group>
      );
    case 'book':
      return (
        <group ref={ref}>
          {[0, 0.16, 0.32].map((y, i) => (
            <mesh key={i} position={[0, y, 0]} rotation={[0, 0, (i - 1) * 0.08]}>
              <boxGeometry args={[0.5, 0.1, 0.36]} />
              {mat}
            </mesh>
          ))}
        </group>
      );
  }
}

// The career path — a CatmullRom curve through all milestone positions.
function buildPath() {
  const r = 5;
  // Place milestones around a gentle spiral so the camera has movement.
  return MILESTONES.map((_, i) => {
    const t = i / (MILESTONES.length - 1);
    const angle = t * Math.PI * 1.4;
    return new THREE.Vector3(Math.cos(angle) * r, t * 1.5 - 0.5, Math.sin(angle) * r);
  });
}

function PathFlow({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.03, 8, false), [curve]);
  const packetRefs = useRef<THREE.Mesh[]>([]);
  const packetCount = 18;

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.06;
    for (let i = 0; i < packetCount; i++) {
      const p = packetRefs.current[i];
      if (!p) continue;
      const offset = i / packetCount;
      const tt = (t + offset) % 1;
      p.position.copy(curve.getPoint(tt));
    }
  });

  return (
    <group>
      <mesh geometry={tubeGeo}>
        <meshStandardMaterial
          color={PALETTE.neonCyan}
          emissive={PALETTE.neonCyan}
          emissiveIntensity={0.5}
          transparent
          opacity={0.45}
          toneMapped={false}
        />
      </mesh>
      {Array.from({ length: packetCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) packetRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial
            color={PALETTE.neonCyan}
            emissive={PALETTE.neonCyan}
            emissiveIntensity={4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({
  onSelect,
  selectedIdx,
  hoveredIdx,
  setHovered,
}: {
  onSelect: (i: number | null) => void;
  selectedIdx: number | null;
  hoveredIdx: number | null;
  setHovered: (i: number | null) => void;
}) {
  const points = useMemo(buildPath, []);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5), [points]);

  return (
    <>
      <ambientLight intensity={0.18} color="#1e293b" />
      <pointLight position={[0, 8, 0]} intensity={1.2} color={PALETTE.ledWhite} distance={20} />
      <pointLight position={[6, 2, 0]} intensity={1} color={PALETTE.neonCyan} distance={20} />
      <pointLight position={[-6, 2, 0]} intensity={1} color={PALETTE.neonMagenta} distance={20} />

      <PathFlow curve={curve} />

      {MILESTONES.map((m, i) => {
        const pos = points[i];
        const isActive = selectedIdx === i;
        return (
          <group
            key={m.year}
            position={[pos.x, pos.y, pos.z]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(selectedIdx === i ? null : i);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(i);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHovered(null);
              document.body.style.cursor = '';
            }}
          >
            <Float speed={1} floatIntensity={0.3} rotationIntensity={0.1}>
              <group scale={isActive ? 1.3 : hoveredIdx === i ? 1.15 : 1}>
                <Monument shape={m.shape} color={m.color} />
              </group>
            </Float>
            {/* Pedestal */}
            <mesh position={[0, -0.45, 0]}>
              <cylinderGeometry args={[0.4, 0.45, 0.12, 24]} />
              <meshStandardMaterial color={PALETTE.steelDark} metalness={0.6} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.39, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.28, 0.34, 28]} />
              <meshBasicMaterial color={m.color} transparent opacity={isActive ? 0.9 : 0.55} />
            </mesh>
            {/* Year label */}
            <Text
              position={[0, 1.0, 0]}
              fontSize={0.22}
              color={m.color}
              outlineColor="#000"
              outlineWidth={0.005}
              anchorX="center"
            >
              {m.year}
            </Text>
            <Text
              position={[0, 0.8, 0]}
              fontSize={0.07}
              color="#94a3b8"
              anchorX="center"
              letterSpacing={0.2}
              maxWidth={1.6}
            >
              {m.title.toUpperCase()}
            </Text>
          </group>
        );
      })}

      <ParticleStorm
        count={1500}
        bounds={[12, 6, 12]}
        color={PALETTE.neonCyan}
        size={6}
        speed={0.3}
        behavior="drift"
        opacity={0.3}
      />

      {/* Lens flare at each milestone — small unless selected */}
      {MILESTONES.map((m, i) => (
        <LensFlare
          key={`flare-${i}`}
          position={[points[i].x, points[i].y + 0.4, points[i].z]}
          color={m.color}
          size={selectedIdx === i ? 2 : 1.1}
          intensity={selectedIdx === i ? 0.8 : 0.25}
        />
      ))}

      <OrbitControls
        target={[0, 0, 0]}
        enablePan={false}
        enableZoom
        minDistance={6}
        maxDistance={16}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.9}
        autoRotate={selectedIdx === null}
        autoRotateSpeed={0.4}
        dampingFactor={0.06}
      />
    </>
  );
}

export default function Journey() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const selected = selectedIdx !== null ? MILESTONES[selectedIdx] : null;

  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        camera={{ position: [0, 4, 11], fov: 50 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.6]}
      >
        <color attach="background" args={[PALETTE.voidA]} />
        <fog attach="fog" args={['#020617', 8, 24]} />
        <Suspense fallback={null}>
          <Scene
            onSelect={setSelectedIdx}
            selectedIdx={selectedIdx}
            hoveredIdx={hoveredIdx}
            setHovered={setHoveredIdx}
          />
          <CinematicEffects
            bloomIntensity={0.6}
            bloomThreshold={0.5}
            bokehScale={1.3}
            chromaticAberration={0.0005}
            dof
          />
        </Suspense>
      </Canvas>

      {/* Heading */}
      <div className="pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 text-center">
        <div className="font-mono text-xs tracking-[0.4em] text-cyan-400/70 uppercase">
          Career arc
        </div>
        <div className="mt-1 font-mono text-2xl text-white/90">JOURNEY</div>
        <div className="mt-1 font-mono text-[10px] text-slate-400/70">
          5 years of DevOps · click any monument
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected ? (
          <motion.aside
            key={selected.year}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 -translate-y-1/2 right-6 w-[360px] bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 rounded-lg p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div
                  className="font-mono text-[10px] tracking-[0.3em] uppercase"
                  style={{ color: selected.color }}
                >
                  Year
                </div>
                <div className="mt-1 font-mono text-3xl text-white">{selected.year}</div>
              </div>
              <button
                onClick={() => setSelectedIdx(null)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                [×]
              </button>
            </div>
            <div className="mt-2 font-mono text-cyan-300 text-sm">{selected.title}</div>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">{selected.description}</p>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
