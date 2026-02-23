const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface PseoPageData {
  id: string;
  slug: string;
  canonical_path: string;
  playbook: string;
  status: string;
  title: string;
  meta_description: string;
  keywords: string[];
  content: Record<string, any>;
  seed_params: Record<string, string>;
  related_paths: string[];
  word_count: number | null;
  quality_score: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SitemapEntry {
  canonical_path: string;
  published_at: string;
}

/**
 * Fetch a single published pSEO page by its canonical path.
 * Returns null if the page is not found or not published.
 */
export async function fetchPseoPage(path: string): Promise<PseoPageData | null> {
  try {
    const res = await fetch(
      `${API_URL}/pseo/page?path=${encodeURIComponent(path)}`,
      {
        next: { revalidate: 86400 },
      },
    );

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch page titles for an array of canonical paths.
 * Used by PseoRelatedLinks to render link cards.
 */
export async function fetchPseoTitles(
  paths: string[],
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  await Promise.allSettled(
    paths.map(async (path) => {
      const page = await fetchPseoPage(path);
      if (page) results[path] = page.title;
    }),
  );

  return results;
}

/**
 * Fetch paginated sitemap entries for a playbook.
 */
export async function fetchPseoSitemap(
  playbook: string,
  page = 1,
  limit = 1000,
): Promise<{ pages: SitemapEntry[]; total: number }> {
  try {
    const res = await fetch(
      `${API_URL}/pseo/sitemap?playbook=${playbook}&page=${page}&limit=${limit}`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) return { pages: [], total: 0 };
    return res.json();
  } catch {
    return { pages: [], total: 0 };
  }
}
