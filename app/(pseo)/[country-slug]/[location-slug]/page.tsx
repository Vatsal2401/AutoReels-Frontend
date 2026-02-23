import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo';
import { fetchPseoPage, fetchPseoSitemap } from '@/lib/api/pseo';
import LocationsPlaybookPage from '@/components/pseo/LocationsPlaybookPage';

export const revalidate = 86400;

type Props = { params: { 'country-slug': string; 'location-slug': string } };

export async function generateStaticParams() {
  const { pages } = await fetchPseoSitemap('locations', 1, 500);
  return pages.map((p) => {
    const parts = p.canonical_path.replace(/^\//, '').split('/');
    return { 'country-slug': parts[0], 'location-slug': parts[1] };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = `/${params['country-slug']}/${params['location-slug']}`;
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
  const path = `/${params['country-slug']}/${params['location-slug']}`;
  const page = await fetchPseoPage(path);
  if (!page) notFound();
  return <LocationsPlaybookPage page={page} />;
}
