import type { PseoPageData } from '@/lib/api/pseo';
import { fetchPseoTitles } from '@/lib/api/pseo';
import PseoPageShell from './shared/PseoPageShell';
import PseoFAQ from './shared/PseoFAQ';
import PseoRelatedLinks from './shared/PseoRelatedLinks';
import PseoCTA from './shared/PseoCTA';

interface KeyFeature {
  name: string;
  description: string;
}

interface UseCase {
  use_case: string;
  example: string;
}

export default async function ProfilesPlaybookPage({ page }: { page: PseoPageData }) {
  const { content, related_paths } = page;
  const titles = await fetchPseoTitles(related_paths);
  const features: KeyFeature[] = content?.key_features || [];
  const useCases: UseCase[] = content?.use_cases || [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Tools', href: '/tools' },
    { label: page.title },
  ];

  return (
    <PseoPageShell breadcrumbs={breadcrumbs} title={page.title} description={content?.hero_subhead || page.meta_description}>
      {content?.tool_description && (
        <div className="mt-6 p-5 bg-muted/30 rounded-xl border">
          <p className="text-muted-foreground leading-relaxed">{content.tool_description}</p>
        </div>
      )}

      {features.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <p className="font-semibold mb-1">{f.name}</p>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {useCases.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Use Cases</h2>
          <div className="space-y-4">
            {useCases.map((uc, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <p className="font-medium mb-1">{uc.use_case}</p>
                <p className="text-sm text-muted-foreground">{uc.example}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {content?.comparison_note && (
        <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm">{content.comparison_note}</p>
        </div>
      )}

      <PseoFAQ faqs={content?.faqs || []} pageTitle={page.title} />
      <PseoCTA />
      <PseoRelatedLinks paths={related_paths} titles={titles} />
    </PseoPageShell>
  );
}
