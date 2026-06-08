'use client';

import { useEffect, useRef } from 'react';

/**
 * Tracks the mouse position normalized to [-1, 1] across the viewport.
 * Updates are throttled to one per animation frame so this is safe to
 * subscribe to inside a busy 3D scene.
 *
 * Returns a mutable ref so consumers can read latest values inside
 * useFrame without re-rendering React components on each move.
 */
export default function useMouseParallax() {
  const ref = useRef({ x: 0, y: 0 });
  const pending = useRef<{ x: number; y: number } | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onMove = (e: MouseEvent) => {
      pending.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        if (pending.current) {
          ref.current = pending.current;
          pending.current = null;
        }
      });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return ref;
}
