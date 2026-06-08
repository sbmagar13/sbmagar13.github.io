'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { soundSystem } from '@/lib/soundSystem';

interface MobileOptimized3DProps {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

export default function MobileOptimized3D({ children, fallbackComponent }: MobileOptimized3DProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [use3D, setUse3D] = useState(true);
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(mobile);

      // Check device performance
      if (mobile) {
        const isLowEnd = (navigator as any).deviceMemory < 4 || (navigator as any).hardwareConcurrency < 4;
        if (isLowEnd) {
          setShowPerformanceWarning(true);
        }
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) {
    return <>{children}</>;
  }

  if (!use3D && fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  return (
    <>
      {showPerformanceWarning && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-50 holographic-border rounded-lg p-4 backdrop-blur-md bg-slate-950/90"
          >
            <div className="text-yellow-400 font-mono text-sm mb-2">
              ⚠️ Performance Notice
            </div>
            <div className="text-gray-300 text-xs mb-3">
              3D experience may be intensive on this device. Switch to 2D mode for better performance?
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setUse3D(false);
                  setShowPerformanceWarning(false);
                  soundSystem.playClick();
                }}
                className="px-3 py-1 bg-cyan-600 rounded text-white text-xs font-mono"
              >
                Use 2D Mode
              </button>
              <button
                onClick={() => {
                  setShowPerformanceWarning(false);
                  soundSystem.playClick();
                }}
                className="px-3 py-1 bg-gray-700 rounded text-white text-xs font-mono"
              >
                Continue 3D
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <div className="mobile-optimized-3d">
        {children}
      </div>

      <style jsx global>{`
        .mobile-optimized-3d canvas {
          /* Reduce canvas resolution on mobile for better performance */
          image-rendering: optimizeSpeed;
        }

        @media (max-width: 768px) {
          .mobile-optimized-3d {
            /* Touch action optimizations */
            touch-action: pan-y pinch-zoom;
          }
        }
      `}</style>
    </>
  );
}

// Touch Gesture Handler Component
interface GestureHandlerProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
  children: React.ReactNode;
}

export function GestureHandler({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onDoubleTap,
  children,
}: GestureHandlerProps) {
  const [lastTap, setLastTap] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number; distance?: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      // Double tap detection
      const now = Date.now();
      if (now - lastTap < 300) {
        onDoubleTap?.();
        soundSystem.playClick();
      }
      setLastTap(now);
    } else if (e.touches.length === 2 && onPinch) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = { x: 0, y: 0, distance };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    if (e.touches.length === 2 && onPinch && touchStartRef.current.distance) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance / touchStartRef.current.distance;
      onPinch(scale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    const threshold = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
          soundSystem.playWhoosh();
        } else {
          onSwipeLeft?.();
          soundSystem.playWhoosh();
        }
      }
    } else {
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    touchStartRef.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full h-full"
    >
      {children}
    </div>
  );
}

// Mobile Navigation Helper - SHOWS IMMEDIATELY, NO ANIMATION
export function MobileNavigationHint({ currentSection, totalSections }: { currentSection: number; totalSections: number }) {
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!showHint) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 holographic-border rounded-full px-6 py-3 backdrop-blur-md bg-slate-950/90">
      <div className="text-center">
        <div className="text-cyan-400 font-mono text-xs mb-1">
          SWIPE TO NAVIGATE
        </div>
        <div className="flex items-center gap-3 text-2xl">
          <span>👈</span>
          <div className="text-white text-xs font-mono">
            {currentSection + 1} / {totalSections}
          </div>
          <span>👉</span>
        </div>
      </div>
    </div>
  );
}

// Performance Monitor for Mobile
export function MobilePerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [showWarning, setShowWarning] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      frameCount.current++;

      const now = Date.now();
      if (now >= lastTime.current + 1000) {
        const currentFPS = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        setFps(currentFPS);

        if (currentFPS < 30) {
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }

        frameCount.current = 0;
        lastTime.current = now;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <>
      {/* FPS Counter */}
      <div className="fixed top-4 left-4 z-50 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono">
        <span className={fps < 30 ? 'text-red-500' : fps < 50 ? 'text-yellow-500' : 'text-green-500'}>
          {fps} FPS
        </span>
      </div>

      {/* Performance Warning */}
      {showWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 left-4 right-4 z-50 bg-red-900/80 backdrop-blur-sm px-4 py-2 rounded-lg text-xs font-mono text-white"
        >
          ⚠️ Performance issue detected. Consider switching to 2D mode.
        </motion.div>
      )}
    </>
  );
}
