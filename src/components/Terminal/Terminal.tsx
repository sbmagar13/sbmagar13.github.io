'use client';

// This component uses browser-only features and should not be server-rendered

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from 'xterm-addon-fit';
import { executeCommand, isVimActive, getCommandNames } from './commands';
import { unlockDiscovery } from '@/lib/discoveries';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  initialCommand?: string;
  onCommandExecuted?: (command: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ initialCommand, onCommandExecuted }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  // Command history lives in refs, not state: the xterm onKey closure is
  // created once inside the init effect, so state values captured there
  // go stale after the first render. Refs always read current.
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(0);
  // Guided tour state, in refs for the same reason as history: the
  // xterm onKey closure is created once and must read current values.
  const tourActiveRef = useRef(false);
  const tourTimeoutsRef = useRef<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  // Mobile input: xterm's hidden-textarea input is broken on phones (the
  // keyboard opens but keystrokes are not captured), so on touch screens
  // we drive the terminal from a real native input bar at the bottom and
  // only use xterm for output. This ref/state back that input.
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [mobileInput, setMobileInput] = useState('');

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

  // Push a command into shell history and persist the tail.
  // localStorage is this terminal's ~/.bash_history; private modes can
  // throw on any storage access, and losing history is not worth
  // crashing over.
  const recordHistory = (command: string) => {
    historyRef.current.push(command);
    try {
      window.localStorage.setItem(
        'sb_term_history',
        JSON.stringify(historyRef.current.slice(-100))
      );
    } catch {
      // Best effort only.
    }
  };

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return;

    // Restore persisted history before the first prompt, so Up arrow
    // works across visits like a real ~/.bash_history.
    try {
      const saved = window.localStorage.getItem('sb_term_history');
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          historyRef.current = parsed
            .filter((entry): entry is string => typeof entry === 'string')
            .slice(-100);
          historyIndexRef.current = historyRef.current.length;
        }
      }
    } catch {
      // Storage unavailable (private mode): history starts empty.
    }

    let cancelled = false;
    let teardown: (() => void) | null = null;
    const fontSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 12 : 14;

    // Wait for Geist Mono to load before opening xterm. xterm.js renders
    // to a canvas at init time; if the web font isn't ready, the welcome
    // ASCII banner is drawn in the fallback monospace and the block
    // glyphs collide ("SAGAR" becomes a jumble on first paint).
    const fontReady =
      typeof document !== 'undefined' && document.fonts
        ? document.fonts.load(`${fontSize}px "Geist Mono"`).catch(() => undefined)
        : Promise.resolve();

    fontReady.then(() => {
      const el = terminalRef.current;
      if (cancelled || !el) return;
      teardown = initTerminal(el, fontSize);
    });

    return () => {
      cancelled = true;
      teardown?.();
    };

    function initTerminal(container: HTMLDivElement, fontSize: number): () => void {
    // Clean up any existing terminal
    if (xtermRef.current) {
      xtermRef.current.dispose();
    }

    // Create new terminal
    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize, // Matches the size the Geist Mono preload above waited for
      lineHeight: window.innerWidth < 768 ? 1.2 : 1.2, // Consistent line height for readability
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
    term.open(container);
    
    // Make the terminal container focusable. (No touchstart preventDefault
    // here: it used to block native scrolling of the output on phones.)
    if (terminalRef.current) {
      terminalRef.current.tabIndex = 0;
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
    
    // Write the welcome banner: 'sagar.sh' in slant figlet, matching the
    // site header brand. Pure printable ASCII only; the old banner used
    // Unicode block glyphs that Geist Mono doesn't ship, so each block
    // fell back to a different font and the letters collided into a
    // jumble. ASCII 0x20-0x7E renders identically in every mono font.
    term.writeln('');

    // Get terminal width for centering
    const termWidth = term.cols || 80;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Green-to-cyan gradient, one 256-color step per banner line, the
    // way modern CLI tools (bun, pnpm) draw their wordmarks.
    const gradient = [40, 41, 42, 43, 44, 45];

    const banner = isMobile
      ? [
          '                               __ ',
          ' ___ ___ ____ ____ _____  ___ / / ',
          '(_-</ _ `/ _ `/ _ `/ __/ (_-</ _ \\',
          '/___/\\_,_/\\_, /\\_,_/_/ (_)___/_//_/',
          '         /___/                     ',
        ]
      : [
          '                                     __  ',
          '   _________ _____ _____ ___________/ /_ ',
          '  / ___/ __ `/ __ `/ __ `/ ___/ ___/ __ \\',
          ' (__  ) /_/ / /_/ / /_/ / /  (__  ) / / /',
          '/____/\\__,_/\\__, /\\__,_/_(_)/____/_/ /_/ ',
          '           /____/                        ',
        ];

    const bannerWidth = Math.max(...banner.map((l) => l.length));
    const bannerPad = ' '.repeat(Math.max(0, Math.floor((termWidth - bannerWidth) / 2)));
    banner.forEach((line, i) => {
      const color = gradient[Math.min(i, gradient.length - 1)];
      term.writeln(bannerPad + `\x1b[38;5;${color}m` + line + '\x1b[0m');
    });

    term.writeln('');

    // Last login line, the way a real box greets you. The timestamp
    // is the only honest fact available (this browser's previous
    // visit, stored locally); no fake hostnames, no fake IPs.
    try {
      const previousLogin = window.localStorage.getItem('sb_term_last_login');
      if (previousLogin) {
        const when = new Date(Number(previousLogin));
        if (!Number.isNaN(when.getTime())) {
          // toLocaleString can emit non-ASCII separators (U+202F
          // before AM/PM in newer ICU); keep the output pure ASCII.
          const formatted = when.toLocaleString().replace(/[^\x20-\x7E]/g, ' ');
          term.writeln(`\x1b[90mLast login: ${formatted} from your browser\x1b[0m`);
          term.writeln('');
        }
      }
      window.localStorage.setItem('sb_term_last_login', String(Date.now()));
    } catch {
      // Private mode: this box forgets you between visits. Fair.
    }

    // A real shell greets minimally: one motd line, one dim hint, done.
    const subtitle = 'DevOps Brain Terminal v2.0.0';
    const subtitlePadding = Math.max(0, Math.floor((termWidth - subtitle.length) / 2));
    const subtitleSpaces = ' '.repeat(subtitlePadding);

    const helpText = "Type 'help' for commands, or just start with 'about'.";
    const helpPadding = Math.max(0, Math.floor((termWidth - helpText.length) / 2));
    const helpSpaces = ' '.repeat(helpPadding);

    term.writeln(subtitleSpaces + '\x1b[1;37m' + subtitle + '\x1b[0m');
    term.writeln(helpSpaces + '\x1b[90m' + helpText + '\x1b[0m');
    term.writeln('');
    
    // Set up prompt
    writePrompt(term);
    
    // Handle key input
    let currentLine = '';
    
    term.onKey(({ key, domEvent }) => {
      // Any keydown cancels a running tour, exactly as promised when
      // it started. The key is swallowed; it only acts as the brake.
      if (tourActiveRef.current) {
        domEvent.preventDefault();
        stopTour();
        return;
      }

      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.keyCode === 13) { // Enter
        // Process command. The history cursor resets on every Enter,
        // including an empty one, exactly like bash: a blank line after
        // recalling history should not leave Up resuming mid-walk.
        term.writeln('');
        if (currentLine.trim()) {
          processCommand(currentLine.trim());
          recordHistory(currentLine.trim());
        } else {
          writePrompt(term);
        }
        historyIndexRef.current = historyRef.current.length;
        currentLine = '';
      } else if (domEvent.keyCode === 8) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          // Move cursor backward
          term.write('\b \b');
        }
      } else if (domEvent.keyCode === 9) { // Tab: complete against the command registry
        domEvent.preventDefault();
        if (!isVimActive() && currentLine.length > 0 && !currentLine.includes(' ')) {
          const matches = getCommandNames().filter(name => name.startsWith(currentLine));
          if (matches.length === 1) {
            // Single match: complete it and add a trailing space
            const completion = matches[0].slice(currentLine.length) + ' ';
            currentLine = matches[0] + ' ';
            term.write(completion);
          } else if (matches.length > 1) {
            // Extend to the longest common prefix first; if nothing to
            // extend, list the candidates like a real shell would.
            let prefix = matches[0];
            for (const match of matches) {
              while (!match.startsWith(prefix)) prefix = prefix.slice(0, -1);
            }
            if (prefix.length > currentLine.length) {
              term.write(prefix.slice(currentLine.length));
              currentLine = prefix;
            } else {
              term.writeln('');
              term.writeln(matches.join('  '));
              writePrompt(term);
              term.write(currentLine);
            }
          }
        }
      } else if (domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey && domEvent.key.toLowerCase() === 'l') {
        // Ctrl+L clears the screen like a real terminal, keeping the
        // current input line. (Disabled inside the vim trap, same as
        // the 'clear' command.)
        domEvent.preventDefault();
        if (!isVimActive()) {
          term.clear();
        }
      } else if (domEvent.keyCode === 38) { // Up arrow
        // History recall is disabled inside the vim trap: redrawing the
        // shell prompt over the vim screen breaks the gag.
        if (!isVimActive() && historyIndexRef.current > 0) {
          historyIndexRef.current -= 1;
          const historyCommand = historyRef.current[historyIndexRef.current];

          // Clear current line
          term.write('\r\x1b[K');
          writePrompt(term);

          // Write history command
          term.write(historyCommand);
          currentLine = historyCommand;
        }
      } else if (domEvent.keyCode === 40) { // Down arrow
        if (!isVimActive() && historyIndexRef.current < historyRef.current.length - 1) {
          historyIndexRef.current += 1;
          const historyCommand = historyRef.current[historyIndexRef.current];

          // Clear current line
          term.write('\r\x1b[K');
          writePrompt(term);

          // Write history command
          term.write(historyCommand);
          currentLine = historyCommand;
        } else if (!isVimActive() && historyIndexRef.current === historyRef.current.length - 1) {
          historyIndexRef.current = historyRef.current.length;

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

    // Run the caller-provided initial command, if any. No default:
    // a real shell greets quietly and waits.
    if (initialCommand) {
      setTimeout(() => {
        term.writeln('');
        term.write(`${initialCommand}`);
        term.writeln('');
        processCommand(initialCommand);
        recordHistory(initialCommand);
        historyIndexRef.current = historyRef.current.length;
      }, 300); // Reduced delay for faster startup
    }
    
    // Auto-focus only on desktop. On phones, focusing xterm's hidden
    // textarea pops the soft keyboard on arrival without capturing input
    // (the bug). Mobile typing goes through the native input bar instead,
    // which the visitor taps when they are ready.
    const isDesktop =
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 768px)').matches &&
      !('ontouchstart' in window);
    if (isDesktop) {
      setTimeout(() => {
        focusTerminal();
      }, 300);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      // A disposed terminal must not receive scheduled tour writes.
      tourTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
      tourTimeoutsRef.current = [];
      tourActiveRef.current = false;
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
    } // end initTerminal
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

  // Cancel a running tour: clear everything scheduled, say so, hand
  // the prompt back. Output already in flight from the current command
  // finishes on its own, like a real foreground process would.
  const stopTour = () => {
    tourTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    tourTimeoutsRef.current = [];
    tourActiveRef.current = false;
    const term = xtermRef.current;
    if (term) {
      term.writeln('');
      term.writeln('\x1b[1;33mTour stopped.\x1b[0m');
      writePrompt(term);
    }
  };

  // Guided tour. Lives here instead of the command registry because it
  // needs the xterm instance and processCommand: it auto-types real
  // commands and runs them through the exact same path a human
  // keystroke would take, so history, navigation side effects and
  // colors all behave.
  const startTour = () => {
    const term = xtermRef.current;
    if (!term) return;
    if (tourActiveRef.current) {
      term.writeln('A tour is already running. Press any key to stop it.');
      writePrompt(term);
      return;
    }
    if (isVimActive()) {
      term.writeln("\x1b[1;31mtour: not while you're stuck in vim.\x1b[0m Escape with ':q!' first.");
      writePrompt(term);
      return;
    }

    tourActiveRef.current = true;
    // Genuine curiosity reward: ran the guided tour instead of guessing.
    // SSR-safe (the lib guards window); no toast, the tour itself is feedback.
    unlockDiscovery('tour');
    const schedule = (fn: () => void, delay: number) => {
      tourTimeoutsRef.current.push(window.setTimeout(fn, delay));
    };

    term.writeln('\x1b[1;32mStarting the guided tour. Press any key to stop.\x1b[0m');
    term.writeln('');
    writePrompt(term);

    const script = ['about', 'skills', 'projects', 'incident'];
    const typeDelayMs = 35; // per character, human-ish
    const commandGapMs = 1800; // pause between commands

    const runStep = (index: number) => {
      if (!tourActiveRef.current) return;
      if (index >= script.length) {
        tourActiveRef.current = false;
        tourTimeoutsRef.current = [];
        term.writeln('');
        term.writeln("\x1b[1;32mThat's the tour.\x1b[0m Type \x1b[1;36mhelp\x1b[0m for the full command list,");
        term.writeln('or visit the 3D experience: \x1b[1;34mhttps://sagarbudhathoki.com/\x1b[0m');
        writePrompt(term);
        return;
      }

      const command = script[index];
      let charIndex = 0;
      const typeChar = () => {
        if (!tourActiveRef.current) return;
        if (charIndex < command.length) {
          term.write(command[charIndex]);
          charIndex += 1;
          schedule(typeChar, typeDelayMs);
          return;
        }
        // Fully typed: run it exactly like an Enter press would.
        term.writeln('');
        processCommand(command);
        recordHistory(command);
        historyIndexRef.current = historyRef.current.length;
        schedule(() => runStep(index + 1), commandGapMs);
      };
      schedule(typeChar, typeDelayMs);
    };

    schedule(() => runStep(0), 600);
  };

  // Process command
  const processCommand = (command: string) => {
    if (!xtermRef.current) return;
    
    const term = xtermRef.current;

    // While the vim trap holds the terminal, every input goes straight
    // to executeCommand so the gag can't be bypassed: no local clear,
    // no section navigation, no loading spinners until the user :q!s.
    if (isVimActive()) {
      const result = executeCommand(command);
      writeCommandResult(result);
      return;
    }

    // 'tour' / 'demo' are handled here, not in the registry: the tour
    // needs the terminal instance to auto-type. A piped form falls
    // through, so 'tour | grep ...' still hits the registry fallback.
    const baseCommand = command.split(' ')[0];
    if (!command.includes('|') && (baseCommand === 'tour' || baseCommand === 'demo')) {
      startTour();
      return;
    }

    // Special case for clear command
    if (command === 'clear') {
      term.clear();
      writePrompt(term);
      return;
    }

    // Notify parent component about the command
    if (onCommandExecuted) {
      // These commands can trigger UI changes in the parent
      const navigationCommands = ['about', 'projects', 'skills', 'tools', 'blog', 'exit'];
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
  
  // Create a container for clickable links - DISABLED to fix infinite recursion
  const createClickableLinks = useCallback(() => {
    // This function is intentionally disabled to fix the "Maximum call stack size exceeded" error
    console.log("createClickableLinks is disabled");
    return;
  }, []);
  
  // Handle terminal scrolling to update link positions - DISABLED
  useEffect(() => {
    // This effect is intentionally disabled to fix the "Maximum call stack size exceeded" error
    return;
  }, [createClickableLinks]);
  
  // Write command result to terminal
  const writeCommandResult = (result: string) => {
    if (!xtermRef.current || !terminalRef.current) return;
    
    const term = xtermRef.current;
    
    // Function to scroll to bottom
    const scrollToBottom = () => {
      const viewport = terminalRef.current?.querySelector('.xterm-viewport');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    };

    // Function to apply syntax highlighting to command output
    const highlightSyntax = (line: string): string => {
      // Highlight command names (words followed by a space or [])
      line = line.replace(/^(\s*)([a-zA-Z0-9_-]+)(\s|\[)/g, '$1\x1b[1;36m$2\x1b[0m$3');
      
      // Highlight options and flags (words starting with -)
      line = line.replace(/(\s)(-{1,2}[a-zA-Z0-9_-]+)/g, '$1\x1b[1;33m$2\x1b[0m');
      
      // Highlight URLs
      line = line.replace(/(https?:\/\/[^\s]+)/g, '\x1b[1;34m$1\x1b[0m');
      
      // Highlight paths and filenames
      line = line.replace(/(\s|\()([\/~][^\s:;,)]+)/g, '$1\x1b[1;32m$2\x1b[0m');
      
      // Highlight numbers
      line = line.replace(/(\s)(\d+)(\s|$)/g, '$1\x1b[1;35m$2\x1b[0m$3');
      
      return line;
    };
    
    // Check if this is a sequential output (like Lemon Tea command)
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
        // Apply syntax highlighting if the line doesn't already have color codes
        const highlightedLine = !line.includes('\x1b[') ? highlightSyntax(line) : line;
        term.writeln(highlightedLine);
      });
      
      // Get the sequential lines
      const sequentialLines = sequentialContent.split('\n');
      
      // Write sequential lines with delay
      let lineIndex = 0;
      
      const writeSequentialLine = () => {
        if (lineIndex < sequentialLines.length) {
          // Apply syntax highlighting if the line doesn't already have color codes
          const highlightedLine = !sequentialLines[lineIndex].includes('\x1b[') 
            ? highlightSyntax(sequentialLines[lineIndex]) 
            : sequentialLines[lineIndex];
          term.writeln(highlightedLine);
          lineIndex++;
          setTimeout(writeSequentialLine, 800); // Reduced delay for faster display
        } else {
          // After all sequential lines, write the rest and the prompt
          afterSequential.split('\n').forEach(line => {
            // Apply syntax highlighting if the line doesn't already have color codes
            const highlightedLine = !line.includes('\x1b[') ? highlightSyntax(line) : line;
            term.writeln(highlightedLine);
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
      
      // Function to simulate typing effect
      const simulateTyping = (lineIndex: number) => {
        if (lineIndex >= lines.length) {
          // All lines have been written, show prompt
          writePrompt(term);
          
          // Scroll to bottom to ensure output is visible
          scrollToBottom();
          return;
        }
        
        // Get the current line
        const line = lines[lineIndex];
        
        // Skip typing effect for empty lines or lines with color codes (pre-formatted)
        if (line.trim() === '' || line.includes('\x1b[')) {
          term.writeln(line);
          // Process next line with a small delay
          setTimeout(() => simulateTyping(lineIndex + 1), 10);
          return;
        }
        
        // Apply syntax highlighting
        const highlightedLine = highlightSyntax(line);
        
        // Write the line with a typing effect
        term.writeln(highlightedLine);
        
        // Determine delay for next line based on line length
        // Shorter lines = faster typing, longer lines = slower typing
        const baseDelay = 20; // Base delay in milliseconds
        const lineLength = line.length;
        const delay = Math.min(baseDelay + lineLength / 5, 100); // Cap at 100ms
        
        // Process next line with calculated delay
        setTimeout(() => simulateTyping(lineIndex + 1), delay);
      };
      
      // Start the typing effect with the first line
      simulateTyping(0);
      
      // Clickable links functionality is disabled to fix the "Maximum call stack size exceeded" error
      // setTimeout(createClickableLinks, 300);
    }
  };
  
  // Loading animation
  useEffect(() => {
    if (!isLoading || !xtermRef.current) return;
    
    const term = xtermRef.current;
    // Classic ASCII spinner: braille frames need glyphs Geist Mono may
    // not ship, and a fallback-font frame flickers a different width.
    const frames = ['|', '/', '-', '\\'];
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
  
  // Mobile command submit. The native input bar at the bottom captures
  // the keystrokes (xterm cannot on phones); on submit we echo the line
  // into the scrollback exactly like an Enter press would, run it through
  // the same processCommand path, and clear the input. Submits on the Run
  // button or the keyboard's Enter, so nothing is forced.
  const submitMobileCommand = () => {
    const term = xtermRef.current;
    if (!term) return;

    // Any input while a tour runs cancels it, same as desktop.
    if (tourActiveRef.current) {
      stopTour();
      setMobileInput('');
      return;
    }

    const command = mobileInput.trim();
    // Echo the prompt + typed command into the scrollback, then a newline,
    // so the history reads like a real session before the output lands.
    term.write('\r\x1b[K');
    writePrompt(term);
    term.writeln(command);

    if (command) {
      processCommand(command);
      recordHistory(command);
      historyIndexRef.current = historyRef.current.length;
    } else {
      writePrompt(term);
    }
    setMobileInput('');
    // Keep focus so the keyboard stays up for the next command.
    mobileInputRef.current?.focus();
  };

  return (
    <motion.div 
      className="w-full h-full rounded-md overflow-hidden border border-green-500 shadow-lg shadow-green-500/20 flex flex-col relative terminal-container"
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
        // Tapping the output focuses the native input on touch screens (so
        // the keyboard comes up and captures input), or xterm on desktop.
        onClick={() => {
          if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
            focusTerminal();
          } else {
            mobileInputRef.current?.focus();
          }
        }}
        style={{ maxHeight: '100%', overflowY: 'auto' }}
      />

      {/* Native mobile command bar. xterm cannot reliably take keyboard
          input on phones, so on touch widths a real input drives the
          terminal: tap it to type, Run or Enter submits. Hidden on desktop
          (md+), where xterm handles the physical keyboard. */}
      <form
        className="md:hidden flex items-center gap-2 border-t border-green-500/40 bg-black px-2 py-2"
        onSubmit={(e) => {
          e.preventDefault();
          submitMobileCommand();
        }}
      >
        <span className="font-mono text-green-400 text-base select-none" aria-hidden>&gt;</span>
        <input
          ref={mobileInputRef}
          type="text"
          inputMode="text"
          enterKeyHint="send"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          value={mobileInput}
          onChange={(e) => setMobileInput(e.target.value)}
          placeholder="type a command, e.g. help"
          aria-label="Terminal command input"
          // 16px font so iOS does not auto-zoom the page on focus.
          className="flex-1 min-w-0 bg-transparent text-green-300 placeholder:text-green-700 font-mono outline-none"
          style={{ fontSize: '16px' }}
        />
        <button
          type="submit"
          aria-label="Run command"
          className="shrink-0 rounded-md bg-green-600 px-4 py-2 font-mono text-sm font-bold text-white active:bg-green-500"
        >
          Run
        </button>
      </form>

      {/* Add some CSS for the pulse animation, terminal links, and glowing effect */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(51, 255, 51, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(51, 255, 51, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(51, 255, 51, 0); }
        }
        
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(51, 255, 51, 0.5), 0 0 10px rgba(51, 255, 51, 0.3); }
          50% { box-shadow: 0 0 10px rgba(51, 255, 51, 0.8), 0 0 20px rgba(51, 255, 51, 0.5); }
          100% { box-shadow: 0 0 5px rgba(51, 255, 51, 0.5), 0 0 10px rgba(51, 255, 51, 0.3); }
        }
        
        .pulse-animation {
          animation: pulse 1s infinite;
        }
        
        :global(.terminal-container) {
          animation: glow 3s infinite ease-in-out;
          border: 1px solid #33ff33 !important;
        }
        
        :global(.terminal-link-overlay) {
          position: absolute;
          z-index: 10;
          cursor: pointer;
          text-decoration: none;
          border-bottom: 1px dotted #33ff33;
        }
        
        :global(.terminal-link-overlay:hover) {
          background-color: rgba(51, 255, 51, 0.1);
          text-decoration: underline;
        }
      `}</style>
    </motion.div>
  );
};

export default Terminal;
