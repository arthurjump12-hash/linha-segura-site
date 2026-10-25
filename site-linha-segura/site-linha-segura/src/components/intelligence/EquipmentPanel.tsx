"use client";

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { categoryLabel, demoCameras } from "@/lib/intelligence/equipment.ts";
import { aggregateByEquipment, eventsInRanges, formatClock, formatDuration, formatPercent, occupancyByHour } from "@/lib/intelligence/analytics.ts";
import { SIM, useSimulation } from "./SimulationProvider";
import { Sparkbars } from "./charts";
import { SimBadge, StatusChip, statusMeta } from "./status";

const kindText = { ocupacao: "Ocupação estimada", passagem: "Passagem", inconclusivo: "Inconclusivo" } as const;

/** Painel lateral (gaveta inferior no celular) com os indicadores do equipamento. */
export function EquipmentPanel() {
  const { selectedId, closeEquipment, equipment, zoneStates, events, ranges, now, period } = useSimulation();
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const eq = equipment.find((e) => e.id === selectedId) ?? null;

  useEffect(() => {
    if (!eq) return;
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEquipment();
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>("button, [href], [tabindex='0']");
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [eq, closeEquipment]);

  const data = useMemo(() => {
    if (!eq) return null;
    // independente do filtro de equipamentos do dashboard
    const st = aggregateByEquipment(events, [eq], ranges)[0];
    const evs = eventsInRanges(events, ranges)
      .filter((e) => e.equipmentId === eq.id)
      .sort((a, b) => b.start - a.start);
    const hours = occupancyByHour(events, ranges, [eq.id], SIM.openHour, SIM.closeHour);
    return { st, evs, hours };
  }, [eq, events, ranges]);

  const state = eq ? zoneStates[eq.id] : null;
  const periodLabel = period === "hoje" ? "hoje" : period === "ontem" ? "ontem" : "nos últimos 7 dias";

  return (
    <AnimatePresence>
      {eq && data && state && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[80] bg-void/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEquipment}
            aria-hidden="true"
          />
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="painel-titulo"
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[90] max-h-[88dvh] overflow-y-auto rounded-t-3xl border border-steel/20 bg-navy pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] shadow-2xl md:inset-y-3 md:left-auto md:right-3 md:max-h-none md:w-[26rem] md:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-steel/12 bg-navy/95 px-6 pb-4 pt-5 backdrop-blur">
              <div>
                <p className="text-xs text-steel">
                  {categoryLabel[eq.category]} · {demoCameras.find((c) => c.id === eq.cameraId)?.name}
                </p>
                <h3 id="painel-titulo" className="mt-1 text-2xl font-semibold">
                  {eq.name}
                </h3>
              </div>
              <button
                type="button"
                data-autofocus
                onClick={closeEquipment}
                aria-label="Fechar painel"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-steel/25 text-snow hover:border-cyan/60"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-6 px-6 pt-5">
              <SimBadge />

              {/* estado atual */}
              <section aria-label="Estado atual" className="rounded-2xl border border-steel/15 bg-void/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <StatusChip status={state.status} />
                  <span className="font-mono text-sm tabular-nums text-steel">{formatClock(now)}</span>
                </div>
                <p className="mt-3 font-display text-4xl font-semibold tabular-nums">
                  {state.status === "ocupado" || state.status === "inconclusivo" || state.status === "presenca" ? formatDuration(state.elapsed) : "—"}
                </p>
                <p className="mt-1 text-sm text-steel">{statusMeta[state.status].description}</p>
                {state.session && state.status !== "encerrado" && (
                  <p className="mt-2 font-mono text-xs text-steel">
                    ID temporário {state.session.trackId} · confiança {state.session.confidence.toFixed(2).replace(".", ",")}
                  </p>
                )}
              </section>

              {/* indicadores */}
              <dl className="grid grid-cols-3 gap-3">
                <Metric label={`Utilizações ${periodLabel}`} value={String(data.st?.eventos ?? 0)} />
                <Metric label="Tempo médio" value={formatDuration(data.st?.duracaoMedia ?? 0)} />
                <Metric label="Taxa de ocupação" value={formatPercent(data.st?.taxa ?? 0)} />
              </dl>
              <p className="-mt-3 text-xs text-steel">
                {data.st?.passagens ?? 0} passagens e {data.st?.inconclusivos ?? 0} detecções inconclusivas não foram contadas como uso.
              </p>

              <section aria-labelledby="painel-grafico">
                <h4 id="painel-grafico" className="mb-3 text-sm font-medium text-snow">
                  Utilização ao longo do dia
                </h4>
                <Sparkbars data={data.hours} label={`Taxa de ocupação por hora do equipamento ${eq.name}`} />
              </section>

              <section aria-labelledby="painel-historico">
                <h4 id="painel-historico" className="mb-2 text-sm font-medium text-snow">
                  Histórico de eventos
                </h4>
                {data.evs.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-steel/25 p-4 text-sm text-steel">
                    Nenhum evento neste período. Inicie a simulação ou escolha outro período no dashboard.
                  </p>
                ) : (
                  <ol className="grid gap-1.5">
                    {data.evs.slice(0, 8).map((e) => (
                      <li key={e.id} className="flex items-center justify-between gap-3 rounded-lg bg-void/40 px-3 py-2 text-sm">
                        <span className="font-mono text-xs tabular-nums text-steel">
                          {formatClock(e.start).slice(0, 5)}–{formatClock(e.end).slice(0, 5)}
                        </span>
                        <span className="flex-1 truncate text-snow">{kindText[e.kind]}</span>
                        <span className="tabular-nums text-steel">{e.inProgress ? "em andamento" : formatDuration(e.duration)}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
              <p className="pb-2 text-xs text-steel-dim">
                Dados sintéticos gerados no navegador. Não representam uma academia real.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-steel/12 bg-void/30 p-3">
      <dt className="text-[0.7rem] leading-tight text-steel">{label}</dt>
      <dd className="mt-1.5 font-display text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
