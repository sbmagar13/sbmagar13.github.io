'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import HoloPlate from './HoloPlate';
import HoloProjector from './HoloProjector';
import CinematicEffects from './Effects';
import LensFlare from './LensFlare';
import ParticleStorm from './ParticleStorm';
import LabelPlate from './LabelPlate';
import useMouseParallax from './useMouseParallax';
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

// Floating info chips around the avatar. Uses LabelPlate so the text
// reads clearly against the holographic glow.
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
    <Float speed={1.2} floatIntensity={0.25} rotationIntensity={0.15}>
      <LabelPlate
        position={position}
        text={value}
        subtext={label.toUpperCase()}
        size={0.2}
        subSize={0.075}
        color={color}
        subColor="#cbd5e1"
        billboard
        plate
        plateOpacity={0.85}
        padding={[0.18, 0.1]}
        border
        borderColor={color}
      />
    </Float>
  );
}

function PlateWithParallax({ imageUrl }: { imageUrl: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useMouseParallax();

  useFrame((state) => {
    if (!groupRef.current) return;
    // Tilt toward the cursor, small angle, smoothed.
    const targetRotY = mouse.current.x * 0.3;
    const targetRotX = mouse.current.y * -0.18;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
    // Slight breathing/idle drift on top of the parallax.
    groupRef.current.position.y =
      1.05 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
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

function Scene({ imageUrl }: { imageUrl: string }) {
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

      {/* Stat panels, orbit-like positions around the avatar */}
      <StatPanel position={[3, 2.6, -0.5]} label="Experience" value="5+ Years" color={PALETTE.neonCyan} />
      <StatPanel position={[3.2, 1, 0.6]} label="Repos" value="49" color={PALETTE.neonMagenta} />
      <StatPanel position={[2.8, -0.5, -0.2]} label="Top Lang" value="Python" color={PALETTE.neonPurple} />

      <StatPanel position={[-3, 2.4, 0.5]} label="Focus" value="DevOps" color={PALETTE.neonCyan} />
      <StatPanel position={[-3.3, 0.9, -0.4]} label="Stack" value="K8s / TF" color={PALETTE.neonMagenta} />
      <StatPanel position={[-2.9, -0.6, 0.4]} label="Location" value="Nepal" color={PALETTE.neonPurple} />

      {/* Atmospheric dust at distance */}
      {/* Background atmosphere only, kept distant and dim so it doesn't
          fight with the photo for attention. No close-in orbital particles. */}
      <ParticleStorm
        count={1200}
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
          {/* Less bloom + higher threshold so only true highlights glow.
              Smaller DoF so the photo stays readable. */}
          <CinematicEffects
            bloomIntensity={0.5}
            bloomThreshold={0.7}
            bokehScale={1.2}
            chromaticAberration={0.0004}
            dof
          />
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
              SAGAR BUDHATHOKI
            </div>
            <div className="mt-1.5 font-mono text-xs text-slate-200">
              DevOps engineer
              <span className="mx-2 text-slate-500">·</span>
              <span className="text-cyan-200">sagar@sagarbudhathoki.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
