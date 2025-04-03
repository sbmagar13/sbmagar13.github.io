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

  // Helper function to focus the terminal
  const focusTerminal = () => {
    if (!terminalRef.current || !xtermRef.current) return;
    
    // Focus the terminal element
    terminalRef.current.focus();
    
    // Try to find and focus the xterm textarea
    const xtermTextarea = terminalRef.current.querySelector('.xterm-helper-textarea');
    if (xtermTextarea) {
      (xtermTextarea as HTMLTextAreaElement).focus();
    }
    
    // Focus the xterm directly
    xtermRef.current.focus();
  };
  
  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return;
    
    // Clean up any existing terminal
    if (xtermRef.current) {
      xtermRef.current.dispose();
    }
    
    // Flag to track if we've shown the keyboard on mobile
    let hasShownKeyboard = false;
    
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
    
    // Automatically focus the terminal on all devices
    setTimeout(() => {
      // For mobile devices, show the keyboard
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        if (!hasShownKeyboard) {
          hasShownKeyboard = true;
          handleMobileKeyboardClick();
        }
      } 
      // For desktop browsers, focus the terminal directly
      else {
        focusTerminal();
      }
    }, 1500); // Delay to ensure terminal is fully initialized
    
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
  
  // Improved mobile keyboard handling
  const handleMobileKeyboardClick = () => {
    if (!terminalRef.current || !xtermRef.current) return;
    
    // Create a better mobile input interface
    const inputContainer = document.createElement('div');
    inputContainer.style.position = 'fixed';
    inputContainer.style.bottom = '0';
    inputContainer.style.left = '0';
    inputContainer.style.width = '100%';
    inputContainer.style.backgroundColor = '#0a0a0a';
    inputContainer.style.borderTop = '2px solid #33ff33';
    inputContainer.style.padding = '10px';
    inputContainer.style.zIndex = '1000';
    inputContainer.style.display = 'flex';
    inputContainer.style.flexDirection = 'column';
    inputContainer.style.gap = '10px';
    
    // Add a label to make it clear
    const label = document.createElement('div');
    label.textContent = 'Terminal Input';
    label.style.color = '#33ff33';
    label.style.fontSize = '14px';
    label.style.fontWeight = 'bold';
    inputContainer.appendChild(label);
    
    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.style.width = '100%';
    input.style.padding = '10px';
    input.style.backgroundColor = '#1a1a1a';
    input.style.color = '#33ff33';
    input.style.border = '1px solid #33ff33';
    input.style.borderRadius = '4px';
    input.style.fontSize = '16px'; // Larger font size for better mobile typing
    input.placeholder = 'Type your command here...';
    input.autocapitalize = 'none'; // Prevent auto-capitalization
    input.autocomplete = 'off'; // Disable autocomplete
    // Set autocorrect attribute using setAttribute since it's not in the HTMLInputElement type
    input.setAttribute('autocorrect', 'off');
    input.spellcheck = false; // Disable spellcheck
    inputContainer.appendChild(input);
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.marginTop = '5px';
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Execute';
    submitButton.style.padding = '8px 16px';
    submitButton.style.backgroundColor = '#33ff33';
    submitButton.style.color = '#0a0a0a';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '4px';
    submitButton.style.fontWeight = 'bold';
    submitButton.style.flex = '1';
    submitButton.style.marginRight = '5px';
    buttonContainer.appendChild(submitButton);
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#ff3333';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.fontWeight = 'bold';
    buttonContainer.appendChild(closeButton);
    
    inputContainer.appendChild(buttonContainer);
    
    // Add common commands for quick access
    const quickCommands = ['help', 'about', 'projects', 'skills', 'clear'];
    const quickCommandsContainer = document.createElement('div');
    quickCommandsContainer.style.display = 'flex';
    quickCommandsContainer.style.flexWrap = 'wrap';
    quickCommandsContainer.style.gap = '5px';
    quickCommandsContainer.style.marginTop = '10px';
    
    quickCommands.forEach(cmd => {
      const cmdButton = document.createElement('button');
      cmdButton.textContent = cmd;
      cmdButton.style.padding = '5px 10px';
      cmdButton.style.backgroundColor = '#1a1a1a';
      cmdButton.style.color = '#33ff33';
      cmdButton.style.border = '1px solid #33ff33';
      cmdButton.style.borderRadius = '4px';
      cmdButton.style.fontSize = '14px';
      
      cmdButton.addEventListener('click', () => {
        input.value = cmd;
      });
      
      quickCommandsContainer.appendChild(cmdButton);
    });
    
    inputContainer.appendChild(quickCommandsContainer);
    
    // Add to DOM
    document.body.appendChild(inputContainer);
    
    // Focus the input to show keyboard
    setTimeout(() => {
      input.focus();
    }, 100);
    
    // Handle submit
    const handleSubmit = () => {
      if (!xtermRef.current) return;
      
      const command = input.value.trim();
      if (command) {
        // Clear the input
        input.value = '';
        
        // Write command to terminal
        xtermRef.current.writeln('');
        xtermRef.current.write(`${command}`);
        xtermRef.current.writeln('');
        
        // Process command
        processCommand(command);
        setCommandHistory(prev => [...prev, command]);
        setHistoryIndex(commandHistory.length + 1);
        
        // On mobile, reopen the keyboard after a short delay
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          // Close the current input container
          document.body.removeChild(inputContainer);
          
          // Reopen keyboard after a short delay to allow command to process
          setTimeout(() => {
            handleMobileKeyboardClick();
          }, 500);
        } else {
          // On desktop, just close the input container
          document.body.removeChild(inputContainer);
        }
      }
    };
    
    // Event listeners
    submitButton.addEventListener('click', handleSubmit);
    closeButton.addEventListener('click', () => {
      document.body.removeChild(inputContainer);
    });
    
    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
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
        className="flex-1 bg-black focus:outline-none"
        tabIndex={0} // Make the terminal div focusable
        onClick={focusTerminal}
        onFocus={focusTerminal}
      />
      
      {/* Improved mobile keyboard button - only visible on small screens */}
      <button
        id="mobile-keyboard-button"
        className="md:hidden absolute bottom-4 right-4 bg-green-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
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
