'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import CinematicEffects from './Effects';
import LensFlare from './LensFlare';
import ParticleStorm from './ParticleStorm';
import LabelPlate from './LabelPlate';
import Typewriter from './Typewriter';
import { usePerfTier } from './usePerfTier';
import { PALETTE } from './Materials';

interface Milestone {
  year: string;
  title: string;
  description: string;
  // Which monument shape to draw (procedural, no models needed).
  shape: 'tower' | 'cluster' | 'orb' | 'cube' | 'helix' | 'book';
  color: string;
}

const MILESTONES: Milestone[] = [
  {
    year: '2020',
    title: 'AI / ML beginnings',
    description:
      'VolgAI, Genese Cloud Academy, IBZ Networks. Built AI chatbots with RASA (NLP), backend APIs with Django and Flask, RTSP/FFmpeg pipelines for CCTV image processing. Async work via Celery and RabbitMQ. AWS AI/ML Internship at Genese.',
    shape: 'book',
    color: PALETTE.ledWhite,
  },
  {
    year: '2021',
    title: 'Bachelor + first DevOps role',
    description:
      'Graduated Bachelor in Computer Engineering from Tribhuvan University (IOE, Pokhara). Joined Cloudyfox Technology in September as DevOps Engineer. First Terraform / Terragrunt at scale across AWS.',
    shape: 'tower',
    color: PALETTE.neonCyan,
  },
  {
    year: '2022',
    title: 'Containers and pipelines',
    description:
      'Ran Kubernetes for containerized workloads at Cloudyfox. Built CI/CD on GitLab CI and Jenkins for both app and infra deploys. SysOps, Linux admin, OpenVPN, centralized logging with CloudWatch, ELK, Grafana.',
    shape: 'cluster',
    color: PALETTE.neonBlue,
  },
  {
    year: '2023',
    title: 'Sole owner of a production platform',
    description:
      'Joined Threadcode Technologies as DevOps / SRE for EventLogic, a Swedish multi-tenant event-management SaaS. Owner of the entire AWS platform end to end: ECS Fargate, Aurora PostgreSQL, ElastiCache Redis, Amazon MQ in eu-north-1. Technical Reviewer for Python for DevOps (Packt).',
    shape: 'cube',
    color: PALETTE.neonMagenta,
  },
  {
    year: '2024',
    title: 'Reliability + multi-region DR',
    description:
      'Diagnosed and resolved a 19-minute platform outage caused by blocking Redis KEYS calls exhausting the JDBC thread pool. Drove a 68-task reliability program across 11 epics and 7 sprints. Built cross-region DR from eu-north-1 to eu-west-1 with Aurora Global Database, EFS replication, and shared KMS keys.',
    shape: 'orb',
    color: PALETTE.ledAmber,
  },
  {
    year: '2025',
    title: 'Observability + first MCP work',
    description:
      'Deployed self-hosted OneUptime on K3s in eu-central-1 for status pages, uptime monitoring, and on-call. OpenTelemetry collector dual-exports to OneUptime and Loki so observability survives a primary-region outage. Shipped an open-source Hashnode MCP server for Claude (later shelved when Hashnode terminated their public API).',
    shape: 'helix',
    color: PALETTE.neonPurple,
  },
  {
    year: '2026',
    title: 'Agentic DevOps + platform hardening',
    description:
      'Still running the production platform end to end. Hardening the multi-region story, sharpening SLOs, and going deep on AI agents for DevOps work: MCP, LangGraph, local LLM inference, self-learning side projects that wrap real ops tasks. Shipped this 3D portfolio as the public face of the practice. Open to remote senior DevOps / SRE roles.',
    shape: 'orb',
    color: PALETTE.neonCyan,
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

// The career path, a CatmullRom curve through all milestone positions.
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
  isLow,
}: {
  onSelect: (i: number | null) => void;
  selectedIdx: number | null;
  hoveredIdx: number | null;
  setHovered: (i: number | null) => void;
  isLow: boolean;
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
            {/* Year + title label, billboarded with dark plate so it
                stays readable from every camera angle. */}
            <LabelPlate
              position={[0, 1.15, 0]}
              text={m.year}
              subtext={m.title.toUpperCase()}
              size={0.24}
              subSize={0.072}
              color={m.color}
              subColor="#cbd5e1"
              letterSpacing={0.04}
              billboard
              plate
              plateOpacity={0.85}
              padding={[0.18, 0.1]}
              border={isActive || hoveredIdx === i}
              borderColor={m.color}
            />
          </group>
        );
      })}

      <ParticleStorm
        count={isLow ? 350 : 1500}
        bounds={[12, 6, 12]}
        color={PALETTE.neonCyan}
        size={6}
        speed={0.18}
        behavior="drift"
        opacity={0.3}
      />

      {/* Lens flare at each milestone, small unless selected */}
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
        autoRotateSpeed={0.18}
        dampingFactor={0.085}
      />
    </>
  );
}

export default function Journey({ active = true }: { active?: boolean } = {}) {
  const tier = usePerfTier();
  const isLow = tier === 'low';
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const selected = selectedIdx !== null ? MILESTONES[selectedIdx] : null;

  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        camera={{ position: [0, 4, 11], fov: 50 }}
        gl={{ antialias: !isLow, powerPreference: 'high-performance' }}
        dpr={isLow ? [1, 1] : [1, 1.75]}
        frameloop={active ? 'always' : 'never'}
      >
        <color attach="background" args={[PALETTE.voidA]} />
        <fog attach="fog" args={['#020617', 8, 24]} />
        <Suspense fallback={null}>
          <Scene
            onSelect={setSelectedIdx}
            selectedIdx={selectedIdx}
            hoveredIdx={hoveredIdx}
            setHovered={setHoveredIdx}
            isLow={isLow}
          />
          {!isLow ? (
            <CinematicEffects
              bloomIntensity={0.6}
              bloomThreshold={0.5}
              chromaticAberration={0.00015}
            />
          ) : null}
        </Suspense>
      </Canvas>

      {/* Heading */}
      <div className="hidden sm:block pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 text-center px-6 py-3 rounded-md bg-slate-950/45 backdrop-blur-sm border border-cyan-500/20">
        <div className="font-mono text-[11px] tracking-[0.32em] text-cyan-300 uppercase">
          Career arc
        </div>
        <div className="mt-1.5 font-mono text-3xl font-semibold text-white tracking-wider">
          <Typewriter text="JOURNEY" speed={70} caret />
        </div>
        <div className="mt-1.5 font-mono text-xs text-slate-300">
          {`${MILESTONES.length} milestones · 2020 to now · click any monument`}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected ? (
          <motion.aside
            key={selected.year}
            initial={{ x: 60, opacity: 0, scale: 0.96 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 60, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 -translate-y-1/2 right-6 w-[400px] bg-slate-950/92 backdrop-blur-xl border border-cyan-500/40 rounded-lg p-6 shadow-2xl shadow-cyan-500/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div
                  className="inline-block font-mono text-[11px] tracking-[0.3em] uppercase border rounded px-2 py-1"
                  style={{
                    color: selected.color,
                    borderColor: `${selected.color}66`,
                    background: `${selected.color}12`,
                  }}
                >
                  Milestone · {selected.year}
                </div>
                <div className="mt-3 font-mono text-4xl font-semibold text-white tracking-wider">{selected.year}</div>
              </div>
              <button
                onClick={() => setSelectedIdx(null)}
                className="text-slate-400 hover:text-white font-mono text-base w-8 h-8 flex items-center justify-center rounded border border-slate-700 hover:border-slate-500 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="mt-3 font-mono text-base text-cyan-200 leading-snug">{selected.title}</div>
            <p className="mt-4 text-[15px] text-slate-200 leading-relaxed">{selected.description}</p>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
