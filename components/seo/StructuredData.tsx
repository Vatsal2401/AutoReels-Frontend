import {
  generateOrganizationSchema,
  generateWebApplicationSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateProductSchema,
  generateVideoObjectSchema,
  SITE_CONFIG,
} from "@/lib/seo";

export function StructuredData() {
  const organizationSchema = generateOrganizationSchema();
  const webAppSchema = generateWebApplicationSchema();
  const faqSchema = generateFAQSchema();
  const howToSchema = generateHowToSchema();
  const productSchema = generateProductSchema();
  const videoObjectSchema = generateVideoObjectSchema({
    name: "How AutoReels Creates Viral Faceless Videos in 60 Seconds",
    description:
      "Watch how AutoReels AI turns a simple idea into a fully produced faceless reel — script, voiceover, captions, and visuals — in under 60 seconds.",
    thumbnailUrl: SITE_CONFIG.ogImageUrl,
    uploadDate: "2026-01-01",
    embedUrl: `${SITE_CONFIG.url}#demo`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectSchema) }}
      />
    </>
  );
}
