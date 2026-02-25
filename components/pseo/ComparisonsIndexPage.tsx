import Link from 'next/link';
import type { PseoPageData } from '@/lib/api/pseo';
import PseoPageShell from './shared/PseoPageShell';
import PseoCTA from './shared/PseoCTA';
// Note: We can't easily import from backend, so let's define it here or fetch it.
// Since this is a frontend component, we'll use a hardcoded list for now or fetch it from the backend if we had an endpoint.
// But we can see they are exported in seed-dimensions.ts

const COMPETITORS_LIST = [
  'invideo',
  'canva',
  'pictory',
  'synthesia',
  'descript',
  'heygen',
  'veed',
  'capcut',
  'runway',
  'adobe-express',
];

export default function ComparisonsIndexPage({ page }: { page: PseoPageData }) {
  const { content } = page;

  const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Comparisons' }];

  return (
    <PseoPageShell
      breadcrumbs={breadcrumbs}
      title={page.title}
      description={content?.intro || page.meta_description}
    >
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Compare AutoReels with Top AI Video Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMPETITORS_LIST.map((competitor) => (
            <Link
              key={competitor}
              href={`/vs/autoreels-vs-${competitor}`}
              className="group p-6 bg-muted/30 hover:bg-muted/50 border border-border/50 rounded-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg capitalize">AutoReels vs {competitor}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Side-by-side comparison & verdict
                  </p>
                </div>
                <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <PseoCTA
        headline="Ready to create viral reels?"
        subtext="Join 10,000+ creators who switched to AutoReels for their faceless channels."
      />
    </PseoPageShell>
  );
}
