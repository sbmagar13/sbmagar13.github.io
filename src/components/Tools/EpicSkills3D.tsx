'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, OrbitControls, Stars, MeshReflectorMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

interface Skill {
  name: string;
  category: string;
  proficiency: number;
  color: string;
  position: [number, number, number];
}

const skillsData: Skill[] = [
  // Infrastructure
  { name: 'Kubernetes', category: 'Infrastructure', proficiency: 95, color: '#6366f1', position: [0, 0, 0] },
  { name: 'Docker', category: 'Infrastructure', proficiency: 92, color: '#3b82f6', position: [0, 0, 0] },
  { name: 'Terraform', category: 'Infrastructure', proficiency: 93, color: '#8b5cf6', position: [0, 0, 0] },
  { name: 'Ansible', category: 'Infrastructure', proficiency: 88, color: '#a855f7', position: [0, 0, 0] },
  { name: 'Helm', category: 'Infrastructure', proficiency: 90, color: '#6366f1', position: [0, 0, 0] },

  // Cloud
  { name: 'AWS', category: 'Cloud', proficiency: 94, color: '#06b6d4', position: [0, 0, 0] },
  { name: 'Azure', category: 'Cloud', proficiency: 80, color: '#0ea5e9', position: [0, 0, 0] },
  { name: 'GCP', category: 'Cloud', proficiency: 78, color: '#38bdf8', position: [0, 0, 0] },
  { name: 'CloudFlare', category: 'Cloud', proficiency: 85, color: '#06b6d4', position: [0, 0, 0] },

  // CI/CD
  { name: 'GitHub Actions', category: 'CI/CD', proficiency: 95, color: '#6366f1', position: [0, 0, 0] },
  { name: 'Jenkins', category: 'CI/CD', proficiency: 87, color: '#8b5cf6', position: [0, 0, 0] },
  { name: 'GitLab CI', category: 'CI/CD', proficiency: 85, color: '#a855f7', position: [0, 0, 0] },
  { name: 'ArgoCD', category: 'CI/CD', proficiency: 88, color: '#6366f1', position: [0, 0, 0] },

  // Monitoring
  { name: 'Prometheus', category: 'Monitoring', proficiency: 91, color: '#06b6d4', position: [0, 0, 0] },
  { name: 'Grafana', category: 'Monitoring', proficiency: 93, color: '#0ea5e9', position: [0, 0, 0] },
  { name: 'Datadog', category: 'Monitoring', proficiency: 86, color: '#38bdf8', position: [0, 0, 0] },
  { name: 'ELK Stack', category: 'Monitoring', proficiency: 84, color: '#06b6d4', position: [0, 0, 0] },

  // Programming
  { name: 'Python', category: 'Development', proficiency: 90, color: '#6366f1', position: [0, 0, 0] },
  { name: 'TypeScript', category: 'Development', proficiency: 92, color: '#3b82f6', position: [0, 0, 0] },
  { name: 'Go', category: 'Development', proficiency: 80, color: '#8b5cf6', position: [0, 0, 0] },
  { name: 'Bash', category: 'Development', proficiency: 94, color: '#a855f7', position: [0, 0, 0] },

  // AI/ML
  { name: 'LangChain', category: 'AI/ML', proficiency: 85, color: '#6366f1', position: [0, 0, 0] },
  { name: 'OpenAI API', category: 'AI/ML', proficiency: 88, color: '#3b82f6', position: [0, 0, 0] },
  { name: 'PyTorch', category: 'AI/ML', proficiency: 75, color: '#8b5cf6', position: [0, 0, 0] },
  { name: 'MCP', category: 'AI/ML', proficiency: 82, color: '#a855f7', position: [0, 0, 0] },
];

// Calculate epic galaxy positions
function calculateEpicGalaxyPositions(skills: Skill[]): Skill[] {
  const categories = [...new Set(skills.map(s => s.category))];

  return skills.map((skill, index) => {
    const categoryIndex = categories.indexOf(skill.category);
    const skillsInCategory = skills.filter(s => s.category === skill.category);
    const indexInCategory = skillsInCategory.indexOf(skill);

    const baseAngle = (categoryIndex / categories.length) * Math.PI * 2;
    const radius = 4 + (skill.proficiency / 100) * 6;
    const angleOffset = (indexInCategory / skillsInCategory.length) * (Math.PI / 3);
    const angle = baseAngle + angleOffset;

    const height = Math.sin(angle * 3) * 2 + (categoryIndex - categories.length / 2) * 1.5;

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

// Epic 3D Skill Node with real depth
function EpicSkillNode({ skill, onHover, isHovered, onClick }: {
  skill: Skill;
  onHover: (skill: Skill | null) => void;
  isHovered: boolean;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const size = 0.3 + (skill.proficiency / 100) * 0.6; // Larger sizes

  useFrame((state) => {
    if (groupRef.current) {
      const active = hovered || isHovered;
      const targetScale = active ? 2.5 : 1.0; // 2.5x on hover!
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);

      // Multi-axis rotation
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.8 + skill.proficiency;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.6;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.4;

      // Floating animation
      groupRef.current.position.y = skill.position[1] + Math.sin(state.clock.elapsedTime * 2 + skill.proficiency) * 0.3;

      // Pulse effect on hover
      if (active) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.15;
        groupRef.current.scale.multiplyScalar(pulse);
      }
    }
  });

  return (
    <group position={skill.position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.4}>
        <group
          ref={groupRef}
          onPointerOver={() => {
            setHovered(true);
            onHover(skill);
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
          {/* Main 3D crystal body - REAL DEPTH */}
          <mesh castShadow receiveShadow>
            <icosahedronGeometry args={[size, 1]} />
            <meshStandardMaterial
              color={skill.color}
              emissive={skill.color}
              emissiveIntensity={hovered || isHovered ? 1.2 : 0.6}
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Glass overlay layer */}
          <mesh>
            <icosahedronGeometry args={[size * 1.1, 1]} />
            <meshPhysicalMaterial
              transmission={0.95}
              opacity={0.4}
              metalness={0.2}
              roughness={0}
              transparent
              color={skill.color}
            />
          </mesh>

          {/* Inner glow core */}
          <mesh>
            <sphereGeometry args={[size * 0.5, 16, 16]} />
            <meshBasicMaterial
              color={skill.color}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Outer glow when hovered */}
          {(hovered || isHovered) && (
            <mesh>
              <icosahedronGeometry args={[size * 1.5, 0]} />
              <meshBasicMaterial
                color={skill.color}
                transparent
                opacity={0.2}
                side={THREE.BackSide}
              />
            </mesh>
          )}

          {/* Skill name label */}
          {(hovered || isHovered) && (
            <Text
              position={[0, size + 0.6, 0]}
              fontSize={0.3}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {skill.name}
            </Text>
          )}

          {/* Proficiency percentage */}
          {(hovered || isHovered) && (
            <Text
              position={[0, -size - 0.5, 0]}
              fontSize={0.25}
              color={skill.color}
              anchorX="center"
              anchorY="middle"
            >
              {skill.proficiency}%
            </Text>
          )}

          {/* Particle ring on hover */}
          {(hovered || isHovered) && <SkillParticleRing size={size} color={skill.color} />}
        </group>
      </Float>
    </group>
  );
}

// Particle ring around skill node
function SkillParticleRing({ size, color }: { size: number; color: string }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 30;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const radius = size * 2;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [size]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 2;
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
        size={0.1}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Epic category rings
function EpicCategoryRings() {
  const categories = [
    { name: 'Infrastructure', radius: 7, color: '#6366f1', height: 2 },
    { name: 'Cloud', radius: 8.5, color: '#8b5cf6', height: 0 },
    { name: 'CI/CD', radius: 10, color: '#06b6d4', height: -2 },
    { name: 'Monitoring', radius: 11.5, color: '#0ea5e9', height: 1 },
    { name: 'Development', radius: 13, color: '#3b82f6', height: -1 },
    { name: 'AI/ML', radius: 14.5, color: '#a855f7', height: 1.5 },
  ];

  return (
    <>
      {categories.map((cat, i) => (
        <EpicCategoryRing key={cat.name} {...cat} index={i} />
      ))}
    </>
  );
}

function EpicCategoryRing({ name, radius, color, height, index }: {
  name: string;
  radius: number;
  color: string;
  height: number;
  index: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.15 * (index % 2 === 0 ? 1 : -1);
    }
  });

  return (
    <group position={[0, height, 0]}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.04, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Category label */}
      <Float speed={1} floatIntensity={0.2}>
        <Text
          position={[radius + 2, 0, 0]}
          fontSize={0.4}
          color={color}
          anchorX="left"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {name}
        </Text>
      </Float>
    </group>
  );
}

// Central energy core
function EnergyCoreRings() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Central glowing sphere */}
      <Float speed={2} floatIntensity={0.5}>
        <mesh>
          <sphereGeometry args={[0.8, 64, 64]} />
          <meshStandardMaterial
            color="#6366f1"
            emissive="#8b5cf6"
            emissiveIntensity={1.5}
            metalness={1}
            roughness={0}
          />
        </mesh>

        {/* Pulsing glow layers */}
        {[1.2, 1.5, 1.8].map((radius, i) => (
          <mesh key={i}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshBasicMaterial
              color={['#6366f1', '#8b5cf6', '#06b6d4'][i]}
              transparent
              opacity={0.15}
              side={THREE.BackSide}
            />
          </mesh>
        ))}
      </Float>
    </group>
  );
}

// Epic floor with reflections
function EpicFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={2048}
        mixBlur={1}
        mixStrength={60}
        roughness={1}
        depthScale={1.5}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#050510"
        metalness={0.9}
      />
    </mesh>
  );
}

export default function EpicSkills3D() {
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const positionedSkills = useMemo(() => calculateEpicGalaxyPositions(skillsData), []);
  const categories = useMemo(() => [...new Set(skillsData.map(s => s.category))], []);

  const filteredSkills = selectedCategory
    ? positionedSkills.filter(s => s.category === selectedCategory)
    : positionedSkills;

  return (
    <div className="w-screen h-screen fixed top-0 left-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 8, 20], fov: 60 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        {/* Epic lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[15, 15, 15]} intensity={2.5} color="#6366f1" castShadow />
        <pointLight position={[-15, 15, -15]} intensity={2} color="#8b5cf6" castShadow />
        <pointLight position={[0, 20, 10]} intensity={2} color="#06b6d4" />
        <pointLight position={[10, -10, -10]} intensity={1.5} color="#a855f7" />
        <spotLight
          position={[0, 30, 0]}
          angle={0.5}
          intensity={3}
          color="#3b82f6"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Background */}
        <Stars radius={200} depth={100} count={10000} factor={7} fade speed={2} />

        {/* Floor reflection */}
        <EpicFloor />

        {/* Central core */}
        <EnergyCoreRings />

        {/* Category rings */}
        <EpicCategoryRings />

        {/* Skill nodes */}
        {filteredSkills.map((skill) => (
          <EpicSkillNode
            key={skill.name}
            skill={skill}
            onHover={setHoveredSkill}
            isHovered={hoveredSkill?.name === skill.name}
            onClick={() => setSelectedSkill(skill)}
          />
        ))}

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={15}
          maxDistance={40}
          autoRotate
          autoRotateSpeed={0.4}
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
          <h2 className="text-4xl md:text-6xl font-bold holographic-text mb-2 md:mb-4">EPIC SKILLS GALAXY</h2>
          <p className="text-base md:text-2xl text-cyan-400 font-mono">
            {skillsData.length} Technologies • {categories.length} Categories
          </p>
        </motion.div>
      </div>

      {/* Category Filter */}
      <div className="absolute top-24 md:top-32 left-4 md:left-8 space-y-2 pointer-events-auto max-w-[180px] md:max-w-xs z-20">
        <div className="text-sm text-cyan-400 font-mono mb-3 font-bold">FILTER:</div>
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

      {/* Skill Detail Panel */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 w-96 holographic-border rounded-2xl p-8 backdrop-blur-xl bg-slate-950/90 pointer-events-auto z-50"
          >
            <button
              onClick={() => setSelectedSkill(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-all font-bold"
            >
              ✕
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full animate-pulse"
                  style={{ backgroundColor: selectedSkill.color }}
                ></div>
                <h3 className="text-3xl font-bold text-white">{selectedSkill.name}</h3>
              </div>

              <div className="text-sm text-cyan-400 font-mono px-3 py-1 bg-cyan-500/20 rounded-full inline-block">
                {selectedSkill.category}
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-400 font-mono">Proficiency</span>
                  <span className="text-white font-bold font-mono text-xl">{selectedSkill.proficiency}%</span>
                </div>
                <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedSkill.proficiency}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-400"
                    style={{ backgroundColor: selectedSkill.color }}
                  ></motion.div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Production Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Enterprise Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Actively Using</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500 font-mono">
                  Click and drag to explore • Scroll to zoom • Hover to see details
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="absolute bottom-6 right-4 md:bottom-8 md:right-8 space-y-2 md:space-y-3 pointer-events-none z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="holographic-border rounded-lg p-3 md:p-4 backdrop-blur-sm bg-slate-950/90 text-right w-[140px] md:w-auto"
        >
          <div className="text-sm text-cyan-400 font-mono">AVG PROFICIENCY</div>
          <div className="text-4xl font-bold text-white">
            {Math.round(skillsData.reduce((sum, s) => sum + s.proficiency, 0) / skillsData.length)}%
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-4 md:bottom-8 md:left-8 text-purple-400 font-mono text-xs md:text-sm space-y-1 pointer-events-none z-20">
        <div className="font-bold mb-2">CONTROLS:</div>
        <div>DRAG → Rotate galaxy</div>
        <div>SCROLL → Zoom in/out</div>
        <div>CLICK → View details</div>
        <div>HOVER → See skill name</div>
      </div>
    </div>
  );
}
