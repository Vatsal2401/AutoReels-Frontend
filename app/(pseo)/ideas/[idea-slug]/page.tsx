import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage, fetchPseoSitemap } from '@/lib/api/pseo';
import CurationPlaybookPage from '@/components/pseo/CurationPlaybookPage';

export const revalidate = 86400;

type Props = { params: { 'idea-slug': string } };

export async function generateStaticParams() {
  const { pages } = await fetchPseoSitemap('curation', 1, 500);
  return pages.map((p) => ({
    'idea-slug': p.canonical_path.replace(/^\/ideas\//, ''),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await fetchPseoPage(`/ideas/${params['idea-slug']}`);
  if (!page) return {};
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description,
    path: page.canonical_path,
    keywords: page.keywords,
  });
}

export default async function Page({ params }: Props) {
  const page = await fetchPseoPage(`/ideas/${params['idea-slug']}`);
  if (!page) notFound();
  return <CurationPlaybookPage page={page} />;
}
