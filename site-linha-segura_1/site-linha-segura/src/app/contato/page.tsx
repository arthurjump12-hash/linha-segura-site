import { ContactSection } from "@/components/sections";
import { solutionOptions } from "@/content/solutions";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contato",
  description: "Solicite um orçamento ou agende um diagnóstico técnico com a Linha Segura pelo formulário ou pelo WhatsApp.",
  path: "/contato",
});

export default async function ContatoPage({ searchParams }: { searchParams: Promise<{ solucao?: string; resumo?: string }> }) {
  const { solucao, resumo } = await searchParams;
  // Resumo vindo do diagnóstico rápido: texto puro, limitado
  const defaultMessage = typeof resumo === "string" ? resumo.replace(/[<>]/g, "").slice(0, 600) : undefined;
  const valid = solutionOptions.some((o) => o.value === solucao) ? solucao : undefined;
  return (
    <div className="pt-[calc(var(--header-h)+env(safe-area-inset-top,0px))]">
      <ContactSection headingLevel="h1" defaultSolution={valid} defaultMessage={defaultMessage} />
    </div>
  );
}
