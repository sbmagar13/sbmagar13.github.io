'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, OrbitControls, Stars, MeshReflectorMaterial, useTexture, Sphere, Box } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { FaGithub, FaExternalLinkAlt, FaBook } from 'react-icons/fa';

interface Project {
  id: number;
  name: string;
  namespace: string;
  description: string;
  tech: string[];
  status: 'Running' | 'Completed' | 'Maintenance' | 'In Progress';
  metrics: {
    uptime: string;
    performance: number;
    reliability: number;
  };
  links: {
    github?: string;
    live?: string;
    docs?: string;
  };
  logs: string[];
}

const projects: Project[] = [
  {
    id: 10,
    name: 'kubernetes-cluster-planner',
    namespace: 'infrastructure',
    description: 'Planning tool for Kubernetes cluster architecture and resource allocation',
    tech: ['Kubernetes', 'Go', 'Infrastructure'],
    status: 'In Progress',
    metrics: { uptime: 'N/A', performance: 60, reliability: 65 },
    links: { github: '#' },
    logs: ['2025-03-28T16:30:10Z [INFO] Initial architecture design completed'],
  },
  {
    id: 11,
    name: 'mcp-agent-framework',
    namespace: 'ai',
    description: 'Framework for building specialized MCP agents with domain knowledge',
    tech: ['TypeScript', 'MCP', 'AI Agents'],
    status: 'In Progress',
    metrics: { uptime: 'N/A', performance: 55, reliability: 60 },
    links: { github: '#' },
    logs: ['2025-03-28T15:50:10Z [INFO] Core agent interface defined'],
  },
  {
    id: 12,
    name: 'llm-infra-analyzer',
    namespace: 'ai',
    description: 'AI-powered tool for infrastructure analysis and optimization',
    tech: ['Python', 'LLMs', 'Terraform'],
    status: 'In Progress',
    metrics: { uptime: 'N/A', performance: 50, reliability: 55 },
    links: { github: '#' },
    logs: ['2025-03-28T16:40:10Z [INFO] Started building training dataset'],
  },
  {
    id: 2,
    name: 'devops-ai-assistant',
    namespace: 'ai',
    description: 'AI assistant for automating routine DevOps tasks',
    tech: ['Python', 'AI Agents', 'MCP', 'LLMs'],
    status: 'Running',
    metrics: { uptime: '99.5%', performance: 85, reliability: 88 },
    links: { github: '#', docs: '#' },
    logs: ['2025-03-28T15:45:10Z [INFO] Agent task completed successfully'],
  },
  {
    id: 7,
    name: 'llm-powered-documentation',
    namespace: 'ai',
    description: 'Auto-generate comprehensive documentation using LLMs',
    tech: ['Python', 'LLMs', 'NLP'],
    status: 'Running',
    metrics: { uptime: '97.2%', performance: 82, reliability: 85 },
    links: { github: '#', docs: '#' },
    logs: ['2025-03-28T16:10:15Z [INFO] Documentation generated for project X'],
  },
];

// Epic 3D Project Card with real depth
function Epic3DProjectCard({
  project,
  position,
  index,
  onHover,
  isHovered,
  onClick
}: {
  project: Project;
  position: [number, number, number];
  index: number;
  onHover: (index: number | null) => void;
  isHovered: boolean;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const statusColor = {
    'Running': '#10b981',
    'In Progress': '#f59e0b',
    'Completed': '#3b82f6',
    'Maintenance': '#ef4444',
  }[project.status];

  useFrame((state) => {
    if (groupRef.current) {
      const active = hovered || isHovered;
      const targetScale = active ? 1.5 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);

      // Smooth floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.4;

      // Rotation on multiple axes
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.2;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2 + index) * 0.1;

      if (active) {
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      } else {
        groupRef.current.rotation.z = 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh
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
          castShadow
          receiveShadow
        >
          {/* Main card body with depth */}
          <boxGeometry args={[3, 4, 0.3]} />
          <meshStandardMaterial
            color={hovered || isHovered ? '#1e3a5f' : '#0f172a'}
            emissive={statusColor}
            emissiveIntensity={hovered || isHovered ? 0.4 : 0.15}
            metalness={0.9}
            roughness={0.2}
            transparent
            opacity={0.95}
          />
        </mesh>

        {/* Glass overlay for depth */}
        <mesh position={[0, 0, 0.16]}>
          <boxGeometry args={[2.9, 3.9, 0.02]} />
          <meshPhysicalMaterial
            color="#6366f1"
            transmission={0.9}
            opacity={0.3}
            metalness={0.1}
            roughness={0}
            transparent
          />
        </mesh>

        {/* Glowing edge frame */}
        <mesh position={[0, 0, 0.17]}>
          <boxGeometry args={[3.1, 4.1, 0.01]} />
          <meshBasicMaterial
            color={statusColor}
            transparent
            opacity={hovered || isHovered ? 0.6 : 0.3}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Status orb */}
        <Float speed={2} floatIntensity={0.5}>
          <mesh position={[0, 1.7, 0.2]}>
            <sphereGeometry args={[0.12, 32, 32]} />
            <meshStandardMaterial
              color={statusColor}
              emissive={statusColor}
              emissiveIntensity={2}
            />
            {/* Glow halo */}
            <mesh>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial
                color={statusColor}
                transparent
                opacity={0.3}
                side={THREE.BackSide}
              />
            </mesh>
          </mesh>
        </Float>

        {/* Project name (3D text effect) */}
        <Text
          position={[0, 0.8, 0.2]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {project.name.split('-').join(' ').toUpperCase()}
        </Text>

        {/* Namespace tag */}
        <mesh position={[0, 0.3, 0.2]}>
          <planeGeometry args={[1.5, 0.3]} />
          <meshBasicMaterial
            color="#06b6d4"
            transparent
            opacity={0.3}
          />
        </mesh>
        <Text
          position={[0, 0.3, 0.21]}
          fontSize={0.12}
          color="#06b6d4"
          anchorX="center"
          anchorY="middle"
        >
          {project.namespace.toUpperCase()}
        </Text>

        {/* Performance bars */}
        <group position={[0, -0.5, 0.2]}>
          {/* Performance */}
          <mesh position={[0, 0.3, 0]}>
            <planeGeometry args={[2.4, 0.15]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          <mesh position={[-1.2 + (2.4 * project.metrics.performance / 200), 0.3, 0.01]}>
            <planeGeometry args={[2.4 * project.metrics.performance / 100, 0.12]} />
            <meshBasicMaterial color={statusColor} />
          </mesh>
          <Text position={[-1.1, 0.45, 0.02]} fontSize={0.08} color="#9ca3af">PERFORMANCE</Text>

          {/* Reliability */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2.4, 0.15]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          <mesh position={[-1.2 + (2.4 * project.metrics.reliability / 200), 0, 0.01]}>
            <planeGeometry args={[2.4 * project.metrics.reliability / 100, 0.12]} />
            <meshBasicMaterial color={statusColor} />
          </mesh>
          <Text position={[-1.1, 0.15, 0.02]} fontSize={0.08} color="#9ca3af">RELIABILITY</Text>
        </group>

        {/* Tech stack orbs */}
        <group position={[0, -1.3, 0.2]}>
          {project.tech.slice(0, 3).map((tech, i) => (
            <Float key={i} speed={1.5 + i * 0.3} floatIntensity={0.3}>
              <mesh position={[(i - 1) * 0.7, 0, 0]}>
                <sphereGeometry args={[0.18, 32, 32]} />
                <meshStandardMaterial
                  color="#6366f1"
                  emissive="#8b5cf6"
                  emissiveIntensity={0.5}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
            </Float>
          ))}
        </group>

        {/* Particle effects around card */}
        {(hovered || isHovered) && <CardParticles />}

        {/* Outer glow when hovered */}
        {(hovered || isHovered) && (
          <mesh>
            <boxGeometry args={[3.5, 4.5, 0.4]} />
            <meshBasicMaterial
              color={statusColor}
              transparent
              opacity={0.1}
              side={THREE.BackSide}
            />
          </mesh>
        )}
      </Float>
    </group>
  );
}

// Particle effects around card
function CardParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 50;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.z = state.clock.elapsedTime * 0.5;
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
        size={0.08}
        color="#6366f1"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Epic floor reflection
function EpicFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -7, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
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

export default function EpicProjects3D() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projectPositions: [number, number, number][] = useMemo(() => {
    return projects.map((_, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      return [
        (col - 1) * 4.5,
        -row * 5.5, // Negative to go down, but camera will adjust
        0,
      ];
    });
  }, []);

  return (
    <div className="w-screen h-screen fixed top-0 left-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 0, 18], fov: 70 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        {/* Epic Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#6366f1" castShadow />
        <pointLight position={[-10, 10, -10]} intensity={1.5} color="#8b5cf6" castShadow />
        <spotLight
          position={[0, 20, 0]}
          angle={0.5}
          intensity={2}
          color="#06b6d4"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Background */}
        <Stars radius={150} depth={80} count={8000} factor={6} fade speed={2} />

        {/* Floor reflection */}
        <EpicFloor />

        {/* Project cards */}
        {projects.map((project, index) => (
          <Epic3DProjectCard
            key={project.id}
            project={project}
            position={projectPositions[index]}
            index={index}
            onHover={setHoveredIndex}
            isHovered={hoveredIndex === index}
            onClick={() => setSelectedProject(project)}
          />
        ))}

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={10}
          maxDistance={30}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          autoRotate={false}
          autoRotateSpeed={0.3}
          makeDefault
          target={[0, 0, 0]}
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
          <h2 className="text-4xl md:text-6xl font-bold holographic-text mb-2 md:mb-4">PROJECT UNIVERSE</h2>
          <p className="text-base md:text-2xl text-cyan-400 font-mono">
            Click Any Card to Explore
          </p>
        </motion.div>
      </div>

      {/* Project Detail Panel */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ y: 800, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 800, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 p-8 pointer-events-auto z-50"
          >
            <div className="max-w-6xl mx-auto holographic-border rounded-t-3xl p-8 backdrop-blur-xl bg-slate-950/95 shadow-2xl">
              <button
                onClick={() => setSelectedProject(null)}
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
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-4 h-4 rounded-full animate-pulse"
                        style={{
                          backgroundColor: {
                            'Running': '#10b981',
                            'In Progress': '#f59e0b',
                            'Completed': '#3b82f6',
                            'Maintenance': '#ef4444',
                          }[selectedProject.status],
                        }}
                      ></div>
                      <span className="text-sm text-gray-400 font-mono">
                        {selectedProject.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-3 holographic-text">
                      {selectedProject.name}
                    </h3>
                    <p className="text-cyan-400 font-mono text-sm mb-4">
                      /{selectedProject.namespace}
                    </p>
                    <p className="text-gray-300 text-lg">{selectedProject.description}</p>
                  </div>

                  {/* Tech stack */}
                  <div>
                    <div className="text-sm text-purple-400 font-mono mb-3 font-bold">TECH STACK:</div>
                    <div className="flex flex-wrap gap-3">
                      {selectedProject.tech.map((tech) => (
                        <motion.span
                          key={tech}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/50 rounded-full text-sm text-blue-300 font-mono"
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex gap-4">
                    {selectedProject.links.github && (
                      <a
                        href={selectedProject.links.github}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/40 transition-all font-mono"
                      >
                        <FaGithub size={20} /> GitHub
                      </a>
                    )}
                    {selectedProject.links.live && (
                      <a
                        href={selectedProject.links.live}
                        className="flex items-center gap-2 px-6 py-3 bg-cyan-600/20 border border-cyan-500/30 rounded-lg text-cyan-300 hover:bg-cyan-600/40 transition-all font-mono"
                      >
                        <FaExternalLinkAlt size={18} /> Live
                      </a>
                    )}
                    {selectedProject.links.docs && (
                      <a
                        href={selectedProject.links.docs}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-600/40 transition-all font-mono"
                      >
                        <FaBook size={18} /> Docs
                      </a>
                    )}
                  </div>
                </motion.div>

                {/* Right column */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  {/* Metrics */}
                  <div>
                    <div className="text-sm text-cyan-400 font-mono mb-4 font-bold">METRICS:</div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-400 font-mono">Performance</span>
                          <span className="text-white font-bold font-mono">{selectedProject.metrics.performance}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedProject.metrics.performance}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                          ></motion.div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-400 font-mono">Reliability</span>
                          <span className="text-white font-bold font-mono">{selectedProject.metrics.reliability}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedProject.metrics.reliability}%` }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-400"
                          ></motion.div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <span className="text-sm text-gray-400 font-mono">Uptime</span>
                        <span className="text-green-400 font-bold font-mono text-lg">{selectedProject.metrics.uptime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Logs */}
                  <div>
                    <div className="text-sm text-green-400 font-mono mb-3 font-bold">RECENT LOGS:</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto text-xs font-mono bg-black/70 p-4 rounded-lg border border-green-500/30">
                      {selectedProject.logs.slice(0, 5).map((log, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="text-green-400"
                        >
                          {log}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-6 left-4 md:bottom-8 md:left-8 text-purple-400 font-mono text-xs md:text-sm space-y-1 pointer-events-none z-20">
        <div className="font-bold mb-2">CONTROLS:</div>
        <div>DRAG → Rotate view</div>
        <div>SCROLL → Zoom in/out</div>
        <div>CLICK → Explore project</div>
      </div>

      {/* Stats */}
      <div className="absolute top-24 md:top-32 right-4 md:right-8 space-y-2 md:space-y-3 pointer-events-none z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="holographic-border rounded-lg p-3 md:p-4 backdrop-blur-sm bg-slate-950/90 w-[120px] md:w-auto"
        >
          <div className="text-sm text-cyan-400 font-mono">TOTAL PROJECTS</div>
          <div className="text-4xl font-bold text-white">{projects.length}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="holographic-border rounded-lg p-3 md:p-4 backdrop-blur-sm bg-slate-950/90 w-[120px] md:w-auto"
        >
          <div className="text-sm text-purple-400 font-mono">RUNNING</div>
          <div className="text-4xl font-bold text-green-400">
            {projects.filter(p => p.status === 'Running').length}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="holographic-border rounded-lg p-3 md:p-4 backdrop-blur-sm bg-slate-950/90 w-[120px] md:w-auto"
        >
          <div className="text-sm text-blue-400 font-mono">IN PROGRESS</div>
          <div className="text-4xl font-bold text-yellow-400">
            {projects.filter(p => p.status === 'In Progress').length}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
