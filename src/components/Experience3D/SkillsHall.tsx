'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Float, Text, MeshReflectorMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { NeonStrip } from './Atmosphere';
import CinematicEffects from './Effects';
import LensFlare from './LensFlare';
import ParticleStorm from './ParticleStorm';
import SkillLogo, { hasCustomLogo, logoTint } from './SkillLogo';
import { PALETTE } from './Materials';

type Category =
  | 'infrastructure'
  | 'cicd'
  | 'cloud'
  | 'database'
  | 'monitoring'
  | 'development'
  | 'security'
  | 'ai-ml'
  | 'os'
  | 'misc';

interface SkillData {
  id: string;
  name: string;
  category: Category;
  years: number;
  highlight?: boolean;
  blurb?: string;
}

// Compact migration of the TechStack array — kept inline so this scene
// renders without a data-file dependency.
const SKILLS: SkillData[] = [
  { id: 'python', name: 'Python', category: 'development', years: 6, highlight: true, blurb: 'Default for tooling and services.' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'infrastructure', years: 3, highlight: true, blurb: 'Container orchestration.' },
  { id: 'docker', name: 'Docker', category: 'infrastructure', years: 4, highlight: true, blurb: 'Containers, multi-stage builds.' },
  { id: 'terraform', name: 'Terraform', category: 'infrastructure', years: 4, highlight: true, blurb: 'IaC. Modules, remote state.' },
  { id: 'aws', name: 'AWS', category: 'cloud', years: 4, highlight: true, blurb: 'Primary cloud. EC2 / S3 / RDS / IAM.' },
  { id: 'azure', name: 'Azure', category: 'cloud', years: 3, blurb: 'Microsoft cloud.' },
  { id: 'heroku', name: 'Heroku', category: 'cloud', years: 2, blurb: 'Quick PaaS deploys.' },
  { id: 'github-actions', name: 'GitHub Actions', category: 'cicd', years: 3, blurb: 'Workflows close to the code.' },
  { id: 'gitlab-ci', name: 'GitLab CI', category: 'cicd', years: 3, blurb: 'Pipelines in GitLab.' },
  { id: 'jenkins', name: 'Jenkins', category: 'cicd', years: 2, blurb: 'Legacy CI server.' },
  { id: 'aws-codepipeline', name: 'CodePipeline', category: 'cicd', years: 3, blurb: 'AWS-native release pipelines.' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'database', years: 4, blurb: 'Primary RDBMS.' },
  { id: 'aws-rds', name: 'AWS RDS', category: 'database', years: 3, blurb: 'Managed databases on AWS.' },
  { id: 'redis', name: 'Redis', category: 'database', years: 3, blurb: 'Cache and rate limits.' },
  { id: 'prometheus', name: 'Prometheus', category: 'monitoring', years: 3, blurb: 'Metrics, PromQL, alerts.' },
  { id: 'grafana', name: 'Grafana', category: 'monitoring', years: 3, blurb: 'Dashboards.' },
  { id: 'elk', name: 'ELK Stack', category: 'monitoring', years: 4, blurb: 'Logs at scale.' },
  { id: 'loki', name: 'Loki', category: 'monitoring', years: 2, blurb: 'Log aggregation.' },
  { id: 'ansible', name: 'Ansible', category: 'infrastructure', years: 4, blurb: 'Configuration management.' },
  { id: 'istio', name: 'Istio', category: 'infrastructure', years: 2, blurb: 'Service mesh.' },
  { id: 'nginx', name: 'nginx', category: 'infrastructure', years: 5, blurb: 'Reverse proxy & TLS.' },
  { id: 'dns', name: 'DNS / Route53', category: 'infrastructure', years: 5, blurb: 'DNS management.' },
  { id: 'cloudflare', name: 'Cloudflare', category: 'infrastructure', years: 3, blurb: 'CDN, edge, DDoS.' },
  { id: 'aws-iam', name: 'AWS IAM', category: 'security', years: 5, blurb: 'Identity & policies.' },
  { id: 'aws-waf', name: 'AWS WAF / Shield', category: 'security', years: 3, blurb: 'Edge firewall.' },
  { id: 'aws-guardduty', name: 'GuardDuty', category: 'security', years: 3, blurb: 'Threat detection.' },
  { id: 'openai', name: 'OpenAI API', category: 'ai-ml', years: 2, highlight: true, blurb: 'GPT-4 tooling.' },
  { id: 'langchain', name: 'LangChain', category: 'ai-ml', years: 1, blurb: 'LLM workflows.' },
  { id: 'pytorch', name: 'PyTorch', category: 'ai-ml', years: 2, blurb: 'Deep learning.' },
  { id: 'huggingface', name: 'Hugging Face', category: 'ai-ml', years: 1, blurb: 'NLP models.' },
  { id: 'mcp', name: 'MCP', category: 'ai-ml', years: 1, blurb: 'Model Context Protocol.' },
  { id: 'arch', name: 'Arch Linux', category: 'os', years: 5, highlight: true, blurb: 'Daily driver.' },
  { id: 'ubuntu', name: 'Ubuntu', category: 'os', years: 6, blurb: 'Server default.' },
  { id: 'centos', name: 'CentOS / Rocky', category: 'os', years: 4, blurb: 'RHEL family.' },
  { id: 'ffmpeg', name: 'FFmpeg', category: 'misc', years: 2, blurb: 'Video/audio pipelines.' },
];

const CATEGORY_COLORS: Record<Category, string> = {
  infrastructure: PALETTE.neonCyan,
  cicd: PALETTE.neonBlue,
  cloud: '#0ea5e9',
  database: PALETTE.ledGreen,
  monitoring: PALETTE.ledAmber,
  development: PALETTE.neonMagenta,
  security: PALETTE.ledRed,
  'ai-ml': PALETTE.neonPurple,
  os: PALETTE.ledWhite,
  misc: '#94a3b8',
};

// Each category gets a distinct geometric shape so the hall has visual
// rhythm without needing per-skill 3D models.
function CategoryShape({ category, color }: { category: Category; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
  });
  const material = (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={0.6}
      metalness={0.85}
      roughness={0.18}
      toneMapped={false}
    />
  );
  switch (category) {
    case 'infrastructure':
      return (
        <mesh ref={ref}>
          <boxGeometry args={[0.42, 0.42, 0.42]} />
          {material}
        </mesh>
      );
    case 'cicd':
      return (
        <mesh ref={ref}>
          <tetrahedronGeometry args={[0.32]} />
          {material}
        </mesh>
      );
    case 'cloud':
      return (
        <mesh ref={ref}>
          <sphereGeometry args={[0.28, 24, 24]} />
          {material}
        </mesh>
      );
    case 'database':
      return (
        <mesh ref={ref}>
          <cylinderGeometry args={[0.24, 0.24, 0.42, 24]} />
          {material}
        </mesh>
      );
    case 'monitoring':
      return (
        <mesh ref={ref}>
          <octahedronGeometry args={[0.32]} />
          {material}
        </mesh>
      );
    case 'development':
      return (
        <mesh ref={ref}>
          <torusKnotGeometry args={[0.18, 0.06, 64, 8]} />
          {material}
        </mesh>
      );
    case 'security':
      return (
        <mesh ref={ref}>
          <dodecahedronGeometry args={[0.3]} />
          {material}
        </mesh>
      );
    case 'ai-ml':
      return (
        <mesh ref={ref}>
          <icosahedronGeometry args={[0.32, 1]} />
          {material}
        </mesh>
      );
    case 'os':
      return (
        <mesh ref={ref}>
          <icosahedronGeometry args={[0.3, 0]} />
          {material}
        </mesh>
      );
    default:
      return (
        <mesh ref={ref}>
          <torusGeometry args={[0.22, 0.08, 12, 32]} />
          {material}
        </mesh>
      );
  }
}

interface PedestalProps {
  position: [number, number, number];
  skill: SkillData;
  highlighted: boolean;
  hovered: boolean;
  onHover: (h: boolean) => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}

function Pedestal({ position, skill, highlighted, hovered, onHover, onClick }: PedestalProps) {
  const hasLogo = hasCustomLogo(skill.id);
  const color = hasLogo ? logoTint(skill.id) : CATEGORY_COLORS[skill.category];
  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onHover(false);
        document.body.style.cursor = '';
      }}
    >
      {/* Pedestal base */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.42, 0.5, 0.18, 24]} />
        <meshStandardMaterial color={PALETTE.steelDark} metalness={0.7} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.36, 0.42, 0.06, 24]} />
        <meshStandardMaterial color={PALETTE.steel} metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Glow ring on top of pedestal */}
      <mesh position={[0, 0.155, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.36, 36]} />
        <meshBasicMaterial color={color} transparent opacity={highlighted || hovered ? 0.9 : 0.5} />
      </mesh>

      {/* Floating shape — custom 3D logo for highlight skills, generic
          category shape for the rest */}
      <Float speed={1.3} floatIntensity={0.25} rotationIntensity={hasLogo ? 0.25 : 0.6}>
        <group position={[0, 0.6, 0]} scale={highlighted ? 1.25 : hovered ? 1.12 : 1}>
          {hasLogo ? (
            <SkillLogo id={skill.id} scale={0.85} />
          ) : (
            <CategoryShape category={skill.category} color={color} />
          )}
        </group>
      </Float>

      {/* Name label */}
      <Text
        position={[0, -0.12, 0.51]}
        rotation={[0, 0, 0]}
        fontSize={0.13}
        color="#e2e8f0"
        anchorX="center"
        anchorY="middle"
        outlineColor="#000"
        outlineWidth={0.003}
      >
        {skill.name}
      </Text>
      <Text
        position={[0, -0.25, 0.51]}
        fontSize={0.06}
        color={color}
        anchorX="center"
        letterSpacing={0.18}
      >
        {`${skill.years}Y · ${skill.category.toUpperCase()}`}
      </Text>

      {/* Highlight star on the corner of the pedestal */}
      {skill.highlight ? (
        <mesh position={[0.32, 0.16, 0.3]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial
            color={PALETTE.ledWhite}
            emissive={PALETTE.ledWhite}
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function arrangeGrid(items: SkillData[], cols: number, spacing: number): [number, number, number][] {
  const rows = Math.ceil(items.length / cols);
  const xOff = -(cols - 1) * spacing * 0.5;
  const zOff = -(rows - 1) * spacing * 0.5;
  return items.map((_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return [xOff + col * spacing, 0, zOff + row * spacing] as [number, number, number];
  });
}

function Scene({
  onSelect,
  selectedId,
  hoveredId,
  setHovered,
}: {
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  hoveredId: string | null;
  setHovered: (id: string | null) => void;
}) {
  const positions = useMemo(() => arrangeGrid(SKILLS, 7, 1.4), []);

  return (
    <>
      <ambientLight intensity={0.18} color="#1e293b" />
      <pointLight position={[0, 8, 6]} intensity={1} color={PALETTE.ledWhite} distance={20} />
      <pointLight position={[-8, 4, -2]} intensity={0.8} color={PALETTE.neonMagenta} distance={20} />
      <pointLight position={[8, 4, -2]} intensity={0.8} color={PALETTE.neonCyan} distance={20} />

      {/* Reflective floor */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.4} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          blur={[200, 80]}
          resolution={1024}
          mixBlur={1}
          mixStrength={28}
          roughness={0.7}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#0f172a"
          metalness={0.6}
          mirror={0.35}
        />
      </mesh>

      {/* Pedestals */}
      {SKILLS.map((s, i) => (
        <Pedestal
          key={s.id}
          position={positions[i]}
          skill={s}
          highlighted={selectedId === s.id}
          hovered={hoveredId === s.id}
          onHover={(h) => setHovered(h ? s.id : null)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(selectedId === s.id ? null : s.id);
          }}
        />
      ))}

      {/* Aisle neon strips */}
      <NeonStrip start={[-6, -0.39, -3.6]} end={[6, -0.39, -3.6]} color={PALETTE.neonCyan} />
      <NeonStrip start={[-6, -0.39, 3.6]} end={[6, -0.39, 3.6]} color={PALETTE.neonMagenta} />

      <ParticleStorm
        count={1500}
        bounds={[12, 4, 12]}
        color={PALETTE.neonCyan}
        size={6}
        speed={0.3}
        behavior="drift"
        opacity={0.28}
      />

      {/* Lens flares at the hall's far corner lights — kept far and dim */}
      <LensFlare position={[-8, 4, -2]} color={PALETTE.neonMagenta} size={1.8} intensity={0.3} />
      <LensFlare position={[8, 4, -2]} color={PALETTE.neonCyan} size={1.8} intensity={0.3} />

      <OrbitControls
        target={[0, 0.5, 0]}
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={16}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={selectedId === null}
        autoRotateSpeed={0.2}
        dampingFactor={0.06}
      />
    </>
  );
}

export default function SkillsHall() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const selected = useMemo(() => SKILLS.find((s) => s.id === selectedId) ?? null, [selectedId]);

  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        shadows
        camera={{ position: [0, 4, 8], fov: 50 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.6]}
      >
        <color attach="background" args={[PALETTE.voidA]} />
        <fog attach="fog" args={['#020617', 8, 24]} />
        <Suspense fallback={null}>
          <Scene
            onSelect={setSelectedId}
            selectedId={selectedId}
            hoveredId={hoveredId}
            setHovered={setHoveredId}
          />
          <CinematicEffects
            bloomIntensity={0.55}
            bloomThreshold={0.55}
            bokehScale={1.3}
            chromaticAberration={0.0004}
            dof
          />
        </Suspense>
      </Canvas>

      {/* Heading */}
      <div className="pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 text-center">
        <div className="font-mono text-xs tracking-[0.4em] text-cyan-400/70 uppercase">
          Inventory
        </div>
        <div className="mt-1 font-mono text-2xl text-white/90">SKILLS HALL</div>
        <div className="mt-1 font-mono text-[10px] text-slate-400/70">
          {SKILLS.length} skills · category-coded by shape · click for details
        </div>
      </div>

      {/* Legend */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 space-y-1.5 pointer-events-none">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-2 text-[10px] font-mono">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
            <span className="text-slate-400 uppercase tracking-wider">{cat}</span>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected ? (
          <motion.aside
            key={selected.id}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 -translate-y-1/2 right-6 w-[340px] bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 rounded-lg p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div
                  className="font-mono text-[10px] tracking-[0.3em] uppercase"
                  style={{ color: CATEGORY_COLORS[selected.category] }}
                >
                  {selected.category}
                </div>
                <div className="mt-1 font-mono text-xl text-white">{selected.name}</div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                [×]
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded border border-cyan-500/20 bg-slate-900/60 px-3 py-2">
                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Years</div>
                <div className="font-mono text-lg text-cyan-300">{selected.years}</div>
              </div>
              <div className="rounded border border-cyan-500/20 bg-slate-900/60 px-3 py-2">
                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Highlight</div>
                <div className="font-mono text-lg text-cyan-300">{selected.highlight ? 'Yes' : '—'}</div>
              </div>
            </div>
            {selected.blurb ? (
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">{selected.blurb}</p>
            ) : null}
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
