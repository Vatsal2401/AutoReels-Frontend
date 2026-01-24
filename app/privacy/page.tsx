import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { generatePageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "Privacy Policy",
  description:
    "Read AI Reels' Privacy Policy to understand how we collect, use, and protect your personal information when you use our video generation platform.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-10 space-y-2">
              <h1 className="text-4xl font-bold leading-tight">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground leading-tight">
                Last updated: {new Date().toLocaleDateString("en-US", { 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </p>
            </div>

            <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground leading-tight">
                  1. Introduction
                </h2>
                <p className="leading-relaxed">
                  AI Reels ("we," "our," or "us") is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard 
                  your information when you use our video generation platform.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  2. Information We Collect
                </h2>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  2.1 Information You Provide
                </h3>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Account information (email address, name)</li>
                  <li>Content you create (video topics, scripts, generated videos)</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Communications with our support team</li>
                </ul>

                <h3 className="mb-2 mt-4 text-xl font-semibold text-foreground">
                  2.2 Automatically Collected Information
                </h3>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Usage patterns and interaction data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  3. How We Use Your Information
                </h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Provide and improve our video generation services</li>
                  <li>Process transactions and manage your account</li>
                  <li>Send you service-related communications</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Detect and prevent fraud or abuse</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  4. Data Sharing and Disclosure
                </h2>
                <p>We do not sell your personal information. We may share your information with:</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Service providers who assist in operating our platform</li>
                  <li>Payment processors for transaction handling</li>
                  <li>Legal authorities when required by law</li>
                  <li>Business partners with your explicit consent</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  5. Data Security
                </h2>
                <p>
                  We implement industry-standard security measures to protect your information, 
                  including encryption, secure servers, and access controls. However, no method 
                  of transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  6. Your Rights
                </h2>
                <p>You have the right to:</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Rectify inaccurate or incomplete information</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  7. Cookies and Tracking
                </h2>
                <p>
                  We use cookies and similar technologies to enhance your experience, analyze 
                  usage, and assist in marketing efforts. You can control cookie preferences 
                  through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  8. Children's Privacy
                </h2>
                <p>
                  Our services are not intended for users under the age of 13. We do not 
                  knowingly collect personal information from children under 13.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  9. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you 
                  of any changes by posting the new policy on this page and updating the 
                  "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  10. Contact Us
                </h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <p className="mt-2">
                  <strong>Email:</strong> privacy@aireels.com
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
