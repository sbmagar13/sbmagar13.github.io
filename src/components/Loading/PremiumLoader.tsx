'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PremiumLoaderProps {
  onComplete?: () => void;
}

export default function PremiumLoader({ onComplete }: PremiumLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState<string[]>([]);

  const messages = [
    'Initializing quantum processors...',
    'Syncing neural pathways...',
    'Loading holographic interfaces...',
    'Calibrating particle systems...',
    'Establishing 3D environment...',
    'Optimizing performance matrices...',
    'Deploying visual effects...',
    'Ready to launch...',
  ];

  useEffect(() => {
    let currentProgress = 0;
    let messageIndex = 0;

    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        setTimeout(() => onComplete?.(), 500);
      }
      setProgress(currentProgress);
    }, 200);

    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        setLoadingMessages((prev) => [...prev, messages[messageIndex]]);
        messageIndex++;
      }
    }, 300);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-8">
        {/* Logo/Title */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="text-6xl font-bold holographic-text mb-4">
            DEVOPS BRAIN 3.0
          </div>
          <div className="text-cyan-400 font-mono text-lg">
            Ultra Premium Edition
          </div>
        </motion.div>

        {/* Hexagon Loader */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                style={{
                  rotate: i * 60,
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              >
                <div className="w-full h-full border-2 border-cyan-400 rotate-45" />
              </motion.div>
            ))}

            {/* Center pulse */}
            <motion.div
              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-mono text-cyan-400 mb-2">
            <span>LOADING</span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div className="relative h-3 bg-slate-900/50 rounded-full overflow-hidden holographic-border">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>
        </div>

        {/* Loading Messages */}
        <div className="space-y-2 h-48 overflow-hidden">
          {loadingMessages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 font-mono text-sm text-gray-400"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span>{message}</span>
              <motion.span
                className="text-green-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                [OK]
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Fun fact/tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-8 text-center text-sm text-purple-400 font-mono"
        >
          <span className="text-cyan-400">TIP:</span> Try typing "matrix" or "hack the planet" for easter eggs!
        </motion.div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50,
            }}
            animate={{
              y: -50,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }
      `}</style>
    </motion.div>
  );
}
