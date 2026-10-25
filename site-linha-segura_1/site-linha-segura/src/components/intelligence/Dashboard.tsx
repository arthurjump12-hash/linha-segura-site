"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Download, Minus } from "lucide-react";
import { byCategory, eventsToCSV, formatClock, formatDuration, formatPercent, heatmap, occupancyByHour, rankEquipment, summarize } from "@/lib/intelligence/analytics.ts";
import { categoryLabel } from "@/lib/intelligence/equipment.ts";
import type { OccupancyEvent } from "@/lib/intelligence/types.ts";
import { DataTable, Donut, HBars, HeatGrid, HourChart, TableToggle } from "./charts";
import { EquipmentFilter, PeriodFilters, periodText } from "./Filters";
import { SIM, useSimulation } from "./SimulationProvider";
import { SimBadge } from "./status";

type Tab = "geral" | "horarios" | "equipamentos" | "eventos";
const tabs: { id: Tab; label: string }[] = [
  { id: "geral", label: "Visão geral" },
  { id: "horarios", label: "Horários" },
  { id: "equipamentos", label: "Equipamentos" },
  { id: "eventos", label: "Eventos" },
];

/** Dashboard "Linha Segura Intelligence" (dados simulados). */
export function Dashboard() {
  const sim = useSimulation();
  const { equipment, stats, prevStats, filteredEvents, ranges, prevRanges, events, filterIds, zoneStates, now, period, openEquipment } = sim;
  const [tab, setTab] = useState<Tab>("geral");
  const [chartMode, setChartMode] = useState<"area" | "linha" | "barras">("area");
  const [compare, setCompare] = useState(true);
  const [tables, setTables] = useState<Record<string, boolean>>({});
  const toggleTable = (k: string) => setTables((t) => ({ ...t, [k]: !t[k] }));

  const visible = useMemo(() => (filterIds.length ? equipment.filter((e) => filterIds.includes(e.id)) : equipment), [equipment, filterIds]);
  const names = useMemo(() => Object.fromEntries(equipment.map((e) => [e.id, e.name])), [equipment]);
  const sum = summarize(stats);
  const prev = summarize(prevStats);
  const ids = visible.map((e) => e.id);
  const hours = useMemo(() => occupancyByHour(events, ranges, ids, SIM.openHour, SIM.closeHour), [events, ranges, ids.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  const prevHours = useMemo(() => occupancyByHour(events, prevRanges, ids, SIM.openHour, SIM.closeHour), [events, prevRanges, ids.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  const heat = useMemo(() => heatmap(events, ranges, visible, SIM.openHour, SIM.closeHour), [events, ranges, visible]);
  const cats = byCategory(stats, equipment);
  const ranking = rankEquipment(stats, "tempoTotal", names);
  const ocupadosAgora = visible.filter((e) => zoneStates[e.id].status === "ocupado").length;
  const peak = hours.reduce<{ hour: number; rate: number } | null>((best, h) => (h.rate !== null && (!best || h.rate > best.rate) ? { hour: h.hour, rate: h.rate } : best), null);
  const sorted = useMemo(() => [...filteredEvents].sort((a, b) => b.start - a.start), [filteredEvents]);
  const prevName = period === "hoje" ? "ontem, mesmo horário" : period === "ontem" ? "anteontem" : "7 dias anteriores";
  const empty = filteredEvents.length === 0;

  function exportCSV() {
    const csv = eventsToCSV([...filteredEvents].sort((a, b) => a.start - b.start), equipment, now);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linha-segura-simulacao-${period}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const show = (t: Tab) => (tab === t ? "" : "hidden lg:block");

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-steel/15 bg-[#0A1528] shadow-[0_50px_160px_-70px_rgb(37_99_235/.7)]">
      {/* Barra superior do produto */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel/12 bg-navy/70 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-electric to-cyan font-display text-sm font-bold text-void" aria-hidden="true">
            LS
          </span>
          <div className="leading-tight">
            <p className="font-display text-base font-semibold">Linha Segura Intelligence</p>
            <p className="text-xs text-steel">Academia de demonstração · {visible.length} equipamentos · 3 câmeras</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 font-mono text-xs text-steel">
            <span className={`h-2 w-2 rounded-full ${sim.playing ? "bg-ok animate-blink" : "bg-steel-dim"}`} aria-hidden="true" />
            {formatClock(now)}
          </span>
          <SimBadge>Simulação</SimBadge>
        </div>
      </div>

      {/* Filtros em uma linha */}
      <div className="flex flex-wrap items-center gap-3 border-b border-steel/12 px-4 py-3 md:px-6">
        <PeriodFilters idPrefix="dash" />
        <EquipmentFilter />
        <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-steel">
          <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="h-4 w-4 accent-cyan" />
          Comparar com {prevName}
        </label>
        <button
          type="button"
          onClick={exportCSV}
          disabled={empty}
          className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-full bg-snow px-4 text-sm font-semibold text-void transition-shadow hover:shadow-[0_0_0_4px_rgb(0_212_255/.18)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Exportar CSV ({filteredEvents.length})
        </button>
      </div>

      {/* Abas no celular */}
      <div role="tablist" aria-label="Seções do dashboard" className="flex gap-1 overflow-x-auto border-b border-steel/12 px-3 py-2 lg:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-medium ${tab === t.id ? "bg-snow text-void" : "text-steel"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 p-4 md:p-6">
        <p className="text-sm text-steel">
          Mostrando <strong className="font-medium text-snow">{periodText(period)}</strong>
          {filterIds.length ? `, ${visible.length} equipamentos selecionados` : ""}. Os números mudam conforme a simulação avança.
        </p>

        {empty && (
          <div className="rounded-2xl border border-dashed border-steel/25 p-6 text-center">
            <p className="font-medium text-snow">Sem eventos para estes filtros ainda.</p>
            <p className="mt-1 text-sm text-steel">A faixa escolhida pode não ter começado no relógio simulado. Inicie a simulação ou escolha outro período.</p>
          </div>
        )}

        {/* KPIs */}
        <dl className={`grid grid-cols-2 gap-3 md:grid-cols-4 ${show("geral")}`}>
          <Kpi label="Equipamentos monitorados" value={String(visible.length)} note="3 câmeras" />
          <Kpi label="Com ocupação estimada agora" value={`${ocupadosAgora}`} note={`de ${visible.length}`} live />
          <Kpi label="Eventos de ocupação" value={String(sum.eventos)} delta={compare ? delta(sum.eventos, prev.eventos) : undefined} />
          <Kpi label="Tempo médio por evento" value={formatDuration(sum.tempoMedio)} delta={compare ? delta(sum.tempoMedio, prev.tempoMedio) : undefined} />
          <Kpi label="Tempo acumulado de ocupação" value={formatDuration(sum.tempoTotal)} delta={compare ? delta(sum.tempoTotal, prev.tempoTotal) : undefined} />
          <Kpi label="Eventos de passagem" value={String(sum.passagens)} note="não contam como uso" delta={compare ? delta(sum.passagens, prev.passagens) : undefined} />
          <Kpi label="Mais utilizado (tempo)" value={sum.maisUtilizado ? names[sum.maisUtilizado.equipmentId] : "—"} note={sum.maisUtilizado ? formatDuration(sum.maisUtilizado.tempoTotal) : undefined} small />
          <Kpi label="Menos utilizado (tempo)" value={sum.menosUtilizado ? names[sum.menosUtilizado.equipmentId] : "—"} note={sum.menosUtilizado ? formatDuration(sum.menosUtilizado.tempoTotal) : undefined} small />
        </dl>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Ocupação por horário */}
          <Card
            className={show("horarios")}
            title="Ocupação por horário"
            subtitle={peak ? `Pico às ${peak.hour}h, com ${formatPercent(peak.rate)} do tempo dos equipamentos ocupado` : "Aguardando dados"}
            actions={
              <>
                <div role="radiogroup" aria-label="Tipo de gráfico" className="flex rounded-full border border-steel/20 p-0.5">
                  {(["area", "linha", "barras"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={chartMode === m}
                      onClick={() => setChartMode(m)}
                      className={`min-h-8 rounded-full px-3 text-xs capitalize ${chartMode === m ? "bg-snow text-void" : "text-steel hover:text-snow"}`}
                    >
                      {m === "area" ? "Área" : m === "linha" ? "Linha" : "Barras"}
                    </button>
                  ))}
                </div>
                <TableToggle shown={!!tables.hour} onToggle={() => toggleTable("hour")} />
              </>
            }
          >
            {tables.hour ? (
              <DataTable
                caption="Ocupação por horário"
                head={["Hora", "Período selecionado", compare ? prevName : ""].filter(Boolean)}
                rows={hours.map((h, i) =>
                  [`${h.hour}h`, h.rate === null ? "—" : formatPercent(h.rate, 1), compare ? (prevHours[i].rate === null ? "—" : formatPercent(prevHours[i].rate!, 1)) : null].filter(
                    (c): c is string => c !== null,
                  ),
                )}
              />
            ) : (
              <HourChart data={hours} compare={compare ? prevHours : undefined} compareLabel={prevName} mode={chartMode} label="Taxa de ocupação estimada por hora, período selecionado" />
            )}
          </Card>

          {/* Categoria */}
          <Card className={show("geral")} title="Distribuição por categoria" subtitle="Participação no tempo de ocupação" actions={<TableToggle shown={!!tables.cat} onToggle={() => toggleTable("cat")} />}>
            {tables.cat ? (
              <DataTable caption="Tempo por categoria" head={["Categoria", "Participação", "Tempo"]} rows={cats.map((c) => [categoryLabel[c.category], formatPercent(c.share), formatDuration(c.seconds)])} />
            ) : (
              <Donut
                slices={cats.map((c) => ({ label: categoryLabel[c.category], value: c.seconds, share: c.share, display: formatDuration(c.seconds) }))}
                centerLabel="tempo total"
                centerValue={formatDuration(sum.tempoTotal).replace(/ \d+ s$/, "")}
              />
            )}
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          {/* Ranking */}
          <Card className={show("equipamentos")} title="Ranking por tempo de ocupação" subtitle="Toque para abrir os detalhes" actions={<TableToggle shown={!!tables.rank} onToggle={() => toggleTable("rank")} />}>
            {tables.rank ? (
              <DataTable
                caption="Ranking de equipamentos"
                head={["Equipamento", "Tempo", "Eventos", "Taxa"]}
                rows={ranking.map((s) => [names[s.equipmentId], formatDuration(s.tempoTotal), s.eventos, formatPercent(s.taxa)])}
              />
            ) : (
              <HBars
                rows={ranking.map((s) => ({ id: s.equipmentId, label: names[s.equipmentId], value: s.tempoTotal, display: formatDuration(s.tempoTotal), sub: `${s.eventos} ev.` }))}
                onSelect={(id, el) => openEquipment(id, el)}
              />
            )}
          </Card>

          {/* Heatmap */}
          <Card className={show("horarios")} title="Mapa de calor por hora" subtitle="Taxa de ocupação de cada equipamento em cada hora">
            <HeatGrid
              rows={heat.map((r) => ({ id: r.equipmentId, label: names[r.equipmentId], cells: r.hours.map((h) => h.rate) }))}
              hours={hours.map((h) => h.hour)}
              onSelect={(id, el) => openEquipment(id, el)}
            />
          </Card>
        </div>

        {/* Linha do tempo de eventos */}
        <Card className={show("eventos")} title="Linha do tempo de eventos" subtitle="Última hora simulada em todos os equipamentos">
          <EventTimeline events={events} now={now} equipment={visible} names={names} />
          <h4 className="mb-2 mt-6 text-sm font-medium text-snow">Eventos mais recentes</h4>
          {sorted.length === 0 ? (
            <p className="text-sm text-steel">Nenhum evento neste período.</p>
          ) : (
            <DataTable
              caption="Eventos mais recentes"
              head={["Equipamento", "Início", "Fim", "Duração", "Classificação", "Confiança"]}
              rows={sorted.slice(0, 8).map((e) => [
                names[e.equipmentId],
                formatClock(e.start),
                e.inProgress ? "em andamento" : formatClock(e.end),
                formatDuration(e.duration),
                e.kind === "ocupacao" ? "Ocupação estimada" : e.kind === "passagem" ? "Passagem" : "Inconclusivo",
                e.confidence.toFixed(2).replace(".", ","),
              ])}
            />
          )}
        </Card>
        <p className="text-xs text-steel-dim">
          Todos os valores deste painel são sintéticos, gerados por um mecanismo de simulação. A exportação inclui somente os eventos exibidos com os filtros atuais.
        </p>
      </div>
    </div>
  );
}

function delta(cur: number, prev: number) {
  if (!prev) return cur ? { dir: "up" as const, text: "novo" } : { dir: "flat" as const, text: "sem variação" };
  const d = (cur - prev) / prev;
  if (Math.abs(d) < 0.01) return { dir: "flat" as const, text: "estável" };
  return { dir: d > 0 ? ("up" as const) : ("down" as const), text: `${d > 0 ? "+" : ""}${Math.round(d * 100)}%` };
}

function Kpi({ label, value, note, delta: d, live, small }: { label: string; value: string; note?: string; delta?: { dir: "up" | "down" | "flat"; text: string }; live?: boolean; small?: boolean }) {
  const Icon = d?.dir === "up" ? ArrowUpRight : d?.dir === "down" ? ArrowDownRight : Minus;
  return (
    <div className="rounded-2xl border border-steel/12 bg-navy/60 p-4">
      <dt className="flex items-center gap-2 text-xs text-steel">
        {live && <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_#00D4FF]" aria-hidden="true" />}
        {label}
      </dt>
      <dd className="mt-2">
        <span className={`block font-display font-semibold tabular-nums text-snow ${small ? "truncate text-lg" : "text-xl leading-tight sm:text-2xl"}`}>{value}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-steel">
          {note && <span>{note}</span>}
          {d && (
            <span className="inline-flex items-center gap-0.5">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {d.text}
              <span className="sr-only"> em relação ao período anterior</span>
            </span>
          )}
        </span>
      </dd>
    </div>
  );
}

function Card({ title, subtitle, actions, children, className = "" }: { title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-steel/12 bg-navy/60 p-4 md:p-5 ${className}`} aria-label={title}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-steel">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

/** Raias por equipamento com os eventos da última hora simulada. */
function EventTimeline({ events, now, equipment, names }: { events: OccupancyEvent[]; now: number; equipment: { id: string }[]; names: Record<string, string> }) {
  const from = now - 3600;
  const recent = events.filter((e) => e.end >= from);
  const W = 640;
  const lane = 22;
  const left = 120;
  const H = equipment.length * lane + 24;
  const x = (t: number) => left + ((Math.max(t, from) - from) / 3600) * (W - left - 8);
  const colors = { ocupacao: "#00D4FF", passagem: "#FBBF24", inconclusivo: "#E879A6" } as const;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[34rem]" role="img" aria-label={`Linha do tempo com ${recent.length} eventos na última hora simulada`}>
        <defs>
          <pattern id="tl-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" stroke="#E879A6" strokeWidth="2" />
          </pattern>
        </defs>
        {[0, 15, 30, 45, 60].map((m) => (
          <g key={m}>
            <line x1={x(from + m * 60)} x2={x(from + m * 60)} y1={0} y2={H - 18} stroke="rgb(148 163 184 / .12)" />
            <text x={x(from + m * 60)} y={H - 4} fontSize="10" textAnchor="middle" fill="#94A3B8">
              {formatClock(from + m * 60).slice(0, 5)}
            </text>
          </g>
        ))}
        {equipment.map((e, i) => (
          <g key={e.id}>
            <text x={0} y={i * lane + 15} fontSize="11" fill="#94A3B8">
              {names[e.id]}
            </text>
            <line x1={left} x2={W - 8} y1={i * lane + 11} y2={i * lane + 11} stroke="rgb(148 163 184 / .08)" />
            {recent
              .filter((ev) => ev.equipmentId === e.id)
              .map((ev) => (
                <rect
                  key={ev.id}
                  x={x(ev.start)}
                  y={i * lane + 4}
                  width={Math.max(3, x(ev.end) - x(ev.start))}
                  height={14}
                  rx="3"
                  fill={ev.kind === "inconclusivo" ? "url(#tl-hatch)" : colors[ev.kind]}
                  fillOpacity={ev.kind === "ocupacao" ? 0.85 : 1}
                >
                  <title>{`${names[e.id]}: ${ev.kind === "ocupacao" ? "ocupação" : ev.kind} de ${formatClock(ev.start)} a ${formatClock(ev.end)}`}</title>
                </rect>
              ))}
          </g>
        ))}
      </svg>
      <ul className="mt-2 flex flex-wrap gap-4 text-xs text-steel">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm" style={{ background: colors.ocupacao }} aria-hidden="true" />
          Ocupação estimada
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-1.5 rounded-sm" style={{ background: colors.passagem }} aria-hidden="true" />
          Passagem
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm border" style={{ borderColor: colors.inconclusivo, background: "repeating-linear-gradient(45deg,#E879A6 0 2px,transparent 2px 5px)" }} aria-hidden="true" />
          Inconclusivo
        </li>
      </ul>
    </div>
  );
}
