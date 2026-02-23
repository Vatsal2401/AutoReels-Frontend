import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage, fetchPseoSitemap } from '@/lib/api/pseo';
import TranslationsPlaybookPage from '@/components/pseo/TranslationsPlaybookPage';

export const revalidate = 86400;

type Props = { params: { 'language-slug': string } };

export async function generateStaticParams() {
  const { pages } = await fetchPseoSitemap('translations', 1, 500);
  return pages.map((p) => ({
    'language-slug': p.canonical_path.replace(/^\/create\//, ''),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await fetchPseoPage(`/create/${params['language-slug']}`);
  if (!page) return {};
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description,
    path: page.canonical_path,
    keywords: page.keywords,
  });
}

export default async function Page({ params }: Props) {
  const page = await fetchPseoPage(`/create/${params['language-slug']}`);
  if (!page) notFound();
  return <TranslationsPlaybookPage page={page} />;
}
