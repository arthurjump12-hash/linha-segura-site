"use client";

import { useEffect, useState } from "react";

const items = [
  { id: "academia-digital", label: "Academia" },
  { id: "dashboard", label: "Dashboard" },
  { id: "ranking", label: "Ranking" },
  { id: "mapa-de-calor", label: "Mapa de calor" },
  { id: "prototipo", label: "Protótipo real" },
  { id: "simulador", label: "Simulador" },
  { id: "piloto", label: "Piloto" },
  { id: "avaliacao", label: "Avaliação" },
];

/** Navegação da página com indicador da seção atual (scroll storytelling). */
export function PageNav() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <nav aria-label="Seções da página" className="glass sticky top-[calc(var(--header-h)+env(safe-area-inset-top,0px))] z-30 border-y border-steel/10">
      <ul className="container-site flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
        {items.map((i) => (
          <li key={i.id} className="shrink-0">
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "location" : undefined}
              className={`inline-flex min-h-9 items-center rounded-full px-3.5 text-sm transition-colors ${
                active === i.id ? "bg-snow text-void" : "text-steel hover:text-snow"
              }`}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
