import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { IDENTITY } from '@/data/career';
import { SITE_URL, PERSON_ID, breadcrumb } from '@/lib/seo';

// Every career fact in this writeup comes from src/data/career.ts
// (the aws war story, the reliability rack, and the 2024 milestone).
// The connective prose around them is structural, not new claims.

const TITLE = 'Redis KEYS and the 19-minute outage';
const DESCRIPTION =
  'Sagar Budhathoki postmortem: a 19-minute production outage from blocking Redis KEYS calls exhausting the JDBC thread pool, and the 68-task reliability fix.';
const CANONICAL = '/writing/redis-keys-outage';
const PUBLISHED = '2026-06-11';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    publishedTime: PUBLISHED,
    authors: [IDENTITY.links.site],
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  // Reference the Person node from the root layout by @id rather than
  // redeclaring identity here, so the author resolves to the one canonical
  // Person and nothing is duplicated.
  author: { '@id': PERSON_ID },
  mainEntityOfPage: `${IDENTITY.links.site}${CANONICAL}/`,
  url: `${IDENTITY.links.site}${CANONICAL}/`,
};

// Breadcrumb: Home -> the post. There is no /writing index page, so we skip a
// dead middle crumb and point the second crumb straight at this article rather
// than inventing a /writing URL that would 404.
const BREADCRUMB_JSON_LD = breadcrumb([
  { name: 'Home', url: `${SITE_URL}/` },
  { name: TITLE, url: `${SITE_URL}${CANONICAL}/` },
]);

function TopNav() {
  return (
    <header className="border-b border-slate-800/80">
      <nav className="mx-auto flex max-w-3xl flex-wrap items-baseline gap-x-5 gap-y-2 px-6 py-4 font-mono text-xs tracking-wide">
        <Link href="/" className="text-slate-100 transition-colors hover:text-cyan-300">
          sagar budhathoki
        </Link>
        <span aria-hidden className="text-slate-700">·</span>
        <Link href="/work" className="text-slate-400 transition-colors hover:text-cyan-300">
          /work
        </Link>
        <Link href="/writing/redis-keys-outage" className="text-cyan-300">
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

function ArticleSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

export default function RedisKeysOutagePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }}
      />
      <TopNav />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <article>
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-purple-300/80">
              Postmortem · 2024 · production
            </p>
            <h1 className="mt-3 font-mono text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {TITLE}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              A 19-minute full-platform outage, traced to blocking Redis KEYS calls exhausting the
              Tomcat/JDBC thread pool. What happened, what fixed it, and the reliability program
              that followed.
            </p>
            <p className="mt-3 font-mono text-xs text-slate-500">
              Aurora · Redis · JDBC · Postmortem · SLOs
            </p>
          </header>

          <ArticleSection title="Context">
            <p>
              The platform is a Swedish multi-tenant event-management SaaS with customers across
              Europe: ECS Fargate services behind ALB, Aurora PostgreSQL with schema-per-tenant,
              ElastiCache Redis, Amazon MQ, and tenant routing via a DynamoDB registry. I run it
              as sole platform owner, so the person diagnosing this outage and the person
              accountable for the platform were the same person.
            </p>
          </ArticleSection>

          <ArticleSection title="Impact">
            <p>
              In 2024 the platform took a 19-minute full-platform outage in production. Not one
              slow endpoint, not one degraded tenant: the whole platform, for 19 minutes.
            </p>
          </ArticleSection>

          <ArticleSection title="Root cause">
            <p>
              The trigger was blocking Redis KEYS calls. KEYS is a blocking, full-keyspace scan,
              so every caller behind one waits until it finishes. Those waits backed up into the
              application tier and exhausted the Tomcat/JDBC thread pool: requests held threads
              while they waited, new requests found no threads left, and the platform stopped
              answering.
            </p>
          </ArticleSection>

          <ArticleSection title="Resolution">
            <p>
              Two fixes went in: connection-pool checkout timeouts, so a request that cannot get a
              connection fails fast instead of holding a thread indefinitely, and tuned RDS
              parameters.
            </p>
          </ArticleSection>

          <ArticleSection title="Follow-through">
            <p>
              The incident fix was the small part. From the postmortem I drove a 68-task
              reliability program across 11 epics and 7 sprints to prevent recurrence.
            </p>
          </ArticleSection>

          <ArticleSection title="Lessons">
            <ul className="list-disc space-y-3 pl-5">
              <li>
                A cache is a production dependency, not a side detail. One blocking command
                pattern in Redis was enough to take the whole platform down.
              </li>
              <li>
                Bound every wait. The durable part of the fix was timeouts at the connection-pool
                checkout boundary: a slow dependency should fail one request, not absorb the
                entire thread pool.
              </li>
              <li>
                The fix is not the postmortem. Preventing recurrence took a structured program
                (68 tasks, 11 epics, 7 sprints), not a single patch.
              </li>
            </ul>
            <p className="font-mono text-xs text-slate-500">
              Every fact above (the 19 minutes, the KEYS calls, the thread pool, the 68 tasks)
              comes from the same data file that drives the rest of this site.
            </p>
          </ArticleSection>

          <footer className="mt-12 rounded-md border border-slate-800 bg-slate-900/40 p-5">
            <p className="font-mono text-sm text-white">{IDENTITY.name}</p>
            <p className="mt-1 font-mono text-xs text-slate-400">{IDENTITY.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Sole owner of the platform in this story. The plain-text career surface is at{' '}
              <Link
                href="/work"
                className="text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
              >
                /work
              </Link>
              , and the interactive version lives at{' '}
              <Link
                href="/"
                className="text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
              >
                sagarbudhathoki.com
              </Link>
              .
            </p>
          </footer>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
