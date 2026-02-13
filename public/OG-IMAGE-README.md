# Open Graph / Twitter Card Image

For link previews on Twitter/X, LinkedIn, WhatsApp, and Facebook, the site uses:

**URL:** `https://autoreels.in/og-preview.jpg`

## How it works

The image is **generated at request time** by the Next.js route `app/og-preview.jpg/route.tsx` using `next/og` ImageResponse. It is not a static file.

- **Dimensions:** 1200 × 630 px (OG standard)
- **Format:** PNG (served at the `/og-preview.jpg` URL)
- **Content:** Title “AI Video Generator for Reels, Shorts & TikTok”, tagline, and autoreels.in branding
- **No auth:** Route is public; crawlers can fetch it

## Customizing the design

Edit `app/og-preview.jpg/route.tsx` to change layout, colors, or copy. The component uses inline styles and a purple/navy gradient background.

## Verification

1. After deploying, open: https://autoreels.in/og-preview.jpg — the generated image should load.
2. Use [Twitter Card Validator](https://cards-dev.twitter.com/validator) or [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).
3. View page source on https://autoreels.in and confirm `<meta property="og:image" content="https://autoreels.in/og-preview.jpg" />` is present.
