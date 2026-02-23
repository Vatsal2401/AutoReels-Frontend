import type { PseoPageData } from '@/lib/api/pseo';
import { fetchPseoTitles } from '@/lib/api/pseo';
import PseoPageShell from './shared/PseoPageShell';
import PseoFAQ from './shared/PseoFAQ';
import PseoRelatedLinks from './shared/PseoRelatedLinks';
import PseoCTA from './shared/PseoCTA';

interface LanguageExample {
  topic: string;
  hook_english: string;
  hook_translated: string;
  why_it_works: string;
}

export default async function TranslationsPlaybookPage({ page }: { page: PseoPageData }) {
  const { content, seed_params, related_paths } = page;
  const titles = await fetchPseoTitles(related_paths);
  const language = seed_params?.language || '';
  const examples: LanguageExample[] = content?.language_examples || [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Create', href: '/create' },
    { label: page.title },
  ];

  return (
    <PseoPageShell breadcrumbs={breadcrumbs} title={page.title} description={content?.language_context || page.meta_description}>
      {examples.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-6">
            {language.charAt(0).toUpperCase() + language.slice(1)} Reel Examples
          </h2>
          <div className="space-y-4">
            {examples.map((ex, i) => (
              <div key={i} className="border rounded-xl p-6">
                <h3 className="font-semibold mb-3">{ex.topic}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs font-medium mb-1">English Hook</p>
                    <p className="italic text-sm">&ldquo;{ex.hook_english}&rdquo;</p>
                  </div>
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-xs font-medium text-primary mb-1">{language.charAt(0).toUpperCase() + language.slice(1)} Hook</p>
                    <p className="italic text-sm">&ldquo;{ex.hook_translated}&rdquo;</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{ex.why_it_works}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(content?.audience_tips || []).length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Tips for {language} Creators</h2>
          <ul className="space-y-3">
            {(content.audience_tips as string[]).map((tip, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-primary">✓</span>
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PseoFAQ faqs={content?.faqs || []} pageTitle={page.title} />
      <PseoCTA headline={`Create ${language.charAt(0).toUpperCase() + language.slice(1)} Reels with AI`} subtext="AutoReels supports multilingual voiceovers. Reach your local audience in their language." />
      <PseoRelatedLinks paths={related_paths} titles={titles} />
    </PseoPageShell>
  );
}
