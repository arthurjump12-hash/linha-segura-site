import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";
import { FAQSection, FinderSection, SegmentsSection, SolutionsSection } from "@/components/sections";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Soluções",
  description:
    "Câmeras inteligentes, alarmes, controle de acesso, redes, automação, inteligência artificial e projetos personalizados.",
  path: "/solucoes",
});

export default function SolucoesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ href: "/solucoes", label: "Soluções" }]}
        title="Soluções que trabalham juntas."
        lead="Segurança eletrônica, infraestrutura e inteligência projetadas como um único sistema, do primeiro ponto de câmera à análise de dados."
      />
      <SolutionsSection showHeading={false} />
      <FinderSection />
      <SegmentsSection />
      <FAQSection />
      <CTASection
        title="Não sabe por onde começar?"
        text="O diagnóstico técnico mostra o que é prioridade no seu ambiente e o que pode esperar."
      />
    </>
  );
}
