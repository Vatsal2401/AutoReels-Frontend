import Link from 'next/link';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { generatePageMetadata } from '@/lib/seo';
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Film,
  Mic2,
  Captions,
  Download,
  Infinity,
  BadgeDollarSign,
  Star,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = generatePageMetadata({
  title: 'Unlimited AI Videos for $1 — AutoReels',
  description:
    'Create unlimited AI-generated videos for Meta ads, Reels & Shorts — starting at just $1. No editing, no camera. Script, voiceover, captions & visuals in 60 seconds.',
  path: '/one-dollar-plan',
  keywords: [
    'AI video generator $1',
    'cheap AI video maker',
    'unlimited AI videos',
    'Meta ads video generator',
    'AI reels generator 1 dollar',
    'automate video creation',
    'faceless video maker',
  ],
});

const features = [
  {
    icon: Film,
    title: 'AI-Written Script',
    desc: 'Type a topic. AutoReels writes a hook-first script optimized for short-form engagement.',
  },
  {
    icon: Mic2,
    title: '50+ AI Voices',
    desc: 'Choose from 50+ natural AI voices across accents and tones — no microphone needed.',
  },
  {
    icon: Captions,
    title: 'Auto Captions',
    desc: 'Word-level captions sync perfectly to audio — built for silent viewers on Meta.',
  },
  {
    icon: Download,
    title: 'HD Download, No Watermark',
    desc: '1080×1920 vertical video ready to post. Your brand. Zero AutoReels watermark.',
  },
];

const useCases = [
  {
    emoji: '📣',
    title: 'Meta Ads Creatives',
    desc: 'Spin up multiple ad variants fast — test different hooks and CTAs without a video team.',
  },
  {
    emoji: '🎬',
    title: 'Faceless Reels Pages',
    desc: 'Build a niche content page on Instagram or TikTok without ever showing your face.',
  },
  {
    emoji: '💼',
    title: 'Business Explainers',
    desc: 'Turn your product features or FAQs into snackable videos for your ads and stories.',
  },
];

const faqs = [
  {
    q: 'What does the $1 plan include?',
    a: 'The $1 Starter pack gives you video credits to create AI-generated videos — each includes script generation, AI voiceover, auto captions, and HD 1080p export. No watermark.',
  },
  {
    q: 'Are there any hidden fees or a monthly subscription?',
    a: 'None. AutoReels is pay-as-you-go. You buy credits once and use them whenever you want. No recurring charges. Credits never expire.',
  },
  {
    q: 'Can I use these videos for Meta ads?',
    a: 'Yes. You own every video you create. Use them freely in paid Meta campaigns, organic posts, or anywhere else.',
  },
  {
    q: 'How long does it take to make a video?',
    a: 'Under 60 seconds from topic to finished video. Type your idea, pick a voice and style — AutoReels handles everything else.',
  },
  {
    q: 'Do I need video editing skills?',
    a: 'Zero. No editing, no camera, no studio. AutoReels assembles the full video — script, voiceover, visuals, captions — in one shot.',
  },
  {
    q: 'What formats and sizes are supported?',
    a: '1080×1920 vertical (9:16) optimized for Instagram Reels, TikTok, Facebook Reels, and YouTube Shorts.',
  },
];

export default function OneDollarPlanPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">

        {/* ─── HERO ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-20 pb-24 px-4 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent">
          {/* Subtle grid bg */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f110_1px,transparent_1px),linear-gradient(to_bottom,#6366f110_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div className="relative container mx-auto max-w-4xl text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
              <BadgeDollarSign className="h-3.5 w-3.5" />
              Limited Offer — $1 Starter Plan
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
              Unlimited AI Videos.
              <br />
              <span className="text-primary">Starting at{' '}
                <span className="relative inline-block">
                  $1
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-primary/30 rounded-full" />
                </span>
              </span>
            </h1>

            {/* Sub */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Generate scroll-stopping videos for Meta ads, Instagram Reels &amp; YouTube Shorts —
              fully produced with AI script, voiceover, captions &amp; visuals. No camera. No editor.
              Ready in <strong className="text-foreground">60 seconds</strong>.
            </p>

            {/* CTA */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-16 px-12 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.03] transition-transform"
                >
                  Get Started for $1
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground font-medium">
                No subscription · Credits never expire · Own every video
              </p>
            </div>
          </div>
        </section>

        {/* ─── TRUST BAR ────────────────────────────────────────────── */}
        <section className="py-10 px-4 border-y border-border/40 bg-muted/20">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon: Clock, value: '60 sec', label: 'Per video' },
                { icon: Infinity, value: 'Unlimited', label: 'Video styles' },
                { icon: ShieldCheck, value: '0 watermark', label: 'On every export' },
                { icon: Star, value: '$1', label: 'To start today' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <stat.icon className="h-5 w-5 text-primary mb-1" />
                  <div className="text-2xl font-black text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WHAT YOU GET ─────────────────────────────────────────── */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-14 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Everything Included. Zero Extras.
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Every video you create with AutoReels comes fully produced — no add-ons, no upsells.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-6 rounded-2xl border border-border/50 bg-card/30 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PRICING CARD ─────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-md text-center">
            <div className="text-center mb-10 space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                One Plan. One Price.
              </h2>
              <p className="text-muted-foreground text-sm">
                No tiers. No confusing bundles. Just start.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl border-2 border-primary bg-white shadow-2xl shadow-primary/10">
              {/* Popular tag */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-black tracking-wider uppercase shadow-md">
                Best for Meta Ads
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-6xl font-black text-primary leading-none">$1</div>
                  <p className="text-sm text-muted-foreground mt-1">one-time · no subscription</p>
                </div>

                <ul className="space-y-3 text-left">
                  {[
                    'AI script + voiceover per video',
                    'Auto word-level captions',
                    'HD 1080×1920 export (9:16)',
                    'No watermark — your brand',
                    'Credits never expire',
                    'Commercial use included',
                    'Download &amp; post anywhere',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="block">
                  <Button className="w-full h-14 text-lg font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                    Start for $1 Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <p className="text-xs text-muted-foreground">
                  Secure checkout · Instant access · Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── USE CASES ────────────────────────────────────────────── */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Who Uses the $1 Plan?
              </h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                From solo creators to growth marketers — anyone who needs video content without the cost.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {useCases.map((item, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-border/50 bg-white hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 transition-all flex flex-col gap-4"
                >
                  <div className="text-3xl">{item.emoji}</div>
                  <div>
                    <h3 className="font-bold text-base mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-muted/20">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              3 Steps. 60 Seconds.
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-14">
              No software to install. No skills required. Works in your browser.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  step: '01',
                  title: 'Type Your Idea',
                  desc: 'Enter a topic, product name, or paste your script. AutoReels understands any prompt.',
                },
                {
                  step: '02',
                  title: 'AI Builds the Video',
                  desc: 'Script → Voiceover → Captions → Visuals. All assembled automatically in seconds.',
                },
                {
                  step: '03',
                  title: 'Download & Post',
                  desc: 'Get a clean 1080p vertical MP4. Upload directly to Meta Ads Manager or post organically.',
                },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-white font-black text-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px] mx-auto">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-14">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-14 px-10 text-base font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                  Create My First Video — $1
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────── */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Common Questions
              </h2>
            </div>

            <div className="divide-y divide-border/50">
              {faqs.map((item, i) => (
                <div key={i} className="py-5">
                  <h3 className="font-semibold text-base mb-1.5">{item.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ────────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-primary text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12)_0%,transparent_60%)]" />
          <div className="relative container mx-auto max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold tracking-widest uppercase">
              <Zap className="h-3.5 w-3.5" />
              Start in 60 Seconds
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Your First AI Video
              <br />
              Costs Less Than a Coffee.
            </h2>
            <p className="text-lg opacity-90 max-w-xl mx-auto leading-relaxed">
              Stop paying thousands for video production. Get professional-grade Meta ad creatives
              and organic content at $1 — no contracts, no cameras, no editors.
            </p>
            <div className="flex flex-col items-center gap-4 pt-2">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-16 px-14 text-xl font-black rounded-2xl bg-white text-primary hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl"
                >
                  Get Started for $1
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm font-medium tracking-wider opacity-70 uppercase">
                No subscription · No watermark · Credits never expire
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
