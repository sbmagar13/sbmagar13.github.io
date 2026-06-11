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
import { unlockDiscovery } from '@/lib/discoveries';

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

// Autopilot tour: a self-driving loop through every scene, ending back
// on the hero. Each hop goes through navigate(), so hash history, the
// explored set and the warp behave exactly like manual navigation.
// User-initiated only; any key or nav click cancels it.
const TOUR_ROUTE: Section[] = ['hero', 'avatar', 'journey', 'projects', 'skills'];
const TOUR_STEP_MS = 9000;
const TOUR_DONE_MS = 4000;

const TOUR_CAPTIONS: Record<Section, string> = {
  hero: 'Sagar Budhathoki. Senior DevOps / SRE Engineer, 5+ years in production.',
  avatar: 'The operator: sole owner of a multi-tenant SaaS platform on AWS.',
  journey: 'The road: internship to senior, milestone by milestone.',
  projects: 'The racks: cross-region DR, tenant orchestration, observability that survives outages.',
  skills: 'The toolbox: every tool here has real production hours behind it.',
};

const TOUR_DONE_CAPTION =
  'Tour complete. Explore freely, or press the terminal link for the shell version.';

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
  // nav, CTA, deep link, back/forward), as distinct from 'visited',
  // which the pre-mount warmup timers below also feed. Achievements no
  // longer key off it (those are genuine discoveries now), but the
  // distinction is kept so any future user-intent logic has it ready.
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
  // Autopilot tour. tourStep indexes TOUR_ROUTE; tourDone keeps the
  // goodbye caption up briefly after the loop completes. Timer ids live
  // in refs so cancellation never chases stale state.
  const [autopilot, setAutopilot] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourDone, setTourDone] = useState(false);
  const tourTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tourDoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Achievement toast feed. Genuine discoveries (the konami code, the
  // full autopilot loop) hand a freshly unlocked Discovery here; the
  // toast in <Achievements /> shows it for a few seconds. unlockDiscovery
  // persists to localStorage and returns null once a discovery is already
  // found, so the same toast never fires twice. Scene visits are just
  // navigation and no longer unlock anything.
  const [currentUnlock, setCurrentUnlock] = useState<Achievement | null>(null);

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

  const stopAutopilot = useCallback(() => {
    if (tourTimerRef.current !== null) {
      clearTimeout(tourTimerRef.current);
      tourTimerRef.current = null;
    }
    setAutopilot(false);
  }, []);

  const startAutopilot = useCallback(() => {
    if (tourDoneTimerRef.current !== null) {
      clearTimeout(tourDoneTimerRef.current);
      tourDoneTimerRef.current = null;
    }
    setTourDone(false);
    setTourStep(0);
    setAutopilot(true);
    navigate('hero');
  }, [navigate]);

  // Manual navigation cancels the tour BEFORE applying the click, so
  // the tour never fights the visitor. Every clickable nav (brand,
  // header tabs, dots, Hero CTA) goes through this wrapper; the
  // keyboard handler cancels at the top of onKey instead.
  const userNavigate = useCallback(
    (id: Section) => {
      stopAutopilot();
      navigate(id);
    },
    [stopAutopilot, navigate],
  );

  // While the tour runs, hop to the next scene every TOUR_STEP_MS. The
  // effect re-arms after each hop (tourStep and navigate both change),
  // so the timer always starts fresh per step; the cleanup covers both
  // cancellation and unmount.
  useEffect(() => {
    if (!autopilot) return;
    tourTimerRef.current = setTimeout(() => {
      tourTimerRef.current = null;
      const next = tourStep + 1;
      if (next < TOUR_ROUTE.length) {
        setTourStep(next);
        navigate(TOUR_ROUTE[next]);
        return;
      }
      // Full loop done: land back on the hero, end the tour, and leave
      // a short goodbye caption. Watching the whole loop is a genuine
      // discovery, so reward it (no-op if already unlocked).
      setAutopilot(false);
      navigate('hero');
      setTourDone(true);
      const unlock = unlockDiscovery('autopilot');
      if (unlock) setCurrentUnlock(unlock);
      tourDoneTimerRef.current = setTimeout(() => {
        tourDoneTimerRef.current = null;
        setTourDone(false);
      }, TOUR_DONE_MS);
    }, TOUR_STEP_MS);
    return () => {
      if (tourTimerRef.current !== null) {
        clearTimeout(tourTimerRef.current);
        tourTimerRef.current = null;
      }
    };
  }, [autopilot, tourStep, navigate]);

  // The goodbye caption timer outlives the effect above; make sure it
  // can't fire after unmount.
  useEffect(
    () => () => {
      if (tourDoneTimerRef.current !== null) clearTimeout(tourDoneTimerRef.current);
    },
    [],
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
      // Back / forward is manual navigation too: cancel the tour before
      // restoring the section the visitor asked for.
      stopAutopilot();
      const id = sectionFromHash(window.location.hash) ?? 'hero';
      setSection(id);
      markExplored(id);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [markExplored, stopAutopilot]);

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

      // Any keypress ends the autopilot tour: the visitor has taken
      // over, and the cancel lands before whatever the key does next.
      stopAutopilot();

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
        // Finding the cheat code is a genuine discovery; the toast fires
        // alongside the konami visual (no-op if already unlocked).
        const unlock = unlockDiscovery('konami');
        if (unlock) setCurrentUnlock(unlock);
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
  }, [section, navigate, stopAutopilot]);

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      {/* Static fallback for crawlers and JS-off visitors. Every scene
          is ssr:false, so without this the prerendered / route ships
          almost no text. Renders only when JS never runs. Facts mirror
          IDENTITY in src/data/career.ts. */}
      <noscript>
        <div className="min-h-screen overflow-y-auto bg-slate-950 px-6 py-16 font-mono text-slate-300">
          <h1 className="text-3xl font-semibold text-white">Sagar Budhathoki</h1>
          <p className="mt-2 text-sm text-cyan-300">Senior DevOps / SRE Engineer</p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed">
            DevOps / SRE engineer with 5+ years in production, based in Kathmandu, Nepal and
            open to remote senior roles. Currently building AI agents for ops.
          </p>
          <ul className="mt-8 space-y-2 text-sm">
            <li>
              <a className="text-cyan-300 underline underline-offset-4" href="/work">/work</a>
            </li>
            <li>
              <a className="text-cyan-300 underline underline-offset-4" href="/resume">/resume</a>
            </li>
            <li>
              <a className="text-cyan-300 underline underline-offset-4" href="/terminal">/terminal</a>
            </li>
            <li>
              <a className="text-cyan-300 underline underline-offset-4" href="https://github.com/sbmagar13">GitHub</a>
            </li>
            <li>
              <a className="text-cyan-300 underline underline-offset-4" href="https://linkedin.com/in/sbmagar13">LinkedIn</a>
            </li>
          </ul>
        </div>
      </noscript>

      {/* Persistent 3D / CLI mode switch (fixed top-right, every section
          including the Hero where the header is hidden). This is the
          primary way visitors find the terminal. A segmented control: 3D
          is the active page, CLI links to /terminal. The active pill
          slides between segments. z just under the intro (z-[80]) so the
          boot overlay still covers it; clear of the autopilot pill, which
          lives bottom-right. */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-[75] font-mono pointer-events-auto">
        <div className="relative flex items-center gap-0.5 rounded-full border border-cyan-500/30 bg-slate-950/70 p-0.5 sm:p-1 sm:backdrop-blur shadow-[0_0_20px_rgba(34,211,238,0.12)]">
          {/* Active page: 3D. A button (not a link) so it reads as the
              current selection; clicking it does nothing meaningful. */}
          <button
            type="button"
            aria-current="page"
            aria-label="3D view, current page"
            className="relative z-10 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs tracking-widest text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <motion.span
              layoutId="modeSwitchPill"
              className="absolute inset-0 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.5)]"
              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
            />
            <span className="relative">3D</span>
          </button>
          <a
            href="/terminal"
            aria-label="Switch to CLI terminal view"
            className="relative z-10 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs tracking-widest text-cyan-300/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            CLI
          </a>
        </div>
      </div>

      {/* Persistent header (hides on Hero) */}
      <AnimatePresence>
        {section !== 'hero' ? (
          <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-40 px-4 pr-28 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-b from-slate-950/90 to-transparent sm:from-slate-950/80 sm:backdrop-blur-sm pointer-events-none"
          >
            {/* Brand hidden on mobile so the nav has room. The home dot
                on the left edge replaces it. */}
            <button
              onClick={() => userNavigate('hero')}
              className="hidden sm:inline-block font-mono text-sm tracking-[0.3em] text-cyan-300/90 hover:text-white transition-colors pointer-events-auto"
            >
              SAGAR BUDHATHOKI
            </button>
            <button
              onClick={() => userNavigate('hero')}
              className="sm:hidden font-mono text-base tracking-widest text-cyan-300 hover:text-white transition-colors pointer-events-auto"
              aria-label="Home"
            >
              SB
            </button>
            <nav className="flex items-center gap-0 sm:gap-1 pointer-events-auto">
              {SECTIONS.filter((s) => s.id !== 'hero').map((s) => (
                <button
                  key={s.id}
                  onClick={() => userNavigate(s.id)}
                  className={`relative px-1.5 sm:px-4 py-2 font-mono text-[10px] sm:text-xs tracking-widest transition-colors ${
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
            {/* The terminal link used to live here. The persistent 3D/CLI
                mode switch (fixed top-right, visible on every section)
                now owns terminal discovery, so this header just spans the
                brand and the section nav. A spacer keeps the nav centered
                where the link used to balance it. */}
            <span aria-hidden className="hidden sm:block w-[1px]" />
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
                onClick={() => userNavigate(s.id)}
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

      {/* Autopilot tour pill (bottom-right). Hidden while the intro
          plays; never auto-starts. While the tour runs it becomes a
          stop button with a step counter. Sits above the HUD (z-30)
          and clear of the Hero's centered CTA row on phones. */}
      {!showIntro ? (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 font-mono">
          {autopilot ? (
            <button
              type="button"
              onClick={stopAutopilot}
              aria-label={`Stop autopilot tour, step ${tourStep + 1} of ${TOUR_ROUTE.length}`}
              className="flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-950/80 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs tracking-widest text-cyan-300 hover:text-white hover:border-cyan-400/70 hover:bg-cyan-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <span>STOP TOUR</span>
              <span className="text-cyan-500/80 tabular-nums">
                {tourStep + 1}/{TOUR_ROUTE.length}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startAutopilot}
              aria-label="Start autopilot tour"
              className="rounded-full border border-cyan-500/40 bg-slate-950/80 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs tracking-widest text-cyan-300 hover:text-white hover:border-cyan-400/70 hover:bg-cyan-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              {'>'} AUTOPILOT TOUR
            </button>
          )}
        </div>
      ) : null}

      {/* Autopilot caption (bottom-center): crossfades per scene while
          the tour drives, plus a short goodbye once the loop completes.
          Grid stacking keeps the outgoing and incoming cards overlapped
          for a true crossfade. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 sm:bottom-24 z-[60] grid place-items-center px-4 font-mono">
        <AnimatePresence>
          {autopilot || tourDone ? (
            <motion.div
              key={tourDone ? 'tour-done' : TOUR_ROUTE[tourStep]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="col-start-1 row-start-1 relative max-w-xl rounded-md border border-cyan-500/40 bg-slate-950/90 backdrop-blur-md px-5 py-3 text-center shadow-[0_0_30px_rgba(34,211,238,0.18)]"
            >
              <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-300" />
              <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-300" />
              <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-300" />
              <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-300" />
              <div className="text-[10px] tracking-[0.4em] uppercase text-cyan-400/80">
                {tourDone ? 'autopilot ended' : `autopilot · ${tourStep + 1}/${TOUR_ROUTE.length}`}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-slate-200 tracking-wide">
                {tourDone ? TOUR_DONE_CAPTION : TOUR_CAPTIONS[TOUR_ROUTE[tourStep]]}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

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
              {id === 'hero' && <Hero active={isActive} onEnter={() => userNavigate('avatar')} />}
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

      {/* Discovery toasts (konami code, full autopilot loop) */}
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
