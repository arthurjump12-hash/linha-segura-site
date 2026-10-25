import { PageHero } from "@/components/PageHero";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <PageHero
      title="Página não encontrada"
      lead="O endereço pode ter mudado ou não existe. Volte ao início ou veja as soluções disponíveis."
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">Ir para o início</ButtonLink>
        <ButtonLink href="/solucoes" variant="secondary">
          Ver soluções
        </ButtonLink>
      </div>
    </PageHero>
  );
}
