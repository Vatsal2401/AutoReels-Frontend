/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // SEO: Consistent URL structure
  trailingSlash: false,
  // Optimize images for SEO
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
