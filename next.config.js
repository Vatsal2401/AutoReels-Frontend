/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // SEO: Consistent URL structure
  trailingSlash: false,
  // Optimize images for SEO; allow visual style thumbnails from Picsum
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "*.cloudfront.net", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      // http → https (301 permanent — consolidates crawl equity)
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://autoreels.in/:path*",
        permanent: true,
      },
      // www → non-www (301 permanent — prevent duplicate content)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.autoreels.in" }],
        destination: "https://autoreels.in/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Landing page — cacheable at CDN edge, ISR rebuilds every hour
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Cache-Control for all pSEO page prefixes — 24h CDN, 1h stale-while-revalidate
        source:
          "/(tools|ideas|pricing|vs|examples|for|integrations|glossary|create|directory)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=3600",
          },
        ],
      },
      {
        // Country-level location pages (e.g. /india/ai-reel-generator)
        // These are served by the [country-slug]/[location-slug] route group.
        // We can't enumerate every country prefix, so this is handled at the CDN level.
        source: "/sitemap/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=300",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
