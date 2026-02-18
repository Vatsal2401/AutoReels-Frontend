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
import { ArrowRight, CheckCircle2, Zap, Users, Repeat2 } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "AI Instagram Reels Generator — Make Reels in 60 Seconds",
  description:
    "Create viral Instagram Reels with AI. AutoReels generates fully produced 9:16 reels — script, voiceover, captions, and visuals — in 60 seconds. No filming or editing needed.",
  path: "/for-instagram",
  keywords: [
    "AI Instagram Reels generator",
    "Instagram Reels maker",
    "automated Instagram Reels",
    "faceless Instagram page",
    "AI video generator Instagram",
    "Instagram content creator",
    "auto reels generator",
  ],
});

const benefits = [
  "Hook-first scripts designed for Instagram Reels retention",
  "50+ AI voices — sound human, not robotic",
  "Trending-style auto-captions for silent viewers",
  "9:16 format optimized for Reels feed and Explore",
  "Consistent visual style to build a recognizable page",
  "Schedule and auto-post to Instagram",
];

export default function ForInstagramPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "For Instagram Reels", path: "/for-instagram" },
  ]);

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${SITE_CONFIG.name} for Instagram Reels`,
    description:
      "AI Instagram Reels generator that creates fully produced viral reels in 60 seconds.",
    applicationCategory: "MultimediaApplication",
    url: `${SITE_CONFIG.url}/for-instagram`,
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
          <section className="py-24 px-4 bg-gradient-to-b from-pink-500/5 to-transparent">
            <div className="container mx-auto max-w-4xl">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 text-xs font-bold tracking-widest uppercase">
                  Instagram Reels
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  AI Instagram Reels Generator
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Build a viral faceless Instagram page without filming or editing. AutoReels
                  generates complete Reels — script, voice, captions, visuals — in 60 seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="h-12 px-8 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 border-0 shadow-lg shadow-pink-500/20"
                    >
                      Create Reels Free
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
                  { value: "3x", label: "More Reels per week" },
                  { value: "No face", label: "Camera-free content" },
                  { value: "60s", label: "From idea to Reel" },
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
                    The Fastest Way to Grow a Faceless Instagram Page
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The Instagram algorithm rewards consistency. Pages that post Reels daily
                    get pushed to the Explore page. With AutoReels, you can create a month of
                    content in a single afternoon.
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
                    <Button className="mt-4 h-12 px-8 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 border-0">
                      Start Your Page Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      icon: Zap,
                      title: "Hook-First Scripts That Stop the Scroll",
                      desc: "Our AI writes every script with a pattern-interrupt hook in the first 2 seconds — the key to Reels watch time.",
                    },
                    {
                      icon: Users,
                      title: "Build a Massive Following Without Your Face",
                      desc: "The biggest faceless Instagram pages have millions of followers. AutoReels gives you the content engine to get there.",
                    },
                    {
                      icon: Repeat2,
                      title: "Post Every Day Without Burning Out",
                      desc: "Generate 30 Reels in an hour. Schedule them for the month. Wake up to new followers every morning.",
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
          <section className="py-20 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center">
            <div className="container mx-auto max-w-3xl space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Start Your Faceless Instagram Page Today
              </h2>
              <p className="text-lg opacity-90">
                10 free Reels. No camera. No editing. No face.
              </p>
              <Link href="/signup">
                <Button size="lg" className="h-14 px-10 text-lg font-black rounded-xl bg-white text-pink-600 hover:bg-slate-100">
                  Create Reels Free
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
