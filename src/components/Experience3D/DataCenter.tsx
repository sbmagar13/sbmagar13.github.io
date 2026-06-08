'use client';

import { useMemo, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial, ContactShadows, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import ServerRack from './ServerRack';
import CableFlow from './CableFlow';
import { VolumetricBeam, NeonStrip } from './Atmosphere';
import CinematicEffects from './Effects';
import LensFlare from './LensFlare';
import ParticleStorm from './ParticleStorm';
import { PALETTE, statusColor } from './Materials';
import type { ScreenMode } from './AnimatedScreen';

// 11 racks = 11 projects. Real names, real statuses. Edit at will.
interface RackData {
  id: string;
  label: string;
  sublabel: string;
  status: string;
  description: string;
  tech: string[];
  metrics?: { label: string; value: string }[];
  github?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  screen?: ScreenMode;
}

const RACKS: RackData[] = [
  {
    id: 'ci-cd-pipeline-overhaul',
    label: 'ci-cd',
    sublabel: 'pipeline-overhaul',
    status: 'Running',
    description:
      'Modernized CI/CD pipeline with parallel execution, BuildKit caching, and integrated testing across staging and prod.',
    tech: ['GitHub Actions', 'Docker', 'Python', 'BuildKit'],
    metrics: [
      { label: 'Uptime', value: '98.5%' },
      { label: 'Build time', value: '−62%' },
    ],
    position: [-4.5, 0, -2.5],
    screen: 'terminal',
  },
  {
    id: 'kubernetes-monitoring',
    label: 'k8s-mon',
    sublabel: 'kubernetes-monitoring',
    status: 'Maintenance',
    description:
      'Prometheus + Grafana stack with custom dashboards for cluster health, resource usage, and per-namespace drill-down.',
    tech: ['Kubernetes', 'Prometheus', 'Grafana', 'Helm'],
    metrics: [
      { label: 'Uptime', value: '98.5%' },
      { label: 'Alerts/wk', value: '~5' },
    ],
    position: [-2.7, 0, -2.5],
    screen: 'graph',
  },
  {
    id: 'monitoring-alerting-system',
    label: 'alerts',
    sublabel: 'monitoring-alerting',
    status: 'Running',
    description:
      'Cross-service monitoring and alerting platform with intelligent routing and on-call escalation policies.',
    tech: ['Prometheus', 'Grafana', 'AlertManager', 'Loki'],
    metrics: [
      { label: 'Uptime', value: '99.95%' },
      { label: 'MTTR', value: '<15m' },
    ],
    position: [-0.9, 0, -2.5],
    screen: 'pulse',
  },
  {
    id: 'terraform-modules-library',
    label: 'tf-mods',
    sublabel: 'terraform-modules',
    status: 'Maintenance',
    description:
      'Reusable Terraform modules for AWS infrastructure with built-in security and compliance checks.',
    tech: ['Terraform', 'AWS', 'IaC', 'Security'],
    metrics: [
      { label: 'Uptime', value: '100%' },
      { label: 'Modules', value: '18' },
    ],
    position: [0.9, 0, -2.5],
    screen: 'htop',
  },
  {
    id: 'python-web-platform',
    label: 'web',
    sublabel: 'python-platform',
    status: 'Running',
    description:
      'Modern web platform built on Python frameworks (Django, FastAPI, Flask) with REST APIs and a responsive frontend.',
    tech: ['Python', 'Django', 'FastAPI', 'Flask'],
    metrics: [
      { label: 'Uptime', value: '99.8%' },
      { label: 'p95', value: '120ms' },
    ],
    position: [2.7, 0, -2.5],
    screen: 'logs',
  },
  {
    id: 'devops-ai-assistant',
    label: 'ai-ops',
    sublabel: 'devops-ai-assistant',
    status: 'In Progress',
    description:
      'Personal AI assistant that automates routine DevOps tasks using LLMs and MCP frameworks for tool integration.',
    tech: ['Python', 'LLMs', 'MCP', 'AI Agents'],
    position: [4.5, 0, -2.5],
    screen: 'matrix',
  },
  // Row 2 (facing the other way)
  {
    id: 'llm-infra-analyzer',
    label: 'infra-ai',
    sublabel: 'llm-infra-analyzer',
    status: 'In Progress',
    description:
      'LLM-powered tool that reads Terraform / k8s configs and surfaces optimization opportunities and best-practice risks.',
    tech: ['Python', 'LLMs', 'Terraform'],
    position: [-4.5, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'graph',
  },
  {
    id: 'llm-code-reviewer',
    label: 'code-ai',
    sublabel: 'llm-code-reviewer',
    status: 'Running',
    description:
      'Automated code-review tool. Uses LLMs to analyze pull requests, suggest improvements, flag potential bugs.',
    tech: ['Python', 'LLMs', 'GitHub API'],
    metrics: [{ label: 'Uptime', value: '94.3%' }],
    position: [-2.7, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'terminal',
  },
  {
    id: 'mcp-agent-framework',
    label: 'mcp-fw',
    sublabel: 'mcp-agent-framework',
    status: 'In Progress',
    description:
      'Framework for building specialized MCP agents with domain knowledge and DevOps-focused capabilities.',
    tech: ['TypeScript', 'MCP', 'Node.js'],
    position: [-0.9, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'matrix',
  },
  {
    id: 'mcp-tools-explorer',
    label: 'mcp-x',
    sublabel: 'mcp-tools-explorer',
    status: 'In Progress',
    description:
      'Experimental project exploring Model Context Protocol — building custom MCP servers for DevOps automation.',
    tech: ['TypeScript', 'MCP', 'Node.js'],
    position: [0.9, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'terminal',
  },
  {
    id: 'kubernetes-cluster-planner',
    label: 'k8s-plan',
    sublabel: 'cluster-planner',
    status: 'In Progress',
    description:
      'Planning tool for Kubernetes cluster architecture, resource allocation, and scaling strategies.',
    tech: ['Kubernetes', 'Go', 'Planning'],
    position: [2.7, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'htop',
  },
];

// Connections to render as fiber cables. From → to are rack ids.
const CABLES: { from: string; to: string; color?: string }[] = [
  { from: 'ci-cd-pipeline-overhaul', to: 'kubernetes-monitoring' },
  { from: 'kubernetes-monitoring', to: 'monitoring-alerting-system' },
  { from: 'monitoring-alerting-system', to: 'terraform-modules-library', color: PALETTE.neonMagenta },
  { from: 'terraform-modules-library', to: 'python-web-platform' },
  { from: 'python-web-platform', to: 'devops-ai-assistant' },
  { from: 'devops-ai-assistant', to: 'llm-infra-analyzer', color: PALETTE.neonPurple },
  { from: 'llm-infra-analyzer', to: 'llm-code-reviewer' },
  { from: 'llm-code-reviewer', to: 'mcp-agent-framework', color: PALETTE.neonMagenta },
  { from: 'mcp-agent-framework', to: 'mcp-tools-explorer' },
  { from: 'mcp-tools-explorer', to: 'kubernetes-cluster-planner' },
  // A diagonal across the aisle for visual interest
  { from: 'kubernetes-monitoring', to: 'llm-code-reviewer', color: PALETTE.neonCyan },
  { from: 'terraform-modules-library', to: 'mcp-agent-framework', color: PALETTE.neonCyan },
];

function CableLayer({ activeId }: { activeId: string | null }) {
  return (
    <>
      {CABLES.map((c, i) => {
        const from = RACKS.find((r) => r.id === c.from)!;
        const to = RACKS.find((r) => r.id === c.to)!;
        if (!from || !to) return null;
        const involved = activeId === c.from || activeId === c.to;
        const color = involved ? PALETTE.ledWhite : c.color || PALETTE.neonCyan;
        return (
          <CableFlow
            key={i}
            from={[from.position[0], 1.4, from.position[2]]}
            to={[to.position[0], 1.4, to.position[2]]}
            color={color}
            packetCount={involved ? 5 : 3}
            speed={involved ? 0.32 : 0.18}
          />
        );
      })}
    </>
  );
}

function CameraRig({ activeId }: { activeId: string | null }) {
  const target = useRef(new THREE.Vector3(0, 0.4, 0));
  const desired = useRef(new THREE.Vector3(0, 4.5, 9));

  useFrame((state) => {
    const cam = state.camera;
    // When a rack is active, lean the camera toward it.
    if (activeId) {
      const rack = RACKS.find((r) => r.id === activeId);
      if (rack) {
        desired.current.set(rack.position[0] * 0.6, 2.5, rack.position[2] > 0 ? 6 : -6);
        target.current.set(rack.position[0], 0.6, rack.position[2]);
      }
    } else {
      desired.current.set(0, 4.5, 9);
      target.current.set(0, 0.4, 0);
    }
    cam.position.lerp(desired.current, 0.04);
    cam.lookAt(target.current);
  });

  return null;
}

interface SceneProps {
  onRackClick: (id: string) => void;
  activeId: string | null;
  hoveredId: string | null;
  setHovered: (id: string | null) => void;
}

function Scene({ onRackClick, activeId, hoveredId, setHovered }: SceneProps) {
  return (
    <>
      {/* Lights — manual, no remote HDR */}
      <ambientLight intensity={0.12} color="#1e293b" />

      {/* Cold key from above */}
      <directionalLight
        position={[6, 12, 6]}
        intensity={0.5}
        color="#a5b4fc"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Cyan rim from the back */}
      <pointLight position={[0, 5, -8]} intensity={1.2} color={PALETTE.neonCyan} distance={20} />

      {/* Magenta rim from the front-low */}
      <pointLight position={[0, -1, 8]} intensity={0.8} color={PALETTE.neonMagenta} distance={18} />

      {/* Reflective floor */}
      <mesh rotation-x={-Math.PI / 2} position-y={-1.4} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={50}
          roughness={0.6}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0f172a"
          metalness={0.7}
          mirror={0.4}
        />
      </mesh>

      {/* Subtle contact shadows under each rack so they feel grounded */}
      <ContactShadows
        position={[0, -1.39, 0]}
        opacity={0.55}
        blur={2.4}
        far={8}
        resolution={512}
        color="#000000"
      />

      {/* Neon underglow strips along the aisle */}
      <NeonStrip start={[-6, -1.35, -1.7]} end={[6, -1.35, -1.7]} color={PALETTE.neonCyan} thickness={0.025} />
      <NeonStrip start={[-6, -1.35, 1.7]} end={[6, -1.35, 1.7]} color={PALETTE.neonMagenta} thickness={0.025} />
      {/* Diagonal accent in front */}
      <NeonStrip start={[-5.5, -1.35, 0]} end={[5.5, -1.35, 0]} color={PALETTE.neonPurple} thickness={0.02} />

      {/* Volumetric light cones above each rack */}
      {RACKS.map((r) => (
        <VolumetricBeam
          key={`beam-${r.id}`}
          position={[r.position[0], 3.5, r.position[2]]}
          height={4.5}
          topRadius={0.05}
          bottomRadius={1.1}
          color={activeId === r.id ? '#f5f5f5' : PALETTE.neonCyan}
          opacity={activeId === r.id ? 0.13 : 0.06}
        />
      ))}

      {/* Atmospheric dust — main drift layer only. Toned down so the
          racks read cleanly. */}
      <ParticleStorm
        count={2000}
        bounds={[16, 6, 14]}
        color={PALETTE.neonCyan}
        size={6}
        speed={0.35}
        behavior="drift"
        opacity={0.3}
      />

      {/* Lens flares at the top of every spot light — kept small enough
          that 11 of them aren't dominating the frame. */}
      {RACKS.map((r) => (
        <LensFlare
          key={`flare-${r.id}`}
          position={[r.position[0], 3.7, r.position[2]]}
          color={activeId === r.id ? '#ffffff' : PALETTE.neonCyan}
          size={activeId === r.id ? 2.4 : 1.4}
          intensity={activeId === r.id ? 0.9 : 0.3}
          pulse
        />
      ))}

      {/* The racks */}
      {RACKS.map((r) => (
        <ServerRack
          key={r.id}
          position={r.position}
          rotation={r.rotation}
          label={r.label}
          sublabel={r.sublabel}
          statusColor={statusColor(r.status)}
          screenMode={r.screen}
          accent={
            activeId === r.id
              ? PALETTE.ledWhite
              : hoveredId === r.id
                ? PALETTE.neonMagenta
                : PALETTE.neonCyan
          }
          units={18}
          highlighted={activeId === r.id}
          onClick={(e) => {
            e.stopPropagation();
            onRackClick(r.id);
          }}
          onHover={(h) => setHovered(h ? r.id : null)}
        />
      ))}

      <CableLayer activeId={activeId} />

      {/* The "title" floating sign over the aisle */}
      <Float speed={1} floatIntensity={0.4} rotationIntensity={0.1}>
        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[3.2, 0.45, 0.05]} />
          <meshStandardMaterial
            color="#020617"
            emissive={PALETTE.neonCyan}
            emissiveIntensity={0.15}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      </Float>

      <CameraRig activeId={activeId} />

      <OrbitControls
        target={[0, 0.4, 0]}
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={16}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={activeId === null && hoveredId === null}
        autoRotateSpeed={0.25}
        dampingFactor={0.06}
      />
    </>
  );
}

export default function DataCenter() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const active = useMemo(() => RACKS.find((r) => r.id === activeId) ?? null, [activeId]);

  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        shadows
        camera={{ position: [0, 4.5, 9], fov: 45 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.6]}
      >
        <color attach="background" args={[PALETTE.voidA]} />
        <fog attach="fog" args={['#020617', 8, 30]} />

        <Suspense fallback={null}>
          <Scene
            onRackClick={(id) => setActiveId((prev) => (prev === id ? null : id))}
            activeId={activeId}
            hoveredId={hoveredId}
            setHovered={setHoveredId}
          />
          <CinematicEffects
            bloomIntensity={0.6}
            bloomThreshold={0.55}
            bokehScale={1.4}
            chromaticAberration={0.0005}
          />
        </Suspense>
      </Canvas>

      {/* Heading */}
      <div className="pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 text-center">
        <div className="font-mono text-xs tracking-[0.4em] text-cyan-400/70 uppercase">
          Production environment
        </div>
        <div className="mt-1 font-mono text-2xl text-white/90">DATA CENTER</div>
        <div className="mt-1 font-mono text-[10px] text-slate-400/70 max-w-md mx-auto">
          {RACKS.length} live systems · click a rack to inspect · drag to orbit
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {active ? (
          <motion.aside
            key={active.id}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/2 -translate-y-1/2 right-6 w-[400px] max-w-[40vw] bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 rounded-lg p-6 shadow-2xl shadow-cyan-500/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-cyan-400">
                  {active.status}
                </div>
                <div className="mt-1 font-mono text-xl text-white">{active.sublabel}</div>
              </div>
              <button
                onClick={() => setActiveId(null)}
                className="text-slate-400 hover:text-white font-mono text-sm"
                aria-label="Close"
              >
                [×]
              </button>
            </div>

            <p className="mt-4 text-slate-300 text-sm leading-relaxed">{active.description}</p>

            {active.metrics && active.metrics.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {active.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded border border-cyan-500/20 bg-slate-900/60 px-3 py-2"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                      {m.label}
                    </div>
                    <div className="font-mono text-lg text-cyan-300">{m.value}</div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {active.tech.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 text-[10px] font-mono text-cyan-200 border border-cyan-500/30 rounded"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-5 text-[10px] font-mono text-slate-500">
              Press <span className="text-cyan-300">esc</span> or click anywhere to deselect
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
