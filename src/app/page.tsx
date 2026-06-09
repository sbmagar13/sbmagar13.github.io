'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import HolographicHUD from '@/components/Experience3D/HolographicHUD';
import HoloCursor from '@/components/Experience3D/HoloCursor';
import CinematicIntro from '@/components/Experience3D/CinematicIntro';
import SceneWarp from '@/components/Experience3D/SceneWarp';
import Achievements, { type Achievement } from '@/components/Experience3D/Achievements';

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

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export default function Experience3DPage() {
  const [section, setSection] = useState<Section>('hero');
  // Once a section is visited it stays mounted. Switching back is now
  // instant because the WebGL context, shaders and textures are still in
  // memory. First visit pays the mount cost; subsequent visits are free.
  const [visited, setVisited] = useState<Set<Section>>(new Set(['hero']));
  // Intro shows once per browser session.
  const [showIntro, setShowIntro] = useState(false);
  // Konami code easter egg.
  const [konami, setKonami] = useState(false);
  const konamiBuffer = useRef<string[]>([]);
  // Lightweight achievement tracker. A badge unlocks when its condition
  // first becomes true; the toast in <Achievements /> shows for a few
  // seconds and the id stays in the unlocked set so we don't fire it
  // again on later renders.
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [currentUnlock, setCurrentUnlock] = useState<Achievement | null>(null);

  useEffect(() => {
    const candidates: Array<{ when: boolean; a: Achievement }> = [
      {
        when: visited.size >= 2,
        a: { id: 'first-contact', title: 'First Contact', detail: 'You stepped out of the Hero.' },
      },
      {
        when: visited.size >= 4,
        a: { id: 'operator', title: 'Operator', detail: 'Three scenes deep. Carry on.' },
      },
      {
        when: visited.size === 5,
        a: { id: 'explorer', title: 'Explorer', detail: 'You saw every scene.' },
      },
    ];
    for (const c of candidates) {
      if (c.when && !unlocked.has(c.a.id)) {
        setUnlocked((prev) => new Set([...prev, c.a.id]));
        setCurrentUnlock(c.a);
        return;
      }
    }
  }, [visited, unlocked]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (!sessionStorage.getItem('sb_intro_shown')) {
        setShowIntro(true);
      }
    } catch {
      // Some browsers / privacy modes block sessionStorage.
      setShowIntro(true);
    }
  }, []);

  const dismissIntro = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('sb_intro_shown', '1');
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    setVisited((prev) => {
      if (prev.has(section)) return prev;
      const next = new Set(prev);
      next.add(section);
      return next;
    });
  }, [section]);

  // Kick off background module loading for every scene immediately so
  // the JS chunks are in the browser cache before they're needed.
  useEffect(() => {
    void import('@/components/Experience3D/Avatar');
    void import('@/components/Experience3D/Journey');
    void import('@/components/Experience3D/DataCenter');
    void import('@/components/Experience3D/SkillsHall');
  }, []);

  // After the Hero has settled, silently pre-mount the other scenes with
  // their render loops paused. WebGL contexts, shaders, geometries and
  // the photo texture are already on the GPU. First click on any tab is
  // therefore instant, no Canvas init or shader compile. Staggered so
  // four Canvases don't initialize on the same frame (which would cause
  // a single noticeable spike on the Hero scene).
  useEffect(() => {
    const order: Section[] = ['avatar', 'projects', 'journey', 'skills'];
    const timers: ReturnType<typeof setTimeout>[] = [];
    order.forEach((id, i) => {
      timers.push(
        setTimeout(() => {
          setVisited((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
          });
        }, 1400 + i * 450),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Track the last 10 keys for the Konami sequence. We check before
      // consuming the event so the regular shortcuts still work.
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      konamiBuffer.current = [...konamiBuffer.current, key].slice(-KONAMI.length);
      if (
        konamiBuffer.current.length === KONAMI.length &&
        konamiBuffer.current.every((k, i) => k === KONAMI[i])
      ) {
        konamiBuffer.current = [];
        setKonami(true);
        setTimeout(() => setKonami(false), 6000);
      }

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
              href="/terminal"
              className="font-mono text-xs tracking-widest text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 px-4 py-2 rounded transition-colors pointer-events-auto"
            >
              TERMINAL
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

      {/* Scenes are kept mounted once visited. Switching tabs no longer
          tears down a Canvas and rebuilds it, which is what caused the
          1, 2-second stutter when returning to Avatar. The frameloop on
          inactive scenes is paused (frameloop="never") via the `active`
          prop, so GPU/CPU isn't spent rendering scenes you can't see. */}
      {(['hero', 'avatar', 'journey', 'projects', 'skills'] as const).map((id) => {
        if (!visited.has(id)) return null;
        const isActive = section === id;
        return (
          <motion.div
            key={id}
            initial={false}
            animate={{
              opacity: isActive ? 1 : 0,
              scale: isActive ? 1 : 0.985,
            }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: isActive ? 'auto' : 'none',
              // visibility flip avoids the browser ever painting the
              // hidden Canvas, but keeps its WebGL context alive.
              visibility: isActive ? 'visible' : 'hidden',
            }}
          >
            <Suspense fallback={<SceneFallback />}>
              {id === 'hero' && <Hero active={isActive} onEnter={() => setSection('avatar')} />}
              {id === 'avatar' && <Avatar active={isActive} />}
              {id === 'journey' && <Journey active={isActive} />}
              {id === 'projects' && <DataCenter active={isActive} />}
              {id === 'skills' && <SkillsHall active={isActive} />}
            </Suspense>
          </motion.div>
        );
      })}

      {/* Persistent holographic HUD overlay (hidden on Hero so the title
          can breathe). Sits above the scene but below the header. */}
      <HolographicHUD hidden={section === 'hero'} section={section} />

      {/* Holographic cursor (hidden on touch devices automatically) */}
      <HoloCursor />

      {/* Brief CRT warp + scan line every time the section changes. Only
          mounted after the intro has dismissed so the warp doesn't fire
          underneath the boot overlay where it can't be seen. */}
      {!showIntro ? <SceneWarp trigger={section} /> : null}

      {/* Achievement toasts (Explorer, Operator, etc.) */}
      <Achievements unlock={currentUnlock} />

      {/* Cinematic boot intro, plays once per session. */}
      {showIntro ? <CinematicIntro onDone={dismissIntro} /> : null}

      {/* Konami easter egg toast. For the engineers who try. */}
      <AnimatePresence>
        {konami ? (
          <motion.div
            key="konami"
            initial={{ y: 80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] font-mono pointer-events-none"
          >
            <div className="relative rounded-md border border-emerald-400/50 bg-slate-950/95 backdrop-blur-md px-6 py-4 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
              <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-300" />
              <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-300" />
              <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-300" />
              <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-300" />
              <div className="text-[11px] tracking-[0.4em] uppercase text-emerald-300/80">
                achievement unlocked
              </div>
              <div className="mt-1 text-base text-white tracking-wider">
                ahem, fellow hacker
                <span className="ml-2">👋</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 tracking-wider">
                konami sequence detected. nice.
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* While konami is active, a subtle full-screen scan line sweeps top
          to bottom and the scene picks up an emerald hue. */}
      {konami ? (
        <div className="pointer-events-none fixed inset-0 z-[65] mix-blend-screen">
          <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
          <div
            className="absolute left-0 right-0 h-16"
            style={{
              background:
                'linear-gradient(to bottom, transparent, rgba(16,185,129,0.6), transparent)',
              animation: 'konamiScan 1.6s linear',
            }}
          />
          <style jsx>{`
            @keyframes konamiScan {
              from {
                top: -10%;
              }
              to {
                top: 110%;
              }
            }
          `}</style>
        </div>
      ) : null}
    </div>
  );
}
