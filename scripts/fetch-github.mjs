// Build-time data fetch for the portfolio's "live" widgets.
//
// Pulls public GitHub stats (repo count + most recent push) for sbmagar13 and
// the newest blog post from content/blog/*.md frontmatter, then writes
// src/data/github.json so the app can import it statically (no runtime network).
//
// ROBUSTNESS: every network call is wrapped in try/catch. On ANY failure we
// keep whatever is already in src/data/github.json (read first, merge), print a
// warning, and never throw or write empty over good data. We always exit 0 so a
// flaky network can never break the build.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'src', 'data', 'github.json');
const BLOG_DIR = path.join(ROOT, 'content', 'blog');

const GH_USER = 'sbmagar13';
const BLOG_BASE = 'https://blog.budhathokisagar.com.np';
const REQUEST_TIMEOUT_MS = 8000;

function warn(message) {
  console.warn(`[fetch-github] ${message}`);
}

function readExisting() {
  try {
    const text = fs.readFileSync(OUT_PATH, 'utf8');
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'brain-portfolio-build',
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Parse the YAML-ish frontmatter block. We only need title (string) and date
// (string). Values may be quoted with single or double quotes.
function parseFrontmatter(text) {
  const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const out = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[kv[1]] = value;
  }
  return out;
}

function findLatestPost() {
  try {
    const files = fs
      .readdirSync(BLOG_DIR)
      .filter((file) => file.endsWith('.md'));

    let best = null;
    for (const file of files) {
      const slug = file.replace(/\.md$/, '');
      const fm = parseFrontmatter(fs.readFileSync(path.join(BLOG_DIR, file), 'utf8'));
      if (!fm.title || !fm.date) continue;
      const time = new Date(fm.date).getTime();
      if (Number.isNaN(time)) continue;
      if (!best || time > best.time) {
        best = { title: fm.title, date: fm.date, slug, time };
      }
    }

    if (!best) return null;
    return {
      title: best.title,
      date: best.date,
      url: `${BLOG_BASE}/${best.slug}`,
    };
  } catch (error) {
    warn(`could not read blog frontmatter: ${error.message}`);
    return null;
  }
}

async function fetchPublicRepos() {
  try {
    const user = await fetchJson(`https://api.github.com/users/${GH_USER}`);
    return typeof user.public_repos === 'number' ? user.public_repos : null;
  } catch (error) {
    warn(`could not fetch public repo count: ${error.message}`);
    return null;
  }
}

async function fetchLatestCommit() {
  try {
    const events = await fetchJson(
      `https://api.github.com/users/${GH_USER}/events/public`
    );
    if (!Array.isArray(events)) return null;

    const push = events.find(
      (event) =>
        event &&
        event.type === 'PushEvent' &&
        event.payload &&
        Array.isArray(event.payload.commits) &&
        event.payload.commits.length > 0
    );
    if (!push) return null;

    const commits = push.payload.commits;
    const head = commits[commits.length - 1];
    const repo = push.repo && push.repo.name ? push.repo.name : '';
    const sha = head.sha || '';
    return {
      repo,
      message: head.message || '',
      date: push.created_at || '',
      url: repo && sha ? `https://github.com/${repo}/commit/${sha}` : '',
    };
  } catch (error) {
    warn(`could not fetch latest commit: ${error.message}`);
    return null;
  }
}

async function main() {
  const existing = readExisting();

  // Start from existing good data, overwrite field-by-field only on success.
  const result = {
    latestCommit: existing.latestCommit ?? { repo: '', message: '', date: '', url: '' },
    publicRepos: typeof existing.publicRepos === 'number' ? existing.publicRepos : 0,
    latestPost: existing.latestPost ?? { title: '', url: '', date: '' },
    generatedAt: existing.generatedAt ?? '1970-01-01T00:00:00.000Z',
  };

  const [repos, commit, post] = await Promise.all([
    fetchPublicRepos(),
    fetchLatestCommit(),
    Promise.resolve(findLatestPost()),
  ]);

  if (repos !== null) result.publicRepos = repos;
  if (commit) result.latestCommit = commit;
  if (post) result.latestPost = post;

  // Only stamp generatedAt when we actually wrote something fresh, so a fully
  // failed run leaves the previous timestamp honest.
  if (repos !== null || commit || post) {
    result.generatedAt = new Date().toISOString();
  }

  try {
    fs.writeFileSync(OUT_PATH, `${JSON.stringify(result, null, 2)}\n`);
    console.log(
      `[fetch-github] wrote github.json (repos=${result.publicRepos}, commit=${
        result.latestCommit.message ? 'yes' : 'no'
      }, post=${result.latestPost.title ? 'yes' : 'no'})`
    );
  } catch (error) {
    warn(`could not write ${OUT_PATH}: ${error.message} (keeping existing file)`);
  }
}

main()
  .catch((error) => {
    // Belt and suspenders: nothing above should throw, but if it does we keep
    // the existing file untouched and still exit 0.
    warn(`unexpected failure, keeping existing github.json: ${error.message}`);
  })
  .finally(() => {
    process.exit(0);
  });
