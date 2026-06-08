'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial, Text, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { VolumetricBeam, NeonStrip } from './Atmosphere';
import CinematicEffects from './Effects';
import LensFlare from './LensFlare';
import ParticleStorm from './ParticleStorm';
import SkillLogo from './SkillLogo';
import { PALETTE } from './Materials';

// The real DevOps stack orbiting the title. Each tool is the same
// SkillLogo the SkillsHall uses, so the visual language is consistent
// across the whole experience: this is what Sagar works with daily.
// The tools Sagar actually drives daily, not a generic DevOps quiz card.
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
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.07;
  });
  return (
    <group ref={groupRef}>
      {ORBIT_TOOLS.map((id, i) => {
        const count = ORBIT_TOOLS.length;
        const angle = (i / count) * Math.PI * 2;
        // Spiral the y up and down so the ring isn't a flat disc.
        const y = Math.sin(angle * 2) * 0.9 + 0.3;
        return (
          <Float key={id} speed={0.7 + (i % 3) * 0.18} floatIntensity={0.45} rotationIntensity={0.2}>
            <group position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]} scale={0.78}>
              <SkillLogo id={id} />
            </group>
          </Float>
        );
      })}
    </group>
  );
}

// A liquid-metal central orb behind the title.
function CenterOrb() {
  return (
    <Float speed={1} floatIntensity={0.3} rotationIntensity={0.2}>
      <mesh position={[0, 0.4, -1.5]}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <MeshDistortMaterial
          color={PALETTE.neonPurple}
          emissive={PALETTE.neonMagenta}
          emissiveIntensity={0.35}
          metalness={0.88}
          roughness={0.14}
          distort={0.3}
          speed={1.2}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} color="#1e293b" />
      <pointLight position={[6, 5, 6]} intensity={1.5} color={PALETTE.neonCyan} distance={20} />
      <pointLight position={[-6, -2, -4]} intensity={1.2} color={PALETTE.neonMagenta} distance={18} />
      <pointLight position={[0, 8, 0]} intensity={0.7} color={PALETTE.ledWhite} distance={14} />

      <CenterOrb />
      <ToolOrbit radius={4.6} />

      {/* Title in extruded text */}
      <Float speed={0.6} floatIntensity={0.15} rotationIntensity={0.05}>
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.85}
          letterSpacing={0.08}
          anchorX="center"
          anchorY="middle"
          color="#f1f5f9"
          outlineColor={PALETTE.neonCyan}
          outlineWidth={0.005}
          outlineOpacity={0.8}
        >
          SAGAR BUDHATHOKI
        </Text>
        <Text
          position={[0, -0.45, 0]}
          fontSize={0.16}
          letterSpacing={0.34}
          anchorX="center"
          color={PALETTE.neonCyan}
        >
          DEVOPS · SRE · AI ENGINEER
        </Text>
      </Float>

      {/* Floor reflection */}
      <ContactShadows position={[0, -2.0, 0]} opacity={0.45} blur={2.5} far={8} color="#000000" />

      {/* Underglow */}
      <NeonStrip start={[-6, -1.95, 0]} end={[6, -1.95, 0]} color={PALETTE.neonCyan} thickness={0.025} />

      {/* Single beam from above */}
      <VolumetricBeam position={[0, 3, 0]} height={5} bottomRadius={2.5} opacity={0.05} />

      {/* Two parallax layers, main drift for atmosphere, distant orbit
          for depth. Opacities kept low so the title is the focal point. */}
      <ParticleStorm
        count={1800}
        bounds={[14, 7, 14]}
        color={PALETTE.neonCyan}
        size={7}
        speed={0.18}
        behavior="drift"
        opacity={0.3}
      />
      <ParticleStorm
        count={400}
        bounds={[10, 5, 10]}
        color={PALETTE.neonMagenta}
        size={14}
        speed={0.45}
        behavior="orbit"
        opacity={0.18}
      />

      {/* Small accent flare behind the orb, not in front. */}
      <LensFlare position={[0, 0.4, -1.4]} color={PALETTE.neonMagenta} size={2.2} intensity={0.45} />

      <OrbitControls
        target={[0, 0.2, 0]}
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.18}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.9}
        dampingFactor={0.085}
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
            bloomIntensity={0.7}
            bloomThreshold={0.5}
            chromaticAberration={0.00015}
          />
        </Suspense>
      </Canvas>

      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 pointer-events-none">
        {/* Stats strip */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-wrap gap-3 justify-center mb-8"
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
              className="rounded border border-cyan-500/30 bg-slate-950/50 backdrop-blur-sm px-4 py-2 font-mono"
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">{s.label}</div>
              <div className={`text-lg ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex gap-4 pointer-events-auto"
        >
          <button
            onClick={onEnter}
            className="px-8 py-3 rounded-md font-mono text-sm tracking-widest uppercase text-white bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 transition-colors shadow-lg shadow-cyan-500/30"
          >
            Enter Experience →
          </button>
          <a
            href="/terminal"
            className="px-8 py-3 rounded-md font-mono text-sm tracking-widest uppercase text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/10 transition-colors"
          >
            Terminal
          </a>
        </motion.div>
      </div>

    </div>
  );
}
