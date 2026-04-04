import { ImageResponse } from "next/og";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site-config";

export const alt = `${SITE_NAME} on X`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          background: "linear-gradient(160deg, #172554 0%, #1d4ed8 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: "white",
            marginBottom: 24,
          }}
        >
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 36, color: "rgba(255,255,255,0.9)" }}>
          {SITE_DOMAIN}
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 26,
            color: "rgba(255,255,255,0.75)",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Curated clothing and accessories · Shipped across India
        </div>
      </div>
    ),
    { ...size }
  );
}
