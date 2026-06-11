import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404',
  description: 'No such file or directory.',
};

// Server-component 404: a static export can't know which path was
// requested, so the shell line cats a stand-in filename instead.
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 font-mono">
      <div className="w-full max-w-xl">
        <p className="text-sm">
          <span className="text-green-500">sagar@web</span>
          <span className="text-slate-500">:</span>
          <span className="text-blue-400">~</span>
          <span className="text-slate-500">$ </span>
          <span className="text-green-300">cat ./the-page-you-wanted</span>
        </p>
        <p className="mt-2 text-sm text-red-400">
          cat: ./the-page-you-wanted: No such file or directory
        </p>

        <p className="mt-8 text-xs uppercase tracking-widest text-amber-300">
          HTTP 404: Resource Not Found
        </p>
        <div className="mt-3 text-sm leading-relaxed text-green-300">
          <p>The page you&apos;re looking for has been:</p>
          <ul className="mt-2 space-y-1 text-green-400/90">
            <li>a) Containerized and shipped to another environment</li>
            <li>b) Load balanced into oblivion</li>
            <li>c) Scaled to zero instances</li>
            <li>d) Trapped in a Kubernetes Init Container loop</li>
          </ul>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Troubleshooting: check your DNS configuration (it&apos;s always DNS).
        </p>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href="/"
            className="text-green-400 underline underline-offset-4 transition-colors hover:text-green-200"
          >
            cd /
          </Link>
          <Link
            href="/work"
            className="text-green-400 underline underline-offset-4 transition-colors hover:text-green-200"
          >
            cd /work
          </Link>
        </div>
      </div>
    </div>
  );
}
