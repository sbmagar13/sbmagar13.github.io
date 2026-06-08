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
  // Conservative defaults, bloom should make emissive things sparkle,
  // not turn the whole scene white. Per-scene overrides can amp these up
  // when the composition actually calls for more glow.
  bloomIntensity = 0.55,
  bloomThreshold = 0.55,
  dof = true,
  focusDistance = 0.025,
  focalLength = 0.03,
  bokehScale = 1.6,
  vignette = 0.55,
  noise = 0.025,
  chromaticAberration = 0.0006,
}: Props) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <SMAA />
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.25}
        kernelSize={KernelSize.MEDIUM}
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
