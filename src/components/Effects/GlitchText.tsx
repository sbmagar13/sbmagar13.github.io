'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function GlitchText({ text, className = '', delay = 0 }: GlitchTextProps) {
  const [glitchedText, setGlitchedText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789';

    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setIsGlitching(true);
        let newText = '';

        for (let i = 0; i < text.length; i++) {
          if (Math.random() > 0.8 && text[i] !== ' ') {
            newText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
          } else {
            newText += text[i];
          }
        }

        setGlitchedText(newText);

        setTimeout(() => {
          setGlitchedText(text);
          setIsGlitching(false);
        }, 100);
      }
    }, 2000);

    return () => clearInterval(glitchInterval);
  }, [text]);

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <span className={isGlitching ? 'glitch-effect' : ''}>
        {glitchedText}
      </span>
      {isGlitching && (
        <>
          <span className="absolute top-0 left-0 text-cyan-400 opacity-70" style={{ transform: 'translate(-2px, -2px)' }}>
            {glitchedText}
          </span>
          <span className="absolute top-0 left-0 text-red-400 opacity-70" style={{ transform: 'translate(2px, 2px)' }}>
            {glitchedText}
          </span>
        </>
      )}
      <style jsx>{`
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        .glitch-effect {
          animation: glitch 0.3s infinite;
        }
      `}</style>
    </motion.div>
  );
}