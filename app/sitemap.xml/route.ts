import { SITE_CONFIG } from '@/lib/seo';

export const revalidate = 3600; // rebuild every hour — v2

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const PLAYBOOKS = [
  'templates', 'curation', 'conversions', 'comparisons', 'examples',
  'locations', 'personas', 'integrations', 'glossary', 'translations',
  'directory', 'profiles',
] as const;

const URLS_PER_FILE = 1000;

/**
 * Fetch published page counts per playbook from the backend.
 * Returns a map of playbook → count (only playbooks with published pages).
 */
async function getPublishedCounts(): Promise<Record<string, number>> {
  try {
    const res = await fetch(`${API_URL}/pseo/published-counts`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export async function GET() {
  const base = SITE_CONFIG.url;
  const counts = await getPublishedCounts();

  const entries: string[] = [];

  // Static pages sitemap
  entries.push(`  <sitemap>\n    <loc>${base}/sitemap/static.xml</loc>\n  </sitemap>`);

  // One sub-sitemap entry per 1000 published pages per playbook
  for (const playbook of PLAYBOOKS) {
    const total = counts[playbook] ?? 0;
    if (total === 0) continue; // skip playbooks with no published pages

    const numFiles = Math.ceil(total / URLS_PER_FILE);
    for (let i = 1; i <= numFiles; i++) {
      entries.push(
        `  <sitemap>\n    <loc>${base}/sitemap/${playbook}/${i}</loc>\n  </sitemap>`,
      );
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
    },
  });
}
