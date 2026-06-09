'use client';

import { useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  /** Hide entirely (used on Hero). */
  hidden?: boolean;
  /** Section name shown in the bottom-right monitor. */
  section: string;
}

const CAREER_START = new Date('2020-12-01T00:00:00Z');

const SYSTEM_LOG = [
  'INFO  uptime monitor tick',
  'INFO  prom scrape 200ms p95',
  'INFO  deploy gate green',
  'INFO  redis.set keyspace=42',
  'INFO  k8s scheduler stable',
  'WARN  hpa scale 3 -> 5',
  'INFO  tls cert valid 287d',
  'INFO  loki ingester healthy',
  'INFO  worker queue drained',
  'INFO  alertmgr no firing',
  'INFO  cdn cache hit 94.2%',
  'INFO  s3 lifecycle ok',
  'INFO  packet flow nominal',
  'INFO  observer up 1m 18s',
];

/**
 * A persistent heads-up display layered on top of every 3D scene.
 * Three widgets:
 *   1. Top-left:   real-time UTC clock + career uptime + status pip
 *   2. Top-right:  current section monitor with frame ticks
 *   3. Bottom:     rolling system log strip (Bloomberg-style crawl)
 *
 * Everything is pointer-events: none so it never blocks the 3D below.
 */
export default function HolographicHUD({ hidden = false, section }: Props) {
  // Clock + uptime tick once per second. They used to live in React
  // state, which meant the HUD re-rendered every second. Now they're
  // ref-driven so the React tree stays static and only two textContent
  // strings change.
  const timeRef = useRef<HTMLDivElement>(null);
  const uptimeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = now.getTime() - CAREER_START.getTime();
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      if (timeRef.current) timeRef.current.textContent = now.toISOString().slice(11, 19) + ' UTC';
      if (uptimeRef.current) {
        uptimeRef.current.textContent =
          `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
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
          {/* Top-left: clock + uptime */}
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
                <div className="text-slate-500 uppercase tracking-widest">Career</div>
                <div ref={uptimeRef} className="text-cyan-100 tabular-nums" />
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
              <FrameTicker />
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
                  <LogCrawl />
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

// A small counter that just ticks upward, giving the "frames captured"
// look of a real telemetry monitor. The number was previously held in
// React state which meant a re-render 30 times per second just to draw
// a number. Now it's a ref + direct innerText so no React work fires.
function FrameTicker() {
  const ref = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % 1_000_000;
      if (ref.current) {
        ref.current.textContent = String(frameRef.current).padStart(6, '0');
      }
    }, 33);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mt-1 text-[10px] text-slate-400 tabular-nums">
      frame <span ref={ref} className="text-purple-200">000000</span>
    </div>
  );
}

// Bloomberg-style horizontal log crawl. Uses CSS keyframes via inline
// animation so each line scrolls smoothly.
function LogCrawl() {
  const stream = useMemo(() => {
    // Repeat the log a few times so the crawl never visibly resets.
    return [...SYSTEM_LOG, ...SYSTEM_LOG, ...SYSTEM_LOG].map((line, i) => ({
      key: i,
      text: line,
      // Highlight WARN entries.
      tone: line.startsWith('WARN') ? 'text-amber-300' : 'text-cyan-100',
    }));
  }, []);

  return (
    <div className="whitespace-nowrap flex animate-[hudCrawl_60s_linear_infinite] gap-8 text-[10px]">
      {stream.map((entry) => (
        <span key={entry.key} className={`${entry.tone} tracking-wider`}>
          <span className="text-slate-500 mr-2">{`▸`}</span>
          {entry.text}
        </span>
      ))}
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
    </div>
  );
}
