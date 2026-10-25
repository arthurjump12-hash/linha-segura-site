/** Dados do diagnóstico rápido "Monte sua solução". */

export const environments = [
  { value: "empresa", label: "Empresa ou escritório" },
  { value: "comercio", label: "Comércio ou loja" },
  { value: "academia", label: "Academia" },
  { value: "condominio", label: "Condomínio" },
  { value: "industria", label: "Indústria ou logística" },
  { value: "residencia", label: "Residência" },
] as const;

export type GoalValue = "ver" | "aviso" | "acesso" | "rede" | "automatizar" | "dados";

export const goals: { value: GoalValue; label: string; hint: string; solution: string }[] = [
  { value: "ver", label: "Ver o que acontece no local", hint: "Pelo celular, ao vivo e gravado", solution: "cameras" },
  { value: "aviso", label: "Ser avisado de invasões", hint: "Alerta na hora certa", solution: "alarmes" },
  { value: "acesso", label: "Controlar quem entra", hint: "Pessoas, horários e registros", solution: "controle-de-acesso" },
  { value: "rede", label: "Ter internet e rede estáveis", hint: "Wi-Fi, cabeamento e backup", solution: "redes" },
  { value: "automatizar", label: "Automatizar rotinas", hint: "Luzes, energia e dispositivos", solution: "automacao" },
  { value: "dados", label: "Transformar imagens em dados", hint: "Ocupação, fluxo e relatórios", solution: "inteligencia-artificial" },
];

export const situations = [
  { value: "zero", label: "Vou começar do zero", next: "Começamos pelo diagnóstico do local para dimensionar tudo de uma vez, sem retrabalho." },
  {
    value: "melhorar",
    label: "Já tenho equipamentos e quero melhorar",
    next: "No diagnóstico avaliamos o que pode ser aproveitado e o que precisa ser trocado ou integrado.",
  },
  {
    value: "ia",
    label: "Tenho câmeras e quero usar inteligência artificial",
    next: "Verificamos se as câmeras atuais permitem análise e propomos um piloto com critérios de validação.",
  },
] as const;
