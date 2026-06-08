'use client';

import { useEffect, useState, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import HolographicHUD from '@/components/Experience3D/HolographicHUD';

// Heavy 3D scenes, lazy-loaded so navigation between sections only
// pays for what it shows.
const Hero = dynamic(() => import('@/components/Experience3D/Hero'), { ssr: false });
const Avatar = dynamic(() => import('@/components/Experience3D/Avatar'), { ssr: false });
const Journey = dynamic(() => import('@/components/Experience3D/Journey'), { ssr: false });
const DataCenter = dynamic(() => import('@/components/Experience3D/DataCenter'), { ssr: false });
const SkillsHall = dynamic(() => import('@/components/Experience3D/SkillsHall'), { ssr: false });

type Section = 'hero' | 'avatar' | 'journey' | 'projects' | 'skills';

const SECTIONS: { id: Section; label: string; key: string }[] = [
  { id: 'hero', label: 'HOME', key: '`' },
  { id: 'avatar', label: 'AVATAR', key: '1' },
  { id: 'journey', label: 'JOURNEY', key: '2' },
  { id: 'projects', label: 'PROJECTS', key: '3' },
  { id: 'skills', label: 'SKILLS', key: '4' },
];

function SceneFallback() {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4 font-mono">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
        </div>
        <div className="text-xs tracking-widest uppercase text-cyan-300/80">
          Loading scene
        </div>
      </div>
    </div>
  );
}

export default function Experience3DPage() {
  const [section, setSection] = useState<Section>('hero');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape') {
        setSection('hero');
        return;
      }
      // Number shortcuts.
      const match = SECTIONS.find((s) => s.key === e.key);
      if (match) {
        setSection(match.id);
        return;
      }
      // a/d cycling.
      const ids = SECTIONS.map((s) => s.id);
      const idx = ids.indexOf(section);
      if (e.key === 'a' || e.key === 'ArrowLeft') {
        setSection(ids[(idx - 1 + ids.length) % ids.length]);
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        setSection(ids[(idx + 1) % ids.length]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [section]);

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      {/* Persistent header (hides on Hero) */}
      <AnimatePresence>
        {section !== 'hero' ? (
          <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-sm pointer-events-none"
          >
            <button
              onClick={() => setSection('hero')}
              className="font-mono text-sm tracking-[0.3em] text-cyan-300/90 hover:text-white transition-colors pointer-events-auto"
            >
              SAGAR BUDHATHOKI
            </button>
            <nav className="flex items-center gap-1 pointer-events-auto">
              {SECTIONS.filter((s) => s.id !== 'hero').map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`relative px-4 py-2 font-mono text-xs tracking-widest transition-colors ${
                    section === s.id ? 'text-cyan-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                  <span className="ml-2 text-[10px] text-purple-300/70">[{s.key}]</span>
                  {section === s.id ? (
                    <motion.div
                      layoutId="navActive"
                      className="absolute -bottom-0.5 left-2 right-2 h-px bg-cyan-300"
                    />
                  ) : null}
                </button>
              ))}
            </nav>
            <a
              href="/"
              className="font-mono text-xs tracking-widest text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 px-4 py-2 rounded transition-colors pointer-events-auto"
            >
              EXIT 3D
            </a>
          </motion.header>
        ) : null}
      </AnimatePresence>

      {/* Section indicator on the left edge */}
      <AnimatePresence>
        {section !== 'hero' ? (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3"
          >
            {SECTIONS.filter((s) => s.id !== 'hero').map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className="group flex items-center gap-3"
                aria-label={`Go to ${s.label}`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all ${
                    section === s.id
                      ? 'bg-cyan-300 scale-150 shadow-[0_0_10px_#22d3ee]'
                      : 'bg-slate-600 group-hover:bg-slate-300'
                  }`}
                />
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Keyboard shortcuts hint (bottom-left) */}
      {section !== 'hero' ? (
        <div className="fixed bottom-6 left-6 z-30 font-mono text-[10px] text-slate-500/70 leading-relaxed pointer-events-none">
          <div className="opacity-70 tracking-widest uppercase mb-1">Shortcuts</div>
          <div>← / a · prev</div>
          <div>→ / d · next</div>
          <div>1,4 · jump</div>
          <div>esc · home</div>
        </div>
      ) : null}

      {/* The active scene */}
      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <Suspense fallback={<SceneFallback />}>
            {section === 'hero' ? <Hero onEnter={() => setSection('avatar')} /> : null}
            {section === 'avatar' ? <Avatar /> : null}
            {section === 'journey' ? <Journey /> : null}
            {section === 'projects' ? <DataCenter /> : null}
            {section === 'skills' ? <SkillsHall /> : null}
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {/* Persistent holographic HUD overlay (hidden on Hero so the title
          can breathe). Sits above the scene but below the header. */}
      <HolographicHUD hidden={section === 'hero'} section={section} />
    </div>
  );
}
