import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { SectionHeading } from "@/components/SectionHeading";
import { AcademyHero } from "@/components/intelligence/AcademyHero";
import { AcademyLeadForm } from "@/components/intelligence/AcademyLeadForm";
import {
  AcademyFAQ,
  ComparisonSection,
  HowItWorksSection,
  PilotSection,
  PrivacySection,
  PrototypeSection,
  ScenarioSection,
} from "@/components/intelligence/AcademySections";
import { EquipmentPanel } from "@/components/intelligence/EquipmentPanel";
import { DashboardSection, DetectionsSection, GymSection, HeatmapSection, RankingSection } from "@/components/intelligence/LiveSections";
import { PageNav } from "@/components/intelligence/PageNav";
import { SimulationProvider } from "@/components/intelligence/SimulationProvider";
import { siteConfig } from "@/config/site";
import { pageMetadata, serviceSchema } from "@/lib/seo";

const description =
  "Inteligência artificial para academias: câmeras de segurança que estimam a ocupação dos equipamentos e geram indicadores. Demonstração interativa, dashboard e projeto-piloto.";

export const metadata = pageMetadata({ title: "IA para academias", description, path: "/inteligencia-artificial/academias" });

export default function AcademiasPage() {
  return (
    <>
      <JsonLd data={serviceSchema("Inteligência artificial para academias", description, "/inteligencia-artificial/academias")} />
      <AcademyHero />
      <PageNav />

      <SimulationProvider>
        <GymSection />
        <DetectionsSection />
        <DashboardSection />
        <RankingSection />
        <HeatmapSection />
        <PrototypeSection />
        <EquipmentPanel />
      </SimulationProvider>

      <ScenarioSection />
      <HowItWorksSection />
      <ComparisonSection />
      <PilotSection />
      <PrivacySection />
      <AcademyFAQ />

      <section id="avaliacao" aria-labelledby="avaliacao-titulo" className="section relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute -right-40 top-20 -z-10 h-[28rem] w-[28rem] rounded-full bg-electric/15 blur-[130px]" />
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <SectionHeading
              align="stack"
              id="avaliacao-titulo"
              kicker="Solicitar avaliação"
              title="Vamos olhar as câmeras da sua academia?"
              lead={`Conte o tamanho da operação. ${siteConfig.owner} retorna para combinar uma demonstração ou o diagnóstico técnico do piloto.`}
            />
            <ul className="mt-8 grid gap-2 text-sm text-steel">
              <li>Avaliação das câmeras e da infraestrutura existentes</li>
              <li>Definição dos equipamentos e indicadores prioritários</li>
              <li>Proposta de piloto com prazo, investimento e critérios</li>
            </ul>
          </div>
          <div className="rounded-[1.5rem] border border-steel/15 bg-navy/80 p-6 md:p-9">
            <AcademyLeadForm />
          </div>
        </div>
      </section>

      <CTASection
        title="Quer ver a demonstração ao vivo?"
        text="Apresentamos a academia digital, o dashboard e o protótipo real em uma conversa rápida."
        intent="ia"
        primaryLabel="Explorar demonstração com o Arthur"
        secondary={{ href: "/inteligencia-artificial", label: "Ver outras aplicações de IA" }}
      />
    </>
  );
}
