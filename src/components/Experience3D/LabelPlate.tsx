'use client';

import { Text, Billboard } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  position?: [number, number, number];
  rotation?: [number, number, number];
  text: string;
  subtext?: string;
  /** SDF font size of the main label */
  size?: number;
  /** SDF font size of the subtext */
  subSize?: number;
  color?: string;
  subColor?: string;
  /** Letter tracking for the main label */
  letterSpacing?: number;
  /** If true, the label faces the camera regardless of orientation. */
  billboard?: boolean;
  /** Render a dark plate behind the text for legibility. */
  plate?: boolean;
  /** Plate color (default near-black). */
  plateColor?: string;
  /** Plate opacity (default 0.78). */
  plateOpacity?: number;
  /** Plate padding around the text [horizontal, vertical]. */
  padding?: [number, number];
  /** Optional accent border. */
  border?: boolean;
  borderColor?: string;
}

/**
 * A 3D text label with optional dark plate behind it and accent border.
 * Designed so every label in the cinematic scenes reads at a glance ,
 * even against bright bloom or busy backgrounds.
 *
 * Sizes plate dimensions from the text length so we don't have to hand-
 * tune each call site.
 */
export default function LabelPlate({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  text,
  subtext,
  size = 0.16,
  subSize = 0.07,
  color = '#e2e8f0',
  subColor = '#94a3b8',
  letterSpacing = 0.05,
  billboard = false,
  plate = true,
  plateColor = '#020617',
  plateOpacity = 0.78,
  padding = [0.16, 0.08],
  border = false,
  borderColor = '#22d3ee',
}: Props) {
  const plateWidth = useMemo(() => {
    const w = (text.length * size * 0.55) * (1 + letterSpacing) + padding[0] * 2;
    const wSub = subtext ? subtext.length * subSize * 0.55 + padding[0] * 1.4 : 0;
    return Math.max(w, wSub);
  }, [text, size, letterSpacing, subtext, subSize, padding]);

  const plateHeight = useMemo(() => {
    const main = size * 1.25;
    const sub = subtext ? subSize * 1.4 + 0.04 : 0;
    return main + sub + padding[1] * 2;
  }, [size, subtext, subSize, padding]);

  const content = (
    <>
      {plate ? (
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[plateWidth, plateHeight]} />
          <meshBasicMaterial color={plateColor} transparent opacity={plateOpacity} depthWrite={false} />
        </mesh>
      ) : null}
      {border ? (
        <>
          <mesh position={[0, plateHeight / 2, 0]}>
            <boxGeometry args={[plateWidth, 0.005, 0.001]} />
            <meshBasicMaterial color={borderColor} toneMapped={false} />
          </mesh>
          <mesh position={[0, -plateHeight / 2, 0]}>
            <boxGeometry args={[plateWidth, 0.005, 0.001]} />
            <meshBasicMaterial color={borderColor} toneMapped={false} />
          </mesh>
        </>
      ) : null}
      <Text
        position={[0, subtext ? subSize * 0.6 + 0.02 : 0, 0.002]}
        fontSize={size}
        color={color}
        letterSpacing={letterSpacing}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.0035}
        outlineColor="#000"
        outlineOpacity={0.9}
      >
        {text}
      </Text>
      {subtext ? (
        <Text
          position={[0, -size * 0.75 + 0.005, 0.002]}
          fontSize={subSize}
          color={subColor}
          letterSpacing={0.12}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.0022}
          outlineColor="#000"
          outlineOpacity={0.85}
        >
          {subtext}
        </Text>
      ) : null}
    </>
  );

  if (billboard) {
    return (
      <group position={position}>
        <Billboard follow lockX={false} lockY={false} lockZ={false}>
          {content}
        </Billboard>
      </group>
    );
  }

  return (
    <group position={position} rotation={rotation as unknown as THREE.Euler}>
      {content}
    </group>
  );
}
