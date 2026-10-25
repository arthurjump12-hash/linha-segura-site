"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, Send } from "lucide-react";
import { solutionOptions } from "@/content/solutions";
import { whatsappLink } from "@/config/site";
import { contactToText, formatPhone, validateContact, type ContactData, type ContactErrors } from "@/lib/contact";
import { Button } from "./ui";

type Status = "idle" | "loading" | "success" | "not_configured" | "error";

const empty: ContactData = { nome: "", empresa: "", telefone: "", email: "", solucao: "", mensagem: "", consentimento: false };

const DRAFT_KEY = "ls-contato-rascunho";

function readDraft(): Partial<ContactData> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<ContactData>) : null;
  } catch {
    return null;
  }
}
function writeDraft(d: ContactData | null) {
  try {
    if (d) localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, consentimento: false }));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* armazenamento indisponível: o formulário segue funcionando */
  }
}

export function ContactForm({ defaultSolution = "", defaultMessage = "" }: { defaultSolution?: string; defaultMessage?: string }) {
  const [data, setData] = useState<ContactData>({ ...empty, solucao: defaultSolution, mensagem: defaultMessage });
  const [restored, setRestored] = useState(false);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactData, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Restaura rascunho salvo neste navegador; o que veio do diagnóstico tem prioridade
  useEffect(() => {
    const draft = readDraft();
    if (draft && (draft.nome || draft.mensagem || draft.telefone)) {
      setData((d) => ({
        ...d,
        ...draft,
        consentimento: false,
        solucao: defaultSolution || draft.solucao || "",
        mensagem: defaultMessage ? `${defaultMessage}${draft.mensagem ? `\n\n${draft.mensagem}` : ""}` : draft.mensagem ?? "",
      }));
      setRestored(true);
    } else if (defaultSolution || defaultMessage) {
      setData((d) => ({ ...d, solucao: defaultSolution || d.solucao, mensagem: defaultMessage || d.mensagem }));
    }
  }, [defaultSolution, defaultMessage]);

  // Salva rascunho enquanto a pessoa digita
  useEffect(() => {
    if (status === "success") return;
    const id = setTimeout(() => {
      if (data.nome || data.mensagem || data.telefone || data.email || data.empresa) writeDraft(data);
    }, 400);
    return () => clearTimeout(id);
  }, [data, status]);

  function discardDraft() {
    writeDraft(null);
    setData({ ...empty, solucao: defaultSolution });
    setErrors({});
    setTouched({});
    setRestored(false);
  }

  useEffect(() => {
    if (status !== "idle" && status !== "loading") statusRef.current?.focus();
  }, [status]);

  function update<K extends keyof ContactData>(key: K, value: ContactData[K]) {
    const next = { ...data, [key]: value };
    setData(next);
    if (touched[key]) setErrors(validateContact(next));
  }

  function blur(key: keyof ContactData) {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validateContact(data));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateContact(data);
    setErrors(found);
    setTouched({ nome: true, telefone: true, email: true, solucao: true, mensagem: true, consentimento: true });
    if (Object.keys(found).length) {
      const firstKey = Object.keys(found)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      return;
    }
    setStatus("loading");
    try {
      const website = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, website }),
      });
      if (res.ok) {
        setStatus("success");
        writeDraft(null);
        setRestored(false);
        setData({ ...empty });
        setTouched({});
        return;
      }
      const json = (await res.json().catch(() => ({}))) as { code?: string; errors?: ContactErrors };
      if (json.code === "validation" && json.errors) {
        setErrors(json.errors);
        setStatus("idle");
        return;
      }
      setStatus(json.code === "not_configured" ? "not_configured" : "error");
    } catch {
      setStatus("error");
    }
  }

  const waFromForm = whatsappLink("geral", `Olá, Arthur! Vim pelo site da Linha Segura.\n\n${contactToText(data)}`);
  const err = (k: keyof ContactData) => (touched[k] ? errors[k] : undefined);

  if (status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-2xl border border-ok/30 bg-ok/[.06] p-8 outline-none">
        <CheckCircle2 className="h-8 w-8 text-ok" aria-hidden="true" />
        <h3 className="mt-4 text-2xl font-semibold">Mensagem enviada</h3>
        <p className="mt-2 text-steel">Recebemos seu contato e vamos responder pelo telefone ou e-mail informado.</p>
        <Button variant="secondary" className="mt-6" onClick={() => setStatus("idle")}>
          Enviar outra mensagem
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5" aria-describedby="form-privacidade">
      {/* isca para robôs */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Site</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {restored && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-steel/15 bg-void/40 px-4 py-3 text-sm text-steel">
          Recuperamos o que você tinha preenchido antes.
          <button type="button" onClick={discardDraft} className="min-h-11 font-medium text-snow underline decoration-steel/40 underline-offset-4 hover:decoration-cyan">
            Começar do zero
          </button>
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome" name="nome" required error={err("nome")}>
          <input id="nome" name="nome" className="field" autoComplete="name" value={data.nome} onChange={(e) => update("nome", e.target.value)} onBlur={() => blur("nome")} aria-invalid={!!err("nome")} aria-describedby={err("nome") ? "nome-erro" : undefined} required />
        </Field>
        <Field label="Empresa" name="empresa" hint="opcional">
          <input id="empresa" name="empresa" className="field" autoComplete="organization" value={data.empresa} onChange={(e) => update("empresa", e.target.value)} />
        </Field>
        <Field label="Telefone / WhatsApp" name="telefone" required error={err("telefone")}>
          <input id="telefone" name="telefone" className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="(27) 99999-9999" value={data.telefone} onChange={(e) => update("telefone", formatPhone(e.target.value))} onBlur={() => blur("telefone")} aria-invalid={!!err("telefone")} aria-describedby={err("telefone") ? "telefone-erro" : undefined} required />
        </Field>
        <Field label="E-mail" name="email" hint="opcional" error={err("email")}>
          <input id="email" name="email" className="field" type="email" inputMode="email" autoComplete="email" placeholder="nome@empresa.com.br" value={data.email} onChange={(e) => update("email", e.target.value)} onBlur={() => blur("email")} aria-invalid={!!err("email")} aria-describedby={err("email") ? "email-erro" : undefined} />
        </Field>
      </div>

      <Field label="Tipo de solução" name="solucao" required error={err("solucao")}>
        <select id="solucao" name="solucao" className="field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%2394A3B8%22 stroke-width=%222%22><path d=%22m4 6 4 4 4-4%22/></svg>')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10" value={data.solucao} onChange={(e) => update("solucao", e.target.value)} onBlur={() => blur("solucao")} aria-invalid={!!err("solucao")} aria-describedby={err("solucao") ? "solucao-erro" : undefined} required>
          <option value="" disabled>
            Selecione
          </option>
          {solutionOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Mensagem" name="mensagem" required error={err("mensagem")} aside={<span className={`tabular-nums ${data.mensagem.length > 1800 ? "text-warn" : "text-steel-dim"}`}>{data.mensagem.length}/2000</span>}>
        <textarea id="mensagem" name="mensagem" className="field min-h-36 resize-y" placeholder="Conte o tipo de ambiente, o que você quer proteger ou melhorar e o prazo desejado." value={data.mensagem} onChange={(e) => update("mensagem", e.target.value)} onBlur={() => blur("mensagem")} aria-invalid={!!err("mensagem")} aria-describedby={err("mensagem") ? "mensagem-erro" : undefined} maxLength={2000} rows={6} required />
      </Field>

      <div>
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-steel">
          <input type="checkbox" name="consentimento" checked={data.consentimento} onChange={(e) => update("consentimento", e.target.checked)} onBlur={() => blur("consentimento")} aria-invalid={!!err("consentimento")} aria-describedby="form-privacidade" className="mt-0.5 h-5 w-5 shrink-0 accent-cyan" />
          <span id="form-privacidade">
            Autorizo o uso destes dados somente para retorno do meu contato, conforme a{" "}
            <Link href="/privacidade" className="text-snow underline decoration-steel/40 underline-offset-4 hover:decoration-cyan">
              política de privacidade
            </Link>
            .
          </span>
        </label>
        {err("consentimento") && <ErrorText id="consentimento-erro">{err("consentimento")}</ErrorText>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={status === "loading"} aria-busy={status === "loading"}>
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Enviando…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" /> Enviar mensagem
            </>
          )}
        </Button>
        <a href={whatsappLink("projeto")} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-steel transition-colors hover:text-snow">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Prefiro falar pelo WhatsApp
        </a>
      </div>

      {(status === "not_configured" || status === "error") && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="rounded-2xl border border-warn/30 bg-warn/[.06] p-5 outline-none">
          <p className="flex items-start gap-2.5 font-medium text-snow">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warn" aria-hidden="true" />
            {status === "not_configured"
              ? "O envio por e-mail ainda não está ativo neste site. Sua mensagem não foi enviada."
              : "Não foi possível enviar agora. Sua mensagem não foi enviada."}
          </p>
          <p className="mt-2 pl-7 text-sm text-steel">Envie o mesmo conteúdo pelo WhatsApp. Os dados que você preencheu já vão na mensagem.</p>
          <a href={waFromForm} target="_blank" rel="noopener noreferrer" className="ml-7 mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-snow px-5 text-sm font-semibold text-void">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Enviar pelo WhatsApp
          </a>
        </div>
      )}
    </form>
  );
}

function Field({ label, name, required, hint, error, aside, children }: { label: string; name: string; required?: boolean; hint?: string; error?: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={name} className="text-sm font-medium text-snow">
          {label}
          {required && <span className="text-cyan" aria-hidden="true"> *</span>}
          {required && <span className="sr-only"> (obrigatório)</span>}
          {hint && <span className="font-normal text-steel-dim"> ({hint})</span>}
        </label>
        {aside && <span className="text-xs">{aside}</span>}
      </div>
      {children}
      {error && <ErrorText id={`${name}-erro`}>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="flex items-center gap-1.5 text-sm text-danger">
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}
