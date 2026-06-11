'use client';

import { useEffect, useState } from 'react';

export type PerfTier = 'low' | 'high';

// Computed eagerly (not in an effect) so a phone's very first render
// already takes the cheap path. The old version initialized to 'high'
// and corrected itself one render later, which meant phones paid for a
// desktop-grade first frame: full DPR, postprocessing, every particle.
function computeTier(): PerfTier {
  if (typeof window === 'undefined') return 'high';
  const narrow = window.innerWidth < 900;
  const touch =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;

  // Optional capability hints (Chrome / Edge only; Safari and Firefox
  // expose neither deviceMemory nor reliable values). When the API is
  // missing we lean on the phoneish heuristic alone rather than
  // guessing hardware we cannot see.
  type WithMemory = Navigator & { deviceMemory?: number };
  const cores = navigator.hardwareConcurrency ?? 0;
  const mem = (navigator as WithMemory).deviceMemory ?? 0;

  const phoneish = narrow && touch;
  // Only classify on hardware hints when the browser actually reports
  // them. cores<=4 alone no longer demotes 4-core/8GB laptops.
  const constrained = cores > 0 && mem > 0 && cores <= 4 && mem <= 4;

  return phoneish || constrained ? 'low' : 'high';
}

/**
 * Returns a coarse device tier:
 *   - 'low'  on actual phones / touch tablets (narrow + coarse pointer),
 *            or on machines reporting both <=4 logical cores and <=4GB
 *            device memory when those APIs are available.
 *   - 'high' on everything else (desktops, laptops, any setup with a
 *            mouse and a wide screen).
 *
 * Scenes pull DPR caps, particle counts, post-processing toggles and
 * autorotate from this so phones stay smooth without us shipping a
 * second site.
 */
export function usePerfTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>(computeTier);

  useEffect(() => {
    setTier(computeTier());
    const onResize = () => setTier(computeTier());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return tier;
}

/**
 * True when the visitor asked the OS for reduced motion. Scenes use it
 * to drop autorotate, skip the CRT warp flash, and replace large
 * entrance choreography with simple fades.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
