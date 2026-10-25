import Link from "next/link";
import { ArrowUpRight, Building2, Check, Dumbbell, Factory, Home, Store, Truck, Warehouse, MessageCircle, Plus } from "lucide-react";
import { faq } from "@/content/faq";
import { aiApplications, aiStatusLabel, differentials, pocResults, segments } from "@/content/home";
import { solutions } from "@/content/solutions";
import { siteConfig, whatsappLink } from "@/config/site";
import { ContactForm } from "./ContactForm";
import { JsonLd } from "./JsonLd";
import { SolutionFinder } from "./SolutionFinder";
import { PipelineDiagram } from "./PipelineDiagram";
import { ProcessTimeline } from "./ProcessTimeline";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { ServiceCard } from "./ServiceCard";
import { VideoShowcase } from "./VideoShowcase";
import { Badge, ButtonLink } from "./ui";

/* ---------- Sobre ---------- */
export function AboutSection() {
  const layers = [
    { title: "Equipamentos", text: "Câmeras, sensores, leitores, catracas e dispositivos de automação." },
    { title: "Infraestrutura", text: "Cabeamento, rede, Wi-Fi, servidores e armazenamento." },
    { title: "Software", text: "Configuração, integrações, acesso remoto e sistemas sob medida." },
    { title: "Inteligência", text: "Automação de rotinas e análise de imagens com visão computacional." },
  ];
  return (
    <section aria-labelledby="sobre-titulo" className="section">
      <div className="container-site grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <Reveal>
            <p className="mb-4 flex items-center gap-3 font-mono text-xs text-cyan">
              <span className="h-px w-8 bg-cyan" aria-hidden="true" />
              Sobre a Linha Segura
            </p>
            <h2 id="sobre-titulo" className="text-[clamp(2rem,4.6vw,3.5rem)] font-semibold">
              Mais do que segurança. Inteligência aplicada ao seu negócio.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 grid gap-5 text-lg text-steel">
            <p>
              A Linha Segura projeta soluções integradas para empresas e residências. Em vez de instalar equipamentos isolados, combinamos
              segurança eletrônica, infraestrutura de rede, software e automação em um sistema que funciona como um todo.
            </p>
            <p>
              Cada projeto começa por um diagnóstico do ambiente e termina com tudo configurado, testado e explicado para quem vai usar. A
              mesma base preparada hoje permite aplicar inteligência artificial amanhã.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-10">
            <ButtonLink href="/sobre" variant="secondary">
              Conhecer a empresa
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </Reveal>
        </div>

        {/* Camadas da solução: a "linha" atravessa todas */}
        <Reveal delay={0.15}>
          <ol className="relative grid gap-3" aria-label="Camadas de uma solução integrada">
            <span aria-hidden="true" className="absolute bottom-8 left-[1.6rem] top-8 w-px bg-gradient-to-b from-electric via-cyan to-cyan/0" />
            {layers.map((l, i) => (
              <li key={l.title} className="relative flex gap-5 rounded-2xl border border-steel/12 bg-panel/50 p-5 transition-colors hover:border-cyan/30">
                <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-cyan/50 bg-void font-mono text-[0.7rem] text-cyan">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{l.title}</h3>
                  <p className="mt-1 text-[0.97rem] text-steel">{l.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Soluções ---------- */
export function SolutionsSection({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section id="solucoes" aria-labelledby="solucoes-titulo" className="section relative">
      <div className="container-site">
        {showHeading && (
          <SectionHeading
            id="solucoes-titulo"
            kicker="Soluções"
            title="Proteger, conectar e automatizar com uma única visão."
            lead="Cada solução funciona sozinha e fica ainda melhor integrada às outras. Você começa pelo que precisa agora e amplia quando fizer sentido."
          />
        )}
        <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${showHeading ? "mt-14" : ""}`}>
          {solutions.map((s, i) => (
            <Reveal as="li" key={s.slug} delay={(i % 4) * 0.06} className={s.slug === "inteligencia-artificial" ? "sm:col-span-2" : ""}>
              <ServiceCard solution={s} featured={s.slug === "inteligencia-artificial"} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Inteligência artificial ---------- */
export function AISection({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  const H = headingLevel;
  return (
    <section id="ia" aria-labelledby="ia-titulo" className="section relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-void via-navy to-void" />
      <div aria-hidden="true" className="absolute left-1/2 top-0 -z-10 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-electric/15 blur-[140px]" />
      <div className="container-site">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan/[.06] px-3.5 py-1.5 font-mono text-xs text-cyan">
            Inteligência artificial · Visão computacional
          </p>
          <H id="ia-titulo" className="text-[clamp(2.2rem,5.4vw,4.2rem)] font-bold tracking-[-0.03em]">
            Suas câmeras podem enxergar <span className="text-gradient">muito além das imagens.</span>
          </H>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-steel md:text-xl">
            Transformamos imagens de sistemas de videomonitoramento em informações que podem apoiar decisões operacionais e estratégicas.
          </p>
        </Reveal>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-steel/12 bg-steel/12 sm:grid-cols-2 lg:grid-cols-3">
          {aiApplications.map((a, i) => (
            <Reveal as="li" key={a.title} delay={(i % 3) * 0.06} className="flex flex-col gap-4 bg-navy p-7">
              <Badge tone={a.status === "prototipo" ? "cyan" : "warn"}>{aiStatusLabel[a.status]}</Badge>
              <h3 className="text-xl font-semibold">{a.title}</h3>
              <p className="text-[0.97rem] text-steel">{a.text}</p>
            </Reveal>
          ))}
        </ul>
        <p className="mt-5 text-sm text-steel-dim">
          “Testado em protótipo” indica funcionalidade demonstrada em teste técnico inicial. A aplicação em operação contínua depende de
          um projeto-piloto em cada ambiente.
        </p>
      </div>
    </section>
  );
}

/* ---------- Projeto de visão computacional ---------- */
export function ProjectSection({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  const H = headingLevel;
  return (
    <section id="projeto" aria-labelledby="projeto-titulo" className="section">
      <div className="container-site">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <Reveal>
            <VideoShowcase />
          </Reveal>
          <Reveal delay={0.1}>
            <Badge tone="warn">Protótipo em desenvolvimento</Badge>
            <H id="projeto-titulo" className="mt-5 text-[clamp(2rem,4.4vw,3.3rem)] font-semibold">
              Da imagem ao indicador: inteligência artificial em ação.
            </H>
            <p className="mt-5 text-lg text-steel">
              Desenvolvemos um protótipo com imagens de uma câmera em ambiente de academia. O sistema detecta pessoas, acompanha áreas
              delimitadas em volta dos equipamentos e registra eventos de ocupação, separando quem usa o aparelho de quem apenas passa.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tecnologias utilizadas">
              {["Python", "YOLO", "OpenCV"].map((t) => (
                <li key={t} className="rounded-full border border-steel/20 px-3 py-1 font-mono text-xs text-snow">
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="mt-20">
          <Reveal>
            <h3 className="text-2xl font-semibold md:text-3xl">Como funciona</h3>
            <p className="mt-2 max-w-2xl text-steel">Cinco etapas entre a câmera e o relatório para a gestão.</p>
          </Reveal>
          <div className="mt-8">
            <PipelineDiagram />
          </div>
        </div>

        {/* Relatório automatizado com os resultados do teste inicial */}
        <Reveal className="mt-16 overflow-hidden rounded-[var(--radius-card)] border border-steel/15 bg-panel/60">
          <div className="flex flex-col gap-3 border-b border-steel/12 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <div>
              <h3 className="text-xl font-semibold">Relatório gerado automaticamente</h3>
              <p className="mt-1 text-sm text-steel">Resultado do teste técnico inicial, com um trecho de 32 segundos de um canal.</p>
            </div>
            <span className="font-mono text-xs text-steel-dim">relatorio_canal_08.txt</span>
          </div>
          <dl className="grid sm:grid-cols-2 lg:grid-cols-4">
            {pocResults.map((r) => (
              <div key={r.label} className="border-b border-steel/12 p-6 sm:border-r md:p-8 lg:border-b-0 [&:nth-child(2n)]:sm:border-r-0 lg:[&:nth-child(2n)]:border-r [&:last-child]:border-r-0">
                <dt className="text-sm text-steel">{r.label}</dt>
                <dd className="mt-2">
                  <span className="block font-display text-4xl font-semibold tabular-nums text-snow">{r.value}</span>
                  <span className="mt-2 block text-sm text-steel">{r.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="border-t border-steel/12 px-6 py-4 text-sm text-steel md:px-8">
            Demonstração técnica inicial. Ainda não representa a rotina completa do ambiente nem comprova operação contínua ou análise
            simultânea de vários canais. Nome e imagens do local não são divulgados.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Como trabalhamos ---------- */
export function ProcessSection() {
  return (
    <section id="como-trabalhamos" aria-labelledby="processo-titulo" className="section">
      <div className="container-site">
        <SectionHeading
          id="processo-titulo"
          kicker="Como trabalhamos"
          title="Do diagnóstico à evolução do sistema."
          lead="Um processo claro, em que você sabe o que está sendo feito em cada etapa e o que recebe ao final dela."
        />
        <div className="mt-14">
          <ProcessTimeline />
        </div>
      </div>
    </section>
  );
}

/* ---------- Segmentos ---------- */
const segmentIcons = [Dumbbell, Store, Building2, Warehouse, Factory, Home, Truck];

export function SegmentsSection() {
  return (
    <section aria-labelledby="segmentos-titulo" className="section">
      <div className="container-site">
        <SectionHeading
          id="segmentos-titulo"
          kicker="Segmentos"
          title="Aplicações para diferentes ambientes."
          lead="Exemplos de como as soluções podem ser aplicadas. Cada projeto é ajustado à rotina, ao risco e ao orçamento do local."
        />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {segments.map((s, i) => {
            const Icon = segmentIcons[i];
            return (
              <Reveal as="li" key={s.title} delay={(i % 4) * 0.05} className="group rounded-2xl border border-steel/12 bg-panel/40 p-6 transition-colors hover:border-cyan/30 hover:bg-panel/70">
                <Icon className="h-6 w-6 text-steel transition-colors group-hover:text-cyan" strokeWidth={1.6} aria-hidden="true" />
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-[0.95rem] text-steel">{s.text}</p>
              </Reveal>
            );
          })}
          <Reveal as="li" delay={0.15} className="flex flex-col justify-between rounded-2xl border border-dashed border-steel/25 p-6">
            <p className="text-lg font-semibold">Seu segmento não está aqui?</p>
            <Link href="/contato" className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-cyan hover:underline">
              Fale sobre o seu ambiente
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </ul>
      </div>
    </section>
  );
}

/* ---------- Diferenciais ---------- */
export function DifferentialsSection() {
  return (
    <section aria-labelledby="diferenciais-titulo" className="section">
      <div className="container-site grid gap-14 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            align="stack"
            id="diferenciais-titulo"
            kicker="Diferenciais"
            title="Tecnologia escolhida para o seu caso, não para o catálogo."
            lead="O que orienta cada projeto da Linha Segura."
          />
        </div>
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {differentials.map((d, i) => (
            <Reveal as="li" key={d.title} delay={(i % 2) * 0.06} className="border-t border-steel/15 py-7">
              <Check className="h-5 w-5 text-cyan" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-semibold">{d.title}</h3>
              <p className="mt-2 text-steel">{d.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Contato ---------- */
export function ContactSection({
  headingLevel = "h2",
  defaultSolution,
  defaultMessage,
}: {
  headingLevel?: "h1" | "h2";
  defaultSolution?: string;
  defaultMessage?: string;
}) {
  const H = headingLevel;
  return (
    <section id="contato" aria-labelledby="contato-titulo" className="section relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute -right-40 top-20 -z-10 h-[28rem] w-[28rem] rounded-full bg-electric/15 blur-[130px]" />
      <div className="container-site grid gap-14 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <Reveal>
            <H id="contato-titulo" className="text-[clamp(2.2rem,5vw,3.8rem)] font-bold tracking-[-0.03em]">
              Sua empresa está pronta para o próximo nível de tecnologia?
            </H>
            <p className="mt-6 text-lg text-steel">
              Conte o que você precisa proteger, conectar ou automatizar. O retorno é feito por {siteConfig.owner}, responsável pelos
              projetos.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 rounded-2xl border border-steel/15 bg-panel/50 p-6">
            <p className="text-sm text-steel">Atendimento direto pelo WhatsApp</p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{siteConfig.contact.whatsappDisplay}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <ButtonLink href={whatsappLink("orcamento")} external>
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Solicitar orçamento
              </ButtonLink>
              <ButtonLink href={whatsappLink("ia")} external variant="secondary">
                Conhecer soluções de IA
              </ButtonLink>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="rounded-[1.5rem] border border-steel/15 bg-navy/80 p-6 shadow-[0_30px_100px_-50px_rgb(37_99_235/.6)] md:p-9">
          <ContactForm defaultSolution={defaultSolution} defaultMessage={defaultMessage} />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Diagnóstico rápido ---------- */
export function FinderSection() {
  return (
    <section id="diagnostico" aria-labelledby="diagnostico-titulo" className="section pt-0">
      <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-16">
        <div className="lg:sticky lg:top-32">
          <SectionHeading
            align="stack"
            id="diagnostico-titulo"
            kicker="Diagnóstico rápido"
            title="Monte sua solução em três passos."
            lead="Responda o que você precisa e veja quais soluções se encaixam. O resumo vai pronto para o WhatsApp ou para o formulário."
          />
        </div>
        <Reveal delay={0.1}>
          <SolutionFinder />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Perguntas frequentes ---------- */
export function FAQSection() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <section id="perguntas" aria-labelledby="faq-titulo" className="section">
      <JsonLd data={schema} />
      <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <SectionHeading
          align="stack"
          id="faq-titulo"
          kicker="Perguntas frequentes"
          title="Antes de você perguntar."
          lead="Não encontrou sua dúvida? Mande uma mensagem e respondemos pessoalmente."
        />
        <Reveal className="divide-y divide-steel/15 border-y border-steel/15">
          {faq.map((f, i) => (
            <details key={f.q} className="group" open={i === 0}>
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-display text-lg font-medium text-snow marker:hidden hover:text-cyan [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="h-5 w-5 shrink-0 text-steel transition-transform duration-300 group-open:rotate-45 group-open:text-cyan" aria-hidden="true" />
              </summary>
              <p className="max-w-2xl pb-6 text-steel">{f.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Destaque: IA para academias ---------- */
export function AcademyTeaser() {
  const points = [
    "Academia digital com 10 equipamentos clicáveis",
    "Dashboard com ranking, mapa de calor e exportação",
    "Resultados reais do protótipo separados da simulação",
  ];
  return (
    <section aria-labelledby="teaser-academias-titulo" className="section pt-0">
      <div className="container-site">
        <Reveal className="relative isolate grid gap-10 overflow-hidden rounded-[1.75rem] border border-cyan/25 bg-gradient-to-br from-navy via-panel to-[#0a2348] p-7 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center md:p-12">
          <div aria-hidden="true" className="grid-backdrop absolute inset-0 -z-10 opacity-70" />
          <div>
            <Badge>Nova experiência interativa</Badge>
            <h2 id="teaser-academias-titulo" className="mt-5 text-[clamp(2rem,4.4vw,3.4rem)] font-bold tracking-[-0.03em]">
              Explore uma academia inteligente.
            </h2>
            <p className="mt-4 max-w-xl text-lg text-steel">
              Veja, em uma simulação, como as câmeras podem estimar a ocupação de cada aparelho e transformar imagens em indicadores para a gestão.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/inteligencia-artificial/academias">
                Explorar demonstração
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/inteligencia-artificial/academias#piloto" variant="secondary">
                Conhecer o projeto-piloto
              </ButtonLink>
            </div>
          </div>
          <ul className="grid gap-3">
            {points.map((p) => (
              <li key={p} className="flex gap-3 rounded-2xl border border-steel/15 bg-void/40 p-4 text-snow">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-cyan" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
