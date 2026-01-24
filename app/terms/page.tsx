import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { generatePageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "Terms of Service",
  description:
    "Read AI Reels' Terms of Service to understand the rules and guidelines for using our AI-powered video generation platform.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-10 space-y-2">
              <h1 className="text-4xl font-bold leading-tight">Terms of Service</h1>
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
                  1. Acceptance of Terms
                </h2>
                <p className="leading-relaxed">
                  By accessing and using AI Reels ("the Service"), you accept and agree to 
                  be bound by the terms and provision of this agreement. If you do not 
                  agree to these Terms of Service, please do not use our Service.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  2. Description of Service
                </h2>
                <p>
                  AI Reels provides an AI-powered platform that generates video reels 
                  automatically based on user-provided topics. The Service includes script 
                  generation, audio narration, visual creation, and video compilation.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  3. User Accounts
                </h2>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  3.1 Account Creation
                </h3>
                <p>
                  You must create an account to use certain features of the Service. You 
                  agree to provide accurate, current, and complete information during 
                  registration.
                </p>

                <h3 className="mb-2 mt-4 text-xl font-semibold text-foreground">
                  3.2 Account Security
                </h3>
                <p>
                  You are responsible for maintaining the confidentiality of your account 
                  credentials and for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  4. Acceptable Use
                </h2>
                <p>You agree not to:</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Violate any laws in your jurisdiction</li>
                  <li>Infringe upon intellectual property rights</li>
                  <li>Transmit any harmful code, viruses, or malware</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Use the Service to create content that is defamatory, hateful, or discriminatory</li>
                  <li>Resell or redistribute content generated through the Service without proper licensing</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  5. Content Ownership and Licensing
                </h2>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  5.1 User Content
                </h3>
                <p>
                  You retain ownership of content you create using the Service. By using 
                  the Service, you grant us a license to use, store, and process your 
                  content as necessary to provide the Service.
                </p>

                <h3 className="mb-2 mt-4 text-xl font-semibold text-foreground">
                  5.2 Generated Content
                </h3>
                <p>
                  Videos generated through the Service are provided for your use. You are 
                  responsible for ensuring that generated content complies with platform 
                  guidelines and applicable laws.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  6. Subscription and Payment
                </h2>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  6.1 Free Plan
                </h3>
                <p>
                  We offer a free plan with limited features. Free plan users may have 
                  watermarked videos and usage limitations.
                </p>

                <h3 className="mb-2 mt-4 text-xl font-semibold text-foreground">
                  6.2 Paid Plans
                </h3>
                <p>
                  Paid subscriptions are billed on a recurring basis. You agree to pay 
                  all fees associated with your subscription. Fees are non-refundable 
                  except as required by law.
                </p>

                <h3 className="mb-2 mt-4 text-xl font-semibold text-foreground">
                  6.3 Cancellation
                </h3>
                <p>
                  You may cancel your subscription at any time. Cancellation takes effect 
                  at the end of the current billing period.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  7. Service Availability
                </h2>
                <p>
                  We strive to maintain high availability but do not guarantee uninterrupted 
                  access to the Service. We may perform maintenance, updates, or modifications 
                  that temporarily affect availability.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  8. Intellectual Property
                </h2>
                <p>
                  The Service, including its original content, features, and functionality, 
                  is owned by AI Reels and protected by international copyright, trademark, 
                  and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  9. Limitation of Liability
                </h2>
                <p>
                  To the maximum extent permitted by law, AI Reels shall not be liable for 
                  any indirect, incidental, special, consequential, or punitive damages 
                  resulting from your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  10. Termination
                </h2>
                <p>
                  We reserve the right to terminate or suspend your account and access to 
                  the Service immediately, without prior notice, for conduct that we 
                  believe violates these Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  11. Changes to Terms
                </h2>
                <p>
                  We reserve the right to modify these Terms of Service at any time. 
                  We will notify users of significant changes. Continued use of the 
                  Service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  12. Contact Information
                </h2>
                <p>
                  If you have questions about these Terms of Service, please contact us at:
                </p>
                <p className="mt-2">
                  <strong>Email:</strong> legal@aireels.com
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
