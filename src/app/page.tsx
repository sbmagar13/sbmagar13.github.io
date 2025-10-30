'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import About from '@/components/About/About';
import Projects from '@/components/Projects/Projects';
import TechStack from '@/components/Tools/TechStack';
import BlogPostsWrapper from './BlogPostsWrapper';
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
  const [bootMessages, setBootMessages] = useState<string[]>([]);
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
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [uptime, setUptime] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  });
  
  // Mouse position for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax effect for background elements
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Update motion values based on mouse position
    mouseX.set(clientX / innerWidth);
    mouseY.set(clientY / innerHeight);
  }, [mouseX, mouseY]);
  
  // Transform mouse position to parallax values
  const backgroundX = useTransform(mouseX, [0, 1], [-10, 10]);
  const backgroundY = useTransform(mouseY, [0, 1], [-10, 10]);
  
  // Particle animation refs
  const particlesRef = useRef<HTMLDivElement>(null);
  const particleCount = 80; // Increased particle count
  const backgroundRef = useRef<HTMLDivElement>(null);
  
  // Simulate boot sequence with enhanced messages
  useEffect(() => {
    const messages = [
      'Initializing DevOps Brain v2.0 ULTRA...',
      'Bootstrapping Kubernetes clusters...',
      'Activating AI-powered infrastructure optimization...',
      'Loading neural network visualization...',
      'Establishing quantum entanglement protocols...',
      'Deploying serverless edge functions globally...',
      'Initializing chaos engineering framework...',
      'Syncing with 150+ DevOps tools...',
      'Optimizing performance metrics...',
      'System ready! Welcome to the future of DevOps!'
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < messages.length) {
        setBootMessages(prev => [...prev, messages[index]]);
        index++;
      } else {
        clearInterval(interval);
        // Longer pause after the last message so users can read "System ready!"
        setTimeout(() => {
          setLoading(false);
        }, 2000); // Increased from 500ms to 2000ms
      }
    }, 800); // Increased from 250ms to 800ms for better readability

    return () => clearInterval(interval);
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
  
  // Handle scroll detection for header effects
  useEffect(() => {
    const handleScroll = () => {
      // Header effect based on scroll position
      // Apply any scroll-based effects here if needed
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          // Close any open overlays
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

  // Calculate dynamic uptime from DevOps career start date
  useEffect(() => {
    const startDate = new Date('2020-12-01T00:00:00Z'); // Career start date

    const calculateUptime = () => {
      const now = new Date();
      const diffMs = now.getTime() - startDate.getTime();

      const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

      setUptime({ days, hours, minutes });
    };

    // Calculate initial uptime
    calculateUptime();

    // Update every minute (60000ms) to avoid too frequent updates
    const interval = setInterval(calculateUptime, 60000);

    return () => clearInterval(interval);
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
      
      {/* Animated background gradients with parallax effect */}
      <motion.div 
        ref={backgroundRef}
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ 
          x: backgroundX,
          y: backgroundY
        }}
      >
        <div className={`absolute top-0 left-0 w-1/3 h-1/3 ${theme === 'dark' ? 'bg-green-500' : 'bg-green-300'} rounded-full filter blur-[150px] opacity-10 animate-pulse`}></div>
        <div className={`absolute bottom-0 right-0 w-1/3 h-1/3 ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'} rounded-full filter blur-[150px] opacity-10 animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 right-1/4 w-1/4 h-1/4 ${theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'} rounded-full filter blur-[150px] opacity-10 animate-pulse`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-1/5 h-1/5 ${theme === 'dark' ? 'bg-cyan-500' : 'bg-cyan-300'} rounded-full filter blur-[150px] opacity-10 animate-pulse`} style={{ animationDelay: '3s' }}></div>
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
                <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">DevOps Brain</h1>
                <p className="text-gray-400">Booting system...</p>
              </motion.div>
            </div>
            <motion.div 
              className="border border-green-500 p-4 rounded-md bg-black shadow-lg shadow-green-500/20"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {bootMessages.map((message, i) => (
                <motion.div
                  key={i}
                  className="mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <span className="text-green-300">[{(i * 0.8).toFixed(1)}s] </span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className={i === bootMessages.length - 1 ? "text-green-400 font-bold" : ""}
                  >
                    {message}
                  </motion.span>
                  {i === bootMessages.length - 1 && (
                    <motion.span
                      className="ml-2 text-green-400"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.div>
              ))}
              {bootMessages.length < 10 && (
                <div className="h-4 flex items-center">
                  <span className="inline-block w-2 h-4 bg-green-500 animate-pulse"></span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Boot Progress</span>
                  <span>{Math.round((bootMessages.length / 10) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(bootMessages.length / 10) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
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
                  text="DevOps Brain 2.0"
                  className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-cyan-500 to-blue-600"
                />
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Elite DevOps Engineering | by <span className="text-green-400 font-bold">Sagar Budhathoki</span></p>
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
              <span>Uptime: {uptime.days}d {uptime.hours}h {uptime.minutes}m</span>
            </div>
            <div className="text-center sm:text-right">
              <span>© {new Date().getFullYear()} DevOps Brain | <span className="text-green-500 hover:underline cursor-pointer">v1.2.3</span></span>
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
              <div><span className="text-green-500">Ctrl+1</span>: Terminal</div>
              <div><span className="text-green-500">Ctrl+2</span>: About</div>
              <div><span className="text-green-500">Ctrl+3</span>: Projects</div>
              <div><span className="text-green-500">Ctrl+4</span>: Tech Stack</div>
              <div><span className="text-green-500">Ctrl+5</span>: Blog</div>
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
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-xs py-1 px-3 rounded-full font-mono flex items-center">
              <span className="inline-block w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span>
              v2.0 ULTRA
            </div>
            <select
              value={visualEffect}
              onChange={(e) => setVisualEffect(e.target.value as VisualEffect)}
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
        </>
      )}
      </AnimatePresence>
    </div>
  );
}
