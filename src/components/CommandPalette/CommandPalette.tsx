'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTerminal, FaRocket, FaCode, FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'terminal',
      title: 'Open Terminal',
      description: 'Access the interactive terminal',
      icon: <FaTerminal />,
      action: () => {
        window.location.hash = '#terminal';
        onClose();
      },
      keywords: ['terminal', 'console', 'command', 'cli']
    },
    {
      id: 'projects',
      title: 'View Projects',
      description: 'Explore DevOps projects and implementations',
      icon: <FaRocket />,
      action: () => {
        window.location.hash = '#projects';
        onClose();
      },
      keywords: ['projects', 'work', 'portfolio', 'showcase']
    },
    {
      id: 'github',
      title: 'GitHub Profile',
      description: 'Visit GitHub profile',
      icon: <FaGithub />,
      action: () => {
        window.open('https://github.com/sagarbudhathoki', '_blank');
        onClose();
      },
      keywords: ['github', 'code', 'repository', 'source']
    },
    {
      id: 'linkedin',
      title: 'LinkedIn Profile',
      description: 'Connect on LinkedIn',
      icon: <FaLinkedin />,
      action: () => {
        window.open('https://linkedin.com/in/sagarbudhathoki', '_blank');
        onClose();
      },
      keywords: ['linkedin', 'connect', 'network', 'professional']
    },
    {
      id: 'email',
      title: 'Send Email',
      description: 'Get in touch via email',
      icon: <FaEnvelope />,
      action: () => {
        window.location.href = 'mailto:sagar@example.com';
        onClose();
      },
      keywords: ['email', 'contact', 'mail', 'message']
    },
    {
      id: 'source',
      title: 'View Source Code',
      description: 'See the code behind this portfolio',
      icon: <FaCode />,
      action: () => {
        window.open('https://github.com/sagarbudhathoki/brain-portfolio', '_blank');
        onClose();
      },
      keywords: ['source', 'code', 'repository', 'github']
    }
  ];

  const filteredCommands = commands.filter(cmd => {
    const searchLower = search.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(searchLower) ||
      cmd.description.toLowerCase().includes(searchLower) ||
      cmd.keywords.some(keyword => keyword.includes(searchLower))
    );
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-900 border border-green-500/30 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center border-b border-green-500/30 px-4 py-3">
            <FaSearch className="text-green-500 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-white outline-none placeholder-gray-500"
            />
            <kbd className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">ESC</kbd>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No commands found for &quot;{search}&quot;
              </div>
            ) : (
              filteredCommands.map((cmd, index) => (
                <motion.button
                  key={cmd.id}
                  className={`w-full px-4 py-3 flex items-center hover:bg-gray-800/50 transition-colors ${
                    index === selectedIndex ? 'bg-gray-800/70' : ''
                  }`}
                  onClick={cmd.action}
                  whileHover={{ x: 2 }}
                >
                  <div className="mr-3 text-green-500">{cmd.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">{cmd.title}</div>
                    <div className="text-gray-400 text-sm">{cmd.description}</div>
                  </div>
                  {index === selectedIndex && (
                    <kbd className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">Enter</kbd>
                  )}
                </motion.button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}