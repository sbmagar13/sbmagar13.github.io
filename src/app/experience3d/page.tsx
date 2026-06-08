'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { soundSystem } from '@/lib/soundSystem';

// Dynamically import 3D components to improve initial load
const Hero3D = dynamic(() => import('@/components/Hero/Hero3D'), { ssr: false });
const HolographicAvatar = dynamic(() => import('@/components/Avatar/UltraEpicAvatar'), { ssr: false });
const About3D = dynamic(() => import('@/components/About/SimpleAbout3D'), { ssr: false });
const Projects3D = dynamic(() => import('@/components/Projects/EpicProjects3D'), { ssr: false });
const Skills3D = dynamic(() => import('@/components/Tools/EpicSkills3D'), { ssr: false });
const PremiumLoader = dynamic(() => import('@/components/Loading/PremiumLoader'), { ssr: false });
const EasterEggSystem = dynamic(() => import('@/components/EasterEggs/EasterEggSystem'), { ssr: false });
const MobileOptimized3D = dynamic(() => import('@/components/Mobile/MobileOptimized3D'), { ssr: false });
const GestureHandler = dynamic(() => import('@/components/Mobile/MobileOptimized3D').then(mod => ({ default: mod.GestureHandler })), { ssr: false });

type Section = 'hero' | 'avatar' | 'about' | 'projects' | 'skills';

export default function Experience3D() {
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<Section>('hero');
  const [showNav, setShowNav] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    // Initialize sound system
    setSoundEnabled(soundSystem.isEnabled());

    // Show navigation after hero is displayed
    const timer = setTimeout(() => setShowNav(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const sections: Section[] = ['hero', 'avatar', 'about', 'projects', 'skills'];
      const currentIndex = sections.indexOf(currentSection);

      if (e.key === 'ArrowRight' || e.key === 'd') {
        const nextIndex = (currentIndex + 1) % sections.length;
        setCurrentSection(sections[nextIndex]);
        soundSystem.playWhoosh();
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        const prevIndex = (currentIndex - 1 + sections.length) % sections.length;
        setCurrentSection(sections[prevIndex]);
        soundSystem.playWhoosh();
      } else if (e.key >= '1' && e.key <= '5') {
        setCurrentSection(sections[parseInt(e.key) - 1]);
        soundSystem.playClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSection]);

  const handleEnterExperience = () => {
    setCurrentSection('avatar');
    soundSystem.playPowerUp();
  };

  const sections: Section[] = ['avatar', 'about', 'projects', 'skills'];
  const currentSectionIndex = sections.indexOf(currentSection);

  // Gesture handlers for mobile
  const handleSwipeLeft = () => {
    if (currentSection === 'hero') return;
    const nextIndex = (currentSectionIndex + 1) % sections.length;
    setCurrentSection(sections[nextIndex]);
  };

  const handleSwipeRight = () => {
    if (currentSection === 'hero') return;
    const prevIndex = (currentSectionIndex - 1 + sections.length) % sections.length;
    setCurrentSection(sections[prevIndex]);
  };

  const toggleSound = () => {
    const enabled = soundSystem.toggle();
    setSoundEnabled(enabled);
    if (enabled) {
      soundSystem.playSuccess();
    }
  };

  if (loading) {
    return <PremiumLoader onComplete={() => setLoading(false)} />;
  }

  return (
    <GestureHandler
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
    >
      <div className="w-full h-screen overflow-hidden bg-black">
        {/* Easter Eggs System */}
        <EasterEggSystem />

        {/* Sound Toggle Button */}
        {currentSection !== 'hero' && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={toggleSound}
            className="fixed top-4 right-4 z-50 w-12 h-12 holographic-border rounded-full flex items-center justify-center backdrop-blur-sm bg-slate-950/50 hover:bg-slate-900/70 transition-all group"
            title={soundEnabled ? 'Sound On' : 'Sound Off'}
          >
            <span className="text-2xl">
              {soundEnabled ? '🔊' : '🔇'}
            </span>
          </motion.button>
        )}


        {/* Navigation */}
        <AnimatePresence>
        {showNav && currentSection !== 'hero' && (
          <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 px-8 py-6"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Logo */}
              <motion.div
                className="text-2xl font-bold holographic-text cursor-pointer"
                onClick={() => setCurrentSection('hero')}
                whileHover={{ scale: 1.05 }}
              >
                SAGAR BUDHATHOKI
              </motion.div>

              {/* Nav Items */}
              <div className="flex items-center gap-6">
                {[
                  { id: 'avatar', label: 'AVATAR', key: '1' },
                  { id: 'about', label: 'JOURNEY', key: '2' },
                  { id: 'projects', label: 'PROJECTS', key: '3' },
                  { id: 'skills', label: 'SKILLS', key: '4' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentSection(item.id as Section)}
                    className={`relative px-4 py-2 font-mono text-sm transition-all ${
                      currentSection === item.id
                        ? 'text-cyan-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                    {currentSection === item.id && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                      />
                    )}
                    <span className="ml-2 text-xs text-purple-400">[{item.key}]</span>
                  </button>
                ))}
              </div>

              {/* Return to Home */}
              <a
                href="/"
                className="px-4 py-2 holographic-border rounded-lg font-mono text-sm text-purple-400 hover:bg-purple-950/30 transition-all"
              >
                EXIT 3D
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Section Indicator - NO ANIMATION, SHOWS IMMEDIATELY */}
      {currentSection !== 'hero' && (
        <div className="fixed left-8 top-1/2 transform -translate-y-1/2 z-40 space-y-4">
          {['avatar', 'about', 'projects', 'skills'].map((section, index) => (
            <button
              key={section}
              onClick={() => setCurrentSection(section as Section)}
              className="block group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSection === section
                      ? 'bg-cyan-400 scale-150'
                      : 'bg-gray-600 group-hover:bg-gray-400'
                  }`}
                ></div>
                <span
                  className={`font-mono text-xs transition-all ${
                    currentSection === section
                      ? 'text-cyan-400 translate-x-2'
                      : 'text-gray-600 group-hover:text-gray-400'
                  }`}
                >
                  {section.toUpperCase()}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Sections */}
      <AnimatePresence mode="wait">
        {currentSection === 'hero' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Hero3D onEnter={handleEnterExperience} />
          </motion.div>
        )}

        {currentSection === 'avatar' && (
          <motion.div
            key="avatar"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <HolographicAvatar />
          </motion.div>
        )}

        {currentSection === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 90 }}
            transition={{ duration: 0.5 }}
          >
            <About3D />
          </motion.div>
        )}

        {currentSection === 'projects' && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, z: -1000 }}
            animate={{ opacity: 1, z: 0 }}
            exit={{ opacity: 0, z: 1000 }}
            transition={{ duration: 0.5 }}
          >
            <Projects3D />
          </motion.div>
        )}

        {currentSection === 'skills' && (
          <motion.div
            key="skills"
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <Skills3D />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help - NO ANIMATION, SHOWS IMMEDIATELY */}
      {currentSection !== 'hero' && (
        <div className="fixed bottom-8 right-8 holographic-border rounded-lg p-4 backdrop-blur-sm bg-slate-950/50 z-40">
          <div className="text-xs font-mono text-purple-400 space-y-1">
            <div className="font-bold mb-2">KEYBOARD SHORTCUTS:</div>
            <div>← / A : Previous</div>
            <div>→ / D : Next</div>
            <div>1-4 : Jump to section</div>
          </div>
        </div>
      )}

        {/* Performance Note */}
        <div className="fixed bottom-8 left-8 text-xs font-mono text-gray-600 z-40">
          DevOps Brain 3.0 ULTRA | Powered by React Three Fiber
        </div>
      </div>
    </GestureHandler>
  );
}
