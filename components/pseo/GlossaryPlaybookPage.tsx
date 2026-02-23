import Link from 'next/link';
import type { PseoPageData } from '@/lib/api/pseo';
import { fetchPseoTitles } from '@/lib/api/pseo';
import PseoPageShell from './shared/PseoPageShell';
import PseoFAQ from './shared/PseoFAQ';
import PseoRelatedLinks from './shared/PseoRelatedLinks';
import PseoCTA from './shared/PseoCTA';

interface GlossaryExample {
  scenario: string;
  explanation: string;
}

export default async function GlossaryPlaybookPage({ page }: { page: PseoPageData }) {
  const { content, related_paths } = page;
  const titles = await fetchPseoTitles(related_paths);
  const examples: GlossaryExample[] = content?.examples || [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Glossary', href: '/glossary' },
    { label: content?.term || page.title },
  ];

  return (
    <PseoPageShell breadcrumbs={breadcrumbs} title={page.title} description={content?.definition_short || page.meta_description}>
      {/* Definition */}
      <div className="mt-6">
        <div className="p-6 bg-muted/40 rounded-xl border-l-4 border-primary">
          <p className="font-semibold text-lg capitalize mb-2">{content?.term}</p>
          <p className="text-muted-foreground">{content?.definition_short}</p>
        </div>

        {content?.definition_long && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-3">In Depth</h2>
            <p className="text-muted-foreground leading-relaxed">{content.definition_long}</p>
          </div>
        )}
      </div>

      {/* Examples */}
      {examples.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Real-World Examples</h2>
          <div className="space-y-4">
            {examples.map((ex, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <p className="font-medium mb-2">{ex.scenario}</p>
                <p className="text-sm text-muted-foreground">{ex.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related terms */}
      {(content?.related_terms || []).length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Related Terms</h2>
          <div className="flex flex-wrap gap-3">
            {(content.related_terms as string[]).map((term, i) => (
              <Link
                key={i}
                href={`/glossary/${term}`}
                className="bg-muted hover:bg-primary/10 border rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors"
              >
                {term.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </section>
      )}

      <PseoFAQ faqs={content?.faqs || []} pageTitle={content?.term || page.title} />
      <PseoCTA headline="Apply This in Your Reels" subtext="AutoReels uses all these techniques automatically. Just enter a topic." />
      <PseoRelatedLinks paths={related_paths} titles={titles} />
    </PseoPageShell>
  );
}
