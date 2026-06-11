import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { IDENTITY } from '@/data/career';

export const metadata: Metadata = {
  title: 'Colophon',
  description:
    'How sagarbudhathoki.com is built: Next.js 15 static export on GitHub Pages, React Three Fiber scenes behind a device perf-tier system, an xterm.js terminal with a real command registry, and no backend at all.',
  alternates: { canonical: '/colophon' },
};

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
        <Link href="/writing/redis-keys-outage" className="text-slate-400 transition-colors hover:text-cyan-300">
          /writing
        </Link>
        <Link href="/colophon" className="text-cyan-300">/colophon</Link>
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
    <section className="mt-10">
      <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

export default function ColophonPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <TopNav />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-mono text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Colophon
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          How this site works under the hood. Short version: static files, one data file, and
          deliberate decisions about what runs where.
        </p>

        <Section title="Hosting">
          <p>
            Next.js 15 with the App Router and <code className="font-mono text-cyan-200">output: &apos;export&apos;</code>.
            The build emits plain HTML, CSS and JS, and GitHub Pages serves it. There is no
            server runtime: nothing executes at request time, no SSR, no backend, no database.
            React 19, TypeScript, Tailwind CSS 4. The deploy pipeline is the whole story: next
            build, git push, Pages publishes.
          </p>
        </Section>

        <Section title="The 3D experience">
          <p>
            The home page is five React Three Fiber scenes (hero, avatar, journey, data center,
            skills hall) built on three.js with drei helpers and @react-three/postprocessing. A
            perf-tier hook classifies the device eagerly, before the first frame: narrow viewport
            plus coarse pointer reads as a phone, and hardwareConcurrency / deviceMemory hints
            demote constrained machines when the browser reports them.
          </p>
          <p>
            Low tier (phones): exactly one WebGL canvas mounted at a time, scenes unmount on
            navigation, device pixel ratio capped at 1, postprocessing (bloom, SMAA, the whole
            composer) skipped, particle counts cut, autorotate off. High tier: visited scenes stay
            mounted so switching back is instant, DPR up to 1.75, the full effect chain.
            prefers-reduced-motion is respected on both tiers, and a context guard rebuilds the
            canvas when iOS Safari evicts the WebGL context instead of leaving a black rectangle.
          </p>
        </Section>

        <Section title="The terminal">
          <p>
            <Link
              href="/terminal"
              className="text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
            >
              /terminal
            </Link>{' '}
            is xterm.js wired to a real command registry: help, ls, cat, deploy, incident, uptime
            and the rest are plain functions that return ANSI-colored output. Output stays
            printable ASCII plus ANSI escapes, because fancy block glyphs fall out of the
            monospace font and garble banners.
          </p>
        </Section>

        <Section title="Data">
          <p>
            Every career fact on the site lives in one file,{' '}
            <code className="font-mono text-cyan-200">src/data/career.ts</code>: identity, war
            stories, projects, milestones, skills. The 3D scenes, the plain-text{' '}
            <Link
              href="/work"
              className="text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
            >
              /work
            </Link>{' '}
            page, and the{' '}
            <Link
              href="/writing/redis-keys-outage"
              className="text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
            >
              outage writeup
            </Link>{' '}
            all render from it, so a fact never has to be maintained in two places.
          </p>
        </Section>

        <Section title="Privacy and honest metrics">
          <p>
            No backend means nothing to log you into. The only analytics is GoatCounter, a
            privacy-light page counter: no cookies, no PII. Every number on the site is either
            measured (session uptime counts from your page load, the only honest uptime a static
            site has) or clearly labeled parody.
          </p>
        </Section>

        <Section title="Source">
          <p>
            The whole site, including this page, is open source:{' '}
            <a
              href="https://github.com/sbmagar13/brain-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 underline underline-offset-4 transition-colors hover:text-cyan-200"
            >
              github.com/sbmagar13/brain-portfolio
            </a>
            .
          </p>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
