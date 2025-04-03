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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Helper function to focus the terminal
  const focusTerminal = () => {
    if (!terminalRef.current || !xtermRef.current) return;
    
    try {
      // Focus the terminal element
      terminalRef.current.focus();
      
      // Try to find and focus the xterm textarea
      const xtermTextarea = terminalRef.current.querySelector('.xterm-helper-textarea');
      if (xtermTextarea) {
        (xtermTextarea as HTMLTextAreaElement).focus();
      }
      
      // Focus the xterm directly
      xtermRef.current.focus();
    } catch (error) {
      console.error('Error focusing terminal:', error);
    }
  };
  
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
      fontSize: window.innerWidth < 768 ? 10 : 14, // Even smaller font on mobile
      lineHeight: window.innerWidth < 768 ? 1.1 : 1.2, // Tighter line height on mobile
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
      cols: window.innerWidth < 768 ? 40 : 80, // Limit columns on mobile to prevent overflow
      rows: window.innerWidth < 768 ? 15 : 24, // Fewer rows on mobile
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
    
    // Improved mobile touch support
    if (terminalRef.current) {
      // Make the terminal container focusable
      terminalRef.current.tabIndex = 0;
      
      // Handle touch on terminal
      terminalRef.current.addEventListener('touchstart', (e) => {
        // Prevent default to avoid unwanted scrolling
        e.preventDefault();
        
        // Show the mobile keyboard button more prominently
        const keyboardButton = document.getElementById('mobile-keyboard-button');
        if (keyboardButton) {
          keyboardButton.classList.add('pulse-animation');
          setTimeout(() => {
            keyboardButton.classList.remove('pulse-animation');
          }, 2000);
        }
      });
    }
    
    // Add a small delay before fitting to ensure DOM is fully rendered
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
    }, 100); // Small delay to ensure terminal is properly initialized
    
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
      } else if (domEvent.keyCode === 8) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
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
        } else if (historyIndex === commandHistory.length - 1) {
          setHistoryIndex(commandHistory.length);
          
          // Clear current line
          term.write('\r\x1b[K');
          writePrompt(term);
          
          currentLine = '';
        }
      } else if (printable) {
        currentLine += key;
        term.write(key);
      }
    });
    
    // Execute initial command only on desktop (not mobile)
    if (initialCommand && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setTimeout(() => {
        currentLine = initialCommand;
        term.writeln('');
        term.write(`${initialCommand}`);
        term.writeln('');
        processCommand(initialCommand);
        setCommandHistory(prev => [...prev, initialCommand]);
        setHistoryIndex(1);
        currentLine = '';
      }, 300); // Reduced delay for faster startup
    }
    
    // Automatically focus the terminal on desktop devices
    setTimeout(() => {
      focusTerminal();
    }, 300); // Reduced delay for better performance
    
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
    
    try {
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
        try {
          resizeObserver.disconnect();
        } catch (error) {
          console.error('Error disconnecting ResizeObserver:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up ResizeObserver:', error);
      return () => {}; // Return empty cleanup function
    }
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
      
      // Simulate loading (with reduced delay)
      setTimeout(() => {
        setIsLoading(false);
        const result = executeCommand(command);
        writeCommandResult(result);
      }, 800); // Reduced delay for faster response
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
    
    // Check if this is a sequential output (like coffee command)
    if (result.includes('<<SEQUENTIAL_START>>') && result.includes('<<SEQUENTIAL_END>>')) {
      // Extract the sequential part
      const startMarker = '<<SEQUENTIAL_START>>';
      const endMarker = '<<SEQUENTIAL_END>>';
      const startIndex = result.indexOf(startMarker) + startMarker.length;
      const endIndex = result.indexOf(endMarker);
      
      // Get the content before, sequential part, and after
      const beforeSequential = result.substring(0, result.indexOf(startMarker));
      const sequentialContent = result.substring(startIndex, endIndex).trim();
      const afterSequential = result.substring(endIndex + endMarker.length);
      
      // Write the content before sequential part
      beforeSequential.split('\n').forEach(line => {
        term.writeln(line);
      });
      
      // Get the sequential lines
      const sequentialLines = sequentialContent.split('\n');
      
      // Write sequential lines with delay
      let lineIndex = 0;
      
      const writeSequentialLine = () => {
        if (lineIndex < sequentialLines.length) {
          term.writeln(sequentialLines[lineIndex]);
          lineIndex++;
          setTimeout(writeSequentialLine, 800); // Reduced delay for faster display
        } else {
          // After all sequential lines, write the rest and the prompt
          afterSequential.split('\n').forEach(line => {
            term.writeln(line);
          });
          writePrompt(term);
        }
      };
      
      // Start writing sequential lines
      writeSequentialLine();
    } else {
      // Regular output (not sequential)
      // Split result by newlines
      const lines = result.split('\n');
      
      // Write each line
      lines.forEach(line => {
        term.writeln(line);
      });
      
      // Write prompt
      writePrompt(term);
    }
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
  
  // Direct terminal input handling for mobile
  const handleMobileKeyboardClick = () => {
    if (!terminalRef.current || !xtermRef.current) return;
    
    // Focus the terminal to ensure it receives input
    focusTerminal();
    
    // Make the xterm-helper-textarea visible and position it better for mobile
    const xtermTextarea = terminalRef.current.querySelector('.xterm-helper-textarea');
    if (xtermTextarea) {
      const textarea = xtermTextarea as HTMLTextAreaElement;
      
      // Make it visible but transparent (so we can type directly in terminal)
      textarea.style.opacity = '1';
      textarea.style.left = '0';
      textarea.style.top = 'auto';
      textarea.style.bottom = '80px'; // Position it higher to avoid keyboard overlap
      textarea.style.width = '100%';
      textarea.style.height = '40px';
      textarea.style.zIndex = '100';
      textarea.style.backgroundColor = 'transparent';
      textarea.style.color = 'transparent';
      textarea.style.caretColor = 'transparent';
      
      // Focus it to bring up the keyboard
      textarea.focus();
      
      // Scroll terminal to bottom to ensure input area is visible
      if (terminalRef.current) {
        const viewport = terminalRef.current.querySelector('.xterm-viewport');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }
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
        className="flex-1 bg-black focus:outline-none overflow-auto"
        tabIndex={0} // Make the terminal div focusable
        onClick={focusTerminal}
        onFocus={focusTerminal}
        style={{ maxHeight: '100%', overflowY: 'auto' }}
      />
      
      {/* Mobile keyboard button - positioned at the bottom right */}
      <button
        id="mobile-keyboard-button"
        className="md:hidden fixed bottom-4 right-4 bg-green-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
        onClick={handleMobileKeyboardClick}
        aria-label="Open keyboard"
        style={{
          animation: 'none',
          zIndex: 50,
          boxShadow: '0 0 10px rgba(51, 255, 51, 0.5)'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="ml-1 font-bold">Type</span>
      </button>
      
      {/* Add some CSS for the pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(51, 255, 51, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(51, 255, 51, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(51, 255, 51, 0); }
        }
        .pulse-animation {
          animation: pulse 1s infinite;
        }
      `}</style>
    </motion.div>
  );
};

export default Terminal;
