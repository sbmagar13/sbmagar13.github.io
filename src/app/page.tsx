'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import About from '@/components/About/About';
import Projects from '@/components/Projects/Projects';
import TechStack from '@/components/Tools/TechStack';
import BlogPostsWrapper from './BlogPostsWrapper';
import { FaTerminal, FaUser, FaProjectDiagram, FaTools, FaBrain, FaCode, FaSun, FaMoon, FaBlog } from 'react-icons/fa';

// Dynamically import the Terminal component with no SSR
const Terminal = dynamic(() => import('@/components/Terminal/Terminal'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black text-green-500 border border-green-500 rounded-md">
      <div className="text-center">
        <div className="mb-4">Loading terminal...</div>
        <div className="inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  ),
});

type Section = 'terminal' | 'about' | 'projects' | 'techstack' | 'blog';

// Theme type
type Theme = 'dark' | 'light' | 'system';

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
      'Initializing DevOps Brain v1.2...',
      'Configuring multi-cloud infrastructure...',
      'Optimizing CI/CD pipelines with AI integration...',
      'Synchronizing with cutting-edge tech stack...',
      'Compiling quantum-resistant codebase...',
      'Loading Sagar\'s innovations and expertise...',
      'Integrating system components with zero downtime...',
      'Deploying chaos monkeys for resilience testing...',
      'Establishing secure network connections...',
      'System ready! Let\'s revolutionize DevOps!'
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < messages.length) {
        setBootMessages(prev => [...prev, messages[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    }, 250); // Slightly faster for better UX

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
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className={`relative flex flex-col items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} p-2 sm:p-4 overflow-hidden transition-colors duration-300`}
      onMouseMove={handleMouseMove}
    >
      {/* Particle background */}
      <div ref={particlesRef} className="absolute inset-0 z-0 overflow-hidden"></div>
      
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
                  className="mb-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <span className="text-green-300">[{(i * 0.25).toFixed(1)}s] </span>
                  <span>{message}</span>
                </motion.div>
              ))}
              {bootMessages.length < 10 && (
                <div className="h-4 flex items-center">
                  <span className="inline-block w-2 h-4 bg-green-500 animate-pulse"></span>
                </div>
              )}
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
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">DevOps Brain</h1>
                <p className="text-gray-400 text-xs sm:text-sm">Your Brain on the Web - DevOps | by <span className="text-green-400">Sagar Budhathoki</span></p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Main Navigation */}
              <div className="flex space-x-1 sm:space-x-2 text-gray-400 bg-gray-800/50 p-1 rounded-full backdrop-blur-sm">
                <motion.button 
                  onClick={() => setActiveSection('terminal')}
                  className={`p-2 rounded-full hover:bg-gray-700 transition-all ${activeSection === 'terminal' ? 'bg-green-500/20 text-green-500' : ''}`}
                  title="Terminal (Press 1)"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTerminal size={18} />
                </motion.button>
                <motion.button 
                  onClick={() => {
                    setActiveSection('about');
                    updateVisitedSections('about');
                  }}
                  className={`p-2 rounded-full hover:bg-gray-700 transition-all relative ${activeSection === 'about' ? 'bg-green-500/20 text-green-500' : ''}`}
                  title="About (Press 2)"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaUser size={18} />
                  {!visitedSections.about && (
                    <motion.div 
                      className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                      initial={{ scale: 0.8, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  )}
                </motion.button>
                <motion.button 
                  onClick={() => {
                    setActiveSection('projects');
                    updateVisitedSections('projects');
                  }}
                  className={`p-2 rounded-full hover:bg-gray-700 transition-all relative ${activeSection === 'projects' ? 'bg-green-500/20 text-green-500' : ''}`}
                  title="Projects (Press 3)"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaProjectDiagram size={18} />
                  {!visitedSections.projects && (
                    <motion.div 
                      className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                      initial={{ scale: 0.8, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  )}
                </motion.button>
                <motion.button 
                  onClick={() => {
                    setActiveSection('techstack');
                    updateVisitedSections('techstack');
                  }}
                  className={`p-2 rounded-full hover:bg-gray-700 transition-all relative ${activeSection === 'techstack' ? 'bg-green-500/20 text-green-500' : ''}`}
                  title="Tech Stack (Press 4)"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTools size={18} />
                  {!visitedSections.techstack && (
                    <motion.div 
                      className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                      initial={{ scale: 0.8, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  )}
                </motion.button>
                <motion.button 
                  onClick={() => {
                    setActiveSection('blog');
                    updateVisitedSections('blog');
                  }}
                  className={`p-2 rounded-full hover:bg-gray-700 transition-all relative ${activeSection === 'blog' ? 'bg-green-500/20 text-green-500' : ''}`}
                  title="Blog (Press 5)"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaBlog size={18} />
                  {!visitedSections.blog && (
                    <motion.div 
                      className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                      initial={{ scale: 0.8, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  )}
                </motion.button>
              </div>
              
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
                  <Terminal 
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
          
          <motion.div 
            key="footer"
            className="relative z-10 w-full max-w-4xl flex flex-col sm:flex-row justify-between text-xs text-gray-500 font-mono gap-2 sm:gap-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-center sm:justify-start">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              <span>System operational</span>
            </div>
            <div className="text-center sm:text-left">
              <span>Uptime: {Math.floor(Math.random() * 100) + 1}d {Math.floor(Math.random() * 24)}h {Math.floor(Math.random() * 60)}m</span>
            </div>
            <div className="text-center sm:text-right">
              <span>© {new Date().getFullYear()} DevOps Brain | <span className="text-green-500 hover:underline cursor-pointer">v1.2.3</span></span>
            </div>
          </motion.div>
          
          {/* Keyboard shortcuts help */}
          <motion.div
            className="fixed bottom-4 right-4 bg-gray-800/80 backdrop-blur-sm text-xs text-gray-400 p-2 rounded-lg border border-gray-700 z-20"
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
              <div><span className="text-green-500">Esc</span>: Close</div>
            </div>
          </motion.div>
          
          {/* Version badge */}
          <motion.div
            className="fixed top-4 right-4 bg-green-600/80 text-white text-xs py-1 px-3 rounded-full font-mono z-20 flex items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <span className="inline-block w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span>
            v1.2.3
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </div>
  );
}
