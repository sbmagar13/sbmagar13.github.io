'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, OrbitControls, Stars, RoundedBox, Html } from '@react-three/drei';
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

// 3D Project Card
function ProjectCard3D({
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
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const statusColor = {
    'Running': '#10b981',
    'In Progress': '#f59e0b',
    'Completed': '#3b82f6',
    'Maintenance': '#ef4444',
  }[project.status];

  useFrame((state) => {
    if (meshRef.current) {
      const scale = hovered || isHovered ? 1.3 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.15);

      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.15;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3 + index) * 0.05;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4 + index) * 0.3;

      // Add subtle rotation on hover
      if (hovered || isHovered) {
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <RoundedBox
          args={[2.5, 3, 0.2]}
          radius={0.1}
          smoothness={4}
          onPointerOver={() => {
            setHovered(true);
            onHover(index);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
          }}
          onClick={onClick}
        >
          <meshStandardMaterial
            color={hovered || isHovered ? '#1e293b' : '#0f172a'}
            emissive={statusColor}
            emissiveIntensity={hovered || isHovered ? 0.3 : 0.1}
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>

        {/* Status indicator */}
        <mesh position={[0, 1.3, 0.15]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color={statusColor} />
        </mesh>

        {/* Project name */}
        <Text
          position={[0, 0.8, 0.15]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
        >
          {project.name.split('-').join('\n')}
        </Text>

        {/* Namespace tag */}
        <Text
          position={[0, 0.3, 0.15]}
          fontSize={0.1}
          color="#06b6d4"
          anchorX="center"
          anchorY="middle"
        >
          {project.namespace}
        </Text>

        {/* Performance bar */}
        <group position={[0, -0.5, 0.15]}>
          <mesh>
            <planeGeometry args={[1.8, 0.1]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          <mesh position={[-(1.8 / 2) + (1.8 * project.metrics.performance / 200), 0, 0.01]}>
            <planeGeometry args={[1.8 * project.metrics.performance / 100, 0.08]} />
            <meshBasicMaterial color={statusColor} />
          </mesh>
        </group>

        {/* Tech stack icons */}
        <group position={[0, -1, 0.15]}>
          {project.tech.slice(0, 3).map((tech, i) => (
            <mesh key={i} position={[(i - 1) * 0.5, 0, 0]}>
              <circleGeometry args={[0.15, 32]} />
              <meshBasicMaterial color="#6366f1" opacity={0.7} transparent />
            </mesh>
          ))}
        </group>

        {/* Glow effect */}
        {(hovered || isHovered) && (
          <mesh>
            <boxGeometry args={[2.7, 3.2, 0.3]} />
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

// Connection beams between projects
function ProjectConnections() {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={linesRef}>
      {projects.slice(0, -1).map((_, index) => {
        const start = new THREE.Vector3(
          ((index % 3) - 1) * 4,
          Math.floor(index / 3) * -3.5,
          0
        );
        const end = new THREE.Vector3(
          (((index + 1) % 3) - 1) * 4,
          Math.floor((index + 1) / 3) * -3.5,
          0
        );

        return (
          <mesh key={index}>
            <cylinderGeometry args={[0.01, 0.01, start.distanceTo(end), 8]} />
            <meshBasicMaterial color="#6366f1" transparent opacity={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

// Data flow particles
function DataFlowParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 500;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 25;
      positions[i3 + 1] = (Math.random() - 0.5) * 25;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      colors[i3] = 0.4;
      colors[i3 + 1] = 0.6;
      colors[i3 + 2] = 1.0;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;

      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= 0.01;
        if (positions[i * 3 + 1] < -12) {
          positions[i * 3 + 1] = 12;
        }
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
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Projects3D() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projectPositions: [number, number, number][] = useMemo(() => {
    return projects.map((_, index) => [
      ((index % 3) - 1) * 4,
      Math.floor(index / 3) * -3.5,
      0,
    ]);
  }, []);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 overflow-hidden">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

        <Stars radius={100} depth={50} count={3000} factor={4} />

        <DataFlowParticles />

        {projects.map((project, index) => (
          <ProjectCard3D
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
          minDistance={8}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-8 pointer-events-none">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-5xl font-bold holographic-text mb-4">PROJECT UNIVERSE</h2>
          <p className="text-xl text-cyan-400 font-mono">
            Building the Future of DevOps & AI
          </p>
        </motion.div>
      </div>

      {/* Project Detail Panel */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 p-8 pointer-events-auto"
          >
            <div className="max-w-4xl mx-auto holographic-border rounded-t-2xl p-8 backdrop-blur-md bg-slate-950/80">
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-all"
              >
                ✕
              </button>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-3 h-3 rounded-full animate-pulse"
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
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {selectedProject.name}
                    </h3>
                    <p className="text-cyan-400 font-mono text-sm mb-4">
                      /{selectedProject.namespace}
                    </p>
                    <p className="text-gray-300">{selectedProject.description}</p>
                  </div>

                  {/* Tech stack */}
                  <div>
                    <div className="text-sm text-purple-400 font-mono mb-2">TECH STACK:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tech.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm text-blue-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex gap-4">
                    {selectedProject.links.github && (
                      <a
                        href={selectedProject.links.github}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-all"
                      >
                        <FaGithub /> GitHub
                      </a>
                    )}
                    {selectedProject.links.live && (
                      <a
                        href={selectedProject.links.live}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 border border-cyan-500/30 rounded-lg text-cyan-300 hover:bg-cyan-600/30 transition-all"
                      >
                        <FaExternalLinkAlt /> Live
                      </a>
                    )}
                    {selectedProject.links.docs && (
                      <a
                        href={selectedProject.links.docs}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-600/30 transition-all"
                      >
                        <FaBook /> Docs
                      </a>
                    )}
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  {/* Metrics */}
                  <div>
                    <div className="text-sm text-cyan-400 font-mono mb-3">METRICS:</div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Performance</span>
                          <span className="text-white font-bold">{selectedProject.metrics.performance}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all"
                            style={{ width: `${selectedProject.metrics.performance}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">Reliability</span>
                          <span className="text-white font-bold">{selectedProject.metrics.reliability}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-400 transition-all"
                            style={{ width: `${selectedProject.metrics.reliability}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                        <span className="text-sm text-gray-400">Uptime</span>
                        <span className="text-green-400 font-bold font-mono">{selectedProject.metrics.uptime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Logs */}
                  <div>
                    <div className="text-sm text-green-400 font-mono mb-2">RECENT LOGS:</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto text-xs font-mono bg-black/50 p-3 rounded-lg">
                      {selectedProject.logs.slice(0, 5).map((log, i) => (
                        <div key={i} className="text-green-400">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-8 left-8 text-purple-400 font-mono text-xs space-y-1 pointer-events-none">
        <div>DRAG: Rotate universe</div>
        <div>SCROLL: Zoom</div>
        <div>CLICK: View details</div>
      </div>

      {/* Stats */}
      <div className="absolute top-24 right-8 space-y-3 pointer-events-none">
        <div className="holographic-border rounded-lg p-4 backdrop-blur-sm bg-slate-950/50">
          <div className="text-sm text-cyan-400 font-mono">TOTAL PROJECTS</div>
          <div className="text-3xl font-bold text-white">{projects.length}</div>
        </div>
        <div className="holographic-border rounded-lg p-4 backdrop-blur-sm bg-slate-950/50">
          <div className="text-sm text-purple-400 font-mono">RUNNING</div>
          <div className="text-3xl font-bold text-green-400">
            {projects.filter(p => p.status === 'Running').length}
          </div>
        </div>
        <div className="holographic-border rounded-lg p-4 backdrop-blur-sm bg-slate-950/50">
          <div className="text-sm text-blue-400 font-mono">IN PROGRESS</div>
          <div className="text-3xl font-bold text-yellow-400">
            {projects.filter(p => p.status === 'In Progress').length}
          </div>
        </div>
      </div>
    </div>
  );
}
