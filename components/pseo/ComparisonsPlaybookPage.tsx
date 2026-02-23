import type { PseoPageData } from '@/lib/api/pseo';
import { fetchPseoTitles } from '@/lib/api/pseo';
import PseoPageShell from './shared/PseoPageShell';
import PseoFAQ from './shared/PseoFAQ';
import PseoRelatedLinks from './shared/PseoRelatedLinks';
import PseoCTA from './shared/PseoCTA';

interface ComparisonRow {
  feature: string;
  autoreels: string;
  competitor: string;
  winner: 'autoreels' | 'competitor' | 'tie';
}

export default async function ComparisonsPlaybookPage({ page }: { page: PseoPageData }) {
  const { content, seed_params, related_paths } = page;
  const titles = await fetchPseoTitles(related_paths);
  const table: ComparisonRow[] = content?.comparison_table || [];
  const competitor = seed_params?.competitor || 'competitor';

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Comparisons', href: '/vs' },
    { label: page.title },
  ];

  return (
    <PseoPageShell breadcrumbs={breadcrumbs} title={page.title} description={content?.verdict || page.meta_description}>
      {/* Verdict */}
      {content?.verdict && (
        <div className="mt-6 p-5 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="font-medium">{content.verdict}</p>
        </div>
      )}

      {/* Comparison table */}
      {table.length > 0 && (
        <section className="mt-10 overflow-x-auto">
          <h2 className="text-2xl font-bold mb-4">Feature Comparison</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold w-1/3">Feature</th>
                <th className="text-center py-3 px-4 font-semibold text-primary">AutoReels</th>
                <th className="text-center py-3 px-4 font-semibold capitalize">{competitor}</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={i} className={`border-b ${row.winner === 'autoreels' ? 'bg-green-50/30' : ''}`}>
                  <td className="py-3 px-4 text-sm">{row.feature}</td>
                  <td className="py-3 px-4 text-center text-sm">
                    <span className={row.winner === 'autoreels' ? 'font-medium text-green-600' : ''}>
                      {row.autoreels}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-muted-foreground">{row.competitor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Pros / Cons */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {(content?.pros_autoreels || []).length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-green-600">AutoReels Advantages</h2>
            <ul className="space-y-2">
              {(content.pros_autoreels as string[]).map((pro, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-muted-foreground">{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {(content?.cons_competitor || []).length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 capitalize">{competitor} Limitations</h2>
            <ul className="space-y-2">
              {(content.cons_competitor as string[]).map((con, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-red-400">✗</span>
                  <span className="text-muted-foreground">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <PseoFAQ faqs={content?.faqs || []} pageTitle={page.title} />
      <PseoCTA headline={`Switch from ${competitor} to AutoReels`} subtext="Join thousands of creators who made the switch. 10 free credits on signup." />
      <PseoRelatedLinks paths={related_paths} titles={titles} />
    </PseoPageShell>
  );
}
