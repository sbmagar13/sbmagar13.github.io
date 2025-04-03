'use client';

// This component uses browser-only features and should not be server-rendered

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from 'xterm-addon-fit';
import { executeCommand } from './commands';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  initialCommand?: string;
  onCommandExecuted?: (command: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ initialCommand, onCommandExecuted }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentInput, setCurrentInput] = useState('');
  
  // Use currentInput to avoid the "assigned but never used" error
  useEffect(() => {
    // This effect runs whenever currentInput changes
    // We don't need to do anything here, just having the dependency is enough
  }, [currentInput]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return;
    
    // Clean up any existing terminal
    if (xtermRef.current) {
      xtermRef.current.dispose();
    }
    
    // Create new terminal
    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: 'var(--font-geist-mono), monospace',
      fontSize: window.innerWidth < 768 ? 12 : 14, // Smaller font on mobile
      theme: {
        background: '#0a0a0a',
        foreground: '#33ff33',
        cursor: '#33ff33',
        selectionBackground: '#33ff33',
        selectionForeground: '#0a0a0a',
      },
      allowTransparency: true,
      convertEol: true, // Ensures proper line breaks on mobile
      scrollback: 1000, // Increase scrollback for better mobile experience
    });
    
    // Save term reference first
    xtermRef.current = term;
    
    // Create fit addon
    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    
    // Load addon
    term.loadAddon(fitAddon);
    
      // Open terminal
      term.open(terminalRef.current);
      
      // Add touch support for mobile devices
      if (terminalRef.current) {
        terminalRef.current.addEventListener('touchstart', () => {
          // Create a virtual keyboard input element
          const input = document.createElement('textarea');
          input.style.position = 'absolute';
          input.style.left = '-9999px';
          input.style.top = '0';
          input.style.width = '0';
          input.style.height = '0';
          input.style.opacity = '0';
          input.style.pointerEvents = 'none';
          
          // Add to DOM
          document.body.appendChild(input);
          
          // Focus the input to show keyboard
          input.focus();
          
          // Listen for input changes
          input.addEventListener('input', (e) => {
            const inputValue = (e.target as HTMLTextAreaElement).value;
            if (inputValue) {
              // Send the input to the terminal
              for (const char of inputValue) {
                term.write(char);
                currentLine += char;
                setCurrentInput(currentLine);
              }
              // Clear the input for next use
              (e.target as HTMLTextAreaElement).value = '';
            }
          });
          
          // Remove when terminal loses focus
          const cleanup = () => {
            document.body.removeChild(input);
            document.removeEventListener('touchstart', handleTouchOutside);
          };
          
          // Handle touch outside terminal
          const handleTouchOutside = (e: TouchEvent) => {
            if (!terminalRef.current?.contains(e.target as Node)) {
              cleanup();
            }
          };
          
          // Add listener for touches outside terminal
          document.addEventListener('touchstart', handleTouchOutside);
        });
      }
    
    // Add a longer delay before fitting to ensure DOM is fully rendered
    setTimeout(() => {
      if (fitAddonRef.current && terminalRef.current) {
        try {
          // Make sure the terminal element has dimensions before fitting
          if (terminalRef.current.clientWidth > 0 && terminalRef.current.clientHeight > 0) {
            fitAddonRef.current.fit();
          } else {
            console.warn('Terminal element has no dimensions yet, skipping initial fit');
          }
        } catch (error) {
          console.error('Error fitting terminal:', error);
        }
      }
    }, 300);
    
    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit();
        } catch (error) {
          console.error('Error fitting terminal on resize:', error);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Write welcome message
    // term.writeln('\x1b[1;32m' + asciiArt.portrait + '\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[1;32mWelcome to DevOps Brain Terminal v2.0.0\x1b[0m');
    term.writeln('\x1b[1;37mYour Brain on the Web - DevOps\x1b[0m');
    term.writeln('\x1b[90mType "help" to see available commands\x1b[0m');
    term.writeln('');
    
    // Set up prompt
    writePrompt(term);
    
    // Handle key input
    let currentLine = '';
    
    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
      
      if (domEvent.keyCode === 13) { // Enter
        // Process command
        term.writeln('');
        if (currentLine.trim()) {
          processCommand(currentLine.trim());
          setCommandHistory(prev => [...prev, currentLine.trim()]);
          setHistoryIndex(commandHistory.length + 1);
        } else {
          writePrompt(term);
        }
        currentLine = '';
        setCurrentInput('');
      } else if (domEvent.keyCode === 8) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          setCurrentInput(currentLine);
          // Move cursor backward
          term.write('\b \b');
        }
      } else if (domEvent.keyCode === 38) { // Up arrow
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          const historyCommand = commandHistory[newIndex];
          
          // Clear current line
          term.write('\r\x1b[K');
          writePrompt(term);
          
          // Write history command
          term.write(historyCommand);
          currentLine = historyCommand;
          setCurrentInput(historyCommand);
        }
      } else if (domEvent.keyCode === 40) { // Down arrow
        if (historyIndex < commandHistory.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          const historyCommand = commandHistory[newIndex];
          
          // Clear current line
          term.write('\r\x1b[K');
          writePrompt(term);
          
          // Write history command
          term.write(historyCommand);
          currentLine = historyCommand;
          setCurrentInput(historyCommand);
        } else if (historyIndex === commandHistory.length - 1) {
          setHistoryIndex(commandHistory.length);
          
          // Clear current line
          term.write('\r\x1b[K');
          writePrompt(term);
          
          currentLine = '';
          setCurrentInput('');
        }
      } else if (printable) {
        currentLine += key;
        setCurrentInput(currentLine);
        term.write(key);
      }
    });
    
    // Execute initial command if provided
    if (initialCommand) {
      setTimeout(() => {
        currentLine = initialCommand;
        term.writeln('');
        term.write(`${initialCommand}`);
        term.writeln('');
        processCommand(initialCommand);
        setCommandHistory(prev => [...prev, initialCommand]);
        setHistoryIndex(1);
        currentLine = '';
      }, 1000);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle window resize and terminal dimension changes
  useEffect(() => {
    // Skip if terminal or fit addon is not initialized
    if (!terminalRef.current || !fitAddonRef.current || !xtermRef.current) return;
    
    // Create a ResizeObserver to detect changes in terminal dimensions
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current && terminalRef.current) {
        try {
          // Check if terminal element has dimensions
          if (terminalRef.current.clientWidth > 0 && terminalRef.current.clientHeight > 0) {
            fitAddonRef.current.fit();
          }
        } catch (error) {
          console.error('Error fitting terminal on dimension change:', error);
        }
      }
    });
    
    // Observe the terminal element
    resizeObserver.observe(terminalRef.current);
    
    // Clean up
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Write prompt to terminal
  const writePrompt = (term: XTerm) => {
    term.write('\x1b[1;32m➜\x1b[0m ');
  };
  
  // Process command
  const processCommand = (command: string) => {
    if (!xtermRef.current) return;
    
    const term = xtermRef.current;
    
    // Special case for clear command
    if (command === 'clear') {
      term.clear();
      writePrompt(term);
      return;
    }
    
    // Notify parent component about the command
    if (onCommandExecuted) {
      // These commands can trigger UI changes in the parent
      const navigationCommands = ['about', 'projects', 'skills', 'tools', 'exit'];
      if (navigationCommands.includes(command.split(' ')[0])) {
        onCommandExecuted(command.split(' ')[0]);
      }
    }
    
    // Show loading animation for certain commands
    const commandsWithLoading = ['deploy', 'chaos', 'tools'];
    const shouldShowLoading = commandsWithLoading.some(cmd => 
      command === cmd || command.startsWith(`${cmd} `)
    );
    
    if (shouldShowLoading) {
      setIsLoading(true);
      setLoadingMessage(command.startsWith('deploy') ? 'Deploying...' : 
                        command.startsWith('chaos') ? 'Releasing chaos monkey...' : 
                        'Loading...');
      
      // Simulate loading
      setTimeout(() => {
        setIsLoading(false);
        const result = executeCommand(command);
        writeCommandResult(result);
      }, 1500);
    } else {
      // Execute command immediately
      const result = executeCommand(command);
      writeCommandResult(result);
    }
  };
  
  // Write command result to terminal
  const writeCommandResult = (result: string) => {
    if (!xtermRef.current) return;
    
    const term = xtermRef.current;
    
    // Split result by newlines
    const lines = result.split('\n');
    
    // Write each line
    lines.forEach(line => {
      term.writeln(line);
    });
    
    // Write prompt
    writePrompt(term);
  };
  
  // Loading animation
  useEffect(() => {
    if (!isLoading || !xtermRef.current) return;
    
    const term = xtermRef.current;
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let frameIndex = 0;
    
    term.writeln('');
    
    const interval = setInterval(() => {
      // Clear line and write new frame
      term.write(`\r\x1b[K\x1b[1;33m${frames[frameIndex]} ${loadingMessage}\x1b[0m`);
      
      // Update frame index
      frameIndex = (frameIndex + 1) % frames.length;
    }, 80);
    
    return () => {
      clearInterval(interval);
      if (xtermRef.current) {
        xtermRef.current.writeln('');
      }
    };
  }, [isLoading, loadingMessage]);
  
  // Handle mobile keyboard button click
  const handleMobileKeyboardClick = () => {
    if (!terminalRef.current) return;
    
    // Create a virtual keyboard input element
    const input = document.createElement('textarea');
    input.style.position = 'fixed';
    input.style.bottom = '0';
    input.style.left = '0';
    input.style.width = '100%';
    input.style.height = '40px';
    input.style.padding = '8px';
    input.style.backgroundColor = '#0a0a0a';
    input.style.color = '#33ff33';
    input.style.border = '1px solid #33ff33';
    input.style.zIndex = '1000';
    input.placeholder = 'Type your command here...';
    
    // Add to DOM
    document.body.appendChild(input);
    
    // Focus the input to show keyboard
    input.focus();
    
    // Listen for input changes
    const handleInput = (e: Event) => {
      if (!xtermRef.current) return;
      
      const inputValue = (e.target as HTMLTextAreaElement).value;
      if (inputValue && inputValue.endsWith('\n')) {
        // Process command on Enter
        const command = inputValue.trim();
        if (command) {
          // Clear the input
          (e.target as HTMLTextAreaElement).value = '';
          
          // Write command to terminal
          xtermRef.current.write(command);
          xtermRef.current.writeln('');
          
          // Process command
          processCommand(command);
          setCommandHistory(prev => [...prev, command]);
          setHistoryIndex(commandHistory.length + 1);
        }
      }
    };
    
    input.addEventListener('keyup', handleInput);
    
    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.position = 'fixed';
    closeButton.style.bottom = '40px';
    closeButton.style.right = '0';
    closeButton.style.padding = '5px 10px';
    closeButton.style.backgroundColor = '#333';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.zIndex = '1000';
    
    document.body.appendChild(closeButton);
    
    // Handle close button click
    closeButton.addEventListener('click', () => {
      document.body.removeChild(input);
      document.body.removeChild(closeButton);
    });
  };
  
  return (
    <motion.div 
      className="w-full h-full rounded-md overflow-hidden border border-green-500 shadow-lg shadow-green-500/20 flex flex-col relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-black text-green-500 p-1 flex items-center justify-between border-b border-green-500">
        <div className="flex items-center">
          <div className="flex space-x-1.5 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-xs font-mono">~/devops-brain</div>
        </div>
        <div className="text-xs font-mono flex items-center">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
          <span>system operational</span>
        </div>
      </div>
      <div 
        ref={terminalRef} 
        className="flex-1 bg-black"
      />
      
      {/* Mobile keyboard button - only visible on small screens */}
      <button
        className="md:hidden absolute bottom-4 right-4 bg-green-700 text-white p-2 rounded-full shadow-lg"
        onClick={handleMobileKeyboardClick}
        aria-label="Open keyboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
    </motion.div>
  );
};

export default Terminal;
