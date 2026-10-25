import Image from "next/image";
import { siteConfig } from "@/config/site";

/**
 * Logo oficial da Linha Segura.
 * - "horizontal": símbolo + nome lado a lado (cabeçalho e menu).
 * - "completa": símbolo, nome e assinatura, como no arquivo original (rodapé).
 * Os arquivos são recortes do original com fundo transparente; nada foi redesenhado.
 */
export function Logo({ variant = "horizontal", className = "" }: { variant?: "horizontal" | "completa"; className?: string }) {
  const { logo, name, tagline } = siteConfig;

  if (logo.symbol && variant === "completa") {
    return (
      <Image src={logo.full} alt={`${name} · ${tagline}`} width={1380} height={680} sizes="240px" className={`h-auto w-[220px] ${className}`} />
    );
  }

  if (logo.symbol) {
    return (
      <span className={`flex items-center gap-2 ${className}`}>
        <Image src={logo.symbol} alt="" width={635} height={435} priority sizes="64px" className="h-10 w-auto shrink-0" />
        <Image src={logo.wordmark} alt={name} width={1370} height={150} priority sizes="180px" className="h-[18px] w-auto" />
      </span>
    );
  }

  // Logotipo tipográfico provisório (usado só se a logo oficial não estiver configurada)
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05rem] font-bold tracking-[0.14em]">LINHA SEGURA</span>
        <span className="mt-1 text-[0.68rem] tracking-[0.2em] text-steel">{tagline.toUpperCase()}</span>
      </span>
    </span>
  );
}
