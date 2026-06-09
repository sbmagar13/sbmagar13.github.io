'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onDone: () => void;
}

/**
 * Boot-style cinematic overlay shown the first time a visitor arrives on
 * the 3D home this session. Five lines of glitchy terminal output type
 * out, then the whole layer scans, glitches, and fades to reveal the
 * Hero scene underneath.
 *
 * Skippable with click or any keypress.
 */
const BOOT_LINES: { text: string; delay: number; emphasis?: boolean }[] = [
  { text: '> Initializing neural holograph...', delay: 0 },
  { text: '> Loading DevOps brain matrix...', delay: 520 },
  { text: '> Pulling Aurora multi-region state...', delay: 1050 },
  { text: '> Decrypting identity: SAGAR BUDHATHOKI', delay: 1640 },
  { text: '> Connection established. Welcome.', delay: 2280, emphasis: true },
];

const TOTAL = 3450;

export default function CinematicIntro({ onDone }: Props) {
  const [shown, setShown] = useState<number[]>([]);
  const [phase, setPhase] = useState<'typing' | 'glitch' | 'fade'>('typing');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    BOOT_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setShown((s) => [...s, i]), line.delay));
    });
    timers.push(setTimeout(() => setPhase('glitch'), 2750));
    timers.push(setTimeout(() => setPhase('fade'), 3050));
    timers.push(setTimeout(() => onDone(), TOTAL));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  // Click or any key skips the intro.
  useEffect(() => {
    const skip = () => onDone();
    window.addEventListener('keydown', skip);
    window.addEventListener('click', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('click', skip);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      <motion.div
        key="intro"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'fade' ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[80] bg-black flex items-center justify-center font-mono overflow-hidden cursor-pointer"
      >
        {/* CRT background grid */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,211,238,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.18) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'introGrid 8s linear infinite',
          }}
        />

        {/* Centred boot console */}
        <div className="relative z-10 w-full max-w-2xl px-8">
          <div className="font-mono text-[10px] tracking-[0.4em] text-cyan-300/70 uppercase mb-4">
            sagarbudhathoki · boot sequence v3
          </div>
          <div
            className={`relative border border-cyan-400/40 bg-slate-950/85 backdrop-blur-md rounded-md p-6 shadow-[0_0_60px_rgba(34,211,238,0.2)] ${
              phase === 'glitch' ? 'animate-[introGlitch_0.3s_steps(3)_infinite]' : ''
            }`}
          >
            {/* Decorative corner brackets */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-300" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-300" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-300" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-300" />

            {BOOT_LINES.map((line, i) => {
              const visible = shown.includes(i);
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 py-1.5 transition-opacity duration-200"
                  style={{ opacity: visible ? 1 : 0 }}
                >
                  <span
                    className={
                      line.emphasis
                        ? 'text-emerald-300 text-[15px]'
                        : 'text-cyan-200 text-[14px]'
                    }
                  >
                    {line.text}
                  </span>
                  {visible && (
                    <span className="text-emerald-400 text-[14px]">[OK]</span>
                  )}
                </div>
              );
            })}
            {/* Active prompt cursor */}
            <div className="mt-2 flex items-center gap-1 text-cyan-300/70 text-[13px]">
              <span>$</span>
              <span className="inline-block w-2 h-4 bg-cyan-300 animate-pulse" />
            </div>
          </div>

          <div className="mt-6 text-center text-[10px] uppercase tracking-[0.4em] text-slate-500">
            click or press any key to skip
          </div>
        </div>

        {/* Sweeping scan line during glitch phase */}
        {phase === 'glitch' && (
          <div
            className="absolute left-0 right-0 h-12 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, transparent, rgba(34,211,238,0.5), transparent)',
              animation: 'introScan 0.4s linear forwards',
            }}
          />
        )}

        <style jsx>{`
          @keyframes introGrid {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(60px);
            }
          }
          @keyframes introGlitch {
            0% {
              transform: translate(0, 0);
              filter: hue-rotate(0deg);
            }
            25% {
              transform: translate(-2px, 1px);
              filter: hue-rotate(15deg);
            }
            50% {
              transform: translate(2px, -1px);
              filter: hue-rotate(-15deg);
            }
            75% {
              transform: translate(-1px, 2px);
              filter: hue-rotate(8deg);
            }
            100% {
              transform: translate(0, 0);
              filter: hue-rotate(0deg);
            }
          }
          @keyframes introScan {
            from {
              top: -10%;
            }
            to {
              top: 110%;
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
