'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, useTexture, OrbitControls, Stars, Float, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import Image from 'next/image';

// 3D Particle System with REAL 3D geometry (not flat!)
function Epic3DParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 3000;

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particleData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const radius = 4 + Math.random() * 15;
      const angle = (i / count) * Math.PI * 10;
      const height = (Math.random() - 0.5) * 10;

      data.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ),
        scale: Math.random() * 0.15 + 0.05,
        speed: Math.random() * 0.5 + 0.5,
        offset: Math.random() * Math.PI * 2,
        color: new THREE.Color(
          Math.random() < 0.5 ? '#6366f1' : Math.random() < 0.75 ? '#8b5cf6' : '#06b6d4'
        ),
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;

      particleData.forEach((particle, i) => {
        const time = state.clock.elapsedTime * particle.speed;

        // Spiral wave motion
        const radius = Math.sqrt(particle.position.x ** 2 + particle.position.z ** 2);
        const angle = Math.atan2(particle.position.z, particle.position.x) + 0.002;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = particle.position.y + Math.sin(time + particle.offset) * 0.03;

        dummy.position.set(x, y, z);
        dummy.scale.setScalar(particle.scale * (1 + Math.sin(time * 2) * 0.3));
        dummy.rotation.x = time;
        dummy.rotation.y = time * 0.5;
        dummy.updateMatrix();

        meshRef.current!.setMatrixAt(i, dummy.matrix);
        meshRef.current!.setColorAt(i, particle.color);
      });

      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        emissive="#6366f1"
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  );
}

// Avatar sphere with ACTUAL image texture
function AvatarSphereWithImage({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Load the actual texture
  const texture = useTexture(imageUrl);
  texture.mapping = THREE.EquirectangularReflectionMapping;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      const scale = hovered ? 1.2 : 1.0 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        {/* Main avatar sphere with image */}
        <Sphere
          args={[2.5, 128, 128]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial
            map={texture}
            roughness={0.3}
            metalness={0.7}
            emissive="#6366f1"
            emissiveIntensity={hovered ? 0.3 : 0.1}
          />
        </Sphere>

        {/* Holographic distortion overlay */}
        <Sphere args={[2.6, 64, 64]}>
          <MeshDistortMaterial
            distort={0.3}
            speed={2}
            transparent
            opacity={0.3}
            color={hovered ? "#8b5cf6" : "#6366f1"}
            emissive="#06b6d4"
            emissiveIntensity={0.2}
          />
        </Sphere>

        {/* Inner glow */}
        <Sphere args={[2.3, 32, 32]}>
          <meshBasicMaterial
            color="#06b6d4"
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </Sphere>

        {/* Outer aura */}
        <Sphere args={[2.9, 32, 32]}>
          <meshBasicMaterial
            color={hovered ? "#a855f7" : "#6366f1"}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </Sphere>
      </Float>
    </group>
  );
}

// Epic orbital rings
function EpicOrbitalRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {[3.8, 4.5, 5.2, 6.0, 6.8].map((radius, i) => (
        <Float key={i} speed={1 + i * 0.3} rotationIntensity={0.4}>
          <mesh rotation={[Math.PI / 2 + i * 0.15, i * 0.1, 0]}>
            <torusGeometry args={[radius, 0.04, 16, 100]} />
            <meshStandardMaterial
              color={['#6366f1', '#8b5cf6', '#06b6d4', '#a855f7', '#3b82f6'][i]}
              emissive={['#6366f1', '#8b5cf6', '#06b6d4', '#a855f7', '#3b82f6'][i]}
              emissiveIntensity={0.6}
              transparent
              opacity={0.7}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Energy orbs with 3D spheres
function EpicEnergyOrbs() {
  const orbCount = 20;

  const orbs = useMemo(() => {
    return Array.from({ length: orbCount }).map((_, i) => ({
      position: [
        Math.cos((i / orbCount) * Math.PI * 2) * 7,
        Math.sin((i / orbCount) * Math.PI * 3) * 4,
        Math.sin((i / orbCount) * Math.PI * 2) * 7,
      ] as [number, number, number],
      color: ['#6366f1', '#8b5cf6', '#06b6d4', '#a855f7'][i % 4],
      speed: 0.3 + Math.random() * 0.5,
      size: 0.15 + Math.random() * 0.15,
    }));
  }, []);

  return (
    <>
      {orbs.map((orb, i) => (
        <EpicOrb key={i} {...orb} index={i} />
      ))}
    </>
  );
}

function EpicOrb({ position, color, speed, size, index }: {
  position: [number, number, number];
  color: string;
  speed: number;
  size: number;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime * speed;
      meshRef.current.position.x = position[0] * Math.cos(time + index);
      meshRef.current.position.y = position[1] + Math.sin(time * 2 + index) * 3;
      meshRef.current.position.z = position[2] * Math.sin(time + index);

      const scale = size * (1 + Math.sin(time * 3) * 0.3);
      meshRef.current.scale.set(scale, scale, scale);

      meshRef.current.rotation.x = time * 2;
      meshRef.current.rotation.y = time * 1.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.5}
        transparent
        opacity={0.9}
        metalness={0.8}
        roughness={0.2}
      />

      {/* Glow halo */}
      <mesh>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </mesh>
  );
}

// MANY more floating tech labels
function ManyFloatingTechLabels() {
  const labels = [
    // Infrastructure & DevOps
    'KUBERNETES', 'DOCKER', 'TERRAFORM', 'ANSIBLE', 'HELM',
    // Cloud Platforms
    'AWS', 'AZURE', 'GCP', 'CLOUDFLARE',
    // CI/CD
    'GITHUB ACTIONS', 'JENKINS', 'GITLAB CI', 'ARGOCD',
    // Monitoring
    'PROMETHEUS', 'GRAFANA', 'DATADOG', 'ELK STACK',
    // Programming
    'PYTHON', 'TYPESCRIPT', 'GO', 'BASH',
    // Databases
    'POSTGRESQL', 'MONGODB', 'REDIS', 'ELASTICSEARCH',
    // AI/ML
    'AI/ML', 'LANGCHAIN', 'OPENAI', 'MCP', 'PYTORCH',
    // Others
    'DEVOPS', 'CLOUD NATIVE', 'MICROSERVICES', 'GITOPS'
  ];

  return (
    <>
      {labels.map((label, i) => (
        <FloatingTechLabel key={label} text={label} index={i} total={labels.length} />
      ))}
    </>
  );
}

function FloatingTechLabel({ text, index, total }: { text: string; index: number; total: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Spherical distribution
  const phi = Math.acos(-1 + (2 * index) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;
  const radius = 10 + Math.random() * 8;

  const basePosition = useMemo(() => ({
    x: radius * Math.cos(theta) * Math.sin(phi),
    y: radius * Math.sin(theta) * Math.sin(phi),
    z: radius * Math.cos(phi),
  }), [phi, theta, radius]);

  const speed = 0.15 + Math.random() * 0.15;
  const offset = Math.random() * Math.PI * 2;

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime * speed;

      // Orbit in 3D space
      const angle = time + offset;
      groupRef.current.position.x = basePosition.x * Math.cos(angle) - basePosition.z * Math.sin(angle);
      groupRef.current.position.y = basePosition.y + Math.sin(time * 2 + offset) * 2;
      groupRef.current.position.z = basePosition.x * Math.sin(angle) + basePosition.z * Math.cos(angle);

      // Always face camera
      groupRef.current.lookAt(0, 0, 0);

      // Pulsing effect
      const scale = 1 + Math.sin(time * 3 + offset) * 0.15;
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background panel */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[text.length * 0.35, 0.6]} />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Text */}
      <Text
        fontSize={0.4}
        color="#06b6d4"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {text}
      </Text>

      {/* Glow effect */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[text.length * 0.4, 0.7]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}

// Lightning/Energy beams
function EnergyBeams() {
  const [beams, setBeams] = useState<Array<{ start: THREE.Vector3; end: THREE.Vector3; color: string }>>([]);

  useFrame(() => {
    if (Math.random() > 0.95) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 12 + Math.random() * 5;

      const start = new THREE.Vector3(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 8,
        Math.sin(angle) * radius
      );
      const end = new THREE.Vector3(0, 0, 0);
      const color = ['#6366f1', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 3)];

      setBeams([{ start, end, color }]);
      setTimeout(() => setBeams([]), 150);
    }
  });

  return (
    <>
      {beams.map((beam, i) => {
        const direction = new THREE.Vector3().subVectors(beam.end, beam.start);
        const length = direction.length();
        const midpoint = new THREE.Vector3().addVectors(beam.start, beam.end).multiplyScalar(0.5);

        return (
          <mesh key={i} position={midpoint}>
            <cylinderGeometry args={[0.05, 0.02, length, 8]} />
            <meshBasicMaterial color={beam.color} transparent opacity={0.9} />
          </mesh>
        );
      })}
    </>
  );
}

// Dynamic cinematic camera
function CinematicCamera() {
  const { camera } = useThree();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    camera.position.x = Math.sin(time * 0.08) * 3;
    camera.position.y = Math.cos(time * 0.12) * 2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function UltraEpicAvatar({ imageUrl = '/sagar-mountains.jpg' }) {
  return (
    <div className="w-screen h-screen fixed top-0 left-0 bg-black">
      <Canvas
        shadows
        camera={{ position: [0, 2, 16], fov: 65 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        {/* Epic lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#6366f1" distance={40} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#8b5cf6" distance={40} />
        <pointLight position={[0, 15, -10]} intensity={1.5} color="#06b6d4" distance={35} />
        <pointLight position={[10, -10, 10]} intensity={1.5} color="#a855f7" distance={35} />
        <spotLight
          position={[0, 25, 0]}
          angle={0.4}
          intensity={3}
          color="#3b82f6"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Background stars */}
        <Stars
          radius={200}
          depth={100}
          count={10000}
          factor={7}
          saturation={0.6}
          fade
          speed={2}
        />

        {/* Main components */}
        <AvatarSphereWithImage imageUrl={imageUrl} />
        <Epic3DParticles />
        <EpicOrbitalRings />
        <EpicEnergyOrbs />
        <ManyFloatingTechLabels />
        <EnergyBeams />

        {/* Camera effects */}
        <CinematicCamera />

        {/* User controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={10}
          maxDistance={30}
          autoRotate={true}
          autoRotateSpeed={0.4}
          dampingFactor={0.05}
          rotateSpeed={0.6}
          makeDefault
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* Clean UI Overlay - Only Profile Card */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-30">
        {/* Profile Card - Bottom Left with Experience/Deployments/Systems - ONLY CARD */}
        <div className="absolute bottom-6 left-4 md:bottom-8 md:left-8 w-[280px] md:w-[320px] pointer-events-auto">
          <div className="holographic-border rounded-lg p-5 md:p-6 backdrop-blur-xl bg-slate-950/95">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-cyan-400 ring-2 ring-purple-500">
                <Image
                  src={imageUrl}
                  alt="Sagar Budhathoki"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-white font-bold text-lg md:text-xl">Sagar Budhathoki</div>
                <div className="text-cyan-400 font-mono text-sm">DevOps Architect</div>
              </div>
            </div>
            <div className="space-y-3 text-sm font-mono border-t border-cyan-400/30 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Experience:</span>
                <span className="text-white font-bold text-base">4+ Years</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Deployments:</span>
                <span className="text-green-400 font-bold text-base">10,000+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Systems:</span>
                <span className="text-blue-400 font-bold text-base">100+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Animated corner accents */}
        <div className="absolute top-0 left-0 w-40 h-40 border-t-4 border-l-4 border-cyan-400 opacity-40"></div>
        <div className="absolute top-0 right-0 w-40 h-40 border-t-4 border-r-4 border-purple-400 opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 border-b-4 border-l-4 border-blue-400 opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 border-b-4 border-r-4 border-violet-400 opacity-40"></div>

        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-scan"></div>
        </div>
      </div>
    </div>
  );
}
