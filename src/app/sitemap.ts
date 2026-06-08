import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://sagarbudhathoki.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-06-09");
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/terminal/`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];
}
