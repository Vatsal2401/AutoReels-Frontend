import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage, fetchPseoSitemap } from '@/lib/api/pseo';
import ComparisonsPlaybookPage from '@/components/pseo/ComparisonsPlaybookPage';

export const revalidate = 43200; // 12h — competitor pricing may drift

type Props = { params: { 'comparison-slug': string } };

export async function generateStaticParams() {
  const { pages } = await fetchPseoSitemap('comparisons', 1, 500);
  return pages.map((p) => ({
    'comparison-slug': p.canonical_path.replace(/^\/vs\//, ''),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await fetchPseoPage(`/vs/${params['comparison-slug']}`);
  if (!page) return {};
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description,
    path: page.canonical_path,
    keywords: page.keywords,
  });
}

export default async function Page({ params }: Props) {
  const page = await fetchPseoPage(`/vs/${params['comparison-slug']}`);
  if (!page) notFound();
  return <ComparisonsPlaybookPage page={page} />;
}
