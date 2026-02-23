import Link from 'next/link';

interface PseoRelatedLinksProps {
  paths: string[];
  titles: Record<string, string>;
}

const LABEL_MAP: Record<string, string> = {
  '/glossary': 'Glossary',
  '/features': 'Features',
  '/blog': 'Blog',
};

export default function PseoRelatedLinks({ paths, titles }: PseoRelatedLinksProps) {
  if (!paths || paths.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {paths.map((path) => {
          const title = titles[path] || LABEL_MAP[path] || path.replace(/\//g, ' ').trim();
          return (
            <Link
              key={path}
              href={path}
              className="group block p-4 border rounded-lg hover:border-primary hover:bg-muted/30 transition-all"
            >
              <span className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                {title}
              </span>
              <span className="mt-2 text-sm text-muted-foreground block truncate">{path}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
