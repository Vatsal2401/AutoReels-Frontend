import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage, fetchPseoSitemap } from '@/lib/api/pseo';
import ExamplesPlaybookPage from '@/components/pseo/ExamplesPlaybookPage';

export const revalidate = 86400;

type Props = { params: { 'example-slug': string } };

export async function generateStaticParams() {
  const { pages } = await fetchPseoSitemap('examples', 1, 500);
  return pages.map((p) => ({
    'example-slug': p.canonical_path.replace(/^\/examples\//, ''),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await fetchPseoPage(`/examples/${params['example-slug']}`);
  if (!page) return {};
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description,
    path: page.canonical_path,
    keywords: page.keywords,
  });
}

export default async function Page({ params }: Props) {
  const page = await fetchPseoPage(`/examples/${params['example-slug']}`);
  if (!page) notFound();
  return <ExamplesPlaybookPage page={page} />;
}
