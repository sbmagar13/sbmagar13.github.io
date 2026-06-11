/**
 * Discovery system.
 *
 * Replaces the old scene-visit achievement toasts. Scene visits are just
 * navigation, so they got removed. These six rewards are for genuine
 * curiosity: poking at the terminal, finding the secret code, asking the
 * site a question, letting the autopilot run to the end.
 *
 * The shape (id, title, detail) is intentionally compatible with the
 * Achievements toast (src/components/Experience3D/Achievements.tsx), so a
 * freshly unlocked Discovery can be handed straight to that component.
 *
 * Pure TS, SSR-safe. Everything that touches localStorage guards on
 * `typeof window` and wraps access in try/catch for private-mode browsers.
 */

export interface Discovery {
  id: string;
  title: string;
  detail: string;
}

const STORAGE_KEY = 'sb_discoveries';

/**
 * The catalog. Exactly these six, no scene-visits. Titles are short and a
 * little smug, details are one honest line each.
 */
export const DISCOVERIES: Record<string, Discovery> = {
  konami: {
    id: 'konami',
    title: 'Up Up Down Down',
    detail: 'You typed the Konami code. Some habits never leave us.',
  },
  'vim-escape': {
    id: 'vim-escape',
    title: 'You Escaped Vim',
    detail: 'Found your way out of the vim trap. More than most can say.',
  },
  tour: {
    id: 'tour',
    title: 'Took the Tour',
    detail: 'You ran the guided terminal tour instead of guessing.',
  },
  chaos: {
    id: 'chaos',
    title: 'Chaos Engineer',
    detail: 'You ran the chaos command and watched things break on purpose.',
  },
  ask: {
    id: 'ask',
    title: 'You Asked',
    detail: 'You asked the site a question. Curiosity counts here.',
  },
  autopilot: {
    id: 'autopilot',
    title: 'Hands Off the Wheel',
    detail: 'You watched the full autopilot tour of the 3D site, start to finish.',
  },
};

/** Read the raw stored id list. Returns [] on SSR or any storage failure. */
function readStore(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Keep only known, string ids so a corrupted store can't poison callers.
    return parsed.filter(
      (id): id is string => typeof id === 'string' && id in DISCOVERIES,
    );
  } catch {
    return [];
  }
}

/** Persist the id list. Silently no-ops on SSR or storage failure. */
function writeStore(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // private mode or quota: discoveries just won't persist, that's fine
  }
}

/**
 * Unlock a discovery by id.
 *
 * Returns the Discovery only when it was NEWLY unlocked, so the caller can
 * fire a one-time toast. Returns null for unknown ids or ones already found.
 */
export function unlockDiscovery(id: string): Discovery | null {
  const discovery = DISCOVERIES[id];
  if (!discovery) return null;

  const unlocked = readStore();
  if (unlocked.includes(id)) return null;

  writeStore([...unlocked, id]);
  return discovery;
}

/** All currently unlocked discovery ids. */
export function getUnlocked(): string[] {
  return readStore();
}

/** Progress as { found, total }. */
export function discoveryProgress(): { found: number; total: number } {
  return {
    found: readStore().length,
    total: Object.keys(DISCOVERIES).length,
  };
}
