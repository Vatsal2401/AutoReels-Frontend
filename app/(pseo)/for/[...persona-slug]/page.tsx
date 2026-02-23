import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage, fetchPseoSitemap } from '@/lib/api/pseo';
import PersonasPlaybookPage from '@/components/pseo/PersonasPlaybookPage';

export const revalidate = 86400;

type Props = { params: { 'persona-slug': string[] } };

export async function generateStaticParams() {
  const { pages } = await fetchPseoSitemap('personas', 1, 500);
  return pages.map((p) => ({
    'persona-slug': p.canonical_path.replace(/^\/for\//, '').split('/'),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = `/for/${params['persona-slug'].join('/')}`;
  const page = await fetchPseoPage(path);
  if (!page) return {};
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description,
    path: page.canonical_path,
    keywords: page.keywords,
  });
}

export default async function Page({ params }: Props) {
  const path = `/for/${params['persona-slug'].join('/')}`;
  const page = await fetchPseoPage(path);
  if (!page) notFound();
  return <PersonasPlaybookPage page={page} />;
}
