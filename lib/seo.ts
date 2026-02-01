import { Metadata } from "next";

export const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://autoreels.in",
  name: "AutoReels",
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
    "AutoReels",
    "ai video editor",
    "faceless youtube channel",
    "ai short form content",
  ],
  author: "AutoReels Team",
  twitterHandle: "@autoreels_in",
  company: "AutoReels",
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
  // Canonical must be absolute and consistent (no trailing slash as per next.config.js)
  const canonicalUrl = `${SITE_CONFIG.url}${path === "/" ? "" : path.replace(/\/$/, "")}`;
  const ogImage = image || `${SITE_CONFIG.url}/og-image.png`;

  return {
    title, // Let the layout template handle the suffix if applicable
    description,
    keywords: keywords || SITE_CONFIG.keywords,
    authors: [{ name: SITE_CONFIG.author }],
    creator: SITE_CONFIG.author,
    publisher: SITE_CONFIG.name,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: "/icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
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
    logo: `${SITE_CONFIG.url}/logo.png`,
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
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "3240",
      bestRating: "5",
    },
    featureList: "AI Scriptwriting, VoiceCloning, Automated Captions, Stock Media Integration",
    screenshot: `${SITE_CONFIG.url}/dashboard-preview.png`,
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
        url: `${SITE_CONFIG.url}/create`,
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
