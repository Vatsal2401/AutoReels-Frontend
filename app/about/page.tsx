import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { generatePageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "About Us",
  description:
    "Learn about AutoReels - the revolutionary platform that generates viral faceless reels in 60 seconds using AI. Discover our mission, vision, and commitment to empowering content creators.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="mb-8 text-4xl font-bold leading-tight">About AutoReels</h1>
            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                AutoReels is revolutionizing the way content creators produce video content. 
                We believe that everyone should be able to create professional, engaging 
                video reels without the need for expensive equipment, editing skills, or 
                even appearing on camera.
              </p>

              <h2 className="mt-8 text-2xl font-semibold text-foreground">Our Mission</h2>
              <p>
                Our mission is to democratize video content creation by making it accessible 
                to everyone. We use cutting-edge AI technology to generate complete video 
                reels in just 60 seconds - from script to final video, all automatically.
              </p>

              <h2 className="mt-8 text-2xl font-semibold text-foreground">What We Do</h2>
              <p>
                AutoReels uses advanced artificial intelligence to:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Generate engaging scripts based on your topic</li>
                <li>Create professional audio narration</li>
                <li>Add dynamic captions and visuals</li>
                <li>Produce Instagram, TikTok, and YouTube Shorts-ready content</li>
              </ul>

              <h2 className="mt-8 text-2xl font-semibold text-foreground">Why Choose Us</h2>
              <p>
                We understand that content creation can be time-consuming and expensive. 
                That's why we've built a platform that eliminates the need for:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Video editing software or skills</li>
                <li>Camera equipment or studio setup</li>
                <li>Hours of production time</li>
                <li>Hiring video editors or content creators</li>
              </ul>

              <h2 className="mt-8 text-2xl font-semibold text-foreground">Our Commitment</h2>
              <p>
                We're committed to providing you with the best AI-powered video generation 
                experience. Our platform is constantly evolving, and we're always working 
                to improve the quality and speed of our video generation technology.
              </p>

              <p className="mt-8 text-lg">
                Join thousands of creators who are already using AutoReels to grow their 
                audience and create viral content. Start creating today - no credit card required.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
