import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  // Absolute title so the root layout's "%s | Sagar Budhathoki" template
  // doesn't double up the name.
  title: { absolute: "Terminal · Sagar Budhathoki" },
  description:
    "Interactive terminal view of Sagar Budhathoki's DevOps portfolio. Type help and explore from the command line.",
  alternates: { canonical: "/terminal" },
};

// Fixed-width layout viewport: phones render the same 980px desktop layout
// scaled down to fit, instead of a reflowed mobile layout. initialScale is
// explicitly undefined (not just omitted) because Next.js shallow-merges
// viewport exports per key, and inheriting initialScale: 1 from the root
// layout would stop browsers from computing the fit-to-width scale.
export const viewport: Viewport = {
  width: "980",
  initialScale: undefined,
  userScalable: true,
  maximumScale: 5,
  themeColor: "#0a0a0a",
};

export default function TerminalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
