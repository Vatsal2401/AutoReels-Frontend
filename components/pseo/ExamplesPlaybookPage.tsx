import type { PseoPageData } from '@/lib/api/pseo';
import { fetchPseoTitles } from '@/lib/api/pseo';
import PseoPageShell from './shared/PseoPageShell';
import PseoFAQ from './shared/PseoFAQ';
import PseoRelatedLinks from './shared/PseoRelatedLinks';
import PseoCTA from './shared/PseoCTA';

interface Example {
  title: string;
  hook: string;
  script_excerpt: string;
  visual_style: string;
  estimated_views: string;
  why_it_works: string;
}

export default async function ExamplesPlaybookPage({ page }: { page: PseoPageData }) {
  const { content, related_paths } = page;
  const titles = await fetchPseoTitles(related_paths);
  const examples: Example[] = content?.examples || [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Examples', href: '/examples' },
    { label: page.title },
  ];

  return (
    <PseoPageShell breadcrumbs={breadcrumbs} title={page.title} description={content?.hero_subhead || page.meta_description}>
      {examples.length > 0 && (
        <section className="mt-8 space-y-8">
          {examples.map((ex, i) => (
            <div key={i} className="border rounded-xl overflow-hidden">
              <div className="bg-muted/40 px-6 py-4 flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Example {i + 1}</span>
                  <h3 className="font-semibold text-lg">{ex.title}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs text-muted-foreground block">{ex.visual_style}</span>
                  <span className="text-sm font-medium text-green-600">{ex.estimated_views} views</span>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="mb-3 p-3 bg-muted/30 rounded-lg border-l-2 border-primary">
                  <p className="text-xs font-medium text-primary mb-1">Opening Hook</p>
                  <p className="italic">&ldquo;{ex.hook}&rdquo;</p>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{ex.script_excerpt}</p>
                <p className="text-sm">
                  <span className="font-medium">Why it works: </span>
                  <span className="text-muted-foreground">{ex.why_it_works}</span>
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      {(content?.key_takeaways || []).length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Key Takeaways</h2>
          <ul className="space-y-2">
            {(content.key_takeaways as string[]).map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-primary">→</span>
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PseoFAQ faqs={content?.faqs || []} pageTitle={page.title} />
      <PseoCTA />
      <PseoRelatedLinks paths={related_paths} titles={titles} />
    </PseoPageShell>
  );
}
