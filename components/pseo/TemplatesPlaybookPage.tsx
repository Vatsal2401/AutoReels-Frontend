import type { PseoPageData } from '@/lib/api/pseo';
import { fetchPseoTitles } from '@/lib/api/pseo';
import PseoPageShell from './shared/PseoPageShell';
import PseoFAQ from './shared/PseoFAQ';
import PseoRelatedLinks from './shared/PseoRelatedLinks';
import PseoCTA from './shared/PseoCTA';

interface TemplateCard {
  title: string;
  tone: string;
  hook: string;
  cta: string;
}

interface HowToStep {
  step: number;
  title: string;
  description: string;
}

export default async function TemplatesPlaybookPage({ page }: { page: PseoPageData }) {
  const { content, seed_params, related_paths } = page;
  const titles = await fetchPseoTitles(related_paths);

  const templateCards: TemplateCard[] = content?.template_cards || [];
  const howItWorks: HowToStep[] = content?.how_it_works || [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Tools', href: '/tools' },
    { label: page.title },
  ];

  return (
    <PseoPageShell breadcrumbs={breadcrumbs} title={page.title} description={content?.hero_subhead || page.meta_description}>
      {/* Template cards grid */}
      {templateCards.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Reel Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templateCards.map((card, i) => (
              <div key={i} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                <span className="inline-block text-xs font-medium bg-primary/10 text-primary rounded-full px-3 py-1 mb-3 capitalize">
                  {card.tone}
                </span>
                <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  <span className="font-medium text-foreground">Hook: </span>
                  &ldquo;{card.hook}&rdquo;
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">CTA: </span>
                  {card.cta}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      {howItWorks.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">How to Use These Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((step) => (
              <div key={step.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
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
