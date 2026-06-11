'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Mounted inside a Canvas. Watches for WebGL context loss, which on
 * phone GPUs (iOS Safari especially) otherwise leaves a permanently
 * black scene with no recovery path. preventDefault gives the browser
 * a chance to restore the context on its own; if no restore arrives
 * within 1.5s the onLost callback fires so the owning scene can bump
 * its Canvas key and rebuild from scratch.
 */
export default function ContextGuard({ onLost }: { onLost: () => void }) {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const el = gl.domElement;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const lost = (e: Event) => {
      e.preventDefault();
      timer = setTimeout(onLost, 1500);
    };
    const restored = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    el.addEventListener('webglcontextlost', lost);
    el.addEventListener('webglcontextrestored', restored);
    return () => {
      if (timer) clearTimeout(timer);
      el.removeEventListener('webglcontextlost', lost);
      el.removeEventListener('webglcontextrestored', restored);
    };
  }, [gl, onLost]);

  return null;
}
