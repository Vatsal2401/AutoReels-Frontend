import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage, fetchPseoSitemap } from '@/lib/api/pseo';
import DirectoryPlaybookPage from '@/components/pseo/DirectoryPlaybookPage';

export const revalidate = 86400;

type Props = { params: { 'directory-slug': string } };

export async function generateStaticParams() {
  const { pages } = await fetchPseoSitemap('directory', 1, 500);
  return pages.map((p) => ({
    'directory-slug': p.canonical_path.replace(/^\/directory\//, ''),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await fetchPseoPage(`/directory/${params['directory-slug']}`);
  if (!page) return {};
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description,
    path: page.canonical_path,
    keywords: page.keywords,
  });
}

export default async function Page({ params }: Props) {
  const page = await fetchPseoPage(`/directory/${params['directory-slug']}`);
  if (!page) notFound();
  return <DirectoryPlaybookPage page={page} />;
}
