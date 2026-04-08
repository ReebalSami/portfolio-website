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
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
          background: "#18181B",
          color: "#f6c89f",
          fontSize: 80,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        RS
      </div>
    ),
    { ...size }
  );
}
