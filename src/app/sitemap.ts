import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://sagarbudhathoki.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-06-11");
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/work/`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/writing/redis-keys-outage/`, lastModified, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/resume/`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/terminal/`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/colophon/`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
