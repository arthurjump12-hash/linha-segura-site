import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowUpRight, CheckCircle2, MessageCircle } from "lucide-react";
import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { ButtonLink } from "@/components/ui";
import { whatsappLink } from "@/config/site";
import { detailSolutions, getSolution } from "@/content/solutions";
import { pageMetadata, serviceSchema } from "@/lib/seo";

type Params = { slug: string };

export function generateStaticParams() {
  return detailSolutions.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const s = getSolution(slug);
  if (!s) return {};
  return pageMetadata({ title: s.title, description: s.short, path: s.href });
}

export default async function SolucaoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const s = getSolution(slug);
  if (!s) notFound();
  const others = detailSolutions.filter((o) => o.slug !== s.slug);

  return (
    <>
      <JsonLd data={serviceSchema(s.title, s.short, s.href)} />
      <PageHero
        crumbs={[
          { href: "/solucoes", label: "Soluções" },
          { href: s.href, label: s.title },
        ]}
        title={s.title}
        lead={s.intro}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={whatsappLink("orcamento", `Olá, Arthur! Vim pelo site da Linha Segura e quero um orçamento de ${s.title.toLowerCase()}.`)} external>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Solicitar orçamento
          </ButtonLink>
          <ButtonLink href={`/contato?solucao=${s.slug}`} variant="secondary">
            Falar sobre meu projeto
          </ButtonLink>
        </div>
      </PageHero>

      <section className="section" aria-labelledby="problemas-titulo">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <Reveal>
            <h2 id="problemas-titulo" className="text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold">
              Problemas que resolvemos
            </h2>
            <ul className="mt-8 grid gap-3">
              {s.problems?.map((p) => (
                <li key={p} className="flex gap-3 rounded-xl border border-steel/12 bg-panel/40 p-4 text-steel">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold">O que está incluído</h2>
            <ul className="mt-8 grid gap-x-8 sm:grid-cols-2">
              {s.includes?.map((i) => (
                <li key={i.title} className="border-t border-steel/15 py-5">
                  <CheckCircle2 className="h-5 w-5 text-cyan" aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-semibold">{i.title}</h3>
                  <p className="mt-1.5 text-[0.97rem] text-steel">{i.text}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section pt-0" aria-label="Aplicação e integrações">
        <div className="container-site grid gap-4 md:grid-cols-2">
          <Reveal className="rounded-[var(--radius-card)] border border-steel/12 bg-panel/50 p-7">
            <h2 className="text-xl font-semibold">Onde se aplica</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {s.forWho?.map((f) => (
                <li key={f} className="rounded-full border border-steel/20 px-3.5 py-1.5 text-sm text-snow">
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.06} className="rounded-[var(--radius-card)] border border-steel/12 bg-panel/50 p-7">
            <h2 className="text-xl font-semibold">Integra com</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {s.integrates?.map((f) => (
                <li key={f} className="rounded-full border border-cyan/30 bg-cyan/[.05] px-3.5 py-1.5 text-sm text-cyan">
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section pt-0" aria-labelledby="outras-titulo">
        <div className="container-site">
          <h2 id="outras-titulo" className="text-2xl font-semibold">
            Outras soluções
          </h2>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={o.href} className="group flex min-h-14 items-center justify-between rounded-xl border border-steel/12 px-5 py-4 transition-colors hover:border-cyan/40">
                  {o.title}
                  <ArrowUpRight className="h-4 w-4 text-steel transition-colors group-hover:text-cyan" aria-hidden="true" />
                </Link>
              </li>
            ))}
            <li>
              <Link href="/inteligencia-artificial" className="group flex min-h-14 items-center justify-between rounded-xl border border-steel/12 px-5 py-4 transition-colors hover:border-cyan/40">
                Inteligência artificial
                <ArrowUpRight className="h-4 w-4 text-steel transition-colors group-hover:text-cyan" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <CTASection intent="orcamento" primaryLabel="Solicitar orçamento" />
    </>
  );
}
