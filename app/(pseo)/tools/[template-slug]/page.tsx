import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage, fetchPseoSitemap } from '@/lib/api/pseo';
import TemplatesPlaybookPage from '@/components/pseo/TemplatesPlaybookPage';

export const revalidate = 86400;

type Props = { params: { 'template-slug': string } };

export async function generateStaticParams() {
  const { pages } = await fetchPseoSitemap('templates', 1, 250);
  const { pages: profiles } = await fetchPseoSitemap('profiles', 1, 250);
  return [...pages, ...profiles].map((p) => ({
    'template-slug': p.canonical_path.replace(/^\/tools\//, ''),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params['template-slug'];
  const page = await fetchPseoPage(`/tools/${slug}`);
  if (!page) return {};
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description,
    path: page.canonical_path,
    keywords: page.keywords,
  });
}

export default async function Page({ params }: Props) {
  const slug = params['template-slug'];
  const page = await fetchPseoPage(`/tools/${slug}`);
  if (!page) notFound();
  return <TemplatesPlaybookPage page={page} />;
}
