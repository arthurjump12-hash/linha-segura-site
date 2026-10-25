"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, MessageCircle, RotateCcw } from "lucide-react";
import { environments, goals, situations, type GoalValue } from "@/content/finder";
import { solutions } from "@/content/solutions";
import { whatsappLink } from "@/config/site";
import { solutionIcons } from "./ServiceCard";

type Answers = { env: string; goals: GoalValue[]; situation: string };
const steps = ["Ambiente", "Objetivos", "Situação"] as const;

/**
 * Diagnóstico rápido em 3 passos.
 * Recomenda soluções e leva o resumo para o WhatsApp ou para o formulário.
 */
export function SolutionFinder() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({ env: "", goals: [], situation: "" });
  const [hint, setHint] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  // Leva o foco ao título de cada passo (leitores de tela anunciam a mudança)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const canAdvance = step === 0 ? !!a.env : step === 1 ? a.goals.length > 0 : !!a.situation;

  function next() {
    if (!canAdvance) {
      setHint(step === 1 ? "Escolha pelo menos um objetivo para continuar." : "Escolha uma opção para continuar.");
      return;
    }
    setHint("");
    setStep((s) => s + 1);
  }

  function toggleGoal(g: GoalValue) {
    setHint("");
    setA((p) => ({ ...p, goals: p.goals.includes(g) ? p.goals.filter((x) => x !== g) : [...p.goals, g] }));
  }

  function restart() {
    setA({ env: "", goals: [], situation: "" });
    setHint("");
    setStep(0);
  }

  const envLabel = environments.find((e) => e.value === a.env)?.label ?? "";
  const situation = situations.find((s) => s.value === a.situation);
  const recommended = goals
    .filter((g) => a.goals.includes(g.value))
    .map((g) => solutions.find((s) => s.slug === g.solution)!)
    .filter(Boolean);
  const summary = [
    `Ambiente: ${envLabel}`,
    `Objetivos: ${goals.filter((g) => a.goals.includes(g.value)).map((g) => g.label.toLowerCase()).join("; ")}`,
    `Situação: ${situation?.label ?? ""}`,
  ].join("\n");
  const primary = recommended[0]?.slug === "inteligencia-artificial" ? "inteligencia-artificial" : recommended[0]?.slug ?? "outro";
  const formHref = `/contato?solucao=${encodeURIComponent(recommended.length > 1 ? "projeto-personalizado" : primary)}&resumo=${encodeURIComponent(summary)}#contato`;
  const waHref = whatsappLink("geral", `Olá, Arthur! Fiz o diagnóstico rápido no site da Linha Segura.\n\n${summary}`);

  const done = step === steps.length;
  const progress = done ? 100 : (step / steps.length) * 100;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-steel/15 bg-navy/80 shadow-[0_30px_100px_-50px_rgb(0_212_255/.45)]">
      {/* Progresso */}
      <div className="border-b border-steel/12 px-5 pt-5 md:px-8">
        <ol className="flex gap-2 text-xs" aria-label="Progresso do diagnóstico">
          {steps.map((s, i) => {
            const state = done || i < step ? "done" : i === step ? "current" : "todo";
            return (
              <li key={s} className="flex-1" aria-current={state === "current" ? "step" : undefined}>
                <span className={`flex items-center gap-1.5 ${state === "todo" ? "text-steel-dim" : "text-snow"}`}>
                  {state === "done" ? <Check className="h-3.5 w-3.5 text-cyan" aria-hidden="true" /> : <span className="font-mono">{i + 1}</span>}
                  <span>{s}</span>
                  <span className="sr-only">{state === "done" ? "(concluído)" : state === "current" ? "(atual)" : ""}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <div className="mt-4 h-px bg-steel/15" aria-hidden="true">
          <motion.div
            className="h-px bg-gradient-to-r from-electric to-cyan shadow-[0_0_10px_rgb(0_212_255/.8)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <div className="p-5 md:p-8" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && (
              <fieldset>
                <legend className="w-full">
                  <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold outline-none">
                    Qual é o ambiente?
                  </h3>
                </legend>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {environments.map((e) => (
                    <Choice key={e.value} type="radio" name="ambiente" checked={a.env === e.value} onChange={() => { setA((p) => ({ ...p, env: e.value })); setHint(""); }} label={e.label} />
                  ))}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset>
                <legend className="w-full">
                  <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold outline-none">
                    O que você quer resolver?
                  </h3>
                  <p className="mt-1 text-sm text-steel">Marque quantos quiser.</p>
                </legend>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {goals.map((g) => (
                    <Choice key={g.value} type="checkbox" name="objetivos" checked={a.goals.includes(g.value)} onChange={() => toggleGoal(g.value)} label={g.label} hint={g.hint} />
                  ))}
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset>
                <legend className="w-full">
                  <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold outline-none">
                    Qual é a situação hoje?
                  </h3>
                </legend>
                <div className="mt-6 grid gap-2.5">
                  {situations.map((s) => (
                    <Choice key={s.value} type="radio" name="situacao" checked={a.situation === s.value} onChange={() => { setA((p) => ({ ...p, situation: s.value })); setHint(""); }} label={s.label} />
                  ))}
                </div>
              </fieldset>
            )}

            {done && (
              <div>
                <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold outline-none">
                  Sua combinação recomendada
                </h3>
                <p className="mt-1 text-steel">
                  Para {envLabel.toLowerCase()}, com base no que você marcou:
                </p>
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {recommended.map((s) => {
                    const Icon = solutionIcons[s.icon];
                    return (
                      <li key={s.slug}>
                        <Link href={s.href} className="group flex h-full items-start gap-3 rounded-xl border border-steel/15 bg-void/40 p-4 transition-colors hover:border-cyan/50">
                          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan" strokeWidth={1.6} aria-hidden="true" />
                          <span>
                            <span className="block font-medium text-snow">{s.title}</span>
                            <span className="mt-0.5 block text-sm text-steel">{s.short}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {recommended.length > 1 && (
                  <p className="mt-4 text-sm text-steel">Essas soluções podem ser integradas em um único projeto, com a mesma rede e o mesmo acesso pelo celular.</p>
                )}
                {situation && (
                  <div className="mt-6 rounded-xl border border-cyan/25 bg-cyan/[.05] p-4">
                    <p className="text-sm font-medium text-cyan">Próximo passo</p>
                    <p className="mt-1 text-snow">{situation.next}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {hint && (
          <p role="alert" className="mt-4 text-sm text-warn">
            {hint}
          </p>
        )}

        {/* Ações */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-steel/12 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 && !done && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-steel hover:text-snow">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
            </button>
          )}
          {step === 0 && <span className="hidden text-sm text-steel-dim sm:block">Leva menos de 1 minuto.</span>}
          {!done ? (
            <button
              type="button"
              onClick={next}
              aria-disabled={!canAdvance}
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold transition-all sm:ml-auto ${
                canAdvance ? "bg-snow text-void hover:shadow-[0_0_0_4px_rgb(0_212_255/.18)]" : "bg-snow/20 text-snow/60"
              }`}
            >
              {step === steps.length - 1 ? "Ver recomendação" : "Continuar"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-snow px-6 font-semibold text-void hover:shadow-[0_0_0_4px_rgb(0_212_255/.18)]">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Enviar resumo no WhatsApp
              </a>
              <Link href={formHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-steel/30 px-6 font-semibold text-snow hover:border-cyan/70">
                Preencher formulário
              </Link>
              <button type="button" onClick={restart} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-steel hover:text-snow sm:ml-auto">
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Refazer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Choice({ type, name, checked, onChange, label, hint }: { type: "radio" | "checkbox"; name: string; checked: boolean; onChange: () => void; label: string; hint?: string }) {
  return (
    <label
      className={`group relative flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cyan ${
        checked ? "border-cyan/60 bg-cyan/[.07]" : "border-steel/15 bg-void/30 hover:border-steel/40"
      }`}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span
        aria-hidden="true"
        className={`grid h-5 w-5 shrink-0 place-items-center border transition-colors ${type === "radio" ? "rounded-full" : "rounded-md"} ${
          checked ? "border-cyan bg-cyan text-void" : "border-steel/40"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span>
        <span className="block font-medium text-snow">{label}</span>
        {hint && <span className="block text-sm text-steel">{hint}</span>}
      </span>
    </label>
  );
}
