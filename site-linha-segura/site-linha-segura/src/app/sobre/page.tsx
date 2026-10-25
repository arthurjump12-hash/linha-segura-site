import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { DifferentialsSection, ProcessSection } from "@/components/sections";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sobre",
  description:
    "A Linha Segura integra segurança eletrônica, redes, automação e inteligência artificial em projetos sob medida em Serra/ES.",
  path: "/sobre",
});

const principles = [
  {
    title: "Integração antes de equipamento",
    text: "Câmeras, alarmes, acessos e rede são planejados juntos. Assim evitamos sistemas que não conversam e retrabalho no futuro.",
  },
  {
    title: "Clareza na proposta",
    text: "Você sabe o que será instalado, por que, em quanto tempo e quanto custa. Sem item genérico e sem surpresa no fim.",
  },
  {
    title: "Base pronta para evoluir",
    text: "A infraestrutura é preparada para receber automação e análises com inteligência artificial quando o negócio pedir.",
  },
];

export default function SobrePage() {
  return (
    <>
      <PageHero
        crumbs={[{ href: "/sobre", label: "Sobre" }]}
        title="Tecnologia inteligente para proteger, conectar e transformar negócios."
        lead="A Linha Segura nasceu para unir o que normalmente chega separado: segurança eletrônica, infraestrutura, software e inteligência artificial."
      />

      <section className="section" aria-labelledby="historia-titulo">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <Reveal>
            <h2 id="historia-titulo" className="text-[clamp(1.9rem,4vw,3rem)] font-semibold">
              Uma empresa de segurança com visão de tecnologia.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="grid gap-5 text-lg text-steel">
            <p>
              Muitas empresas têm câmeras que ninguém consegue acessar, alarmes que disparam sem motivo e redes montadas aos poucos, sem
              planejamento. O resultado é um conjunto de equipamentos que não entrega a segurança nem a informação esperadas.
            </p>
            <p>
              A Linha Segura trabalha de outro jeito. Começamos entendendo o ambiente e a rotina, desenhamos a solução completa e cuidamos
              da instalação, da configuração e das integrações. O cliente recebe um sistema funcionando e sabe como usá-lo.
            </p>
            <p>
              A empresa é conduzida por <strong className="text-snow">{siteConfig.owner}</strong>, que acompanha pessoalmente os projetos,
              com atuação inicial em {siteConfig.region}. Além da segurança eletrônica, desenvolvemos projetos de software e de visão
              computacional, como o protótipo de análise de ocupação apresentado na página de projetos.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section pt-0" aria-labelledby="principios-titulo">
        <div className="container-site">
          <h2 id="principios-titulo" className="sr-only">
            Princípios
          </h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {principles.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.06} className="rounded-[var(--radius-card)] border border-steel/12 bg-panel/50 p-7">
                <span className="block h-px w-10 bg-gradient-to-r from-electric to-cyan" aria-hidden="true" />
                <h3 className="mt-6 text-xl font-semibold">{p.title}</h3>
                <p className="mt-3 text-steel">{p.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <ProcessSection />
      <DifferentialsSection />
      <CTASection />
    </>
  );
}
