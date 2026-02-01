import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/contact/ContactForm";
import { generatePageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Mail, MessageSquare } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with AutoReels. Have questions, feedback, or need support? Contact our team and we'll get back to you as soon as possible.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-12 space-y-3">
              <h1 className="text-4xl font-bold leading-tight">Contact Us</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Have questions or feedback? We'd love to hear from you. Get in touch 
                and we'll respond as soon as possible.
              </p>
            </div>

            <div className="grid gap-12 md:grid-cols-2">
              {/* Contact Information */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold leading-tight">Get in Touch</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Reach out to us through any of the following channels:
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold leading-tight">Email</h3>
                      <p className="text-muted-foreground leading-tight">support@autoreels.in</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        We typically respond within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 shrink-0">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold leading-tight">Support</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        For technical issues or account questions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
