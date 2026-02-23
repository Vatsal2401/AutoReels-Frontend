import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage, fetchPseoSitemap } from '@/lib/api/pseo';
import ConversionsPlaybookPage from '@/components/pseo/ConversionsPlaybookPage';

export const revalidate = 86400;

type Props = { params: { 'pricing-slug': string } };

export async function generateStaticParams() {
  const { pages } = await fetchPseoSitemap('conversions', 1, 500);
  return pages.map((p) => ({
    'pricing-slug': p.canonical_path.replace(/^\/pricing\//, ''),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await fetchPseoPage(`/pricing/${params['pricing-slug']}`);
  if (!page) return {};
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description,
    path: page.canonical_path,
    keywords: page.keywords,
  });
}

export default async function Page({ params }: Props) {
  const page = await fetchPseoPage(`/pricing/${params['pricing-slug']}`);
  if (!page) notFound();
  return <ConversionsPlaybookPage page={page} />;
}
