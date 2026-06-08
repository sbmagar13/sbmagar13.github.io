'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, useTexture, OrbitControls, Stars, MeshDistortMaterial, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Enhanced particle system with more particles and better movement
function EnhancedParticleSystem() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 5000; // Increased from 2000

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Create spiral galaxy pattern
      const radius = 3 + Math.random() * 12;
      const angle = (i / count) * Math.PI * 8;
      const height = (Math.random() - 0.5) * 8;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;

      // Velocity for organic movement
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

      // Beautiful blues and purples gradient
      const colorChoice = Math.random();
      if (colorChoice < 0.25) {
        colors[i3] = 0.2; colors[i3 + 1] = 0.6; colors[i3 + 2] = 1.0; // Electric blue
      } else if (colorChoice < 0.5) {
        colors[i3] = 0.6; colors[i3 + 1] = 0.2; colors[i3 + 2] = 1.0; // Purple
      } else if (colorChoice < 0.75) {
        colors[i3] = 0.3; colors[i3 + 1] = 0.8; colors[i3 + 2] = 1.0; // Cyan
      } else {
        colors[i3] = 0.8; colors[i3 + 1] = 0.4; colors[i3 + 2] = 1.0; // Violet
      }

      sizes[i] = Math.random() * 0.15 + 0.05;
    }

    return { positions, colors, sizes, velocities };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

      // Smooth rotation
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;

      // Animate particles
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // Add wave motion
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i * 0.01) * 0.002;

        // Spiral motion
        const radius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 2] ** 2);
        const angle = Math.atan2(positions[i3 + 2], positions[i3]) + 0.001;
        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 2] = Math.sin(angle) * radius;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
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
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={particles.sizes}
          itemSize={1}
          args={[particles.sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Improved avatar sphere with better materials
function ImprovedAvatarSphere({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      const scale = hovered ? 1.15 : 1.0 + Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      <Float
        speed={2}
        rotationIntensity={0.3}
        floatIntensity={0.5}
      >
        <Sphere
          args={[2.5, 128, 128]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <MeshDistortMaterial
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.1}
            metalness={1}
            color="#6366f1"
            emissive="#8b5cf6"
            emissiveIntensity={hovered ? 0.6 : 0.3}
          />
        </Sphere>

        {/* Glowing inner sphere */}
        <Sphere args={[2.3, 64, 64]}>
          <meshBasicMaterial
            color="#06b6d4"
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </Sphere>

        {/* Outer glow */}
        <Sphere args={[2.8, 32, 32]}>
          <meshBasicMaterial
            color={hovered ? "#8b5cf6" : "#6366f1"}
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </Sphere>
      </Float>
    </group>
  );
}

// Animated holographic rings
function AnimatedHolographicRings() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      ringsRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      ringsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.3;
    }
  });

  return (
    <group ref={ringsRef}>
      {[3.5, 4, 4.5, 5].map((radius, i) => (
        <Float key={i} speed={1 + i * 0.5} rotationIntensity={0.5}>
          <mesh rotation={[Math.PI / 2 + i * 0.2, 0, 0]}>
            <torusGeometry args={[radius, 0.03, 16, 100]} />
            <meshStandardMaterial
              color={['#6366f1', '#8b5cf6', '#06b6d4', '#a855f7'][i]}
              emissive={['#6366f1', '#8b5cf6', '#06b6d4', '#a855f7'][i]}
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Energy orbs floating around
function EnergyOrbs() {
  const orbs = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      position: [
        Math.cos((i / 12) * Math.PI * 2) * 6,
        Math.sin((i / 12) * Math.PI * 4) * 3,
        Math.sin((i / 12) * Math.PI * 2) * 6,
      ] as [number, number, number],
      color: ['#6366f1', '#8b5cf6', '#06b6d4'][i % 3],
      speed: 0.5 + Math.random(),
    }));
  }, []);

  return (
    <>
      {orbs.map((orb, i) => (
        <EnergyOrb key={i} {...orb} index={i} />
      ))}
    </>
  );
}

function EnergyOrb({ position, color, speed, index }: {
  position: [number, number, number];
  color: string;
  speed: number;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime * speed;
      meshRef.current.position.x = position[0] * Math.cos(time + index);
      meshRef.current.position.y = position[1] + Math.sin(time * 2 + index) * 2;
      meshRef.current.position.z = position[2] * Math.sin(time + index);

      const scale = 0.2 + Math.sin(time * 3) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />

      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>
    </mesh>
  );
}

// Floating text labels
function FloatingLabels() {
  const labels = ['DEVOPS', 'CLOUD', 'AI/ML', 'KUBERNETES'];

  return (
    <>
      {labels.map((label, i) => (
        <FloatingLabel key={label} text={label} index={i} total={labels.length} />
      ))}
    </>
  );
}

function FloatingLabel({ text, index, total }: { text: string; index: number; total: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const angle = (index / total) * Math.PI * 2;
  const radius = 8;

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime * 0.3;
      meshRef.current.position.x = Math.cos(angle + time) * radius;
      meshRef.current.position.z = Math.sin(angle + time) * radius;
      meshRef.current.position.y = Math.sin(time * 2 + index) * 2;
      meshRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={meshRef}>
      <Text
        fontSize={0.5}
        color="#06b6d4"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {text}
      </Text>
    </group>
  );
}

// Lightning effects
function LightningBolts() {
  const [bolts, setBolts] = useState<Array<{ start: THREE.Vector3; end: THREE.Vector3 }>>([]);

  useFrame((state) => {
    if (Math.random() > 0.97) {
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      const end = new THREE.Vector3(0, 0, 0);

      setBolts([{ start, end }]);
      setTimeout(() => setBolts([]), 100);
    }
  });

  return (
    <>
      {bolts.map((bolt, i) => (
        <mesh key={i}>
          <cylinderGeometry args={[0.02, 0.02, bolt.start.distanceTo(bolt.end), 8]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.8} />
        </mesh>
      ))}
    </>
  );
}

// Camera effects
function DynamicCamera() {
  const { camera } = useThree();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    camera.position.x = Math.sin(time * 0.1) * 2;
    camera.position.y = Math.cos(time * 0.15) * 1.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function ImprovedHolographicAvatar({ imageUrl = '/sagar-mountains.jpg' }) {
  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 75 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        {/* Enhanced lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#6366f1" distance={30} />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#8b5cf6" distance={30} />
        <pointLight position={[0, 10, -10]} intensity={1} color="#06b6d4" distance={25} />
        <spotLight position={[0, 20, 0]} angle={0.3} intensity={2} color="#a855f7" />

        {/* Background stars */}
        <Stars
          radius={150}
          depth={80}
          count={8000}
          factor={6}
          saturation={0.5}
          fade
          speed={2}
        />

        {/* Main components */}
        <ImprovedAvatarSphere imageUrl={imageUrl} />
        <EnhancedParticleSystem />
        <AnimatedHolographicRings />
        <EnergyOrbs />
        <FloatingLabels />
        <LightningBolts />

        {/* Camera */}
        <DynamicCamera />

        {/* User controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={8}
          maxDistance={20}
          autoRotate={true}
          autoRotateSpeed={0.5}
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* Enhanced UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-10 left-10"
        >
          <div className="holographic-text text-4xl font-bold mb-4">
            SAGAR BUDHATHOKI
          </div>
          <div className="text-cyan-400 font-mono text-xl">
            DevOps Engineer • Cloud Architect
          </div>
          <div className="text-purple-400 font-mono text-sm mt-2">
            Building the future of infrastructure
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute top-10 right-10"
        >
          <div className="text-cyan-400 font-mono text-sm space-y-1 text-right">
            <div className="flex items-center justify-end gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>NEURAL LINK: ONLINE</span>
            </div>
            <div>QUANTUM STATE: STABLE</div>
            <div>HOLOGRAPHIC SYNC: 100%</div>
            <div>PARTICLES: 5000+</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="holographic-border rounded-full px-8 py-4 backdrop-blur-md bg-slate-950/50">
            <div className="text-purple-400 font-mono text-sm text-center">
              <div className="mb-2">INTERACT WITH THE SYSTEM</div>
              <div className="flex gap-6 text-xs">
                <span>DRAG → ROTATE</span>
                <span>SCROLL → ZOOM</span>
                <span>CLICK → EXPLORE</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Animated corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-400 opacity-50"></div>
        <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-purple-400 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-blue-400 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-violet-400 opacity-50"></div>

        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-scan"></div>
        </div>
      </div>
    </div>
  );
}
