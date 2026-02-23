import Link from 'next/link';
import type { PseoPageData } from '@/lib/api/pseo';
import PseoPageShell from './shared/PseoPageShell';
import PseoCTA from './shared/PseoCTA';

interface GlossaryCategory {
  name: string;
  terms: string[];
}

export default function GlossaryIndexPage({ page }: { page: PseoPageData }) {
  const { content } = page;
  const categories: GlossaryCategory[] = content?.categories || [];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Glossary' },
  ];

  return (
    <PseoPageShell breadcrumbs={breadcrumbs} title={page.title} description={content?.intro || page.meta_description}>
      {categories.length > 0 && (
        <div className="mt-8 space-y-10">
          {categories.map((cat, i) => (
            <section key={i}>
              <h2 className="text-xl font-bold mb-4">{cat.name}</h2>
              <div className="flex flex-wrap gap-3">
                {cat.terms.map((term) => (
                  <Link
                    key={term}
                    href={`/glossary/${term}`}
                    className="bg-muted hover:bg-muted/80 border rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors"
                  >
                    {term.replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <PseoCTA headline="Create AI Reels Using These Techniques" subtext="Apply what you learned. AutoReels handles scripts, voiceovers, and visuals automatically." />
    </PseoPageShell>
  );
}
