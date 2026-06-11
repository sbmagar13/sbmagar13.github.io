import type { Metadata } from "next";

export const metadata: Metadata = {
  // Absolute title so the root layout's "%s | Sagar Budhathoki" template
  // doesn't double up the name.
  title: { absolute: "Terminal · Sagar Budhathoki" },
  description:
    "Interactive terminal view of Sagar Budhathoki's DevOps portfolio. Type help and explore from the command line.",
  alternates: { canonical: "/terminal" },
};

export default function TerminalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
