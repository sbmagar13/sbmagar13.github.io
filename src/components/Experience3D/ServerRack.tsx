'use client';

import { useMemo, useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PALETTE } from './Materials';
import AnimatedScreen, { type ScreenMode } from './AnimatedScreen';
import EnergyPanel from './EnergyPanel';
import FanBlade from './FanBlade';
import LabelPlate from './LabelPlate';

type LedPattern = 'steady' | 'slow' | 'fast' | 'burst';

export interface RackProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  label: string;
  sublabel?: string;
  statusColor: string;
  accent?: string;
  units?: number;
  highlighted?: boolean;
  screenMode?: ScreenMode;
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
  screenMode = 'graph',
  onClick,
  onHover,
}: RackProps) {
  const ledRefs = useRef<THREE.Mesh[]>([]);
  const highlightRef = useRef<THREE.Mesh>(null);

  // Pre-compute per-unit attributes. Each LED gets a behaviour pattern,
  // not just a phase, so the rack looks like 18 independent machines
  // doing different work instead of 18 synchronised blinkers.
  const unitSpec = useMemo(() => {
    return Array.from({ length: units }).map((_, i) => {
      const seed = i * 137.508;
      const rand = (s: number) => Math.abs((Math.sin(s) * 43758.5453) % 1);
      const r = rand(seed);
      const pattern: LedPattern =
        r > 0.85 ? 'burst' : r > 0.6 ? 'fast' : r > 0.3 ? 'slow' : 'steady';
      const r2 = rand(seed * 1.7);
      const secondaryPattern: LedPattern =
        r2 > 0.9 ? 'burst' : r2 > 0.55 ? 'slow' : 'steady';
      return {
        // Most slots green; a few amber, very few red.
        secondaryColor:
          r > 0.92 ? PALETTE.ledRed : r > 0.78 ? PALETTE.ledAmber : PALETTE.ledGreen,
        pattern,
        secondaryPattern,
        phase: rand(seed * 2.7) * Math.PI * 2,
        // Idle drift speed for blinkers.
        speed: 0.8 + rand(seed * 3.1) * 1.8,
        // Burst cycle period for "data burst" LEDs.
        burstPeriod: 1.6 + rand(seed * 5.3) * 3.5,
      };
    });
  }, [units]);

  // Translate a pattern into an emissive intensity at time t.
  function patternIntensity(pattern: LedPattern, t: number, phase: number, speed: number, burstPeriod: number) {
    switch (pattern) {
      case 'steady':
        return 1.2;
      case 'slow': {
        // Long lazy fade, looks like a heartbeat.
        const v = Math.sin(t * speed * 0.4 + phase);
        return 0.5 + 0.7 * Math.max(0, v);
      }
      case 'fast': {
        // Rapid pulse, looks like activity.
        const v = 0.5 + 0.5 * Math.sin(t * speed * 2.5 + phase);
        return 0.6 + v * 0.9;
      }
      case 'burst': {
        // Quiet 90% of the cycle, then a rapid data-burst flicker.
        const cyclePos = ((t + phase) % burstPeriod) / burstPeriod;
        if (cyclePos < 0.82) return 0.35;
        // Fast flicker in the active 18% of the cycle.
        const flicker = 0.5 + 0.5 * Math.sin(t * 28 + phase * 3);
        return 1.4 + flicker * 0.8;
      }
    }
  }

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Drive the LED emissive intensity directly on the material, no React
    // state changes per frame.
    ledRefs.current.forEach((led, i) => {
      if (!led) return;
      const unitIdx = Math.floor(i / 2);
      const isSecondary = i % 2 === 1;
      const spec = unitSpec[unitIdx];
      if (!spec) return;
      const mat = led.material as THREE.MeshStandardMaterial;
      const pattern = isSecondary ? spec.secondaryPattern : spec.pattern;
      mat.emissiveIntensity = patternIntensity(
        pattern,
        t,
        spec.phase + (isSecondary ? Math.PI : 0),
        spec.speed,
        spec.burstPeriod,
      ) * (highlighted ? 1.25 : 1);
    });

    // Pulse the highlight ring when the rack is the active one, use a
    // smoother cosine curve so the breathing feels organic.
    if (highlightRef.current && highlighted) {
      const mat = highlightRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.45 + 0.35 * (0.5 + 0.5 * Math.cos(t * 2.2));
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
      {/* Main frame, slightly inset front panel suggestion */}
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

      {/* Name plate at the top of the front panel, uses LabelPlate so
          the text reads against bloom and dim lighting. */}
      <LabelPlate
        position={[0, RACK_HEIGHT / 2 - 0.18, RACK_DEPTH / 2 + 0.006]}
        text={label}
        subtext={sublabel}
        size={0.08}
        subSize={0.038}
        color={accent}
        plate
        plateOpacity={0.92}
        padding={[0.08, 0.04]}
        border
        borderColor={accent}
      />

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

      {/* Cable bundle on top, a few curved bezier-ish humps suggested by a torus */}
      <mesh position={[0, RACK_HEIGHT / 2 + 0.13, -RACK_DEPTH / 4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.018, 6, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.9} />
      </mesh>

      {/* Rear-mounted fan, actual blades, not just a ring */}
      <FanBlade
        position={[0, 0.4, -RACK_DEPTH / 2 - 0.005]}
        radius={0.18}
        bladeCount={5}
        speed={highlighted ? 6 : 3.5}
      />
      <FanBlade
        position={[0, -0.4, -RACK_DEPTH / 2 - 0.005]}
        radius={0.18}
        bladeCount={5}
        speed={highlighted ? 5.5 : 3}
      />

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

      {/* Animated screen embedded in the upper third of the front face */}
      <AnimatedScreen
        position={[0, RACK_HEIGHT * 0.18, RACK_DEPTH / 2 + 0.012]}
        size={[RACK_WIDTH * 0.6, RACK_HEIGHT * 0.12]}
        mode={screenMode}
        accent={accent}
      />

      {/* Energy-line shader overlay on the lower front (subtle) */}
      <EnergyPanel
        position={[0, -RACK_HEIGHT * 0.32, RACK_DEPTH / 2 + 0.01]}
        size={[RACK_WIDTH * 0.7, RACK_HEIGHT * 0.18]}
        color={accent}
        speed={1.6}
        density={9}
        opacity={highlighted ? 0.85 : 0.55}
      />

      {/* Power LEDs at the bottom front */}
      <mesh position={[-RACK_WIDTH * 0.3, -RACK_HEIGHT / 2 - 0.07, RACK_DEPTH / 2 + 0.005]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial
          color={PALETTE.ledGreen}
          emissive={PALETTE.ledGreen}
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-RACK_WIDTH * 0.24, -RACK_HEIGHT / 2 - 0.07, RACK_DEPTH / 2 + 0.005]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>

      {/* Handles either side of the front face */}
      {[-1, 1].map((d) => (
        <mesh key={d} position={[d * (RACK_WIDTH / 2 - 0.03), -RACK_HEIGHT * 0.35, RACK_DEPTH / 2 + 0.04]}>
          <cylinderGeometry args={[0.022, 0.022, 0.18, 8]} />
          <meshStandardMaterial color={PALETTE.steelDark} metalness={0.9} roughness={0.35} />
        </mesh>
      ))}

      {/* Brand mark, tiny accent text at the bottom corner of the face */}
      <Text
        position={[RACK_WIDTH * 0.32, -RACK_HEIGHT / 2 - 0.03, RACK_DEPTH / 2 + 0.005]}
        fontSize={0.024}
        letterSpacing={0.3}
        color="#475569"
        anchorX="center"
      >
        {`MODEL-${(label.length * 41) % 999}`.padStart(7, '0')}
      </Text>
    </group>
  );
}
