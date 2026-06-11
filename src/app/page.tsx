'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import HolographicHUD from '@/components/Experience3D/HolographicHUD';
import HoloCursor from '@/components/Experience3D/HoloCursor';
import CinematicIntro from '@/components/Experience3D/CinematicIntro';
import SceneWarp from '@/components/Experience3D/SceneWarp';
import Achievements, { type Achievement } from '@/components/Experience3D/Achievements';
import { usePerfTier, useReducedMotion } from '@/components/Experience3D/usePerfTier';

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

// Hash deep links: /#projects opens the Projects scene directly. The
// hero owns the bare URL; '#home' is accepted on read so a pasted link
// still resolves.
const HASH_TO_SECTION: Record<string, Section> = {
  '#home': 'hero',
  '#avatar': 'avatar',
  '#journey': 'journey',
  '#projects': 'projects',
  '#skills': 'skills',
};

function sectionFromHash(hash: string): Section | null {
  return HASH_TO_SECTION[hash] ?? null;
}

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

// Length of the longest buffer suffix that is a proper prefix of
// KONAMI. Non-zero means the visitor is partway through the sequence,
// so the arrow keys belong to the cheat code, not navigation.
function konamiPrefixLength(buffer: string[]): number {
  for (let len = Math.min(buffer.length, KONAMI.length - 1); len > 0; len--) {
    if (buffer.slice(-len).every((k, i) => k === KONAMI[i])) return len;
  }
  return 0;
}

export default function Experience3DPage() {
  const tier = usePerfTier();
  const isLow = tier === 'low';
  const reducedMotion = useReducedMotion();
  const [section, setSection] = useState<Section>('hero');
  // Once a section is visited it stays mounted on desktop, so switching
  // back is instant. On mobile this strategy explodes (5 WebGL contexts
  // active at once on phone GPUs), so phones get mount-on-demand:
  // mountedSections always equals { section } and the previous scene
  // unmounts when you navigate away.
  const [visited, setVisited] = useState<Set<Section>>(new Set(['hero']));
  // 'explored' only grows from user-initiated navigation (keyboard,
  // nav, CTA, deep link, back/forward). 'visited' also gets fed by the
  // pre-mount warmup timers below, so achievements key off explored,
  // otherwise every badge would unlock on a timer a few seconds after
  // load without the visitor touching anything.
  const [explored, setExplored] = useState<Set<Section>>(new Set(['hero']));
  const mountedSections = useMemo(
    () => (isLow ? new Set<Section>([section]) : visited),
    [isLow, section, visited],
  );
  // Low-tier scene handoff cover. Phones unmount the outgoing Canvas
  // instantly, so without this the screen snaps straight to the loading
  // spinner. The cover drops in fully opaque the moment the section
  // changes, holds while the incoming scene initializes, then fades out.
  const [handoffCover, setHandoffCover] = useState(false);
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
        when: explored.size >= 2,
        a: { id: 'first-contact', title: 'First Contact', detail: 'You stepped out of the Hero.' },
      },
      {
        when: explored.size >= 4,
        a: { id: 'operator', title: 'Operator', detail: 'Three scenes deep. Carry on.' },
      },
      {
        when: explored.size === 5,
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
  }, [explored, unlocked]);

  const markExplored = useCallback((id: Section) => {
    setExplored((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Single entry point for user-initiated section changes (nav buttons,
  // dots, keyboard, the Hero CTA). Pushes a hash history entry so the
  // browser's back / forward buttons walk between scenes. pushState
  // (unlike assigning location.hash) never scrolls the page. popstate
  // and the warmup timers bypass this on purpose.
  const navigate = useCallback(
    (id: Section) => {
      markExplored(id);
      if (id === section) return;
      setSection(id);
      window.history.pushState(
        null,
        '',
        id === 'hero' ? window.location.pathname + window.location.search : `#${id}`,
      );
    },
    [section, markExplored],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Deep-link arrivals skip the intro entirely: someone following a
    // #projects link wants the scene, not the boot screen.
    if (sectionFromHash(window.location.hash)) return;
    try {
      if (!sessionStorage.getItem('sb_intro_shown')) {
        setShowIntro(true);
      }
    } catch {
      // Some browsers / privacy modes block sessionStorage.
      setShowIntro(true);
    }
  }, []);

  // Deep links: open the section named in the hash straight away.
  useEffect(() => {
    const id = sectionFromHash(window.location.hash);
    if (id && id !== 'hero') {
      setSection(id);
      markExplored(id);
    }
  }, [markExplored]);

  // Back / forward buttons restore the section the hash points at.
  // setSection directly rather than navigate(), so we never push a new
  // entry on top of the one the browser just restored (feedback loop).
  useEffect(() => {
    const onPop = () => {
      const id = sectionFromHash(window.location.hash) ?? 'hero';
      setSection(id);
      markExplored(id);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [markExplored]);

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
  // the JS chunks are in the browser cache before they're needed. The
  // Avatar's photo texture is warmed the same way (plain Image, not
  // drei preload, so three.js stays out of the initial bundle): the
  // network fetch happens now and the scene only pays for GPU decode
  // when it mounts.
  useEffect(() => {
    void import('@/components/Experience3D/Avatar');
    void import('@/components/Experience3D/Journey');
    void import('@/components/Experience3D/DataCenter');
    void import('@/components/Experience3D/SkillsHall');
    const photo = new Image();
    photo.src = '/sagar-mountains.jpg';
  }, []);

  // After the Hero has settled, silently pre-mount the other scenes with
  // their render loops paused. WebGL contexts, shaders, geometries and
  // the photo texture are already on the GPU. First click on any tab is
  // therefore instant, no Canvas init or shader compile. Staggered so
  // four Canvases don't initialize on the same frame (which would cause
  // a single noticeable spike on the Hero scene).
  //
  // Skipped on mobile. Five concurrent WebGL contexts will OOM a phone
  // GPU; better to pay a brief remount cost on each tab switch.
  useEffect(() => {
    if (isLow) return;
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
  }, [isLow]);

  // Drop the handoff cover on every low-tier section change, hold it
  // while the incoming Canvas initializes, then let it fade (the fade
  // itself is the exit transition on the cover below, ~300ms, ~650ms
  // total). High tier keeps scenes mounted so it never needs this.
  // useLayoutEffect so the cover is painted in the same frame as the
  // scene swap; a passive effect can leak one uncovered frame when the
  // browser squeezes a paint in before the scheduled effect runs.
  const coverSkipFirst = useRef(true);
  useLayoutEffect(() => {
    if (coverSkipFirst.current) {
      coverSkipFirst.current = false;
      return;
    }
    if (!isLow) return;
    setHandoffCover(true);
    const t = setTimeout(() => setHandoffCover(false), 350);
    return () => clearTimeout(t);
  }, [section, isLow]);

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
        // The final 'a' belongs to the cheat code. Consume it here so
        // it doesn't also trigger 'a = previous section'.
        return;
      }
      // Mid-sequence the arrows are konami input, not navigation.
      const midKonami = konamiPrefixLength(konamiBuffer.current) > 0;

      if (e.key === 'Escape') {
        navigate('hero');
        return;
      }
      // Number shortcuts.
      const match = SECTIONS.find((s) => s.key === e.key);
      if (match) {
        navigate(match.id);
        return;
      }
      // a/d cycling. Plain a/d always navigate; the arrow keys only do
      // when the visitor isn't partway through the konami sequence.
      const ids = SECTIONS.map((s) => s.id);
      const idx = ids.indexOf(section);
      if (e.key === 'a' || (e.key === 'ArrowLeft' && !midKonami)) {
        navigate(ids[(idx - 1 + ids.length) % ids.length]);
      } else if (e.key === 'd' || (e.key === 'ArrowRight' && !midKonami)) {
        navigate(ids[(idx + 1) % ids.length]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [section, navigate]);

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
            className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-slate-950/90 to-transparent sm:from-slate-950/80 sm:backdrop-blur-sm pointer-events-none"
          >
            {/* Brand hidden on mobile so the nav has room. The home dot
                on the left edge replaces it. */}
            <button
              onClick={() => navigate('hero')}
              className="hidden sm:inline-block font-mono text-sm tracking-[0.3em] text-cyan-300/90 hover:text-white transition-colors pointer-events-auto"
            >
              SAGAR BUDHATHOKI
            </button>
            <button
              onClick={() => navigate('hero')}
              className="sm:hidden font-mono text-base tracking-widest text-cyan-300 hover:text-white transition-colors pointer-events-auto"
              aria-label="Home"
            >
              SB
            </button>
            <nav className="flex items-center gap-0 sm:gap-1 pointer-events-auto">
              {SECTIONS.filter((s) => s.id !== 'hero').map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(s.id)}
                  className={`relative px-2 sm:px-4 py-2 font-mono text-[10px] sm:text-xs tracking-widest transition-colors ${
                    section === s.id ? 'text-cyan-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                  <span className="hidden sm:inline ml-2 text-[10px] text-purple-300/70">[{s.key}]</span>
                  {section === s.id ? (
                    <motion.div
                      layoutId="navActive"
                      className="absolute -bottom-0.5 left-1 right-1 sm:left-2 sm:right-2 h-px bg-cyan-300"
                    />
                  ) : null}
                </button>
              ))}
            </nav>
            <a
              href="/terminal"
              className="hidden sm:inline-block font-mono text-xs tracking-widest text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 px-4 py-2 rounded transition-colors pointer-events-auto"
            >
              TERMINAL
            </a>
            {/* Compact terminal link for phones, where the full label
                doesn't fit next to the nav. */}
            <a
              href="/terminal"
              aria-label="Terminal view"
              className="sm:hidden font-mono text-xs tracking-widest text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 px-2.5 py-2 rounded transition-colors pointer-events-auto"
            >
              {'>_'}
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
            className="hidden sm:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 flex-col gap-3"
          >
            {SECTIONS.filter((s) => s.id !== 'hero').map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(s.id)}
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

      {/* Keyboard shortcuts hint (bottom-left). Hidden on touch
          devices, those users can't type a/d anyway. */}
      {section !== 'hero' ? (
        <div className="hidden sm:block fixed bottom-6 left-6 z-30 font-mono text-[10px] text-slate-500/70 leading-relaxed pointer-events-none">
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
        if (!mountedSections.has(id)) return null;
        const isActive = section === id;
        return (
          <motion.div
            key={id}
            initial={false}
            // Reduced motion gets an opacity-only crossfade; the subtle
            // scale settle is exactly the kind of movement being opted
            // out of.
            animate={
              reducedMotion
                ? { opacity: isActive ? 1 : 0 }
                : { opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.985 }
            }
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
              {id === 'hero' && <Hero active={isActive} onEnter={() => navigate('avatar')} />}
              {id === 'avatar' && <Avatar active={isActive} />}
              {id === 'journey' && <Journey active={isActive} />}
              {id === 'projects' && <DataCenter active={isActive} />}
              {id === 'skills' && <SkillsHall active={isActive} />}
            </Suspense>
          </motion.div>
        );
      })}

      {/* Persistent holographic HUD overlay (hidden on Hero so the title
          can breathe). Also hidden on phones, where the corner widgets
          collide with the navigation and cost paints we can't afford. */}
      <HolographicHUD hidden={section === 'hero' || isLow} section={section} />

      {/* Holographic cursor (hidden on touch devices automatically) */}
      <HoloCursor />

      {/* Low-tier handoff cover: hides the unmount/remount snap between
          scenes on phones. Sits above the scenes and their fallback
          spinner, below the header and the intro. */}
      <AnimatePresence>
        {handoffCover ? (
          <motion.div
            key="handoff"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[35] bg-slate-950 pointer-events-none"
          />
        ) : null}
      </AnimatePresence>

      {/* Brief CRT warp + scan line every time the section changes. Only
          mounted after the intro has dismissed so the warp doesn't fire
          underneath the boot overlay where it can't be seen. Skipped
          entirely for reduced-motion visitors. */}
      {!showIntro && !reducedMotion ? <SceneWarp trigger={section} /> : null}

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
