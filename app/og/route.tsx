import { ImageResponse } from "next/og";

export const runtime = "edge";

const WIDTH = 1200;
const HEIGHT = 630;
const DEFAULT_TITLE = "AI Video Generator for Reels, Shorts & TikTok";
const DEFAULT_DESCRIPTION =
  "Turn ideas → scripts → visuals → voiceover → ready-to-post videos in minutes. No editing. No filming.";
const SITE_LABEL = "autoreels.in";

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3).trim() + "...";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || DEFAULT_TITLE;
  const description = searchParams.get("description") || DEFAULT_DESCRIPTION;
  const titleClean = truncate(title, 80);
  const descClean = truncate(description, 120);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.2,
              marginBottom: 24,
              letterSpacing: "-0.02em",
            }}
          >
            {titleClean}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.88)",
              lineHeight: 1.4,
              marginBottom: 40,
            }}
          >
            {descClean}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 48,
            fontSize: 22,
            fontWeight: 600,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {SITE_LABEL}
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    }
  );
}
