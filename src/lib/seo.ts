// =============================================================================
// SEO · structured-data builders for the server-rendered sub-pages
//
// Server-safe, no 'use client'. Every export returns a plain JS object that a
// page JSON.stringifies into a <script type="application/ld+json"> tag, the
// same pattern the root layout uses for its Person + WebSite graph.
//
// These builders are ADDITIVE. They never redeclare the Person node; where a
// page wants to point at Sagar, it references PERSON_ID (@id) instead.
// No JSX, no React, pure data.
// =============================================================================

// Mirror the SITE_URL convention from src/app/layout.tsx so absolute URLs in
// the schema match the canonical origin exactly.
export const SITE_URL = 'https://sagarbudhathoki.com';

// Stable @id of the Person node declared once in the root layout. Reference
// this from page-level schema instead of redeclaring identity.
export const PERSON_ID = `${SITE_URL}/#person`;

export interface BreadcrumbItem {
  name: string;
  url: string;
}

// A BreadcrumbList with 1-based itemListElement positions. `url` values are
// passed through verbatim, so callers decide absolute vs path-relative; the
// pages here pass absolute SITE_URL-prefixed URLs.
export function breadcrumb(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface FaqQA {
  question: string;
  answer: string;
}

// An FAQPage whose mainEntity is a list of Question nodes, each with a single
// acceptedAnswer. Google has scaled back FAQ rich results, so this is mainly
// for semantic clarity and AI-search ingestion, not guaranteed rich snippets.
export function faqPage(qa: FaqQA[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  };
}
