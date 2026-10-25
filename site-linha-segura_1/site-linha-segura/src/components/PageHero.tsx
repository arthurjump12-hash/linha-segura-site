import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";
import { Reveal } from "./Reveal";

export function PageHero({
  title,
  lead,
  crumbs = [],
  children,
}: {
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: { href: string; label: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden pt-[calc(var(--header-h)+env(safe-area-inset-top,0px))]">
      <AnimatedBackground variant="section" />
      <div className="container-site relative pb-16 pt-14 md:pb-24 md:pt-24">
        <nav aria-label="Você está em" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-steel">
            <li>
              <Link href="/" className="hover:text-snow">
                Início
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.href} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-steel-dim" aria-hidden="true" />
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className="text-snow">
                    {c.label}
                  </span>
                ) : (
                  <Link href={c.href} className="hover:text-snow">
                    {c.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <Reveal className="max-w-4xl">
          <h1 className="text-[clamp(2.4rem,6vw,4.6rem)] font-bold tracking-[-0.035em]">{title}</h1>
          {lead && <p className="mt-6 max-w-2xl text-lg text-steel md:text-xl">{lead}</p>}
          {children && <div className="mt-10">{children}</div>}
        </Reveal>
      </div>
      <div className="signal-line" aria-hidden="true" />
    </section>
  );
}
