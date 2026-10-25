/**
 * Configuração central do site.
 * Edite aqui contato, WhatsApp, logo e vídeo demonstrativo.
 */
export const siteConfig = {
  name: "Linha Segura",
  tagline: "Segurança e Tecnologia",
  positioning: "Transformamos infraestrutura de segurança em inteligência para negócios.",
  description:
    "Segurança eletrônica, redes, automação e inteligência artificial integradas para empresas em Serra/ES e região.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.linhasegura.com.br",
  locale: "pt_BR",

  owner: "Arthur Reis",
  region: "Serra, Espírito Santo",
  areaServed: ["Serra", "Vitória", "Vila Velha", "Cariacica", "Espírito Santo"],

  contact: {
    /** Somente dígitos, com DDI 55 + DDD. Confirme o DDD antes de publicar. */
    whatsapp: "5527997777033",
    whatsappDisplay: "(27) 99777-7033",
    /** Deixe vazio até ter um e-mail oficial. */
    email: "",
    instagram: "",
  },

  /**
   * Logo oficial (arquivos em /public/images). O original enviado fica em logo-original.png.
   * As versões abaixo são recortes com fundo transparente, sem alteração de símbolo, tipografia ou proporções.
   * Deixe `symbol` vazio para voltar ao logotipo tipográfico provisório.
   */
  logo: {
    symbol: "/images/logo-simbolo.png", // 635 × 435
    wordmark: "/images/logo-nome.png", // 1370 × 150
    full: "/images/logo-linha-segura.png", // 1380 × 680 (símbolo + nome + assinatura)
  },

  /**
   * Vídeo da prova de conceito: coloque o MP4 em /public/videos/ e informe o caminho.
   * Use somente imagens autorizadas e sem pessoas identificáveis.
   */
  demoVideo: {
    src: "",
    poster: "",
  },
} as const;

export type WhatsAppIntent = "orcamento" | "diagnostico" | "projeto" | "ia" | "geral";

const intentMessages: Record<WhatsAppIntent, string> = {
  orcamento: "Olá, Arthur! Vim pelo site da Linha Segura e gostaria de solicitar um orçamento.",
  diagnostico: "Olá, Arthur! Vim pelo site da Linha Segura e quero agendar um diagnóstico técnico.",
  projeto: "Olá, Arthur! Vim pelo site da Linha Segura e quero falar sobre um projeto.",
  ia: "Olá, Arthur! Vim pelo site da Linha Segura e quero conhecer as soluções de inteligência artificial.",
  geral: "Olá, Arthur! Vim pelo site da Linha Segura.",
};

export function whatsappLink(intent: WhatsAppIntent = "geral", custom?: string) {
  const text = custom ?? intentMessages[intent];
  return `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const mainNav = [
  { href: "/sobre", label: "Sobre" },
  { href: "/solucoes", label: "Soluções" },
  { href: "/inteligencia-artificial", label: "Inteligência artificial" },
  { href: "/inteligencia-artificial/academias", label: "IA para academias" },
  { href: "/projetos", label: "Projetos" },
  { href: "/contato", label: "Contato" },
] as const;
