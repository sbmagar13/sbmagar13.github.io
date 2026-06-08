'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text3D, Center, Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// Animated text in 3D
function AnimatedTitle() {
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <Center>
        <mesh ref={textRef}>
          <boxGeometry args={[4, 1, 0.5]} />
          <meshStandardMaterial
            color="#6366f1"
            emissive="#8b5cf6"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </Center>
    </Float>
  );
}

// Floating crystals representing skills
function SkillCrystals() {
  const skills: { name: string; position: [number, number, number]; color: string }[] = [
    { name: 'Kubernetes', position: [-3, 2, 0], color: '#6366f1' },
    { name: 'Docker', position: [3, 2, -1], color: '#8b5cf6' },
    { name: 'AWS', position: [-2, -1, 1], color: '#06b6d4' },
    { name: 'Terraform', position: [2, -1, 0], color: '#a855f7' },
    { name: 'Python', position: [0, 3, -2], color: '#3b82f6' },
  ];

  return (
    <>
      {skills.map((skill, index) => (
        <Crystal key={skill.name} position={skill.position} color={skill.color} index={index} />
      ))}
    </>
  );
}

function Crystal({ position, color, index }: { position: [number, number, number]; color: string; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5 + index;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 + index;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Energy field effect
function EnergyField() {
  const fieldRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (fieldRef.current) {
      fieldRef.current.rotation.z = state.clock.elapsedTime * 0.1;
      (fieldRef.current.material as any).opacity = 0.1 + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <mesh ref={fieldRef}>
      <torusGeometry args={[5, 0.1, 16, 100]} />
      <meshBasicMaterial
        color="#6366f1"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function Hero3D({ onEnter }: { onEnter?: () => void }) {
  const [bootSequence, setBootSequence] = useState(0);
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    const sequences = [
      { delay: 500, step: 1 },
      { delay: 1000, step: 2 },
      { delay: 1500, step: 3 },
      { delay: 2000, step: 4 },
      { delay: 2500, step: 5 },
    ];

    sequences.forEach(({ delay, step }) => {
      setTimeout(() => setBootSequence(step), delay);
    });

    setTimeout(() => setShowCanvas(true), 1000);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Boot Sequence Overlay */}
      <AnimatePresence>
        {bootSequence < 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black"
          >
            <div className="space-y-6 font-mono text-cyan-400">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: bootSequence >= 1 ? 1 : 0, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>INITIALIZING NEURAL NETWORK...</span>
                {bootSequence >= 1 && <span className="text-green-500">[OK]</span>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: bootSequence >= 2 ? 1 : 0, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span>LOADING HOLOGRAPHIC INTERFACE...</span>
                {bootSequence >= 2 && <span className="text-green-500">[OK]</span>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: bootSequence >= 3 ? 1 : 0, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span>SYNCING QUANTUM STATE...</span>
                {bootSequence >= 3 && <span className="text-green-500">[OK]</span>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: bootSequence >= 4 ? 1 : 0, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                <span>ESTABLISHING CONNECTION...</span>
                {bootSequence >= 4 && <span className="text-green-500">[OK]</span>}
              </motion.div>

              {bootSequence >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-center"
                >
                  <div className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
                    SYSTEM ONLINE
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    Welcome to DevOps Brain 3.0
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      {showCanvas && (
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 8], fov: 60 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
            <spotLight position={[0, 10, 0]} angle={0.3} intensity={1} color="#06b6d4" />

            <Environment preset="night" />

            <SkillCrystals />
            <EnergyField />
          </Canvas>
        </div>
      )}

      {/* Main Content Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: bootSequence >= 5 ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
      >
        <div className="text-center space-y-8 px-4">
          {/* Name */}
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-7xl font-bold holographic-text"
          >
            SAGAR BUDHATHOKI
          </motion.h1>

          {/* Title */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="space-y-2"
          >
            <p className="text-3xl text-cyan-400 font-mono">
              DevOps Engineer & Cloud Architect
            </p>
            <p className="text-xl text-purple-400 font-mono">
              Building the future, one deployment at a time
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex gap-8 justify-center items-center text-sm font-mono"
          >
            <div className="holographic-border px-6 py-3 rounded-lg backdrop-blur-sm">
              <div className="text-blue-400">UPTIME</div>
              <div className="text-2xl text-white">99.99%</div>
            </div>
            <div className="holographic-border px-6 py-3 rounded-lg backdrop-blur-sm">
              <div className="text-purple-400">DEPLOYMENTS</div>
              <div className="text-2xl text-white">10K+</div>
            </div>
            <div className="holographic-border px-6 py-3 rounded-lg backdrop-blur-sm">
              <div className="text-cyan-400">SYSTEMS</div>
              <div className="text-2xl text-white">100+</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex gap-6 justify-center mt-12 pointer-events-auto"
          >
            <button
              onClick={onEnter}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-mono font-bold text-white hover:from-blue-500 hover:to-purple-500 transition-all duration-300 glow-blue-purple"
            >
              ENTER EXPERIENCE
            </button>
            <button
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="px-8 py-4 holographic-border rounded-lg font-mono font-bold text-cyan-400 hover:bg-blue-950/30 transition-all duration-300"
            >
              EXPLORE PROJECTS
            </button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-2 text-cyan-400 font-mono text-sm">
              <span>SCROLL TO CONTINUE</span>
              <svg
                className="w-6 h-6 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-scan"></div>
      </div>

      {/* Grain Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay">
        <div className="w-full h-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }}></div>
      </div>
    </div>
  );
}
