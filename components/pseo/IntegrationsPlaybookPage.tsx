import type { PseoPageData } from '@/lib/api/pseo';
import { fetchPseoTitles } from '@/lib/api/pseo';
import PseoPageShell from './shared/PseoPageShell';
import PseoFAQ from './shared/PseoFAQ';
import PseoRelatedLinks from './shared/PseoRelatedLinks';
import PseoCTA from './shared/PseoCTA';

interface SetupStep {
  step: number;
  title: string;
  description: string;
  tip: string;
}

export default async function IntegrationsPlaybookPage({ page }: { page: PseoPageData }) {
  const { content, seed_params, related_paths } = page;
  const titles = await fetchPseoTitles(related_paths);
  const integration = seed_params?.integration || '';
  const setupSteps: SetupStep[] = content?.setup_steps || [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Integrations', href: '/integrations' },
    { label: page.title },
  ];

  return (
    <PseoPageShell breadcrumbs={breadcrumbs} title={page.title} description={content?.hero_subhead || page.meta_description}>
      {setupSteps.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Setup Guide</h2>
          <div className="space-y-4">
            {setupSteps.map((step) => (
              <div key={step.step} className="border rounded-xl p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                    <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-lg">
                      <p className="text-xs font-medium text-amber-700 mb-1">Pro Tip</p>
                      <p className="text-sm text-muted-foreground">{step.tip}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(content?.use_cases || []).length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Use Cases</h2>
          <ul className="space-y-2">
            {(content.use_cases as string[]).map((uc, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-primary">→</span>
                <span className="text-muted-foreground">{uc}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PseoFAQ faqs={content?.faqs || []} pageTitle={page.title} />
      <PseoCTA headline={`Automate Your ${integration} Workflow`} subtext="Connect AutoReels with your tools and publish reels on autopilot." />
      <PseoRelatedLinks paths={related_paths} titles={titles} />
    </PseoPageShell>
  );
}
