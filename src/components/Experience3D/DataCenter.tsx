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
import ClickBurst, { useBurstQueue } from './ClickBurst';
import Typewriter from './Typewriter';
import { usePerfTier } from './usePerfTier';
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
  // ROW 1 (back row, eu-north-1 production stack)
  {
    id: 'eventlogic',
    label: 'eventlogic',
    sublabel: 'multi-tenant SaaS · eu-north-1',
    status: 'Running',
    description:
      'Swedish multi-tenant event-management SaaS. Sole platform owner. ECS Fargate services behind ALB, Aurora PostgreSQL with schema-per-tenant, ElastiCache Redis, Amazon MQ. Tenant routing via DynamoDB registry. Customers across Europe.',
    tech: ['ECS Fargate', 'Aurora PostgreSQL', 'ElastiCache', 'Amazon MQ', 'DynamoDB', 'CloudFront'],
    metrics: [
      { label: 'Region', value: 'eu-north-1' },
      { label: 'Tenancy', value: 'schema-per-tenant' },
    ],
    position: [-4.5, 0, -2.5],
    screen: 'graph',
  },
  {
    id: 'multi-region-dr',
    label: 'dr-failover',
    sublabel: 'cross-region disaster recovery',
    status: 'Running',
    description:
      'Cross-region disaster recovery from eu-north-1 to eu-west-1. Built where none existed. Aurora Global Database for sub-second cross-region replication, EFS and ECR replication, shared KMS keys across regions. Documented runbook for promotion.',
    tech: ['Aurora Global DB', 'EFS', 'ECR', 'KMS', 'Route 53'],
    metrics: [
      { label: 'Primary', value: 'eu-north-1' },
      { label: 'Failover', value: 'eu-west-1' },
    ],
    position: [-2.7, 0, -2.5],
    screen: 'pulse',
  },
  {
    id: 'tenant-orchestrator',
    label: 'tenant-orch',
    sublabel: 'provisioning service',
    status: 'Running',
    description:
      'Python tenant-provisioning orchestrator. One API call sets up schema-per-tenant on Aurora, wires SQS and EventBridge, creates ALB listener rules, provisions a CloudFront / S3 distribution, configures Route 53 records, and registers the tenant in DynamoDB.',
    tech: ['Python', 'FastAPI', 'Aurora', 'SQS', 'EventBridge', 'Route 53'],
    metrics: [
      { label: 'Per tenant', value: 'one call' },
      { label: 'Steps', value: '6+' },
    ],
    position: [-0.9, 0, -2.5],
    screen: 'terminal',
  },
  {
    id: 'reliability-program',
    label: 'reliability',
    sublabel: 'incident · 19m outage fix',
    status: 'Running',
    description:
      'Diagnosed a 19-minute full-platform outage caused by blocking Redis KEYS calls exhausting the Tomcat/JDBC thread pool. Added connection-pool checkout timeouts, tuned RDS parameters, and drove a 68-task reliability program across 11 epics and 7 sprints to prevent recurrence.',
    tech: ['Aurora', 'Redis', 'JDBC', 'Postmortem', 'SLOs'],
    metrics: [
      { label: 'Outage', value: '19 min' },
      { label: 'Tasks', value: '68 / 11 epics' },
    ],
    position: [0.9, 0, -2.5],
    screen: 'pulse',
  },
  {
    id: 'oneuptime',
    label: 'oneuptime',
    sublabel: 'self-hosted SRE platform',
    status: 'Running',
    description:
      'Self-hosted OneUptime on K3s in eu-central-1 (separate region from primary). Status pages, uptime monitoring, on-call scheduling, incident management. Designed so observability survives a primary-region outage.',
    tech: ['K3s', 'OneUptime', 'OpenTelemetry', 'Loki'],
    metrics: [
      { label: 'Region', value: 'eu-central-1' },
      { label: 'Surface', value: 'status / on-call' },
    ],
    position: [2.7, 0, -2.5],
    screen: 'htop',
  },
  {
    id: 'otel-pipeline',
    label: 'otel',
    sublabel: 'observability pipeline',
    status: 'Running',
    description:
      'OpenTelemetry collector dual-exports metrics, logs, and traces to OneUptime and Loki at the same time. Consolidated fragmented monitoring into one observability stack. Grafana sits on top.',
    tech: ['OpenTelemetry', 'Loki', 'Grafana', 'Prometheus'],
    position: [4.5, 0, -2.5],
    screen: 'logs',
  },

  // ROW 2 (front row, platform tooling + AI side projects)
  {
    id: 'es-cluster',
    label: 'es-cluster',
    sublabel: '3-node Elasticsearch',
    status: 'Maintenance',
    description:
      'Self-managed three-node Elasticsearch cluster managed with Terraform and Ansible. Split deploy and split-restart playbooks so a single config change cannot cascade across the cluster.',
    tech: ['Elasticsearch', 'Terraform', 'Ansible'],
    metrics: [
      { label: 'Nodes', value: '3' },
      { label: 'Deploy', value: 'split-restart' },
    ],
    position: [-4.5, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'graph',
  },
  {
    id: 'ci-cd-platform',
    label: 'ci-cd',
    sublabel: 'pipelines · 3 platforms',
    status: 'Running',
    description:
      'CI/CD pipelines spanning Jenkins, GitLab CI, and AWS CodePipeline / CodeBuild. Targets include ECS, Lambda, CloudFront, and EC2 deployments. App and infra share pipeline patterns.',
    tech: ['Jenkins', 'GitLab CI', 'CodePipeline', 'CodeBuild', 'Docker'],
    metrics: [
      { label: 'Platforms', value: '3' },
      { label: 'Targets', value: 'ECS · λ · CF · EC2' },
    ],
    position: [-2.7, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'terminal',
  },
  {
    id: 'aws-finops',
    label: 'finops',
    sublabel: 'AWS cost optimization',
    status: 'Maintenance',
    description:
      'Cut monthly AWS spend by removing orphaned NAT Gateways, adding S3 and DynamoDB gateway endpoints to drop data-transfer cost, setting log-retention policies on CloudWatch, and right-sizing EBS volumes.',
    tech: ['VPC Endpoints', 'CloudWatch Logs', 'EBS', 'NAT'],
    position: [-0.9, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'graph',
  },
  {
    id: 'hashnode-mcp',
    label: 'hashnode-mcp',
    sublabel: 'shelved · API terminated',
    status: 'Completed',
    description:
      'Open-source Model Context Protocol server that wired AI assistants like Claude into the Hashnode content API. Shelved after Hashnode terminated public API access. The pattern lives on in the broader agentic-DevOps work.',
    tech: ['Python', 'MCP', 'Hashnode API'],
    github: 'https://github.com/sbmagar13/hashnode-mcp-server',
    position: [0.9, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'matrix',
  },
  {
    id: 'vqgan-clip',
    label: 'vqgan-clip',
    sublabel: 'text-to-image · 2021',
    status: 'Completed',
    description:
      'Multimodal text-to-image generation using VQGAN + CLIP architectures in PyTorch. From the AI/ML era of the career, kept here as an artifact.',
    tech: ['PyTorch', 'CLIP', 'VQGAN', 'Python'],
    github: 'https://github.com/sbmagar/VQGAN-CLIP-Text-to-Image',
    position: [2.7, 0, 2.5],
    rotation: [0, Math.PI, 0],
    screen: 'matrix',
  },
];

// Connections between racks rendered as fiber cables. Each line traces
// a real data path: EventLogic feeds the DR side, the tenant orchestrator
// writes into both Aurora and the registry, observability collects from
// every production service, CI/CD ships to ECS and Lambda, etc.
const CABLES: { from: string; to: string; color?: string }[] = [
  // Production data flow inside eu-north-1
  { from: 'eventlogic', to: 'tenant-orchestrator' },
  { from: 'tenant-orchestrator', to: 'reliability-program' },
  { from: 'reliability-program', to: 'oneuptime', color: PALETTE.neonMagenta },
  { from: 'oneuptime', to: 'otel-pipeline' },

  // Cross-region DR replication
  { from: 'eventlogic', to: 'multi-region-dr', color: PALETTE.neonPurple },

  // Front row platform tooling
  { from: 'es-cluster', to: 'ci-cd-platform' },
  { from: 'ci-cd-platform', to: 'aws-finops' },
  { from: 'aws-finops', to: 'hashnode-mcp', color: PALETTE.neonMagenta },
  { from: 'hashnode-mcp', to: 'vqgan-clip' },

  // Cross-aisle observability + delivery lines
  { from: 'otel-pipeline', to: 'es-cluster', color: PALETTE.neonCyan },
  { from: 'ci-cd-platform', to: 'eventlogic', color: PALETTE.neonCyan },
  { from: 'multi-region-dr', to: 'oneuptime', color: PALETTE.neonCyan },
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
  const lookTarget = useRef(new THREE.Vector3(0, 0.4, 0));

  useFrame((state, delta) => {
    const cam = state.camera;
    // When a rack is active, lean the camera in close.
    if (activeId) {
      const rack = RACKS.find((r) => r.id === activeId);
      if (rack) {
        desired.current.set(rack.position[0] * 0.5, 2.2, rack.position[2] > 0 ? 5.4 : -5.4);
        target.current.set(rack.position[0], 0.6, rack.position[2]);
      }
    } else {
      desired.current.set(0, 4.5, 9);
      target.current.set(0, 0.4, 0);
    }

    // Frame-rate independent damping, fast initial approach that
    // decelerates smoothly. The damping factor (3.2) is the "speed at
    // which the camera reaches its target"; higher = snappier.
    const lambda = 3.2;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, desired.current.x, lambda, delta);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, desired.current.y, lambda, delta);
    cam.position.z = THREE.MathUtils.damp(cam.position.z, desired.current.z, lambda, delta);

    // Smooth the look-at target separately so the framing doesn't snap.
    lookTarget.current.x = THREE.MathUtils.damp(lookTarget.current.x, target.current.x, lambda, delta);
    lookTarget.current.y = THREE.MathUtils.damp(lookTarget.current.y, target.current.y, lambda, delta);
    lookTarget.current.z = THREE.MathUtils.damp(lookTarget.current.z, target.current.z, lambda, delta);
    cam.lookAt(lookTarget.current);
  });

  return null;
}

interface SceneProps {
  onRackClick: (id: string) => void;
  activeId: string | null;
  hoveredId: string | null;
  setHovered: (id: string | null) => void;
  bursts: Array<{ id: number; position: [number, number, number]; color: string }>;
  onBurstDone: (id: number) => void;
  isLow: boolean;
}

function Scene({ onRackClick, activeId, hoveredId, setHovered, bursts, onBurstDone, isLow }: SceneProps) {
  return (
    <>
      {/* Lights, manual, no remote HDR */}
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

      {/* Reflective floor. On mobile, fall back to a plain matte floor;
          MeshReflectorMaterial re-renders the scene from below into a
          texture every frame and that's the single most expensive thing
          in the data center. */}
      <mesh rotation-x={-Math.PI / 2} position-y={-1.4} receiveShadow={!isLow}>
        <planeGeometry args={[60, 60]} />
        {isLow ? (
          <meshStandardMaterial color="#0a1224" metalness={0.5} roughness={0.6} />
        ) : (
          <MeshReflectorMaterial
            blur={[120, 40]}
            resolution={1024}
            mixBlur={0.55}
            mixStrength={32}
            roughness={0.45}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0f172a"
            metalness={0.85}
            mirror={0.55}
          />
        )}
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

      {/* Atmospheric dust, main drift layer only. Toned down so the
          racks read cleanly. */}
      <ParticleStorm
        count={2000}
        bounds={[16, 6, 14]}
        color={PALETTE.neonCyan}
        size={6}
        speed={0.2}
        behavior="drift"
        opacity={0.3}
      />

      {/* Lens flares at the top of every spot light, kept small enough
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

      {/* Active click bursts. New burst spawns on every rack click and
          auto-removes when its lifetime ends. */}
      {bursts.map((b) => (
        <ClickBurst
          key={b.id}
          position={b.position}
          color={b.color}
          onDone={() => onBurstDone(b.id)}
        />
      ))}

      <OrbitControls
        target={[0, 0.4, 0]}
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={16}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={activeId === null && hoveredId === null}
        autoRotateSpeed={0.14}
        dampingFactor={0.085}
      />
    </>
  );
}

export default function DataCenter({ active = true }: { active?: boolean } = {}) {
  const tier = usePerfTier();
  const isLow = tier === 'low';
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeRack = useMemo(() => RACKS.find((r) => r.id === activeId) ?? null, [activeId]);
  const { bursts, trigger: triggerBurst, remove: removeBurst } = useBurstQueue();

  const handleRackClick = (id: string) => {
    const rack = RACKS.find((r) => r.id === id);
    if (rack) {
      // Fire a burst at roughly the centre of the rack.
      triggerBurst(
        [rack.position[0], rack.position[1] + 0.4, rack.position[2]],
        statusColor(rack.status),
      );
    }
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        shadows={!isLow}
        camera={{ position: [0, 4.5, 9], fov: 45 }}
        gl={{ antialias: !isLow, powerPreference: 'high-performance' }}
        dpr={isLow ? [1, 1] : [1, 1.75]}
        frameloop={active ? 'always' : 'never'}
      >
        <color attach="background" args={[PALETTE.voidA]} />
        <fog attach="fog" args={['#020617', 8, 30]} />

        <Suspense fallback={null}>
          <Scene
            onRackClick={handleRackClick}
            bursts={bursts}
            onBurstDone={removeBurst}
            activeId={activeId}
            hoveredId={hoveredId}
            setHovered={setHoveredId}
            isLow={isLow}
          />
          {!isLow ? (
            <CinematicEffects
              bloomIntensity={0.6}
              bloomThreshold={0.55}
              chromaticAberration={0.00015}
            />
          ) : null}
        </Suspense>
      </Canvas>

      {/* Heading, kept high-contrast and the eyebrow text big enough to
          read against the busy scene below. */}
      <div className="hidden sm:block pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 text-center px-6 py-3 rounded-md bg-slate-950/45 backdrop-blur-sm border border-cyan-500/20">
        <div className="font-mono text-[11px] tracking-[0.32em] text-cyan-300 uppercase">
          Production environment
        </div>
        <div className="mt-1.5 font-mono text-3xl font-semibold text-white tracking-wider">
          <Typewriter text="DATA CENTER" speed={55} caret />
        </div>
        <div className="mt-1.5 font-mono text-xs text-slate-300 max-w-md mx-auto">
          {RACKS.length} live systems · click a rack to inspect · drag to orbit
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {activeRack ? (
          <motion.aside
            key={activeRack.id}
            initial={{ x: 60, opacity: 0, scale: 0.96 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 60, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 -translate-y-1/2 right-6 w-[460px] max-w-[42vw] bg-slate-950/92 backdrop-blur-xl border border-cyan-500/40 rounded-lg p-7 shadow-2xl shadow-cyan-500/20"
          >
            {/* Status row */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.3em] uppercase text-cyan-300 bg-cyan-500/10 border border-cyan-400/40 rounded px-2 py-1">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse"
                    aria-hidden
                  />
                  {activeRack.status}
                </div>
                <div className="mt-3 font-mono text-2xl font-semibold text-white tracking-wide leading-tight">
                  {activeRack.sublabel}
                </div>
                <div className="mt-1 font-mono text-[11px] text-slate-400 tracking-wider">
                  rack-{activeRack.label}
                </div>
              </div>
              <button
                onClick={() => setActiveId(null)}
                className="text-slate-400 hover:text-white font-mono text-base leading-none w-8 h-8 flex items-center justify-center rounded border border-slate-700 hover:border-slate-500 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Description */}
            <p className="mt-5 text-slate-200 text-[15px] leading-relaxed">{activeRack.description}</p>

            {/* Metrics */}
            {activeRack.metrics && activeRack.metrics.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {activeRack.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-md border border-cyan-500/25 bg-slate-900/70 px-3.5 py-2.5"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      {m.label}
                    </div>
                    <div className="mt-0.5 font-mono text-xl font-semibold text-cyan-200">{m.value}</div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Tech chips */}
            <div className="mt-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-2">
                Tech stack
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeRack.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 text-[11px] font-mono text-cyan-100 bg-cyan-500/5 border border-cyan-500/30 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 text-[11px] font-mono text-slate-500">
              Press <span className="text-cyan-300">esc</span> or click anywhere to deselect
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
