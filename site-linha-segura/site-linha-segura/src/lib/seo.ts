import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: { card: "summary_large_image", title: `${title} | ${siteConfig.name}`, description },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#empresa`,
    name: siteConfig.name,
    slogan: siteConfig.positioning,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: `+${siteConfig.contact.whatsapp}`,
    ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
    founder: { "@type": "Person", name: siteConfig.owner },
    address: { "@type": "PostalAddress", addressLocality: "Serra", addressRegion: "ES", addressCountry: "BR" },
    areaServed: siteConfig.areaServed.map((name) => ({ "@type": "Place", name })),
    knowsAbout: [
      "Videomonitoramento",
      "Alarmes",
      "Controle de acesso",
      "Redes corporativas",
      "Automação",
      "Visão computacional",
    ],
  };
}

export function serviceSchema(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: new URL(path, siteConfig.url).toString(),
    provider: { "@id": `${siteConfig.url}/#empresa` },
    areaServed: { "@type": "State", name: "Espírito Santo" },
  };
}
