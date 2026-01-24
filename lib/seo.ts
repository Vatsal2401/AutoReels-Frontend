import { Metadata } from "next";

export const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://aireels.com",
  name: "AI Reels",
  description:
    "Generate viral faceless reels in 60 seconds with AI. No editing. No camera. Just AI magic. Create professional content for Instagram, TikTok, and YouTube Shorts.",
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
    "AI reels maker",
  ],
  author: "AI Reels",
  twitterHandle: "@aireels",
};

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
  const fullTitle = title.includes(SITE_CONFIG.name)
    ? title
    : `${title} | ${SITE_CONFIG.name}`;
  const canonicalUrl = `${SITE_CONFIG.url}${path === "/" ? "" : path}`;
  const ogImage = image || `${SITE_CONFIG.url}/og-image.png`;

  return {
    title: fullTitle,
    description,
    keywords: keywords || SITE_CONFIG.keywords,
    authors: [{ name: SITE_CONFIG.author }],
    creator: SITE_CONFIG.author,
    publisher: SITE_CONFIG.name,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      title: fullTitle,
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
      title: fullTitle,
      description,
      images: [ogImage],
      creator: SITE_CONFIG.twitterHandle,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description: SITE_CONFIG.description,
    sameAs: [
      // Add social media links when available
      // "https://twitter.com/aireels",
      // "https://www.facebook.com/aireels",
      // "https://www.linkedin.com/company/aireels"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@aireels.com",
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
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
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
        name: "How does AI Reels work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AI Reels uses advanced AI to generate complete video reels in 60 seconds. Simply enter a topic, and our AI creates the script, generates audio narration, adds captions, and combines visuals automatically. No editing or camera required.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need editing skills to use AI Reels?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No editing skills required! AI Reels handles everything automatically. Just provide a topic and our AI generates a complete, ready-to-share video reel for you.",
        },
      },
      {
        "@type": "Question",
        name: "How long does it take to generate a reel?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most reels are generated in 30-60 seconds. The AI processes your topic, creates the script, generates audio, adds captions, and renders the final video automatically.",
        },
      },
      {
        "@type": "Question",
        name: "What platforms can I use the videos on?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AI Reels generates videos optimized for Instagram Reels, TikTok, YouTube Shorts, and other short-form video platforms. Videos are ready to download and share immediately.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need a camera or to show my face?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No camera needed! AI Reels creates faceless videos using AI-generated visuals, making it perfect for creators who prefer not to appear on camera while still creating professional content.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a free plan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! We offer a free plan with 3 videos per month. Free videos include a watermark. Upgrade to Pro for unlimited videos without watermarks.",
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
      "Step-by-step guide to creating professional video reels using AI Reels",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Enter Your Topic",
        text: "Go to the create page and enter a topic for your reel. Be specific about what you want the video to cover. For example: 'Top 5 productivity tips for remote workers' or 'How to start a successful startup'.",
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
