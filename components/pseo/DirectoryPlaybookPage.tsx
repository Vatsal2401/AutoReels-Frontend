import type { PseoPageData } from '@/lib/api/pseo';
import { fetchPseoTitles } from '@/lib/api/pseo';
import PseoPageShell from './shared/PseoPageShell';
import PseoRelatedLinks from './shared/PseoRelatedLinks';
import PseoCTA from './shared/PseoCTA';

interface Creator {
  name: string;
  niche: string;
  platform: string;
  tool: string;
  followers: string;
}

export default async function DirectoryPlaybookPage({ page }: { page: PseoPageData }) {
  const { content, related_paths } = page;
  const titles = await fetchPseoTitles(related_paths);
  const creators: Creator[] = content?.creators || [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Directory', href: '/directory' },
    { label: page.title },
  ];

  return (
    <PseoPageShell breadcrumbs={breadcrumbs} title={page.title} description={content?.hero_subhead || page.meta_description}>
      {creators.length > 0 && (
        <section className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {creators.map((creator, i) => (
              <div key={i} className="border rounded-xl p-5">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold mb-3">
                  {creator.name.charAt(0)}
                </div>
                <p className="font-semibold">{creator.name}</p>
                <p className="text-sm text-muted-foreground capitalize mt-1">{creator.niche} • {creator.platform}</p>
                <p className="text-sm text-green-600 font-medium mt-2">{creator.followers} followers</p>
                <p className="text-xs text-muted-foreground mt-1">Using: {creator.tool}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(content?.how_they_create || []).length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">How They Create Content</h2>
          <ul className="space-y-3">
            {(content.how_they_create as string[]).map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-primary">→</span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PseoCTA headline="Join Thousands of Faceless Creators" subtext="AutoReels powers the most productive faceless content creators. Start free today." />
      <PseoRelatedLinks paths={related_paths} titles={titles} />
    </PseoPageShell>
  );
}
