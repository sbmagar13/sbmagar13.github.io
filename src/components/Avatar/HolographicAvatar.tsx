'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, useTexture, MeshDistortMaterial, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Particle system for holographic effect
function HolographicParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 2000;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Blues and purples
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        // Electric blue
        colors[i3] = 0.2;
        colors[i3 + 1] = 0.6;
        colors[i3 + 2] = 1.0;
      } else if (colorChoice < 0.66) {
        // Purple
        colors[i3] = 0.6;
        colors[i3 + 1] = 0.2;
        colors[i3 + 2] = 1.0;
      } else {
        // Cyan
        colors[i3] = 0.3;
        colors[i3 + 1] = 0.8;
        colors[i3 + 2] = 1.0;
      }
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Avatar sphere with image texture
function AvatarSphere({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(imageUrl);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      const scale = hovered ? 1.1 : 1.0 + Math.sin(state.clock.elapsedTime) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Sphere
      ref={meshRef}
      args={[2, 64, 64]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <MeshDistortMaterial
        map={texture}
        distort={0.3}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        emissive="#4040ff"
        emissiveIntensity={0.3}
      />
    </Sphere>
  );
}

// Holographic rings around avatar
function HolographicRings() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      ringsRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={ringsRef}>
      {[3, 3.5, 4].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.02, 16, 100]} />
          <meshBasicMaterial
            color={i === 0 ? '#6366f1' : i === 1 ? '#8b5cf6' : '#06b6d4'}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// Scan lines effect
function ScanLines() {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.position.y = -5 + (state.clock.elapsedTime * 2) % 10;
    }
  });

  return (
    <group ref={linesRef}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.5, 0]}>
          <planeGeometry args={[10, 0.02]} />
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// Floating data nodes
function DataNodes() {
  const nodes = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
      ] as [number, number, number],
      color: Math.random() < 0.5 ? '#6366f1' : '#8b5cf6',
      speed: 0.5 + Math.random() * 1.5,
    }));
  }, []);

  return (
    <>
      {nodes.map((node, i) => (
        <FloatingNode key={i} {...node} index={i} />
      ))}
    </>
  );
}

function FloatingNode({
  position,
  color,
  speed,
  index,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * speed + index) * 2;
      meshRef.current.rotation.x = state.clock.elapsedTime * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.15, 0]} />
      <meshBasicMaterial color={color} wireframe />
    </mesh>
  );
}

// Camera controller
function CameraController() {
  const { camera } = useThree();

  useFrame((state) => {
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 1;
    camera.position.y = Math.cos(state.clock.elapsedTime * 0.15) * 0.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Main component
export default function HolographicAvatar({ imageUrl = '/sagar-mountains.jpg' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-2xl text-blue-400 font-mono">Initializing Holographic System...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Ambient lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

        {/* Stars background */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* Main avatar */}
        <AvatarSphere imageUrl={imageUrl} />

        {/* Effects */}
        <HolographicParticles />
        <HolographicRings />
        <ScanLines />
        <DataNodes />

        {/* Camera */}
        <CameraController />

        {/* User controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={5}
          maxDistance={15}
          autoRotate={false}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10">
          <div className="text-cyan-400 font-mono text-sm space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>SYSTEM ONLINE</span>
            </div>
            <div>HOLOGRAPHIC INTERFACE v3.0</div>
            <div>NEURAL NETWORK: ACTIVE</div>
            <div>QUANTUM STATE: STABLE</div>
          </div>
        </div>

        <div className="absolute bottom-10 right-10">
          <div className="text-purple-400 font-mono text-xs text-right space-y-1">
            <div>DRAG TO ROTATE</div>
            <div>SCROLL TO ZOOM</div>
            <div>HOVER TO INTERACT</div>
          </div>
        </div>

        {/* Scanline effect overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-scan"></div>
        </div>
      </div>
    </div>
  );
}
