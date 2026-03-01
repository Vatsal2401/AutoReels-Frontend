import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PricingSection } from '@/components/landing/PricingSection';
import {
  Sparkles,
  Settings2,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Layers,
  Send,
  Cloud,
} from 'lucide-react';
import { generatePageMetadata } from '@/lib/seo';
import { StructuredData } from '@/components/seo/StructuredData';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { ToolsSection } from '@/components/landing/ToolsSection';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePageMetadata({
  title: 'AI Video Generator for TikTok, YouTube & Reels',
  description:
    'Generate viral faceless reels in 60 seconds. No editing, no camera, no face needed. Scale your social media presence with AI automation.',
  path: '/',
});

async function getShowcaseItems() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/showcase`, {
      next: { revalidate: 3600 }, // ISR — revalidate every 60 min
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const showcaseItems = await getShowcaseItems();
  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 px-4 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center space-y-8 animate-in fade-in-0 duration-1000">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-tight uppercase">
                  <Sparkles className="h-3 w-3" />
                  Neural Pipeline V3 is Live
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground max-w-4xl mx-auto">
                  Create Viral Faceless Videos
                  <br className="hidden md:block" />
                  For Social Media
                  <span className="text-primary italic px-2">— In Seconds</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Type a topic. AutoReels writes the script, adds an AI voiceover, syncs captions,
                  and assembles a ready-to-post video — in under 60 seconds. No camera. No editing.
                </p>
                <div className="flex flex-col items-center gap-4 pt-4">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                    <Link href="/signup" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        className="w-full h-14 px-10 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]"
                      >
                        Start Creating Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="#showcase" className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-14 px-8 text-lg rounded-xl border-border/60 hover:bg-muted/50 transition-all"
                      >
                        See Examples
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No credit card required • Create in under 60 seconds
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* Real video showcase — fetched from /showcase */}
          <ShowcaseSection initialItems={showcaseItems} />

          {/* Value Propositions (Rewrite for benefits) */}
          <section className="py-24 px-4 container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: 'AI Script + Voiceover',
                  desc: 'Enter a topic — AutoReels writes the script and generates a natural AI voiceover. No recording required.',
                },
                {
                  icon: Cloud,
                  title: 'Auto Captions & Visuals',
                  desc: 'Word-level captions sync automatically to the audio. Paired with matching visuals for your niche.',
                },
                {
                  icon: Settings2,
                  title: 'Pick Your Style & Voice',
                  desc: 'Choose from 50+ AI voices and 12+ visual styles — Cinematic, Minimal, Neon, and more.',
                },
                {
                  icon: CheckCircle2,
                  title: 'Download in HD, No Watermark',
                  desc: 'Export 1080×1920 vertical videos, ready to post. Your content, your brand — no watermark.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-8 rounded-2xl bg-white border border-border/40 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works (Existing Structure but benefit copy) */}
          <section className="py-24 px-4 bg-muted/30">
            <div className="container mx-auto max-w-6xl text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                How AutoReels Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-16">
                Stop spending hours on manual editing. Let our AI Neural Engine handle the creative
                work while you focus on scaling your channel.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
                {[
                  {
                    step: '01',
                    icon: MessageSquare,
                    title: 'Explain Your Vision',
                    desc: 'Type a simple idea or paste a script. Our AI understands your intent immediately.',
                  },
                  {
                    step: '02',
                    icon: Layers,
                    title: 'AI Crafts the Video',
                    desc: 'We write the script, generate an AI voiceover, sync word-level captions, and pair matching images — automatically.',
                  },
                  {
                    step: '03',
                    icon: Send,
                    title: 'Ready to Post',
                    desc: 'Download clean 1080p vertical videos, ready to post on any platform instantly.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center space-y-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-border/50 shadow-md flex items-center justify-center text-primary font-bold text-xl">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <span className="text-primary font-bold text-xs tracking-widest uppercase opacity-40">
                        {item.step}
                      </span>
                      <h3 className="text-2xl font-bold mt-1 mb-3">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <ToolsSection />

          {/* Early Access — Who This Is For */}
          <section className="py-24 px-4 bg-muted/20">
            <div className="container mx-auto max-w-6xl">
              {/* Early access badge */}
              <div className="text-center mb-14 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Early Access — Now Open
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Built for Creators Who Want to Post More, Edit Less
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
                  AutoReels is in early access. Founding creators get priority support, lowest prices, and direct input on what we build next.
                </p>
              </div>

              {/* Creator type cards — no fake names, no fake avatars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: '🎬',
                    role: 'Faceless Page Owners',
                    niche: 'Facts · Motivation · History',
                    desc: 'Build a page around a niche you love — without showing your face or recording a single word. AutoReels handles script, voice, and visuals.',
                    outcome: 'Post daily without burnout',
                  },
                  {
                    icon: '📱',
                    role: 'Short-Form Creators',
                    niche: 'TikTok · Reels · Shorts',
                    desc: 'Volume wins on short-form platforms. Create a week\'s worth of content in an hour — consistent quality, consistent posting.',
                    outcome: 'More content, same effort',
                  },
                  {
                    icon: '💼',
                    role: 'Coaches & Founders',
                    niche: 'Finance · Health · Business',
                    desc: 'Turn your expertise into daily video content without hiring an editor. Share insights, tips, and updates in snackable video form.',
                    outcome: 'Grow your audience on autopilot',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-white border border-border/40 shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all flex flex-col gap-4"
                  >
                    <div className="text-3xl">{item.icon}</div>
                    <div>
                      <h3 className="font-bold text-base">{item.role}</h3>
                      <p className="text-[11px] font-semibold text-primary/70 tracking-wide mt-0.5">{item.niche}</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-xs font-semibold text-foreground">{item.outcome}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Honest founding CTA */}
              <div className="mt-12 p-6 md:p-8 rounded-2xl bg-primary/5 border border-primary/15 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <p className="font-bold text-base">Be a founding creator.</p>
                  <p className="text-sm text-muted-foreground">
                    Early adopters get the lowest credit prices — locked in forever. No subscription. Credits never expire.
                  </p>
                </div>
                <Link href="/signup" className="shrink-0">
                  <Button className="h-11 px-8 rounded-xl font-bold shadow-sm shadow-primary/20">
                    Join Early Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Pricing Section (Credit Bundles) */}
          <PricingSection />

          {/* FAQ Section */}
          <section className="py-24 px-4 bg-muted/20">
            <div className="container mx-auto max-w-3xl">
              <div className="text-center mb-12 space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground text-sm">
                  Everything you need to know before you start.
                </p>
              </div>

              <div className="divide-y divide-border/50">
                {[
                  {
                    q: 'How long does it take to create a video?',
                    a: 'Most videos are ready in under 60 seconds. Longer scripts or higher-resolution exports may take up to 2 minutes.',
                  },
                  {
                    q: 'Do I need any video editing experience?',
                    a: 'None. Type a topic, choose a voice and style, and AutoReels handles everything — script, voiceover, captions, and visuals.',
                  },
                  {
                    q: 'What kinds of videos can AutoReels make?',
                    a: 'Vertical short-form videos (9:16) optimised for TikTok, Instagram Reels, and YouTube Shorts. Fact videos, motivational content, tips, product explainers — any niche that works well as a faceless talking-style reel.',
                  },
                  {
                    q: 'Do I need to show my face or record audio?',
                    a: 'No. Every video uses an AI voiceover and AI-selected images. You never need a camera, microphone, or studio.',
                  },
                  {
                    q: 'How many free videos do I get?',
                    a: 'New accounts start with 10 free video credits. No credit card required to sign up and use them.',
                  },
                  {
                    q: 'Do credits expire?',
                    a: 'Never. Credits you purchase stay in your account indefinitely — use them at your own pace.',
                  },
                  {
                    q: 'Can I use the videos commercially?',
                    a: 'Yes. You own the videos you create. Post them on any platform, monetise them, or use them in paid campaigns.',
                  },
                  {
                    q: 'Is there a monthly subscription?',
                    a: 'No subscription. AutoReels is credit-based — buy credits when you need them. Founding creators lock in the lowest price per video, permanently.',
                  },
                ].map((item, i) => (
                  <div key={i} className="py-5">
                    <h3 className="font-semibold text-base mb-1.5">{item.q}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-24 px-4 bg-primary text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
            <div className="container mx-auto max-w-4xl relative z-10 space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                Start Posting. Without a Camera.
              </h2>
              <p className="text-xl opacity-90 leading-relaxed max-w-2xl mx-auto">
                Type a topic, get a ready-to-post video in 60 seconds. AI script, voiceover,
                captions, and visuals — all done for you.
              </p>
              <div className="pt-4 flex flex-col items-center gap-6">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full h-16 px-12 text-xl font-black rounded-2xl bg-white text-[#6366f1] hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl"
                  >
                    Create Your First Video Now
                  </Button>
                </Link>
                <p className="text-sm font-bold tracking-widest uppercase opacity-60">
                  No credit card required • Credits never expire
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
