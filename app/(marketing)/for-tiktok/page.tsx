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
import { ArrowRight, CheckCircle2, Zap, BarChart3, Layers } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "AI TikTok Video Maker — Create TikToks in 60 Seconds",
  description:
    "Make viral TikTok videos with AI. AutoReels generates fully produced vertical videos — script, voiceover, captions, and visuals — in under 60 seconds. No filming or editing needed.",
  path: "/for-tiktok",
  keywords: [
    "AI TikTok video maker",
    "TikTok video generator",
    "automated TikTok content",
    "faceless TikTok account",
    "AI video generator TikTok",
    "TikTok content creator tool",
    "viral TikTok generator",
  ],
});

const benefits = [
  "TikTok-optimized scripts with viral hooks",
  "Trending-sound-ready audio format",
  "Auto-captions for sound-off viewing",
  "9:16 1080p vertical format, ready to upload",
  "Batch-create 10 TikToks at once",
  "Post multiple times per day without effort",
];

export default function ForTikTokPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "For TikTok", path: "/for-tiktok" },
  ]);

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_CONFIG.name} for TikTok`,
    description: "AI TikTok video maker that creates fully produced viral videos in 60 seconds.",
    applicationCategory: "MultimediaApplication",
    url: `${SITE_CONFIG.url}/for-tiktok`,
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
          <section className="py-24 px-4 bg-gradient-to-b from-sky-500/5 to-transparent">
            <div className="container mx-auto max-w-4xl">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 text-xs font-bold tracking-widest uppercase">
                  TikTok
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  AI TikTok Video Maker
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Go viral on TikTok without showing your face or picking up a camera. AutoReels
                  creates complete TikTok-ready videos — script, voice, captions, visuals — in
                  60 seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-sky-500/20"
                    >
                      Create TikToks Free
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
                  { value: "5–10x", label: "More videos per day" },
                  { value: "Zero", label: "Editing required" },
                  { value: "60s", label: "Per TikTok" },
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
                    The Fastest Way to Scale a Faceless TikTok Account
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    TikTok's algorithm is volume-first. Accounts that post 3-5 times per day see
                    dramatically faster growth. With AutoReels, that volume is achievable for any
                    solo creator or agency.
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
                      Start Your TikTok Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      icon: Zap,
                      title: "Hooks That Stop the Scroll",
                      desc: "TikTok success lives or dies in the first 1.5 seconds. Our AI writes scripts with pattern-interrupt openers that maximize watch time.",
                    },
                    {
                      icon: BarChart3,
                      title: "Post 5x Per Day Without Burnout",
                      desc: "Top TikTok growth accounts post 3-5 times daily. Generate a week's content in an hour and schedule it all at once.",
                    },
                    {
                      icon: Layers,
                      title: "12+ Visual Styles for Any Niche",
                      desc: "Match your content style to your niche — Cinematic for motivation, Minimal for finance, Neon for tech, and more.",
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
          <section className="py-20 px-4 bg-primary text-white text-center">
            <div className="container mx-auto max-w-3xl space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Go Viral on TikTok — Starting Today
              </h2>
              <p className="text-lg opacity-90">
                10 free TikToks. No filming. No editing. No face needed.
              </p>
              <Link href="/signup">
                <Button size="lg" className="h-14 px-10 text-lg font-black rounded-xl bg-white text-primary hover:bg-slate-100">
                  Create TikToks Free
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
