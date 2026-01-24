import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Play, Zap, Camera, Sparkles } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "Generate Viral Faceless Reels in 60 Seconds",
  description:
    "Create professional video reels in 60 seconds with AI. No editing, no camera needed. Generate viral content for Instagram, TikTok, and YouTube Shorts automatically.",
  path: "/",
});

export default function LandingPage() {
  return (
    <>
      <StructuredData />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
        {/* Hero Section */}
        <section
          aria-label="Hero section"
          className="relative flex min-h-[90vh] items-center justify-center bg-gradient-to-b from-primary/10 to-background px-4 py-20"
        >
          <div className="container mx-auto text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Generate Viral Faceless Reels
              <br />
              <span className="text-primary">in 60 Seconds</span>
            </h1>
            <p className="mb-10 text-xl text-muted-foreground leading-relaxed sm:text-2xl">
              No editing. No camera. Just AI magic.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Creating Free
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground leading-tight">
              No credit card required • Join 10,000+ creators
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" aria-label="Features" className="py-24 px-4">
          <div className="container mx-auto">
            <h2 className="mb-16 text-center text-3xl font-bold leading-tight">
              Everything you need to go viral
            </h2>
            <div className="grid gap-10 md:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-5">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold leading-tight">Zero Editing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Just enter a topic, get a video. No editing skills required.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-5">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold leading-tight">60-Second Generation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  From idea to Instagram-ready in under a minute.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-5">
                    <Camera className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold leading-tight">Faceless & Professional</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No camera needed. Create professional content without showing your face.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          aria-label="How it works"
          className="bg-muted py-24 px-4"
        >
          <div className="container mx-auto">
            <h2 className="mb-16 text-center text-3xl font-bold leading-tight">How It Works</h2>
            <div className="grid gap-10 md:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="text-5xl font-bold text-primary leading-none">1</div>
                <h3 className="text-xl font-semibold leading-tight">Enter Your Topic</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tell us what your reel is about. Be as specific as you want.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="text-5xl font-bold text-primary leading-none">2</div>
                <h3 className="text-xl font-semibold leading-tight">AI Generates Content</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our AI creates script, audio, captions, and visuals automatically.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="text-5xl font-bold text-primary leading-none">3</div>
                <h3 className="text-xl font-semibold leading-tight">Download & Share</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get your video ready to post on Instagram, TikTok, or YouTube Shorts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section id="pricing" aria-label="Pricing" className="py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="mb-16 text-center text-3xl font-bold leading-tight">Simple Pricing</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-lg border border-border/50 p-8 space-y-6">
                <div>
                  <h3 className="mb-2 text-2xl font-semibold leading-tight">Free</h3>
                  <p className="mb-1 text-4xl font-bold leading-none">$0</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <span className="leading-tight">3 videos per month</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <span className="leading-tight">Watermarked videos</span>
                  </li>
                </ul>
                <Link href="/signup" className="block pt-2">
                  <Button variant="outline" className="w-full">
                    Start Free
                  </Button>
                </Link>
              </div>
              <div className="rounded-lg border-2 border-primary p-8 space-y-6 relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold leading-tight">Pro</h3>
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground leading-tight">
                    Popular
                  </span>
                </div>
                <div>
                  <p className="mb-1 text-4xl font-bold leading-none">$9<span className="text-lg font-normal">/month</span></p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <span className="leading-tight">Unlimited videos</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <span className="leading-tight">No watermark</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <span className="leading-tight">Priority support</span>
                  </li>
                </ul>
                <Link href="/signup" className="block pt-2">
                  <Button className="w-full">Start Free</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
