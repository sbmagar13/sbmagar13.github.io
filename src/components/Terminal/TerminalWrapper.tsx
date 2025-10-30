'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import SimpleTerminal from './SimpleTerminal';

// Try to load the advanced terminal, fall back to simple terminal if it fails
const Terminal = dynamic(
  () => import('./Terminal').catch(() => {
    // Fallback to SimpleTerminal if xterm fails to load
    return import('./SimpleTerminal');
  }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-black text-green-500 border border-green-500 rounded-md">
        <div className="text-center">
          <div className="mb-4">Loading terminal...</div>
          <div className="inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    ),
  }
);

interface TerminalWrapperProps {
  initialCommand?: string;
  onCommandExecuted?: (command: string) => void;
}

export default function TerminalWrapper({ initialCommand, onCommandExecuted }: TerminalWrapperProps) {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center bg-black text-green-500 border border-green-500 rounded-md">
        <div className="text-center">
          <div className="mb-4">Loading terminal...</div>
          <div className="inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <Terminal
        initialCommand={initialCommand}
        onCommandExecuted={onCommandExecuted}
      />
    </Suspense>
  );
}