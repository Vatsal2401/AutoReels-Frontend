import { SITE_CONFIG } from "@/lib/seo";

/**
 * Sitemap index — replaces the static 11-URL sitemap.
 *
 * Returns a sitemap-index pointing to:
 *   /sitemap/static.xml           — original 11 static pages
 *   /sitemap/{playbook}/{page}    — pSEO pages (up to 15 files × 12 playbooks = 180 slots)
 *
 * Each sub-sitemap serves up to 1,000 URLs → 180,000 max pSEO pages covered (Phase 3 target).
 *
 * NOTE: Next.js MetadataRoute.Sitemap does not support sitemap-index natively,
 * so we return raw sitemap-index XML via a route handler instead.
 * This file exports a function that Next.js 14 will call at /sitemap.xml.
 */

const PLAYBOOKS = [
  "templates",
  "curation",
  "conversions",
  "comparisons",
  "examples",
  "locations",
  "personas",
  "integrations",
  "glossary",
  "translations",
  "directory",
  "profiles",
] as const;

const MAX_FILES_PER_PLAYBOOK = 15; // 15 × 1000 URLs = 15k per playbook

export default function sitemap() {
  const base = SITE_CONFIG.url;

  // Static sitemap
  const sitemaps: { url: string }[] = [
    { url: `${base}/sitemap/static.xml` },
  ];

  // pSEO sitemaps per playbook
  for (const playbook of PLAYBOOKS) {
    for (let i = 1; i <= MAX_FILES_PER_PLAYBOOK; i++) {
      sitemaps.push({ url: `${base}/sitemap/${playbook}/${i}` });
    }
  }

  return sitemaps;
}
