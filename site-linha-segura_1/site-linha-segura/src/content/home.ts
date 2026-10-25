export const processSteps = [
  {
    title: "Diagnóstico técnico",
    text: "Visitamos o local, entendemos a rotina e levantamos riscos, infraestrutura existente e objetivos.",
    output: "Mapa de necessidades",
  },
  {
    title: "Planejamento da solução",
    text: "Definimos equipamentos, arquitetura, prazos e investimento em uma proposta clara.",
    output: "Projeto e orçamento",
  },
  {
    title: "Implementação",
    text: "Instalação organizada, com cabeamento identificado e mínimo impacto na operação.",
    output: "Infraestrutura instalada",
  },
  {
    title: "Configuração e integração",
    text: "Configuramos sistemas, acessos e integrações entre câmeras, alarmes, rede e software.",
    output: "Sistemas conectados",
  },
  {
    title: "Testes e validação",
    text: "Testamos cada ponto, validamos com o responsável e orientamos a equipe no uso.",
    output: "Entrega validada",
  },
  {
    title: "Suporte e evolução",
    text: "Acompanhamos o funcionamento e planejamos melhorias conforme o negócio cresce.",
    output: "Operação acompanhada",
  },
] as const;

export const segments = [
  { title: "Academias", text: "Controle de acesso, monitoramento de áreas e análise de ocupação de aparelhos." },
  { title: "Comércios", text: "Câmeras no caixa e no estoque, alarme fora do horário e Wi-Fi para clientes." },
  { title: "Condomínios", text: "Portaria, controle de acesso de moradores e visitantes, áreas comuns monitoradas." },
  { title: "Escritórios", text: "Rede estável, acesso por perfil e proteção de equipamentos e dados." },
  { title: "Indústrias", text: "Cobertura de perímetro, áreas restritas e infraestrutura para operação contínua." },
  { title: "Residências", text: "Câmeras, alarme e automação controlados pelo celular." },
  { title: "Logística", text: "Monitoramento de docas e pátios, controle de acesso e rede para galpões." },
] as const;

export const differentials = [
  { title: "Projetos personalizados", text: "Cada solução parte do diagnóstico do seu ambiente, não de um pacote pronto." },
  { title: "Hardware e software integrados", text: "Equipamentos, rede e sistemas pensados para funcionar juntos." },
  { title: "Visão tecnológica", text: "Infraestrutura preparada para automação e inteligência artificial." },
  { title: "Soluções escaláveis", text: "Comece pelo essencial e amplie sem refazer o que já foi instalado." },
  { title: "Atendimento consultivo", text: "Você conversa com quem projeta e entende a decisão antes de investir." },
  { title: "Foco na experiência", text: "Sistemas simples de usar no dia a dia, com orientação para a equipe." },
] as const;

export type AiStatus = "prototipo" | "desenvolvimento";

export const aiApplications: { title: string; text: string; status: AiStatus }[] = [
  { title: "Análise de ocupação", text: "Tempo de uso de equipamentos e áreas delimitadas na imagem.", status: "prototipo" },
  { title: "Monitoramento de áreas", text: "Regiões de interesse cadastradas sobre a imagem da câmera.", status: "prototipo" },
  { title: "Identificação de eventos", text: "Registro de entrada, permanência e passagem em cada região.", status: "prototipo" },
  { title: "Relatórios automatizados", text: "Resumo gerado ao fim da análise, sem planilha manual.", status: "prototipo" },
  { title: "Indicadores operacionais", text: "Faixas horárias, ociosidade e demanda por equipamento.", status: "desenvolvimento" },
  { title: "Integração com dashboards", text: "Envio dos dados para painéis de gestão e outros sistemas.", status: "desenvolvimento" },
];

export const aiStatusLabel: Record<AiStatus, string> = {
  prototipo: "Testado em protótipo",
  desenvolvimento: "Em desenvolvimento",
};

/** Etapas do processamento do protótipo de visão computacional */
export const pipeline = [
  { title: "Captura", tech: "Câmera / gravação", text: "Imagens do sistema de videomonitoramento, com acesso autorizado." },
  { title: "Detecção", tech: "Python + YOLO", text: "Um modelo de visão computacional localiza pessoas em cada quadro." },
  { title: "Regiões", tech: "OpenCV", text: "Áreas dos equipamentos são cadastradas sobre a imagem." },
  { title: "Eventos", tech: "Regras de ocupação", text: "O sistema diferencia uso de simples passagem e mede o tempo." },
  { title: "Relatório", tech: "Geração automática", text: "Os eventos viram um resumo pronto para a gestão." },
] as const;

/** Resultados do teste inicial (fonte: proposta de projeto-piloto). */
export const pocResults = [
  { value: "05", label: "Regiões cadastradas", detail: "Áreas de equipamentos marcadas na imagem" },
  { value: "≈ 31 s", label: "Ocupação registrada", detail: "Aparelho junto à divisória" },
  { value: "01", label: "Passagem identificada", detail: "Sem contar como uso do equipamento" },
  { value: "32 s", label: "Duração do trecho", detail: "Amostra curta, sem extrapolação" },
] as const;
