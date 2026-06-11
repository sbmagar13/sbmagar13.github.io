'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerfTier } from './usePerfTier';

interface Props {
  /** Hide entirely (used on Hero). */
  hidden?: boolean;
  /** Section name shown in the bottom-right monitor. */
  section: string;
}

/**
 * A persistent heads-up display layered on top of every 3D scene.
 * Three widgets:
 *   1. Top-left:   real-time UTC clock + session counter + status pip
 *   2. Top-right:  current section monitor with live fps + render context
 *   3. Bottom:     rolling session event log (Bloomberg-style crawl)
 *
 * Everything shown here is measured, not invented: fps comes from a
 * requestAnimationFrame loop, the context line reads the actual device,
 * and the log records real section changes with real timestamps.
 *
 * Everything is pointer-events: none so it never blocks the 3D below.
 */
export default function HolographicHUD({ hidden = false, section }: Props) {
  // Clock + session counter tick once per second. They used to live in
  // React state, which meant the HUD re-rendered every second. Now
  // they're ref-driven so the React tree stays static and only two
  // textContent strings change.
  const timeRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<HTMLDivElement>(null);

  const tier = usePerfTier();
  // Lazy init is safe here: the HUD is hidden on Hero, so it never
  // renders during hydration and there is no server/client mismatch.
  // Resize also covers browser zoom, which changes dpr. The value is
  // clamped to the scenes' Canvas dpr cap (1.75 on high tier, 1 on
  // low) so the line reports what WebGL actually renders at, not the
  // raw display density.
  const renderDpr = () => {
    const cap = tier === 'low' ? 1 : 1.75;
    return Math.round(Math.min(window.devicePixelRatio, cap) * 100) / 100;
  };
  const [dpr, setDpr] = useState(() => (typeof window === 'undefined' ? 1 : renderDpr()));

  useEffect(() => {
    setDpr(renderDpr());
    const onResize = () => setDpr(renderDpr());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      if (timeRef.current) timeRef.current.textContent = now.toISOString().slice(11, 19) + ' UTC';
      if (sessionRef.current) {
        // Seconds since page load, straight from the monotonic clock.
        const total = Math.floor(performance.now() / 1000);
        const minutes = Math.floor(total / 60);
        const seconds = total % 60;
        sessionRef.current.textContent =
          minutes > 0 ? `${minutes}m ${String(seconds).padStart(2, '0')}s` : `${seconds}s`;
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimatePresence>
      {!hidden ? (
        <motion.div
          key="hud"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none absolute inset-0 z-30 font-mono"
        >
          {/* Top-left: clock + session counter */}
          <div className="absolute top-20 left-6 text-[10px] text-slate-300">
            <div className="relative rounded-md border border-cyan-400/30 bg-slate-950/70 backdrop-blur-md px-3 py-2 min-w-[220px]">
              <CornerBrackets />
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-cyan-200 tracking-[0.22em] uppercase">System online</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                <div className="text-slate-500 uppercase tracking-widest">Now</div>
                <div ref={timeRef} className="text-cyan-100 tabular-nums" />
                <div className="text-slate-500 uppercase tracking-widest">Session</div>
                <div ref={sessionRef} className="text-cyan-100 tabular-nums" />
              </div>
            </div>
          </div>

          {/* Top-right: section monitor */}
          <div className="absolute top-20 right-6 text-[10px] text-slate-300">
            <div className="relative rounded-md border border-purple-400/30 bg-slate-950/70 backdrop-blur-md px-3 py-2 min-w-[180px] text-right">
              <CornerBrackets color="border-purple-300" />
              <div className="text-purple-300 uppercase tracking-[0.22em]">Current scene</div>
              <div className="mt-1 text-lg font-semibold text-white tracking-wider">
                {section.toUpperCase()}
              </div>
              <FpsMeter />
              <div className="mt-1 text-[10px] text-slate-400">
                tier <span className="text-purple-200">{tier}</span> · dpr{' '}
                <span className="text-purple-200">{dpr}</span> · post{' '}
                <span className="text-purple-200">{tier === 'low' ? 'off' : 'on'}</span>
              </div>
            </div>
          </div>

          {/* Bottom: rolling log */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-[840px] w-[88%]">
            <div className="relative rounded-md border border-cyan-400/25 bg-slate-950/70 backdrop-blur-md px-4 py-2 overflow-hidden">
              <CornerBrackets />
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-cyan-300 uppercase tracking-[0.3em] shrink-0">
                  Telemetry
                </span>
                <div className="flex-1 overflow-hidden h-4">
                  <LogCrawl section={section} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function CornerBrackets({ color = 'border-cyan-300' }: { color?: string }) {
  return (
    <>
      <span aria-hidden className={`absolute top-0 left-0 w-2.5 h-2.5 border-t border-l ${color}`} />
      <span aria-hidden className={`absolute top-0 right-0 w-2.5 h-2.5 border-t border-r ${color}`} />
      <span aria-hidden className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l ${color}`} />
      <span aria-hidden className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r ${color}`} />
    </>
  );
}

// Real frames-per-second readout. rAF in the DOM measures page
// compositor frames, which is the honest number for an overlay (it is
// not the WebGL render loop). Frames accumulate in local vars and the
// rounded value lands via textContent twice a second, same ref pattern
// as the clock above, so no React work fires.
function FpsMeter() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    let frames = 0;
    let last = performance.now();
    const loop = (now: number) => {
      frames += 1;
      if (now - last >= 500) {
        if (ref.current) {
          ref.current.textContent = String(Math.round((frames * 1000) / (now - last)));
        }
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="mt-1 text-[10px] text-slate-400 tabular-nums">
      fps <span ref={ref} className="text-purple-200">--</span>
    </div>
  );
}

// Bloomberg-style horizontal crawl, fed by the real session log:
// 'overlay online' when the HUD mounts, then one timestamped line per
// scene change, capped at the last six events. Entries are append-only
// and live in a ref; the strip updates via textContent (same pattern
// as the clock) so logging never re-renders. The line is written twice
// so the -50% keyframe loops without a visible seam.
function LogCrawl({ section }: { section: string }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const entriesRef = useRef<string[]>([]);
  const prevSectionRef = useRef<string | null>(null);

  useEffect(() => {
    const stamp = new Date().toTimeString().slice(0, 8);
    if (prevSectionRef.current === null) {
      entriesRef.current.push(`${stamp} overlay online`);
    } else if (prevSectionRef.current !== section) {
      entriesRef.current.push(`${stamp} scene -> ${section}`);
    }
    prevSectionRef.current = section;
    entriesRef.current = entriesRef.current.slice(-6);
    if (stripRef.current) {
      const line = entriesRef.current.map((entry) => `▸ ${entry}`).join('   ');
      stripRef.current.textContent = `${line}   ${line}   `;
    }
  }, [section]);

  return (
    <>
      <div
        ref={stripRef}
        className="whitespace-nowrap animate-[hudCrawl_60s_linear_infinite] text-[10px] text-cyan-100 tracking-wider"
      />
      <style jsx>{`
        @keyframes hudCrawl {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </>
  );
}
