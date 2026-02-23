import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage, fetchPseoSitemap } from '@/lib/api/pseo';
import GlossaryPlaybookPage from '@/components/pseo/GlossaryPlaybookPage';

export const revalidate = 604800; // 7 days — very stable definitions

type Props = { params: { 'term-slug': string } };

export async function generateStaticParams() {
  const { pages } = await fetchPseoSitemap('glossary', 1, 500);
  return pages
    .filter((p) => p.canonical_path !== '/glossary')
    .map((p) => ({
      'term-slug': p.canonical_path.replace(/^\/glossary\//, ''),
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await fetchPseoPage(`/glossary/${params['term-slug']}`);
  if (!page) return {};
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description,
    path: page.canonical_path,
    keywords: page.keywords,
  });
}

export default async function Page({ params }: Props) {
  const page = await fetchPseoPage(`/glossary/${params['term-slug']}`);
  if (!page) notFound();
  return <GlossaryPlaybookPage page={page} />;
}
