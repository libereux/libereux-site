import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Libereux Digital Solutions: make AI work for your business";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const mark = await readFile(join(process.cwd(), "public/libereux-mark.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;
  const [black, bold] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/archivo-latin-800-normal.woff")),
    readFile(join(process.cwd(), "assets/fonts/archivo-latin-700-normal.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#1b2a4a",
          color: "#e9eef2",
          padding: "72px",
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#ffa784" }}>
            Libereux Digital Solutions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.04, color: "#ffffff", maxWidth: 700 }}>
              Make AI work for your business.
            </div>
            <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: "#ff6b35" }}>
              AI strategy, automation, websites, apps and smart home.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#b4bfd1" }}>libereux.com    Free 30-minute consultation, worldwide</div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={markSrc} width={300} height={305} alt="" style={{ background: "#ffffff", borderRadius: 40, padding: 24 }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: black, weight: 800, style: "normal" },
        { name: "Archivo", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
