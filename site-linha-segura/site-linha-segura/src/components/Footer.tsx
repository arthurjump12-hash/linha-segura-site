import Link from "next/link";
import { detailSolutions } from "@/content/solutions";
import { mainNav, siteConfig, whatsappLink } from "@/config/site";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-steel/10 bg-void pb-[env(safe-area-inset-bottom,0px)]">
      <div className="container-site grid gap-12 py-16 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="max-w-sm">
          <Logo variant="completa" className="-ml-2" />
          <p className="mt-5 text-[0.95rem] text-steel">{siteConfig.positioning}</p>
          <p className="mt-4 text-sm text-steel-dim">Atuação inicial em {siteConfig.region}.</p>
        </div>

        <nav aria-label="Soluções">
          <h2 className="font-display text-sm font-semibold text-snow">Soluções</h2>
          <ul className="mt-4 grid gap-2.5 text-[0.95rem]">
            {detailSolutions.map((s) => (
              <li key={s.slug}>
                <Link href={s.href} className="text-steel transition-colors hover:text-snow">
                  {s.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/inteligencia-artificial" className="text-steel transition-colors hover:text-snow">
                Inteligência artificial
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Empresa">
          <h2 className="font-display text-sm font-semibold text-snow">Empresa</h2>
          <ul className="mt-4 grid gap-2.5 text-[0.95rem]">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-steel transition-colors hover:text-snow">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/privacidade" className="text-steel transition-colors hover:text-snow">
                Privacidade
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-semibold text-snow">Contato</h2>
          <ul className="mt-4 grid gap-2.5 text-[0.95rem] text-steel">
            <li>{siteConfig.owner}</li>
            <li>
              <a href={whatsappLink("geral")} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-snow">
                WhatsApp {siteConfig.contact.whatsappDisplay}
              </a>
            </li>
            {siteConfig.contact.email && (
              <li>
                <a href={`mailto:${siteConfig.contact.email}`} className="transition-colors hover:text-snow">
                  {siteConfig.contact.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="signal-line" aria-hidden="true" />
      <div className="container-site flex flex-col gap-2 py-6 text-sm text-steel-dim sm:flex-row sm:justify-between">
        <p>
          © {year} {siteConfig.name} · {siteConfig.tagline}
        </p>
        <Link href="/privacidade" className="hover:text-snow">
          Política de privacidade
        </Link>
      </div>
    </footer>
  );
}
