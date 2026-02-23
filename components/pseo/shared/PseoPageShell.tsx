import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/seo';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PseoPageShellProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function PseoPageShell({
  breadcrumbs,
  title,
  description,
  children,
}: PseoPageShellProps) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_CONFIG.url}${item.href}` } : {}),
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumbs */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                {item.href ? (
                  <Link href={item.href} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* Page header */}
      <div className="container mx-auto px-4 pt-12 pb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
      </div>

      {/* Page content */}
      <div className="container mx-auto px-4 pb-16">
        {children}
      </div>
    </div>
  );
}
