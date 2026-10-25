import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} | ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logo = await readFile(join(process.cwd(), "public/images/logo-linha-segura.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #070B12 0%, #0B1628 60%, #0d2a5c 100%)",
          color: "#F8FAFC",
          fontFamily: "sans-serif",
        }}
      >
        <img src={logoSrc} width={345} height={170} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.02, maxWidth: 980 }}>O futuro da segurança é inteligente.</div>
          <div style={{ display: "flex", marginTop: 36, height: 4, width: 420, background: "linear-gradient(90deg, #2563EB, #00D4FF)" }} />
          <div style={{ fontSize: 26, color: "#94A3B8", marginTop: 28 }}>
            Câmeras · Alarmes · Controle de acesso · Redes · Automação · IA
          </div>
        </div>
      </div>
    ),
    size,
  );
}
