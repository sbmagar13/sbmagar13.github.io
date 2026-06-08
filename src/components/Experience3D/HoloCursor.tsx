'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A holographic crosshair that follows the mouse on the 3D experience
 * page. Hidden on touch devices. Lifted on every move via direct DOM
 * mutation so the React tree doesn't re-render at cursor rate.
 *
 * Pure HTML overlay. Pointer-events: none so 3D interaction is intact.
 */
export default function HoloCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Skip on touch screens.
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    setEnabled(true);

    let rafId = 0;
    let nextX = 0;
    let nextY = 0;

    const onMove = (e: MouseEvent) => {
      nextX = e.clientX;
      nextY = e.clientY;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (wrapRef.current) {
          wrapRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
        }
      });
    };

    const onDown = () => {
      if (wrapRef.current) wrapRef.current.classList.add('holocursor-click');
    };
    const onUp = () => {
      if (wrapRef.current) wrapRef.current.classList.remove('holocursor-click');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={wrapRef}
        className="holocursor pointer-events-none fixed top-0 left-0 z-[60] mix-blend-screen"
        aria-hidden
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        {/* Center dot */}
        <span className="block w-1 h-1 rounded-full bg-cyan-300 absolute -top-0.5 -left-0.5 shadow-[0_0_6px_#22d3ee]" />
        {/* Outer ring */}
        <span className="block w-7 h-7 rounded-full border border-cyan-400/60 absolute -top-[14px] -left-[14px] holocursor-ring" />
        {/* Diagonal hash tick */}
        <span className="block w-[18px] h-px bg-cyan-300/60 absolute -left-[9px] top-0 rotate-45 origin-center" />
        <span className="block w-[18px] h-px bg-cyan-300/60 absolute -left-[9px] top-0 -rotate-45 origin-center" />
      </div>

      <style jsx global>{`
        .holocursor-ring {
          animation: holocursor-pulse 2.2s ease-in-out infinite;
        }
        .holocursor-click .holocursor-ring {
          animation: holocursor-burst 0.4s ease-out;
        }
        @keyframes holocursor-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.18);
            opacity: 0.85;
          }
        }
        @keyframes holocursor-burst {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
