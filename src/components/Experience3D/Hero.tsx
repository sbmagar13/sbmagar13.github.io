'use client';

import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaTerminal } from 'react-icons/fa';
import * as THREE from 'three';
import { VolumetricBeam, NeonStrip } from './Atmosphere';
import ContextGuard from './ContextGuard';
import CinematicEffects from './Effects';
import LensFlare from './LensFlare';
import ParticleStorm from './ParticleStorm';
import SkillLogo from './SkillLogo';
import LabelPlate from './LabelPlate';
import { usePerfTier, type PerfTier } from './usePerfTier';
import { PALETTE } from './Materials';
import { STORIES, ORBIT_TOOLS, CHIP_LABELS, STAT_CARDS, type ToolId } from '@/data/career';
import { askSite, SAMPLE_QUESTIONS, type AskResult } from '@/lib/ask';
import { getLiveData, relativeTime } from '@/lib/liveData';
import { unlockDiscovery } from '@/lib/discoveries';

// The "ask" overlay reads its sample list once. The placeholder rotates
// through these; the "try:" row shows the first few as tappable chips.
const ASK_SUGGESTIONS = SAMPLE_QUESTIONS.slice(0, 3);

// Live signal, read once at module load from the bundled static JSON. The
// build commits a seed for this so it never depends on the network.
const LIVE = getLiveData();

// Four cards, not five: 'Top Lang / Python' is dropped here because
// Python already shows up everywhere else on the site.
const HERO_STATS = STAT_CARDS.filter((s) => s.label !== 'Top Lang');

interface OrbitProps {
  radius?: number;
  onPick: (id: ToolId) => void;
  picked: ToolId | null;
}

function ToolOrbit({ radius = 4.8, onPick, picked }: OrbitProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<ToolId | null>(null);
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.06;
  });
  return (
    <group ref={groupRef}>
      {ORBIT_TOOLS.map((id, i) => {
        const count = ORBIT_TOOLS.length;
        const angle = (i / count) * Math.PI * 2;
        const y = Math.sin(angle * 2) * 0.9 + 0.3;
        const isHovered = hovered === id;
        const isPicked = picked === id;
        return (
          <Float key={id} speed={0.6 + (i % 3) * 0.15} floatIntensity={0.32} rotationIntensity={0.16}>
            <group
              position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
              scale={isPicked ? 1.0 : isHovered ? 0.92 : 0.78}
              onClick={(e) => {
                e.stopPropagation();
                onPick(id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(id);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHovered((cur) => (cur === id ? null : cur));
                document.body.style.cursor = '';
              }}
            >
              <SkillLogo id={id} />
              {/* Always-visible label so the orbit reads as stack, not
                  decoration. Brightens on hover/pick. */}
              <LabelPlate
                position={[0, -0.55, 0]}
                text={STORIES[id].tool.split(' ')[0]}
                size={0.11}
                color={isHovered || isPicked ? '#f1f5f9' : '#cbd5e1'}
                letterSpacing={0.04}
                billboard
                plate
                plateOpacity={0.78}
                padding={[0.07, 0.035]}
                border={isHovered || isPicked}
                borderColor={PALETTE.neonCyan}
              />
            </group>
          </Float>
        );
      })}
    </group>
  );
}

function CenterOrb() {
  return (
    <Float speed={0.7} floatIntensity={0.22} rotationIntensity={0.14}>
      <mesh position={[0, 0.4, -1.5]}>
        <sphereGeometry args={[1.25, 64, 64]} />
        <MeshDistortMaterial
          color={PALETTE.neonPurple}
          emissive={PALETTE.neonMagenta}
          emissiveIntensity={0.28}
          metalness={0.88}
          roughness={0.14}
          distort={0.24}
          speed={0.9}
        />
      </mesh>
    </Float>
  );
}

interface SceneProps {
  onPick: (id: ToolId) => void;
  picked: ToolId | null;
  tier: PerfTier;
}

function Scene({ onPick, picked, tier }: SceneProps) {
  const isLow = tier === 'low';
  return (
    <>
      <ambientLight intensity={0.18} color="#1e293b" />
      <pointLight position={[6, 5, 6]} intensity={1.3} color={PALETTE.neonCyan} distance={20} />
      <pointLight position={[-6, -2, -4]} intensity={1.0} color={PALETTE.neonMagenta} distance={18} />
      {/* Third light is decorative; mobile skips it. */}
      {!isLow ? (
        <pointLight position={[0, 8, 0]} intensity={0.6} color={PALETTE.ledWhite} distance={14} />
      ) : null}

      <CenterOrb />
      <ToolOrbit radius={isLow ? 3.8 : 4.8} onPick={onPick} picked={picked} />

      {/* Heavy decorative passes only fire on the high tier. Mobile keeps
          the orb + orbit + sparse particles and skips the rest. */}
      {!isLow ? (
        <>
          <ContactShadows position={[0, -2.0, 0]} opacity={0.4} blur={2.5} far={8} color="#000000" />
          <NeonStrip start={[-6, -1.95, 0]} end={[6, -1.95, 0]} color={PALETTE.neonCyan} thickness={0.022} />
          <VolumetricBeam position={[0, 3, 0]} height={5} bottomRadius={2.2} opacity={0.04} />
          <LensFlare position={[0, 0.4, -1.4]} color={PALETTE.neonMagenta} size={1.6} intensity={0.3} />
        </>
      ) : null}

      <ParticleStorm
        count={isLow ? 250 : 900}
        bounds={[14, 7, 14]}
        color={PALETTE.neonCyan}
        size={isLow ? 4 : 6}
        speed={0.14}
        behavior="drift"
        opacity={0.18}
      />

      <OrbitControls
        target={[0, 0.2, 0]}
        enablePan={false}
        enableZoom={false}
        autoRotate={!isLow}
        autoRotateSpeed={0.1}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.9}
        dampingFactor={0.09}
      />
    </>
  );
}

// Ask-the-site input + collapsible answer card. Self-contained: holds its own
// query/answer state so the Hero shell stays lean. The placeholder rotates
// through SAMPLE_QUESTIONS while the field is empty and unfocused.
function AskPrompt({ isLow }: { isLow: boolean }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AskResult | null>(null);
  const [focused, setFocused] = useState(false);
  // Index into SAMPLE_QUESTIONS for the rotating placeholder.
  const [hint, setHint] = useState(0);

  // Rotate the placeholder only while the field is empty and idle, so the
  // hint never shifts under someone mid-type. Slow enough to read.
  useEffect(() => {
    if (query || focused) return;
    const t = setInterval(() => {
      setHint((i) => (i + 1) % SAMPLE_QUESTIONS.length);
    }, 3200);
    return () => clearInterval(t);
  }, [query, focused]);

  // Clearing the input hides the answer (per the contract).
  useEffect(() => {
    if (!query.trim()) setResult(null);
  }, [query]);

  function runAsk(raw: string) {
    const q = raw.trim();
    if (!q) return;
    setResult(askSite(q));
    // Record the discovery on the first ask. No 3D-route toast fires for
    // this one (page.tsx cannot observe Hero's localStorage write); it
    // surfaces in the terminal 'achievements' list. Idempotent.
    unlockDiscovery('ask');
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    runAsk(query);
  }

  function ask(q: string) {
    setQuery(q);
    runAsk(q);
  }

  const placeholder = query || focused ? '> ask me anything' : `> ${SAMPLE_QUESTIONS[hint]}`;

  return (
    <motion.div
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.38, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mt-6 sm:mt-8 w-full max-w-lg pointer-events-auto"
    >
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 rounded-md border border-cyan-500/30 bg-slate-950/85 sm:bg-slate-950/65 sm:backdrop-blur-sm px-3 py-2 font-mono focus-within:border-cyan-400/70 transition-colors"
      >
        <span className="text-cyan-400/80 text-sm select-none" aria-hidden="true">
          &gt;
        </span>
        <label htmlFor="ask-input" className="sr-only">
          Ask this site anything about Sagar
        </label>
        <input
          id="ask-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 min-w-0 bg-transparent text-[12px] sm:text-[13px] text-slate-100 placeholder:text-slate-500 outline-none"
        />
        <button
          type="submit"
          aria-label="Ask"
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/70 hover:text-cyan-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          &rarr;
        </button>
      </form>

      {/* Tappable sample questions: fill + submit in one tap. */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500">
        <span className="select-none">try:</span>
        {ASK_SUGGESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => ask(q)}
            className="rounded-full border border-cyan-500/25 px-2 py-0.5 text-cyan-300/80 hover:border-cyan-400/60 hover:text-cyan-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Collapsible answer card, in the war-story panel's visual language. */}
      <AnimatePresence>
        {result ? (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`mt-3 rounded-lg border border-cyan-500/40 bg-slate-950 ${
              isLow ? '' : 'sm:bg-slate-950/95 sm:backdrop-blur-xl'
            } p-4 text-left shadow-2xl shadow-cyan-500/15`}
            aria-live="polite"
          >
            <p className="font-mono text-[12px] sm:text-[13px] text-slate-200 leading-relaxed whitespace-pre-line">
              {result.answer}
            </p>
            {result.sources.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {result.sources.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target={s.href.startsWith('/') ? undefined : '_blank'}
                    rel={s.href.startsWith('/') ? undefined : 'noopener noreferrer'}
                    className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] text-cyan-300 hover:border-cyan-400/70 hover:text-cyan-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Hero({ onEnter, active = true }: { onEnter?: () => void; active?: boolean }) {
  const [picked, setPicked] = useState<ToolId | null>(null);
  // Bumped when the WebGL context is lost for good (iOS Safari evicting
  // the GPU context); keying the Canvas on it rebuilds the scene instead
  // of leaving a permanently black rectangle. See ContextGuard.
  const [glGen, setGlGen] = useState(0);
  const tier = usePerfTier();
  const isLow = tier === 'low';
  const story = picked ? STORIES[picked] : null;

  // Escape closes an open story panel. Registered on the capture
  // phase so stopPropagation keeps the page-level Escape-to-hero
  // handler from firing on the same keypress. Only listens while a
  // story is actually open AND the scene is visible; on desktop the
  // Hero stays mounted after navigation, and a hidden scene's
  // listener would swallow Escape presses meant for the page.
  useEffect(() => {
    if (!picked || !active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setPicked(null);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [picked, active]);

  // Leaving the scene closes any open story so it doesn't linger
  // invisibly (and reappear stale when the visitor returns).
  useEffect(() => {
    if (!active) setPicked(null);
  }, [active]);

  return (
    <div className="relative w-full h-full sm:h-screen bg-black overflow-y-auto sm:overflow-hidden">
      <Canvas
        key={glGen}
        camera={{ position: [0, 1.2, 8.5], fov: isLow ? 50 : 45 }}
        gl={{ antialias: !isLow, powerPreference: 'high-performance' }}
        dpr={isLow ? [1, 1] : [1, 1.75]}
        frameloop={active ? 'always' : 'never'}
        // Clicking empty space (not a tool) dismisses an open story.
        onPointerMissed={() => setPicked(null)}
        // On phones the Hero overlay is taller than the viewport (title +
        // stat cards + chips + CTAs) and the page needs to scroll to reach
        // the bottom CTAs. Pin the Canvas to the viewport with
        // position: fixed so the 3D background stays put while the
        // overlay scrolls over it.
        style={
          isLow
            ? { position: 'fixed', inset: 0, width: '100vw', height: '100vh' }
            : undefined
        }
      >
        <ContextGuard onLost={() => setGlGen((g) => g + 1)} />
        <color attach="background" args={[PALETTE.voidA]} />
        <fog attach="fog" args={['#020617', 7, 22]} />
        <Suspense fallback={null}>
          <Scene onPick={setPicked} picked={picked} tier={tier} />
          {/* Mobile skips post-processing entirely. SMAA + Bloom + the
              full composer is the single most expensive thing in the
              scene on phones. */}
          {!isLow ? (
            <CinematicEffects
              bloomIntensity={0.6}
              bloomThreshold={0.6}
              chromaticAberration={0.0001}
            />
          ) : null}
        </Suspense>
      </Canvas>

      {/* Foreground HTML overlay. On desktop it's absolutely positioned
          and centred over the locked viewport. On mobile it flows in
          normal layout so the outer wrapper can scroll it vertically
          when the stacked content (title + cards + chips + CTAs) exceeds
          the viewport height. */}
      <div className="relative sm:absolute sm:inset-0 z-10 flex flex-col items-center justify-center px-6 py-12 sm:py-0 min-h-screen sm:min-h-0 pointer-events-auto sm:pointer-events-none">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h1 className="font-mono text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[0.08em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
            SAGAR BUDHATHOKI
          </h1>
          <div className="mt-3 font-mono text-xs sm:text-base tracking-[0.3em] sm:tracking-[0.4em] text-cyan-300/90 uppercase">
            SENIOR DEVOPS / SRE ENGINEER
          </div>
          <div className="mt-2 font-mono text-[10px] sm:text-[11px] tracking-[0.24em] sm:tracking-[0.32em] text-slate-500 uppercase">
            ai agents for ops · open to remote senior roles
          </div>
        </motion.div>

        {/* Ask the site anything. The flagship interaction: sits directly
            under the title and above the stat cards. Replaces the old
            "click a tool for its story" helper line. */}
        <AskPrompt isLow={isLow} />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 sm:mt-12 flex flex-wrap gap-3 justify-center max-w-3xl"
        >
          {HERO_STATS.map((s) => (
            <div
              key={s.label}
              className="rounded border border-cyan-500/30 bg-slate-950/85 sm:bg-slate-950/65 sm:backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 font-mono min-w-[124px] sm:min-w-[150px]"
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">{s.label}</div>
              <div className={`text-sm sm:text-lg ${s.color}`}>{s.value}</div>
              {s.sub ? (
                <div className="text-[10px] text-slate-500 mt-0.5 tracking-wide">{s.sub}</div>
              ) : null}
            </div>
          ))}
        </motion.div>

        {/* Mobile-only chip row. On phones the overlay captures every
            touch for scrolling, so the 3D orbit logos can't be tapped;
            these chips open the same war-story panel the orbit does. */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="sm:hidden mt-6 flex flex-wrap gap-2 justify-center max-w-3xl pointer-events-auto"
        >
          {ORBIT_TOOLS.map((id) => {
            const isOpen = picked === id;
            return (
              <button
                key={id}
                onClick={() => setPicked((prev) => (prev === id ? null : id))}
                aria-pressed={isOpen}
                className={`px-3 py-2 min-h-[40px] rounded-full font-mono text-[11px] tracking-wide border sm:backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                  isOpen
                    ? 'border-cyan-300 bg-cyan-500/30 sm:bg-cyan-500/20 text-cyan-200'
                    : 'border-cyan-500/30 bg-slate-950/85 sm:bg-slate-950/65 text-slate-300 active:bg-cyan-500/10'
                }`}
              >
                {CHIP_LABELS[id]}
              </button>
            );
          })}
        </motion.div>

        {/* Two actions, four whispers: the primary pair stays full-size,
            everything else collapses into compact icon links below. */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 sm:mt-8 flex flex-col items-center gap-3 pointer-events-auto"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={onEnter}
              className="px-5 py-2.5 min-h-[40px] sm:px-7 sm:py-3 rounded-md font-mono text-xs sm:text-sm tracking-widest uppercase text-white bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 transition-colors shadow-lg shadow-cyan-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              See the work →
            </button>
            <a
              href="/resume.pdf"
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 min-h-[40px] sm:px-7 sm:py-3 rounded-md font-mono text-xs sm:text-sm tracking-widest uppercase text-emerald-300 border border-emerald-400/60 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors shadow-lg shadow-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Resume
            </a>
          </div>
          <div className="flex gap-2 justify-center">
            <a
              href="https://github.com/sbmagar13"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="flex items-center justify-center w-11 h-11 rounded-md border border-slate-600/70 bg-slate-950/90 text-slate-300 shadow-lg shadow-black/40 hover:border-cyan-400/60 hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <FaGithub className="text-lg" />
            </a>
            <a
              href="https://linkedin.com/in/sbmagar13"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="flex items-center justify-center w-11 h-11 rounded-md border border-slate-600/70 bg-slate-950/90 text-slate-300 shadow-lg shadow-black/40 hover:border-sky-400/60 hover:text-sky-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <FaLinkedin className="text-lg" />
            </a>
            <a
              href="mailto:sagar@sagarbudhathoki.com"
              aria-label="Email"
              title="Email"
              className="flex items-center justify-center w-11 h-11 rounded-md border border-slate-600/70 bg-slate-950/90 text-slate-300 shadow-lg shadow-black/40 hover:border-purple-400/60 hover:text-purple-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <FaEnvelope className="text-lg" />
            </a>
            <a
              href="/terminal"
              aria-label="Terminal view"
              title="Terminal view"
              className="flex items-center justify-center w-11 h-11 rounded-md border border-slate-600/70 bg-slate-950/90 text-slate-300 shadow-lg shadow-black/40 hover:border-slate-400/60 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <FaTerminal className="text-lg" />
            </a>
          </div>
        </motion.div>

        {/* Dim footer line: plain-text escape hatch for anyone who
            doesn't want the 3D experience. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-center"
        >
          <a
            href="/work"
            className="pointer-events-auto font-mono text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
          >
            prefer plain text? /work
          </a>
          {/* Live signal: one dim, honest line, only when real data exists.
              Reads the bundled github.json via getLiveData; no network. */}
          {LIVE.latestCommit && relativeTime(LIVE.latestCommit.date) ? (
            <div className="mt-2">
              <a
                href={LIVE.latestCommit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto font-mono text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                last shipped: {relativeTime(LIVE.latestCommit.date)} to {LIVE.latestCommit.repo}
              </a>
            </div>
          ) : null}
        </motion.div>
      </div>

      {/* War-story panel. Opens whenever a tool is clicked in the
          orbit. Anchored bottom-right so it doesn't fight the title. */}
      <AnimatePresence>
        {story ? (
          <motion.aside
            key={picked}
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-30 bg-slate-950 sm:bg-slate-950/95 sm:backdrop-blur-xl border border-cyan-500/40 rounded-lg p-4 sm:p-6 shadow-2xl shadow-cyan-500/15 pointer-events-auto bottom-4 inset-x-4 max-h-[45vh] overflow-y-auto sm:max-h-none sm:overflow-visible sm:inset-x-auto sm:bottom-8 sm:right-6 sm:w-[400px] sm:max-w-[44vw]"
            role="dialog"
            aria-label={`Story: ${story.title}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-cyan-300 bg-cyan-500/10 border border-cyan-400/40 rounded px-2 py-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                  {story.tool}
                </div>
                <div className="mt-3 font-mono text-lg font-semibold text-white tracking-wide leading-snug">
                  {story.title}
                </div>
                <div className="mt-1 font-mono text-[11px] text-slate-400 tracking-wider">
                  {story.when}
                </div>
              </div>
              <button
                onClick={() => setPicked(null)}
                className="text-slate-400 hover:text-white font-mono text-base leading-none w-8 h-8 flex items-center justify-center rounded border border-slate-700 hover:border-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label="Close story"
              >
                ×
              </button>
            </div>
            <p className="mt-4 text-[13px] sm:text-[14px] text-slate-200 leading-relaxed">{story.body}</p>
            <div className="mt-4 text-[10px] font-mono text-slate-500">
              <span className="sm:hidden">Tap another chip to switch stories, or × to close.</span>
              <span className="hidden sm:inline">Click another tool above to read its story.</span>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
