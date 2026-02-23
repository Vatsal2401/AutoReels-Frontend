import { SITE_CONFIG } from '@/lib/seo';
import { fetchPseoSitemap } from '@/lib/api/pseo';

export const revalidate = 3600;

const PLAYBOOKS = [
  'templates', 'curation', 'conversions', 'comparisons', 'examples',
  'locations', 'personas', 'integrations', 'glossary', 'translations',
  'directory', 'profiles',
];

export async function generateStaticParams() {
  const params: { playbook: string; page: string }[] = [];
  const MAX_FILES = 15;

  for (const playbook of PLAYBOOKS) {
    for (let i = 1; i <= MAX_FILES; i++) {
      params.push({ playbook, page: String(i) });
    }
  }

  return params;
}

export async function GET(
  _req: Request,
  { params }: { params: { playbook: string; page: string } },
) {
  const { playbook, page } = params;

  if (!PLAYBOOKS.includes(playbook)) {
    return new Response('Not Found', { status: 404 });
  }

  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    return new Response('Not Found', { status: 404 });
  }

  const { pages } = await fetchPseoSitemap(playbook, pageNum, 1000);

  if (pages.length === 0 && pageNum > 1) {
    return new Response('Not Found', { status: 404 });
  }

  const base = SITE_CONFIG.url;

  const urlElements = pages
    .map(
      (p) => `  <url>
    <loc>${base}${p.canonical_path}</loc>
    <lastmod>${p.published_at ? new Date(p.published_at).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
    )
    .join('\n');

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
