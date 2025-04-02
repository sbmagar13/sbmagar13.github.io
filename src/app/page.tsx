'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import About from '@/components/About/About';
import Projects from '@/components/Projects/Projects';
import TechStack from '@/components/Tools/TechStack';
import { FaServer, FaNetworkWired, FaDocker, FaCloudUploadAlt, FaTerminal, FaUser, FaProjectDiagram, FaTools } from 'react-icons/fa';

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
        break;
      case 'projects':
        setActiveSection('projects');
        break;
      case 'skills':
        setActiveSection('techstack');
        break;
      default:
        // Keep current section
        break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
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
            className="w-full max-w-4xl mb-4 flex justify-between items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div>
              <h1 className="text-3xl font-bold text-green-500">DevOps Brain</h1>
              <p className="text-gray-400 text-sm">Your Brain on the Web - DevOps Edition | by <span className="text-green-400">Sagar Budhathoki</span></p>
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
                onClick={() => setActiveSection('about')}
                className={`p-2 rounded hover:bg-gray-800 ${activeSection === 'about' ? 'text-green-500' : ''}`}
                title="About"
              >
                <FaUser size={20} />
              </button>
              <button 
                onClick={() => setActiveSection('projects')}
                className={`p-2 rounded hover:bg-gray-800 ${activeSection === 'projects' ? 'text-green-500' : ''}`}
                title="Projects"
              >
                <FaProjectDiagram size={20} />
              </button>
              <button 
                onClick={() => setActiveSection('techstack')}
                className={`p-2 rounded hover:bg-gray-800 ${activeSection === 'techstack' ? 'text-green-500' : ''}`}
                title="Tech Stack"
              >
                <FaTools size={20} />
              </button>
            </div>
          </motion.header>
          
          <motion.main 
            className="w-full max-w-4xl mb-4"
            style={{ minHeight: '70vh' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {activeSection === 'terminal' && (
              <div className="h-[70vh]">
                <Terminal 
                  initialCommand="help" 
                  onCommandExecuted={handleTerminalCommand}
                />
              </div>
            )}
            {activeSection === 'about' && <About />}
            {activeSection === 'projects' && <Projects />}
            {activeSection === 'techstack' && <TechStack />}
          </motion.main>
          
          <motion.div 
            className="w-full max-w-4xl flex justify-between text-xs text-gray-500 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              <span>System operational</span>
            </div>
            <div>
              <span>Uptime: {Math.floor(Math.random() * 100) + 1}d {Math.floor(Math.random() * 24)}h {Math.floor(Math.random() * 60)}m</span>
            </div>
            <div>
              <span>© {new Date().getFullYear()} DevOps Brain | by Sagar Budhathoki</span>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
