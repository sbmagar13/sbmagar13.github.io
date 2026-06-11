import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://sagarbudhathoki.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sagar Budhathoki | Senior DevOps / SRE Engineer",
    template: "%s | Sagar Budhathoki",
  },
  description:
    "Sagar Budhathoki's portfolio. Senior DevOps / SRE engineer working on Kubernetes, Terraform, CI/CD, observability, and AI agents for ops. Interactive 3D experience with real production war stories, plus a terminal view.",
  keywords: [
    "Sagar Budhathoki",
    "DevOps engineer",
    "Kubernetes",
    "Terraform",
    "CI/CD",
    "platform engineering",
    "site reliability",
    "portfolio",
  ],
  authors: [{ name: "Sagar Budhathoki", url: SITE_URL }],
  creator: "Sagar Budhathoki",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Sagar Budhathoki",
    title: "Sagar Budhathoki | Senior DevOps / SRE Engineer",
    description:
      "Interactive 3D DevOps portfolio. Kubernetes, Terraform, CI/CD, observability, AI agents for ops, real production war stories.",
    images: [{ url: "/og-card.png", width: 1200, height: 630, alt: "Sagar Budhathoki, Senior DevOps / SRE Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sagar Budhathoki | Senior DevOps / SRE Engineer",
    description:
      "Interactive 3D DevOps portfolio. Kubernetes, Terraform, CI/CD, observability, AI agents for ops, real production war stories.",
    images: ["/og-card.png"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon_logo.ico",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* Privacy-light page counter (GoatCounter: no cookies, no PII).
            Register the code 'sbmagar13' at goatcounter.com to activate;
            until then the beacon 404s harmlessly. */}
        <Script
          data-goatcounter="https://sbmagar13.goatcounter.com/count"
          src="https://gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
