export type SolutionIcon =
  | "cctv"
  | "siren"
  | "fingerprint"
  | "network"
  | "cpu"
  | "brain"
  | "pencil";

export type Solution = {
  slug: string;
  href: string;
  icon: SolutionIcon;
  title: string;
  short: string;
  /** Texto de abertura da página interna */
  intro?: string;
  problems?: string[];
  includes?: { title: string; text: string }[];
  forWho?: string[];
  integrates?: string[];
};

export const solutions: Solution[] = [
  {
    slug: "cameras",
    href: "/solucoes/cameras",
    icon: "cctv",
    title: "Câmeras inteligentes",
    short: "Videomonitoramento projetado para cobrir o que importa, com acesso remoto e gravação confiável.",
    intro:
      "Um sistema de câmeras eficiente começa no projeto: posição, ângulo, iluminação, armazenamento e rede. Planejamos cada ponto para que a imagem seja útil quando você precisar dela.",
    problems: [
      "Pontos cegos em áreas críticas",
      "Imagens escuras ou sem nitidez à noite",
      "Gravações que se perdem ou não podem ser localizadas",
      "Dificuldade para acompanhar o local pelo celular",
    ],
    includes: [
      { title: "Projeto de cobertura", text: "Levantamento do local e definição de pontos, lentes e tipos de câmera." },
      { title: "Instalação organizada", text: "Cabeamento identificado, fixação adequada e acabamento limpo." },
      { title: "Gravação e retenção", text: "Dimensionamento do gravador e do armazenamento conforme o período desejado." },
      { title: "Acesso remoto", text: "Configuração segura para acompanhar as imagens pelo celular ou computador." },
      { title: "Preparação para IA", text: "Câmeras e rede preparadas para análises inteligentes no futuro." },
    ],
    forWho: ["Comércios", "Escritórios", "Condomínios", "Academias", "Galpões e indústrias", "Residências"],
    integrates: ["Alarmes", "Controle de acesso", "Visão computacional", "Redes corporativas"],
  },
  {
    slug: "alarmes",
    href: "/solucoes/alarmes",
    icon: "siren",
    title: "Alarmes e segurança eletrônica",
    short: "Sensores, centrais e avisos que respondem rápido e chegam a quem precisa saber.",
    intro:
      "Alarme bom é o que dispara quando deve e fica em silêncio quando não deve. Dimensionamos sensores, zonas e notificações para reduzir falsos disparos e acelerar a resposta.",
    problems: [
      "Disparos falsos que fazem a equipe ignorar o alarme",
      "Falta de aviso quando alguém entra fora do horário",
      "Sistemas antigos sem acesso pelo celular",
      "Ninguém sabe quem armou ou desarmou",
    ],
    includes: [
      { title: "Sensores adequados ao ambiente", text: "Presença, abertura, barreira e outros, conforme o risco de cada área." },
      { title: "Zonas e horários", text: "Configuração por setor e por período de funcionamento." },
      { title: "Notificações", text: "Avisos no celular para os responsáveis definidos." },
      { title: "Integração com câmeras", text: "Ver a imagem do local no momento do evento." },
    ],
    forWho: ["Comércios", "Escritórios", "Residências", "Depósitos"],
    integrates: ["Câmeras", "Automação", "Controle de acesso"],
  },
  {
    slug: "controle-de-acesso",
    href: "/solucoes/controle-de-acesso",
    icon: "fingerprint",
    title: "Controle de acesso",
    short: "Catracas, fechaduras e leitores que registram quem entra, onde e quando.",
    intro:
      "Controlar o acesso é proteger pessoas e patrimônio sem travar a rotina. Implantamos soluções com biometria, cartão, senha ou reconhecimento facial, com registro de cada passagem.",
    problems: [
      "Chaves copiadas e sem controle de quem tem acesso",
      "Filas e lentidão na entrada",
      "Nenhum histórico de entradas e saídas",
      "Áreas restritas acessíveis a qualquer pessoa",
    ],
    includes: [
      { title: "Catracas e torniquetes", text: "Para recepções, academias e áreas de grande fluxo." },
      { title: "Fechaduras e leitores", text: "Biometria, cartão, senha ou reconhecimento facial." },
      { title: "Perfis e horários", text: "Permissões por pessoa, setor e período." },
      { title: "Relatórios de acesso", text: "Histórico de passagens para conferência e auditoria." },
    ],
    forWho: ["Academias", "Condomínios", "Escritórios", "Indústrias"],
    integrates: ["Câmeras", "Sistemas de gestão", "Alarmes"],
  },
  {
    slug: "redes",
    href: "/solucoes/redes",
    icon: "network",
    title: "Redes e conectividade",
    short: "Wi-Fi estável, cabeamento estruturado e servidores que mantêm a operação no ar.",
    intro:
      "Câmeras, sistemas e equipes dependem da rede. Projetamos infraestrutura com cobertura, segmentação e organização para que tudo funcione com estabilidade e segurança.",
    problems: [
      "Wi-Fi que cai ou não alcança todos os ambientes",
      "Rack desorganizado e cabos sem identificação",
      "Câmeras e computadores disputando a mesma rede",
      "Dados importantes sem backup",
    ],
    includes: [
      { title: "Cabeamento estruturado", text: "Rack organizado, cabos identificados e documentação." },
      { title: "Wi-Fi corporativo", text: "Pontos de acesso posicionados para cobertura e desempenho." },
      { title: "Segmentação de rede", text: "Separação entre câmeras, visitantes e equipe." },
      { title: "Servidores e backup", text: "Armazenamento local e rotina de cópias de segurança." },
    ],
    forWho: ["Escritórios", "Comércios", "Indústrias", "Logística"],
    integrates: ["Câmeras", "Controle de acesso", "Automação", "IA"],
  },
  {
    slug: "automacao",
    href: "/solucoes/automacao",
    icon: "cpu",
    title: "Automação inteligente",
    short: "Iluminação, energia e dispositivos que funcionam sozinhos, no horário e na condição certa.",
    intro:
      "Automação reduz tarefas manuais e desperdício. Integramos dispositivos para que o ambiente responda a horários, presença e eventos, com controle pelo celular.",
    problems: [
      "Luzes e equipamentos ligados fora do horário",
      "Rotinas repetitivas feitas manualmente todos os dias",
      "Dispositivos de marcas diferentes que não conversam",
    ],
    includes: [
      { title: "Cenários e rotinas", text: "Acionamentos por horário, presença ou evento." },
      { title: "Controle remoto", text: "Comando e acompanhamento pelo celular." },
      { title: "Integração de dispositivos", text: "Conexão entre equipamentos e sistemas diferentes." },
      { title: "Integração com segurança", text: "Ações automáticas a partir de alarmes e acessos." },
    ],
    forWho: ["Residências", "Escritórios", "Comércios", "Academias"],
    integrates: ["Alarmes", "Controle de acesso", "Redes"],
  },
  {
    slug: "inteligencia-artificial",
    href: "/inteligencia-artificial",
    icon: "brain",
    title: "Inteligência artificial",
    short: "Visão computacional que transforma imagens de câmeras em dados para a gestão.",
  },
  {
    slug: "projetos-personalizados",
    href: "/contato?solucao=projeto-personalizado",
    icon: "pencil",
    title: "Projetos personalizados",
    short: "Quando a solução não está pronta, desenvolvemos: hardware, software e integração sob medida.",
  },
];

export const detailSolutions = solutions.filter((s) => s.intro);

export function getSolution(slug: string) {
  return detailSolutions.find((s) => s.slug === slug);
}

export const solutionOptions = [
  { value: "cameras", label: "Câmeras inteligentes" },
  { value: "alarmes", label: "Alarmes e segurança eletrônica" },
  { value: "controle-de-acesso", label: "Controle de acesso" },
  { value: "redes", label: "Redes e conectividade" },
  { value: "automacao", label: "Automação inteligente" },
  { value: "inteligencia-artificial", label: "Inteligência artificial" },
  { value: "projeto-personalizado", label: "Projeto personalizado" },
  { value: "outro", label: "Ainda não sei / outro" },
] as const;
