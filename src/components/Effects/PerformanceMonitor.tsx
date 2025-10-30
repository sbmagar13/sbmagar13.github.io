'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaTachometerAlt, FaMemory, FaNetworkWired } from 'react-icons/fa';

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: 0,
    loadTime: 0,
    networkLatency: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        setMetrics(prev => ({ ...prev, fps: frameCount }));
        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    // Measure memory usage (if available)
    const measureMemory = () => {
      if ('memory' in performance) {
        const memoryInfo = (performance as { memory: { usedJSHeapSize: number } }).memory;
        const usedMemory = Math.round(memoryInfo.usedJSHeapSize / 1048576);
        setMetrics(prev => ({ ...prev, memory: usedMemory }));
      }
    };

    const memoryInterval = setInterval(measureMemory, 2000);

    // Measure page load time
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, loadTime }));
    }

    // Simulate network latency measurement
    const measureLatency = async () => {
      const start = performance.now();
      try {
        await fetch('/api/blog', { method: 'HEAD' });
        const latency = Math.round(performance.now() - start);
        setMetrics(prev => ({ ...prev, networkLatency: latency }));
      } catch {
        // Ignore errors
      }
    };

    const latencyInterval = setInterval(measureLatency, 5000);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(memoryInterval);
      clearInterval(latencyInterval);
    };
  }, []);

  return (
    <>
      <motion.button
        className="fixed bottom-4 left-4 p-2 bg-gray-800/80 backdrop-blur-sm rounded-full text-green-400 hover:text-green-300 transition-colors z-50"
        onClick={() => setIsVisible(!isVisible)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaChartLine size={20} />
      </motion.button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed bottom-16 left-4 bg-gray-900/95 backdrop-blur-sm border border-green-500/30 rounded-lg p-4 text-xs font-mono z-50"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-green-400 mb-3 font-bold flex items-center">
              <FaTachometerAlt className="mr-2" />
              Performance Metrics
            </h3>

            <div className="space-y-2 min-w-[200px]">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">FPS:</span>
                <span className={`${metrics.fps >= 50 ? 'text-green-400' : metrics.fps >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {metrics.fps}
                </span>
              </div>

              {metrics.memory > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <FaMemory className="mr-1" size={10} />
                    Memory:
                  </span>
                  <span className="text-blue-400">{metrics.memory} MB</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Load Time:</span>
                <span className="text-purple-400">{metrics.loadTime} ms</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center">
                  <FaNetworkWired className="mr-1" size={10} />
                  Latency:
                </span>
                <span className={`${metrics.networkLatency < 100 ? 'text-green-400' : metrics.networkLatency < 300 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {metrics.networkLatency} ms
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex items-center justify-center text-[10px] text-gray-500">
                DevOps Monitoring Active
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}