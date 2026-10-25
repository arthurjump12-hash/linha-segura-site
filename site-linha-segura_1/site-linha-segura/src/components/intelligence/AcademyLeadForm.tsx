"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui";
import { siteConfig, whatsappLink } from "@/config/site";
import { academyInterests, academyToText, cameraOptions, formatPhone, unitOptions, validateAcademy, type AcademyLead } from "@/lib/contact";

const empty: AcademyLead = { nome: "", empresa: "", cidade: "", unidades: "", cameras: "", interesse: "", telefone: "", email: "", consentimento: false };
type Status = "idle" | "loading" | "success" | "not_configured" | "error";

/** Solicitação de avaliação técnica para academias. Envia de verdade ou indica claramente a dependência de configuração. */
export function AcademyLeadForm() {
  const [d, setD] = useState<AcademyLead>({ ...empty, interesse: "demonstracao" });
  const [errors, setErrors] = useState<Partial<Record<keyof AcademyLead, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AcademyLead, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== "idle" && status !== "loading") statusRef.current?.focus();
  }, [status]);

  const set = <K extends keyof AcademyLead>(k: K, v: AcademyLead[K]) => {
    const next = { ...d, [k]: v };
    setD(next);
    if (touched[k]) setErrors(validateAcademy(next));
  };
  const blur = (k: keyof AcademyLead) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validateAcademy(d));
  };
  const err = (k: keyof AcademyLead) => (touched[k] ? errors[k] : undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateAcademy(d);
    setErrors(found);
    setTouched(Object.fromEntries(Object.keys(empty).map((k) => [k, true])));
    if (Object.keys(found).length) {
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }
    setStatus("loading");
    try {
      const website = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
      const res = await fetch("/api/contato", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...d, tipo: "academia", website }) });
      if (res.ok) {
        setStatus("success");
        return;
      }
      const json = (await res.json().catch(() => ({}))) as { code?: string; errors?: typeof errors };
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

  if (status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-2xl border border-ok/30 bg-ok/[.06] p-8 outline-none">
        <CheckCircle2 className="h-8 w-8 text-ok" aria-hidden="true" />
        <h3 className="mt-4 text-2xl font-semibold">Solicitação enviada</h3>
        <p className="mt-2 text-steel">{siteConfig.owner} vai entrar em contato pelo telefone informado para combinar a avaliação.</p>
      </div>
    );
  }

  const field = "field";
  return (
    <form ref={formRef} onSubmit={submit} noValidate className="grid gap-5">
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="ac-website">Site</label>
        <input id="ac-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <F id="ac-nome" name="nome" label="Nome" error={err("nome")}>
          <input id="ac-nome" name="nome" className={field} autoComplete="name" value={d.nome} onChange={(e) => set("nome", e.target.value)} onBlur={() => blur("nome")} aria-invalid={!!err("nome")} aria-describedby={err("nome") ? "ac-nome-erro" : undefined} />
        </F>
        <F id="ac-empresa" name="empresa" label="Academia ou empresa" error={err("empresa")}>
          <input id="ac-empresa" name="empresa" className={field} autoComplete="organization" value={d.empresa} onChange={(e) => set("empresa", e.target.value)} onBlur={() => blur("empresa")} aria-invalid={!!err("empresa")} aria-describedby={err("empresa") ? "ac-empresa-erro" : undefined} />
        </F>
        <F id="ac-cidade" name="cidade" label="Cidade" error={err("cidade")}>
          <input id="ac-cidade" name="cidade" className={field} autoComplete="address-level2" placeholder="Serra/ES" value={d.cidade} onChange={(e) => set("cidade", e.target.value)} onBlur={() => blur("cidade")} aria-invalid={!!err("cidade")} aria-describedby={err("cidade") ? "ac-cidade-erro" : undefined} />
        </F>
        <F id="ac-unidades" name="unidades" label="Número de unidades" error={err("unidades")}>
          <select id="ac-unidades" name="unidades" className={field} value={d.unidades} onChange={(e) => set("unidades", e.target.value)} onBlur={() => blur("unidades")} aria-invalid={!!err("unidades")} aria-describedby={err("unidades") ? "ac-unidades-erro" : undefined}>
            <option value="" disabled>
              Selecione
            </option>
            {unitOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </F>
        <F id="ac-cameras" name="cameras" label="Câmeras (aproximado)" error={err("cameras")}>
          <select id="ac-cameras" name="cameras" className={field} value={d.cameras} onChange={(e) => set("cameras", e.target.value)} onBlur={() => blur("cameras")} aria-invalid={!!err("cameras")} aria-describedby={err("cameras") ? "ac-cameras-erro" : undefined}>
            <option value="" disabled>
              Selecione
            </option>
            {cameraOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </F>
        <F id="ac-interesse" name="interesse" label="Principal interesse" error={err("interesse")}>
          <select id="ac-interesse" name="interesse" className={field} value={d.interesse} onChange={(e) => set("interesse", e.target.value)} onBlur={() => blur("interesse")} aria-invalid={!!err("interesse")}>
            {academyInterests.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </F>
        <F id="ac-telefone" name="telefone" label="Telefone / WhatsApp" error={err("telefone")}>
          <input id="ac-telefone" name="telefone" type="tel" inputMode="tel" autoComplete="tel" className={field} placeholder="(27) 99999-9999" value={d.telefone} onChange={(e) => set("telefone", formatPhone(e.target.value))} onBlur={() => blur("telefone")} aria-invalid={!!err("telefone")} aria-describedby={err("telefone") ? "ac-telefone-erro" : undefined} />
        </F>
        <F id="ac-email" name="email" label="E-mail" hint="opcional" error={err("email")}>
          <input id="ac-email" name="email" type="email" inputMode="email" autoComplete="email" className={field} value={d.email} onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")} aria-invalid={!!err("email")} aria-describedby={err("email") ? "ac-email-erro" : undefined} />
        </F>
      </div>

      <div>
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-steel">
          <input type="checkbox" name="consentimento" checked={d.consentimento} onChange={(e) => set("consentimento", e.target.checked)} onBlur={() => blur("consentimento")} className="mt-0.5 h-5 w-5 shrink-0 accent-cyan" aria-invalid={!!err("consentimento")} />
          <span>
            Autorizo o uso destes dados somente para retorno do contato, conforme a{" "}
            <Link href="/privacidade" className="text-snow underline decoration-steel/40 underline-offset-4">
              política de privacidade
            </Link>
            .
          </span>
        </label>
        {err("consentimento") && <Err id="ac-consentimento-erro">{err("consentimento")}</Err>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={status === "loading"} aria-busy={status === "loading"}>
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {status === "loading" ? "Enviando…" : "Solicitar avaliação técnica"}
        </Button>
        <a href={whatsappLink("geral", "Olá, Arthur! Quero conversar sobre inteligência artificial para minha academia.")} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-steel hover:text-snow">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Conversar sobre minha academia
        </a>
      </div>

      {(status === "not_configured" || status === "error") && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="rounded-2xl border border-warn/30 bg-warn/[.06] p-5 outline-none">
          <p className="flex items-start gap-2.5 font-medium text-snow">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warn" aria-hidden="true" />
            {status === "not_configured" ? "O envio por e-mail ainda não está ativo neste site. Sua solicitação não foi enviada." : "Não foi possível enviar agora. Sua solicitação não foi enviada."}
          </p>
          <p className="mt-2 pl-7 text-sm text-steel">Envie pelo WhatsApp. Os dados preenchidos já vão na mensagem.</p>
          <a href={whatsappLink("geral", academyToText(d))} target="_blank" rel="noopener noreferrer" className="ml-7 mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-snow px-5 text-sm font-semibold text-void">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Enviar pelo WhatsApp
          </a>
        </div>
      )}
    </form>
  );
}

function F({ id, name, label, hint, error, children }: { id: string; name: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium text-snow">
        {label}
        {!hint && <span className="text-cyan" aria-hidden="true"> *</span>}
        {hint && <span className="font-normal text-steel-dim"> ({hint})</span>}
      </label>
      {children}
      {error && <Err id={`ac-${name}-erro`}>{error}</Err>}
    </div>
  );
}

function Err({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="flex items-center gap-1.5 text-sm text-danger">
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}
