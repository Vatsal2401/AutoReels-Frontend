import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  generatePageMetadata,
  generateBreadcrumbSchema,
  SITE_CONFIG,
} from "@/lib/seo";
import { ArrowRight, CheckCircle2, Zap, TrendingUp, Clock } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "AI YouTube Shorts Generator — Create Shorts in 60 Seconds",
  description:
    "Generate viral YouTube Shorts with AI. AutoReels creates fully produced 9:16 shorts — script, voiceover, captions, and visuals — in under 60 seconds. No editing required.",
  path: "/for-youtube",
  keywords: [
    "AI YouTube Shorts generator",
    "YouTube Shorts creator",
    "automated YouTube Shorts",
    "faceless YouTube channel",
    "AI video generator YouTube",
    "YouTube Shorts maker",
  ],
});

const benefits = [
  "AI-generated scripts optimized for Shorts retention",
  "Human-sounding voiceover in 20+ languages",
  "Auto-captions that keep viewers watching on mute",
  "9:16 vertical format, 1080p HD, no watermark",
  "Consistent visual style to build channel identity",
  "Batch-create 10 Shorts at once",
];

export default function ForYouTubePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "For YouTube Shorts", path: "/for-youtube" },
  ]);

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_CONFIG.name} for YouTube Shorts`,
    description:
      "AI YouTube Shorts generator that creates fully produced short videos in 60 seconds.",
    applicationCategory: "MultimediaApplication",
    url: `${SITE_CONFIG.url}/for-youtube`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to try with 10 credits",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="py-24 px-4 bg-gradient-to-b from-red-500/5 to-transparent">
            <div className="container mx-auto max-w-4xl">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold tracking-widest uppercase">
                  YouTube Shorts
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  AI YouTube Shorts Generator
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Build a high-CPM YouTube Shorts channel without filming or editing. AutoReels
                  generates complete shorts — script, voice, captions, visuals — in 60 seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <Link href="/signup">
                    <Button size="lg" className="h-12 px-8 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20">
                      Create YouTube Shorts Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  No credit card · 10 free credits to start
                </p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-12 px-4 border-y border-border/40">
            <div className="container mx-auto max-w-4xl">
              <div className="grid grid-cols-3 gap-8 text-center">
                {[
                  { value: "60s", label: "Average generation time" },
                  { value: "1080p", label: "HD video quality" },
                  { value: "10x", label: "More content per week" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl font-extrabold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-24 px-4">
            <div className="container mx-auto max-w-4xl">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold leading-tight">
                    Everything You Need to Grow a Faceless YouTube Shorts Channel
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The YouTube Shorts algorithm rewards volume and consistency. With AutoReels,
                    you can post daily — or multiple times a day — without burning out.
                  </p>
                  <ul className="space-y-3">
                    {benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button className="mt-4 h-12 px-8 rounded-xl font-bold">
                      Start Your Channel Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      icon: Zap,
                      title: "Viral-Optimized Scripts",
                      desc: "Our AI is trained on thousands of viral Shorts. Every script is structured to maximize watch time and retention.",
                    },
                    {
                      icon: TrendingUp,
                      title: "Post More, Grow Faster",
                      desc: "Channels that post 1-3 Shorts per day grow 3x faster. AutoReels makes that pace achievable for any creator.",
                    },
                    {
                      icon: Clock,
                      title: "Batch Create a Week in an Hour",
                      desc: "Generate 7 Shorts in under an hour. Download them all and post across the week at your own pace.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="p-5 rounded-xl border border-border/40 flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 px-4 bg-red-600 text-white text-center">
            <div className="container mx-auto max-w-3xl space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Start Your YouTube Shorts Channel Today
              </h2>
              <p className="text-lg opacity-90">
                10 free credits. No filming. No editing. Just results.
              </p>
              <Link href="/signup">
                <Button size="lg" className="h-14 px-10 text-lg font-black rounded-xl bg-white text-red-600 hover:bg-slate-100">
                  Create Shorts Free
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
