import { solutionOptions } from "@/content/solutions";

export type ContactData = {
  nome: string;
  empresa: string;
  telefone: string;
  email: string;
  solucao: string;
  mensagem: string;
  consentimento: boolean;
};

export type ContactErrors = Partial<Record<keyof ContactData, string>>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

/** Validação compartilhada entre navegador e servidor. */
export function validateContact(d: ContactData): ContactErrors {
  const e: ContactErrors = {};
  if (d.nome.trim().length < 2) e.nome = "Informe seu nome.";
  const phone = onlyDigits(d.telefone);
  if (phone.length < 10 || phone.length > 13) e.telefone = "Informe um telefone com DDD, por exemplo (27) 99999-9999.";
  if (d.email.trim() && !emailRe.test(d.email.trim())) e.email = "Confira o e-mail. Exemplo: nome@empresa.com.br";
  if (!solutionOptions.some((o) => o.value === d.solucao)) e.solucao = "Escolha o tipo de solução.";
  if (d.mensagem.trim().length < 10) e.mensagem = "Conte um pouco sobre o que você precisa (mínimo de 10 caracteres).";
  if (d.mensagem.length > 2000) e.mensagem = "A mensagem pode ter até 2.000 caracteres.";
  if (!d.consentimento) e.consentimento = "Para enviar, autorize o uso dos dados para retorno do contato.";
  return e;
}

export function solutionLabel(value: string) {
  return solutionOptions.find((o) => o.value === value)?.label ?? value;
}

export function formatPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function contactToText(d: ContactData) {
  return [
    `Nome: ${d.nome}`,
    d.empresa ? `Empresa: ${d.empresa}` : null,
    `Telefone: ${d.telefone}`,
    d.email ? `E-mail: ${d.email}` : null,
    d.solucao ? `Solução: ${solutionLabel(d.solucao)}` : null,
    "",
    d.mensagem,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
}

/* ---------- Formulário de avaliação para academias ---------- */

export const academyInterests = [
  { value: "demonstracao", label: "Ver uma demonstração" },
  { value: "piloto", label: "Projeto-piloto de 30 dias" },
  { value: "avaliacao", label: "Avaliação técnica das câmeras" },
  { value: "outro", label: "Outro assunto" },
] as const;

export const unitOptions = ["1", "2 a 3", "4 a 10", "Mais de 10"] as const;
export const cameraOptions = ["Até 8", "9 a 16", "17 a 32", "Mais de 32", "Não sei"] as const;

export type AcademyLead = {
  nome: string;
  empresa: string;
  cidade: string;
  unidades: string;
  cameras: string;
  interesse: string;
  telefone: string;
  email: string;
  consentimento: boolean;
};

export function validateAcademy(d: AcademyLead): Partial<Record<keyof AcademyLead, string>> {
  const e: Partial<Record<keyof AcademyLead, string>> = {};
  if (d.nome.trim().length < 2) e.nome = "Informe seu nome.";
  if (d.empresa.trim().length < 2) e.empresa = "Informe o nome da academia ou empresa.";
  if (d.cidade.trim().length < 2) e.cidade = "Informe a cidade.";
  if (!unitOptions.includes(d.unidades as (typeof unitOptions)[number])) e.unidades = "Escolha o número de unidades.";
  if (!cameraOptions.includes(d.cameras as (typeof cameraOptions)[number])) e.cameras = "Escolha a quantidade aproximada de câmeras.";
  if (!academyInterests.some((i) => i.value === d.interesse)) e.interesse = "Escolha o principal interesse.";
  const phone = onlyDigits(d.telefone);
  if (phone.length < 10 || phone.length > 13) e.telefone = "Informe um telefone com DDD, por exemplo (27) 99999-9999.";
  if (d.email.trim() && !emailRe.test(d.email.trim())) e.email = "Confira o e-mail. Exemplo: nome@academia.com.br";
  if (!d.consentimento) e.consentimento = "Para enviar, autorize o uso dos dados para retorno do contato.";
  return e;
}

export function academyToText(d: AcademyLead) {
  return [
    "Solicitação de avaliação · IA para academias",
    `Nome: ${d.nome}`,
    `Academia/empresa: ${d.empresa}`,
    `Cidade: ${d.cidade}`,
    `Unidades: ${d.unidades}`,
    `Câmeras (aprox.): ${d.cameras}`,
    `Interesse: ${academyInterests.find((i) => i.value === d.interesse)?.label ?? d.interesse}`,
    `Telefone: ${d.telefone}`,
    d.email ? `E-mail: ${d.email}` : null,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
}
