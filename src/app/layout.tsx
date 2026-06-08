import type { Metadata } from "next";
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
    default: "Sagar Budhathoki | DevOps Engineer",
    template: "%s | Sagar Budhathoki",
  },
  description:
    "Sagar Budhathoki's portfolio. DevOps engineer working on Kubernetes, Terraform, CI/CD, observability, and platform engineering. Terminal-driven site with project case studies and a blog.",
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
    title: "Sagar Budhathoki | DevOps Engineer",
    description:
      "Terminal-driven DevOps portfolio. Kubernetes, Terraform, CI/CD, observability, platform work.",
    images: [{ url: "/sagar-mountains.jpg", width: 1200, height: 630, alt: "Sagar Budhathoki" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sagar Budhathoki | DevOps Engineer",
    description:
      "Terminal-driven DevOps portfolio. Kubernetes, Terraform, CI/CD, observability, platform work.",
    images: ["/sagar-mountains.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon_logo.ico",
    apple: "/file.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
