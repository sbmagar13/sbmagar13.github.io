'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, OrbitControls, Stars, Trail, Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import Image from 'next/image';

interface JourneyNode {
  year: string;
  title: string;
  description: string;
  position: [number, number, number];
  color: string;
  achievements: string[];
}

const journeyData: JourneyNode[] = [
  {
    year: '2020',
    title: 'Journey Begins',
    description: 'Started career in DevOps, discovering the power of automation',
    position: [-6, 0, 0],
    color: '#6366f1',
    achievements: ['First CI/CD pipeline', 'Linux mastery', 'Cloud fundamentals'],
  },
  {
    year: '2021',
    title: 'Cloud Native',
    description: 'Deep dive into Kubernetes and container orchestration',
    position: [-3, 2, -1],
    color: '#8b5cf6',
    achievements: ['K8s certification', 'Microservices architecture', 'Docker expertise'],
  },
  {
    year: '2022',
    title: 'Infrastructure as Code',
    description: 'Mastered Terraform and automated infrastructure provisioning',
    position: [0, -1, 1],
    color: '#06b6d4',
    achievements: ['Multi-cloud deployments', 'Terraform modules', 'IaC best practices'],
  },
  {
    year: '2023',
    title: 'AI & Automation',
    description: 'Integrated AI/ML into DevOps workflows and monitoring',
    position: [3, 1, -1],
    color: '#a855f7',
    achievements: ['AI-powered monitoring', 'Predictive scaling', 'Intelligent automation'],
  },
  {
    year: '2024',
    title: 'Elite Engineer',
    description: 'Building next-gen infrastructure with cutting-edge tech',
    position: [6, 0, 0],
    color: '#3b82f6',
    achievements: ['MCP frameworks', 'AI agent systems', 'Platform engineering'],
  },
];

// Timeline node in 3D space
function TimelineNode({ node, index, onHover, isHovered }: {
  node: JourneyNode;
  index: number;
  onHover: (index: number | null) => void;
  isHovered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = isHovered ? 1.8 : clicked ? 1.5 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.15);
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.7 + index;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;

      // Glow pulsing on hover
      if (isHovered) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
        meshRef.current.scale.multiplyScalar(pulse);
      }
    }
  });

  return (
    <group position={node.position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          onPointerOver={() => onHover(index)}
          onPointerOut={() => onHover(null)}
          onClick={() => setClicked(!clicked)}
        >
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={isHovered ? 0.8 : 0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Pulsing ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.02, 16, 100]} />
          <meshBasicMaterial
            color={node.color}
            transparent
            opacity={isHovered ? 0.8 : 0.3}
          />
        </mesh>

        {/* Year label */}
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.3}
          color={node.color}
          anchorX="center"
          anchorY="middle"
        >
          {node.year}
        </Text>
      </Float>
    </group>
  );
}

// Connection lines between nodes
function TimelineConnections() {
  const points = useMemo(() => {
    return journeyData.map(node => new THREE.Vector3(...node.position));
  }, []);

  return (
    <Line
      points={points}
      color="#6366f1"
      lineWidth={2}
      transparent
      opacity={0.3}
    />
  );
}

// Floating avatar sphere
function AvatarSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={[0, -3, 2]}>
        <Sphere args={[0.8, 32, 32]}>
          <meshStandardMaterial
            color="#6366f1"
            emissive="#8b5cf6"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
            wireframe={false}
          />
        </Sphere>
        {/* Orbital rings */}
        {[1.2, 1.5, 1.8].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
            <torusGeometry args={[radius, 0.01, 16, 100]} />
            <meshBasicMaterial
              color={i === 0 ? '#6366f1' : i === 1 ? '#8b5cf6' : '#06b6d4'}
              transparent
              opacity={0.4}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Particle field representing skills
function SkillParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 1000;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      const colorChoice = Math.random();
      if (colorChoice < 0.5) {
        colors[i3] = 0.4;
        colors[i3 + 1] = 0.6;
        colors[i3 + 2] = 1.0;
      } else {
        colors[i3] = 0.6;
        colors[i3 + 1] = 0.3;
        colors[i3 + 2] = 1.0;
      }
    }

    return { positions, colors };
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005;
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
        size={0.05}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function About3D() {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const currentNode = selectedNode !== null ? journeyData[selectedNode] : hoveredNode !== null ? journeyData[hoveredNode] : null;

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

        <Stars radius={100} depth={50} count={3000} factor={4} />

        <SkillParticles />
        <TimelineConnections />
        <AvatarSphere />

        {journeyData.map((node, index) => (
          <TimelineNode
            key={node.year}
            node={node}
            index={index}
            onHover={(idx) => {
              setHoveredNode(idx);
              if (idx !== null) setSelectedNode(idx);
            }}
            isHovered={hoveredNode === index}
          />
        ))}

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={5}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-8 pointer-events-none">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-5xl font-bold holographic-text mb-4">MY JOURNEY</h2>
          <p className="text-xl text-cyan-400 font-mono">
            From First Deployment to Elite DevOps Engineering
          </p>
        </motion.div>
      </div>

      {/* Info Panel */}
      {currentNode && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 w-96 holographic-border rounded-lg p-6 backdrop-blur-md bg-slate-950/50"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-4 h-4 rounded-full animate-pulse"
                style={{ backgroundColor: currentNode.color }}
              ></div>
              <h3 className="text-3xl font-bold" style={{ color: currentNode.color }}>
                {currentNode.year}
              </h3>
            </div>

            <h4 className="text-2xl font-bold text-white">{currentNode.title}</h4>
            <p className="text-gray-300">{currentNode.description}</p>

            <div className="space-y-2">
              <div className="text-sm text-cyan-400 font-mono">KEY ACHIEVEMENTS:</div>
              {currentNode.achievements.map((achievement, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-2 text-sm text-gray-300"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>{achievement}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Profile Card */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute right-8 bottom-8 w-80 holographic-border rounded-lg p-6 backdrop-blur-md bg-slate-950/50"
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
            <span className="text-white font-bold">4+ Years</span>
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
      <div className="absolute bottom-8 left-8 text-purple-400 font-mono text-xs space-y-1">
        <div>DRAG: Rotate view</div>
        <div>SCROLL: Zoom</div>
        <div>CLICK NODE: Select milestone</div>
      </div>
    </div>
  );
}
