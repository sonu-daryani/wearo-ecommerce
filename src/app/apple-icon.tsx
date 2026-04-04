import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          background: "linear-gradient(145deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
          borderRadius: 36,
        }}
      >
        <span
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: "white",
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1,
          }}
        >
          W
        </span>
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "rgba(255,255,255,0.92)",
            marginTop: 8,
            letterSpacing: 2,
          }}
        >
          WEARO
        </span>
      </div>
    ),
    { ...size }
  );
}
