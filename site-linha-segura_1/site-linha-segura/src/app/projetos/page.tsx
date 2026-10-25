import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";
import { ProjectSection } from "@/components/sections";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Projetos",
  description: "Projetos e demonstrações autorizadas da Linha Segura, incluindo o protótipo de visão computacional para academias.",
  path: "/projetos",
});

export default function ProjetosPage() {
  return (
    <>
      <PageHero
        crumbs={[{ href: "/projetos", label: "Projetos" }]}
        title="Projetos e demonstrações"
        lead="Mostramos aqui apenas trabalhos com divulgação autorizada. Nomes de clientes e imagens identificáveis só aparecem com permissão."
      />
      <ProjectSection />
      <section className="section pt-0">
        <div className="container-site">
          <div className="rounded-[var(--radius-card)] border border-dashed border-steel/25 p-8 text-center md:p-12">
            <h2 className="text-2xl font-semibold">Novos projetos em breve</h2>
            <p className="mx-auto mt-3 max-w-xl text-steel">
              Esta página recebe novos casos conforme os clientes autorizam a divulgação.
            </p>
          </div>
        </div>
      </section>
      <CTASection
        title="Tem um desafio que ainda não tem solução pronta?"
        text="Desenvolvemos projetos personalizados que combinam equipamentos, software e inteligência artificial."
        intent="projeto"
        primaryLabel="Falar sobre meu projeto"
        secondary={null}
      />
    </>
  );
}
