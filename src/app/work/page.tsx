import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  IDENTITY,
  MILESTONES,
  realProjects,
  warStories,
  skillsByCategory,
  type Category,
} from '@/data/career';
import { askSite, SAMPLE_QUESTIONS } from '@/lib/ask';
import { SITE_URL, PERSON_ID, breadcrumb, faqPage } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Sagar Budhathoki, Senior DevOps / SRE Engineer: production work, war stories, milestones, and full skills. Sole owner of a multi-tenant SaaS on AWS.',
  alternates: { canonical: '/work/' },
};

// ProfilePage JSON-LD: ties this page to the Person node the root
// layout declares (same @id), instead of redeclaring the person here.
const PROFILE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  dateModified: '2026-06-12',
  mainEntity: { '@id': PERSON_ID },
};

// Breadcrumb: Home -> Work. Additive, does not touch the Person node.
const BREADCRUMB_JSON_LD = breadcrumb([
  { name: 'Home', url: `${SITE_URL}/` },
  { name: 'Work', url: `${SITE_URL}/work/` },
]);

// Strip any non-ASCII (e.g. the middot the site uses elsewhere) so the FAQ
// answer text stays clean printable ASCII, then collapse whitespace.
function asciiClean(text: string): string {
  return text
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// FAQPage built at build time from the real ask engine: each sample recruiter
// question is answered by askSite (grounded in career.ts), so the structured
// Q&A is authentic, not invented. Google has scaled back FAQ rich results, so
// this is for semantic clarity and AI-search ingestion, not guaranteed
// snippets.
const FAQ_JSON_LD = faqPage(
  SAMPLE_QUESTIONS.map((question) => ({
    question,
    answer: asciiClean(askSite(question).answer),
  })),
);

// Display labels for the skill groups. The category ids and the skills
// themselves live in src/data/career.ts; only neutral headings live here.
const CATEGORY_LABELS: Record<Category, string> = {
  infrastructure: 'Infrastructure',
  cicd: 'CI/CD',
  cloud: 'Cloud',
  database: 'Databases',
  monitoring: 'Monitoring',
  development: 'Development',
  security: 'Security',
  'ai-ml': 'AI / ML',
  os: 'Operating Systems',
  misc: 'Misc',
};

function TopNav() {
  return (
    <header className="border-b border-slate-800/80">
      <nav className="mx-auto flex max-w-3xl flex-wrap items-baseline gap-x-5 gap-y-2 px-6 py-4 font-mono text-xs tracking-wide">
        <Link href="/" className="text-slate-100 transition-colors hover:text-cyan-300">
          sagar budhathoki
        </Link>
        <span aria-hidden className="text-slate-700">·</span>
        <Link href="/work" className="text-cyan-300">/work</Link>
        <Link href="/writing/redis-keys-outage" className="text-slate-400 transition-colors hover:text-cyan-300">
          /writing
        </Link>
        <Link href="/colophon" className="text-slate-400 transition-colors hover:text-cyan-300">
          /colophon
        </Link>
        <Link href="/terminal" className="text-slate-400 transition-colors hover:text-cyan-300">
          /terminal
        </Link>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-800/80">
      <div className="mx-auto flex max-w-3xl flex-wrap items-baseline gap-x-5 gap-y-2 px-6 py-6 font-mono text-xs">
        <a
          href={IDENTITY.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 transition-colors hover:text-cyan-300"
        >
          GitHub
        </a>
        <a
          href={IDENTITY.links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 transition-colors hover:text-cyan-300"
        >
          LinkedIn
        </a>
        <a
          href={IDENTITY.links.blog}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 transition-colors hover:text-cyan-300"
        >
          Blog
        </a>
        <a href={`mailto:${IDENTITY.email}`} className="text-slate-400 transition-colors hover:text-cyan-300">
          Email
        </a>
        <span className="ml-auto text-slate-600">sagarbudhathoki.com</span>
      </div>
    </footer>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function WorkPage() {
  const projects = realProjects();
  const stories = warStories();
  const groups = skillsByCategory();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PROFILE_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <TopNav />

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Header: every line is an IDENTITY string, verbatim. */}
        <section>
          <h1 className="font-mono text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {IDENTITY.name}
          </h1>
          <p className="mt-2 font-mono text-sm text-cyan-300">{IDENTITY.title}</p>
          <p className="mt-1 font-mono text-xs text-slate-400">
            {IDENTITY.yearsLabel} · {IDENTITY.location}
          </p>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-slate-500">
            {IDENTITY.tagline}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs">
            <a
              href="/resume.pdf"
              className="text-emerald-300 underline underline-offset-4 transition-colors hover:text-emerald-200"
            >
              resume.pdf
            </a>
            <Link
              href="/"
              className="text-purple-300 underline underline-offset-4 transition-colors hover:text-purple-200"
            >
              interactive version
            </Link>
          </div>
        </section>

        <Section title="Selected work">
          <div className="space-y-5">
            {projects.map((p) => (
              <article key={p.id} className="rounded-md border border-slate-800 bg-slate-900/40 p-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-mono text-base text-white">{p.label}</h3>
                  <span className="font-mono text-xs text-slate-500">{p.sublabel}</span>
                  <span className="ml-auto rounded border border-cyan-500/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan-300/90">
                    {p.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed">{p.description}</p>
                {p.metrics ? (
                  <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs">
                    {p.metrics.map((m) => (
                      <div key={m.label} className="flex gap-2">
                        <dt className="uppercase tracking-wider text-slate-500">{m.label}</dt>
                        <dd className="text-slate-300">{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <p className="mt-3 font-mono text-xs text-slate-400">{p.tech.join(' · ')}</p>
                {p.github ? (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-mono text-xs text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
                  >
                    {p.github.replace('https://', '')}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </Section>

        <Section title="War stories">
          <div className="space-y-5">
            {stories.map((s) => (
              <article key={s.id} className="border-l-2 border-purple-500/40 pl-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-mono text-sm text-white">{s.title}</h3>
                  <span className="font-mono text-xs text-slate-500">{s.when}</span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-purple-300/80">
                  {s.tool}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{s.body}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Journey">
          <ol className="space-y-5">
            {MILESTONES.map((m) => (
              <li key={m.year} className="border-l-2 border-cyan-500/40 pl-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-sm text-cyan-300">{m.year}</span>
                  <h3 className="font-mono text-sm text-white">{m.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{m.description}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Skills">
          <div className="space-y-4">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => {
              const skills = groups[cat];
              if (!skills.length) return null;
              return (
                <div key={cat}>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400">
                    {CATEGORY_LABELS[cat]}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">
                    {skills.map((s) => `${s.name} (${s.years}y)`).join(', ')}
                  </p>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Contact">
          <ul className="space-y-2 font-mono text-sm">
            <li>
              <span className="text-slate-500">email · </span>
              <a
                href={`mailto:${IDENTITY.email}`}
                className="text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
              >
                {IDENTITY.email}
              </a>
            </li>
            <li>
              <span className="text-slate-500">github · </span>
              <a
                href={IDENTITY.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
              >
                {IDENTITY.links.github.replace('https://', '')}
              </a>
            </li>
            <li>
              <span className="text-slate-500">linkedin · </span>
              <a
                href={IDENTITY.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
              >
                {IDENTITY.links.linkedin.replace('https://', '')}
              </a>
            </li>
            <li>
              <span className="text-slate-500">blog · </span>
              <a
                href={IDENTITY.links.blog}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
              >
                {IDENTITY.links.blog.replace('https://', '')}
              </a>
            </li>
            <li>
              <span className="text-slate-500">resume · </span>
              <a
                href="/resume.pdf"
                className="text-emerald-300 underline underline-offset-4 transition-colors hover:text-emerald-200"
              >
                /resume.pdf
              </a>
            </li>
          </ul>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
