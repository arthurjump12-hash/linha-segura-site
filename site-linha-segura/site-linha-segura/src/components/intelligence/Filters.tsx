"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { BandKey, PeriodKey } from "@/lib/intelligence/types.ts";
import { useSimulation } from "./SimulationProvider";

export const periodOptions: { value: PeriodKey; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "ontem", label: "Ontem" },
  { value: "7dias", label: "7 dias" },
];

export const bandOptions: { value: BandKey; label: string }[] = [
  { value: "todo", label: "Dia todo" },
  { value: "manha", label: "Manhã (6h–12h)" },
  { value: "tarde", label: "Tarde (12h–18h)" },
  { value: "noite", label: "Noite (18h–22h)" },
];

export function periodText(period: PeriodKey) {
  return period === "hoje" ? "hoje, até agora" : period === "ontem" ? "ontem" : "últimos 7 dias";
}

/** Filtros de período e faixa horária, compartilhados por dashboard, ranking e mapa de calor. */
export function PeriodFilters({ idPrefix }: { idPrefix: string }) {
  const { period, setPeriod, band, setBand } = useSimulation();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <fieldset className="flex rounded-full border border-steel/20 p-0.5">
        <legend className="sr-only">Período</legend>
        {periodOptions.map((p) => (
          <label key={p.value}>
            <input type="radio" name={`${idPrefix}-periodo`} className="peer sr-only" checked={period === p.value} onChange={() => setPeriod(p.value)} />
            <span className="flex min-h-9 cursor-pointer items-center rounded-full px-3.5 text-sm text-steel transition-colors hover:text-snow peer-checked:bg-snow peer-checked:text-void peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-cyan">
              {p.label}
            </span>
          </label>
        ))}
      </fieldset>
      <label className="sr-only" htmlFor={`${idPrefix}-faixa`}>
        Faixa horária
      </label>
      <select
        id={`${idPrefix}-faixa`}
        value={band}
        onChange={(e) => setBand(e.target.value as BandKey)}
        className="min-h-10 rounded-full border border-steel/20 bg-void px-4 text-sm text-snow"
      >
        {bandOptions.map((b) => (
          <option key={b.value} value={b.value}>
            {b.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Seleção de equipamentos (popover com caixas de seleção). */
export function EquipmentFilter() {
  const { equipment, filterIds, setFilterIds } = useSimulation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const all = filterIds.length === 0;
  const label = all ? `Todos os equipamentos (${equipment.length})` : `${filterIds.length} equipamento${filterIds.length > 1 ? "s" : ""}`;
  const toggle = (id: string) => {
    const base = all ? equipment.map((e) => e.id) : filterIds;
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    setFilterIds(next.length === equipment.length || next.length === 0 ? [] : next);
  };

  return (
    <div ref={ref} className="relative">
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls="filtro-equipamentos"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-steel/20 px-4 text-sm text-snow hover:border-steel/50"
      >
        {label}
        <ChevronDown className={`h-4 w-4 text-steel transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div id="filtro-equipamentos" className="absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl border border-steel/20 bg-navy p-2 shadow-2xl">
          <fieldset>
            <legend className="sr-only">Equipamentos exibidos</legend>
            <ul className="max-h-72 overflow-y-auto">
              {equipment.map((e) => {
                const checked = all || filterIds.includes(e.id);
                return (
                  <li key={e.id}>
                    <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm text-snow hover:bg-steel/[.08] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cyan">
                      <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => toggle(e.id)} />
                      <span className={`grid h-4.5 w-4.5 place-items-center rounded border ${checked ? "border-cyan bg-cyan text-void" : "border-steel/40"}`} aria-hidden="true">
                        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      {e.name}
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
          <div className="mt-1 flex justify-between border-t border-steel/15 px-2 pt-2">
            <button type="button" className="min-h-9 px-2 text-xs text-cyan hover:underline" onClick={() => setFilterIds([])}>
              Selecionar todos
            </button>
            <button type="button" className="min-h-9 px-2 text-xs text-steel hover:text-snow" onClick={() => setOpen(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
