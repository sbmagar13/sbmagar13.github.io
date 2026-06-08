'use client';

import { useEffect, useState } from 'react';

interface Props {
  text: string;
  /** Average ms per character. */
  speed?: number;
  /** Delay before typing begins. */
  delay?: number;
  /** Add a blinking caret while typing (and a short pause after). */
  caret?: boolean;
  /** Extra Tailwind classes on the wrapper span. */
  className?: string;
}

/**
 * Types a string out one character at a time with a touch of timing
 * jitter so it reads like a real terminal rather than a metronome.
 * Re-runs whenever the input `text` changes (so it animates fresh when
 * you switch sections).
 */
export default function Typewriter({
  text,
  speed = 35,
  delay = 0,
  caret = true,
  className = '',
}: Props) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown('');
    setDone(false);
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        return;
      }
      // Small per-char jitter (0.6x..1.4x base speed) for natural rhythm.
      const next = speed * (0.6 + Math.random() * 0.8);
      setTimeout(tick, next);
    };
    const id = setTimeout(tick, delay);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {shown}
      {caret ? (
        <span
          aria-hidden
          className={`inline-block w-[0.6em] h-[1em] align-[-0.15em] ml-0.5 bg-current ${
            done ? 'animate-pulse opacity-50' : ''
          }`}
        />
      ) : null}
    </span>
  );
}
