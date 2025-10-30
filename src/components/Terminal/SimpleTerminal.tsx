'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SimpleTerminalProps {
  initialCommand?: string;
  onCommandExecuted?: (command: string) => void;
}

export default function SimpleTerminal({ onCommandExecuted }: SimpleTerminalProps) {
  const [output, setOutput] = useState<Array<{ type: 'command' | 'output' | 'error'; text: string }>>([
    { type: 'output', text: 'Welcome to DevOps Brain Terminal v2.0' },
    { type: 'output', text: 'Type "help" for available commands' },
    { type: 'output', text: '' }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const executeCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();

    const commands: Record<string, () => string> = {
      help: () => `Available commands:
• about - Learn about Sagar Budhathoki
• projects - View DevOps projects
• skills - See technical skills
• blog - Read latest posts
• clear - Clear terminal
• whoami - Display user info
• pwd - Show current directory
• ls - List available sections
• uptime - System uptime
• version - Terminal version`,

      about: () => {
        onCommandExecuted?.('about');
        return 'Navigating to About section...';
      },

      projects: () => {
        onCommandExecuted?.('projects');
        return 'Loading project dashboard...';
      },

      skills: () => {
        onCommandExecuted?.('skills');
        return 'Opening tech stack registry...';
      },

      blog: () => {
        onCommandExecuted?.('blog');
        return 'Opening blog posts...';
      },

      clear: () => {
        setOutput([]);
        return '';
      },

      whoami: () => 'sagar@devops-brain:~$ Elite DevOps Engineer & AI Enthusiast',

      pwd: () => '/home/sagar/devops-brain',

      ls: () => `total 5
drwxr-xr-x  about/
drwxr-xr-x  projects/
drwxr-xr-x  skills/
drwxr-xr-x  blog/
-rw-r--r--  README.md`,

      uptime: () => {
        const days = Math.floor(Math.random() * 365) + 100;
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        return `up ${days} days, ${hours}:${minutes}, load average: 0.42, 0.37, 0.35`;
      },

      version: () => 'DevOps Brain Terminal v2.0.0 (built with React & TypeScript)'
    };

    if (command in commands) {
      const result = commands[command]();
      if (result) {
        setOutput(prev => [...prev, { type: 'output', text: result }]);
      }
    } else if (command) {
      setOutput(prev => [...prev, { type: 'error', text: `Command not found: ${command}. Type "help" for available commands.` }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    // Add command to output
    setOutput(prev => [...prev, { type: 'command', text: `sagar@devops-brain:~$ ${currentCommand}` }]);

    // Add to history
    setCommandHistory(prev => [...prev, currentCommand]);
    setHistoryIndex(-1);

    // Execute command
    executeCommand(currentCommand);

    // Clear input
    setCurrentCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <motion.div
      className="w-full h-full bg-black text-green-500 border border-green-500 rounded-md overflow-hidden font-mono text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-green-500 flex items-center">
        <div className="flex space-x-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-gray-300 text-sm">DevOps Brain Terminal</div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="p-4 h-full overflow-y-auto"
        style={{ height: 'calc(100% - 50px)' }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Output */}
        <div className="mb-4">
          {output.map((line, index) => (
            <div
              key={index}
              className={`mb-1 ${
                line.type === 'command' ? 'text-white' :
                line.type === 'error' ? 'text-red-400' :
                'text-green-300'
              }`}
            >
              {line.text}
            </div>
          ))}
        </div>

        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-green-500 mr-2">sagar@devops-brain:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-green-500 outline-none"
            autoComplete="off"
            spellCheck="false"
          />
          <span className="inline-block w-2 h-4 bg-green-500 animate-pulse ml-1"></span>
        </form>
      </div>
    </motion.div>
  );
}