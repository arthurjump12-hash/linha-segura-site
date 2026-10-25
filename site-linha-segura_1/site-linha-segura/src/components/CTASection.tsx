import { MessageCircle } from "lucide-react";
import { whatsappLink, type WhatsAppIntent } from "@/config/site";
import { Reveal } from "./Reveal";
import { ButtonLink } from "./ui";

export function CTASection({
  title = "Vamos desenhar a solução certa para o seu ambiente?",
  text = "Agende um diagnóstico técnico. Você recebe uma proposta clara, com o que será feito, prazos e investimento.",
  intent = "diagnostico",
  primaryLabel = "Agendar diagnóstico",
  secondary = { href: "/contato", label: "Falar sobre meu projeto" },
}: {
  title?: string;
  text?: string;
  intent?: WhatsAppIntent;
  primaryLabel?: string;
  secondary?: { href: string; label: string } | null;
}) {
  return (
    <section className="section pt-0">
      <div className="container-site">
        <Reveal className="relative isolate overflow-hidden rounded-[1.75rem] border border-steel/15 bg-gradient-to-br from-navy via-panel to-[#0a1f44] px-6 py-14 md:px-14 md:py-20">
          <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-cyan/15 blur-[90px]" />
          <div aria-hidden="true" className="grid-backdrop absolute inset-0 -z-10 opacity-60" />
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_auto] md:items-end">
            <div>
              <h2 className="text-[clamp(1.9rem,4vw,3rem)] font-semibold">{title}</h2>
              <p className="mt-4 max-w-2xl text-lg text-steel">{text}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <ButtonLink href={whatsappLink(intent)} external>
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {primaryLabel}
              </ButtonLink>
              {secondary && (
                <ButtonLink href={secondary.href} variant="secondary">
                  {secondary.label}
                </ButtonLink>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
