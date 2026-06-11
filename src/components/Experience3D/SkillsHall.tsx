'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Float, MeshReflectorMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { NeonStrip } from './Atmosphere';
import ContextGuard from './ContextGuard';
import CinematicEffects from './Effects';
import LensFlare from './LensFlare';
import ParticleStorm from './ParticleStorm';
import SkillLogo, { hasCustomLogo, logoTint } from './SkillLogo';
import LabelPlate from './LabelPlate';
import Typewriter from './Typewriter';
import { usePerfTier } from './usePerfTier';
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

// Real skills inventory pulled from the Senior DevOps / SRE resume.
// Highlighted ones are where Sagar has owned production end to end.
const SKILLS: SkillData[] = [
  // Cloud and infrastructure (heavy AWS)
  { id: 'aws', name: 'AWS', category: 'cloud', years: 4, highlight: true, blurb: 'Sole owner of multi-tenant SaaS on AWS. 15+ services in production.' },
  { id: 'ecs-fargate', name: 'ECS Fargate', category: 'cloud', years: 3, highlight: true, blurb: 'Serverless container orchestration. EventLogic runs here.' },
  { id: 'lambda', name: 'AWS Lambda', category: 'cloud', years: 4, blurb: 'Serverless functions wired into pipelines and event flows.' },
  { id: 'aurora', name: 'Aurora PostgreSQL', category: 'database', years: 3, highlight: true, blurb: 'Schema-per-tenant, multi-region Global Database.' },
  { id: 'elasticache', name: 'ElastiCache (Redis)', category: 'database', years: 3, blurb: 'Managed Redis. Connection-pool tuning saved a 19-min outage.' },
  { id: 'amazon-mq', name: 'Amazon MQ', category: 'cloud', years: 2, blurb: 'Managed message broker for inter-service queues.' },
  { id: 'dynamodb', name: 'DynamoDB', category: 'database', years: 3, blurb: 'Tenant registry, key-value lookups, hot paths.' },
  { id: 'cloudfront', name: 'CloudFront', category: 'cloud', years: 4, blurb: 'CDN + edge for tenant distribution.' },
  { id: 's3', name: 'S3', category: 'cloud', years: 4, blurb: 'Object storage. Static assets, backups, logs.' },
  { id: 'api-gateway', name: 'API Gateway', category: 'cloud', years: 3, blurb: 'Managed API frontends for Lambda and ECS.' },
  { id: 'route53', name: 'Route 53', category: 'infrastructure', years: 4, blurb: 'DNS for multi-tenant routing.' },
  { id: 'vpc', name: 'VPC Networking', category: 'infrastructure', years: 4, blurb: 'Subnets, peering, endpoints, NAT, security groups.' },
  { id: 'efs', name: 'EFS', category: 'cloud', years: 2, blurb: 'Cross-region replication for stateful workloads.' },
  { id: 'ecr', name: 'ECR', category: 'cloud', years: 4, blurb: 'Container registry with cross-region replication.' },

  // IaC and configuration
  { id: 'terraform', name: 'Terraform', category: 'infrastructure', years: 4, highlight: true, blurb: 'Primary IaC. Modules, remote state, drift detection.' },
  { id: 'terragrunt', name: 'Terragrunt', category: 'infrastructure', years: 3, highlight: true, blurb: 'DRY Terraform across environments.' },
  { id: 'cloudformation', name: 'CloudFormation', category: 'infrastructure', years: 3, blurb: 'AWS-native IaC for legacy stacks.' },
  { id: 'cdk', name: 'AWS CDK', category: 'infrastructure', years: 2, blurb: 'Code-first IaC for AWS.' },
  { id: 'ansible', name: 'Ansible', category: 'infrastructure', years: 4, blurb: 'Config management. Split-restart playbooks for Elasticsearch.' },

  // Containers and orchestration
  { id: 'docker', name: 'Docker', category: 'infrastructure', years: 4, highlight: true, blurb: 'Multi-stage builds. Image hygiene. Daily driver.' },
  { id: 'kubernetes', name: 'Kubernetes (K3s)', category: 'infrastructure', years: 3, highlight: true, blurb: 'Self-hosted K3s in eu-central-1 for OneUptime.' },

  // CI/CD
  { id: 'gitlab-ci', name: 'GitLab CI', category: 'cicd', years: 4, highlight: true, blurb: 'Primary pipeline platform for app and infra deploys.' },
  { id: 'jenkins', name: 'Jenkins', category: 'cicd', years: 4, blurb: 'Long-running automation. ECS, Lambda, EC2 deploys.' },
  { id: 'aws-codepipeline', name: 'CodePipeline', category: 'cicd', years: 3, blurb: 'AWS-native release pipelines with CodeBuild.' },
  { id: 'github-actions', name: 'GitHub Actions', category: 'cicd', years: 3, blurb: 'Workflows close to the code.' },

  // Observability
  { id: 'prometheus', name: 'Prometheus', category: 'monitoring', years: 3, highlight: true, blurb: 'Metrics + PromQL + alerting.' },
  { id: 'grafana', name: 'Grafana', category: 'monitoring', years: 3, highlight: true, blurb: 'Dashboards across Prometheus, Loki, CloudWatch.' },
  { id: 'loki', name: 'Loki', category: 'monitoring', years: 2, blurb: 'Log aggregation. Dual-export target with OneUptime.' },
  { id: 'opentelemetry', name: 'OpenTelemetry', category: 'monitoring', years: 2, highlight: true, blurb: 'Unified collector. Dual-export to OneUptime + Loki.' },
  { id: 'cloudwatch', name: 'AWS CloudWatch', category: 'monitoring', years: 4, blurb: 'Metrics, logs, alarms, dashboards.' },
  { id: 'oneuptime', name: 'OneUptime', category: 'monitoring', years: 1, blurb: 'Self-hosted SRE platform. Status pages + on-call.' },
  { id: 'elk', name: 'ELK Stack', category: 'monitoring', years: 4, blurb: '3-node self-managed Elasticsearch cluster.' },
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'monitoring', years: 4, blurb: 'Self-managed cluster with split-restart safety.' },

  // Databases (continued)
  { id: 'postgresql', name: 'PostgreSQL', category: 'database', years: 4, blurb: 'EXPLAIN, indexes, replication.' },
  { id: 'redis', name: 'Redis', category: 'database', years: 3, blurb: 'Cache, rate limits, ephemeral state.' },

  // Security
  { id: 'aws-iam', name: 'AWS IAM', category: 'security', years: 4, highlight: true, blurb: 'Roles, fine-grained policies, cross-account.' },
  { id: 'kms', name: 'AWS KMS', category: 'security', years: 4, blurb: 'Shared KMS keys for cross-region DR.' },
  { id: 'secrets-manager', name: 'Secrets Manager', category: 'security', years: 3, blurb: 'Rotation, secure injection into ECS.' },
  { id: 'aws-inspector', name: 'AWS Inspector', category: 'security', years: 2, blurb: 'Continuous vulnerability scanning.' },
  { id: 'cloudtrail', name: 'CloudTrail', category: 'security', years: 4, blurb: 'API audit trail. Multi-account aggregation.' },
  { id: 'openvpn', name: 'OpenVPN', category: 'security', years: 3, blurb: 'Production access. User and route management.' },

  // Programming
  { id: 'python', name: 'Python', category: 'development', years: 5, highlight: true, blurb: 'FastAPI, Django, Flask. Tenant orchestrator. Default tool.' },
  { id: 'fastapi', name: 'FastAPI', category: 'development', years: 3, blurb: 'Typed async APIs.' },
  { id: 'django', name: 'Django', category: 'development', years: 3, blurb: 'Admin-heavy CRUD services.' },
  { id: 'flask', name: 'Flask', category: 'development', years: 3, blurb: 'Small standalone services.' },
  { id: 'bash', name: 'Bash', category: 'development', years: 5, blurb: 'Shell scripting, deploy automation, runbooks.' },
  { id: 'javascript', name: 'JavaScript', category: 'development', years: 4, blurb: 'Light frontend, Node tooling, infra glue.' },

  // AI/ML and tooling
  { id: 'mcp', name: 'Anthropic MCP', category: 'ai-ml', years: 1, highlight: true, blurb: 'Built Hashnode MCP server. Tool integration for Claude.' },
  { id: 'langgraph', name: 'LangGraph', category: 'ai-ml', years: 1, blurb: 'Agent orchestration graphs.' },
  { id: 'langchain', name: 'LangChain', category: 'ai-ml', years: 1, blurb: 'LLM-powered workflows.' },
  { id: 'local-llm', name: 'Local LLM Inference', category: 'ai-ml', years: 1, blurb: 'Self-hosted models for private inference.' },
  { id: 'pytorch', name: 'PyTorch', category: 'ai-ml', years: 2, blurb: 'VQGAN + CLIP. Deep learning prototypes.' },
  { id: 'rasa', name: 'RASA', category: 'ai-ml', years: 2, blurb: 'Conversational AI / NLP chatbots.' },

  // Data pipelines
  { id: 'airflow', name: 'Apache Airflow', category: 'misc', years: 2, blurb: 'DAG-based scheduling.' },
  { id: 'airbyte', name: 'Airbyte', category: 'misc', years: 1, blurb: 'ELT connectors.' },
  { id: 'celery', name: 'Celery + RabbitMQ', category: 'misc', years: 3, blurb: 'Async task processing.' },
  { id: 'ffmpeg', name: 'FFmpeg', category: 'misc', years: 2, blurb: 'RTSP / NVR / video pipelines.' },

  // OS
  { id: 'arch', name: 'Arch Linux', category: 'os', years: 5, highlight: true, blurb: 'Daily driver. KISS. Rolling release.' },
  { id: 'ubuntu', name: 'Ubuntu', category: 'os', years: 6, blurb: 'Production servers, default base image.' },
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
  isLow: boolean;
  onHover: (h: boolean) => void;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}

function Pedestal({ position, skill, highlighted, hovered, isLow, onHover, onClick }: PedestalProps) {
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

      {/* Floating shape, custom 3D logo for highlight skills, generic
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

      {/* Name label, billboarded so it always faces the camera as you
          orbit the hall, with a dark plate behind for legibility. Bigger
          text now so the info is readable across the whole hall. On the
          low tier the years/category subline is dropped (every subline
          is its own troika Text draw, and there are dozens of pedestals);
          the selected pedestal keeps its full label so the detail you
          asked for stays labeled. */}
      <LabelPlate
        position={[0, -0.2, 0.55]}
        text={skill.name}
        subtext={
          isLow && !highlighted ? undefined : `${skill.years}Y · ${skill.category.toUpperCase()}`
        }
        size={0.17}
        subSize={0.08}
        color="#f1f5f9"
        subColor={color}
        billboard
        plate
        plateOpacity={0.9}
        padding={[0.18, 0.1]}
        border={highlighted || hovered}
        borderColor={color}
      />

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
  skills,
  onSelect,
  selectedId,
  hoveredId,
  setHovered,
  isLow,
}: {
  skills: SkillData[];
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  hoveredId: string | null;
  setHovered: (id: string | null) => void;
  isLow: boolean;
}) {
  const positions = useMemo(() => arrangeGrid(skills, 8, 1.85), [skills]);

  return (
    <>
      <ambientLight intensity={0.18} color="#1e293b" />
      <pointLight position={[0, 8, 6]} intensity={1} color={PALETTE.ledWhite} distance={20} />
      <pointLight position={[-8, 4, -2]} intensity={0.8} color={PALETTE.neonMagenta} distance={20} />
      <pointLight position={[8, 4, -2]} intensity={0.8} color={PALETTE.neonCyan} distance={20} />

      {/* Reflective floor. On low tier, fall back to a plain matte floor;
          MeshReflectorMaterial re-renders the whole hall from below into
          a texture every frame and that second pass over every pedestal
          is the single most expensive thing here. */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.4} receiveShadow={!isLow}>
        <planeGeometry args={[40, 40]} />
        {isLow ? (
          <meshStandardMaterial color="#0a1224" metalness={0.5} roughness={0.6} />
        ) : (
          <MeshReflectorMaterial
            blur={[100, 30]}
            resolution={1024}
            mixBlur={0.5}
            mixStrength={22}
            roughness={0.5}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
            color="#0f172a"
            metalness={0.78}
            mirror={0.5}
          />
        )}
      </mesh>

      {/* Pedestals */}
      {skills.map((s, i) => (
        <Pedestal
          key={s.id}
          position={positions[i]}
          skill={s}
          highlighted={selectedId === s.id}
          hovered={hoveredId === s.id}
          isLow={isLow}
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
        count={isLow ? 350 : 1500}
        bounds={[12, 4, 12]}
        color={PALETTE.neonCyan}
        size={6}
        speed={0.18}
        behavior="drift"
        opacity={0.28}
      />

      {/* Lens flares at the hall's far corner lights, kept far and dim */}
      <LensFlare position={[-8, 4, -2]} color={PALETTE.neonMagenta} size={1.8} intensity={0.3} />
      <LensFlare position={[8, 4, -2]} color={PALETTE.neonCyan} size={1.8} intensity={0.3} />

      <OrbitControls
        target={[0, 0.5, 0]}
        enablePan={false}
        enableZoom
        minDistance={6}
        maxDistance={22}
        minPolarAngle={Math.PI / 7}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={selectedId === null}
        autoRotateSpeed={0.12}
        dampingFactor={0.085}
      />
    </>
  );
}

export default function SkillsHall({ active = true }: { active?: boolean } = {}) {
  const tier = usePerfTier();
  const isLow = tier === 'low';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  // Bumped when the WebGL context dies and never restores; keying the
  // Canvas on it tears the renderer down and rebuilds from scratch.
  const [glGen, setGlGen] = useState(0);
  const selected = useMemo(() => SKILLS.find((s) => s.id === selectedId) ?? null, [selectedId]);
  const visibleSkills = useMemo(
    () => (filter === 'all' ? SKILLS : SKILLS.filter((s) => s.category === filter)),
    [filter]
  );

  // Switching filters can hide the pedestal that was selected or hovered;
  // clear that state so the detail panel and cursor don't go stale.
  const applyFilter = (next: Category | 'all') => {
    setFilter(next);
    if (selected && next !== 'all' && selected.category !== next) setSelectedId(null);
    setHoveredId(null);
    document.body.style.cursor = '';
  };

  // Leaving the scene clears the selection and any mid-hover cursor so
  // a hidden hall never holds a stale detail panel (or leaves the body
  // cursor stuck on pointer) when the visitor comes back.
  useEffect(() => {
    if (active) return;
    setSelectedId(null);
    setHoveredId(null);
    document.body.style.cursor = '';
  }, [active]);

  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        key={glGen}
        shadows={!isLow}
        camera={{ position: [0, 5.5, 12], fov: 52 }}
        gl={{ antialias: !isLow, powerPreference: 'high-performance' }}
        dpr={isLow ? [1, 1] : [1, 1.75]}
        frameloop={active ? 'always' : 'never'}
      >
        <ContextGuard onLost={() => setGlGen((g) => g + 1)} />
        <color attach="background" args={[PALETTE.voidA]} />
        <fog attach="fog" args={['#020617', 8, 24]} />
        <Suspense fallback={null}>
          <Scene
            skills={visibleSkills}
            onSelect={setSelectedId}
            selectedId={selectedId}
            hoveredId={hoveredId}
            setHovered={setHoveredId}
            isLow={isLow}
          />
          {!isLow ? (
            <CinematicEffects
              bloomIntensity={0.55}
              bloomThreshold={0.55}
              chromaticAberration={0.00015}
            />
          ) : null}
        </Suspense>
      </Canvas>

      {/* Heading */}
      <div className="hidden sm:block pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 text-center px-6 py-3 rounded-md bg-slate-950/65 sm:bg-slate-950/45 sm:backdrop-blur-sm border border-cyan-500/20">
        <div className="font-mono text-[11px] tracking-[0.32em] text-cyan-300 uppercase">
          Inventory
        </div>
        <div className="mt-1.5 font-mono text-3xl font-semibold text-white tracking-wider">
          <Typewriter text="SKILLS HALL" speed={60} caret />
        </div>
        <div className="mt-1.5 font-mono text-xs text-slate-300">
          {SKILLS.length} skills · category-coded by shape · click for details
        </div>
      </div>

      {/* Legend, doubles as a category filter. Picking a category renders
          only those pedestals, which is also a cheap perf lever on low
          tier. ALL restores the full hall. Buttons carry real padding
          (not just the 10px swatch) so they are tappable on touch
          screens and a miss does not fall through to OrbitControls. */}
      <div className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 space-y-0.5">
        <button
          type="button"
          onClick={() => applyFilter('all')}
          aria-pressed={filter === 'all'}
          className="flex items-center gap-2 text-[10px] font-mono px-2 py-1.5 -mx-2 min-h-[28px] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <div
            className="w-2.5 h-2.5 rounded-sm"
            style={{ background: PALETTE.ledWhite, boxShadow: `0 0 8px ${PALETTE.ledWhite}` }}
          />
          <span
            className={`uppercase tracking-wider transition-colors ${
              filter === 'all' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            all
          </span>
        </button>
        {(Object.entries(CATEGORY_COLORS) as [Category, string][]).map(([cat, color]) => (
          <button
            key={cat}
            type="button"
            onClick={() => applyFilter(cat)}
            aria-pressed={filter === cat}
            className="flex items-center gap-2 text-[10px] font-mono px-2 py-1.5 -mx-2 min-h-[28px] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
            <span
              className={`uppercase tracking-wider transition-colors ${
                filter === cat ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </span>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected ? (
          <motion.aside
            key={selected.id}
            initial={{ x: 60, opacity: 0, scale: 0.96 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 60, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 -translate-y-1/2 right-6 w-[380px] bg-slate-950/95 sm:bg-slate-950/92 sm:backdrop-blur-xl border border-cyan-500/40 rounded-lg p-6 shadow-2xl shadow-cyan-500/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div
                  className="inline-block font-mono text-[11px] tracking-[0.3em] uppercase border rounded px-2 py-1"
                  style={{
                    color: CATEGORY_COLORS[selected.category],
                    borderColor: `${CATEGORY_COLORS[selected.category]}66`,
                    background: `${CATEGORY_COLORS[selected.category]}10`,
                  }}
                >
                  {selected.category}
                </div>
                <div className="mt-3 font-mono text-2xl font-semibold text-white">{selected.name}</div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="text-slate-400 hover:text-white font-mono text-base w-8 h-8 flex items-center justify-center rounded border border-slate-700 hover:border-slate-500 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-md border border-cyan-500/25 bg-slate-900/70 px-3.5 py-2.5">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Years</div>
                <div className="mt-0.5 font-mono text-xl font-semibold text-cyan-200">{selected.years}</div>
              </div>
              {/* Only owned-in-production skills carry the highlight flag;
                  skip the card entirely for the rest. */}
              {selected.highlight ? (
                <div className="rounded-md border border-cyan-500/25 bg-slate-900/70 px-3.5 py-2.5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Highlight</div>
                  <div className="mt-0.5 font-mono text-xl font-semibold text-cyan-200">Yes</div>
                </div>
              ) : null}
            </div>
            {selected.blurb ? (
              <p className="mt-4 text-[15px] text-slate-200 leading-relaxed">{selected.blurb}</p>
            ) : null}
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
