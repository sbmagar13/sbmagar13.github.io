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
import { BlendFunction, KernelSize, SMAAPreset } from 'postprocessing';
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
  // Premium defaults. Bloom for emissive things only. DoF off by default
  // (caused readability complaints in earlier passes); opt in per scene
  // with a wide focus zone when we genuinely want background softness.
  bloomIntensity = 0.55,
  bloomThreshold = 0.55,
  dof = false,
  focusDistance = 0.1,
  focalLength = 0.04,
  bokehScale = 0.5,
  vignette = 0.5,
  noise = 0.012,
  chromaticAberration = 0.00015,
}: Props) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false} stencilBuffer={false}>
      {/* SMAA LOW: ~30% cheaper than the medium preset and the
          difference is invisible at the screen sizes we render to. */}
      <SMAA preset={SMAAPreset.LOW} />
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.28}
        kernelSize={KernelSize.SMALL}
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
      <Vignette eskil={false} offset={0.3} darkness={vignette} />
      <Noise opacity={noise} blendFunction={BlendFunction.OVERLAY} premultiply />
    </EffectComposer>
  );
}
