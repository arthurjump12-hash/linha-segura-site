import { NextResponse } from "next/server";
import { academyToText, contactToText, solutionLabel, validateAcademy, validateContact, type AcademyLead, type ContactData } from "@/lib/contact";

/**
 * Recebe o formulário de contato.
 * Envia e-mail pela API da Resend quando RESEND_API_KEY e CONTACT_TO_EMAIL estiverem configurados.
 * Sem configuração, responde 503 e o site oferece o envio pelo WhatsApp. Nenhum envio é simulado.
 */
export async function POST(req: Request) {
  let body: Partial<ContactData> & Partial<AcademyLead> & { website?: string; tipo?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });
  }

  // Campo isca contra robôs: humanos não preenchem
  if (body.website) return NextResponse.json({ ok: true });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Site Linha Segura <onboarding@resend.dev>";

  // Formulário de avaliação para academias
  if (body.tipo === "academia") {
    const lead: AcademyLead = {
      nome: String(body.nome ?? "").slice(0, 120),
      empresa: String(body.empresa ?? "").slice(0, 120),
      cidade: String(body.cidade ?? "").slice(0, 80),
      unidades: String(body.unidades ?? ""),
      cameras: String(body.cameras ?? ""),
      interesse: String(body.interesse ?? ""),
      telefone: String(body.telefone ?? "").slice(0, 30),
      email: String(body.email ?? "").slice(0, 160),
      consentimento: body.consentimento === true,
    };
    const errs = validateAcademy(lead);
    if (Object.keys(errs).length) return NextResponse.json({ ok: false, code: "validation", errors: errs }, { status: 422 });
    if (!apiKey || !to) return NextResponse.json({ ok: false, code: "not_configured" }, { status: 503 });
    return send({ apiKey, to, from, replyTo: lead.email, subject: `Avaliação IA academias: ${lead.empresa} (${lead.cidade})`, text: academyToText(lead) });
  }

  const data: ContactData = {
    nome: String(body.nome ?? "").slice(0, 120),
    empresa: String(body.empresa ?? "").slice(0, 120),
    telefone: String(body.telefone ?? "").slice(0, 30),
    email: String(body.email ?? "").slice(0, 160),
    solucao: String(body.solucao ?? ""),
    mensagem: String(body.mensagem ?? "").slice(0, 2000),
    consentimento: body.consentimento === true,
  };

  const errors = validateContact(data);
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, code: "validation", errors }, { status: 422 });
  }

  if (!apiKey || !to) {
    return NextResponse.json({ ok: false, code: "not_configured" }, { status: 503 });
  }
  return send({ apiKey, to, from, replyTo: data.email, subject: `Novo contato pelo site: ${data.nome} · ${solutionLabel(data.solucao)}`, text: contactToText(data) });
}

async function send({ apiKey, to, from, replyTo, subject, text }: { apiKey: string; to: string; from: string; replyTo: string; subject: string; text: string }) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], reply_to: replyTo || undefined, subject, text }),
    });
    if (!res.ok) {
      console.error("Falha no envio do contato", res.status, await res.text());
      return NextResponse.json({ ok: false, code: "send_failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro no envio do contato", err);
    return NextResponse.json({ ok: false, code: "send_failed" }, { status: 502 });
  }
}
