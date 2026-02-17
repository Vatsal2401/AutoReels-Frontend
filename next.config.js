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
};

module.exports = nextConfig;
