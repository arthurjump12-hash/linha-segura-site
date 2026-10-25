"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { processSteps } from "@/content/home";

/** Linha do tempo interativa: tabs acessíveis no desktop, lista expandível no celular. */
export function ProcessTimeline() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const id = useId();
  const step = processSteps[active];

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusTab((active + 1) % processSteps.length);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusTab((active - 1 + processSteps.length) % processSteps.length);
    }
  }
  function focusTab(i: number) {
    setActive(i);
    document.getElementById(`${id}-tab-${i}`)?.focus();
  }

  return (
    <div>
      {/* Trilho + etapas */}
      <div role="tablist" aria-label="Etapas do processo" onKeyDown={onKeyDown} className="relative grid grid-cols-1 gap-2 md:grid-cols-6 md:gap-0">
        <div aria-hidden="true" className="absolute left-0 right-0 top-[1.1rem] hidden h-px bg-steel/15 md:block" />
        <motion.div
          aria-hidden="true"
          className="absolute left-0 top-[1.1rem] hidden h-px origin-left bg-gradient-to-r from-electric to-cyan shadow-[0_0_10px_rgb(0_212_255/.7)] md:block"
          animate={{ width: `${((active + 0.5) / processSteps.length) * 100}%` }}
          transition={{ duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
        {processSteps.map((s, i) => {
          const selected = i === active;
          const done = i < active;
          return (
            <button
              key={s.title}
              id={`${id}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`group relative flex items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors md:flex-col md:items-start md:gap-4 md:rounded-none md:px-0 md:pr-4 ${
                selected ? "bg-panel md:bg-transparent" : "hover:bg-panel/50 md:hover:bg-transparent"
              }`}
            >
              <span
                className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border font-mono text-xs transition-all duration-500 ${
                  selected
                    ? "border-cyan bg-cyan text-void shadow-[0_0_0_6px_rgb(0_212_255/.15)]"
                    : done
                      ? "border-cyan/60 bg-void text-cyan"
                      : "border-steel/30 bg-void text-steel group-hover:border-steel/60"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`font-display text-[1.05rem] font-medium leading-tight transition-colors ${selected ? "text-snow" : "text-steel group-hover:text-snow"}`}>
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Painel da etapa */}
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${active}`}
        className="relative mt-10 overflow-hidden rounded-[var(--radius-card)] border border-steel/12 bg-panel/60 p-7 md:p-10"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
          >
            <div>
              <p className="font-mono text-xs text-cyan">
                Etapa {active + 1} de {processSteps.length}
              </p>
              <h3 className="mt-3 text-2xl font-semibold md:text-3xl">{step.title}</h3>
              <p className="mt-3 max-w-2xl text-lg text-steel">{step.text}</p>
            </div>
            <div className="rounded-xl border border-steel/15 bg-void/50 px-5 py-4">
              <p className="text-xs text-steel">Resultado da etapa</p>
              <p className="mt-1 font-display text-lg font-medium">{step.output}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
