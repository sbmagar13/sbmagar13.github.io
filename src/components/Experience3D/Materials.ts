// Shared palette and material recipes for the cinematic /experience3d.
// One place to retune the whole look.

export const PALETTE = {
  // Background gradient (bottom → top), cold data-center void.
  voidA: '#020617', // near-black, slate-950
  voidB: '#0b132b', // deep navy
  voidC: '#1a1240', // dark indigo

  // Surfaces.
  steel: '#1f2937',
  steelDark: '#0f172a',
  rubber: '#0a0a0a',
  glassEdge: '#0ea5e9',

  // Accent neons.
  neonCyan: '#22d3ee',
  neonBlue: '#3b82f6',
  neonMagenta: '#d946ef',
  neonPurple: '#a855f7',

  // Status LEDs.
  ledGreen: '#22c55e',
  ledAmber: '#f59e0b',
  ledBlue: '#3b82f6',
  ledRed: '#ef4444',
  ledWhite: '#f1f5f9',
} as const;

// Pick a status color from a string label.
export function statusColor(s: string): string {
  switch (s.toLowerCase()) {
    case 'running':
      return PALETTE.ledGreen;
    case 'maintenance':
      return PALETTE.ledAmber;
    case 'in progress':
      return PALETTE.ledBlue;
    case 'completed':
      return PALETTE.ledWhite;
    default:
      return PALETTE.ledBlue;
  }
}
