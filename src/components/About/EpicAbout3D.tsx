'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, OrbitControls, Stars, Line, MeshReflectorMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import Image from 'next/image';

interface JourneyNode {
  year: string;
  title: string;
  description: string;
  position: [number, number, number];
  color: string;
  achievements: string[];
  icon: string;
}

const journeyData: JourneyNode[] = [
  {
    year: '2020',
    title: 'Journey Begins',
    description: 'Started career in DevOps, discovering the power of automation',
    position: [-8, 0, 0],
    color: '#6366f1',
    achievements: ['First CI/CD pipeline', 'Linux mastery', 'Cloud fundamentals', 'Docker basics'],
    icon: '🚀',
  },
  {
    year: '2021',
    title: 'Cloud Native Era',
    description: 'Deep dive into Kubernetes and container orchestration',
    position: [-4, 3, -2],
    color: '#8b5cf6',
    achievements: ['K8s certification', 'Microservices architecture', 'Docker expertise', 'Helm charts'],
    icon: '☸️',
  },
  {
    year: '2022',
    title: 'Infrastructure as Code',
    description: 'Mastered Terraform and automated infrastructure provisioning',
    position: [0, -2, 2],
    color: '#06b6d4',
    achievements: ['Multi-cloud deployments', 'Terraform modules', 'IaC best practices', 'GitOps workflows'],
    icon: '🏗️',
  },
  {
    year: '2023',
    title: 'AI & Automation',
    description: 'Integrated AI/ML into DevOps workflows and monitoring',
    position: [4, 2, -2],
    color: '#a855f7',
    achievements: ['AI-powered monitoring', 'Predictive scaling', 'Intelligent automation', 'ML Ops'],
    icon: '🤖',
  },
  {
    year: '2024',
    title: 'Elite Engineer',
    description: 'Building next-gen infrastructure with cutting-edge tech',
    position: [8, 0, 0],
    color: '#3b82f6',
    achievements: ['MCP frameworks', 'AI agent systems', 'Platform engineering', 'Cloud architecture'],
    icon: '⚡',
  },
];

// Epic 3D Timeline Node with real depth
function EpicTimelineNode({ node, index, onHover, isHovered, onClick }: {
  node: JourneyNode;
  index: number;
  onHover: (index: number | null) => void;
  isHovered: boolean;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      const active = hovered || isHovered;
      const targetScale = active ? 2.5 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);

      // Multi-axis rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5 + index;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.4) * 0.2;

      // Floating animation
      groupRef.current.position.y = node.position[1] + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.4;

      // Glow pulsing on hover
      if (active) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
        groupRef.current.scale.multiplyScalar(pulse);
      }
    }
  });

  return (
    <group position={node.position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group
          ref={groupRef}
          onPointerOver={() => {
            setHovered(true);
            onHover(index);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {/* Main 3D octahedron body - REAL DEPTH */}
          <mesh castShadow receiveShadow>
            <octahedronGeometry args={[0.6, 1]} />
            <meshStandardMaterial
              color={node.color}
              emissive={node.color}
              emissiveIntensity={hovered || isHovered ? 1.0 : 0.4}
              metalness={0.9}
              roughness={0.2}
              transparent
              opacity={0.95}
            />
          </mesh>

          {/* Glass crystal overlay */}
          <mesh>
            <octahedronGeometry args={[0.7, 1]} />
            <meshPhysicalMaterial
              transmission={0.9}
              opacity={0.5}
              metalness={0.1}
              roughness={0}
              transparent
              color={node.color}
            />
          </mesh>

          {/* Inner energy core */}
          <mesh>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshBasicMaterial
              color={node.color}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Outer glow shell */}
          {(hovered || isHovered) && (
            <mesh>
              <octahedronGeometry args={[1.0, 0]} />
              <meshBasicMaterial
                color={node.color}
                transparent
                opacity={0.15}
                side={THREE.BackSide}
              />
            </mesh>
          )}

          {/* Pulsing rings */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.9, 0.03, 16, 100]} />
            <meshBasicMaterial
              color={node.color}
              transparent
              opacity={hovered || isHovered ? 0.8 : 0.4}
            />
          </mesh>

          {/* Year label on top */}
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.4}
            color={node.color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
            font-weight="bold"
          >
            {node.year}
          </Text>

          {/* Icon emoji */}
          <Text
            position={[0, -1.2, 0]}
            fontSize={0.5}
            anchorX="center"
            anchorY="middle"
          >
            {node.icon}
          </Text>

          {/* Particle ring on hover */}
          {(hovered || isHovered) && <NodeParticleRing color={node.color} />}
        </group>
      </Float>
    </group>
  );
}

// Particle ring around timeline node
function NodeParticleRing({ color }: { color: string }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 40;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const radius = 1.5;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 3;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color={color}
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Epic connection lines between nodes
function EpicTimelineConnections() {
  const points = useMemo(() => {
    return journeyData.map(node => new THREE.Vector3(...node.position));
  }, []);

  return (
    <>
      <Line
        points={points}
        color="#6366f1"
        lineWidth={3}
        transparent
        opacity={0.6}
      />

      {/* Add glowing tube along the line */}
      {points.slice(0, -1).map((point, i) => {
        const nextPoint = points[i + 1];
        const direction = new THREE.Vector3().subVectors(nextPoint, point);
        const length = direction.length();
        const midpoint = new THREE.Vector3().addVectors(point, nextPoint).multiplyScalar(0.5);

        return (
          <mesh key={i} position={midpoint}>
            <cylinderGeometry args={[0.08, 0.08, length, 16]} />
            <meshStandardMaterial
              color={journeyData[i].color}
              emissive={journeyData[i].color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.4}
            />
          </mesh>
        );
      })}
    </>
  );
}

// Floating year markers
function FloatingYearMarkers() {
  return (
    <>
      {journeyData.map((node, i) => (
        <FloatingMarker key={node.year} node={node} index={i} />
      ))}
    </>
  );
}

function FloatingMarker({ node, index }: { node: JourneyNode; index: number }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = node.position[1] + 4 + Math.sin(state.clock.elapsedTime + index) * 0.5;
      meshRef.current.lookAt(0, meshRef.current.position.y, 0);
    }
  });

  return (
    <group ref={meshRef} position={[node.position[0], node.position[1] + 4, node.position[2]]}>
      <Float speed={1.5} floatIntensity={0.3}>
        {/* Background panel */}
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[2.5, 0.8]} />
          <meshBasicMaterial
            color={node.color}
            transparent
            opacity={0.2}
          />
        </mesh>

        {/* Title text */}
        <Text
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {node.title.toUpperCase()}
        </Text>
      </Float>
    </group>
  );
}

// Epic floor with reflections
function EpicFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={2048}
        mixBlur={1}
        mixStrength={50}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0a0a0a"
        metalness={0.8}
      />
    </mesh>
  );
}

export default function EpicAbout3D() {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const currentNode = selectedNode !== null ? journeyData[selectedNode] : null;

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 2, 20], fov: 65 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        {/* Epic lighting - Increased for visibility */}
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={3} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#8b5cf6" />
        <pointLight position={[0, 15, 0]} intensity={3} color="#06b6d4" />
        <pointLight position={[10, 0, 10]} intensity={2} color="#a855f7" />
        <pointLight position={[-10, 0, -10]} intensity={2} color="#3b82f6" />
        <spotLight
          position={[0, 25, 0]}
          angle={0.6}
          intensity={4}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Background */}
        <Stars radius={150} depth={80} count={8000} factor={6} fade speed={2} />

        {/* Floor reflection */}
        <EpicFloor />

        {/* Timeline connections */}
        <EpicTimelineConnections />

        {/* Floating markers */}
        <FloatingYearMarkers />

        {/* Timeline nodes */}
        {journeyData.map((node, index) => (
          <EpicTimelineNode
            key={node.year}
            node={node}
            index={index}
            onHover={setHoveredNode}
            isHovered={hoveredNode === index}
            onClick={() => setSelectedNode(index)}
          />
        ))}

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={12}
          maxDistance={35}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          autoRotate={false}
          autoRotateSpeed={0.3}
        />
      </Canvas>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-8 pointer-events-none z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold holographic-text mb-2 md:mb-4">EPIC JOURNEY TIMELINE</h2>
          <p className="text-base md:text-2xl text-cyan-400 font-mono">
            From First Deployment to Elite DevOps Engineering • 5 Years
          </p>
        </motion.div>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {currentNode && (
          <motion.div
            initial={{ y: 600, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 600, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 p-8 pointer-events-auto z-50"
          >
            <div className="max-w-5xl mx-auto holographic-border rounded-t-3xl p-8 backdrop-blur-xl bg-slate-950/95">
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-all text-xl font-bold"
              >
                ✕
              </button>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Left column */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{currentNode.icon}</div>
                    <div>
                      <div
                        className="text-5xl font-bold mb-2"
                        style={{ color: currentNode.color }}
                      >
                        {currentNode.year}
                      </div>
                      <div className="text-2xl font-bold text-white">{currentNode.title}</div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-lg leading-relaxed">{currentNode.description}</p>
                </motion.div>

                {/* Right column */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-sm text-cyan-400 font-mono font-bold mb-4">KEY ACHIEVEMENTS:</div>
                  {currentNode.achievements.map((achievement, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: currentNode.color }}
                      ></div>
                      <span className="text-white font-mono">{achievement}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute right-4 bottom-6 md:right-8 md:bottom-8 w-[280px] md:w-[320px] holographic-border rounded-lg p-4 md:p-5 backdrop-blur-md bg-slate-950/90 pointer-events-auto z-20"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-400">
            <Image
              src="/sagar-mountains.jpg"
              alt="Sagar Budhathoki"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Sagar Budhathoki</h3>
            <p className="text-sm text-cyan-400 font-mono">DevOps Architect</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Experience</span>
            <span className="text-white font-bold">5+ Years</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Deployments</span>
            <span className="text-white font-bold">10,000+</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Systems</span>
            <span className="text-white font-bold">100+</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Uptime</span>
            <span className="text-green-500 font-bold">99.99%</span>
          </div>
        </div>
      </motion.div>

      {/* Controls Hint */}
      <div className="absolute bottom-6 left-4 md:bottom-8 md:left-8 text-purple-400 font-mono text-xs md:text-sm space-y-1 pointer-events-none z-20">
        <div className="font-bold mb-2">CONTROLS:</div>
        <div>DRAG → Rotate view</div>
        <div>SCROLL → Zoom</div>
        <div>CLICK NODE → View milestone</div>
      </div>
    </div>
  );
}
