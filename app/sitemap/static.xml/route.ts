import { SITE_CONFIG } from '@/lib/seo';

export const revalidate = 3600;

const STATIC_URLS = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/features', priority: '0.9', changefreq: 'monthly' },
  { path: '/for-youtube', priority: '0.85', changefreq: 'monthly' },
  { path: '/for-instagram', priority: '0.85', changefreq: 'monthly' },
  { path: '/for-tiktok', priority: '0.85', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog/how-to-create-faceless-videos-ai-2026', priority: '0.75', changefreq: 'monthly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
  { path: '/terms', priority: '0.5', changefreq: 'yearly' },
];

export async function GET() {
  const base = SITE_CONFIG.url;
  const now = new Date().toISOString();

  const urlElements = STATIC_URLS.map(
    ({ path, priority, changefreq }) => `  <url>
    <loc>${base}${path === '/' ? '' : path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
    },
  });
}
