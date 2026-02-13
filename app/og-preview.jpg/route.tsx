import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = { width: 1200, height: 630 };

export async function GET() {
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
            AI Video Generator for Reels, Shorts & TikTok
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.88)",
              lineHeight: 1.4,
              marginBottom: 40,
            }}
          >
            Turn ideas → scripts → visuals → voiceover → ready-to-post videos in minutes.
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            No editing. No filming.
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
          autoreels.in
        </div>
      </div>
    ),
    { ...size }
  );
}
