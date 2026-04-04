import {
  buildShopTitle,
  SITE_DOMAIN,
  SITE_NAME,
} from "@/lib/site-config";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const style = request.nextUrl.searchParams.get("style");

  const heading = buildShopTitle(category, style);
  const sub =
    category || style
      ? `Curated picks · ${SITE_DOMAIN}`
      : `${SITE_NAME} · Fashion across India`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "linear-gradient(118deg, #0c1929 0%, #1e3a5f 40%, #2563eb 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
              color: "white",
            }}
          >
            W
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>
            {SITE_NAME}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
            }}
          >
            {heading}
          </span>
          <span style={{ fontSize: 28, color: "rgba(255,255,255,0.85)" }}>{sub}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <span>Shop the collection</span>
          <span>wearo.in</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
