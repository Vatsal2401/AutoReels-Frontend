import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage, type PseoPageData } from '@/lib/api/pseo';
import GlossaryIndexPage from '@/components/pseo/GlossaryIndexPage';

export const revalidate = 604800; // 7 days

const FALLBACK_PAGE: PseoPageData = {
  id: 'static-glossary-index',
  slug: 'glossary-index',
  canonical_path: '/glossary',
  playbook: 'glossary',
  status: 'published',
  title: 'AI Video & Faceless Reel Glossary',
  meta_description:
    'Complete glossary of AI video creation, faceless reel, and social media terms. Learn the language of viral content.',
  keywords: ['AI video glossary', 'faceless reel terms', 'video creation glossary', 'reel terms'],
  content: {
    intro:
      "Whether you're just starting your faceless content journey or scaling to 100 reels/month, understanding these terms will help you create better content faster.",
    categories: [
      {
        name: 'Content Strategy',
        terms: ['viral-hook', 'content-pillar', 'niche-content', 'hook-copy', 'scroll-stopper', 'pattern-interrupt'],
      },
      {
        name: 'AI Tools',
        terms: ['ai-voiceover', 'ai-script', 'text-to-speech', 'ai-generated-video', 'ai-editing', 'auto-captions'],
      },
      {
        name: 'Video Production',
        terms: ['b-roll', 'kenburns-effect', 'scene-transition', 'aspect-ratio', 'vertical-video', 'dynamic-subtitles'],
      },
      {
        name: 'Platform Terms',
        terms: ['reels-algorithm', 'shorts-algorithm', 'tiktok-fyp', 'watch-time', 'engagement-rate'],
      },
      {
        name: 'Creator Business',
        terms: ['faceless-channel', 'faceless-brand', 'creator-economy', 'monetization-strategy', 'content-repurposing'],
      },
    ],
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
  const page = (await fetchPseoPage('/glossary')) ?? FALLBACK_PAGE;
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description,
    path: page.canonical_path,
    keywords: page.keywords,
  });
}

export default async function Page() {
  const page = (await fetchPseoPage('/glossary')) ?? FALLBACK_PAGE;
  return <GlossaryIndexPage page={page} />;
}
