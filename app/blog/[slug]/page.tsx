import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { generatePageMetadata, generateBreadcrumbSchema, SITE_CONFIG } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, ArrowLeft } from 'lucide-react';
import { getBlogPost } from '@/lib/api/blog';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import LikeButton from '@/components/blog/LikeButton';
import CommentsSection from '@/components/blog/CommentsSection';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) return {};
  return generatePageMetadata({
    title: post.meta_title || post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords || [],
  });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  // Parse TopTap JSON into HTML
  let contentHtml = '';
  if (post.content && typeof post.content === 'object') {
    try {
      contentHtml = generateHTML(post.content, [StarterKit, TiptapLink, Image]);
    } catch (e) {
      console.error('Failed to parse blog content', e);
      contentHtml = '<p>Error loading content.</p>';
    }
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: SITE_CONFIG.ogImageUrl,
      },
    },
    url: `${SITE_CONFIG.url}/blog/${post.slug}`,
    image: post.cover_image_url || SITE_CONFIG.ogImageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
  };

  const publishDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <article className="py-16 px-4">
            <div className="container mx-auto max-w-3xl">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>

              <header className="mb-10 space-y-4">
                {post.cover_image_url && (
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-[400px] object-cover rounded-2xl mb-8"
                  />
                )}
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                  <span>{post.category || 'General'}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground font-normal">
                    {post.read_time || '5 min read'}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-muted-foreground font-normal">{post.views} views</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">{post.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">{post.description}</p>
                <p className="text-sm text-muted-foreground">Published {publishDate}</p>
              </header>

              <div
                className="prose max-w-none text-muted-foreground
                  prose-headings:text-foreground prose-strong:text-foreground
                  prose-a:text-primary prose-a:font-bold hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />

              <div className="mt-12 flex justify-start">
                <LikeButton slug={post.slug} initialCount={post.likes_count} />
              </div>

              <hr className="my-12 border-border/40" />

              <CommentsSection slug={post.slug} comments={post.comments} />

              <div className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-4">
                <h2 className="text-2xl font-bold">Ready to Create Your First Faceless Video?</h2>
                <p className="text-muted-foreground">
                  Start with 10 free credits. No credit card required.
                </p>
                <Link href="/signup">
                  <Button size="lg" className="h-12 px-8 rounded-xl font-bold">
                    Start Creating Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
