import type { PseoPageData } from '@/lib/api/pseo';
import { fetchPseoTitles } from '@/lib/api/pseo';
import Link from 'next/link';
import PseoPageShell from './shared/PseoPageShell';
import PseoFAQ from './shared/PseoFAQ';
import PseoRelatedLinks from './shared/PseoRelatedLinks';

interface Feature {
  name: string;
  description: string;
  included: boolean;
}

export default async function ConversionsPlaybookPage({ page }: { page: PseoPageData }) {
  const { content, related_paths } = page;
  const titles = await fetchPseoTitles(related_paths);
  const features: Feature[] = content?.features || [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Pricing', href: '/pricing' },
    { label: page.title },
  ];

  return (
    <PseoPageShell breadcrumbs={breadcrumbs} title={page.title} description={content?.hero_subhead || page.meta_description}>
      {features.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-6">What&apos;s Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <div key={i} className="flex gap-3 p-4 border rounded-lg">
                <span className="text-green-500 mt-0.5 text-lg">✓</span>
                <div>
                  <p className="font-medium">{feature.name}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(content?.benefits || []).length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Key Benefits</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(content.benefits as string[]).map((b, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-primary">→</span>
                <span className="text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12 text-center p-8 border rounded-2xl bg-muted/30">
        <h2 className="text-xl font-bold mb-3">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6">Try AutoReels free — 10 credits on signup, no credit card required.</p>
        <Link href="/signup" className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-8 py-3 font-semibold hover:bg-primary/90 transition-colors">
          Start Free Trial
        </Link>
      </section>

      <PseoFAQ faqs={content?.faqs || []} pageTitle={page.title} />
      <PseoRelatedLinks paths={related_paths} titles={titles} />
    </PseoPageShell>
  );
}
