import { getAllBlogPosts } from '@/lib/blog';

// Configure for static export
export const dynamic = 'force-static';

const SITE_URL = 'https://sagarbudhathoki.com';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = getAllBlogPosts();

  const items = posts
    .map(post => {
      const pubDate = new Date(post.date).toUTCString();
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${SITE_URL}/</link>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <guid isPermaLink="false">${escapeXml(post.slug)}</guid>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml('DevOps Runbooks & Insights')}</title>`,
    `    <link>${SITE_URL}/</link>`,
    `    <description>${escapeXml('Technical articles, guides, and thoughts on DevOps, infrastructure, and software development.')}</description>`,
    '    <language>en</language>',
    `    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />`,
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
