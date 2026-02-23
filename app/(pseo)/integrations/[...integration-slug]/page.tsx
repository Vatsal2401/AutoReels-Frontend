import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage, fetchPseoSitemap } from '@/lib/api/pseo';
import IntegrationsPlaybookPage from '@/components/pseo/IntegrationsPlaybookPage';

export const revalidate = 86400;

type Props = { params: { 'integration-slug': string[] } };

export async function generateStaticParams() {
  const { pages } = await fetchPseoSitemap('integrations', 1, 500);
  return pages.map((p) => ({
    'integration-slug': p.canonical_path.replace(/^\/integrations\//, '').split('/'),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = `/integrations/${params['integration-slug'].join('/')}`;
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
  const path = `/integrations/${params['integration-slug'].join('/')}`;
  const page = await fetchPseoPage(path);
  if (!page) notFound();
  return <IntegrationsPlaybookPage page={page} />;
}
