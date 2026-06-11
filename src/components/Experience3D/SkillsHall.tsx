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
// Career facts live in one place; this scene only renders them.
import { SKILLS, CATEGORY_COLORS, type Category, type SkillData } from '@/data/career';

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

// ---------------------------------------------------------------------------
// Layout: category islands on a ring, column height by years
// ---------------------------------------------------------------------------

// Floor plane height. Columns grow up from here so height-by-years reads
// against a common baseline instead of floating.
const FLOOR_Y = -0.4;

// Pedestal-to-pedestal spacing inside an island. Matches the old grid
// spacing so the billboarded labels keep the same breathing room.
const SKILL_SPACING = 1.85;
// Clearance between an island's outermost pedestal and its floor ring.
const ISLAND_MARGIN = 0.8;
// Floor gap between neighbouring island rings along the hall ring.
const ISLAND_GAP = 0.5;

// Column height from years of experience: 1 year => 0.5, 6 years => 1.6.
// Taller pedestal = more years; the logo rides on top.
function heightForYears(years: number): number {
  const t = (Math.min(6, Math.max(1, years)) - 1) / 5;
  return 0.5 + t * 1.1;
}

interface Island {
  category: Category;
  color: string;
  /** x/z of the island centre on the floor. */
  center: [number, number];
  /** Radius of the island's floor ring. */
  radius: number;
  /** Height of the island label, clears the tallest column + its label. */
  labelY: number;
  skills: SkillData[];
  /** World position per skill, same order as `skills`. */
  positions: [number, number, number][];
}

// Compact disc arrangement for one island: up to six skills sit on a
// single ring, larger islands put one pedestal in the middle and ring
// the rest. Chord math keeps neighbours at least SKILL_SPACING apart so
// labels stay clear. `phase` staggers each island's ring start so the
// hall doesn't read as copy-pasted clusters.
function arrangeDisc(count: number, phase: number): { points: [number, number][]; radius: number } {
  if (count === 1) return { points: [[0, 0]], radius: 1.3 };
  if (count === 2) {
    const x = Math.cos(phase) * 0.95;
    const z = Math.sin(phase) * 0.95;
    return { points: [[x, z], [-x, -z]], radius: 0.95 + ISLAND_MARGIN };
  }
  const hasCenter = count > 6;
  const ringCount = hasCenter ? count - 1 : count;
  const r = Math.max(1.35, SKILL_SPACING / (2 * Math.sin(Math.PI / ringCount)));
  const points: [number, number][] = hasCenter ? [[0, 0]] : [];
  for (let i = 0; i < ringCount; i++) {
    const a = (i / ringCount) * Math.PI * 2 + phase;
    points.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return { points, radius: r + ISLAND_MARGIN };
}

// Group skills into category islands and arrange the islands around the
// hall. The biggest island (cloud/infra territory) sits front centre
// toward the default camera, the rest alternate left/right so size
// tapers around the ring. A single-category filter collapses to one
// island recentred at the origin, which is the existing recenter
// behavior the legend filter already had.
function buildIslands(skills: SkillData[]): Island[] {
  const order = Object.keys(CATEGORY_COLORS) as Category[];
  const groups = order
    .map((category) => ({ category, members: skills.filter((s) => s.category === category) }))
    .filter((g) => g.members.length > 0)
    .sort((a, b) => b.members.length - a.members.length);

  const islands: Island[] = groups.map((g, i) => {
    const disc = arrangeDisc(g.members.length, i * 0.8);
    const maxH = g.members.reduce((m, s) => Math.max(m, heightForYears(s.years)), 0);
    return {
      category: g.category,
      color: CATEGORY_COLORS[g.category],
      center: [0, 0],
      radius: disc.radius,
      labelY: FLOOR_Y + maxH + 2.1,
      skills: g.members,
      positions: disc.points.map(([x, z]) => [x, 0, z] as [number, number, number]),
    };
  });

  if (islands.length > 1) {
    // Ring order: biggest in the middle, then alternate sides so the
    // neighbours of the front island are the next-biggest clusters.
    const ringOrder: Island[] = [];
    islands.forEach((isl, i) => {
      if (i % 2 === 0) ringOrder.push(isl);
      else ringOrder.unshift(isl);
    });
    // Each island claims an arc proportional to its footprint; the ring
    // radius is whatever circumference fits them all.
    const arcs = ringOrder.map((isl) => isl.radius * 2 + ISLAND_GAP);
    const total = arcs.reduce((a, b) => a + b, 0);
    const ringR = total / (2 * Math.PI);
    let acc = 0;
    const angles = arcs.map((arc) => {
      const mid = acc + arc / 2;
      acc += arc;
      return (mid / total) * Math.PI * 2;
    });
    // Rotate the ring so the biggest island faces +z (the camera side).
    const shift = Math.PI / 2 - angles[ringOrder.indexOf(islands[0])];
    ringOrder.forEach((isl, i) => {
      const a = angles[i] + shift;
      isl.center = [Math.cos(a) * ringR, Math.sin(a) * ringR];
    });
  }

  for (const isl of islands) {
    isl.positions = isl.positions.map(([x, y, z]) => [x + isl.center[0], y, z + isl.center[1]]);
  }
  return islands;
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
  const h = heightForYears(skill.years);
  const topY = FLOOR_Y + h;
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
      {/* Column, grounded on the floor. Height encodes years. */}
      <mesh position={[0, FLOOR_Y + h / 2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.42, 0.5, h, 24]} />
        <meshStandardMaterial color={PALETTE.steelDark} metalness={0.7} roughness={0.5} />
      </mesh>
      <mesh position={[0, topY + 0.03, 0]}>
        <cylinderGeometry args={[0.36, 0.42, 0.06, 24]} />
        <meshStandardMaterial color={PALETTE.steel} metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Glow ring on top of the column, facing up */}
      <mesh position={[0, topY + 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.36, 36]} />
        <meshBasicMaterial color={color} transparent opacity={highlighted || hovered ? 0.9 : 0.5} />
      </mesh>

      {/* Floating shape, custom 3D logo for highlight skills, generic
          category shape for the rest */}
      <Float speed={1.3} floatIntensity={0.25} rotationIntensity={hasLogo ? 0.25 : 0.6}>
        <group position={[0, topY + 0.62, 0]} scale={highlighted ? 1.25 : hovered ? 1.12 : 1}>
          {hasLogo ? (
            <SkillLogo id={skill.id} scale={0.85} />
          ) : (
            <CategoryShape category={skill.category} color={color} />
          )}
        </group>
      </Float>

      {/* Name label, billboarded so it always faces the camera as you
          orbit the hall. It rides above the logo so a tall column never
          hides its own label, and the label altitude itself tracks the
          years encoding. The category moved to the island label, so the
          subline is just the years. On the low tier the subline is
          dropped (every subline is its own troika Text draw, and there
          are dozens of pedestals); the selected pedestal keeps its full
          label so the detail you asked for stays labeled. */}
      <LabelPlate
        position={[0, topY + 1.42, 0]}
        text={skill.name}
        subtext={isLow && !highlighted ? undefined : `${skill.years}Y`}
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

      {/* Highlight star on the rim of the column cap */}
      {skill.highlight ? (
        <mesh position={[0.32, topY + 0.05, 0.3]}>
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
  const islands = useMemo(() => buildIslands(skills), [skills]);

  return (
    <>
      <ambientLight intensity={0.18} color="#1e293b" />
      <pointLight position={[0, 8, 6]} intensity={1} color={PALETTE.ledWhite} distance={26} />
      <pointLight position={[-8, 4, -2]} intensity={0.8} color={PALETTE.neonMagenta} distance={26} />
      <pointLight position={[8, 4, -2]} intensity={0.8} color={PALETTE.neonCyan} distance={26} />

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

      {/* Category islands: one floor ring + one label per island, then
          that island's pedestals. The ring and label are a handful of
          cheap static draws per category, and the island label stays on
          even on the low tier because there are only ~10 of them; the
          per-pedestal sublabels are what get thinned there. */}
      {islands.map((isl) => (
        <group key={isl.category}>
          <mesh rotation-x={-Math.PI / 2} position={[isl.center[0], FLOOR_Y + 0.01, isl.center[1]]}>
            <ringGeometry args={[isl.radius - 0.09, isl.radius, 48]} />
            <meshBasicMaterial
              color={isl.color}
              transparent
              opacity={0.38}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <LabelPlate
            position={[isl.center[0], isl.labelY, isl.center[1]]}
            text={isl.category.toUpperCase()}
            size={0.26}
            color={isl.color}
            letterSpacing={0.12}
            billboard
            plate
            plateOpacity={0.82}
            padding={[0.24, 0.13]}
          />
          {isl.skills.map((s, i) => (
            <Pedestal
              key={s.id}
              position={isl.positions[i]}
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
        </group>
      ))}

      {/* Plaza cross at the hall centre; the islands ring around it */}
      <NeonStrip start={[-4.6, -0.39, 0]} end={[4.6, -0.39, 0]} color={PALETTE.neonCyan} />
      <NeonStrip start={[0, -0.39, -4.6]} end={[0, -0.39, 4.6]} color={PALETTE.neonMagenta} />

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
        target={[0, 0.6, 0]}
        enablePan={false}
        enableZoom
        minDistance={6}
        maxDistance={26}
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
        camera={{ position: [0, 7, 15], fov: 52 }}
        gl={{ antialias: !isLow, powerPreference: 'high-performance' }}
        dpr={isLow ? [1, 1] : [1, 1.75]}
        frameloop={active ? 'always' : 'never'}
      >
        <ContextGuard onLost={() => setGlGen((g) => g + 1)} />
        <color attach="background" args={[PALETTE.voidA]} />
        <fog attach="fog" args={['#020617', 10, 34]} />
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
          {SKILLS.length} skills · islands by category · taller = more years · click for details
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
            className="absolute top-1/2 -translate-y-1/2 right-6 w-[380px] bg-slate-950/95 sm:bg-slate-950/92 sm:backdrop-blur-xl border border-cyan-500/40 rounded-lg p-5 sm:p-6 shadow-2xl shadow-cyan-500/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div
                  className="inline-block font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase border rounded px-2 py-1"
                  style={{
                    color: CATEGORY_COLORS[selected.category],
                    borderColor: `${CATEGORY_COLORS[selected.category]}66`,
                    background: `${CATEGORY_COLORS[selected.category]}10`,
                  }}
                >
                  {selected.category}
                </div>
                <div className="mt-3 font-mono text-xl sm:text-2xl font-semibold text-white">{selected.name}</div>
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
                <div className="mt-0.5 font-mono text-lg sm:text-xl font-semibold text-cyan-200">{selected.years}</div>
              </div>
              {/* Only owned-in-production skills carry the highlight flag;
                  skip the card entirely for the rest. */}
              {selected.highlight ? (
                <div className="rounded-md border border-cyan-500/25 bg-slate-900/70 px-3.5 py-2.5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Highlight</div>
                  <div className="mt-0.5 font-mono text-lg sm:text-xl font-semibold text-cyan-200">Yes</div>
                </div>
              ) : null}
            </div>
            {selected.blurb ? (
              <p className="mt-4 text-[14px] sm:text-[15px] text-slate-200 leading-relaxed">{selected.blurb}</p>
            ) : null}
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
