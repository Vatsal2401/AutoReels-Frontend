import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { generatePageMetadata, generateBreadcrumbSchema, SITE_CONFIG } from '@/lib/seo';
import type { Metadata } from 'next';
import { ArrowRight, Clock } from 'lucide-react';

export const metadata: Metadata = generatePageMetadata({
  title: 'Blog — AI Video Creation Tips & Guides',
  description:
    'Learn how to create viral faceless videos with AI. Tips, guides, and strategies for content creators using AutoReels to grow on TikTok, Instagram, and YouTube.',
  path: '/blog',
  keywords: [
    'AI video creation guide',
    'faceless video creator',
    'how to make faceless videos',
    'AI content creation tips',
    'viral reels guide',
  ],
});

import { getBlogPosts } from '@/lib/api/blog';

export default async function BlogPage() {
  const { data: posts } = await getBlogPosts();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <section className="py-24 px-4">
            <div className="container mx-auto max-w-4xl">
              <div className="mb-12 space-y-3">
                <p className="text-sm font-bold tracking-widest text-primary uppercase">
                  AutoReels Blog
                </p>
                <h1 className="text-4xl font-bold leading-tight">
                  AI Video Creation Tips & Guides
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Everything you need to know about creating viral faceless content with AI —
                  strategies, tutorials, and insider tips.
                </p>
              </div>

              <div className="space-y-6">
                {posts.map((post: any) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group block p-6 rounded-2xl border border-border/40 hover:border-primary/30 hover:bg-primary/[0.02] transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                          <span>{post.category || 'General'}</span>
                          <span className="text-muted-foreground/40">·</span>
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground font-normal">
                            {post.read_time || '5 min read'}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {post.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.published_at || post.created_at).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
