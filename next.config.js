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
};

module.exports = nextConfig;
