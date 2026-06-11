'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaEye, FaTachometerAlt, FaExpand, FaWifi, FaMicrochip, FaChartLine } from 'react-icons/fa';

// Every value here is measured in the visitor's browser, right now.
// Session clock, tab-focus share, real rAF frame rate, viewport,
// connection state, and reported CPU threads. Nothing is simulated.
interface Metric {
  id: string;
  name: string;
  display: string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  // 0-100 fill for metrics with a meaningful scale, null hides the bar.
  bar: number | null;
  barColor: string;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function LiveMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const frameCount = useRef(0);
  const focusMs = useRef(0);

  useEffect(() => {
    const startedAt = performance.now();
    let lastTick = startedAt;
    let rafId = 0;
    let cancelled = false;

    const countFrame = () => {
      frameCount.current += 1;
      if (!cancelled) rafId = requestAnimationFrame(countFrame);
    };
    rafId = requestAnimationFrame(countFrame);

    const sample = () => {
      const now = performance.now();
      const tickMs = now - lastTick;
      lastTick = now;

      // Browsers throttle or suspend this interval while the tab is
      // hidden, so the first tick after returning can span minutes.
      // Crediting that whole gap as focused time would inflate the
      // number; clamp each tick to its nominal length instead.
      if (document.visibilityState === 'visible') {
        focusMs.current += Math.min(tickMs, 1500);
      }

      const sessionMs = now - startedAt;
      const fps = tickMs > 0 ? Math.round((frameCount.current * 1000) / tickMs) : 0;
      frameCount.current = 0;

      const focusPct = sessionMs > 0 ? Math.min(100, (focusMs.current / sessionMs) * 100) : 0;
      const threads = navigator.hardwareConcurrency;

      setMetrics([
        {
          id: 'session',
          name: 'Session Time',
          display: formatDuration(sessionMs),
          unit: 'min',
          icon: <FaClock />,
          color: 'text-yellow-400',
          bar: null,
          barColor: 'bg-yellow-500',
        },
        {
          id: 'focus',
          name: 'Tab Focus',
          display: `${Math.round(focusPct)}`,
          unit: '%',
          icon: <FaEye />,
          color: 'text-green-400',
          bar: focusPct,
          barColor: 'bg-green-500',
        },
        {
          id: 'fps',
          name: 'Frame Rate',
          display: `${fps}`,
          unit: 'fps',
          icon: <FaTachometerAlt />,
          color: 'text-pink-400',
          bar: Math.min(100, (fps / 60) * 100),
          barColor: 'bg-pink-500',
        },
        {
          id: 'viewport',
          name: 'Viewport',
          display: `${window.innerWidth}x${window.innerHeight}`,
          unit: 'px',
          icon: <FaExpand />,
          color: 'text-blue-400',
          bar: null,
          barColor: 'bg-blue-500',
        },
        {
          id: 'connection',
          name: 'Connection',
          display: navigator.onLine ? 'online' : 'offline',
          unit: '',
          icon: <FaWifi />,
          color: navigator.onLine ? 'text-cyan-400' : 'text-red-400',
          bar: null,
          barColor: 'bg-cyan-500',
        },
        {
          id: 'threads',
          name: 'CPU Threads',
          display: threads ? `${threads}` : 'n/a',
          unit: threads ? 'cores' : '',
          icon: <FaMicrochip />,
          color: 'text-purple-400',
          bar: null,
          barColor: 'bg-purple-500',
        },
      ]);
    };

    sample();
    const interval = setInterval(sample, 1000);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
        <FaChartLine className="mr-2" />
        Your Session, Measured Live
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500/30 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-2">
              <span className={`${metric.color} mr-2`}>{metric.icon}</span>
              <span className="text-sm text-gray-300">{metric.name}</span>
            </div>

            <div className="flex items-baseline">
              <motion.span
                className={`text-2xl font-mono font-bold ${metric.color}`}
                key={metric.display}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {metric.display}
              </motion.span>
              {metric.unit && <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>}
            </div>

            {/* Bars only for metrics with a real 0-100 scale:
                focus share of session, and fps against a 60fps target */}
            {metric.bar !== null && (
              <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                <motion.div
                  className={`h-1.5 rounded-full ${metric.barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.bar}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-800/50 rounded border border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          📊 All values measured in your browser right now · sampled every second · nothing simulated
        </p>
      </div>
    </div>
  );
}
