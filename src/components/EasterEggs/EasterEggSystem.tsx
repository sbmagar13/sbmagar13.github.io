'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EasterEgg {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export default function EasterEggSystem() {
  const [eggs, setEggs] = useState<EasterEgg[]>([
    { id: 'konami', name: 'Classic Gamer', description: 'Konami Code Master', unlocked: false, icon: '🎮' },
    { id: 'matrix', name: 'Neo', description: 'Type "matrix" to enter the Matrix', unlocked: false, icon: '🕶️' },
    { id: 'hacker', name: 'Elite Hacker', description: 'Type "hack the planet"', unlocked: false, icon: '💻' },
    { id: 'coffee', name: 'Coffee Lover', description: 'Type "coffee" or "lemon tea"', unlocked: false, icon: '☕' },
    { id: 'speed', name: 'Speed Demon', description: 'Press Shift 5 times quickly', unlocked: false, icon: '⚡' },
    { id: 'night', name: 'Night Owl', description: 'Visit after midnight', unlocked: false, icon: '🦉' },
    { id: 'explorer', name: 'Explorer', description: 'Visit all sections', unlocked: false, icon: '🗺️' },
    { id: 'persistent', name: 'Persistent', description: 'Come back 3 days in a row', unlocked: false, icon: '🎯' },
  ]);

  const [showNotification, setShowNotification] = useState(false);
  const [currentEgg, setCurrentEgg] = useState<EasterEgg | null>(null);
  const [konamiProgress, setKonamiProgress] = useState<string[]>([]);
  const [typedKeys, setTypedKeys] = useState<string[]>([]);
  const [shiftCount, setShiftCount] = useState(0);
  const [lastShiftTime, setLastShiftTime] = useState(0);
  const [visitedSections, setVisitedSections] = useState<Set<string>>(new Set());
  const [matrixMode, setMatrixMode] = useState(false);
  const [hackerMode, setHackerMode] = useState(false);

  // Unlock achievement
  const unlockEgg = useCallback((eggId: string) => {
    setEggs((prev) => {
      const updated = prev.map((egg) =>
        egg.id === eggId && !egg.unlocked ? { ...egg, unlocked: true } : egg
      );

      const egg = updated.find((e) => e.id === eggId);
      if (egg && !eggs.find((e) => e.id === eggId)?.unlocked) {
        setCurrentEgg(egg);
        setShowNotification(true);

        // Play achievement sound
        if (typeof window !== 'undefined') {
          const audio = new Audio('data:audio/wav;base64,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');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        }

        setTimeout(() => setShowNotification(false), 5000);

        // Store in localStorage
        if (typeof window !== 'undefined') {
          const stored = JSON.parse(localStorage.getItem('easterEggs') || '[]');
          if (!stored.includes(eggId)) {
            localStorage.setItem('easterEggs', JSON.stringify([...stored, eggId]));
          }
        }
      }

      return updated;
    });
  }, [eggs]);

  // Check night owl
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      unlockEgg('night');
    }
  }, [unlockEgg]);

  // Load saved eggs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('easterEggs') || '[]');
      setEggs((prev) =>
        prev.map((egg) => ({
          ...egg,
          unlocked: stored.includes(egg.id),
        }))
      );
    }
  }, []);

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Track typed keys for text-based eggs
      setTypedKeys((prev) => [...prev.slice(-20), e.key.toLowerCase()]);

      // Konami code tracking
      setKonamiProgress((prev) => {
        const newProgress = [...prev, e.key];
        const sliced = newProgress.slice(-KONAMI_CODE.length);

        if (JSON.stringify(sliced) === JSON.stringify(KONAMI_CODE)) {
          unlockEgg('konami');
          setMatrixMode(true);
          setTimeout(() => setMatrixMode(false), 10000);
        }

        return sliced;
      });

      // Shift spam detection
      if (e.key === 'Shift') {
        const now = Date.now();
        if (now - lastShiftTime < 500) {
          const newCount = shiftCount + 1;
          setShiftCount(newCount);
          if (newCount >= 5) {
            unlockEgg('speed');
            setShiftCount(0);
          }
        } else {
          setShiftCount(1);
        }
        setLastShiftTime(now);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [unlockEgg, shiftCount, lastShiftTime]);

  // Check typed text for eggs
  useEffect(() => {
    const typed = typedKeys.join('');

    if (typed.includes('matrix')) {
      unlockEgg('matrix');
      setMatrixMode(true);
      setTimeout(() => setMatrixMode(false), 10000);
    }

    if (typed.includes('hacktheplanet') || typed.includes('hack')) {
      unlockEgg('hacker');
      setHackerMode(true);
      setTimeout(() => setHackerMode(false), 8000);
    }

    if (typed.includes('coffee') || typed.includes('lemontea') || typed.includes('tea')) {
      unlockEgg('coffee');
    }
  }, [typedKeys, unlockEgg]);

  // Track visited sections
  useEffect(() => {
    const handleHashChange = () => {
      const section = window.location.hash.slice(1);
      if (section) {
        setVisitedSections((prev) => new Set([...prev, section]));
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (visitedSections.size >= 4) {
      unlockEgg('explorer');
    }
  }, [visitedSections, unlockEgg]);

  const unlockedCount = eggs.filter((e) => e.unlocked).length;
  const totalCount = eggs.length;

  return (
    <>
      {/* Matrix Mode Effect */}
      <AnimatePresence>
        {matrixMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(0, 255, 0, 0.1) 0px, rgba(0, 255, 0, 0.1) 1px, transparent 1px, transparent 2px)',
              animation: 'matrix-scan 0.5s linear infinite',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-green-500 font-mono text-6xl animate-pulse">
                WAKE UP, NEO...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hacker Mode Effect */}
      <AnimatePresence>
        {hackerMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center"
          >
            <div className="text-red-500 font-mono text-4xl animate-glitch">
              ACCESS GRANTED
              <br />
              HACK THE PLANET!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Notification */}
      <AnimatePresence>
        {showNotification && currentEgg && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-24 right-8 z-[9999] holographic-border rounded-lg p-6 backdrop-blur-md bg-slate-950/90 shadow-2xl max-w-sm"
          >
            <div className="flex items-start gap-4">
              <div className="text-6xl">{currentEgg.icon}</div>
              <div className="flex-1">
                <div className="text-cyan-400 font-mono text-xs mb-1">ACHIEVEMENT UNLOCKED</div>
                <div className="text-white font-bold text-lg mb-1">{currentEgg.name}</div>
                <div className="text-gray-400 text-sm">{currentEgg.description}</div>
                <div className="mt-3 text-xs text-purple-400">
                  {unlockedCount} / {totalCount} discovered
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Counter (bottom left) */}
      {unlockedCount > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-8 left-8 z-40 holographic-border rounded-full w-16 h-16 flex items-center justify-center backdrop-blur-sm bg-slate-950/50 hover:bg-slate-900/70 transition-all group"
          onClick={() => {
            // Show all achievements
            alert(`Achievements: ${unlockedCount}/${totalCount}\n\n${eggs.filter(e => e.unlocked).map(e => `${e.icon} ${e.name}`).join('\n')}`);
          }}
        >
          <div className="text-center">
            <div className="text-2xl">🏆</div>
            <div className="text-xs text-cyan-400 font-bold">{unlockedCount}/{totalCount}</div>
          </div>

          {/* Tooltip */}
          <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 bg-slate-900/95 backdrop-blur-sm px-4 py-2 rounded-lg border border-cyan-500/30 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="text-cyan-400 font-mono text-sm font-bold">
              ACHIEVEMENTS
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Click to view all
            </div>
          </div>
        </motion.button>
      )}
    </>
  );
}
