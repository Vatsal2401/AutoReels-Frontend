# Open Graph / Twitter Card Image

For link previews on Twitter/X, LinkedIn, WhatsApp, and Facebook, the site uses:

- **Default (single image):** `https://autoreels.in/og-preview.jpg`
- **Dynamic template (per-page):** `https://autoreels.in/og?title=...&description=...`

## Dynamic OG template

Each page that uses `generatePageMetadata()` in `lib/seo.ts` gets a **dynamic OG image** with that page’s title and description:

- **Route:** `app/og/route.tsx` — accepts query params `title` and `description`.
- **Helper:** `getDynamicOgImageUrl(title, description)` in `lib/seo.ts` builds the URL.
- **Usage:** `generatePageMetadata({ title, description, path })` uses the dynamic image by default (no need to pass `image`).
- **Example:** Sharing `https://autoreels.in/about` uses an OG image with “About Us | AutoReels” and the about page description.

To use a **custom image** for a specific page, pass `image: "https://autoreels.in/your-image.jpg"` into `generatePageMetadata`.

## Where to see the metadata

- **In the page (HTML):** Open https://autoreels.in → right‑click → **View Page Source**. Search for `og:image`, `og:title`, `twitter:card`. You should see tags like:
  - `<meta property="og:title" content="AI Video Generator for Reels, Shorts & TikTok" />`
  - `<meta property="og:image" content="https://autoreels.in/og-preview.jpg" />`
  - `<meta name="twitter:card" content="summary_large_image" />`
- **In link previews:** When you share https://autoreels.in on Twitter/X, LinkedIn, WhatsApp, or Facebook, the title, description, and image come from these meta tags.
- **If the image is a gray placeholder:** Twitter/X caches previews. Use [Twitter Card Validator](https://cards-dev.twitter.com/validator) (or X’s card debugger), enter `https://autoreels.in`, and click **Preview card** to refresh the cache. Also confirm https://autoreels.in/og-preview.jpg opens directly in a browser and shows the image.

## How it works

- **Default image:** `app/og-preview.jpg/route.tsx` — fixed copy, single image for the site.
- **Dynamic image:** `app/og/route.tsx` — same visual template (gradient, typography) with `?title=...&description=...`; used automatically for every page that calls `generatePageMetadata()`.

Both are generated at request time with `next/og` ImageResponse (no static files).

- **Dimensions:** 1200 × 630 px (OG standard)
- **Format:** PNG
- **No auth:** Routes are public; crawlers can fetch them

## Customizing the design

- **Default image:** Edit `app/og-preview.jpg/route.tsx`.
- **Dynamic template:** Edit `app/og/route.tsx` (same purple/navy gradient and layout; title and description come from query params).

## Verification

1. After deploying, open: https://autoreels.in/og-preview.jpg — the generated image should load.
2. Use [Twitter Card Validator](https://cards-dev.twitter.com/validator) or [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).
3. View page source on https://autoreels.in and confirm `<meta property="og:image" content="https://autoreels.in/og-preview.jpg" />` is present.
