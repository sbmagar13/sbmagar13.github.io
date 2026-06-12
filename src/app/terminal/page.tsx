'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import About from '@/components/About/About';
import Projects from '@/components/Projects/Projects';
import TechStack from '@/components/Tools/TechStack';
import BlogPostsWrapper from '../BlogPostsWrapper';
import { FaTerminal, FaUser, FaProjectDiagram, FaTools, FaBrain, FaCode, FaSun, FaMoon, FaBlog } from 'react-icons/fa';

// Import visual effects
import NeuralNetwork from '@/components/Effects/NeuralNetwork';
import ParticleField from '@/components/Effects/ParticleField';
import MatrixRain from '@/components/Effects/MatrixRain';
import PerformanceMonitor from '@/components/Effects/PerformanceMonitor';
import GlitchText from '@/components/Effects/GlitchText';
import CommandPalette from '@/components/CommandPalette/CommandPalette';

// Import the Terminal wrapper component
const TerminalWrapper = dynamic(() => import('@/components/Terminal/TerminalWrapper'), {
  ssr: false,
});

type Section = 'terminal' | 'about' | 'projects' | 'techstack' | 'blog';

// Theme type
type Theme = 'dark' | 'light' | 'system';

// Visual effect type
type VisualEffect = 'neural' | 'particles' | 'matrix' | 'none';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [bootMessages, setBootMessages] = useState<{ text: string; t: number }[]>([]);
  const TOTAL_BOOT_MESSAGES = 10;
  const [activeSection, setActiveSection] = useState<Section>('terminal');
  const [visitedSections, setVisitedSections] = useState<Record<Section, boolean>>({
    terminal: true,
    about: false,
    projects: false,
    techstack: false,
    blog: false
  });

  const [theme, setTheme] = useState<Theme>('dark');
  const [visualEffect, setVisualEffect] = useState<VisualEffect>('neural');
  // Set once the visitor picks an effect themselves, so the touch default
  // below never stomps an explicit choice.
  const effectChosenRef = useRef(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [uptime, setUptime] = useState({
    hours: 0,
    minutes: 0
  });
  
  // Mouse position for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax, throttled via rAF so mousemove doesn't repaint the blurred
  // background more than once per animation frame.
  const rafIdRef = useRef<number | null>(null);
  const pendingMouseRef = useRef<{ x: number; y: number } | null>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    pendingMouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (!pendingMouseRef.current) return;
      mouseX.set(pendingMouseRef.current.x);
      mouseY.set(pendingMouseRef.current.y);
    });
  }, [mouseX, mouseY]);

  useEffect(() => () => {
    if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
  }, []);

  // Smaller parallax range so the heavy blur has less area to repaint.
  const backgroundX = useTransform(mouseX, [0, 1], [-6, 6]);
  const backgroundY = useTransform(mouseY, [0, 1], [-6, 6]);
  
  // Particle animation refs
  const particlesRef = useRef<HTMLDivElement>(null);
  const particleCount = 80; // Increased particle count
  const backgroundRef = useRef<HTMLDivElement>(null);
  
  // Boot sequence, each line waits a randomized amount, so it feels
  // like a real process where some steps are fast and some are slow.
  // (Math.random in scheduler-only logic; output isn't displayed via React
  //  state derived from the random value, so it's safe with static export.)
  // Plays once per session (sb_term_boot, mirroring sb_intro_shown on the
  // 3D home), and any key or click skips it instantly.
  useEffect(() => {
    try {
      if (sessionStorage.getItem('sb_term_boot')) {
        setLoading(false);
        return;
      }
    } catch {
      // Some browsers / privacy modes block sessionStorage; just play the boot.
    }

    const messages = [
      'Booting sagarbudhathoki.com...',
      'Loading shell environment...',
      'Mounting /projects, /skills, /blog...',
      'Connecting to Kubernetes context...',
      'Pulling Terraform state...',
      'Starting Prometheus scrape...',
      'Tailing CI logs...',
      'Verifying TLS certificates...',
      'Warming caches...',
      'Ready. Type `help` to begin.',
    ];

    // Weights pick which lines feel slow vs snappy. Some real DevOps steps
    // (pulling state, scraping, TLS check) take longer; others print fast.
    const weights = [0.6, 0.5, 0.6, 1.3, 1.8, 0.9, 0.5, 1.6, 0.7, 0.8];

    const timers: ReturnType<typeof setTimeout>[] = [];
    let finished = false;

    const finishBoot = () => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      try {
        sessionStorage.setItem('sb_term_boot', '1');
      } catch {
        /* ignore */
      }
      setLoading(false);
    };

    let elapsed = 0;
    messages.forEach((msg, i) => {
      // 320-800ms base, scaled by the weight for this step. Total run is
      // ~5-7 seconds depending on the random draws, long enough to read
      // the lines, short enough to not feel like a wait.
      const jitter = 320 + Math.random() * 480;
      elapsed += jitter * weights[i];
      const scheduledAt = elapsed;
      timers.push(
        setTimeout(() => {
          setBootMessages(prev => [...prev, { text: msg, t: scheduledAt / 1000 }]);
          if (i === messages.length - 1) {
            timers.push(setTimeout(finishBoot, 1800));
          }
        }, scheduledAt)
      );
    });

    // Any key or click jumps straight to the shell.
    const skip = () => finishBoot();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []);
  
  // Create enhanced particle effect
  useEffect(() => {
    if (loading || !particlesRef.current) return;
    
    const container = particlesRef.current;
    const particles: HTMLDivElement[] = [];
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      
      // Vary particle types for more visual interest
      const particleType = Math.random();
      
      if (particleType > 0.9) {
        // Special particles (glowing dots)
        particle.className = 'absolute rounded-full bg-blue-400 opacity-40 pointer-events-none glow-particle';
      } else if (particleType > 0.7) {
        // Medium particles (green)
        particle.className = 'absolute rounded-full bg-green-500 opacity-30 pointer-events-none';
      } else {
        // Regular particles (subtle)
        particle.className = 'absolute rounded-full bg-green-500 opacity-20 pointer-events-none';
      }
      
      // Random size with more variation
      const size = Math.random() * 8 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      
      container.appendChild(particle);
      particles.push(particle);
      
      // Animate particle
      animateParticle(particle, particleType > 0.8);
    }
    
    function animateParticle(particle: HTMLDivElement, isSpecial: boolean) {
      // Special particles move slower and have different animation
      const duration = isSpecial 
        ? Math.random() * 25000 + 20000 // 20-45 seconds for special particles
        : Math.random() * 15000 + 10000; // 10-25 seconds for regular particles
        
      const targetX = Math.random() * 100;
      const targetY = Math.random() * 100;
      
      // Add slight rotation for some particles
      const rotation = isSpecial ? Math.random() * 360 : 0;
      
      const animation = particle.animate([
        { transform: 'translate(0, 0) rotate(0deg)' },
        { transform: `translate(${targetX - parseFloat(particle.style.left)}%, ${targetY - parseFloat(particle.style.top)}%) rotate(${rotation}deg)` }
      ], {
        duration,
        easing: 'ease-in-out',
        fill: 'forwards'
      });
      
      animation.onfinish = () => {
        // Update position
        particle.style.left = `${targetX}%`;
        particle.style.top = `${targetY}%`;
        
        // Animate again
        animateParticle(particle, isSpecial);
      };
    }
    
    return () => {
      // Clean up particles
      particles.forEach(p => p.remove());
    };
  }, [loading]);
  
  // Handle terminal commands that switch sections
  const handleTerminalCommand = (command: string) => {
    switch (command) {
      case 'about':
        setActiveSection('about');
        updateVisitedSections('about');
        break;
      case 'projects':
        setActiveSection('projects');
        updateVisitedSections('projects');
        break;
      case 'skills':
      case 'tools':
        setActiveSection('techstack');
        updateVisitedSections('techstack');
        break;
      case 'blog':
        setActiveSection('blog');
        updateVisitedSections('blog');
        break;
      default:
        // Keep current section
        break;
    }
  };

  // Update visited sections
  const updateVisitedSections = (section: Section) => {
    setVisitedSections(prev => ({
      ...prev,
      [section]: true
    }));
  };


  // Theme toggling function
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('light-theme', newTheme === 'light');
      return newTheme;
    });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case '1':
          setActiveSection('terminal');
          break;
        case '2':
          setActiveSection('about');
          updateVisitedSections('about');
          break;
        case '3':
          setActiveSection('projects');
          updateVisitedSections('projects');
          break;
        case '4':
          setActiveSection('techstack');
          updateVisitedSections('techstack');
          break;
        case '5':
          setActiveSection('blog');
          updateVisitedSections('blog');
          break;
        case 'Escape':
          // Close the command palette (the only overlay this page owns)
          setCommandPaletteOpen(false);
          break;
        case 't':
          // Toggle theme
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleTheme();
          }
          break;
        case 'k':
          // Open command palette
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setCommandPaletteOpen(true);
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Session uptime, counted from page load. The site is a static export
  // on GitHub Pages, so this session is the only honest uptime there is.
  useEffect(() => {
    const startedAt = Date.now();

    const calculateUptime = () => {
      const diffMs = Date.now() - startedAt;

      const hours = Math.floor(diffMs / (60 * 60 * 1000));
      const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

      setUptime({ hours, minutes });
    };

    // Calculate initial uptime
    calculateUptime();

    // Update every minute (60000ms) to avoid too frequent updates
    const interval = setInterval(calculateUptime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Touch devices boot with the heavy animated canvas backgrounds off
  // ('none' renders the cheap classic particles) so phones stay smooth.
  // The selector stays fully functional; we only skip the default when the
  // visitor has already picked an effect.
  useEffect(() => {
    const touch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
    if (touch && !effectChosenRef.current) {
      setVisualEffect('none');
    }
  }, []);

  return (
    <div 
      className={`relative flex flex-col items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} p-2 sm:p-4 overflow-hidden transition-colors duration-300`}
      onMouseMove={handleMouseMove}
    >
      {/* Advanced visual effects background */}
      {visualEffect === 'neural' && <NeuralNetwork className="z-0" />}
      {visualEffect === 'particles' && <ParticleField className="z-0" />}
      {visualEffect === 'matrix' && <MatrixRain className="z-0" />}

      {/* Old particle background for fallback */}
      {visualEffect === 'none' && <div ref={particlesRef} className="absolute inset-0 z-0 overflow-hidden"></div>}
      
      {/* Animated background gradients with parallax effect.
          pointer-events-none keeps the bg from intercepting input.
          will-change + translateZ promote it to its own GPU layer so the
          blur composites cheaply during mouse parallax and scroll. */}
      <motion.div
        ref={backgroundRef}
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        style={{
          x: backgroundX,
          y: backgroundY,
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      >
        <div className={`absolute top-0 left-0 w-1/3 h-1/3 ${theme === 'dark' ? 'bg-green-500' : 'bg-green-300'} rounded-full filter blur-[90px] opacity-10 animate-pulse`}></div>
        <div className={`absolute bottom-0 right-0 w-1/3 h-1/3 ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'} rounded-full filter blur-[90px] opacity-10 animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 right-1/4 w-1/4 h-1/4 ${theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'} rounded-full filter blur-[90px] opacity-10 animate-pulse`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-1/5 h-1/5 ${theme === 'dark' ? 'bg-cyan-500' : 'bg-cyan-300'} rounded-full filter blur-[90px] opacity-10 animate-pulse`} style={{ animationDelay: '3s' }}></div>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            className="relative z-10 w-full max-w-4xl text-green-500 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 text-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">sagar.sh</h1>
                <p className="text-gray-400">Booting...</p>
              </motion.div>
            </div>
            <motion.div 
              className="border border-green-500 p-4 rounded-md bg-black shadow-lg shadow-green-500/20"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {bootMessages.map((entry, i) => (
                <motion.div
                  key={i}
                  className="mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-green-300">[{entry.t.toFixed(1)}s] </span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className={i === bootMessages.length - 1 ? "text-green-400 font-bold" : ""}
                  >
                    {entry.text}
                  </motion.span>
                  {i === bootMessages.length - 1 && i === TOTAL_BOOT_MESSAGES - 1 && (
                    <motion.span
                      className="ml-2 text-green-400"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.div>
              ))}
              {bootMessages.length < TOTAL_BOOT_MESSAGES && (
                <div className="h-4 flex items-center">
                  <span className="inline-block w-2 h-4 bg-green-500 animate-pulse"></span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Boot Progress</span>
                  <span>{Math.round((bootMessages.length / TOTAL_BOOT_MESSAGES) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(bootMessages.length / TOTAL_BOOT_MESSAGES) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Skip hint */}
              <div className="mt-3 text-center text-xs text-gray-500 animate-pulse">
                press any key or click to skip
              </div>
            </motion.div>
          </motion.div>
        ) : (
        <>
          <motion.header 
            key="header"
            className="relative z-10 w-full max-w-4xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-center sm:text-left flex items-center">
              <motion.div
                className="mr-3 p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg hidden sm:block"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8 }}
              >
                <FaBrain size={24} className="text-white" />
              </motion.div>
              <div>
                <GlitchText
                  text="sagar.sh"
                  className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-cyan-500 to-blue-600"
                />
                {/* Hidden on mobile: the fixed top-right effect selector sits
                    where this subtitle would run, and the name is already in
                    the banner and nav. Shows from sm up where there is room. */}
                <p className="hidden sm:block text-gray-400 text-xs sm:text-sm mt-1">DevOps engineer · <span className="text-green-400 font-bold">Sagar Budhathoki</span></p>

                {/* GUI/CLI mode switch. Same segmented control the 3D route
                    speaks in (font-mono, rounded-full, sliding cyan active
                    pill via layoutId, border-cyan-500/30, bg-slate-950/70) so
                    the two views read as one product. Lives inside the header
                    flow on the left, far from the top-right effect selector +
                    online badge, and stays reachable on touch under the 980px
                    layout viewport (no fixed overlay). '3D' links home; 'CLI'
                    is the current page, so it's an inert active marker. */}
                <div className="mt-2 flex justify-center sm:justify-start">
                  <div className="inline-flex items-center gap-0.5 rounded-full border border-cyan-500/30 bg-slate-950/70 p-0.5 font-mono text-[10px] sm:text-xs backdrop-blur-sm">
                    <motion.a
                      href="/"
                      className="relative rounded-full px-3 py-1 tracking-widest text-slate-400 hover:text-white transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      3D
                    </motion.a>
                    <span
                      className="relative rounded-full px-3 py-1 tracking-widest text-cyan-300"
                      aria-current="page"
                    >
                      <motion.span
                        layoutId="modeSwitchActive"
                        className="absolute inset-0 rounded-full bg-cyan-500/15 border border-cyan-400/40"
                      />
                      <span className="relative">CLI</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Main Navigation */}
              <nav className="flex space-x-4">
                <motion.a 
                  onClick={() => setActiveSection('terminal')}
                  className={`nav-link ${activeSection === 'terminal' ? 'active text-green-500' : 'text-gray-300'} hover:text-white transition-colors relative text-xs`}
                  title="Terminal (Press 1)"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTerminal className="inline-block mr-1" size={12} />
                  <span>Terminal</span>
                </motion.a>
                <motion.a 
                  onClick={() => {
                    setActiveSection('about');
                    updateVisitedSections('about');
                  }}
                  className={`nav-link ${activeSection === 'about' ? 'active text-green-500' : 'text-gray-300'} hover:text-white transition-colors relative text-xs`}
                  title="About (Press 2)"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaUser className="inline-block mr-1" size={12} />
                  <span>About</span>
                  {!visitedSections.about && (
                    <motion.div 
                      className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full"
                      initial={{ scale: 0.8, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  )}
                </motion.a>
                <motion.a 
                  onClick={() => {
                    setActiveSection('projects');
                    updateVisitedSections('projects');
                  }}
                  className={`nav-link ${activeSection === 'projects' ? 'active text-green-500' : 'text-gray-300'} hover:text-white transition-colors relative text-xs`}
                  title="Projects (Press 3)"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaProjectDiagram className="inline-block mr-1" size={12} />
                  <span>Projects</span>
                  {!visitedSections.projects && (
                    <motion.div 
                      className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full"
                      initial={{ scale: 0.8, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  )}
                </motion.a>
                <motion.a 
                  onClick={() => {
                    setActiveSection('techstack');
                    updateVisitedSections('techstack');
                  }}
                  className={`nav-link ${activeSection === 'techstack' ? 'active text-green-500' : 'text-gray-300'} hover:text-white transition-colors relative text-xs`}
                  title="Tech Stack (Press 4)"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTools className="inline-block mr-1" size={12} />
                  <span>Tech Stack</span>
                  {!visitedSections.techstack && (
                    <motion.div 
                      className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full"
                      initial={{ scale: 0.8, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  )}
                </motion.a>
                <motion.a 
                  onClick={() => {
                    setActiveSection('blog');
                    updateVisitedSections('blog');
                  }}
                  className={`nav-link ${activeSection === 'blog' ? 'active text-green-500' : 'text-gray-300'} hover:text-white transition-colors relative text-xs`}
                  title="Blog (Press 5)"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaBlog className="inline-block mr-1" size={12} />
                  <span>Blog</span>
                  {!visitedSections.blog && (
                    <motion.div 
                      className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full"
                      initial={{ scale: 0.8, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  )}
                </motion.a>
              </nav>
              
              {/* Theme Toggle Button */}
              <motion.button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-all"
                title="Toggle Theme (Ctrl+T)"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
              </motion.button>
            </div>
          </motion.header>
          
          <motion.main 
            key="main"
            className="relative z-10 w-full max-w-4xl mb-4"
            style={{ minHeight: 'calc(100vh - 200px)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {activeSection === 'terminal' && (
                <motion.div 
                  key="terminal"
                  className="h-[calc(100vh-200px)] sm:h-[calc(100vh-200px)]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TerminalWrapper
                    initialCommand=""
                    onCommandExecuted={handleTerminalCommand}
                  />
                </motion.div>
              )}
              {activeSection === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <About />
                </motion.div>
              )}
              {activeSection === 'projects' && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Projects />
                </motion.div>
              )}
              {activeSection === 'techstack' && (
                <motion.div
                  key="techstack"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TechStack />
                </motion.div>
              )}
          {activeSection === 'blog' && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BlogPostsWrapper />
            </motion.div>
          )}
            </AnimatePresence>
          </motion.main>
          
          {/* Footer with system info - hidden on mobile, visible on desktop */}
          <motion.div 
            key="footer"
            className="relative z-10 w-full max-w-4xl hidden md:flex flex-col md:flex-row justify-between text-xs text-gray-500 font-mono gap-2 md:gap-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-center sm:justify-start">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              <span>System operational</span>
            </div>
            <div className="text-center sm:text-left">
              <span>Session uptime: {uptime.hours}h {uptime.minutes}m</span>
            </div>
            <div className="text-center sm:text-right">
              <span>© {new Date().getFullYear()} Sagar Budhathoki · <a href="https://github.com/sbmagar13" className="text-green-500 hover:underline">github.com/sbmagar13</a></span>
            </div>
          </motion.div>
          
          {/* Keyboard shortcuts help - hidden on mobile, visible on desktop */}
          <motion.div
            className="fixed bottom-4 right-4 bg-gray-800/80 backdrop-blur-sm text-xs text-gray-400 p-2 rounded-lg border border-gray-700 z-20 hidden md:block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <div className="flex items-center mb-1">
              <FaCode className="mr-1" /> <span>Keyboard Shortcuts:</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div><span className="text-green-500">1</span>: Terminal</div>
              <div><span className="text-green-500">2</span>: About</div>
              <div><span className="text-green-500">3</span>: Projects</div>
              <div><span className="text-green-500">4</span>: Tech Stack</div>
              <div><span className="text-green-500">5</span>: Blog</div>
              <div><span className="text-green-500">Ctrl+T</span>: Theme</div>
              <div><span className="text-green-500">Ctrl+K</span>: Command</div>
              <div><span className="text-green-500">Esc</span>: Close</div>
            </div>
          </motion.div>
          
          {/* Version badge with effect selector */}
          <motion.div
            className="fixed top-4 right-4 flex flex-col gap-2 z-20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="bg-gray-900/70 text-green-400 text-xs py-1 px-3 rounded-full font-mono flex items-center border border-green-500/30 backdrop-blur-sm">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
              online
            </div>
            <select
              value={visualEffect}
              onChange={(e) => {
                effectChosenRef.current = true;
                setVisualEffect(e.target.value as VisualEffect);
              }}
              className="bg-gray-800/80 text-green-400 text-xs py-1 px-2 rounded border border-green-500/30 backdrop-blur-sm cursor-pointer hover:bg-gray-700/80 transition-colors"
            >
              <option value="neural">Neural Network</option>
              <option value="particles">Particle Field</option>
              <option value="matrix">Matrix Rain</option>
              <option value="none">Classic</option>
            </select>
          </motion.div>

          {/* Performance Monitor */}
          <PerformanceMonitor />

          {/* Command Palette */}
          <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
          {/* The floating 3D-experience button used to live here. The
              header 3D/CLI mode switch now owns that navigation, so the
              button was removed: it floated over the terminal and crowded
              the input area on mobile. */}
        </>
      )}
      </AnimatePresence>
    </div>
  );
}
