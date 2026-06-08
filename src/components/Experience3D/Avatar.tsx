'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Text, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import HoloPlate from './HoloPlate';
import HoloProjector from './HoloProjector';
import { DustMotes } from './Atmosphere';
import CinematicEffects from './Effects';
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

// Floating info chips around the avatar.
function StatPanel({
  position,
  label,
  value,
  color,
}: {
  position: [number, number, number];
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Float speed={1.5} floatIntensity={0.4} rotationIntensity={0.2}>
      <group position={position}>
        {/* Panel back */}
        <mesh>
          <planeGeometry args={[1.4, 0.6]} />
          <meshStandardMaterial
            color="#020617"
            emissive={color}
            emissiveIntensity={0.07}
            transparent
            opacity={0.7}
            metalness={0.3}
            roughness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Glow border */}
        {[
          { p: [0, 0.31, 0.01], s: [1.42, 0.012, 0.005] },
          { p: [0, -0.31, 0.01], s: [1.42, 0.012, 0.005] },
          { p: [-0.71, 0, 0.01], s: [0.012, 0.61, 0.005] },
          { p: [0.71, 0, 0.01], s: [0.012, 0.61, 0.005] },
        ].map((b, i) => (
          <mesh key={i} position={b.p as [number, number, number]}>
            <boxGeometry args={b.s as [number, number, number]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
          </mesh>
        ))}
        {/* Text */}
        <Text
          position={[0, 0.13, 0.02]}
          fontSize={0.08}
          color="#94a3b8"
          anchorX="center"
          letterSpacing={0.08}
        >
          {label.toUpperCase()}
        </Text>
        <Text
          position={[0, -0.08, 0.02]}
          fontSize={0.18}
          color={color}
          anchorX="center"
          outlineColor="#000"
          outlineWidth={0.004}
        >
          {value}
        </Text>
      </group>
    </Float>
  );
}

function Scene({ imageUrl }: { imageUrl: string }) {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.18} color="#1e293b" />
      <pointLight position={[3, 4, 4]} intensity={1.4} color={PALETTE.neonCyan} distance={14} />
      <pointLight position={[-4, 2, -3]} intensity={1.1} color={PALETTE.neonMagenta} distance={14} />
      <pointLight position={[0, -2, 4]} intensity={0.7} color={PALETTE.neonPurple} distance={10} />

      {/* The photo as a holographic plate */}
      <Float speed={1.2} floatIntensity={0.25} rotationIntensity={0.05}>
        <HoloPlate
          imageUrl={imageUrl}
          position={[0, 1.05, 0]}
          size={[2.4, 3.0]}
          tint={PALETTE.neonCyan}
          opacity={0.95}
        />
      </Float>

      {/* Projector base */}
      <HoloProjector position={[0, -1.7, 0]} beamHeight={4.2} beamColor={PALETTE.neonCyan} />

      {/* Particles in the beam */}
      <RisingMotes count={300} />

      {/* Floor reflection plate (subtle) */}
      <ContactShadows
        position={[0, -1.85, 0]}
        opacity={0.55}
        blur={2.4}
        far={5}
        color="#0ea5e9"
      />

      {/* Stat panels — orbit-like positions around the avatar */}
      <StatPanel position={[3, 2.6, -0.5]} label="Experience" value="5+ Years" color={PALETTE.neonCyan} />
      <StatPanel position={[3.2, 1, 0.6]} label="Repos" value="49" color={PALETTE.neonMagenta} />
      <StatPanel position={[2.8, -0.5, -0.2]} label="Top Lang" value="Python" color={PALETTE.neonPurple} />

      <StatPanel position={[-3, 2.4, 0.5]} label="Focus" value="DevOps" color={PALETTE.neonCyan} />
      <StatPanel position={[-3.3, 0.9, -0.4]} label="Stack" value="K8s / TF" color={PALETTE.neonMagenta} />
      <StatPanel position={[-2.9, -0.6, 0.4]} label="Location" value="Nepal" color={PALETTE.neonPurple} />

      {/* Atmospheric dust at distance */}
      <DustMotes count={250} radius={8} height={6} color={PALETTE.neonCyan} size={0.018} />

      <OrbitControls
        target={[0, 0.5, 0]}
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={12}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate
        autoRotateSpeed={0.4}
        dampingFactor={0.06}
      />
    </>
  );
}

export default function Avatar({ imageUrl = '/sagar-mountains.jpg' }: { imageUrl?: string }) {
  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        camera={{ position: [0, 1.5, 7], fov: 42 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.6]}
      >
        <color attach="background" args={[PALETTE.voidA]} />
        <fog attach="fog" args={['#020617', 6, 18]} />
        <Suspense fallback={null}>
          <Scene imageUrl={imageUrl} />
          <CinematicEffects bloomIntensity={1.4} bloomThreshold={0.18} bokehScale={2.5} dof />
        </Suspense>
      </Canvas>

      {/* Heading */}
      <div className="pointer-events-none absolute top-24 left-1/2 -translate-x-1/2 text-center">
        <div className="font-mono text-xs tracking-[0.4em] text-cyan-400/70 uppercase">
          Identity holograph
        </div>
        <div className="mt-1 font-mono text-2xl text-white/90">SAGAR BUDHATHOKI</div>
        <div className="mt-1 font-mono text-[10px] text-slate-400/70">
          DevOps engineer · sagar@sagarbudhathoki.com
        </div>
      </div>
    </div>
  );
}
