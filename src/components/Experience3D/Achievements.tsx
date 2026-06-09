'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface Achievement {
  id: string;
  title: string;
  detail?: string;
}

interface Props {
  /**
   * Whenever `unlock` is set to a non-null Achievement, a toast appears
   * for ~3.5 seconds. Setting it back to null clears any pending toast.
   */
  unlock: Achievement | null;
}

/**
 * Achievement-unlock toast, top-right, glowing cyan, auto-dismissing.
 * Reads like a game achievement popup because that's exactly what it is.
 *
 * The parent (page.tsx) keeps the unlocked-set in state so we don't
 * fire the same toast twice.
 */
export default function Achievements({ unlock }: Props) {
  const [current, setCurrent] = useState<Achievement | null>(null);

  useEffect(() => {
    if (!unlock) return;
    setCurrent(unlock);
    const id = setTimeout(() => setCurrent(null), 3500);
    return () => clearTimeout(id);
  }, [unlock]);

  return (
    <AnimatePresence>
      {current ? (
        <motion.div
          key={current.id}
          initial={{ x: 60, opacity: 0, scale: 0.92 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 60, opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-32 right-6 z-[70] pointer-events-none font-mono"
        >
          <div className="relative rounded-md border border-amber-400/50 bg-slate-950/95 backdrop-blur-md px-5 py-3 shadow-[0_0_36px_rgba(245,158,11,0.3)] min-w-[260px]">
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-300" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-300" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-300" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-300" />

            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-amber-200">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              achievement unlocked
            </div>
            <div className="mt-1 text-sm text-white tracking-wider">{current.title}</div>
            {current.detail ? (
              <div className="mt-0.5 text-[11px] text-slate-400">{current.detail}</div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
