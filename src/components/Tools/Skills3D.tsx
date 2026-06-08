'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, OrbitControls, Stars, Sphere, Trail } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

interface Skill {
  name: string;
  category: string;
  proficiency: number; // 0-100
  color: string;
  position?: [number, number, number];
}

const skillsData: Skill[] = [
  // Infrastructure
  { name: 'Kubernetes', category: 'Infrastructure', proficiency: 92, color: '#6366f1' },
  { name: 'Docker', category: 'Infrastructure', proficiency: 88, color: '#3b82f6' },
  { name: 'Terraform', category: 'Infrastructure', proficiency: 90, color: '#8b5cf6' },
  { name: 'Ansible', category: 'Infrastructure', proficiency: 85, color: '#a855f7' },

  // Cloud
  { name: 'AWS', category: 'Cloud', proficiency: 90, color: '#06b6d4' },
  { name: 'Azure', category: 'Cloud', proficiency: 75, color: '#0ea5e9' },
  { name: 'GCP', category: 'Cloud', proficiency: 70, color: '#38bdf8' },

  // CI/CD
  { name: 'GitHub Actions', category: 'CI/CD', proficiency: 92, color: '#6366f1' },
  { name: 'Jenkins', category: 'CI/CD', proficiency: 85, color: '#8b5cf6' },
  { name: 'GitLab CI', category: 'CI/CD', proficiency: 80, color: '#a855f7' },

  // Monitoring
  { name: 'Prometheus', category: 'Monitoring', proficiency: 88, color: '#06b6d4' },
  { name: 'Grafana', category: 'Monitoring', proficiency: 90, color: '#0ea5e9' },
  { name: 'Elastic Stack', category: 'Monitoring', proficiency: 82, color: '#38bdf8' },

  // Programming
  { name: 'Python', category: 'Development', proficiency: 85, color: '#6366f1' },
  { name: 'TypeScript', category: 'Development', proficiency: 88, color: '#3b82f6' },
  { name: 'Go', category: 'Development', proficiency: 75, color: '#8b5cf6' },
  { name: 'Bash', category: 'Development', proficiency: 90, color: '#a855f7' },

  // Databases
  { name: 'PostgreSQL', category: 'Database', proficiency: 82, color: '#06b6d4' },
  { name: 'MongoDB', category: 'Database', proficiency: 78, color: '#0ea5e9' },
  { name: 'Redis', category: 'Database', proficiency: 85, color: '#38bdf8' },

  // AI/ML
  { name: 'LangChain', category: 'AI/ML', proficiency: 80, color: '#6366f1' },
  { name: 'OpenAI API', category: 'AI/ML', proficiency: 85, color: '#3b82f6' },
  { name: 'PyTorch', category: 'AI/ML', proficiency: 70, color: '#8b5cf6' },
  { name: 'MCP', category: 'AI/ML', proficiency: 75, color: '#a855f7' },
];

// Calculate positions in a galaxy-like spiral
function calculateGalaxyPositions(skills: Skill[]): Skill[] {
  const categories = [...new Set(skills.map(s => s.category))];

  return skills.map((skill, index) => {
    const categoryIndex = categories.indexOf(skill.category);
    const categoryAngle = (categoryIndex / categories.length) * Math.PI * 2;

    const radius = 3 + (skill.proficiency / 100) * 5;
    const angle = categoryAngle + (index * 0.3);
    const height = (Math.sin(angle * 2) * 2) + (categoryIndex - categories.length / 2) * 1;

    return {
      ...skill,
      position: [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius,
      ] as [number, number, number],
    };
  });
}

// Skill node in 3D
function SkillNode({ skill, onHover, isHovered }: {
  skill: Skill;
  onHover: (skill: Skill | null) => void;
  isHovered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [clicked, setClicked] = useState(false);

  const size = 0.1 + (skill.proficiency / 100) * 0.3;

  useFrame((state) => {
    if (meshRef.current && skill.position) {
      const scale = isHovered ? 2.0 : clicked ? 1.5 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.15);

      meshRef.current.rotation.x = state.clock.elapsedTime * 0.8 + skill.proficiency;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.6;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.3;

      // Pulse effect on hover
      if (isHovered) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
        meshRef.current.scale.multiplyScalar(pulse);
      }
    }
  });

  if (!skill.position) return null;

  return (
    <group position={skill.position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        <mesh
          ref={meshRef}
          onPointerOver={() => onHover(skill)}
          onPointerOut={() => onHover(null)}
          onClick={() => setClicked(!clicked)}
        >
          <icosahedronGeometry args={[size, 1]} />
          <meshStandardMaterial
            color={skill.color}
            emissive={skill.color}
            emissiveIntensity={isHovered ? 0.8 : 0.4}
            metalness={0.9}
            roughness={0.1}
            wireframe={false}
          />
        </mesh>

        {/* Glow ring */}
        {isHovered && (
          <mesh>
            <sphereGeometry args={[size * 1.5, 16, 16]} />
            <meshBasicMaterial
              color={skill.color}
              transparent
              opacity={0.2}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Label */}
        {isHovered && (
          <Text
            position={[0, size + 0.4, 0]}
            fontSize={0.2}
            color={skill.color}
            anchorX="center"
            anchorY="middle"
          >
            {skill.name}
          </Text>
        )}
      </Float>
    </group>
  );
}

// Connection lines between related skills
function SkillConnections({ skills }: { skills: Skill[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const connections = useMemo(() => {
    const lines: { start: [number, number, number]; end: [number, number, number]; color: string }[] = [];

    skills.forEach((skill, i) => {
      const sameCategory = skills.filter(s =>
        s.category === skill.category && s !== skill
      );

      sameCategory.slice(0, 2).forEach(related => {
        if (skill.position && related.position) {
          lines.push({
            start: skill.position,
            end: related.position,
            color: skill.color,
          });
        }
      });
    });

    return lines;
  }, [skills]);

  return (
    <group ref={groupRef}>
      {connections.map((conn, i) => {
        const start = new THREE.Vector3(...conn.start);
        const end = new THREE.Vector3(...conn.end);
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

        return (
          <mesh key={i} position={midpoint}>
            <cylinderGeometry args={[0.01, 0.01, length, 8]} />
            <meshBasicMaterial color={conn.color} transparent opacity={0.15} />
          </mesh>
        );
      })}
    </group>
  );
}

// Category rings
function CategoryRings() {
  const categories = [
    { name: 'Infrastructure', radius: 6, color: '#6366f1' },
    { name: 'Cloud', radius: 7, color: '#8b5cf6' },
    { name: 'AI/ML', radius: 8, color: '#06b6d4' },
  ];

  return (
    <>
      {categories.map((cat, i) => (
        <CategoryRing key={cat.name} {...cat} index={i} />
      ))}
    </>
  );
}

function CategoryRing({ name, radius, color, index }: {
  name: string;
  radius: number;
  color: string;
  index: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.1 * (index + 1);
    }
  });

  return (
    <group>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.02, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      <Text
        position={[radius + 1, 0, 0]}
        fontSize={0.3}
        color={color}
        anchorX="left"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}

// Central core
function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.5, 32, 32]}>
      <meshStandardMaterial
        color="#6366f1"
        emissive="#8b5cf6"
        emissiveIntensity={0.5}
        metalness={1}
        roughness={0}
      />
    </Sphere>
  );
}

export default function Skills3D() {
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const positionedSkills = useMemo(() => calculateGalaxyPositions(skillsData), []);
  const categories = useMemo(() => [...new Set(skillsData.map(s => s.category))], []);

  const filteredSkills = selectedCategory
    ? positionedSkills.filter(s => s.category === selectedCategory)
    : positionedSkills;

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        <spotLight position={[0, 20, 0]} angle={0.5} intensity={0.5} color="#06b6d4" />

        <Stars radius={150} depth={50} count={5000} factor={4} />

        <CoreSphere />
        <CategoryRings />
        <SkillConnections skills={filteredSkills} />

        {filteredSkills.map((skill) => (
          <SkillNode
            key={skill.name}
            skill={skill}
            onHover={setHoveredSkill}
            isHovered={hoveredSkill?.name === skill.name}
          />
        ))}

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={10}
          maxDistance={30}
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
          <h2 className="text-5xl font-bold holographic-text mb-4">SKILLS GALAXY</h2>
          <p className="text-xl text-cyan-400 font-mono">
            {skillsData.length} Technologies Across {categories.length} Categories
          </p>
        </motion.div>
      </div>

      {/* Category Filter */}
      <div className="absolute top-32 left-8 space-y-2 pointer-events-auto">
        <div className="text-sm text-cyan-400 font-mono mb-3">FILTER BY CATEGORY:</div>
        <button
          onClick={() => setSelectedCategory(null)}
          className={`block w-full px-4 py-2 rounded-lg font-mono text-left transition-all ${
            selectedCategory === null
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
          }`}
        >
          All ({skillsData.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`block w-full px-4 py-2 rounded-lg font-mono text-left transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
            }`}
          >
            {cat} ({skillsData.filter(s => s.category === cat).length})
          </button>
        ))}
      </div>

      {/* Skill Detail */}
      <AnimatePresence>
        {hoveredSkill && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 w-80 holographic-border rounded-lg p-6 backdrop-blur-md bg-slate-950/80"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full animate-pulse"
                  style={{ backgroundColor: hoveredSkill.color }}
                ></div>
                <h3 className="text-2xl font-bold text-white">{hoveredSkill.name}</h3>
              </div>

              <div className="text-sm text-cyan-400 font-mono">{hoveredSkill.category}</div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Proficiency</span>
                  <span className="text-white font-bold">{hoveredSkill.proficiency}%</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${hoveredSkill.proficiency}%`,
                      backgroundColor: hoveredSkill.color,
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                Hover over nodes to explore skills. Larger nodes indicate higher proficiency.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-8 left-8 holographic-border rounded-lg p-4 backdrop-blur-sm bg-slate-950/50 pointer-events-none">
        <div className="text-sm text-purple-400 font-mono mb-2">LEGEND:</div>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <span>Node size = Proficiency level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-gray-500"></div>
            <span>Lines connect related skills</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-cyan-400 rounded-full"></div>
            <span>Rings show categories</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 right-8 text-purple-400 font-mono text-xs space-y-1 pointer-events-none text-right">
        <div>DRAG: Rotate galaxy</div>
        <div>SCROLL: Zoom</div>
        <div>HOVER: View details</div>
      </div>
    </div>
  );
}
