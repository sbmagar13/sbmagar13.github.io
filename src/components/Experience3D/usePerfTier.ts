'use client';

import { useEffect, useState } from 'react';

export type PerfTier = 'low' | 'high';

/**
 * Returns a coarse device tier:
 *   - 'low'  on actual phones / touch tablets (narrow + coarse pointer),
 *            or on machines reporting <=4 logical cores or <4GB device
 *            memory when those APIs are available.
 *   - 'high' on everything else (desktops, laptops, any setup with a
 *            mouse and a wide screen).
 *
 * Scenes pull DPR caps, particle counts, post-processing toggles and
 * autorotate from this so phones stay smooth without us shipping a
 * second site.
 */
export function usePerfTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>('high');

  useEffect(() => {
    const compute = (): PerfTier => {
      if (typeof window === 'undefined') return 'high';
      const narrow = window.innerWidth < 900;
      const touch =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(pointer: coarse)').matches;

      // Optional capability hints (Chrome / Edge), fall back to "good
      // enough" defaults when the API isn't present.
      type WithMemory = Navigator & { deviceMemory?: number };
      const cores = navigator.hardwareConcurrency ?? 8;
      const mem = (navigator as WithMemory).deviceMemory ?? 8;

      const phoneish = narrow && touch;
      const constrained = cores <= 4 && mem <= 4;

      return phoneish || constrained ? 'low' : 'high';
    };

    setTier(compute());

    const onResize = () => setTier(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return tier;
}
