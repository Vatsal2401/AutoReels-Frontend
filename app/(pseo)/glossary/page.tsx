import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage } from '@/lib/api/pseo';
import GlossaryIndexPage from '@/components/pseo/GlossaryIndexPage';

export const revalidate = 604800; // 7 days

export const metadata: Metadata = generatePageMetadata({
  title: 'AI Video & Faceless Reel Glossary',
  description: 'Complete glossary of AI video creation, faceless reel, and social media terms. Learn the language of viral content.',
  path: '/glossary',
  keywords: ['AI video glossary', 'faceless reel terms', 'video creation glossary', 'reel terms'],
});

export default async function Page() {
  const page = await fetchPseoPage('/glossary');
  if (!page) notFound();
  return <GlossaryIndexPage page={page} />;
}
