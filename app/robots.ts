import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/dashboard", "/studio/reel", "/videos/", "/auth/callback", "/404", "/500"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/_next/", "/dashboard", "/studio/reel", "/videos/", "/auth/callback", "/404", "/500"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/_next/", "/dashboard", "/studio/reel", "/videos/", "/auth/callback", "/404", "/500"],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
