import { ImageResponse } from "next/og";
import { DEFAULT_DESCRIPTION, SITE_DOMAIN, SITE_NAME } from "@/lib/site-config";

export const alt = `${SITE_NAME} — ${SITE_DOMAIN}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(125deg, #0f172a 0%, #1e3a5f 45%, #1d4ed8 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
              color: "white",
            }}
          >
            W
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: "white" }}>
              {SITE_NAME}
            </span>
            <span style={{ fontSize: 28, color: "rgba(255,255,255,0.85)" }}>
              {SITE_DOMAIN}
            </span>
          </div>
        </div>
        <p
          style={{
            fontSize: 30,
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.45,
            maxWidth: 900,
            margin: 0,
          }}
        >
          {DEFAULT_DESCRIPTION.slice(0, 160)}…
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          <span>Fashion for every occasion · India</span>
          <span>wearo.in</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
