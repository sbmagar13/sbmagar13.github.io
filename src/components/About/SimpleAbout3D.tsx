'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Stars } from '@react-three/drei';
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
    position: [-4, 2, -1],
    color: '#8b5cf6',
    achievements: ['K8s certification', 'Microservices architecture', 'Docker expertise', 'Helm charts'],
    icon: '☸️',
  },
  {
    year: '2022',
    title: 'Infrastructure as Code',
    description: 'Mastered Terraform and automated infrastructure provisioning',
    position: [0, -1, 1],
    color: '#06b6d4',
    achievements: ['Multi-cloud deployments', 'Terraform modules', 'IaC best practices', 'GitOps workflows'],
    icon: '🏗️',
  },
  {
    year: '2023',
    title: 'AI & Automation',
    description: 'Integrated AI/ML into DevOps workflows and monitoring',
    position: [4, 1, -1],
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

// Simple Timeline Node
function SimpleTimelineNode({ node, index, onHover, isHovered, onClick }: {
  node: JourneyNode;
  index: number;
  onHover: (index: number | null) => void;
  isHovered: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = isHovered ? 2.0 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 + index;
    }
  });

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => onHover(index)}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isHovered ? 1.0 : 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Year label */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {node.year}
      </Text>

      {/* Icon */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.5}
        anchorX="center"
        anchorY="middle"
      >
        {node.icon}
      </Text>
    </group>
  );
}

// Simple connection line
function SimpleConnections() {
  return (
    <>
      {journeyData.slice(0, -1).map((node, i) => {
        const nextNode = journeyData[i + 1];
        const start = new THREE.Vector3(...node.position);
        const end = new THREE.Vector3(...nextNode.position);
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const distance = start.distanceTo(end);

        return (
          <mesh key={i} position={mid}>
            <cylinderGeometry args={[0.05, 0.05, distance, 8]} />
            <meshStandardMaterial
              color={node.color}
              emissive={node.color}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </>
  );
}

export default function SimpleAbout3D() {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const currentNode = selectedNode !== null ? journeyData[selectedNode] : null;

  return (
    <div className="w-screen h-screen fixed top-0 left-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 2, 20], fov: 65 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Very bright lighting */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[0, 10, 0]} intensity={3} color="#6366f1" />
        <pointLight position={[10, 0, 10]} intensity={2} color="#8b5cf6" />
        <pointLight position={[-10, 0, -10]} intensity={2} color="#06b6d4" />

        {/* Background */}
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

        {/* Connections */}
        <SimpleConnections />

        {/* Timeline nodes */}
        {journeyData.map((node, index) => (
          <SimpleTimelineNode
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
          minDistance={10}
          maxDistance={35}
          makeDefault
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-8 pointer-events-none z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold holographic-text mb-2 md:mb-4">
            MY JOURNEY TIMELINE
          </h2>
          <p className="text-base md:text-2xl text-cyan-400 font-mono">
            5 Years of DevOps Excellence
          </p>
        </motion.div>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {currentNode && (
          <motion.div
            initial={{ y: 600 }}
            animate={{ y: 0 }}
            exit={{ y: 600 }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute bottom-0 left-0 right-0 p-4 md:p-8 pointer-events-auto z-50"
          >
            <div className="max-w-4xl mx-auto holographic-border rounded-t-3xl p-6 md:p-8 backdrop-blur-xl bg-slate-950/95">
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-all text-xl font-bold"
              >
                ✕
              </button>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{currentNode.icon}</div>
                    <div>
                      <div
                        className="text-4xl font-bold mb-2"
                        style={{ color: currentNode.color }}
                      >
                        {currentNode.year}
                      </div>
                      <div className="text-2xl font-bold text-white">{currentNode.title}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-base">{currentNode.description}</p>
                </div>

                {/* Right column */}
                <div className="space-y-3">
                  <div className="text-sm text-cyan-400 font-mono font-bold">KEY ACHIEVEMENTS:</div>
                  {currentNode.achievements.map((achievement, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: currentNode.color }}
                      ></div>
                      <span className="text-white text-sm">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute right-4 bottom-6 md:right-8 md:bottom-8 w-[280px] md:w-[320px] holographic-border rounded-lg p-4 md:p-5 backdrop-blur-md bg-slate-950/90 pointer-events-auto z-20"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400">
            <Image
              src="/sagar-mountains.jpg"
              alt="Sagar"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Sagar Budhathoki</h3>
            <p className="text-xs text-cyan-400 font-mono">DevOps Architect</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Experience</span>
            <span className="text-white font-bold">5+ Years</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Deployments</span>
            <span className="text-white font-bold">10,000+</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Systems</span>
            <span className="text-white font-bold">100+</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Uptime</span>
            <span className="text-green-500 font-bold">99.99%</span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="absolute bottom-6 left-4 md:bottom-8 md:left-8 text-purple-400 font-mono text-xs md:text-sm space-y-1 pointer-events-none z-20">
        <div className="font-bold mb-2">CONTROLS:</div>
        <div>DRAG → Rotate</div>
        <div>SCROLL → Zoom</div>
        <div>CLICK NODE → Details</div>
      </div>
    </div>
  );
}
