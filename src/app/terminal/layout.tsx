import type { Metadata } from "next";

export const metadata: Metadata = {
  // Absolute title so the root layout's "%s | Sagar Budhathoki" template
  // doesn't double up the name.
  title: { absolute: "Terminal · Sagar Budhathoki" },
  description:
    "Interactive terminal view of Sagar Budhathoki's DevOps portfolio. Type help and explore from the command line.",
  alternates: { canonical: "/terminal" },
};

// No route-level viewport override here: this route inherits the root
// layout's device-width viewport. An earlier version forced a 980px
// desktop-scaled viewport ("looks like PC, smaller"), but that scaled
// layout fought the phone soft keyboard: focusing the terminal zoomed
// and scrolled the page and it never settled back. A real terminal needs
// real typing, so device-width wins here. The terminal renders its mobile
// layout (40 cols, 12px) and the keyboard behaves natively.

export default function TerminalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
