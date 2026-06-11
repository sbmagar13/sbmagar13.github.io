import githubData from '@/data/github.json';

export interface LiveData {
  latestCommit?: { repo: string; message: string; date: string; url: string };
  publicRepos?: number;
  latestPost?: { title: string; url: string; date: string };
  generatedAt: string;
}

// Static import of the bundled seed/built JSON. No fs, no async: client-safe.
// We read it loosely and normalize so a missing or partial field never throws.
const raw = githubData as Partial<LiveData> & Record<string, unknown>;

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/**
 * Returns the bundled live data, typed as LiveData, with safe defaults for any
 * missing field. A commit/post block is only returned when it carries real
 * content (a non-empty message/title), so callers can treat undefined as
 * "nothing to show" rather than rendering empty rows.
 */
export function getLiveData(): LiveData {
  const commitRaw = (raw.latestCommit ?? {}) as Record<string, unknown>;
  const postRaw = (raw.latestPost ?? {}) as Record<string, unknown>;

  const latestCommit = {
    repo: str(commitRaw.repo),
    message: str(commitRaw.message),
    date: str(commitRaw.date),
    url: str(commitRaw.url),
  };

  const latestPost = {
    title: str(postRaw.title),
    url: str(postRaw.url),
    date: str(postRaw.date),
  };

  return {
    latestCommit: latestCommit.message ? latestCommit : undefined,
    publicRepos: num(raw.publicRepos),
    latestPost: latestPost.title ? latestPost : undefined,
    generatedAt: str(raw.generatedAt),
  };
}

/**
 * Honest short relative time, no fake precision. Examples: 'today',
 * 'yesterday', '3 days ago', 'last week', '2 weeks ago', '4 months ago',
 * 'last year', '3 years ago'. Returns '' when the date is missing or invalid.
 */
export function relativeTime(iso?: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const days = Math.floor((Date.now() - then) / 86400000);
  if (days < 0) return 'today';
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks === 1) return 'last week';
  if (weeks < 5) return `${weeks} weeks ago`;

  const months = Math.floor(days / 30);
  if (months === 1) return 'last month';
  if (months < 12) return `${months} months ago`;

  const years = Math.floor(days / 365);
  if (years === 1) return 'last year';
  return `${years} years ago`;
}
