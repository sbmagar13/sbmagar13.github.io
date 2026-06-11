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

// JSON-LD identity graph, rendered once in the root layout so every
// page carries it. The Person node has a stable @id that other pages
// (e.g. /work's ProfilePage) reference instead of redeclaring it.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Sagar Budhathoki",
      alternateName: ["sbmagar13", "Sagar Budhathoki Magar"],
      jobTitle: "Senior DevOps / SRE Engineer",
      url: SITE_URL,
      image: `${SITE_URL}/og-card.png`,
      email: "mailto:sagar@sagarbudhathoki.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kathmandu",
        addressCountry: "NP",
      },
      sameAs: [
        "https://github.com/sbmagar13",
        "https://linkedin.com/in/sbmagar13",
        "https://blog.budhathokisagar.com.np",
        "https://stackoverflow.com/users/10819100",
        "https://twitter.com/s_agarm_agar",
      ],
      knowsAbout: [
        "DevOps",
        "Site Reliability Engineering",
        "Kubernetes",
        "Terraform",
        "AWS",
        "Python",
        "AI agents",
      ],
    },
    {
      "@type": "WebSite",
      name: "Sagar Budhathoki",
      alternateName: "sagar.sh",
      url: SITE_URL,
    },
  ],
};

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
    "Sagar Budhathoki Nepal",
    "sbmagar13",
    "SRE engineer Nepal",
    "AI agents DevOps",
  ],
  authors: [{ name: "Sagar Budhathoki", url: SITE_URL }],
  creator: "Sagar Budhathoki",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_US",
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
    icon: [
      { url: "/favicon_logo.ico", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
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
