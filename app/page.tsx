import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  Play, 
  Zap, 
  Camera, 
  Sparkles, 
  Share2, 
  Settings2, 
  CheckCircle2, 
  ArrowRight,
  MessageSquare,
  Layers,
  Send,
  Video,
  Monitor,
  Users,
  Briefcase,
  GraduationCap,
  Cloud
} from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "AI Video Generator for TikTok, YouTube & Reels",
  description:
    "Generate viral faceless reels in 60 seconds. No editing, no camera, no face needed. Scale your social media presence with AI automation.",
  path: "/",
});

export default function LandingPage() {
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
                  Stop spending hours editing. Turn your ideas into high-engagement shorts 
                  for TikTok, YouTube & Instagram with one click. No camera or face needed.
                </p>
                <div className="flex flex-col items-center gap-4 pt-4">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                    <Link href="/signup" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full h-14 px-10 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]">
                        Start Creating Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="#demo" className="w-full sm:w-auto">
                      <Button variant="outline" size="lg" className="w-full h-14 px-8 text-lg rounded-xl border-border/60 hover:bg-muted/50 transition-all">
                        Watch Demo
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No credit card required • Create in under 60 seconds
                  </p>
                </div>
              </div>

              {/* Product Mockup (Refined based on real dashboard) */}
              <div id="demo" className="mt-16 md:mt-24 relative mx-auto max-w-5xl">
                <div className="absolute -inset-10 bg-primary/20 rounded-[3rem] blur-[100px] opacity-20 pointer-events-none" />
                <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden shadow-2xl shadow-primary/10 animate-float">
                  {/* Dashboard Header Bar */}
                  <div className="h-10 border-b border-border/40 bg-muted/30 flex items-center px-4 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <div className="ml-4 h-5 flex-1 max-w-[400px] bg-background/50 rounded flex items-center px-3 text-[10px] text-muted-foreground">
                      autoreels.in/dashboard/studio
                    </div>
                  </div>
                  
                  {/* Mock UI Content */}
                  <div className="aspect-[16/10] bg-background p-4 md:p-8 flex gap-6 overflow-hidden">
                    {/* Mock Sidebar */}
                    <div className="hidden md:flex flex-col gap-4 w-12 pt-2 items-center opacity-40">
                      <div className="w-8 h-8 rounded-lg bg-primary/10" />
                      <div className="w-8 h-8 rounded-lg bg-muted" />
                      <div className="w-8 h-8 rounded-lg bg-muted" />
                      <div className="w-8 h-8 rounded-lg bg-muted" />
                    </div>
                    
                    {/* Mock Main Application Area */}
                    <div className="flex-1 flex flex-col gap-6">
                       {/* App Header */}
                       <div className="flex justify-between items-center opacity-80">
                         <div className="space-y-1">
                            <div className="h-4 w-32 bg-foreground/10 rounded" />
                            <div className="h-2 w-48 bg-muted-foreground/10 rounded" />
                         </div>
                         <div className="h-8 w-24 bg-primary/20 rounded-lg" />
                       </div>
                       
                       {/* Editor Layout Simulation */}
                       <div className="flex-1 flex gap-6 overflow-hidden">
                          {/* Video Preview Panel */}
                          <div className="flex-[1.5] bg-muted/30 rounded-2xl border border-border/40 flex items-center justify-center relative group/play">
                             <div className="aspect-[9/16] h-full bg-slate-900 rounded-lg overflow-hidden relative shadow-2xl shadow-black/40 border border-white/5">
                                <img 
                                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" 
                                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                                  alt="Mock reel preview"
                                />
                                <div className="absolute inset-x-4 bottom-12 space-y-2">
                                   <div className="h-2 w-full bg-white/20 rounded" />
                                   <div className="h-4 w-3/4 bg-white/40 rounded mx-auto" />
                                   <div className="h-2 w-full bg-white/20 rounded" />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                   <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center animate-pulse">
                                      <Play className="h-5 w-5 fill-white text-white" />
                                   </div>
                                </div>
                             </div>
                          </div>
                          
                          {/* Settings Panel */}
                          <div className="flex-1 hidden md:flex flex-col gap-4">
                             <div className="p-4 bg-muted/20 rounded-xl border border-border/30 space-y-3">
                                <div className="h-3 w-16 bg-foreground/10 rounded" />
                                <div className="h-10 w-full bg-background border border-border/50 rounded-lg" />
                                <div className="h-3 w-20 bg-foreground/10 rounded" />
                                <div className="h-10 w-full bg-background border border-border/50 rounded-lg" />
                             </div>
                             <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3 flex-1">
                                <div className="h-3 w-24 bg-primary/20 rounded" />
                                <div className="space-y-2 opacity-60">
                                   {[1,2,3,4].map(i => (
                                     <div key={i} className="flex gap-2 items-center">
                                       <div className="w-3 h-3 rounded-full bg-primary/30" />
                                       <div className="h-2 flex-1 bg-primary/10 rounded" />
                                     </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Value Propositions (Rewrite for benefits) */}
          <section className="py-24 px-4 container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "Turn Ideas Into Viral Shorts",
                  desc: "Our Neural Pipeline transforms simple text or ideas into polished videos in under 60 seconds."
                },
                {
                  icon: Cloud,
                  title: "Post Daily on Autopilot",
                  desc: "Stop manually posting. Schedule and sync your videos directly to TikTok, IG, and YouTube."
                },
                {
                  icon: Settings2,
                  title: "Customize Voice & Style",
                  desc: "Choose from 50+ realistic AI voices and 12+ visual aesthetics like Cinematic, Anime, and Noir."
                },
                {
                  icon: CheckCircle2,
                  title: "HD Videos With No Watermark",
                  desc: "Own your content. Export professional 1080x1920 HD videos ready for your brand."
                }
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white border border-border/40 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works (Existing Structure but benefit copy) */}
          <section className="py-24 px-4 bg-muted/30">
            <div className="container mx-auto max-w-6xl text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">How AutoReels Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-16">
                Stop spending hours on manual editing. Let our AI Neural Engine handle the 
                creative work while you focus on scaling your channel.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
                {[
                  {
                    step: "01",
                    icon: MessageSquare,
                    title: "Explain Your Vision",
                    desc: "Type a simple idea or paste a script. Our AI understands your intent immediately."
                  },
                  {
                    step: "02",
                    icon: Layers,
                    title: "AI Crafts the Video",
                    desc: "We generate the perfect script, visual scenes, narration, and background music."
                  },
                  {
                    step: "03",
                    icon: Send,
                    title: "Ready to Post",
                    desc: "Download in HD or let us auto-post to your social accounts while you sleep."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center space-y-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-border/50 shadow-md flex items-center justify-center text-primary font-bold text-xl">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <span className="text-primary font-bold text-xs tracking-widest uppercase opacity-40">{item.step}</span>
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

          {/* NEW Use-Case Section */}
          <section className="py-24 px-4 container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Built for Modern Creators</h2>
              <p className="text-muted-foreground">Whatever your niche, AutoReels accelerates your output.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Video,
                  title: "TikTok Creators",
                  desc: "Produce 5-10 viral videos per day without burning out on editing."
                },
                {
                  icon: Users,
                  title: "Faceless Instagram Pages",
                  desc: "Build massive following accounts without ever showing your face."
                },
                {
                  icon: Briefcase,
                  title: "Affiliate Marketers",
                  desc: "Create quick product review or demo shorts to drive link clicks."
                },
                {
                  icon: Monitor,
                  title: "YouTube Shorts Pages",
                  desc: "Scale your revenue by automating the production of high-CPM content."
                },
                {
                  icon: GraduationCap,
                  title: "Coaches & SaaS Founders",
                  desc: "Turn your insights and feature updates into snackable video content."
                }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl border border-border/30 hover:border-primary/20 hover:bg-primary/[0.02] transition-colors flex gap-4 items-start">
                   <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="font-bold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </section>

          {/* Social Proof (Updated for authenticity) */}
          <section className="py-24 px-4 bg-muted/20">
            <div className="container mx-auto max-w-6xl text-center">
              <div className="mb-16 space-y-2">
                <p className="text-sm font-bold tracking-widest text-primary uppercase">Why creators love us</p>
                <h2 className="text-3xl font-bold tracking-tight">Trusted by 10,000+ Creators Worldwide</h2>
                <div className="flex justify-center gap-8 pt-6 opacity-60">
                   <div className="text-center">
                      <div className="text-xl font-bold text-foreground underline decoration-primary lg:text-2xl">10k+</div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Generated</div>
                   </div>
                   <div className="text-center">
                      <div className="text-xl font-bold text-foreground underline decoration-primary lg:text-2xl">90%</div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Time Saved</div>
                   </div>
                   <div className="text-center">
                      <div className="text-xl font-bold text-foreground underline decoration-primary lg:text-2xl">24/7</div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Support</div>
                   </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {[
                  {
                    name: "Alex Rivera",
                    role: "Faceless Page Owner",
                    img: "https://i.pravatar.cc/150?u=alex",
                    content: "AutoReels cut my production time by 90%. I went from posting twice a week to three times a day. My views have exploded."
                  },
                  {
                    name: "Sarah Chen",
                    role: "YouTube Marketer",
                    img: "https://i.pravatar.cc/150?u=sarah",
                    content: "The AI voices in the Neural Pipeline are incredibly human. My audience has no idea these videos are AI-generated."
                  },
                  {
                    name: "Marcus Thorne",
                    role: "Affiliate Page Owner",
                    img: "https://i.pravatar.cc/150?u=marcus",
                    content: "Managing 15 client accounts used to be a nightmare. AutoReels' auto-scheduling is the ultimate lifesaver for my agency."
                  }
                ].map((item, i) => (
                  <div key={i} className="p-8 rounded-2xl bg-white border border-border/40 shadow-sm">
                    <div className="flex gap-1 mb-6 text-yellow-500">
                      {[1,2,3,4,5].map(s => (
                        <Sparkles key={s} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-base italic mb-6 leading-relaxed opacity-90">"{item.content}"</p>
                    <div className="flex items-center gap-3">
                      <img src={item.img} className="w-10 h-10 rounded-full grayscale hover:grayscale-0 transition-all" alt={item.name} />
                      <div>
                        <h4 className="font-bold text-sm">{item.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-medium">{item.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section (Credit Bundles) */}
          <section id="pricing" className="py-24 px-4 container mx-auto max-w-6xl text-center">
            <div className="mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Simple, Credit-Based Pricing</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                No monthly subscriptions. No hidden fees. <br className="hidden sm:block" />
                Buy credits as you need them and scale at your own pace.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3" />
                    Credits Never Expire
                 </span>
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3" />
                    Pay As You Go
                 </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "Starter Pack",
                  credits: "10",
                  price: "9",
                  perCredit: "0.90",
                  bonus: null,
                  bestFor: "For testing the waters",
                  cta: "Purchase"
                },
                {
                  name: "Creator Pack",
                  credits: "25",
                  price: "20",
                  perCredit: "0.74",
                  bonus: "+2 bonus",
                  popular: true,
                  bestFor: "Best for growing creators",
                  cta: "Purchase"
                },
                {
                  name: "Influencer Pack",
                  credits: "50",
                  price: "35",
                  perCredit: "0.64",
                  bonus: "+5 bonus",
                  bestFor: "Best for daily content",
                  cta: "Purchase"
                },
                {
                  name: "Enterprise Pack",
                  credits: "100",
                  price: "60",
                  perCredit: "0.52",
                  bonus: "+15 bonus",
                  bestFor: "Best for power users",
                  cta: "Purchase"
                }
              ].map((plan, i) => (
                <div key={i} className={cn(
                  "relative p-8 rounded-2xl border flex flex-col transition-all text-left",
                  plan.popular ? "border-primary shadow-xl scale-[1.02] bg-white ring-1 ring-primary/20" : "border-border/60 bg-card/10"
                )}>
                  {plan.bonus && (
                    <div className="absolute top-4 right-4 px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 text-[10px] font-bold">
                      {plan.bonus}
                    </div>
                  )}
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6 space-y-1">
                    <h3 className="text-lg font-bold tracking-tight">{plan.name}</h3>
                    <div className="text-3xl font-black text-foreground">
                       {plan.credits} Credits
                    </div>
                    <div className="flex items-baseline gap-1.5 pt-1">
                       <span className="text-xl font-bold">${plan.price}</span>
                       <span className="text-xs text-muted-foreground font-medium">
                         • ${plan.perCredit} per credit
                       </span>
                    </div>
                  </div>
                  <div className="flex-1 mb-8">
                     <p className="text-xs text-muted-foreground font-medium italic">
                        {plan.bestFor}
                     </p>
                  </div>
                  <Link href="/signup">
                    <Button variant={plan.popular ? "default" : "outline"} className="w-full rounded-xl font-bold h-11">
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-24 px-4 bg-primary text-white text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
             <div className="container mx-auto max-w-4xl relative z-10 space-y-8">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                   Go Viral Without Ever Showing Your Face
                </h2>
                <p className="text-xl opacity-90 leading-relaxed max-w-2xl mx-auto">
                   Join 10,000+ creators building profitable faceless channels with 
                   the most advanced AI video engine in the world.
                </p>
                <div className="pt-4 flex flex-col items-center gap-6">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-16 px-12 text-xl font-black rounded-2xl bg-white text-[#6366f1] hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl">
                       Create Your First Video Now
                    </Button>
                  </Link>
                  <p className="text-sm font-bold tracking-widest uppercase opacity-60">
                    No credit card required • Cancel anytime
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
  return classes.filter(Boolean).join(" ");
}
