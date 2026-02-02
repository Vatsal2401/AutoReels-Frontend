import {
  generateOrganizationSchema,
  generateWebApplicationSchema,
  generateFAQSchema,
  generateHowToSchema,
} from '@/lib/seo';

export function StructuredData() {
  const organizationSchema = generateOrganizationSchema();
  const webAppSchema = generateWebApplicationSchema();
  const faqSchema = generateFAQSchema();
  const howToSchema = generateHowToSchema();

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
    </>
  );
}
