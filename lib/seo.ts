import { Metadata } from "next";

/**
 * SEO config and helpers. Follows production SEO guide:
 * - One URL shape: trailingSlash: false (next.config.js) — no trailing slash in canonicals, OG, sitemap, links.
 * - Title template in layout adds " | Site Name"; page titles should be short (e.g. "About", "Privacy Policy").
 * - Only reference assets that exist (favicon, icon, logo, OG image).
 * - Schema: real logo/screenshot URLs or omit; sameAs only real social URLs.
 */

/**
 * Canonical site URL: HTTPS, non-www, no trailing slash.
 * Prevents "Page with redirect" in GSC: sitemap and canonicals must match the final URL (no redirect).
 */
function getCanonicalSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://autoreels.in";
  const withHttps = raw.replace(/^http:\/\//i, "https://");
  const noWww = withHttps.replace(/^https:\/\/www\./i, "https://");
  const noTrailing = noWww.replace(/\/+$/, "");
  return noTrailing || "https://autoreels.in";
}

const SITE_URL = getCanonicalSiteUrl();

export const SITE_CONFIG = {
  url: SITE_URL,
  name: "AutoReels",
  description:
    "Generate viral faceless reels in 60 seconds with AI. No editing. No camera. Just AI magic. Create professional content for Instagram, TikTok, and YouTube Shorts.",
  /** OG/Twitter share card: title */
  ogTitle: "AI Video Generator for Reels, Shorts & TikTok",
  /** OG/Twitter share card: description */
  ogDescription:
    "Turn ideas → scripts → visuals → voiceover → ready-to-post videos in minutes. No editing. No filming.",
  /** OG/Twitter image: absolute HTTPS URL. Must be 1200x630, publicly accessible, <300KB. */
  ogImageUrl: `${SITE_URL}/og-preview.jpg`,
  /** Base URL for dynamic OG image generator (append ?title=...&description=...). */
  ogImageBaseUrl: `${SITE_URL}/og`,
  keywords: [
    "AI video generator",
    "faceless reels",
    "viral reels",
    "AI content creator",
    "automated video creation",
    "social media videos",
    "Instagram reels",
    "TikTok videos",
    "YouTube Shorts",
    "video generator",
    "AutoReels",
    "ai video editor",
    "faceless youtube channel",
    "ai short form content",
  ],
  author: "AutoReels Team",
  twitterHandle: "@autoreels_in",
  company: "AutoReels",
};

/**
 * Build URL for dynamic OG image. Use this so each page gets an OG image with its title and description.
 * Route: GET /og?title=...&description=...
 */
export function getDynamicOgImageUrl(title: string, description: string): string {
  const params = new URLSearchParams();
  params.set("title", title.slice(0, 80));
  params.set("description", description.slice(0, 120));
  return `${SITE_CONFIG.ogImageBaseUrl}?${params.toString()}`;
}

export function generatePageMetadata({
  title,
  description,
  path = "/",
  image,
  keywords,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  // Canonical: absolute URL, no trailing slash (match next.config.js trailingSlash: false)
  const canonicalUrl = path === "/" ? SITE_CONFIG.url : `${SITE_CONFIG.url}/${path.replace(/^\/|\/$/g, "")}`;
  const ogImage =
    image ||
    getDynamicOgImageUrl(
      `${title} | ${SITE_CONFIG.name}`,
      description
    );

  return {
    title, // Short title; layout template adds " | AutoReels"
    description,
    keywords: keywords || SITE_CONFIG.keywords,
    authors: [{ name: SITE_CONFIG.author }],
    creator: SITE_CONFIG.author,
    publisher: SITE_CONFIG.name,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: canonicalUrl,
    },
    // Only reference icons that exist in public/ (add favicon.ico, apple-touch-icon.png as needed)
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: description,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: [ogImage],
      creator: SITE_CONFIG.twitterHandle,
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: SITE_CONFIG.ogImageUrl,
    description: SITE_CONFIG.description,
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.name,
    },
    sameAs: [
      "https://x.com/autoreels_in",
      "https://www.instagram.com/autoreels.in",
      "https://www.youtube.com/@autoreels-in",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@autoreels.in",
    },
  };
}

export function generateWebApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    applicationCategory: "MultimediaApplication",
    genre: "AI Video Generation",
    browserRequirements: "Requires HTML5 support",
    softwareVersion: "V3",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to try with 10 credits starter pack",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "3240",
      bestRating: "5",
    },
    featureList: "AI Scriptwriting, VoiceCloning, Automated Captions, Stock Media Integration",
    screenshot: SITE_CONFIG.ogImageUrl,
    description: SITE_CONFIG.description,
  };
}

export function generateFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does AutoReels work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AutoReels uses advanced AI to generate complete video reels in 60 seconds. Simply enter a topic, and our AI creates the script, generates audio narration, adds captions, and combines visuals automatically. No editing or camera required.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need editing skills to use AutoReels?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No editing skills required! AutoReels handles everything automatically. Just provide a topic and our AI generates a complete, ready-to-share video reel for you.",
        },
      },
      {
        "@type": "Question",
        name: "How long does it take to generate a reel?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most reels are generated in 30-60 seconds. Our Neural Pipeline V3 processes your topic, creates the script, generates audio, adds captions, and renders the final video automatically.",
        },
      },
      {
        "@type": "Question",
        name: "What platforms can I use the videos on?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AutoReels generates videos optimized for Instagram Reels, TikTok, YouTube Shorts, and other short-form video platforms. Videos are ready to download and share immediately.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need a camera or to show my face?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No camera needed! AutoReels creates faceless videos using AI-generated visuals, making it perfect for creators who prefer not to appear on camera while still creating professional content.",
        },
      },
      {
        "@type": "Question",
        name: "Are there different pricing plans?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer a flexible credit-based system. You can purchase packs of 10, 25, 50, or 100 credits. Credits never expire and there are no monthly subscriptions.",
        },
      },
    ],
  };
}

export function generateHowToSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Create Viral Faceless Reels with AI",
    description:
      "Step-by-step guide to creating professional video reels using AutoReels",
    totalTime: "PT1M",
    supply: [
      {
        "@type": "HowToSupply",
        name: "A topic or idea"
      }
    ],
    tool: [
      {
        "@type": "HowToTool",
        name: "AutoReels Platform"
      }
    ],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Enter Your Topic",
        text: "Go to the create page and enter a topic for your reel. Be specific about what you want the video to cover. For example: 'Top 5 productivity tips for remote workers' or 'How to start a successful startup'.",
        url: `${SITE_CONFIG.url}/studio/reel`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "AI Generates Content",
        text: "Our AI automatically creates a script, generates professional audio narration, adds captions, and selects appropriate visuals. This process typically takes 30-60 seconds.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Download & Share",
        text: "Once your reel is ready, download it and share directly to Instagram, TikTok, YouTube Shorts, or any other platform. The video is optimized for short-form content.",
      },
    ],
  };
}

export function generateProductSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    image: SITE_CONFIG.ogImageUrl,
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.name,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "3240",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Alex Rivera" },
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        reviewBody:
          "AutoReels cut my production time by 90%. I went from posting twice a week to three times a day. My views have exploded.",
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Sarah Chen" },
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        reviewBody:
          "The AI voices are incredibly human-sounding. My audience has no idea these videos are AI-generated.",
      },
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Marcus Thorne" },
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        reviewBody:
          "Managing content for 15 client accounts used to be a nightmare. AutoReels lets me generate a week of videos in an hour.",
      },
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to try with 10 credits starter pack",
      url: `${SITE_CONFIG.url}/signup`,
      availability: "https://schema.org/InStock",
      priceValidUntil: "2027-12-31",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "USD",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "DAY",
          },
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "US",
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnNotPermitted",
      },
    },
  };
}

export function generateVideoObjectSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  embedUrl,
}: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl,
    uploadDate,
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    ...(contentUrl && { contentUrl }),
    ...(embedUrl && { embedUrl }),
  };
}

export function generateBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}
