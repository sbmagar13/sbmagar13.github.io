'use client';

import { useMemo, useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PALETTE } from './Materials';

export interface RackProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  label: string;
  sublabel?: string;
  statusColor: string;
  accent?: string;
  units?: number;
  highlighted?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onHover?: (hover: boolean) => void;
}

const RACK_WIDTH = 0.85;
const RACK_HEIGHT = 2.4;
const RACK_DEPTH = 0.65;

/**
 * A procedurally modeled 19" server rack. Every detail is geometry, no
 * textures needed:
 *   • Aluminium frame with bevelled top + bottom caps
 *   • N rack units, each with a dark front panel, 2 status LEDs, an
 *     accent indicator strip and a faint vent grill
 *   • A name plate with the rack label glowing softly
 *   • A drift of pulsing LEDs along the front
 *
 * The LED phases are deterministic per unit so the blink pattern is
 * stable across renders but doesn't look synchronized.
 */
export default function ServerRack({
  position,
  rotation = [0, 0, 0],
  label,
  sublabel,
  statusColor,
  accent = PALETTE.neonCyan,
  units = 18,
  highlighted = false,
  onClick,
  onHover,
}: RackProps) {
  const ledRefs = useRef<THREE.Mesh[]>([]);
  const fanRef = useRef<THREE.Mesh>(null);
  const highlightRef = useRef<THREE.Mesh>(null);

  // Pre-compute per-unit randomness once. The seed is the index so the
  // pattern is the same every mount — no jitter across rerenders.
  const unitSpec = useMemo(() => {
    return Array.from({ length: units }).map((_, i) => {
      const seed = i * 137.508;
      const rand = (s: number) => (Math.sin(s) * 43758.5453) % 1;
      return {
        // Some slots get amber/red instead of green for variety.
        secondaryColor:
          rand(seed) > 0.85
            ? PALETTE.ledAmber
            : rand(seed * 1.3) > 0.92
              ? PALETTE.ledRed
              : PALETTE.ledGreen,
        phase: Math.abs(rand(seed * 2.7)) * Math.PI * 2,
        speed: 1 + Math.abs(rand(seed * 3.1)) * 2.5,
      };
    });
  }, [units]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Drive the LED emissive intensity directly on the material — no React
    // state changes per frame.
    ledRefs.current.forEach((led, i) => {
      if (!led) return;
      const spec = unitSpec[Math.floor(i / 2)];
      const mat = led.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + 1.4 * (0.5 + 0.5 * Math.sin(t * spec.speed + spec.phase + i));
    });

    // Slow rear fan spin.
    if (fanRef.current) fanRef.current.rotation.z = t * 2.5;

    // Pulse the highlight ring when the rack is the active one.
    if (highlightRef.current && highlighted) {
      const mat = highlightRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + 0.4 * Math.sin(t * 3);
    }
  });

  const unitHeight = (RACK_HEIGHT - 0.5) / units;

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onHover?.(false);
        document.body.style.cursor = '';
      }}
    >
      {/* Main frame — slightly inset front panel suggestion */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[RACK_WIDTH, RACK_HEIGHT, RACK_DEPTH]} />
        <meshStandardMaterial
          color={PALETTE.steel}
          metalness={0.85}
          roughness={0.45}
        />
      </mesh>

      {/* Top cap (darker, bevelled) */}
      <mesh position={[0, RACK_HEIGHT / 2 + 0.04, 0]} castShadow>
        <boxGeometry args={[RACK_WIDTH + 0.05, 0.08, RACK_DEPTH + 0.05]} />
        <meshStandardMaterial color={PALETTE.steelDark} metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Bottom cap (heavier base) */}
      <mesh position={[0, -RACK_HEIGHT / 2 - 0.06, 0]} castShadow>
        <boxGeometry args={[RACK_WIDTH + 0.08, 0.12, RACK_DEPTH + 0.05]} />
        <meshStandardMaterial color={PALETTE.rubber} metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Name plate at the top of the front panel */}
      <group position={[0, RACK_HEIGHT / 2 - 0.18, RACK_DEPTH / 2 + 0.005]}>
        <mesh>
          <boxGeometry args={[RACK_WIDTH * 0.75, 0.18, 0.003]} />
          <meshStandardMaterial color="#020617" metalness={0.2} roughness={0.9} />
        </mesh>
        <Text
          position={[0, 0.025, 0.004]}
          fontSize={0.07}
          anchorX="center"
          anchorY="middle"
          color={accent}
          outlineColor="#000"
          outlineWidth={0.002}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text
            position={[0, -0.045, 0.004]}
            fontSize={0.034}
            anchorX="center"
            anchorY="middle"
            color="#94a3b8"
          >
            {sublabel}
          </Text>
        ) : null}
      </group>

      {/* Rack units (LEDs + indicator + faint vent) */}
      {unitSpec.map((spec, i) => {
        const y =
          (i - units / 2 + 0.5) * unitHeight - 0.18; /* nudge down for name plate */
        return (
          <group key={i} position={[0, y, RACK_DEPTH / 2 + 0.003]}>
            {/* Slot front */}
            <mesh>
              <boxGeometry args={[RACK_WIDTH * 0.92, unitHeight * 0.88, 0.004]} />
              <meshStandardMaterial color={PALETTE.steelDark} metalness={0.55} roughness={0.7} />
            </mesh>
            {/* Status LED (color from props) */}
            <mesh
              position={[-RACK_WIDTH * 0.36, 0, 0.005]}
              ref={(el) => {
                if (el) ledRefs.current[i * 2] = el;
              }}
            >
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshStandardMaterial
                color={statusColor}
                emissive={statusColor}
                emissiveIntensity={1.2}
                toneMapped={false}
              />
            </mesh>
            {/* Secondary LED (mostly green with rare red/amber) */}
            <mesh
              position={[-RACK_WIDTH * 0.3, 0, 0.005]}
              ref={(el) => {
                if (el) ledRefs.current[i * 2 + 1] = el;
              }}
            >
              <sphereGeometry args={[0.011, 8, 8]} />
              <meshStandardMaterial
                color={spec.secondaryColor}
                emissive={spec.secondaryColor}
                emissiveIntensity={1}
                toneMapped={false}
              />
            </mesh>
            {/* Long indicator bar in the rack accent color */}
            <mesh position={[RACK_WIDTH * 0.08, 0, 0.005]}>
              <boxGeometry args={[RACK_WIDTH * 0.4, 0.012, 0.003]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={0.35}
                toneMapped={false}
              />
            </mesh>
            {/* Tiny vent slits (line of small boxes) */}
            <mesh position={[RACK_WIDTH * 0.36, 0, 0.005]}>
              <boxGeometry args={[RACK_WIDTH * 0.1, unitHeight * 0.5, 0.003]} />
              <meshStandardMaterial color="#000" metalness={0.2} roughness={1} />
            </mesh>
          </group>
        );
      })}

      {/* Cable bundle on top — a few curved bezier-ish humps suggested by a torus */}
      <mesh position={[0, RACK_HEIGHT / 2 + 0.13, -RACK_DEPTH / 4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.018, 6, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.9} />
      </mesh>

      {/* Rear-mounted fan suggestion */}
      <mesh
        ref={fanRef}
        position={[0, 0, -RACK_DEPTH / 2 - 0.005]}
        rotation={[0, 0, 0]}
      >
        <torusGeometry args={[0.18, 0.04, 6, 12]} />
        <meshStandardMaterial color={PALETTE.steelDark} metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Highlight ring when active */}
      {highlighted ? (
        <mesh
          ref={highlightRef}
          position={[0, -RACK_HEIGHT / 2 - 0.13, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[RACK_WIDTH * 0.7, RACK_WIDTH * 0.85, 48]} />
          <meshBasicMaterial color={accent} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
    </group>
  );
}
