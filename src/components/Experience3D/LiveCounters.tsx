'use client';

import { useEffect, useRef } from 'react';

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

function renderValue(label: string, v: number, abbreviate?: boolean): string {
  if (label === 'SLO budget') return v.toFixed(3);
  return format(v, abbreviate);
}

/**
 * Floating activity strip for the Hero. Four plausible production
 * metrics that increment over time so the page feels live even when
 * nothing's happening.
 *
 * The values used to live in React state, which meant a full subtree
 * re-render once per second. Now they live in refs and the visible
 * numbers are updated via direct DOM textContent. No React work per
 * tick, no reconciliation, no GC churn.
 */
export default function LiveCounters() {
  const valueRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const valuesRef = useRef<number[]>(COUNTERS.map((c) => c.base));

  useEffect(() => {
    const id = setInterval(() => {
      valuesRef.current = valuesRef.current.map((v, i) => {
        const c = COUNTERS[i];
        if (c.label === 'p95 latency') return 110 + Math.random() * 25;
        if (c.label === 'SLO budget') return 99.95 + Math.random() * 0.04;
        if (c.label === 'Deploys today') return v + (Math.random() < c.rate / 8 ? 1 : 0);
        return v + Math.round(c.rate * (0.7 + Math.random() * 0.6));
      });
      valuesRef.current.forEach((v, i) => {
        const el = valueRefs.current[i];
        if (el) el.textContent = renderValue(COUNTERS[i].label, v, COUNTERS[i].abbreviate);
      });
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
            <span
              ref={(el) => {
                valueRefs.current[i] = el;
              }}
            >
              {renderValue(c.label, c.base, c.abbreviate)}
            </span>
            {c.suffix ? <span className="text-slate-400 text-xs ml-0.5">{c.suffix}</span> : null}
          </div>
          <span className="absolute top-2 right-2 w-1 h-1 rounded-full bg-cyan-300 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
