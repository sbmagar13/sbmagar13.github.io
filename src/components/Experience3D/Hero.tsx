'use client';

import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { VolumetricBeam, NeonStrip } from './Atmosphere';
import CinematicEffects from './Effects';
import LensFlare from './LensFlare';
import ParticleStorm from './ParticleStorm';
import SkillLogo from './SkillLogo';
import LabelPlate from './LabelPlate';
import { usePerfTier, type PerfTier } from './usePerfTier';
import { PALETTE } from './Materials';

type ToolId =
  | 'kubernetes'
  | 'docker'
  | 'aws'
  | 'aurora'
  | 'terraform'
  | 'python'
  | 'grafana'
  | 'opentelemetry'
  | 'mcp';

// War stories: one per tool in the orbit, drawn from the resume's
// real production work. Clicking a tool in the Hero pops the matching
// story so the orbit reads as an interactive map of the career, not
// a decorative ring of icons.
const STORIES: Record<ToolId, { tool: string; title: string; when: string; body: string }> = {
  kubernetes: {
    tool: 'Kubernetes (K3s)',
    title: 'Self-hosted SRE platform on K3s',
    when: '2025 · eu-central-1',
    body:
      'Stood up OneUptime on a K3s cluster in a separate region (eu-central-1) for status pages, uptime monitoring, on-call scheduling and incident management. Deliberately off the primary region so observability survives a primary-region outage.',
  },
  docker: {
    tool: 'Docker',
    title: 'CI/CD across three platforms',
    when: '2023 — present',
    body:
      'Containerised build and deploy pipelines on Jenkins, GitLab CI, and AWS CodePipeline / CodeBuild. Targets include ECS, Lambda, CloudFront and EC2. App and infra share pipeline patterns so a single change can flow through any of them.',
  },
  aws: {
    tool: 'AWS',
    title: 'Recovered a 19-minute platform outage',
    when: '2024 · production',
    body:
      'Diagnosed and resolved a 19-minute full-platform outage caused by blocking Redis KEYS calls exhausting the Tomcat/JDBC thread pool. Added connection-pool checkout timeouts, tuned RDS parameters, then drove a 68-task reliability program across 11 epics and 7 sprints to prevent recurrence.',
  },
  aurora: {
    tool: 'Aurora PostgreSQL',
    title: 'Built cross-region disaster recovery',
    when: '2024',
    body:
      'Established a cross-region DR path where none existed: Aurora Global Database from eu-north-1 to eu-west-1, EFS and ECR replication, shared KMS keys, and a documented runbook for promotion.',
  },
  terraform: {
    tool: 'Terraform',
    title: '3-node Elasticsearch with split-restart',
    when: 'production',
    body:
      'Self-managed three-node Elasticsearch cluster orchestrated with Terraform and Ansible. Split deploy and split-restart playbooks so a single config change cannot cascade across the cluster.',
  },
  python: {
    tool: 'Python',
    title: 'Tenant provisioning orchestrator',
    when: 'production',
    body:
      'One Python API call sets up schema-per-tenant on Aurora, wires SQS and EventBridge, creates ALB listener rules, provisions a CloudFront / S3 distribution, configures Route 53 records, and registers the tenant in DynamoDB.',
  },
  grafana: {
    tool: 'Grafana',
    title: 'One observability surface',
    when: 'rolling',
    body:
      'Consolidated fragmented monitoring into one stack. Grafana over Prometheus, Loki and CloudWatch with per-cluster, per-namespace and per-tenant dashboards. Alert routing wired to OneUptime on-call.',
  },
  opentelemetry: {
    tool: 'OpenTelemetry',
    title: 'Dual-export OTEL pipeline',
    when: '2025',
    body:
      'OpenTelemetry collector dual-exports metrics, logs and traces to OneUptime and Loki at the same time. The duplication is the point: if a primary-region failure takes the main observability stack down, the OneUptime side still pages.',
  },
  mcp: {
    tool: 'Anthropic MCP',
    title: 'AI agents for DevOps work',
    when: '2025 — present',
    body:
      'Self-learning track. Building MCP-based agents that wrap real DevOps tasks (log triage, runbook prompts, infra analysis) so Claude and similar assistants can drive them. Earlier built a Hashnode MCP server, which is shelved now that Hashnode has terminated their public API. Current focus is the broader agentic-DevOps stack: MCP, LangGraph, local LLM inference.',
  },
};

const ORBIT_TOOLS: ToolId[] = [
  'kubernetes',
  'docker',
  'aws',
  'aurora',
  'terraform',
  'python',
  'grafana',
  'opentelemetry',
  'mcp',
];

interface OrbitProps {
  radius?: number;
  onPick: (id: ToolId) => void;
  picked: ToolId | null;
}

function ToolOrbit({ radius = 4.8, onPick, picked }: OrbitProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<ToolId | null>(null);
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.06;
  });
  return (
    <group ref={groupRef}>
      {ORBIT_TOOLS.map((id, i) => {
        const count = ORBIT_TOOLS.length;
        const angle = (i / count) * Math.PI * 2;
        const y = Math.sin(angle * 2) * 0.9 + 0.3;
        const isHovered = hovered === id;
        const isPicked = picked === id;
        return (
          <Float key={id} speed={0.6 + (i % 3) * 0.15} floatIntensity={0.32} rotationIntensity={0.16}>
            <group
              position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
              scale={isPicked ? 1.0 : isHovered ? 0.92 : 0.78}
              onClick={(e) => {
                e.stopPropagation();
                onPick(id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(id);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHovered((cur) => (cur === id ? null : cur));
                document.body.style.cursor = '';
              }}
            >
              <SkillLogo id={id} />
              {/* Always-visible label so the orbit reads as stack, not
                  decoration. Brightens on hover/pick. */}
              <LabelPlate
                position={[0, -0.55, 0]}
                text={STORIES[id].tool.split(' ')[0]}
                size={0.11}
                color={isHovered || isPicked ? '#f1f5f9' : '#cbd5e1'}
                letterSpacing={0.04}
                billboard
                plate
                plateOpacity={0.78}
                padding={[0.07, 0.035]}
                border={isHovered || isPicked}
                borderColor={PALETTE.neonCyan}
              />
            </group>
          </Float>
        );
      })}
    </group>
  );
}

function CenterOrb() {
  return (
    <Float speed={0.7} floatIntensity={0.22} rotationIntensity={0.14}>
      <mesh position={[0, 0.4, -1.5]}>
        <sphereGeometry args={[1.25, 64, 64]} />
        <MeshDistortMaterial
          color={PALETTE.neonPurple}
          emissive={PALETTE.neonMagenta}
          emissiveIntensity={0.28}
          metalness={0.88}
          roughness={0.14}
          distort={0.24}
          speed={0.9}
        />
      </mesh>
    </Float>
  );
}

interface SceneProps {
  onPick: (id: ToolId) => void;
  picked: ToolId | null;
  tier: PerfTier;
}

function Scene({ onPick, picked, tier }: SceneProps) {
  const isLow = tier === 'low';
  return (
    <>
      <ambientLight intensity={0.18} color="#1e293b" />
      <pointLight position={[6, 5, 6]} intensity={1.3} color={PALETTE.neonCyan} distance={20} />
      <pointLight position={[-6, -2, -4]} intensity={1.0} color={PALETTE.neonMagenta} distance={18} />
      {/* Third light is decorative; mobile skips it. */}
      {!isLow ? (
        <pointLight position={[0, 8, 0]} intensity={0.6} color={PALETTE.ledWhite} distance={14} />
      ) : null}

      <CenterOrb />
      <ToolOrbit radius={isLow ? 3.8 : 4.8} onPick={onPick} picked={picked} />

      {/* Heavy decorative passes only fire on the high tier. Mobile keeps
          the orb + orbit + sparse particles and skips the rest. */}
      {!isLow ? (
        <>
          <ContactShadows position={[0, -2.0, 0]} opacity={0.4} blur={2.5} far={8} color="#000000" />
          <NeonStrip start={[-6, -1.95, 0]} end={[6, -1.95, 0]} color={PALETTE.neonCyan} thickness={0.022} />
          <VolumetricBeam position={[0, 3, 0]} height={5} bottomRadius={2.2} opacity={0.04} />
          <LensFlare position={[0, 0.4, -1.4]} color={PALETTE.neonMagenta} size={1.6} intensity={0.3} />
        </>
      ) : null}

      <ParticleStorm
        count={isLow ? 250 : 900}
        bounds={[14, 7, 14]}
        color={PALETTE.neonCyan}
        size={isLow ? 4 : 6}
        speed={0.14}
        behavior="drift"
        opacity={0.18}
      />

      <OrbitControls
        target={[0, 0.2, 0]}
        enablePan={false}
        enableZoom={false}
        autoRotate={!isLow}
        autoRotateSpeed={0.1}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.9}
        dampingFactor={0.09}
      />
    </>
  );
}

const STAT_CARDS: { label: string; value: string; sub?: string; color: string }[] = [
  { label: 'Experience', value: '5+ Years', color: 'text-cyan-300' },
  { label: 'Owns', value: 'Multi-tenant event SaaS', sub: 'Grails · ECS Fargate · Aurora', color: 'text-purple-300' },
  { label: 'Built', value: 'Cross-region DR', sub: 'Aurora Global · EFS · ECR', color: 'text-orange-300' },
  { label: 'Top Lang', value: 'Python', color: 'text-cyan-200' },
  { label: 'Building', value: 'AI Agents for DevOps', sub: 'self-learning projects', color: 'text-emerald-300' },
];

export default function Hero({ onEnter, active = true }: { onEnter?: () => void; active?: boolean }) {
  const [picked, setPicked] = useState<ToolId | null>(null);
  const tier = usePerfTier();
  const isLow = tier === 'low';
  const story = picked ? STORIES[picked] : null;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <Canvas
        camera={{ position: [0, 1.2, 8.5], fov: isLow ? 50 : 45 }}
        gl={{ antialias: !isLow, powerPreference: 'high-performance' }}
        dpr={isLow ? [1, 1] : [1, 1.75]}
        frameloop={active ? 'always' : 'never'}
      >
        <color attach="background" args={[PALETTE.voidA]} />
        <fog attach="fog" args={['#020617', 7, 22]} />
        <Suspense fallback={null}>
          <Scene onPick={setPicked} picked={picked} tier={tier} />
          {/* Mobile skips post-processing entirely. SMAA + Bloom + the
              full composer is the single most expensive thing in the
              scene on phones. */}
          {!isLow ? (
            <CinematicEffects
              bloomIntensity={0.6}
              bloomThreshold={0.6}
              chromaticAberration={0.0001}
            />
          ) : null}
        </Suspense>
      </Canvas>

      {/* Foreground HTML overlay. Name and stats live outside the
          Canvas so they're always crisp and always legible. */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h1 className="font-mono text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[0.08em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
            SAGAR BUDHATHOKI
          </h1>
          <div className="mt-3 font-mono text-sm sm:text-base tracking-[0.4em] text-cyan-300/90 uppercase">
            DevOps · SRE · AI Engineer
          </div>
          <div className="mt-2 font-mono text-[11px] tracking-[0.32em] text-slate-500 uppercase">
            click any tool below to see a real story behind it
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap gap-3 justify-center max-w-3xl"
        >
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              className="rounded border border-cyan-500/30 bg-slate-950/65 backdrop-blur-sm px-4 py-2 font-mono min-w-[150px]"
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">{s.label}</div>
              <div className={`text-base sm:text-lg ${s.color}`}>{s.value}</div>
              {s.sub ? (
                <div className="text-[10px] text-slate-500 mt-0.5 tracking-wide">{s.sub}</div>
              ) : null}
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap gap-3 justify-center pointer-events-auto"
        >
          <button
            onClick={onEnter}
            className="px-7 py-3 rounded-md font-mono text-xs sm:text-sm tracking-widest uppercase text-white bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 transition-colors shadow-lg shadow-cyan-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            See the work →
          </button>
          <a
            href="https://github.com/sbmagar13"
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-3 rounded-md font-mono text-xs sm:text-sm tracking-widest uppercase text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            GitHub
          </a>
          <a
            href="mailto:sagar@sagarbudhathoki.com"
            className="px-7 py-3 rounded-md font-mono text-xs sm:text-sm tracking-widest uppercase text-purple-300 border border-purple-500/40 hover:bg-purple-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Email
          </a>
          <a
            href="/terminal"
            className="px-7 py-3 rounded-md font-mono text-xs sm:text-sm tracking-widest uppercase text-slate-300 border border-slate-600/50 hover:bg-slate-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Terminal view
          </a>
        </motion.div>
      </div>

      {/* War-story panel. Opens whenever a tool is clicked in the
          orbit. Anchored bottom-right so it doesn't fight the title. */}
      <AnimatePresence>
        {story ? (
          <motion.aside
            key={picked}
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-30 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-lg p-5 sm:p-6 shadow-2xl shadow-cyan-500/15 pointer-events-auto bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-8 sm:right-6 sm:w-[400px] sm:max-w-[44vw]"
            role="dialog"
            aria-label={`Story: ${story.title}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-cyan-300 bg-cyan-500/10 border border-cyan-400/40 rounded px-2 py-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                  {story.tool}
                </div>
                <div className="mt-3 font-mono text-lg font-semibold text-white tracking-wide leading-snug">
                  {story.title}
                </div>
                <div className="mt-1 font-mono text-[11px] text-slate-400 tracking-wider">
                  {story.when}
                </div>
              </div>
              <button
                onClick={() => setPicked(null)}
                className="text-slate-400 hover:text-white font-mono text-base leading-none w-8 h-8 flex items-center justify-center rounded border border-slate-700 hover:border-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label="Close story"
              >
                ×
              </button>
            </div>
            <p className="mt-4 text-[14px] text-slate-200 leading-relaxed">{story.body}</p>
            <div className="mt-4 text-[10px] font-mono text-slate-500">
              Click another tool above to read its story.
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
