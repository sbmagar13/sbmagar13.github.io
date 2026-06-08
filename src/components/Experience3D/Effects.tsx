'use client';

import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  ChromaticAberration,
  SMAA,
  Noise,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { Vector2 } from 'three';

interface Props {
  bloomIntensity?: number;
  bloomThreshold?: number;
  dof?: boolean;
  focusDistance?: number;
  focalLength?: number;
  bokehScale?: number;
  vignette?: number;
  noise?: number;
  chromaticAberration?: number;
}

/**
 * Shared cinematic post-processing pipeline. Drop inside a <Canvas>:
 *
 *   <Canvas>
 *     ...scene...
 *     <CinematicEffects />
 *   </Canvas>
 *
 * Tuned for a dim, neon-lit data-center aesthetic.
 */
export default function CinematicEffects({
  bloomIntensity = 0.9,
  bloomThreshold = 0.2,
  dof = true,
  focusDistance = 0.02,
  focalLength = 0.04,
  bokehScale = 3,
  vignette = 0.6,
  noise = 0.03,
  chromaticAberration = 0.0015,
}: Props) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <SMAA />
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.15}
        kernelSize={KernelSize.LARGE}
        mipmapBlur
      />
      {dof ? (
        <DepthOfField
          focusDistance={focusDistance}
          focalLength={focalLength}
          bokehScale={bokehScale}
        />
      ) : (
        <></>
      )}
      <ChromaticAberration
        offset={new Vector2(chromaticAberration, chromaticAberration)}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette eskil={false} offset={0.25} darkness={vignette} />
      <Noise opacity={noise} blendFunction={BlendFunction.OVERLAY} premultiply />
    </EffectComposer>
  );
}
