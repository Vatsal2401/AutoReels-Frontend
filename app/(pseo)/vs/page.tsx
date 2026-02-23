import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage } from '@/lib/api/pseo';
import ComparisonsIndexPage from '@/components/pseo/ComparisonsIndexPage';

export const revalidate = 604800; // 7 days

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPseoPage('/vs');
  if (!page) return {};
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description,
    path: page.canonical_path,
    keywords: page.keywords,
  });
}

export default async function Page() {
  const page = await fetchPseoPage('/vs');
  // If the backend hasn't been seeded yet, this might return 404.
  // We'll return the component anyway if we want it to be visible during development
  // but for production it should be 404 if data is missing.
  if (!page) notFound();

  return <ComparisonsIndexPage page={page} />;
}
