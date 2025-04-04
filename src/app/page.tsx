'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import About from '@/components/About/About';
import Projects from '@/components/Projects/Projects';
import TechStack from '@/components/Tools/TechStack';
import { FaTerminal, FaUser, FaProjectDiagram, FaTools } from 'react-icons/fa';

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

type Section = 'terminal' | 'about' | 'projects' | 'techstack';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [bootMessages, setBootMessages] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<Section>('terminal');
  const [visitedSections, setVisitedSections] = useState<Record<Section, boolean>>({
    terminal: true,
    about: false,
    projects: false,
    techstack: false
  });

  // Simulate boot sequence
  useEffect(() => {
    const messages = [
      'Initializing system...',
      'Loading kernel modules...',
      'Starting system services...',
      'Mounting filesystems...',
      'Establishing network connections...',
      'Starting security services...',
      'Loading DevOps Brain...',
      'System ready!'
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
    }, 300);

    return () => clearInterval(interval);
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


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-2 sm:p-4">
      {loading ? (
        <motion.div 
          className="w-full max-w-4xl text-green-500 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-bold mb-2">DevOps Brain</h1>
            <p className="text-gray-400">Booting system...</p>
          </div>
          <div className="border border-green-500 p-4 rounded-md bg-black">
            {bootMessages.map((message, i) => (
              <div key={i} className="mb-1">
                <span className="text-green-300">[{(i * 0.3).toFixed(1)}s] </span>
                <span>{message}</span>
              </div>
            ))}
            {bootMessages.length < 8 && (
              <div className="h-4 flex items-center">
                <span className="inline-block w-2 h-4 bg-green-500 animate-pulse"></span>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <>
          <motion.header 
            className="w-full max-w-4xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-green-500">DevOps Brain</h1>
              <p className="text-gray-400 text-xs sm:text-sm">Your Brain on the Web - DevOps | by <span className="text-green-400">Sagar Budhathoki</span></p>
            </div>
            <div className="flex space-x-3 text-gray-400">
              <button 
                onClick={() => setActiveSection('terminal')}
                className={`p-2 rounded hover:bg-gray-800 ${activeSection === 'terminal' ? 'text-green-500' : ''}`}
                title="Terminal"
              >
                <FaTerminal size={20} />
              </button>
              <button 
                onClick={() => {
                  setActiveSection('about');
                  updateVisitedSections('about');
                }}
                className={`p-2 rounded hover:bg-gray-800 relative ${activeSection === 'about' ? 'text-green-500' : ''}`}
                title="About"
              >
                <FaUser size={20} />
                {!visitedSections.about && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                    initial={{ scale: 0.8, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.6,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                )}
              </button>
              <button 
                onClick={() => {
                  setActiveSection('projects');
                  updateVisitedSections('projects');
                }}
                className={`p-2 rounded hover:bg-gray-800 relative ${activeSection === 'projects' ? 'text-green-500' : ''}`}
                title="Projects"
              >
                <FaProjectDiagram size={20} />
                {!visitedSections.projects && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                    initial={{ scale: 0.8, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.6,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                )}
              </button>
              <button 
                onClick={() => {
                  setActiveSection('techstack');
                  updateVisitedSections('techstack');
                }}
                className={`p-2 rounded hover:bg-gray-800 relative ${activeSection === 'techstack' ? 'text-green-500' : ''}`}
                title="Tech Stack"
              >
                <FaTools size={20} />
                {!visitedSections.techstack && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                    initial={{ scale: 0.8, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.6,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                )}
              </button>
            </div>
          </motion.header>
          
          <motion.main 
            className="w-full max-w-4xl mb-4"
            style={{ minHeight: 'calc(100vh - 200px)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {activeSection === 'terminal' && (
              <div className="h-[calc(100vh-200px)] sm:h-[calc(100vh-200px)]">
                <Terminal 
                  initialCommand={typeof window !== 'undefined' && window.innerWidth >= 768 ? "help" : ""} 
                  onCommandExecuted={handleTerminalCommand}
                />
              </div>
            )}
            {activeSection === 'about' && <About />}
            {activeSection === 'projects' && <Projects />}
            {activeSection === 'techstack' && <TechStack />}
          </motion.main>
          
          <motion.div 
            className="w-full max-w-4xl flex flex-col sm:flex-row justify-between text-xs text-gray-500 font-mono gap-2 sm:gap-0"
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
              <span>© {new Date().getFullYear()} DevOps Brain</span>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
