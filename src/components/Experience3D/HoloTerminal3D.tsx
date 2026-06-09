'use client';

import { Float } from '@react-three/drei';
import AnimatedScreen from './AnimatedScreen';
import { PALETTE } from './Materials';

interface Props {
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** Texture size in world units (width, height) */
  size?: [number, number];
  /** Which animated mode to display */
  mode?: 'terminal' | 'logs' | 'matrix' | 'pulse' | 'graph' | 'htop';
  /** Frame border color */
  accent?: string;
}

/**
 * A floating holographic terminal: an AnimatedScreen wrapped in a glowing
 * holographic frame with corner brackets and a base post. Designed to
 * drop into the Hero scene so visitors see live-looking DevOps commands
 * scrolling next to the title.
 */
export default function HoloTerminal3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = [1.6, 1.0],
  mode = 'terminal',
  accent = PALETTE.neonCyan,
}: Props) {
  const [w, h] = size;
  // Tube thickness for the frame.
  const t = 0.022;
  // Corner bracket length.
  const cb = 0.18;

  return (
    <Float speed={0.6} floatIntensity={0.18} rotationIntensity={0.05}>
      <group position={position} rotation={rotation}>
        {/* Dark backplate so the screen reads against the void */}
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[w * 1.04, h * 1.04]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.92} />
        </mesh>

        {/* The actual animated screen content (canvas texture) */}
        <AnimatedScreen position={[0, 0, 0.001]} size={size} mode={mode} accent={accent} />

        {/* Frame edges, four thin glowing bars */}
        {[
          { p: [0, h / 2, 0.01], s: [w * 1.06, t, 0.005] },
          { p: [0, -h / 2, 0.01], s: [w * 1.06, t, 0.005] },
          { p: [-w / 2, 0, 0.01], s: [t, h * 1.06, 0.005] },
          { p: [w / 2, 0, 0.01], s: [t, h * 1.06, 0.005] },
        ].map((bar, i) => (
          <mesh key={i} position={bar.p as [number, number, number]}>
            <boxGeometry args={bar.s as [number, number, number]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        ))}

        {/* Corner brackets, four L-shapes for that HUD feel */}
        {[
          { p: [-w / 2, h / 2, 0.02], xs: [cb, t * 1.4, 0.006], ys: [t * 1.4, cb, 0.006] },
          { p: [w / 2, h / 2, 0.02], xs: [cb, t * 1.4, 0.006], ys: [t * 1.4, cb, 0.006] },
          { p: [-w / 2, -h / 2, 0.02], xs: [cb, t * 1.4, 0.006], ys: [t * 1.4, cb, 0.006] },
          { p: [w / 2, -h / 2, 0.02], xs: [cb, t * 1.4, 0.006], ys: [t * 1.4, cb, 0.006] },
        ].map((corner, i) => {
          const [x, y, z] = corner.p;
          const isRight = x > 0;
          const isTop = y > 0;
          return (
            <group key={i} position={[x, y, z]}>
              <mesh position={[isRight ? -cb / 2 : cb / 2, 0, 0]}>
                <boxGeometry args={corner.xs as [number, number, number]} />
                <meshStandardMaterial
                  color={accent}
                  emissive={accent}
                  emissiveIntensity={2.2}
                  toneMapped={false}
                />
              </mesh>
              <mesh position={[0, isTop ? -cb / 2 : cb / 2, 0]}>
                <boxGeometry args={corner.ys as [number, number, number]} />
                <meshStandardMaterial
                  color={accent}
                  emissive={accent}
                  emissiveIntensity={2.2}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        })}

        {/* Status pip in the top-left corner */}
        <mesh position={[-w / 2 + 0.08, h / 2 - 0.06, 0.025]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial
            color={PALETTE.ledGreen}
            emissive={PALETTE.ledGreen}
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>

        {/* Thin stem connecting to a projector base below the screen */}
        <mesh position={[0, -h / 2 - 0.18, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.36, 6]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={1.2}
            toneMapped={false}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh position={[0, -h / 2 - 0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.14, 0.06, 24]} />
          <meshStandardMaterial color={PALETTE.steelDark} metalness={0.85} roughness={0.35} />
        </mesh>
      </group>
    </Float>
  );
}
