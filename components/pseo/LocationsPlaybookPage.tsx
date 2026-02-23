import type { PseoPageData } from '@/lib/api/pseo';
import { fetchPseoTitles } from '@/lib/api/pseo';
import PseoPageShell from './shared/PseoPageShell';
import PseoFAQ from './shared/PseoFAQ';
import PseoRelatedLinks from './shared/PseoRelatedLinks';
import PseoCTA from './shared/PseoCTA';

interface CreatorTip {
  tip: string;
  reason: string;
}

export default async function LocationsPlaybookPage({ page }: { page: PseoPageData }) {
  const { content, seed_params, related_paths } = page;
  const titles = await fetchPseoTitles(related_paths);
  const country = seed_params?.country || '';
  const tips: CreatorTip[] = content?.creator_tips || [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: country.charAt(0).toUpperCase() + country.slice(1) },
  ];

  return (
    <PseoPageShell breadcrumbs={breadcrumbs} title={page.title} description={content?.local_context || page.meta_description}>
      {content?.local_headline && (
        <p className="mt-2 text-xl font-medium text-muted-foreground">{content.local_headline}</p>
      )}

      {(content?.top_niches || []).length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Top Niches in {country}</h2>
          <div className="flex flex-wrap gap-3">
            {(content.top_niches as string[]).map((niche, i) => (
              <span key={i} className="bg-muted rounded-full px-4 py-2 text-sm font-medium capitalize">
                {niche}
              </span>
            ))}
          </div>
        </section>
      )}

      {content?.pricing_note && (
        <div className="mt-8 p-4 border rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">{content.pricing_note}</p>
        </div>
      )}

      {tips.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Creator Tips for {country}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <p className="font-medium mb-1">{tip.tip}</p>
                <p className="text-sm text-muted-foreground">{tip.reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <PseoFAQ faqs={content?.faqs || []} pageTitle={page.title} />
      <PseoCTA />
      <PseoRelatedLinks paths={related_paths} titles={titles} />
    </PseoPageShell>
  );
}
