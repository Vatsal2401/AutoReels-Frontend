import type { Metadata } from "next";
import Link from "next/link";
import {
  generatePageMetadata,
  generateBreadcrumbSchema,
  SITE_CONFIG,
} from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { InstagramDownloaderTool } from "@/components/tools/InstagramDownloaderTool";
import {
  Download,
  CheckCircle2,
  Zap,
  Shield,
  Smartphone,
  Repeat2,
  Star,
  ArrowRight,
  Link2,
  Clipboard,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = generatePageMetadata({
  title: "Instagram Video Downloader – Download Reels & Videos Free",
  description:
    "Download Instagram videos, reels, and posts instantly with our free Instagram Video Downloader. Fast, HD downloads, no login required.",
  path: "/instagram-video-downloader",
  keywords: [
    "instagram video downloader",
    "download instagram reels",
    "instagram reels downloader",
    "ig video download",
    "download instagram videos online",
    "instagram reel saver",
    "save instagram videos",
    "instagram downloader free",
    "download instagram story",
    "reel download",
  ],
});

const faqs = [
  {
    question: "How do I download Instagram Reels?",
    answer:
      "Copy the Instagram Reel link from the Instagram app (tap Share → Copy Link), paste it into the input box above, then click 'Download Video'. Your video will be ready instantly.",
  },
  {
    question: "Is this Instagram downloader free?",
    answer:
      "Yes, our Instagram Video Downloader is completely free to use. No subscription, no hidden fees, and no watermarks on downloaded videos.",
  },
  {
    question: "Can I download private Instagram videos?",
    answer:
      "No. Our tool only works with public Instagram posts, reels, and videos. Private accounts require the account owner's login — we do not support accessing private content.",
  },
  {
    question: "Do I need to log in to download Instagram videos?",
    answer:
      "No login or Instagram account is required. Simply paste the public video link and download instantly.",
  },
  {
    question: "What video quality can I download?",
    answer:
      "We download videos in the highest available quality — usually HD (1080p) for Reels and standard quality for older posts, exactly as Instagram stores them.",
  },
  {
    question: "Which devices support this Instagram downloader?",
    answer:
      "Our tool works on all devices — iPhone, Android, Windows, Mac, and Linux. It works directly in your browser, no app installation needed.",
  },
  {
    question: "Can I download Instagram Stories?",
    answer:
      "Currently the tool supports public Reels, Videos, and Posts. Instagram Story downloading requires authentication and is coming soon.",
  },
];

const features = [
  {
    icon: Video,
    title: "Download Instagram Reels",
    desc: "Save any public Instagram Reel to your device in HD quality with one click.",
  },
  {
    icon: Download,
    title: "Download Instagram Videos",
    desc: "Download regular Instagram video posts — no account, no login, no hassle.",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    desc: "Videos are fetched and ready to download in seconds, not minutes.",
  },
  {
    icon: Star,
    title: "HD Quality",
    desc: "We fetch the highest available resolution — no compression, no watermarks.",
  },
  {
    icon: Repeat2,
    title: "Unlimited Downloads",
    desc: "No daily limits. Download as many videos as you need, whenever you need.",
  },
  {
    icon: Smartphone,
    title: "Works on Mobile & Desktop",
    desc: "Works perfectly on iPhone, Android, Windows, and Mac — straight from your browser.",
  },
];

export default function InstagramVideoDownloaderPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Instagram Video Downloader", path: "/instagram-video-downloader" },
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Instagram Video Downloader",
    description:
      "Free online tool to download Instagram Reels, Videos, and Posts in HD instantly. No login required.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web, iOS, Android, Windows, macOS",
    url: `${SITE_CONFIG.url}/instagram-video-downloader`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Download Instagram Reels",
      "Download Instagram Videos",
      "HD Quality Downloads",
      "No Login Required",
      "Mobile Compatible",
    ],
    screenshot: `${SITE_CONFIG.ogImageUrl}`,
    softwareVersion: "1.0",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "2341",
      bestRating: "5",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">

          {/* ── HERO + TOOL (above the fold) ── */}
          <section className="pt-16 pb-12 px-4 bg-gradient-to-b from-pink-500/8 via-purple-500/5 to-transparent">
            <div className="container mx-auto max-w-3xl">
              <div className="text-center space-y-4 mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 text-xs font-bold tracking-widest uppercase">
                  <Download className="h-3 w-3" />
                  Instagram Video Downloader
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Download Instagram Videos{" "}
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    &amp; Reels Instantly
                  </span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Free Instagram Video Downloader – Save Reels, Videos, and Posts in HD in seconds. No login required.
                </p>
              </div>

              {/* ── DOWNLOAD TOOL ── */}
              <InstagramDownloaderTool />

              {/* Trust signals */}
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Reels • Videos • Posts
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  No login required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  HD downloads
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-green-500" />
                  100% free
                </span>
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section className="py-16 px-4 border-y border-border/40 bg-muted/30">
            <div className="container mx-auto max-w-4xl">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold">How to Download Instagram Videos</h2>
                <p className="text-muted-foreground mt-2 text-sm">Download any public Instagram Reel or video in 3 easy steps</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: "1",
                    icon: Link2,
                    title: "Copy the Instagram Video Link",
                    desc: "Open Instagram, tap the three-dot menu on the video or Reel, and select 'Copy Link'.",
                    color: "from-pink-500/10 to-pink-500/5 border-pink-500/20",
                    iconColor: "text-pink-500",
                  },
                  {
                    step: "2",
                    icon: Clipboard,
                    title: "Paste the Link into the Downloader",
                    desc: "Paste the copied Instagram URL into the input box at the top of this page.",
                    color: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
                    iconColor: "text-purple-500",
                  },
                  {
                    step: "3",
                    icon: Download,
                    title: "Click Download to Save the Video",
                    desc: "Hit the 'Download Video' button and save the HD video directly to your device.",
                    color: "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20",
                    iconColor: "text-indigo-500",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className={`relative p-6 rounded-2xl border bg-gradient-to-b ${item.color} text-center`}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border border-border text-[11px] font-black flex items-center justify-center">
                      {item.step}
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-background border border-border/50 flex items-center justify-center mx-auto mb-4 mt-2`}>
                      <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                    </div>
                    <h3 className="font-bold text-sm mb-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FEATURES ── */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-5xl">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Everything You Need to Download Instagram Videos
                </h2>
                <p className="text-muted-foreground mt-2 text-sm max-w-xl mx-auto">
                  A powerful, free Instagram downloader built for speed, quality, and ease of use.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((f) => (
                  <div
                    key={f.title}
                    className="p-5 rounded-xl border border-border/40 bg-card hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── SEO CONTENT ── */}
          <section className="py-16 px-4 bg-muted/20 border-y border-border/40">
            <div className="container mx-auto max-w-3xl">
              <article className="prose prose-sm dark:prose-invert max-w-none space-y-6">

                <h2 className="text-2xl font-bold text-foreground">
                  What Is an Instagram Video Downloader?
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  An <strong>Instagram Video Downloader</strong> is a free online tool that lets you save
                  Instagram videos, Reels, and posts directly to your device — without needing the
                  official Instagram app, an account, or any browser extension. Simply paste the public
                  Instagram video link and download in HD quality within seconds.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our tool works directly in your browser on any device — iPhone, Android, Windows PC, or
                  Mac. No software installation, no signup, no subscription required. It's the fastest way
                  to save Instagram content offline.
                </p>

                <h2 className="text-2xl font-bold text-foreground mt-8">
                  How to Download Instagram Reels — Step by Step
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Downloading Instagram Reels has never been easier. Here's the exact process:
                </p>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span><strong className="text-foreground">Open Instagram</strong> on your phone or browser and find the Reel or video you want to download.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span><strong className="text-foreground">Tap the three-dot menu</strong> (⋯) on the Reel and select <em>Copy Link</em>. On desktop, right-click the video and copy the URL from your browser address bar.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span><strong className="text-foreground">Paste the link</strong> into the input box at the top of this page.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <span><strong className="text-foreground">Click Download Video</strong> and the HD video will be saved directly to your device.</span>
                  </li>
                </ol>

                <h2 className="text-2xl font-bold text-foreground mt-8">
                  Why Do People Download Instagram Videos?
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Millions of people download Instagram videos every day for a wide range of legitimate
                  reasons. Here are the most common use cases:
                </p>
                <ul className="space-y-2">
                  {[
                    { title: "Offline Viewing", desc: "Save videos to watch later without an internet connection — perfect for travel, commutes, or areas with poor signal." },
                    { title: "Content Research", desc: "Creators and marketers download competitor or inspiration content to analyze trends, hooks, and editing styles." },
                    { title: "Repurposing Content", desc: "Brand owners save their own branded content to repost, repurpose, or archive when cloud access is unavailable." },
                    { title: "Sharing with Non-Instagram Users", desc: "Share interesting videos with friends or colleagues who are not on Instagram via messaging apps or email." },
                    { title: "Backup and Archiving", desc: "Save important memories, instructional videos, or business content before they get deleted or the account is deactivated." },
                    { title: "Education and Reference", desc: "Students and professionals save tutorials, how-to guides, and instructional Reels for reference." },
                  ].map((item) => (
                    <li key={item.title} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground"><strong className="text-foreground">{item.title}:</strong> {item.desc}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-xl font-bold text-foreground mt-8">
                  Benefits of Using an Online Instagram Downloader
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Compared to screencasting or screen recording, an online Instagram video downloader
                  offers several key advantages:
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Download in the original HD resolution — no quality loss from screen recording compression",
                    "Works instantly in your browser — no app download, no extension installation",
                    "Compatible with all devices and operating systems — iOS, Android, Windows, macOS",
                    "Preserves original audio quality — including background music and voiceover",
                    "Downloads the full video without any watermarks or overlays",
                    "Zero cost — completely free with no daily download limits",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-xl font-bold text-foreground mt-8">
                  Is It Safe and Legal to Download Instagram Videos?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Downloading publicly available Instagram videos for personal use is generally considered
                  safe and acceptable in most jurisdictions. However, there are important rules to follow:
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Only download content from public accounts — never attempt to access private videos",
                    "Do not redistribute, commercially monetize, or claim ownership of content you don't own",
                    "Always credit the original creator when sharing downloaded content",
                    "This tool does not store, log, or share your downloaded videos — all processing is done in real time",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Shield className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-xl font-bold text-foreground mt-8">
                  Looking to Create Your Own Instagram Reels with AI?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you're a content creator looking to grow on Instagram, downloading videos is just the
                  start. <strong>AutoReels</strong> is a free AI-powered tool that generates fully
                  produced Instagram Reels — complete with AI scripts, HD visuals, voiceover, and
                  auto-captions — in under 60 seconds. No camera, no editing skills, no face required.
                </p>
                <Link href="/signup">
                  <Button className="mt-2 h-11 px-6 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 border-0">
                    Create Reels with AI Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </article>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-3xl">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Everything you need to know about downloading Instagram videos
                </p>
              </div>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="p-5 rounded-xl border border-border/40 bg-card"
                  >
                    <h3 className="font-bold text-sm mb-2">{faq.question}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="py-16 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center">
            <div className="container mx-auto max-w-3xl space-y-5">
              <h2 className="text-2xl md:text-3xl font-bold">
                Want to Create Viral Instagram Reels with AI?
              </h2>
              <p className="opacity-90 text-sm md:text-base max-w-xl mx-auto">
                AutoReels generates complete, ready-to-post Instagram Reels in 60 seconds. AI script,
                voiceover, captions, and visuals — no camera, no editing, no face required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link href="/signup">
                  <Button size="lg" className="h-12 px-8 font-black rounded-xl bg-white text-pink-600 hover:bg-slate-100 border-0">
                    Create Reels Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-xs opacity-75">10 free Reels · No credit card</p>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </>
  );
}
