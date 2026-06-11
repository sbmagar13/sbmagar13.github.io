'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import HoloPlate from './HoloPlate';
import HoloProjector from './HoloProjector';
import CinematicEffects from './Effects';
import LensFlare from './LensFlare';
import ParticleStorm from './ParticleStorm';
import LabelPlate from './LabelPlate';
import Typewriter from './Typewriter';
import useMouseParallax from './useMouseParallax';
import { usePerfTier } from './usePerfTier';
import { PALETTE } from './Materials';

// Particles that rise through the projection beam.
function RisingMotes({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * 0.9;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3 + 0] = Math.cos(theta) * r;
      positions[i * 3 + 1] = -1.8 + Math.random() * 4;
      positions[i * 3 + 2] = Math.sin(theta) * r;
      phases[i] = Math.random() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + 0.012;
      if (y > 2.4) y = -1.8;
      pos.setY(i, y);
      const phase = (ref.current.geometry.attributes.phase as THREE.BufferAttribute).getX(i);
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.5 + phase) * 0.0005);
      pos.setZ(i, pos.getZ(i) + Math.cos(t * 0.5 + phase) * 0.0005);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color={PALETTE.neonCyan}
        size={0.025}
        sizeAttenuation
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Stat panel data. Each chip is a specific fact from the resume so the
// page reads as Sagar's actual story rather than a template. `detail`
// is what the DOM overlay shows on click; it only expands on what the
// chip itself claims, no new facts.
interface Stat {
  id: string;
  label: string;
  value: string;
  color: string;
  position: [number, number, number];
  detail: string;
}

const STATS: Stat[] = [
  {
    id: 'role',
    label: 'Role',
    value: 'Senior DevOps · SRE',
    color: PALETTE.neonCyan,
    position: [2.3, 1.4, 0.2],
    detail:
      'Senior DevOps / SRE Engineer, the same title the identity card above carries. Platform operations and reliability are the day job, not a side interest.',
  },
  {
    id: 'specialty',
    label: 'Specialty',
    value: 'Sole platform owner',
    color: PALETTE.neonMagenta,
    position: [2.4, 0.3, 0.4],
    detail:
      'One person owns the production platform end to end, rather than one seat on a larger infra team. Build it, run it, fix it.',
  },
  {
    id: 'built',
    label: 'Built',
    value: 'Cross-region DR',
    color: PALETTE.neonPurple,
    position: [2.2, -0.7, 0.1],
    detail:
      'Built disaster recovery across two regions, so the platform has somewhere real to fail over to when the primary region goes down.',
  },
  {
    id: 'forte',
    label: 'Forte',
    value: 'Python + AI Agents',
    color: PALETTE.neonCyan,
    position: [-2.3, 1.4, 0.2],
    detail:
      'Python is the primary language, and AI agents are where it gets pointed lately. The forte is the overlap: agents written in Python that do useful work.',
  },
  {
    id: 'lately',
    label: 'Lately',
    value: 'AI agents for DevOps',
    color: PALETTE.neonMagenta,
    position: [-2.4, 0.3, 0.4],
    detail:
      'Recent focus is bringing AI agents into DevOps work itself: agents that handle real operational tasks, not chat demos.',
  },
  {
    id: 'based',
    label: 'Based in',
    value: 'Kathmandu · remote',
    color: PALETTE.neonPurple,
    position: [-2.2, -0.7, 0.1],
    detail:
      'Based in Kathmandu, Nepal, and set up to work remote, same as the identity card says. Open to remote roles.',
  },
];

// Floating info chips around the avatar. Uses LabelPlate so the text
// reads clearly against the holographic glow. Clickable: each opens a
// DOM detail overlay, with the same hover cursor the Hero orbit uses.
function StatPanel({
  position,
  label,
  value,
  color,
  onClick,
}: {
  position: [number, number, number];
  label: string;
  value: string;
  color: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Float speed={1.1} floatIntensity={0.2} rotationIntensity={0.1}>
      <group
        position={position}
        scale={hovered ? 1.08 : 1}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = '';
        }}
      >
        <LabelPlate
          text={value}
          subtext={label.toUpperCase()}
          size={0.16}
          subSize={0.06}
          color={color}
          subColor="#cbd5e1"
          billboard
          plate
          plateOpacity={0.88}
          padding={[0.14, 0.08]}
          border
          borderColor={color}
        />
      </group>
    </Float>
  );
}

function PlateWithParallax({ imageUrl }: { imageUrl: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useMouseParallax();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Tilt toward the cursor with frame-rate independent damping so it
    // feels equally smooth at 60 and 120 fps.
    const targetRotY = mouse.current.x * 0.28;
    const targetRotX = mouse.current.y * -0.16;
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 4.5, delta);
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 4.5, delta);
    // Slight breathing on top of the parallax.
    groupRef.current.position.y =
      1.05 + Math.sin(state.clock.elapsedTime * 0.7) * 0.025;
  });

  return (
    <group ref={groupRef} position={[0, 1.05, 0]}>
      <HoloPlate
        imageUrl={imageUrl}
        position={[0, 0, 0]}
        size={[2.4, 3.0]}
        tint={PALETTE.neonCyan}
        opacity={0.95}
      />
    </group>
  );
}

function Scene({
  imageUrl,
  isLow,
  onPickStat,
}: {
  imageUrl: string;
  isLow: boolean;
  onPickStat: (id: string) => void;
}) {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.18} color="#1e293b" />
      <pointLight position={[3, 4, 4]} intensity={1.4} color={PALETTE.neonCyan} distance={14} />
      <pointLight position={[-4, 2, -3]} intensity={1.1} color={PALETTE.neonMagenta} distance={14} />
      <pointLight position={[0, -2, 4]} intensity={0.7} color={PALETTE.neonPurple} distance={10} />

      {/* One small, off-axis flare so it doesn't blow out the face. The
          second light source is intentionally not flared, too much
          additive bloom around the photo washes it out. */}
      <LensFlare position={[6, 3.5, 4]} color={PALETTE.neonCyan} size={1.6} intensity={0.4} pulse={false} />

      {/* The photo as a holographic plate (with cursor parallax) */}
      <PlateWithParallax imageUrl={imageUrl} />

      {/* Projector base */}
      <HoloProjector position={[0, -1.7, 0]} beamHeight={4.2} beamColor={PALETTE.neonCyan} />

      {/* Particles in the beam. CPU-animated (per-mote position writes
          every frame), so the low tier skips them entirely. */}
      {!isLow ? <RisingMotes count={300} /> : null}

      {/* Floor reflection plate (subtle) */}
      <ContactShadows
        position={[0, -1.85, 0]}
        opacity={0.55}
        blur={2.4}
        far={5}
        color="#0ea5e9"
      />

      {/* Stat panels. Click one to open its detail overlay. */}
      {STATS.map((s) => (
        <StatPanel
          key={s.id}
          position={s.position}
          label={s.label}
          value={s.value}
          color={s.color}
          onClick={() => onPickStat(s.id)}
        />
      ))}

      {/* Atmospheric dust at distance */}
      {/* Background atmosphere only, kept distant and dim so it doesn't
          fight with the photo for attention. No close-in orbital particles.
          Thinned out further on the low tier. */}
      <ParticleStorm
        count={isLow ? 300 : 1200}
        bounds={[12, 5, 12]}
        color={PALETTE.neonCyan}
        size={5}
        speed={0.25}
        behavior="drift"
        opacity={0.25}
      />

      <OrbitControls
        target={[0, 0.5, 0]}
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={12}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate
        autoRotateSpeed={0.18}
        dampingFactor={0.085}
      />
    </>
  );
}

export default function Avatar({
  imageUrl = '/sagar-mountains.jpg',
  active = true,
}: {
  imageUrl?: string;
  active?: boolean;
}) {
  const tier = usePerfTier();
  const isLow = tier === 'low';
  const [pickedStat, setPickedStat] = useState<string | null>(null);
  const stat = pickedStat ? STATS.find((s) => s.id === pickedStat) ?? null : null;
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // The overlay opens from a raycast click on the WebGL canvas, which
  // leaves document focus on <body>. Move it to the close button so
  // the dialog is announced and Tab lands somewhere sensible.
  useEffect(() => {
    if (pickedStat) closeBtnRef.current?.focus();
  }, [pickedStat]);

  // Escape closes the stat overlay. Capture phase + stopPropagation so
  // the page-level Escape handler (which jumps the whole app back to
  // the Hero) never sees the keypress while the overlay is open. Gated
  // on active too: on desktop this scene stays mounted after you leave
  // it, and a hidden scene's listener must not swallow Escapes meant
  // for the page.
  useEffect(() => {
    if (!pickedStat || !active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setPickedStat(null);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [pickedStat, active]);

  // Leaving the scene closes any open overlay so it never lingers
  // invisibly on a hidden scene.
  useEffect(() => {
    if (!active) setPickedStat(null);
  }, [active]);

  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        camera={{ position: [0, 1.5, 7], fov: 42 }}
        gl={{ antialias: !isLow, powerPreference: 'high-performance' }}
        dpr={isLow ? [1, 1] : [1, 1.75]}
        frameloop={active ? 'always' : 'never'}
      >
        <color attach="background" args={[PALETTE.voidA]} />
        <fog attach="fog" args={['#020617', 6, 18]} />
        <Suspense fallback={null}>
          <Scene
            imageUrl={imageUrl}
            isLow={isLow}
            onPickStat={(id) => setPickedStat((prev) => (prev === id ? null : id))}
          />
          {!isLow ? (
            <CinematicEffects
              bloomIntensity={0.5}
              bloomThreshold={0.7}
              chromaticAberration={0.00015}
            />
          ) : null}
        </Suspense>
      </Canvas>

      {/* Heading. Bolder backdrop + corner brackets so it reads against
          the bright halo of the holographic plate behind it. */}
      <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2">
        <div className="relative px-8 py-4 rounded-lg bg-slate-950/85 backdrop-blur-md border border-cyan-400/50 shadow-[0_0_40px_rgba(34,211,238,0.18)]">
          {/* Decorative corner brackets */}
          <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-300 rounded-tl-sm" />
          <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-300 rounded-tr-sm" />
          <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-300 rounded-bl-sm" />
          <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-300 rounded-br-sm" />

          <div className="text-center">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.32em] text-cyan-200 uppercase">
              <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
              Identity holograph
              <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
            </div>
            <div className="mt-2 font-mono text-3xl font-bold text-white tracking-[0.18em] drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]">
              <Typewriter text="SAGAR BUDHATHOKI" speed={48} caret />
            </div>
            <div className="mt-1.5 font-mono text-xs text-slate-200">
              Senior DevOps / SRE Engineer
              <span className="mx-2 text-slate-500">·</span>
              <span className="text-cyan-200">sagar@sagarbudhathoki.com</span>
            </div>
            <div className="mt-0.5 font-mono text-xs">
              <a
                href="https://linkedin.com/in/sbmagar13"
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto text-cyan-200 hover:text-white transition-colors"
              >
                linkedin.com/in/sbmagar13
              </a>
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-slate-400 tracking-wider">
              Kathmandu, Nepal · open to remote
            </div>
          </div>
        </div>
      </div>

      {/* Stat detail overlay. Opens whenever a stat panel is clicked.
          Anchored bottom-right, same visual language as the Hero's
          war-story panel. */}
      <AnimatePresence>
        {stat ? (
          <motion.aside
            key={stat.id}
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-30 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-lg p-5 sm:p-6 shadow-2xl shadow-cyan-500/15 pointer-events-auto bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-8 sm:right-6 sm:w-[360px] sm:max-w-[44vw]"
            role="dialog"
            aria-label={`Detail: ${stat.value}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-cyan-300 bg-cyan-500/10 border border-cyan-400/40 rounded px-2 py-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                  {stat.label}
                </div>
                <div className="mt-3 font-mono text-lg font-semibold text-white tracking-wide leading-snug">
                  {stat.value}
                </div>
              </div>
              <button
                ref={closeBtnRef}
                onClick={() => setPickedStat(null)}
                className="text-slate-400 hover:text-white font-mono text-base leading-none w-8 h-8 flex items-center justify-center rounded border border-slate-700 hover:border-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label="Close detail"
              >
                ×
              </button>
            </div>
            <p className="mt-4 text-[14px] text-slate-200 leading-relaxed">{stat.detail}</p>
            <div className="mt-4 text-[10px] font-mono text-slate-500">
              <span className="sm:hidden">Tap × to close · tap another panel to switch</span>
              <span className="hidden sm:inline">
                Press <span className="text-cyan-300">esc</span> to close · click another panel to switch
              </span>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
