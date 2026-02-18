import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { generatePageMetadata, generateBreadcrumbSchema, SITE_CONFIG } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, ArrowLeft } from "lucide-react";

type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  keywords: string[];
  content: React.ReactNode;
};

const posts: Record<string, Post> = {
  "how-to-create-faceless-videos-ai-2026": {
    slug: "how-to-create-faceless-videos-ai-2026",
    title: "How to Create Faceless Videos with AI in 2026",
    description:
      "A complete step-by-step guide to building a faceless video channel using AI tools — no camera, no editing skills, no face required.",
    date: "2026-02-01",
    readTime: "7 min read",
    category: "Guide",
    keywords: [
      "faceless video creator",
      "how to make faceless videos",
      "AI faceless channel",
      "faceless YouTube channel",
      "AI video generator",
      "automated video creation",
    ],
    content: (
      <div className="prose max-w-none space-y-6 text-muted-foreground">
        <p className="text-lg leading-relaxed">
          Faceless video channels are one of the fastest-growing niches on the internet in 2026.
          Creators are building audiences of hundreds of thousands — without ever showing their face,
          speaking into a microphone, or touching a video editor. The secret? AI.
        </p>

        <p className="leading-relaxed">
          This guide walks you through everything you need to know to start a faceless video channel
          using an AI video creator like AutoReels — from picking a niche to publishing your first
          reel in under 60 seconds.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8">What Is a Faceless Video Channel?</h2>
        <p className="leading-relaxed">
          A faceless channel is a social media account or YouTube channel where the creator never
          appears on camera. Instead of a talking head, videos use stock footage, AI-generated
          visuals, animated text, and AI voiceovers to deliver content.
        </p>
        <p className="leading-relaxed">
          Popular faceless niches include: motivational content, finance tips, history facts,
          tech news, true crime, language learning, and "did you know" style edutainment.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8">Why Faceless Videos Work in 2026</h2>
        <p className="leading-relaxed">
          Short-form video platforms — TikTok, Instagram Reels, and YouTube Shorts — reward
          consistency above all else. Algorithms push accounts that post daily or multiple times
          per day. For human creators, that pace is unsustainable. With an AI faceless video
          creator, you can generate 5–10 videos per day in the time it used to take to film one.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8">
          Step 1: Choose Your Niche
        </h2>
        <p className="leading-relaxed">
          Pick a niche with high engagement and broad appeal. Some of the best-performing faceless
          niches right now:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Motivational quotes</strong> — evergreen, high share rate</li>
          <li><strong>Finance & investing tips</strong> — high CPM if monetized</li>
          <li><strong>AI & tech news</strong> — rapidly growing audience</li>
          <li><strong>History facts</strong> — extremely viral on TikTok</li>
          <li><strong>Life hacks</strong> — consistently high engagement</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8">
          Step 2: Set Up Your AI Video Creator
        </h2>
        <p className="leading-relaxed">
          Use AutoReels as your AI faceless video creator. Sign up for free — you get 10 starter
          credits. Each credit generates one complete video: AI-written script, AI voiceover,
          automatic captions, and synced background visuals.
        </p>
        <p className="leading-relaxed">
          No software to install. No editing timeline to learn. Just describe your video topic and
          the AI does the rest.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8">
          Step 3: Generate Your First Video
        </h2>
        <p className="leading-relaxed">
          Go to <strong>Create</strong> in your AutoReels dashboard. Enter a topic — for example:
          "5 habits of self-made millionaires". The AI will:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Write a punchy script optimized for short-form engagement</li>
          <li>Generate a professional AI voiceover (50+ voice options)</li>
          <li>Add animated captions synchronized to the audio</li>
          <li>Select cinematic stock footage or AI visuals matching your script</li>
          <li>Render a 9:16 vertical video ready for TikTok, Reels, or Shorts</li>
        </ul>
        <p className="leading-relaxed">
          The entire process takes 30–60 seconds.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8">
          Step 4: Customize Your Style
        </h2>
        <p className="leading-relaxed">
          AutoReels offers 12+ visual styles — Cinematic, Minimal, Anime, Noir, Nature, and more.
          Pick a consistent style for your channel to build a recognizable brand aesthetic.
          Consistency in visual style is one of the most underrated growth levers on short-form
          platforms.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8">
          Step 5: Post Daily (or Let AutoReels Do It)
        </h2>
        <p className="leading-relaxed">
          The algorithm rewards volume. Aim for at least one video per day. With AutoReels, you
          can batch-create a week's worth of content in an hour and schedule it for auto-posting.
          Your channel keeps growing while you're offline.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8">
          Common Mistakes to Avoid
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Inconsistent posting</strong> — algorithms punish gaps. Post every day.</li>
          <li><strong>Too many niches</strong> — pick one and dominate it before expanding.</li>
          <li><strong>Ignoring captions</strong> — 85% of social video is watched on mute. Captions are non-negotiable.</li>
          <li><strong>No CTA</strong> — always end with a question or prompt ("Follow for more").</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8">The Bottom Line</h2>
        <p className="leading-relaxed">
          Building a faceless video channel with AI is no longer a side hustle experiment — it's
          a proven content strategy. With a faceless video creator like AutoReels, you can start
          today, post consistently, and grow an audience without ever appearing on camera.
        </p>
        <p className="leading-relaxed">
          The barrier to entry has never been lower. The only thing between you and your first
          viral reel is hitting "Create".
        </p>
      </div>
    ),
  },
};

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = posts[params.slug];
  if (!post) return {};
  return generatePageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];
  if (!post) notFound();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        "@type": "ImageObject",
        url: SITE_CONFIG.ogImageUrl,
      },
    },
    url: `${SITE_CONFIG.url}/blog/${post.slug}`,
    image: SITE_CONFIG.ogImageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
  };

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
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                  <span>{post.category}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground font-normal">{post.readTime}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">{post.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">{post.description}</p>
                <p className="text-sm text-muted-foreground">
                  Published{" "}
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </header>

              {post.content}

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
