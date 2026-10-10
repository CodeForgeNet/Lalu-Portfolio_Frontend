import { ImageResponse } from "next/og";
export const alt =
  "Lalu Kumar — AI Systems & Full Stack Engineer. From model to working system.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#151716",
        color: "#f0eee6",
        display: "flex",
        flexDirection: "column",
        padding: 72,
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
        }}
      >
        <span>Lalu Kumar</span>
        <span style={{ color: "#edac83" }}>Applied AI Systems Lab</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 82,
          letterSpacing: -4,
        }}
      >
        <span>From model</span>
        <span style={{ color: "#edac83" }}>to working system.</span>
      </div>
      <div style={{ fontSize: 25, color: "#adb4aa" }}>
        AI Systems & Full Stack Engineer
      </div>
    </div>,
    size,
  );
}
