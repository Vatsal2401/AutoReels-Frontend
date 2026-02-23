import type { PseoPageData } from '@/lib/api/pseo';
import { fetchPseoTitles } from '@/lib/api/pseo';
import PseoPageShell from './shared/PseoPageShell';
import PseoFAQ from './shared/PseoFAQ';
import PseoRelatedLinks from './shared/PseoRelatedLinks';
import PseoCTA from './shared/PseoCTA';

interface Idea {
  title: string;
  hook: string;
  why_it_works: string;
  best_platform: string;
}

export default async function CurationPlaybookPage({ page }: { page: PseoPageData }) {
  const { content, related_paths } = page;
  const titles = await fetchPseoTitles(related_paths);
  const ideas: Idea[] = content?.ideas || [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Ideas', href: '/ideas' },
    { label: page.title },
  ];

  return (
    <PseoPageShell breadcrumbs={breadcrumbs} title={page.title} description={content?.hero_subhead || page.meta_description}>
      {ideas.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Content Ideas</h2>
          <div className="space-y-4">
            {ideas.map((idea, i) => (
              <div key={i} className="border rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-semibold text-lg">{idea.title}</h3>
                  <span className="flex-shrink-0 text-xs bg-muted rounded-full px-3 py-1 capitalize">
                    {idea.best_platform}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Hook: </span>
                  &ldquo;{idea.hook}&rdquo;
                </p>
                <p className="text-sm text-muted-foreground">{idea.why_it_works}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(content?.posting_tips || []).length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Posting Tips</h2>
          <ul className="space-y-2">
            {(content.posting_tips as string[]).map((tip, i) => (
              <li key={i} className="flex gap-3 text-muted-foreground">
                <span className="text-primary mt-0.5">✓</span>
                {tip}
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
