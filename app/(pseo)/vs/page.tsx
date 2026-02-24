import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage, type PseoPageData } from '@/lib/api/pseo';
import ComparisonsIndexPage from '@/components/pseo/ComparisonsIndexPage';

export const revalidate = 604800; // 7 days

const FALLBACK_PAGE: PseoPageData = {
  id: 'static-vs-index',
  slug: 'vs-index',
  canonical_path: '/vs',
  playbook: 'comparisons',
  status: 'published',
  title: 'AutoReels vs Competitors — Which AI Video Tool Wins?',
  meta_description:
    'Side-by-side comparisons of AutoReels vs top AI video creators. Features, pricing, and verdict for faceless video creators.',
  keywords: ['AI video comparison', 'autoreels vs invideo', 'autoreels vs canva', 'best ai reel generator'],
  content: {
    intro:
      'Find out how AutoReels stacks up against the top AI video tools. Detailed feature comparisons, pricing breakdowns, and an honest verdict for faceless creators.',
  },
  seed_params: {},
  related_paths: [],
  word_count: null,
  quality_score: null,
  published_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export async function generateMetadata(): Promise<Metadata> {
  const page = (await fetchPseoPage('/vs')) ?? FALLBACK_PAGE;
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description,
    path: page.canonical_path,
    keywords: page.keywords,
  });
}

export default async function Page() {
  const page = (await fetchPseoPage('/vs')) ?? FALLBACK_PAGE;
  return <ComparisonsIndexPage page={page} />;
}
