'use client';

import { useEffect, useState } from 'react';

interface Props {
  /**
   * Pass a value that changes whenever a new scene becomes active.
   * The warp plays for ~600ms then auto-clears. Keying off this prop
   * means we don't need a manual reset.
   */
  trigger: string | number;
}

/**
 * Brief CRT-style transition flash. Triggers a short scan line sweep,
 * RGB chromatic burst, and bloom pulse whenever `trigger` changes. Sits
 * above every scene but below the HUD chrome.
 *
 * Pure CSS animations so there's zero JS per frame; the effect just
 * mounts, plays, and unmounts.
 */
export default function SceneWarp({ trigger }: Props) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const id = setTimeout(() => setActive(false), 620);
    return () => clearTimeout(id);
  }, [trigger]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[55]">
      {/* Bloom flash, full screen for ~120ms */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(34,211,238,0.18) 0%, transparent 60%)',
          animation: 'warpFlash 220ms ease-out forwards',
        }}
      />
      {/* Scan line sweep */}
      <div
        className="absolute left-0 right-0 h-24"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(34,211,238,0.55), transparent)',
          animation: 'warpScan 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        }}
      />
      {/* RGB ghost edges, top + bottom band */}
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: '#22d3ee', animation: 'warpEdge 600ms ease-out forwards' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1.5"
        style={{ background: '#a855f7', animation: 'warpEdge 600ms ease-out forwards' }}
      />

      <style jsx>{`
        @keyframes warpFlash {
          0% {
            opacity: 0;
            transform: scale(0.96);
          }
          30% {
            opacity: 0.95;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.05);
          }
        }
        @keyframes warpScan {
          from {
            top: -10%;
            opacity: 0.85;
          }
          to {
            top: 110%;
            opacity: 0;
          }
        }
        @keyframes warpEdge {
          0% {
            opacity: 0;
            transform: scaleX(0);
          }
          25% {
            opacity: 1;
            transform: scaleX(1);
          }
          100% {
            opacity: 0;
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}
