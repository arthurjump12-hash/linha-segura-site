import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { detailSolutions } from "@/content/solutions";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();
  const pages = ["", "/sobre", "/solucoes", "/inteligencia-artificial", "/inteligencia-artificial/academias", "/projetos", "/contato", "/privacidade"];
  return [
    ...pages.map((p) => ({
      url: `${base}${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : p === "/privacidade" ? 0.3 : 0.8,
    })),
    ...detailSolutions.map((s) => ({ url: `${base}${s.href}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
