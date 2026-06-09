'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { VolumetricBeam, NeonStrip } from './Atmosphere';
import CinematicEffects from './Effects';
import LensFlare from './LensFlare';
import ParticleStorm from './ParticleStorm';
import SkillLogo from './SkillLogo';
import { PALETTE } from './Materials';

// The real DevOps stack Sagar drives daily. Decorative orbit around
// the centre orb; same logo components used in SkillsHall, so the
// visual vocabulary is consistent.
const ORBIT_TOOLS = [
  'kubernetes',
  'docker',
  'aws',
  'aurora',
  'terraform',
  'python',
  'grafana',
  'opentelemetry',
  'mcp',
] as const;

function ToolOrbit({ radius = 4.6 }: { radius?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.06;
  });
  return (
    <group ref={groupRef}>
      {ORBIT_TOOLS.map((id, i) => {
        const count = ORBIT_TOOLS.length;
        const angle = (i / count) * Math.PI * 2;
        const y = Math.sin(angle * 2) * 0.9 + 0.3;
        return (
          <Float key={id} speed={0.6 + (i % 3) * 0.15} floatIntensity={0.35} rotationIntensity={0.18}>
            <group position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]} scale={0.78}>
              <SkillLogo id={id} />
            </group>
          </Float>
        );
      })}
    </group>
  );
}

// Liquid-metal central orb behind the title overlay.
function CenterOrb() {
  return (
    <Float speed={0.8} floatIntensity={0.25} rotationIntensity={0.15}>
      <mesh position={[0, 0.4, -1.5]}>
        <sphereGeometry args={[1.3, 64, 64]} />
        <MeshDistortMaterial
          color={PALETTE.neonPurple}
          emissive={PALETTE.neonMagenta}
          emissiveIntensity={0.3}
          metalness={0.88}
          roughness={0.14}
          distort={0.26}
          speed={1.0}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} color="#1e293b" />
      <pointLight position={[6, 5, 6]} intensity={1.4} color={PALETTE.neonCyan} distance={20} />
      <pointLight position={[-6, -2, -4]} intensity={1.1} color={PALETTE.neonMagenta} distance={18} />
      <pointLight position={[0, 8, 0]} intensity={0.65} color={PALETTE.ledWhite} distance={14} />

      <CenterOrb />
      <ToolOrbit radius={4.6} />

      <ContactShadows position={[0, -2.0, 0]} opacity={0.4} blur={2.5} far={8} color="#000000" />
      <NeonStrip start={[-6, -1.95, 0]} end={[6, -1.95, 0]} color={PALETTE.neonCyan} thickness={0.022} />
      <VolumetricBeam position={[0, 3, 0]} height={5} bottomRadius={2.2} opacity={0.045} />

      {/* One atmospheric particle layer, deliberately sparse so the
          scene feels still and confident rather than busy. */}
      <ParticleStorm
        count={1100}
        bounds={[14, 7, 14]}
        color={PALETTE.neonCyan}
        size={6}
        speed={0.15}
        behavior="drift"
        opacity={0.22}
      />

      <LensFlare position={[0, 0.4, -1.4]} color={PALETTE.neonMagenta} size={1.8} intensity={0.35} />

      <OrbitControls
        target={[0, 0.2, 0]}
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.12}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.9}
        dampingFactor={0.09}
      />
    </>
  );
}

export default function Hero({ onEnter, active = true }: { onEnter?: () => void; active?: boolean }) {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <Canvas
        camera={{ position: [0, 1.2, 8.5], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.75]}
        frameloop={active ? 'always' : 'never'}
      >
        <color attach="background" args={[PALETTE.voidA]} />
        <fog attach="fog" args={['#020617', 7, 22]} />
        <Suspense fallback={null}>
          <Scene />
          <CinematicEffects
            bloomIntensity={0.65}
            bloomThreshold={0.55}
            chromaticAberration={0.00012}
          />
        </Suspense>
      </Canvas>

      {/* Foreground HTML overlay. Name and subtitle live here, not in
          3D, so the most important word on a personal site is always
          legible regardless of camera angle or motion. */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h1 className="font-mono text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[0.08em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
            SAGAR BUDHATHOKI
          </h1>
          <div className="mt-3 font-mono text-sm sm:text-base tracking-[0.4em] text-cyan-300/90 uppercase">
            DevOps · SRE · AI Engineer
          </div>
        </motion.div>

        {/* Identity stat cards. These tested as the strongest signal
            on the page in a real readability review, so they sit
            front and centre below the name. */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap gap-3 justify-center max-w-3xl"
        >
          {[
            { label: 'Experience', value: '4+ Years', color: 'text-cyan-300' },
            { label: 'Owns', value: 'Multi-tenant SaaS', color: 'text-purple-300' },
            { label: 'Built', value: 'Multi-region DR', color: 'text-orange-300' },
            { label: 'Top Lang', value: 'Python', color: 'text-cyan-200' },
            { label: 'Building', value: 'MCP for Claude', color: 'text-emerald-300' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded border border-cyan-500/30 bg-slate-950/65 backdrop-blur-sm px-4 py-2 font-mono"
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">{s.label}</div>
              <div className={`text-base sm:text-lg ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </motion.div>

        {/* Direct CTAs. Each goes somewhere real, not to a vague gate. */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap gap-3 justify-center pointer-events-auto"
        >
          <button
            onClick={onEnter}
            className="px-7 py-3 rounded-md font-mono text-xs sm:text-sm tracking-widest uppercase text-white bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 transition-colors shadow-lg shadow-cyan-500/25"
          >
            See the work →
          </button>
          <a
            href="https://github.com/sbmagar13"
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-3 rounded-md font-mono text-xs sm:text-sm tracking-widest uppercase text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/10 transition-colors"
          >
            GitHub
          </a>
          <a
            href="mailto:sagar@sagarbudhathoki.com"
            className="px-7 py-3 rounded-md font-mono text-xs sm:text-sm tracking-widest uppercase text-purple-300 border border-purple-500/40 hover:bg-purple-500/10 transition-colors"
          >
            Email
          </a>
          <a
            href="/terminal"
            className="px-7 py-3 rounded-md font-mono text-xs sm:text-sm tracking-widest uppercase text-slate-300 border border-slate-600/50 hover:bg-slate-500/10 transition-colors"
          >
            Terminal view
          </a>
        </motion.div>
      </div>
    </div>
  );
}
