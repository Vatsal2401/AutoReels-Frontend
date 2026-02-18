import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  generatePageMetadata,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { ArrowRight, Sparkles, Mic2, Captions, Music2, Palette, Zap, Download, Share2, Clock } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "AI Video Generator Features",
  description:
    "Discover everything AutoReels can do: AI scriptwriting, realistic voiceovers, auto-captions, music sync, 12+ visual styles, and one-click publishing. The most complete AI video generator for creators.",
  path: "/features",
  keywords: [
    "AI video generator features",
    "AI video creator",
    "automated video creation",
    "AI script generator",
    "AI voiceover generator",
    "auto captions",
    "faceless video maker",
  ],
});

const features = [
  {
    icon: Sparkles,
    title: "AI Script Generation",
    description:
      "Enter a topic and our AI writes a punchy, engagement-optimized script in seconds. Trained on thousands of viral short-form videos.",
  },
  {
    icon: Mic2,
    title: "Realistic AI Voiceover",
    description:
      "Choose from 50+ professional AI voices across 20+ languages. Human-sounding narration your audience won't know is AI.",
  },
  {
    icon: Captions,
    title: "Auto Captions",
    description:
      "Word-level animated captions automatically synced to audio. 85% of social video is watched on mute — captions are non-negotiable.",
  },
  {
    icon: Music2,
    title: "Music Sync",
    description:
      "Our AI selects background music that matches your video's mood and tempo, licensed for commercial use on all platforms.",
  },
  {
    icon: Palette,
    title: "12+ Visual Styles",
    description:
      "Cinematic, Minimal, Anime, Noir, Nature, Neon, and more. Lock in a consistent aesthetic that builds your brand identity.",
  },
  {
    icon: Zap,
    title: "60-Second Rendering",
    description:
      "From topic to finished video in under a minute. Our Neural Pipeline V3 renders 1080x1920 HD videos at production quality.",
  },
  {
    icon: Download,
    title: "HD Download — No Watermark",
    description:
      "Export clean 1080p vertical videos ready to post. No watermarks. Your content, your brand.",
  },
  {
    icon: Share2,
    title: "Auto-Publish & Scheduling",
    description:
      "Connect TikTok, Instagram, and YouTube Shorts. Batch-create a week of content and let AutoReels post it while you sleep.",
  },
  {
    icon: Clock,
    title: "Batch Creation",
    description:
      "Generate 10 videos at once. Perfect for agencies managing multiple accounts or creators who post multiple times a day.",
  },
];

export default function FeaturesPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
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
          {/* Hero */}
          <section className="py-24 px-4 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="container mx-auto max-w-4xl text-center space-y-6">
              <p className="text-sm font-bold tracking-widest text-primary uppercase">
                Everything Included
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                The Most Complete AI Video Generator for Creators
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                AutoReels combines AI scriptwriting, voiceover, captions, music, and visual styles
                into one automated pipeline. Turn any idea into a ready-to-post video — no editing
                required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link href="/signup">
                  <Button size="lg" className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20">
                    Start Free — No Card Required
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-24 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl border border-border/40 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-bold mb-2">{feature.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 px-4 bg-primary text-white text-center">
            <div className="container mx-auto max-w-3xl space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                All These Features. Free to Try.
              </h2>
              <p className="text-lg opacity-90">
                Start with 10 free credits. No credit card required.
              </p>
              <Link href="/signup">
                <Button size="lg" className="h-14 px-10 text-lg font-black rounded-xl bg-white text-primary hover:bg-slate-100">
                  Create Your First Video Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
