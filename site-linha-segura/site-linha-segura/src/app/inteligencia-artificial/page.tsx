import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { AcademyTeaser, AISection, ProjectSection } from "@/components/sections";
import { pageMetadata, serviceSchema } from "@/lib/seo";

const description =
  "Visão computacional aplicada a câmeras de segurança: análise de ocupação, monitoramento de áreas, eventos e relatórios automatizados.";

export const metadata = pageMetadata({ title: "Inteligência artificial", description, path: "/inteligencia-artificial" });

const steps = [
  { title: "Avaliação", text: "Verificamos câmeras, ângulos, iluminação, acesso às imagens e o que a gestão quer medir." },
  { title: "Piloto", text: "Testamos em um ambiente real por um período definido, com critérios de aceitação combinados." },
  { title: "Calibração", text: "Ajustamos áreas e regras e medimos os erros antes de confiar nos números." },
  { title: "Operação", text: "Com o piloto validado, os indicadores passam a fazer parte da rotina de gestão." },
];

export default function IAPage() {
  return (
    <>
      <JsonLd data={serviceSchema("Inteligência artificial e visão computacional", description, "/inteligencia-artificial")} />
      <div className="pt-[calc(var(--header-h)+env(safe-area-inset-top,0px))]">
        <AISection headingLevel="h1" />
      </div>
      <AcademyTeaser />
      <ProjectSection />

      <section className="section pt-0" aria-labelledby="implantacao-titulo">
        <div className="container-site">
          <Reveal className="max-w-3xl">
            <h2 id="implantacao-titulo" className="text-[clamp(1.9rem,4vw,3rem)] font-semibold">
              Como implantamos IA com responsabilidade
            </h2>
            <p className="mt-4 text-lg text-steel">
              Inteligência artificial só gera valor quando os números são confiáveis. Por isso cada aplicação passa por validação antes de
              virar rotina.
            </p>
          </Reveal>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.06} className="rounded-[var(--radius-card)] border border-steel/12 bg-panel/50 p-6">
                <span className="font-mono text-xs text-cyan">Fase {i + 1}</span>
                <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-[0.97rem] text-steel">{s.text}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-8 rounded-2xl border border-steel/15 bg-navy/70 p-6 text-steel">
            <strong className="text-snow">Privacidade e LGPD.</strong> O uso de imagens depende de autorização do responsável pelo local,
            infraestrutura adequada e medidas de proteção de dados. As análises trabalham com contagem e tempo de ocupação, sem identificar
            pessoas.
          </Reveal>
        </div>
      </section>

      <CTASection
        title="Quer saber o que suas câmeras podem medir?"
        text="Conversamos sobre o seu ambiente e avaliamos se as câmeras atuais já permitem um piloto."
        intent="ia"
        primaryLabel="Conhecer soluções de IA"
      />
    </>
  );
}
