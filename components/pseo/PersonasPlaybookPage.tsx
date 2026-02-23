import type { PseoPageData } from '@/lib/api/pseo';
import { fetchPseoTitles } from '@/lib/api/pseo';
import PseoPageShell from './shared/PseoPageShell';
import PseoFAQ from './shared/PseoFAQ';
import PseoRelatedLinks from './shared/PseoRelatedLinks';
import PseoCTA from './shared/PseoCTA';

interface PainPoint {
  problem: string;
  agitation: string;
}

interface SolutionStep {
  step: number;
  action: string;
  result: string;
}

export default async function PersonasPlaybookPage({ page }: { page: PseoPageData }) {
  const { content, seed_params, related_paths } = page;
  const titles = await fetchPseoTitles(related_paths);
  const persona = seed_params?.persona?.replace(/-/g, ' ') || '';
  const painPoints: PainPoint[] = content?.pain_points || [];
  const solutionSteps: SolutionStep[] = content?.solution_steps || [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'For', href: '/for' },
    { label: page.title },
  ];

  return (
    <PseoPageShell breadcrumbs={breadcrumbs} title={page.title} description={content?.hero_subhead || page.meta_description}>
      {painPoints.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-6">The {persona} Content Problem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {painPoints.map((p, i) => (
              <div key={i} className="p-5 border border-red-200/50 rounded-xl bg-red-50/20">
                <p className="font-semibold mb-1">{p.problem}</p>
                <p className="text-sm text-muted-foreground">{p.agitation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {solutionSteps.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">How AutoReels Solves This</h2>
          <div className="space-y-4">
            {solutionSteps.map((step) => (
              <div key={step.step} className="flex gap-4 p-5 border rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div>
                  <p className="font-semibold">{step.action}</p>
                  <p className="text-sm text-muted-foreground mt-1">{step.result}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(content?.benefits || []).length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Benefits for {persona}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(content.benefits as string[]).map((b, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-primary text-lg">✓</span>
                <span className="text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {content?.social_proof && (
        <section className="mt-12 p-6 bg-muted/30 rounded-xl border">
          <p className="text-lg font-bold mb-3">{content.social_proof.stat}</p>
          <blockquote className="italic text-muted-foreground">&ldquo;{content.social_proof.quote}&rdquo;</blockquote>
        </section>
      )}

      <PseoFAQ faqs={content?.faqs || []} pageTitle={page.title} />
      <PseoCTA headline={`AutoReels for ${persona}`} subtext="Create viral faceless reels without filming or editing. 10 free credits on signup." />
      <PseoRelatedLinks paths={related_paths} titles={titles} />
    </PseoPageShell>
  );
}
