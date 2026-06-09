'use client';

import { useEffect, useState } from 'react';

interface Counter {
  label: string;
  base: number;
  /** Average increment per tick (1 sec). Per-tick is randomized around this. */
  rate: number;
  color: string;
  suffix?: string;
  /** If true, format with k/M for big numbers. */
  abbreviate?: boolean;
}

const COUNTERS: Counter[] = [
  { label: 'Deploys today', base: 7, rate: 0.05, color: 'text-cyan-300' },
  { label: 'Packets transmitted', base: 142_839, rate: 17, color: 'text-purple-300', abbreviate: true },
  { label: 'p95 latency', base: 0, rate: 0, color: 'text-emerald-300', suffix: 'ms' },
  { label: 'SLO budget', base: 99.973, rate: 0, color: 'text-cyan-200', suffix: '%' },
];

function format(n: number, abbreviate?: boolean): string {
  if (!abbreviate) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return Math.floor(n).toString();
}

/**
 * Floating activity strip for the Hero. Four plausible production
 * metrics that increment over time so the page feels live even when
 * nothing's happening. Deploys creep upward, packets tick fast,
 * latency wobbles around a baseline, SLO budget drifts.
 */
export default function LiveCounters() {
  const [values, setValues] = useState<number[]>(COUNTERS.map((c) => c.base));

  useEffect(() => {
    const id = setInterval(() => {
      setValues((prev) =>
        prev.map((v, i) => {
          const c = COUNTERS[i];
          if (c.label === 'p95 latency') {
            // wobble around ~120ms
            return 110 + Math.random() * 25;
          }
          if (c.label === 'SLO budget') {
            // drift very slowly between 99.95 and 99.99
            return 99.95 + Math.random() * 0.04;
          }
          if (c.label === 'Deploys today') {
            // a deploy lands every 30-90s on average
            return v + (Math.random() < c.rate / 8 ? 1 : 0);
          }
          // Packets, ticking fast
          return v + Math.round(c.rate * (0.7 + Math.random() * 0.6));
        }),
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="font-mono flex flex-wrap gap-2 justify-center">
      {COUNTERS.map((c, i) => (
        <div
          key={c.label}
          className="relative rounded border border-cyan-500/25 bg-slate-950/60 backdrop-blur-sm px-4 py-2 min-w-[140px]"
        >
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/60" />
          <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/60" />
          <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/60" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/60" />
          <div className="text-[9px] uppercase tracking-[0.22em] text-slate-500">
            {c.label}
          </div>
          <div className={`text-base tabular-nums ${c.color}`}>
            {c.label === 'SLO budget'
              ? values[i].toFixed(3)
              : format(values[i], c.abbreviate)}
            {c.suffix ? <span className="text-slate-400 text-xs ml-0.5">{c.suffix}</span> : null}
          </div>
          {/* Tiny pulse light to suggest live data */}
          <span className="absolute top-2 right-2 w-1 h-1 rounded-full bg-cyan-300 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
