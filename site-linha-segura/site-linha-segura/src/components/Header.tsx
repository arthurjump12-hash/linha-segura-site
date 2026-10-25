"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { mainNav, whatsappLink } from "@/config/site";
import { Logo } from "./Logo";
import { MobileNavigation } from "./MobileNavigation";
import { ScrollProgress } from "./ScrollProgress";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-colors duration-300 ${
        scrolled ? "glass border-b border-steel/10" : "border-b border-transparent"
      }`}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-snow focus:px-4 focus:py-2 focus:text-void"
      >
        Pular para o conteúdo
      </a>
      <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" aria-label="Linha Segura, página inicial" className="rounded-lg">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              // destaca só o item mais específico (ex.: "IA para academias" e não "Inteligência artificial")
              const matches = mainNav.filter((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
              const best = matches.sort((a, b) => b.href.length - a.href.length)[0];
              const active = best?.href === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-full px-4 py-2 text-[0.92rem] transition-colors ${
                      active ? "text-snow" : "text-steel hover:text-snow"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-electric to-cyan" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink("orcamento")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-11 items-center gap-2 rounded-full bg-snow px-5 text-sm font-semibold text-void transition-shadow hover:shadow-[0_0_0_4px_rgb(0_212_255/.18)] sm:inline-flex"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Solicitar orçamento
          </a>
          <MobileNavigation pathname={pathname} />
        </div>
      </div>
      <ScrollProgress />
    </header>
  );
}
